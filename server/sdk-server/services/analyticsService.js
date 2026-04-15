/**
 * ============================================================================
 *  Analytics Service — Event logging & aggregation
 *  ============================================================================
 *
 *  Mengelola analytics data di data/analytics.json.
 *
 *  Data format (dari existing data/analytics.json):
 *  {
 *    "events": [
 *      {
 *        "id": "mnvwiqdk-3tujnaq1-1",
 *        "category": "lifecycle",
 *        "action": "pp_lifecycle",
 *        "data": { "event": "endLoadResource", ... },
 *        "userId": "1",
 *        "sessionId": "mnvwij5d-wcjf0zt4-2",
 *        "serverId": null,
 *        "serverName": null,
 *        "characterId": null,
 *        "characterName": null,
 *        "characterLevel": null,
 *        "sdk": "ppgame",
 *        "appId": "288",
 *        "pageUrl": "http://127.0.0.1:8080/?sdk=ppgame&...",
 *        "timestamp": "2026-04-12T22:11:17.000",
 *        "receivedAt": "2026-04-12T15:11:17.039Z"
 *      }
 *    ],
 *    "meta": {
 *      "totalEvents": 150,
 *      "lastFlush": "2026-04-12T15:11:17.039Z"
 *    }
 *  }
 *
 *  Category types yang diterima (dari existing data + sdk.js):
 *    - "lifecycle" — PP lifecycle events (pp_lifecycle)
 *    - "immediate" — Immediate events (game_ready)
 *    - "custom" — Custom events (custom_event)
 *    - "report" — Report events (session_end)
 *    - "sdk_report" — SDK report events (session_end)
 *    - "facebook_pixel" — Facebook Pixel
 *    - "google_analytics" — Google Analytics
 *    - "sdk_analytics" — SDK analytics
 *    - "payment" — Payment events
 *    - "auth" — Auth events
 *
 *  Action types yang diterima (dari existing data):
 *    - "pp_lifecycle" — PP platform lifecycle
 *    - "game_ready" — Game loaded
 *    - "custom_event" — Custom event with eventName/eventData
 *    - "session_end" — Session ended
 *
 * ============================================================================
 */

var fs = require('fs');
var path = require('path');
var store = require('../storage/jsonStore');
var CONSTANTS = require('../config/constants');

// File path
var ANALYTICS_FILE = store.buildPath('analytics.json');

// Archive directory path
var ARCHIVE_DIR = path.join(CONSTANTS.DATA_DIR, CONSTANTS.ANALYTICS_ARCHIVE_DIR);

// =============================================
// DATA ACCESS
// =============================================

/**
 * Load seluruh analytics data.
 * @returns {{ events: Array, meta: { totalEvents: number, lastFlush: string } }}
 */
function loadAnalytics() {
    var data = store.load(ANALYTICS_FILE, { events: [], meta: { totalEvents: 0, lastFlush: '' } });
    if (!data.events) data.events = [];
    if (!data.meta) data.meta = { totalEvents: 0, lastFlush: '' };
    return data;
}

/**
 * Save seluruh analytics data.
 * @param {Object} data
 * @returns {boolean}
 */
function saveAnalytics(data) {
    return store.save(ANALYTICS_FILE, data);
}

// =============================================
// EVENT OPERATIONS
// =============================================

/**
 * Normalize event object ke format standar.
 *
 * Menangani 2 format input:
 *   1. Format /api/analytics/event: { category, action, data, userId, sdkChannel, timestamp }
 *   2. Format /api/report/event & /api/report/batch: { category, eventType, eventData, userId, sessionId, ... }
 *
 * @param {Object} event - Raw event object
 * @returns {Object} Normalized event
 */
function normalizeEvent(event) {
    return {
        id: event.id || null,
        category: event.category || 'unknown',
        action: event.action || event.eventType || 'unknown',
        data: event.data || event.eventData || {},
        userId: event.userId || null,
        sessionId: event.sessionId || null,
        serverId: event.serverId || null,
        serverName: event.serverName || null,
        characterId: event.characterId || null,
        characterName: event.characterName || null,
        characterLevel: event.characterLevel || null,
        sdk: event.sdk || event.sdkChannel || 'unknown',
        appId: event.appId || null,
        pageUrl: event.pageUrl || null,
        timestamp: event.timestamp || new Date().toISOString(),
        receivedAt: new Date().toISOString()
    };
}

/**
 * Append single event.
 *
 * @param {Object} event - Raw event object
 */
function appendEvent(event) {
    var data = loadAnalytics();

    data.events.push(normalizeEvent(event));

    data.meta.totalEvents = (data.meta.totalEvents || 0) + 1;
    data.meta.lastFlush = new Date().toISOString();

    saveAnalytics(data);
}

/**
 * Append multiple events (batch).
 *
 * @param {Array<Object>} events - Array of raw event objects
 * @returns {number} Jumlah events yang di-append
 */
function appendEvents(events) {
    if (!Array.isArray(events) || events.length === 0) {
        return 0;
    }

    var data = loadAnalytics();

    for (var i = 0; i < events.length; i++) {
        data.events.push(normalizeEvent(events[i]));
    }

    data.meta.totalEvents = (data.meta.totalEvents || 0) + events.length;
    data.meta.lastFlush = new Date().toISOString();

    if (!saveAnalytics(data)) {
        return 0;
    }

    return events.length;
}

// =============================================
// DASHBOARD
// =============================================

/**
 * Get analytics dashboard data.
 *
 * Returns:
 *   - meta: total events, last flush time
 *   - totalEvents: filtered count
 *   - categoryStats: { categoryName: { count, actions: { actionName: count } } }
 *   - recentEvents: last N events
 *
 * @param {string} [category] - Filter by category
 * @param {number} [limit] - Max recent events (default 50)
 * @returns {{ meta: Object, totalEvents: number, categoryStats: Object, recentEvents: Array }}
 */
function getDashboard(category, limit) {
    var data = loadAnalytics();
    var events = data.events || [];

    // Filter by category
    if (category) {
        events = events.filter(function (e) {
            return e.category === category;
        });
    }

    // Compute category stats
    var categoryStats = {};
    for (var i = 0; i < events.length; i++) {
        var cat = events[i].category;
        if (!categoryStats[cat]) {
            categoryStats[cat] = { count: 0, actions: {} };
        }
        categoryStats[cat].count++;
        var action = events[i].action;
        if (!categoryStats[cat].actions[action]) {
            categoryStats[cat].actions[action] = 0;
        }
        categoryStats[cat].actions[action]++;
    }

    // Recent events (last N)
    var recentLimit = limit || 50;
    var recentEvents = events.slice(-recentLimit);

    return {
        meta: data.meta,
        totalEvents: events.length,
        categoryStats: categoryStats,
        recentEvents: recentEvents
    };
}

// =============================================
// ROTATION
// =============================================

/**
 * Rotate analytics file jika melebihi MAX_ANALYTICS_EVENTS.
 * Archive 80% events terlama ke file timestamped.
 *
 * Archive format: data/archive/analytics_2026-04-12T15-11-07-618Z.json
 * {
 *   "archivedAt": "2026-04-12T15:11:07.618Z",
 *   "eventCount": 40000,
 *   "events": [ ... ]
 * }
 */
function rotateIfNeeded() {
    try {
        var data = loadAnalytics();
        var events = data.events || [];

        if (events.length <= CONSTANTS.MAX_ANALYTICS_EVENTS) {
            return;
        }

        // Buat archive directory
        if (!fs.existsSync(ARCHIVE_DIR)) {
            fs.mkdirSync(ARCHIVE_DIR, { recursive: true });
        }

        // Archive 80% terlama
        var archiveCount = Math.floor(events.length * CONSTANTS.ANALYTICS_ARCHIVE_PERCENT);
        var archivedEvents = events.splice(0, archiveCount);

        var archiveFilename = path.join(
            ARCHIVE_DIR,
            'analytics_' + new Date().toISOString().replace(/[:.]/g, '-') + '.json'
        );

        store.save(archiveFilename, {
            archivedAt: new Date().toISOString(),
            eventCount: archivedEvents.length,
            events: archivedEvents
        });

        data.events = events;
        saveAnalytics(data);

        console.log('[Analytics] Rotated ' + archiveCount + ' events to archive (remaining: ' + events.length + ')');
    } catch (e) {
        console.error('[Analytics] Rotation error:', e.message);
    }
}

/**
 * Start periodic rotation interval.
 *
 * @returns {number} Interval ID
 */
function startRotationInterval() {
    return setInterval(rotateIfNeeded, CONSTANTS.ANALYTICS_ROTATION_INTERVAL_MS);
}

/**
 * Get total event count.
 * @returns {number}
 */
function getTotalEventCount() {
    var data = loadAnalytics();
    return data.meta ? data.meta.totalEvents || 0 : 0;
}

module.exports = {
    appendEvent: appendEvent,
    appendEvents: appendEvents,
    getDashboard: getDashboard,
    rotateIfNeeded: rotateIfNeeded,
    startRotationInterval: startRotationInterval,
    getTotalEventCount: getTotalEventCount
};
