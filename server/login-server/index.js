/**
 * index.js — LOGIN-SERVER Main Entry Point
 * Referensi: login-server.md v3.0
 *
 * Port: 8000
 * Transport: Socket.IO 2.5.1
 * TEA: OFF (verifyEnable = false)
 * Database: better-sqlite3 — ./data/login_server.db
 * Protocol: handler.process (single event for all actions)
 *
 * Actions implemented:
 *   1. GetServerList
 *   2. SaveHistory
 *   3. SaveUserEnterInfo
 *   4. SaveLanguage
 *   5. LoginAnnounce
 *
 * Security Code Verification: Option A — HTTP API call ke SDK-Server /auth/validate
 * server0Time: 25200000 (hardcoded)
 */

const http = require('http');
const path = require('path');
const chalk = require('chalk');
const logger = require('./logger');
const config = require('./config');
const db = require('./db');

// ─── Socket.IO 2.5.1 Setup ───
// Socket.IO 2.x: require('socket.io') returns a function, NOT a class
const io = require('socket.io')(config.port, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    },
    transports: ['websocket', 'polling']
});

// ─── Session Tracking ───
// Map socketId → { userId, connectedAt, ip, transport }
const sessions = new Map();

// ─── Action Counter (per socket) ───
// Map socketId → action counter
const actionCounters = new Map();

// ═══════════════════════════════════════════════════════════════
// SDK-SERVER API HELPERS (Option A)
// Referensi: login-server.md v3.0 Section 18
// ═══════════════════════════════════════════════════════════════

/**
 * Validate securityCode via SDK-Server /auth/validate
 * Also returns loginToken from SDK-Server
 * ⚠️ NOTE: Currently unused — SaveHistory uses /user/info/:userId instead
 * because the client doesn't send loginToken in SaveHistory request.
 * Kept for potential future use (e.g. Main-Server may need this).
 * @param {string} loginToken
 * @param {string} userId
 * @param {string} securityCode
 * @returns {Promise<object>} { valid, sign, securityCode, loginToken }
 */
function validateWithSDKServer(loginToken, userId, securityCode) {
    return new Promise((resolve) => {
        const payload = JSON.stringify({ loginToken, userId, securityCode });
        const startTime = Date.now();

        const options = {
            hostname: '127.0.0.1',
            port: 9999,
            path: '/auth/validate',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload)
            },
            timeout: 5000
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                const duration = Date.now() - startTime;
                try {
                    const data = JSON.parse(body);
                    logger.log('INFO', 'SDKAPI', `SDK-Server /auth/validate response`);
                    logger.details('data',
                        ['userId', userId],
                        ['valid', String(data.valid)],
                        ['duration', duration + 'ms']
                    );
                    resolve(data);
                } catch (err) {
                    logger.log('ERROR', 'SDKAPI', `SDK-Server /auth/validate parse error`);
                    logger.detail('important', ['error', err.message]);
                    resolve({ valid: false, loginToken: '', securityCode: '' });
                }
            });
        });

        req.on('error', (err) => {
            const duration = Date.now() - startTime;
            logger.log('ERROR', 'SDKAPI', `SDK-Server /auth/validate failed`);
            logger.details('important',
                ['error', err.message],
                ['duration', duration + 'ms']
            );
            resolve({ valid: false, loginToken: '', securityCode: '' });
        });

        req.on('timeout', () => {
            req.destroy();
        });

        req.write(payload);
        req.end();
    });
}

/**
 * Verify user exists via SDK-Server /user/info/:userId
 * @param {string} userId
 * @returns {Promise<object|null>} User data or null
 */
function verifyUserWithSDKServer(userId) {
    return new Promise((resolve) => {
        const startTime = Date.now();

        const options = {
            hostname: '127.0.0.1',
            port: 9999,
            path: `/user/info/${userId}`,
            method: 'GET',
            timeout: 5000
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                const duration = Date.now() - startTime;
                if (res.statusCode === 200) {
                    try {
                        const data = JSON.parse(body);
                        logger.log('INFO', 'SDKAPI', `SDK-Server user verified`);
                        logger.details('data',
                            ['userId', userId],
                            ['duration', duration + 'ms']
                        );
                        resolve(data);
                    } catch (err) {
                        logger.log('ERROR', 'SDKAPI', `SDK-Server user info parse error`);
                        resolve(null);
                    }
                } else {
                    logger.log('WARN', 'SDKAPI', `SDK-Server user not found`);
                    logger.details('data',
                        ['userId', userId],
                        ['status', res.statusCode],
                        ['duration', duration + 'ms']
                    );
                    resolve(null);
                }
            });
        });

        req.on('error', (err) => {
            const duration = Date.now() - startTime;
            logger.log('ERROR', 'SDKAPI', `SDK-Server user verify failed`);
            logger.details('important',
                ['error', err.message],
                ['duration', duration + 'ms']
            );
            resolve(null);
        });

        req.on('timeout', () => {
            req.destroy();
        });

        req.end();
    });
}

// ═══════════════════════════════════════════════════════════════
// RESPONSE BUILDER
// Referensi: login-server.md v3.0 Section 3.3
// ═══════════════════════════════════════════════════════════════

/**
 * Build standard response envelope
 * server0Time = 25200000 (hardcoded per v3.0 decision)
 * @param {number} ret - 0 for success, error code for failure
 * @param {object|string} data - Data object (will be JSON.stringified) or string
 * @param {boolean} compress - LZString compression flag
 * @returns {object}
 */
function buildResponse(ret, data, compress) {
    return {
        ret: ret,
        data: typeof data === 'string' ? data : JSON.stringify(data),
        compress: compress || false,
        serverTime: Date.now(),
        server0Time: config.server0Time  // 25200000 hardcoded
    };
}

/**
 * Build error response
 * @param {number} errorCode
 * @returns {object}
 */
function buildErrorResponse(errorCode) {
    return buildResponse(errorCode, '', false);
}

// ═══════════════════════════════════════════════════════════════
// ACTION HANDLERS
// Referensi: login-server.md v3.0 Section 5, 9
// ═══════════════════════════════════════════════════════════════

/**
 * Action: GetServerList
 * Referensi: login-server.md v3.0 Section 5.1, 9.1
 *
 * Input:  {type:'User', action:'GetServerList', userId, subChannel, channel}
 * Output: {serverList, history, offlineReason}
 */
async function handleGetServerList(request) {
    const startTime = Date.now();
    const userId = request.userId;

    logger.log('INFO', 'GSL', 'GetServerList request');
    logger.details('request',
        ['userId', userId],
        ['channel', request.channel || ''],
        ['subChannel', request.subChannel || '']
    );

    // 1. Verify user exists via SDK-Server
    const userInfo = await verifyUserWithSDKServer(userId);
    if (!userInfo) {
        const duration = Date.now() - startTime;
        logger.log('WARN', 'GSL', `User not found → ret=37`);
        logger.details('data',
            ['userId', userId],
            ['duration', duration + 'ms']
        );
        return buildErrorResponse(37);  // ERROR_NO_LOGIN_CLIENT
    }

    // 2. Get server list from config
    const serverList = config.servers.map(s => ({
        serverId: s.serverId,
        name: s.name,
        url: s.url,
        chaturl: s.chaturl,
        dungeonurl: s.dungeonurl,
        online: s.online,
        hot: s.hot,
        new: s.new,
        offlineReason: ''
    }));

    // 3. Get history from user_servers
    const historyRows = db.getUserServerHistory(userId);
    const history = historyRows.map(r => r.serverId);

    // 4. Build response
    const data = {
        serverList: serverList,
        history: history,
        offlineReason: ''
    };

    const duration = Date.now() - startTime;
    logger.log('INFO', 'GSL', `GetServerList success`);
    logger.details('data',
        ['servers', String(serverList.length)],
        ['history', JSON.stringify(history)],
        ['duration', duration + 'ms']
    );

    return buildResponse(0, data, false);
}

/**
 * Action: SaveHistory
 * Referensi: login-server.md v3.0 Section 5.2, 9.2
 *
 * Input:  {type:'User', action:'SaveHistory', accountToken, channelCode, serverId, securityCode, subChannel, version}
 * Output: {loginToken, todayLoginCount}
 */
async function handleSaveHistory(request) {
    const startTime = Date.now();
    const userId = request.accountToken;  // ⚠️ field name = accountToken, bukan userId
    const channelCode = request.channelCode || 'ppgame';
    const serverId = request.serverId;
    const securityCode = request.securityCode;

    logger.log('INFO', 'SAVEHIST', 'SaveHistory request');
    logger.details('request',
        ['userId', userId],
        ['serverId', serverId],
        ['channelCode', channelCode],
        ['securityCode', securityCode ? securityCode.substring(0, 8) + '...' : 'empty']
    );

    // 1. Validate required fields
    if (!userId || !serverId || !securityCode) {
        const duration = Date.now() - startTime;
        logger.log('WARN', 'SAVEHIST', `Missing required fields`);
        logger.details('data',
            ['userId', userId || 'MISSING'],
            ['serverId', serverId || 'MISSING'],
            ['securityCode', securityCode ? 'present' : 'MISSING'],
            ['duration', duration + 'ms']
        );
        return buildErrorResponse(8);  // ERROR_LACK_PARAM
    }

    // 2. Verify user exists via SDK-Server /user/info/:userId
    //    Endpoint ini return full user record termasuk securityCode dan loginToken
    //    Kita compare securityCode locally karena client tidak mengirim loginToken
    const userInfo = await verifyUserWithSDKServer(userId);

    if (!userInfo) {
        const duration = Date.now() - startTime;
        logger.log('WARN', 'SAVEHIST', `User not found in SDK-Server → ret=37`);
        logger.details('data',
            ['userId', userId],
            ['duration', duration + 'ms']
        );
        return buildErrorResponse(37);  // ERROR_NO_LOGIN_CLIENT
    }

    // 3. Validate securityCode locally (compare dengan SDK-Server data)
    if (userInfo.securityCode !== securityCode) {
        const duration = Date.now() - startTime;
        logger.log('WARN', 'SAVEHIST', `Security code mismatch → ret=55`);
        logger.details('data',
            ['userId', userId],
            ['expected', userInfo.securityCode ? userInfo.securityCode.substring(0, 8) + '...' : 'empty'],
            ['received', securityCode ? securityCode.substring(0, 8) + '...' : 'empty'],
            ['duration', duration + 'ms']
        );
        return buildErrorResponse(55);  // SIGN_ERROR
    }

    // 4. Save/update user_servers
    db.saveUserServer({ userId, serverId });

    // 5. Insert login_history
    db.insertLoginHistory({ userId, serverId, channelCode, securityCode });

    // 6. Get todayLoginCount
    const todayLoginCount = db.getTodayLoginCount(userId);

    // 7. loginToken dari /user/info response
    const loginToken = userInfo.loginToken || '';

    const duration = Date.now() - startTime;
    logger.log('INFO', 'SAVEHIST', `SaveHistory success`);
    logger.details('data',
        ['userId', userId],
        ['serverId', serverId],
        ['todayLoginCount', String(todayLoginCount)],
        ['loginToken', loginToken ? loginToken.substring(0, 8) + '...' : 'empty'],
        ['duration', duration + 'ms']
    );

    return buildResponse(0, { loginToken, todayLoginCount }, false);
}

/**
 * Action: SaveUserEnterInfo
 * Referensi: login-server.md v3.0 Section 5.3, 9.3
 *
 * Input:  {type:'User', action:'SaveUserEnterInfo', accountToken, channelCode, subChannel, createTime, userLevel, version}
 * Output: {} (hanya ret:0)
 */
function handleSaveUserEnterInfo(request) {
    const startTime = Date.now();
    const userId = request.accountToken;  // ⚠️ accountToken, bukan userId

    logger.log('INFO', 'SAVEINFO', 'SaveUserEnterInfo request');
    logger.details('request',
        ['userId', userId],
        ['channelCode', request.channelCode || ''],
        ['userLevel', String(request.userLevel || 0)]
    );

    if (!userId) {
        const duration = Date.now() - startTime;
        logger.log('WARN', 'SAVEINFO', `Missing userId → ret=8`);
        logger.detail('data', ['duration', duration + 'ms']);
        return buildErrorResponse(8);
    }

    // Save to DB
    db.saveUserEnterInfo({
        userId,
        channelCode: request.channelCode || 'ppgame',
        createTime: request.createTime || 0,
        userLevel: request.userLevel || 0
    });

    const duration = Date.now() - startTime;
    logger.log('INFO', 'SAVEINFO', `SaveUserEnterInfo success`);
    logger.details('data',
        ['userId', userId],
        ['duration', duration + 'ms']
    );

    return buildResponse(0, {}, false);
}

/**
 * Action: SaveLanguage
 * Referensi: login-server.md v3.0 Section 5.4, 9.4
 *
 * ⚠️ Field `userid` (huruf kecil!) — berbeda dari action lain
 * ⚠️ Response data punya errorCode (di dalam data, bukan envelope ret)
 *
 * Input:  {type:'User', action:'SaveLanguage', userid, sdk, appid, language}
 * Output: {errorCode: 0}  ← di dalam data!
 */
function handleSaveLanguage(request) {
    const startTime = Date.now();
    const userId = request.userid;  // ⚠️ huruf kecil! BUKAN userId atau accountToken

    logger.log('INFO', 'SAVELANG', 'SaveLanguage request');
    logger.details('request',
        ['userId', userId],
        ['sdk', request.sdk || ''],
        ['language', request.language || '']
    );

    if (!userId || !request.language) {
        const duration = Date.now() - startTime;
        logger.log('WARN', 'SAVELANG', `Missing required fields`);
        logger.details('data',
            ['userId', userId || 'MISSING'],
            ['language', request.language || 'MISSING'],
            ['duration', duration + 'ms']
        );
        return buildErrorResponse(8);
    }

    // Save to DB
    db.saveUserLanguage({
        userId,
        language: request.language,
        sdk: request.sdk || 'ppgame'
    });

    const duration = Date.now() - startTime;
    logger.log('INFO', 'SAVELANG', `SaveLanguage success`);
    logger.details('data',
        ['userId', userId],
        ['language', request.language],
        ['duration', duration + 'ms']
    );

    // ⚠️ Response: errorCode di dalam data, BUKAN ret di envelope
    return buildResponse(0, { errorCode: 0 }, false);
}

/**
 * Action: LoginAnnounce
 * Referensi: login-server.md v3.0 Section 5.5
 *
 * Return welcome notice content
 */
function handleLoginAnnounce(request) {
    const startTime = Date.now();

    logger.log('INFO', 'ANNOUNCE', 'LoginAnnounce request');

    const data = config.announce;

    const duration = Date.now() - startTime;
    logger.log('INFO', 'ANNOUNCE', `LoginAnnounce response sent`);
    logger.details('data',
        ['notices', String(Object.keys(data).length)],
        ['duration', duration + 'ms']
    );

    return buildResponse(0, data, false);
}

// ═══════════════════════════════════════════════════════════════
// ACTION ROUTER
// Referensi: login-server.md v3.0 Section 3.1
// ═══════════════════════════════════════════════════════════════

const ACTION_HANDLERS = {
    'GetServerList': handleGetServerList,
    'SaveHistory': handleSaveHistory,
    'SaveUserEnterInfo': handleSaveUserEnterInfo,
    'SaveLanguage': handleSaveLanguage,
    'LoginAnnounce': handleLoginAnnounce
};

// ═══════════════════════════════════════════════════════════════
// SOCKET.IO CONNECTION HANDLER
// Referensi: login-server.md v3.0 Section 4
// ═══════════════════════════════════════════════════════════════

io.on('connection', (socket) => {
    const socketId = socket.id;
    const clientIp = socket.handshake.address || 'unknown';
    const transport = socket.handshake.query.transport || socket.conn.transport.name || 'websocket';

    // Initialize session
    sessions.set(socketId, {
        userId: null,
        connectedAt: Date.now(),
        ip: clientIp,
        transport: transport
    });
    actionCounters.set(socketId, 0);

    logger.log('INFO', 'SOCKET', `Client connected`);
    logger.socketEvent('connect', socketId, clientIp, transport);

    // ─── Handle handler.process ───
    // Referensi: login-server.md v3.0 Section 3.1
    // Satu-satunya event. Jangan buat event terpisah per action.
    socket.on('handler.process', async (request, callback) => {
        const actionCounter = (actionCounters.get(socketId) || 0) + 1;
        actionCounters.set(socketId, actionCounter);

        const action = request.action || 'UNKNOWN';
        const actionType = request.type || '';

        // Log request
        logger.log('INFO', 'HANDLER', `[${actionCounter}] handler.process → ${action}`);
        logger.actionLog('req', action, 'REQ', null,
            `uid=${(request.userId || request.accountToken || request.userid || '?').substring(0, 12)}`);

        // Validate: type harus 'User' (huruf besar U)
        if (actionType !== 'User') {
            logger.log('WARN', 'HANDLER', `Invalid type: "${actionType}" → expected "User"`);
            if (typeof callback === 'function') {
                callback(buildErrorResponse(4));  // ERROR_INVALID
            }
            return;
        }

        // Validate: action harus ada
        if (!action || !ACTION_HANDLERS[action]) {
            logger.log('WARN', 'HANDLER', `Unknown action: "${action}"`);
            if (typeof callback === 'function') {
                callback(buildErrorResponse(4));  // ERROR_INVALID
            }
            return;
        }

        // Track userId in session
        const reqUserId = request.userId || request.accountToken || request.userid;
        if (reqUserId) {
            const session = sessions.get(socketId);
            if (session) {
                session.userId = reqUserId;
            }
        }

        try {
            // Dispatch ke handler
            const handler = ACTION_HANDLERS[action];
            const response = await handler(request);

            // Log response
            const status = response.ret === 0 ? 'OK' : `ERR=${response.ret}`;
            logger.actionLog('res', action, response.ret === 0 ? 'OK' : 'ERR',
                null, `ret=${response.ret} ${response.ret === 0 ? '✅' : '❌'}`);

            if (typeof callback === 'function') {
                callback(response);
            }
        } catch (err) {
            logger.log('ERROR', 'HANDLER', `Action "${action}" threw error`);
            logger.details('important',
                ['error', err.message],
                ['stack', err.stack ? err.stack.split('\n')[1] : '']
            );

            if (typeof callback === 'function') {
                callback(buildErrorResponse(1));  // ERROR_UNKNOWN
            }
        }
    });

    // ─── Socket Disconnect ───
    socket.on('disconnect', (reason) => {
        const session = sessions.get(socketId);
        const userId = session ? session.userId : 'unknown';
        const aliveMs = session ? Date.now() - session.connectedAt : 0;

        logger.log('INFO', 'SOCKET', `Client disconnected`);
        logger.socketEvent('disconnect', socketId, session ? session.ip : '?', session ? session.transport : '?',
            `uid=${userId.substring(0, 12)} alive=${aliveMs}ms reason=${reason}`);

        // Cleanup
        sessions.delete(socketId);
        actionCounters.delete(socketId);
    });

    // ─── Transport upgrade ───
    socket.conn.on('upgrade', (transport) => {
        const session = sessions.get(socketId);
        if (session) {
            session.transport = transport.name;
        }
        logger.log('DEBUG', 'SOCKET', `Transport upgraded → ${transport.name}`);
        logger.detail('data', ['socketId', socketId.substring(0, 8)], ['transport', transport.name]);
    });
});

// ═══════════════════════════════════════════════════════════════
// SERVER STARTUP
// ═══════════════════════════════════════════════════════════════

logger.boundary('🚀', 'SUPER WARRIOR Z — LOGIN SERVER');
logger.detail('location',
    ['Port', config.port],
    ['Socket.IO', '2.5.1'],
    ['TEA', 'OFF'],
    ['DB', path.join(__dirname, 'data', 'login_server.db')],
    ['SDK API', config.sdkServerUrl],
    ['server0Time', String(config.server0Time)]
);
logger.boundaryEnd('🚀');

console.log('');
logger.log('INFO', 'HANDLER', 'Actions registered');
const actionList = Object.keys(ACTION_HANDLERS);
actionList.forEach((action, i) => {
    const connector = i < actionList.length - 1 ? '├' : '└';
    console.log(`  ${connector} ⚙️ ${chalk.cyan('handler.process')} → ${chalk.white(action)}`);
});

console.log('');
logger.log('INFO', 'SERVER', `Ready — listening on http://127.0.0.1:${config.port}`);
logger.log('INFO', 'SERVER', `Waiting for Socket.IO connections...`);
