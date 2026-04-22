/**
 * ============================================================================
 * Chat Login Handler — chat.login
 * ============================================================================
 *
 * Client request (via handler.process):
 *   { type: "chat", action: "login", userId, serverId, version: "1.0" }
 *
 * Server response:
 *   { ret: 0, data: "{}", compress: false, serverTime, server0Time }
 *
 * Purpose:
 *   Authenticate the user on the chat server by loading their profile
 *   from the shared database (game_users table).
 *
 * After successful login, the client will send joinRoom requests
 * for each room (world, guild, team, teamDungeon) in parallel.
 *
 * User data stored on socket (socket._user) is used by other handlers:
 *   - sendMsg: needs _name, _image, _showMain, _oriServerId, _serverId
 *   - All handlers: needs _userId for validation
 *
 * ============================================================================
 */

var DB             = require('../services/db');
var ResponseHelper = require('../core/responseHelper');
var logger         = require('../utils/logger');

/**
 * Handle chat.login action
 *
 * Flow:
 *   1. Validate request fields
 *   2. Query game_users for user profile (read-only, shared table)
 *   3. Store user data on socket (socket._user)
 *   4. Return empty object {} as data
 *
 * @param {object}   socket   - Socket.IO socket
 * @param {object}   request  - Parsed request { type, action, userId, serverId, version }
 * @param {function} callback - Socket.IO ACK callback
 */
async function handle(socket, request, callback) {
  var userId   = request.userId;
  var serverId = request.serverId || 1;

  // ------------------------------------------
  // 1. Validate
  // ------------------------------------------

  if (!userId) {
    logger.warn('Login', 'Missing userId');
    ResponseHelper.sendResponse(socket, 'handler.process',
      ResponseHelper.error(ResponseHelper.ErrorCode.LACK_PARAM), callback);
    return;
  }

  // Prevent re-login
  if (socket._user && socket._user.userId === userId) {
    logger.info('Login', 'User ' + userId + ' already logged in, refreshing');
    ResponseHelper.sendResponse(socket, 'handler.process',
      ResponseHelper.success({}), callback);
    return;
  }

  // ------------------------------------------
  // 2. Load user profile from DB (read-only)
  // ------------------------------------------

  try {
    var row = await DB.queryOne(
      'SELECT user_id, nick_name, head_image, level, vip_level, ori_server_id FROM game_users WHERE user_id = ? LIMIT 1',
      [userId]
    );

    if (!row) {
      logger.warn('Login', 'User not found: ' + userId);
      ResponseHelper.sendResponse(socket, 'handler.process',
        ResponseHelper.error(ResponseHelper.ErrorCode.USER_NOT_REGIST), callback);
      return;
    }

    // ------------------------------------------
    // 3. Store user data on socket
    // ------------------------------------------

    socket._user = {
      userId:       row.user_id,
      nickName:     row.nick_name || '',
      headImage:    row.head_image || '',
      level:        row.level || 1,
      vipLevel:     row.vip_level || 0,
      oriServerId:  row.ori_server_id || 1,
      serverId:     serverId,
    };

    socket._userId = userId;

    logger.info('Login', 'User ' + userId + ' authenticated | name=' +
      (row.nick_name || '?') + ' | level=' + (row.level || 1) +
      ' | vip=' + (row.vip_level || 0));

    // ------------------------------------------
    // 4. Return empty object
    // ------------------------------------------

    ResponseHelper.sendResponse(socket, 'handler.process',
      ResponseHelper.success({}), callback);

  } catch (err) {
    logger.error('Login', 'DB error for user ' + userId + ': ' + err.message);
    ResponseHelper.sendResponse(socket, 'handler.process',
      ResponseHelper.error(ResponseHelper.ErrorCode.UNKNOWN), callback);
  }
}

module.exports = { handle: handle };
