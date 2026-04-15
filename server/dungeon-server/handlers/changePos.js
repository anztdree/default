/**
 * =====================================================
 *  Handler: changePos — Dungeon Server
 * =====================================================
 *
 *  Change team member positions (formation).
 *
 *  CLIENT CODE (main.min.js line 144950):
 *    ts.processHandlerWithDungeon({
 *        type: "teamDungeonTeam",
 *        action: "changePos",
 *        userId, teamId, posMap, version:"1.0"
 *    }, callback)
 *
 *  Broadcasts Notify: TDChangePos to all team members.
 * =====================================================
 */

'use strict';

var RH = require('../../shared/responseHelper');
var logger = require('../../shared/utils/logger');
var NOTIFY_ACTION = require('../utils/dungeonConstants').NOTIFY_ACTION;
var responseBuilder = require('../utils/responseBuilder');

/**
 * @param {object} deps - { teamManager }
 * @param {object} socket
 * @param {object} parsed - { userId, teamId, posMap }
 * @param {function} callback
 */
function handle(deps, socket, parsed, callback) {
    var userId = parsed.userId;
    var teamId = parsed.teamId;
    var posMap = parsed.posMap;

    if (!teamId || !posMap) {
        return callback(RH.error(RH.ErrorCode.LACK_PARAM, 'Missing teamId or posMap'));
    }

    logger.info('DUNGEON', 'changePos: userId=' + userId + ', teamId=' + teamId);

    var team = deps.teamManager.getTeam(teamId);
    if (!team) {
        return callback(RH.error(RH.ErrorCode.UNKNOWN, 'Team not found'));
    }

    // Update positions
    if (!deps.teamManager.changePositions(teamId, posMap)) {
        return callback(RH.error(RH.ErrorCode.UNKNOWN, 'Failed to change positions'));
    }

    // Broadcast TDChangePos to all team members
    responseBuilder.broadcastToTeam(team.members, {
        action: NOTIFY_ACTION.CHANGE_POS,
        posMap: posMap,
    });

    callback(RH.success({}));
}

module.exports = { handle: handle };
