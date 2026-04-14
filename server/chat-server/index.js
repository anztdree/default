/**
 * =====================================================
 *  Chat Server — Super Warrior Z Game Server
 *  Port 8002
 *
 *  Chat server khusus menangani:
 *    1. TEA handshake verification (verifyEnable=true)
 *    2. Chat login (userId + serverId)
 *    3. Room management (join/leave rooms)
 *    4. Message routing (world, guild, private, team, world_team)
 *    5. Message history (getRecord)
 *    6. Push notifications via "Notify" event
 *    7. Chat ban/mute enforcement
 *
 *  CLIENT CHAT PROTOCOL (from main.min.js analysis):
 *
 *  FLOW:
 *    1. Client calls registChat on main-server → gets _chatServerUrl, room IDs
 *    2. Client connects to chat-server via Socket.IO
 *    3. TEA verify handshake (same as main-server)
 *    4. Client sends: { type:"chat", action:"login", userId, serverId, version }
 *    5. Client joins rooms: { type:"chat", action:"joinRoom", userId, roomId }
 *    6. Client sends messages: { type:"chat", action:"sendMsg", userId, kind, content, msgType, param, roomId }
 *    7. Server pushes new messages via "Notify" event
 *
 *  ACTIONS:
 *    - login      → authenticate user, return ban status
 *    - joinRoom   → join a chat room, return recent messages
 *    - leaveRoom  → leave a chat room
 *    - sendMsg    → send message to room, broadcast to all members
 *    - getRecord  → fetch message history for a room
 *
 *  ROOM TYPES (MESSAGE_KIND enum from client line 79292):
 *    0 = MK_NULL
 *    1 = SYSTEM
 *    2 = WORLD
 *    3 = GUILD
 *    4 = PRIVATE
 *    5 = WORLD_TEAM (team dungeon)
 *    6 = TEAM
 *
 *  CHAT MESSAGE FORMAT (from ChatDataBaseClass line 58685):
 *    {
 *      _time: number,
 *      _kind: number,        // MESSAGE_KIND
 *      _name: string,        // sender nickName
 *      _content: string,     // message text
 *      _id: string,          // sender userId
 *      _image: string,       // sender head image
 *      _param: object,       // extra params
 *      _type: number,        // msgType / SYSTEM_MESSAGE_TYPE
 *      _headEffect: object,
 *      _headBox: number,     // head box ID
 *      _oriServerId: number,
 *      _serverId: number
 *    }
 *
 *  PUSH FORMAT (Notify event):
 *    { ret: "SUCCESS", data: JSON.stringify({_msg: chatMessageObj}), compress: false }
 *
 *  ERROR CODES:
 *    36001 = chat forbidden/muted
 *
 *  Usage:
 *    node chat-server/index.js
 * =====================================================
 */

'use strict';

var http = require('http');
var config = require('../shared/config');
config.validateConfig();

var SERVER_PORT = config.config.servers.chat.port;
var SERVER_HOST = config.config.servers.chat.host;
var TEA_KEY = config.config.security.teaKey || 'verification';

var RH = require('../shared/responseHelper');
var TEA = require('../shared/tea');
var DB = require('../database/connection');
var logger = require('../shared/utils/logger');

console.log('');
console.log('================================================');
console.log('  Super Warrior Z — Chat Server');
console.log('================================================');

// =============================================
// 1. ROOM & MESSAGE STORAGE
// =============================================

/**
 * In-memory room storage.
 * Key: roomId (number)
 * Value: Set of socket IDs
 *
 * @type {Object.<number, Set<string>>}
 */
var rooms = {};

/**
 * In-memory message history per room.
 * Key: roomId (number)
 * Value: Array of chat message objects (max 60 per room, matching client limit)
 *
 * @type {Object.<number, Array>}
 */
var roomMessages = {};

/** @type {number} Max messages stored per room */
var MAX_MESSAGES_PER_ROOM = 60;

/**
 * Map socket → userId for looking up user info on disconnect.
 *
 * @type {Object.<string, object>}
 */
var socketUsers = {};

/**
 * Map userId → socket for direct private messaging and ban checks.
 *
 * @type {Object.<string, object>}
 */
var connectedUsers = {};

// =============================================
// 2. CONNECTION TRACKING
// =============================================

/** @type {number} */
var totalConnections = 0;
/** @type {number} */
var activeConnections = 0;

// =============================================
// 3. TEA VERIFICATION CONFIGURATION
// =============================================

var VERIFY_TIMEOUT = 15000;
var VERIFY_MAX_ATTEMPTS = 3;

// =============================================
// 4. MESSAGE_KIND ENUM
// =============================================

var MESSAGE_KIND = {
    NULL: 0,
    SYSTEM: 1,
    WORLD: 2,
    GUILD: 3,
    PRIVATE: 4,
    WORLD_TEAM: 5,
    TEAM: 6,
};

// =============================================
// 5. HELPER FUNCTIONS
// =============================================

/**
 * Add a socket to a room.
 */
function joinRoom(roomId, socketId) {
    if (!rooms[roomId]) {
        rooms[roomId] = new Set();
    }
    rooms[roomId].add(socketId);

    if (!roomMessages[roomId]) {
        roomMessages[roomId] = [];
    }
}

/**
 * Remove a socket from a room.
 */
function leaveRoom(roomId, socketId) {
    if (rooms[roomId]) {
        rooms[roomId].delete(socketId);
        // Clean up empty rooms
        if (rooms[roomId].size === 0) {
            delete rooms[roomId];
            // Keep messages for a while even if room is empty
        }
    }
}

/**
 * Remove a socket from ALL rooms.
 */
function leaveAllRooms(socketId) {
    for (var roomId in rooms) {
        if (rooms.hasOwnProperty(roomId)) {
            rooms[roomId].delete(socketId);
        }
    }
}

/**
 * Store a message in room history.
 */
function storeMessage(roomId, message) {
    if (!roomMessages[roomId]) {
        roomMessages[roomId] = [];
    }
    roomMessages[roomId].push(message);

    // Enforce max limit (client also limits to 60)
    if (roomMessages[roomId].length > MAX_MESSAGES_PER_ROOM) {
        roomMessages[roomId].splice(0, roomMessages[roomId].length - MAX_MESSAGES_PER_ROOM);
    }
}

/**
 * Broadcast a push notification to all sockets in a room.
 * Uses the "Notify" event which the client listens for.
 *
 * CLIENT CODE (line 51963-51964):
 *   this.socket.on("Notify", e)
 *
 * PUSH FORMAT (line 77204-77216):
 *   { ret: "SUCCESS", data: JSON.stringify({_msg: chatObj}), compress: false }
 *
 * @param {number} roomId
 * @param {object} chatMessage - The chat message object
 * @param {object} io - Socket.IO instance
 */
function broadcastToRoom(roomId, chatMessage, io) {
    if (!rooms[roomId]) return;

    var pushData = RH.push({ _msg: chatMessage });

    rooms[roomId].forEach(function (socketId) {
        var sock = io.sockets.sockets[socketId];
        if (sock && sock.connected && sock._verified) {
            sock.emit('Notify', pushData);
        }
    });
}

/**
 * Check if a user is chat-banned.
 * Ban data comes from main-server via forbiddenChat field.
 * We cache ban data locally when user logs in.
 *
 * @param {string} userId
 * @returns {boolean} true if user is currently banned
 */
function isUserBanned(userId) {
    var userInfo = connectedUsers[userId];
    if (!userInfo) return false;

    var banInfo = userInfo.forbiddenChat;
    if (!banInfo || !banInfo.finishTime) return false;

    var finishTime = banInfo.finishTime[userId];
    if (finishTime === undefined) return false;

    // 0 = permanent ban
    if (finishTime === 0) return true;

    // Check if ban has expired
    if (finishTime > Date.now()) return true;

    return false;
}

/**
 * Build a chat message object matching client's ChatDataBaseClass format.
 *
 * @param {object} senderInfo - { userId, nickName, headImage, headBox, serverId, oriServerId }
 * @param {number} kind - MESSAGE_KIND
 * @param {string} content - Message text
 * @param {number} msgType - Message sub-type
 * @param {object} param - Extra params
 * @param {number} time - Server timestamp
 * @returns {object}
 */
function buildChatMessage(senderInfo, kind, content, msgType, param, time) {
    return {
        _time: time || Date.now(),
        _kind: kind,
        _name: senderInfo.nickName || senderInfo.userId || '',
        _content: content || '',
        _id: senderInfo.userId || '',
        _image: senderInfo.headImage || '',
        _param: param || null,
        _type: msgType || 0,
        _headEffect: null,
        _headBox: senderInfo.headBox || 0,
        _oriServerId: senderInfo.oriServerId || senderInfo.serverId || 0,
        _serverId: senderInfo.serverId || 0,
    };
}

/**
 * Build system message (e.g., user joined, user left).
 *
 * @param {string} content
 * @param {number} roomId
 * @param {number} sysType
 * @returns {object}
 */
function buildSystemMessage(content, roomId, sysType) {
    return {
        _time: Date.now(),
        _kind: MESSAGE_KIND.SYSTEM,
        _name: 'System',
        _content: content,
        _id: '0',
        _image: '',
        _param: null,
        _type: sysType || 0,
        _headEffect: null,
        _headBox: 0,
        _oriServerId: 0,
        _serverId: 0,
    };
}

// =============================================
// 6. ACTION HANDLERS
// =============================================

/**
 * chatLogin — First action after TEA verify.
 *
 * CLIENT CODE (line 77445-77489):
 *   ts.processHandlerWithChat({
 *       type: "chat",
 *       action: "login",
 *       userId: UserInfoSingleton.getInstance().userId,
 *       serverId: UserInfoSingleton.getInstance().getServerId(),
 *       version: "1.0"
 *   }, callback)
 *
 * After login success, client joins rooms via chatJoinRequest.
 *
 * @param {object} socket
 * @param {object} parsed
 * @param {function} callback
 */
async function handleChatLogin(socket, parsed, callback) {
    var userId = parsed.userId;
    var serverId = parsed.serverId || 1;

    if (!userId) {
        return callback(RH.error(RH.ErrorCode.LACK_PARAM, 'Missing userId'));
    }

    logger.info('CHAT', 'login: userId=' + userId + ', serverId=' + serverId);

    try {
        // Load user info from database
        var userInfo = { userId: userId, serverId: serverId };

        try {
            var rows = await DB.query(
                'SELECT user_id, nick_name, head_image, ori_server_id FROM users WHERE user_id = ?',
                [userId]
            );
            if (rows.length > 0) {
                userInfo.nickName = rows[0].nick_name || userId;
                userInfo.headImage = rows[0].head_image || '';
                userInfo.oriServerId = rows[0].ori_server_id || serverId;
                userInfo.headBox = 0;
            } else {
                userInfo.nickName = userId;
                userInfo.headImage = '';
                userInfo.oriServerId = serverId;
                userInfo.headBox = 0;
            }
        } catch (dbErr) {
            logger.warn('CHAT', 'login: DB lookup failed, using defaults: ' + dbErr.message);
            userInfo.nickName = userId;
            userInfo.headImage = '';
            userInfo.oriServerId = serverId;
            userInfo.headBox = 0;
        }

        // Store user info
        socket._userId = userId;
        socket._userInfo = userInfo;
        socketUsers[socket.id] = userInfo;
        connectedUsers[userId] = {
            socket: socket,
            userInfo: userInfo,
            forbiddenChat: null,
            rooms: new Set(),
        };

        logger.info('CHAT', 'login success: userId=' + userId + ', nick=' + userInfo.nickName);
        callback(RH.success({}));

    } catch (err) {
        logger.error('CHAT', 'login error for userId=' + userId + ': ' + err.message);
        callback(RH.error(RH.ErrorCode.UNKNOWN, 'Login failed'));
    }
}

/**
 * joinRoom — Join a chat room.
 *
 * CLIENT CODE (line 77490-77499):
 *   ts.processHandlerWithChat({
 *       type: "chat",
 *       action: "joinRoom",
 *       userId: UserInfoSingleton.getInstance().userId,
 *       roomId: e,
 *       version: "1.0"
 *   }, function(e) { ... e._record = [...] })
 *
 * Response: { _record: [recentMessages] }
 *
 * @param {object} socket
 * @param {object} parsed - { userId, roomId }
 * @param {function} callback
 */
function handleJoinRoom(socket, parsed, callback) {
    var userId = parsed.userId;
    var roomId = parsed.roomId;

    if (!roomId) {
        return callback(RH.error(RH.ErrorCode.LACK_PARAM, 'Missing roomId'));
    }

    logger.info('CHAT', 'joinRoom: userId=' + userId + ', roomId=' + roomId);

    // Add socket to room
    joinRoom(roomId, socket.id);

    // Track room in user's room list
    if (connectedUsers[userId]) {
        connectedUsers[userId].rooms.add(roomId);
    }

    // NOTE: Do NOT send system message on join.
    // Client BroadcastSingleton.setChatValue() accesses noticeContent[_type]
    // for system messages (_kind==1), and if _type doesn't exist in
    // noticeContent, it crashes: "s[r] is undefined".
    // Only return recent messages for the room.
    var record = roomMessages[roomId] || [];
    callback(RH.success({ _record: record }));
}

/**
 * leaveRoom — Leave a chat room.
 *
 * CLIENT CODE (line 77500-77509):
 *   ts.processHandlerWithChat({
 *       type: "chat",
 *       action: "leaveRoom",
 *       userId: UserInfoSingleton.getInstance().userId,
 *       roomId: e,
 *       version: "1.0"
 *   }, callback)
 *
 * @param {object} socket
 * @param {object} parsed - { userId, roomId }
 * @param {function} callback
 */
function handleLeaveRoom(socket, parsed, callback) {
    var userId = parsed.userId;
    var roomId = parsed.roomId;

    if (!roomId) {
        return callback(RH.error(RH.ErrorCode.LACK_PARAM, 'Missing roomId'));
    }

    logger.info('CHAT', 'leaveRoom: userId=' + userId + ', roomId=' + roomId);

    leaveRoom(roomId, socket.id);

    if (connectedUsers[userId]) {
        connectedUsers[userId].rooms.delete(roomId);
    }

    callback(RH.success({}));
}

/**
 * sendMsg — Send a chat message to a room.
 *
 * CLIENT CODE (line 52852-52874):
 *   ts.processHandlerWithChat({
 *       type: "chat",
 *       action: "sendMsg",
 *       userId: UserInfoSingleton.getInstance().userId,
 *       kind: n,           // MESSAGE_KIND (2=WORLD, 3=GUILD, 5=WORLD_TEAM, 6=TEAM)
 *       content: t,        // message text
 *       msgType: a,        // message sub-type
 *       param: r,          // extra params
 *       roomId: i,         // target room ID
 *       version: "1.0"
 *   }, function(e) { e._time }, errorCallback)
 *
 * ERROR: ret=36001 → chat forbidden/muted
 * RESPONSE: { _time: serverTimestamp }
 * BROADCAST: Notify event with { ret:"SUCCESS", data: {_msg: chatObj} }
 *
 * @param {object} socket
 * @param {object} parsed - { userId, kind, content, msgType, param, roomId }
 * @param {function} callback
 */
function handleSendMsg(socket, parsed, callback) {
    var userId = parsed.userId;
    var kind = parsed.kind || MESSAGE_KIND.WORLD;
    var content = parsed.content || '';
    var msgType = parsed.msgType || 0;
    var param = parsed.param || null;
    var roomId = parsed.roomId;

    if (!roomId) {
        return callback(RH.error(RH.ErrorCode.LACK_PARAM, 'Missing roomId'));
    }

    // FIX 9: System messages (_kind==1) are intentionally blocked.
    // REASON: Client's BroadcastSingleton.setChatValue() accesses noticeContent[_type]
    // for system messages. If _type doesn't exist in noticeContent, it crashes with
    // "s[r] is undefined". The original official server never sent system messages
    // from the chat server either — only via main-server push notifications.
    // We silently drop them rather than risk a client crash.
    if (kind === MESSAGE_KIND.SYSTEM) {
        return callback(RH.error(RH.ErrorCode.LACK_PARAM, 'Cannot send system messages'));
    }

    if (!content) {
        return callback(RH.error(RH.ErrorCode.LACK_PARAM, 'Missing content'));
    }

    // Check chat ban (error 36001)
    if (isUserBanned(userId)) {
        logger.warn('CHAT', 'sendMsg: user is BANNED userId=' + userId);
        return callback(RH.error(36001, 'Chat forbidden'));
    }

    var now = Date.now();
    var userInfo = socket._userInfo || { userId: userId, nickName: userId };

    // Build the chat message
    var chatMsg = buildChatMessage(userInfo, kind, content, msgType, param, now);

    // Store in room history
    storeMessage(roomId, chatMsg);

    // Broadcast to all room members
    broadcastToRoom(roomId, chatMsg, io);

    logger.info('CHAT', 'sendMsg: userId=' + userId + ', kind=' + kind + ', roomId=' + roomId +
        ', content=' + (content.length > 30 ? content.substring(0, 30) + '...' : content));

    // Return server timestamp to sender
    callback(RH.success({ _time: now }));
}

/**
 * getRecord — Fetch message history for a room.
 *
 * CLIENT CODE (line 58328-58341):
 *   ts.processHandlerWithChat({
 *       type: "chat",
 *       action: "getRecord",
 *       userId: o,
 *       roomId: n,
 *       startTime: t.teamDungeonInfoStartTime,
 *       version: "1.0"
 *   }, function(t) { t._record = [...] })
 *
 * @param {object} socket
 * @param {object} parsed - { userId, roomId, startTime }
 * @param {function} callback
 */
function handleGetRecord(socket, parsed, callback) {
    var userId = parsed.userId;
    var roomId = parsed.roomId;
    var startTime = parsed.startTime || 0;

    if (!roomId) {
        return callback(RH.error(RH.ErrorCode.LACK_PARAM, 'Missing roomId'));
    }

    logger.info('CHAT', 'getRecord: userId=' + userId + ', roomId=' + roomId + ', startTime=' + startTime);

    // Get messages from room history, optionally filtered by startTime
    var allMessages = roomMessages[roomId] || [];
    var filtered = allMessages;

    if (startTime > 0) {
        filtered = allMessages.filter(function (msg) {
            return msg._time >= startTime;
        });
    }

    callback(RH.success({ _record: filtered }));
}

// =============================================
// 7. CREATE HTTP SERVER & Socket.IO
// =============================================

var server = http.createServer(function (req, res) {
    if (req.method === 'GET' && req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: 'online',
            server: 'chat',
            port: SERVER_PORT,
            uptime: process.uptime(),
            connectedUsers: Object.keys(connectedUsers).length,
            activeRooms: Object.keys(rooms).length,
            totalConnections: totalConnections,
            activeConnections: activeConnections,
            timestamp: new Date().toISOString(),
        }));
        return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
});

var io = require('socket.io')(server, {
    serveClient: false,
    pingInterval: 10000,
    pingTimeout: 5000,
    cookie: false,
    transports: ['websocket', 'polling'],
});

// =============================================
// 8. CONNECTION HANDLING
// =============================================

io.on('connection', function (socket) {
    totalConnections++;
    activeConnections++;

    var clientIp = socket.handshake.address ||
        socket.handshake.headers['x-forwarded-for'] ||
        'unknown';

    logger.info('CHAT', 'Client connected: ' + socket.id + ' (IP: ' + clientIp + ')');

    // Initialize socket state
    socket._verified = false;
    socket._userId = null;
    socket._userInfo = null;
    socket._verifyAttempts = 0;

    // =============================================
    // 8.1 TEA VERIFICATION (same as main-server)
    // =============================================

    var challenge = TEA.generateChallenge();
    socket._challenge = challenge;

    logger.info('CHAT', 'Sending challenge to ' + socket.id);
    socket.emit('verify', challenge);

    var verifyTimer = setTimeout(function () {
        if (!socket._verified && socket.connected) {
            logger.warn('CHAT', 'Verify timeout for ' + socket.id + ' — disconnecting');
            socket.emit('verifyFailed', 'Verification timeout');
            socket.disconnect(true);
        }
    }, VERIFY_TIMEOUT);

    socket.on('verify', function (encryptedResponse, callback) {
        socket._verifyAttempts++;

        function sendVerifyResult(code) {
            if (typeof callback === 'function') {
                callback({ ret: code, compress: false, serverTime: Date.now(), server0Time: Date.now() });
            }
        }

        if (socket._verified) {
            sendVerifyResult(0);
            return;
        }

        if (!encryptedResponse) {
            if (socket._verifyAttempts >= VERIFY_MAX_ATTEMPTS) {
                clearTimeout(verifyTimer);
                sendVerifyResult(38);
                socket.disconnect(true);
            } else {
                sendVerifyResult(4);
            }
            return;
        }

        var isValid = TEA.verifyChallenge(challenge, encryptedResponse, TEA_KEY);

        if (isValid) {
            socket._verified = true;
            clearTimeout(verifyTimer);
            logger.info('CHAT', 'Verified: ' + socket.id + ' (attempt ' + socket._verifyAttempts + ')');
            sendVerifyResult(0);
        } else {
            logger.warn('CHAT', 'Invalid verify from ' + socket.id +
                ' (attempt ' + socket._verifyAttempts + '/' + VERIFY_MAX_ATTEMPTS + ')');

            if (socket._verifyAttempts >= VERIFY_MAX_ATTEMPTS) {
                clearTimeout(verifyTimer);
                sendVerifyResult(38);
                socket.disconnect(true);
            } else {
                sendVerifyResult(38);
            }
        }
    });

    // =============================================
    // 8.2 MAIN REQUEST HANDLER — "handler.process"
    // =============================================

    socket.on('handler.process', function (request, callback) {
        if (!socket._verified) {
            RH.sendResponse(socket, 'handler.process', RH.error(6, 'Not verified'), callback);
            return;
        }

        if (!request) {
            RH.sendResponse(socket, 'handler.process', RH.error(2, 'Empty request'), callback);
            return;
        }

        var parsed = RH.parseRequest(request);
        if (!parsed) {
            RH.sendResponse(socket, 'handler.process', RH.error(2, 'Invalid request format'), callback);
            return;
        }

        var type = (parsed.type || '').toLowerCase();
        var action = parsed.action;

        logger.info('CHAT', 'Request: type=' + type + ' action=' + action + ' userId=' + (parsed.userId || '-'));

        // Only accept "chat" type
        if (type !== 'chat') {
            logger.warn('CHAT', 'Unknown type: ' + type + ' (only "chat" accepted)');
            RH.sendResponse(socket, 'handler.process', RH.error(5, 'Unknown type: ' + type), callback);
            return;
        }

        // Route by action
        try {
            switch (action) {
                case 'login':
                    handleChatLogin(socket, parsed, callback);
                    break;

                case 'joinRoom':
                    handleJoinRoom(socket, parsed, callback);
                    break;

                case 'leaveRoom':
                    handleLeaveRoom(socket, parsed, callback);
                    break;

                case 'sendMsg':
                    handleSendMsg(socket, parsed, callback);
                    break;

                case 'getRecord':
                    handleGetRecord(socket, parsed, callback);
                    break;

                default:
                    logger.warn('CHAT', 'Unknown action: ' + action);
                    RH.sendResponse(socket, 'handler.process', RH.error(5, 'Unknown action: ' + action), callback);
                    break;
            }
        } catch (err) {
            logger.error('CHAT', 'Handler error for ' + action + ': ' + err.message);
            logger.error('CHAT', 'Stack: ' + err.stack);
            RH.sendResponse(socket, 'handler.process', RH.error(1, 'Internal server error'), callback);
        }
    });

    // =============================================
    // 8.3 DISCONNECT HANDLER
    // =============================================

    socket.on('disconnect', function (reason) {
        activeConnections--;
        clearTimeout(verifyTimer);

        // Leave all rooms
        leaveAllRooms(socket.id);

        // Clean up user tracking
        var userId = socket._userId;
        if (userId) {
            // NOTE: Do NOT send system message on disconnect.
            // Client BroadcastSingleton.setChatValue() accesses noticeContent[_type]
            // for system messages (_kind==1), and if _type doesn't exist in
            // noticeContent, it crashes: "s[r] is undefined".
            // The original server never sent system messages on leave either.
            // Just clean up silently.

            // Remove from connected users (only if this socket)
            if (connectedUsers[userId] && connectedUsers[userId].socket === socket) {
                delete connectedUsers[userId];
            }
        }

        delete socketUsers[socket.id];

        logger.info('CHAT', 'Disconnected: ' + socket.id + ' (Reason: ' + reason +
            ', Verified: ' + (socket._verified ? 'yes' : 'no') +
            ', Active: ' + activeConnections + ')');
    });

    // =============================================
    // 8.4 ERROR HANDLER
    // =============================================

    socket.on('error', function (err) {
        logger.error('CHAT', 'Socket error (' + socket.id + '): ' + err.message);
    });
});

// =============================================
// 9. GRACEFUL SHUTDOWN
// =============================================

function gracefulShutdown(signal) {
    logger.info('CHAT', 'Received ' + signal + '. Shutting down...');

    var keys = Object.keys(connectedUsers);
    for (var i = 0; i < keys.length; i++) {
        try {
            connectedUsers[keys[i]].socket.disconnect(true);
        } catch (e) {
            // Ignore
        }
    }
    logger.info('CHAT', 'Disconnected ' + keys.length + ' client(s)');

    io.close(function () {
        logger.info('CHAT', 'Socket.IO closed');

        DB.closePool()
            .then(function () {
                logger.info('CHAT', 'Database pool closed');
                server.close(function () {
                    logger.info('CHAT', 'Server closed');
                    process.exit(0);
                });
            })
            .catch(function (err) {
                logger.error('CHAT', 'Error closing DB: ' + err.message);
                server.close(function () {
                    process.exit(0);
                });
            });
    });

    setTimeout(function () {
        logger.error('CHAT', 'Forced exit after timeout');
        process.exit(1);
    }, 10000);
}

process.on('SIGTERM', function () { gracefulShutdown('SIGTERM'); });
process.on('SIGINT', function () { gracefulShutdown('SIGINT'); });

// =============================================
// 10. START SERVER
// =============================================

async function startServer() {
    // Initialize database
    logger.info('CHAT', 'Initializing database...');
    try {
        await DB.initPool();
        logger.info('CHAT', 'Database connected');
    } catch (err) {
        logger.error('CHAT', 'FATAL: Database connection failed!');
        logger.error('CHAT', err.message);
        process.exit(1);
    }

    // Start HTTP server
    server.listen(SERVER_PORT, SERVER_HOST, function () {
        console.log('');
        console.log('================================================');
        console.log('  Chat Server is RUNNING!');
        console.log('================================================');
        console.log('  Address:     http://' + SERVER_HOST + ':' + SERVER_PORT);
        console.log('  Socket.IO:   http://' + SERVER_HOST + ':' + SERVER_PORT);
        console.log('  Health:      http://' + SERVER_HOST + ':' + SERVER_PORT + '/health');
        console.log('  TEA Key:     ' + TEA_KEY);
        console.log('================================================');
        console.log('  Actions:');
        console.log('    handler.process → type=chat, action=login');
        console.log('    handler.process → type=chat, action=joinRoom');
        console.log('    handler.process → type=chat, action=leaveRoom');
        console.log('    handler.process → type=chat, action=sendMsg');
        console.log('    handler.process → type=chat, action=getRecord');
        console.log('================================================');
        console.log('  Push: Notify event → { ret:"SUCCESS", data:{_msg:{...}} }');
        console.log('================================================');
        console.log('  Status:');
        console.log('    Database:      ' + (DB.isReady() ? 'CONNECTED' : 'NOT CONNECTED'));
        console.log('    TEA Security:  ENABLED');
        console.log('================================================');
        console.log('');
        console.log('  Waiting for client connections...');
        console.log('');
    });
}

server.on('error', function (err) {
    if (err.code === 'EADDRINUSE') {
        logger.error('CHAT', 'FATAL: Port ' + SERVER_PORT + ' is already in use!');
    } else {
        logger.error('CHAT', 'FATAL: Server error: ' + err.message);
    }
    process.exit(1);
});

startServer();