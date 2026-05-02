/**
 * index.js — SDK Server Entry Point
 *
 * Super Warrior Z — SDK SERVER (PPGAME Platform)
 * Port: 9999 | Express.js | better-sqlite3 | HMAC-SHA256 + SHA256
 *
 * Routes:
 *   /api/auth/*     — Authentication (login, guest, validate)
 *   /api/payment/*  — Payment (create, callback)
 *   /api/event/*    — Event logging (enter-server, submit, chapter-finish, level-up, game-ready, lifecycle)
 *   /api/user/*     — User info
 */

var express = require('express');
var cors = require('cors');
var path = require('path');
var crypto = require('crypto');

var config = require('./config');
var db = require('./db');

var authHandler = require('./handlers/auth');
var paymentHandler = require('./handlers/payment');
var eventHandler = require('./handlers/event');
var userHandler = require('./handlers/user');

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function p2(n) { return n < 10 ? '0' + n : '' + n; }
function p3(n) { return n < 10 ? '00' + n : n < 100 ? '0' + n : '' + n; }

function tNow() {
    var d = new Date();
    return p2(d.getHours()) + ':' + p2(d.getMinutes()) + ':' + p2(d.getSeconds()) + '.' + p3(d.getMilliseconds());
}

function fmtDur(ms) { return ms < 1000 ? ms + 'ms' : (ms / 1000).toFixed(1) + 's'; }
function fmtSize(b) { return b < 1024 ? b + 'B' : (b / 1024).toFixed(1) + 'KB'; }

function trunc(s, n) {
    if (!s) return '(none)';
    if (s.length <= n) return s;
    var half = Math.floor((n - 2) / 2);
    return s.substring(0, half) + '..' + s.slice(-(n - half));
}

function fmtDate(d) {
    d = d || new Date();
    return d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate()) +
        ' ' + p2(d.getHours()) + ':' + p2(d.getMinutes()) + ':' + p2(d.getSeconds());
}

var helpers = {
    tNow: tNow,
    fmtDur: fmtDur,
    fmtSize: fmtSize,
    trunc: trunc,
    fmtDate: fmtDate
};

// ============================================================
// REQUEST DETAIL BUILDER
// ============================================================

function reqDetail(method, url, body, query) {
    var pathname = url || '';

    // Auth routes
    if (pathname.indexOf('/api/auth/login') !== -1) {
        return '\uD83D\uDC64 userId=' + (body ? body.userId || '(empty)' : '(empty)');
    }
    if (pathname.indexOf('/api/auth/guest') !== -1) {
        return '\uD83D\uDC7B guest login';
    }
    if (pathname.indexOf('/api/auth/validate') !== -1) {
        return '\uD83D\uDD13 token=' + trunc(body ? body.loginToken || '(none)' : '(none)', 16);
    }

    // Payment routes
    if (pathname.indexOf('/api/payment/create') !== -1) {
        return '\uD83D\uDCB3 orderId=' + (body ? body.orderId || '(empty)' : '(empty)');
    }
    if (pathname.indexOf('/api/payment/callback') !== -1) {
        return '\uD83D\uDCB3 callback orderId=' + (body ? body.orderId || '(empty)' : '(empty)');
    }

    // Event routes
    if (pathname.indexOf('/api/event/') !== -1) {
        if (body && body.stageName) {
            return '\uD83D\uDD04 ' + body.stageName;
        }
        if (body && body.eventName) {
            return '\uD83D\uDCCA ' + body.eventName;
        }
        return '\uD83D\uDCCA ' + pathname.replace('/api/event/', '');
    }

    // User routes
    if (pathname.indexOf('/api/user/info') !== -1) {
        return '\uD83D\uDC64 userId=' + (query ? query.userId || '(empty)' : '(empty)');
    }

    return pathname;
}

// ============================================================
// STATS TRACKING
// ============================================================

var stats = {
    totalRequests: 0,
    totalErrors: 0,
    startTime: Date.now()
};

// ============================================================
// EXPRESS APP
// ============================================================

var app = express();

// CORS — allow all
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ============================================================
// REQUEST LOGGING MIDDLEWARE
// ============================================================

app.use(function (req, res, next) {
    var start = Date.now();
    stats.totalRequests++;

    var method = req.method;
    var url = req.url;
    var body = req.body;
    var query = req.query;

    // Log incoming request
    var detail = reqDetail(method, url, body, query);
    console.log(tNow() + ' \uD83D\uDCE4 ' + method + ' ' + url + ' \u2192 ' + detail);

    // Capture original end/json to log response
    var originalJson = res.json.bind(res);

    res.json = function (data) {
        var elapsed = Date.now() - start;
        var isSuccess = data && (data.success === true || data.valid === true || data.received === true);
        var icon = isSuccess ? '\u2705' : '\u274C';

        // Build response detail
        var resDetail = '';
        if (data && data.error) {
            resDetail = '\u26A0\uFE0F ' + data.error;
            stats.totalErrors++;
        } else if (data && data.loginToken) {
            resDetail = '\uD83D\uDD11 token issued';
        } else if (data && data.valid === true) {
            resDetail = '\uD83D\uDD13 valid';
        } else if (data && data.valid === false) {
            resDetail = '\u26A0\uFE0F ' + (data.error || 'invalid');
            stats.totalErrors++;
        } else if (data && data.paymentUrl) {
            resDetail = '\uD83D\uDCB3 payment created';
        } else if (data && data.received === true) {
            resDetail = '\uD83D\uDCB3 callback received';
        } else if (data && data.success === true) {
            resDetail = '\u2705 ok';
        } else if (data && data.success === false) {
            resDetail = '\u26A0\uFE0F ' + (data.error || 'failed');
            stats.totalErrors++;
        } else if (data && data.error === 'not_found') {
            resDetail = '\u26A0\uFE0F not_found';
            stats.totalErrors++;
        } else {
            resDetail = '\uD83D\uDCCA done';
        }

        console.log(tNow() + ' ' + icon + ' ' + method + ' ' + url + ' \u2192 ' + resDetail + ' (' + fmtDur(elapsed) + ')');

        return originalJson(data);
    };

    next();
});

// ============================================================
// REGISTER ROUTES
// ============================================================

authHandler.register(app, db, config, helpers);
paymentHandler.register(app, db, config, helpers);
eventHandler.register(app, db, config, helpers);
userHandler.register(app, db, config, helpers);

// ============================================================
// 404 — NOT FOUND
// ============================================================

app.use(function (req, res) {
    res.status(404).json({ error: 'not_found' });
});

// ============================================================
// GLOBAL ERROR HANDLER
// ============================================================

app.use(function (err, req, res, next) {
    console.error(tNow() + ' \u274C Unhandled error: ' + err.message);
    console.error(err.stack);
    stats.totalErrors++;
    res.status(500).json({ error: 'internal_server_error', message: err.message });
});

// ============================================================
// STARTUP BANNER
// ============================================================

function printBanner() {
    var now = new Date();
    var nodeVer = process.version;
    var dateStr = fmtDate(now);

    console.log('');
    console.log('\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557');
    console.log('\u2551  \uD83D\uDE80 SUPER WARRIOR Z \u2014 SDK SERVER                                            \u2551');
    console.log('\u2560\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2563');
    console.log('\u2551  \u26A1 Port: ' + config.port + '  \u2502  \uD83D\uDD0C Express.js  \u2502  \uD83D\uDDD1\uFE0F DB: sdk_server.db                  \u2551');
    console.log('\u2551  \uD83D\uDD11 HMAC-SHA256: ON (sign)  \u2502  SHA256: ON (securityCode)                    \u2551');
    console.log('\u2551  \uD83D\uDCE1 /api/auth/*  /api/payment/*  /api/event/*  /api/user/*                  \u2551');
    console.log('\u2551  \u2705 Server Ready  \u2502  \uD83E\uDDE0 Node ' + nodeVer + '  \u2502  \uD83D\uDCC5 ' + dateStr + '               \u2551');
    console.log('\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255D');
    console.log('');
}

// ============================================================
// SHUTDOWN BANNER
// ============================================================

function printShutdownBanner() {
    var uptime = Date.now() - stats.startTime;
    var userCount = 0;
    try { userCount = db.countUsers(); } catch (e) { /* ignore */ }

    console.log('');
    console.log('\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557');
    console.log('\u2551  \uD83D\uDEAB SDK SERVER \u2014 SHUTDOWN                                        \u2551');
    console.log('\u2560\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2563');
    console.log('\u2551  \u23F1 Uptime: ' + fmtDur(uptime) + '  \u2502  \uD83D\uDCCA Requests: ' + stats.totalRequests + '  \u2502  \u274C Errors: ' + stats.totalErrors + '  \u2502  \uD83D\uDC65 Users: ' + userCount + '  \u2551');
    console.log('\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255D');
    console.log('');
}

// ============================================================
// MEMORY STATS (every 60 seconds)
// ============================================================

setInterval(function () {
    var mem = process.memoryUsage();
    var userCount = 0;
    try { userCount = db.countUsers(); } catch (e) { /* ignore */ }

    console.log(tNow() + ' \uD83D\uDCCA [STATS] RSS: ' + (mem.rss / 1024 / 1024).toFixed(1) + 'MB' +
        ' \u2502 Heap: ' + (mem.heapUsed / 1024 / 1024).toFixed(1) + '/' + (mem.heapTotal / 1024 / 1024).toFixed(1) + 'MB' +
        ' \u2502 Users: ' + userCount +
        ' \u2502 Reqs: ' + stats.totalRequests +
        ' \u2502 Errs: ' + stats.totalErrors);
}, 60000);

// ============================================================
// INITIALIZE DB & START SERVER
// ============================================================

db.init();

var server = app.listen(config.port, config.host, function () {
    printBanner();
});

// ============================================================
// GRACEFUL SHUTDOWN
// ============================================================

function shutdown(signal) {
    console.log('\n' + tNow() + ' \uD83D\uDEAB ' + signal + ' received, shutting down...');
    printShutdownBanner();
    server.close(function () {
        db.close();
        process.exit(0);
    });
    // Force exit after 5 seconds if server.close hangs
    setTimeout(function () {
        db.close();
        process.exit(0);
    }, 5000);
}

process.on('SIGINT', function () { shutdown('SIGINT'); });
process.on('SIGTERM', function () { shutdown('SIGTERM'); });
