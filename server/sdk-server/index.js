/**
 * ============================================================================
 *  SDK Server — Super Warrior Z (Dragon Ball Z)
 *  Port 9999
 * ============================================================================
 *
 *  Entry point — Express HTTP server untuk SDK backend.
 *
 *  Arsitektur:
 *    index.js          — Entry point, Express init, route mounting, server start
 *    config/           — Constants & configuration
 *    storage/          — Generic JSON file storage
 *    services/         — Business logic (userManager, sessionManager, dll)
 *    handlers/         — HTTP endpoint handlers (auth, payment, report, dll)
 *    middleware/       — Rate limiter
 *    utils/            — Crypto utilities
 *    data/             — JSON data files (users.json, sessions.json, analytics.json)
 *
 *  Endpoints (20 total):
 *    Auth:
 *      POST /api/auth/register  — Registrasi user baru
 *      POST /api/auth/login     — Login user terdaftar
 *      POST /api/auth/guest     — Auto-login / buat guest user  [FIX S3]
 *      POST /api/auth/logout    — Hapus session
 *      GET  /api/auth/check     — Validasi session
 *
 *    Payment:
 *      POST /api/payment/process   — Log payment (legacy)
 *      POST /api/payment/create    — Create payment order     [FIX S4]
 *      POST /api/payment/verify    — Verify payment            [FIX S5]
 *      POST /api/payment/callback  — Payment callback          [FIX S5]
 *
 *    Report (dari sdk.js report queue):
 *      POST /api/report/event  — Single report event
 *      POST /api/report/batch  — Batch report
 *
 *    Analytics:
 *      POST /api/analytics/event     — Single analytics event
 *      GET  /api/analytics/dashboard  — Dashboard analytics
 *
 *    User:
 *      GET  /api/user/info       — Get user info             [FIX S6]
 *      POST /api/user/language   — Save language preference  [FIX S6]
 *
 *    Admin/Debug:
 *      GET  /api/users           — List semua user
 *      GET  /api/users/:id       — Detail user
 *      GET  /api/payments        — List semua payment
 *      GET  /api/config          — Konfigurasi (read-only)
 *
 *    System:
 *      GET  /health              — Health check
 *
 *  Bug fixes dari existing monolith:
 *    S1: DEFAULT_SDK_CHANNEL 'en' → 'ppgame'
 *    S2: DEFAULT_APP_ID '1' → '288'
 *    S3: Missing /api/auth/guest endpoint
 *    S4: Missing /api/payment/create endpoint
 *    S5: Missing /api/payment/verify dan /api/payment/callback
 *    S6: Missing /api/user/info dan /api/user/language
 *    S10: Session cleanup tidak ada interval
 *
 *  Data Flow:
 *    sdk.js (browser) ←→ sdk-server (9999) ←→ data/*.json
 *
 *  Login Flow:
 *    1. sdk.js login UI → POST /api/auth/login (or /guest)
 *    2. Server return { userId, sign, sdk, loginToken, nickName, security }
 *    3. sdk.js redirect: ?sdk=ppgame&logintoken=X&nickname=X&userid=X&sign=X&security=X
 *    4. index.html getSdkLoginInfo() baca URL params
 *    5. main.min.js: checkSDK()=true → sdkLoginSuccess(o)
 *    6. main.min.js: ts.loginInfo.userInfo = { loginToken, userId, nickName, channelCode: o.sdk, securityCode: o.security }
 *    7. main.min.js: ts.clientRequestServerList(userId, sdk, callback)
 *
 *  Referensi: main.min.js, index.html, sdk.js, data/users.json, data/sessions.json
 *
 * ============================================================================
 */

var express = require('express');
var cors = require('cors');
var path = require('path');

// =============================================
// IMPORT MODULES
// =============================================

var CONSTANTS = require('./config/constants');
var store = require('./storage/jsonStore');
var rateLimiter = require('./middleware/rateLimiter');

// Handlers
var authHandlers = require('./handlers/auth');
var paymentHandlers = require('./handlers/payment');
var reportHandlers = require('./handlers/report');
var analyticsHandlers = require('./handlers/analytics');
var userHandlers = require('./handlers/user');

// Services
var sessionManager = require('./services/sessionManager');
var analyticsService = require('./services/analyticsService');

// =============================================
// EXPRESS APP SETUP
// =============================================

var app = express();

// CORS
app.use(cors(CONSTANTS.CORS));

// Body parser
app.use(express.json({ limit: CONSTANTS.BODY_LIMIT }));
app.use(express.urlencoded({ extended: true }));

// Logging middleware — log setiap request kecuali analytics/report
app.use(function (req, res, next) {
    var skipPaths = ['/api/analytics/event', '/api/report/event', '/api/report/batch'];
    if (skipPaths.indexOf(req.path) !== -1) {
        return next();
    }
    var timestamp = new Date().toISOString();
    console.log('[' + timestamp + '] ' + req.method + ' ' + req.path);
    next();
});

// =============================================
// ROUTE MOUNTING
// =============================================

// --- Auth Routes ---
app.post('/api/auth/register', rateLimiter.fromConfig('REGISTER'), authHandlers.register);
app.post('/api/auth/login', rateLimiter.fromConfig('LOGIN'), authHandlers.login);
app.post('/api/auth/guest', rateLimiter.fromConfig('GUEST'), authHandlers.guest);
app.post('/api/auth/logout', authHandlers.logout);
app.get('/api/auth/check', authHandlers.check);

// --- Payment Routes ---
app.post('/api/payment/process', rateLimiter.fromConfig('PAYMENT'), paymentHandlers.process);
app.post('/api/payment/create', rateLimiter.fromConfig('PAYMENT'), paymentHandlers.create);
app.post('/api/payment/verify', rateLimiter.fromConfig('PAYMENT'), paymentHandlers.verify);
app.post('/api/payment/callback', rateLimiter.fromConfig('PAYMENT'), paymentHandlers.callback);

// --- Report Routes (fire-and-forget, higher rate limit) ---
app.post('/api/report/event', rateLimiter.fromConfig('REPORT'), reportHandlers.event);
app.post('/api/report/batch', rateLimiter.fromConfig('REPORT'), reportHandlers.batch);

// --- Analytics Routes ---
app.post('/api/analytics/event', rateLimiter.fromConfig('REPORT'), analyticsHandlers.event);
app.get('/api/analytics/dashboard', rateLimiter.fromConfig('GENERAL'), analyticsHandlers.dashboard);

// --- User Routes ---
app.get('/api/user/info', userHandlers.info);
app.post('/api/user/language', userHandlers.language);

// --- Admin/Debug Routes ---
app.get('/api/users', rateLimiter.fromConfig('GENERAL'), userHandlers.listUsers);
app.get('/api/users/:id', rateLimiter.fromConfig('GENERAL'), userHandlers.getUserDetail);
app.get('/api/payments', rateLimiter.fromConfig('GENERAL'), userHandlers.listPayments);
app.get('/api/config', userHandlers.config);

// --- System Routes ---
app.get('/health', userHandlers.health);

// =============================================
// 404 HANDLER
// =============================================

app.use(function (req, res) {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found: ' + req.method + ' ' + req.path
    });
});

// =============================================
// SERVER STARTUP
// =============================================

/**
 * Initialize services dan mulai server.
 */
function startServer() {
    // 1. Pastikan data directory ada
    store.ensureDataDir();

    // 2. Start session cleanup interval (fix S10)
    sessionManager.startCleanupInterval();
    console.log('[System] Session cleanup started (every ' + (CONSTANTS.SESSION_CLEANUP_INTERVAL_MS / 60000) + ' min)');

    // 3. Start analytics rotation interval
    analyticsService.startRotationInterval();
    console.log('[System] Analytics rotation started (every ' + (CONSTANTS.ANALYTICS_ROTATION_INTERVAL_MS / 60000) + ' min)');

    // 4. Start rate limiter cleanup
    rateLimiter.startCleanup();
    console.log('[System] Rate limiter cleanup started (every ' + (CONSTANTS.RATE_LIMIT_CLEANUP_MS / 60000) + ' min)');

    // 5. Start Express server
    app.listen(CONSTANTS.PORT, function () {
        console.log('');
        console.log('=====================================================');
        console.log('  SDK Server — Super Warrior Z');
        console.log('  Version: 2.0.0 (modular rebuild)');
        console.log('=====================================================');
        console.log('  Port:           ' + CONSTANTS.PORT);
        console.log('  SDK Channel:    ' + CONSTANTS.DEFAULT_SDK_CHANNEL);
        console.log('  App ID:         ' + CONSTANTS.DEFAULT_APP_ID);
        console.log('  Data Dir:       ' + CONSTANTS.DATA_DIR);
        console.log('  PID:            ' + process.pid);
        console.log('=====================================================');
        console.log('  Endpoints:');
        console.log('    POST /api/auth/register   — Register user');
        console.log('    POST /api/auth/login      — Login user');
        console.log('    POST /api/auth/guest      — Guest auto-login');
        console.log('    POST /api/auth/logout     — Logout');
        console.log('    GET  /api/auth/check      — Check session');
        console.log('    POST /api/payment/process  — Log payment (legacy)');
        console.log('    POST /api/payment/create   — Create order');
        console.log('    POST /api/payment/verify   — Verify payment');
        console.log('    POST /api/payment/callback — Payment callback');
        console.log('    POST /api/report/event    — Single report');
        console.log('    POST /api/report/batch    — Batch report');
        console.log('    POST /api/analytics/event — Analytics event');
        console.log('    GET  /api/analytics/dashboard — Analytics dashboard');
        console.log('    GET  /api/user/info        — User info');
        console.log('    POST /api/user/language   — Save language');
        console.log('    GET  /api/users            — List users (admin)');
        console.log('    GET  /api/users/:id        — User detail (admin)');
        console.log('    GET  /api/payments         — List payments (admin)');
        console.log('    GET  /api/config           — Server config');
        console.log('    GET  /health               — Health check');
        console.log('=====================================================');
        console.log('');
    });
}

// =============================================
// GRACEFUL SHUTDOWN
// =============================================

/**
 * Handle process signals untuk graceful shutdown.
 * Cleanup session store dan save data sebelum exit.
 */
process.on('SIGINT', function () {
    console.log('\n[System] SIGINT received — shutting down...');
    try {
        sessionManager.cleanupExpired();
        analyticsService.rotateIfNeeded();
    } catch (e) {
        console.error('[System] Shutdown cleanup error:', e.message);
    }
    console.log('[System] Goodbye!');
    process.exit(0);
});

process.on('SIGTERM', function () {
    console.log('\n[System] SIGTERM received — shutting down...');
    process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', function (err) {
    console.error('[System] Uncaught exception:', err.message);
    console.error(err.stack);
});

// Start!
startServer();

module.exports = app;
