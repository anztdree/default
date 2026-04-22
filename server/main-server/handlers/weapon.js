/**
 * ============================================================================
 * Weapon Handler — Main Server
 * ============================================================================
 * Actions: getRank, levelUpHalo, merge, reborn, resolve, takeOff, upgrade, wear
 */

var ResponseHelper = require('../core/responseHelper');
var logger = require('../utils/logger');

var actions = {
  getRank: null,
  levelUpHalo: null,
  merge: null,
  reborn: null,
  resolve: null,
  takeOff: null,
  upgrade: null,
  wear: null,
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
    logger.warn('Weapon', 'Unknown action: ' + action);
    ResponseHelper.sendResponse(socket, 'handler.process',
      ResponseHelper.error(ResponseHelper.ErrorCode.INVALID_COMMAND), callback);
  }
}

module.exports = { handle: handle };
