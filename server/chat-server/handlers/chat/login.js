/**
 * handlers/chat/login.js — Chat Server Login
 *
 * Client request (line 114551):
 *   type: 'chat'
 *   action: 'login'
 *   userId: string              — dari UserInfoSingleton.getInstance().userId
 *   serverId: number            — dari UserInfoSingleton.getInstance().getServerId()
 *   version: '1.0'
 *
 * processHandlerWithChat response (decompressed JSON):
 *   { _success: true }    — client checks truthy, no specific fields read
 *
 * Flow after login success (line 114557-114611):
 *   Promise.all([
 *     chatJoinRequest(worldRoomId, cb)
 *     chatJoinRequest(guildRoomId, cb)        ← conditional (if truthy)
 *     chatJoinRequest(teamDungeonChatRoom, cb)← conditional (if truthy)
 *     chatJoinRequest(teamChatRoomId, cb)     ← conditional (if truthy)
 *   ]).then(() => saveBrodecast(n))
 *
 * On login, server should:
 *   1. Verify userId exists (login DB)
 *   2. Store user session (in-memory)
 *   3. Load user profile (nickName, headImage) for future message sending
 */

function execute(data, socket, ctx) {
    var db = ctx.db;
    var sessions = ctx.sessions;
    var config = ctx.config;

    var userId = (data.userId || '').trim();
    var serverId = parseInt(data.serverId) || config.serverId;

    if (!userId) {
        return Promise.resolve(ctx.buildErrorResponse(1));
    }

    // Verify user exists in login DB
    var user = db.verifyUser(userId);
    if (!user) {
        console.log('  \u26A0\uFE0F login: user not found in login DB: ' + userId);
        return Promise.resolve(ctx.buildErrorResponse(1));
    }

    // Get user profile for chat messages (nickName, headImage)
    var profile = db.getUserProfile(userId);

    // Store session
    var socketId = socket.id;
    sessions[socketId] = {
        userId: userId,
        serverId: serverId,
        nickName: profile.nickName,
        image: profile.headImage,
        rooms: new Set(),
        lastMsgTime: 0,       // for 36001 cooldown
        loginTime: Date.now()
    };

    console.log('  \uD83D\uDC64 User logged in: ' + userId +
        ' (' + profile.nickName + ') server=' + serverId);

    return Promise.resolve(ctx.buildResponse({ _success: true }));
}

module.exports = { execute: execute };
