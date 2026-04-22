/**
 * ============================================================================
 * Login Server — Constants & Configuration
 * ============================================================================
 *
 * NATURAL CONFIGURATION
 * Source of truth: main.min.js client analysis
 * NO external shared/ dependencies — fully standalone
 *
 * ============================================================================
 */

require('dotenv').config({ 
    path: require('path').join(__dirname, '..', '.env') 
});

// =============================================
// SERVER
// =============================================

/** Server port */
const PORT = parseInt(process.env.LOGIN_PORT) || 8000;

/** Host binding - 0.0.0.0 for LAN access */
const HOST = process.env.LOGIN_HOST || '0.0.0.0';

/** Development mode */
const IS_DEV = process.env.NODE_ENV === 'development' || process.argv.includes('--dev');

// =============================================
// SOCKET.IO
// =============================================

/** Socket.IO ping interval (ms) */
const PING_INTERVAL = 25000;

/** Socket.IO ping timeout (ms) */
const PING_TIMEOUT = 60000;

// =============================================
// SDK (from client sdk.js)
// =============================================

/** Default SDK channel - MUST be 'ppgame' per sdk.js SDK_CONFIG.CHANNEL */
const DEFAULT_SDK_CHANNEL = 'ppgame';

/** Default App ID - MUST be '288' per sdk.js SDK_CONFIG.APP_ID */
const DEFAULT_APP_ID = '288';

/** Default password for auto-registered users (main.min.js line 88641) */
const DEFAULT_PASSWORD = 'game_origin';

/** Client always sends version: "1.0" */
const CLIENT_VERSION = '1.0';

// =============================================
// SERVER0TIME — CRITICAL for client time calculations
// =============================================
// Client formula (main.min.js line 116952-116954):
// _offTime = 60 * getTimezoneOffset() * 1000 - server0Time
// getServerLocalDate() = new Date(serverTime + _offTime)
//
// For correct server time: server0Time = -(server_tz_offset_ms)
// UTC+7 (Jakarta) =  25200000
// UTC+8 (Singapore) =  28800000
const SERVER_UTC_OFFSET_MS = parseInt(process.env.SERVER_UTC_OFFSET_MS) ||  25200000;

// =============================================
// SERVER LIST — sent to client via GetServerList
// =============================================
// Client reads: serverList[i].serverId, .name, .url, .dungeonurl, .chaturl

/** Public hostname/IP for clients to connect to */
const SERVER_PUBLIC_HOST = process.env.SERVER_PUBLIC_HOST || '127.0.0.1';

/** Main game server port */
const MAIN_SERVER_PORT = parseInt(process.env.MAIN_SERVER_PORT) || 8001;

/** Chat server port */
const CHAT_SERVER_PORT = parseInt(process.env.CHAT_SERVER_PORT) || 8002;

/** Dungeon server port */
const DUNGEON_SERVER_PORT = parseInt(process.env.DUNGEON_SERVER_PORT) || 8003;

/** Server ID for single-server setup */
const DEFAULT_SERVER_ID = 1;

/** Server name displayed to clients */
const DEFAULT_SERVER_NAME = 'Server 1';

// =============================================
// TOKEN
// =============================================

/** Token expiry: 24 hours (ms) */
const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000;

/** Token random part length */
const TOKEN_RANDOM_LENGTH = 8;

// =============================================
// RATE LIMITING
// =============================================

/** Maximum failed login attempts per window */
const RATE_MAX_ATTEMPTS = 5;

/** Rate limit window (ms) - 1 minute */
const RATE_WINDOW_MS = 60 * 1000;

/** Ban duration after exceeding max attempts (ms) - 5 minutes */
const RATE_BAN_MS = 5 * 60 * 1000;

/** Rate limiter cleanup interval (ms) - 10 minutes */
const RATE_CLEANUP_MS = 10 * 60 * 1000;

// =============================================
// ANNOUNCE
// =============================================

/** Enable login announcements/notices */
const ANNOUNCE_ENABLED = false;

// =============================================
// DATABASE (MariaDB)
// =============================================

const DB_CONFIG = {
    /** Database host */
    host: process.env.DB_HOST || '127.0.0.1',
    
    /** Database port */
    port: parseInt(process.env.DB_PORT) || 3306,
    
    /** Database user */
    user: process.env.DB_USER || 'admin',
    
    /** Database password */
    password: process.env.DB_PASSWORD || 'admin',
    
    /** Database name */
    database: process.env.DB_DATABASE || 'super_warrior_z',
    
    /** Connection pool limit */
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 5,
    
    /** Connect timeout (ms) */
    connectTimeout: 10000,
    
    /** Acquire timeout (ms) */
    acquireTimeout: 10000
};

// =============================================
// LOGGING
// =============================================

/** Log level: DEBUG, INFO, WARN, ERROR */
const LOG_LEVEL = (process.env.LOG_LEVEL || 'info').toUpperCase();

// =============================================
// EXPORT
// =============================================

module.exports = {
    // Server
    PORT,
    HOST,
    IS_DEV,
    
    // Socket.IO
    PING_INTERVAL,
    PING_TIMEOUT,
    
    // SDK
    DEFAULT_SDK_CHANNEL,
    DEFAULT_APP_ID,
    DEFAULT_PASSWORD,
    CLIENT_VERSION,
    
    // Time
    SERVER_UTC_OFFSET_MS,
    
    // Server List
    SERVER_PUBLIC_HOST,
    MAIN_SERVER_PORT,
    CHAT_SERVER_PORT,
    DUNGEON_SERVER_PORT,
    DEFAULT_SERVER_ID,
    DEFAULT_SERVER_NAME,
    
    // Token
    TOKEN_EXPIRY_MS,
    TOKEN_RANDOM_LENGTH,
    
    // Rate Limiting
    RATE_MAX_ATTEMPTS,
    RATE_WINDOW_MS,
    RATE_BAN_MS,
    RATE_CLEANUP_MS,
    
    // Announce
    ANNOUNCE_ENABLED,
    
    // Database
    DB: DB_CONFIG,
    
    // Logging
    LOG_LEVEL
};