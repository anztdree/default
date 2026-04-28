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
 * ctx object: ctx.db, ctx.buildResponse, ctx.buildErrorResponse, ctx.config,
 *             ctx.notifyUser, ctx.onlineUsers
 *
 * NOTE: DB tables are created by db.js initMainDb() with FK constraints.
 *       No manual ensureTables() needed here.
 *
 * Push notifications use ctx.notifyUser(userId, payload):
 *   → socket.emit('Notify', { ret: 'SUCCESS', data: LZString(...), compress: true })
 *   → Client dispatches via ts.notifyData(o) (line 114228)
 */

var db = require('../../db');

// ============================================================
// HELPERS
// ============================================================

/**
 * Build a FSUserObject from userId for friend list responses.
 *
 * Client deserializes via FSUser (extends TeamUserItem):
 *   - TeamUserItem.deserialize: iterates keys, strips '_' prefix,
 *     special-cases _superSkill (array preserved), _teams (array preserved)
 *   - FSUser.deserialize: calls parent + sets this.state = data.state
 *
 * Fields used by UI (line 217848-217858):
 *   nickName, headImage, level, headEffect, headBox, vip,
 *   oriServerId || serverId, guildName, totalPower
 *
 * @param {object} db     - Database module
 * @param {string} userId  - Target user ID
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
 *    Client (line 136208-136216): saveFriendData(n)
 *      → iterates n.users → FSUser.deserialize(e.users[n])
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
 *    Client (line 136292-136301): setMyTeamworkBlicklist(e)
 *      → iterates e.users → FSUser.deserialize(e.users[n])
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
 *    Client (line 136256-136274): no response field read (local updates only)
 *    INSERT into blacklist, DELETE from friends (both directions)
 */
function handleAddToBlacklist(data, ctx) {
    var userId = data.userId;
    var friendId = data.friendId;
    if (!userId || !friendId) return ctx.buildErrorResponse(1);

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
 * 4. removeBalcklist (note: typo preserved to match client line 204023)
 *    Params: friendId
 *    Client (line 204026-204029): no response field read
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
 *    Client (line 90631-90648, 186798-186814): n._msgs → setMessageDetalListByFriendId
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
 *    Client (line 90661-90666): t._readTime → setMessageReadWithFriendId
 *    Returns: { _readTime: timestamp }
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
 *
 *    Client (line 186866-186883): teamworkFriendSendMsg
 *      → constructs response LOCALLY using ServerTime.getInstance().getServerTime()
 *      → does NOT read any field from server response
 *      → server response {} is correct for this flow
 *
 *    PUSH to receiver via FGAddMsg (line 114095):
 *      { action: 'FGAddMsg', friendId: senderId, msg: { _time, _context } }
 *      → TeamworkMailInfoManager.setMessageDetalListByFriendId(friendId, [e.msg])
 *      → TeamworkMailInfoManager.addSimpleOrChangeSimple(friendId, false, e.msg)
 *         (3-arg version — no userInfo, unlike MailInfoManager's 4-arg version)
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

    // Push FGAddMsg to receiver if online
    if (ctx.notifyUser) {
        var pushed = ctx.notifyUser(friendId, {
            action: 'FGAddMsg',
            friendId: userId,
            msg: {
                _time: now,
                _context: msg
            }
        });
        if (pushed) {
            console.log('  [friend:sendMsg] FGAddMsg → user ' + friendId);
        }
    }

    return ctx.buildResponse({});
}

/**
 * 8. delMsg
 *    Params: friendId
 *    Client (line 186893-186903): uses closure variable 'o' (friendId from data),
 *      NOT from server response → server response {} is correct for this flow
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
 *    Client (line 206942-206956): n._brief → setMessageFriendSimpleList
 *      → iterates _brief[n] → UserMessageTeamworkFriendSimpleItem
 *      → reads lastMsgTime, lastReadTime, msg, userInfo.deserialize()
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
 *     Client (line 207265-207277): uses closure 'o' (friendId) for local updates only
 *     DELETE from friends table (both directions) + clean up messages
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
 *     Client (line 207290-207301): shows toast only, no response field read
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
 * 12. getChatMsg  ← FIXED: was returning wrong _type and raw JSON string
 *
 *     Params: time (timestamp)
 *     Client (line 210091-210105, 232083-232097): setTeamworkFriendInvitedList(e)
 *       → iterates e._msgs[n]
 *       → filters: e._msgs[n]._type == TeamDungeonBroadcastID (50)
 *       → reads: e._msgs[n]._from (sender userId)
 *       → reads: e._msgs[n]._param (array, used by ChatItem.getBroadcastValue)
 *         → getBroadcastValue iterates _param as array: t[0], t[1], ...
 *       → reads: e._msgs[n].teamExist (boolean — shows "team doesn't exist" if false)
 *       → reads: e._msgs[n]._time
 *
 *     OLD BUG #1: _type was hardcoded 'friend' → client filter 'friend' == 50 → FALSE
 *                  → team dungeon invites NEVER appeared in invitation list
 *
 *     OLD BUG #2: _param was raw JSON string '{"_type":50,"_params":[...]}' 
 *                  → getBroadcastValue iterated per CHARACTER → garbage text
 *
 *     FIX: Parse stored JSON content from handleChat:
 *       stored: { _type, _params, teamExist }
 *       return: { _type, _param (no 's'), _from, _time, teamExist }
 *
 *     Non-chat messages (plain text from handleSendMsg) are safely skipped:
 *       JSON.parse fails → _type defaults to 0 → client filters out (0 != 50)
 *
 *     Returns: { _msgs: [{ _type, _from, _param, _time, teamExist }] }
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
        var parsed = {};
        // handleChat stores JSON: {"_type":50,"_params":[...],"teamExist":true}
        // handleSendMsg stores plain text — JSON.parse will throw, parsed stays {}
        try { parsed = JSON.parse(msgs[i].content); } catch (e) {}

        _msgs.push({
            _type: typeof parsed._type !== 'undefined' ? parsed._type : 0,
            _from: msgs[i].senderId,
            _param: typeof parsed._params !== 'undefined' ? parsed._params : '',
            _time: msgs[i].time,
            teamExist: typeof parsed.teamExist !== 'undefined' ? parsed.teamExist : false
        });
    }

    return ctx.buildResponse({ _msgs: _msgs });
}

/**
 * 13. queryApplyList
 *     Client (line 210512-210524): setTeamworkFriendApplyList(n)
 *       → iterates n.users → FSUser.deserialize(e.users[n])
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
 * 14. chat  ← FIXED: now stores teamExist and pushes FGAddChatMsg
 *
 *     Params: friendId, msgType, params
 *     Client request (line 208787-208796):
 *       type: 'friend', action: 'friendServerAction', relayAction: 'chat',
 *       userId, friendId, msgType: TeamDungeonBroadcastID (50), params
 *
 *     Client callback (line 208797-208801): no response field read (local updates only)
 *
 *     Stored in DB: JSON.stringify({ _type: msgType, _params: params, teamExist: true })
 *       → teamExist = true because the team existed when the invite was sent
 *       → _params preserved as-is (client sends array for dungeon invites)
 *
 *     PUSH to receiver via FGAddChatMsg (line 114095):
 *       { action: 'FGAddChatMsg', msg: { _type, _param, _from, _time } }
 *       → TeamworkManager.showInivteInfo(e)
 *         → reads e.msg._param[3] (teamId) for gotoTeamById()
 */
function handleChat(data, ctx) {
    var userId = data.userId;
    var friendId = data.friendId;
    var msgType = data.msgType || 0;
    var params = data.params || '';
    if (!userId || !friendId) return ctx.buildErrorResponse(1);

    var now = Date.now();

    // Store as JSON — parsed by handleGetChatMsg when retrieving
    var content = JSON.stringify({
        _type: msgType,
        _params: params,
        teamExist: true
    });

    db.dbRun(
        'INSERT INTO friend_messages (senderId, receiverId, content, time) VALUES (?, ?, ?, ?)',
        [userId, friendId, content, now]
    );

    // Push FGAddChatMsg to receiver if online
    // Client reads: e.msg._param[3] for teamId → _param must be preserved as-is
    if (ctx.notifyUser) {
        var pushed = ctx.notifyUser(friendId, {
            action: 'FGAddChatMsg',
            msg: {
                _type: msgType,
                _param: params,
                _from: userId,
                _time: now
            }
        });
        if (pushed) {
            console.log('  [friend:chat] FGAddChatMsg → user ' + friendId);
        }
    }

    return ctx.buildResponse({});
}

/**
 * 15. handleApply
 *     Params: friendId, agree (boolean)
 *     Client (line 209200-209212): uses local friendInfo data, no response field read
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
            try {
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
            } catch (err) {
                console.error('  [friendServerAction] Error in ' + (data.relayAction || 'unknown') + ': ' + err.message);
                console.error('  [friendServerAction] Stack: ' + err.stack);
                resolve(ctx.buildErrorResponse(1));
            }
        });
    }
};
