/**
 * ============================================================================
 * HeroImage Handler — Main Server
 * ============================================================================
 * Actions: addComment, autoWear, getAll, getAttrs, getBossList, getComments, likeComment, readHeroVersion, removeChild, setMainHero, unlikeComment
 */

var ResponseHelper = require('../core/responseHelper');
var logger = require('../utils/logger');

var actions = {
  addComment: null,
  autoWear: null,
  getAll: null,
  getAttrs: null,
  getBossList: null,
  getComments: null,
  likeComment: null,
  readHeroVersion: null,
  removeChild: null,
  setMainHero: null,
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
    logger.warn('HeroImage', 'Unknown action: ' + action);
    ResponseHelper.sendResponse(socket, 'handler.process',
      ResponseHelper.error(ResponseHelper.ErrorCode.INVALID_COMMAND), callback);
  }
}

module.exports = { handle: handle };
