/**
 * ============================================================================
 * Login Server — LZ-String Compression Helper
 * ============================================================================
 *
 * NATURAL IMPLEMENTATION:
 * - Simple wrapper for LZString
 * - Client uses LZString.decompressFromUTF16() when compress=true
 *
 * ============================================================================
 */

const LZString = require('lz-string');

module.exports = {
    /**
     * Compress string to UTF16 format (client-compatible)
     * @param {string} str - String to compress
     * @returns {string} Compressed string
     */
    compress(str) {
        return LZString.compressToUTF16(str);
    },

    /**
     * Decompress UTF16 format string
     * @param {string} compressed - Compressed string
     * @returns {string} Original string
     */
    decompress(compressed) {
        return LZString.decompressFromUTF16(compressed);
    }
};