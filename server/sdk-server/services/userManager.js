/**
 * ============================================================================
 * SDK Server — User Manager (Natural Implementation)
 * ============================================================================
 *
 * CRUD for user data in data/users.json
 * 
 * Natural approach:
 * - No race conditions (single-threaded Node.js)
 * - Atomic file operations via jsonStore
 * - Clean user lifecycle management
 * - Proper error handling without exposing internals
 *
 * ============================================================================
 */

const store = require('../storage/jsonStore');
const CONSTANTS = require('../config/constants');
const cryptoUtil = require('../utils/crypto');
const logger = require('../utils/logger');

const USERS_FILE = store.buildPath('users.json');

// =============================================
// DATA ACCESS
// =============================================

/**
 * Load users data
 * @returns {Object} Users data with users{} and nextId
 */
function loadUsers() {
    return store.load(USERS_FILE, {
        users: {},
        nextId: 1
    });
}

/**
 * Save users data atomically
 * @param {Object} data - Users data
 * @returns {boolean} Success
 */
function saveUsers(data) {
    return store.save(USERS_FILE, data);
}

// =============================================
// FIND
// =============================================

/**
 * Find user by numeric ID
 * @param {string} userId - User ID
 * @returns {{ key, user, data } | null}
 */
function findById(userId) {
    const data = loadUsers();
    const target = String(userId);

    for (const [key, user] of Object.entries(data.users)) {
        if (user.id === target) {
            return { key, user, data };
        }
    }
    return null;
}

/**
 * Find user by device ID (for guests)
 * @param {string} deviceId - Device ID
 * @returns {{ key, user, data } | null}
 */
function findByDeviceId(deviceId) {
    const data = loadUsers();
    const target = String(deviceId).toLowerCase();

    for (const [key, user] of Object.entries(data.users)) {
        if (user.deviceId && user.deviceId.toLowerCase() === target) {
            return { key, user, data };
        }
    }
    return null;
}

/**
 * Find user by username (case-insensitive key lookup)
 * @param {string} username - Username
 * @returns {{ key, user, data } | null}
 */
function findByUsername(username) {
    const data = loadUsers();
    const key = String(username).toLowerCase();

    if (data.users[key]) {
        return { key, user: data.users[key], data };
    }
    return null;
}

/**
 * Check if username exists
 * @param {string} username - Username to check
 * @returns {boolean}
 */
function usernameExists(username) {
    return findByUsername(username) !== null;
}

// =============================================
// ID GENERATION
// =============================================

/**
 * Generate next user ID
 * @param {Object} data - Users data (with nextId)
 * @returns {string} New user ID
 */
function generateId(data) {
    const id = data.nextId || 1;
    data.nextId = id + 1;
    return String(id);
}

// =============================================
// CREATE
// =============================================

/**
 * Create guest user
 * 
 * @param {string} deviceId - Device ID from sdk.js
 * @returns {{ key, user } | null}
 */
function createGuest(deviceId) {
    const data = loadUsers();
    
    // Check if already exists
    const existingKey = 'guest_' + deviceId.toLowerCase();
    if (data.users[existingKey]) {
        return null;
    }

    // Generate user data
    const userId = generateId(data);
    const username = 'GUEST_' + userId;
    const loginToken = cryptoUtil.generateLoginToken();
    const now = new Date().toISOString();

    const user = {
        id: userId,
        username: username,
        passwordHash: null, // Guests don't have password
        salt: null,
        nickname: username,
        sdk: CONSTANTS.DEFAULT_SDK_CHANNEL,
        deviceId: deviceId,
        isGuest: true,
        appId: CONSTANTS.DEFAULT_APP_ID,
        createdAt: now,
        lastLogin: now,
        lastToken: loginToken,
        sign: cryptoUtil.generateSign(userId, loginToken),
        security: cryptoUtil.generateSecurity()
    };

    data.users[existingKey] = user;

    if (!saveUsers(data)) {
        return null;
    }

    logger.info('UserManager', `Created guest: ${username} (ID: ${userId})`);
    return { key: existingKey, user };
}

/**
 * Create registered user
 * 
 * @param {string} username - Username
 * @param {string} password - Plain password (will be hashed)
 * @returns {{ key, user } | { error: string }}
 */
function createRegistered(username, password) {
    // Validate input first
    const usernameValidation = cryptoUtil.validateUsername(username);
    if (!usernameValidation.valid) {
        return { error: usernameValidation.message };
    }

    const passwordValidation = cryptoUtil.validatePassword(password);
    if (!passwordValidation.valid) {
        return { error: passwordValidation.message };
    }

    const data = loadUsers();
    const userKey = usernameValidation.username.toLowerCase();

    // Check if already exists
    if (data.users[userKey]) {
        return { error: `Username "${usernameValidation.username}" sudah digunakan` };
    }

    // Generate user data
    const userId = generateId(data);
    const salt = cryptoUtil.generateSalt();
    const loginToken = cryptoUtil.generateLoginToken();
    const now = new Date().toISOString();

    const user = {
        id: userId,
        username: usernameValidation.username,
        passwordHash: cryptoUtil.hashPassword(password, salt),
        salt: salt,
        nickname: usernameValidation.username,
        sdk: CONSTANTS.DEFAULT_SDK_CHANNEL,
        isGuest: false,
        appId: CONSTANTS.DEFAULT_APP_ID,
        createdAt: now,
        lastLogin: now,
        lastToken: loginToken,
        sign: cryptoUtil.generateSign(userId, loginToken),
        security: cryptoUtil.generateSecurity()
    };

    data.users[userKey] = user;

    if (!saveUsers(data)) {
        return { error: 'Gagal menyimpan user. Silakan coba lagi.' };
    }

    logger.info('UserManager', `Registered: ${usernameValidation.username} (ID: ${userId})`);
    return { key: userKey, user };
}

// =============================================
// UPDATE
// =============================================

/**
 * Update user after successful login
 * Refreshes: lastLogin, lastToken, sign, security
 * 
 * @param {string} userKey - User key in users data
 * @param {string} loginToken - New login token
 * @returns {Object | null} Updated user object
 */
function updateAfterLogin(userKey, loginToken) {
    const data = loadUsers();
    const user = data.users[userKey];
    
    if (!user) {
        return null;
    }

    user.lastLogin = new Date().toISOString();
    user.lastToken = loginToken;
    user.sign = cryptoUtil.generateSign(user.id, loginToken);
    user.security = cryptoUtil.generateSecurity();

    if (!saveUsers(data)) {
        return null;
    }

    return user;
}

/**
 * Update nickname
 * 
 * @param {string} userKey - User key
 * @param {string} nickname - New nickname
 * @returns {boolean} Success
 */
function updateNickname(userKey, nickname) {
    const data = loadUsers();
    
    if (!data.users[userKey]) {
        return false;
    }
    
    // Sanitize nickname
    const sanitized = String(nickname || '').trim().substring(0, 30);
    data.users[userKey].nickname = sanitized || data.users[userKey].username;
    
    return saveUsers(data);
}

/**
 * Update SDK channel for user
 * 
 * @param {string} userKey - User key
 * @param {string} sdk - New SDK channel
 * @returns {boolean} Success
 */
function updateSDK(userKey, sdk) {
    const data = loadUsers();
    
    if (!data.users[userKey]) {
        return false;
    }
    
    data.users[userKey].sdk = sdk;
    return saveUsers(data);
}

// =============================================
// DELETE
// =============================================

/**
 * Delete user account
 * 
 * @param {string} userKey - User key
 * @returns {boolean} Success
 */
function deleteUser(userKey) {
    const data = loadUsers();
    
    if (!data.users[userKey]) {
        return false;
    }
    
    delete data.users[userKey];
    return saveUsers(data);
}

// =============================================
// LIST / DETAIL
// =============================================

/**
 * List users with optional search
 * 
 * @param {string|null} search - Search filter
 * @param {number} limit - Max results (default 100)
 * @returns {{ users, count, total }}
 */
function listUsers(search = null, limit = 100) {
    const data = loadUsers();
    const searchLower = (search || '').toLowerCase();
    const result = [];

    for (const [key, user] of Object.entries(data.users)) {
        // Apply search filter
        if (searchLower) {
            const keyMatch = key.toLowerCase().includes(searchLower);
            const nicknameMatch = (user.nickname || '').toLowerCase().includes(searchLower);
            if (!keyMatch && !nicknameMatch) {
                continue;
            }
        }

        result.push({
            id: user.id,
            username: user.username,
            nickname: user.nickname || user.username,
            sdk: user.sdk || CONSTANTS.DEFAULT_SDK_CHANNEL,
            isGuest: !!user.isGuest,
            appId: user.appId || CONSTANTS.DEFAULT_APP_ID,
            createdAt: user.createdAt,
            lastLogin: user.lastLogin
        });

        // Apply limit
        if (result.length >= limit) {
            break;
        }
    }

    return {
        users: result,
        count: result.length,
        total: Object.keys(data.users).length
    };
}

/**
 * Get user detail (without sensitive fields)
 * 
 * @param {string} userId - User ID
 * @returns {Object | null} User detail or null
 */
function getUserDetail(userId) {
    const found = findById(userId);
    
    if (!found) {
        return null;
    }

    const user = found.user;
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
 * Get user count
 * 
 * @returns {number} Total users
 */
function getUserCount() {
    return Object.keys(loadUsers().users).length;
}

/**
 * Get user stats
 * 
 * @returns {Object} User statistics
 */
function getStats() {
    const data = loadUsers();
    const users = data.users;
    
    let guests = 0;
    let registered = 0;
    const channels = {};
    
    for (const user of Object.values(users)) {
        if (user.isGuest) {
            guests++;
        } else {
            registered++;
        }
        
        const channel = user.sdk || CONSTANTS.DEFAULT_SDK_CHANNEL;
        channels[channel] = (channels[channel] || 0) + 1;
    }
    
    return {
        total: Object.keys(users).length,
        guests,
        registered,
        channels
    };
}

// =============================================
// CONVERT GUEST TO REGISTERED
// =============================================

/**
 * Convert guest account to registered account
 * 
 * @param {string} guestKey - Guest user key
 * @param {string} username - New username
 * @param {string} password - New password
 * @returns {{ success, user } | { error }}
 */
function convertGuestToRegistered(guestKey, username, password) {
    const data = loadUsers();
    const guest = data.users[guestKey];
    
    if (!guest) {
        return { error: 'User tidak ditemukan' };
    }
    
    if (!guest.isGuest) {
        return { error: 'User sudah terdaftar' };
    }
    
    // Check username availability
    const newKey = username.toLowerCase();
    if (data.users[newKey] && newKey !== guestKey) {
        return { error: `Username "${username}" sudah digunakan` };
    }
    
    // Validate
    const usernameValidation = cryptoUtil.validateUsername(username);
    if (!usernameValidation.valid) {
        return { error: usernameValidation.message };
    }
    
    const passwordValidation = cryptoUtil.validatePassword(password);
    if (!passwordValidation.valid) {
        return { error: passwordValidation.message };
    }
    
    // Update guest to registered
    const salt = cryptoUtil.generateSalt();
    const loginToken = cryptoUtil.generateLoginToken();
    
    guest.username = usernameValidation.username;
    guest.passwordHash = cryptoUtil.hashPassword(password, salt);
    guest.salt = salt;
    guest.nickname = usernameValidation.username;
    guest.isGuest = false;
    guest.lastLogin = new Date().toISOString();
    guest.lastToken = loginToken;
    guest.sign = cryptoUtil.generateSign(guest.id, loginToken);
    guest.security = cryptoUtil.generateSecurity();
    
    // Move to new key if username changed
    if (newKey !== guestKey) {
        delete data.users[guestKey];
        data.users[newKey] = guest;
    }
    
    if (!saveUsers(data)) {
        return { error: 'Gagal menyimpan. Silakan coba lagi.' };
    }
    
    logger.info('UserManager', `Converted guest to registered: ${usernameValidation.username}`);
    return { success: true, user: guest };
}

// =============================================
// EXPORT
// =============================================

module.exports = {
    // Find
    findById,
    findByDeviceId,
    findByUsername,
    usernameExists,
    
    // Create
    createGuest,
    createRegistered,
    
    // Update
    updateAfterLogin,
    updateNickname,
    updateSDK,
    
    // Delete
    deleteUser,
    
    // List/Detail
    listUsers,
    getUserDetail,
    getUserCount,
    getStats,
    
    // Special
    convertGuestToRegistered
};