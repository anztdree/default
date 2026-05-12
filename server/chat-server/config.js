/**
 * config.js — CHAT-SERVER Configuration (v2.0 — Better SQLite)
 *
 * Port: 8002
 * Transport: Socket.IO 2.5.1
 * TEA: ON (key = 'verification')
 * Database: Better SQLite (permanent storage, no retention limit)
 *
 * Trace referensi:
 *   L82537: io.connect(chatServerUrl, { reconnectionAttempts: 10 })
 *   L82579-82587: TEA verify handshake
 */

const path = require('path');

module.exports = {
    port: parseInt(process.env.CHAT_PORT) || 8002,
    host: '0.0.0.0',
    teaKey: 'verification',
    compressionThreshold: 1024,
    server0Time: 25200000,

    // Max chat message content length (server-side validation)
    // Client juga validasi: constant[1].newsWordMax * 2 (byte length)
    maxMessageLength: 500,

    // Chat-Server database (standalone — Better SQLite)
    dbPath: path.join(__dirname, 'data', 'chat_server.db'),

    // Main-Server user data (read-only — untuk baca profil user)
    // Main-server menyimpan: { "user_{userId}": { user: { _nickName, _headImage, ... }, ... } }
    mainServerDataPath: path.join(__dirname, '..', 'main-server', 'data', 'main_server.json')
};
