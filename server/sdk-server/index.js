/**
 * ============================================================================
 * SDK Server v3.1 — Entry Point (Port 9999)
 * ============================================================================
 *
 * Super Warrior Z — PPGAME SDK Server
 * 
 * Natural Implementation:
 * - Clean Express setup without workarounds
 * - Proper CORS handling
 * - Standard middleware pattern
 * - No monkey-patches or overrides
 *
 * ============================================================================
 */

// =============================================
// IMPORTS
// =============================================

const express = require('express');
const cors = require('cors');

const CONSTANTS = require('./config/constants');
const store = require('./storage/jsonStore');
const rateLimiter = require('./middleware/rateLimiter');
const logger = require('./utils/logger');

// Handlers
const authHandlers = require('./handlers/auth');
const paymentHandlers = require('./handlers/payment');
const reportHandlers = require('./handlers/report');
const analyticsHandlers = require('./handlers/analytics');
const userHandlers = require('./handlers/user');

// Services
const sessionManager = require('./services/sessionManager');
const analyticsService = require('./services/analyticsService');

// =============================================
// EXPRESS APP
// =============================================

const app = express();

// =============================================
// CORS — Natural Express Approach
// =============================================

/**
 * CORS configured via environment variables for flexibility:
 * - CORS_ORIGIN=* (default) for development
 * - CORS_ORIGIN=https://domain.com for production with credentials
 */
app.use(cors(CONSTANTS.CORS_CONFIG));

// =============================================
// BODY PARSING
// =============================================

app.use(express.json({ limit: CONSTANTS.BODY_LIMIT }));
app.use(express.urlencoded({ extended: true }));

// =============================================
// REQUEST LOGGING
// =============================================

/**
 * Skip noisy endpoints (analytics, reports)
 * Log all other requests in development mode
 */
const skipLogPaths = [
    '/api/analytics/event',
    '/api/report/event',
    '/api/report/batch'
];

app.use((req, res, next) => {
    if (CONSTANTS.IS_DEV && skipLogPaths.indexOf(req.path) === -1) {
        logger.debug('HTTP', `${req.method} ${req.path}`);
    }
    next();
});

// =============================================
// HEALTH CHECK
// =============================================

app.get('/health', (req, res) => {
    const uptime = process.uptime();
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const mins = Math.floor((uptime % 3600) / 60);
    const secs = Math.floor(uptime % 60);
    
    const timeParts = [];
    if (days > 0) timeParts.push(`${days}d`);
    if (hours > 0) timeParts.push(`${hours}h`);
    if (mins > 0) timeParts.push(`${mins}m`);
    timeParts.push(`${secs}s`);

    res.json({
        status: 'online',
        service: 'sdk-server',
        version: '3.1.0',
        port: CONSTANTS.PORT,
        host: CONSTANTS.HOST,
        uptime: uptime,
        uptimeFormatted: timeParts.join(' '),
        environment: CONSTANTS.IS_DEV ? 'development' : 'production',
        timestamp: new Date().toISOString()
    });
});

// =============================================
// AUTH ROUTES
// =============================================

app.post('/api/auth/register',
    rateLimiter.fromConfig('REGISTER'),
    authHandlers.register
);

app.post('/api/auth/login',
    rateLimiter.fromConfig('LOGIN'),
    authHandlers.login
);

app.post('/api/auth/guest',
    rateLimiter.fromConfig('GUEST'),
    authHandlers.guest
);

app.post('/api/auth/logout',
    authHandlers.logout
);

app.get('/api/auth/check',
    rateLimiter.fromConfig('GENERAL'),
    authHandlers.check
);

app.post('/api/auth/refresh',
    rateLimiter.fromConfig('GENERAL'),
    authHandlers.refresh
);

app.post('/api/auth/convert-guest',
    rateLimiter.fromConfig('REGISTER'),
    authHandlers.convertGuest
);

// =============================================
// PAYMENT ROUTES
// =============================================

app.post('/api/payment/process',
    rateLimiter.fromConfig('PAYMENT'),
    paymentHandlers.process
);

app.post('/api/payment/create',
    rateLimiter.fromConfig('PAYMENT'),
    paymentHandlers.create
);

app.post('/api/payment/verify',
    rateLimiter.fromConfig('PAYMENT'),
    paymentHandlers.verify
);

app.post('/api/payment/callback',
    rateLimiter.fromConfig('PAYMENT'),
    paymentHandlers.callback
);

// =============================================
// REPORT ROUTES (Fire-and-forget)
// =============================================

app.post('/api/report/event',
    rateLimiter.fromConfig('REPORT'),
    reportHandlers.event
);

app.post('/api/report/batch',
    rateLimiter.fromConfig('REPORT'),
    reportHandlers.batch
);

// =============================================
// ANALYTICS ROUTES
// =============================================

app.post('/api/analytics/event',
    rateLimiter.fromConfig('REPORT'),
    analyticsHandlers.event
);

app.get('/api/analytics/dashboard',
    rateLimiter.fromConfig('GENERAL'),
    analyticsHandlers.dashboard
);

// =============================================
// USER ROUTES
// =============================================

app.get('/api/user/info',
    rateLimiter.fromConfig('GENERAL'),
    userHandlers.info
);

app.post('/api/user/language',
    rateLimiter.fromConfig('GENERAL'),
    userHandlers.language
);

// =============================================
// ADMIN ROUTES
// =============================================

app.get('/api/users',
    rateLimiter.fromConfig('GENERAL'),
    userHandlers.listUsers
);

app.get('/api/users/:id',
    rateLimiter.fromConfig('GENERAL'),
    userHandlers.getUserDetail
);

app.get('/api/payments',
    rateLimiter.fromConfig('GENERAL'),
    userHandlers.listPayments
);

app.get('/api/config',
    userHandlers.config
);

// =============================================
// 404 HANDLER
// =============================================

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Endpoint tidak ditemukan: ${req.method} ${req.path}`,
        code: 'NOT_FOUND'
    });
});

// =============================================
// ERROR HANDLER
// =============================================

app.use((err, req, res, next) => {
    logger.error('Express', `Error: ${err.message}`);
    
    // Don't expose internal errors to client
    res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan server',
        code: 'INTERNAL_ERROR'
    });
});

// =============================================
// STARTUP
// =============================================

function startServer() {
    // Ensure data directory exists
    store.ensureDataDir();

    // Start periodic cleanup services
    sessionManager.startCleanupInterval();
    analyticsService.startRotationInterval();
    rateLimiter.startCleanup();

    // Start HTTP server
    const server = app.listen(CONSTANTS.PORT, CONSTANTS.HOST, () => {
        console.log('');
        console.log('╔════════════════════════════════════════════════════════════╗');
        console.log('║           SDK Server v3.1 — Super Warrior Z                 ║');
        console.log('╠════════════════════════════════════════════════════════════╣');
        console.log(`║ Host: ${CONSTANTS.HOST.padEnd(48)}║`);
        console.log(`║ Port: ${String(CONSTANTS.PORT).padEnd(48)}║`);
        console.log(`║ Mode: ${(CONSTANTS.IS_DEV ? 'Development' : 'Production').padEnd(48)}║`);
        console.log(`║ SDK Channel: ${CONSTANTS.DEFAULT_SDK_CHANNEL.padEnd(40)}║`);
        console.log(`║ App ID: ${CONSTANTS.DEFAULT_APP_ID.padEnd(45)}║`);
        console.log('╠════════════════════════════════════════════════════════════╣');
        console.log('║ Endpoints:                                                 ║');
        console.log('║   Auth: /api/auth/{register,login,guest,logout,check}       ║');
        console.log('║   Payment: /api/payment/{process,create,verify,callback}    ║');
        console.log('║   Report: /api/report/{event,batch}                        ║');
        console.log('║   Analytics: /api/analytics/{event,dashboard}              ║');
        console.log('║   User: /api/user/{info,language}                           ║');
        console.log('║   Admin: /api/users, /api/payments, /api/config            ║');
        console.log('║   System: /health                                          ║');
        console.log('╚════════════════════════════════════════════════════════════╝');
        console.log('');
        
        logger.info('Server', `Started on ${CONSTANTS.HOST}:${CONSTANTS.PORT}`);
    });

    return server;
}

// =============================================
// GRACEFUL SHUTDOWN
// =============================================

function gracefulShutdown(signal) {
    logger.info('Server', `${signal} received — shutting down...`);
    
    // Run cleanup
    try {
        sessionManager.cleanupExpired();
        analyticsService.rotateIfNeeded();
    } catch (e) {
        logger.error('Shutdown', `Cleanup error: ${e.message}`);
    }
    
    process.exit(0);
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

process.on('uncaughtException', (err) => {
    logger.error('Server', `Uncaught: ${err.message}`);
    console.error(err.stack);
    process.exit(1);
});

// =============================================
// START
// =============================================

const server = startServer();

module.exports = { app, server };