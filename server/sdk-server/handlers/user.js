/**
 * ============================================================================
 *  SDK Server v3 — User & Admin Handlers
 *  ============================================================================
 *
 *  Endpoints:
 *    GET  /api/user/info       — Get user info (session validated)
 *    POST /api/user/language   — Save language preference
 *    GET  /api/users           — List users (admin)
 *    GET  /api/users/:id       — User detail (admin)
 *    GET  /api/payments        — List payments (admin)
 *    GET  /api/config          — Server config (read-only)
 *    GET  /health              — Health check
 *
 * ============================================================================
 */

var userManager = require('../services/userManager');
var sessionManager = require('../services/sessionManager');
var paymentService = require('../services/paymentService');
var analyticsService = require('../services/analyticsService');
var store = require('../storage/jsonStore');
var CONSTANTS = require('../config/constants');
var logger = require('../utils/logger');

// =============================================
// GET /api/user/info
// =============================================

function info(req, res) {
    var userId = req.query.userId || (req.body && req.body.userId);
    var loginToken = req.query.loginToken || (req.body && req.body.loginToken);

    if (!loginToken && req.headers['x-session-id']) {
        loginToken = req.headers['x-session-id'];
    }

    if (!userId || !loginToken) {
        return res.json({ success: false, message: 'userId dan loginToken diperlukan' });
    }

    if (!sessionManager.validate(userId, loginToken)) {
        return res.json({ success: false, message: 'Session tidak valid atau expired' });
    }

    var user = userManager.getUserDetail(userId);
    if (!user) {
        return res.json({ success: false, message: 'User tidak ditemukan' });
    }

    return res.json({ success: true, user: user });
}

// =============================================
// POST /api/user/language
// =============================================

function language(req, res) {
    var userId = req.body.userId;
    var loginToken = req.body.loginToken;
    var language = req.body.language;

    if (!userId || !language) {
        return res.json({ success: false, message: 'userId dan language diperlukan' });
    }

    if (loginToken && !sessionManager.validate(userId, loginToken)) {
        return res.json({ success: false, message: 'Session tidak valid' });
    }

    analyticsService.appendEvent({
        category: 'settings',
        action: 'change_language',
        data: { language: language },
        userId: userId,
        timestamp: new Date().toISOString()
    });

    logger.info('User', 'Language: user ' + userId + ' → ' + language);

    return res.json({ success: true });
}

// =============================================
// GET /api/users (admin)
// =============================================

function listUsers(req, res) {
    var result = userManager.listUsers(
        req.query.search || null,
        parseInt(req.query.limit) || 100
    );
    return res.json({
        success: true,
        count: result.count,
        total: result.total,
        users: result.users
    });
}

// =============================================
// GET /api/users/:id (admin)
// =============================================

function getUserDetail(req, res) {
    var user = userManager.getUserDetail(req.params.id);
    if (!user) {
        return res.json({ success: false, message: 'User tidak ditemukan' });
    }
    return res.json({ success: true, user: user });
}

// =============================================
// GET /api/payments (admin)
// =============================================

function listPayments(req, res) {
    var result = paymentService.listPayments({
        userId: req.query.userId || null,
        status: req.query.status || null,
        limit: parseInt(req.query.limit) || 100
    });
    return res.json({
        success: true,
        count: result.count,
        total: result.total,
        payments: result.payments
    });
}

// =============================================
// GET /api/config (read-only)
// =============================================

function config(req, res) {
    return res.json({
        success: true,
        config: {
            version: '3.0.0',
            sdkType: 'PPGAME',
            defaultChannel: CONSTANTS.DEFAULT_SDK_CHANNEL,
            defaultAppId: CONSTANTS.DEFAULT_APP_ID,
            sessionDuration: '7 days',
            hashAlgorithm: 'PBKDF2-SHA512',
            maxAnalyticsEvents: CONSTANTS.MAX_ANALYTICS_EVENTS,
            supportedLanguages: ['en', 'cn', 'kr', 'vi', 'jr', 'tw', 'pt', 'fr', 'de'],
            endpoints: {
                auth: {
                    login: '/api/auth/login',
                    register: '/api/auth/register',
                    guest: '/api/auth/guest',
                    logout: '/api/auth/logout',
                    check: '/api/auth/check'
                },
                payment: {
                    process: '/api/payment/process',
                    create: '/api/payment/create',
                    verify: '/api/payment/verify',
                    callback: '/api/payment/callback'
                },
                report: {
                    event: '/api/report/event',
                    batch: '/api/report/batch'
                },
                analytics: {
                    event: '/api/analytics/event',
                    dashboard: '/api/analytics/dashboard'
                },
                user: {
                    info: '/api/user/info',
                    language: '/api/user/language'
                }
            }
        }
    });
}

// =============================================
// GET /health
// =============================================

function health(req, res) {
    var uptime = process.uptime();
    var days = Math.floor(uptime / 86400);
    var hours = Math.floor((uptime % 86400) / 3600);
    var mins = Math.floor((uptime % 3600) / 60);
    var secs = Math.floor(uptime % 60);
    var parts = [];
    if (days > 0) parts.push(days + 'd');
    if (hours > 0) parts.push(hours + 'h');
    if (mins > 0) parts.push(mins + 'm');
    parts.push(secs + 's');

    return res.json({
        status: 'online',
        port: CONSTANTS.PORT,
        uptime: uptime,
        uptimeFormatted: parts.join(' '),
        registeredUsers: userManager.getUserCount(),
        activeSessions: sessionManager.getActiveCount(),
        totalPayments: paymentService.getTotalCount(),
        totalEvents: analyticsService.getTotalEventCount(),
        cacheEntries: store.getCacheStats().entries,
        timestamp: new Date().toISOString()
    });
}

module.exports = {
    info: info,
    language: language,
    listUsers: listUsers,
    getUserDetail: getUserDetail,
    listPayments: listPayments,
    config: config,
    health: health
};
