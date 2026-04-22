/**
 * ============================================================================
 * Scheduler — Daily reset, stamina recovery
 * ============================================================================
 *
 * Two jobs:
 *   1. Daily Reset  — runs once per day at DAILY_RESET_HOUR (default 06:00)
 *      Resets: dungeon counts, sign-in, daily tasks, arena tickets, etc.
 *
 *   2. Stamina Recovery — runs every STAMINA_RECOVERY_MS (default 5 min)
 *      Increments stamina for all users who are below max.
 *      Uses server local time (UTC+7).
 *
 * Both jobs use setInterval/setTimeout — no external cron library needed.
 * ============================================================================
 */

var logger     = require('../utils/logger');
var DailyReset = require('./dailyReset');
var Recovery   = require('./recovery');
var CONSTANTS  = require('../config/constants');

var _dailyResetTimer  = null;
var _recoveryTimer    = null;
var _connectedClients = null;

// ============================================
// INIT ALL
// ============================================

/**
 * Initialize and start all scheduler jobs
 * @param {Object} connectedClients - userId → socket map from index.js
 */
function initAll(connectedClients) {
  _connectedClients = connectedClients;

  _startDailyReset();
  _startStaminaRecovery();

  logger.info('Scheduler', 'All jobs started');
}

// ============================================
// JOB 1 — Daily Reset
// ============================================

/**
 * Schedule daily reset at DAILY_RESET_HOUR:DAILY_RESET_MINUTE (server local time)
 * Uses recursive setTimeout to always fire at the exact target time.
 */
function _startDailyReset() {
  var msUntilNext = _msUntilNextReset();
  logger.info('Scheduler', 'Daily reset in ' + Math.round(msUntilNext / 60000) + ' min');

  _dailyResetTimer = setTimeout(function _resetTick() {
    logger.info('Scheduler', 'Daily reset firing...');

    DailyReset.run(_connectedClients);

    // Schedule the next one exactly 24 hours later
    _dailyResetTimer = setTimeout(_resetTick, 24 * 60 * 60 * 1000);
  }, msUntilNext);
}

/**
 * Calculate milliseconds until the next reset time
 * @returns {number}
 */
function _msUntilNextReset() {
  var now         = new Date();
  var targetHour  = CONSTANTS.SCHEDULER.DAILY_RESET_HOUR;
  var targetMin   = CONSTANTS.SCHEDULER.DAILY_RESET_MINUTE;

  var next = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    targetHour,
    targetMin,
    0, 0
  );

  if (next <= now) {
    // Already passed today — schedule for tomorrow
    next.setDate(next.getDate() + 1);
  }

  return next.getTime() - now.getTime();
}

// ============================================
// JOB 2 — Stamina Recovery
// ============================================

/**
 * Start stamina recovery tick every STAMINA_RECOVERY_MS
 */
function _startStaminaRecovery() {
  var intervalMs = CONSTANTS.SCHEDULER.STAMINA_RECOVERY_MS;
  logger.info('Scheduler', 'Stamina recovery every ' + (intervalMs / 60000) + ' min');

  _recoveryTimer = setInterval(function() {
    Recovery.run(_connectedClients);
  }, intervalMs);
}

// ============================================
// SHUTDOWN
// ============================================

/**
 * Stop all scheduler jobs cleanly
 */
function shutdown() {
  if (_dailyResetTimer) {
    clearTimeout(_dailyResetTimer);
    _dailyResetTimer = null;
  }
  if (_recoveryTimer) {
    clearInterval(_recoveryTimer);
    _recoveryTimer = null;
  }
  logger.info('Scheduler', 'Shutdown complete');
}

// ============================================
// EXPORT
// ============================================

module.exports = {
  initAll:  initAll,
  shutdown: shutdown,
};
