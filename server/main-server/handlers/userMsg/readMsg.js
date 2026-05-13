/**
 * readMsg.js — Handler: userMsg/readMsg
 *
 * ═══════════════════════════════════════════════════════════════
 * DEEP TRACE — main.min.js (100% verified)
 * ═══════════════════════════════════════════════════════════════
 *
 * CALLER A: L90619-90627 — openFriendMailInfo (sent immediately on open)
 * CALLER B: L186928-186936 — FriendMailInfo.notify() (push notification while viewing)
 *
 * REQUEST:
 *   { type:'userMsg', action:'readMsg', userId, friendId, version:'1.0' }
 *
 * CONSUMER: L121146 — setMessageReadWithFriendId(friendId, readTime)
 *   Updates brief item's lastReadTime → clears red dot when lastReadTime >= lastMsgTime
 *
 * RESPONSE: { _readTime: timestamp }
 *
 * STORAGE:
 *   userData.userMsgReadTime[friendId] = timestamp
 *   userData.userMsgBrief[friendId].lastReadTime = timestamp
 *
 * STRICT RULES: NO STUB, OVERRIDE, FORCE, BYPASS, DUMMY, ASUMSI
 */

function handleReadMsg(request, ctx) {
    const { userId, friendId } = request;

    ctx.logger.step(1, 2, 'Read userMsg', 'running');
    ctx.logger.details('request',
        ['userId', userId ? userId.substring(0, 20) : 'MISSING'],
        ['friendId', friendId ? friendId.substring(0, 20) : 'MISSING']
    );

    if (!userId || !friendId) {
        ctx.logger.step(1, 2, 'Read userMsg', 'fail', 'userId or friendId MISSING');
        return ctx.buildErrorResponse(8);
    }

    const userData = ctx.db.getUser(userId);
    if (!userData) {
        ctx.logger.step(1, 2, 'Read userMsg', 'fail', 'User not found');
        return ctx.buildErrorResponse(8);
    }

    const readTime = Date.now();

    // Ensure storage fields exist
    if (!userData.userMsgReadTime) userData.userMsgReadTime = {};
    if (!userData.userMsgBrief) userData.userMsgBrief = {};

    // Save readTime
    userData.userMsgReadTime[friendId] = readTime;

    // Also update brief lastReadTime (so getMsgList returns correct unread state)
    if (userData.userMsgBrief[friendId]) {
        userData.userMsgBrief[friendId].lastReadTime = readTime;
    }

    ctx.db.saveUser(userId, userData);

    ctx.logger.step(1, 2, 'Read userMsg', 'pass',
        'friendId=' + friendId.substring(0, 16) + ' time=' + readTime);

    ctx.logger.criticalFields([
        {
            name: '_readTime',
            value: String(readTime),
            status: 'ok',
            detail: 'L121146: setMessageReadWithFriendId(friendId, t._readTime) → clears red dot'
        }
    ]);

    return ctx.buildDataResponse(0, { _readTime: readTime });
}

module.exports = handleReadMsg;
