/**
 * db.js — LOGIN-SERVER Database Module
 * Referensi: login-server.md v3.0 Section 7
 *
 * Database: better-sqlite3 WAL mode
 * File: ./data/login_server.db
 * Tables: login_history, user_servers, user_enter_info, user_language
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const logger = require('./logger');

const DB_DIR = path.join(__dirname, 'data');
const DB_PATH = path.join(DB_DIR, 'login_server.db');

// Ensure data directory exists
if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
}

// ─── Initialize Database ───
const db = new Database(DB_PATH);

// WAL mode for performance
db.pragma('journal_mode = WAL');

// ─── Create Tables ───
// Referensi: login-server.md v3.0 Section 7.1-7.4
db.exec(`
    CREATE TABLE IF NOT EXISTS login_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId TEXT NOT NULL,
        serverId TEXT NOT NULL,
        channelCode TEXT NOT NULL DEFAULT 'ppgame',
        securityCode TEXT,
        loginTime INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_login_history_user_time
        ON login_history(userId, loginTime DESC);

    CREATE TABLE IF NOT EXISTS user_servers (
        userId TEXT NOT NULL,
        serverId TEXT NOT NULL,
        lastPlayed INTEGER NOT NULL,
        PRIMARY KEY (userId, serverId)
    );

    CREATE INDEX IF NOT EXISTS idx_user_servers_user
        ON user_servers(userId, lastPlayed DESC);

    CREATE TABLE IF NOT EXISTS user_enter_info (
        userId TEXT PRIMARY KEY,
        channelCode TEXT NOT NULL DEFAULT 'ppgame',
        createTime INTEGER,
        userLevel INTEGER DEFAULT 0,
        updatedAt INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS user_language (
        userId TEXT PRIMARY KEY,
        language TEXT NOT NULL DEFAULT 'en',
        sdk TEXT DEFAULT 'ppgame',
        updatedAt INTEGER NOT NULL
    );
`);

logger.log('INFO', 'DB', 'Database initialized');
logger.details('data',
    ['tables', 'login_history, user_servers, user_enter_info, user_language'],
    ['mode', 'WAL'],
    ['path', DB_PATH]
);

// ═══════════════════════════════════════════════════════════════
// LOGIN HISTORY OPERATIONS
// Referensi: login-server.md v3.0 Section 9.2
// ═══════════════════════════════════════════════════════════════

/**
 * Insert a login history record
 * @param {object} params - { userId, serverId, channelCode, securityCode }
 */
function insertLoginHistory(params) {
    const now = Date.now();
    const stmt = db.prepare(`
        INSERT INTO login_history (userId, serverId, channelCode, securityCode, loginTime)
        VALUES (@userId, @serverId, @channelCode, @securityCode, @loginTime)
    `);
    stmt.run({
        userId: params.userId,
        serverId: params.serverId,
        channelCode: params.channelCode || 'ppgame',
        securityCode: params.securityCode || '',
        loginTime: now
    });
}

/**
 * Get today's login count for a user
 * @param {string} userId
 * @returns {number}
 */
function getTodayLoginCount(userId) {
    const stmt = db.prepare(`
        SELECT COUNT(*) as count FROM login_history
        WHERE userId = ? AND date(loginTime / 1000, 'unixepoch') = date('now')
    `);
    const row = stmt.get(userId);
    return row ? row.count : 0;
}

// ═══════════════════════════════════════════════════════════════
// USER SERVERS OPERATIONS
// Referensi: login-server.md v3.0 Section 9.1, 9.2
// ═══════════════════════════════════════════════════════════════

/**
 * Save or update user's server history (last played)
 * @param {object} params - { userId, serverId }
 */
function saveUserServer(params) {
    const now = Date.now();
    const stmt = db.prepare(`
        INSERT INTO user_servers (userId, serverId, lastPlayed)
        VALUES (@userId, @serverId, @lastPlayed)
        ON CONFLICT(userId, serverId) DO UPDATE SET lastPlayed = @lastPlayed
    `);
    stmt.run({
        userId: params.userId,
        serverId: params.serverId,
        lastPlayed: now
    });
}

/**
 * Get user's server history (ordered by last played)
 * @param {string} userId
 * @returns {array} Array of { userId, serverId, lastPlayed }
 */
function getUserServerHistory(userId) {
    const stmt = db.prepare(`
        SELECT serverId FROM user_servers
        WHERE userId = ?
        ORDER BY lastPlayed DESC
    `);
    return stmt.all(userId);
}

// ═══════════════════════════════════════════════════════════════
// USER ENTER INFO OPERATIONS
// Referensi: login-server.md v3.0 Section 9.3
// ═══════════════════════════════════════════════════════════════

/**
 * Save or update user enter info
 * @param {object} params - { userId, channelCode, createTime, userLevel }
 */
function saveUserEnterInfo(params) {
    const now = Date.now();
    const stmt = db.prepare(`
        INSERT INTO user_enter_info (userId, channelCode, createTime, userLevel, updatedAt)
        VALUES (@userId, @channelCode, @createTime, @userLevel, @updatedAt)
        ON CONFLICT(userId) DO UPDATE SET
            channelCode = @channelCode,
            createTime = @createTime,
            userLevel = @userLevel,
            updatedAt = @updatedAt
    `);
    stmt.run({
        userId: params.userId,
        channelCode: params.channelCode || 'ppgame',
        createTime: params.createTime || 0,
        userLevel: params.userLevel || 0,
        updatedAt: now
    });
}

// ═══════════════════════════════════════════════════════════════
// USER LANGUAGE OPERATIONS
// Referensi: login-server.md v3.0 Section 9.4
// ═══════════════════════════════════════════════════════════════

/**
 * Save or update user language preference
 * @param {object} params - { userId, language, sdk }
 */
function saveUserLanguage(params) {
    const now = Date.now();
    const stmt = db.prepare(`
        INSERT INTO user_language (userId, language, sdk, updatedAt)
        VALUES (@userId, @language, @sdk, @updatedAt)
        ON CONFLICT(userId) DO UPDATE SET
            language = @language,
            sdk = @sdk,
            updatedAt = @updatedAt
    `);
    stmt.run({
        userId: params.userId,
        language: params.language || 'en',
        sdk: params.sdk || 'ppgame',
        updatedAt: now
    });
}

module.exports = {
    db,
    insertLoginHistory,
    getTodayLoginCount,
    saveUserServer,
    getUserServerHistory,
    saveUserEnterInfo,
    saveUserLanguage
};
