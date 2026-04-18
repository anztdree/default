'use strict';

/**
 * =====================================================
 *  activity/imprint/handleRefreshImprintResult.js
 *  Super Warrior Z Game Server — Main Server
 *
 *  ACTION: handleRefreshImprintResult
 *  DESC: Process result of imprint refresh
 *  TYPE: WRITE
 *
 *  CLIENT REQUEST:
 *    { type:"activity", action:"handleRefreshImprintResult", actId, userId, imprintId, save }
 *
 *  CLIENT SOURCE: confirm/replace imprint (line 170304)
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
    logger.info('ACTIVITY', 'handleRefreshImprintResult' + ' userId=' + userId);

    // TODO: Implement business logic

    callback(RH.success({}));
}

module.exports = { handle: handle };
