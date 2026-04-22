/**
 * ============================================================================
 * Login Server — Token Manager
 * ============================================================================
 *
 * NATURAL IMPLEMENTATION:
 * - Token lifecycle: create → save → validate (by main-server)
 * - Format: {userId}_{timestamp}_{random8chars}
 * - Expiry: 24 hours (configurable)
 *
 * Token Flow:
 * 1. Created on loginGame → INSERT INTO login_tokens
 * 2. Refreshed on SaveHistory → INSERT INTO login_tokens (new token)
 * 3. Consumed on enterGame (main-server) → UPDATE login_tokens SET used=1
 *
 * ============================================================================
 */

const DB = require('./db');
const CONSTANTS = require('../config/constants');
const logger = require('../utils/logger');

const TokenManager = {

    /**
     * Generate new login token
     * Format: {userId}_{timestamp}_{random8chars}
     * 
     * @param {string} userId - User ID
     * @returns {string} Generated token
     */
    generate(userId) {
        const ts = Date.now();
        const rnd = Math.random().toString(36).substring(2, 2 + CONSTANTS.TOKEN_RANDOM_LENGTH);
        return `${userId}_${ts}_${rnd}`;
    },

    /**
     * Save token to database
     * 
     * @param {string} userId - User ID
     * @param {string} token - Generated token
     * @param {number} serverId - Server ID (default: 1)
     * @returns {Promise<boolean>} Success
     */
    async save(userId, token, serverId = 1) {
        const now = Date.now();
        
        try {
            await DB.query(
                `INSERT INTO login_tokens 
                 (user_id, token, server_id, created_at, expires_at, used) 
                 VALUES (?, ?, ?, ?, ?, 0)`,
                [userId, token, serverId, now, now + CONSTANTS.TOKEN_EXPIRY_MS]
            );
            
            logger.debug('TokenManager', `Token saved for: ${userId}`);
            return true;
            
        } catch (err) {
            logger.error('TokenManager', `Save failed: ${err.message}`);
            return false;
        }
    },

    /**
     * Validate and consume token (used by main-server enterGame)
     * 
     * @param {string} token - Token to validate
     * @returns {Promise<Object|null>} Token data or null if invalid
     */
    async validate(token) {
        try {
            // Find valid, unused token
            const row = await DB.queryOne(
                `SELECT * FROM login_tokens 
                 WHERE token = ? AND used = 0 AND expires_at > ?`,
                [token, Date.now()]
            );
            
            if (!row) {
                return null;
            }

            // Mark as used
            await DB.query(
                'UPDATE login_tokens SET used = 1 WHERE token = ?',
                [token]
            );
            
            return row;
            
        } catch (err) {
            logger.error('TokenManager', `Validate failed: ${err.message}`);
            return null;
        }
    }
};

module.exports = TokenManager;