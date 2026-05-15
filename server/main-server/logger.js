/**
 * logger.js — MAIN-SERVER Logger v4.0 "Emoji Flow"
 *
 * Changelog dari v3.0:
 *   - Request Correlation ID (reqId) — setiap request punya ID pendek
 *   - Separator hanya di batas handler (⚔️━━), bukan per phase
 *   - Phase box tipis (┌──┐), bukan separator tebal
 *   - Adaptive phase — read-only handler tidak emit phase kosong
 *   - Collapse warnings — 7x warning sama → 1 ringkasan
 *   - Global error capture — fatalCapture(), rejectionCapture(), handlerCrash()
 *   - Config audit — configAudit() dipanggil saat startup
 *   - Emoji lebih meriah tapi tetap rapi
 *
 * FORMAT (dengan reqId):
 *   LEVEL_EMOJI HH:mm:ss.SSS LEVEL  MODULE ▸ Message
 *   REQ_ID  📦📥 PAYLOAD / phase / detail
 *
 * FORMAT (tanpa reqId — startup/global):
 *   LEVEL_EMOJI HH:mm:ss.SSS LEVEL  MODULE ▸ Message
 *   🎮══ SERVER STARTUP ══
 *
 * Levels: DEBUG=0, INFO=1, WARN=2, ERROR=3
 * Default: INFO (set LOG_LEVEL=DEBUG for maximum verbosity)
 */

const chalk = require('chalk');

// ═══════════════════════════════════════════════════════════════
// LEVEL CONFIGURATION
// ═══════════════════════════════════════════════════════════════

const LEVELS = {
    DEBUG: { emoji: '\u{1F535}', color: chalk.cyan,   label: 'DEBUG', priority: 0 },
    INFO:  { emoji: '\u{1F7E2}', color: chalk.green,  label: 'INFO ', priority: 1 },
    WARN:  { emoji: '\u{1F7E1}', color: chalk.yellow, label: 'WARN ', priority: 2 },
    ERROR: { emoji: '\u{1F534}', color: chalk.red,    label: 'ERROR', priority: 3 },
};

const LOG_LEVEL = (process.env.LOG_LEVEL || 'INFO').toUpperCase();
const MIN_PRIORITY = LEVELS[LOG_LEVEL] ? LEVELS[LOG_LEVEL].priority : 1;

// ═══════════════════════════════════════════════════════════════
// MODULE CONFIGURATION
// ═══════════════════════════════════════════════════════════════

const MODULES = {
    ENTER:     { emoji: '\u{2694}\u{FE0F}',  color: chalk.magenta },
    BUILD:     { emoji: '\u{1F3D7}\u{FE0F}',  color: chalk.yellow },
    UPDATE:    { emoji: '\u{1F504}',          color: chalk.blue },
    VALIDATE:  { emoji: '\u{1F50D}',          color: chalk.cyan },
    SOCKET:    { emoji: '\u{1F50C}',          color: chalk.blue },
    HANDLER:   { emoji: '\u{2699}\u{FE0F}',  color: chalk.yellow },
    TEA:       { emoji: '\u{1F510}',          color: chalk.magenta },
    COMPRESS:  { emoji: '\u{1F4E6}',          color: chalk.green },
    SDKAPI:    { emoji: '\u{1F4E1}',          color: chalk.yellow },
    CONFIG:    { emoji: '\u{1F4CB}',          color: chalk.gray },
    SERVER:    { emoji: '\u{1F680}',          color: chalk.green },
    DB:        { emoji: '\u{1F4BE}',          color: chalk.cyan },
    CIRCULAR:  { emoji: '\u{26A0}\u{FE0F}',  color: chalk.yellow },
    CLONE:     { emoji: '\u{1F916}',          color: chalk.cyan },
    SERIAL:    { emoji: '\u{1F4CB}',          color: chalk.white },
    RESP:      { emoji: '\u{1F4E4}',          color: chalk.green },
    SAVE:      { emoji: '\u{1F4BE}',          color: chalk.cyan },
    STEP:      { emoji: '\u{1F4CD}',          color: chalk.gray },
    TRACE:     { emoji: '\u{1F50D}',          color: chalk.magenta },
    CAPTURE:   { emoji: '\u{1F4A5}',          color: chalk.red },
    AUDIT:     { emoji: '\u{1F6E1}\u{FE0F}',  color: chalk.yellow },
};

// ═══════════════════════════════════════════════════════════════
// PHASE ICONS — emoji unik per phase (dengan number)
// ═══════════════════════════════════════════════════════════════

const PHASE_ICONS = [
    '\u{1F50D}', // 01 - ENTRY CHECK / VALIDATE
    '\u{1F6E1}\u{FE0F}', // 02 - TOKEN AUTH / SECURITY
    '\u{1F3E0}', // 03 - SERVER ID CHECK
    '\u{1F50E}', // 04 - TYPE SCAN
    '\u{1F5C4}\u{FE0F}', // 05 - DATABASE LOOKUP
    '\u{2699}\u{FE0F}', // 06 - CONFIG INVARIANTS
    '\u{1F3D7}\u{FE0F}', // 07 - BUILD DATA
    '\u{1F504}', // 08 - CIRCULAR REF
    '\u{1F512}', // 09 - CRITICAL FIELDS
    '\u{1F4DC}', // 10 - JSON SERIALIZE
    '\u{1F4BE}', // 11 - DB SAVE
    '\u{1F4CA}', // 12 - MUTATIONS
    '\u{1F4E4}', // 13 - RESPONSE PREP
    '\u{1F50E}', // 14 - RESPONSE TYPE SCAN
    '\u{1F3AF}', // 15 - EXECUTION SUMMARY
];

/**
 * Get phase icon with circled number
 * @param {number} num - Phase number (1-based)
 * @returns {string} Icon string
 */
function phaseIcon(num) {
    return PHASE_ICONS[(num - 1) % PHASE_ICONS.length] || '\u{1F4CD}';
}

// ═══════════════════════════════════════════════════════════════
// DATA-TYPE EMOJIS
// ═══════════════════════════════════════════════════════════════

const DATA_EMOJI = {
    userId:      '\u{1F464}', // 👤
    serverId:    '\u{1F3E0}', // 🏠
    loginToken:  '\u{1F511}', // 🔑
    string:      '\u{1F4DD}', // 📝
    number:      '\u{1F522}', // 🔢
    object:      '\u{1F4E6}', // 📦
    array:       '\u{1F4CB}', // 📋
    boolean:     '\u{2705}', // ✅
    null:        '\u{26AB}', // ⚫
    undefined:   '\u{1F534}', // 🔴
    hero:        '\u{1F9B8}', // 🦸
    diamond:     '\u{1F48E}', // 💎
    gold:        '\u{1FA99}', // 🪙
    level:       '\u{1F3C6}', // 🏆
    friend:      '\u{1F91D}', // 👥
    blacklist:   '\u{1F6AB}', // 🚫
    message:     '\u{1F4AC}', // 💬
    config:      '\u{2699}\u{FE0F}', // ⚙️
    file:        '\u{1F4C4}', // 📄
    http:        '\u{1F310}', // 🌍
    timing:      '\u{26A1}', // ⚡
    action:      '\u{1F3AF}', // 🎯
    type:        '\u{1F3AF}', // 🎯
    impact:      '\u{1F4A5}', // 💥
    fix:         '\u{1F527}', // 🔧
    source:      '\u{1F4CE}', // 📎
    empty:       '\u{1F4ED}', // 📭
    star:        '\u{2B50}', // ⭐
    skill:       '\u{2728}', // ✨
};

// ═══════════════════════════════════════════════════════════════
// REQUEST CORRELATION ID SYSTEM
// ═══════════════════════════════════════════════════════════════

var _currentReqId = null;
var _reqIdCounter = 0;

/**
 * Generate a short request ID like "R7F2A" or "A1B2C".
 * 4-char hex, readable, unique enough for log scanning.
 * @returns {string}
 */
function generateReqId() {
    _reqIdCounter++;
    var hex = (_reqIdCounter * 2654435761 >>> 0).toString(16).toUpperCase();
    return hex.substring(0, 4).padStart(4, '0');
}

/**
 * Get the current request ID.
 * @returns {string|null}
 */
function getReqId() {
    return _currentReqId;
}

/**
 * Set the current request ID (threaded via variable).
 * @param {string} id
 */
function setReqId(id) {
    _currentReqId = id;
}

/**
 * Clear the current request ID.
 */
function clearReqId() {
    _currentReqId = null;
}

/**
 * Build the reqId prefix string for lines inside handler context.
 * @returns {string} e.g. " R7F2A  " or ""
 */
function reqPrefix() {
    if (!_currentReqId) return '';
    return ' ' + chalk.cyan.bold(_currentReqId) + '  ';
}

// ═══════════════════════════════════════════════════════════════
// TIMESTAMP
// ═══════════════════════════════════════════════════════════════

function ts() {
    var d = new Date();
    return chalk.gray(
        String(d.getHours()).padStart(2, '0') + ':' +
        String(d.getMinutes()).padStart(2, '0') + ':' +
        String(d.getSeconds()).padStart(2, '0') + '.' +
        String(d.getMilliseconds()).padStart(3, '0')
    );
}

/**
 * Short timestamp without milliseconds (for reqId lines inside handler).
 * @returns {string}
 */
function tsShort() {
    var d = new Date();
    return String(d.getHours()).padStart(2, '0') + ':' +
           String(d.getMinutes()).padStart(2, '0') + ':' +
           String(d.getSeconds()).padStart(2, '0');
}

// ═══════════════════════════════════════════════════════════════
// BOX WIDTH
// ═══════════════════════════════════════════════════════════════

var BOX_WIDTH = 58;

// ═══════════════════════════════════════════════════════════════
// v4.0 — HANDLER BOUNDARY (separator hanya di batas handler)
// ═══════════════════════════════════════════════════════════════

/**
 * Print handler open boundary — the thick ⚔️━━ separator.
 * Called ONCE per handler at the start.
 *
 * @param {string} reqId   - Request correlation ID
 * @param {string} action  - Full action path e.g. "user::enterGame"
 * @param {string} userId  - User identifier
 * @param {object} [extra] - Extra info badges
 * @param {string} [extra.relay]     - Relay action name (for friend handler)
 * @param {string} [extra.userType]  - e.g. "NEW USER", "Returning User"
 * @param {string} [extra.status]    - e.g. "NEW CONNECTION"
 */
function handlerOpen(reqId, action, userId, extra) {
    extra = extra || {};
    var W = BOX_WIDTH;
    var sep = chalk.magenta('\u{2694}\u{FE0F}\u2501'.repeat(Math.ceil(W / 2)).substring(0, W));

    console.log('');
    console.log(sep);

    // Title line with card icon
    var titleParts = [
        '\u{1F3CF}\u{FE0F}', // 🎴
        chalk.cyan.bold(reqId),
        '\u{1F4E8}', // 📨
        chalk.white(action),
    ];
    if (userId) {
        titleParts.push('\u{1F464}'); // 👤
        titleParts.push(chalk.white(userId));
    }
    if (extra.userType) {
        titleParts.push(chalk.green.bold(extra.userType === 'NEW USER' ? ' \u{1F195} NEW USER' : ' \u{1F504} ' + extra.userType));
    }

    console.log(titleParts.join(' '));

    // Extra info on second line
    if (extra.relay) {
        console.log('          ' + chalk.gray('\u{1F4E1} relay: ') + chalk.white(extra.relay));
    }

    console.log(sep);
}

/**
 * Print handler close boundary — summary inside ⚔️━━ separator.
 * Called ONCE per handler at the end.
 *
 * @param {string} reqId   - Request correlation ID
 * @param {string} action  - Full action path
 * @param {object} summary
 * @param {number} [summary.ret]        - Return code (0=success)
 * @param {number} [summary.duration]   - Total handler time in ms
 * @param {string} [summary.protocol]   - 'LZ-STRING' or 'RAW'
 * @param {number} [summary.respSize]   - Response payload size in chars
 * @param {number} [summary.jsonSize]   - Original JSON size in chars
 * @param {number} [summary.fields]     - Total response fields
 * @param {string} [summary.userId]     - User ID
 * @param {string} [summary.userType]   - User type
 * @param {number} [summary.heroes]     - Hero count
 * @param {number} [summary.level]      - Player level
 * @param {number} [summary.diamond]    - Diamond amount
 * @param {object} [summary.critical]   - { passed, failed, warned }
 * @param {number} [summary.warnings]   - Total warnings
 * @param {number} [summary.errors]     - Total errors
 * @param {number} [summary.typePass]   - Type assertion passes
 * @param {number} [summary.typeFail]   - Type assertion failures
 * @param {string} [summary.crashMsg]   - If handler crashed, crash message
 */
function handlerClose(reqId, action, summary) {
    summary = summary || {};
    var W = BOX_WIDTH;
    var sep = chalk.magenta('\u{2694}\u{FE0F}\u2501'.repeat(Math.ceil(W / 2)).substring(0, W));

    var ret = summary.ret || 0;
    var isOk = (ret === 0);
    var hasWarnings = (summary.warnings || 0) > 0;
    var hasErrors = (summary.errors || 0) > 0;

    // Status line
    var statusIcon = isOk ? '\u2705' : '\u274C';
    var statusColor = isOk ? chalk.green : chalk.red;
    var statusText = isOk ? 'COMPLETE' : 'ret=' + ret;

    // Build summary line
    var sumLine = '\u{1F3CF}\u{FE0F} ' + chalk.cyan.bold(reqId) + '  ' +
                  statusIcon + ' ' + chalk.white(action) + '  ' +
                  chalk.white.bold('\u{1F3C1} ' + statusText);
    if (summary.duration !== undefined) {
        sumLine += '  ' + chalk.cyan.bold('\u26A1 ' + summary.duration + 'ms');
    }
    if (summary.protocol && summary.respSize !== undefined) {
        var protoLabel = summary.protocol === 'LZ-STRING'
            ? chalk.green('LZ ' + summary.respSize + ' chars')
            : chalk.gray('RAW ' + summary.respSize + ' chars');
        sumLine += '  ' + chalk.dim('\u{1F4CF} ') + protoLabel;
    }

    console.log('');
    console.log(sep);
    console.log(sumLine);
    console.log(sep);

    // Detail summary (only for complex handlers like enterGame)
    var hasDetails = summary.userId || summary.fields || summary.heroes ||
                     summary.level !== undefined || summary.diamond !== undefined ||
                     summary.jsonSize || summary.critical ||
                     summary.warnings > 0 || summary.errors > 0 ||
                     summary.typePass !== undefined || summary.crashMsg;

    if (hasDetails) {
        var lines = [];

        if (summary.userId) {
            var userStr = chalk.white(summary.userId);
            if (summary.userType) userStr += '  ' + chalk.green(summary.userType);
            lines.push('   \u{1F464} USER ....... ' + userStr);
        }
        if (summary.heroes !== undefined) {
            lines.push('   \u{1F9B8} HEROES ..... ' + chalk.white(String(summary.heroes)));
        }
        if (summary.level !== undefined) {
            lines.push('   \u{1F3C6} LEVEL ...... ' + chalk.white(String(summary.level)));
        }
        if (summary.diamond !== undefined) {
            lines.push('   \u{1F48E} DIAMOND .... ' + chalk.white(String(summary.diamond)));
        }
        if (summary.fields !== undefined) {
            lines.push('   \u{1F4E6} FIELDS ..... ' + chalk.white(String(summary.fields)));
        }
        if (summary.jsonSize !== undefined && summary.respSize !== undefined) {
            var pct = summary.jsonSize > 0
                ? Math.round((1 - summary.respSize / summary.jsonSize) * 100)
                : 0;
            lines.push('   \u{1F4CF} JSON SIZE .. ' + chalk.white(summary.jsonSize.toLocaleString() + ' chars'));
            lines.push('   \u{1F4E6} RESP SIZE .. ' + chalk.white(summary.respSize.toLocaleString() + ' chars') +
                       '  (\u{1F4C9} LZ -' + pct + '%)');
        }
        if (summary.duration !== undefined) {
            var dur = summary.duration;
            var barCount = Math.min(Math.floor(dur / 10), 20);
            var barColor = dur > 2000 ? chalk.red : dur > 1000 ? chalk.yellow : chalk.green;
            var bar = barCount > 0 ? barColor('\u2588'.repeat(barCount)) : '';
            lines.push('   \u{23F1}\u{FE0F}  TOTAL ..... ' + chalk.white(dur + 'ms  ') + bar);
        }

        // Critical / Warnings / Errors
        if (lines.length > 0 && (summary.critical || summary.warnings > 0 || summary.errors > 0 || summary.typePass !== undefined)) {
            lines.push(''); // empty separator line
        }

        if (summary.critical) {
            var totalCrit = summary.critical.passed + summary.critical.failed + summary.critical.warned;
            var critOk = summary.critical.failed === 0;
            var critStr = critOk
                ? chalk.green(summary.critical.passed + '/' + totalCrit + ' \u2705')
                : chalk.red(summary.critical.passed + '/' + totalCrit + ' \u274C ' + summary.critical.failed + ' issues');
            lines.push('   \u{1F512} CRITICAL ... ' + critStr);
        }
        if (summary.warnings > 0) {
            lines.push('   \u{26A0}\u{FE0F}  WARNINGS .. ' + chalk.yellow(String(summary.warnings)));
        }
        if (summary.errors > 0) {
            lines.push('   \u274C ERRORS .... ' + chalk.red(String(summary.errors)));
        }
        if (summary.typePass !== undefined) {
            lines.push('   \u{1F9EA} TYPE ...... ' + chalk.green(summary.typePass + ' PASS') +
                       ' / ' + chalk.red((summary.typeFail || 0) + ' FAIL'));
        }
        if (summary.crashMsg) {
            lines.push('   \u{1F4A5} CRASH ..... ' + chalk.red(summary.crashMsg));
        }

        lines.forEach(function(line) {
            console.log(line);
        });
    }

    console.log(sep);
}

// ═══════════════════════════════════════════════════════════════
// v4.0 — PHASE BOX (tipis, bukan separator)
// ═══════════════════════════════════════════════════════════════

/**
 * Print a thin phase header box inside a handler.
 * Format: ┌────────────────────────────────┐
 *         │  🔍 ① ENTRY CHECK       ⚡ 0ms │
 *         └────────────────────────────────┘
 *
 * @param {string}  icon    - Phase icon (use phaseIcon(num) or custom)
 * @param {number}  num     - Phase number
 * @param {string}  title   - Phase title
 * @param {number}  [duration] - Duration in ms (optional)
 */
function phaseBox(icon, num, title, duration) {
    var inner = icon + ' ' + chalk.white.bold(title);
    if (duration !== undefined) {
        inner += chalk.cyan('  \u26A1 ' + duration + 'ms');
    }
    var W = 46;
    var top = '  \u250C\u2500' + '\u2500'.repeat(W) + '\u2510';
    var bottom = '  \u2514' + '\u2500'.repeat(W + 2) + '\u2518';

    console.log('');
    console.log(reqPrefix() + top);
    console.log(reqPrefix() + '\u2502 ' + inner.padEnd(W + 2) + '\u2502');
    console.log(reqPrefix() + bottom);
}

/**
 * Phase box with circled number auto-generated.
 * @param {number} num      - Phase number (1-based)
 * @param {string} title    - Phase title
 * @param {number} [duration] - Duration in ms
 */
function phase(num, title, duration) {
    phaseBox(phaseIcon(num), num, title, duration);
}

// ═══════════════════════════════════════════════════════════════
// CORE LOG — Main header line (dengan/without reqId)
// ═══════════════════════════════════════════════════════════════

function log(level, module, message) {
    var lv = LEVELS[level] || LEVELS.INFO;
    if (lv.priority < MIN_PRIORITY) return;

    var md = MODULES[module] || { emoji: '\u26AA', color: chalk.white };
    var levelStr = lv.color(lv.label);

    if (_currentReqId) {
        // Inside handler — use compact format with reqId
        console.log(
            reqPrefix() + lv.emoji + ' ' + md.emoji + ' ' + chalk.white.bold(message)
        );
    } else {
        // Outside handler — full format with timestamp
        console.log(
            lv.emoji + ' ' + ts() + ' ' + levelStr + ' ' + md.emoji + ' ' +
            md.color(module.padEnd(8)) + ' \u25B8 ' + chalk.white.bold(message)
        );
    }
}

// ═══════════════════════════════════════════════════════════════
// v4.0 — PAYLOAD LOG (replaces requestDump inside handler)
// ═══════════════════════════════════════════════════════════════

/**
 * Log request payload with emoji per field type.
 * @param {object} request - The request object
 * @param {object} [fieldEmojis] - Optional map of fieldName → emoji override
 */
function payloadLog(request, fieldEmojis) {
    if (!request || typeof request !== 'object') return;

    fieldEmojis = fieldEmojis || {};
    var keys = Object.keys(request);

    console.log('');
    console.log(reqPrefix() + '\u{1F4E5}\u{1F424} PAYLOAD');

    keys.forEach(function(key) {
        var emoji = fieldEmojis[key] || '\u{1F4CC}'; // 📌 default
        var val = request[key];
        var valStr;

        if (val === null) {
            valStr = chalk.gray('null');
        } else if (val === undefined) {
            valStr = chalk.gray('undefined');
        } else if (typeof val === 'string') {
            var preview = val.length > 40 ? val.substring(0, 40) + chalk.gray('...') : val;
            valStr = chalk.green('"' + preview + '"');
        } else if (typeof val === 'number') {
            valStr = chalk.yellow(String(val));
        } else if (typeof val === 'boolean') {
            valStr = chalk.yellow(String(val));
        } else if (typeof val === 'object') {
            valStr = chalk.cyan(JSON.stringify(val).substring(0, 50));
        } else {
            valStr = chalk.yellow(String(val));
        }

        var keyStr = chalk.white(key.padEnd(14));
        console.log('   \u{1F4CC} ' + keyStr + emoji + ' ' + valStr);
    });
}

// ═══════════════════════════════════════════════════════════════
// DETAIL LINES — Tree-structured sub-entries
// ═══════════════════════════════════════════════════════════════

function detail(type, key, value, isLast) {
    if (LEVELS.DEBUG.priority < MIN_PRIORITY && type !== 'important' && type !== 'warn' && type !== 'error') return;
    var connector = isLast ? '\u2514' : '\u251C';
    var line = chalk.dim(key + ': ') + chalk.white(String(value));
    console.log('   ' + connector + ' ' + line);
}

function details(type /*, ...pairs */) {
    if (LEVELS.DEBUG.priority < MIN_PRIORITY && type !== 'important' && type !== 'warn' && type !== 'error') return;
    var pairs = Array.prototype.slice.call(arguments, 1);
    pairs.forEach(function(p, i) {
        var isLast = (i === pairs.length - 1);
        var connector = isLast ? '\u2514' : '\u251C';
        if (Array.isArray(p)) {
            var line = chalk.dim(p[0] + ': ') + chalk.white(String(p[1]));
            console.log('   ' + connector + ' ' + line);
        } else {
            console.log('   ' + connector + ' ' + chalk.dim(String(p)));
        }
    });
}

// ═══════════════════════════════════════════════════════════════
// v4.0 — PASS / FAIL LINE (single result with emoji)
// ═══════════════════════════════════════════════════════════════

/**
 * Single pass/fail line with emoji.
 * @param {boolean} pass      - true=pass, false=fail
 * @param {string} fieldName - Field name
 * @param {*}      actual    - Actual value
 * @param {string} [expectedType] - Expected type (for fail)
 * @param {object} [opts]
 * @param {string} [opts.impact]  - Impact explanation
 * @param {string} [opts.fix]     - Fix suggestion
 * @param {string} [opts.source]  - Source reference
 */
function assertLine(pass, fieldName, actual, expectedType, opts) {
    if (pass) {
        console.log('   \u2705 ' + chalk.white(fieldName) + '  ' +
                    chalk.dim('\u{1F4DD} ' + typeof actual) + '  \u2192 ' + chalk.green('OK'));
    } else {
        var typeEmoji = DATA_EMOJI[typeof actual] || '\u{1F522}';
        var expEmoji = DATA_EMOJI[expectedType] || '\u{1F4DD}';
        console.log('   \u26A0\u{FE0F}  ' + chalk.white(fieldName) + '  ' +
                    typeEmoji + ' ' + chalk.yellow(typeof actual) +
                    '  \u2192 expected ' + expEmoji + ' ' + chalk.white(expectedType));
        if (opts) {
            if (opts.impact) console.log('       \u{1F4CE} impact : ' + chalk.white(opts.impact));
            if (opts.fix)    console.log('       \u{1F527} fix    : ' + chalk.white(opts.fix));
            if (opts.source) console.log('       \u{1F4CE} source : ' + chalk.white(opts.source));
        }
    }
}

// ═══════════════════════════════════════════════════════════════
// v4.0 — SECTION SEPARATOR (within handler, thin themed lines)
// ═══════════════════════════════════════════════════════════════

/**
 * Thin section separator with emoji label.
 * Used for sub-sections within a handler (e.g. STARTER HERO, CURRENCY).
 * @param {string} emoji - Section emoji (e.g. '\u{1F9B8}')
 * @param {string} title - Section title
 */
function sectionLine(emoji, title) {
    var label = ' ' + emoji + ' ' + chalk.white.bold(title) + ' ';
    var sideLen = Math.max(1, Math.floor((BOX_WIDTH - label.length) / 2));
    console.log('   ' + chalk.magenta('\u2501'.repeat(sideLen)) + chalk.dim(label) + chalk.magenta('\u2501'.repeat(sideLen)));
}

// ═══════════════════════════════════════════════════════════════
// BOX SECTION (legacy compat)
// ═══════════════════════════════════════════════════════════════

function boxOpen(title, emoji, borderColor) {
    var prefix = emoji ? emoji + ' ' : '';
    var label = prefix + title;
    var bc = borderColor || chalk.magenta;
    console.log('');
    console.log('  \u250C ' + bc.bold(label) + ' ' + chalk.gray('\u2500'.repeat(Math.max(1, BOX_WIDTH - label.length - 1))) + '\u2510');
}

function colorBox(title, emoji, type) {
    var colorMap = {
        success: chalk.green, warn: chalk.yellow, error: chalk.red,
        info: chalk.cyan, debug: chalk.blue,
    };
    boxOpen(title, emoji, colorMap[type] || chalk.magenta);
    return colorMap[type] || chalk.magenta;
}

function boxLine(content, emoji) {
    var prefix = emoji ? emoji + ' ' : '  ';
    console.log('  \u2502 ' + prefix + content);
}

function boxDetail(key, value, emoji, isLast) {
    var prefix = emoji ? emoji + ' ' : '  ';
    var connector = isLast ? '\u2514' : '\u2502';
    console.log('  ' + connector + ' ' + prefix + chalk.dim(key + ': ') + chalk.white(String(value)));
}

function boxHighlight(key, value, emoji, valueColor, isLast) {
    var prefix = emoji ? emoji + ' ' : '  ';
    var connector = isLast ? '\u2514' : '\u2502';
    var colorMap = {
        green: chalk.green, yellow: chalk.yellow, red: chalk.red,
        cyan: chalk.cyan, magenta: chalk.magenta, white: chalk.white.bold,
    };
    var vc = colorMap[valueColor] || chalk.white;
    console.log('  ' + connector + ' ' + prefix + chalk.dim(key + ': ') + vc(String(value)));
}

function boxClose() {
    console.log('  \u2514' + chalk.gray('\u2500'.repeat(BOX_WIDTH)) + '\u2518');
    console.log('');
}

// ═══════════════════════════════════════════════════════════════
// TRACE REFERENCE
// ═══════════════════════════════════════════════════════════════

function traceRef(location, description, consumer) {
    if (LEVELS.DEBUG.priority < MIN_PRIORITY) return;
    var loc = chalk.magenta.bold(location);
    var desc = chalk.white(description);
    var cons = consumer ? chalk.dim(' \u2192 ' + consumer) : '';
    console.log('  \u2502 ' + chalk.dim('\u{1F4C4} TRACE ') + loc + '  ' + desc + cons);
}

function boxTrace(location, description) {
    if (LEVELS.DEBUG.priority < MIN_PRIORITY) return;
    var loc = chalk.magenta.bold(location);
    var desc = chalk.gray(description);
    console.log('  \u2502 \u{1F4C4} ' + loc + '  ' + desc);
}

// ═══════════════════════════════════════════════════════════════
// OBJECT TREE / DATA PREVIEW (legacy compat)
// ═══════════════════════════════════════════════════════════════

function objectTree(obj, label, maxKeys, maxDepth) {
    if (LEVELS.DEBUG.priority < MIN_PRIORITY) return;
    if (!obj || typeof obj !== 'object') {
        console.log('  \u2514 \u{1F4CB} ' + chalk.gray(label) + ' = ' + chalk.white(String(obj)));
        return;
    }
    var keys = Object.keys(obj);
    var total = keys.length;
    var show = Math.min(total, maxKeys || 15);
    console.log('  \u251C \u{1F4D1} ' + chalk.magenta(label) + ' ' + chalk.gray('{' + total + ' keys}'));
    keys.slice(0, show).forEach(function(key, i) {
        var isLast = (i === show - 1) && (show >= total);
        var connector = isLast ? '\u2514' : '\u2502';
        var val = obj[key];
        var typeStr;
        if (val === null) typeStr = chalk.gray('null');
        else if (val === undefined) typeStr = chalk.gray('undefined');
        else if (Array.isArray(val)) typeStr = chalk.cyan('Array[' + val.length + ']');
        else if (typeof val === 'object') typeStr = chalk.cyan('Object{' + Object.keys(val).length + '}');
        else if (typeof val === 'boolean') typeStr = chalk.yellow(String(val));
        else if (typeof val === 'number') typeStr = chalk.yellow(String(val));
        else if (typeof val === 'string') {
            var p = val.length > 28 ? val.substring(0, 28) + '...' : val;
            typeStr = chalk.green('"' + p + '"');
        } else typeStr = chalk.gray(typeof val);
        console.log('  ' + connector + '   ' + chalk.white(key.padEnd(28)) + ' ' + typeStr);
    });
    if (total > show) console.log('  \u2514   ' + chalk.gray('... +' + (total - show) + ' more keys'));
}

function dataPreview(label, data, maxDepth) {
    objectTree(data, label, 10, maxDepth);
}

// ═══════════════════════════════════════════════════════════════
// SECTION HEADERS (legacy compat)
// ═══════════════════════════════════════════════════════════════

function header(title) {
    console.log('');
    var width = BOX_WIDTH + 2;
    var inner = title.padEnd(width - 4);
    console.log(chalk.magenta('  \u2554' + '\u2550'.repeat(width) + '\u2557'));
    console.log(chalk.magenta('  \u2551') + chalk.magenta.bold('  ' + inner + '  ') + chalk.magenta('\u2551'));
    console.log(chalk.magenta('  \u255A' + '\u2550'.repeat(width) + '\u255D'));
    console.log('');
}

function headerThin(title) {
    console.log('');
    console.log(chalk.magenta('  \u250C\u2500 ' + title + ' ' + '\u2500'.repeat(Math.max(1, 52 - title.length)) + '\u2510'));
    console.log('');
}

function headerEnd() {
    console.log('');
    console.log(chalk.gray('  ' + '\u2500'.repeat(30)));
    console.log('');
}

function subHeader(emoji, title) {
    console.log('');
    console.log('  ' + emoji + ' ' + chalk.white.bold(title));
    console.log(chalk.gray('  ' + '\u2500'.repeat(54)));
}

function separator(char) {
    var c = char || '\u2500';
    console.log(chalk.gray('  ' + c.repeat(BOX_WIDTH)));
}

function separatorDouble() {
    console.log(chalk.gray('  \u2550'.repeat(BOX_WIDTH)));
}

// ═══════════════════════════════════════════════════════════════
// SOCKET EVENT
// ═══════════════════════════════════════════════════════════════

function socketEvent(event, socketId, ip, transport, extra) {
    var sid = socketId ? chalk.white(socketId.substring(0, 8)) + chalk.gray('...') : chalk.gray('?');

    if (event === 'connect') {
        console.log('');
        console.log(chalk.green.bold('  \u{1F517}\u26A1 Client connected  ') + sid + chalk.gray('  \u{1F4CD} ' + ip + '  \u{1F4E1} ' + transport));
    } else if (event === 'disconnect') {
        console.log(chalk.red.bold('  \u2796 Disconnected  ') + sid + chalk.gray('  reason: ' + (extra || '?')));
    } else if (event === 'upgrade') {
        console.log(chalk.cyan('  \u{1F504}\u2197\uFE0F Upgrade  ') + chalk.white(extra || '') + '  \u{1F7E2}');
    } else {
        console.log('  \u2502 ' + chalk.cyan(event.padEnd(14)) + ' ' + sid + '  ' + ip + '  ' + transport);
        if (extra) console.log('  \u2514 ' + chalk.dim(extra));
    }
}

// ═══════════════════════════════════════════════════════════════
// ACTION LOG
// ═══════════════════════════════════════════════════════════════

function actionLog(direction, action, status, err, extra) {
    if (direction === 'req') {
        console.log('');
        console.log('  \u{1F4E4} ' + chalk.bold.cyan(action.padEnd(22)) + chalk.gray(' ' + '\u2500'.repeat(34)));
    } else {
        var statusEmoji = status === 'OK' ? '\u2705' : '\u274C';
        var statusColor = status === 'OK' ? chalk.green : chalk.red;
        console.log(statusEmoji + ' ' + chalk.cyan(action.padEnd(22)) + ' ' + statusColor(status.padEnd(6)) + ' ' + statusColor('\u2500'.repeat(28)));
        if (extra) console.log('  \u2514 ' + chalk.dim(extra));
    }
}

// ═══════════════════════════════════════════════════════════════
// TIMING
// ═══════════════════════════════════════════════════════════════

function timing(label, startTimeMs) {
    var elapsed = Date.now() - startTimeMs;
    var color = elapsed > 2000 ? chalk.red : elapsed > 1000 ? chalk.yellow : elapsed > 500 ? chalk.cyan : chalk.green;
    var barCount = Math.min(Math.floor(elapsed / 100), 20);
    var bar = elapsed > 100 ? '\u2588'.repeat(barCount) : '';
    var barColor = elapsed > 2000 ? chalk.red : elapsed > 1000 ? chalk.yellow : chalk.green;
    console.log('  \u2514 \u23F1\uFE0F ' + chalk.dim(label + ': ') + color(elapsed + 'ms') + ' ' + barColor(bar));
}

// ═══════════════════════════════════════════════════════════════
// ERROR WITH STACK (legacy compat)
// ═══════════════════════════════════════════════════════════════

function errorWithStack(module, message, err) {
    console.log('');
    console.log(chalk.red.bold('  \u274C ERROR: ' + module) + chalk.gray(' ' + '\u2500'.repeat(46)));
    console.log('  \u251C \u274C ' + chalk.dim('msg: ') + chalk.white(message));
    if (err) {
        console.log('  \u251C \u274C ' + chalk.dim('err: ') + chalk.red(err.message));
        if (err.stack) {
            console.log(chalk.gray('  \u250C' + '\u2500'.repeat(56) + '\u2510'));
            err.stack.split('\n').slice(1, 6).forEach(function(line, i) {
                var prefix = i < 4 ? chalk.gray('\u2502') : chalk.gray('\u2514');
                var suffix = i < 4 ? chalk.gray('\u2502') : '';
                console.log('  ' + prefix + ' ' + chalk.gray(line.trim().padEnd(56)) + ' ' + suffix);
            });
            if (err.stack.split('\n').length > 6) {
                console.log('  ' + chalk.gray('\u2502') + ' ' + chalk.gray('... more stack lines ...'.padEnd(56)) + ' ' + chalk.gray('\u2502'));
            }
            console.log(chalk.gray('  \u2514' + '\u2500'.repeat(56) + '\u2518'));
        }
    }
    console.log('');
}

// ═══════════════════════════════════════════════════════════════
// REQUEST DUMP (legacy compat)
// ═══════════════════════════════════════════════════════════════

function requestDump(request) {
    if (LEVELS.DEBUG.priority < MIN_PRIORITY) return;
    if (!request || typeof request !== 'object') return;
    var keys = Object.keys(request);
    console.log('');
    console.log(chalk.gray('  \u250C' + '\u2500'.repeat(56) + '\u2510'));
    console.log(chalk.gray('  \u2502') + chalk.white.bold('  \u{1F4E4} REQUEST PAYLOAD'.padEnd(58)) + chalk.gray('\u2502'));
    console.log(chalk.gray('  \u251C' + '\u2500'.repeat(56) + '\u2524'));
    keys.forEach(function(key, i) {
        var isLast = (i === keys.length - 1);
        var val = request[key];
        var connector = isLast ? '\u2514' : '\u2502';
        var valStr;
        if (val === null) valStr = chalk.gray('null');
        else if (val === undefined) valStr = chalk.gray('undefined');
        else if (typeof val === 'string') {
            var preview = val.length > 40 ? val.substring(0, 40) + chalk.gray('...') : val;
            valStr = chalk.green('"' + preview + '"');
        } else if (typeof val === 'object') valStr = chalk.cyan(JSON.stringify(val).substring(0, 50));
        else valStr = chalk.yellow(String(val));
        console.log('  ' + connector + '   ' + chalk.white(key.padEnd(20)) + ' ' + valStr);
    });
    console.log(chalk.gray('  \u2514' + '\u2500'.repeat(56) + '\u2518'));
}

// ═══════════════════════════════════════════════════════════════
// RESPONSE SUMMARY (legacy compat)
// ═══════════════════════════════════════════════════════════════

function responseSummary(ret, dataLen, compressed, duration) {
    var status = ret === 0 ? chalk.green.bold('\u2705 SUCCESS') : chalk.red.bold('\u274C ERROR(' + ret + ')');
    var comp = compressed ? chalk.green('LZ-STRING') : chalk.gray('RAW');
    var durColor = duration > 2000 ? chalk.red : duration > 1000 ? chalk.yellow : chalk.green;
    console.log('');
    console.log('  ' + status + '  ' + chalk.dim('\u{1F4CF} data= ') + chalk.white(dataLen + ' chars') +
                '  ' + chalk.dim('\u{1F4E6} proto= ') + comp + '  ' + chalk.dim('\u23F1\uFE0F time= ') + durColor(duration + 'ms'));
    console.log('');
}

// ═══════════════════════════════════════════════════════════════
// TABLE / FIELD BUILD / FIELD MAP / CATEGORY BREAKDOWN (legacy)
// ═══════════════════════════════════════════════════════════════

function table(rows) {
    if (LEVELS.DEBUG.priority < MIN_PRIORITY) return;
    if (!rows || rows.length === 0) return;
    var keyWidth = Math.max.apply(null, rows.map(function(r) { return String(r[0]).length; })) + 2;
    rows.forEach(function(row, i) {
        var isLast = (i === rows.length - 1);
        var connector = isLast ? '\u2514' : '\u2502';
        var key = chalk.white(String(row[0]).padEnd(keyWidth));
        var val = typeof row[1] === 'number' ? chalk.yellow(String(row[1])) : chalk.cyan(String(row[1]));
        console.log('  ' + connector + ' ' + key + ' ' + chalk.dim(': ') + val);
    });
}

function fieldBuild(index, total, fieldName, fieldType, extra) {
    if (LEVELS.DEBUG.priority < MIN_PRIORITY) return;
    var isLast = (index === total);
    var num = chalk.gray('[' + String(index).padStart(2, '0') + '/' + total + ']');
    var connector = isLast ? '\u2514' : '\u2502';
    console.log('  ' + connector + ' ' + num + ' ' + chalk.white(fieldName.padEnd(26)) + ' ' + chalk.cyan('(' + fieldType + ')'.padEnd(24)) + ' ' + (extra ? chalk.gray(extra) : ''));
}

function fieldMap(data, label) {
    if (LEVELS.DEBUG.priority < MIN_PRIORITY) return;
    if (!data || typeof data !== 'object') return;
    var keys = Object.keys(data);
    boxOpen(label || 'DATA CONSTRUCTION', '\u{1F3D7}\u{FE0F}');
    keys.forEach(function(key, i) {
        var val = data[key];
        var isLast = (i === keys.length - 1);
        var connector = isLast ? '\u2514' : '\u2502';
        var typeInfo;
        if (val === null) typeInfo = chalk.gray('null');
        else if (val === undefined) typeInfo = chalk.gray('undefined');
        else if (Array.isArray(val)) typeInfo = chalk.cyan('Array[' + val.length + ']');
        else if (typeof val === 'object') typeInfo = chalk.cyan('Object{' + Object.keys(val).length + '}');
        else if (typeof val === 'boolean') typeInfo = chalk.yellow(String(val));
        else if (typeof val === 'number') typeInfo = chalk.yellow(String(val));
        else if (typeof val === 'string') {
            var p = val.length > 25 ? val.substring(0, 25) + '...' : val;
            typeInfo = chalk.green('"' + p + '"');
        } else typeInfo = chalk.gray(typeof val);
        console.log('  ' + connector + '   ' + chalk.white(key.padEnd(28)) + ' ' + typeInfo);
    });
    boxClose();
}

function categoryBreakdown(categories) {
    if (!categories || categories.length === 0) return;
    var maxLabel = Math.max.apply(null, categories.map(function(c) { return String(c[1]).length; }));
    categories.forEach(function(cat, i) {
        var isLast = (i === categories.length - 1);
        var connector = isLast ? '\u2514' : '\u2502';
        var label = chalk.white(String(cat[1]).padEnd(maxLabel));
        var count = chalk.yellow(String(cat[2]));
        var typeStr = cat[3] ? chalk.dim(' (' + cat[3] + ')') : '';
        console.log('  ' + connector + ' ' + (cat[0] || '\u{1F4CB}') + ' ' + label + ' ' + count + ' fields' + typeStr);
    });
}

// ═══════════════════════════════════════════════════════════════
// STEP LOG — Pipeline step (legacy compat, now less used)
// ═══════════════════════════════════════════════════════════════

function step(current, total, description, result, extra) {
    var num = chalk.gray('[' + String(current).padStart(2, '0') + '/' + String(total).padStart(2, '0') + ']');
    var icon, color;
    if (result === 'ok' || result === 'pass') { icon = '\u2705'; color = chalk.green; }
    else if (result === 'fail') { icon = '\u274C'; color = chalk.red; }
    else if (result === 'warn') { icon = '\u{26A0}\u{FE0F}'; color = chalk.yellow; }
    else if (result === 'new') { icon = '\u{1F31F}'; color = chalk.magenta; }
    else if (result === 'skip') { icon = '\u23ED'; color = chalk.gray; }
    else if (result === 'running') { icon = '\u{1F504}'; color = chalk.cyan; }
    else { icon = '\u{1F504}'; color = chalk.cyan; }

    var bar;
    if (result === 'fail' || result === 'skip') {
        bar = chalk.gray('\u2591'.repeat(total));
    } else if (result === 'warn') {
        bar = chalk.green('\u2588'.repeat(current - 1)) + chalk.yellow('\u2588') + chalk.gray('\u2591'.repeat(total - current));
    } else if (result === 'running') {
        bar = chalk.gray('\u2588'.repeat(current - 1)) + chalk.cyan('\u2588') + chalk.gray('\u2591'.repeat(total - current));
    } else {
        bar = chalk.green('\u2588'.repeat(current)) + chalk.gray('\u2591'.repeat(total - current));
    }

    console.log('  ' + num + ' ' + icon + ' ' + color(description) + '  ' + bar + (extra ? chalk.dim('  ' + extra) : ''));
}

// ═══════════════════════════════════════════════════════════════
// ERROR BANNER (legacy compat, now used less)
// ═══════════════════════════════════════════════════════════════

function errorBanner(opts) {
    var W = 62;
    var r = chalk.red.bold, rb = chalk.red, w = chalk.white, g = chalk.gray, y = chalk.yellow, m = chalk.magenta;
    console.log('');
    console.log(r('  \u250C' + '\u2500'.repeat(W) + '\u2510'));
    if (opts.step) console.log(r('  \u2502') + '  ' + r('\u274C FATAL ERROR AT STEP ' + opts.step) + rb(' '.repeat(Math.max(0, W - 26 - opts.step.length))) + r('\u2502'));
    console.log(rb('  \u2502') + g(' '.repeat(W)) + rb('\u2502'));
    if (opts.module)      console.log(rb('  \u2502') + '  ' + g('STEP:   ') + w(opts.module) + g(' '.repeat(Math.max(0, W - 10 - opts.module.length))) + rb('\u2502'));
    if (opts.message)     console.log(rb('  \u2502') + '  ' + g('REASON: ') + w.bold(opts.message) + g(' '.repeat(Math.max(0, W - 10 - opts.message.length))) + rb('\u2502'));
    if (opts.trace)       console.log(rb('  \u2502') + '  ' + g('DETAIL: ') + m.bold(opts.trace) + g(' '.repeat(Math.max(0, W - 10 - opts.trace.length))) + rb('\u2502'));
    if (opts.consumer)    console.log(rb('  \u2502') + '  ' + g('CLIENT: ') + g(opts.consumer) + g(' '.repeat(Math.max(0, W - 10 - opts.consumer.length))) + rb('\u2502'));
    console.log(rb('  \u2502') + g(' '.repeat(W)) + rb('\u2502'));
    if (opts.impact)      console.log(rb('  \u2502') + '  ' + y('IMPACT:  ') + y.bold(opts.impact) + g(' '.repeat(Math.max(0, W - 10 - opts.impact.length))) + rb('\u2502'));
    if (opts.fix)         console.log(rb('  \u2502') + '  ' + g('FIX:     ') + g(opts.fix) + g(' '.repeat(Math.max(0, W - 10 - opts.fix.length))) + rb('\u2502'));
    console.log(rb('  \u2502') + g(' '.repeat(W)) + rb('\u2502'));
    if (opts.err && opts.err.stack) {
        var lines = opts.err.stack.split('\n').slice(1, 5);
        lines.forEach(function(line, i) {
            var trimmed = line.trim().substring(0, W - 4);
            var prefix = i < lines.length - 1 ? '  \u2502  ' : '  \u2514  ';
            console.log(rb('  \u2502') + '  ' + g(prefix + trimmed.padEnd(W - 4)) + rb('\u2502'));
        });
        if (opts.err.stack.split('\n').length > 5) {
            console.log(rb('  \u2502') + '  ' + g('     ... more stack lines ...'.padEnd(W - 4)) + rb('\u2502'));
        }
        console.log(rb('  \u2502') + g(' '.repeat(W)) + rb('\u2502'));
    }
    console.log(r('  \u2514' + '\u2500'.repeat(W) + '\u2518'));
    console.log('');
}

// ═══════════════════════════════════════════════════════════════
// WARN CALLOUT (legacy compat)
// ═══════════════════════════════════════════════════════════════

function warnCallout(message, opts) {
    opts = opts || {};
    var y = chalk.yellow, yb = chalk.yellow.bold, w = chalk.white, g = chalk.gray, m = chalk.magenta;
    console.log('');
    console.log(yb('  \u26A0\uFE0F  ') + w.bold(message));
    if (opts.source) console.log('       ' + m('\u{1F4CE} SOURCE: ') + m(opts.source));
    if (opts.action) console.log('       ' + g('\u{1F527} ACTION: ') + g(opts.action));
    if (opts.reason) console.log('       ' + w('\u{1F4CE} REASON: ') + w(opts.reason));
    if (opts.module) console.log('       ' + g('\u{1F4CB} MODULE: ') + g(opts.module));
    console.log('');
}

// ═══════════════════════════════════════════════════════════════
// v4.0 — WARN COLLAPSE — kumpulkan warning sama jadi 1 baris
// ═══════════════════════════════════════════════════════════════

/**
 * Collapse similar warnings into one summary line.
 * Instead of printing 7 identical warnings, prints 1 line with count.
 *
 * @param {string} category   - Warning category e.g. "mutationLog string values"
 * @param {number} count      - How many occurrences
 * @param {string[]} [fields] - Affected field names
 * @param {string} [hint]     - Fix hint
 */
function warnCollapse(category, count, fields, hint) {
    if (count <= 1) return; // Don't collapse single warnings

    var fieldStr = '';
    if (fields && fields.length > 0) {
        if (fields.length <= 4) {
            fieldStr = '\n       \u{1F4CE} fields : ' + chalk.white(fields.join(', '));
        } else {
            fieldStr = '\n       \u{1F4CE} fields : ' + chalk.white(fields.slice(0, 4).join(', ')) + chalk.gray(' +' + (fields.length - 4) + ' more');
        }
    }

    console.log('   \u26A0\uFE0F  ' + chalk.yellow(count + 'x ' + category) +
                (hint ? ' \u2014 auto-coerced' : '') + fieldStr);
}

// ═══════════════════════════════════════════════════════════════
// STATUS / CRITICAL FIELDS / SUMMARY CARD / FIELD STATUS
// ═══════════════════════════════════════════════════════════════

var STATUS = {
    traced:  { emoji: '\u2705', label: 'TRACED',  color: chalk.green },
    fix:     { emoji: '\u2705', label: 'FIX',     color: chalk.cyan },
    config:  { emoji: '\u2699\uFE0F',  label: 'CONFIG',  color: chalk.yellow },
    default: { emoji: '\u{1F538}', label: 'DEFAULT', color: chalk.gray },
    dead:    { emoji: '\u{1F6AB}', label: 'DEAD',    color: chalk.red },
    missing: { emoji: '\u274C', label: 'MISSING', color: chalk.red.bold },
    warn:    { emoji: '\u26A0\uFE0F', label: 'WARN',    color: chalk.yellow.bold },
    ok:      { emoji: '\u2705', label: 'OK',      color: chalk.green },
    fail:    { emoji: '\u274C', label: 'FAIL',    color: chalk.red },
};

function fieldStatus(key, value, status, detail, isLast) {
    var s = STATUS[status] || STATUS.default;
    var connector = isLast ? '\u2514' : '\u2502';
    var badge = s.color(s.emoji + ' ' + s.label);
    var detailStr = detail ? chalk.dim('  ' + detail) : '';
    console.log('  ' + connector + '   ' + chalk.white(String(key).padEnd(32)) + ' ' + chalk.white(String(value).padEnd(20)) + ' ' + badge + detailStr);
}

function criticalFields(fields) {
    if (!fields || fields.length === 0) return { passed: 0, failed: 0, warned: 0 };
    var stats = { passed: 0, failed: 0, warned: 0 };
    console.log('');
    console.log(chalk.red.bold('  \u{1F512} CRITICAL FIELDS AUDIT \u2014 game will crash/stuck if wrong'));
    fields.forEach(function(f, i) {
        var isLast = (i === fields.length - 1);
        var connector = isLast ? '\u2514' : '\u251C';
        var icon;
        if (f.status === 'ok') { icon = '\u2705'; stats.passed++; }
        else if (f.status === 'fail') { icon = '\u{1F6AB}'; stats.failed++; }
        else { icon = '\u26A0\uFE0F'; stats.warned++; }
        var name = chalk.white(f.name.padEnd(24));
        var val = f.status === 'ok' ? chalk.green(String(f.value))
                : f.status === 'fail' ? chalk.red(String(f.value))
                : chalk.yellow(String(f.value));
        var detail = f.detail ? chalk.dim('  ' + f.detail) : '';
        console.log('  ' + connector + ' \u{1F512} ' + name + ' = ' + val + detail);
    });
    var allOk = stats.failed === 0;
    var verdict = allOk
        ? chalk.green.bold('  \u2705 CRITICAL AUDIT: ' + stats.passed + '/' + fields.length + ' PASSED' + (stats.warned > 0 ? ', ' + stats.warned + ' warning(s)' : ''))
        : chalk.red.bold('  \u26A0\uFE0F CRITICAL AUDIT: ' + stats.passed + '/' + fields.length + ' PASSED \u2014 ' + stats.failed + ' ISSUES');
    console.log(verdict);
    return stats;
}

function summaryCard(data) {
    // Delegate to handlerClose for consistency — but keep backward compat
    handlerClose(data.reqId || '----', data.action || 'UNKNOWN', {
        ret: data.errors > 0 ? 1 : 0,
        duration: data.duration,
        protocol: data.compressed ? 'LZ-STRING' : 'RAW',
        respSize: data.respSize,
        jsonSize: data.jsonSize,
        userId: data.userId,
        userType: data.userType,
        heroes: data.heroes,
        level: data.level,
        diamond: data.diamond,
        fields: data.fields,
        critical: data.critical,
        warnings: data.warnings,
        errors: data.errors,
        typePass: data.typePass,
        typeFail: data.typeFail,
    });
}

function warningSection(warnings) {
    if (!warnings || warnings.length === 0) return;
    console.log('');
    console.log(chalk.yellow.bold('  \u26A0\uFE0F WARNINGS DETECTED'));
    warnings.forEach(function(warn, i) {
        var isLast = (i === warnings.length - 1);
        console.log(chalk.yellow.bold('  \u26A0\uFE0F  [' + (warn.id || 'W' + String(i + 1).padStart(3, '0')) + '] ') + chalk.white(warn.message));
        if (warn.expected) console.log(chalk.gray('       Expected: ') + chalk.white(warn.expected));
        if (warn.got)      console.log(chalk.gray('       Got:      ') + chalk.magenta(warn.got));
        if (warn.impact)   console.log(chalk.gray('       Impact:   ') + chalk.yellow(warn.impact));
        if (warn.fix)      console.log(chalk.gray('       Fix:      ') + chalk.gray(warn.fix));
        if (!isLast) console.log('');
    });
    console.log(chalk.yellow.bold('  \u26A0\uFE0F TOTAL WARNINGS: ' + warnings.length));
    console.log('');
}

// ═══════════════════════════════════════════════════════════════
// TYPE ASSERT / INVARIANT CHECK / MUTATION LOG / DEEP TYPE SCAN
// ═══════════════════════════════════════════════════════════════

function typeAssert(fieldPath, actualValue, expectedType, opts) {
    opts = opts || {};
    var passed = false;
    var actualType = typeof actualValue;
    switch (expectedType) {
        case 'number': passed = (actualType === 'number' && !isNaN(actualValue)); break;
        case 'string': passed = (actualType === 'string'); break;
        case 'object': passed = (actualType === 'object' && actualValue !== null && !Array.isArray(actualValue)); break;
        case 'array': passed = Array.isArray(actualValue); break;
        case 'boolean': passed = (actualType === 'boolean'); break;
        default: passed = false;
    }
    if (passed) {
        log('DEBUG', 'VALIDATE', '\u2705 typeAssert PASS: ' + fieldPath + ' is ' + expectedType);
    } else {
        errorBanner({
            module: opts.context || 'VALIDATE',
            step: opts.trace || '',
            message: 'TYPE ASSERTION FAILED: ' + fieldPath,
            trace: opts.trace || '',
            consumer: opts.consumer || '',
            impact: opts.impact || 'Unexpected type may crash client or corrupt data',
        });
        details('error', ['field', fieldPath], ['expected', expectedType], ['actual', actualType], ['value', String(actualValue)]);
    }
    return passed;
}

function invariantCheck(ruleName, condition, opts) {
    if (condition) {
        log('DEBUG', 'VALIDATE', '\u2705 invariant PASS: ' + ruleName);
        return true;
    }
    var failOpts = {};
    if (opts) {
        if (opts.context) failOpts.source = opts.context + (opts.trace ? ' ' + opts.trace : '');
        if (opts.fix)     failOpts.action = opts.fix;
        if (opts.actual)  failOpts.reason = 'Expected: ' + (opts.expect || 'truthy') + ', Got: ' + opts.actual;
        if (opts.impact && opts.actual) failOpts.reason = failOpts.reason + ' \u2014 ' + opts.impact;
        else if (opts.impact) failOpts.reason = opts.impact;
    }
    warnCallout('INVARIANT VIOLATION: ' + ruleName, failOpts);
    return false;
}

function mutationLog(opts) {
    if (!opts) return;
    var delta = (opts.after || 0) - (opts.before || 0);
    var sign = delta >= 0 ? '+' : '';
    var unit = opts.unit ? ' ' + opts.unit : '';
    var deltaStr = sign + delta + unit;
    var anomalyFlag = '';
    if (opts.maxDelta !== undefined && opts.maxDelta !== null && Math.abs(delta) > opts.maxDelta)
        anomalyFlag = chalk.red(' \u26A0\uFE0F DELTA TOO LARGE (max=' + opts.maxDelta + ')');
    if (opts.nonNegative && opts.after < 0)
        anomalyFlag = chalk.red(' \u26A0\uFE0F NEGATIVE RESULT!');
    if (opts.noChange && delta === 0)
        anomalyFlag = chalk.yellow(' \u26A0\uFE0F NO CHANGE');
    var beforeStr = String(opts.before) + unit;
    var afterStr = String(opts.after) + unit;
    var summary = chalk.cyan(beforeStr) + ' \u2192 ' + chalk.cyan(afterStr) + ' (' + chalk.green(deltaStr) + ')' + anomalyFlag;
    var context = opts.context ? ' [' + opts.context + ']' : '';
    details('mutation', [opts.field || '?', summary + context]);
}

function deepTypeScan(obj, specs, prefix) {
    var result = { passed: 0, failed: 0, errors: [] };
    if (!obj || typeof obj !== 'object' || !specs) return result;
    var specKeys = Object.keys(specs);
    for (var i = 0; i < specKeys.length; i++) {
        var fieldName = specKeys[i];
        var expectedType = specs[fieldName];
        var val = obj[fieldName];
        var path = prefix ? prefix + '.' + fieldName : fieldName;
        var match = false;
        var actualType = typeof val;
        switch (expectedType) {
            case 'array': match = Array.isArray(val); break;
            case 'object': match = (actualType === 'object' && val !== null && !Array.isArray(val)); break;
            case 'number': match = (actualType === 'number'); break;
            case 'string': match = (actualType === 'string'); break;
            case 'boolean': match = (actualType === 'boolean'); break;
            default: match = (actualType === expectedType);
        }
        if (match) result.passed++;
        else {
            result.failed++;
            result.errors.push({
                path: path,
                expected: expectedType,
                actual: Array.isArray(val) ? 'array' : (val === null ? 'null' : actualType),
                value: val,
            });
        }
    }
    return result;
}

// ═══════════════════════════════════════════════════════════════
// SAVE VERIFY / RESPONSE SNAPSHOT
// ═══════════════════════════════════════════════════════════════

function walkPath(obj, path) {
    if (!obj || !path) return undefined;
    var parts = path.split('.');
    var current = obj;
    for (var i = 0; i < parts.length; i++) {
        if (current === null || current === undefined) return undefined;
        current = current[parts[i]];
    }
    return current;
}

function saveVerify(userId, db, expectedData, criticalPaths) {
    if (!db || !db.getUser) return false;
    var savedData = db.getUser(userId);
    if (!savedData) {
        errorBanner({ module: 'SAVE', message: 'User data NOT FOUND after save!', trace: 'userId=' + userId, impact: 'Save operation may have failed silently' });
        return false;
    }
    var allOk = true;
    for (var i = 0; i < criticalPaths.length; i++) {
        var path = criticalPaths[i];
        var expected = walkPath(expectedData, path);
        var actual = walkPath(savedData, path);
        if (JSON.stringify(expected) !== JSON.stringify(actual)) {
            warnCallout('SAVE INTEGRITY: ' + path + ' MISMATCH', { reason: 'Expected: ' + JSON.stringify(expected) + ', Got: ' + JSON.stringify(actual), module: 'SAVE' });
            allOk = false;
        }
    }
    if (allOk) log('DEBUG', 'SAVE', '\u2705 saveVerify: ' + criticalPaths.length + '/' + criticalPaths.length + ' paths OK');
    return allOk;
}

function responseSnapshot(label, data) {
    if (!data || typeof data !== 'object') return;
    var keys = Object.keys(data);
    var total = keys.length;
    colorBox(label, '\u{1F4F8}', 'success');
    keys.forEach(function(key, i) {
        var isLast = (i === total - 1);
        var connector = isLast ? '\u2514' : '\u251C';
        var val = data[key];
        var keyStr = chalk.white(key.padEnd(28));
        var typeStr;
        var anomalyFlag = '';
        if (val === null) { typeStr = chalk.gray('null'); anomalyFlag = chalk.yellow(' \u26A0\uFE0F NULL'); }
        else if (val === undefined) { typeStr = chalk.gray('undefined'); anomalyFlag = chalk.red(' \u26A0\uFE0F UNDEFINED'); }
        else if (Array.isArray(val)) { typeStr = chalk.cyan('Array[' + val.length + ']'); if (val.length === 0) anomalyFlag = chalk.yellow(' \u26A0\uFE0F EMPTY'); }
        else if (typeof val === 'object') { typeStr = chalk.cyan('Object{' + Object.keys(val).length + '}'); }
        else if (typeof val === 'boolean') typeStr = chalk.yellow(String(val));
        else if (typeof val === 'number') { typeStr = chalk.yellow(String(val)); if (isNaN(val)) anomalyFlag = chalk.red(' \u26A0\uFE0F NaN!'); else if (val < 0) anomalyFlag = chalk.yellow(' \u26A0\uFE0F NEGATIVE'); }
        else if (typeof val === 'string') { var p = val.length > 28 ? val.substring(0, 28) + '...' : val; typeStr = chalk.green('"' + p + '"'); }
        else typeStr = chalk.gray(typeof val);
        console.log('  ' + connector + '   ' + keyStr + ' ' + typeStr + anomalyFlag);
    });
    boxClose();
}

// ═══════════════════════════════════════════════════════════════
// HANDLER DIVIDER / PHASE HEADER / PHASE DIVIDER (legacy compat)
// ═══════════════════════════════════════════════════════════════

function handlerDivider(handlerName, action, userId) {
    // Now just calls handlerOpen without reqId
    handlerOpen('----', action || handlerName, userId);
}

function phaseHeader(phaseNum, total, emoji, title) {
    phase(emoji, phaseNum, title);
}

function phaseDivider(label) {
    if (label) {
        var padded = '  ' + label + ' ';
        var sideLen = Math.max(1, Math.floor((BOX_WIDTH - padded.length) / 2));
        console.log(chalk.gray('  ' + '\u2500'.repeat(sideLen) + chalk.dim(padded) + '\u2500'.repeat(sideLen)));
    } else {
        console.log(chalk.gray('  \u2500\u2500' + '\u2500'.repeat(BOX_WIDTH - 6) + '\u2500\u2500'));
    }
}

// ═══════════════════════════════════════════════════════════════
// v4.0 — GLOBAL ERROR CAPTURE
// Catches errors that happen OUTSIDE handler pipeline.
// ═══════════════════════════════════════════════════════════════

/**
 * Log an uncaught exception — the LAST line of defense.
 * @param {Error}  err    - The error object
 * @param {string} origin - 'uncaughtException' or similar
 */
function fatalCapture(err, origin) {
    var W = 62;
    var sep = chalk.red.bold('\u{1F4A5}\u2501'.repeat(Math.ceil(W / 2)).substring(0, W));

    console.log('');
    console.log(sep);
    console.log(chalk.red.bold('  \u{1F4A5}  UNCAUGHT EXCEPTION  ' + chalk.white(origin || 'unknown')));
    console.log(sep);

    // ── Bulletproof guard: err can be undefined/null/non-Error ──
    if (err === undefined || err === null) {
        console.log('   \u{1F527} error   : ' + chalk.yellow('undefined/null — no error object received'));
        console.log('   \u{1F4CE} hint    : ' + chalk.gray('Check process.on("uncaughtException") binding'));
        console.log(sep);
        return;
    }
    if (!(err instanceof Error)) {
        console.log('   \u{1F527} error   : ' + chalk.white(String(err)));
        console.log('   \u{1F4C4} type    : ' + chalk.yellow(typeof err + ' (not Error instance)'));
        console.log(sep);
        return;
    }

    console.log('   \u{1F527} error   : ' + chalk.white(err.message));
    console.log('   \u{1F4C4} type    : ' + chalk.yellow(err.constructor.name));

    if (err.stack) {
        var lines = err.stack.split('\n').slice(1, 6);
        console.log('   \u{1F4CD} stack   :');
        lines.forEach(function(line) {
            console.log('       ' + chalk.gray(line.trim()));
        });
        if (err.stack.split('\n').length > 6) {
            console.log('       ' + chalk.gray('... more stack lines ...'));
        }
    }

    console.log(sep);
}

/**
 * Log an unhandled promise rejection.
 * @param {*}      reason  - The rejection reason
 * @param {Promise} promise - The rejected promise
 */
function rejectionCapture(reason, promise) {
    var W = 62;
    var sep = chalk.red.bold('\u{1F4A5}\u2501'.repeat(Math.ceil(W / 2)).substring(0, W));

    // ── Bulletproof guard: reason can be anything ──
    var reasonStr;
    if (reason === undefined || reason === null) {
        reasonStr = chalk.yellow('undefined/null — no rejection reason received');
    } else if (reason instanceof Error) {
        reasonStr = chalk.white(reason.message);
    } else {
        reasonStr = chalk.white(String(reason)) + chalk.gray(' (' + typeof reason + ')');
    }

    console.log('');
    console.log(sep);
    console.log(chalk.red.bold('  \u{1F4A5}  UNHANDLED REJECTION'));
    console.log(sep);

    console.log('   \u{1F527} reason  : ' + reasonStr);

    if (_currentReqId) {
        console.log('   \u{1F3CF}\u{FE0F} request : ' + chalk.cyan.bold(_currentReqId));
    }

    if (reason instanceof Error && reason.stack) {
        var lines = reason.stack.split('\n').slice(1, 4);
        console.log('   \u{1F4CD} stack   :');
        lines.forEach(function(line) {
            console.log('       ' + chalk.gray(line.trim()));
        });
    }

    console.log(sep);
}

/**
 * Log a handler crash — caught by the error boundary wrapper in index.js.
 * @param {string} reqId   - Request ID
 * @param {object} request - The original request object
 * @param {Error}  err     - The error
 */
function handlerCrash(reqId, request, err) {
    var W = 62;
    var sep = chalk.red.bold('\u{1F4A5}\u2501'.repeat(Math.ceil(W / 2)).substring(0, W));

    var actionStr = (request && request.type || '?') + '::' + (request && request.action || '?');

    console.log('');
    console.log(sep);
    console.log(chalk.red.bold('  \u{1F4A5}  ' + (reqId || '????') + '  HANDLER CRASH  \u{1F4E8} ' + actionStr));
    console.log(sep);

    // ── Bulletproof guard: err can be anything ──
    if (err === undefined || err === null) {
        console.log('   \u{1F527} error   : ' + chalk.yellow('undefined/null — no error object received'));
        console.log(sep);
        return;
    }
    if (!(err instanceof Error)) {
        console.log('   \u{1F527} error   : ' + chalk.white(String(err)));
        console.log('   \u{1F4C4} type    : ' + chalk.yellow(typeof err + ' (not Error instance)'));
        console.log(sep);
        return;
    }

    console.log('   \u{1F527} error   : ' + chalk.white(err.message));
    console.log('   \u{1F4C4} type    : ' + chalk.yellow(err.constructor.name));

    if (err.stack) {
        // Extract file:line from first stack frame
        var firstFrame = err.stack.split('\n')[1];
        if (firstFrame) {
            var match = firstFrame.match(/\((.+):(\d+):(\d+)\)/);
            if (match) {
                console.log('   \u{1F4C1} file    : ' + chalk.white(match[1]));
                console.log('   \u{1F4CF} line    : ' + chalk.yellow(match[2] + ':' + match[3]));
            }
        }
        var lines = err.stack.split('\n').slice(1, 5);
        console.log('   \u{1F4CD} stack   :');
        lines.forEach(function(line) {
            console.log('       ' + chalk.gray(line.trim()));
        });
    }

    if (request.userId) {
        console.log('   \u{1F464} userId  : ' + chalk.white(request.userId));
    }
    if (request.relayAction) {
        console.log('   \u{1F4E1} relay   : ' + chalk.white(request.relayAction));
    }

    console.log('   \u{1F4A5} impact  : ' + chalk.yellow('Client received ret=1 (server error)'));
    console.log(sep);
}

// ═══════════════════════════════════════════════════════════════
// v4.0 — CONFIG AUDIT
// Checks configuration at startup for known issues.
// ═══════════════════════════════════════════════════════════════

/**
 * Audit server configuration at startup.
 * Checks for known issues that could cause silent errors.
 *
 * @param {object} config - The server config object
 * @returns {{ passed: number, issues: Array<object> }}
 */
function configAudit(config) {
    if (!config) return { passed: 0, issues: [] };

    var issues = [];
    var checks = [
        {
            name: 'serverVersion',
            check: function(c) { return c.serverVersion && c.serverVersion.length > 0; },
            severity: 'error',
            impact: 'Client displays no/wrong version info',
            fix: 'config.serverVersion = "2026-05-15"',
        },
        {
            name: 'serverId',
            check: function(c) { return c.serverId !== undefined && c.serverId !== null; },
            severity: 'error',
            impact: 'Server selection will fail',
            fix: 'config.serverId = 1 (number)',
        },
        {
            name: 'serverId type',
            check: function(c) { return typeof c.serverId === 'number' || typeof c.serverId === 'string'; },
            severity: 'warn',
            impact: 'Client parser expects number for serverId',
            fix: 'Ensure config.serverId matches client expectation',
        },
        {
            name: 'port',
            check: function(c) { return c.port && c.port > 0 && c.port < 65536; },
            severity: 'error',
            impact: 'Server will not start',
            fix: 'config.port = 8001',
        },
        {
            name: 'teaKey',
            check: function(c) { return c.teaKey && c.teaKey.length > 0; },
            severity: 'warn',
            impact: 'TEA verification disabled — security risk',
            fix: 'config.teaKey = "verification" or custom key',
        },
        {
            name: 'sdkUrl',
            check: function(c) { return c.sdkUrl && c.sdkUrl.startsWith('http'); },
            severity: 'warn',
            impact: 'SDK-Server authentication will fail',
            fix: 'config.sdkUrl = "http://127.0.0.1:9999"',
        },
        {
            name: 'chatUrl',
            check: function(c) { return c.chatUrl && c.chatUrl.startsWith('http') && !c.chatUrl.includes('127.0.0.1'); },
            severity: 'warn',
            impact: 'Chat won\'t work in production (hardcoded localhost)',
            fix: 'Use process.env.CHAT_URL or env config',
        },
        {
            name: 'dungeonUrl',
            check: function(c) { return c.dungeonUrl && c.dungeonUrl.startsWith('http') && !c.dungeonUrl.includes('127.0.0.1'); },
            severity: 'warn',
            impact: 'Dungeon won\'t work in production (hardcoded localhost)',
            fix: 'Use process.env.DUNGEON_URL or env config',
        },
        {
            name: 'resourcePath',
            check: function(c) { return c.resourcePath && typeof c.resourcePath === 'string'; },
            severity: 'error',
            impact: 'Resources will not load — game broken',
            fix: 'config.resourcePath = "/path/to/resource/json"',
        },
        {
            name: 'currency',
            check: function(c) { return c.currency && typeof c.currency === 'string'; },
            severity: 'warn',
            impact: 'Currency display may be wrong',
            fix: 'config.currency = "USD" or "CNY"',
        },
    ];

    var passed = 0;
    checks.forEach(function(c) {
        var ok = c.check(config);
        if (ok) {
            passed++;
        } else {
            issues.push({
                name: c.name,
                severity: c.severity,
                impact: c.impact,
                fix: c.fix,
            });
        }
    });

    // Print audit results
    if (issues.length === 0) {
        log('INFO', 'AUDIT', '\u2705 Config audit passed: ' + passed + '/' + checks.length + ' checks OK');
    } else {
        var W = 62;
        var warnSep = chalk.yellow('\u{26A0}\uFE0F\u2501'.repeat(Math.ceil(W / 2)).substring(0, W));

        console.log('');
        console.log(warnSep);
        console.log(chalk.yellow.bold('  \u{1F6E1}\uFE0F  CONFIG AUDIT  ' + issues.length + ' issues at startup'));
        console.log(warnSep);

        issues.forEach(function(issue) {
            var icon = issue.severity === 'error' ? '\u274C' : '\u26A0\uFE0F';
            var nameColor = issue.severity === 'error' ? chalk.red : chalk.yellow;

            console.log('   ' + icon + ' ' + nameColor(issue.name) + '  ' + chalk.gray(issue.name.includes('type') ? '\u{1F522}' : issue.name.includes('Url') ? '\u{1F3E0}' : '\u{1F4ED}'));
            console.log('       \u{1F4CE} impact : ' + chalk.white(issue.impact));
            console.log('       \u{1F527} fix    : ' + chalk.white(issue.fix));
        });

        console.log(warnSep);
    }

    return { passed: passed, issues: issues };
}

// ═══════════════════════════════════════════════════════════════
// v4.0 — SERVER STARTUP BANNER
// ═══════════════════════════════════════════════════════════════

/**
 * Print the server startup banner with emoji per config item.
 * @param {object} opts
 * @param {string} opts.name        - Server name
 * @param {number} opts.port        - Port number
 * @param {string} opts.socketVersion - Socket.IO version
 * @param {boolean} opts.teaEnabled - TEA on/off
 * @param {string} opts.dbPath      - Database file path
 * @import {string} opts.dbSize      - DB file size string
 * @param {number} opts.dbRecords   - Number of DB records
 * @param {string} opts.sdkUrl      - SDK-Server URL
 * @param {number} opts.resourceCount - Number of resource JSONs
 * @param {string} opts.resourceSize  - Total resource size string
 * @param {string} opts.logLevel    - Current log level
 */
function serverBanner(opts) {
    opts = opts || {};
    var W = 62;

    console.log('');
    console.log(chalk.magenta('\u{1F3AE} \u2550'.repeat(W / 2).substring(0, W)));
    console.log(chalk.magenta('\u{1F3AE}  \u{2694}\uFE0F  ') + chalk.magenta.bold(opts.name || 'SUPER WARRIOR Z \u2014 MAIN SERVER') + '  ' + chalk.magenta('v4.0'));
    console.log(chalk.magenta('\u{1F3AE} \u2550'.repeat(W / 2).substring(0, W)));

    var lines = [
        ['\u{1F310}', 'Port', opts.port || '?'],
        ['\u{1F4E1}', 'Socket.IO', opts.socketVersion || '?'],
        ['\u{1F510}', 'TEA', opts.teaEnabled ? 'ON (verification)' : 'OFF'],
        ['\u{1F4BE}', 'DB', (opts.dbPath || '?') + '  (' + (opts.dbSize || '?') + ' \u00B7 ' + (opts.dbRecords || '?') + ' records)'],
        ['\u{1F310}', 'SDK API', opts.sdkUrl || '?'],
        ['\u{1F4C2}', 'Resources', (opts.resourceCount || '?') + ' JSON  (' + (opts.resourceSize || '?') + ')'],
        ['\u{1F4CA}', 'LOG_LEVEL', opts.logLevel || 'INFO'],
    ];

    lines.forEach(function(line) {
        var key = chalk.white(line[1].padEnd(14));
        console.log('\u{1F3AE}  ' + line[0] + ' ' + key + chalk.gray(line[2]));
    });

    console.log(chalk.magenta('\u{1F3AE} \u2550'.repeat(W / 2).substring(0, W)));
}

// ═══════════════════════════════════════════════════════════════
// v4.0 — TEA EVENT LOG
// ═══════════════════════════════════════════════════════════════

/**
 * Log TEA challenge send.
 * @param {string} socketId - Socket ID (shortened)
 * @param {string} challenge - UUID challenge string
 */
function teaChallenge(socketId, challenge) {
    var sid = socketId ? chalk.white(socketId.substring(0, 8)) + chalk.gray('...') : chalk.gray('?');
    console.log('');
    console.log(chalk.magenta.bold('  \u{1F510}\u{1F511} Challenge \u2192 ') + sid);
    console.log('              \u{1F3B2} ' + chalk.white(challenge));
}

/**
 * Log TEA verification result.
 * @param {string}  socketId  - Socket ID (shortened)
 * @param {number}  duration  - Verification time in ms
 * @param {string}  [from]    - Old transport
 * @param {string}  [to]      - New transport
 */
function teaVerified(socketId, duration, from, to) {
    var sid = socketId ? chalk.white(socketId.substring(0, 8)) + chalk.gray('...') : chalk.gray('?');
    console.log(chalk.green.bold('  \u{1F510}\u2705 Verified  ') + sid + '  ' + chalk.cyan.bold('\u26A1 ' + duration + 'ms'));
    if (from && to) {
        console.log(chalk.cyan('  \u{1F504}\u2197\uFE0F Upgrade  ') + chalk.white(from + ' \u2192 ' + to) + '  \u{1F7E2}');
    }
}

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

module.exports = {
    // --- v4.0 NEW ---
    generateReqId, getReqId, setReqId, clearReqId,
    handlerOpen, handlerClose,
    phaseBox, phase, phaseIcon,
    payloadLog, assertLine, sectionLine,
    warnCollapse,
    fatalCapture, rejectionCapture, handlerCrash,
    configAudit,
    serverBanner,
    teaChallenge, teaVerified,

    // --- CORE ---
    log, detail, details,

    // --- HEADERS ---
    header, headerThin, headerEnd, subHeader,
    separator, separatorDouble,

    // --- SOCKET ---
    socketEvent, actionLog,

    // --- TIMING ---
    timing,

    // --- ERRORS ---
    errorWithStack, errorBanner, warnCallout,

    // --- REQUEST/RESPONSE ---
    requestDump, responseSummary,
    dataPreview, table, fieldBuild,

    // --- BOX ---
    boxOpen, boxLine, boxDetail, boxClose,
    boxHighlight, colorBox, boxTrace,

    // --- TRACE ---
    traceRef, objectTree,

    // --- PIPELINE ---
    step, fieldMap, categoryBreakdown,

    // --- AUDIT ---
    criticalFields, summaryCard, fieldStatus, warningSection,

    // --- VALIDATION ---
    typeAssert, invariantCheck, mutationLog, deepTypeScan,

    // --- SAVE ---
    saveVerify, responseSnapshot,

    // --- LEGACY HANDLER ---
    handlerDivider, phaseHeader, phaseDivider,

    // --- CONFIG ---
    STATUS, LEVELS, MODULES, DATA_EMOJI, PHASE_ICONS,
    chalk,
};
