/**
 * ============================================================
 * CHAT-SERVER.JS - DragonBall HTML5 Mock Chat Server
 * ============================================================
 * 
 * Purpose: Mock backend untuk chat server Socket.IO (Port 9997)
 *          Menangani semua komunikasi chat: world, guild, team
 * 
 * Dipanggil dari: 
 *   - user.registChat (mengembalikan chatServerUrl)
 *   - clientStartChat() → connect ke port 9997
 * 
 * Load Order: AFTER socket.io.min.js, BEFORE main.min.js
 * 
 * Handlers:
 *   - chat.login       → Login ke chat server
 *   - chat.joinRoom    → Join ke room chat
 *   - chat.leaveRoom   → Leave dari room chat
 *   - chat.sendMsg     → Kirim pesan
 *   - chat.getRecord   → Ambil history chat
 * 
 * Message Data Structure (ChatDataBaseClass) - VERIFIED from HAR:
 *   {
 *     _id: string,           // Message UUID (NOT user ID!)
 *     _time: number,         // Timestamp
 *     _kind: number,         // Tipe chat (0=WORLD, 1=GUILD, 2=TEAM, 3=WORLD_TEAM, 5=NOTIFY)
 *     _name: string,         // Nama pengirim
 *     _image: string,        // Head image (e.g. "hero_icon_1308")
 *     _headEffect: number,   // Head effect (HAR: number, not null)
 *     _headBox: number,      // Head box (HAR: number, not string)
 *     _content: string,      // Isi pesan
 *     _type: number,         // Message type (0=normal, 50=system notify)
 *     _param: any,           // Additional params (array for system messages)
 *     _oriServerId: number,  // Original server ID
 *     _serverId: number,     // Server ID
 *     _showMain: boolean     // Show in main chat
 *   }
 *   NOTE: NO _userId field in HAR! Only _id (message UUID)
 * 
 * Author: Local SDK Bridge
 * Version: 2.4.0
 * ============================================================
 * 
 * v2.4.0 Changelog (2026-04-05):
 *   FIX: CRITICAL - SyntaxError "undefined" is not valid JSON after chat.login!
 *     Root cause: chat.login handler returned {ret:0} WITHOUT data field.
 *     Game's processHandlerWithChat ALWAYS does JSON.parse(e.data), so e.data MUST exist.
 *     Before: return {ret:0} → e.data=undefined → JSON.parse(undefined) → CRASH!
 *     After:  return buildChatResponse({}) → e.data="{}" → JSON.parse("{}") → success!
 *     All chat handlers MUST use buildChatResponse() which includes ret, compress, data fields.
 *
 * v2.3.0 Changelog (2026-04-05):
 *   FIX: Verify ACK callback now async (setTimeout 5ms) to match real Socket.IO
 *     Real Socket.IO always delivers ACK callbacks asynchronously (network latency).
 *     Synchronous callback caused race conditions with game reconnect logic.
 *     The game's socketOnVerify success handler (e()) calls chatLoginRequest
 *     synchronously, which can trigger emit() before the verify emit returns.
 *   VERIFIED: Analyzed real server HAR (s49931-zd.pksilo.com:10507) - protocol confirmed:
 *     - Verify: server EVENT push → client encrypt → client EVENT with ACK → server ACK {ret:0}
 *     - Login: client EVENT → server ACK {ret:0}
 *     - joinRoom(empty): client EVENT → server ACK {ret:0, compress:false, data:"{}"}
 *     - joinRoom(msgs): client EVENT → server ACK {ret:0, compress:true, data:<LZString>}
 *     - All callbacks receive OBJECT (not array) - Socket.IO engine unwraps wire format
 *
 * v2.2.0 Changelog (2026-04-05):
 *   FIX: CRITICAL - Socket destroyed immediately after verify!
 *     Root cause: All ACK callbacks were double-wrapped in array [{}]
 *     Socket.IO wire format 4<id>[{"ret":0}] already wraps in array,
 *     so callback should receive the OBJECT directly, not [{}]
 *     Before: callback([{ret:0}]) → game sees n=[{ret:0}], n.ret=undefined → t.destroy()!
 *     After:  callback({ret:0})  → game sees n={ret:0}, n.ret=0 → success!
 *     Fixed in: verify event, _handleRequest callback, unknown event fallback
 *
 * v2.1.0 Changelog (2026-04-01):
 *   FIX: CRITICAL - Removed duplicate connect event (was firing TWICE)
 *     Constructor _trigger('connect') + on('connect') auto-trigger caused game to corrupt state
 *     Game received connect twice, resetting socket reference to null
 *   FIX: CRITICAL - Added missing Socket.IO interface properties:
 *     - disconnected (boolean, opposite of connected)
 *     - io (Manager mock with emit method) - game accesses socket.io.emit()
 *     - open() alias for connect()
 *   FIX: Verify event now fires from connect handler (50ms delay) not from on() registration
 *   FIX: _trigger checks socket.connected before firing listeners (prevents null errors)
 *   FIX: destroy() no longer clears eventListeners (prevents crash on pending timers)
 * 
 * v2.0.0 Changelog (2026-04-01):
 *   FIX: All responses now wrapped in array [{...}] matching Socket.IO ACK format
 *   FIX: buildChatResponse() no longer includes serverTime/server0Time (HAR verified)
 *   FIX: Verify token uses UUID format instead of 'chat_verify_...' (HAR verified)
 *   FIX: chat.joinRoom returns {} for empty rooms (HAR: data:"{}" not data:"{_record:[]}")
 *   FIX: Message structure matches HAR (removed _userId, _headEffect/_headBox are numbers)
 *   FIX: Verify emit callback wrapped in array [{ret:0}]
 *   FIX: No-handler fallback uses buildChatResponse format
 * ============================================================
 */

(function(window) {
    'use strict';

    // ========================================================
    // 1. STYLISH LOGGER
    // ========================================================
    var LOG = {
        prefix: '💬 [CHAT-SERVER]',
        styles: {
            title: 'background: linear-gradient(90deg, #06b6d4 0%, #3b82f6 100%); color: white; padding: 2px 8px; border-radius: 4px; font-weight: bold;',
            success: 'color: #22c55e; font-weight: bold;',
            info: 'color: #6b7280;',
            warn: 'color: #f59e0b; font-weight: bold;',
            error: 'color: #ef4444; font-weight: bold;',
            data: 'color: #8b5cf6;',
            separator: 'color: #6b7280;',
            socket: 'color: #ec4899; font-weight: bold;'
        },
        
        _log: function(level, icon, message, data) {
            var timestamp = new Date().toISOString().substr(11, 12);
            var style = this.styles[level] || this.styles.info;
            var format = '%c' + this.prefix + ' %c[' + timestamp + '] ' + icon + ' ' + message;
            
            if (data !== undefined) {
                console.log(format + ' %o', this.styles.title, style, data);
            } else {
                console.log(format, this.styles.title, style);
            }
        },
        
        title: function(message) {
            var line = '══════════════════════════════════════════════════════';
            console.log('%c' + this.prefix + ' %c' + line, this.styles.title, this.styles.separator);
            console.log('%c' + this.prefix + ' %c' + message, this.styles.title, this.styles.title);
            console.log('%c' + this.prefix + ' %c' + line, this.styles.title, this.styles.separator);
        },
        
        success: function(message, data) { this._log('success', '✅', message, data); },
        info: function(message, data) { this._log('info', 'ℹ️', message, data); },
        warn: function(message, data) { this._log('warn', '⚠️', message, data); },
        error: function(message, data) { this._log('error', '❌', message, data); },
        data: function(message, data) { this._log('data', '📊', message, data); },
        socket: function(message, data) { this._log('socket', '🔌', message, data); }
    };

    // ========================================================
    // 2. CONFIGURATION
    // ========================================================
    var CONFIG = {
        chatServerUrl: 'http://127.0.0.1:9997',
        maxMessagesPerRoom: 100
    };

    // ========================================================
    // 3. MESSAGE KIND CONSTANTS
    // ========================================================
    var MESSAGE_KIND = {
        WORLD: 0,
        GUILD: 1,
        TEAM: 2,
        WORLD_TEAM: 3
    };

    // ========================================================
    // 4. HELPER FUNCTIONS
    // ========================================================
    function getServerTime() {
        return Date.now();
    }
    
    function uuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0;
            var v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    
    /**
     * buildChatResponse - HAR-verified chat server response format
     * Real chat server does NOT include serverTime/server0Time!
     * HAR examples:
     *   chat.joinRoom  → [{"ret":0,"compress":false,"data":"{\"_record\":[...]}"}]
     *   chat.login     → [{"ret":0}]
     *   empty room     → [{"ret":0,"compress":false,"data":"{}"}]
     */
    function buildChatResponse(data) {
        return {
            ret: 0,
            compress: false,
            data: typeof data === 'string' ? data : JSON.stringify(data)
        };
    }
    
    // Keep old buildResponse for backward compatibility (used by main-server integration)
    function buildResponse(data) {
        return {
            ret: 0,
            data: typeof data === 'string' ? data : JSON.stringify(data),
            compress: false,
            serverTime: getServerTime(),
            server0Time: 14400000
        };
    }

    // ========================================================
    // 5. CHAT DATA STORAGE
    // ========================================================
    var CHAT_STORAGE_KEY = 'dragonball_chat_data';
    
    // Global chat rooms (shared across all users for world chat)
    var globalChatRooms = {};
    
    function getChatData(userId) {
        try {
            var stored = localStorage.getItem(CHAT_STORAGE_KEY + '_' + userId);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (e) {
            LOG.warn('Failed to load chat data:', e);
        }
        
        return {
            userId: userId,
            joinedRooms: []
        };
    }
    
    function saveChatData(userId, chatData) {
        try {
            localStorage.setItem(CHAT_STORAGE_KEY + '_' + userId, JSON.stringify(chatData));
        } catch (e) {
            LOG.warn('Failed to save chat data:', e);
        }
    }
    
    function getRoomMessages(roomId) {
        if (!globalChatRooms[roomId]) {
            globalChatRooms[roomId] = {
                messages: [],
                lastTime: 0
            };
        }
        return globalChatRooms[roomId];
    }

    // ========================================================
    // 6. REQUEST HANDLERS
    // ========================================================
    var RequestHandlers = {
        
        /**
         * ============================================================
         * Handler: chat.login
         * ============================================================
         * 
         * Purpose: Login ke chat server
         * Dipanggil dari: clientStartChat() → chatLoginRequest()
         * 
         * Request:
         *   { type: "chat", action: "login", userId, serverId, version: "1.0" }
         * 
         * Response:
         *   { _success: true }
         * 
         * Flow:
         *   registChat → clientStartChat → chat.login → joinRoom (world/guild/team)
         */
        login: function(request) {
            LOG.title('HANDLING: chat.login');
            LOG.data('Request:', request);
            
            var userId = request.userId;
            var serverId = request.serverId;
            
            // Initialize chat data for user
            var chatData = getChatData(userId);
            chatData.serverId = serverId;
            saveChatData(userId, chatData);
            
            LOG.success('Chat login successful for user:', userId);
            
            // MUST use buildChatResponse() - game's processHandlerWithChat does JSON.parse(e.data)
            // Without data field: e.data=undefined → JSON.parse(undefined) → SyntaxError!
            return buildChatResponse({});
        },
        
        /**
         * ============================================================
         * Handler: chat.joinRoom
         * ============================================================
         * 
         * Purpose: Join ke room chat (world/guild/team)
         * Dipanggil dari: chatLoginRequest() → chatJoinRequest()
         * 
         * Request:
         *   { type: "chat", action: "joinRoom", userId, roomId, version: "1.0" }
         * 
         * Response:
         *   { _record: { [msgId]: ChatMessageData, ... } }
         * 
         * ChatMessageData structure:
         *   {
         *     _id: userId,           // User ID pengirim
         *     _name: string,         // Nama pengirim
         *     _content: string,      // Isi pesan
         *     _time: number,         // Timestamp
         *     _kind: number,         // MESSAGE_KIND
         *     _image: string,        // Head image
         *     _type: number,         // Message type
         *     _param: any,           // Additional params
         *     _headEffect: any,      // Head effect
         *     _headBox: string,      // Head box ID
         *     _oriServerId: number,  // Original server ID
         *     _serverId: number,     // Server ID
         *     _showMain: boolean     // Show in main
         *   }
         */
        joinRoom: function(request) {
            LOG.title('HANDLING: chat.joinRoom');
            LOG.data('Request:', request);
            
            var userId = request.userId;
            var roomId = request.roomId;
            
            if (!roomId) {
                LOG.warn('No roomId provided');
                // HAR: empty room returns data:"{}"
                return buildChatResponse({});
            }
            
            // Get or create chat data
            var chatData = getChatData(userId);
            
            // Add room to joined list if not already
            if (chatData.joinedRooms.indexOf(roomId) === -1) {
                chatData.joinedRooms.push(roomId);
            }
            saveChatData(userId, chatData);
            
            // Get room messages
            var room = getRoomMessages(roomId);
            
            // HAR verified: _record is ARRAY of message objects
            // HAR entry 47: data:"{\"_record\":[{\"_id\":\"dd4827a0-...\",...}]}}"
            // HAR entry 48 (empty): data:"{}"
            var record = [];
            for (var i = 0; i < room.messages.length; i++) {
                record.push(room.messages[i]);
            }
            
            // Empty room → return {}  |  Messages → return {_record: [...]}
            var responseData = record.length > 0 ? { _record: record } : {};
            
            LOG.success('Joined room:', roomId);
            LOG.info('Messages in room:', room.messages.length);
            LOG.data('Response data:', responseData);
            
            // HAR: [{"ret":0,"compress":false,"data":"..."}]
            return buildChatResponse(responseData);
        },
        
        /**
         * ============================================================
         * Handler: chat.leaveRoom
         * ============================================================
         * 
         * Purpose: Leave dari room chat
         * Dipanggil dari: chatLeaveRequest()
         * 
         * Request:
         *   { type: "chat", action: "leaveRoom", userId, roomId, version: "1.0" }
         * 
         * Response:
         *   { _success: true }
         */
        leaveRoom: function(request) {
            LOG.title('HANDLING: chat.leaveRoom');
            LOG.data('Request:', request);
            
            var userId = request.userId;
            var roomId = request.roomId;
            
            if (!roomId) {
                LOG.warn('No roomId provided');
                return buildChatResponse({ _success: true });
            }
            
            // Get chat data
            var chatData = getChatData(userId);
            
            // Remove room from joined list
            var index = chatData.joinedRooms.indexOf(roomId);
            if (index > -1) {
                chatData.joinedRooms.splice(index, 1);
            }
            saveChatData(userId, chatData);
            
            LOG.success('Left room:', roomId);
            
            return buildChatResponse({ _success: true });
        },
        
        /**
         * ============================================================
         * Handler: chat.sendMsg
         * ============================================================
         * 
         * Purpose: Kirim pesan ke room chat
         * Dipanggil dari: ToolCommon.sendMsg()
         * 
         * Request:
         *   { 
         *     type: "chat", 
         *     action: "sendMsg", 
         *     userId, 
         *     kind,         // MESSAGE_KIND (WORLD/GUILD/TEAM/WORLD_TEAM)
         *     content,      // Isi pesan
         *     msgType,      // Message type (0 = normal, etc)
         *     param,        // Additional params
         *     roomId,       // Target room ID
         *     version: "1.0" 
         *   }
         * 
         * Response:
         *   { _time: timestamp }  // Timestamp pesan
         * 
         * Flow after sendMsg:
         *   - createLocalData() creates local chat data
         *   - addSystemInfoWithMyChat() adds to broadcast
         */
        sendMsg: function(request) {
            LOG.title('HANDLING: chat.sendMsg');
            LOG.data('Request:', request);
            
            var userId = request.userId;
            var roomId = request.roomId;
            var content = request.content;
            var kind = request.kind;
            var msgType = request.msgType || 0;
            var param = request.param || null;
            
            if (!roomId) {
                LOG.error('No roomId provided');
                return buildChatResponse({ _time: getServerTime() });
            }
            
            // Get user info
            var sdkUser = window.LOCAL_SDK ? window.LOCAL_SDK.user : null;
            var playerData = null;
            if (window.MAIN_SERVER_MOCK && window.MAIN_SERVER_MOCK.getPlayerData) {
                playerData = window.MAIN_SERVER_MOCK.getPlayerData(userId);
            }
            
            // Build user info
            var userName = 'Player';
            var headImage = '';
            var userLevel = 1;
            var headEffect = null;
            var headBox = '';
            var oriServerId = 1;
            var serverId = 1;
            
            if (playerData && playerData.user) {
                userName = playerData.user._nickName || 'Player';
                headImage = playerData.user._headImage || '';
                oriServerId = playerData.user._oriServerId || 1;
            }
            if (playerData) {
                userLevel = playerData.playerLevel || 1;
            }
            if (sdkUser) {
                userName = sdkUser.nickname || userName;
            }
            
            // Get room
            var room = getRoomMessages(roomId);
            
            // Create message
            var msgTime = getServerTime();
            var msgId = uuid();
            
            // Build message data matching HAR structure (entry 27/47)
            // HAR has NO _userId field! _id is message UUID.
            // _headEffect and _headBox are numbers (0), not null/string
            var newMessage = {
                _id: msgId,
                _time: msgTime,
                _kind: kind,
                _name: userName,
                _image: headImage,
                _headEffect: headEffect || 0,
                _headBox: headBox || 0,
                _content: content,
                _type: msgType,
                _param: param || [],
                _oriServerId: oriServerId,
                _serverId: serverId,
                _showMain: true
            };
            
            // Add to room messages (keep last N messages)
            room.messages.push(newMessage);
            if (room.messages.length > CONFIG.maxMessagesPerRoom) {
                room.messages.shift();
            }
            room.lastTime = msgTime;
            
            LOG.success('Message sent to room:', roomId);
            LOG.info('Content:', content);
            LOG.info('From:', userName);
            
            // HAR: [{"ret":0,"compress":false,"data":"{\"_time\":...}"}]
            return buildChatResponse({ _time: msgTime });
        },
        
        /**
         * ============================================================
         * Handler: chat.getRecord
         * ============================================================
         * 
         * Purpose: Ambil history chat dari room tertentu
         * Dipanggil dari: getTeamDungeonInfoRecord()
         * 
         * Request:
         *   { 
         *     type: "chat", 
         *     action: "getRecord", 
         *     userId, 
         *     roomId, 
         *     startTime,   // Ambil pesan setelah timestamp ini
         *     version: "1.0" 
         *   }
         * 
         * Response:
         *   { _record: { [msgId]: ChatMessageData, ... } }
         */
        getRecord: function(request) {
            LOG.title('HANDLING: chat.getRecord');
            LOG.data('Request:', request);
            
            var userId = request.userId;
            var roomId = request.roomId;
            var startTime = request.startTime || 0;
            
            if (!roomId) {
                LOG.warn('No roomId provided');
                return buildChatResponse({});
            }
            
            // Get room
            var room = getRoomMessages(roomId);
            
            // HAR: _record is ARRAY of message objects
            var record = [];
            for (var i = 0; i < room.messages.length; i++) {
                var msg = room.messages[i];
                if (msg._time > startTime) {
                    record.push(msg);
                }
            }
            
            var responseData = record.length > 0 ? { _record: record } : {};
            
            LOG.success('Got record from room:', roomId);
            LOG.info('Messages found:', record.length);
            LOG.info('StartTime filter:', startTime);
            
            return buildChatResponse(responseData);
        }
    };

    // ========================================================
    // 7. MOCK SOCKET CLASS
    // ========================================================
    function MockSocket(serverUrl) {
        var self = this;
        
        self.url = serverUrl;
        self.connected = false;
        self.disconnected = true;  // Socket.IO: opposite of connected
        self.eventListeners = {};
        self.id = 'mock_chat_socket_' + Date.now();
        
        // HAR-verified: Socket.IO socket must have 'io' (Manager) property
        // Game code accesses socket.io.emit() for some operations
        self.io = {
            emit: function() { LOG.socket('io.emit() called (no-op)'); },
            on: function() {},
            off: function() {}
        };
        
        LOG.socket('─────────────────────────────────────────');
        LOG.socket('MockSocket created');
        LOG.socket('URL:', serverUrl);
        LOG.socket('Socket ID:', self.id);
        LOG.socket('─────────────────────────────────────────');
        
        // Auto-connect after short delay (simulates real Socket.IO handshake)
        // HAR: handshake → server immediately pushes verify
        setTimeout(function() {
            self.connected = true;
            self.disconnected = false;
            self._trigger('connect');
            
            // HAR: after connect, server immediately pushes verify event
            // Fire verify 50ms after connect (gives game time to register verify listener)
            setTimeout(function() {
                if (self.connected) {
                    LOG.socket('🔥 SERVER EMIT: verify event to client');
                    var verifyToken = uuid();
                    self._trigger('verify', verifyToken);
                }
            }, 50);
        }, 10);
    }
    
    MockSocket.prototype = {
        
        on: function(event, callback) {
            LOG.socket('ON() Event: ' + event);
            
            if (!this.eventListeners[event]) {
                this.eventListeners[event] = [];
            }
            this.eventListeners[event].push(callback);
            
            // NOTE: NO auto-trigger for connect here!
            // Connect is triggered ONCE from constructor only.
            // Real Socket.IO: on('connect') fires callback only if already connected,
            // but since we trigger connect from constructor, the game registers
            // its connect handler BEFORE our setTimeout fires, so it works correctly.
        },
        
        off: function(event) {
            LOG.socket('OFF() Event: ' + event);
            this.eventListeners[event] = [];
        },
        
        emit: function(event, data, callback) {
            var self = this;
            
            LOG.socket('─────────────────────────────────────────');
            LOG.socket('EMIT() Event: ' + event);
            
            if (event === 'handler.process') {
                LOG.data('Request Data:', data);
                self._handleRequest(data, callback);
            } else if (event === 'verify') {
                LOG.socket('Client emit verify (encrypted token):', data);
                LOG.socket('Verify response - returning success');
                // HAR: 430[{"ret":0}] - Socket.IO wire: ACK id=0, args=[{ret:0}]
                // callback receives the OBJECT directly, NOT wrapped in array
                // CRITICAL: Must be async (setTimeout) to match real Socket.IO behavior!
                // Real server has network latency; game expects async callback.
                // Synchronous callback can cause reconnection race conditions.
                if (callback) {
                    setTimeout(function() {
                        LOG.socket('Verify callback fired (async)');
                        callback({ ret: 0 });
                    }, 5);
                }
            } else {
                LOG.warn('Unknown emit event: ' + event);
                if (callback) {
                    setTimeout(function() {
                        callback({ ret: 0 });
                    }, 5);
                }
            }
        },
        
        _handleRequest: function(request, callback) {
            var self = this;
            
            LOG.info('─────────────────────────────────────────');
            LOG.info('Processing request...');
            LOG.data('Type:', request.type);
            LOG.data('Action:', request.action);
            
            // Get handler
            var handler = RequestHandlers[request.action];
            
            if (handler) {
                var response = handler(request);
                
                LOG.success('Handler executed: chat.' + request.action);
                
                if (callback) {
                    setTimeout(function() {
                        // Socket.IO wire: 4<id>[{"ret":0,...}] → callback receives {ret:0,...}
                        // The wire format auto-wraps in array, so we pass the OBJECT directly
                        // HAR: chat.login → [{"ret":0}] on wire means callback({ret:0})
                        // HAR: chat.joinRoom → [{"ret":0,"compress":false,"data":"..."}] means callback({...})
                        LOG.socket('Calling callback with response');
                        callback(response);
                    }, 10);
                }
            } else {
                LOG.warn('No handler for action: ' + request.action);
                LOG.data('Full request:', request);
                
                if (callback) {
                    // No-handler: return empty success in chat format
                    callback(buildChatResponse({}));
                }
            }
        },
        
        _trigger: function(event, data) {
            LOG.socket('TRIGGER() Event: ' + event);
            
            // Guard: don't fire events on destroyed/disconnected sockets
            if (!this.connected && event !== 'disconnect') {
                LOG.warn('Skipping trigger on disconnected socket: ' + event);
                return;
            }
            
            var listeners = this.eventListeners[event];
            if (listeners) {
                for (var i = 0; i < listeners.length; i++) {
                    try {
                        listeners[i](data);
                    } catch (e) {
                        LOG.error('Error in listener: ' + e.message);
                    }
                }
            }
        },
        
        destroy: function() {
            LOG.socket('Socket destroyed: ' + this.id);
            this.connected = false;
            this.disconnected = true;
            // NOTE: Do NOT clear eventListeners here!
            // Pending setTimeout callbacks (like verify) may still fire
            // and try to access listeners. Clearing would cause different errors.
            // The _trigger guard (connected check) handles this instead.
        },
        
        connect: function() {
            LOG.socket('Socket connect() called');
            if (this.connected) return;
            this.connected = true;
            this.disconnected = false;
            this._trigger('connect');
        },
        
        open: function() {
            // Socket.IO alias for connect()
            return this.connect();
        },
        
        disconnect: function() {
            LOG.socket('Socket disconnect() called');
            this.connected = false;
            this.disconnected = true;
            this._trigger('disconnect');
        },
        
        sendToServer: function(request, callback) {
            LOG.socket('sendToServer() called');
            this._handleRequest(request, callback);
        }
    };

    // ========================================================
    // 8. INTERCEPT io.connect()
    // ========================================================
    function interceptSocketIO() {
        if (typeof window.io === 'undefined') {
            LOG.error('Socket.IO not found!');
            return;
        }
        
        var originalConnect = window.io.connect;
        
        if (!originalConnect) {
            LOG.error('io.connect not found!');
            return;
        }
        
        LOG.title('Intercepting io.connect() for Chat Server');
        
        window.io.connect = function(url, options) {
            LOG.socket('═══════════════════════════════════════════════════════════');
            LOG.socket('io.connect() called');
            LOG.socket('URL:', url);
            
            // Check if this is chat server URL (port 9997)
            var isChatServer = false;
            
            // Check from ts.loginInfo.serverItem.chaturl
            try {
                if (typeof ts !== 'undefined' && ts.loginInfo && ts.loginInfo.serverItem) {
                    var chatServerUrl = ts.loginInfo.serverItem.chaturl;
                    if (chatServerUrl && url.indexOf(chatServerUrl) !== -1) {
                        isChatServer = true;
                    }
                }
            } catch (e) {}
            
            // Also check by port
            if (url.indexOf('9997') !== -1 ||
                url.indexOf('127.0.0.1:9997') !== -1 ||
                url.indexOf('localhost:9997') !== -1) {
                isChatServer = true;
            }
            
            if (isChatServer) {
                LOG.success('✅ CHAT-SERVER DETECTED - Using MockSocket');
                LOG.socket('═══════════════════════════════════════════════════════════');
                return new MockSocket(url);
            } else {
                // Use original for other servers
                return originalConnect.call(window.io, url, options);
            }
        };
        
        LOG.success('io.connect() intercepted for Chat Server!');
    }

    // ========================================================
    // 9. INITIALIZE
    // ========================================================
    function init() {
        LOG.title('Chat-Server Mock v2.4.0 Initialized');
        LOG.info('Chat Server URL:', CONFIG.chatServerUrl);
        LOG.info('Max Messages Per Room:', CONFIG.maxMessagesPerRoom);
        LOG.info('');
        LOG.info('💡 Supported handlers:');
        LOG.info('   - chat.login       → Login to chat server');
        LOG.info('   - chat.joinRoom    → Join chat room');
        LOG.info('   - chat.leaveRoom   → Leave chat room');
        LOG.info('   - chat.sendMsg     → Send message');
        LOG.info('   - chat.getRecord   → Get chat history');
        
        interceptSocketIO();
    }

    // ========================================================
    // 10. EXPORT FOR DEBUGGING
    // ========================================================
    window.CHAT_SERVER_MOCK = {
        config: CONFIG,
        handlers: RequestHandlers,
        MockSocket: MockSocket,
        getChatData: getChatData,
        saveChatData: saveChatData,
        getRoomMessages: getRoomMessages,
        globalChatRooms: globalChatRooms,
        
        // Debug functions
        showRooms: function() {
            LOG.title('Current Chat Rooms');
            for (var roomId in globalChatRooms) {
                LOG.data(roomId + ':', globalChatRooms[roomId].messages.length + ' messages');
            }
        },
        
        clearRooms: function() {
            globalChatRooms = {};
            LOG.success('All chat rooms cleared');
        }
    };

    // ========================================================
    // 11. START
    // ========================================================
    if (typeof window.io !== 'undefined') {
        init();
    } else {
        var checkInterval = setInterval(function() {
            if (typeof window.io !== 'undefined') {
                clearInterval(checkInterval);
                init();
            }
        }, 50);
        
        setTimeout(function() {
            clearInterval(checkInterval);
            if (typeof window.io === 'undefined') {
                LOG.error('Timeout waiting for Socket.IO to load!');
            }
        }, 5000);
    }

})(window);