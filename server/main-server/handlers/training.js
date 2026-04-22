/**
 * ============================================================================
 * Training Handler — Main Server
 * ============================================================================
 * Actions: answer, buyTimes, checkBattleResult, getInfo, getLog, move, runAway, sell, startBattle
 */

var ResponseHelper = require('../core/responseHelper');
var logger = require('../utils/logger');

var actions = {
  answer: null,
  buyTimes: null,
  checkBattleResult: null,
  getInfo: null,
  getLog: null,
  move: null,
  runAway: null,
  sell: null,
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
    logger.warn('Training', 'Unknown action: ' + action);
    ResponseHelper.sendResponse(socket, 'handler.process',
      ResponseHelper.error(ResponseHelper.ErrorCode.INVALID_COMMAND), callback);
  }
}

module.exports = { handle: handle };
