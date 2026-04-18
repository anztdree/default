'use strict';

/**
 * =====================================================
 *  activity/imprint/imprintExtraction.js
 *  Super Warrior Z Game Server — Main Server
 *
 *  ACTION: imprintExtraction
 *  DESC: Extract an imprint from the imprint pool
 *  TYPE: WRITE
 *
 *  CLIENT REQUEST:
 *    { type:"activity", action:"imprintExtraction", actId, userId, imprintIds[], version }
 *
 *  CLIENT SOURCE: extraction btn tap (line 94338)
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
    logger.info('ACTIVITY', 'imprintExtraction' + ' userId=' + userId);

    // TODO: Implement business logic

    callback(RH.success({}));
}

module.exports = { handle: handle };
