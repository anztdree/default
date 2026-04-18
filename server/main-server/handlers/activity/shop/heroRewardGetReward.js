'use strict';

/**
 * =====================================================
 *  activity/shop/heroRewardGetReward.js
 *  Super Warrior Z Game Server — Main Server
 *
 *  ACTION: heroRewardGetReward
 *  DESC: Claim hero reward exchange item
 *  TYPE: WRITE
 *
 *  CLIENT REQUEST:
 *    { type:"activity", action:"heroRewardGetReward", actId, userId, itemId, normalToken }
 *
 *  CLIENT SOURCE: returnAwardTap() (line 98324)
 *
 *  STATUS: TODO
 * =====================================================
 */

var RH = require('../../../../shared/responseHelper');
var logger = require('../../../../shared/utils/logger');

function handle(socket, parsed, callback) {
    var userId = parsed.userId;
    logger.info('ACTIVITY', 'heroRewardGetReward' + ' userId=' + userId);

    // TODO: Implement business logic

    callback(RH.success({}));
}

module.exports = { handle: handle };
