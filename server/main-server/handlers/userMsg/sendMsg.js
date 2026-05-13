/**
 * sendMsg.js — Handler: userMsg/sendMsg
 *
 * ═══════════════════════════════════════════════════════════════
 * DEEP TRACE — main.min.js (100% verified)
 * ═══════════════════════════════════════════════════════════════
 *
 * CALLER A: L186847-186863 — selfServerSendMsg (in-chat send)
 * CALLER B: L187132-187150 — MailSend.sendBtnTap (compose window send)
 *
 * REQUEST:
 *   { type:'userMsg', action:'sendMsg', userId, friendId, msg, version:'1.0' }
 *
 * CONSUMER A (L186857-186858):
 *   e.friendId  → setMessageDetalListByFriendId(e.friendId, [e._selfMsg])
 *   e._selfMsg  → addSimpleOrChangeSimple(friendId, true, e._selfMsg, friendUserInfo)
 *
 * CONSUMER B (L187140-187141): same pattern
 *
 * Response fields READ by client:
 *   friendId  — echo back the friend's ID
 *   _selfMsg  — { _time, _isSelf: true, _context } (server-acknowledged message with server time)
 *
 * CRITICAL: _selfMsg MUST include _time from server (not client local time).
 *   Client uses server time for message ordering and display.
 *   _isSelf MUST be true (client always sets this for own sent messages).
 *
 * STORAGE:
 *   userData.userMsgMessages[friendId][] → append { _time, _isSelf, _context }
 *   userData.userMsgBrief[friendId] → update { lastMsgTime, lastReadTime, msg, userInfo }
 *   Same for recipient's data (bidirectional messaging)
 *
 * STRICT RULES: NO STUB, OVERRIDE, FORCE, BYPASS, DUMMY, ASUMSI
 */

const PLAYERLEVELID = 104;

/**
 * Helper: Build UserSimpleInfo-compatible object for brief list entries.
 */
function buildUserSimpleInfo(userData) {
    const u = userData.user || {};
    const he = userData.headEffect || {};
    const attr = u._attribute || {};
    const items = attr._items || {};
    const levelItem = items[PLAYERLEVELID] || {};

    return {
        _userId: u._id || '',
        _nickName: u._nickName || '',
        _headImage: u._headImage || '',
        _level: levelItem._num || 0,
        _vip: 0,
        _headEffect: he._curEffect || 0,
        _headBox: he._curBox || 0,
        _online: true,
        _offlineTime: 0
    };
}

function handleSendMsg(request, ctx) {
    const { userId, friendId, msg } = request;

    ctx.logger.step(1, 3, 'Send userMsg', 'running');
    ctx.logger.details('request',
        ['userId', userId ? userId.substring(0, 20) : 'MISSING'],
        ['friendId', friendId ? friendId.substring(0, 20) : 'MISSING'],
        ['msg', (msg || '').substring(0, 40) + ((msg || '').length > 40 ? '...' : '')]
    );

    if (!userId || !friendId || msg === undefined) {
        ctx.logger.step(1, 3, 'Send userMsg', 'fail', 'userId, friendId, or msg MISSING');
        return ctx.buildErrorResponse(8);
    }

    const now = Date.now();
    const senderData = ctx.db.getUser(userId);
    const recipientData = ctx.db.getUser(friendId);

    if (!senderData) {
        ctx.logger.step(1, 3, 'Send userMsg', 'fail', 'Sender not found');
        return ctx.buildErrorResponse(8);
    }

    // Ensure storage fields exist
    if (!senderData.userMsgMessages) senderData.userMsgMessages = {};
    if (!senderData.userMsgBrief) senderData.userMsgBrief = {};
    if (!senderData.userMsgReadTime) senderData.userMsgReadTime = {};

    // Build self message (sender's perspective: _isSelf = true)
    const selfMsg = { _time: now, _isSelf: true, _context: msg };

    // Save to sender's messages
    if (!senderData.userMsgMessages[friendId]) {
        senderData.userMsgMessages[friendId] = [];
    }
    senderData.userMsgMessages[friendId].push(selfMsg);

    // Update sender's brief for this friend
    const recipientInfo = recipientData ? buildUserSimpleInfo(recipientData) : {
        _userId: friendId, _nickName: 'Unknown', _headImage: '', _level: 0,
        _vip: 0, _headEffect: 0, _headBox: 0, _online: false, _offlineTime: 0
    };
    senderData.userMsgBrief[friendId] = {
        lastMsgTime: now,
        lastReadTime: now,  // sender just sent, so mark as read
        msg: msg,
        userInfo: recipientInfo
    };
    ctx.db.saveUser(userId, senderData);

    // Save to recipient's messages (bidirectional)
    if (recipientData) {
        if (!recipientData.userMsgMessages) recipientData.userMsgMessages = {};
        if (!recipientData.userMsgBrief) recipientData.userMsgBrief = {};
        if (!recipientData.userMsgReadTime) recipientData.userMsgReadTime = {};

        const recipientMsg = { _time: now, _isSelf: false, _context: msg };

        if (!recipientData.userMsgMessages[userId]) {
            recipientData.userMsgMessages[userId] = [];
        }
        recipientData.userMsgMessages[userId].push(recipientMsg);

        // Update recipient's brief — lastReadTime stays unchanged (UNREAD for recipient)
        const senderInfo = buildUserSimpleInfo(senderData);
        recipientData.userMsgBrief[userId] = {
            lastMsgTime: now,
            lastReadTime: recipientData.userMsgReadTime[userId] || 0,
            msg: msg,
            userInfo: senderInfo
        };
        ctx.db.saveUser(friendId, recipientData);
    } else {
        ctx.logger.log('WARN', 'USERMSG', 'sendMsg: recipient ' + friendId + ' not found');
    }

    ctx.logger.step(1, 3, 'Send userMsg', 'pass',
        'to=' + friendId.substring(0, 16) + ' time=' + now);

    ctx.logger.criticalFields([
        {
            name: 'friendId',
            value: friendId,
            status: 'ok',
            detail: 'L186857: setMessageDetalListByFriendId(e.friendId, [e._selfMsg])'
        },
        {
            name: '_selfMsg',
            value: '{ _time:' + now + ', _isSelf:true, _context:"' + msg.substring(0, 20) + '" }',
            status: 'ok',
            detail: 'L186857: addSimpleOrChangeSimple uses _selfMsg. _time MUST be server time.'
        }
    ]);

    return ctx.buildDataResponse(0, {
        friendId: friendId,
        _selfMsg: selfMsg
    });
}

module.exports = handleSendMsg;
