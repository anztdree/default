/**
 * Login Server — MariaDB Database Manager
 *
 * Two-phase init:
 *   Phase 1: Connect without database → CREATE DATABASE IF NOT EXISTS
 *   Phase 2: Connect with database → CREATE TABLE IF NOT EXISTS
 *
 * Tables: users, login_tokens, user_languages, _schema_meta
 *
 * NO shared/ dependency — fully standalone
 */

var mariadb = require('mariadb');
var CONSTANTS = require('../config/constants');
var logger = require('../utils/logger');

var pool = null;
var ready = false;

// ================================================================
// INIT
// ================================================================

async function init() {
    if (ready) {
        logger.info('DB', 'Already initialized');
        return;
    }

    try {
        await _bootstrapDatabase();
        await _createTables();
        ready = true;
        logger.info('DB', 'Initialized successfully');
    } catch (err) {
        ready = false;
        pool = null;
        logger.error('DB', 'Init failed: ' + err.message);
        throw err;
    }
}

async function _bootstrapDatabase() {
    var cfg = CONSTANTS.DB;
    logger.info('DB', 'Phase 1: Connecting to MariaDB at ' + cfg.host + ':' + cfg.port + '...');

    var tmpPool = mariadb.createPool({
        host: cfg.host,
        port: cfg.port,
        user: cfg.user,
        password: cfg.password,
        connectionLimit: 1,
        connectTimeout: 10000,
        acquireTimeout: 10000,
    });

    var conn;
    try {
        conn = await tmpPool.getConnection();
        await conn.query(
            'CREATE DATABASE IF NOT EXISTS `' + cfg.database + '` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci'
        );
        logger.info('DB', 'Database "' + cfg.database + '" verified');
    } finally {
        if (conn) conn.release();
        try { await tmpPool.end(); } catch (e) { /* ignore */ }
    }
}

async function _createTables() {
    var cfg = CONSTANTS.DB;
    logger.info('DB', 'Phase 2: Creating tables...');

    pool = mariadb.createPool({
        host: cfg.host,
        port: cfg.port,
        user: cfg.user,
        password: cfg.password,
        database: cfg.database,
        connectionLimit: cfg.connectionLimit,
        connectTimeout: 10000,
        acquireTimeout: 10000,
    });

    var conn;
    try {
        conn = await pool.getConnection();
        await conn.query('SELECT 1 AS test');

        // users table
        await conn.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id VARCHAR(64) NOT NULL UNIQUE,
                password VARCHAR(128) NOT NULL DEFAULT 'game_origin',
                nick_name VARCHAR(64) NOT NULL DEFAULT '',
                head_image VARCHAR(256) NOT NULL DEFAULT '',
                from_channel VARCHAR(64) NOT NULL DEFAULT '',
                channel_name VARCHAR(64) NOT NULL DEFAULT '',
                sub_channel VARCHAR(64) NOT NULL DEFAULT '',
                ori_server_id INT NOT NULL DEFAULT 0,
                nick_change_times INT NOT NULL DEFAULT 0,
                last_login_time BIGINT NOT NULL DEFAULT 0,
                create_time BIGINT NOT NULL DEFAULT 0,
                bulletin_versions TEXT DEFAULT NULL,
                is_new TINYINT(1) NOT NULL DEFAULT 1,
                INDEX idx_user_id (user_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);
        logger.info('DB', '  Table users OK');

        // login_tokens table
        await conn.query(`
            CREATE TABLE IF NOT EXISTS login_tokens (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id VARCHAR(64) NOT NULL,
                token VARCHAR(256) NOT NULL,
                server_id INT NOT NULL DEFAULT 1,
                created_at BIGINT NOT NULL DEFAULT 0,
                expires_at BIGINT NOT NULL DEFAULT 0,
                used TINYINT(1) NOT NULL DEFAULT 0,
                INDEX idx_token (token),
                INDEX idx_user_id (user_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);
        logger.info('DB', '  Table login_tokens OK');

        // user_languages table
        await conn.query(`
            CREATE TABLE IF NOT EXISTS user_languages (
                user_id VARCHAR(64) PRIMARY KEY,
                language VARCHAR(10) DEFAULT 'en',
                sdk VARCHAR(32) DEFAULT '',
                appid VARCHAR(32) DEFAULT '',
                updated_at BIGINT DEFAULT 0
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);
        logger.info('DB', '  Table user_languages OK');

        // _schema_meta table
        await conn.query(`
            CREATE TABLE IF NOT EXISTS _schema_meta (
                key_name VARCHAR(64) NOT NULL PRIMARY KEY,
                key_value VARCHAR(256) NOT NULL,
                updated_at BIGINT NOT NULL DEFAULT 0
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);

        await conn.query(
            'INSERT INTO _schema_meta (key_name, key_value, updated_at) VALUES (?, ?, ?) ' +
            'ON DUPLICATE KEY UPDATE key_value = ?, updated_at = ?',
            ['schema_version', '1', Date.now(), '1', Date.now()]
        );
        logger.info('DB', '  Table _schema_meta OK');

        logger.info('DB', 'All tables created');
    } finally {
        if (conn) conn.release();
    }
}

// ================================================================
// QUERY
// ================================================================

async function query(sql, params) {
    if (!pool || !ready) {
        throw new Error('Database not initialized');
    }

    var conn;
    try {
        conn = await pool.getConnection();
        return await conn.query(sql, params);
    } catch (err) {
        logger.error('DB', 'Query error: ' + err.message);
        logger.error('DB', '  SQL: ' + sql);
        throw err;
    } finally {
        if (conn) conn.release();
    }
}

async function queryOne(sql, params) {
    var rows = await query(sql, params);
    return (rows && rows.length > 0) ? rows[0] : null;
}

// ================================================================
// HEALTH
// ================================================================

function isReady() { return ready; }

// ================================================================
// CLOSE
// ================================================================

async function close() {
    if (!pool) { ready = false; return; }
    logger.info('DB', 'Closing pool...');
    ready = false;
    try {
        await pool.end();
        pool = null;
        logger.info('DB', 'Pool closed');
    } catch (err) {
        logger.error('DB', 'Close error: ' + err.message);
        pool = null;
    }
}

// ================================================================
// TOKEN CLEANUP (every 1 hour)
// ================================================================

var _cleanupInterval = setInterval(async function () {
    if (!pool || !ready) return;
    try {
        var cutoff = Date.now() - 86400000;
        var r = await pool.query(
            'DELETE FROM login_tokens WHERE expires_at < ? OR (used = 1 AND created_at < ?)',
            [cutoff, cutoff]
        );
        if (r && r.affectedRows > 0) {
            logger.info('DB', 'Token cleanup: removed ' + r.affectedRows + ' rows');
        }
    } catch (e) {
        logger.warn('DB', 'Token cleanup error: ' + e.message);
    }
}, 3600000);

// Process cleanup
process.on('exit', function () {
    if (pool) { try { pool.end(); } catch (e) { /* ignore */ } }
    clearInterval(_cleanupInterval);
});

// ================================================================
// EXPORTS
// ================================================================

module.exports = {
    init: init,
    query: query,
    queryOne: queryOne,
    isReady: isReady,
    close: close,
};
