/**
 * =====================================================
 *  Dungeon Auth Middleware — Super Warrior Z Dungeon Server
 * =====================================================
 *
 *  TEA verification handshake for dungeon-server connections.
 *  Same mechanism as main-server and chat-server (verifyEnable=true).
 *
 *  CLIENT FLOW (main.min.js line 52006-52013):
 *    1. Server emits "verify" with 32-char challenge
 *    2. Client encrypts with TEA key "verification"
 *    3. Client emits "verify" with encrypted response + callback
 *    4. Server verifies and responds { ret: 0 }
 *
 * =====================================================
 */

'use strict';

var TEA = require('../../shared/tea');
var RH = require('../../shared/responseHelper');
var logger = require('../../shared/utils/logger');
var LIMITS = require('../utils/dungeonConstants').LIMITS;

/**
 * Setup TEA verification on a newly connected socket.
 *
 * @param {object} socket - Socket.IO socket instance
 * @param {string} teaKey - TEA encryption key
 * @returns {{ destroy: function() }} Cleanup handle
 */
function setupVerification(socket, teaKey) {
    socket._verified = false;
    socket._verifyAttempts = 0;

    var challenge = TEA.generateChallenge();
    socket._challenge = challenge;

    logger.info('DUNGEON', 'auth: Sending challenge to ' + socket.id);
    socket.emit('verify', challenge);

    var verifyTimer = setTimeout(function() {
        if (!socket._verified && socket.connected) {
            logger.warn('DUNGEON', 'auth: Verify timeout for ' + socket.id + ' — disconnecting');
            socket.emit('verifyFailed', 'Verification timeout');
            socket.disconnect(true);
        }
    }, LIMITS.VERIFY_TIMEOUT);

    socket.on('verify', function(encryptedResponse, callback) {
        socket._verifyAttempts++;

        function sendResult(code) {
            if (typeof callback === 'function') {
                callback({
                    ret: code,
                    compress: false,
                    serverTime: Date.now(),
                    server0Time: RH.SERVER_UTC_OFFSET_MS,
                });
            }
        }

        if (socket._verified) {
            sendResult(0);
            return;
        }

        if (!encryptedResponse) {
            if (socket._verifyAttempts >= LIMITS.VERIFY_MAX_ATTEMPTS) {
                clearTimeout(verifyTimer);
                sendResult(38);
                socket.disconnect(true);
            } else {
                sendResult(4);
            }
            return;
        }

        var isValid = TEA.verifyChallenge(challenge, encryptedResponse, teaKey);

        if (isValid) {
            socket._verified = true;
            clearTimeout(verifyTimer);
            logger.info('DUNGEON', 'auth: Verified ' + socket.id + ' (attempt ' + socket._verifyAttempts + ')');
            sendResult(0);
        } else {
            logger.warn('DUNGEON', 'auth: Invalid verify from ' + socket.id +
                ' (attempt ' + socket._verifyAttempts + '/' + LIMITS.VERIFY_MAX_ATTEMPTS + ')');

            if (socket._verifyAttempts >= LIMITS.VERIFY_MAX_ATTEMPTS) {
                clearTimeout(verifyTimer);
                sendResult(38);
                socket.disconnect(true);
            } else {
                sendResult(38);
            }
        }
    });

    return {
        destroy: function() {
            clearTimeout(verifyTimer);
        },
    };
}

/**
 * Guard: check if socket is verified.
 *
 * @param {object} socket
 * @param {function} callback
 * @returns {boolean} true if verified
 */
function requireVerified(socket, callback) {
    if (!socket._verified) {
        RH.sendResponse(socket, 'handler.process', RH.error(6, 'Not verified'), callback);
        return false;
    }
    return true;
}

module.exports = {
    setupVerification: setupVerification,
    requireVerified: requireVerified,
};
