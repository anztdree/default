/**
 * index.js — Main-Server Entry Point
 *
 * Socket.IO 2.5.1 + TEA Verification + Handler Router
 * Port: 8001
 *
 * Flow:
 *   1. Load JSON resources (471 file → memory)
 *   2. Init database (scan handlers → auto CREATE TABLE → auto CRUD)
 *   3. Start Socket.IO server
 *   4. Client connect → TEA verify → handler.process
 */

const http = require('http');
const path = require('path');
const chalk = require('chalk');
const io = require('socket.io');
const config = require('./config');
const logger = require('./logger');
const tea = require('./tea');
const jsonLoader = require('./jsonLoader');
const responseBuilder = require('./responseBuilder');
const db = require('./db');

const { buildResponse, buildError, buildSuccess, buildNotify } = responseBuilder;

// ═══════════════════════════════════════════════════════════════
//  STARTUP SEQUENCE
// ═══════════════════════════════════════════════════════════════

logger.boundary('🚀', 'SUPER WARRIOR Z — MAIN SERVER');
logger.detail('location',
    ['Port', String(config.port)],
    ['TEA', config.verifyEnable ? 'ON' : 'OFF'],
    ['DB', path.join(__dirname, 'data', 'main_server.db')],
    ['JSON', config.jsonPath],
    ['server0Time', String(config.server0Time)]
);
logger.boundaryEnd('🚀');

// 1. Load JSON resources
logger.log('INFO', 'JSON', `Loading resource files from ${config.jsonPath}...`);
const loadStart = Date.now();
jsonLoader.load(config.jsonPath);
const loadDuration = Date.now() - loadStart;
logger.log('INFO', 'JSON', `Resource files loaded`);
logger.details('data',
    ['count', String(jsonLoader.list().length)],
    ['duration', loadDuration + 'ms']
);

// 2. Database sudah init via db.js require (auto scan handlers)
logger.log('INFO', 'DB', 'Database ready (WAL mode)');

// ═══════════════════════════════════════════════════════════════
//  HANDLER REGISTRY
// ═══════════════════════════════════════════════════════════════

const HANDLER_REGISTRY = {};  // type → { action → handlerModule }

function registerHandlers() {
    const handlersDir = path.join(__dirname, 'handlers');
    const fs = require('fs');
    if (!fs.existsSync(handlersDir)) {
        logger.log('WARN', 'HANDLER', 'No handlers directory');
        return;
    }

    function scanDir(dir, typePrefix) {
        const entries = fs.readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);

            if (entry.isDirectory()) {
                const typeName = entry.name;
                scanDir(fullPath, typeName);
            } else if (entry.name.endsWith('.js')) {
                const actionName = entry.name.replace('.js', '');

                try {
                    delete require.cache[require.resolve(fullPath)];
                    const handler = require(fullPath);

                    if (!typePrefix) continue;

                    if (!HANDLER_REGISTRY[typePrefix]) {
                        HANDLER_REGISTRY[typePrefix] = {};
                    }
                    HANDLER_REGISTRY[typePrefix][actionName] = handler;

                    logger.log('DEBUG', 'HANDLER', `Registered: ${typePrefix}.${actionName}`);
                } catch (e) {
                    logger.log('ERROR', 'HANDLER', `Failed to load ${typePrefix}/${actionName}: ${e.message}`);
                    logger.detail('important', ['error', e.stack ? e.stack.split('\n')[1] : '']);
                }
            }
        }
    }

    scanDir(handlersDir, '');

    const typeCount = Object.keys(HANDLER_REGISTRY).length;
    let actionCount = 0;
    for (const type of Object.keys(HANDLER_REGISTRY)) {
        actionCount += Object.keys(HANDLER_REGISTRY[type]).length;
    }

    logger.log('INFO', 'HANDLER', `Handlers registered — ${typeCount} types, ${actionCount} actions`);
    logger.handlerRegistry(HANDLER_REGISTRY);
}

registerHandlers();

// ═══════════════════════════════════════════════════════════════
//  SOCKET STATE MANAGEMENT
// ═══════════════════════════════════════════════════════════════

// socketId → { verified, userId, nonce, loginTime, ip, transport }
const socketStates = new Map();

// userId → socketId (untuk kick duplikat login)
const userSockets = new Map();

// Action counter per socket
const actionCounters = new Map();

// ═══════════════════════════════════════════════════════════════
//  SOCKET.IO SERVER
// ═══════════════════════════════════════════════════════════════

const server = http.createServer();
const socketIO = io(server, {
    pingInterval: 10000,
    pingTimeout: 5000
});

// Set socketIO reference for handlers that need it (e.g., enterGame Kickout)
for (const type of Object.keys(HANDLER_REGISTRY)) {
    for (const action of Object.keys(HANDLER_REGISTRY[type])) {
        const handler = HANDLER_REGISTRY[type][action];
        if (handler && handler.setSocketIO) {
            handler.setSocketIO(socketIO);
        }
    }
}

socketIO.on('connection', (socket) => {
    const connectTime = Date.now();
    const clientIp = socket.handshake.address || 'unknown';
    const transport = socket.handshake.query.transport || socket.conn.transport.name || 'websocket';

    // Initialize state
    const nonce = tea.generateNonce();
    socketStates.set(socket.id, {
        verified: false,
        userId: null,
        nonce: nonce,
        loginTime: connectTime,
        ip: clientIp,
        transport: transport
    });
    actionCounters.set(socket.id, 0);

    logger.log('INFO', 'SOCKET', 'Client connected');
    logger.socketEvent('connect', socket.id, clientIp, transport);

    // ─── TEA VERIFICATION HANDSHAKE ───
    socket.emit('verify', nonce);
    logger.log('DEBUG', 'TEA', `Challenge sent`);

    // Listen for verify response
    socket.on('verify', (encrypted, callback) => {
        if (typeof callback !== 'function') return;

        const state = socketStates.get(socket.id);
        if (!state) {
            callback({ ret: 55 });
            return;
        }

        const verifyStart = Date.now();
        const verified = tea.verify(state.nonce, encrypted, config.teaKey);

        if (verified) {
            state.verified = true;
            logger.log('INFO', 'TEA', 'Client verified');
            logger.details('session',
                ['socketId', socket.id.substring(0, 8)],
                ['duration', (Date.now() - verifyStart) + 'ms']
            );
            callback({ ret: 0 });
        } else {
            logger.log('WARN', 'TEA', 'Verification failed');
            logger.details('session',
                ['socketId', socket.id.substring(0, 8)],
                ['duration', (Date.now() - verifyStart) + 'ms']
            );
            callback({ ret: 55 });
            socket.disconnect();
        }
    });

    // ─── HANDLER.PROCESS — ROUTER UTAMA ───
    socket.on('handler.process', async (request, callback) => {
        if (typeof callback !== 'function') return;

        const handlerStart = Date.now();

        // 1. Cek verified
        const state = socketStates.get(socket.id);
        if (!state || !state.verified) {
            return callback(buildError(37));  // ERROR_NO_LOGIN_CLIENT
        }

        // 2. Increment action counter
        const actionCounter = (actionCounters.get(socket.id) || 0) + 1;
        actionCounters.set(socket.id, actionCounter);

        // 3. Parse request
        const { type, action } = request;
        const userId = state.userId || request.userId || '?';
        const shortUserId = String(userId).substring(0, 16);

        // 4. Log request
        logger.log('INFO', 'HANDLER', `[${actionCounter}] ${type}.${action}`);
        logger.actionLog('req', `${type}.${action}`, 'REQ', null, `uid=${shortUserId}`);

        // 5. Route ke handler
        const typeHandlers = HANDLER_REGISTRY[type];
        if (!typeHandlers) {
            logger.log('WARN', 'HANDLER', `Unknown type: ${type}`);
            logger.actionLog('res', `${type}.${action}`, 'ERR', Date.now() - handlerStart, `ret=4`);
            return callback(buildError(4));  // ERROR_INVALID
        }

        const handlerModule = typeHandlers[action];
        if (!handlerModule || !handlerModule.execute) {
            logger.log('WARN', 'HANDLER', `Unknown action: ${type}.${action}`);
            logger.actionLog('res', `${type}.${action}`, 'ERR', Date.now() - handlerStart, `ret=4`);
            return callback(buildError(4));  // ERROR_INVALID
        }

        // 6. Execute handler
        try {
            const response = await handlerModule.execute(request, socket, { db, jsonLoader, responseBuilder, config, socketStates, userSockets });

            const duration = Date.now() - handlerStart;
            const status = response.ret === 0 ? 'OK' : 'ERR';

            logger.log(response.ret === 0 ? 'INFO' : 'WARN', 'HANDLER',
                `[${actionCounter}] ${type}.${action} → ${status} (${duration}ms)`);
            logger.actionLog('res', `${type}.${action}`, status, duration,
                `ret=${response.ret} ${response.ret === 0 ? '✅' : '❌'}`);

            // Track userId after enterGame
            if (type === 'user' && action === 'enterGame' && response.ret === 0) {
                try {
                    const data = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
                    if (data && data.user && data.user._id) {
                        state.userId = data.user._id;
                    }
                } catch (e) { /* ignore parse error */ }
            }

            callback(response);
        } catch (err) {
            const duration = Date.now() - handlerStart;
            logger.log('ERROR', 'HANDLER', `[${actionCounter}] ${type}.${action} threw error (${duration}ms)`);
            logger.details('important',
                ['error', err.message],
                ['stack', err.stack ? err.stack.split('\n')[1] : ''],
                ['duration', duration + 'ms']
            );
            logger.actionLog('res', `${type}.${action}`, 'ERR', duration, `ret=1 ${err.message.substring(0, 40)}`);
            callback(buildError(1));  // ERROR_UNKNOWN
        }
    });

    // ─── NOTIFY — SERVER PUSH KE CLIENT ───
    socket.notifyPush = function(action, data) {
        logger.log('INFO', 'NOTIFY', `Push → ${action}`);
        socket.emit('Notify', buildNotify(action, data));
    };

    // ─── DISCONNECT ───
    socket.on('disconnect', (reason) => {
        const state = socketStates.get(socket.id);
        const userId = state ? state.userId : 'unknown';
        const aliveMs = state ? Date.now() - state.loginTime : 0;

        logger.log('INFO', 'SOCKET', 'Client disconnected');
        logger.socketEvent('disconnect', socket.id, state ? state.ip : '?', state ? state.transport : '?',
            `uid=${String(userId).substring(0, 12)} alive=${aliveMs}ms reason=${reason}`);

        // Remove from userSockets mapping
        if (state && state.userId && userSockets.get(state.userId) === socket.id) {
            userSockets.delete(state.userId);
        }
        socketStates.delete(socket.id);
        actionCounters.delete(socket.id);
    });

    // ─── Transport upgrade ───
    socket.conn.on('upgrade', (transport) => {
        const state = socketStates.get(socket.id);
        if (state) {
            state.transport = transport.name;
        }
        logger.log('DEBUG', 'SOCKET', `Transport upgraded → ${transport.name}`);
        logger.detail('data', ['socketId', socket.id.substring(0, 8)], ['transport', transport.name]);
    });
});

// ═══════════════════════════════════════════════════════════════
//  START SERVER
// ═══════════════════════════════════════════════════════════════

server.listen(config.port, () => {
    logger.boundary('🚀', 'MAIN-SERVER READY');
    logger.details('config',
        ['Port', String(config.port)],
        ['TEA Verify', config.verifyEnable ? 'ON' : 'OFF'],
        ['JSON Files', String(jsonLoader.list().length) + ' loaded'],
        ['Handlers', String(Object.keys(HANDLER_REGISTRY).length) + ' types'],
        ['Database', 'WAL mode'],
        ['LOG_LEVEL', LOG_LEVEL]
    );
    logger.boundaryEnd('🚀');

    logger.log('INFO', 'SERVER', `Ready — listening on http://127.0.0.1:${config.port}`);
    logger.log('INFO', 'SERVER', 'Waiting for Socket.IO connections...');
});

// Expose LOG_LEVEL for display
const LOG_LEVEL = (process.env.LOG_LEVEL || 'INFO').toUpperCase();
