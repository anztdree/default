/**
 * Response Helper Module
 * 
 * 100% derived from client code analysis.
 * 
 * CLIENT RESPONSE FORMAT (line 76925-76935):
 *   Response object: { ret, data, compress, serverTime, server0Time }
 *   
 *   SUCCESS detection (line 76925):
 *     if(0 === e.ret) { ... success path ... }
 *   ERROR detection:
 *     else { ErrorHandler.ShowErrorTips(e.ret, callback) }
 *   
 *   Data parsing (line 76926-76929):
 *     var i = e.data;              // data is a STRING (not object)
 *     e.compress && (t = LZString.decompressFromUTF16(t));  // optional decompress
 *     var a = JSON.parse(t);       // parse string to object
 *   
 *   Special error handling:
 *     "22" == e.ret → ts.reportBattlleLog()
 *     "38" == e.ret → TSBrowser.executeFunction("reload")
 *   
 * PUSH/NOTIFY FORMAT (line 77182):
 *   if("SUCCESS" == t.ret) { ... process push ... }
 *   Push uses ret = "SUCCESS" (string)
 * 
 * SERVER0TIME EXPLANATION (line 116952-116954):
 *   ServerTime class updateServerTime:
 *     e._ts = t;                                          // serverTime (current timestamp)
 *     e._offTime = 60 * new Date().getTimezoneOffset() * 1000 - n;  // n = server0Time
 *     e.getServerLocalDate() = new Date(e._ts + e._offTime);
 *   
 *   PROOF: server0Time = -(server's UTC offset in ms)
 *   For getServerLocalDate() to return correct server local time:
 *     UTC+7 client: getTimezoneOffset()=-420, _offTime = -25200000 - server0Time
 *     For server local time: need _offTime=0 → server0Time = -25200000
 *   
 *   WRONG value +25200000 causes _offTime=-50400000, making getServerLocalDate()
 *   14 hours behind UTC → ALL time-based features broken (daily reset, dungeons, events).
 *   
 *   CORRECT: server0Time = -(server_tz_offset_ms)
 *     UTC+7 (Jakarta)  = -25200000
 *     UTC+8 (Singapore) = -28800000
 * 
 * ERROR CODES from resource/json/errorDefine.json (365 codes):
 *   1 = ERROR_UNKNOWN
 *   12 = ERROR_USER_LOGIN_BEFORE (user already logged in)
 *   38 = ERROR_LOGIN_CHECK_FAILED (triggers page reload)
 *   45 = FORBIDDEN_LOGIN
 *   47 = NOT_ENABLE_REGIST
 *   51 = GAME_SERVER_OFFLINE
 *   62 = CLIENT_VERSION_ERR
 *   65 = MAINTAIN
 * 57003 = USER_NOT_REGIST (KICK)
 * 
 * REQUEST FORMAT:
 *   Client sends all requests via "handler.process" event:
 *     socket.emit("handler.process", { type, action, userId, ...params }, callback)
 *   Server receives and routes to handler based on type.
 */

// =============================================
// 1. RESPONSE BUILDERS
// =============================================

/**
 * server0Time = NEGATIVE of server's UTC offset in milliseconds.
 *
 * Client formula (main.min.js line 116952-116954):
 *   _offTime = 60 * getTimezoneOffset() * 1000 - server0Time
 *   getServerLocalDate() = new Date(serverTime + _offTime)
 *
 * For getServerLocalDate() to return correct server local time:
 *   server0Time must equal -(server_tz_offset_ms).
 *   UTC+7: server0Time = -25200000
 *   UTC+8: server0Time = -28800000
 *
 * WRONG value +25200000 causes _offTime = -50400000 for UTC+7 client,
 * making server time 14 hours behind UTC → ALL time features broken.
 *
 * Read from SERVER_UTC_OFFSET_MS env var (set in .env).
 * Falls back to -25200000 (UTC+7) if not set.
 */
var SERVER_UTC_OFFSET_MS = parseInt(process.env.SERVER_UTC_OFFSET_MS) || -25200000;

/**
 * Build success response
 * Client expects: ret=0 (number), data=JSON string, serverTime, server0Time
 * 
 * @param {object} dataObj - Data object to return (will be JSON.stringify'd)
 * @param {boolean} compress - Whether to compress data with LZString
 * @returns {object} Response object matching client format
 */
function success(dataObj, compress) {
    var now = Date.now();
    var dataStr;

    if (dataObj !== undefined && dataObj !== null) {
        dataStr = JSON.stringify(dataObj);
        // FIX 6: Auto-compress when data is large enough (> 200 chars)
        // Client supports LZString.decompressFromUTF16() when compress=true
        if (compress === undefined) {
            compress = dataStr.length > 200;
        }
        if (compress) {
            var lzHelper = require('./lzHelper');
            dataStr = lzHelper.compressData(dataStr);
        }
    } else {
        compress = false;
    }

    return {
        ret: 0,           // 0 = SUCCESS (number, strict equality: 0 === e.ret)
        data: dataStr,
        compress: !!compress,
        serverTime: now,  // Current server timestamp (dynamic)
        server0Time: SERVER_UTC_OFFSET_MS,  // -(server_tz_offset_ms), e.g. -25200000 for UTC+7
    };
}

/**
 * Build error response
 * Client expects: ret=error_code (number), triggers ErrorHandler.ShowErrorTips
 * 
 * Error codes from errorDefine.json:
 *   1  = ERROR_UNKNOWN - Unknown error
 *   2  = ERROR_STATE_ERROR - State error
 *   3  = ERROR_DATA_ERROR - Data error
 *   4  = ERROR_INVALID - Invalid request
 *   5  = ERROR_INVALID_COMMAND - Invalid command
 *   6  = ERROR_NOT_VERIFIED - Not verified (used by main-server before TEA verify)
 *   8  = ERROR_LACK_PARAM - Missing parameter
 *   12 = ERROR_USER_LOGIN_BEFORE - User already logged in
 *   13 = ERROR_USER_NOT_LOGIN_BEFORE - User not logged in before
 *   14 = ERROR_USER_NOT_LOGOUT - User not logged out
 *   38 = ERROR_LOGIN_CHECK_FAILED - Login check failed (triggers reload!)
 *   45 = FORBIDDEN_LOGIN - Login forbidden
   * 47 = NOT_ENABLE_REGIST - Registration not enabled
 *   51 = GAME_SERVER_OFFLINE - Game server offline
 *   62 = CLIENT_VERSION_ERR - Client version error
 *   65 = MAINTAIN - Server maintenance
 * 57003 = USER_NOT_REGIST - User not registered (KICK)
 * 
 * @param {number} code - Error code from errorDefine.json
 * @param {string} dataStr - Optional error data string
 * @returns {object} Error response object
 */
function error(code, dataStr) {
    return {
        ret: code,        // Error code number from errorDefine.json
        data: dataStr || '',
        compress: false,
        serverTime: Date.now(),
        server0Time: SERVER_UTC_OFFSET_MS,  // -(server_tz_offset_ms), e.g. -25200000 for UTC+7
    };
}

/**
 * Build push/notify response
 * Client expects: ret="SUCCESS" (string literal)
 * 
 * Client source (line 77182):
 *   if("SUCCESS" == t.ret) { ... process push ... }
 * 
 * Client reads action from INSIDE the parsed data (line 77186):
 *   var o = JSON.parse(t.data);
 *   if("Kickout" == o.action) { ... }
 * 
 * FIX #6: Do NOT set action at top-level of response.
 * The action must be INSIDE dataObj (which becomes the data string).
 * 
 * @param {object} dataObj - Push data object (action should be inside this object)
 * @returns {object} Push response
 */
function push(dataObj) {
    var now = Date.now();
    return {
        ret: 'SUCCESS',   // String "SUCCESS" for push/notify (NOT number 0)
        data: JSON.stringify(dataObj || {}),
        // FIX #6: Removed top-level action — client reads action from inside data payload
        compress: false,  // FIX #3: Added for consistency — notify data is never compressed
        serverTime: now,
        server0Time: SERVER_UTC_OFFSET_MS,  // -(server_tz_offset_ms), e.g. -25200000 for UTC+7
    };
}

// =============================================
// 2. REQUEST PARSER
//    Used by main-server to validate incoming requests
// =============================================

/**
 * Parse and validate incoming request from client.
 * 
 * Client sends: { type, action, userId, ...params }
 * This function validates the request has required fields
 * and returns the parsed request object for handler routing.
 * 
 * Used by main-server:
 *   var parsed = ResponseHelper.parseRequest(request);
 *   var type = parsed.type;
 *   var action = parsed.action;
 *   var userId = parsed.userId;
 * 
 * @param {object} request - Raw request from client
 * @returns {object|null} Parsed request with type/action/userId, or null if invalid
 */
function parseRequest(request) {
    // Must be a non-null object
    if (!request || typeof request !== 'object') {
        return null;
    }

    // type is required — maps to handler file name (e.g. "hero" → handlers/hero.js)
    if (!request.type || typeof request.type !== 'string') {
        return null;
    }

    // action is required — maps to case in handler's switch statement
    if (!request.action || typeof request.action !== 'string') {
        return null;
    }

    // Return the request as-is (all params passed through to handler)
    return request;
}

// =============================================
// 3. RESPONSE SENDER
//    Used by main-server to send responses back to client
// =============================================

/**
 * Send response to client via Socket.IO callback or emit.
 * 
 * Client pattern:
 *   socket.emit("handler.process", payload, function(response) {
 *     if (0 === response.ret) { ... success ... }
 *     else { ErrorHandler.ShowErrorTips(response.ret) }
 *   })
 * 
 * Used by main-server:
 *   ResponseHelper.sendResponse(socket, 'handler.process', response, callback)
 * 
 * @param {object} socket - Socket.IO socket instance
 * @param {string} event - Event name (e.g. 'handler.process')
 * @param {object} response - Response object { ret, data, compress, serverTime, server0Time }
 * @param {function} [callback] - Socket.IO acknowledgment callback from client
 */
function sendResponse(socket, event, response, callback) {
    if (typeof callback === 'function') {
        // Send via Socket.IO acknowledgment callback
        // Client will receive this as the response in their callback function
        callback(response);
    } else if (socket && socket.connected) {
        // Fallback: emit as event (shouldn't normally happen)
        socket.emit(event, response);
    }
}

// =============================================
// 4. ERROR CODES
// =============================================

// Common error codes from errorDefine.json
var ErrorCode = {
    UNKNOWN_ERROR: 1,
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
    USER_NOT_REGIST: 57003,
};

module.exports = {
    success: success,
    error: error,
    push: push,
    parseRequest: parseRequest,
    sendResponse: sendResponse,
    ErrorCode: ErrorCode,
    SERVER_UTC_OFFSET_MS: SERVER_UTC_OFFSET_MS,
};
