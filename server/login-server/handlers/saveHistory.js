/**
 * handlers/saveHistory.js — Handler 3: Pilih Server & Generate FINAL Token
 *
 * ⭐ PENTING: loginToken dari handler INI yang dipakai enterGame di main-server.
 * Token dari loginGame hanya sementara, akan di-overwrite oleh client (line 137914).
 *
 * Client call (line 137904):
 *   ts.processHandlerWithLogin(request, true, callback)
 *
 * Client request:
 *   {
 *     type: "User",
 *     action: "SaveHistory",
 *     accountToken: ts.loginInfo.userInfo.userId,
 *     channelCode: ts.loginInfo.userInfo.channelCode,
 *     serverId: ts.loginInfo.serverItem.serverId,
 *     securityCode: ts.loginInfo.userInfo.securityCode,
 *     subChannel: "",
 *     version: "1.0"
 *   }
 *
 * Client callback (line 137913-137921):
 *   e.loginToken && (ts.loginInfo.userInfo.loginToken = e.loginToken)
 *   e.todayLoginCount → report tracking (line 137918-137920)
 *   ts.clientStartGame(false) → connect ke main-server
 *
 * Response: { loginToken: "<hex>", todayLoginCount: <number> }
 */

function execute(data, socket, ctx) {
    var db = ctx.db;
    var buildResponse = ctx.buildResponse;
    var buildErrorResponse = ctx.buildErrorResponse;
    var crypto = ctx.crypto;

    var accountToken = (data.accountToken || '').trim();
    var channelCode = (data.channelCode || '').trim();
    var serverId = data.serverId;

    if (!accountToken || !serverId) {
        return Promise.resolve(buildErrorResponse(1));
    }

    // Generate FINAL loginToken
    var loginToken = crypto.randomBytes(32).toString('hex');
    var now = Date.now();
    var today = new Date().toISOString().slice(0, 10);

    // Step 1: Update user token + last login server
    return db.query(
        'UPDATE users SET login_token = ?, last_login_time = ?, last_login_server = ? WHERE user_id = ?',
        [loginToken, now, parseInt(serverId) || 0, accountToken]
    ).then(function () {
        // Step 2: Cek today login count
        return db.queryOne(
            'SELECT today_login_date, today_login_count FROM users WHERE user_id = ?',
            [accountToken]
        );
    }).then(function (user) {
        var todayLoginCount = 1;

        if (user && user.today_login_date === today) {
            todayLoginCount = (user.today_login_count || 0) + 1;
        }

        // Step 3: Update today login count
        return db.query(
            'UPDATE users SET today_login_count = ?, today_login_date = ? WHERE user_id = ?',
            [todayLoginCount, today, accountToken]
        ).then(function () {
            return todayLoginCount;
        });
    }).then(function (todayLoginCount) {
        // Step 4: Insert login history
        return db.query(
            'INSERT INTO login_history (user_id, server_id, channel_code, login_time) VALUES (?, ?, ?, ?)',
            [accountToken, parseInt(serverId) || 0, channelCode, now]
        ).then(function () {
            return todayLoginCount;
        });
    }).then(function (todayLoginCount) {
        console.log('[saveHistory] userId=' + accountToken + ' serverId=' + serverId + ' count=' + todayLoginCount);
        return buildResponse({
            loginToken: loginToken,
            todayLoginCount: todayLoginCount
        });
    });
}

module.exports = { execute: execute };
