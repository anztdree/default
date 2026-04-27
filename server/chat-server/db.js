/**
 * db.js — Chat Server Database
 *
 * 3 SQLite connections:
 *   1. dbChat   — Chat server own data (messages, rooms)
 *   2. dbLogin  — Login server DB (READ-ONLY, userId verification)
 *   3. dbMain   — Main server DB (READ-ONLY, user profile)
 *
 * All columns camelCase (matching client field names exactly)
 */

var Database = require('better-sqlite3');
var path = require('path');
var fs = require('fs');
var config = require('./config');

var dbChat = null;
var dbLogin = null;
var dbMain = null;

// ============================================================
// INIT: Chat Server DB
// ============================================================

function initChatDb() {
    var dbPath = path.resolve(config.dbFile);
    var dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    dbChat = new Database(dbPath);
    dbChat.pragma('journal_mode = WAL');
    dbChat.pragma('foreign_keys = ON');

    // ============================================================
    // SCHEMA: chat_messages — all chat messages
    // ============================================================
    //
    // Maps directly to ChatDataBaseClass fields (client line 92110):
    //   _time, _kind, _name, _content, _id, _image, _param, _type,
    //   _headEffect, _headBox, _oriServerId, _serverId, _showMain
    //
    // Field reference from client code analysis:
    //   sendMsg request:  userId, kind, content, msgType, param, roomId
    //   Notify broadcast:  { _msg: { _time, _kind, _name, _content, _id,
    //                     _image, _param, _type, _headEffect, _headBox,
    //                     _oriServerId, _serverId, _showMain } }
    //   joinRoom response: { _record: [ { _time, _kind, ... } ] }
    //   getRecord response: { _record: [ { _time, _kind, ... } ] }

    dbChat.exec(`
        CREATE TABLE IF NOT EXISTS chat_messages (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            roomId          TEXT    NOT NULL,
            userId          TEXT    NOT NULL,
            kind            INTEGER NOT NULL DEFAULT 2,
            content         TEXT    NOT NULL DEFAULT '',
            msgType         INTEGER,
            param           TEXT,
            senderName      TEXT    NOT NULL DEFAULT '',
            senderImage     TEXT    NOT NULL DEFAULT '',
            headEffect      TEXT,
            headBox         INTEGER,
            oriServerId     INTEGER NOT NULL DEFAULT 0,
            serverId        INTEGER NOT NULL DEFAULT 1,
            showMain        INTEGER NOT NULL DEFAULT 0,
            createdAt       INTEGER NOT NULL
        )
    `);

    dbChat.exec(`
        CREATE INDEX IF NOT EXISTS idx_chat_messages_room_time
        ON chat_messages(roomId, createdAt DESC)
    `);

    dbChat.exec(`
        CREATE INDEX IF NOT EXISTS idx_chat_messages_user
        ON chat_messages(userId, createdAt DESC)
    `);

    console.log('[DB] Chat DB ready — ' + dbPath);
    return dbChat;
}

// ============================================================
// INIT: Login Server DB (READ-ONLY)
// ============================================================

function initLoginDb() {
    var dbPath = path.resolve(config.loginDbFile);

    if (!fs.existsSync(dbPath)) {
        console.warn('[DB] Login DB not found: ' + dbPath);
        console.warn('[DB] Chat-server will run WITHOUT user verification');
        return null;
    }

    try {
        dbLogin = new Database(dbPath, { readonly: true, fileMustExist: true });
        dbLogin.pragma('journal_mode = WAL');
        console.log('[DB] Login DB connected (READ-ONLY) — ' + dbPath);
        return dbLogin;
    } catch (err) {
        console.warn('[DB] Cannot open login DB: ' + err.message);
        console.warn('[DB] Chat-server will run WITHOUT user verification');
        return null;
    }
}

// ============================================================
// INIT: Main Server DB (READ-ONLY — user profile)
// ============================================================

function initMainDb() {
    var dbPath = path.resolve(config.mainDbFile);

    if (!fs.existsSync(dbPath)) {
        console.warn('[DB] Main DB not found: ' + dbPath);
        console.warn('[DB] Chat-server will use default user info');
        return null;
    }

    try {
        dbMain = new Database(dbPath, { readonly: true, fileMustExist: true });
        dbMain.pragma('journal_mode = WAL');
        console.log('[DB] Main DB connected (READ-ONLY) — ' + dbPath);
        return dbMain;
    } catch (err) {
        console.warn('[DB] Cannot open main DB: ' + err.message);
        console.warn('[DB] Chat-server will use default user info');
        return null;
    }
}

// ============================================================
// INIT ALL
// ============================================================

function init() {
    initChatDb();
    initLoginDb();
    initMainDb();
}

// ============================================================
// USER VERIFICATION (login DB)
// ============================================================

/**
 * Verify user exists in login DB.
 * Returns { userId, nickName } or null.
 * Column names in login DB schema: userId (camelCase)
 */
function verifyUser(userId) {
    if (!dbLogin || !userId) return null;

    try {
        var row = dbLogin.prepare(
            'SELECT userId, nickName FROM users WHERE userId = ?'
        ).get([userId]);
        return row || null;
    } catch (e) {
        return null;
    }
}

// ============================================================
// USER PROFILE (main DB)
// ============================================================

/**
 * Get user profile from main DB for chat message sender info.
 * Main DB users table: nickName, headImage (line 42-43 of main-server/db.js)
 * Returns { nickName, headImage } or defaults.
 */
function getUserProfile(userId) {
    var defaults = { nickName: 'Player', headImage: 'hero_icon_1205' };

    if (!dbMain || !userId) return defaults;

    try {
        var row = dbMain.prepare(
            'SELECT nickName, headImage FROM users WHERE userId = ?'
        ).get([userId]);
        if (row) {
            return {
                nickName: row.nickName || defaults.nickName,
                headImage: row.headImage || defaults.headImage
            };
        }
    } catch (e) {
        // fallback
    }

    // Fallback: try login DB for nickName
    if (dbLogin) {
        try {
            var loginRow = dbLogin.prepare(
                'SELECT nickName FROM users WHERE userId = ?'
            ).get([userId]);
            if (loginRow) {
                defaults.nickName = loginRow.nickName || defaults.nickName;
            }
        } catch (e) {
            // fallback
        }
    }

    return defaults;
}

// ============================================================
// CHAT MESSAGE CRUD
// ============================================================

/**
 * Save a chat message to DB.
 * Returns the message object with id and createdAt.
 */
function saveMessage(msg) {
    var now = Date.now();
    var result = dbChat.prepare(
        'INSERT INTO chat_messages ' +
        '(roomId, userId, kind, content, msgType, param, ' +
        'senderName, senderImage, headEffect, headBox, ' +
        'oriServerId, serverId, showMain, createdAt) ' +
        'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).run([
        msg.roomId,
        msg.userId,
        msg.kind,
        msg.content,
        msg.msgType || null,
        msg.param || null,
        msg.senderName || '',
        msg.senderImage || '',
        msg.headEffect || null,
        msg.headBox || null,
        msg.oriServerId || 0,
        msg.serverId || config.serverId,
        msg.showMain ? 1 : 0,
        now
    ]);

    return {
        _id: msg.userId,
        _time: now,
        _kind: msg.kind,
        _content: msg.content,
        _name: msg.senderName || '',
        _image: msg.senderImage || '',
        _param: msg.param || null,
        _type: msg.msgType || null,
        _headEffect: msg.headEffect || null,
        _headBox: msg.headBox || null,
        _oriServerId: msg.oriServerId || 0,
        _serverId: msg.serverId || config.serverId,
        _showMain: msg.showMain || false
    };
}

/**
 * Get recent messages from a room (for joinRoom response).
 * Returns array of message objects (ChatDataBaseClass format).
 */
function getRecentMessages(roomId, limit) {
    limit = limit || config.maxRecentMessages;
    var rows = dbChat.prepare(
        'SELECT * FROM chat_messages WHERE roomId = ? ORDER BY createdAt DESC LIMIT ?'
    ).all([roomId, limit]);

    // Return oldest first (client expects chronological order)
    return rows.reverse().map(rowToMessage);
}

/**
 * Get messages from a room since a timestamp (for getRecord response).
 * Returns array of message objects (ChatDataBaseClass format).
 */
function getMessagesSince(roomId, startTime) {
    if (!startTime || startTime <= 0) startTime = 0;

    var rows = dbChat.prepare(
        'SELECT * FROM chat_messages WHERE roomId = ? AND createdAt > ? ORDER BY createdAt ASC'
    ).all([roomId, startTime]);

    return rows.map(rowToMessage);
}

/**
 * Cleanup old messages (keep only maxMessagesPerKind per room).
 * Called periodically or when room gets too large.
 */
function cleanupRoom(roomId) {
    var count = dbChat.prepare(
        'SELECT COUNT(*) as cnt FROM chat_messages WHERE roomId = ?'
    ).get([roomId]);

    if (count && count.cnt > config.maxMessagesPerKind) {
        var excess = count.cnt - config.maxMessagesPerKind;
        dbChat.prepare(
            'DELETE FROM chat_messages WHERE roomId = ? AND id IN (' +
            'SELECT id FROM chat_messages WHERE roomId = ? ORDER BY createdAt ASC LIMIT ?' +
            ')'
        ).run([roomId, roomId, excess]);
        return excess;
    }
    return 0;
}

// ============================================================
// INTERNAL: Row → ChatDataBaseClass format
// ============================================================

function rowToMessage(row) {
    return {
        _id: row.userId,
        _time: row.createdAt,
        _kind: row.kind,
        _content: row.content,
        _name: row.senderName,
        _image: row.senderImage,
        _param: row.param ? (typeof row.param === 'string' ? JSON.parse(row.param) : row.param) : null,
        _type: row.msgType,
        _headEffect: row.headEffect ? (typeof row.headEffect === 'string' ? JSON.parse(row.headEffect) : row.headEffect) : null,
        _headBox: row.headBox,
        _oriServerId: row.oriServerId,
        _serverId: row.serverId,
        _showMain: !!row.showMain
    };
}

// ============================================================
// CLOSE
// ============================================================

function close() {
    if (dbChat) { dbChat.close(); dbChat = null; }
    if (dbLogin) { dbLogin.close(); dbLogin = null; }
    if (dbMain) { dbMain.close(); dbMain = null; }
}

module.exports = {
    init: init,
    // User
    verifyUser: verifyUser,
    getUserProfile: getUserProfile,
    // Messages
    saveMessage: saveMessage,
    getRecentMessages: getRecentMessages,
    getMessagesSince: getMessagesSince,
    cleanupRoom: cleanupRoom,
    // Close
    close: close
};
