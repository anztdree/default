'use strict';

/**
 * =====================================================
 *  activity/shop/heroHelpBuy.js
 *  Super Warrior Z Game Server — Main Server
 *
 *  ACTION: heroHelpBuy
 *  DESC: Purchase hero help/assist item
 *  TYPE: WRITE
 *
 *  CLIENT REQUEST:
 *    { type:"activity", action:"heroHelpBuy", actId, userId, itemId, heroIds }
 *
 *  CLIENT SOURCE: SureFunc() (line 92487)
 *
 *  STATUS: TODO
 * =====================================================
 */

var RH = require('../../../../shared/responseHelper');
var logger = require('../../../../shared/utils/logger');

function handle(socket, parsed, callback) {
    var userId = parsed.userId;
    logger.info('ACTIVITY', 'heroHelpBuy' + ' userId=' + userId);

    // TODO: Implement business logic

    callback(RH.success({}));
}

module.exports = { handle: handle };
