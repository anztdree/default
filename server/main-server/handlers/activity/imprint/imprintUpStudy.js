'use strict';

/**
 * =====================================================
 *  activity/imprint/imprintUpStudy.js
 *  Super Warrior Z Game Server — Main Server
 *
 *  ACTION: imprintUpStudy
 *  DESC: Study/activate an imprint upgrade skill
 *  TYPE: WRITE
 *
 *  CLIENT REQUEST:
 *    { type:"activity", action:"imprintUpStudy", actId, userId, imprintType, sellQuality[], times, version }
 *
 *  CLIENT SOURCE: SendLearnQuest() (line 97226)
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
    logger.info('ACTIVITY', 'imprintUpStudy' + ' userId=' + userId);

    // TODO: Implement business logic

    callback(RH.success({}));
}

module.exports = { handle: handle };
