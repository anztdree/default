'use strict';

/**
 * =====================================================
 *  activity/imprint/imprintUpGetReward.js
 *  Super Warrior Z Game Server — Main Server
 *
 *  ACTION: imprintUpGetReward
 *  DESC: Claim imprint upgrade level reward
 *  TYPE: WRITE
 *
 *  CLIENT REQUEST:
 *    { type:"activity", action:"imprintUpGetReward", actId, userId, itemId, pick }
 *
 *  CLIENT SOURCE: ActivitySetReward.signUpUp() (line ~79577)
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
    logger.info('ACTIVITY', 'imprintUpGetReward' + ' userId=' + userId);

    // TODO: Implement business logic

    callback(RH.success({}));
}

module.exports = { handle: handle };
