/**
 * ============================================================================
 * BossCompetition Handler — Main Server
 * ============================================================================
 * Actions: attackBoss, attackOwner, autoFight, buyTimes, friendBattle, getBossList, getDetail, getFriend, getRankInfo, join, startBattle
 */

var ResponseHelper = require('../core/responseHelper');
var logger = require('../utils/logger');

var actions = {
  attackBoss: null,
  attackOwner: null,
  autoFight: null,
  buyTimes: null,
  friendBattle: null,
  getBossList: null,
  getDetail: null,
  getFriend: null,
  getRankInfo: null,
  join: null,
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
    logger.warn('BossCompetition', 'Unknown action: ' + action);
    ResponseHelper.sendResponse(socket, 'handler.process',
      ResponseHelper.error(ResponseHelper.ErrorCode.INVALID_COMMAND), callback);
  }
}

module.exports = { handle: handle };
