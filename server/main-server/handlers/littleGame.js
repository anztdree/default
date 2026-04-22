/**
 * ============================================================================
 * LittleGame Handler — Main Server
 * ============================================================================
 * Actions: click, getAttrs, getBattleReward, getChapterReward, joinYouTuberPlan, refresh
 */

var ResponseHelper = require('../core/responseHelper');
var logger = require('../utils/logger');

var actions = {
  click: null,
  getAttrs: null,
  getBattleReward: null,
  getChapterReward: null,
  joinYouTuberPlan: null,
  refresh: null,
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
    logger.warn('LittleGame', 'Unknown action: ' + action);
    ResponseHelper.sendResponse(socket, 'handler.process',
      ResponseHelper.error(ResponseHelper.ErrorCode.INVALID_COMMAND), callback);
  }
}

module.exports = { handle: handle };
