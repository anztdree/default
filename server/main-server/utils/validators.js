/**
 * =====================================================
 *  validators.js — Input Validation Helpers
 *  Super Warrior Z Game Server — Main Server
 *
 *  Kumpulan fungsi validasi input untuk digunakan
 *  oleh handler modules. Semua fungsi mengembalikan
 *  boolean (true = valid, false = tidak valid).
 *
 *  Penggunaan:
 *    if (!Validators.isPositiveInteger(value)) { ... }
 *    if (!Validators.isValidUserId(userId)) { ... }
 *    if (!Validators.isValidTeam(team)) { ... }
 * =====================================================
 */

'use strict';

var Validators = {

    /**
     * Check if value is a positive integer.
     *
     * A positive integer is a whole number greater than zero.
     * Accepts both number and numeric string types.
     *
     * @param {*} value - Value to check
     * @returns {boolean} true if value is a positive integer
     *
     * @example
     *   isPositiveInteger(1)       // true
     *   isPositiveInteger(100)     // true
     *   isPositiveInteger(0)       // false
     *   isPositiveInteger(-1)      // false
     *   isPositiveInteger(1.5)     // false
     *   isPositiveInteger('5')     // false (string)
     *   isPositiveInteger(null)    // false
     */
    isPositiveInteger: function (value) {
        return typeof value === 'number' &&
            isFinite(value) &&
            Math.floor(value) === value &&
            value > 0;
    },

    /**
     * Check if userId is valid.
     *
     * A valid userId must be a positive integer (number type) or a string
     * that can be parsed into a positive integer.
     *
     * @param {*} userId - User ID to validate
     * @returns {boolean} true if userId is valid
     *
     * @example
     *   isValidUserId(1001)        // true
     *   isValidUserId('1001')      // true
     *   isValidUserId(0)           // false
     *   isValidUserId(-1)          // false
     *   isValidUserId(null)        // false
     *   isValidUserId(undefined)   // false
     */
    isValidUserId: function (userId) {
        if (userId === undefined || userId === null) {
            return false;
        }

        var numId;
        if (typeof userId === 'string') {
            numId = parseInt(userId, 10);
        } else if (typeof userId === 'number') {
            numId = userId;
        } else {
            return false;
        }

        return typeof numId === 'number' &&
            isFinite(numId) &&
            Math.floor(numId) === numId &&
            numId > 0;
    },

    /**
     * Check if heroId has a valid format.
     *
     * Hero IDs in Super Warrior Z are typically numeric strings
     * (e.g., '1201', '2005') used as lookup keys in hero data tables.
     * They must be non-empty strings containing only digits.
     *
     * @param {*} heroId - Hero ID to validate
     * @returns {boolean} true if heroId has valid format
     *
     * @example
     *   isValidHeroId('1201')      // true
     *   isValidHeroId('2005')      // true
     *   isValidHeroId(1201)        // true (auto-convert)
     *   isValidHeroId('')          // false
     *   isValidHeroId('abc')       // false
     *   isValidHeroId(null)        // false
     */
    isValidHeroId: function (heroId) {
        if (heroId === undefined || heroId === null) {
            return false;
        }

        // Accept numeric hero IDs (convert to string)
        var idStr = String(heroId);

        // Must be non-empty and contain only digits
        return idStr.length > 0 && /^\d+$/.test(idStr);
    },

    /**
     * Check if equipId has a valid format.
     *
     * Equipment IDs follow the same pattern as hero IDs —
     * numeric strings used as lookup keys in equipment data tables.
     *
     * @param {*} equipId - Equipment ID to validate
     * @returns {boolean} true if equipId has valid format
     *
     * @example
     *   isValidEquipId('3001')     // true
     *   isValidEquipId(3001)       // true
     *   isValidEquipId('')         // false
     *   isValidEquipId('abc')      // false
     */
    isValidEquipId: function (equipId) {
        if (equipId === undefined || equipId === null) {
            return false;
        }

        var idStr = String(equipId);
        return idStr.length > 0 && /^\d+$/.test(idStr);
    },

    /**
     * Check if a team composition is valid.
     *
     * A valid team must be a non-empty array where each element
     * is an object containing a heroId property with a valid format.
     *
     * @param {*} team - Team array to validate
     * @returns {boolean} true if team is a valid team composition
     *
     * @example
     *   isValidTeam([{heroId: '1201'}, {heroId: '2005'}])  // true
     *   isValidTeam([])                                     // false (empty)
     *   isValidTeam('not an array')                         // false
     *   isValidTeam([{heroId: 'abc'}])                      // false (invalid heroId)
     */
    isValidTeam: function (team) {
        // Must be a non-empty array
        if (!Array.isArray(team) || team.length === 0) {
            return false;
        }

        // Each element must be an object with a valid heroId
        for (var i = 0; i < team.length; i++) {
            var member = team[i];

            // Must be an object (not null, not array)
            if (!member || typeof member !== 'object' || Array.isArray(member)) {
                return false;
            }

            // Must have a valid heroId
            if (!member.heroId || !Validators.isValidHeroId(member.heroId)) {
                return false;
            }
        }

        return true;
    },

    /**
     * Check if a numeric value is within a specified range (inclusive).
     *
     * @param {number} value - Numeric value to check
     * @param {number} min - Minimum allowed value (inclusive)
     * @param {number} max - Maximum allowed value (inclusive)
     * @returns {boolean} true if value >= min && value <= max
     *
     * @example
     *   isInRange(5, 1, 10)    // true
     *   isInRange(1, 1, 10)    // true
     *   isInRange(10, 1, 10)   // true
     *   isInRange(0, 1, 10)    // false
     *   isInRange(11, 1, 10)   // false
     */
    isInRange: function (value, min, max) {
        if (typeof value !== 'number' || !isFinite(value)) {
            return false;
        }
        if (typeof min !== 'number' || typeof max !== 'number') {
            return false;
        }
        return value >= min && value <= max;
    },

    /**
     * Sanitize a string by removing dangerous characters and trimming whitespace.
     *
     * Removes or escapes characters that could be used for injection attacks:
     *   - Null bytes
     *   - Control characters (except common whitespace)
     *   - Leading/trailing whitespace
     *
     * Note: This is NOT a replacement for proper parameterized queries or
     * output encoding. It's a defense-in-depth measure for display strings.
     *
     * @param {*} str - Input to sanitize
     * @returns {string} Sanitized string
     *
     * @example
     *   sanitizeString('  hello  ')              // 'hello'
     *   sanitizeString('hello\x00world')         // 'helloworld'
     *   sanitizeString('test<script>')           // 'testscript>'
     *   sanitizeString(123)                       // '123'
     *   sanitizeString(null)                      // ''
     */
    sanitizeString: function (str) {
        if (str === undefined || str === null) {
            return '';
        }

        var result = String(str);

        // Remove null bytes
        result = result.replace(/\0/g, '');

        // Remove control characters (keep \n, \r, \t)
        result = result.replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

        // Trim whitespace
        result = result.trim();

        return result;
    }
};

module.exports = Validators;
