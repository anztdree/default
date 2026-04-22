/**
 * ============================================================================
 * Login Server — MariaDB Database Manager
 * ============================================================================
 *
 * NATURAL IMPLEMENTATION:
 * - Two-phase initialization
 * - Auto-create database and tables
 * - Connection pooling
 *
 * Tables: users, login_tokens, user_languages, _schema_meta
 *
 * ============================================================================
 */

const mariadb = require('mariadb');
const CONSTANTS = require('../config/constants');
const logger = require('../utils/logger');

let pool = null;
let ready = false;

// =============================================
// INIT
// =============================================

/**
 * Initialize database connection
 * Phase 1: Connect without database → CREATE DATABASE IF NOT EXISTS
 * Phase 2: Connect with database → CREATE TABLE IF NOT EXISTS
 */
async function init() {
    if (ready) {
        logger.info('DB', 'Already initialized');
        return;
    }

    try {
        // Phase 1: Bootstrap database
        await _bootstrapDatabase();
        
        // Phase 2: Create tables
        await _createTables();
        
        ready = true;
        logger.info('DB', 'Initialized successfully');

    } catch (err) {
        ready = false;
        pool = null;
        logger.error('DB', `Init failed: ${err.message}`);
        throw err;
    }
}

// =============================================
// BOOTSTRAP
// =============================================

/**
 * Create database if not exists
 */
async function _bootstrapDatabase() {
    const cfg = CONSTANTS.DB;
    logger.info('DB', `Phase 1: Connecting to MariaDB at ${cfg.host}:${cfg.port}...`);

    // Create temp connection without database
    const tmpPool = mariadb.createPool({
        host: cfg.host,
        port: cfg.port,
        user: cfg.user,
        password: cfg.password,
        connectionLimit: 1,
        connectTimeout: cfg.connectTimeout,
        acquireTimeout: cfg.acquireTimeout
    });

    let conn;
    try {
        conn = await tmpPool.getConnection();
        
        // Create database
        await conn.query(
            `CREATE DATABASE IF NOT EXISTS \`${cfg.database}\` 
             CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
        );
        
        logger.info('DB', `Database "${cfg.database}" ready`);

    } finally {
        if (conn) conn.release();
        try { 
            await tmpPool.end(); 
        } catch (e) { 
            /* ignore */ 
        }
    }
}

// =============================================
// TABLES
// =============================================

/**
 * Create all required tables
 */
async function _createTables() {
    const cfg = CONSTANTS.DB;
    logger.info('DB', 'Phase 2: Creating tables...');

    // Create main pool with database
    pool = mariadb.createPool({
        host: cfg.host,
        port: cfg.port,
        user: cfg.user,
        password: cfg.password,
        database: cfg.database,
        connectionLimit: cfg.connectionLimit,
        connectTimeout: cfg.connectTimeout,
        acquireTimeout: cfg.acquireTimeout
    });

    let conn;
    try {
        conn = await pool.getConnection();
        
        // Test connection
        await conn.query('SELECT 1 AS test');

        // =============================================
        // users table
        // =============================================
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
        logger.info('DB', 'Table users OK');

        // =============================================
        // login_tokens table
        // =============================================
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
        logger.info('DB', 'Table login_tokens OK');

        // =============================================
        // user_languages table
        // =============================================
        await conn.query(`
            CREATE TABLE IF NOT EXISTS user_languages (
                user_id VARCHAR(64) PRIMARY KEY,
                language VARCHAR(10) DEFAULT 'en',
                sdk VARCHAR(32) DEFAULT '',
                appid VARCHAR(32) DEFAULT '',
                updated_at BIGINT DEFAULT 0
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);
        logger.info('DB', 'Table user_languages OK');

        // =============================================
        // _schema_meta table
        // =============================================
        await conn.query(`
            CREATE TABLE IF NOT EXISTS _schema_meta (
                key_name VARCHAR(64) NOT NULL PRIMARY KEY,
                key_value VARCHAR(256) NOT NULL,
                updated_at BIGINT NOT NULL DEFAULT 0
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `);

        // Insert schema version
        await conn.query(`
            INSERT INTO _schema_meta (key_name, key_value, updated_at) 
            VALUES ('schema_version', '2.0', ?) 
            ON DUPLICATE KEY UPDATE key_value = '2.0', updated_at = ?
        `, [Date.now(), Date.now()]);

        logger.info('DB', 'All tables created');

    } finally {
        if (conn) conn.release();
    }
}

// =============================================
// QUERY
// =============================================

/**
 * Execute query
 * @param {string} sql - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise<Array>} Query results
 */
async function query(sql, params = []) {
    if (!pool || !ready) {
        throw new Error('Database not initialized');
    }

    let conn;
    try {
        conn = await pool.getConnection();
        return await conn.query(sql, params);
    } catch (err) {
        logger.error('DB', `Query error: ${err.message}`);
        logger.error('DB', `SQL: ${sql}`);
        throw err;
    } finally {
        if (conn) conn.release();
    }
}

/**
 * Execute query, return single row
 * @param {string} sql - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise<Object|null>} Single row or null
 */
async function queryOne(sql, params = []) {
    const rows = await query(sql, params);
    return (rows && rows.length > 0) ? rows[0] : null;
}

// =============================================
// HEALTH
// =============================================

/**
 * Check if database is ready
 * @returns {boolean}
 */
function isReady() {
    return ready;
}

// =============================================
// CLOSE
// =============================================

/**
 * Close database pool
 */
async function close() {
    if (!pool) { 
        ready = false; 
        return; 
    }
    
    logger.info('DB', 'Closing pool...');
    ready = false;
    
    try {
        await pool.end();
        pool = null;
        logger.info('DB', 'Pool closed');
    } catch (err) {
        logger.error('DB', `Close error: ${err.message}`);
        pool = null;
    }
}

// =============================================
// TOKEN CLEANUP (Periodic)
// =============================================

let _cleanupInterval = setInterval(async function() {
    if (!pool || !ready) return;
    
    try {
        const cutoff = Date.now() - 86400000; // 24 hours
        const result = await pool.query(
            'DELETE FROM login_tokens WHERE expires_at < ? OR (used = 1 AND created_at < ?)',
            [cutoff, cutoff]
        );
        
        if (result && result.affectedRows > 0) {
            logger.info('DB', `Token cleanup: removed ${result.affectedRows} rows`);
        }
    } catch (e) {
        logger.warn('DB', `Token cleanup error: ${e.message}`);
    }
}, 3600000); // Every 1 hour

// Cleanup on exit
process.on('exit', function() {
    if (pool) { 
        try { pool.end(); } catch (e) { /* ignore */ } 
    }
    clearInterval(_cleanupInterval);
});

// =============================================
// EXPORTS
// =============================================

module.exports = {
    init,
    query,
    queryOne,
    isReady,
    close
};