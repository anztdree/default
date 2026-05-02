/**
 * db.js — SDK Server Database Module
 *
 * Super Warrior Z SDK Server (PPGAME Platform)
 * better-sqlite3 | WAL mode | Prepared statements
 *
 * Tables: users, payment_orders, event_logs
 */

var Database = require('better-sqlite3');
var path = require('path');
var fs = require('fs');
var config = require('./config');

var db = null;

// Prepared statements cache
var stmt = {};

// ============================================================
// INIT
// ============================================================

function init() {
    var dbPath = path.resolve(config.dbFile);
    var dir = path.dirname(dbPath);

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');

    // ============================================================
    // SCHEMA: users
    // ============================================================

    db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            userId TEXT PRIMARY KEY,
            nickName TEXT NOT NULL DEFAULT '',
            sdk TEXT NOT NULL DEFAULT 'ppgame',
            loginToken TEXT,
            sign TEXT,
            securityCode TEXT,
            isGuest INTEGER NOT NULL DEFAULT 0,
            createdAt INTEGER NOT NULL,
            lastLoginAt INTEGER NOT NULL DEFAULT 0
        )
    `);

    // ============================================================
    // SCHEMA: payment_orders
    // ============================================================

    db.exec(`
        CREATE TABLE IF NOT EXISTS payment_orders (
            orderId TEXT PRIMARY KEY,
            userId TEXT NOT NULL,
            productId TEXT,
            productName TEXT,
            price REAL,
            currency TEXT DEFAULT 'USD',
            roleId TEXT,
            roleName TEXT,
            roleLevel INTEGER,
            roleVip INTEGER,
            serverName TEXT,
            status TEXT DEFAULT 'pending',
            createdAt INTEGER NOT NULL,
            completedAt INTEGER
        )
    `);

    // ============================================================
    // SCHEMA: event_logs
    // ============================================================

    db.exec(`
        CREATE TABLE IF NOT EXISTS event_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId TEXT NOT NULL,
            eventType TEXT NOT NULL,
            eventName TEXT DEFAULT '',
            eventData TEXT,
            createdAt INTEGER NOT NULL,
            serverId INTEGER DEFAULT 0
        )
    `);

    db.exec(`
        CREATE INDEX IF NOT EXISTS idx_event_logs_user
        ON event_logs(userId, createdAt DESC)
    `);

    db.exec(`
        CREATE INDEX IF NOT EXISTS idx_event_logs_type
        ON event_logs(eventType, createdAt DESC)
    `);

    // ============================================================
    // PREPARED STATEMENTS
    // ============================================================

    stmt.getUserById = db.prepare(
        'SELECT * FROM users WHERE userId = ?'
    );

    stmt.createUser = db.prepare(
        'INSERT INTO users (userId, nickName, sdk, loginToken, sign, securityCode, isGuest, createdAt, lastLoginAt) ' +
        'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );

    stmt.updateUserToken = db.prepare(
        'UPDATE users SET loginToken = ?, sign = ?, securityCode = ?, lastLoginAt = ? WHERE userId = ?'
    );

    stmt.createPayment = db.prepare(
        'INSERT INTO payment_orders (orderId, userId, productId, productName, price, currency, roleId, roleName, roleLevel, roleVip, serverName, status, createdAt) ' +
        'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );

    stmt.updatePaymentStatus = db.prepare(
        'UPDATE payment_orders SET status = ?, completedAt = ? WHERE orderId = ?'
    );

    stmt.getPaymentById = db.prepare(
        'SELECT * FROM payment_orders WHERE orderId = ?'
    );

    stmt.insertEvent = db.prepare(
        'INSERT INTO event_logs (userId, eventType, eventName, eventData, createdAt, serverId) ' +
        'VALUES (?, ?, ?, ?, ?, ?)'
    );

    stmt.countUsers = db.prepare(
        'SELECT COUNT(*) as count FROM users'
    );

    stmt.getUserInfo = db.prepare(
        'SELECT userId, nickName, sdk, isGuest, lastLoginAt FROM users WHERE userId = ?'
    );

    console.log('[DB] SDK Server DB ready — ' + dbPath);
    return db;
}

// ============================================================
// USER OPERATIONS
// ============================================================

/**
 * Get full user record by userId.
 * Returns the complete user row or undefined.
 */
function getUserById(userId) {
    return stmt.getUserById.get([userId]);
}

/**
 * Create a new user.
 * Returns the result from better-sqlite3 run().
 */
function createUser(userId, nickName, sdk, loginToken, sign, securityCode, isGuest) {
    var now = Date.now();
    return stmt.createUser.run([
        userId,
        nickName || '',
        sdk || 'ppgame',
        loginToken,
        sign,
        securityCode,
        isGuest ? 1 : 0,
        now,
        now
    ]);
}

/**
 * Update user token and login time.
 */
function updateUserToken(loginToken, sign, securityCode, lastLoginAt, userId) {
    return stmt.updateUserToken.run([
        loginToken,
        sign,
        securityCode,
        lastLoginAt,
        userId
    ]);
}

/**
 * Get user info (limited fields) by userId.
 */
function getUserInfo(userId) {
    return stmt.getUserInfo.get([userId]);
}

/**
 * Count total users.
 */
function countUsers() {
    var row = stmt.countUsers.get();
    return row ? row.count : 0;
}

// ============================================================
// PAYMENT OPERATIONS
// ============================================================

/**
 * Create a payment order.
 */
function createPayment(orderId, userId, productId, productName, price, currency, roleId, roleName, roleLevel, roleVip, serverName) {
    var now = Date.now();
    return stmt.createPayment.run([
        orderId,
        userId,
        productId || null,
        productName || null,
        price || 0,
        currency || 'USD',
        roleId || null,
        roleName || null,
        roleLevel || null,
        roleVip || null,
        serverName || null,
        'pending',
        now
    ]);
}

/**
 * Update payment order status.
 */
function updatePaymentStatus(status, completedAt, orderId) {
    return stmt.updatePaymentStatus.run([
        status,
        completedAt,
        orderId
    ]);
}

/**
 * Get payment order by orderId.
 */
function getPaymentById(orderId) {
    return stmt.getPaymentById.get([orderId]);
}

// ============================================================
// EVENT OPERATIONS
// ============================================================

/**
 * Insert an event log entry.
 */
function insertEvent(userId, eventType, eventName, eventData, serverId) {
    var now = Date.now();
    return stmt.insertEvent.run([
        userId,
        eventType,
        eventName || '',
        eventData ? JSON.stringify(eventData) : null,
        now,
        serverId || 0
    ]);
}

// ============================================================
// CLOSE
// ============================================================

function close() {
    if (db) {
        db.close();
        db = null;
    }
}

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
    init: init,
    // User
    getUserById: getUserById,
    createUser: createUser,
    updateUserToken: updateUserToken,
    getUserInfo: getUserInfo,
    countUsers: countUsers,
    // Payment
    createPayment: createPayment,
    updatePaymentStatus: updatePaymentStatus,
    getPaymentById: getPaymentById,
    // Event
    insertEvent: insertEvent,
    // Close
    close: close
};
