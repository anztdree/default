'use strict';

/**
 * =====================================================
 *  activity/shop/newHeroRewardBuyGoods.js
 *  Super Warrior Z Game Server — Main Server
 *
 *  ACTION: newHeroRewardBuyGoods
 *  DESC: Buy goods from new hero reward shop
 *  TYPE: WRITE
 *
 *  CLIENT REQUEST:
 *    { type:"activity", action:"newHeroRewardBuyGoods", userId, actId, num, goodsId, version }
 *
 *  CLIENT SOURCE: ActivitySetReward.NewHeroReward() (line ~79577)
 *
 *  STATUS: TODO
 * =====================================================
 */

var RH = require('../../../../shared/responseHelper');
var logger = require('../../../../shared/utils/logger');

function handle(socket, parsed, callback) {
    var userId = parsed.userId;
    logger.info('ACTIVITY', 'newHeroRewardBuyGoods' + ' userId=' + userId);

    // TODO: Implement business logic

    callback(RH.success({}));
}

module.exports = { handle: handle };
