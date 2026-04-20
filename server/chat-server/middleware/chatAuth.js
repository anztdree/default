/**
 * =====================================================
 *  Chat Auth Middleware — Super Warrior Z Chat Server
 * =====================================================
 *
 *  Handles TEA verification handshake for chat-server connections.
 *  Same mechanism as main-server (verifyEnable=true).
 *
 *  CLIENT FLOW (main.min.js line 52006-52013):
 *    1. Server emits "verify" with 32-char challenge
 *    2. Client encrypts with TEA key "verification"
 *    3. Client emits "verify" with encrypted response + callback
 *    4. Server verifies and responds { ret: 0 }
 *    5. Client proceeds with chat login
 *
 *  This middleware wraps the verify logic so index.js stays clean.
 * =====================================================
 */

'use strict';

var TEA = require('../../shared/tea');
var RH = require('../../shared/responseHelper');
var logger = require('../../shared/utils/logger');
var LIMITS = require('../utils/chatConstants').LIMITS;

/**
 * Setup TEA verification on a newly connected socket.
 *
 * After calling this, the socket will have:
 *   - socket._verified = false (set to true on success)
 *   - socket._verifyAttempts = 0
 *   - socket._challenge = the challenge string
 *
 * The verify timer auto-disconnects the socket after VERIFY_TIMEOUT
 * if verification is not completed.
 *
 * @param {object} socket - Socket.IO socket instance
 * @param {string} teaKey - TEA encryption key (from config)
 * @returns {{ destroy: function() }} Cleanup handle — call on disconnect
 */
function setupVerification(socket, teaKey) {
    socket._verified = false;
    socket._verifyAttempts = 0;

    var challenge = TEA.generateChallenge();
    socket._challenge = challenge;

    logger.info('CHAT', 'auth: Sending challenge to ' + socket.id);
    socket.emit('verify', challenge);

    var verifyTimer = setTimeout(function() {
        if (!socket._verified && socket.connected) {
            logger.warn('CHAT', 'auth: Verify timeout for ' + socket.id + ' — disconnecting');
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

        // Already verified — just confirm
        if (socket._verified) {
            sendResult(0);
            return;
        }

        // No response provided
        if (!encryptedResponse) {
            if (socket._verifyAttempts >= LIMITS.VERIFY_MAX_ATTEMPTS) {
                clearTimeout(verifyTimer);
                sendResult(38);  // LOGIN_CHECK_FAILED
                socket.disconnect(true);
            } else {
                sendResult(4);   // INVALID
            }
            return;
        }

        // Verify the encrypted response
        var isValid = TEA.verifyChallenge(challenge, encryptedResponse, teaKey);

        if (isValid) {
            socket._verified = true;
            clearTimeout(verifyTimer);
            logger.info('CHAT', 'auth: Verified ' + socket.id + ' (attempt ' + socket._verifyAttempts + ')');
            sendResult(0);
        } else {
            logger.warn('CHAT', 'auth: Invalid verify from ' + socket.id +
                ' (attempt ' + socket._verifyAttempts + '/' + LIMITS.VERIFY_MAX_ATTEMPTS + ')');

            if (socket._verifyAttempts >= LIMITS.VERIFY_MAX_ATTEMPTS) {
                clearTimeout(verifyTimer);
                sendResult(38);  // LOGIN_CHECK_FAILED
                socket.disconnect(true);
            } else {
                sendResult(38);  // LOGIN_CHECK_FAILED
            }
        }
    });

    // Return cleanup handle
    return {
        /**
         * Clear the verify timer. Call on disconnect.
         */
        destroy: function() {
            clearTimeout(verifyTimer);
        },
    };
}

/**
 * Middleware guard: check if socket is verified.
 * Returns an error response if not verified.
 *
 * @param {object} socket
 * @param {function} callback - Socket.IO callback
 * @returns {boolean} true if verified, false if not (error already sent)
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
