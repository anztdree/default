/**
 * =====================================================
 *  Handler: clientConnect — Super Warrior Z Dungeon Server
 * =====================================================
 *
 *  First action after TEA verify. Registers user in a team.
 *
 *  CLIENT CODE (main.min.js line 144837):
 *    ts.processHandlerWithDungeon({
 *        type: "teamDungeonTeam",
 *        action: "clientConnect",
 *        userId: UserInfoSingleton.getInstance().userId,
 *        teamId: TeamworkManager.getInstance().myTeamId,
 *        version: "1.0"
 *    }, function(e) {
 *        e._teamInfo, e._usersInfo
 *    })
 *
 *  Response: { _teamInfo: {...}, _usersInfo: [{userId, pos, role, isRobot, ...}] }
 *
 * =====================================================
 */

'use strict';

var RH = require('../../shared/responseHelper');
var logger = require('../../shared/utils/logger');

/**
 * @param {object} deps - { teamManager }
 * @param {object} socket
 * @param {object} parsed - { userId, teamId }
 * @param {function} callback
 */
async function handle(deps, socket, parsed, callback) {
    var userId = parsed.userId;
    var teamId = parsed.teamId;

    if (!userId || !teamId) {
        return callback(RH.error(RH.ErrorCode.LACK_PARAM, 'Missing userId or teamId'));
    }

    logger.info('DUNGEON', 'clientConnect: userId=' + userId + ', teamId=' + teamId);

    // Register socket
    deps.teamManager.registerSocket(socket.id, userId);
    socket._userId = userId;
    socket._teamId = teamId;

    // Check if team exists
    var team = deps.teamManager.getTeam(teamId);
    if (!team) {
        return callback(RH.error(RH.ErrorCode.UNKNOWN, 'Team not found: ' + teamId));
    }

    // Return team info and members
    var teamInfo = deps.teamManager.getTeamInfo(teamId);
    var usersInfo = deps.teamManager.getMembersInfo(teamId);

    callback(RH.success({
        _teamInfo: teamInfo,
        _usersInfo: usersInfo,
    }));
}

module.exports = { handle: handle };
