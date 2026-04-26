/**
 * login-server/index.js — Entry Point
 *
 * Super Warrior Z Login Server
 * Port: 8000 | Socket.IO 2.5.1 | TANPA TEA
 *
 * DB: MariaDB (1 database global, shared semua server)
 * Init: login-server yang pertama jalan, auto-create tables dari init.sql
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

var http = require('http');
var path = require('path');
var fs = require('fs');
var LZString = require('lz-string');
var crypto = require('crypto');
var mysql = require('mysql2/promise');

var PORT = process.env.PORT || 8000;

// === MariaDB Connection Config ===
var dbConfig = {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || 'root',
    database: process.env.DB_NAME || 'super_warrior_z',
    waitForConnections: true,
    connectionLimit: 50,
    queueLimit: 0,
    charset: 'utf8mb4'
};

// === DB Pool ===
var pool = mysql.createPool(dbConfig);

var db = {
    query: function (sql, params) {
        return pool.execute(sql, params).then(function (r) { return r[0]; });
    },
    queryOne: function (sql, params) {
        return pool.execute(sql, params).then(function (r) {
            var rows = r[0];
            return Array.isArray(rows) ? rows[0] : rows;
        });
    }
};

// === Init Database (run init.sql on first start) ===
function initDatabase() {
    return pool.execute('CREATE DATABASE IF NOT EXISTS `' + dbConfig.database + '` DEFAULT CHARACTER SET utf8mb4 DEFAULT COLLATE utf8mb4_unicode_ci')
        .then(function () { return pool.execute('USE `' + dbConfig.database + '`'); })
        .then(function () {
            var initSqlPath = path.join(__dirname, 'init.sql');
            if (!fs.existsSync(initSqlPath)) return;
            var initSql = fs.readFileSync(initSqlPath, 'utf8');
            var cleaned = initSql.split('\n').filter(function (line) {
                return line.trim().indexOf('--') !== 0;
            }).join('\n');
            var statements = cleaned.split(';').map(function (s) { return s.trim(); }).filter(function (s) { return s.length > 0; });
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
        .then(function () { console.log('[DB] Schema initialized'); return true; })
        .catch(function (err) { console.error('[DB] Init failed:', err.message); return false; });
}

// === Response Builders ===
function buildResponse(data) {
    return {
        ret: 0,
        data: LZString.compressToUTF16(JSON.stringify(data)),
        compress: true,
        serverTime: Date.now(),
        server0Time: Date.now()
    };
}

function buildErrorResponse(errorCode) {
    return {
        ret: errorCode || 1,
        data: '',
        compress: false,
        serverTime: Date.now(),
        server0Time: Date.now()
    };
}

// === Handler Action → File Mapping ===
var actionMap = {
    'loginGame':         path.join(__dirname, 'handlers', 'loginGame'),
    'GetServerList':     path.join(__dirname, 'handlers', 'getServerList'),
    'SaveHistory':       path.join(__dirname, 'handlers', 'saveHistory'),
    'SaveUserEnterInfo': path.join(__dirname, 'handlers', 'saveUserEnterInfo'),
    'SaveLanguage':      path.join(__dirname, 'handlers', 'saveLanguage'),
    'LoginAnnounce':     path.join(__dirname, 'handlers', 'loginAnnounce')
};

var handlers = {};
function loadHandler(action) {
    if (handlers[action]) return handlers[action];
    var modPath = actionMap[action];
    if (!modPath) return null;
    handlers[action] = require(modPath);
    return handlers[action];
}

// === Socket.IO Server ===
var server = http.createServer();
var io = require('socket.io')(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
    transports: ['websocket', 'polling']
});

// === Connection Handler ===
io.on('connection', function (socket) {
    console.log('[LOGIN] Connected: ' + socket.id);

    socket.on('handler.process', function (data, callback) {
        if (!callback || typeof callback !== 'function') return;

        var action = data.action;
        if (!action || !actionMap[action]) {
            console.warn('[LOGIN] Unknown action: ' + action);
            return callback(buildErrorResponse(1));
        }

        var handler = loadHandler(action);
        if (!handler) return callback(buildErrorResponse(1));

        var ctx = {
            db: db,
            buildResponse: buildResponse,
            buildErrorResponse: buildErrorResponse,
            crypto: crypto
        };

        handler.execute(data, socket, ctx)
            .then(function (result) { callback(result); })
            .catch(function (err) {
                console.error('[LOGIN] Handler error [' + action + ']:', err.message);
                callback(buildErrorResponse(err.code || 1));
            });
    });

    socket.on('disconnect', function () {
        console.log('[LOGIN] Disconnected: ' + socket.id);
    });
});

// === Start ===
initDatabase().then(function () {
    server.listen(PORT, function () {
        console.log('========================================');
        console.log('  Super Warrior Z — Login Server');
        console.log('  Port: ' + PORT);
        console.log('  Socket.IO: 2.5.1 | TEA: OFF');
        console.log('  DB: ' + dbConfig.host + ':' + dbConfig.port + '/' + dbConfig.database);
        console.log('========================================');
    });
}).catch(function () {
    server.listen(PORT, function () {
        console.log('[LOGIN] Started on port ' + PORT + ' (DB not ready)');
    });
});
