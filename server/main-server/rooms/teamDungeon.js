/**
 * =====================================================
 *  rooms/teamDungeon.js — Team Dungeon Room Manager
 *  Super Warrior Z Game Server — Main Server
 *
 *  Manages team dungeon rooms where multiple players
 *  can form a party and run dungeons together.
 *
 *  Client flow:
 *    1. Player creates/joins a room via teamDungeon handler
 *    2. Room creator invites friends or opens to public
 *    3. When room is full, any member can start the dungeon
 *    4. All members connect to dungeon-server (port 8003)
 *    5. Dungeon results are reported back to main-server
 *
 *  Room lifecycle:
 *    CREATED → WAITING → (members join) → READY → IN_PROGRESS → COMPLETED
 *
 *  Client connects to dungeon-server using:
 *    ts.loginInfo.serverItem.dungeonurl
 *    TeamworkManager.teamServerHttpUrl
 *
 *  Usage:
 *    var Rooms = require('./rooms');
 *    Rooms.createRoom(ownerId, dungeonId);
 *    Rooms.joinRoom(roomId, userId);
 *    Rooms.startDungeon(roomId);
 * =====================================================
 */

'use strict';

var helpers = require('../utils/helpers');

/**
 * Room state enumeration.
 * @enum {string}
 */
var ROOM_STATE = {
    CREATED: 'created',
    WAITING: 'waiting',
    READY: 'ready',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    DISBANDED: 'disbanded'
};

/**
 * Maximum members per team dungeon room.
 * @type {number}
 */
var MAX_ROOM_MEMBERS = 3;

/**
 * Room timeout — auto-disband after 10 minutes of inactivity.
 * @type {number}
 */
var ROOM_TIMEOUT_MS = 10 * 60 * 1000;

/**
 * In-memory room storage.
 * Key: roomId (string), Value: room object
 * @type {Object.<string, object>}
 */
var _rooms = {};

/**
 * Map of userId -> roomId for quick lookup.
 * @type {Object.<number, string>}
 */
var _userRoomMap = {};

/**
 * Room ID counter.
 * @type {number}
 */
var _nextRoomId = 1;

/**
 * Generate a unique room ID.
 * Format: "room_<timestamp>_<counter>"
 * @returns {string}
 * @private
 */
function _generateRoomId() {
    var id = 'room_' + Date.now() + '_' + (_nextRoomId++);
    return id;
}

/**
 * Create a new team dungeon room.
 *
 * @param {number} ownerId - Creator's userId (becomes room leader)
 * @param {string|number} dungeonId - Dungeon configuration ID
 * @param {object} [options] - Additional room options
 * @param {boolean} [options.isPublic=false] - Whether room is open to public
 * @param {string} [options.name=''] - Room display name
 * @returns {{ success: boolean, roomId: string|null, reason: string|null }}
 */
function createRoom(ownerId, dungeonId, options) {
    options = options || {};

    // Check if user is already in a room
    if (_userRoomMap[ownerId]) {
        return {
            success: false,
            roomId: null,
            reason: 'User is already in a room: ' + _userRoomMap[ownerId]
        };
    }

    var roomId = _generateRoomId();
    var room = {
        roomId: roomId,
        dungeonId: dungeonId,
        owner: ownerId,
        members: [{
            userId: ownerId,
            isReady: false,
            joinedAt: Date.now()
        }],
        state: ROOM_STATE.WAITING,
        isPublic: options.isPublic || false,
        name: options.name || '',
        maxMembers: MAX_ROOM_MEMBERS,
        createdAt: Date.now(),
        lastActivityAt: Date.now(),
        startedAt: null
    };

    _rooms[roomId] = room;
    _userRoomMap[ownerId] = roomId;

    console.log('[Rooms] Room created: ' + roomId +
        ' by user ' + ownerId + ' for dungeon ' + dungeonId);

    return { success: true, roomId: roomId, reason: null };
}

/**
 * Join an existing room.
 *
 * @param {string} roomId - Room ID to join
 * @param {number} userId - User ID joining the room
 * @returns {{ success: boolean, reason: string|null, memberCount: number }}
 */
function joinRoom(roomId, userId) {
    // Check if user is already in a room
    if (_userRoomMap[userId]) {
        return {
            success: false,
            reason: 'User is already in a room: ' + _userRoomMap[userId],
            memberCount: 0
        };
    }

    var room = _rooms[roomId];
    if (!room) {
        return { success: false, reason: 'Room not found: ' + roomId, memberCount: 0 };
    }

    if (room.state !== ROOM_STATE.WAITING && room.state !== ROOM_STATE.READY) {
        return { success: false, reason: 'Room is not joinable (state: ' + room.state + ')', memberCount: room.members.length };
    }

    if (room.members.length >= room.maxMembers) {
        return { success: false, reason: 'Room is full', memberCount: room.members.length };
    }

    room.members.push({
        userId: userId,
        isReady: false,
        joinedAt: Date.now()
    });

    room.lastActivityAt = Date.now();
    _userRoomMap[userId] = roomId;

    console.log('[Rooms] User ' + userId + ' joined room ' + roomId +
        ' (members: ' + room.members.length + '/' + room.maxMembers + ')');

    return { success: true, reason: null, memberCount: room.members.length };
}

/**
 * Leave a room.
 *
 * @param {string} roomId - Room ID
 * @param {number} userId - User ID leaving
 * @returns {{ success: boolean, reason: string|null, disbanded: boolean }}
 */
function leaveRoom(roomId, userId) {
    var room = _rooms[roomId];
    if (!room) {
        return { success: false, reason: 'Room not found', disbanded: false };
    }

    // Find and remove member
    var memberIndex = -1;
    for (var i = 0; i < room.members.length; i++) {
        if (room.members[i].userId === userId) {
            memberIndex = i;
            break;
        }
    }

    if (memberIndex === -1) {
        return { success: false, reason: 'User not in room', disbanded: false };
    }

    room.members.splice(memberIndex, 1);
    delete _userRoomMap[userId];

    var disbanded = false;

    if (userId === room.owner) {
        // Owner left — disband the room
        disbanded = true;
        _disbandRoom(roomId, 'Owner left the room');
    } else if (room.members.length === 0) {
        // Last member left — disband
        disbanded = true;
        _disbandRoom(roomId, 'Room is empty');
    }

    console.log('[Rooms] User ' + userId + ' left room ' + roomId +
        (disbanded ? ' (room disbanded)' : ''));

    return { success: true, reason: null, disbanded: disbanded };
}

/**
 * Get room info by room ID.
 *
 * @param {string} roomId - Room ID
 * @returns {object|null} Room object or null if not found
 */
function getRoom(roomId) {
    if (_rooms[roomId]) {
        return helpers.deepClone(_rooms[roomId]);
    }
    return null;
}

/**
 * Get the room a user is currently in.
 *
 * @param {number} userId - User ID
 * @returns {object|null} Room object or null if not in a room
 */
function getUserRoom(userId) {
    var roomId = _userRoomMap[userId];
    if (roomId) {
        return getRoom(roomId);
    }
    return null;
}

/**
 * Get room ID for a user.
 *
 * @param {number} userId - User ID
 * @returns {string|null} Room ID or null
 */
function getUserRoomId(userId) {
    return _userRoomMap[userId] || null;
}

/**
 * Get all active rooms.
 *
 * @returns {Array<object>} Array of room objects
 */
function getAllRooms() {
    var rooms = [];
    var roomIds = Object.keys(_rooms);
    for (var i = 0; i < roomIds.length; i++) {
        rooms.push(helpers.deepClone(_rooms[roomIds[i]]));
    }
    return rooms;
}

/**
 * Get count of active rooms.
 *
 * @returns {number}
 */
function getRoomCount() {
    return Object.keys(_rooms).length;
}

/**
 * Clean up expired rooms (timeout check).
 *
 * @returns {number} Number of rooms cleaned up
 */
function cleanupExpiredRooms() {
    var now = Date.now();
    var expired = [];

    var roomIds = Object.keys(_rooms);
    for (var i = 0; i < roomIds.length; i++) {
        var roomId = roomIds[i];
        var room = _rooms[roomId];
        if (now - room.lastActivityAt > ROOM_TIMEOUT_MS) {
            expired.push(roomId);
        }
    }

    for (var j = 0; j < expired.length; j++) {
        _disbandRoom(expired[j], 'Room timed out');
    }

    if (expired.length > 0) {
        console.log('[Rooms] Cleaned up ' + expired.length + ' expired rooms');
    }

    return expired.length;
}

/**
 * Disband a room and remove all references.
 *
 * @param {string} roomId - Room ID
 * @param {string} [reason=''] - Reason for disbanding
 * @private
 */
function _disbandRoom(roomId, reason) {
    var room = _rooms[roomId];
    if (!room) return;

    // Remove all user references
    for (var i = 0; i < room.members.length; i++) {
        var userId = room.members[i].userId;
        if (_userRoomMap[userId] === roomId) {
            delete _userRoomMap[userId];
        }
    }

    room.state = ROOM_STATE.DISBANDED;
    delete _rooms[roomId];

    console.log('[Rooms] Room disbanded: ' + roomId + (reason ? ' (' + reason + ')' : ''));
}

/**
 * Reset all rooms (for testing/server restart).
 */
function resetAll() {
    _rooms = {};
    _userRoomMap = {};
    _nextRoomId = 1;
    console.log('[Rooms] All rooms reset');
}

module.exports = {
    ROOM_STATE: ROOM_STATE,
    MAX_ROOM_MEMBERS: MAX_ROOM_MEMBERS,
    ROOM_TIMEOUT_MS: ROOM_TIMEOUT_MS,
    createRoom: createRoom,
    joinRoom: joinRoom,
    leaveRoom: leaveRoom,
    getRoom: getRoom,
    getUserRoom: getUserRoom,
    getUserRoomId: getUserRoomId,
    getAllRooms: getAllRooms,
    getRoomCount: getRoomCount,
    cleanupExpiredRooms: cleanupExpiredRooms,
    resetAll: resetAll
};
