/**
 * index.js — Chat Server Entry Point
 *
 * Super Warrior Z Chat Server
 * Port: 8002 | Socket.IO 2.5.1 | TEA: ON (key='verification')
 *
 * Architecture:
 *   - Separate Socket.IO server from main-server (line 113445)
 *   - TSSocketClient('chat-server', true) — verifyEnable = true
 *   - Same TEA verify handshake as main-server (line 82579-82587)
 *   - handler.process for request/response (line 82528)
 *   - 'Notify' event for push messages (line 82522)
 *
 * Chat Actions:
 *   login     — verify user, create session
 *   joinRoom  — join chat room, return recent messages
 *   leaveRoom — leave chat room
 *   sendMsg   — send message, broadcast via Notify, return _time
 *   getRecord — get messages since timestamp
 *
 * Response format (processHandlerWithChat, line 113885):
 *   { ret: 0, data: LZString.compressToUTF16(JSON.stringify(data)), compress: true }
 *
 * Notify format (startChatListenNotify, line 114241):
 *   { ret: 'SUCCESS', data: LZString.compressToUTF16(JSON.stringify({ _msg: msgData })), compress: true }
 *
 * Session-based table logging with emoji indicators
 */

var http = require('http');
var path = require('path');
var crypto = require('crypto');
var LZString = require('lz-string');

var config = require('./config');
var db = require('./db');
var tea = require('./tea');

// ============================================================
// TABLE LAYOUT (v3 — same as main-server)
// ============================================================

var TW = 100;
var COL = {
    TIME: 14, IDX: 3, DIR: 4, ACT: 18, STS: 10, MS: 6, DET: 0
};
COL.DET = TW - 8 - COL.TIME - COL.IDX - COL.DIR - COL.ACT - COL.STS - COL.MS;

var ALL_ACTIONS = ['login', 'joinRoom', 'leaveRoom', 'sendMsg', 'getRecord'];

// ============================================================
// VISUAL STRING UTILITIES (same as main-server)
// ============================================================

function vLen(s) {
    var w = 0;
    for (var i = 0; i < s.length; i++) {
        var c = s.charCodeAt(i);
        if (c >= 0xD800 && c <= 0xDBFF) { w += 2; i++; }
        else if (c === 0xFE0F || c === 0x200D) { }
        else if ((c >= 0x2600 && c <= 0x27BF) || (c >= 0x2B00 && c <= 0x2BFF) ||
                 (c >= 0x231A && c <= 0x231B) || (c >= 0x23F0 && c <= 0x23F3)) { w += 2; }
        else { w += 1; }
    }
    return w;
}

function vPad(s, w) { var d = w - vLen(s); return d > 0 ? s + '\u0020'.repeat(d) : s; }

function vTrunc(s, maxW) {
    if (vLen(s) <= maxW) return s;
    var r = '', w = 0;
    for (var i = 0; i < s.length; i++) {
        var c = s.charCodeAt(i);
        if (c >= 0xD800 && c <= 0xDBFF) {
            if (w + 2 > maxW) break; r += s[i] + (s[i+1]||''); w += 2; i++;
        } else if (c === 0xFE0F || c === 0x200D) { r += s[i]; }
        else if ((c >= 0x2600 && c <= 0x27BF) || (c >= 0x2B00 && c <= 0x2BFF) ||
                 (c >= 0x231A && c <= 0x231B) || (c >= 0x23F0 && c <= 0x23F3)) {
            if (w + 2 > maxW) break; r += s[i]; w += 2;
        } else { if (w + 1 > maxW) break; r += s[i]; w += 1; }
    }
    return r;
}

function vCell(s, w) { return vPad(vTrunc(s, w), w); }

// ============================================================
// SIMPLE HELPERS
// ============================================================

function p2(n) { return n < 10 ? '0' + n : '' + n; }
function p3(n) { return n < 10 ? '00' + n : n < 100 ? '0' + n : '' + n; }

function tNow() {
    var d = new Date();
    return p2(d.getHours()) + ':' + p2(d.getMinutes()) + ':' + p2(d.getSeconds()) + '.' + p3(d.getMilliseconds());
}

function fmtDur(ms) { return ms < 1000 ? ms + 'ms' : (ms / 1000).toFixed(1) + 's'; }
function fmtSize(b) { return b < 1024 ? b + 'B' : (b / 1024).toFixed(1) + 'KB'; }

function trunc(s, n) {
    if (!s) return '(none)';
    if (s.length <= n) return s;
    var half = Math.floor((n - 2) / 2);
    return s.substring(0, half) + '..' + s.slice(-(n - half));
}

// ============================================================
// TABLE ROW BUILDERS
// ============================================================

function dashes(n) { return '\u2500'.repeat(n); }

function tTop() {
    return '\u250C' + dashes(COL.TIME) + '\u252C' + dashes(COL.IDX) + '\u252C' +
        dashes(COL.DIR) + '\u252C' + dashes(COL.ACT) + '\u252C' +
        dashes(COL.STS) + '\u252C' + dashes(COL.MS) + '\u252C' +
        dashes(COL.DET) + '\u2510';
}

function tMid() {
    return '\u251C' + dashes(COL.TIME) + '\u253C' + dashes(COL.IDX) + '\u253C' +
        dashes(COL.DIR) + '\u253C' + dashes(COL.ACT) + '\u253C' +
        dashes(COL.STS) + '\u253C' + dashes(COL.MS) + '\u253C' +
        dashes(COL.DET) + '\u2524';
}

function tBot() {
    return '\u2514' + dashes(COL.TIME) + '\u2534' + dashes(COL.IDX) + '\u2534' +
        dashes(COL.DIR) + '\u2534' + dashes(COL.ACT) + '\u2534' +
        dashes(COL.STS) + '\u2534' + dashes(COL.MS) + '\u2534' +
        dashes(COL.DET) + '\u2518';
}

function tRow(cells) {
    var ws = [COL.TIME, COL.IDX, COL.DIR, COL.ACT, COL.STS, COL.MS, COL.DET];
    var parts = [];
    for (var i = 0; i < cells.length; i++) {
        var s = cells[i] == null ? '' : String(cells[i]);
        parts.push(vCell('\u0020' + s, ws[i]));
    }
    return '\u2502' + parts.join('\u2502') + '\u2502';
}

// ============================================================
// SESSION & ROOM TRACKING
// ============================================================

var sessions = {};          // socketId → { userId, serverId, nickName, image, rooms, lastMsgTime, ... }
var roomMembers = new Map(); // roomId → Set<socketId>

// ============================================================
// RESPONSE BUILDERS
// ============================================================

function buildResponse(data) {
    return {
        ret: 0,
        data: LZString.compressToUTF16(JSON.stringify(data)),
        compress: true,
        serverTime: Date.now(),
        server0Time: new Date().getTimezoneOffset() * 60 * 1000
    };
}

function buildErrorResponse(errorCode) {
    return {
        ret: errorCode || 1,
        data: '',
        compress: false,
        serverTime: Date.now(),
        server0Time: new Date().getTimezoneOffset() * 60 * 1000
    };
}

// ============================================================
// NOTIFY BROADCAST
// ============================================================

/**
 * Broadcast a chat message to all sockets in a room EXCEPT the sender.
 *
 * Notify format (client line 114241-114261):
 *   socket.emit('Notify', {
 *       ret: 'SUCCESS',                  ← STRING, not number!
 *       data: LZString.compressToUTF16(JSON.stringify({ _msg: msgData })),
 *       compress: true
 *   });
 *
 * Client processes (line 114243-114245):
 *   var t = e.data;
 *   e.compress && (t = LZString.decompressFromUTF16(t));
 *   var n = JSON.parse(t), o = ChatDataBaseClass.getData(n._msg);
 *
 * ChatDataBaseClass.getData expects (line 92110):
 *   _time, _kind, _name, _content, _id, _image, _param, _type,
 *   _headEffect, _headBox, _oriServerId, _serverId, _showMain
 */
function broadcastToRoom(roomId, msgData, excludeSocketId) {
    var members = roomMembers.get(roomId);
    if (!members) return;

    var notifyPayload = {
        ret: 'SUCCESS',
        data: LZString.compressToUTF16(JSON.stringify({ _msg: msgData })),
        compress: true,
        serverTime: Date.now(),
        server0Time: new Date().getTimezoneOffset() * 60 * 1000
    };

    var count = 0;
    members.forEach(function (socketId) {
        if (socketId === excludeSocketId) return;

        var sess = sessions[socketId];
        if (!sess) return;

        // Find socket by ID
        var targetSocket = findSocketById(socketId);
        if (targetSocket) {
            targetSocket.emit('Notify', notifyPayload);
            count++;
        }
    });

    if (count > 0) {
        console.log('  \uD83D\uDCE1 Notify → ' + count + ' clients in ' + roomId);
    }
}

/**
 * Find a connected socket by its ID.
 * Socket.IO stores connected sockets in io.sockets.connected
 */
var _ioRef = null;

function findSocketById(socketId) {
    if (!_ioRef) return null;
    return _ioRef.sockets.connected[socketId] || null;
}

// ============================================================
// HANDLER MAP & LOADER
// ============================================================

var actionMap = {
    'login': path.join(__dirname, 'handlers', 'chat', 'login'),
    'joinRoom': path.join(__dirname, 'handlers', 'chat', 'joinRoom'),
    'leaveRoom': path.join(__dirname, 'handlers', 'chat', 'leaveRoom'),
    'sendMsg': path.join(__dirname, 'handlers', 'chat', 'sendMsg'),
    'getRecord': path.join(__dirname, 'handlers', 'chat', 'getRecord')
};

var handlerCache = {};

function loadHandler(action) {
    if (handlerCache[action]) return handlerCache[action];
    var modPath = actionMap[action];
    if (!modPath) return null;
    try {
        handlerCache[action] = require(modPath);
        return handlerCache[action];
    } catch (err) {
        console.error(tNow() + ' \u274C Handler "' + action + '": ' + err.message);
        return null;
    }
}

// ============================================================
// ACTION ICONS
// ============================================================

var ICON = {
    'CONNECT': '\uD83D\uDFE2',
    'DISCONNECT': '\uD83D\uDD34',
    'VERIFY_OK': '\uD83D\uDD13',
    'VERIFY_FAIL': '\uD83D\uDD12',
    'login': '\uD83D\uDD10',
    'joinRoom': '\uD83D\uDC65',
    'leaveRoom': '\uD83D\uDEAA',
    'sendMsg': '\uD83D\uDCAC',
    'getRecord': '\uD83D\uDCDA',
    'NOTIFY': '\uD83D\uDCE1'
};

function icon(a) { return ICON[a] || '\u2753'; }

// ============================================================
// MESSAGE KIND NAMES
// ============================================================

var KIND_NAMES = {
    0: 'NULL', 1: 'SYSTEM', 2: 'WORLD', 3: 'GUILD',
    4: 'PRIVATE', 5: 'WORLD_TEAM', 6: 'TEAM'
};

function kindName(k) { return KIND_NAMES[k] || '?'; }

// ============================================================
// DETAIL BUILDERS
// ============================================================

function reqDetail(action, data) {
    if (!data) return '\u2500\u2500';
    switch (action) {
        case 'login': {
            var p = [];
            p.push('\uD83D\uDC64 ' + data.userId);
            if (data.serverId) p.push('\uD83D\uDDA5 s' + data.serverId);
            return p.join('  ');
        }
        case 'joinRoom': {
            var p = [];
            p.push('\uD83D\uDC64 ' + (data.userId || '?'));
            p.push('\uD83C\uDFE0 ' + (data.roomId || '?'));
            return p.join('  ');
        }
        case 'leaveRoom': {
            var p = [];
            p.push('\uD83D\uDC64 ' + (data.userId || '?'));
            p.push('\uD83C\uDFE0 ' + (data.roomId || '?'));
            return p.join('  ');
        }
        case 'sendMsg': {
            var p = [];
            p.push('\uD83D\uDC64 ' + (data.userId || '?'));
            p.push('\uD83C\uDFE0 ' + (data.roomId || '?'));
            p.push('\uD83D\uDCD6 ' + kindName(data.kind));
            if (data.msgType) p.push('\u2139\uFE0F type=' + data.msgType);
            var ct = data.content || '';
            if (ct) p.push('"' + trunc(ct, 20) + '"');
            return p.join('  ');
        }
        case 'getRecord': {
            var p = [];
            p.push('\uD83D\uDC64 ' + (data.userId || '?'));
            p.push('\uD83C\uDFE0 ' + (data.roomId || '?'));
            if (data.startTime) p.push('\uD83D\uDD50 since=' + data.startTime);
            return p.join('  ');
        }
        default: return '\u2500\u2500';
    }
}

function resDetailChat(action, d) {
    if (!d) return '\u2500\u2500';
    switch (action) {
        case 'login': {
            return d._success ? '\u2705 success' : '\u274C failed';
        }
        case 'joinRoom': {
            var n = d._record ? d._record.length : 0;
            return '\uD83D\uDCCB ' + n + ' recent messages';
        }
        case 'leaveRoom': {
            return '\u2705 left';
        }
        case 'sendMsg': {
            return '\u23F0 _time=' + (d._time || '?');
        }
        case 'getRecord': {
            var n = d._record ? d._record.length : 0;
            return '\uD83D\uDCCB ' + n + ' messages';
        }
        default: return '\u2500\u2500';
    }
}

// ============================================================
// LOG FUNCTIONS
// ============================================================

function sessCreate(socketId, ip, transport) {
    var s = {
        id: crypto.randomBytes(3).toString('hex').toUpperCase(),
        ip: ip,
        transport: transport || '?',
        connectTime: Date.now(),
        disconnectTime: null,
        disconnectReason: null,
        userId: null,
        nickName: null,
        verified: false,
        loggedIn: false,
        actions: {},
        actionOrder: [],
        counter: 0,
        roomsJoined: 0,
        messagesSent: 0,
        notifiesSent: 0,
        printedHeader: false
    };
    sessions[socketId] = s;
    return s;
}

function ensureHeader(sess) {
    if (sess.printedHeader) return;
    sess.printedHeader = true;
    console.log('');
    console.log('\uD83D\uDCAC SESSION ' + sess.id + '  \u2502  \uD83C\uDF10 ' + sess.ip + '  \u2502  \uD83D\uDCE1 ' + sess.transport);
    console.log('');
    console.log(tTop());
    console.log(tRow([
        '\u23F0 TIME', '#', '\u27A1\uFE0F',
        '\uD83D\uDD27 ACTION', '\uD83D\uDCCA STATUS',
        '\u23F1 MS', '\uD83D\uDCCB DETAILS'
    ]));
    console.log(tMid());
}

function logUpgrade(sess, from, to) {
    ensureHeader(sess);
    console.log(tRow([tNow(), '', '\u2195', '', '\u2B06\uFE0F upgrade', '', from + ' \u2192 ' + to]));
    sess.transport = to;
}

function logReq(sess, idx, action, data) {
    ensureHeader(sess);
    console.log(tRow([tNow(), idx, '\u27A1\uFE0F', icon(action) + ' ' + action, '\uD83D\uDCE4 REQ', '\u2500\u2500\u2500', reqDetail(action, data)]));
}

function logResOk(sess, idx, action, elapsed, decompressed, compSize) {
    ensureHeader(sess);
    console.log(tRow([tNow(), idx, '\u2B05\uFE0F', icon(action) + ' ' + action, '\u2705 OK', String(elapsed), resDetailChat(action, decompressed)]));

    if (compSize > 0) {
        console.log(tRow(['', '', '\uD83D\uDCCA', '', '\u26A1 perf', '', '\uD83D\uDCE6 ' + fmtSize(compSize)]));
    }

    // Track stats
    if (action === 'joinRoom') sess.roomsJoined++;
    if (action === 'sendMsg') sess.messagesSent++;
}

function logResErr(sess, idx, action, elapsed, ret) {
    ensureHeader(sess);
    var label = ret === 36001 ? '\u26A0\uFE0F COOLDOWN' : '\u274C ERR=' + ret;
    console.log(tRow([tNow(), idx, '\u2B05\uFE0F', icon(action) + ' ' + action, label, String(elapsed), 'error code ' + ret]));
}

function logConn(sess) {
    ensureHeader(sess);
    console.log(tRow([tNow(), '\u25C9', '\u2500\u2500', icon('CONNECT') + ' CONNECT', '\u2500\u2500\u2500', '\u2500\u2500\u2500', '\uD83C\uDF10 ' + sess.ip + '  \uD83D\uDCE1 ' + sess.transport]));
}

function logVerify(sess, success, elapsed) {
    ensureHeader(sess);
    if (success) {
        console.log(tRow([tNow(), '', '\uD83D\uDD13', icon('VERIFY_OK') + ' TEA VERIFY', '\u2705 OK', String(elapsed), 'challenge-response matched']));
    } else {
        console.log(tRow([tNow(), '', '\uD83D\uDD12', icon('VERIFY_FAIL') + ' TEA VERIFY', '\u274C FAIL', String(elapsed), 'decrypt mismatch or error']));
    }
}

function logDisc(sess) {
    ensureHeader(sess);
    var dur = sess.disconnectTime - sess.connectTime;
    var nAct = sess.actionOrder.length;

    console.log(tMid());
    console.log(tRow([tNow(), '\u25C9', '\u2500\u2500', icon('DISCONNECT') + ' DISCONNECT', '\u2500\u2500\u2500', '\u2500\u2500\u2500', sess.disconnectReason || 'unknown']));
    console.log(tRow(['', '', '', '\uD83D\uDCCB SESSION LOG', '', '', nAct + '\u2705  \u23F1' + fmtDur(dur) + '  verified=' + (sess.verified ? '\u2705' : '\u274C') + '  login=' + (sess.loggedIn ? '\u2705' : '\u274C')]));
    if (sess.roomsJoined > 0 || sess.messagesSent > 0) {
        console.log(tRow(['', '', '', '\uD83D\uDCCA STATS', '', '', sess.roomsJoined + ' joins  \uD83D\uDCAC ' + sess.messagesSent + ' msgs']));
    }
    console.log(tBot());

    var skipped = [];
    for (var i = 0; i < ALL_ACTIONS.length; i++) {
        if (!sess.actions[ALL_ACTIONS[i]]) skipped.push(ALL_ACTIONS[i]);
    }
    if (skipped.length > 0) {
        console.log('  \u23ED Not triggered: ' + skipped.join(', '));
    }

    console.log('');
    var mem = process.memoryUsage();
    var roomCount = 0, memberCount = 0;
    roomMembers.forEach(function (members) { roomCount++; memberCount += members.size; });
    console.log('  \uD83D\uDCBE RSS: ' + (mem.rss / 1024 / 1024).toFixed(1) + 'MB' +
        '  \u2502  \uD83E\uDDE0 Heap: ' + (mem.heapUsed / 1024 / 1024).toFixed(1) + '/' + (mem.heapTotal / 1024 / 1024).toFixed(1) + 'MB' +
        '  \u2502  \uD83D\uDC65 Sessions: ' + Object.keys(sessions).length +
        '  \u2502  \uD83C\uDFE0 Rooms: ' + roomCount + ' (' + memberCount + ' members)');
    console.log('');
}

// ============================================================
// DISCONNECT CLEANUP
// ============================================================

function cleanupSession(socketId) {
    var sess = sessions[socketId];
    if (!sess) return;

    // Remove from all room memberships
    sess.rooms.forEach(function (roomId) {
        if (roomMembers.has(roomId)) {
            roomMembers.get(roomId).delete(socketId);
            if (roomMembers.get(roomId).size === 0) {
                roomMembers.delete(roomId);
            }
        }
    });

    // Clear session rooms
    sess.rooms.clear();

    console.log('  \uD83D\uDDD1 Cleaned up session: ' + sess.userId + ' (' + sess.roomsJoined + ' rooms left)');
}

// ============================================================
// SOCKET.IO SERVER
// ============================================================

var server = http.createServer();

var io = require('socket.io')(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
    transports: ['websocket', 'polling']
});

// Store io reference for broadcastToRoom
_ioRef = io;

io.on('connection', function (socket) {
    var ip = socket.handshake
        ? (socket.handshake.address || socket.handshake.headers['x-forwarded-for'] || '?')
        : '?';
    var transport = (socket.conn && socket.conn.transport) ? socket.conn.transport.name : '?';

    var sess = sessCreate(socket.id, ip, transport);
    var challenge = null;

    logConn(sess);

    // Track transport upgrade
    if (socket.conn) {
        socket.conn.on('upgrade', function (newTransport) {
            if (sess.transport !== newTransport.name) {
                logUpgrade(sess, sess.transport, newTransport.name);
            }
        });
    }

    // ============================================================
    // TEA VERIFY HANDSHAKE
    // ============================================================
    //
    // Same as main-server (line 82579-82587):
    //   Server → Client: socket.emit('verify', challenge)
    //   Client → Server: socket.emit('verify', TEA.encrypt(challenge, 'verification'), callback)
    //   Server: TEA.decrypt(response, 'verification') → compare → callback({ret: 0/1})
    //

    challenge = crypto.randomBytes(16).toString('hex');

    socket.emit('verify', challenge);

    socket.on('verify', function (encrypted, callback) {
        var vStart = Date.now();
        var vElapsed = Date.now() - vStart;

        if (!callback || typeof callback !== 'function') {
            logVerify(sess, false, 0);
            socket.disconnect();
            return;
        }

        try {
            var decrypted = tea.decrypt(encrypted, tea.TEA_KEY);
            vElapsed = Date.now() - vStart;

            if (decrypted && decrypted.length > 0 && decrypted === challenge) {
                sess.verified = true;
                logVerify(sess, true, vElapsed);
                callback({ ret: 0 });
            } else {
                logVerify(sess, false, vElapsed);
                callback({ ret: 1 });
                setTimeout(function () { socket.disconnect(); }, 100);
            }
        } catch (err) {
            vElapsed = Date.now() - vStart;
            console.error(tNow() + ' \u274C TEA decrypt error: ' + err.message);
            logVerify(sess, false, vElapsed);
            callback({ ret: 1 });
            setTimeout(function () { socket.disconnect(); }, 100);
        }
    });

    // ============================================================
    // HANDLER.PROCESS — request/response channel
    // ============================================================
    //
    // Client sends via: this.chatClient.sendToServer(e, o) (line 82528)
    // Which does:       socket.emit('handler.process', data, callback)
    //
    // Server response format (line 113886-113891):
    //   { ret: 0, data: LZString.compressToUTF16(JSON.stringify(data)), compress: true }
    //
    // All chat actions use type: 'chat' — we accept any action in actionMap.

    socket.on('handler.process', function (data, callback) {
        if (!callback || typeof callback !== 'function') return;

        if (!sess.verified) {
            console.log(tNow() + ' \u26A0\uFE0F Rejected unverified request');
            return callback(buildErrorResponse(1));
        }

        var action = data ? data.action : null;

        if (!action || !actionMap[action]) {
            sess.counter++;
            ensureHeader(sess);
            console.log(tRow([tNow(), sess.counter, '\u27A1\uFE0F', icon('UNKNOWN') + ' ' + (action || '?'), '\u274C UNKNOWN', '\u2500\u2500\u2500', 'action not found']));
            return callback(buildErrorResponse(1));
        }

        sess.counter++;
        var idx = sess.counter;

        logReq(sess, idx, action, data);

        var handler = loadHandler(action);
        if (!handler || typeof handler.execute !== 'function') {
            logResErr(sess, idx, action, 0, 1);
            sess.actions[action] = { idx: idx, status: 'error' };
            if (sess.actionOrder.indexOf(action) === -1) sess.actionOrder.push(action);
            return callback(buildErrorResponse(1));
        }

        var ctx = {
            db: db,
            buildResponse: buildResponse,
            buildErrorResponse: buildErrorResponse,
            config: config,
            sessions: sessions,
            roomMembers: roomMembers,
            broadcastToRoom: broadcastToRoom
        };

        var startTime = Date.now();

        handler.execute(data, socket, ctx)
            .then(function (result) {
                var elapsed = Date.now() - startTime;
                var ret = result.ret;
                var decompressed = null;
                var compSize = 0;

                if (ret === 0 && result.compress && result.data) {
                    try { decompressed = JSON.parse(LZString.decompressFromUTF16(result.data)); }
                    catch (e) { decompressed = null; }
                    compSize = Buffer.byteLength(result.data, 'utf8');
                }

                if (ret === 0) {
                    logResOk(sess, idx, action, elapsed, decompressed, compSize);

                    // Track login status
                    if (action === 'login' && ret === 0) {
                        sess.loggedIn = true;
                        sess.userId = decompressed ? null : null; // userId tracked in sessions
                        // Get userId from sessions (set by handler)
                        var chatSess = sessions[socket.id];
                        if (chatSess) {
                            sess.userId = chatSess.userId;
                            sess.nickName = chatSess.nickName;
                        }
                    }
                } else {
                    logResErr(sess, idx, action, elapsed, ret);
                }

                sess.actions[action] = { idx: idx, status: ret === 0 ? 'ok' : 'error', time: elapsed };
                if (sess.actionOrder.indexOf(action) === -1) sess.actionOrder.push(action);

                callback(result);
            })
            .catch(function (err) {
                var elapsed = Date.now() - startTime;
                console.error(tNow() + ' \u274C Handler error: ' + err.message);
                console.error(err.stack);
                logResErr(sess, idx, action, elapsed, err.code || 1);
                sess.actions[action] = { idx: idx, status: 'error', time: elapsed };
                if (sess.actionOrder.indexOf(action) === -1) sess.actionOrder.push(action);
                callback(buildErrorResponse(err.code || 1));
            });
    });

    // ============================================================
    // DISCONNECT
    // ============================================================

    socket.on('disconnect', function (reason) {
        sess.disconnectTime = Date.now();
        sess.disconnectReason = reason;

        // Update userId/nickName for log before cleanup
        var chatSess = sessions[socket.id];
        if (chatSess) {
            sess.userId = chatSess.userId || sess.userId;
            sess.nickName = chatSess.nickName || sess.nickName;
        }

        logDisc(sess);
        cleanupSession(socket.id);
        setTimeout(function () { delete sessions[socket.id]; }, 2000);
    });
});

// ============================================================
// PERIODIC STATS
// ============================================================

setInterval(function () {
    var roomCount = 0, memberCount = 0, sessCount = 0;
    roomMembers.forEach(function (members, roomId) { roomCount++; memberCount += members.size; });
    for (var sid in sessions) { if (sessions[sid].verified) sessCount++; }

    if (sessCount > 0) {
        console.log('  \uD83D\uDCCA [STATS] ' + sessCount + ' sessions  \u2502  ' +
            roomCount + ' rooms  \u2502  ' + memberCount + ' members  \u2502  ' +
            'RSS: ' + (process.memoryUsage().rss / 1024 / 1024).toFixed(1) + 'MB');
    }
}, 60000);

// ============================================================
// START SERVER
// ============================================================

db.init();

server.listen(config.port, function () {
    console.log('');
    console.log('\uD83D\uDCAC SUPER WARRIOR Z \u2014 CHAT SERVER');
    console.log('\u2550'.repeat(TW));
    console.log('  \u26A1 Port: ' + config.port + '  \u2502  \uD83D\uDD0C Socket.IO 2.5.1  \u2502  \uD83D\uDD13 TEA: ON (verification)  \u2502  \uD83D\uDDC4 DB: ' + config.dbFile);
    console.log('  \uD83D\uDDA5 Server ID: ' + config.serverId + '  \u2502  \uD83D\uDCE6 Cooldown: ' + config.chatCooldownMs + 'ms  \u2502  \uD83D\uDCC1 Max recent: ' + config.maxRecentMessages);
    console.log('  \uD83D\uDD0D Login DB: ' + config.loginDbFile);
    console.log('  \uD83D\uDD0D Main DB: ' + config.mainDbFile);
    console.log('  \u2705 Server Ready  \u2502  \uD83E\uDDE0 Node ' + process.version + '  \u2502  \uD83D\uDCC5 ' + new Date().toISOString().slice(0, 10));
    console.log('\u2550'.repeat(TW));
    console.log('');
});

// ============================================================
// GRACEFUL SHUTDOWN
// ============================================================

process.on('SIGINT', function () {
    console.log('\n' + tNow() + ' \uD83D\uDEAB Shutting down...');
    io.close();
    db.close();
    process.exit(0);
});

process.on('SIGTERM', function () {
    console.log('\n' + tNow() + ' \uD83D\uDEAB SIGTERM, shutting down...');
    io.close();
    db.close();
    process.exit(0);
});
