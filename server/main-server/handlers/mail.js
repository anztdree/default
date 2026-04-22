/**
 * ============================================================================
 * Mail Handler — Main Server
 * ============================================================================
 * Actions: autoDelMail, delMail, gain, getAllRank, getAllReward, getMailList, getMsgList, getReward, readMail
 */

var ResponseHelper = require('../core/responseHelper');
var logger = require('../utils/logger');

var actions = {
  autoDelMail: null,
  delMail: null,
  gain: null,
  getAllRank: null,
  getAllReward: null,
  getMailList: null,
  getMsgList: null,
  getReward: null,
  readMail: null,
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
    logger.warn('Mail', 'Unknown action: ' + action);
    ResponseHelper.sendResponse(socket, 'handler.process',
      ResponseHelper.error(ResponseHelper.ErrorCode.INVALID_COMMAND), callback);
  }
}

module.exports = { handle: handle };
