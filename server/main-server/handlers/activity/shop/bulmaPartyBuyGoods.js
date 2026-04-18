'use strict';

/**
 * =====================================================
 *  activity/shop/bulmaPartyBuyGoods.js
 *  Super Warrior Z Game Server — Main Server
 *
 *  ACTION: bulmaPartyBuyGoods
 *  DESC: Purchase goods from Bulma Party event shop
 *  TYPE: WRITE
 *
 *  CLIENT REQUEST:
 *    { type:"activity", action:"bulmaPartyBuyGoods", actId, userId, itemId }
 *
 *  CLIENT SOURCE: ActivitySetReward.bulmaPartyBuyGoods() (line ~79577)
 *
 *  STATUS: TODO
 * =====================================================
 */

var RH = require('../../../../shared/responseHelper');
var logger = require('../../../../shared/utils/logger');

function handle(socket, parsed, callback) {
    var userId = parsed.userId;
    logger.info('ACTIVITY', 'bulmaPartyBuyGoods' + ' userId=' + userId);

    // TODO: Implement business logic

    callback(RH.success({}));
}

module.exports = { handle: handle };
