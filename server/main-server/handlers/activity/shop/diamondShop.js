'use strict';

/**
 * =====================================================
 *  activity/shop/diamondShop.js
 *  Super Warrior Z Game Server — Main Server
 *
 *  ACTION: diamondShop
 *  DESC: Buy from diamond-exclusive activity shop
 *  TYPE: WRITE
 *
 *  CLIENT REQUEST:
 *    { type:"activity", action:"diamondShop", userId, actId, itemId, version }
 *
 *  CLIENT SOURCE: buyBtnTap() (line 100693)
 *
 *  STATUS: TODO
 * =====================================================
 */

var RH = require('../../../../shared/responseHelper');
var logger = require('../../../../shared/utils/logger');

function handle(socket, parsed, callback) {
    var userId = parsed.userId;
    logger.info('ACTIVITY', 'diamondShop' + ' userId=' + userId);

    // TODO: Implement business logic

    callback(RH.success({}));
}

module.exports = { handle: handle };
