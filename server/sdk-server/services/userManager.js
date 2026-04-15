/**
 * ============================================================================
 *  User Manager — CRUD operations untuk user data
 *  ============================================================================
 *
 *  Mengelola data user di data/users.json.
 *
 *  Data format (dari existing data/users.json):
 *  {
 *    "users": {
 *      "guest_guest-{deviceId}": {
 *        "id": "1",
 *        "username": "GUEST_1",
 *        "passwordHash": "128-char hex",
 *        "salt": "64-char hex",
 *        "nickname": "GUEST_1",
 *        "sdk": "ppgame",
 *        "deviceId": "GUEST-{uniqueId}",
 *        "isGuest": true,
 *        "appId": "288",
 *        "createdAt": "2026-04-12T15:11:07.609Z",
 *        "lastLogin": "2026-04-12T15:11:07.611Z",
 *        "lastToken": "mnvwij4q_7b367e2d...",
 *        "sign": "869ade36f9de1b26d4c...",
 *        "security": "4929977724e50a71..."
 *      }
 *    },
 *    "nextId": 16
 *  }
 *
 *  Key mapping:
 *    - Guest user: key = "guest_" + deviceId.toLowerCase()
 *    - Registered user: key = username.toLowerCase()
 *
 * ============================================================================
 */

var store = require('../storage/jsonStore');
var CONSTANTS = require('../config/constants');
var cryptoUtil = require('../utils/crypto');

// File path
var USERS_FILE = store.buildPath('users.json');

// =============================================
// DATA ACCESS
// =============================================

/**
 * Load seluruh users data.
 * @returns {{ users: Object.<string, Object>, nextId: number }}
 */
function loadUsers() {
    return store.load(USERS_FILE, { users: {}, nextId: 1 });
}

/**
 * Save seluruh users data.
 * @param {{ users: Object.<string, Object>, nextId: number }} data
 * @returns {boolean}
 */
function saveUsers(data) {
    return store.save(USERS_FILE, data);
}

// =============================================
// FIND OPERATIONS
// =============================================

/**
 * Cari user berdasarkan userId (numeric string).
 * Linear scan — OK untuk private server (<1000 users).
 *
 * @param {string} userId - User ID (contoh: "1", "15")
 * @returns {{ key: string, user: Object, data: Object } | null}
 */
function findById(userId) {
    var data = loadUsers();
    var keys = Object.keys(data.users);

    for (var i = 0; i < keys.length; i++) {
        if (data.users[keys[i]].id === String(userId)) {
            return { key: keys[i], user: data.users[keys[i]], data: data };
        }
    }
    return null;
}

/**
 * Cari user berdasarkan deviceId.
 *
 * @param {string} deviceId - Device ID string
 * @returns {{ key: string, user: Object, data: Object } | null}
 */
function findByDeviceId(deviceId) {
    var data = loadUsers();
    var keys = Object.keys(data.users);

    for (var i = 0; i < keys.length; i++) {
        if (data.users[keys[i]].deviceId === deviceId) {
            return { key: keys[i], user: data.users[keys[i]], data: data };
        }
    }
    return null;
}

/**
 * Cari user berdasarkan username (case-insensitive).
 *
 * @param {string} username - Username
 * @returns {{ key: string, user: Object, data: Object } | null}
 */
function findByUsername(username) {
    var data = loadUsers();
    var userKey = username.toLowerCase();

    if (data.users[userKey]) {
        return { key: userKey, user: data.users[userKey], data: data };
    }
    return null;
}

// =============================================
// CREATE OPERATIONS
// =============================================

/**
 * Generate user ID baru (auto-increment).
 *
 * @param {Object} usersData - Data users (akan di-update nextId-nya)
 * @returns {string} User ID string (contoh: "16")
 */
function generateId(usersData) {
    var id = usersData.nextId || 1;
    usersData.nextId = id + 1;
    return String(id);
}

/**
 * Generate guest username.
 * Format: GUEST_{id}
 *
 * @param {string} id - User ID
 * @returns {string} Guest username (contoh: "GUEST_16")
 */
function generateGuestUsername(id) {
    return 'GUEST_' + id;
}

/**
 * Generate guest user key.
 * Format: guest_{deviceId} (lowercase)
 *
 * Contoh dari existing data:
 *   deviceId = "GUEST-mnvwiiyf-h06mq1ii-1-33d1dc70"
 *   key = "guest_guest-mnvwiiyf-h06mq1ii-1-33d1dc70"
 *
 * @param {string} deviceId - Device ID
 * @returns {string} User key
 */
function generateGuestKey(deviceId) {
    return 'guest_' + deviceId.toLowerCase();
}

/**
 * Buat guest user baru.
 *
 * Guest user properties (dari existing data):
 *   - username: "GUEST_{id}"
 *   - sdk: "ppgame"
 *   - appId: "288"
 *   - isGuest: true
 *   - deviceId: dari client
 *   - password: random generated (guest tidak perlu password)
 *
 * @param {string} deviceId - Device ID dari client (sdk.js)
 * @returns {{ key: string, user: Object } | null} null jika gagal save
 */
function createGuest(deviceId) {
    var data = loadUsers();
    var userId = generateId(data);
    var username = generateGuestUsername(userId);
    var key = generateGuestKey(deviceId);
    var salt = cryptoUtil.generateSalt();
    var randomPassword = cryptoUtil.generateLoginToken(); // random password for guest
    var passwordHash = cryptoUtil.hashPassword(randomPassword, salt);
    var loginToken = cryptoUtil.generateLoginToken();
    var sign = cryptoUtil.generateSign(userId, loginToken);
    var security = cryptoUtil.generateSecurity();

    var now = new Date().toISOString();

    var user = {
        id: userId,
        username: username,
        passwordHash: passwordHash,
        salt: salt,
        nickname: username,
        sdk: CONSTANTS.DEFAULT_SDK_CHANNEL,
        deviceId: deviceId,
        isGuest: true,
        appId: CONSTANTS.DEFAULT_APP_ID,
        createdAt: now,
        lastLogin: now,
        lastToken: loginToken,
        sign: sign,
        security: security
    };

    data.users[key] = user;

    if (!saveUsers(data)) {
        return null;
    }

    return { key: key, user: user, data: data };
}

/**
 * Buat registered user baru.
 *
 * @param {string} username - Username (sudah sanitized)
 * @param {string} password - Plain text password
 * @returns {{ key: string, user: Object } | { error: string }}
 */
function createRegistered(username, password) {
    var data = loadUsers();
    var userKey = username.toLowerCase();

    // Cek username sudah ada
    if (data.users[userKey]) {
        return { error: 'Username "' + username + '" sudah digunakan, pilih username lain' };
    }

    var userId = generateId(data);
    var salt = cryptoUtil.generateSalt();
    var passwordHash = cryptoUtil.hashPassword(password, salt);
    var loginToken = cryptoUtil.generateLoginToken();
    var sign = cryptoUtil.generateSign(userId, loginToken);
    var security = cryptoUtil.generateSecurity();

    var now = new Date().toISOString();

    var user = {
        id: userId,
        username: username,
        passwordHash: passwordHash,
        salt: salt,
        nickname: username,
        sdk: CONSTANTS.DEFAULT_SDK_CHANNEL,
        isGuest: false,
        createdAt: now,
        lastLogin: now,
        lastToken: loginToken,
        sign: sign,
        security: security
    };

    data.users[userKey] = user;

    if (!saveUsers(data)) {
        return { error: 'Gagal menyimpan data user (storage error)' };
    }

    return { key: userKey, user: user };
}

// =============================================
// UPDATE OPERATIONS
// =============================================

/**
 * Update data user setelah login berhasil.
 * Field yang di-update: lastLogin, lastToken, sign, security
 *
 * @param {string} userKey - Key user di data
 * @param {string} loginToken - Login token baru
 * @returns {Object|null} Updated user object, null jika gagal save
 */
function updateAfterLogin(userKey, loginToken) {
    var data = loadUsers();
    var user = data.users[userKey];

    if (!user) {
        return null;
    }

    var userId = user.id;
    var sign = cryptoUtil.generateSign(userId, loginToken);
    var security = cryptoUtil.generateSecurity();

    user.lastLogin = new Date().toISOString();
    user.lastToken = loginToken;
    user.sign = sign;
    user.security = security;

    if (!saveUsers(data)) {
        return null;
    }

    return user;
}

/**
 * Update nickname user.
 *
 * @param {string} userKey - Key user
 * @param {string} nickname - Nickname baru
 * @returns {boolean}
 */
function updateNickname(userKey, nickname) {
    var data = loadUsers();
    var user = data.users[userKey];

    if (!user) {
        return false;
    }

    user.nickname = nickname;
    return saveUsers(data);
}

// =============================================
// LIST OPERATIONS
// =============================================

/**
 * List semua user (admin/debug).
 *
 * @param {string} [search] - Filter by username/nickname (case-insensitive)
 * @param {number} [limit] - Max results (default 100)
 * @returns {{ users: Array, count: number, total: number }}
 */
function listUsers(search, limit) {
    var data = loadUsers();
    limit = limit || 100;
    search = (search || '').toLowerCase();

    var userList = [];
    var keys = Object.keys(data.users);

    for (var i = 0; i < keys.length && userList.length < limit; i++) {
        var user = data.users[keys[i]];

        // Filter by search
        if (search && keys[i].indexOf(search) === -1 &&
            (user.nickname || '').toLowerCase().indexOf(search) === -1) {
            continue;
        }

        userList.push({
            id: user.id,
            username: user.username,
            nickname: user.nickname || user.username,
            sdk: user.sdk || CONSTANTS.DEFAULT_SDK_CHANNEL,
            isGuest: !!user.isGuest,
            appId: user.appId || CONSTANTS.DEFAULT_APP_ID,
            createdAt: user.createdAt,
            lastLogin: user.lastLogin
        });
    }

    return {
        users: userList,
        count: userList.length,
        total: keys.length
    };
}

/**
 * Get detail user (admin/debug).
 * Mengembalikan data user TANPA passwordHash dan salt.
 *
 * @param {string} userId - User ID
 * @returns {Object|null} User detail atau null
 */
function getUserDetail(userId) {
    var found = findById(userId);
    if (!found) {
        return null;
    }

    var user = found.user;
    return {
        id: user.id,
        username: user.username,
        nickname: user.nickname || user.username,
        sdk: user.sdk || CONSTANTS.DEFAULT_SDK_CHANNEL,
        isGuest: !!user.isGuest,
        appId: user.appId || CONSTANTS.DEFAULT_APP_ID,
        deviceId: user.deviceId || null,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        lastToken: user.lastToken ? user.lastToken.substring(0, 16) + '...' : null
    };
}

/**
 * Get total user count.
 * @returns {number}
 */
function getUserCount() {
    var data = loadUsers();
    return Object.keys(data.users).length;
}

module.exports = {
    findById: findById,
    findByDeviceId: findByDeviceId,
    findByUsername: findByUsername,
    createGuest: createGuest,
    createRegistered: createRegistered,
    updateAfterLogin: updateAfterLogin,
    updateNickname: updateNickname,
    listUsers: listUsers,
    getUserDetail: getUserDetail,
    getUserCount: getUserCount,
    generateId: generateId
};
