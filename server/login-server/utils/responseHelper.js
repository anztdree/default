/**
 * ============================================================================
 * Login Server — Response Helper
 * ============================================================================
 *
 * NATURAL IMPLEMENTATION:
 * - Builds client-compatible responses
 * - Auto-compression for large data
 * - Standard error codes
 *
 * Client response format (main.min.js line 76925-76935):
 * { ret: 0, data: "JSON_STRING", compress: boolean, serverTime, server0Time }
 *
 * Success detection: 0 === e.ret
 * Error detection: else → ErrorHandler.ShowErrorTips(e.ret)
 * Data parsing: JSON.parse(e.data), optional LZString.decompressFromUTF16
 *
 * ============================================================================
 */

const LZString = require('lz-string');
const CONSTANTS = require('../config/constants');

// =============================================
// COMPRESS
// =============================================

/**
 * Compress string to UTF16 format (client-compatible)
 * @param {string} str - String to compress
 * @returns {string} Compressed string
 */
function compress(str) {
    return LZString.compressToUTF16(str);
}

// =============================================
// RESPONSES
// =============================================

/**
 * Build success response
 * 
 * @param {Object} dataObj - Data to return (JSON.stringify'd)
 * @param {boolean} forceCompress - Force compress (default: auto when >200 chars)
 * @returns {Object} Response object
 */
function success(dataObj, forceCompress) {
    const now = Date.now();
    let dataStr = '';
    let compress = false;

    if (dataObj !== undefined && dataObj !== null) {
        dataStr = JSON.stringify(dataObj);
        
        // Auto-compress when large
        if (forceCompress === true) {
            compress = true;
        } else if (forceCompress === undefined && dataStr.length > 200) {
            compress = true;
        }
        
        if (compress) {
            dataStr = compress(dataStr);
        }
    }

    return {
        ret: 0,
        data: dataStr,
        compress: compress,
        serverTime: now,
        server0Time: CONSTANTS.SERVER_UTC_OFFSET_MS
    };
}

/**
 * Build error response
 * 
 * @param {number} code - Error code from ErrorCode
 * @param {string} msg - Optional error message
 * @returns {Object} Error response
 */
function error(code, msg) {
    return {
        ret: code,
        data: msg || '',
        compress: false,
        serverTime: Date.now(),
        server0Time: CONSTANTS.SERVER_UTC_OFFSET_MS
    };
}

/**
 * Build push/notify response
 * Client: if("SUCCESS" == t.ret) { ... }
 * 
 * @param {Object} dataObj - Data to push
 * @returns {Object} Push response
 */
function push(dataObj) {
    return {
        ret: 'SUCCESS',
        data: JSON.stringify(dataObj || {}),
        compress: false,
        serverTime: Date.now(),
        server0Time: CONSTANTS.SERVER_UTC_OFFSET_MS
    };
}

// =============================================
// ERROR CODES
// =============================================

/**
 * Error codes (from errorDefine.json)
 */
const ErrorCode = {
    UNKNOWN: 1,
    STATE_ERROR: 2,
    DATA_ERROR: 3,
    INVALID: 4,
    INVALID_COMMAND: 5,
    SESSION_EXPIRED: 6,
    LACK_PARAM: 8,
    USER_LOGIN_BEFORE: 12,
    USER_NOT_LOGIN_BEFORE: 13,
    USER_NOT_LOGOUT: 14,
    LOGIN_CHECK_FAILED: 38,
    FORBIDDEN_LOGIN: 45,
    NOT_ENABLE_REGIST: 47,
    GAME_SERVER_OFFLINE: 51,
    CLIENT_VERSION_ERR: 62,
    MAINTAIN: 65,
    USER_NOT_REGIST: 57003
};

// =============================================
// EXPORT
// =============================================

module.exports = {
    success,
    error,
    push,
    ErrorCode
};