/**
 * ============================================================================
 * SuperSkill Handler — Main Server
 * ============================================================================
 * Actions: activeSuperSkill, autoLevelUpSuperSkill, evolveSuperSkill, getRank, levelUpSuperSkill, resetSuperSkill
 */

var ResponseHelper = require('../core/responseHelper');
var logger = require('../utils/logger');

var actions = {
  activeSuperSkill: null,
  autoLevelUpSuperSkill: null,
  evolveSuperSkill: null,
  getRank: null,
  levelUpSuperSkill: null,
  resetSuperSkill: null,
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
    logger.warn('SuperSkill', 'Unknown action: ' + action);
    ResponseHelper.sendResponse(socket, 'handler.process',
      ResponseHelper.error(ResponseHelper.ErrorCode.INVALID_COMMAND), callback);
  }
}

module.exports = { handle: handle };
