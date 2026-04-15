/**
 * =====================================================
 *  Handler: refreshApplyList — Dungeon Server
 * =====================================================
 *
 *  CLIENT CODE (main.min.js line 142864):
 *    ts.processHandlerWithDungeon({
 *        type: "teamDungeonTeam",
 *        action: "refreshApplyList",
 *        userId, teamId, version:"1.0"
 *    }, function(e) { e._applyUsers, e._userBrief })
 *
 *  Response: { _applyUsers: [...], _userBrief: {...} }
 * =====================================================
 */

'use strict';

var RH = require('../../shared/responseHelper');
var logger = require('../../shared/utils/logger');
var DB = require('../../database/connection');

/**
 * @param {object} deps - { teamManager }
 * @param {object} socket
 * @param {object} parsed - { userId, teamId }
 * @param {function} callback
 */
async function handle(deps, socket, parsed, callback) {
    var userId = parsed.userId;
    var teamId = parsed.teamId;

    if (!teamId) {
        return callback(RH.error(RH.ErrorCode.LACK_PARAM, 'Missing teamId'));
    }

    logger.info('DUNGEON', 'refreshApplyList: userId=' + userId + ', teamId=' + teamId);

    var team = deps.teamManager.getTeam(teamId);
    if (!team) {
        return callback(RH.error(RH.ErrorCode.UNKNOWN, 'Team not found'));
    }

    // Load brief user info for apply list from DB
    var applyUsers = [];
    var userBrief = {};

    try {
        if (team.applyList.length > 0) {
            var placeholders = team.applyList.map(function() { return '?'; }).join(',');
            var rows = await DB.query(
                'SELECT user_id, nick_name, head_image FROM users WHERE user_id IN (' + placeholders + ')',
                team.applyList
            );

            for (var i = 0; i < rows.length; i++) {
                applyUsers.push({
                    _userId: rows[i].user_id,
                    _nickName: rows[i].nick_name || rows[i].user_id,
                    _headImage: rows[i].head_image || '',
                });
                userBrief[rows[i].user_id] = {
                    _nickName: rows[i].nick_name || rows[i].user_id,
                    _headImage: rows[i].head_image || '',
                };
            }
        }
    } catch (err) {
        logger.warn('DUNGEON', 'refreshApplyList: DB error: ' + err.message);
    }

    callback(RH.success({
        _applyUsers: applyUsers,
        _userBrief: userBrief,
    }));
}

module.exports = { handle: handle };
