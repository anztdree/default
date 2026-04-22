/**
 * ============================================================================
 * Login Server — Logger Utility
 * ============================================================================
 *
 * Structured logging with levels and colors.
 * 
 * NATURAL IMPLEMENTATION:
 * - Zero external dependencies
 * - Configurable via LOG_LEVEL env var
 * - Color support for TTY
 *
 * ============================================================================
 */

const CONSTANTS = require('../config/constants');

// =============================================
// LEVELS
// =============================================

const LEVELS = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3
};

const LOG_LEVEL = CONSTANTS.LOG_LEVEL || 'INFO';
const MIN_LEVEL = LEVELS[LOG_LEVEL] !== undefined ? LEVELS[LOG_LEVEL] : LEVELS.INFO;

// =============================================
// COLORS
// =============================================

const COLORS = {
    DEBUG: '\x1b[36m',  // cyan
    INFO: '\x1b[32m',   // green
    WARN: '\x1b[33m',   // yellow
    ERROR: '\x1b[31m',  // red
    RESET: '\x1b[0m'
};

const useColors = process.stdout.isTTY;

// =============================================
// FORMAT
// =============================================

/**
 * Format timestamp
 * @returns {string} ISO-like timestamp
 */
function timestamp() {
    const d = new Date();
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

/**
 * Build log line
 * @param {string} level - Log level
 * @param {string} source - Source component
 * @param {string} message - Log message
 * @returns {string} Formatted line
 */
function format(level, source, message) {
    const ts = timestamp();
    const color = COLORS[level] || '';
    const reset = useColors ? COLORS.RESET : '';
    
    const tag = source ? `[${source}] ` : '';
    return `${ts} ${color}[${level}]${reset} ${tag}${message}`;
}

// =============================================
// LOGGER
// =============================================

const logger = {
    /**
     * Debug message
     * @param {string} source - Component tag
     * @param {string} message - Message
     * @param {*} data - Optional data
     */
    debug(source, message, data) {
        if (LEVELS.DEBUG < MIN_LEVEL) return;
        const line = format('DEBUG', source, message);
        if (data !== undefined) {
            console.log(line, data);
        } else {
            console.log(line);
        }
    },

    /**
     * Info message
     * @param {string} source - Component tag
     * @param {string} message - Message
     * @param {*} data - Optional data
     */
    info(source, message, data) {
        if (LEVELS.INFO < MIN_LEVEL) return;
        const line = format('INFO', source, message);
        if (data !== undefined) {
            console.log(line, data);
        } else {
            console.log(line);
        }
    },

    /**
     * Warning message
     * @param {string} source - Component tag
     * @param {string} message - Message
     * @param {*} data - Optional data
     */
    warn(source, message, data) {
        if (LEVELS.WARN < MIN_LEVEL) return;
        const line = format('WARN', source, message);
        if (data !== undefined) {
            console.warn(line, data);
        } else {
            console.warn(line);
        }
    },

    /**
     * Error message
     * @param {string} source - Component tag
     * @param {string} message - Message
     * @param {*} data - Optional data
     */
    error(source, message, data) {
        if (LEVELS.ERROR < MIN_LEVEL) return;
        const line = format('ERROR', source, message);
        if (data !== undefined) {
            console.error(line, data);
        } else {
            console.error(line);
        }
    }
};

// =============================================
// EXPORT
// =============================================

module.exports = logger;