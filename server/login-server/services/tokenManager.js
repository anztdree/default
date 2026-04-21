/**
 * Login Server — Token Manager
 *
 * Token lifecycle:
 *   1. Created on loginGame → INSERT INTO login_tokens
 *   2. Refreshed on SaveHistory → INSERT INTO login_tokens (new token)
 *   3. Consumed on enterGame (main-server) → UPDATE login_tokens SET used=1
 *
 * Format: "{userId}_{timestamp}_{random8chars}"
 * Expiry: 24 hours (configurable)
 */

var DB = require('./db');
var CONSTANTS = require('../config/constants');
var logger = require('../utils/logger');

var TokenManager = {

    /**
     * Generate a new login token
     * @param {string} userId
     * @returns {string}
     */
    generate(userId) {
        var ts = Date.now();
        var rnd = Math.random().toString(36).substring(2, 2 + CONSTANTS.TOKEN_RANDOM_LENGTH);
        return userId + '_' + ts + '_' + rnd;
    },

    /**
     * Save token to database
     * @param {string} userId
     * @param {string} token
     * @param {number} [serverId]
     * @returns {boolean}
     */
    async save(userId, token, serverId) {
        var now = Date.now();
        try {
            await DB.query(
                'INSERT INTO login_tokens (user_id, token, server_id, created_at, expires_at, used) ' +
                'VALUES (?, ?, ?, ?, ?, 0)',
                [userId, token, serverId || 1, now, now + CONSTANTS.TOKEN_EXPIRY_MS]
            );
            logger.info('TokenManager', 'Token saved for: ' + userId);
            return true;
        } catch (err) {
            logger.error('TokenManager', 'Save failed: ' + err.message);
            return false;
        }
    },

    /**
     * Validate and consume a token (used by main-server enterGame)
     * @param {string} token
     * @returns {object|null}
     */
    async validate(token) {
        try {
            var row = await DB.queryOne(
                'SELECT * FROM login_tokens WHERE token = ? AND used = 0 AND expires_at > ?',
                [token, Date.now()]
            );
            if (!row) return null;

            await DB.query('UPDATE login_tokens SET used = 1 WHERE token = ?', [token]);
            return row;
        } catch (err) {
            logger.error('TokenManager', 'Validate failed: ' + err.message);
            return null;
        }
    },
};

module.exports = TokenManager;
