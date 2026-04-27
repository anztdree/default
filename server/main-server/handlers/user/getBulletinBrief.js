/**
 * handlers/user/getBulletinBrief.js
 *
 * Client request (line 121087-121091):
 *   type: 'user', action: 'getBulletinBrief', userId, version: '1.0'
 *
 * Client response (line 121093-121101):
 *   { _brief: { "<bulletinId>": { title, version, order } } }
 */

var db = require('../../db');

function safeParse(str, fallback) {
    if (str === null || str === undefined) return fallback;
    if (typeof str === 'object') return str;
    try { return JSON.parse(str); }
    catch (e) { return fallback; }
}

module.exports = {
    execute: function (data, socket, ctx) {
        return new Promise(function (resolve) {
            var bulletins = db.getBulletins();
            var brief = {};

            for (var i = 0; i < bulletins.length; i++) {
                var b = bulletins[i];
                brief[b.id] = {
                    title: b.title || '',
                    version: b.version || '1',
                    order: b.order || 0
                };
            }

            resolve(ctx.buildResponse({ _brief: brief }));
        });
    }
};
