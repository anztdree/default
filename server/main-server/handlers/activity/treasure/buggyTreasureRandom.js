'use strict';

/**
 * =====================================================
 *  activity/treasure/buggyTreasureRandom.js
 *  Super Warrior Z Game Server — Main Server
 *
 *  ACTION: buggyTreasureRandom
 *  DESC: Perform random buggy treasure pick
 *  TYPE: WRITE
 *
 *  CLIENT REQUEST:
 *    { type:"activity", action:"buggyTreasureRandom", actId, userId, x, y }
 *
 *  CLIENT SOURCE: box click (line 91653)
 *
 *  RESPONSE (Universal):
 *    { _changeInfo: { _items: {...} },
 *      _addHeroes: {...}, _addSigns: {...},
 *      _addWeapons: {...}, _addStones: {...}, _addGenkis: {...} }
 *
 *  STATUS: TODO
 * =====================================================
 */

var RH = require('../../../../shared/responseHelper');
var logger = require('../../../../shared/utils/logger');

function handle(socket, parsed, callback) {
    var userId = parsed.userId;
    logger.info('ACTIVITY', 'buggyTreasureRandom' + ' userId=' + userId);

    // TODO: Implement business logic

    callback(RH.success({}));
}

module.exports = { handle: handle };
