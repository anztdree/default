/**
 * config.js — Chat Server Environment Configuration
 *
 * Super Warrior Z Chat Server
 * Port: 8002 | Socket.IO 2.5.1 | TEA: ON (key='verification')
 */

require('dotenv').config();

var config = {
    port: parseInt(process.env.PORT) || 8002,

    // Chat server own DB (chat messages)
    dbFile: process.env.DB_FILE || './data/chat_server.db',

    // Login server DB (READ-ONLY — userId verification)
    loginDbFile: process.env.LOGIN_DB_FILE || '../login-server/data/super_warrior_z.db',

    // Main server DB (READ-ONLY — user profile: nickName, headImage)
    mainDbFile: process.env.MAIN_DB_FILE || '../main-server/data/main_server.db',

    // Server meta
    serverId: parseInt(process.env.SERVER_ID) || 1,

    // Chat limits
    maxRecentMessages: 30,     // messages returned on joinRoom
    chatCooldownMs: 3000,      // cooldown between messages (36001 error)
    maxMessagesPerKind: 200,   // max stored messages per room before cleanup

    // Default room IDs (fallback if not provided by registChat)
    defaultWorldRoomId: 'room_1'
};

module.exports = config;
