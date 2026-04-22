/**
 * ============================================================================
 * TimeBonus Handler — Main Server
 * ============================================================================
 * Actions: buyBonus, getBattleReward, imprintExtraction, triggerLackOfGoldBonus
 */

var ResponseHelper = require('../core/responseHelper');
var logger = require('../utils/logger');

var actions = {
  buyBonus: null,
  getBattleReward: null,
  imprintExtraction: null,
  triggerLackOfGoldBonus: null,
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
    logger.warn('TimeBonus', 'Unknown action: ' + action);
    ResponseHelper.sendResponse(socket, 'handler.process',
      ResponseHelper.error(ResponseHelper.ErrorCode.INVALID_COMMAND), callback);
  }
}

module.exports = { handle: handle };
