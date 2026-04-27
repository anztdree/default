/**
 * handlers/user/readBulletin.js
 *
 * Client request: type: 'user', action: 'readBulletin', userId, id (bulletinId)
 * Client response: { _bulletin: fullContent, _bulletinTitle, _bulletinVersion }
 */

var db = require('../../db');

module.exports = {
    execute: function (data, socket, ctx) {
        return new Promise(function (resolve) {
            var userId = data.userId;
            var bulletinId = data.id;
            if (!bulletinId) return resolve(ctx.buildErrorResponse(1));

            var row = db.getBulletin(bulletinId);
            if (!row) {
                return resolve(ctx.buildResponse({
                    _bulletin: '',
                    _bulletinTitle: '',
                    _bulletinVersion: '1'
                }));
            }

            resolve(ctx.buildResponse({
                _bulletin: row.content || '',
                _bulletinTitle: row.title || '',
                _bulletinVersion: row.version || '1'
            }));
        });
    }
};
