/**
 * ============================================================================
 * Resonance Handler — Main Server
 * ============================================================================
 * Actions: addComment, buySeat, clearSeatCD, evolve, putChild, removeChild, setMainHero
 */

var ResponseHelper = require('../core/responseHelper');
var logger = require('../utils/logger');

var actions = {
  addComment: null,
  buySeat: null,
  clearSeatCD: null,
  evolve: null,
  putChild: null,
  removeChild: null,
  setMainHero: null,
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
    logger.warn('Resonance', 'Unknown action: ' + action);
    ResponseHelper.sendResponse(socket, 'handler.process',
      ResponseHelper.error(ResponseHelper.ErrorCode.INVALID_COMMAND), callback);
  }
}

module.exports = { handle: handle };
