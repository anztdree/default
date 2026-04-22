/**
 * ============================================================================
 * Dungeon Handler — Main Server
 * ============================================================================
 * Actions: buyCount, buyTimes, checkBattleResult, getChapterReward, startBattle, sweep
 */

var ResponseHelper = require('../core/responseHelper');
var logger = require('../utils/logger');

var actions = {
  buyCount: null,
  buyTimes: null,
  checkBattleResult: null,
  getChapterReward: null,
  startBattle: null,
  sweep: null,
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
    logger.warn('Dungeon', 'Unknown action: ' + action);
    ResponseHelper.sendResponse(socket, 'handler.process',
      ResponseHelper.error(ResponseHelper.ErrorCode.INVALID_COMMAND), callback);
  }
}

module.exports = { handle: handle };
