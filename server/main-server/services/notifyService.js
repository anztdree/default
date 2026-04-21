/**
 * ============================================================================
 *  Notification Service — Push messages to specific users
 *
 *  Client listens on "Notify" event:
 *    socket.on("Notify", function(t) {
 *        if ("SUCCESS" == t.ret) {
 *            var n = t.data;
 *            if (t.compress) n = LZString.decompressFromUTF16(n);
 *            var o = JSON.parse(n);
 *            if ("Kickout" == o.action) { ... return; }
 *            ts.notifyData(o);
 *        }
 *    })
 *
 *  Push format: { ret: "SUCCESS", data: JSON_string, compress: false, serverTime }
 * ============================================================================
 */

var ResponseHelper = require('../core/responseHelper');
var logger = require('../utils/logger');

/**
 * @param {Object.<number, Object>} connectedClients - userId → socket map (from index.js)
 */
function NotifyService(connectedClients) {
    this.clients = connectedClients || {};
}

/**
 * Send push notification to a specific user
 * @param {number} userId
 * @param {string} action - Notify action type (e.g. 'itemChange', 'heroBackpackFull')
 * @param {object} data - Notification payload
 * @returns {boolean} true if sent successfully
 */
NotifyService.prototype.sendToUser = function (userId, action, data) {
    var socket = this.clients[userId];
    if (!socket || !socket._verified || !socket.connected) {
        return false;
    }

    var payload = Object.assign({ action: action }, data);
    var response = ResponseHelper.push(payload);

    try {
        socket.emit('Notify', response);
        logger.info('Notify', 'Push to userId=' + userId + ' action=' + action);
        return true;
    } catch (err) {
        logger.error('Notify', 'Send failed userId=' + userId + ': ' + err.message);
        return false;
    }
};

/**
 * Broadcast notification to all connected users
 * @param {string} action
 * @param {object} data
 * @returns {number} Number of users notified
 */
NotifyService.prototype.broadcast = function (action, data) {
    var count = 0;
    var payload = Object.assign({ action: action }, data);
    var response = ResponseHelper.push(payload);

    var keys = Object.keys(this.clients);
    for (var i = 0; i < keys.length; i++) {
        var socket = this.clients[keys[i]];
        if (socket && socket._verified && socket.connected) {
            try {
                socket.emit('Notify', response);
                count++;
            } catch (e) {
                // skip
            }
        }
    }

    if (count > 0) {
        logger.info('Notify', 'Broadcast action=' + action + ' to ' + count + ' users');
    }
    return count;
};

/**
 * Kick a user (sends Kickout notify, then disconnects)
 * @param {Object} socket - Socket.IO socket
 * @param {string} [reason] - Kick reason
 */
NotifyService.prototype.kickUser = function (socket, reason) {
    if (!socket || !socket.connected) return;

    var response = ResponseHelper.push({ action: 'Kickout', reason: reason || 'Kicked by server' });
    try {
        socket.emit('Notify', response);
        setTimeout(function () {
            if (socket.connected) socket.disconnect(true);
        }, 500);
    } catch (e) {
        if (socket.connected) socket.disconnect(true);
    }
};

module.exports = NotifyService;
