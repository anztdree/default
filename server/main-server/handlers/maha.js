/**
 * ============================================================================
 * Maha Handler — Main Server
 * ============================================================================
 * Actions: buyTimes, checkBattleResult, friendBattle, getActivityDetail, getFriend, join, reset, risk, startBattle
 */

var ResponseHelper = require('../core/responseHelper');
var logger = require('../utils/logger');

var actions = {
  buyTimes: null,
  checkBattleResult: null,
  friendBattle: null,
  getActivityDetail: null,
  getFriend: null,
  join: null,
  reset: null,
  risk: null,
  startBattle: null,
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
    logger.warn('Maha', 'Unknown action: ' + action);
    ResponseHelper.sendResponse(socket, 'handler.process',
      ResponseHelper.error(ResponseHelper.ErrorCode.INVALID_COMMAND), callback);
  }
}

module.exports = { handle: handle };
