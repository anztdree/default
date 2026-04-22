/**
 * ============================================================================
 * Equip Handler — Main Server
 * ============================================================================
 * Actions: activeRing, activeWeapon, autoMerge, autoRingLevelUp, merge, ringEvolve, saveFastTeam, takeOff, takeOffAuto, wear, wearAuto, wish
 */

var ResponseHelper = require('../core/responseHelper');
var logger = require('../utils/logger');

var actions = {
  activeRing: null,
  activeWeapon: null,
  autoMerge: null,
  autoRingLevelUp: null,
  merge: null,
  ringEvolve: null,
  saveFastTeam: null,
  takeOff: null,
  takeOffAuto: null,
  wear: null,
  wearAuto: null,
  wish: null,
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
    logger.warn('Equip', 'Unknown action: ' + action);
    ResponseHelper.sendResponse(socket, 'handler.process',
      ResponseHelper.error(ResponseHelper.ErrorCode.INVALID_COMMAND), callback);
  }
}

module.exports = { handle: handle };
