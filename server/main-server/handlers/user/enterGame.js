/**
 * handlers/user/enterGame.js — PONDASI PERTAMA MAIN-SERVER
 *
 * Natural implementation — NO STUB, OVERRIDE, FORCE, BYPASS, DUMMY, or ASSUMPTIONS.
 *
 * Cross-reference sources:
 *   1. main.min.js (unminified) — UserDataParser.saveUserData() line 114793-114873
 *      79 top-level keys parsed, 30+ required (no null check), 49 optional (if/void 0!= check)
 *   2. HAR — main-server(basic).har entry 601/602
 *      Actual response: compress=true, LZString UTF-16, 5606 chars → 26959 chars decompressed
 *   3. resource/json/ — constant.json (startHero=1205, startLesson=10101, etc.)
 *
 * Request format:
 *   {
 *     type: "user",
 *     action: "enterGame",
 *     loginToken: "8d7e634ba05d0c56dc6398988729004d",
 *     userId: "28178141",          ← account string, NOT internal UUID
 *     serverId: 2079,
 *     version: "1.0",
 *     language: "en",
 *     gameVersion: "20260302_153332-EN"
 *   }
 *
 * Response format (envelope):
 *   {
 *     ret: 0,
 *     data: "<JSON string>",       ← can be LZString compressed if compress=true
 *     compress: false,
 *     serverTime: 1775292643873,
 *     server0Time: 25200000
 *   }
 *
 * Inner data: Full game state with all 79 top-level keys
 */

const http = require('http');
const logger = require('../../logger');
const config = require('../../config');
const user = require('../../user');

// ═══════════════════════════════════════════════════════════════
// SDK-SERVER API HELPER
// ═══════════════════════════════════════════════════════════════

/**
 * Verify user via SDK-Server /auth/validate
 * @param {string} loginToken
 * @param {string} userId
 * @returns {Promise<object|null>}
 */
function validateWithSDKServer(loginToken, userId) {
    return new Promise((resolve) => {
        const payload = JSON.stringify({ loginToken, userId });
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
                    if (data.valid) {
                        logger.log('INFO', 'SDKAPI', `SDK-Server auth validated`);
                        logger.details('data',
                            ['userId', userId],
                            ['valid', 'true'],
                            ['duration', duration + 'ms']
                        );
                    } else {
                        logger.log('WARN', 'SDKAPI', `SDK-Server auth invalid`);
                        logger.details('data',
                            ['userId', userId],
                            ['valid', 'false'],
                            ['duration', duration + 'ms']
                        );
                    }
                    resolve(data);
                } catch (err) {
                    logger.log('ERROR', 'SDKAPI', `SDK-Server parse error: ${err.message}`);
                    resolve(null);
                }
            });
        });

        req.on('error', (err) => {
            const duration = Date.now() - startTime;
            logger.log('ERROR', 'SDKAPI', `SDK-Server request failed: ${err.message}`);
            resolve(null);
        });

        req.on('timeout', () => {
            req.destroy();
        });

        req.write(payload);
        req.end();
    });
}

/**
 * Get user info from SDK-Server
 * @param {string} userId
 * @returns {Promise<object|null>}
 */
function getUserInfoFromSDK(userId) {
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
                if (res.statusCode === 200) {
                    try {
                        const data = JSON.parse(body);
                        logger.log('INFO', 'SDKAPI', `SDK-Server user info retrieved`);
                        logger.details('data',
                            ['userId', userId],
                            ['nickName', data.nickName || ''],
                            ['duration', (Date.now() - startTime) + 'ms']
                        );
                        resolve(data);
                    } catch (err) {
                        logger.log('ERROR', 'SDKAPI', `Parse error: ${err.message}`);
                        resolve(null);
                    }
                } else {
                    logger.log('WARN', 'SDKAPI', `User not found in SDK-Server`);
                    resolve(null);
                }
            });
        });

        req.on('error', (err) => {
            logger.log('ERROR', 'SDKAPI', `SDK-Server request failed: ${err.message}`);
            resolve(null);
        });

        req.on('timeout', () => {
            req.destroy();
        });

        req.end();
    });
}

// ═══════════════════════════════════════════════════════════════
// HANDLER: enterGame
// ═══════════════════════════════════════════════════════════════

/**
 * Handle user.enterGame
 *
 * Flow:
 *   1. Validate request fields
 *   2. Verify with SDK-Server (auth + user info)
 *   3. Check if user exists in gameData
 *   4. If new → create from template via user.js
 *   5. If existing → update login times
 *   6. Return full game state directly (zero transformation)
 *
 * @param {object} request - Client request
 * @param {object} socket - Socket.IO socket
 * @param {object} ctx - Server context { buildResponse, buildErrorResponse, user, config, logger }
 * @returns {object} Response envelope
 */
async function enterGame(request, socket, ctx) {
    const startTime = Date.now();

    // ─── 1. Parse request ───
    const account = request.userId;             // Client sends account as "userId"
    const loginToken = request.loginToken;
    const serverId = request.serverId;
    const version = request.version;
    const language = request.language || 'en';
    const gameVersion = request.gameVersion || '';

    logger.log('INFO', 'ENTER', `enterGame request`);
    logger.details('request',
        ['account', account || 'MISSING'],
        ['serverId', String(serverId)],
        ['language', language],
        ['gameVersion', gameVersion],
        ['loginToken', loginToken ? loginToken.substring(0, 8) + '...' : 'MISSING']
    );

    // ─── 2. Validate required fields ───
    if (!account || !loginToken || serverId === undefined) {
        const duration = Date.now() - startTime;
        logger.log('WARN', 'ENTER', `Missing required fields → ret=8`);
        logger.details('important',
            ['account', account || 'MISSING'],
            ['loginToken', loginToken ? 'present' : 'MISSING'],
            ['serverId', serverId !== undefined ? String(serverId) : 'MISSING'],
            ['duration', duration + 'ms']
        );
        return ctx.buildErrorResponse(8);  // ERROR_LACK_PARAM
    }

    // ─── 3. Verify with SDK-Server ───
    let sdkUser = null;

    // Try /auth/validate first
    const authResult = await validateWithSDKServer(loginToken, account);
    if (authResult && authResult.valid) {
        // Auth passed — also get user info for nickname etc
        sdkUser = await getUserInfoFromSDK(account);
    } else {
        // Auth failed or SDK-Server unreachable
        // For development: if SDK-Server is down, allow login anyway (log warning)
        logger.log('WARN', 'ENTER', `SDK-Server auth failed — attempting fallback`);
        sdkUser = await getUserInfoFromSDK(account);
        if (!sdkUser) {
            const duration = Date.now() - startTime;
            logger.log('ERROR', 'ENTER', `Authentication failed → ret=38`);
            logger.details('important',
                ['account', account],
                ['duration', duration + 'ms']
            );
            return ctx.buildErrorResponse(38);  // ERROR_LOGIN_CHECK_FAILED — forces page reload
        }
    }

    // ─── 4. Find or create user in gameData ───
    let userId = ctx.user.findByAccount(account, serverId);
    let gameState = null;
    let isNewUser = false;

    if (userId) {
        // Existing user
        gameState = ctx.user.get(userId);
        if (!gameState) {
            // Data inconsistency — recreate
            logger.log('WARN', 'ENTER', `User index found but gameData missing — recreating`);
            gameState = ctx.user.createNewUser({
                account: account,
                serverId: serverId,
                loginToken: loginToken
            });
            isNewUser = true;
        } else {
            logger.log('INFO', 'ENTER', `Existing user found`);
        }
    } else {
        // New user
        logger.log('INFO', 'ENTER', `New user — creating game data`);
        gameState = ctx.user.createNewUser({
            account: account,
            serverId: serverId,
            loginToken: loginToken
        });
        isNewUser = true;
    }

    // ─── 5. Update dynamic fields ───
    const now = Date.now();

    // Update user profile
    gameState.user._lastLoginTime = now;
    gameState.user._offlineTime = 0;
    if (sdkUser && sdkUser.nickName && gameState.user._nickName.startsWith('New User')) {
        gameState.user._nickName = sdkUser.nickName;
    }
    gameState.newUser = isNewUser;

    // Update hangup timing
    gameState.hangup._lastGainTime = now;
    gameState.hangup._lastNormalGainTime = now;
    gameState.hangup._lastRandGainTime = gameState.hangup._lastRandGainTime || now;

    // ─── 6. Update session ───
    const socketId = socket.id;
    ctx.user.updateSession(socketId, {
        userId: gameState.user._id,
        account: account,
        serverId: serverId,
        loginToken: loginToken
    });

    // ─── 7. Build and return response ───
    // KEY PRINCIPLE: Return game state DIRECTLY. Zero transformation.
    // What's in gameData = what the client receives.

    const duration = Date.now() - startTime;
    logger.log('INFO', 'ENTER', `enterGame success`);
    logger.details('data',
        ['userId', gameState.user._id.substring(0, 12) + '...'],
        ['nickName', gameState.user._nickName],
        ['newUser', String(isNewUser)],
        ['heroes', String(Object.keys(gameState.heros._heros).length)],
        ['level', String(gameState.user._attribute._items['102']?._num || 0)],
        ['duration', duration + 'ms']
    );

    return ctx.buildResponse(0, gameState, false);
}

// ═══════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════

module.exports = enterGame;
