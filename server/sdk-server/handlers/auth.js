/**
 * ============================================================================
 *  SDK Server v3 — Auth Handlers
 *  ============================================================================
 *
 *  Endpoints:
 *    POST /api/auth/register  — Register new user
 *    POST /api/auth/login     — Login registered user
 *    POST /api/auth/guest     — Auto-login / create guest
 *    POST /api/auth/logout    — Destroy session
 *    GET  /api/auth/check     — Validate session
 *
 *  CRITICAL: Response field names MUST match main.min.js expectations:
 *    - "userId"    — main.min.js line 88556: o.userId
 *    - "sign"      — main.min.js line 88557: o.sign
 *    - "sdk"       — main.min.js line 88564: o.sdk (NOT "channelCode")
 *    - "loginToken" — main.min.js line 88723: e.loginToken (camelCase)
 *    - "nickName"  — main.min.js line 88725: e.nickName (camelCase N)
 *    - "security"  — main.min.js line 88728: e.security
 *
 *  Full login flow:
 *    1. sdk.js login UI → POST /api/auth/login (or /guest)
 *    2. Server returns { userId, sign, sdk, loginToken, nickName, security }
 *    3. sdk.js redirects: ?sdk=ppgame&logintoken=X&nickname=X&userid=X&sign=X&security=X
 *    4. index.html getSdkLoginInfo() reads URL params
 *    5. main.min.js: checkSDK()=true → sdkLoginSuccess(o)
 *    6. main.min.js: ts.loginUserInfo = { userId, sign, sdk, serverId, serverName }
 *    7. main.min.js: ts.loginInfo.userInfo = { loginToken, userId, nickName, channelCode: o.sdk, securityCode: o.security }
 *    8. main.min.js: ts.clientRequestServerList(userId, sdk, callback)
 *
 * ============================================================================
 */

var userManager = require('../services/userManager');
var sessionManager = require('../services/sessionManager');
var cryptoUtil = require('../utils/crypto');
var CONSTANTS = require('../config/constants');
var logger = require('../utils/logger');

// =============================================
// HELPER
// =============================================

/**
 * Build standard login response — exact field names for main.min.js.
 */
function buildLoginResponse(user, loginToken) {
    return {
        userId: user.id,
        sign: user.sign,
        sdk: user.sdk || CONSTANTS.DEFAULT_SDK_CHANNEL,
        loginToken: loginToken,
        nickName: user.nickname || user.username,
        security: user.security
    };
}

// =============================================
// POST /api/auth/register
// =============================================

function register(req, res) {
    var username = cryptoUtil.sanitizeUsername(req.body.username);
    var password = req.body.password;

    if (!username || username.length < CONSTANTS.USERNAME_MIN_LENGTH) {
        return res.json({ success: false, message: 'Username minimal ' + CONSTANTS.USERNAME_MIN_LENGTH + ' karakter' });
    }
    if (username.length > CONSTANTS.USERNAME_MAX_LENGTH) {
        return res.json({ success: false, message: 'Username maksimal ' + CONSTANTS.USERNAME_MAX_LENGTH + ' karakter' });
    }
    if (!CONSTANTS.USERNAME_PATTERN.test(username)) {
        return res.json({ success: false, message: 'Username hanya boleh huruf, angka, dan underscore' });
    }
    if (!password || password.length < CONSTANTS.PASSWORD_MIN_LENGTH) {
        return res.json({ success: false, message: 'Password minimal ' + CONSTANTS.PASSWORD_MIN_LENGTH + ' karakter' });
    }
    if (password.length > CONSTANTS.PASSWORD_MAX_LENGTH) {
        return res.json({ success: false, message: 'Password maksimal ' + CONSTANTS.PASSWORD_MAX_LENGTH + ' karakter' });
    }

    var existing = userManager.findByUsername(username);
    if (existing) {
        return res.json({ success: false, message: 'Username "' + username + '" sudah digunakan' });
    }

    var result = userManager.createRegistered(username, password);
    if (result.error) {
        return res.json({ success: false, message: result.error });
    }

    var user = result.user;
    sessionManager.create(user.id, user.lastToken);

    logger.info('Auth', 'Registered: ' + username + ' (ID: ' + user.id + ')');

    return res.json({
        success: true,
        data: buildLoginResponse(user, user.lastToken)
    });
}

// =============================================
// POST /api/auth/login
// =============================================

function login(req, res) {
    var username = cryptoUtil.sanitizeUsername(req.body.username);
    var password = req.body.password;

    if (!username || username.length < CONSTANTS.USERNAME_MIN_LENGTH) {
        return res.json({ success: false, message: 'Username minimal ' + CONSTANTS.USERNAME_MIN_LENGTH + ' karakter' });
    }
    if (!password) {
        return res.json({ success: false, message: 'Password diperlukan' });
    }

    var found = userManager.findByUsername(username);
    if (!found) {
        // Security: don't reveal if username exists
        return res.json({ success: false, message: 'Username atau password salah' });
    }

    // Timing-safe password verification
    if (!cryptoUtil.verifyPassword(password, found.user.salt, found.user.passwordHash)) {
        logger.warn('Auth', 'Failed login: ' + username);
        return res.json({ success: false, message: 'Username atau password salah' });
    }

    // Generate new token
    var loginToken = cryptoUtil.generateLoginToken();
    var updatedUser = userManager.updateAfterLogin(found.key, loginToken);

    if (!updatedUser) {
        return res.json({ success: false, message: 'Storage error — gagal update login' });
    }

    // v3 FIX: Destroy ALL old sessions for this user before creating new one
    var destroyed = sessionManager.destroyAllByUserId(updatedUser.id);
    if (destroyed > 0) {
        logger.info('Auth', 'Cleaned ' + destroyed + ' old sessions for ' + username);
    }

    sessionManager.create(updatedUser.id, loginToken);

    logger.info('Auth', 'Login: ' + username + ' (ID: ' + updatedUser.id + ')');

    return res.json({
        success: true,
        data: buildLoginResponse(updatedUser, loginToken)
    });
}

// =============================================
// POST /api/auth/guest
// =============================================

function guest(req, res) {
    var deviceId = req.body.deviceId;

    if (!deviceId || typeof deviceId !== 'string' || deviceId.length < 3) {
        return res.json({ success: false, message: 'Device ID diperlukan' });
    }

    var existing = userManager.findByDeviceId(deviceId);

    if (existing) {
        // Returning user — generate new token
        var loginToken = cryptoUtil.generateLoginToken();
        var updatedUser = userManager.updateAfterLogin(existing.key, loginToken);

        if (!updatedUser) {
            return res.json({ success: false, message: 'Storage error' });
        }

        // v3 FIX: Destroy old sessions
        sessionManager.destroyAllByUserId(updatedUser.id);
        sessionManager.create(updatedUser.id, loginToken);

        logger.info('Auth', 'Guest returning: ' + updatedUser.username + ' (ID: ' + updatedUser.id + ')');

        return res.json({
            success: true,
            data: buildLoginResponse(updatedUser, loginToken),
            returning: true
        });
    }

    // New guest user
    var result = userManager.createGuest(deviceId);
    if (!result) {
        return res.json({ success: false, message: 'Gagal membuat guest user' });
    }

    var user = result.user;
    sessionManager.create(user.id, user.lastToken);

    logger.info('Auth', 'Guest created: ' + user.username + ' (ID: ' + user.id + ')');

    return res.json({
        success: true,
        data: buildLoginResponse(user, user.lastToken),
        returning: false
    });
}

// =============================================
// POST /api/auth/logout
// =============================================

function logout(req, res) {
    var loginToken = req.body.loginToken;

    if (loginToken) {
        sessionManager.destroy(loginToken);
        logger.info('Auth', 'Logout: ' + loginToken.substring(0, 16) + '...');
    }

    return res.json({ success: true });
}

// =============================================
// GET /api/auth/check
// =============================================

function check(req, res) {
    var userId = req.query.userId;
    var loginToken = req.query.loginToken;

    if (!userId || !loginToken) {
        return res.json({ success: false, message: 'userId dan loginToken diperlukan' });
    }

    var valid = sessionManager.validate(userId, loginToken);

    return res.json({ success: true, valid: valid });
}

module.exports = {
    register: register,
    login: login,
    guest: guest,
    logout: logout,
    check: check
};
