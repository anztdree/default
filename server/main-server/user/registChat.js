/**
 * ============================================================
 * REGISTCHAT.JS - Mock Handler for user.registChat
 * ============================================================
 * 
 * Purpose: Registers chat server connection URLs and room IDs
 * Called every 3 seconds by game client until success
 * Response provides chat server URL + room IDs for world/team dungeon chat
 * 
 * HAR Reference: s398-zd.pksilo.com_2026_04_01_22_14_53.har
 * HAR Entries: #89 (POST req) + #90 (GET resp), #945 (GET resp) + #946 (POST req)
 * HAR Response fields (8): type, action, userId, version,
 *   _chatServerUrl, _worldRoomId, _teamDungeonChatRoom, _success
 * 
 * Based on real server HAR data structure
 * 
 * Author: Local SDK Bridge
 * Version: 1.1.0
 * ============================================================
 * 
 * v1.1.0 Changelog:
 *   FIX: Extract hardcoded key ke constant CHAT_ROOMS_KEY
 *   FIX: Empty catch blocks sekarang log warning
 * ============================================================
 */

(function(window) {
    'use strict';

    var LOG = {
        prefix: '💬 [REGISTCHAT]',
        _log: function(level, icon, message, data) {
            var timestamp = new Date().toISOString().substr(11, 12);
            var styles = {
                success: 'color: #22c55e; font-weight: bold;',
                info: 'color: #6b7280;',
                warn: 'color: #f59e0b; font-weight: bold;',
                error: 'color: #ef4444; font-weight: bold;'
            };
            var style = styles[level] || styles.info;
            var format = '%c' + this.prefix + ' ' + icon + ' [' + timestamp + '] ' + message;
            if (data !== undefined) {
                console.log(format + ' %o', style, data);
            } else {
                console.log(format, style);
            }
        },
        success: function(msg, data) { this._log('success', '✅', msg, data); },
        info: function(msg, data) { this._log('info', 'ℹ️', msg, data); },
        warn: function(msg, data) { this._log('warn', '⚠️', msg, data); },
        error: function(msg, data) { this._log('error', '❌', msg, data); }
    };

    /**
     * Generate UUID v4 (matching real server format)
     */
    function generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0;
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
    }

    // FIXED: Extract key ke constant agar konsisten
    var CHAT_ROOMS_KEY = 'dragonball_chat_rooms_';

    /**
     * Generate stable room IDs (same IDs per userId, persisted)
     * Real server generates UUIDs but they stay the same for a user
     */
    function getRoomIds(userId) {
        var key = CHAT_ROOMS_KEY + userId;
        try {
            var stored = localStorage.getItem(key);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (e) { LOG.warn('Failed to load chat rooms:', e); }

        var rooms = {
            worldRoomId: generateUUID(),
            teamDungeonChatRoom: generateUUID()
        };

        try {
            localStorage.setItem(key, JSON.stringify(rooms));
        } catch (e) { LOG.warn('Failed to save chat rooms:', e); }

        return rooms;
    }

    /**
     * Handler for user.registChat
     * Registered via window.MAIN_SERVER_HANDLERS
     */
    function handleRegistChat(request, playerData) {
        LOG.info('Handling user.registChat');
        LOG.info('UserId:', request.userId);

        var rooms = getRoomIds(request.userId);

        var responseData = {
            type: 'user',
            action: 'registChat',
            userId: request.userId,
            version: '1.0',
            _chatServerUrl: 'http://127.0.0.1:9997',
            _worldRoomId: rooms.worldRoomId,
            _teamDungeonChatRoom: rooms.teamDungeonChatRoom,
            _success: true
        };

        LOG.success('registChat success');
        LOG.info('chatServerUrl: ' + responseData._chatServerUrl);
        LOG.info('worldRoomId: ' + responseData._worldRoomId);
        LOG.info('teamDungeonChatRoom: ' + responseData._teamDungeonChatRoom);

        return responseData;
    }

    // ========================================================
    // REGISTER HANDLER
    // ========================================================
    // entergame.js checks window.MAIN_SERVER_HANDLERS for external handlers
    // The routing logic in _handleRequest does:
    //   1. Check window.MAIN_SERVER_HANDLERS["user.registChat"]
    //   2. If found, call handler, then wrap result with buildResponse()
    // ========================================================
    function register() {
        if (typeof window === 'undefined') {
            console.error('[REGISTCHAT] window not available');
            return;
        }

        window.MAIN_SERVER_HANDLERS = window.MAIN_SERVER_HANDLERS || {};
        window.MAIN_SERVER_HANDLERS['user.registChat'] = handleRegistChat;

        LOG.success('Handler registered: user.registChat');
        LOG.info('Chat server URL: http://127.0.0.1:9997');
    }

    // Auto-register
    if (typeof window !== 'undefined') {
        register();
    } else {
        var _check = setInterval(function() {
            if (typeof window !== 'undefined') {
                clearInterval(_check);
                register();
            }
        }, 50);
        setTimeout(function() { clearInterval(_check); }, 10000);
    }

})(window);
