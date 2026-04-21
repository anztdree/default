/**
 * Login Server — User Manager
 *
 * users table CRUD for login-server.
 *
 * Client auto-register flow:
 *   NO register action exists. Only loginGame.
 *   If userId not found → server auto-creates account.
 *   loginSuccessCallBack checks e.newUser for first-time events.
 *
 * Password: PLAINTEXT (client sends raw, no hash)
 * Default: "game_origin" (main.min.js line 88641)
 */

var DB = require('./db');
var CONSTANTS = require('../config/constants');
var logger = require('../utils/logger');

var UserManager = {

    /**
     * Find user by userId
     * @param {string} userId
     * @returns {object|null}
     */
    async findByUserId(userId) {
        return DB.queryOne('SELECT * FROM users WHERE user_id = ?', [userId]);
    },

    /**
     * Auto-register new user (called when userId not found in loginGame)
     * @param {object} data - { userId, password, nickName, headImageUrl, fromChannel, channelName, subChannel }
     * @returns {object} Created user
     */
    async create(data) {
        var now = Date.now();
        await DB.query(
            'INSERT INTO users (user_id, password, nick_name, head_image, from_channel, channel_name, sub_channel, last_login_time, create_time, is_new) ' +
            'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)',
            [
                data.userId,
                data.password || CONSTANTS.DEFAULT_PASSWORD,
                data.nickName || '',
                data.headImageUrl || '',
                data.fromChannel || CONSTANTS.DEFAULT_SDK_CHANNEL,
                data.channelName || '',
                data.subChannel || CONSTANTS.DEFAULT_APP_ID,
                now,
                now,
            ]
        );
        logger.info('UserManager', 'Auto-registered: ' + data.userId);
        return {
            user_id: data.userId,
            nick_name: data.nickName || '',
            from_channel: data.fromChannel || CONSTANTS.DEFAULT_SDK_CHANNEL,
            is_new: 1,
        };
    },

    /**
     * Update last login time
     * @param {string} userId
     */
    async updateLoginTime(userId) {
        var now = Date.now();
        await DB.query(
            'UPDATE users SET last_login_time = ? WHERE user_id = ?',
            [now, userId]
        );
    },

    /**
     * Check and consume isNew flag
     * Returns true if user was new (is_new=1), marks as 0
     * @param {string} userId
     * @returns {boolean}
     */
    async consumeNewFlag(userId) {
        var user = await this.findByUserId(userId);
        if (!user || user.is_new !== 1) return false;
        await DB.query('UPDATE users SET is_new = 0 WHERE user_id = ?', [userId]);
        return true;
    },

    /**
     * Save language preference
     * @param {string} userId
     * @param {string} language
     * @param {string} sdk
     * @param {string} appId
     */
    async saveLanguage(userId, language, sdk, appId) {
        try {
            await DB.query(
                'INSERT INTO user_languages (user_id, language, sdk, appid, updated_at) ' +
                'VALUES (?, ?, ?, ?, ?) ' +
                'ON DUPLICATE KEY UPDATE language = ?, sdk = ?, appid = ?, updated_at = ?',
                [userId, language, sdk || '', appId || '', Date.now(), language, sdk || '', appId || '', Date.now()]
            );
            logger.info('UserManager', 'Language saved: ' + userId + ' → ' + language);
        } catch (err) {
            logger.warn('UserManager', 'Language save failed: ' + err.message);
        }
    },
};

module.exports = UserManager;
