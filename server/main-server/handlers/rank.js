/**
 * ============================================================================
 * Rank Handler — Main Server
 * ============================================================================
 * Actions: buyTimes, cumulativeRechargeReward, getActivityDetail, getRank, getReward, like, luckFeedbackGetReward, queryGenki, queryLanternBlessRecord, queryTask, queryWeaponCastRecord, startBattle, timeLimitPropExchange, vipBuy
 */

var ResponseHelper = require('../core/responseHelper');
var logger = require('../utils/logger');

var actions = {
  buyTimes: null,
  cumulativeRechargeReward: null,
  getActivityDetail: null,
  getRank: null,
  getReward: null,
  like: null,
  luckFeedbackGetReward: null,
  queryGenki: null,
  queryLanternBlessRecord: null,
  queryTask: null,
  queryWeaponCastRecord: null,
  startBattle: null,
  timeLimitPropExchange: null,
  vipBuy: null,
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
    logger.warn('Rank', 'Unknown action: ' + action);
    ResponseHelper.sendResponse(socket, 'handler.process',
      ResponseHelper.error(ResponseHelper.ErrorCode.INVALID_COMMAND), callback);
  }
}

module.exports = { handle: handle };
