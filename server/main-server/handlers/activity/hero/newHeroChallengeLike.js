'use strict';

/**
 * =====================================================
 *  activity/hero/newHeroChallengeLike.js
 *  Super Warrior Z Game Server — Main Server
 *
 *  ACTION: newHeroChallengeLike
 *  DESC: Like/vote for a hero challenge entry
 *  TYPE: WRITE
 *
 *  CLIENT REQUEST:
 *    { type:"activity", action:"newHeroChallengeLike", userId, actId, topn }
 *
 *  CLIENT SOURCE: likeBtnTap() (line 100041)
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
    logger.info('ACTIVITY', 'newHeroChallengeLike' + ' userId=' + userId);

    // TODO: Implement business logic

    callback(RH.success({}));
}

module.exports = { handle: handle };
