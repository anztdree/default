'use strict';

/**
 * =====================================================
 *  activity/shop/buyNewServerGift.js
 *  Super Warrior Z Game Server — Main Server
 *
 *  ACTION: buyNewServerGift
 *  DESC: Purchase new server exclusive gift pack
 *  TYPE: WRITE
 *
 *  CLIENT REQUEST:
 *    { type:"activity", action:"buyNewServerGift", actId, userId, pick, itemId, num }
 *
 *  CLIENT SOURCE: ActivitySetReward.buyNewServerGift() (line ~79577)
 *
 *  STATUS: TODO
 * =====================================================
 */

var RH = require('../../../../shared/responseHelper');
var logger = require('../../../../shared/utils/logger');

function handle(socket, parsed, callback) {
    var userId = parsed.userId;
    logger.info('ACTIVITY', 'buyNewServerGift' + ' userId=' + userId);

    // TODO: Implement business logic

    callback(RH.success({}));
}

module.exports = { handle: handle };
