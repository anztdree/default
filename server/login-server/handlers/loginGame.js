/**
 * handlers/loginGame.js — Handler 1: Autentikasi User
 *
 * Register + Login jadi SATU (Origin/Manual path).
 * Jika user belum ada → INSERT baru.
 * Jika user sudah ada → UPDATE last_login.
 *
 * Client call (line 114369):
 *   ts.clientLoginUser(username, password, password, callback)
 *   → fromChannel = parameter ke-3 = password
 *
 * Client request:
 *   {
 *     type: "User",
 *     action: "loginGame",
 *     userId: <username>,
 *     password: "game_origin",     // default jika kosong (line 137980)
 *     fromChannel: "game_origin",   // = password (line 137981)
 *     channelName: "",
 *     headImageUrl: "",
 *     nickName: "",
 *     subChannel: "",
 *     version: "1.0"
 *   }
 *
 * Client response (line 138020-138023):
 *   ts.loginInfo.userInfo = {
 *     userId, channelCode, loginToken, nickName, securityCode, createTime
 *   }
 *   + line 113906: if (a.language) ts.language = a.language
 */

var crypto = require('crypto');

function generateToken() {
    return crypto.randomBytes(32).toString('hex');
}

function execute(data, socket, ctx) {
    var db = ctx.db;
    var buildResponse = ctx.buildResponse;
    var buildErrorResponse = ctx.buildErrorResponse;

    var userId = (data.userId || '').trim();
    var password = (data.password || '').trim();
    var fromChannel = (data.fromChannel || password || '').trim();

    // Default password: "game_origin" jika kosong (line 137980)
    if (!password) {
        password = 'game_origin';
    }

    if (!userId) {
        return Promise.resolve(buildErrorResponse(2));
    }

    var now = Date.now();

    // Check apakah user sudah ada
    return db.queryOne(
        'SELECT user_id, password, nick_name, create_time, channel_code, language, security_code FROM users WHERE user_id = ?',
        [userId]
    ).then(function (existingUser) {
        var loginToken = generateToken();
        var securityCode = crypto.randomBytes(16).toString('hex');

        if (existingUser) {
            // === LOGIN USER YANG SUDAH ADA — CEK PASSWORD ===
            if (existingUser.password !== password) {
                console.warn('[loginGame] Wrong password: ' + userId);
                return Promise.resolve(buildErrorResponse(3)); // ret=3 → password salah
            }

            return db.query(
                'UPDATE users SET last_login_time = ?, login_token = ?, security_code = ?, channel_code = ? WHERE user_id = ?',
                [now, loginToken, securityCode, fromChannel, userId]
            ).then(function () {
                console.log('[loginGame] Login: ' + userId);
                return buildResponse({
                    userId: userId,
                    channelCode: fromChannel,
                    loginToken: loginToken,
                    nickName: existingUser.nick_name || userId,
                    securityCode: securityCode,
                    createTime: existingUser.create_time,
                    language: existingUser.language || 'en'
                });
            });
        } else {
            // === REGISTER USER BARU ===
            return db.query(
                'INSERT INTO users (user_id, password, channel_code, nick_name, security_code, create_time, last_login_time, login_token) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [userId, password, fromChannel, userId, securityCode, now, now, loginToken]
            ).then(function () {
                console.log('[loginGame] Register: ' + userId);
                return buildResponse({
                    userId: userId,
                    channelCode: fromChannel,
                    loginToken: loginToken,
                    nickName: userId,
                    securityCode: securityCode,
                    createTime: now,
                    language: 'en'
                });
            });
        }
    });
}

module.exports = { execute: execute };
