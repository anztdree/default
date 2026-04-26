/**
 * handlers/getServerList.js — Handler 2: Return Daftar Server
 *
 * Client call (line 114402):
 *   ts.clientRequestServerList(userId, channelCode, callback)
 *
 * Client request:
 *   {
 *     type: "User",
 *     action: "GetServerList",
 *     userId: <userId>,
 *     subChannel: "",
 *     channel: <channelCode>
 *   }
 *
 * Client response (line 137995-138003):
 *   - t.serverList[] → filterByWhiteList → changeServerInfo → UI pilih server
 *   - t.history[] → auto-select last server
 *   - t.offlineReason → per-server offline message
 *
 * serverList item fields yang dibutuhkan client:
 *   serverId, name, url, chaturl, dungeonurl,
 *   worldRoomId, guildRoomId, teamDungeonChatRoom, teamChatRoomId,
 *   online, hot, new, offlineReason
 */

function execute(data, socket, ctx) {
    var db = ctx.db;
    var buildResponse = ctx.buildResponse;
    var userId = (data.userId || '').trim();

    return db.query(
        'SELECT * FROM servers ORDER BY sort_order ASC, server_id ASC'
    ).then(function (servers) {
        var serverList = servers.map(function (s) {
            return {
                serverId: String(s.server_id),
                name: s.server_name,
                url: s.url,
                chaturl: s.chat_url,
                dungeonurl: s.dungeon_url,
                worldRoomId: s.world_room_id,
                guildRoomId: s.guild_room_id,
                teamDungeonChatRoom: s.team_dungeon_chat_room,
                teamChatRoomId: '',
                online: !!s.status,
                hot: !!s.is_hot,
                new: !!s.is_new,
                offlineReason: s.offline_reason || ''
            };
        });

        if (!userId) {
            return buildResponse({
                serverList: serverList,
                history: [],
                offlineReason: ''
            });
        }

        // Last 5 server yang pernah dimain user (line 137998)
        return db.query(
            'SELECT DISTINCT server_id FROM login_history WHERE user_id = ? ORDER BY login_time DESC LIMIT 5',
            [userId]
        ).then(function (histRows) {
            var history = histRows.map(function (r) {
                return String(r.server_id);
            });
            return buildResponse({
                serverList: serverList,
                history: history,
                offlineReason: ''
            });
        });
    });
}

module.exports = { execute: execute };
