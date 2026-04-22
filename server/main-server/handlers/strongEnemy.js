/**
 * ============================================================================
 * StrongEnemy Handler — Main Server
 * ============================================================================
 * Actions: buyBattleTimes, buyTimes, checkBattleResult, friendBattle, getInfo, getRankInfo, recoverHero, setTeam, startBattle
 */

var ResponseHelper = require('../core/responseHelper');
var logger = require('../utils/logger');

var actions = {
  buyBattleTimes: null,
  buyTimes: null,
  checkBattleResult: null,
  friendBattle: null,
  getInfo: null,
  getRankInfo: null,
  recoverHero: null,
  setTeam: null,
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
    logger.warn('StrongEnemy', 'Unknown action: ' + action);
    ResponseHelper.sendResponse(socket, 'handler.process',
      ResponseHelper.error(ResponseHelper.ErrorCode.INVALID_COMMAND), callback);
  }
}

module.exports = { handle: handle };
