/**
 * ============================================================================
 * TimeTrial Handler — Main Server
 * ============================================================================
 * Actions: buyTimes, checkBattleResult, clickExpedition, getAllBoxReward, getPassRank, getStarReward, getTimeTrialHeroPower, queryHistoryList, startBattle
 */

var ResponseHelper = require('../core/responseHelper');
var logger = require('../utils/logger');

var actions = {
  buyTimes: null,
  checkBattleResult: null,
  clickExpedition: null,
  getAllBoxReward: null,
  getPassRank: null,
  getStarReward: null,
  getTimeTrialHeroPower: null,
  queryHistoryList: null,
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
    logger.warn('TimeTrial', 'Unknown action: ' + action);
    ResponseHelper.sendResponse(socket, 'handler.process',
      ResponseHelper.error(ResponseHelper.ErrorCode.INVALID_COMMAND), callback);
  }
}

module.exports = { handle: handle };
