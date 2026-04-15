/**
 * Login Server - Port 8000 (Entry Point)
 * 
 * 100% derived from client code analysis.
 * 
 * CLIENT CONNECTION FLOW (from main.min.js):
 * 
 * 1. Connect to login server URL from serversetting.json
 *    Line 77423-77431: connectToLogin(e)
 *    → loads "resource/properties/serversetting.json" → connects to loginserver URL
 * 
 * 2. NO TEA verification on login server
 *    Line 76751: t.loginClient = new TSSocketClient("login-server", false)
 *    verifyEnable = false → no "verify" event handshake
 *    Line 51977-51982: verifyEnable ? (socketOnVerify) : t()  → calls callback directly
 * 
 * 3. Client sends ALL requests via "handler.process" event
 *    Line 51969-51970: socket.emit("handler.process", payload, callback)
 * 
 * SDK LOGIN PATH:
 *    sdk.js → window.getSdkLoginInfo() → sdk-server auth
 *    → sdkLoginSuccess(o) sets ts.loginInfo.userInfo directly
 *    → clientRequestServerList → [GetServerList] here
 *    → getNotice → [LoginAnnounce] here
 *    → startBtnTap → [SaveHistory] here (refreshes loginToken)
 *    → clientStartGame → main-server enterGame
 * 
 * ACTIONS (7 total, 6 handled here):
 *    loginGame          → handlers/loginGame.js
 *    GetServerList      → handlers/getServerList.js
 *    SaveHistory        → handlers/saveHistory.js
 *    LoginAnnounce      → handlers/loginAnnounce.js
 *    SaveLanguage       → handlers/saveLanguage.js
 *    SaveUserEnterInfo  → handlers/saveUserEnterInfo.js
 *    enterGame          → N/A (type:"user", lowercase, goes to main-server)
 * 
 * RESPONSE FORMAT (line 76968-76980 processHandlerWithLogin):
 *    { ret: 0, data: "JSON_STRING", compress: boolean, serverTime, server0Time }
 * 
 * ERROR HANDLING:
 *    ret !== 0 → Logger.showInfoLog("登录出错", e.ret) + optional callback
 */

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const { config } = require('../shared/config');
const { success, error, ErrorCode } = require('../shared/responseHelper');
const { initPool, initSchema } = require('../database/connection');
const { info, warn, error: logError } = require('../shared/utils/logger');

// ============================================
// Handlers
// ============================================
const { loginGame } = require('./handlers/loginGame');
const { getServerListHandler } = require('./handlers/getServerList');
const { saveHistory } = require('./handlers/saveHistory');
const { loginAnnounce } = require('./handlers/loginAnnounce');
const { saveLanguage } = require('./handlers/saveLanguage');
const { saveUserEnterInfo } = require('./handlers/saveUserEnterInfo');

// ============================================
// Express + Socket.IO setup
// ============================================
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: { origin: '*' },
    transports: ['websocket', 'polling'],
});

// Online users tracking (userId → socketId)
const onlineUsers = new Map();

/**
 * Route handler.process to appropriate action handler
 * 
 * Client emits: socket.emit("handler.process", payload, callback)
 * Line 51969-51970:
 *   e.prototype.sendToServer = function(e, t) {
 *       this.socket && this.socket.emit("handler.process", e, t)
 *   }
 */
async function handleProcess(socket, payload, callback) {
    const { type, action, userId, accountToken } = payload;

    // Better logging: use accountToken when userId is not present
    const displayId = userId || accountToken || '-';
    info('LoginServer', `Request: type=${type}, action=${action}, userId=${displayId}`);

    // Get client IP for rate limiting
    const clientIp = socket.handshake.address || socket.conn.remoteAddress;

    try {
        switch (action) {
            // ============================================
            // Login + auto-register (SDK-compatible response)
            // ============================================
            case 'loginGame':
                await loginGame(socket, payload, callback, clientIp);
                break;

            // ============================================
            // Server list for server selection screen
            // ============================================
            case 'GetServerList':
                getServerListHandler(payload, callback);
                break;

            // ============================================
            // Save login history + refresh loginToken
            // Critical: token refresh MUST be saved to DB
            // ============================================
            case 'SaveHistory':
                await saveHistory(payload, callback);
                break;

            // ============================================
            // Announcement / notices
            // ============================================
            case 'LoginAnnounce':
                loginAnnounce(callback);
                break;

            // ============================================
            // Save language preference
            // ============================================
            case 'SaveLanguage':
                await saveLanguage(payload, callback);
                break;

            // ============================================
            // Analytics: report user entered game
            // Client destroys login socket after this
            // ============================================
            case 'SaveUserEnterInfo':
                saveUserEnterInfo(payload, callback);
                break;

            // ============================================
            // Unknown action — return success (don't crash client)
            // ============================================
            default:
                info('LoginServer', `Action '${action}' not implemented, returning success`);
                if (callback) callback(success({}));
                break;
        }
    } catch (err) {
        logError('LoginServer', `Handler error for ${action}:`, err.message);
        if (callback) callback(error(ErrorCode.UNKNOWN));
    }
}

/**
 * Handle client disconnect
 * Remove user from online tracking
 */
function handleDisconnect(socket) {
    for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
            onlineUsers.delete(userId);
            info('LoginServer', `User disconnected: ${userId}`);
            break;
        }
    }
}

// ============================================
// Socket.IO Connection Handler
// ============================================
io.on('connection', (socket) => {
    info('LoginServer', `Client connected: ${socket.id}`);

    // All client requests come via "handler.process"
    socket.on('handler.process', (payload, callback) => {
        handleProcess(socket, payload, callback);
    });

    socket.on('disconnect', () => {
        handleDisconnect(socket);
    });
});

// ============================================
// Start Server
// ============================================
async function start() {
    try {
        await initPool();
        await initSchema();

        server.listen(config.ports.login, () => {
            info('LoginServer', `Login server running on port ${config.ports.login}`);
            info('LoginServer', `NO TEA encryption (verifyEnable=false)`);
            info('LoginServer', `SDK path active — response uses sdk/security fields`);
            console.log('');
            console.log('  ╔══════════════════════════════════════════════════╗');
            console.log('  ║    Super Warrior Z - Login Server (SDK Path)    ║');
            console.log('  ╠══════════════════════════════════════════════════╣');
            console.log('  ║  Port: 8000 (NO TEA)                           ║');
            console.log('  ║  Path: SDK (sdkLoginSuccess compatible)         ║');
            console.log('  ║                                                ║');
            console.log('  ║  Actions:                                       ║');
            console.log('  ║    loginGame          → Auto-register + token   ║');
            console.log('  ║    GetServerList      → Server selection        ║');
            console.log('  ║    SaveHistory        → Token refresh           ║');
            console.log('  ║    LoginAnnounce      → Notices                ║');
            console.log('  ║    SaveLanguage       → Language preference     ║');
            console.log('  ║    SaveUserEnterInfo  → Analytics               ║');
            console.log('  ║                                                ║');
            console.log('  ║  Response fields (SDK):                         ║');
            console.log('  ║    loginToken, userId, nickName, sdk, security  ║');
            console.log('  ╚══════════════════════════════════════════════════╝');
            console.log('');
        });
    } catch (err) {
        logError('LoginServer', 'Failed to start:', err.message);
        process.exit(1);
    }
}

// ============================================
// Graceful Shutdown
// ============================================
function gracefulShutdown(signal) {
    info('LoginServer', `${signal} received — shutting down gracefully...`);
    io.close();
    server.close(() => {
        info('LoginServer', 'HTTP server closed');
        process.exit(0);
    });
    // Force exit after 5s if connections don't close
    setTimeout(() => {
        warn('LoginServer', 'Forced shutdown after timeout');
        process.exit(1);
    }, 5000);
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

start();
