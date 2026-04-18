'use strict';

/**
 * =====================================================
 *  activity/treasure/karinRich.js
 *  Super Warrior Z Game Server — Main Server
 *
 *  ACTION: karinRich
 *  DESC: Open Karin rich reward chest
 *  TYPE: WRITE
 *
 *  CLIENT REQUEST:
 *    { type:"activity", action:"karinRich", userId, actId, version }
 *
 *  CLIENT SOURCE: box click (line 90235)
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
    logger.info('ACTIVITY', 'karinRich' + ' userId=' + userId);

    // TODO: Implement business logic

    callback(RH.success({}));
}

module.exports = { handle: handle };
