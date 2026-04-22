/**
 * ============================================================================
 * Shop Handler — Main Server
 * ============================================================================
 * Actions: buy, getGuildDetail, getInfo, getRank, readNew, refresh, useItem
 */

var ResponseHelper = require('../core/responseHelper');
var logger = require('../utils/logger');

var actions = {
  buy: null,
  getGuildDetail: null,
  getInfo: null,
  getRank: null,
  readNew: null,
  refresh: null,
  useItem: null,
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
    logger.warn('Shop', 'Unknown action: ' + action);
    ResponseHelper.sendResponse(socket, 'handler.process',
      ResponseHelper.error(ResponseHelper.ErrorCode.INVALID_COMMAND), callback);
  }
}

module.exports = { handle: handle };
