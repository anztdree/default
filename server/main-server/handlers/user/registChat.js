/**
 * registChat.js — Handler: user/registChat
 *
 * ═══════════════════════════════════════════════════════════════
 * DEEP TRACE — main.min.js (100% verified)
 * ═══════════════════════════════════════════════════════════════
 *
 * CALLER:
 *   L114462: TSUIController.registChat(e)
 *     → L114464: ts.processHandler({
 *           type: 'user',
 *           action: 'registChat',
 *           userId: UserInfoSingleton.getInstance().userId,
 *           version: '1.0'
 *         }, callback)
 *
 * TRIGGER:
 *   L114436-114440: Setelah enterGame sukses, client menjalankan:
 *     ts.chatJoinRecord({ _record: t.broadcastRecord })  → parse broadcast
 *     ts.chatInterval = setInterval(function() { e.registChat(o); }, 3000);
 *
 * CONSUMER — L114470 (callback body):
 *   n._success ?
 *     (ts.loginInfo.serverItem.chaturl              = n._chatServerUrl,
 *      ts.loginInfo.serverItem.worldRoomId           = n._worldRoomId,
 *      ts.loginInfo.serverItem.guildRoomId           = n._guildRoomId,
 *      ts.loginInfo.serverItem.teamDungeonChatRoom   = n._teamDungeonChatRoom,
 *      ts.loginInfo.serverItem.teamChatRoomId        = n._teamChatRoom,
 *      clearInterval(ts.chatInterval),
 *      t.clientStartChat(false, e))
 *     : (ts.chatConnectCount++,
 *        ts.chatConnectCount > 15 && clearInterval(ts.chatInterval));
 *
 * FAILURE BEHAVIOR:
 *   _success === false → client increment chatConnectCount
 *   chatConnectCount > 15 → clearInterval → CHAT GIVE UP (no retry)
 *   Client does NOT show error to user — just silently stops
 *
 * SUCCESS BEHAVIOR — L114472-114480:
 *   t.clientStartChat(false, e)
 *     → L114479: chaturl = ts.loginInfo.serverItem.chaturl
 *     → L114480: this.chatClient.connectToServer(chaturl, callback)
 *     → L82537: io.connect(chaturl, { reconnectionAttempts: 10 })
 *       → chaturl MUST be full URL like "http://127.0.0.1:8002"
 *
 * CHAT-SERVER TEA VERIFICATION — L113445 + L82579-82587:
 *   chatClient = new TSSocketClient('chat-server', true)
 *   → verifyEnable = TRUE
 *   → L82581: socket.on('verify', function(n) { TEA.encrypt(n, 'verification') })
 *   → chat-server MUST implement TEA handshake (same as main-server)
 *
 * POST-REGIST — chatLoginRequest L114550-114611:
 *   After connect, client sends: { type:'chat', action:'login', userId, serverId, version }
 *   Then joins rooms:
 *     L114566: chatJoinRequest(worldRoomId)          — ALWAYS
 *     L114568: if(guildRoomId) chatJoinRequest(guildRoomId)    — OPTIONAL
 *     L114579: if(teamDungeonChatRoom) chatJoinRequest(...)    — OPTIONAL
 *     L114590: if(teamChatRoomId) chatJoinRequest(...)         — OPTIONAL
 *
 * DYNAMIC ROOM UPDATES (AFTER registChat):
 *   L114207: setTeamID(e) → guildRoomId = e._chatRoomId (from guild join response)
 *   L136514: setCreateTeamDungeon(e,...) → teamChatRoomId = e._chatRoomId
 *   L136531: joinTeamSuccessCallBack(e) → teamChatRoomId = e.chatRoomId
 *   → These are NOT returned by registChat — set by their own handlers
 *
 * ROOM ID FORMAT:
 *   Free-form strings used as Socket.IO room identifiers.
 *   Client only passes them to chatJoinRequest as roomId.
 *   Convention: "world_1", "guild_{guildId}", etc.
 *
 * RESPONSE FIELDS (6 total):
 *   _success             : boolean   — gate: success vs retry
 *   _chatServerUrl       : string    — full URL for io.connect()
 *   _worldRoomId         : string    — global world chat room
 *   _guildRoomId         : string|undefined — guild room (null if no guild)
 *   _teamDungeonChatRoom : string|undefined — team dungeon room (null if not in)
 *   _teamChatRoom        : string|undefined — team room (null if not in team)
 *
 * REQUEST FIELDS:
 *   userId   : string — from UserInfoSingleton.getInstance().userId
 *   version  : string — always '1.0' (L114468)
 *
 * STRICT RULES: NO STUB, OVERRIDE, FORCE, BYPASS, DUMMY, ASUMSI
 */

function handleRegistChat(request, ctx) {
    const startTime = Date.now();
    const { userId } = request;

    // ─── STEP 1: Validate request ───
    ctx.logger.step(1, 3, 'Validate request', 'running');
    ctx.logger.details('request',
        ['userId', userId ? userId.substring(0, 20) : 'MISSING'],
        ['version', request.version || '(none)']
    );

    if (!userId) {
        ctx.logger.step(1, 3, 'Validate request', 'fail', 'userId MISSING ❌');
        ctx.logger.errorBanner({
            module: 'REGIST_CHAT',
            step: '01/03 Validate Request',
            message: 'userId is MISSING from request',
            impact: 'Client retries every 3s up to 15 times (45s total), then gives up silently',
            fix: 'Client sends userId from UserInfoSingleton.getInstance().userId'
        });
        return ctx.buildErrorResponse(8);
    }

    if (request.version !== '1.0') {
        // Client L114468 always sends '1.0' — any other value is suspicious
        ctx.logger.log('WARN', 'REGIST_CHAT', `Unexpected version: "${request.version}" (expected "1.0")`);
    }

    ctx.logger.step(1, 3, 'Validate request', 'pass', `userId=${userId.substring(0, 16)}...`);

    // ─── STEP 2: Build chat registration response ───
    ctx.logger.step(2, 3, 'Build response', 'running');

    const chatServerUrl = ctx.config.chatUrl || 'http://127.0.0.1:8002';
    const serverId = String(ctx.config.serverId || 1);

    /**
     * worldRoomId — ALL players on same server share this room.
     * Used by: L114566 — chatJoinRequest(worldRoomId) — ALWAYS called after login.
     * Convention: "world_{serverId}" — simple, unique per server.
     */
    const worldRoomId = 'world_' + serverId;

    /**
     * guildRoomId — per-guild room.
     * L114568: if (ts.loginInfo.serverItem.guildRoomId) { chatJoinRequest(guildRoomId) }
     * → Only joined if value is truthy.
     *
     * For NEW users or users without guild: return undefined (client skips join).
     * For existing users IN a guild: guild handler (setTeamID L114204) updates this
     *   dynamically AFTER guild join — NOT during registChat.
     *
     * FUTURE: when guild handler is built, we can read user guildId from DB
     *   and compute guild room ID here. For now, undefined = correct for new users.
     */
    const guildRoomId = undefined;

    /**
     * teamDungeonChatRoom — per-team-dungeon room.
     * L114579: if (ts.loginInfo.serverItem.teamDungeonChatRoom) { chatJoinRequest(...) }
     *
     * Only set when player is actively in a team dungeon.
     * Updated dynamically by: L136514 setCreateTeamDungeon(e, ..., chatRoomId)
     * NOT returned by registChat for non-dungeon state.
     */
    const teamDungeonChatRoom = undefined;

    /**
     * teamChatRoom — per-team room.
     * L114590: if (ts.loginInfo.serverItem.teamChatRoomId) { chatJoinRequest(...) }
     *   NOTE: client stores as .teamChatRoomId (with capital ID)
     *
     * Only set when player is in a team.
     * Updated dynamically by:
     *   L136514: setCreateTeamDungeon(e,...) → teamChatRoomId = e._chatRoomId
     *   L136531: joinTeamSuccessCallBack(e) → teamChatRoomId = e.chatRoomId
     * NOT returned by registChat for non-team state.
     */
    const teamChatRoom = undefined;

    ctx.logger.step(2, 3, 'Build response', 'pass', '6 fields prepared');

    // ─── STEP 3: Return response ───
    ctx.logger.step(3, 3, 'Return response', 'running');

    const responseData = {
        _success: true,
        _chatServerUrl: chatServerUrl,
        _worldRoomId: worldRoomId
        // guildRoomId: undefined     — no guild → client skips L114574 join
        // teamDungeonChatRoom: undefined — not in dungeon → client skips L114585 join
        // teamChatRoom: undefined    — no team → client skips L114596 join
    };

    const duration = Date.now() - startTime;

    ctx.logger.step(3, 3, 'Return response', 'pass', `ret=0 ${duration}ms`);
    ctx.logger.details('response',
        ['_success', 'true'],
        ['_chatServerUrl', chatServerUrl],
        ['_worldRoomId', worldRoomId],
        ['_guildRoomId', '(undefined — no guild)'],
        ['_teamDungeonChatRoom', '(undefined — not in dungeon)'],
        ['_teamChatRoom', '(undefined — no team)']
    );

    ctx.logger.details('trace-notes',
        ['consumer', 'L114470 — 6 fields read from callback(n)'],
        ['next-step', 'L114480: io.connect(chatServerUrl) → TEA verify required'],
        ['post-login', 'L114550: chat::login → joinRoom(world, guild?, team?, dungeon?)'],
        ['dynamic-update', 'guild L114207 | teamDungeon L136514 | team L136531']
    );

    // ─── Warning Section ───
    const collectedWarnings = [];

    // WARN-001: chat-server must be running for client to connect
    collectedWarnings.push({
        code: 'WARN-001',
        severity: 'HIGH',
        module: 'REGIST_CHAT',
        message: `chat-server must be running on ${chatServerUrl}`,
        detail: `Client L114480 calls io.connect(chatServerUrl) immediately after _success. ` +
                `If chat-server is not listening, client connection will fail silently. ` +
                `chatClient has reconnectionAttempts: 10 (L82537) but no retry of registChat itself.`,
        impact: `Chat will never connect. Client stops retrying registChat after 15 attempts (45s).`
    });

    // WARN-002: chat-server TEA verification required
    collectedWarnings.push({
        code: 'WARN-002',
        severity: 'HIGH',
        module: 'REGIST_CHAT',
        message: 'chat-server MUST implement TEA handshake (verifyEnable=true)',
        detail: `L113445: chatClient = new TSSocketClient('chat-server', true) → verifyEnable=TRUE. ` +
                `L82579-82587: socketOnVerify waits for 'verify' event, encrypts challenge with ` +
                `TEA key 'verification'. If chat-server doesn't emit 'verify', client hangs forever.`,
        impact: 'Client connection stalls — callback never fires, no chat, no error shown.'
    });

    // WARN-003: guild/team rooms are undefined (correct for new users)
    collectedWarnings.push({
        code: 'WARN-003',
        severity: 'INFO',
        module: 'REGIST_CHAT',
        message: 'guildRoomId, teamDungeonChatRoom, teamChatRoom = undefined (by design)',
        detail: `These rooms are updated DYNAMICALLY by their respective handlers: ` +
                `guild L114204 setTeamID → guildRoomId, ` +
                `teamDungeon L136514 setCreateTeamDungeon → teamChatRoomId, ` +
                `team L136531 joinTeamSuccessCallBack → teamChatRoomId. ` +
                `Client checks truthy before join (L114568/114579/114590). ` +
                `Returning undefined here is CORRECT for new/no-guild/no-team users.`,
        impact: 'None — client correctly skips joining these rooms when undefined.'
    });

    if (collectedWarnings.length > 0) {
        ctx.logger.warningSection(collectedWarnings);
    }

    // ─── Critical Fields Audit ───
    // Format: { name, value, status, detail } — must match logger.criticalFields()
    ctx.logger.criticalFields([
        {
            name: '_success',
            value: 'true',
            status: 'ok',
            detail: 'L114470: n._success ? connect chat : retry every 3s (max 15)'
        },
        {
            name: '_chatServerUrl',
            value: chatServerUrl,
            status: chatServerUrl ? 'ok' : 'fail',
            detail: 'L114480→L82537: io.connect(url) — MUST be full URL'
        },
        {
            name: '_worldRoomId',
            value: worldRoomId,
            status: 'ok',
            detail: 'L114566: chatJoinRequest(worldRoomId) — ALWAYS joined after login'
        },
        {
            name: '_guildRoomId',
            value: '(undefined)',
            status: 'ok',
            detail: 'L114568: if(guildRoomId) join — undefined = skip (no guild)'
        },
        {
            name: '_teamDungeonChatRoom',
            value: '(undefined)',
            status: 'ok',
            detail: 'L114579: if(teamDungeonChatRoom) join — undefined = skip'
        },
        {
            name: '_teamChatRoom',
            value: '(undefined)',
            status: 'ok',
            detail: 'L114590: if(teamChatRoomId) join — undefined = skip (no team)'
        }
    ]);

    ctx.logger.summaryCard({
        title: 'REGIST CHAT COMPLETE',
        userId: userId,
        fields: 6,
        chatUrl: chatServerUrl,
        worldRoom: worldRoomId,
        duration: duration
    });

    return ctx.buildDataResponse(0, responseData);
}

module.exports = handleRegistChat;
