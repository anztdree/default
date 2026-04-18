'use strict';

/**
 * =====================================================
 *  activity/shop/newHeroRewardPropExchange.js
 *  Super Warrior Z Game Server — Main Server
 *
 *  ACTION: newHeroRewardPropExchange
 *  DESC: Exchange props in new hero reward event
 *  TYPE: WRITE
 *
 *  CLIENT REQUEST:
 *    { type:"activity", action:"newHeroRewardPropExchange", userId, actId, num, propId, version }
 *
 *  CLIENT SOURCE: ActivitySetReward.NewHeroRewardExchange() (line ~79577)
 *
 *  STATUS: TODO
 * =====================================================
 */

var RH = require('../../../../shared/responseHelper');
var logger = require('../../../../shared/utils/logger');

function handle(socket, parsed, callback) {
    var userId = parsed.userId;
    logger.info('ACTIVITY', 'newHeroRewardPropExchange' + ' userId=' + userId);

    // TODO: Implement business logic

    callback(RH.success({}));
}

module.exports = { handle: handle };
