/**
 * ============================================================================
 * Login Server — Entry Point  [FIXED v2.1]
 * Port 8000 — Socket.IO v2, NO TEA encryption
 * ============================================================================
 *
 * FIXES in v2.1:
 *   - responseHelper.js: "compress is not a function" → renamed internal
 *     compression function to _lzCompress so it doesn't shadow the
 *     local boolean variable 'compress' / 'shouldCompress'.
 *   - All handlers: added errorCode:0 to responses (HAR-verified).
 *   - saveHistory: daily count now DB-backed (not in-memory).
 *   - loginAnnounce: response now { data:[], errorCode:0 }.
 *   - getServerList, saveLanguage, saveUserEnterInfo: forceCompress=false.
 *
 * ============================================================================
 */

const http    = require('http');
const express = require('express');
const socketIo = require('socket.io');

const CONSTANTS = require('./config/constants');
const { success, error, ErrorCode } = require('./utils/responseHelper');
const logger = require('./utils/logger');
const DB     = require('./services/db');

// Handlers
const { loginGame }        = require('./handlers/loginGame');
const { getServerList }    = require('./handlers/getServerList');
const { saveHistory }      = require('./handlers/saveHistory');
const { loginAnnounce }    = require('./handlers/loginAnnounce');
const { saveLanguage }     = require('./handlers/saveLanguage');
const { saveUserEnterInfo } = require('./handlers/saveUserEnterInfo');

// Rate Limiter
const RateLimiter = require('./middleware/rateLimiter');

// =============================================
// EXPRESS APP
// =============================================

const app = express();

// CORS Middleware for non-Socket.IO routes (e.g. /health)
app.use((req, res, next) => {
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

// Health endpoint
app.get('/health', (req, res) => {
  res.json({
    status:   'ok',
    service:  'login-server',
    version:  '2.1.0',
    port:     CONSTANTS.PORT,
    host:     CONSTANTS.HOST,
    dbReady:  DB.isReady(),
    uptime:   process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// =============================================
// HTTP SERVER + SOCKET.IO
// =============================================

const server = http.createServer(app);

const io = socketIo(server, {
  // Do NOT serve client library (API-only server)
  serveClient: false,

  // Match client transports (polling first, then upgrade)
  transports: ['polling', 'websocket'],

  // Disable cookies
  cookie: false,

  // Timing
  pingInterval: CONSTANTS.PING_INTERVAL || 25000,
  pingTimeout:  CONSTANTS.PING_TIMEOUT  || 60000,

  // Allow upgrades
  allowUpgrades:   true,
  upgradeTimeout: 30000,

  // Allow all origins (Socket.IO v2)
  origins: '*',

  // Preflight CORS handler (Engine.IO v3 compatible)
  handlePreflightRequest: function(req, res) {
    const origin = req.headers.origin || '*';
    res.writeHead(200, {
      'Access-Control-Allow-Origin':      origin,
      'Access-Control-Allow-Methods':     'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers':     'Content-Type',
      'Access-Control-Allow-Credentials': 'true'
    });
    res.end();
  },

  // Allow all connections (auth happens inside handlers)
  allowRequest: function(req, callback) {
    callback(null, true);
  }
});

// =============================================
// SOCKET.IO CONNECTION
// =============================================

io.on('connection', function(socket) {
  const transport = socket.conn && socket.conn.transport
    ? socket.conn.transport.name
    : 'unknown';

  logger.info('Socket', `Connected: ${socket.id} | transport=${transport}`);

  // Log transport upgrades (polling → websocket)
  if (socket.conn) {
    socket.conn.on('upgrade', function(transport) {
      logger.info('Socket', `Upgrade: ${socket.id} → ${transport.name}`);
    });
  }

  // Main request dispatcher
  socket.on('handler.process', function(payload, callback) {
    handleProcess(socket, payload, callback);
  });

  socket.on('disconnect', function(reason) {
    logger.info('Socket', `Disconnected: ${socket.id} | reason=${reason}`);
  });

  socket.on('error', function(err) {
    logger.error('Socket', `Error: ${socket.id} | ${err.message}`);
  });
});

// =============================================
// REQUEST HANDLER
// =============================================

/**
 * Route handler.process events to action handlers
 *
 * Client sends:  { type: "User", action: "loginGame", ... }
 * Server returns: { ret: 0, data: "JSON_STRING", compress: bool, serverTime, server0Time }
 */
async function handleProcess(socket, payload, callback) {
  const action   = payload && payload.action;
  const userId   = (payload && (payload.userId || payload.accountToken)) || '-';
  const clientIp = (socket.handshake && socket.handshake.address)
    || (socket.conn && socket.conn.remoteAddress)
    || '?';

  logger.info('Request', `${action} | userId=${userId} | ip=${clientIp}`);

  try {
    switch (action) {
      case 'loginGame':
        await loginGame(socket, payload, callback, clientIp);
        break;

      case 'GetServerList':
        getServerList(payload, callback);
        break;

      case 'SaveHistory':
        await saveHistory(payload, callback);
        break;

      case 'LoginAnnounce':
        loginAnnounce(callback);
        break;

      case 'SaveLanguage':
        await saveLanguage(payload, callback);
        break;

      case 'SaveUserEnterInfo':
        saveUserEnterInfo(payload, callback);
        break;

      default:
        logger.warn('Request', `Unknown action: ${action}`);
        if (callback) {
          callback(success({ errorCode: 0 }));
        }
        break;
    }

  } catch (err) {
    logger.error('Request', `Handler error (${action}): ${err.message}`);
    if (callback) {
      callback(error(ErrorCode.UNKNOWN));
    }
  }
}

// =============================================
// GRACEFUL SHUTDOWN
// =============================================

function gracefulShutdown(signal) {
  logger.info('Shutdown', `${signal} received...`);

  io.close();
  server.close(function() {
    DB.close().then(function() {
      logger.info('Shutdown', 'Done');
      process.exit(0);
    }).catch(function() {
      process.exit(0);
    });
  });

  // Force exit after 5s
  setTimeout(function() {
    logger.warn('Shutdown', 'Forced exit after timeout');
    process.exit(1);
  }, 5000);
}

process.on('SIGINT',  () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

process.on('uncaughtException', function(err) {
  logger.error('Error', `Uncaught: ${err.message}`);
  console.error(err.stack);
  process.exit(1);
});

// =============================================
// START
// =============================================

async function start() {
  logger.info('Server', 'Starting Login Server v2.1...');

  try {
    // Initialize database
    await DB.init();
    logger.info('Server', 'Database initialized');

    // Start HTTP server
    server.listen(CONSTANTS.PORT, CONSTANTS.HOST, function() {
      printBanner();
      logger.info('Server', `Listening on ${CONSTANTS.HOST}:${CONSTANTS.PORT}`);
    });

  } catch (err) {
    logger.error('Server', `Failed to start: ${err.message}`);
    process.exit(1);
  }
}

// =============================================
// BANNER
// =============================================

function printBanner() {
  const TEA_STATUS = 'OFF (verifyEnable=false)';
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║          Super Warrior Z — Login Server v2.1              ║');
  console.log('╠══════════════════════════════════════════════════════════════╣');
  console.log(`║ Port:        ${String(CONSTANTS.PORT).padEnd(43)}║`);
  console.log(`║ Host:        ${String(CONSTANTS.HOST).padEnd(43)}║`);
  console.log(`║ TEA:         ${TEA_STATUS.padEnd(43)}║`);
  console.log('║ CORS:        Natural Socket.IO configuration              ║');
  console.log('║ Transports:  polling, websocket                           ║');
  console.log(`║ DB:          ${(CONSTANTS.DB.host+':'+CONSTANTS.DB.port+'/'+CONSTANTS.DB.database).padEnd(43)}║`);
  console.log(`║ server0Time: ${String(CONSTANTS.SERVER_UTC_OFFSET_MS).padEnd(43)}║`);
  console.log('╠══════════════════════════════════════════════════════════════╣');
  console.log('║ Actions:                                                    ║');
  console.log('║   loginGame       → Auto-register + token                  ║');
  console.log('║   GetServerList   → Server selection                       ║');
  console.log('║   SaveHistory     → Token refresh + daily count (DB)       ║');
  console.log('║   LoginAnnounce   → Notices                                ║');
  console.log('║   SaveLanguage    → Language preference                    ║');
  console.log('║   SaveUserEnterInfo → Analytics                            ║');
  console.log('╠══════════════════════════════════════════════════════════════╣');
  console.log('║ FIX v2.1: compress-is-not-a-function resolved              ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('');
}

start();
