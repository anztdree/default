/**
 * ============================================================================
 * Stamina Recovery — tick every 5 minutes
 * ============================================================================
 *
 * Logic:
 *   For each user whose stamina < STAMINA_MAX:
 *     stamina += STAMINA_RECOVERY_PER_TICK (default 1)
 *     stamina_last_recover_time = now
 *
 * Only recovers for users stored in DB — not just online users.
 * This ensures offline users also accumulate stamina correctly.
 *
 * Online users receive an itemChange Notify so their UI updates live.
 * Offline users see correct stamina on next enterGame.
 * ============================================================================
 */

var logger        = require('../utils/logger');
var DB            = require('../services/db');
var Notifications = require('../notifications');
var CONSTANTS     = require('../config/constants');

var MAX_STAMINA        = CONSTANTS.MAX_LIMITS.STAMINA_MAX;
var RECOVERY_PER_TICK  = CONSTANTS.MAX_LIMITS.STAMINA_RECOVERY_PER_TICK;

/**
 * Run one stamina recovery tick
 * @param {Object} connectedClients - userId → socket map
 */
async function run(connectedClients) {
  if (!DB.isReady()) return;

  try {
    // Update all users below max stamina in one query
    var result = await DB.query(
      `UPDATE game_users
       SET stamina = LEAST(stamina + ?, ?),
           stamina_last_recover_time = ?
       WHERE stamina < ?`,
      [RECOVERY_PER_TICK, MAX_STAMINA, Date.now(), MAX_STAMINA]
    );

    var affected = result && result.affectedRows ? result.affectedRows : 0;
    if (affected > 0) {
      logger.debug('Recovery', 'Stamina recovered for ' + affected + ' users');

      // Notify online users whose stamina changed
      _notifyOnlineUsers(connectedClients);
    }

  } catch (err) {
    logger.error('Recovery', 'Stamina recovery failed: ' + err.message);
  }
}

// ============================================
// NOTIFY online users
// ============================================

/**
 * Push itemChange notify to each online user so their stamina bar updates
 * @param {Object} connectedClients
 */
async function _notifyOnlineUsers(connectedClients) {
  if (!connectedClients || !DB.isReady()) return;

  var userIds = Object.keys(connectedClients);
  if (userIds.length === 0) return;

  for (var i = 0; i < userIds.length; i++) {
    var userId = userIds[i];
    var socket = connectedClients[userId];
    if (!socket || !socket._verified || !socket.connected) continue;

    try {
      // Fetch current stamina for this user
      var row = await DB.queryOne(
        'SELECT stamina FROM game_users WHERE user_id = ?',
        [userId]
      );
      if (!row) continue;

      // Only notify if they were below max (they just recovered)
      if (row.stamina < MAX_STAMINA || row.stamina === MAX_STAMINA) {
        Notifications.sendToUser(userId, Notifications.ActionTypes.ITEM_CHANGE, {
          stamina: row.stamina,
        });
      }
    } catch (e) {
      // Non-critical — skip this user
    }
  }
}

// ============================================
// EXPORT
// ============================================

module.exports = {
  run: run,
};
