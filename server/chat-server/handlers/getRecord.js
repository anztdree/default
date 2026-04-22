/**
 * ============================================================================
 * Get Record Handler — chat.getRecord
 * ============================================================================
 *
 * Client request (via handler.process):
 *   { type: "chat", action: "getRecord", userId, roomId, startTime, version: "1.0" }
 *
 * Server response:
 *   { ret: 0, data: JSON.stringify({ _record: [messageObjects] }), ... }
 *
 * Purpose:
 *   Retrieve chat history for a room since a specific timestamp.
 *   Used by the client to load missed messages (e.g., after reconnect,
 *   team dungeon info panel, etc.)
 *
 * startTime is the server_time of the last message the client has.
 * Server returns all messages with server_time > startTime.
 *
 * Client usage (from main.min.js):
 *   getTeamDungeonInfoRecord() — loads team dungeon world messages
 *
 * _record format: same as joinRoom — array of ChatDataBaseClass objects
 *
 * ============================================================================
 */

var ResponseHelper = require('../core/responseHelper');
var MessageStore   = require('../services/messageStore');
var logger         = require('../utils/logger');

/**
 * Handle chat.getRecord action
 *
 * Flow:
 *   1. Validate socket state and request fields
 *   2. Get messages since startTime from DB
 *   3. Return { _record } to client
 *
 * @param {object}   socket   - Socket.IO socket
 * @param {object}   request  - Parsed request
 * @param {function} callback - Socket.IO ACK callback
 */
async function handle(socket, request, callback) {
  var userId    = request.userId;
  var roomId    = request.roomId;
  var startTime = request.startTime;

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

  // startTime is optional — if missing, default to 0 (get all recent)
  if (!startTime || typeof startTime !== 'number') {
    startTime = 0;
  }

  // ------------------------------------------
  // 2. Get messages from DB since startTime
  // ------------------------------------------

  var records = [];
  try {
    records = await MessageStore.getRecordsSince(roomId, startTime);
  } catch (err) {
    logger.error('GetRecord', 'Failed for room ' + roomId + ': ' + err.message);
    // Return empty records on error
  }

  logger.info('GetRecord', 'User ' + userId + ' → room=' + roomId +
    ' since=' + startTime + ' | records=' + records.length);

  // ------------------------------------------
  // 3. Return { _record } to client
  // ------------------------------------------

  ResponseHelper.sendResponse(socket, 'handler.process',
    ResponseHelper.success({ _record: records }), callback);
}

module.exports = { handle: handle };
