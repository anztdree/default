/**
 * handlers/chat/sendMsg.js — Send Chat Message
 *
 * Client request (line 83836):
 *   type: 'chat'
 *   action: 'sendMsg'
 *   userId: string              — dari UserInfoSingleton.getInstance().userId
 *   kind: number                — MESSAGE_KIND enum (0-6)
 *   content: string             — message text
 *   msgType: number             — message type (e.g., GuildBroadcastID=49, TeamDungeonBroadcastID=50)
 *   param: any                  — extra parameter
 *   roomId: string              — target room ID
 *   version: '1.0'
 *
 * processHandlerWithChat response (decompressed JSON):
 *   { _time: number }           — server-assigned timestamp
 *
 * Client uses response (line 83846-83849):
 *   ts.createLocalData(t, n, e._time, a, r);
 *   BroadcastSingleton.getInstance().addSystemInfoWithMyChat(t, n, e._time, a, r);
 *
 * Error handling (line 83851-83855):
 *   36001 == t.ret → shows "BarTypeTips" with chatMain.id3 (frequency limit)
 *
 * MESSAGE_KIND enum (line 116615):
 *   0=MK_NULL, 1=SYSTEM, 2=WORLD, 3=GUILD, 4=PRIVATE,
 *   5=WORLD_TEAM, 6=TEAM
 *
 * Server responsibilities:
 *   1. Check cooldown (36001 error)
 *   2. Save message to DB
 *   3. Broadcast Notify to all room members EXCEPT sender
 *   4. Return { _time: timestamp } to sender
 *
 * Notify format (line 114241-114261):
 *   socket.emit('Notify', {
 *       ret: 'SUCCESS',
 *       data: LZString.compressToUTF16(JSON.stringify({
 *           _msg: { _time, _kind, _name, _content, _id, _image, _param, _type, _headEffect, _headBox, _oriServerId, _serverId, _showMain }
 *       })),
 *       compress: true
 *   });
 */

function execute(data, socket, ctx) {
    var db = ctx.db;
    var sessions = ctx.sessions;
    var roomMembers = ctx.roomMembers;
    var config = ctx.config;
    var broadcastToRoom = ctx.broadcastToRoom;

    var userId = (data.userId || '').trim();
    var kind = parseInt(data.kind);
    var content = data.content || '';
    var msgType = data.msgType !== undefined ? parseInt(data.msgType) : null;
    var param = data.param !== undefined ? data.param : null;
    var roomId = (data.roomId || '').trim();

    if (!userId || !roomId) {
        return Promise.resolve(ctx.buildErrorResponse(1));
    }

    // Verify session
    var sess = sessions[socket.id];
    if (!sess || sess.userId !== userId) {
        return Promise.resolve(ctx.buildErrorResponse(1));
    }

    // Verify user is in this room
    if (!sess.rooms.has(roomId)) {
        return Promise.resolve(ctx.buildErrorResponse(1));
    }

    // Check cooldown (36001 — chat frequency limit)
    var now = Date.now();
    if (sess.lastMsgTime && (now - sess.lastMsgTime) < config.chatCooldownMs) {
        console.log('  \u26A0\uFE0F sendMsg 36001 cooldown: ' + userId +
            ' (' + (now - sess.lastMsgTime) + 'ms since last)');
        return Promise.resolve(ctx.buildErrorResponse(36001));
    }

    // Build message object
    var msgData = {
        roomId: roomId,
        userId: userId,
        kind: kind,
        content: content,
        msgType: msgType,
        param: param,
        senderName: sess.nickName,
        senderImage: sess.image,
        headEffect: null,
        headBox: null,
        oriServerId: 0,
        serverId: sess.serverId,
        showMain: false
    };

    // Save to DB (returns message with _time)
    var savedMsg = db.saveMessage(msgData);

    // Update cooldown
    sess.lastMsgTime = now;

    // Broadcast Notify to all room members EXCEPT sender
    broadcastToRoom(roomId, savedMsg, socket.id);

    // Cleanup old messages if room is large
    db.cleanupRoom(roomId);

    var kindNames = {
        0: 'NULL', 1: 'SYSTEM', 2: 'WORLD', 3: 'GUILD',
        4: 'PRIVATE', 5: 'WORLD_TEAM', 6: 'TEAM'
    };
    console.log('  \uD83D\uDCAC [' + (kindNames[kind] || '?') + '] ' +
        sess.nickName + ': ' + (content.length > 40 ? content.substring(0, 40) + '...' : content));

    // Response: { _time: timestamp }
    return Promise.resolve(ctx.buildResponse({ _time: savedMsg._time }));
}

module.exports = { execute: execute };
