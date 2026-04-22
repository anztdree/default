/**
 * ============================================================================
 * Leave Room Handler — chat.leaveRoom
 * ============================================================================
 *
 * Client request (via handler.process):
 *   { type: "chat", action: "leaveRoom", userId, roomId, version: "1.0" }
 *
 * Server response:
 *   { ret: 0, data: "{}", compress: false, ... }
 *
 * Purpose:
 *   Remove the socket from a Socket.IO room (stops receiving messages).
 *
 * Called when:
 *   - Player leaves a guild (leave guild room)
 *   - Team dungeon expires or finishes (leave team/tdungeon room)
 *   - Team is disbanded
 *
 * Client flow on leave:
 *   ts.chatLeaveRequest(roomId)
 *   → sets ts.loginInfo.serverItem.{roomField} = void 0
 *   → pushes undefined to ts.chatData[kind] to signal UI refresh
 *
 * ============================================================================
 */

var ResponseHelper = require('../core/responseHelper');
var RoomManager    = require('../services/roomManager');
var logger         = require('../utils/logger');

/**
 * Handle chat.leaveRoom action
 *
 * Flow:
 *   1. Validate request fields
 *   2. Leave Socket.IO room
 *   3. Return empty object
 *
 * @param {object}   socket   - Socket.IO socket
 * @param {object}   request  - Parsed request
 * @param {function} callback - Socket.IO ACK callback
 */
function handle(socket, request, callback) {
  var roomId = request.roomId;

  // ------------------------------------------
  // 1. Validate
  // ------------------------------------------

  if (!roomId) {
    ResponseHelper.sendResponse(socket, 'handler.process',
      ResponseHelper.error(ResponseHelper.ErrorCode.LACK_PARAM), callback);
    return;
  }

  // ------------------------------------------
  // 2. Leave Socket.IO room
  // ------------------------------------------

  var userId = socket._userId || socket.id;
  RoomManager.leaveRoom(socket, roomId);

  logger.info('LeaveRoom', 'User ' + userId + ' left room: ' + roomId);

  // ------------------------------------------
  // 3. Return empty object
  // ------------------------------------------

  ResponseHelper.sendResponse(socket, 'handler.process',
    ResponseHelper.success({}), callback);
}

module.exports = { handle: handle };
