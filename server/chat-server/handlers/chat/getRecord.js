/**
 * handlers/chat/getRecord.js — Get Chat History
 *
 * Client request (line 91699):
 *   type: 'chat'
 *   action: 'getRecord'
 *   userId: string              — dari UserInfoSingleton.getInstance().userId
 *   roomId: string              — room ID
 *   startTime: number           — timestamp to get messages since
 *   version: '1.0'
 *
 * processHandlerWithChat response (decompressed JSON):
 *   { _record: Array<ChatMsg> }  — messages since startTime
 *
 * Client processes response (line 91706-91710):
 *   for (var n in t._record) {
 *       var o = ChatDataBaseClass.getData(t._record[n]);
 *       var a = e.getInstance().setSystemInfoArray(o);
 *       a && o && ts.chatNotifyData(o);
 *   }
 *
 * Used by BroadcastSingleton.getTeamDungeonInfoRecord (line 91695)
 * to fetch team dungeon chat history when opening the dungeon UI.
 *
 * startTime comes from BroadcastSingleton.teamDungeonInfoStartTime,
 * which is updated each time a team dungeon message is processed.
 */

function execute(data, socket, ctx) {
    var db = ctx.db;
    var sessions = ctx.sessions;

    var userId = (data.userId || '').trim();
    var roomId = (data.roomId || '').trim();
    var startTime = parseInt(data.startTime) || 0;

    if (!userId || !roomId) {
        return Promise.resolve(ctx.buildResponse({ _record: [] }));
    }

    // Verify session
    var sess = sessions[socket.id];
    if (!sess || sess.userId !== userId) {
        return Promise.resolve(ctx.buildErrorResponse(1));
    }

    // Get messages since startTime
    var messages = db.getMessagesSince(roomId, startTime);

    console.log('  \uD83D\uDCDA getRecord: ' + userId + ' room=' + roomId +
        ' since=' + startTime + ' → ' + messages.length + ' msgs');

    return Promise.resolve(ctx.buildResponse({ _record: messages }));
}

module.exports = { execute: execute };
