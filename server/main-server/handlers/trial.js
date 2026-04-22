/**
 * ============================================================================
 * Trial Handler — Main Server
 * ============================================================================
 * Actions: buyFund, checkBattleResult, clickSystem, getDailyReward, getFundReward, getRank, getState, getTreasureInfo, startBattle, triggerLackOfGoldBonus, vipBuy
 */

var ResponseHelper = require('../core/responseHelper');
var logger = require('../utils/logger');

var actions = {
  buyFund: null,
  checkBattleResult: null,
  clickSystem: null,
  getDailyReward: null,
  getFundReward: null,
  getRank: null,
  getState: null,
  getTreasureInfo: null,
  startBattle: null,
  triggerLackOfGoldBonus: null,
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
    logger.warn('Trial', 'Unknown action: ' + action);
    ResponseHelper.sendResponse(socket, 'handler.process',
      ResponseHelper.error(ResponseHelper.ErrorCode.INVALID_COMMAND), callback);
  }
}

module.exports = { handle: handle };
