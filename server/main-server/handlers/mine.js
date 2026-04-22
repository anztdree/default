/**
 * ============================================================================
 * Mine Handler — Main Server
 * ============================================================================
 * Actions: buyStep, diamondShop, getChest, getFriendArenaDefenceTeam, getGuildList, getInfo, move, openAll, resetCurLevel, startBattle
 */

var ResponseHelper = require('../core/responseHelper');
var logger = require('../utils/logger');

var actions = {
  buyStep: null,
  diamondShop: null,
  getChest: null,
  getFriendArenaDefenceTeam: null,
  getGuildList: null,
  getInfo: null,
  move: null,
  openAll: null,
  resetCurLevel: null,
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
    logger.warn('Mine', 'Unknown action: ' + action);
    ResponseHelper.sendResponse(socket, 'handler.process',
      ResponseHelper.error(ResponseHelper.ErrorCode.INVALID_COMMAND), callback);
  }
}

module.exports = { handle: handle };
