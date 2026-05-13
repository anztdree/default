/**
 * delFriendMsg.js — Handler: userMsg/delFriendMsg
 *
 * ═══════════════════════════════════════════════════════════════
 * DEEP TRACE — main.min.js (100% verified)
 * ═══════════════════════════════════════════════════════════════
 *
 * CALLER: L186907-186918 — FriendMailInfo.deleteBtnTap()
 *   Triggered after user confirms deletion dialog.
 *
 * REQUEST:
 *   { type:'userMsg', action:'delFriendMsg', userId, friendId, version:'1.0' }
 *
 * CONSUMER: L186913 — clearOneFriendMessage(t.friendId)
 *   L121106-121108: deletes BOTH detail and brief:
 *     delete t.messageFriendAll[e];
 *     delete t.messageFriendSimpleItemList[e];
 *   → Client clears local cache for this friend.
 *
 * RESPONSE: { friendId: string }
 *
 * STORAGE: Delete from sender's data:
 *   userData.userMsgMessages[friendId]   → delete
 *   userData.userMsgBrief[friendId]      → delete
 *   userData.userMsgReadTime[friendId]   → delete
 *
 * STRICT RULES: NO STUB, OVERRIDE, FORCE, BYPASS, DUMMY, ASUMSI
 */

function handleDelFriendMsg(request, ctx) {
    const { userId, friendId } = request;

    ctx.logger.step(1, 2, 'Delete friend messages', 'running');
    ctx.logger.details('request',
        ['userId', userId ? userId.substring(0, 20) : 'MISSING'],
        ['friendId', friendId ? friendId.substring(0, 20) : 'MISSING']
    );

    if (!userId || !friendId) {
        ctx.logger.step(1, 2, 'Delete friend messages', 'fail', 'userId or friendId MISSING');
        return ctx.buildErrorResponse(8);
    }

    const userData = ctx.db.getUser(userId);
    if (!userData) {
        ctx.logger.step(1, 2, 'Delete friend messages', 'fail', 'User not found');
        return ctx.buildErrorResponse(8);
    }

    // Delete from sender
    if (userData.userMsgMessages) {
        delete userData.userMsgMessages[friendId];
    }
    if (userData.userMsgBrief) {
        delete userData.userMsgBrief[friendId];
    }
    if (userData.userMsgReadTime) {
        delete userData.userMsgReadTime[friendId];
    }
    ctx.db.saveUser(userId, userData);

    ctx.logger.step(1, 2, 'Delete friend messages', 'pass',
        'deleted all msgs with ' + friendId.substring(0, 16));

    ctx.logger.criticalFields([
        {
            name: 'friendId',
            value: friendId,
            status: 'ok',
            detail: 'L186913: clearOneFriendMessage(t.friendId) → deletes detail + brief from local cache'
        }
    ]);

    return ctx.buildDataResponse(0, { friendId: friendId });
}

module.exports = handleDelFriendMsg;
