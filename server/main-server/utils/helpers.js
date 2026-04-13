/**
 * =====================================================
 *  helpers.js — General Utility Functions
 *  Super Warrior Z Game Server — Main Server
 *
 *  Kumpulan fungsi utilitas umum yang digunakan
 *  di seluruh server modules.
 *
 *  Kategori:
 *    - ID Generation (generateUUID)
 *    - Math (clamp)
 *    - Object Operations (deepClone, pick, omit)
 *    - Async Utilities (retryAsync, sleep)
 *    - Time Utilities (formatTime, now)
 * =====================================================
 */

'use strict';

var crypto = require('crypto');

var Helpers = {

    /**
     * Generate a unique identifier string.
     *
     * Uses crypto.randomUUID() if available (Node.js 19+),
     * otherwise falls back to crypto.randomBytes() based UUID v4.
     *
     * @returns {string} UUID string (e.g., '550e8400-e29b-41d4-a716-446655440000')
     */
    generateUUID: function () {
        // Use built-in randomUUID if available (Node.js 15.6+)
        if (typeof crypto.randomUUID === 'function') {
            return crypto.randomUUID();
        }

        // Fallback: generate UUID v4 from random bytes
        var bytes = crypto.randomBytes(16);
        // Set version 4 (random)
        bytes[6] = (bytes[6] & 0x0f) | 0x40;
        // Set variant 1 (RFC 4122)
        bytes[8] = (bytes[8] & 0x3f) | 0x80;

        var hex = [];
        for (var i = 0; i < 16; i++) {
            hex.push(bytes[i].toString(16).padStart(2, '0'));
        }

        return hex[0] + hex[1] + hex[2] + hex[3] + '-' +
            hex[4] + hex[5] + '-' +
            hex[6] + hex[7] + '-' +
            hex[8] + hex[9] + '-' +
            hex[10] + hex[11] + hex[12] + hex[13] + hex[14] + hex[15];
    },

    /**
     * Clamp a numeric value to a specified range.
     *
     * If value is below min, returns min.
     * If value is above max, returns max.
     * Otherwise returns value as-is.
     *
     * @param {number} value - Value to clamp
     * @param {number} min - Minimum bound
     * @param {number} max - Maximum bound
     * @returns {number} Clamped value
     *
     * @example
     *   clamp(5, 0, 10)    // 5
     *   clamp(-3, 0, 10)   // 0
     *   clamp(15, 0, 10)   // 10
     */
    clamp: function (value, min, max) {
        if (typeof value !== 'number' || !isFinite(value)) {
            return min;
        }
        return Math.max(min, Math.min(max, value));
    },

    /**
     * Deep clone an object.
     *
     * Creates a complete independent copy of the input object.
     * Handles nested objects, arrays, and primitive values.
     * Does NOT handle special types (Date, RegExp, Map, Set, etc.)
     * — those will be cloned as plain objects.
     *
     * @param {*} obj - Object to deep clone
     * @returns {*} Deep cloned copy of the object
     *
     * @example
     *   var original = { a: 1, b: { c: 2 } };
     *   var clone = deepClone(original);
     *   clone.b.c = 99;  // original.b.c still === 2
     */
    deepClone: function (obj) {
        // Handle null, undefined, and primitives
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }

        // Handle Date
        if (obj instanceof Date) {
            return new Date(obj.getTime());
        }

        // Handle Array
        if (Array.isArray(obj)) {
            var arrClone = [];
            for (var i = 0; i < obj.length; i++) {
                arrClone[i] = Helpers.deepClone(obj[i]);
            }
            return arrClone;
        }

        // Handle plain Object
        var objClone = {};
        var keys = Object.keys(obj);
        for (var j = 0; j < keys.length; j++) {
            objClone[keys[j]] = Helpers.deepClone(obj[keys[j]]);
        }
        return objClone;
    },

    /**
     * Pick specific keys from an object.
     *
     * Creates a new object containing only the specified keys
     * from the source object. Keys not present in source are ignored.
     *
     * @param {object} obj - Source object
     * @param {Array<string>} keys - Array of key names to pick
     * @returns {object} New object with only the picked keys
     *
     * @example
     *   pick({ a: 1, b: 2, c: 3 }, ['a', 'c'])  // { a: 1, c: 3 }
     *   pick({ a: 1 }, ['b', 'c'])               // {}
     */
    pick: function (obj, keys) {
        if (!obj || typeof obj !== 'object') {
            return {};
        }
        if (!Array.isArray(keys)) {
            return {};
        }

        var result = {};
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            if (key in obj) {
                result[key] = obj[key];
            }
        }
        return result;
    },

    /**
     * Omit specific keys from an object.
     *
     * Creates a new object containing all keys from the source
     * object EXCEPT the specified keys.
     *
     * @param {object} obj - Source object
     * @param {Array<string>} keys - Array of key names to omit
     * @returns {object} New object without the omitted keys
     *
     * @example
     *   omit({ a: 1, b: 2, c: 3 }, ['b'])       // { a: 1, c: 3 }
     *   omit({ a: 1, b: 2, c: 3 }, ['x', 'y'])   // { a: 1, b: 2, c: 3 }
     */
    omit: function (obj, keys) {
        if (!obj || typeof obj !== 'object') {
            return {};
        }
        if (!Array.isArray(keys)) {
            return {};
        }

        // Build a Set-like lookup for omitted keys
        var omitMap = {};
        for (var i = 0; i < keys.length; i++) {
            omitMap[keys[i]] = true;
        }

        var result = {};
        var sourceKeys = Object.keys(obj);
        for (var j = 0; j < sourceKeys.length; j++) {
            var key = sourceKeys[j];
            if (!omitMap[key]) {
                result[key] = obj[key];
            }
        }
        return result;
    },

    /**
     * Retry an async function with configurable attempts and delay.
     *
     * If the function throws or rejects, it will be retried up to
     * maxRetries times with the specified delay between attempts.
     *
     * @param {function} fn - Async function to retry. Receives attempt number as argument.
     * @param {number} [maxRetries=3] - Maximum number of retry attempts
     * @param {number} [delay=1000] - Delay in milliseconds between retries
     * @returns {Promise<*>} Resolves with fn's result, rejects if all attempts fail
     *
     * @example
     *   retryAsync(function(attempt) {
     *       return db.query('SELECT 1');
     *   }, 3, 1000)
     *   .then(function(result) { ... })
     *   .catch(function(err) { ... });
     */
    retryAsync: function (fn, maxRetries, delay) {
        maxRetries = maxRetries || 3;
        delay = delay || 1000;

        return new Promise(function (resolve, reject) {
            var attempt = 0;

            function tryExecute() {
                attempt++;

                Promise.resolve()
                    .then(function () {
                        return fn(attempt);
                    })
                    .then(function (result) {
                        resolve(result);
                    })
                    .catch(function (err) {
                        if (attempt < maxRetries) {
                            setTimeout(tryExecute, delay);
                        } else {
                            reject(err);
                        }
                    });
            }

            tryExecute();
        });
    },

    /**
     * Promise-based sleep/delay function.
     *
     * Returns a promise that resolves after the specified number
     * of milliseconds. Useful for rate limiting, animations, etc.
     *
     * @param {number} ms - Milliseconds to sleep
     * @returns {Promise<void>} Promise that resolves after ms milliseconds
     *
     * @example
     *   await sleep(1000);  // Wait 1 second
     *   sleep(500).then(function() { console.log('done'); });
     */
    sleep: function (ms) {
        return new Promise(function (resolve) {
            setTimeout(resolve, ms);
        });
    },

    /**
     * Format a Unix timestamp into a human-readable date-time string.
     *
     * Output format: 'YYYY-MM-DD HH:mm:ss' (local time)
     *
     * @param {number} timestamp - Unix timestamp in seconds
     * @returns {string} Formatted date-time string
     *
     * @example
     *   formatTime(0)              // '1970-01-01 00:00:00'
     *   formatTime(1700000000)     // '2023-11-14 22:13:20' (approx)
     */
    formatTime: function (timestamp) {
        var ts = typeof timestamp === 'number' ? timestamp : 0;

        var date = new Date(ts * 1000);

        var year = date.getFullYear();
        var month = String(date.getMonth() + 1).padStart(2, '0');
        var day = String(date.getDate()).padStart(2, '0');
        var hours = String(date.getHours()).padStart(2, '0');
        var minutes = String(date.getMinutes()).padStart(2, '0');
        var seconds = String(date.getSeconds()).padStart(2, '0');

        return year + '-' + month + '-' + day + ' ' +
            hours + ':' + minutes + ':' + seconds;
    },

    /**
     * Get the current Unix timestamp in seconds.
     *
     * @returns {number} Current time as Unix timestamp (seconds since epoch)
     *
     * @example
     *   now()  // 1700000000 (approx)
     */
    now: function () {
        return Math.floor(Date.now() / 1000);
    }
};

module.exports = Helpers;
