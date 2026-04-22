/**
 * ============================================================================
 * Snake Handler — Main Server
 * ============================================================================
 * Actions: attackBoss, awardBox, getAllBoxReward, getChapterReward, getEnemyInfo, getSnakeInfo, recoverHero, reset, startBattle, sweep
 */

var ResponseHelper = require('../core/responseHelper');
var logger = require('../utils/logger');

var actions = {
  attackBoss: null,
  awardBox: null,
  getAllBoxReward: null,
  getChapterReward: null,
  getEnemyInfo: null,
  getSnakeInfo: null,
  recoverHero: null,
  reset: null,
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
    logger.warn('Snake', 'Unknown action: ' + action);
    ResponseHelper.sendResponse(socket, 'handler.process',
      ResponseHelper.error(ResponseHelper.ErrorCode.INVALID_COMMAND), callback);
  }
}

module.exports = { handle: handle };
