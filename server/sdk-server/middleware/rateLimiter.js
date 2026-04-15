/**
 * ============================================================================
 *  Rate Limiter Middleware — IP-based request throttling
 *  ============================================================================
 *
 *  Provides rate limiting per IP address using sliding window algorithm.
 *  Each endpoint type has its own config (maxRequests per windowMs).
 *
 *  Used by index.js routes via rateLimiter.fromConfig('LOGIN') etc.
 *
 *  Cleanup: Old entries are purged every RATE_LIMIT_CLEANUP_MS (5 min).
 *
 * ============================================================================
 */

var CONSTANTS = require('../config/constants');

// =============================================
// RATE LIMIT STORE
// =============================================

/**
 * In-memory store: { "ip:endpointType": { count, windowStart } }
 * Single-threaded Node.js — no race conditions.
 */
var _store = {};

/**
 * Cleanup interval ID.
 */
var _cleanupTimer = null;

// =============================================
// CORE: CHECK RATE LIMIT
// =============================================

/**
 * Check if request from given IP should be allowed for the given endpoint type.
 *
 * Sliding window algorithm:
 *   1. Get/create entry for (ip, endpointType)
 *   2. If window has expired (> windowMs since windowStart) → reset
 *   3. If count < maxRequests → increment and allow
 *   4. If count >= maxRequests → reject
 *
 * @param {string} ip - Client IP address
 * @param {string} type - Endpoint type key (e.g., 'LOGIN', 'REGISTER')
 * @returns {{ allowed: boolean, remaining: number, retryAfterMs: number }}
 */
function checkLimit(ip, type) {
    var config = CONSTANTS.RATE_LIMITS[type] || CONSTANTS.RATE_LIMITS.GENERAL;
    var maxRequests = config.maxRequests;
    var windowMs = config.windowMs;

    var key = ip + ':' + type;
    var now = Date.now();
    var entry = _store[key];

    // No entry or window expired → create new window
    if (!entry || (now - entry.windowStart) > windowMs) {
        _store[key] = {
            count: 1,
            windowStart: now
        };
        return {
            allowed: true,
            remaining: maxRequests - 1,
            retryAfterMs: 0
        };
    }

    // Within window — check count
    if (entry.count < maxRequests) {
        entry.count++;
        return {
            allowed: true,
            remaining: maxRequests - entry.count,
            retryAfterMs: 0
        };
    }

    // Rate limited
    var retryAfterMs = (entry.windowStart + windowMs) - now;
    return {
        allowed: false,
        remaining: 0,
        retryAfterMs: retryAfterMs
    };
}

// =============================================
// EXPRESS MIDDLEWARE FACTORY
// =============================================

/**
 * Create Express middleware for the given endpoint type.
 *
 * Usage in routes:
 *   app.post('/api/auth/login', rateLimiter.fromConfig('LOGIN'), handler)
 *
 * Behavior:
 *   1. Extract client IP from X-Forwarded-For (proxied) or req.ip
 *   2. Check rate limit for (ip, type)
 *   3. If allowed → set X-RateLimit-Remaining header → next()
 *   4. If limited → return 429 with Retry-After header
 *
 * @param {string} type - Endpoint type key (must exist in CONSTANTS.RATE_LIMITS)
 * @returns {function} Express middleware
 */
function fromConfig(type) {
    return function (req, res, next) {
        // Extract IP — handle proxy headers
        var ip = req.headers['x-forwarded-for'];
        if (ip) {
            // X-Forwarded-For can be "client, proxy1, proxy2" — take first
            ip = ip.split(',')[0].trim();
        } else if (req.ip) {
            ip = req.ip;
        } else if (req.connection && req.connection.remoteAddress) {
            ip = req.connection.remoteAddress;
        } else {
            ip = 'unknown';
        }

        var result = checkLimit(ip, type);

        // Set rate limit headers
        res.set('X-RateLimit-Remaining', String(result.remaining));

        if (result.allowed) {
            return next();
        }

        // Rate limited
        var retryAfterSec = Math.ceil(result.retryAfterMs / 1000);
        res.set('Retry-After', String(retryAfterSec));

        console.log('[RateLimit] Blocked ' + ip + ' on ' + type +
            ' (retry after ' + retryAfterSec + 's)');

        return res.status(429).json({
            success: false,
            message: 'Too many requests. Please try again in ' + retryAfterSec + ' seconds.',
            retryAfter: retryAfterSec
        });
    };
}

// =============================================
// CLEANUP
// =============================================

/**
 * Remove stale entries from the rate limit store.
 * Entries older than RATE_LIMIT_STALE_MS (10 min) are purged.
 * Called periodically via startCleanup().
 */
function cleanup() {
    var now = Date.now();
    var staleThreshold = CONSTANTS.RATE_LIMIT_STALE_MS;
    var keys = Object.keys(_store);
    var removed = 0;

    for (var i = 0; i < keys.length; i++) {
        var entry = _store[keys[i]];
        if (entry && (now - entry.windowStart) > staleThreshold) {
            delete _store[keys[i]];
            removed++;
        }
    }

    if (removed > 0) {
        console.log('[RateLimit] Cleaned up ' + removed + ' stale entries');
    }
}

/**
 * Start periodic cleanup interval.
 * @returns {number} Interval ID
 */
function startCleanup() {
    if (_cleanupTimer) clearInterval(_cleanupTimer);
    _cleanupTimer = setInterval(cleanup, CONSTANTS.RATE_LIMIT_CLEANUP_MS);
    return _cleanupTimer;
}

// =============================================
// ADMIN / DEBUG
// =============================================

/**
 * Get current rate limit store state (for admin/debug).
 * @returns {object} Copy of internal store
 */
function getStats() {
    var stats = {};
    var keys = Object.keys(_store);
    for (var i = 0; i < keys.length; i++) {
        stats[keys[i]] = {
            count: _store[keys[i]].count,
            windowStart: _store[keys[i]].windowStart
        };
    }
    return stats;
}

/**
 * Reset rate limit for a specific IP and type.
 * @param {string} ip - Client IP
 * @param {string} type - Endpoint type
 */
function resetLimit(ip, type) {
    var key = ip + ':' + type;
    delete _store[key];
}

// =============================================
// EXPORTS
// =============================================

module.exports = {
    checkLimit: checkLimit,
    fromConfig: fromConfig,
    cleanup: cleanup,
    startCleanup: startCleanup,
    getStats: getStats,
    resetLimit: resetLimit
};
