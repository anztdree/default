/**
 * ============================================================================
 * TimeMachine Handler — Main Server
 * ============================================================================
 * Actions: checkBattleResult, getBattleRecord, getLessonFundReward, getReward, start, startBoss
 */

var ResponseHelper = require('../core/responseHelper');
var logger = require('../utils/logger');

var actions = {
  checkBattleResult: null,
  getBattleRecord: null,
  getLessonFundReward: null,
  getReward: null,
  start: null,
  startBoss: null,
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
    logger.warn('TimeMachine', 'Unknown action: ' + action);
    ResponseHelper.sendResponse(socket, 'handler.process',
      ResponseHelper.error(ResponseHelper.ErrorCode.INVALID_COMMAND), callback);
  }
}

module.exports = { handle: handle };
