/**
 * ============================================================================
 * Arena Handler — Main Server
 * ============================================================================
 * Actions: GAGetTaskReward, buy, getBattleRecord, getDailyReward, getFriendArenaDefenceTeam, getGuildBossInfo, getRank, getRecord, join, queryUserHistory, recharge, select, setTeam, startBattle, sweep, topAward, unlikeComment
 */

var ResponseHelper = require('../core/responseHelper');
var logger = require('../utils/logger');

var actions = {
  GAGetTaskReward: null,
  buy: null,
  getBattleRecord: null,
  getDailyReward: null,
  getFriendArenaDefenceTeam: null,
  getGuildBossInfo: null,
  getRank: null,
  getRecord: null,
  join: null,
  queryUserHistory: null,
  recharge: null,
  select: null,
  setTeam: null,
  startBattle: null,
  sweep: null,
  topAward: null,
  unlikeComment: null,
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
    logger.warn('Arena', 'Unknown action: ' + action);
    ResponseHelper.sendResponse(socket, 'handler.process',
      ResponseHelper.error(ResponseHelper.ErrorCode.INVALID_COMMAND), callback);
  }
}

module.exports = { handle: handle };
