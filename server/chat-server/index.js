/**
 * =====================================================
 *  Chat Server — Super Warrior Z Game Server
 *  Port 8002
 * =====================================================
 *
 *  Slim entry point. All logic delegated to modules:
 *    - middleware/chatAuth.js    → TEA verification
 *    - handlers/login.js        → chat login
 *    - handlers/joinRoom.js      → join room
 *    - handlers/leaveRoom.js     → leave room
 *    - handlers/sendMsg.js       → send message + broadcast
 *    - handlers/getRecord.js     → message history
 *    - services/roomManager.js   → room lifecycle
 *    - services/messageStore.js  → message history storage
 *    - services/userManager.js   → connected users + ban
 *    - utils/chatConstants.js    → enums, limits, config
 *    - utils/messageBuilder.js   → message factory
 *    - utils/rateLimiter.js      → anti-spam
 *
 *  PROTOCOL:
 *    All requests via: socket.emit("handler.process", {type:"chat", action, ...}, callback)
 *    All pushes via:   socket.emit("Notify", {ret:"SUCCESS", data:{_msg:{...}}})
 *
 *  ACTIONS:
 *    login     → authenticate user
 *    joinRoom  → join room, return recent messages (_record)
 *    leaveRoom → leave room
 *    sendMsg   → send message, broadcast Notify to room
 *    getRecord → fetch message history (_record)
 *
 *  Usage:
 *    node chat-server/index.js
 * =====================================================
 */

'use strict';

var http = require('http');

// =============================================
// 1. CONFIGURATION
// =============================================

var config = require('../shared/config');
config.validateConfig();

var SERVER_PORT = config.config.servers.chat.port;
var SERVER_HOST = config.config.servers.chat.host;
var TEA_KEY = config.config.security.teaKey || 'verification';

// =============================================
// 2. SHARED MODULES
// =============================================

var RH = require('../shared/responseHelper');
var DB = require('../database/connection');
var logger = require('../shared/utils/logger');

// =============================================
// 3. CHAT-SERVER MODULES
// =============================================

var chatAuth = require('./middleware/chatAuth');
var chatConstants = require('./utils/chatConstants');

var createRoomManager = require('./services/roomManager').createRoomManager;
var createMessageStore = require('./services/messageStore').createMessageStore;
var createUserManager = require('./services/userManager').createUserManager;
var createRateLimiter = require('./utils/rateLimiter').createRateLimiter;

// Handler modules
var handleLogin = require('./handlers/login').handle;
var handleJoinRoom = require('./handlers/joinRoom').handle;
var handleLeaveRoom = require('./handlers/leaveRoom').handle;
var handleSendMsg = require('./handlers/sendMsg').handle;
var handleGetRecord = require('./handlers/getRecord').handle;

// =============================================
// 4. INITIALIZE SERVICES
// =============================================

var roomManager = createRoomManager();
var messageStore = createMessageStore();
var userManager = createUserManager();
var rateLimiter = createRateLimiter();

// Dependencies object passed to handlers
var deps = {
    roomManager: roomManager,
    messageStore: messageStore,
    userManager: userManager,
    rateLimiter: rateLimiter,
    io: null,  // set after Socket.IO init
};

// =============================================
// 5. CONNECTION TRACKING
// =============================================

var totalConnections = 0;
var activeConnections = 0;

// =============================================
// 6. CREATE HTTP SERVER
// =============================================

var server = http.createServer(function(req, res) {
    if (req.method === 'GET' && req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: 'online',
            server: 'chat',
            port: SERVER_PORT,
            uptime: process.uptime(),
            connectedUsers: userManager.getStats().connectedUsers,
            activeRooms: roomManager.getActiveRoomCount(),
            messagesStored: messageStore.getStats().totalMessages,
            rateLimitedUsers: rateLimiter.trackedCount(),
            totalConnections: totalConnections,
            activeConnections: activeConnections,
            timestamp: new Date().toISOString(),
        }));
        return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
});

// =============================================
// 7. SOCKET.IO SETUP
// =============================================

var io = require('socket.io')(server, {
    serveClient: false,
    pingInterval: 10000,
    pingTimeout: 5000,
    cookie: false,
    transports: ['websocket', 'polling'],
});

// Inject io into deps (needed by sendMsg broadcast)
deps.io = io;

// =============================================
// 8. CONNECTION HANDLING
// =============================================

io.on('connection', function(socket) {
    totalConnections++;
    activeConnections++;

    var clientIp = socket.handshake.address ||
        socket.handshake.headers['x-forwarded-for'] ||
        'unknown';

    logger.info('CHAT', 'Client connected: ' + socket.id + ' (IP: ' + clientIp + ')');

    // Initialize socket state
    socket._userId = null;
    socket._userInfo = null;

    // ---- TEA Verification ----
    var authHandle = chatAuth.setupVerification(socket, TEA_KEY);

    // ---- Main Request Handler ----
    socket.on('handler.process', function(request, callback) {
        // Verify check
        if (!chatAuth.requireVerified(socket, callback)) return;

        // Validate request
        if (!request) {
            RH.sendResponse(socket, 'handler.process', RH.error(2, 'Empty request'), callback);
            return;
        }

        var parsed = RH.parseRequest(request);
        if (!parsed) {
            RH.sendResponse(socket, 'handler.process', RH.error(2, 'Invalid request format'), callback);
            return;
        }

        var type = (parsed.type || '').toLowerCase();
        var action = parsed.action;

        logger.info('CHAT', 'Request: type=' + type + ' action=' + action + ' userId=' + (parsed.userId || '-'));

        // Only accept "chat" type
        if (type !== 'chat') {
            logger.warn('CHAT', 'Unknown type: ' + type + ' (only "chat" accepted)');
            RH.sendResponse(socket, 'handler.process', RH.error(5, 'Unknown type: ' + type), callback);
            return;
        }

        // Route by action
        try {
            switch (action) {
                case 'login':
                    handleLogin(deps, socket, parsed, callback);
                    break;

                case 'joinRoom':
                    handleJoinRoom(deps, socket, parsed, callback);
                    break;

                case 'leaveRoom':
                    handleLeaveRoom(deps, socket, parsed, callback);
                    break;

                case 'sendMsg':
                    handleSendMsg(deps, socket, parsed, callback);
                    break;

                case 'getRecord':
                    handleGetRecord(deps, socket, parsed, callback);
                    break;

                default:
                    logger.warn('CHAT', 'Unknown action: ' + action);
                    RH.sendResponse(socket, 'handler.process', RH.error(5, 'Unknown action: ' + action), callback);
                    break;
            }
        } catch (err) {
            logger.error('CHAT', 'Handler error for ' + action + ': ' + err.message);
            logger.error('CHAT', 'Stack: ' + err.stack);
            RH.sendResponse(socket, 'handler.process', RH.error(1, 'Internal server error'), callback);
        }
    });

    // ---- Disconnect Handler ----
    socket.on('disconnect', function(reason) {
        activeConnections--;
        authHandle.destroy();

        // Leave all rooms
        var roomsLeft = roomManager.leaveAll(socket.id);

        // Clean up user tracking
        var result = userManager.logout(socket.id);
        if (result.userId) {
            // NOTE: Do NOT send system message on disconnect.
            // Client crashes if system message _type not in noticeContent.json.
            // Original server never sent system messages on leave.
            logger.info('CHAT', 'Disconnected: userId=' + result.userId +
                ', roomsLeft=' + roomsLeft);
        }

        logger.info('CHAT', 'Disconnected: ' + socket.id +
            ' (Reason: ' + reason +
            ', Verified: ' + (socket._verified ? 'yes' : 'no') +
            ', Active: ' + activeConnections + ')');
    });

    // ---- Error Handler ----
    socket.on('error', function(err) {
        logger.error('CHAT', 'Socket error (' + socket.id + '): ' + err.message);
    });
});

// =============================================
// 9. PERIODIC CLEANUP
// =============================================

// Clean up expired rate limiter entries every 5 minutes
var cleanupInterval = setInterval(function() {
    var cleaned = rateLimiter.cleanup();
    if (cleaned > 0) {
        logger.info('CHAT', 'Cleanup: removed ' + cleaned + ' expired rate limit entries');
    }
}, 5 * 60 * 1000);

// =============================================
// 10. GRACEFUL SHUTDOWN
// =============================================

function gracefulShutdown(signal) {
    logger.info('CHAT', 'Received ' + signal + '. Shutting down...');

    clearInterval(cleanupInterval);

    // Disconnect all clients
    var userIds = userManager.getConnectedUserIds();
    for (var i = 0; i < userIds.length; i++) {
        try {
            var sock = userManager.getSocketByUserId(userIds[i]);
            if (sock) sock.disconnect(true);
        } catch (e) {
            // Ignore
        }
    }
    logger.info('CHAT', 'Disconnected ' + userIds.length + ' client(s)');

    io.close(function() {
        logger.info('CHAT', 'Socket.IO closed');

        DB.closePool()
            .then(function() {
                logger.info('CHAT', 'Database pool closed');
                server.close(function() {
                    logger.info('CHAT', 'Server closed');
                    process.exit(0);
                });
            })
            .catch(function(err) {
                logger.error('CHAT', 'Error closing DB: ' + err.message);
                server.close(function() {
                    process.exit(0);
                });
            });
    });

    setTimeout(function() {
        logger.error('CHAT', 'Forced exit after timeout');
        process.exit(1);
    }, 10000);
}

process.on('SIGTERM', function() { gracefulShutdown('SIGTERM'); });
process.on('SIGINT', function() { gracefulShutdown('SIGINT'); });

// =============================================
// 11. START SERVER
// =============================================

async function startServer() {
    logger.info('CHAT', 'Initializing database...');
    try {
        await DB.initPool();
        logger.info('CHAT', 'Database connected');
    } catch (err) {
        logger.error('CHAT', 'FATAL: Database connection failed!');
        logger.error('CHAT', err.message);
        process.exit(1);
    }

    server.listen(SERVER_PORT, SERVER_HOST, function() {
        console.log('');
        console.log('================================================');
        console.log('  Super Warrior Z — Chat Server');
        console.log('================================================');
        console.log('  Address:     http://' + SERVER_HOST + ':' + SERVER_PORT);
        console.log('  Socket.IO:   http://' + SERVER_HOST + ':' + SERVER_PORT);
        console.log('  Health:      http://' + SERVER_HOST + ':' + SERVER_PORT + '/health');
        console.log('  TEA Key:     ' + TEA_KEY);
        console.log('================================================');
        console.log('  Modules:');
        console.log('    handlers/      → login, joinRoom, leaveRoom, sendMsg, getRecord');
        console.log('    services/      → roomManager, messageStore, userManager');
        console.log('    middleware/    → chatAuth (TEA verify)');
        console.log('    utils/         → chatConstants, messageBuilder, rateLimiter');
        console.log('================================================');
        console.log('  Actions:');
        console.log('    handler.process → type=chat, action=login');
        console.log('    handler.process → type=chat, action=joinRoom');
        console.log('    handler.process → type=chat, action=leaveRoom');
        console.log('    handler.process → type=chat, action=sendMsg');
        console.log('    handler.process → type=chat, action=getRecord');
        console.log('================================================');
        console.log('  Push: Notify event → { ret:"SUCCESS", data:{_msg:{...}} }');
        console.log('================================================');
        console.log('  Status:');
        console.log('    Database:      ' + (DB.isReady() ? 'CONNECTED' : 'NOT CONNECTED'));
        console.log('    TEA Security:  ENABLED');
        console.log('    Rate Limiter:  ENABLED (' +
            chatConstants.LIMITS.RATE_LIMIT_MESSAGES + ' msgs/' +
            chatConstants.LIMITS.RATE_LIMIT_WINDOW + 's)');
        console.log('    Message Limit: ' + chatConstants.LIMITS.MAX_MESSAGES_PER_ROOM + '/room');
        console.log('================================================');
        console.log('');
        console.log('  Waiting for client connections...');
        console.log('');
    });
}

server.on('error', function(err) {
    if (err.code === 'EADDRINUSE') {
        logger.error('CHAT', 'FATAL: Port ' + SERVER_PORT + ' is already in use!');
    } else {
        logger.error('CHAT', 'FATAL: Server error: ' + err.message);
    }
    process.exit(1);
});

startServer();
