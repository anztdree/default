/**
 * ============================================================================
 * Summon Handler — Main Server
 * ============================================================================
 * Actions: getAttrs, luxuryLuck, readWishList, resolve, setWishList, summonEnergy, summonOne, summonOneFree, summonTen
 */

var ResponseHelper = require('../core/responseHelper');
var logger = require('../utils/logger');

var actions = {
  getAttrs: null,
  luxuryLuck: null,
  readWishList: null,
  resolve: null,
  setWishList: null,
  summonEnergy: null,
  summonOne: null,
  summonOneFree: null,
  summonTen: null,
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
    logger.warn('Summon', 'Unknown action: ' + action);
    ResponseHelper.sendResponse(socket, 'handler.process',
      ResponseHelper.error(ResponseHelper.ErrorCode.INVALID_COMMAND), callback);
  }
}

module.exports = { handle: handle };
