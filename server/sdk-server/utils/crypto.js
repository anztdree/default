/**
 * ============================================================================
 *  Crypto Utilities
 *  ============================================================================
 *
 *  Semua fungsi kriptografi yang dipakai SDK server:
 *    - hashPassword (PBKDF2-SHA512) — untuk password storage
 *    - generateSalt — untuk password hashing
 *    - generateLoginToken — unik per session login
 *    - generateSign — signature untuk validasi user
 *    - generateSecurity — security code untuk login-server
 *    - generateOrderId — order ID untuk payment
 *
 *  Reference dari existing data:
 *    - Token: "mnvwij4q_7b367e2dbeb88523dd136e33a3b7b809c25d71e282f1466c"
 *      Format: 8-char base36 timestamp + '_' + 48-char hex (24 bytes)
 *    - Sign: "869ade36f9de1b26d4c9119fcf87d45b"
 *      Format: 32-char hex (sha256, first 32 chars)
 *    - Security: "4929977724e50a7101f078b08e273a45"
 *      Format: 32-char hex (16 bytes random)
 *    - Salt: "6a0c25c606132d907ec453f3af8ee22dca9778176fe2a33d8298a6e926692513"
 *      Format: 64-char hex (32 bytes random)
 *    - PasswordHash: "8dffe562121de441b60236ccd1ed74a1483d8341d4f0903c0a1db529fa01dc5fb4ab19eaf963bf25b76a99542202a80dc3d1cacc5b1ae4d08a9fd446ca5d34e3"
 *      Format: 128-char hex (64 bytes = PBKDF2-SHA512 output)
 *
 * ============================================================================
 */

var crypto = require('crypto');
var CONSTANTS = require('../config/constants');

// =============================================
// PASSWORD HASHING
// =============================================

/**
 * Hash password menggunakan PBKDF2-SHA512 (synchronous).
 *
 * Algoritma:
 *   PBKDF2(password, salt, iterations=10000, keyLength=64, sha512)
 *   Output: 128-char hex string
 *
 * Contoh output dari existing data:
 *   "8dffe562121de441b60236ccd1ed74a1483d8341..."
 *   (128 hex chars = 64 bytes)
 *
 * @param {string} password - Plain text password
 * @param {string} salt - Hex string salt (64 chars = 32 bytes)
 * @returns {string} Hashed password (128-char hex string)
 */
function hashPassword(password, salt) {
    return crypto.pbkdf2Sync(
        password,
        salt,
        CONSTANTS.HASH_ITERATIONS,
        CONSTANTS.HASH_KEY_LENGTH,
        CONSTANTS.HASH_ALGORITHM
    ).toString('hex');
}

/**
 * Verifikasi password terhadap hash.
 *
 * @param {string} password - Plain text password
 * @param {string} salt - Hex string salt
 * @param {string} storedHash - Hashed password dari storage
 * @returns {boolean} true jika password cocok
 */
function verifyPassword(password, salt, storedHash) {
    var computedHash = hashPassword(password, salt);
    // Timing-safe comparison untuk mencegah timing attacks
    return crypto.timingSafeEqual(
        Buffer.from(computedHash, 'hex'),
        Buffer.from(storedHash, 'hex')
    );
}

/**
 * Generate random salt (32 bytes → 64-char hex string).
 *
 * Contoh output dari existing data:
 *   "6a0c25c606132d907ec453f3af8ee22dca9778176fe2a33d8298a6e926692513"
 *
 * @returns {string} 64-char hex string
 */
function generateSalt() {
    return crypto.randomBytes(CONSTANTS.SALT_LENGTH).toString('hex');
}

// =============================================
// TOKEN GENERATION
// =============================================

/**
 * Generate login token — unik per session login.
 *
 * Format: {timestamp_base36}_{random_hex}
 * Contoh dari existing data: "mnvwij4q_7b367e2dbeb88523dd136e33a3b7b809c25d71e282f1466c"
 *   - "mnvwij4q" = Date.now().toString(36) — 8 chars base36 timestamp
 *   - "_" = separator
 *   - "7b367e2dbeb88523dd136e33a3b7b809c25d71e282f1466c" = crypto.randomBytes(24).toString('hex') — 48 chars
 *
 * Total: 8 + 1 + 48 = 57 chars
 *
 * Token ini:
 *   1. Disimpan di data/sessions.json sebagai key
 *   2. Dikirim ke client via login response
 *   3. Client kirim ke login-server sebagai loginToken
 *   4. Client kirim ke game sebagai ?logintoken= URL param
 *
 * @returns {string} Login token (57-char string)
 */
function generateLoginToken() {
    var timestamp = Date.now().toString(36);
    var random = crypto.randomBytes(CONSTANTS.TOKEN_RANDOM_BYTES).toString('hex');
    return timestamp + '_' + random;
}

// =============================================
// SIGNATURE & SECURITY
// =============================================

/**
 * Generate sign (signature) untuk validasi user.
 *
 * Algoritma: sha256(userId + loginToken + SIGN_SECRET).substring(0, 32)
 * Output: 32-char hex string
 *
 * Digunakan oleh:
 *   - ts.loginUserInfo.sign (main.min.js line 88571)
 *   - ReportToSdkCommon sign field (main.min.js line 52504)
 *
 * Contoh dari existing data: "869ade36f9de1b26d4c9119fcf87d45b"
 *
 * @param {string} userId - User ID string
 * @param {string} loginToken - Login token string
 * @returns {string} 32-char hex signature
 */
function generateSign(userId, loginToken) {
    return crypto.createHash('sha256')
        .update(userId + loginToken + CONSTANTS.SIGN_SECRET)
        .digest('hex')
        .substring(0, 32);
}

/**
 * Generate security code.
 *
 * Format: 16 bytes random → 32-char hex string
 *
 * Digunakan oleh:
 *   - ts.loginInfo.userInfo.securityCode (main.min.js line 88725)
 *   - Dikirim sebagai ?security= URL param oleh sdk.js
 *
 * Contoh dari existing data: "4929977724e50a7101f078b08e273a45"
 *
 * @returns {string} 32-char hex string
 */
function generateSecurity() {
    return crypto.randomBytes(CONSTANTS.SECURITY_LENGTH).toString('hex');
}

// =============================================
// ORDER ID
// =============================================

/**
 * Generate order ID untuk payment.
 *
 * Format: ORD{padded_num}_{timestamp_base36}_{random_hex}
 * Contoh: "ORD000001_mnvwiabc_7b367e2d"
 *
 * @param {number} nextOrderNum - Auto-increment order number
 * @returns {string} Order ID
 */
function generateOrderId(nextOrderNum) {
    var paddedNum = String(nextOrderNum).padStart(6, '0');
    var timestamp = Date.now().toString(36);
    var random = crypto.randomBytes(CONSTANTS.ORDER_RANDOM_BYTES).toString('hex');
    return 'ORD' + paddedNum + '_' + timestamp + '_' + random;
}

// =============================================
// SANITIZATION
// =============================================

/**
 * Sanitasi username — hanya alphanumeric dan underscore.
 * Case dipertahankan asli (tapi lookup case-insensitive).
 *
 * @param {string} username - Raw username input
 * @returns {string} Sanitized username (max 20 chars)
 */
function sanitizeUsername(username) {
    return String(username || '').replace(/[^a-zA-Z0-9_]/g, '').substring(0, CONSTANTS.USERNAME_MAX_LENGTH);
}

module.exports = {
    hashPassword: hashPassword,
    verifyPassword: verifyPassword,
    generateSalt: generateSalt,
    generateLoginToken: generateLoginToken,
    generateSign: generateSign,
    generateSecurity: generateSecurity,
    generateOrderId: generateOrderId,
    sanitizeUsername: sanitizeUsername
};
