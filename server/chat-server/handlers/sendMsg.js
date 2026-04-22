/**
 * ============================================================================
 * Send Message Handler — chat.sendMsg
 * ============================================================================
 *
 * Client request (via handler.process):
 *   {
 *     type: "chat", action: "sendMsg",
 *     userId, kind, content, msgType, param, roomId, version: "1.0"
 *   }
 *
 * Server response:
 *   { ret: 0, data: JSON.stringify({ _time: timestamp }), ... }
 *
 * On success, server broadcasts message to all room members via Notify:
 *   { ret: "SUCCESS", data: JSON.stringify({ _msg: messageObj }), compress: bool, serverTime }
 *
 * Error:
 *   ret: 36001 → ERROR_FORBIDDEN_CHAT (user is muted)
 *
 * MESSAGE_KIND values (from client):
 *   0 = NULL, 1 = SYSTEM, 2 = WORLD, 3 = GUILD, 4 = PRIVATE, 5 = WORLD_TEAM, 6 = TEAM
 *
 * SYSTEM_MESSAGE_TYPE (msgType):
 *   0 = normal user chat
 *   1-91+ = system broadcast templates (summon, arena, VIP, etc.)
 *   When msgType > 0, the message has special formatting via noticeContent templates
 *
 * ============================================================================
 */

var CONSTANTS            = require('../config/constants');
var ResponseHelper       = require('../core/responseHelper');
var MessageStore         = require('../services/messageStore');
var ForbiddenChatService = require('../services/forbiddenChatService');
var ChatNotify           = require('../notifications');
var logger               = require('../utils/logger');

/**
 * Handle chat.sendMsg action
 *
 * Flow:
 *   1. Validate socket state and request fields
 *   2. Check if user is muted (forbidden chat)
 *   3. Build message object (ChatDataBaseClass format)
 *   4. Save message to DB
 *   5. Broadcast to room members via Notify (excluding sender)
 *   6. Return { _time } to sender
 *
 * @param {object}   socket   - Socket.IO socket
 * @param {object}   request  - Parsed request
 * @param {function} callback - Socket.IO ACK callback
 */
async function handle(socket, request, callback) {
  var userId = request.userId;
  var kind   = request.kind;
  var roomId = request.roomId;

  // ------------------------------------------
  // 1. Validate
  // ------------------------------------------

  if (!socket._user) {
    ResponseHelper.sendResponse(socket, 'handler.process',
      ResponseHelper.error(ResponseHelper.ErrorCode.SESSION_EXPIRED), callback);
    return;
  }

  if (!userId || !roomId) {
    ResponseHelper.sendResponse(socket, 'handler.process',
      ResponseHelper.error(ResponseHelper.ErrorCode.LACK_PARAM), callback);
    return;
  }

  // Validate message content length
  var content = request.content || '';
  if (content.length > CONSTANTS.MAX_MESSAGE_LENGTH) {
    logger.warn('SendMsg', 'Message too long from user ' + userId +
      ': ' + content.length + ' chars (max ' + CONSTANTS.MAX_MESSAGE_LENGTH + ')');
    ResponseHelper.sendResponse(socket, 'handler.process',
      ResponseHelper.error(ResponseHelper.ErrorCode.DATA_ERROR, 'Message too long'), callback);
    return;
  }

  // ------------------------------------------
  // 2. Check forbidden chat (mute)
  // ------------------------------------------

  try {
    var muted = await ForbiddenChatService.isMuted(userId, socket._user.serverId);

    if (muted) {
      logger.info('SendMsg', 'User ' + userId + ' is muted, message rejected');
      ResponseHelper.sendResponse(socket, 'handler.process',
        ResponseHelper.error(ResponseHelper.ErrorCode.ERROR_FORBIDDEN_CHAT), callback);
      return;
    }
  } catch (err) {
    logger.error('SendMsg', 'Mute check failed: ' + err.message);
    // Continue on error (fail-open) — don't block chat due to DB issue
  }

  // ------------------------------------------
  // 3. Build message object
  // ------------------------------------------

  var now = Date.now();

  var msgObj = {
    _time:       now,
    _kind:       kind || 0,
    _name:       socket._user.nickName,
    _content:    content,
    _id:         userId,
    _image:      socket._user.headImage,
    _param:      request.param || [],
    _type:       request.msgType || 0,
    _headEffect: {},   // Not available in game_users, default empty
    _headBox:    0,    // Not available in game_users, default 0
    _oriServerId: socket._user.oriServerId,
    _serverId:   socket._user.serverId,
    _showMain:   socket._user.vipLevel > 0,
    _roomId:     roomId,  // Internal field, NOT sent to client
  };

  // ------------------------------------------
  // 4. Save to DB
  // ------------------------------------------

  try {
    await MessageStore.saveMessage(msgObj);
  } catch (err) {
    logger.error('SendMsg', 'Failed to save message: ' + err.message);
    // Continue even if save fails — still broadcast the message
  }

  // ------------------------------------------
  // 5. Broadcast to room members (excluding sender)
  // ------------------------------------------

  try {
    // Remove internal _roomId before broadcasting (client doesn't expect it)
    var broadcastMsg = {
      _time:       msgObj._time,
      _kind:       msgObj._kind,
      _name:       msgObj._name,
      _content:    msgObj._content,
      _id:         msgObj._id,
      _image:      msgObj._image,
      _param:      msgObj._param,
      _type:       msgObj._type,
      _headEffect: msgObj._headEffect,
      _headBox:    msgObj._headBox,
      _oriServerId: msgObj._oriServerId,
      _serverId:   msgObj._serverId,
      _showMain:   msgObj._showMain,
    };

    ChatNotify.broadcastMessage(socket, roomId, broadcastMsg);
  } catch (err) {
    logger.error('SendMsg', 'Broadcast failed: ' + err.message);
  }

  // ------------------------------------------
  // 6. Return _time to sender
  // ------------------------------------------

  logger.info('SendMsg', 'User ' + userId + ' → room=' + roomId +
    ' kind=' + (kind || 0) + ' len=' + content.length);

  ResponseHelper.sendResponse(socket, 'handler.process',
    ResponseHelper.success({ _time: now }), callback);
}

module.exports = { handle: handle };
