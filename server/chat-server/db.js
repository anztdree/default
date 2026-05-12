/**
 * db.js — Chat-Server Database (Better SQLite)
 *
 * Standalone database untuk chat-server.
 * - User profile cache (sync dari main_server.json saat login)
 * - Pesan chat permanen (tanpa batas waktu)
 *
 * STRICT RULES: NO STUB, OVERRIDE, FORCE, BYPASS, DUMMY, ASUMSI
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const config = require('./config');

class ChatDB {
    constructor() {
        // ─── Ensure data directory exists ───
        const dataDir = path.dirname(config.dbPath);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        // ─── Open database ───
        this.db = new Database(config.dbPath);
        this.db.pragma('journal_mode = WAL');       // Better concurrent read performance
        this.db.pragma('synchronous = NORMAL');     // Good balance of safety/speed

        this._initSchema();
        this._prepareStatements();

        console.log(`[DB] Chat database ready: ${config.dbPath}`);
        console.log(`[DB] Main-server data path: ${config.mainServerDataPath}`);
    }

    // ═══════════════════════════════════════════════════════════════
    // SCHEMA
    // ═══════════════════════════════════════════════════════════════

    _initSchema() {
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS users (
                user_id     TEXT PRIMARY KEY,
                server_id   INTEGER NOT NULL DEFAULT 1,
                nick_name   TEXT NOT NULL DEFAULT '',
                head_image  TEXT NOT NULL DEFAULT '',
                head_effect INTEGER NOT NULL DEFAULT 0,
                head_box    INTEGER NOT NULL DEFAULT 0,
                ori_server_id INTEGER NOT NULL DEFAULT 0,
                vip_level   INTEGER NOT NULL DEFAULT 0,
                level       INTEGER NOT NULL DEFAULT 1,
                updated_at  INTEGER NOT NULL
            );

            CREATE TABLE IF NOT EXISTS messages (
                id           INTEGER PRIMARY KEY AUTOINCREMENT,
                room_id      TEXT NOT NULL,
                user_id      TEXT NOT NULL,
                kind         INTEGER NOT NULL DEFAULT 2,
                content      TEXT NOT NULL DEFAULT '',
                msg_type     INTEGER NOT NULL DEFAULT 0,
                param        TEXT,
                server_time  INTEGER NOT NULL,
                nick_name    TEXT NOT NULL DEFAULT '',
                head_image   TEXT NOT NULL DEFAULT '',
                head_effect  INTEGER NOT NULL DEFAULT 0,
                head_box     INTEGER NOT NULL DEFAULT 0,
                ori_server_id INTEGER NOT NULL DEFAULT 0,
                server_id    INTEGER NOT NULL DEFAULT 0,
                show_main    INTEGER NOT NULL DEFAULT 0,
                created_at   INTEGER NOT NULL DEFAULT 0
            );

            CREATE INDEX IF NOT EXISTS idx_msg_room_time
                ON messages(room_id, server_time DESC);

            CREATE TABLE IF NOT EXISTS config (
                key   TEXT PRIMARY KEY,
                value TEXT NOT NULL
            );
        `);
    }

    // ═══════════════════════════════════════════════════════════════
    // PREPARED STATEMENTS
    // ═══════════════════════════════════════════════════════════════

    _prepareStatements() {
        this.stmt = {
            upsertUser: this.db.prepare(`
                INSERT INTO users (user_id, server_id, nick_name, head_image, head_effect, head_box, ori_server_id, vip_level, level, updated_at)
                VALUES (@userId, @serverId, @nickName, @headImage, @headEffect, @headBox, @oriServerId, @vipLevel, @level, @updatedAt)
                ON CONFLICT(user_id) DO UPDATE SET
                    server_id    = @serverId,
                    nick_name    = @nickName,
                    head_image   = @headImage,
                    head_effect  = @headEffect,
                    head_box     = @headBox,
                    ori_server_id = @oriServerId,
                    vip_level    = @vipLevel,
                    level        = @level,
                    updated_at   = @updatedAt
            `),

            getUser: this.db.prepare(
                `SELECT * FROM users WHERE user_id = ?`
            ),

            insertMsg: this.db.prepare(`
                INSERT INTO messages (room_id, user_id, kind, content, msg_type, param, server_time, nick_name, head_image, head_effect, head_box, ori_server_id, server_id, show_main, created_at)
                VALUES (@roomId, @userId, @kind, @content, @msgType, @param, @time, @name, @image, @headEffect, @headBox, @oriServerId, @serverId, @showMain, @createdAt)
            `),

            getRoomMsgs: this.db.prepare(
                `SELECT * FROM messages WHERE room_id = ? ORDER BY server_time ASC LIMIT 200`
            ),

            getMsgsSince: this.db.prepare(
                `SELECT * FROM messages WHERE room_id = ? AND server_time > ? ORDER BY server_time ASC`
            ),

            getConfig: this.db.prepare(
                `SELECT value FROM config WHERE key = ?`
            ),

            setConfig: this.db.prepare(
                `INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)`
            )
        };
    }

    // ═══════════════════════════════════════════════════════════════
    // USER PROFILE
    // ═══════════════════════════════════════════════════════════════

    /**
     * Baca profil user dari main_server.json (main-server data).
     *
     * Main-server (db.js) menyimpan data per-user dengan key "user_{userId}".
     * Nilainya adalah objek userData yang berisi sub-objek "user" dengan field:
     *   _id, _nickName, _headImage, _oriServerId, _level, _vipLevel, dll.
     *
     * @param {string} userId
     * @returns {Object|null} — profil user atau null jika tidak ditemukan
     */
    readFromMainServer(userId) {
        try {
            if (!fs.existsSync(config.mainServerDataPath)) {
                return null;
            }

            const raw = fs.readFileSync(config.mainServerDataPath, 'utf-8');
            const data = JSON.parse(raw);
            const key = 'user_' + userId;
            const record = data[key];

            if (!record || !record.user) {
                return null;
            }

            const u = record.user;

            return {
                userId:     u._id || userId,
                serverId:   u._serverId || 1,
                nickName:   u._nickName || '',
                headImage:  u._headImage || '',
                headEffect: (typeof u._headEffect === 'number') ? u._headEffect : 0,
                headBox:    (typeof u._headBox === 'number') ? u._headBox : 0,
                oriServerId: u._oriServerId || 0,
                vipLevel:   u._vipLevel || 0,
                level:      u._level || 1
            };
        } catch (err) {
            console.error(`[DB] readFromMainServer(${userId}) error: ${err.message}`);
            return null;
        }
    }

    /**
     * Get cached user profile dari SQLite.
     * @param {string} userId
     * @returns {Object|undefined}
     */
    getUser(userId) {
        return this.stmt.getUser.get(userId);
    }

    /**
     * Insert atau update user profile di SQLite cache.
     * Dipanggil setiap chat::login agar profil selalu fresh.
     * @param {Object} profile — objek profil (dari readFromMainServer atau default)
     */
    syncUser(profile) {
        this.stmt.upsertUser.run({
            userId:      profile.userId,
            serverId:    profile.serverId || 1,
            nickName:    profile.nickName || '',
            headImage:   profile.headImage || '',
            headEffect:  profile.headEffect || 0,
            headBox:     profile.headBox || 0,
            oriServerId: profile.oriServerId || 0,
            vipLevel:    profile.vipLevel || 0,
            level:       profile.level || 1,
            updatedAt:   Date.now()
        });
    }

    // ═══════════════════════════════════════════════════════════════
    // MESSAGES (permanen — tanpa retention limit)
    // ═══════════════════════════════════════════════════════════════

    /**
     * Simpan pesan secara permanen ke SQLite.
     *
     * @param {Object} msg — msgObj dengan semua field ChatDataBaseClass.getData:
     *   _time, _kind, _name, _content, _id, _image, _param, _type,
     *   _headEffect, _headBox, _oriServerId, _serverId, _showMain
     * @param {string} roomId — room identifier
     */
    storeMessage(msg, roomId) {
        this.stmt.insertMsg.run({
            roomId:      roomId,
            userId:      msg._id,
            kind:        msg._kind || 0,
            content:     msg._content || '',
            msgType:     msg._type != null ? msg._type : 0,
            param:       msg._param != null ? JSON.stringify(msg._param) : null,
            time:        msg._time,
            name:        msg._name || '',
            image:       msg._image || '',
            headEffect:  msg._headEffect || 0,
            headBox:     msg._headBox || 0,
            oriServerId: msg._oriServerId || 0,
            serverId:    msg._serverId || 0,
            showMain:    msg._showMain ? 1 : 0,
            createdAt:   Date.now()
        });
    }

    /**
     * Get semua pesan untuk sebuah room (max 200, oldest-first).
     * Digunakan oleh chat::joinRoom → response {_record}.
     *
     * @param {string} roomId
     * @returns {Array<Object>} — array of msgObj
     */
    getRoomMessages(roomId) {
        return this.stmt.getRoomMsgs.all(roomId).map(row => this._rowToMsg(row));
    }

    /**
     * Get pesan setelah timestamp tertentu.
     * Digunakan oleh chat::getRecord → response {_record}.
     *
     * @param {string} roomId
     * @param {number} sinceTime — server timestamp (miliseconds)
     * @returns {Array<Object>} — array of msgObj
     */
    getMessagesSince(roomId, sinceTime) {
        return this.stmt.getMsgsSince.all(roomId, sinceTime).map(row => this._rowToMsg(row));
    }

    /**
     * Convert DB row ke msgObj format.
     * Field names mengikuti ChatDataBaseClass.getData (L92098-92110):
     *   _time, _kind, _name, _content, _id, _image, _param, _type,
     *   _headEffect, _headBox, _oriServerId, _serverId, _showMain
     *
     * CATATAN: Field di Notify adalah `_headBox`, bukan `_headBoxId`.
     *   ChatDataBaseClass.getData menamainya `_headBoxId` saat copy,
     *   tapi server mengirim sebagai `_headBox`.
     */
    _rowToMsg(row) {
        return {
            _time:        row.server_time,
            _kind:        row.kind,
            _name:        row.nick_name,
            _content:     row.content,
            _id:          row.user_id,
            _image:       row.head_image,
            _param:       row.param !== null ? this._safeParseParam(row.param) : null,
            _type:        row.msg_type,
            _headEffect:  row.head_effect,
            _headBox:     row.head_box,
            _oriServerId: row.ori_server_id,
            _serverId:    row.server_id,
            _showMain:    row.show_main === 1
        };
    }

    /**
     * Parse param dari JSON string.
     * Jika parse gagal, return raw string.
     */
    _safeParseParam(str) {
        try {
            return JSON.parse(str);
        } catch {
            return str;
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // CONFIG
    // ═══════════════════════════════════════════════════════════════

    getConfig(key) {
        const row = this.stmt.getConfig.get(key);
        return row ? row.value : null;
    }

    setConfig(key, value) {
        this.stmt.setConfig.run(key, String(value));
    }

    // ═══════════════════════════════════════════════════════════════
    // LIFECYCLE
    // ═══════════════════════════════════════════════════════════════

    close() {
        this.db.close();
    }
}

module.exports = new ChatDB();
