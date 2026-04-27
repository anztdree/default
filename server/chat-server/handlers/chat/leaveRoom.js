/**
 * handlers/chat/leaveRoom.js — Leave Chat Room
 *
 * Client request (line 114622):
 *   type: 'chat'
 *   action: 'leaveRoom'
 *   userId: string              — dari UserInfoSingleton.getInstance().userId
 *   roomId: string              — room ID to leave
 *   version: '1.0'
 *
 * processHandlerWithChat response:
 *   Client just calls `t && t(e)` — no specific fields needed.
 *   Empty success response is fine.
 *
 * Server should:
 *   1. Remove socket from room membership
 *   2. Clean up room if empty
 */

function execute(data, socket, ctx) {
    var sessions = ctx.sessions;
    var roomMembers = ctx.roomMembers;

    var userId = (data.userId || '').trim();
    var roomId = (data.roomId || '').trim();

    if (!userId || !roomId) {
        return Promise.resolve(ctx.buildResponse({}));
    }

    // Verify session
    var sess = sessions[socket.id];
    if (!sess || sess.userId !== userId) {
        return Promise.resolve(ctx.buildErrorResponse(1));
    }

    // Remove from session rooms
    sess.rooms.delete(roomId);

    // Remove from room members
    if (roomMembers.has(roomId)) {
        roomMembers.get(roomId).delete(socket.id);

        // Clean up empty room
        if (roomMembers.get(roomId).size === 0) {
            roomMembers.delete(roomId);
        }
    }

    console.log('  \uD83D\uDEAB ' + userId + ' left room: ' + roomId);

    return Promise.resolve(ctx.buildResponse({}));
}

module.exports = { execute: execute };
