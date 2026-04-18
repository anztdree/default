'use strict';

/**
 * =====================================================
 *  activity/shop/buyTodayDiscount.js
 *  Super Warrior Z Game Server — Main Server
 *
 *  ACTION: buyTodayDiscount
 *  DESC: Purchase today-only discount item
 *  TYPE: WRITE
 *
 *  CLIENT REQUEST:
 *    { type:"activity", action:"buyTodayDiscount", actId, userId, itemId, batchId }
 *
 *  CLIENT SOURCE: ActivitySetReward.todayDiscount() (line ~79577)
 *
 *  STATUS: TODO
 * =====================================================
 */

var RH = require('../../../../shared/responseHelper');
var logger = require('../../../../shared/utils/logger');

function handle(socket, parsed, callback) {
    var userId = parsed.userId;
    logger.info('ACTIVITY', 'buyTodayDiscount' + ' userId=' + userId);

    // TODO: Implement business logic

    callback(RH.success({}));
}

module.exports = { handle: handle };
