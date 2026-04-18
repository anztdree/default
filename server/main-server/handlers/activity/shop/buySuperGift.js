'use strict';

/**
 * =====================================================
 *  activity/shop/buySuperGift.js
 *  Super Warrior Z Game Server — Main Server
 *
 *  ACTION: buySuperGift
 *  DESC: Purchase the super gift pack
 *  TYPE: WRITE
 *
 *  CLIENT REQUEST:
 *    { type:"activity", action:"buySuperGift", actId, userId, num, itemId }
 *
 *  CLIENT SOURCE: ActivitySetReward.superGiftReward() (line ~79577)
 *
 *  STATUS: TODO
 * =====================================================
 */

var RH = require('../../../../shared/responseHelper');
var logger = require('../../../../shared/utils/logger');

function handle(socket, parsed, callback) {
    var userId = parsed.userId;
    logger.info('ACTIVITY', 'buySuperGift' + ' userId=' + userId);

    // TODO: Implement business logic

    callback(RH.success({}));
}

module.exports = { handle: handle };
