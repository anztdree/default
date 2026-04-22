/**
 * ============================================================================
 * Database Service — MariaDB Connection Pool
 * Same database as login-server: super_warrior_z
 * ============================================================================
 *
 * Uses the official `mariadb` package (consistent with login-server).
 * Two-phase init:
 *   Phase 1 — connect without DB → CREATE DATABASE IF NOT EXISTS
 *   Phase 2 — connect with DB   → CREATE game tables IF NOT EXISTS
 *
 * Tables managed here (game-specific):
 *   game_users, game_heroes, game_items, game_equips,
 *   game_mails, game_friends, game_guilds, game_guild_members,
 *   game_arena, game_daily_tasks, game_main_tasks,
 *   login_tokens (shared with login-server, read-only here)
 * ============================================================================
 */

var mariadb   = require('mariadb');
var CONSTANTS = require('../config/constants');
var logger    = require('../utils/logger');

var pool  = null;
var ready = false;

// ============================================
// INIT
// ============================================

/**
 * Initialize database — Phase 1 bootstrap + Phase 2 tables
 */
async function init() {
  if (ready) {
    logger.info('DB', 'Already initialized');
    return;
  }

  try {
    await _bootstrapDatabase();
    await _createTables();
    ready = true;
    logger.info('DB', 'Initialized successfully');
  } catch (err) {
    ready = false;
    pool  = null;
    logger.error('DB', 'Init failed: ' + err.message);
    throw err;
  }
}

// ============================================
// PHASE 1 — Bootstrap
// ============================================

async function _bootstrapDatabase() {
  var cfg = CONSTANTS.DB;
  logger.info('DB', 'Phase 1: Connecting to MariaDB at ' + cfg.host + ':' + cfg.port + '...');

  var tmpPool = mariadb.createPool({
    host:             cfg.host,
    port:             cfg.port,
    user:             cfg.user,
    password:         cfg.password,
    connectionLimit:  1,
    connectTimeout:   cfg.connectTimeout,
    acquireTimeout:   cfg.acquireTimeout,
  });

  var conn;
  try {
    conn = await tmpPool.getConnection();
    await conn.query(
      'CREATE DATABASE IF NOT EXISTS `' + cfg.database + '`' +
      ' CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci'
    );
    logger.info('DB', 'Database "' + cfg.database + '" ready');
  } finally {
    if (conn) conn.release();
    try { await tmpPool.end(); } catch (e) { /* ignore */ }
  }
}

// ============================================
// PHASE 2 — Create Tables
// ============================================

async function _createTables() {
  var cfg = CONSTANTS.DB;
  logger.info('DB', 'Phase 2: Creating tables...');

  pool = mariadb.createPool({
    host:             cfg.host,
    port:             cfg.port,
    user:             cfg.user,
    password:         cfg.password,
    database:         cfg.database,
    connectionLimit:  cfg.connectionLimit,
    connectTimeout:   cfg.connectTimeout,
    acquireTimeout:   cfg.acquireTimeout,
  });

  var conn;
  try {
    conn = await pool.getConnection();
    await conn.query('SELECT 1 AS test');

    // ------------------------------------------
    // game_users — core player data
    // ------------------------------------------
    await conn.query(`
      CREATE TABLE IF NOT EXISTS game_users (
        id              INT AUTO_INCREMENT PRIMARY KEY,
        user_id         VARCHAR(64)  NOT NULL UNIQUE,
        nick_name       VARCHAR(64)  NOT NULL DEFAULT '',
        head_image      VARCHAR(256) NOT NULL DEFAULT '',
        level           INT          NOT NULL DEFAULT 1,
        exp             BIGINT       NOT NULL DEFAULT 0,
        vip_level       INT          NOT NULL DEFAULT 0,
        vip_exp         BIGINT       NOT NULL DEFAULT 0,
        gold            BIGINT       NOT NULL DEFAULT 0,
        diamond         BIGINT       NOT NULL DEFAULT 0,
        stamina         INT          NOT NULL DEFAULT 120,
        stamina_last_recover_time BIGINT NOT NULL DEFAULT 0,
        from_channel    VARCHAR(64)  NOT NULL DEFAULT '',
        channel_code    VARCHAR(64)  NOT NULL DEFAULT '',
        ori_server_id   INT          NOT NULL DEFAULT 1,
        last_login_time BIGINT       NOT NULL DEFAULT 0,
        create_time     BIGINT       NOT NULL DEFAULT 0,
        is_new          TINYINT(1)   NOT NULL DEFAULT 1,
        data_json       MEDIUMTEXT   DEFAULT NULL,
        INDEX idx_user_id (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    logger.info('DB', 'Table game_users OK');

    // ------------------------------------------
    // game_heroes — hero collection
    // ------------------------------------------
    await conn.query(`
      CREATE TABLE IF NOT EXISTS game_heroes (
        id              INT AUTO_INCREMENT PRIMARY KEY,
        user_id         VARCHAR(64)  NOT NULL,
        hero_id         VARCHAR(64)  NOT NULL UNIQUE,
        hero_display_id INT          NOT NULL DEFAULT 0,
        data_json       MEDIUMTEXT   NOT NULL DEFAULT '{}',
        create_time     BIGINT       NOT NULL DEFAULT 0,
        INDEX idx_user_id (user_id),
        INDEX idx_hero_id (hero_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    logger.info('DB', 'Table game_heroes OK');

    // ------------------------------------------
    // game_items — backpack items
    // ------------------------------------------
    await conn.query(`
      CREATE TABLE IF NOT EXISTS game_items (
        id        INT AUTO_INCREMENT PRIMARY KEY,
        user_id   VARCHAR(64) NOT NULL,
        item_id   INT         NOT NULL DEFAULT 0,
        num       BIGINT      NOT NULL DEFAULT 0,
        UNIQUE KEY uk_user_item (user_id, item_id),
        INDEX idx_user_id (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    logger.info('DB', 'Table game_items OK');

    // ------------------------------------------
    // game_equips — equipment
    // ------------------------------------------
    await conn.query(`
      CREATE TABLE IF NOT EXISTS game_equips (
        id          INT AUTO_INCREMENT PRIMARY KEY,
        user_id     VARCHAR(64) NOT NULL,
        equip_id    VARCHAR(64) NOT NULL UNIQUE,
        data_json   MEDIUMTEXT  NOT NULL DEFAULT '{}',
        create_time BIGINT      NOT NULL DEFAULT 0,
        INDEX idx_user_id (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    logger.info('DB', 'Table game_equips OK');

    // ------------------------------------------
    // game_mails — in-game mail
    // ------------------------------------------
    await conn.query(`
      CREATE TABLE IF NOT EXISTS game_mails (
        id          INT AUTO_INCREMENT PRIMARY KEY,
        user_id     VARCHAR(64) NOT NULL,
        mail_id     VARCHAR(64) NOT NULL UNIQUE,
        title       VARCHAR(128) NOT NULL DEFAULT '',
        content     TEXT         NOT NULL DEFAULT '',
        items_json  TEXT         NOT NULL DEFAULT '[]',
        is_read     TINYINT(1)   NOT NULL DEFAULT 0,
        is_received TINYINT(1)   NOT NULL DEFAULT 0,
        expire_time BIGINT       NOT NULL DEFAULT 0,
        create_time BIGINT       NOT NULL DEFAULT 0,
        INDEX idx_user_id (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    logger.info('DB', 'Table game_mails OK');

    // ------------------------------------------
    // game_daily_tasks — daily quest progress
    // ------------------------------------------
    await conn.query(`
      CREATE TABLE IF NOT EXISTS game_daily_tasks (
        id          INT AUTO_INCREMENT PRIMARY KEY,
        user_id     VARCHAR(64) NOT NULL,
        task_date   DATE        NOT NULL,
        data_json   MEDIUMTEXT  NOT NULL DEFAULT '{}',
        UNIQUE KEY uk_user_date (user_id, task_date),
        INDEX idx_user_id (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    logger.info('DB', 'Table game_daily_tasks OK');

    // ------------------------------------------
    // game_main_tasks — main quest progress
    // ------------------------------------------
    await conn.query(`
      CREATE TABLE IF NOT EXISTS game_main_tasks (
        id        INT AUTO_INCREMENT PRIMARY KEY,
        user_id   VARCHAR(64) NOT NULL UNIQUE,
        data_json MEDIUMTEXT  NOT NULL DEFAULT '{}',
        INDEX idx_user_id (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    logger.info('DB', 'Table game_main_tasks OK');

    // ------------------------------------------
    // game_arena — arena ranking
    // ------------------------------------------
    await conn.query(`
      CREATE TABLE IF NOT EXISTS game_arena (
        id            INT AUTO_INCREMENT PRIMARY KEY,
        user_id       VARCHAR(64) NOT NULL UNIQUE,
        rank          INT         NOT NULL DEFAULT 9999,
        win_count     INT         NOT NULL DEFAULT 0,
        lose_count    INT         NOT NULL DEFAULT 0,
        defence_team  TEXT        DEFAULT NULL,
        last_fight_time BIGINT    NOT NULL DEFAULT 0,
        INDEX idx_rank (rank)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    logger.info('DB', 'Table game_arena OK');

    // ------------------------------------------
    // game_guilds — guild data
    // ------------------------------------------
    await conn.query(`
      CREATE TABLE IF NOT EXISTS game_guilds (
        id           INT AUTO_INCREMENT PRIMARY KEY,
        guild_id     VARCHAR(64)  NOT NULL UNIQUE,
        name         VARCHAR(64)  NOT NULL DEFAULT '',
        leader_id    VARCHAR(64)  NOT NULL DEFAULT '',
        level        INT          NOT NULL DEFAULT 1,
        exp          BIGINT       NOT NULL DEFAULT 0,
        notice       VARCHAR(256) NOT NULL DEFAULT '',
        member_count INT          NOT NULL DEFAULT 1,
        create_time  BIGINT       NOT NULL DEFAULT 0,
        data_json    MEDIUMTEXT   DEFAULT NULL,
        INDEX idx_guild_id (guild_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    logger.info('DB', 'Table game_guilds OK');

    // ------------------------------------------
    // game_guild_members
    // ------------------------------------------
    await conn.query(`
      CREATE TABLE IF NOT EXISTS game_guild_members (
        id        INT AUTO_INCREMENT PRIMARY KEY,
        guild_id  VARCHAR(64) NOT NULL,
        user_id   VARCHAR(64) NOT NULL,
        role      TINYINT     NOT NULL DEFAULT 3,
        join_time BIGINT      NOT NULL DEFAULT 0,
        UNIQUE KEY uk_user_guild (user_id, guild_id),
        INDEX idx_guild_id (guild_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    logger.info('DB', 'Table game_guild_members OK');

    // ------------------------------------------
    // _schema_meta — version tracking
    // ------------------------------------------
    await conn.query(`
      CREATE TABLE IF NOT EXISTS _schema_meta (
        key_name   VARCHAR(64)  NOT NULL PRIMARY KEY,
        key_value  VARCHAR(256) NOT NULL,
        updated_at BIGINT       NOT NULL DEFAULT 0
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    await conn.query(
      'INSERT INTO _schema_meta (key_name, key_value, updated_at) VALUES (?, ?, ?)' +
      ' ON DUPLICATE KEY UPDATE key_value = ?, updated_at = ?',
      ['schema_version', '1.0', Date.now(), '1.0', Date.now()]
    );

    logger.info('DB', 'All tables created');

  } finally {
    if (conn) conn.release();
  }
}

// ============================================
// QUERY HELPERS
// ============================================

/**
 * Execute query, returns all rows
 * @param {string} sql
 * @param {Array}  [params]
 * @returns {Promise<Array>}
 */
async function query(sql, params) {
  if (!pool || !ready) throw new Error('Database not initialized');
  var conn;
  try {
    conn = await pool.getConnection();
    return await conn.query(sql, params || []);
  } catch (err) {
    logger.error('DB', 'Query error: ' + err.message);
    throw err;
  } finally {
    if (conn) conn.release();
  }
}

/**
 * Execute query, returns first row or null
 * @param {string} sql
 * @param {Array}  [params]
 * @returns {Promise<object|null>}
 */
async function queryOne(sql, params) {
  var rows = await query(sql, params);
  return (rows && rows.length > 0) ? rows[0] : null;
}

/**
 * Get a raw connection for transactions
 * @returns {Promise<Connection>}
 */
async function getConnection() {
  if (!pool || !ready) throw new Error('Database not initialized');
  return pool.getConnection();
}

// ============================================
// HEALTH
// ============================================

function isReady() {
  return ready;
}

// ============================================
// CLOSE
// ============================================

async function close() {
  if (!pool) { ready = false; return; }
  logger.info('DB', 'Closing pool...');
  ready = false;
  try {
    await pool.end();
    pool = null;
    logger.info('DB', 'Pool closed');
  } catch (err) {
    logger.error('DB', 'Close error: ' + err.message);
    pool = null;
  }
}

// ============================================
// EXPORT
// ============================================

module.exports = {
  init:          init,
  query:         query,
  queryOne:      queryOne,
  getConnection: getConnection,
  isReady:       isReady,
  close:         close,
};
