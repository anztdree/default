/**
 * ============================================================================
 *  Database Service — MariaDB Connection Pool (Standalone)
 *  Same DB as login-server: super_warrior_z
 * ============================================================================
 */

var mysql = require('mysql2/promise');
var CONSTANTS = require('../config/constants');
var logger = require('../utils/logger');

var pool = null;

/**
 * Initialize database connection pool
 */
async function init() {
    try {
        pool = mysql.createPool({
            host: CONSTANTS.DB.host,
            port: CONSTANTS.DB.port,
            user: CONSTANTS.DB.user,
            password: CONSTANTS.DB.password,
            database: CONSTANTS.DB.database,
            connectionLimit: CONSTANTS.DB.connectionLimit,
            connectTimeout: CONSTANTS.DB.connectTimeout,
            waitForConnections: true,
            queueLimit: 0,
            charset: 'utf8mb4',
        });

        // Test connection
        var conn = await pool.getConnection();
        await conn.ping();
        conn.release();

        logger.info('DB', 'Connected: ' + CONSTANTS.DB.host + ':' + CONSTANTS.DB.port + '/' + CONSTANTS.DB.database);
        return true;
    } catch (err) {
        logger.error('DB', 'Connection failed: ' + err.message);
        throw err;
    }
}

/**
 * Execute a query with auto-release connection
 * @param {string} sql - SQL query with ? placeholders
 * @param {array} [params] - Parameter values
 * @returns {Promise<array>} Query result rows
 */
async function query(sql, params) {
    if (!pool) throw new Error('Database not initialized');
    var [rows] = await pool.execute(sql, params || []);
    return rows;
}

/**
 * Get a connection from pool (for transactions)
 * @returns {Promise<mysql.PoolConnection>}
 */
async function getConnection() {
    if (!pool) throw new Error('Database not initialized');
    return pool.getConnection();
}

/**
 * Check if database is ready
 * @returns {boolean}
 */
function isReady() {
    return pool !== null;
}

/**
 * Close database pool
 */
async function close() {
    if (pool) {
        await pool.end();
        pool = null;
        logger.info('DB', 'Pool closed');
    }
}

module.exports = {
    init: init,
    query: query,
    getConnection: getConnection,
    isReady: isReady,
    close: close,
};
