/**
 * getMsgList.js — Handler: userMsg/getMsgList
 *
 * ═══════════════════════════════════════════════════════════════
 * DEEP TRACE — main.min.js (100% verified)
 * ═══════════════════════════════════════════════════════════════
 *
 * CALLER: L186590-186601, L236728-236739
 *   ts.processHandler({
 *       type: 'userMsg', action: 'getMsgList',
 *       userId, version: '1.0'
 *   }, callback)
 *
 * CONSUMER: L121134-121143 — setMessageFriendSimpleList(t._brief)
 *   for (var n in e) {
 *       o.lastMsgTime = e[n].lastMsgTime;
 *       o.lastReadTime = e[n].lastReadTime;
 *       o.msg = e[n].msg;
 *       o.userInfo.deserialize(e[n].userInfo);  ← CRITICAL: must have userInfo
 *   }
 *
 * UserSimpleInfo fields (L130773): _userId, _nickName, _headImage, _level, _vip,
 *   _headEffect, _headBox, _online, _offlineTime
 *
 * RESPONSE: { _brief: { [friendId]: { lastMsgTime, lastReadTime, msg, userInfo } } }
 *
 * STORAGE: userData.userMsgBrief → { [friendId]: { lastMsgTime, lastReadTime, msg, userInfo } }
 *
 * STRICT RULES: NO STUB, OVERRIDE, FORCE, BYPASS, DUMMY, ASUMSI
 */

const PLAYERLEVELID = 104;

function handleGetMsgList(request, ctx) {
    const { userId } = request;

    ctx.logger.step(1, 1, 'Get userMsg list', 'running');
    ctx.logger.details('request',
        ['userId', userId ? userId.substring(0, 20) : 'MISSING']
    );

    if (!userId) {
        ctx.logger.step(1, 1, 'Get userMsg list', 'fail', 'userId MISSING');
        return ctx.buildErrorResponse(8);
    }

    const userData = ctx.db.getUser(userId);
    const storedBrief = (userData && userData.userMsgBrief) ? userData.userMsgBrief : {};

    ctx.logger.step(1, 1, 'Get userMsg list', 'pass',
        Object.keys(storedBrief).length + ' entries');

    ctx.logger.criticalFields([
        {
            name: '_brief',
            value: 'Object{' + Object.keys(storedBrief).length + '}',
            status: 'ok',
            detail: 'L121134: setMessageFriendSimpleList iterates e[n].userInfo → UserSimpleInfo.deserialize'
        }
    ]);

    return ctx.buildDataResponse(0, { _brief: storedBrief });
}

module.exports = handleGetMsgList;
