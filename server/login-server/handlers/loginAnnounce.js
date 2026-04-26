/**
 * handlers/loginAnnounce.js — Login Announcement/Notice
 *
 * Dipanggil setelah loginGame sukses (line 138128 getNotice).
 * Response: { data: [] } — array kosong = tidak ada notice.
 */

function execute(data, socket, ctx) {
    var buildResponse = ctx.buildResponse;
    return Promise.resolve(buildResponse({ data: [] }));
}

module.exports = { execute: execute };
