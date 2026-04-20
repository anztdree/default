'use strict';

var RH = require('../../../shared/responseHelper');
var logger = require('../../../shared/utils/logger');

function handle(socket, parsed, callback) {
    var userId = parsed.userId;
    logger.info('ACTIVITY', 'activityGetTaskReward userId=' + userId);

    // TODO: Implement

    callback(RH.success({}));
}

module.exports = { handle: handle };
