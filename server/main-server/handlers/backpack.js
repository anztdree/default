/**
 * ============================================================================
 * Backpack Handler — Main Server
 * ============================================================================
 * Actions: activeSkill, getBetReward, merge, openBox, plus, randSummons, readBulletin, sell, useItem
 */

var ResponseHelper = require('../core/responseHelper');
var logger = require('../utils/logger');

var actions = {
  activeSkill: null,
  getBetReward: null,
  merge: null,
  openBox: null,
  plus: null,
  randSummons: null,
  readBulletin: null,
  sell: null,
  useItem: null,
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
    logger.warn('Backpack', 'Unknown action: ' + action);
    ResponseHelper.sendResponse(socket, 'handler.process',
      ResponseHelper.error(ResponseHelper.ErrorCode.INVALID_COMMAND), callback);
  }
}

module.exports = { handle: handle };
