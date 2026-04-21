/**
 * ============================================================================
 * SDK Server — Rate Limiter Middleware (Natural Implementation)
 * ============================================================================
 *
 * IP-based sliding window rate limiting.
 * Each endpoint type has its own configuration.
 * 
 * Natural approach:
 * - In-memory store for single-instance (documented)
 * - No external dependencies
 * - Clean sliding window algorithm
 *
 * ============================================================================
 */

const CONSTANTS = require('../config/constants');
const logger = require('../utils/logger');

// =============================================
// STORE
// =============================================

/** In-memory rate limit store: { "ip:type": { count, windowStart } } */
const _store = {};

/** Cleanup timer reference */
let _cleanupTimer = null;

// =============================================
// SLIDING WINDOW ALGORITHM
// =============================================

/**
 * Check if request should be allowed
 * 
 * Algorithm: Sliding Window
 * - Window slides based on each request
 * - Resets when window expires
 * 
 * @param {string} ip - Client IP address
 * @param {string} type - Rate limit type (LOGIN, REGISTER, etc.)
 * @returns {{ allowed: boolean, remaining: number, retryAfterMs: number }}
 */
function checkLimit(ip, type) {
    const config = CONSTANTS.RATE_LIMITS[type] || CONSTANTS.RATE_LIMITS.GENERAL;
    const key = `${ip}:${type}`;
    const now = Date.now();
    const entry = _store[key];

    // First request or window expired - reset
    if (!entry || (now - entry.windowStart) > config.windowMs) {
        _store[key] = { count: 1, windowStart: now };
        return {
            allowed: true,
            remaining: config.maxRequests - 1,
            retryAfterMs: 0
        };
    }

    // Within window and under limit
    if (entry.count < config.maxRequests) {
        entry.count++;
        return {
            allowed: true,
            remaining: config.maxRequests - entry.count,
            retryAfterMs: 0
        };
    }

    // Window exhausted
    return {
        allowed: false,
        remaining: 0,
        retryAfterMs: (entry.windowStart + config.windowMs) - now
    };
}

// =============================================
// EXPRESS MIDDLEWARE
// =============================================

/**
 * Create Express middleware for rate limiting
 * 
 * @param {string} type - Rate limit type from CONSTANTS.RATE_LIMITS
 * @returns {Function} Express middleware
 * 
 * @example
 * app.post('/api/auth/login', rateLimiter.fromConfig('LOGIN'), auth.login);
 */
function fromConfig(type) {
    return function rateLimiterMiddleware(req, res, next) {
        // Extract IP address - handle proxies
        const ip = extractIP(req);
        
        const result = checkLimit(ip, type);
        
        // Set standard rate limit headers
        res.setHeader('X-RateLimit-Remaining', String(result.remaining));
        
        if (result.allowed) {
            return next();
        }

        // Request blocked
        const retrySec = Math.ceil(result.retryAfterMs / 1000);
        res.setHeader('Retry-After', String(retrySec));
        
        logger.warn('RateLimit', `Blocked ${ip} on ${type} (retry in ${retrySec}s)`);

        return res.status(429).json({
            success: false,
            message: `Terlalu banyak permintaan. Coba lagi dalam ${retrySec} detik.`,
            code: 'RATE_LIMIT_EXCEEDED',
            retryAfter: retrySec
        });
    };
}

// =============================================
// IP EXTRACTION
// =============================================

/**
 * Extract client IP from request
 * Handles: X-Forwarded-For, X-Real-IP, req.ip, remoteAddress
 * 
 * @param {Object} req - Express request object
 * @returns {string} Client IP address
 */
function extractIP(req) {
    // Check X-Forwarded-For (for proxy/load balancer)
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
        // Get first IP in chain (original client)
        const ip = forwarded.split(',')[0].trim();
        if (ip) return ip;
    }

    // Check X-Real-IP (nginx)
    const realIP = req.headers['x-real-ip'];
    if (realIP) {
        return realIP;
    }

    // Check Express req.ip
    if (req.ip) {
        return req.ip;
    }

    // Fallback to connection remote address
    if (req.connection && req.connection.remoteAddress) {
        return req.connection.remoteAddress;
    }

    // Last resort
    return 'unknown';
}

// =============================================
// CLEANUP
// =============================================

/**
 * Remove stale entries older than RATE_LIMIT_STALE_MS
 * Runs periodically to prevent memory leak
 */
function cleanup() {
    const now = Date.now();
    const keys = Object.keys(_store);
    let removed = 0;

    for (const key of keys) {
        const entry = _store[key];
        if ((now - entry.windowStart) > CONSTANTS.RATE_LIMIT_STALE_MS) {
            delete _store[key];
            removed++;
        }
    }

    if (removed > 0 && CONSTANTS.IS_DEV) {
        logger.debug('RateLimit', `Cleaned ${removed} stale entries`);
    }
}

/**
 * Start periodic cleanup
 * @returns {Interval} Timer reference
 */
function startCleanup() {
    if (_cleanupTimer) {
        clearInterval(_cleanupTimer);
    }
    
    _cleanupTimer = setInterval(cleanup, CONSTANTS.RATE_LIMIT_CLEANUP_MS);
    
    return _cleanupTimer;
}

/**
 * Stop periodic cleanup
 */
function stopCleanup() {
    if (_cleanupTimer) {
        clearInterval(_cleanupTimer);
        _cleanupTimer = null;
    }
}

// =============================================
// STATS & DEBUG
// =============================================

/**
 * Get current rate limit store stats
 * @returns {Object} Store statistics
 */
function getStats() {
    const keys = Object.keys(_store);
    const now = Date.now();
    
    let activeEntries = 0;
    let expiredEntries = 0;
    
    for (const key of keys) {
        const entry = _store[key];
        if ((now - entry.windowStart) > CONSTANTS.RATE_LIMITS.GENERAL.windowMs) {
            expiredEntries++;
        } else {
            activeEntries++;
        }
    }
    
    return {
        totalEntries: keys.length,
        activeEntries,
        expiredEntries,
        store: _store
    };
}

/**
 * Clear rate limit store (for testing)
 */
function clearStore() {
    for (const key of Object.keys(_store)) {
        delete _store[key];
    }
    logger.info('RateLimit', 'Store cleared');
}

// =============================================
// MANUAL CHECK (for non-middleware use)
// =============================================

/**
 * Manually check rate limit without middleware
 * @param {string} ip - Client IP
 * @param {string} type - Rate limit type
 * @returns {Object} Check result
 */
function check(ip, type) {
    return checkLimit(ip, type);
}

// =============================================
// BATCH CHECK
// =============================================

/**
 * Check multiple rate limit types for same IP
 * @param {string} ip - Client IP
 * @param {string[]} types - Array of rate limit types
 * @returns {Object} Combined result (all must pass)
 */
function checkBatch(ip, types) {
    const results = {
        allowed: true,
        blockedTypes: [],
        retryAfterMs: 0
    };

    for (const type of types) {
        const result = checkLimit(ip, type);
        if (!result.allowed) {
            results.allowed = false;
            results.blockedTypes.push(type);
            results.retryAfterMs = Math.max(results.retryAfterMs, result.retryAfterMs);
        }
    }

    return results;
}

// =============================================
// EXPORT
// =============================================

module.exports = {
    // Core
    checkLimit,
    check,
    checkBatch,
    
    // Middleware
    fromConfig,
    
    // IP extraction
    extractIP,
    
    // Cleanup
    cleanup,
    startCleanup,
    stopCleanup,
    
    // Stats
    getStats,
    clearStore
};