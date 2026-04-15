/**
 * =====================================================
 *  Handler: agree — Dungeon Server
 * =====================================================
 *
 *  Accept a member's application to join the team.
 *
 *  CLIENT CODE (main.min.js line 147387):
 *    ts.processHandlerWithDungeon({
 *        type: "teamDungeonTeam",
 *        action: "agree",
 *        userId, teamId, memberUserId, version:"1.0"
 *    }, callback)
 *
 *  Broadcasts Notify: TDMemberJoin to all team members.
 * =====================================================
 */

'use strict';

var RH = require('../../shared/responseHelper');
var logger = require('../../shared/utils/logger');
var NOTIFY_ACTION = require('../utils/dungeonConstants').NOTIFY_ACTION;
var LIMITS = require('../utils/dungeonConstants').LIMITS;
var responseBuilder = require('../utils/responseBuilder');

/**
 * @param {object} deps - { teamManager, io }
 * @param {object} socket
 * @param {object} parsed - { userId, teamId, memberUserId }
 * @param {function} callback
 */
function handle(deps, socket, parsed, callback) {
    var userId = parsed.userId;
    var teamId = parsed.teamId;
    var memberUserId = parsed.memberUserId;

    if (!teamId || !memberUserId) {
        return callback(RH.error(RH.ErrorCode.LACK_PARAM, 'Missing teamId or memberUserId'));
    }

    logger.info('DUNGEON', 'agree: userId=' + userId + ', teamId=' + teamId +
        ', memberUserId=' + memberUserId);

    var team = deps.teamManager.getTeam(teamId);
    if (!team) {
        return callback(RH.error(RH.ErrorCode.UNKNOWN, 'Team not found'));
    }

    // Only owner can accept applications
    if (team.owner !== userId) {
        return callback(RH.error(RH.ErrorCode.UNKNOWN, 'Only team owner can accept'));
    }

    // Check if team is full
    if (team.members.length >= LIMITS.MAX_TEAM_MEMBERS) {
        return callback(RH.error(RH.ErrorCode.UNKNOWN, 'Team is full'));
    }

    // Remove from apply list
    deps.teamManager.removeApply(teamId, memberUserId);

    // Try to find the member's socket (they may be connected)
    var memberSocket = null;
    var teamMembers = deps.teamManager.getTeamMembers(teamId);
    for (var i = 0; i < teamMembers.length; i++) {
        // Already in team
    }

    // Add member to team (without socket if they're not connected to dungeon-server)
    var added = deps.teamManager.addMember(teamId, memberUserId, memberSocket, false);
    if (!added) {
        return callback(RH.error(RH.ErrorCode.UNKNOWN, 'Failed to add member'));
    }

    // Reload team members for broadcasting
    team = deps.teamManager.getTeam(teamId);

    // Broadcast TDMemberJoin to all team members
    responseBuilder.broadcastToTeam(team.members, {
        action: NOTIFY_ACTION.MEMBER_JOIN,
        member: {
            _userId: memberUserId,
            _isRobot: false,
        },
    });

    callback(RH.success({}));
}

module.exports = { handle: handle };
