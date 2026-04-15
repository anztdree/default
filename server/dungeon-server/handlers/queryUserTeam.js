/**
 * =====================================================
 *  Handler: queryUserTeam — Dungeon Server
 * =====================================================
 *
 *  Query another user's team data.
 *
 *  CLIENT CODE (main.min.js line 146625):
 *    ts.processHandlerWithDungeon({
 *        type: "teamDungeonTeam",
 *        action: "queryUserTeam",
 *        userId, queryUserId, version:"1.0"
 *    }, function(e) { e._uinfo: { _teams, _superSkill } })
 *
 *  Response: { _uinfo: { _teams: [...], _superSkill: [...] } }
 * =====================================================
 */

'use strict';

var RH = require('../../shared/responseHelper');
var logger = require('../../shared/utils/logger');

/**
 * @param {object} deps - { teamManager }
 * @param {object} socket
 * @param {object} parsed - { userId, queryUserId }
 * @param {function} callback
 */
function handle(deps, socket, parsed, callback) {
    var userId = parsed.userId;
    var queryUserId = parsed.queryUserId;

    if (!queryUserId) {
        return callback(RH.error(RH.ErrorCode.LACK_PARAM, 'Missing queryUserId'));
    }

    logger.info('DUNGEON', 'queryUserTeam: userId=' + userId + ', queryUserId=' + queryUserId);

    var team = deps.teamManager.getUserTeam(queryUserId);
    var teams = [];
    if (team) {
        teams.push(deps.teamManager.getTeamInfo(team.teamId));
    }

    callback(RH.success({
        _uinfo: {
            _teams: teams,
            _superSkill: [],
        },
    }));
}

module.exports = { handle: handle };
