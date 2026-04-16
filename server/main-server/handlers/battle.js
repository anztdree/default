/**
 * =====================================================
 *  Battle Handler — handlers/battle.js
 *  Super Warrior Z Game Server — Main Server (Port 8001)
 *
 *  CLIENT PROTOCOL (from main.min.js analysis):
 *
 *  type: "battle" actions:
 *    getRandom    → Generate batch random numbers for battle
 *                   REQ: count
 *                   RES: { _rand: number[] }
 *
 *  Catatan:
 *    Action seperti getBattleRecord, startBattle, battleResult,
 *    getDailyReward, getRecord TIDAK ada di sini karena client
 *    mengirim action tersebut via type lain (hangup, dungeon,
 *    arena, war, topBattle, dll) — masing-masing punya handler
 *    sendiri di folder handlers/.
 * =====================================================
 */

'use strict';

var RH = require('../../shared/responseHelper');
var logger = require('../../shared/utils/logger');

// =============================================
// ACTION HANDLERS
// =============================================

/**
 * getRandom — Generate batch random numbers for battle.
 *
 * CLIENT REQUEST:
 * {
 *   type: "battle",
 *   action: "getRandom",
 *   userId: string,
 *   battleId: string,
 *   count: number,
 *   version: "1.0"
 * }
 *
 * CLIENT RESPONSE:
 * {
 *   _rand: [number, number, ...]
 * }
 *
 * Client (BattleStatic.createBatchRandom) mengirim jumlah random
 * yang dibutuhkan via field 'count'. Server menghasilkan array
 * random sebanyak count dan mengembalikannya via field '_rand'.
 *
 * Tidak save ke DB — pure utility, stateless.
 */
function handleGetRandom(socket, parsed, callback) {
    var userId = parsed.userId;
    var battleId = parsed.battleId;
    var count = Number(parsed.count) || 0;

    logger.info('BATTLE', 'getRandom: userId=' + (userId || '-') +
        ', battleId=' + (battleId || '-') +
        ', count=' + count);

    if (count <= 0) {
        return callback(RH.error(RH.ErrorCode.LACK_PARAM, 'Missing count'));
    }

    // Generate random array
    var rand = [];
    for (var i = 0; i < count; i++) {
        rand.push(Math.random());
    }

    callback(RH.success({
        _rand: rand,
    }));
}

// =============================================
// MAIN ROUTER
// =============================================

/**
 * Main handler function — routes actions to specific handlers.
 *
 * Called by main-server/index.js:
 *   handler.handle(socket, parsedRequest, callback)
 *
 * @param {object} socket - Socket.IO socket instance
 * @param {object} parsed - Parsed request from ResponseHelper.parseRequest()
 *   { type, action, userId, ...params }
 * @param {function} callback - Socket.IO acknowledgment callback
 */
function handle(socket, parsed, callback) {
    var action = parsed.action;
    var userId = parsed.userId;

    if (!action) {
        return callback(RH.error(RH.ErrorCode.LACK_PARAM, 'Missing action'));
    }

    try {
        switch (action) {
            case 'getRandom':
                handleGetRandom(socket, parsed, callback);
                break;

            default:
                logger.warn('BATTLE', 'Unknown action: ' + action +
                    ' from userId=' + (userId || '-') + ', returning empty success');
                callback(RH.success({}));
                break;
        }
    } catch (err) {
        logger.error('BATTLE', 'Handler error for action=' + action + ': ' + err.message);
        logger.error('BATTLE', 'Stack: ' + err.stack);
        callback(RH.error(RH.ErrorCode.UNKNOWN, 'Internal server error'));
    }
}

module.exports = { handle: handle };
