/**
 * index.js — MAIN-SERVER Main Entry Point
 * Deep-traced from main.min.js
 *
 * Port: 8001
 * Transport: Socket.IO 2.5.1
 * TEA: ON (verifyEnable = true)
 * Database: Pure LocalStorage API (db.js)
 * Protocol: handler.process (single event for all actions)
 *
 * Handlers: user/enterGame, user/registChat, user/getBulletinBrief+readBulletin,
 *           friend/friendServerAction, heroImage/getAll, hero/getAttrs,
 *           userMsg/getMsgList, guide/saveGuide,
 *           hangup/saveGuideTeam, hangup/checkBattleResult
 *
 * ═══════════════════════════════════════════════════════════════
 * BUG FIX LOG
 * ═══════════════════════════════════════════════════════════════
 *
 * [FIX-003] Circular reference safety in buildDataResponse
 *   Added try-catch around JSON.stringify with detailed error logging
 *   If circular detected, identifies exact field causing the issue
 *
 * [FIX-005] Super detail logging throughout
 *   Every step logged with context, timing, and data sizes
 */

const path = require('path');
const chalk = require('chalk');
const LZString = require('lz-string');
const logger = require('./logger');
const config = require('./config');
const db = require('./db');
const tea = require('./tea');
const enterGame = require('./handlers/user/enterGame');
const registChat = require('./handlers/user/registChat');
const bulletinHandlers = require('./handlers/user/getBulletinBrief');
const friendServerAction = require('./handlers/friend/friendServerAction');
const heroImageGetAll = require('./handlers/heroImage/getAll');
const heroGetAttrs = require('./handlers/hero/getAttrs');
const userMsgGetMsgList = require('./handlers/userMsg/getMsgList');
const userMsgGetMsg = require('./handlers/userMsg/getMsg');
const userMsgSendMsg = require('./handlers/userMsg/sendMsg');
const userMsgReadMsg = require('./handlers/userMsg/readMsg');
const userMsgDelFriendMsg = require('./handlers/userMsg/delFriendMsg');
const guideSaveGuide = require('./handlers/guide/saveGuide');
const hangupSaveGuideTeam = require('./handlers/hangup/saveGuideTeam');
const hangupCheckBattleResult = require('./handlers/hangup/checkBattleResult');
const buryPointGuideBattle = require('./handlers/buryPoint/guideBattle');
const summonOneFree = require('./handlers/summon/summonOneFree');

// ─── Socket.IO 2.5.1 Setup ───
const io = require('socket.io')(config.port, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    },
    transports: ['websocket', 'polling']
});

// ─── Session Tracking ───
const sessions = new Map();
const actionCounters = new Map();

// ─── Initialize serverOpenDate ───
if (!config.serverOpenDate) {
    config.serverOpenDate = Date.now();
    logger.log('INFO', 'CONFIG', `serverOpenDate auto-initialized: ${config.serverOpenDate}`);
}

// ─── Resource JSON Loader ───
const resourceCache = {};

function loadResource(name) {
    if (resourceCache[name]) return resourceCache[name];
    try {
        const filePath = path.join(config.resourcePath, name + '.json');
        const raw = require('fs').readFileSync(filePath, 'utf-8');
        const data = JSON.parse(raw);
        resourceCache[name] = data;
        logger.log('INFO', 'CONFIG', `Resource loaded: ${chalk.cyan(name + '.json')}`);
        logger.details('resource',
            ['entries', String(Object.keys(data).length)],
            ['bytes', String(raw.length)],
            ['path', filePath]
        );
        return data;
    } catch (err) {
        logger.log('WARN', 'CONFIG', `Resource NOT found: ${chalk.cyan(name + '.json')}`);
        logger.details('error',
            ['path', config.resourcePath],
            ['reason', err.message]
        );
        return null;
    }
}

// Pre-load critical resources
logger.headerThin('LOADING RESOURCES');
const constantJson = loadResource('constant');
const heroJson = loadResource('hero');
const summonJson = loadResource('summon');

// Pre-load hero attribute config (used by hero/getAttrs handler)
const heroLevelAttrJson = loadResource('heroLevelAttr');
const heroTypeParamJson = loadResource('heroTypeParam');
const heroQualityParamJson = loadResource('heroQualityParam');

// Pre-load heroPower config (used by hero/getAttrs power calculation)
// heroPower.json: 31 attr weights per heroType for combat power formula
const heroPowerJson = loadResource('heroPower');

// Pre-load zPower config (used by zPower cost feature — L84802)
const zPowerQualityParaJson = loadResource('zPowerQualityPara');

// Warn if critical resources are missing
if (!constantJson) {
    logger.log('ERROR', 'CONFIG', chalk.red('CRITICAL: constant.json is MISSING') + ' — defaults will be used');
}
if (!heroJson) {
    logger.log('ERROR', 'CONFIG', chalk.red('CRITICAL: hero.json is MISSING') + ' — starter hero will be minimal');
}
if (!summonJson) {
    logger.log('WARN', 'CONFIG', chalk.yellow('WARNING: summon.json is MISSING') + ' — summon defaults will be used');
}
if (!heroLevelAttrJson) {
    logger.log('WARN', 'CONFIG', chalk.yellow('WARNING: heroLevelAttr.json is MISSING') + ' — getAttrs will fail');
}
if (!heroTypeParamJson) {
    logger.log('WARN', 'CONFIG', chalk.yellow('WARNING: heroTypeParam.json is MISSING') + ' — getAttrs will fail');
}
if (!heroQualityParamJson) {
    logger.log('WARN', 'CONFIG', chalk.yellow('WARNING: heroQualityParam.json is MISSING') + ' — getAttrs will fail');
}
if (!zPowerQualityParaJson) {
    logger.log('WARN', 'CONFIG', chalk.yellow('WARNING: zPowerQualityPara.json is MISSING') + ' — zPower cost feature will fail');
}
if (!heroPowerJson) {
    logger.log('WARN', 'CONFIG', chalk.red('WARNING: heroPower.json is MISSING') + ' — getAttrs power=0 for all heroes');
}
logger.headerEnd();

// ─── UUID Generator ───
const { v4: uuidv4 } = require('uuid');

// ═══════════════════════════════════════════════════════════════
// SAFE JSON STRINGIFY — with circular reference detection
// ═══════════════════════════════════════════════════════════════

/**
 * Safe JSON.stringify that catches circular references and reports which field caused it.
 * Returns { json: string|null, error: Error|null, circularField: string|null }
 */
function safeStringify(obj, label) {
    try {
        const json = JSON.stringify(obj);
        return { json, error: null, circularField: null };
    } catch (err) {
        logger.log('ERROR', 'COMPRESS', `[safeStringify] FAILED for "${label}": ${err.message}`);

        // Identify which top-level field causes the circular reference
        if (obj && typeof obj === 'object') {
            const keys = Object.keys(obj);
            for (const key of keys) {
                try {
                    JSON.stringify(obj[key]);
                } catch (innerErr) {
                    logger.log('ERROR', 'COMPRESS', `[safeStringify] Circular ref in field: "${key}"`);
                    logger.details('field',
                        ['name', key],
                        ['type', typeof obj[key]],
                        ['error', innerErr.message]
                    );

                    // Try to go one level deeper
                    if (obj[key] && typeof obj[key] === 'object') {
                        const subKeys = Object.keys(obj[key]);
                        for (const subKey of subKeys) {
                            try {
                                JSON.stringify(obj[key][subKey]);
                            } catch (deepErr) {
                                logger.details('nested',
                                    ['path', `${key}.${subKey}`],
                                    ['error', deepErr.message]
                                );
                            }
                        }
                    }

                    return { json: null, error: err, circularField: key };
                }
            }
        }

        return { json: null, error: err, circularField: null };
    }
}

// ═══════════════════════════════════════════════════════════════
// RESPONSE BUILDER
// ═══════════════════════════════════════════════════════════════

function buildResponse(ret, data, compress) {
    return {
        ret: ret,
        data: typeof data === 'string' ? data : JSON.stringify(data),
        compress: compress || false,
        serverTime: Date.now(),
        server0Time: config.server0Time
    };
}

function buildErrorResponse(errorCode) {
    return buildResponse(errorCode, '', false);
}

/**
 * Build data response with circular reference safety.
 * [FIX-003] Added safeStringify with detailed error reporting.
 */
function buildDataResponse(ret, dataObj) {
    const result = safeStringify(dataObj, 'buildDataResponse');

    if (result.error) {
        logger.log('ERROR', 'COMPRESS', chalk.red(`CANNOT stringify — circular ref in: ${result.circularField || 'unknown'}`));
        logger.log('ERROR', 'COMPRESS', 'Returning error response ret=1 to prevent server crash');

        // Try to strip the problematic field and retry
        if (result.circularField && dataObj[result.circularField]) {
            logger.log('WARN', 'COMPRESS', `Attempting to strip field "${result.circularField}" and retry...`);
            const backup = dataObj[result.circularField];
            delete dataObj[result.circularField];

            const retry = safeStringify(dataObj, 'buildDataResponse (after strip)');
            if (retry.json) {
                logger.log('WARN', 'COMPRESS', chalk.yellow(`SUCCESS after stripping "${result.circularField}" — response incomplete`));
                dataObj[result.circularField] = backup;

                if (retry.json.length > config.compressionThreshold) {
                    const compressed = LZString.compressToUTF16(retry.json);
                    const reduction = Math.round((1 - compressed.length / retry.json.length) * 100);
                    logger.details('compress',
                        ['original', retry.json.length + ' chars'],
                        ['compressed', compressed.length + ' chars'],
                        ['reduction', reduction + '%']
                    );
                    return buildResponse(ret, compressed, true);
                }
                return buildResponse(ret, retry.json, false);
            }

            dataObj[result.circularField] = backup;
        }

        return buildErrorResponse(1);
    }

    const jsonStr = result.json;
    if (jsonStr.length > config.compressionThreshold) {
        const compressed = LZString.compressToUTF16(jsonStr);
        const reduction = Math.round((1 - compressed.length / jsonStr.length) * 100);
        logger.log('DEBUG', 'COMPRESS', `Compressing response data...`);
        logger.details('compress',
            ['original', jsonStr.length + ' chars'],
            ['compressed', compressed.length + ' chars'],
            ['reduction', reduction + '%'],
            ['threshold', config.compressionThreshold + ' chars']
        );
        return buildResponse(ret, compressed, true);
    }
    return buildResponse(ret, jsonStr, false);
}

// ═══════════════════════════════════════════════════════════════
// SDK-SERVER API HELPERS
// ═══════════════════════════════════════════════════════════════

const http = require('http');

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

        logger.log('DEBUG', 'SDKAPI', `HTTP GET → http://127.0.0.1:9999/user/info/${userId.substring(0, 16)}...`);

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                const duration = Date.now() - startTime;
                if (res.statusCode === 200) {
                    try {
                        const data = JSON.parse(body);
                        logger.log('INFO', 'SDKAPI', chalk.green(`User verified via SDK-Server`));
                        logger.details('response',
                            ['userId', userId],
                            ['httpStatus', String(res.statusCode)],
                            ['bodySize', String(body.length) + ' bytes'],
                            ['duration', duration + 'ms']
                        );
                        resolve(data);
                    } catch (err) {
                        logger.log('WARN', 'SDKAPI', `SDK-Server response parse failed: ${err.message}`);
                        logger.details('error',
                            ['body', body.substring(0, 200)],
                            ['duration', duration + 'ms']
                        );
                        resolve(null);
                    }
                } else {
                    logger.log('WARN', 'SDKAPI', chalk.yellow(`SDK-Server user not found: HTTP ${res.statusCode}`));
                    logger.details('response',
                        ['userId', userId],
                        ['httpStatus', String(res.statusCode)],
                        ['duration', duration + 'ms']
                    );
                    resolve(null);
                }
            });
        });

        req.on('error', (err) => {
            const duration = Date.now() - startTime;
            logger.errorWithStack('SDKAPI', `SDK-Server verify failed`, err);
            logger.log('DEBUG', 'SDKAPI', '  → Is SDK-Server running on port 9999?');
            logger.details('error',
                ['duration', duration + 'ms'],
                ['code', err.code || '?']
            );
            resolve(null);
        });

        req.on('timeout', () => {
            logger.log('ERROR', 'SDKAPI', chalk.red('SDK-Server TIMEOUT (5000ms)'));
            req.destroy();
        });
        req.end();
    });
}

// ═══════════════════════════════════════════════════════════════
// LOGIN-TOKEN VALIDATION
// ═══════════════════════════════════════════════════════════════

async function validateLoginToken(loginToken, userId) {
    if (!loginToken || !userId) {
        logger.log('WARN', 'VALIDATE', 'Missing loginToken or userId');
        return false;
    }
    const userInfo = await verifyUserWithSDKServer(userId);
    if (!userInfo) {
        logger.log('WARN', 'VALIDATE', `SDK-Server returned null for userId=${userId}`);
        return false;
    }
    if (userInfo.loginToken !== loginToken) {
        logger.log('WARN', 'VALIDATE', `loginToken mismatch for userId=${userId}`);
        logger.details('compare',
            ['expected', (loginToken || '').substring(0, 16) + '...'],
            ['got', (userInfo.loginToken || '').substring(0, 16) + '...']
        );
        return false;
    }
    logger.log('DEBUG', 'VALIDATE', `Token validated OK for userId=${userId}`);
    return true;
}

// ═══════════════════════════════════════════════════════════════
// ACTION ROUTER — Multi-type support
// ═══════════════════════════════════════════════════════════════

// Handler registry: { type: { action: handlerFn } }
const ACTION_HANDLERS = {
    user: {
        enterGame: enterGame,
        registChat: registChat,
        getBulletinBrief: bulletinHandlers.getBulletinBrief,
        readBulletin: bulletinHandlers.readBulletin
    },
    friend: {
        friendServerAction: friendServerAction
    },
    heroImage: {
        getAll: heroImageGetAll
    },
    hero: {
        getAttrs: heroGetAttrs
    },
    userMsg: {
        getMsgList: userMsgGetMsgList,
        getMsg: userMsgGetMsg,
        sendMsg: userMsgSendMsg,
        readMsg: userMsgReadMsg,
        delFriendMsg: userMsgDelFriendMsg
    },
    guide: {
        saveGuide: guideSaveGuide
    },
    hangup: {
        saveGuideTeam: hangupSaveGuideTeam,
        checkBattleResult: hangupCheckBattleResult
    },
    buryPoint: {
        guideBattle: buryPointGuideBattle
    },
    summon: {
        summonOneFree: summonOneFree
    }
};

// ═══════════════════════════════════════════════════════════════
// SOCKET.IO CONNECTION HANDLER
// ═══════════════════════════════════════════════════════════════

io.on('connection', (socket) => {
    const socketId = socket.id;
    const clientIp = socket.handshake.address || 'unknown';
    const transport = socket.conn.transport.name || socket.handshake.query.transport || 'polling';

    // Initialize session
    sessions.set(socketId, {
        userId: null,
        verified: false,
        challenge: null,
        connectedAt: Date.now(),
        ip: clientIp,
        transport: transport
    });
    actionCounters.set(socketId, 0);

    logger.socketEvent('connect', socketId, clientIp, transport);
    logger.details('session',
        ['socketId', socketId],
        ['ip', clientIp],
        ['transport', transport],
        ['totalSessions', String(sessions.size)],
        ['activeUsers', String([...sessions.values()].filter(s => s.userId).length)]
    );

    // ─── TEA HANDSHAKE ───
    const challenge = uuidv4();
    const session = sessions.get(socketId);
    session.challenge = challenge;

    logger.log('INFO', 'TEA', `Sending verify challenge`);
    logger.details('challenge',
        ['challenge', challenge],
        ['socketId', socketId.substring(0, 16) + '...']
    );

    socket.emit('verify', challenge);

    // Handle TEA verify response
    socket.on('verify', (encrypted, callback) => {
        const startTime = Date.now();

        if (typeof callback !== 'function') {
            logger.log('WARN', 'TEA', `Verify callback missing — disconnecting`);
            socket.disconnect();
            return;
        }

        logger.log('DEBUG', 'TEA', `[verify] Received encrypted response`);
        logger.details('input',
            ['type', typeof encrypted],
            ['length', encrypted ? String(encrypted.length) : '0']
        );

        let decrypted = '';
        try {
            decrypted = tea.decrypt(encrypted, config.teaKey);
        } catch (err) {
            logger.errorWithStack('TEA', `Decrypt failed`, err);
            logger.details('input',
                ['type', typeof encrypted],
                ['length', encrypted ? String(encrypted.length) : '0']
            );
            callback({ ret: 38 });
            socket.disconnect();
            return;
        }

        const currentSession = sessions.get(socketId);
        const duration = Date.now() - startTime;

        if (decrypted === currentSession.challenge) {
            currentSession.verified = true;
            logger.log('INFO', 'TEA', chalk.green.bold('TEA verification SUCCESS'));
            logger.details('result',
                ['socketId', socketId.substring(0, 16) + '...'],
                ['duration', duration + 'ms'],
                ['transport', socket.conn.transport.name]
            );
            callback({ ret: 0 });
        } else {
            logger.log('WARN', 'TEA', chalk.red.bold('TEA verification FAILED — challenge mismatch'));
            logger.details('compare',
                ['expected', currentSession.challenge.substring(0, 24) + '...'],
                ['got', decrypted.substring(0, 24) + '...'],
                ['duration', duration + 'ms']
            );
            callback({ ret: 38 });
            socket.disconnect();
        }
    });

    // ─── handler.process ───
    socket.on('handler.process', async (request, callback) => {
        const handlerStart = Date.now();
        const actionCounter = (actionCounters.get(socketId) || 0) + 1;
        actionCounters.set(socketId, actionCounter);

        const action = request.action || 'UNKNOWN';
        const actionType = request.type || '';
        const fullAction = actionType ? `${actionType}::${action}` : action;

        // ─── REQUEST LOG ───
        logger.actionLog('req', fullAction, 'OK');
        logger.details('request',
            ['action', action],
            ['type', actionType],
            ['userId', (request.userId || '?').substring(0, 20)],
            ['counter', String(actionCounter)],
            ['serverId', String(request.serverId || '?')]
        );
        logger.requestDump(request);

        // Validate: socket must be TEA-verified
        const currentSession = sessions.get(socketId);
        if (!currentSession || !currentSession.verified) {
            logger.log('WARN', 'HANDLER', chalk.red('Socket not TEA-verified') + ' → ret=38');
            if (typeof callback === 'function') {
                callback(buildErrorResponse(38));
            }
            return;
        }

        // Find handler by type + action
        const typeHandlers = ACTION_HANDLERS[actionType];
        if (!typeHandlers) {
            logger.log('WARN', 'HANDLER', chalk.yellow(`Unknown type`) + ` "${actionType}" — no handlers registered for this type`);
            logger.details('registered',
                ['types', Object.keys(ACTION_HANDLERS).join(', ')],
                ['action', action]
            );
            if (typeof callback === 'function') {
                callback(buildErrorResponse(4));
            }
            return;
        }

        const handler = typeHandlers[action];
        if (!handler) {
            logger.log('WARN', 'HANDLER', chalk.yellow(`Unknown action`) + ` "${actionType}::${action}"`);
            logger.details('available',
                ['actions', Object.keys(typeHandlers).join(', ')],
                ['requested', action]
            );
            if (typeof callback === 'function') {
                callback(buildErrorResponse(4));
            }
            return;
        }

        // Track userId in session
        if (request.userId) {
            currentSession.userId = request.userId;
        }

        try {
            const ctx = {
                db,
                config,
                logger,
                socket,
                session: currentSession,
                validateLoginToken,
                verifyUserWithSDKServer,
                uuidv4,
                loadResource,
                constantJson,
                heroJson,
                summonJson,
                buildDataResponse,
                buildErrorResponse
            };

            const response = await handler(request, ctx);
            const handlerDuration = Date.now() - handlerStart;

            // ─── RESPONSE LOG ───
            const dataLen = typeof response.data === 'string' ? response.data.length : 0;
            const isCompressed = response.compress || false;
            logger.actionLog('res', fullAction, response.ret === 0 ? 'OK' : 'ERR', null,
                `ret=${response.ret} ${dataLen} chars ${isCompressed ? '(LZ)' : '(raw)'} ${handlerDuration}ms`);
            logger.responseSummary(response.ret, dataLen, isCompressed, handlerDuration);
            logger.timing('handler', handlerStart);

            if (typeof callback === 'function') {
                callback(response);
            }
        } catch (err) {
            const handlerDuration = Date.now() - handlerStart;
            logger.errorWithStack('HANDLER', `Action "${fullAction}" threw UNHANDLED error`, err);
            logger.details('error',
                ['name', err.name],
                ['message', err.message],
                ['duration', handlerDuration + 'ms']
            );
            if (typeof callback === 'function') {
                callback(buildErrorResponse(1));
            }
        }
    });

    // ─── Socket Disconnect ───
    socket.on('disconnect', (reason) => {
        const s = sessions.get(socketId);
        const userId = (s && s.userId) ? s.userId : 'unknown';
        const aliveMs = s ? Date.now() - s.connectedAt : 0;
        const verified = s ? s.verified : false;
        const actionCount = actionCounters.get(socketId) || 0;

        logger.socketEvent('disconnect', socketId, s ? s.ip : '?', s ? s.transport : '?',
            `reason=${reason}`);
        logger.details('session',
            ['userId', userId.substring(0, 20)],
            ['alive', aliveMs + 'ms'],
            ['actions', String(actionCount)],
            ['verified', String(verified)],
            ['reason', reason]
        );

        sessions.delete(socketId);
        actionCounters.delete(socketId);
    });

    // ─── Transport upgrade ───
    socket.conn.on('upgrade', (transport) => {
        const s = sessions.get(socketId);
        if (s) {
            s.transport = transport.name;
        }
        logger.log('DEBUG', 'SOCKET', `Transport upgraded → ${chalk.cyan(transport.name)}`);
        logger.details('upgrade',
            ['socketId', socketId.substring(0, 16) + '...'],
            ['from', 'polling'],
            ['to', transport.name]
        );
    });
});

// ═══════════════════════════════════════════════════════════════
// SERVER STARTUP
// ═══════════════════════════════════════════════════════════════

logger.header('SUPER WARRIOR Z — MAIN SERVER');

console.log('');
logger.table([
    ['Port', String(config.port)],
    ['Socket.IO', '2.5.1'],
    ['TEA', 'ON (verification)'],
    ['DB', path.join(__dirname, 'data', 'main_server.json')],
    ['SDK API', config.sdkServerUrl],
    ['server0Time', String(config.server0Time)],
    ['serverOpenDate', String(config.serverOpenDate)],
    ['resourcePath', config.resourcePath],
    ['chatUrl', config.chatUrl || '(none)'],
    ['dungeonUrl', config.dungeonUrl || '(none)'],
    ['LOG_LEVEL', process.env.LOG_LEVEL || 'INFO']
]);

logger.headerEnd();

// Log resource status
logger.log('INFO', 'CONFIG', chalk.bold('Resource JSON status:'));
logger.table([
    ['constant.json', constantJson ? chalk.green(`${Object.keys(constantJson).length} entries`) : chalk.red('MISSING')],
    ['hero.json', heroJson ? chalk.green(`${Object.keys(heroJson).length} entries`) : chalk.red('MISSING')],
    ['summon.json', summonJson ? chalk.green(`${Object.keys(summonJson).length} entries`) : chalk.yellow('MISSING')],
    ['heroLevelAttr.json', heroLevelAttrJson ? chalk.green(`${Object.keys(heroLevelAttrJson).length} entries`) : chalk.yellow('MISSING')],
    ['heroTypeParam.json', heroTypeParamJson ? chalk.green(`${Object.keys(heroTypeParamJson).length} entries`) : chalk.yellow('MISSING')],
    ['heroQualityParam.json', heroQualityParamJson ? chalk.green(`${Object.keys(heroQualityParamJson).length} entries`) : chalk.yellow('MISSING')],
    ['zPowerQualityPara.json', zPowerQualityParaJson ? chalk.green(`${Object.keys(zPowerQualityParaJson).length} entries`) : chalk.yellow('MISSING')],
    ['heroPower.json', heroPowerJson ? chalk.green(`${Object.keys(heroPowerJson).length} entries`) : chalk.red('MISSING')]
]);

logger.separator('═');

// Log registered handlers
console.log('');
logger.log('INFO', 'HANDLER', chalk.bold('Registered action handlers:'));
console.log('');
let totalHandlers = 0;
const types = Object.keys(ACTION_HANDLERS);
for (let t = 0; t < types.length; t++) {
    const type = types[t];
    const actions = Object.keys(ACTION_HANDLERS[type]);
    for (let a = 0; a < actions.length; a++) {
        totalHandlers++;
        const isLastAction = (a === actions.length - 1);
        const isLastType = (t === types.length - 1);
        const isVeryLast = isLastAction && isLastType;

        const connector = isVeryLast ? '└' : '├';
        const branch = isLastAction && !isLastType ? '│ ' : '  ';
        const icon = isVeryLast ? chalk.green('>>') : chalk.cyan('>>');
        const typeStr = chalk.magenta(type);
        const actionStr = chalk.white(actions[a]);
        const handlerPath = chalk.gray('handlers/' + type + '/' + actions[a] + '.js');

        console.log(`  ${connector} ${icon} ${typeStr}::${actionStr}  ${handlerPath}`);
    }
}
console.log('');
logger.details('handlers', ['total', String(totalHandlers)]);

logger.headerEnd();

console.log('');
logger.log('INFO', 'SERVER', chalk.green.bold(`Ready — listening on http://127.0.0.1:${config.port}`));
logger.log('INFO', 'SERVER', `Waiting for Socket.IO connections...`);
console.log('');
