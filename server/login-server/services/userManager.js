/**
 * ============================================================================
 * Login Server — User Manager
 * ============================================================================
 *
 * NATURAL IMPLEMENTATION:
 * - Auto-register on login if user not found
 * - Password stored as plaintext (OK for private server)
 * - Clean CRUD operations
 *
 * Client auto-register flow:
 * NO register action exists. Only loginGame.
 * If userId not found → server auto-creates account.
 * loginSuccessCallBack checks e.newUser for first-time events.
 *
 * ============================================================================
 */

const DB = require('./db');
const CONSTANTS = require('../config/constants');
const logger = require('../utils/logger');

const UserManager = {

    /**
     * Find user by userId
     * 
     * @param {string} userId - User ID
     * @returns {Promise<Object|null>} User data or null
     */
    async findByUserId(userId) {
        return DB.queryOne('SELECT * FROM users WHERE user_id = ?', [userId]);
    },

    /**
     * Auto-register new user
     * Called when userId not found in loginGame
     * 
     * @param {Object} data - User data
     * @returns {Promise<Object>} Created user
     */
    async create(data) {
        const now = Date.now();
        
        await DB.query(
            `INSERT INTO users 
             (user_id, password, nick_name, head_image, from_channel, channel_name, 
              sub_channel, last_login_time, create_time, is_new) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
            [
                data.userId,
                data.password || CONSTANTS.DEFAULT_PASSWORD,
                data.nickName || '',
                data.headImageUrl || '',
                data.fromChannel || CONSTANTS.DEFAULT_SDK_CHANNEL,
                data.channelName || '',
                data.subChannel || CONSTANTS.DEFAULT_APP_ID,
                now,
                now
            ]
        );
        
        logger.info('UserManager', `Auto-registered: ${data.userId}`);
        
        return {
            user_id: data.userId,
            nick_name: data.nickName || '',
            from_channel: data.fromChannel || CONSTANTS.DEFAULT_SDK_CHANNEL,
            is_new: 1
        };
    },

    /**
     * Update last login time
     * 
     * @param {string} userId - User ID
     */
    async updateLoginTime(userId) {
        await DB.query(
            'UPDATE users SET last_login_time = ? WHERE user_id = ?',
            [Date.now(), userId]
        );
    },

    /**
     * Check and consume isNew flag
     * Returns true if user was new (is_new=1), marks as 0
     * 
     * @param {string} userId - User ID
     * @returns {Promise<boolean>} Was new user
     */
    async consumeNewFlag(userId) {
        const user = await this.findByUserId(userId);
        if (!user || user.is_new !== 1) {
            return false;
        }
        
        await DB.query(
            'UPDATE users SET is_new = 0 WHERE user_id = ?',
            [userId]
        );
        
        return true;
    },

    /**
     * Save language preference
     * 
     * @param {string} userId - User ID
     * @param {string} language - Language code (en, cn, kr, etc.)
     * @param {string} sdk - SDK channel
     * @param {string} appId - App ID
     */
    async saveLanguage(userId, language, sdk = '', appId = '') {
        try {
            await DB.query(
                `INSERT INTO user_languages 
                 (user_id, language, sdk, appid, updated_at) 
                 VALUES (?, ?, ?, ?, ?) 
                 ON DUPLICATE KEY UPDATE 
                 language = ?, sdk = ?, appid = ?, updated_at = ?`,
                [userId, language, sdk, appId, Date.now(),
                 language, sdk, appId, Date.now()]
            );
            
            logger.debug('UserManager', `Language saved: ${userId} → ${language}`);
            
        } catch (err) {
            logger.warn('UserManager', `Language save failed: ${err.message}`);
        }
    }
};

module.exports = UserManager;