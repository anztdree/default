/**
 * config.js — Main-Server Configuration
 *
 * Port: 8001
 * TEA: enabled (key: 'verification')
 * DB: better-sqlite3 WAL mode
 * JSON Resource: /var/www/html/resource/json
 */

module.exports = {
    // ─── Server ───
    port: 8001,
    serverId: '1',

    // ─── Database ───
    dbPath: './data/main_server.db',

    // ─── TEA Verification ───
    teaKey: 'verification',
    verifyEnable: true,

    // ─── Response ───
    server0Time: 25200000,  // UTC+7 offset (ms)

    // ─── JSON Resource Path ───
    jsonPath: '/var/www/html/resource/json',

    // ─── Cross-Server URLs ───
    chatServerUrl: 'http://localhost:8002',
    dungeonServerUrl: 'http://localhost:8003',
    sdkServerUrl: 'http://localhost:9999',

    // ─── Chat Room IDs (hardcode — same for all players) ───
    worldRoomId: 'world_1',
    guildRoomId: 'guild_1',             // Hardcode — semua player 1 guild room
    teamDungeonChatRoom: 'teamDungeon_1',
    teamChatRoomId: 'team_1',

    // ─── Client ───
    clientVersion: '1.0',
    reconnectionAttempts: 10,
    maxReconnectWaitTime: 600000  // 10 menit
};
