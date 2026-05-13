/**
 * getMsg.js — Handler: userMsg/getMsg
 *
 * ═══════════════════════════════════════════════════════════════
 * DEEP TRACE — main.min.js (100% verified)
 * ═══════════════════════════════════════════════════════════════
 *
 * CALLER A: L90593-90612 — openFriendMailInfo (initial open, only if cache empty)
 * CALLER B: L186776-186795 — slefServerFriendGetMsg (scroll-to-top pagination)
 *
 * REQUEST:
 *   { type:'userMsg', action:'getMsg', userId, friendId, time, version:'1.0' }
 *   Initial (L90598): time = ServerTime.getServerTime() → return ALL msgs (<= now)
 *   Pagination (L186781): time = maxOldTime → return OLDER msgs (<= maxOldTime)
 *   → time is UPPER BOUND: filter msg._time <= time
 *
 * CONSUMER: L121114 — setMessageDetalListByFriendId(friendId, msgs)
 *   Concatenates to existing cache (does NOT replace).
 *   L187374-187388 maps each msg: _time, _isSelf, _context → UI display
 *
 * RESPONSE: { _msgs: [ { _time, _isSelf, _context } ] }
 *
 * STORAGE: userData.userMsgMessages → { [friendId]: [ { _time, _isSelf, _context } ] }
 *
 * STRICT RULES: NO STUB, OVERRIDE, FORCE, BYPASS, DUMMY, ASUMSI
 */

function handleGetMsg(request, ctx) {
    const { userId, friendId, time } = request;

    ctx.logger.step(1, 2, 'Get userMsg messages', 'running');
    ctx.logger.details('request',
        ['userId', userId ? userId.substring(0, 20) : 'MISSING'],
        ['friendId', friendId || 'MISSING'],
        ['time', time ? String(time) : '(none)']
    );

    if (!userId || !friendId) {
        ctx.logger.step(1, 2, 'Get userMsg messages', 'fail', 'userId or friendId MISSING');
        return ctx.buildErrorResponse(8);
    }

    const userData = ctx.db.getUser(userId);
    if (!userData) {
        ctx.logger.step(1, 2, 'Get userMsg messages', 'fail', 'User not found');
        return ctx.buildErrorResponse(8);
    }

    // Ensure storage exists
    if (!userData.userMsgMessages) userData.userMsgMessages = {};
    let messages = userData.userMsgMessages[friendId] ? userData.userMsgMessages[friendId] : [];

    // time is upper bound: return messages <= time, limited to last 50
    if (time && Array.isArray(messages)) {
        messages = messages.filter(function (msg) {
            return msg._time <= time;
        });
        // For pagination, return only the 50 oldest messages (before the time)
        if (messages.length > 50) {
            messages = messages.slice(-50);
        }
    }

    ctx.logger.step(1, 2, 'Get userMsg messages', 'pass',
        messages.length + ' msgs from ' + friendId.substring(0, 16));

    ctx.logger.criticalFields([
        {
            name: '_msgs',
            value: 'Array{' + messages.length + '}',
            status: 'ok',
            detail: 'L121114: setMessageDetalListByFriendId CONCATENATES to cache. Each msg: {_time,_isSelf,_context}'
        }
    ]);

    return ctx.buildDataResponse(0, { _msgs: messages });
}

module.exports = handleGetMsg;
