'use strict';

/**
 * =====================================================
 *  activity/hero/heroOrangeReward.js
 *  Super Warrior Z Game Server — Main Server
 *
 *  ACTION: heroOrangeReward
 *  DESC: Claim hero orange-quality upgrade reward
 *  TYPE: WRITE
 *
 *  CLIENT REQUEST:
 *    { type:"activity", action:"heroOrangeReward", actId, userId, pick, itemId }
 *
 *  CLIENT SOURCE: ActivitySetReward.heroOrangeReward() (line ~79577)
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
    logger.info('ACTIVITY', 'heroOrangeReward' + ' userId=' + userId);

    // TODO: Implement business logic

    callback(RH.success({}));
}

module.exports = { handle: handle };
