/**
 * ============================================================================
 *  SDK Server v3 — Rate Limiter Middleware
 *  ============================================================================
 *
 *  IP-based sliding window rate limiting.
 *  Each endpoint type has its own config.
 *  Cleanup runs every 5 min.
 *
 * ============================================================================
 */

var CONSTANTS = require('../config/constants');
var logger = require('../utils/logger');

/** Store: { "ip:type": { count, windowStart } } */
var _store = {};
var _cleanupTimer = null;

/**
 * Check if request should be allowed.
 * Sliding window: reset when window expires, increment within window.
 * @returns {{ allowed: boolean, remaining: number, retryAfterMs: number }}
 */
function checkLimit(ip, type) {
    var config = CONSTANTS.RATE_LIMITS[type] || CONSTANTS.RATE_LIMITS.GENERAL;
    var key = ip + ':' + type;
    var now = Date.now();
    var entry = _store[key];

    if (!entry || (now - entry.windowStart) > config.windowMs) {
        _store[key] = { count: 1, windowStart: now };
        return { allowed: true, remaining: config.maxRequests - 1, retryAfterMs: 0 };
    }

    if (entry.count < config.maxRequests) {
        entry.count++;
        return { allowed: true, remaining: config.maxRequests - entry.count, retryAfterMs: 0 };
    }

    return {
        allowed: false,
        remaining: 0,
        retryAfterMs: (entry.windowStart + config.windowMs) - now
    };
}

/**
 * Express middleware factory.
 * Usage: app.post('/api/auth/login', rateLimiter.fromConfig('LOGIN'), handler)
 */
function fromConfig(type) {
    return function (req, res, next) {
        var ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim()
            || req.ip
            || (req.connection && req.connection.remoteAddress)
            || 'unknown';

        var result = checkLimit(ip, type);
        res.set('X-RateLimit-Remaining', String(result.remaining));

        if (result.allowed) return next();

        var retrySec = Math.ceil(result.retryAfterMs / 1000);
        res.set('Retry-After', String(retrySec));
        logger.warn('RateLimit', 'Blocked ' + ip + ' on ' + type + ' (retry ' + retrySec + 's)');

        res.status(429).json({
            success: false,
            message: 'Too many requests. Try again in ' + retrySec + 's.',
            retryAfter: retrySec
        });
    };
}

/**
 * Cleanup stale entries older than 10 min.
 */
function cleanup() {
    var now = Date.now();
    var keys = Object.keys(_store);
    var removed = 0;

    for (var i = 0; i < keys.length; i++) {
        if ((now - _store[keys[i]].windowStart) > CONSTANTS.RATE_LIMIT_STALE_MS) {
            delete _store[keys[i]];
            removed++;
        }
    }

    if (removed > 0) {
        logger.debug('RateLimit', 'Cleaned ' + removed + ' stale entries');
    }
}

/**
 * Start periodic cleanup.
 */
function startCleanup() {
    if (_cleanupTimer) clearInterval(_cleanupTimer);
    _cleanupTimer = setInterval(cleanup, CONSTANTS.RATE_LIMIT_CLEANUP_MS);
    return _cleanupTimer;
}

module.exports = {
    checkLimit: checkLimit,
    fromConfig: fromConfig,
    cleanup: cleanup,
    startCleanup: startCleanup
};
