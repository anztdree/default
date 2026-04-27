/**
 * handlers/friend/friendServerAction.js
 *
 * Friend system relay handler — dispatches 15 sub-actions via data.relayAction.
 *
 * Client request:
 *   {
 *     type: 'friend',
 *     action: 'friendServerAction',
 *     relayAction: '<string>',
 *     userId: string,
 *     version: '1.0',
 *     // ... additional fields per sub-action
 *   }
 *
 * ctx object: ctx.db, ctx.buildResponse, ctx.buildErrorResponse, ctx.config
 */

var db = require('../../db');

// ============================================================
// TABLE INIT — runs once on first execute() call
// ============================================================

var _tablesInitialized = false;

function ensureTables() {
    if (_tablesInitialized) return;

    db.dbRun('CREATE TABLE IF NOT EXISTS friends (' +
        'userId TEXT NOT NULL,' +
        'friendId TEXT NOT NULL,' +
        'addedTime INTEGER DEFAULT 0,' +
        'PRIMARY KEY (userId, friendId)' +
        ')');

    db.dbRun('CREATE TABLE IF NOT EXISTS friend_blacklist (' +
        'userId TEXT NOT NULL,' +
        'friendId TEXT NOT NULL,' +
        'PRIMARY KEY (userId, friendId)' +
        ')');

    db.dbRun('CREATE TABLE IF NOT EXISTS friend_messages (' +
        'id INTEGER PRIMARY KEY AUTOINCREMENT,' +
        'senderId TEXT NOT NULL,' +
        'receiverId TEXT NOT NULL,' +
        'content TEXT DEFAULT \'\',' +
        'time INTEGER DEFAULT 0' +
        ')');

    db.dbRun('CREATE TABLE IF NOT EXISTS friend_read_time (' +
        'userId TEXT NOT NULL,' +
        'friendId TEXT NOT NULL,' +
        'readTime INTEGER DEFAULT 0,' +
        'PRIMARY KEY (userId, friendId)' +
        ')');

    db.dbRun('CREATE TABLE IF NOT EXISTS friend_applications (' +
        'id INTEGER PRIMARY KEY AUTOINCREMENT,' +
        'senderId TEXT NOT NULL,' +
        'receiverId TEXT NOT NULL,' +
        'time INTEGER DEFAULT 0' +
        ')');

    _tablesInitialized = true;
}

// ============================================================
// HELPERS
// ============================================================

/**
 * Build a FSUserObject from userId for friend list responses.
 *
 * @param {object} db    - Database module
 * @param {string} userId - Target user ID
 * @param {object} config - Server config (ctx.config)
 * @returns {object|null} FSUserObject or null if user not found
 */
function buildUserInfo(db, userId, config) {
    var user = db.getUser(userId);
    if (!user) return null;
    return {
        _serverId: parseInt(user.oriServerId) || parseInt(config.serverId) || 1,
        _oriServerId: parseInt(user.oriServerId) || parseInt(config.serverId) || 1,
        _userId: userId,
        _nickName: user.nickName || '',
        _headImage: user.headImage || 'hero_icon_1205',
        _headEffect: 0,
        _headBox: 0,
        _guildName: '',
        _level: user.level || 1,
        _vip: user.vipLevel || 0,
        _superSkill: [],
        _totalPower: 0,
        state: 0
    };
}

// ============================================================
// SUB-ACTION HANDLERS
// ============================================================

/**
 * 1. queryFriends
 *    Returns: { users: { "<userId>": FSUserObject } }
 */
function handleQueryFriends(data, ctx) {
    var userId = data.userId;
    if (!userId) return ctx.buildErrorResponse(1);

    var rows = db.dbAll('SELECT friendId FROM friends WHERE userId = ?', [userId]);
    var users = {};

    for (var i = 0; i < rows.length; i++) {
        var info = buildUserInfo(db, rows[i].friendId, ctx.config);
        if (info) {
            users[rows[i].friendId] = info;
        }
    }

    return ctx.buildResponse({ users: users });
}

/**
 * 2. queryBlackList
 *    Returns: { users: { "<userId>": FSUserObject } }
 */
function handleQueryBlackList(data, ctx) {
    var userId = data.userId;
    if (!userId) return ctx.buildErrorResponse(1);

    var rows = db.dbAll('SELECT friendId FROM friend_blacklist WHERE userId = ?', [userId]);
    var users = {};

    for (var i = 0; i < rows.length; i++) {
        var info = buildUserInfo(db, rows[i].friendId, ctx.config);
        if (info) {
            users[rows[i].friendId] = info;
        }
    }

    return ctx.buildResponse({ users: users });
}

/**
 * 3. addToBlacklist
 *    Params: friendId
 *    INSERT into blacklist, DELETE from friends (both directions)
 */
function handleAddToBlacklist(data, ctx) {
    var userId = data.userId;
    var friendId = data.friendId;
    if (!userId || !friendId) return ctx.buildErrorResponse(1);

    var now = Date.now();

    // Add to blacklist (user → friend)
    db.dbRun(
        'INSERT OR IGNORE INTO friend_blacklist (userId, friendId) VALUES (?, ?)',
        [userId, friendId]
    );

    // Remove friendship both directions
    db.dbRun('DELETE FROM friends WHERE (userId = ? AND friendId = ?)', [userId, friendId]);
    db.dbRun('DELETE FROM friends WHERE (userId = ? AND friendId = ?)', [friendId, userId]);

    return ctx.buildResponse({});
}

/**
 * 4. removeBalcklist (note: typo preserved to match client)
 *    Params: friendId
 *    DELETE from blacklist
 */
function handleRemoveBlacklist(data, ctx) {
    var userId = data.userId;
    var friendId = data.friendId;
    if (!userId || !friendId) return ctx.buildErrorResponse(1);

    db.dbRun('DELETE FROM friend_blacklist WHERE userId = ? AND friendId = ?', [userId, friendId]);

    return ctx.buildResponse({});
}

/**
 * 5. getMsg
 *    Params: friendId, time (timestamp)
 *    Returns: { _msgs: [{ _time, _isSelf, _context }] }
 */
function handleGetMsg(data, ctx) {
    var userId = data.userId;
    var friendId = data.friendId;
    if (!userId || !friendId) return ctx.buildErrorResponse(1);

    var time = data.time || 0;

    var msgs = db.dbAll(
        'SELECT * FROM friend_messages ' +
        'WHERE ((senderId = ? AND receiverId = ?) OR (senderId = ? AND receiverId = ?)) ' +
        'AND time > ? ORDER BY time ASC',
        [userId, friendId, friendId, userId, time]
    );

    var _msgs = [];
    for (var i = 0; i < msgs.length; i++) {
        _msgs.push({
            _time: msgs[i].time,
            _isSelf: msgs[i].senderId === userId,
            _context: msgs[i].content || ''
        });
    }

    return ctx.buildResponse({ _msgs: _msgs });
}

/**
 * 6. readMsg
 *    Params: friendId
 *    Returns: { _readTime: timestamp }
 *    INSERT/UPDATE friend_read_time table
 */
function handleReadMsg(data, ctx) {
    var userId = data.userId;
    var friendId = data.friendId;
    if (!userId || !friendId) return ctx.buildErrorResponse(1);

    var now = Date.now();

    db.dbRun(
        'INSERT OR REPLACE INTO friend_read_time (userId, friendId, readTime) VALUES (?, ?, ?)',
        [userId, friendId, now]
    );

    return ctx.buildResponse({ _readTime: now });
}

/**
 * 7. sendMsg
 *    Params: friendId, msg
 *    INSERT into friend_messages, return success
 */
function handleSendMsg(data, ctx) {
    var userId = data.userId;
    var friendId = data.friendId;
    var msg = data.msg || '';
    if (!userId || !friendId) return ctx.buildErrorResponse(1);

    var now = Date.now();

    db.dbRun(
        'INSERT INTO friend_messages (senderId, receiverId, content, time) VALUES (?, ?, ?, ?)',
        [userId, friendId, msg, now]
    );

    return ctx.buildResponse({});
}

/**
 * 8. delMsg
 *    Params: friendId
 *    DELETE messages with friend, return success
 */
function handleDelMsg(data, ctx) {
    var userId = data.userId;
    var friendId = data.friendId;
    if (!userId || !friendId) return ctx.buildErrorResponse(1);

    // Delete all messages between the two users
    db.dbRun(
        'DELETE FROM friend_messages WHERE (senderId = ? AND receiverId = ?) OR (senderId = ? AND receiverId = ?)',
        [userId, friendId, friendId, userId]
    );

    // Also clean up read time
    db.dbRun(
        'DELETE FROM friend_read_time WHERE userId = ? AND friendId = ?',
        [userId, friendId]
    );

    return ctx.buildResponse({});
}

/**
 * 9. getMsgList
 *    Returns: { _brief: { "<userId>": { lastMsgTime, lastReadTime, msg, userInfo } } }
 */
function handleGetMsgList(data, ctx) {
    var userId = data.userId;
    if (!userId) return ctx.buildErrorResponse(1);

    // Get friend list
    var friends = db.dbAll('SELECT friendId FROM friends WHERE userId = ?', [userId]);
    var brief = {};

    for (var i = 0; i < friends.length; i++) {
        var friendId = friends[i].friendId;
        var friendUser = db.getUser(friendId);
        if (!friendUser) continue;

        // Get last message with this friend
        var msgs = db.dbAll(
            'SELECT * FROM friend_messages ' +
            'WHERE (senderId = ? AND receiverId = ?) OR (senderId = ? AND receiverId = ?) ' +
            'ORDER BY time DESC LIMIT 1',
            [userId, friendId, friendId, userId]
        );

        var lastMsg = msgs.length > 0 ? msgs[0] : null;

        // Get read time
        var readRow = db.dbGet(
            'SELECT readTime FROM friend_read_time WHERE userId = ? AND friendId = ?',
            [userId, friendId]
        );

        var lastMsgTime = lastMsg ? lastMsg.time : 0;
        var lastReadTime = readRow ? readRow.readTime : 0;
        var msgText = '';
        if (lastMsg) {
            msgText = (lastMsg.content || '').substring(0, 10);
        }

        brief[friendId] = {
            lastMsgTime: lastMsgTime,
            lastReadTime: lastReadTime,
            msg: msgText,
            userInfo: {
                _serverId: parseInt(friendUser.oriServerId) || parseInt(ctx.config.serverId) || 1,
                _oriServerId: parseInt(friendUser.oriServerId) || parseInt(ctx.config.serverId) || 1,
                _userId: friendId,
                _nickName: friendUser.nickName || '',
                _headImage: friendUser.headImage || 'hero_icon_1205',
                _headEffect: 0,
                _headBox: 0,
                _guildName: '',
                _level: friendUser.level || 1,
                _vip: friendUser.vipLevel || 0,
                _superSkill: [],
                _totalPower: 0
            }
        };
    }

    return ctx.buildResponse({ _brief: brief });
}

/**
 * 10. delFriend
 *     Params: friendId
 *     DELETE from friends table (both directions)
 */
function handleDelFriend(data, ctx) {
    var userId = data.userId;
    var friendId = data.friendId;
    if (!userId || !friendId) return ctx.buildErrorResponse(1);

    // Remove friendship both directions
    db.dbRun('DELETE FROM friends WHERE userId = ? AND friendId = ?', [userId, friendId]);
    db.dbRun('DELETE FROM friends WHERE userId = ? AND friendId = ?', [friendId, userId]);

    // Clean up messages and read times between the two
    db.dbRun(
        'DELETE FROM friend_messages WHERE (senderId = ? AND receiverId = ?) OR (senderId = ? AND receiverId = ?)',
        [userId, friendId, friendId, userId]
    );
    db.dbRun('DELETE FROM friend_read_time WHERE (userId = ? AND friendId = ?) OR (userId = ? AND friendId = ?)',
        [userId, friendId, friendId, userId]);

    return ctx.buildResponse({});
}

/**
 * 11. apply
 *     Params: friendIds (array of userId strings)
 *     INSERT into friend_applications
 */
function handleApply(data, ctx) {
    var userId = data.userId;
    var friendIds = data.friendIds;
    if (!userId || !friendIds || !Array.isArray(friendIds) || friendIds.length === 0) {
        return ctx.buildErrorResponse(1);
    }

    var now = Date.now();

    for (var i = 0; i < friendIds.length; i++) {
        var friendId = friendIds[i];
        if (!friendId || friendId === userId) continue;

        // Avoid duplicate applications
        db.dbRun(
            'INSERT OR IGNORE INTO friend_applications (senderId, receiverId, time) VALUES (?, ?, ?)',
            [userId, friendId, now]
        );
    }

    return ctx.buildResponse({});
}

/**
 * 12. getChatMsg
 *     Params: time (timestamp)
 *     Returns: { _msgs: [{ _type, _from, _param, _time }] }
 */
function handleGetChatMsg(data, ctx) {
    var userId = data.userId;
    if (!userId) return ctx.buildErrorResponse(1);

    var time = data.time || 0;

    // Get all friend messages received after the given time
    var msgs = db.dbAll(
        'SELECT * FROM friend_messages WHERE receiverId = ? AND time > ? ORDER BY time ASC',
        [userId, time]
    );

    var _msgs = [];
    for (var i = 0; i < msgs.length; i++) {
        _msgs.push({
            _type: 'friend',
            _from: msgs[i].senderId,
            _param: msgs[i].content || '',
            _time: msgs[i].time
        });
    }

    return ctx.buildResponse({ _msgs: _msgs });
}

/**
 * 13. queryApplyList
 *     Returns: { users: { "<userId>": FSUserObject } }
 */
function handleQueryApplyList(data, ctx) {
    var userId = data.userId;
    if (!userId) return ctx.buildErrorResponse(1);

    // Get all pending applications sent TO this user
    var rows = db.dbAll(
        'SELECT DISTINCT senderId FROM friend_applications WHERE receiverId = ?',
        [userId]
    );

    var users = {};
    for (var i = 0; i < rows.length; i++) {
        var info = buildUserInfo(db, rows[i].senderId, ctx.config);
        if (info) {
            users[rows[i].senderId] = info;
        }
    }

    return ctx.buildResponse({ users: users });
}

/**
 * 14. chat
 *     Params: friendId, msgType, params
 *     INSERT into friend_messages (chat via friend channel)
 */
function handleChat(data, ctx) {
    var userId = data.userId;
    var friendId = data.friendId;
    var msgType = data.msgType || 0;
    var params = data.params || '';
    if (!userId || !friendId) return ctx.buildErrorResponse(1);

    var now = Date.now();
    var content = JSON.stringify({ _type: msgType, _params: params });

    db.dbRun(
        'INSERT INTO friend_messages (senderId, receiverId, content, time) VALUES (?, ?, ?, ?)',
        [userId, friendId, content, now]
    );

    return ctx.buildResponse({});
}

/**
 * 15. handleApply
 *     Params: friendId, agree (boolean)
 *     If agree: add friend both directions, delete application
 *     If not: just delete application
 */
function handleHandleApply(data, ctx) {
    var userId = data.userId;
    var friendId = data.friendId;
    var agree = data.agree;
    if (!userId || !friendId) return ctx.buildErrorResponse(1);

    // Delete the application (senderId=friendId sent to receiverId=userId)
    // Also try the reverse direction
    db.dbRun(
        'DELETE FROM friend_applications WHERE (senderId = ? AND receiverId = ?) OR (senderId = ? AND receiverId = ?)',
        [friendId, userId, userId, friendId]
    );

    if (agree) {
        var now = Date.now();

        // Add bidirectional friendship
        db.dbRun(
            'INSERT OR IGNORE INTO friends (userId, friendId, addedTime) VALUES (?, ?, ?)',
            [userId, friendId, now]
        );
        db.dbRun(
            'INSERT OR IGNORE INTO friends (userId, friendId, addedTime) VALUES (?, ?, ?)',
            [friendId, userId, now]
        );
    }

    return ctx.buildResponse({});
}

// ============================================================
// MAIN DISPATCH
// ============================================================

module.exports = {
    execute: function (data, socket, ctx) {
        return new Promise(function (resolve) {
            // Ensure DB tables exist on first call
            ensureTables();

            var relayAction = data.relayAction;

            switch (relayAction) {
                // --- Friend list management ---
                case 'queryFriends':
                    return resolve(handleQueryFriends(data, ctx));

                case 'queryBlackList':
                    return resolve(handleQueryBlackList(data, ctx));

                case 'addToBlacklist':
                    return resolve(handleAddToBlacklist(data, ctx));

                case 'removeBalcklist':   // typo preserved to match client
                    return resolve(handleRemoveBlacklist(data, ctx));

                // --- Private messaging ---
                case 'getMsg':
                    return resolve(handleGetMsg(data, ctx));

                case 'readMsg':
                    return resolve(handleReadMsg(data, ctx));

                case 'sendMsg':
                    return resolve(handleSendMsg(data, ctx));

                case 'delMsg':
                    return resolve(handleDelMsg(data, ctx));

                case 'getMsgList':
                    return resolve(handleGetMsgList(data, ctx));

                // --- Friend management ---
                case 'delFriend':
                    return resolve(handleDelFriend(data, ctx));

                case 'apply':
                    return resolve(handleApply(data, ctx));

                // --- Chat system ---
                case 'getChatMsg':
                    return resolve(handleGetChatMsg(data, ctx));

                case 'chat':
                    return resolve(handleChat(data, ctx));

                // --- Application handling ---
                case 'queryApplyList':
                    return resolve(handleQueryApplyList(data, ctx));

                case 'handleApply':
                    return resolve(handleHandleApply(data, ctx));

                default:
                    console.warn('[friend] Unknown relayAction: ' + relayAction);
                    return resolve(ctx.buildErrorResponse(1));
            }
        });
    }
};
