/**
 * ============================================================================
 * UserMsg Handler — Main Server
 * ============================================================================
 * Actions: delFriendMsg, delMail, friendServerAction, getAll, getFinishInfo, getFriends, getMsg, getMsgList, readMsg, sendMsg
 */

var ResponseHelper = require('../core/responseHelper');
var logger = require('../utils/logger');

var actions = {
  delFriendMsg: null,
  delMail: null,
  friendServerAction: null,
  getAll: null,
  getFinishInfo: null,
  getFriends: null,
  getMsg: null,
  getMsgList: null,
  readMsg: null,
  sendMsg: null,
};

function handle(socket, request, callback) {
  var action = request.action;

  if (!action) {
    ResponseHelper.sendResponse(socket, 'handler.process',
      ResponseHelper.error(ResponseHelper.ErrorCode.LACK_PARAM), callback);
    return;
  }

  var handler = actions[action];

  if (handler) {
    handler(socket, request, callback);
  } else {
    logger.warn('UserMsg', 'Unknown action: ' + action);
    ResponseHelper.sendResponse(socket, 'handler.process',
      ResponseHelper.error(ResponseHelper.ErrorCode.INVALID_COMMAND), callback);
  }
}

module.exports = { handle: handle };
