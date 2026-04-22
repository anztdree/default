/**
 * ============================================================================
 * Join Room Handler — chat.joinRoom
 * ============================================================================
 *
 * Client request (via handler.process):
 *   { type: "chat", action: "joinRoom", userId, roomId, version: "1.0" }
 *
 * Server response:
 *   { ret: 0, data: JSON.stringify({ _record: [messageObjects] }), ... }
 *
 * Purpose:
 *   1. Add the socket to the Socket.IO room (starts receiving messages)
 *   2. Return recent messages from DB as _record array
 *
 * The client calls joinRoom for each room after successful chat.login:
 *   - World room (always)
 *   - Guild room (if in a guild)
 *   - Team Dungeon room (if active)
 *   - Team room (if in a team)
 *
 * These calls happen in parallel via Promise.all in the client.
 *
 * _record format (array of ChatDataBaseClass objects):
 *   [ { _time, _kind, _name, _content, _id, _image, _param, _type,
 *       _headEffect, _headBox, _oriServerId, _serverId, _showMain }, ... ]
 *
 * ============================================================================
 */

var ResponseHelper = require('../core/responseHelper');
var RoomManager    = require('../services/roomManager');
var MessageStore   = require('../services/messageStore');
var logger         = require('../utils/logger');

/**
 * Handle chat.joinRoom action
 *
 * Flow:
 *   1. Validate socket state and request fields
 *   2. Join Socket.IO room
 *   3. Get recent messages from DB
 *   4. Return { _record } to client
 *
 * @param {object}   socket   - Socket.IO socket
 * @param {object}   request  - Parsed request
 * @param {function} callback - Socket.IO ACK callback
 */
async function handle(socket, request, callback) {
  var userId = request.userId;
  var roomId = request.roomId;

  // ------------------------------------------
  // 1. Validate
  // ------------------------------------------

  if (!socket._user) {
    ResponseHelper.sendResponse(socket, 'handler.process',
      ResponseHelper.error(ResponseHelper.ErrorCode.SESSION_EXPIRED), callback);
    return;
  }

  if (!roomId) {
    ResponseHelper.sendResponse(socket, 'handler.process',
      ResponseHelper.error(ResponseHelper.ErrorCode.LACK_PARAM), callback);
    return;
  }

  // Already in room — just return records
  if (RoomManager.isInRoom(socket, roomId)) {
    logger.debug('JoinRoom', 'User ' + userId + ' already in room: ' + roomId);
  } else {
    // ------------------------------------------
    // 2. Join Socket.IO room
    // ------------------------------------------

    RoomManager.joinRoom(socket, roomId);
  }

  // ------------------------------------------
  // 3. Get recent messages from DB
  // ------------------------------------------

  var records = [];
  try {
    records = await MessageStore.getRecentRecords(roomId);
  } catch (err) {
    logger.error('JoinRoom', 'Failed to load records for room ' + roomId + ': ' + err.message);
    // Return empty records on error — don't fail the join
  }

  logger.info('JoinRoom', 'User ' + userId + ' joined room: ' + roomId +
    ' | records=' + records.length);

  // ------------------------------------------
  // 4. Return { _record } to client
  // ------------------------------------------

  ResponseHelper.sendResponse(socket, 'handler.process',
    ResponseHelper.success({ _record: records }), callback);
}

module.exports = { handle: handle };
