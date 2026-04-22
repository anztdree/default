/**
 * Questionnaire Handler — Main Server
 * 
 * Actions: submitQuestionnaire
 */

var ResponseHelper = require('../core/responseHelper');
var logger = require('../utils/logger');

function handle(socket, request, callback) {
  var action = request.action;
  logger.warn('Questionnaire', 'Not implemented: ' + (action || 'unknown'));
  ResponseHelper.sendResponse(socket, 'handler.process',
    ResponseHelper.error(ResponseHelper.ErrorCode.INVALID_COMMAND), callback);
}

module.exports = { handle: handle };
