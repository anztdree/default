/**
 * =====================================================
 *  Handler: startBattle — Dungeon Server
 * =====================================================
 *
 *  Start a team dungeon battle.
 *
 *  CLIENT CODE (main.min.js line 144977):
 *    ts.processHandlerWithDungeon({
 *        type: "teamDungeonTeam",
 *        action: "startBattle",
 *        userId, teamId, posMap, version:"1.0"
 *    }, callback)
 *
 *  Broadcasts Notify: TDStartBattle to all team members.
 *  Client then enters battle scene (waitAnimationToBattle).
 * =====================================================
 */

'use strict';

var RH = require('../../shared/responseHelper');
var logger = require('../../shared/utils/logger');
var NOTIFY_ACTION = require('../utils/dungeonConstants').NOTIFY_ACTION;
var responseBuilder = require('../utils/responseBuilder');

/**
 * @param {object} deps - { teamManager, battleManager }
 * @param {object} socket
 * @param {object} parsed - { userId, teamId, posMap }
 * @param {function} callback
 */
function handle(deps, socket, parsed, callback) {
    var userId = parsed.userId;
    var teamId = parsed.teamId;
    var posMap = parsed.posMap;

    if (!teamId) {
        return callback(RH.error(RH.ErrorCode.LACK_PARAM, 'Missing teamId'));
    }

    logger.info('DUNGEON', 'startBattle: userId=' + userId + ', teamId=' + teamId);

    var team = deps.teamManager.getTeam(teamId);
    if (!team) {
        return callback(RH.error(RH.ErrorCode.UNKNOWN, 'Team not found'));
    }

    // Update positions if provided
    if (posMap) {
        deps.teamManager.changePositions(teamId, posMap);
    }

    // Start battle in team manager
    deps.teamManager.startBattle(teamId);

    // Create battle record
    var battle = deps.battleManager.startBattle(teamId);

    // Broadcast TDStartBattle to all team members
    responseBuilder.broadcastToTeam(team.members, {
        action: NOTIFY_ACTION.START_BATTLE,
        battleId: battle.battleId,
    });

    callback(RH.success({}));
}

module.exports = { handle: handle };
