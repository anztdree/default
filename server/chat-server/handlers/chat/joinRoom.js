/**
 * handlers/chat/joinRoom.js — Join Chat Room
 *
 * Client request (line 114612):
 *   type: 'chat'
 *   action: 'joinRoom'
 *   userId: string              — dari UserInfoSingleton.getInstance().userId
 *   roomId: string              — room ID to join
 *   version: '1.0'
 *
 * processHandlerWithChat response (decompressed JSON):
 *   { _record: Array<ChatMsg> }  — recent messages in this room
 *
 * Client processes response via chatJoinRecord (line 114632):
 *   for (var o in t._record) {
 *       var a = t._record[o];
 *       ts.chatData[a._kind] || (ts.chatData[a._kind] = []);
 *       var r = ChatDataBaseClass.getData(a);
 *       r && (ts.chatNotifyData(r), n.push(r));
 *   }
 *
 * ChatDataBaseClass.getData fields (line 92110):
 *   _time, _kind, _name, _content, _id, _image, _param, _type,
 *   _headEffect, _headBox, _oriServerId, _serverId, _showMain
 *
 * NOTE: _record is iterated with `for...in`, so it can be
 *       either an array or an object with numeric keys.
 *       We use array which works with both.
 */

function execute(data, socket, ctx) {
    var db = ctx.db;
    var sessions = ctx.sessions;
    var roomMembers = ctx.roomMembers;

    var userId = (data.userId || '').trim();
    var roomId = (data.roomId || '').trim();

    if (!userId || !roomId) {
        return Promise.resolve(ctx.buildResponse({ _record: [] }));
    }

    // Verify user is logged in to this chat session
    var sess = sessions[socket.id];
    if (!sess || sess.userId !== userId) {
        return Promise.resolve(ctx.buildErrorResponse(1));
    }

    // Add to room membership
    if (!sess.rooms.has(roomId)) {
        sess.rooms.add(roomId);
    }

    // Add to room members map (for broadcasting)
    if (!roomMembers.has(roomId)) {
        roomMembers.set(roomId, new Set());
    }
    roomMembers.get(roomId).add(socket.id);

    // Get recent messages from this room
    var messages = db.getRecentMessages(roomId);

    console.log('  \uD83D\uDCAC ' + userId + ' joined room: ' + roomId +
        ' (' + messages.length + ' recent msgs)');

    return Promise.resolve(ctx.buildResponse({ _record: messages }));
}

module.exports = { execute: execute };
