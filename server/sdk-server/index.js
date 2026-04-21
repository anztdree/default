/**
 * ============================================================================
 *  SDK Server v3 — Entry Point (Port 9999)
 *  ============================================================================
 *
 *  Super Warrior Z — PPGAME SDK Server
 *  Standalone — NO dependency on shared/ folder.
 *
 *  Endpoints (20 total):
 *    Auth:      register, login, guest, logout, check
 *    Payment:   process (legacy), create, verify, callback
 *    Report:    event, batch
 *    Analytics: event, dashboard
 *    User:      info, language
 *    Admin:     users, users/:id, payments, config
 *    System:    health
 *
 *  v3 Improvements over v2:
 *    - [FIX] Old sessions destroyed on re-login (no orphans)
 *    - [FIX] Security: "Username atau password salah" (don't reveal)
 *    - [FIX] logger utility replaces raw console.log
 *    - [FIX] Host 0.0.0.0 for LAN access (not just localhost)
 *    - [NEW] IS_DEV mode with verbose debug logging
 *    - [NEW] PACKAGE.JSON — standalone npm module
 *    - [NEW] Environment variables: SDK_PORT, SDK_HOST
 *
 *  Data Flow:
 *    sdk.js (browser) <--HTTP--> sdk-server (9999) <--JSON--> data/*.json
 *
 *  Login Flow:
 *    1. sdk.js login UI --> POST /api/auth/login (or /guest)
 *    2. Server returns { userId, sign, sdk, loginToken, nickName, security }
 *    3. sdk.js redirects: ?sdk=ppgame&logintoken=X&nickname=X&userid=X&sign=X&security=X
 *    4. index.html getSdkLoginInfo() reads URL params
 *    5. main.min.js sdkLoginSuccess(o) --> ts.clientRequestServerList(userId, sdk)
 *
 * ============================================================================
 */

var express = require('express');
var cors = require('cors');

// =============================================
// IMPORTS (all local — no shared/ dependency)
// =============================================

var CONSTANTS = require('./config/constants');
var store = require('./storage/jsonStore');
var rateLimiter = require('./middleware/rateLimiter');
var logger = require('./utils/logger');

var authHandlers = require('./handlers/auth');
var paymentHandlers = require('./handlers/payment');
var reportHandlers = require('./handlers/report');
var analyticsHandlers = require('./handlers/analytics');
var userHandlers = require('./handlers/user');

var sessionManager = require('./services/sessionManager');
var analyticsService = require('./services/analyticsService');

// =============================================
// EXPRESS SETUP
// =============================================

var app = express();

app.use(cors(CONSTANTS.CORS));
app.use(express.json({ limit: CONSTANTS.BODY_LIMIT }));
app.use(express.urlencoded({ extended: true }));

// Request logging (skip noisy endpoints)
app.use(function (req, res, next) {
    var skip = ['/api/analytics/event', '/api/report/event', '/api/report/batch'];
    if (skip.indexOf(req.path) !== -1) return next();

    logger.debug('HTTP', req.method + ' ' + req.path);
    next();
});

// =============================================
// ROUTES
// =============================================

// Auth
app.post('/api/auth/register', rateLimiter.fromConfig('REGISTER'), authHandlers.register);
app.post('/api/auth/login', rateLimiter.fromConfig('LOGIN'), authHandlers.login);
app.post('/api/auth/guest', rateLimiter.fromConfig('GUEST'), authHandlers.guest);
app.post('/api/auth/logout', authHandlers.logout);
app.get('/api/auth/check', authHandlers.check);

// Payment
app.post('/api/payment/process', rateLimiter.fromConfig('PAYMENT'), paymentHandlers.process);
app.post('/api/payment/create', rateLimiter.fromConfig('PAYMENT'), paymentHandlers.create);
app.post('/api/payment/verify', rateLimiter.fromConfig('PAYMENT'), paymentHandlers.verify);
app.post('/api/payment/callback', rateLimiter.fromConfig('PAYMENT'), paymentHandlers.callback);

// Report (fire-and-forget, higher rate limit)
app.post('/api/report/event', rateLimiter.fromConfig('REPORT'), reportHandlers.event);
app.post('/api/report/batch', rateLimiter.fromConfig('REPORT'), reportHandlers.batch);

// Analytics
app.post('/api/analytics/event', rateLimiter.fromConfig('REPORT'), analyticsHandlers.event);
app.get('/api/analytics/dashboard', rateLimiter.fromConfig('GENERAL'), analyticsHandlers.dashboard);

// User
app.get('/api/user/info', userHandlers.info);
app.post('/api/user/language', userHandlers.language);

// Admin
app.get('/api/users', rateLimiter.fromConfig('GENERAL'), userHandlers.listUsers);
app.get('/api/users/:id', rateLimiter.fromConfig('GENERAL'), userHandlers.getUserDetail);
app.get('/api/payments', rateLimiter.fromConfig('GENERAL'), userHandlers.listPayments);
app.get('/api/config', userHandlers.config);

// Health
app.get('/health', userHandlers.health);

// 404
app.use(function (req, res) {
    res.status(404).json({
        success: false,
        message: 'Not found: ' + req.method + ' ' + req.path
    });
});

// =============================================
// STARTUP
// =============================================

function startServer() {
    store.ensureDataDir();

    sessionManager.startCleanupInterval();
    analyticsService.startRotationInterval();
    rateLimiter.startCleanup();

    app.listen(CONSTANTS.PORT, CONSTANTS.HOST, function () {
        console.log('');
        console.log('=====================================================');
        console.log('  SDK Server v3 — Super Warrior Z');
        console.log('  Standalone | No shared/ dependency');
        console.log('=====================================================');
        console.log('  Host:   ' + CONSTANTS.HOST);
        console.log('  Port:   ' + CONSTANTS.PORT);
        console.log('  URL:    http://' + CONSTANTS.HOST + ':' + CONSTANTS.PORT);
        console.log('  Channel:' + CONSTANTS.DEFAULT_SDK_CHANNEL);
        console.log('  App ID: ' + CONSTANTS.DEFAULT_APP_ID);
        console.log('  Dev:    ' + (CONSTANTS.IS_DEV ? 'ON' : 'OFF'));
        console.log('  PID:    ' + process.pid);
        console.log('=====================================================');
        console.log('  Auth:      POST /api/auth/{register,login,guest,logout}');
        console.log('             GET  /api/auth/check');
        console.log('  Payment:   POST /api/payment/{process,create,verify,callback}');
        console.log('  Report:    POST /api/report/{event,batch}');
        console.log('  Analytics: POST /api/analytics/event');
        console.log('             GET  /api/analytics/dashboard');
        console.log('  User:      GET  /api/user/info');
        console.log('             POST /api/user/language');
        console.log('  Admin:     GET  /api/users, /api/payments, /api/config');
        console.log('  Health:    GET  /health');
        console.log('=====================================================');
        console.log('');
    });
}

// =============================================
// GRACEFUL SHUTDOWN
// =============================================

process.on('SIGINT', function () {
    logger.info('System', 'SIGINT — shutting down...');
    try {
        sessionManager.cleanupExpired();
        analyticsService.rotateIfNeeded();
    } catch (e) {
        logger.error('System', 'Shutdown cleanup error: ' + e.message);
    }
    process.exit(0);
});

process.on('SIGTERM', function () {
    logger.info('System', 'SIGTERM — shutting down...');
    process.exit(0);
});

process.on('uncaughtException', function (err) {
    logger.error('System', 'Uncaught: ' + err.message);
    console.error(err.stack);
});

// START
startServer();

module.exports = app;
