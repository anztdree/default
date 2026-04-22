/**
 * ============================================================================
 * BattleMedal Handler — Main Server
 * ============================================================================
 * Actions: buyCard, buyLevel, buySuper, getAllLevelReward, getAllTaskReward, getChannelWeeklyRewrd, getLevelReward, getRankReward, shop, taskReward
 */

var ResponseHelper = require('../core/responseHelper');
var logger = require('../utils/logger');

var actions = {
  buyCard: null,
  buyLevel: null,
  buySuper: null,
  getAllLevelReward: null,
  getAllTaskReward: null,
  getChannelWeeklyRewrd: null,
  getLevelReward: null,
  getRankReward: null,
  shop: null,
  taskReward: null,
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
    logger.warn('BattleMedal', 'Unknown action: ' + action);
    ResponseHelper.sendResponse(socket, 'handler.process',
      ResponseHelper.error(ResponseHelper.ErrorCode.INVALID_COMMAND), callback);
  }
}

module.exports = { handle: handle };
