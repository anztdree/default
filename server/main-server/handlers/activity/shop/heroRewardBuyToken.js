'use strict';

/**
 * =====================================================
 *  activity/shop/heroRewardBuyToken.js
 *  Super Warrior Z Game Server — Main Server
 *
 *  ACTION: heroRewardBuyToken
 *  DESC: Buy hero reward exchange token
 *  TYPE: WRITE
 *
 *  CLIENT REQUEST:
 *    { type:"activity", action:"heroRewardBuyToken", actId, userId, num }
 *
 *  CLIENT SOURCE: heroRewardBuyReward() (line 93239)
 *
 *  STATUS: TODO
 * =====================================================
 */

var RH = require('../../../../shared/responseHelper');
var logger = require('../../../../shared/utils/logger');

function handle(socket, parsed, callback) {
    var userId = parsed.userId;
    logger.info('ACTIVITY', 'heroRewardBuyToken' + ' userId=' + userId);

    // TODO: Implement business logic

    callback(RH.success({}));
}

module.exports = { handle: handle };
