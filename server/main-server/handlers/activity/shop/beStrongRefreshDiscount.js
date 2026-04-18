'use strict';

/**
 * =====================================================
 *  activity/shop/beStrongRefreshDiscount.js
 *  Super Warrior Z Game Server — Main Server
 *
 *  ACTION: beStrongRefreshDiscount
 *  DESC: Refresh discount listings in be-strong event
 *  TYPE: WRITE
 *
 *  CLIENT REQUEST:
 *    { type:"activity", action:"beStrongRefreshDiscount", actId, userId, day }
 *
 *  CLIENT SOURCE: refreshItemBtnTap() (line 98923)
 *
 *  STATUS: TODO
 * =====================================================
 */

var RH = require('../../../../shared/responseHelper');
var logger = require('../../../../shared/utils/logger');

function handle(socket, parsed, callback) {
    var userId = parsed.userId;
    logger.info('ACTIVITY', 'beStrongRefreshDiscount' + ' userId=' + userId);

    // TODO: Implement business logic

    callback(RH.success({}));
}

module.exports = { handle: handle };
