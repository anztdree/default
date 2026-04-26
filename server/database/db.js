/**
 * database/db.js — MariaDB Shared Database Module (Factory)
 *
 * Tidak require mysql2 langsung.
 * Menerima mysql2 driver + config dari pemanggil (index.js).
 * Digunakan oleh: login-server, main-server, chat-server, dungeon-server
 *
 * Export: function(mysql, config) → { query, queryOne, initDatabase, pool }
 */

function createDB(mysql, config) {
    var pool = mysql.createPool(config);

    function query(sql, params) {
        return pool.execute(sql, params).then(function (result) {
            return result[0];
        });
    }

    function queryOne(sql, params) {
        return query(sql, params).then(function (rows) {
            return Array.isArray(rows) ? rows[0] : rows;
        });
    }

    function initDatabase() {
        var fs = require('fs');
        var path = require('path');

        return pool.execute('CREATE DATABASE IF NOT EXISTS `' + config.database + '` DEFAULT CHARACTER SET utf8mb4 DEFAULT COLLATE utf8mb4_unicode_ci')
            .then(function () {
                return pool.execute('USE `' + config.database + '`');
            })
            .then(function () {
                var initSqlPath = path.join(__dirname, 'init.sql');
                if (!fs.existsSync(initSqlPath)) {
                    console.log('[DB] init.sql not found, skipping');
                    return;
                }
                var initSql = fs.readFileSync(initSqlPath, 'utf8');
                // Hapus semua baris komentar (-- ...) dulu, baru split
                var cleaned = initSql
                    .split('\n')
                    .filter(function (line) { return line.trim().indexOf('--') !== 0; })
                    .join('\n');
                var statements = cleaned
                    .split(';')
                    .map(function (s) { return s.trim(); })
                    .filter(function (s) { return s.length > 0; });

                var chain = Promise.resolve();
                statements.forEach(function (stmt) {
                    chain = chain.then(function () {
                        return pool.execute(stmt).catch(function (err) {
                            if (err.message.indexOf('Duplicate') === -1 && err.message.indexOf('already exists') === -1) {
                                console.warn('[DB] Init warning:', err.message);
                            }
                        });
                    });
                });
                return chain;
            })
            .then(function () {
                console.log('[DB] Schema initialized');
                return true;
            })
            .catch(function (err) {
                console.error('[DB] Init failed:', err.message);
                return false;
            });
    }

    return {
        pool: pool,
        query: query,
        queryOne: queryOne,
        initDatabase: initDatabase
    };
}

module.exports = createDB;
