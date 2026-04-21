/**
 * ============================================================================
 * SDK Server — Session Manager (Natural Implementation)
 * ============================================================================
 *
 * Session CRUD in data/sessions.json
 * 
 * Natural approach:
 * - No race conditions (single-threaded Node.js)
 * - Atomic file operations via jsonStore
 * - Clean session lifecycle management
 *
 * ============================================================================
 */

const store = require('../storage/jsonStore');
const CONSTANTS = require('../config/constants');
const logger = require('../utils/logger');

const SESSIONS_FILE = store.buildPath('sessions.json');

// =============================================
// DATA ACCESS
// =============================================

/**
 * Load sessions data
 * @returns {Object} Sessions data with sessions{} and meta{}
 */
function loadSessions() {
    return store.load(SESSIONS_FILE, { sessions: {}, meta: { createdAt: new Date().toISOString() } });
}

/**
 * Save sessions data atomically
 * @param {Object} data - Sessions data
 * @returns {boolean} Success
 */
function saveSessions(data) {
    return store.save(SESSIONS_FILE, data);
}

// =============================================
// CORE OPERATIONS
// =============================================

/**
 * Create new session
 * 
 * @param {string} userId - User ID
 * @param {string} loginToken - Login token
 * @returns {boolean} Success
 */
function create(userId, loginToken) {
    const data = loadSessions();
    
    const session = {
        userId: String(userId),
        createdAt: new Date().toISOString(),
        expiresAt: Date.now() + CONSTANTS.SESSION_DURATION_MS
    };
    
    data.sessions[loginToken] = session;
    
    return saveSessions(data);
}

/**
 * Validate session
 * Checks: token exists, userId matches, not expired
 * Auto-deletes expired sessions
 * 
 * @param {string} userId - User ID to verify
 * @param {string} loginToken - Login token
 * @returns {boolean} Valid or not
 */
function validate(userId, loginToken) {
    const data = loadSessions();
    const session = data.sessions[loginToken];
    
    // Token not found
    if (!session) {
        return false;
    }
    
    // UserId mismatch
    if (session.userId !== String(userId)) {
        return false;
    }
    
    // Check expiry
    if (Date.now() > session.expiresAt) {
        // Auto-cleanup expired session
        delete data.sessions[loginToken];
        saveSessions(data);
        return false;
    }
    
    return true;
}

/**
 * Get session info without validation
 * 
 * @param {string} loginToken - Login token
 * @returns {Object|null} Session data or null
 */
function get(loginToken) {
    const data = loadSessions();
    return data.sessions[loginToken] || null;
}

// =============================================
// DESTRUCTION
// =============================================

/**
 * Destroy single session by token
 * 
 * @param {string} loginToken - Login token
 * @returns {boolean} Success
 */
function destroy(loginToken) {
    const data = loadSessions();
    
    if (data.sessions[loginToken]) {
        delete data.sessions[loginToken];
        return saveSessions(data);
    }
    
    // Token not found - still success (idempotent)
    return true;
}

/**
 * Destroy ALL sessions for a user (atomic approach)
 * 
 * This ensures no orphan sessions when user re-logs in.
 * We load, filter, save in one operation.
 * 
 * @param {string} userId - User ID
 * @returns {number} Number of sessions destroyed
 */
function destroyAllByUserId(userId) {
    const data = loadSessions();
    const target = String(userId);
    const keys = Object.keys(data.sessions);
    let destroyed = 0;
    
    // Build new sessions object without target user's sessions
    const newSessions = {};
    for (const key of keys) {
        if (data.sessions[key].userId !== target) {
            newSessions[key] = data.sessions[key];
        } else {
            destroyed++;
        }
    }
    
    // Only save if we actually removed something
    if (destroyed > 0) {
        data.sessions = newSessions;
        saveSessions(data);
    }
    
    return destroyed;
}

/**
 * Destroy all sessions (admin function)
 * 
 * @returns {number} Number of sessions destroyed
 */
function destroyAll() {
    const data = loadSessions();
    const count = Object.keys(data.sessions).length;
    
    data.sessions = {};
    saveSessions(data);
    
    return count;
}

// =============================================
// CLEANUP
// =============================================

/**
 * Remove all expired sessions
 * Called periodically by startCleanupInterval()
 * 
 * @returns {number} Number of sessions removed
 */
function cleanupExpired() {
    const data = loadSessions();
    const keys = Object.keys(data.sessions);
    const now = Date.now();
    let removed = 0;
    
    // Build new sessions without expired
    const newSessions = {};
    for (const key of keys) {
        if (now <= data.sessions[key].expiresAt) {
            newSessions[key] = data.sessions[key];
        } else {
            removed++;
        }
    }
    
    if (removed > 0) {
        data.sessions = newSessions;
        saveSessions(data);
        logger.info('Session', `Cleaned ${removed} expired sessions`);
    }
    
    return removed;
}

/**
 * Start periodic cleanup
 * 
 * @returns {Interval} Timer reference
 */
function startCleanupInterval() {
    return setInterval(() => {
        cleanupExpired();
    }, CONSTANTS.SESSION_CLEANUP_INTERVAL_MS);
}

// =============================================
// STATS
// =============================================

/**
 * Get active session count
 * 
 * @returns {number} Active sessions (non-expired)
 */
function getActiveCount() {
    const data = loadSessions();
    const keys = Object.keys(data.sessions);
    const now = Date.now();
    let count = 0;
    
    for (const key of keys) {
        if (now <= data.sessions[key].expiresAt) {
            count++;
        }
    }
    
    return count;
}

/**
 * Get total session count (including expired, not auto-cleaned)
 * 
 * @returns {number} Total sessions in store
 */
function getTotalCount() {
    const data = loadSessions();
    return Object.keys(data.sessions).length;
}

/**
 * Get sessions for specific user
 * 
 * @param {string} userId - User ID
 * @returns {string[]} Array of login tokens
 */
function getUserTokens(userId) {
    const data = loadSessions();
    const target = String(userId);
    const tokens = [];
    
    for (const [token, session] of Object.entries(data.sessions)) {
        if (session.userId === target) {
            tokens.push(token);
        }
    }
    
    return tokens;
}

/**
 * Get session statistics
 * 
 * @returns {Object} Session stats
 */
function getStats() {
    const data = loadSessions();
    const keys = Object.keys(data.sessions);
    const now = Date.now();
    
    let active = 0;
    let expired = 0;
    const byUser = {};
    
    for (const key of keys) {
        const session = data.sessions[key];
        if (now <= session.expiresAt) {
            active++;
        } else {
            expired++;
        }
        
        if (!byUser[session.userId]) {
            byUser[session.userId] = 0;
        }
        byUser[session.userId]++;
    }
    
    return {
        total: keys.length,
        active,
        expired,
        uniqueUsers: Object.keys(byUser).length,
        sessionsByUser: byUser
    };
}

// =============================================
// EXTEND SESSION
// =============================================

/**
 * Extend session expiration (refresh)
 * 
 * @param {string} loginToken - Login token
 * @returns {boolean} Success
 */
function extend(loginToken) {
    const data = loadSessions();
    const session = data.sessions[loginToken];
    
    if (!session) {
        return false;
    }
    
    session.expiresAt = Date.now() + CONSTANTS.SESSION_DURATION_MS;
    return saveSessions(data);
}

// =============================================
// EXPORT
// =============================================

module.exports = {
    // Core
    create,
    validate,
    get,
    
    // Destruction
    destroy,
    destroyAllByUserId,
    destroyAll,
    
    // Cleanup
    cleanupExpired,
    startCleanupInterval,
    
    // Stats
    getActiveCount,
    getTotalCount,
    getUserTokens,
    getStats,
    
    // Utility
    extend
};