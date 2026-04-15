/**
 * =====================================================
 *  middleware/index.js — Middleware Bundle Export
 *  Super Warrior Z Game Server — Main Server
 *
 *  Mengexport semua middleware modules sebagai satu bundle.
 *  Handler modules cukup require('./middleware') untuk
 *  mengakses semua middleware dan service dependencies.
 *
 *  Penggunaan:
 *    var middleware = require('./middleware');
 *    middleware.teaAuth.verifySocket(socket, next);
 *    middleware.requestValidator.validate(parsed);
 *    middleware.notifications.sendNotify(socket, 'kickout', {});
 * =====================================================
 */

'use strict';

var teaAuth = require('./teaAuth');
var requestValidator = require('./requestValidator');

module.exports = {
    teaAuth: teaAuth,
    requestValidator: requestValidator
};
