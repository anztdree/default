/**
 * ============================================================================
 *  Session Manager — CRUD operations untuk session data
 *  ============================================================================
 *
 *  Mengelola session di data/sessions.json.
 *
 *  Data format (dari existing data/sessions.json):
 *  {
 *    "sessions": {
 *      "mnvwij4q_7b367e2dbeb88523dd136e33a3b7b809c25d71e282f1466c": {
 *        "userId": "1",
 *        "createdAt": "2026-04-12T15:11:07.618Z",
 *        "expiresAt": 1776611467617
 *      }
 *    }
 *  }
 *
 *  Key = loginToken (string)
 *  Value = { userId, createdAt, expiresAt }
 *  expiresAt = Date.now() + 7 hari (epoch ms)
 *
 *  CRITICAL FIX dari existing code (fix S10):
 *    - cleanupExpiredSessions() defined tapi TIDAK pernah dipanggil.
 *    - Sekarang cleanup otomatis via startCleanupInterval().
 *
 * ============================================================================
 */

var store = require('../storage/jsonStore');
var CONSTANTS = require('../config/constants');

// File path
var SESSIONS_FILE = store.buildPath('sessions.json');

// =============================================
// DATA ACCESS
// =============================================

/**
 * Load seluruh sessions data.
 * @returns {{ sessions: Object.<string, Object> }}
 */
function loadSessions() {
    return store.load(SESSIONS_FILE, { sessions: {} });
}

/**
 * Save seluruh sessions data.
 * @param {{ sessions: Object.<string, Object> }} data
 * @returns {boolean}
 */
function saveSessions(data) {
    return store.save(SESSIONS_FILE, data);
}

// =============================================
// SESSION OPERATIONS
// =============================================

/**
 * Buat session baru.
 *
 * @param {string} userId - User ID
 * @param {string} loginToken - Login token (jadi key session)
 * @returns {boolean} true jika berhasil
 */
function create(userId, loginToken) {
    var data = loadSessions();

    data.sessions[loginToken] = {
        userId: String(userId),
        createdAt: new Date().toISOString(),
        expiresAt: Date.now() + CONSTANTS.SESSION_DURATION_MS
    };

    return saveSessions(data);
}

/**
 * Validasi apakah session masih aktif.
 *
 * Logic:
 *   1. Cek apakah loginToken ada di sessions
 *   2. Cek apakah userId cocok
 *   3. Cek apakah belum expired
 *   4. Jika expired → auto-delete dan return false
 *
 * @param {string} userId - User ID
 * @param {string} loginToken - Login token
 * @returns {boolean} true jika session valid
 */
function validate(userId, loginToken) {
    var data = loadSessions();
    var session = data.sessions[loginToken];

    if (!session) {
        return false;
    }

    // userId tidak cocok
    if (session.userId !== String(userId)) {
        return false;
    }

    // Session expired → hapus
    if (Date.now() > session.expiresAt) {
        delete data.sessions[loginToken];
        saveSessions(data);
        return false;
    }

    return true;
}

/**
 * Hapus session.
 *
 * @param {string} loginToken - Login token
 * @returns {boolean} true jika berhasil
 */
function destroy(loginToken) {
    var data = loadSessions();

    if (data.sessions[loginToken]) {
        delete data.sessions[loginToken];
        return saveSessions(data);
    }

    return true; // Already gone
}

/**
 * Get session data (tanpa validasi).
 *
 * @param {string} loginToken - Login token
 * @returns {Object|null} Session object atau null
 */
function get(loginToken) {
    var data = loadSessions();
    return data.sessions[loginToken] || null;
}

// =============================================
// CLEANUP
// =============================================

/**
 * Cleanup expired sessions.
 * Dipanggil periodik via startCleanupInterval().
 *
 * @returns {number} Jumlah session yang dihapus
 */
function cleanupExpired() {
    var data = loadSessions();
    var keys = Object.keys(data.sessions);
    var now = Date.now();
    var removed = 0;

    for (var i = 0; i < keys.length; i++) {
        if (now > data.sessions[keys[i]].expiresAt) {
            delete data.sessions[keys[i]];
            removed++;
        }
    }

    if (removed > 0) {
        saveSessions(data);
        console.log('[Sessions] Cleaned up ' + removed + ' expired sessions');
    }

    return removed;
}

/**
 * Start periodic cleanup interval.
 *
 * @returns {number} Interval ID
 */
function startCleanupInterval() {
    return setInterval(function () {
        cleanupExpired();
    }, CONSTANTS.SESSION_CLEANUP_INTERVAL_MS);
}

/**
 * Get active session count.
 * @returns {number}
 */
function getActiveCount() {
    var data = loadSessions();
    return Object.keys(data.sessions).length;
}

module.exports = {
    create: create,
    validate: validate,
    destroy: destroy,
    get: get,
    cleanupExpired: cleanupExpired,
    startCleanupInterval: startCleanupInterval,
    getActiveCount: getActiveCount
};
