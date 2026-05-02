/**
 * config.js — SDK Server Configuration
 *
 * Super Warrior Z SDK Server (PPGAME Platform)
 * Port: 9999 | Express.js | better-sqlite3
 */

var path = require('path');

module.exports = {
    port: 9999,
    host: '0.0.0.0',
    dbFile: path.join(__dirname, 'data', 'sdk_server.db'),
    secretKey: 'SUPER_WARRIOR_Z_SDK_SECRET_2026',
    tokenExpiry: 86400000,       // 24 jam (ms)
    guestPrefix: 'guest_',
    guestIdLength: 8,            // hex chars for guest userId
    guestNickLength: 4           // hex chars for guest nickName
};
