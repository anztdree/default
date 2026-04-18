'use strict';

/**
 * =====================================================
 *  activity/hero/newHeroChallengeQueryWinRank.js
 *  Super Warrior Z Game Server — Main Server
 *
 *  ACTION: newHeroChallengeQueryWinRank
 *  DESC: Query win rank for new hero challenge
 *  TYPE: WRITE
 *
 *  CLIENT REQUEST:
 *    { type:"activity", action:"newHeroChallengeQueryWinRank", actId, userId, topn }
 *
 *  CLIENT SOURCE: headItem tap (line 100136)
 *
 *  RESPONSE (Universal):
 *    { _changeInfo: { _items: {...} },
 *      _addHeroes: {...}, _addSigns: {...},
 *      _addWeapons: {...}, _addStones: {...}, _addGenkis: {...} }
 *
 *  STATUS: TODO
 * =====================================================
 */

var RH = require('../../../../shared/responseHelper');
var logger = require('../../../../shared/utils/logger');

function handle(socket, parsed, callback) {
    var userId = parsed.userId;
    logger.info('ACTIVITY', 'newHeroChallengeQueryWinRank' + ' userId=' + userId);

    // TODO: Implement business logic

    callback(RH.success({}));
}

module.exports = { handle: handle };
