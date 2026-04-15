/**
 * =====================================================
 *  Handler: changeAutoJoinCondition — Dungeon Server
 * =====================================================
 *
 *  CLIENT CODE (main.min.js line 146057):
 *    ts.processHandlerWithDungeon({
 *        type: "teamDungeonTeam",
 *        action: "changeAutoJoinCondition",
 *        userId, teamId, autoJoin, condition, version:"1.0"
 *    }, function(e) { e.autoJoin, e.condition })
 *
 *  Response: { autoJoin: number, condition: object }
 * =====================================================
 */

'use strict';

var RH = require('../../shared/responseHelper');
var logger = require('../../shared/utils/logger');

/**
 * @param {object} deps - { teamManager }
 * @param {object} socket
 * @param {object} parsed - { userId, teamId, autoJoin, condition }
 * @param {function} callback
 */
function handle(deps, socket, parsed, callback) {
    var userId = parsed.userId;
    var teamId = parsed.teamId;
    var autoJoin = parsed.autoJoin || 0;
    var condition = parsed.condition || {};

    if (!teamId) {
        return callback(RH.error(RH.ErrorCode.LACK_PARAM, 'Missing teamId'));
    }

    logger.info('DUNGEON', 'changeAutoJoinCondition: userId=' + userId +
        ', teamId=' + teamId + ', autoJoin=' + autoJoin);

    if (!deps.teamManager.setAutoJoin(teamId, autoJoin, condition)) {
        return callback(RH.error(RH.ErrorCode.UNKNOWN, 'Team not found'));
    }

    callback(RH.success({
        autoJoin: autoJoin,
        condition: condition,
    }));
}

module.exports = { handle: handle };
