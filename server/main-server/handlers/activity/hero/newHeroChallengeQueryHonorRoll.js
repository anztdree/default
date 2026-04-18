'use strict';

/**
 * =====================================================
 *  activity/hero/newHeroChallengeQueryHonorRoll.js
 *  Super Warrior Z Game Server — Main Server
 *
 *  ACTION: newHeroChallengeQueryHonorRoll
 *  DESC: Query honor roll for new hero challenge
 *  TYPE: WRITE
 *
 *  CLIENT REQUEST:
 *    { type:"activity", action:"newHeroChallengeQueryHonorRoll", actId, userId }
 *
 *  CLIENT SOURCE: honorBtnTap() (line 100250)
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
    logger.info('ACTIVITY', 'newHeroChallengeQueryHonorRoll' + ' userId=' + userId);

    // TODO: Implement business logic

    callback(RH.success({}));
}

module.exports = { handle: handle };
