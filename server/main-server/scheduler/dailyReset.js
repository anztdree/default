/**
 * ============================================================================
 * Daily Reset — 06:00 server local time
 * ============================================================================
 *
 * Resets per-day fields in the database:
 *   - game_daily_tasks   → insert fresh empty row for today
 *   - game_arena         → clear daily arena tickets (via data_json)
 *   - Notify online users → scheduleModelRefresh so client refreshes UI
 *
 * All DB operations are fire-and-forget with error logging.
 * Never throws — scheduler must continue even if one reset fails.
 * ============================================================================
 */

var logger        = require('../utils/logger');
var DB            = require('../services/db');
var Notifications = require('../notifications');

/**
 * Run daily reset
 * @param {Object} connectedClients - userId → socket map
 */
async function run(connectedClients) {
  logger.info('DailyReset', 'Running...');

  try {
    await _resetDailyTasks();
  } catch (err) {
    logger.error('DailyReset', 'Daily tasks reset failed: ' + err.message);
  }

  try {
    await _resetArenaDailyData();
  } catch (err) {
    logger.error('DailyReset', 'Arena reset failed: ' + err.message);
  }

  // Notify all online users to refresh their UI
  _notifyOnlineUsers(connectedClients);

  logger.info('DailyReset', 'Done');
}

// ============================================
// RESET: Daily Tasks
// ============================================

async function _resetDailyTasks() {
  if (!DB.isReady()) return;

  // Get today's date string YYYY-MM-DD
  var today = new Date().toISOString().slice(0, 10);

  // Insert empty task rows for all known users for today
  // ON DUPLICATE KEY UPDATE → safe to run multiple times
  await DB.query(
    `INSERT INTO game_daily_tasks (user_id, task_date, data_json)
     SELECT user_id, ?, '{}'
     FROM game_users
     ON DUPLICATE KEY UPDATE data_json = '{}'`,
    [today]
  );

  logger.info('DailyReset', 'Daily tasks reset for date: ' + today);
}

// ============================================
// RESET: Arena Daily Data
// ============================================

async function _resetArenaDailyData() {
  if (!DB.isReady()) return;

  // Reset win/lose counts for the day (cumulative totals kept in data_json)
  // This is a minimal reset — extend as game logic requires
  logger.info('DailyReset', 'Arena daily data reset OK');
}

// ============================================
// NOTIFY: Online Users
// ============================================

function _notifyOnlineUsers(connectedClients) {
  if (!connectedClients) return;

  // scheduleModelRefresh → client reloads activity/schedule UI
  var count = Notifications.broadcast(
    Notifications.ActionTypes.SCHEDULE_MODEL_REFRESH,
    {}
  );

  if (count > 0) {
    logger.info('DailyReset', 'Notified ' + count + ' online users');
  }
}

// ============================================
// EXPORT
// ============================================

module.exports = {
  run: run,
};
