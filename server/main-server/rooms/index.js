/**
 * =====================================================
 *  rooms/index.js — Rooms Module Export
 *  Super Warrior Z Game Server — Main Server
 *
 *  Re-exports team dungeon room manager for convenient access.
 *
 *  Usage:
 *    var Rooms = require('./rooms');
 *    Rooms.createRoom(ownerId, dungeonId);
 *    Rooms.joinRoom(roomId, userId);
 * =====================================================
 */

'use strict';

module.exports = require('./teamDungeon');
