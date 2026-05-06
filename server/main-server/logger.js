/**
 * logger.js — MAIN-SERVER Emoji Block Logging System
 *
 * Format: [LEVEL_EMOJI] HH:mm:ss.SSS LEVEL  [MODULE_EMOJI] MODULE ▸ Message
 *   └ [DETAIL_EMOJI] key: value · key: value
 *
 * Fitur:
 *   - Chalk v4 colorized output
 *   - LOG_LEVEL env var (INFO/WARN/ERROR/DEBUG)
 *   - Module-based color coding
 *   - Detail types with tree connectors (├/└)
 *   - socketEvent() — connect/disconnect log
 *   - actionLog() — handler.process request/response tracking
 *   - boundary() — startup/shutdown banner
 */

const chalk = require('chalk');

// ─── Level Configuration ───
const LEVELS = {
    INFO:    { emoji: '🟢', color: chalk.green,  label: 'INFO ', priority: 1 },
    SUCCESS: { emoji: '✅', color: chalk.green,  label: 'OK   ', priority: 1 },
    WARN:    { emoji: '🟡', color: chalk.yellow, label: 'WARN ', priority: 2 },
    ERROR:   { emoji: '🔴', color: chalk.red,    label: 'ERROR', priority: 3 },
    DEBUG:   { emoji: '🔵', color: chalk.cyan,   label: 'DEBUG', priority: 0 },
};

// ─── Module Configuration ───
const MODULES = {
    AUTH:     { emoji: '🛡️', color: chalk.magenta },   // user verification / enterGame
    SOCKET:   { emoji: '🔌', color: chalk.blue },       // socket connect/disconnect
    HANDLER:  { emoji: '⚙️', color: chalk.yellow },     // handler.process dispatcher
    HERO:     { emoji: '🦸', color: chalk.magenta },    // hero-related handlers
    ITEM:     { emoji: '🎒', color: chalk.cyan },       // item/prop handlers
    TEAM:     { emoji: '👥', color: chalk.green },      // team/squad handlers
    NOTIFY:   { emoji: '📢', color: chalk.yellow },     // push notifications
    SERVER:   { emoji: '🚀', color: chalk.green },      // server startup/shutdown
    DB:       { emoji: '💾', color: chalk.cyan },        // database operations
    TEA:      { emoji: '🔐', color: chalk.magenta },    // TEA verification
    JSON:     { emoji: '📄', color: chalk.blue },       // JSON resource loading
    USER:     { emoji: '👤', color: chalk.white },      // user data operations
};

// ─── Detail Emoji ───
const DETAILS = {
    data:      '📋',
    important: '📌',
    duration:  '⏱️',
    location:  '📍',
    database:  '💾',
    config:    '⚙️',
    request:   '📤',
    response:  '📥',
    session:   '🔗',
    user:      '👤',
    hero:      '🦸',
    item:      '🎒',
};

// ─── Log Level Control ───
const LOG_LEVEL = (process.env.LOG_LEVEL || 'INFO').toUpperCase();
const MIN_PRIORITY = LEVELS[LOG_LEVEL] ? LEVELS[LOG_LEVEL].priority : 1;

// ─── Timestamp ───
function ts() {
    const d = new Date();
    return chalk.gray(
        d.toTimeString().slice(0, 8) + '.' + String(d.getMilliseconds()).padStart(3, '0')
    );
}

// ─── Main log function — header line ───
function log(level, module, message) {
    const lv = LEVELS[level] || LEVELS.INFO;
    if (lv.priority < MIN_PRIORITY) return;

    const md = MODULES[module] || { emoji: '⚪', color: chalk.white };
    const levelStr = lv.color(lv.label);
    const modStr = md.color(module.padEnd(8));

    console.log(
        `${lv.emoji} ${ts()} ${levelStr} ${md.emoji} ${modStr} ▸ ${chalk.white.bold(message)}`
    );
}

// ─── Detail line — single ───
function detail(type, ...pairs) {
    const emoji = DETAILS[type] || DETAILS.data;
    const line = pairs.map(p => `${chalk.dim(p[0])}: ${chalk.white(p[1])}`).join(` ${chalk.dim('·')} `);
    console.log(`  └ ${emoji} ${line}`);
}

// ─── Multi-detail with tree connector ───
function details(type, ...pairs) {
    const emoji = DETAILS[type] || DETAILS.data;
    pairs.forEach((p, i) => {
        const connector = i < pairs.length - 1 ? '├' : '└';
        const line = `${chalk.dim(p[0])}: ${chalk.white(p[1])}`;
        console.log(`  ${connector} ${emoji} ${line}`);
    });
}

// ─── Boundary — startup/shutdown banner ───
function boundary(emoji, message) {
    console.log(`${emoji} ${chalk.magenta.bold('═'.repeat(60))}`);
    console.log(`   ${chalk.white.bold(message)}`);
}

function boundaryEnd(emoji) {
    console.log(`${emoji} ${chalk.magenta.bold('═'.repeat(60))}`);
}

// ─── Socket event log — connect/disconnect ───
function socketEvent(event, socketId, ip, transport, extra) {
    const eventEmojis = {
        connect: '🟢',
        disconnect: '🔴',
        reconnect: '🟡'
    };
    const eEmoji = eventEmojis[event] || '⚪';
    console.log(
        `  ${eEmoji} ${chalk.gray(ts())} ${chalk.blue('SOCKET')} ${chalk.dim(String(socketId).substring(0, 8))} ${chalk.white(event.padEnd(12))} ${chalk.dim('🌐')} ${chalk.white(ip)} ${chalk.dim('📡')} ${chalk.white(transport)}${extra ? '  ' + chalk.dim(extra) : ''}`
    );
}

// ─── Action log — handler.process request/response ───
function actionLog(direction, action, status, duration, detailsStr) {
    const dirEmoji = direction === 'req' ? '📤' : '📥';
    const statusEmoji = status === 'OK' ? '✅' : status === 'ERR' ? '❌' : '⏳';
    const durStr = duration !== null && duration !== undefined ? `${duration}ms` : '─────';
    console.log(
        `  ${dirEmoji} ${chalk.cyan(action.padEnd(24))} ${statusEmoji} ${chalk.white(status.padEnd(6))} ${chalk.dim('⏱️')} ${chalk.white(durStr.padStart(7))}${detailsStr ? '  ' + chalk.dim(detailsStr) : ''}`
    );
}

// ─── Handler registry log ───
function handlerRegistry(registry) {
    const entries = Object.entries(registry);
    entries.forEach(([type, actions], i) => {
        const connector = i < entries.length - 1 ? '├' : '└';
        const actionNames = Object.keys(actions);
        console.log(`  ${connector} ⚙️ ${chalk.cyan('type:')} ${chalk.white(type.padEnd(10))} ${chalk.dim('│')} ${chalk.white(actionNames.length)} action(s)`);
        actionNames.forEach((action, j) => {
            const aConnector = (i < entries.length - 1 ? '│' : ' ') + '  ' + (j < actionNames.length - 1 ? '├' : '└');
            console.log(`  ${aConnector} ${chalk.dim('→')} ${chalk.white(action)}`);
        });
    });
}

module.exports = {
    log,
    detail,
    details,
    boundary,
    boundaryEnd,
    socketEvent,
    actionLog,
    handlerRegistry,
    LEVELS,
    MODULES,
    DETAILS,
    chalk
};
