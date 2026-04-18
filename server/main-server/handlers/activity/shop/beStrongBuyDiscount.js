'use strict';

/**
 * =====================================================
 *  activity/shop/beStrongBuyDiscount.js
 *  Super Warrior Z Game Server — Main Server
 *
 *  ACTION: beStrongBuyDiscount
 *  DESC: Purchase discounted item in be-strong event
 *  TYPE: WRITE
 *
 *  CLIENT REQUEST:
 *    { type:"activity", action:"beStrongBuyDiscount", actId, userId, day }
 *
 *  CLIENT SOURCE: ActivitySetReward.strongSpecialOffer() (line ~79577)
 *
 *  STATUS: TODO
 * =====================================================
 */

var RH = require('../../../../shared/responseHelper');
var logger = require('../../../../shared/utils/logger');

function handle(socket, parsed, callback) {
    var userId = parsed.userId;
    logger.info('ACTIVITY', 'beStrongBuyDiscount' + ' userId=' + userId);

    // TODO: Implement business logic

    callback(RH.success({}));
}

module.exports = { handle: handle };
