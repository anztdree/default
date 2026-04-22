/**
 * ============================================================================
 * Chat Server — Configuration Constants
 * Port 8002 — Socket.IO v2, TEA verification ENABLED
 * ============================================================================
 *
 * NATURAL CONFIGURATION
 * Source of truth: main.min.js client analysis + HAR capture
 * Standalone — no shared dependencies with other servers
 *
 * PROTOCOL REFERENCE (from main.min.js):
 *   Verify handshake  : XXTEA key "verification", Base64 transport
 *   Response format   : { ret:0, data:"JSON", compress:bool, serverTime, server0Time }
 *   Push/Notify format: { ret:"SUCCESS", data:"JSON", compress:bool, serverTime }
 *   Compress threshold: JSON > 200 chars → LZ-String UTF16
 *   server0Time       : +25200000 (UTC+7, HAR-verified POSITIVE value)
 *
 * CHAT ACTIONS (via handler.process, type="chat"):
 *   login     → { userId, serverId } → {}
 *   sendMsg   → { userId, kind, content, msgType, param, roomId } → { _time }
 *   joinRoom  → { userId, roomId } → { _record: [messages] }
 *   leaveRoom → { userId, roomId } → {}
 *   getRecord → { userId, roomId, startTime } → { _record: [messages] }
 *
 * ============================================================================
 */

require('dotenv').config({
  path: require('path').join(__dirname, '..', '.env')
});

module.exports = {

  // ==========================================
  // SERVER
  // ==========================================

  /** Chat server port — client connects here after registChat */
  PORT: parseInt(process.env.CHAT_PORT) || 8002,

  /** Host binding */
  HOST: process.env.CHAT_HOST || '0.0.0.0',

  // ==========================================
  // TEA ENCRYPTION (identical to main-server)
  // ==========================================

  /**
   * TEA verification key — MUST match client:
   *   var o = (new TEA).encrypt(challenge, "verification");
   */
  TEA_KEY: 'verification',

  /** Verify timeout — client HANGS if no callback sent */
  VERIFY_TIMEOUT_MS: 15000,

  /**
   * Max verify attempts:
   *   attempt < max → ret:4  (INVALID, client may retry)
   *   attempt >= max → ret:38 (LOGIN_CHECK_FAILED, disconnect)
   */
  VERIFY_MAX_ATTEMPTS: 3,

  // ==========================================
  // SOCKET.IO (same as main-server)
  // ==========================================

  PING_INTERVAL:   25000,
  PING_TIMEOUT:    60000,
  UPGRADE_TIMEOUT: 30000,

  // ==========================================
  // TIME
  // ==========================================

  /**
   * server0Time — HAR-verified: 25200000 (POSITIVE, UTC+7)
   *
   * Client formula:
   *   _offTime = 60 * getTimezoneOffset() * 1000 - server0Time
   *   getServerLocalDate() = new Date(serverTime + _offTime)
   */
  SERVER_UTC_OFFSET_MS: parseInt(process.env.SERVER_UTC_OFFSET_MS) || 25200000,

  // ==========================================
  // DATABASE — shared DB with other servers
  // ==========================================

  DB: {
    host:             process.env.DB_HOST     || '127.0.0.1',
    port:             parseInt(process.env.DB_PORT) || 3306,
    user:             process.env.DB_USER     || 'admin',
    password:         process.env.DB_PASSWORD || 'admin',
    database:         process.env.DB_DATABASE || 'super_warrior_z',
    connectionLimit:  parseInt(process.env.DB_CONNECTION_LIMIT) || 5,
    connectTimeout:   10000,
    acquireTimeout:   10000,
  },

  // ==========================================
  // CHAT LIMITS
  // ==========================================

  /** Max message content length (chars) */
  MAX_MESSAGE_LENGTH: 500,

  /** Max recent records returned on joinRoom */
  JOIN_ROOM_RECORD_LIMIT: 30,

  /** Max records returned by getRecord */
  GET_RECORD_LIMIT: 100,

  // ==========================================
  // LOGGING
  // ==========================================

  LOG_LEVEL: (process.env.LOG_LEVEL || 'info').toUpperCase(),
};
