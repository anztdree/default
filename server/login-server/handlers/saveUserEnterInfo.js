/**
 * handlers/saveUserEnterInfo.js — Handler 4: Laporkan Entry Game
 *
 * Dipanggil SETELAH enterGame sukses di main-server.
 * Setelah callback, client destroy login socket (line 114459):
 *   ts.loginClient.destroy()
 *
 * Client call (line 114448):
 *   reportToLoginEnterInfo()
 *
 * Client request:
 *   {
 *     type: "User",
 *     action: "SaveUserEnterInfo",
 *     accountToken: ts.loginInfo.userInfo.userId,
 *     channelCode: ts.loginInfo.userInfo.channelCode,
 *     subChannel: "",
 *     createTime: UserInfoSingleton.getInstance().createTime,
 *     userLevel: UserInfoSingleton.getInstance().getUserLevel(),
 *     version: "1.0"
 *   }
 *
 * Client callback: ts.loginClient.destroy() — tidak pakai data response.
 * Response: {} kosong (data diabaikan client).
 */

function execute(data, socket, ctx) {
    var db = ctx.db;
    var buildResponse = ctx.buildResponse;

    var accountToken = (data.accountToken || '').trim();
    var channelCode = (data.channelCode || '').trim();
    var subChannel = (data.subChannel || '').trim();
    var createTime = data.createTime || 0;
    var userLevel = data.userLevel || 1;
    var now = Date.now();

    if (!accountToken) {
        return Promise.resolve(buildResponse({}));
    }

    return db.query(
        'INSERT INTO user_login_logs (user_id, channel_code, sub_channel, user_level, create_time, login_time) VALUES (?, ?, ?, ?, ?, ?)',
        [accountToken, channelCode, subChannel, userLevel, createTime, now]
    ).then(function () {
        console.log('[saveUserEnterInfo] userId=' + accountToken + ' level=' + userLevel);
        return buildResponse({});
    }).catch(function (err) {
        // Jangan gagal — client tetap harus destroy socket
        console.error('[saveUserEnterInfo] DB error:', err.message);
        return buildResponse({});
    });
}

module.exports = { execute: execute };
