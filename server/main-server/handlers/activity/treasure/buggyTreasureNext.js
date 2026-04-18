'use strict';

/**
 * =====================================================
 *  activity/treasure/buggyTreasureNext.js
 *  Super Warrior Z Game Server — Main Server
 *
 *  ACTION: buggyTreasureNext
 *  DESC: Advance buggy treasure to next stage
 *  TYPE: WRITE
 *
 *  CLIENT REQUEST:
 *    { type:"activity", action:"buggyTreasureNext", actId, userId }
 *
 *  CLIENT SOURCE: goToNextBtnTap() (line 91594)
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
    logger.info('ACTIVITY', 'buggyTreasureNext' + ' userId=' + userId);

    // TODO: Implement business logic

    callback(RH.success({}));
}

module.exports = { handle: handle };
