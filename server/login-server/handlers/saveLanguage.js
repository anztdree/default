/**
 * handlers/saveLanguage.js — Handler 5: Simpan Preferensi Bahasa
 *
 * Client call (line 114279):
 *   ts.processHandlerWithLogin(request, true, successCb, failCb)
 *
 * Client request:
 *   {
 *     type: "User",
 *     action: "SaveLanguage",
 *     userid: ts.loginUserInfo.userId,
 *     sdk: ts.loginUserInfo.sdk,
 *     appid: "",
 *     language: <language code>
 *   }
 *
 * Client callback (line 114290):
 *   0 === t.errorCode → ts.closeWindow('LanguageList') + changeLanguage(language)
 *   else → console.log('failed save language') + close anyway
 *
 * Response: { errorCode: 0 }
 */

function execute(data, socket, ctx) {
    var db = ctx.db;
    var buildResponse = ctx.buildResponse;

    var userid = (data.userid || '').trim();
    var language = (data.language || 'en').trim();

    if (!userid) {
        return Promise.resolve(buildResponse({ errorCode: 0 }));
    }

    return db.query(
        'UPDATE users SET language = ? WHERE user_id = ?',
        [language, userid]
    ).then(function () {
        console.log('[saveLanguage] userId=' + userid + ' lang=' + language);
        return buildResponse({ errorCode: 0 });
    }).catch(function (err) {
        console.error('[saveLanguage] DB error:', err.message);
        return buildResponse({ errorCode: 0 });
    });
}

module.exports = { execute: execute };
