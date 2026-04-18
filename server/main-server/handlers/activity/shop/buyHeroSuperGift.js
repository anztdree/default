'use strict';

/**
 * =====================================================
 *  activity/shop/buyHeroSuperGift.js
 *  Super Warrior Z Game Server — Main Server
 *
 *  ACTION: buyHeroSuperGift
 *  DESC: Purchase hero super gift pack
 *  TYPE: WRITE
 *
 *  CLIENT REQUEST:
 *    { type:"activity", action:"buyHeroSuperGift", userId, actId, itemId, version }
 *
 *  CLIENT SOURCE: buyBtnTap() (line 97032)
 *
 *  STATUS: TODO
 * =====================================================
 */

var RH = require('../../../../shared/responseHelper');
var logger = require('../../../../shared/utils/logger');

function handle(socket, parsed, callback) {
    var userId = parsed.userId;
    logger.info('ACTIVITY', 'buyHeroSuperGift' + ' userId=' + userId);

    // TODO: Implement business logic

    callback(RH.success({}));
}

module.exports = { handle: handle };
