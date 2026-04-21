/**
 * ============================================================================
 * SDK Server — Analytics Service (Natural Implementation)
 * ============================================================================
 *
 * Event logging & aggregation in data/analytics.json
 * 
 * Natural approach:
 * - Fire-and-forget endpoints (never block gameplay)
 * - Normalize different input formats
 * - Automatic rotation to prevent file bloat
 *
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');
const store = require('../storage/jsonStore');
const CONSTANTS = require('../config/constants');
const logger = require('../utils/logger');

const ANALYTICS_FILE = store.buildPath('analytics.json');
const ARCHIVE_DIR = path.join(CONSTANTS.DATA_DIR, CONSTANTS.ANALYTICS_ARCHIVE_DIR);

// =============================================
// DATA ACCESS
// =============================================

/**
 * Load analytics data
 * @returns {Object} Analytics data with events[] and meta{}
 */
function loadAnalytics() {
    const data = store.load(ANALYTICS_FILE, {
        events: [],
        meta: {
            totalEvents: 0,
            lastFlush: ''
        }
    });
    
    if (!data.events) data.events = [];
    if (!data.meta) data.meta = { totalEvents: 0, lastFlush: '' };
    
    return data;
}

/**
 * Save analytics data atomically
 * @param {Object} data - Analytics data
 * @returns {boolean} Success
 */
function saveAnalytics(data) {
    return store.save(ANALYTICS_FILE, data);
}

// =============================================
// NORMALIZE EVENT
// =============================================

/**
 * Normalize raw event to standard format
 * Handles 2 input formats:
 * 1. Analytics: { category, action, data, userId, ... }
 * 2. Report: { category, eventType, eventData, userId, sessionId, ... }
 * 
 * @param {Object} event - Raw event
 * @returns {Object} Normalized event
 */
function normalizeEvent(event) {
    return {
        // IDs
        id: event.id || null,
        userId: event.userId || null,
        sessionId: event.sessionId || null,
        
        // Character info
        serverId: event.serverId || null,
        serverName: event.serverName || null,
        characterId: event.characterId || null,
        characterName: event.characterName || null,
        characterLevel: event.characterLevel || null,
        
        // Categorization
        category: event.category || 'unknown',
        action: event.action || event.eventType || 'unknown',
        
        // Data
        data: event.data || event.eventData || {},
        
        // SDK info
        sdk: event.sdk || event.sdkChannel || null,
        appId: event.appId || null,
        
        // Context
        pageUrl: event.pageUrl || null,
        
        // Timestamps
        timestamp: event.timestamp || new Date().toISOString(),
        receivedAt: new Date().toISOString()
    };
}

// =============================================
// APPEND EVENTS
// =============================================

/**
 * Append single event (fire-and-forget)
 * Always returns success to client
 * 
 * @param {Object} event - Event data
 */
function appendEvent(event) {
    try {
        const data = loadAnalytics();
        
        data.events.push(normalizeEvent(event));
        data.meta.totalEvents = (data.meta.totalEvents || 0) + 1;
        data.meta.lastFlush = new Date().toISOString();
        
        saveAnalytics(data);
    } catch (error) {
        // Never fail - fire-and-forget
        logger.error('Analytics', `appendEvent failed: ${error.message}`);
    }
}

/**
 * Append multiple events (batch)
 * 
 * @param {Object[]} events - Array of events
 * @returns {number} Count appended (0 if failed)
 */
function appendEvents(events) {
    if (!Array.isArray(events) || events.length === 0) {
        return 0;
    }

    try {
        const data = loadAnalytics();
        
        for (const event of events) {
            data.events.push(normalizeEvent(event));
        }
        
        data.meta.totalEvents = (data.meta.totalEvents || 0) + events.length;
        data.meta.lastFlush = new Date().toISOString();

        if (saveAnalytics(data)) {
            return events.length;
        }
        return 0;
    } catch (error) {
        logger.error('Analytics', `appendEvents failed: ${error.message}`);
        return 0;
    }
}

// =============================================
// DASHBOARD
// =============================================

/**
 * Get analytics dashboard summary
 * 
 * @param {string} category - Optional filter
 * @param {number} limit - Max recent events (default 50)
 * @returns {Object} Dashboard data
 */
function getDashboard(category = null, limit = 50) {
    const data = loadAnalytics();
    let events = data.events || [];

    // Filter by category if specified
    if (category) {
        events = events.filter(e => e.category === category);
    }

    // Calculate stats
    const categoryStats = {};
    
    for (const event of events) {
        const cat = event.category || 'unknown';
        if (!categoryStats[cat]) {
            categoryStats[cat] = { count: 0, actions: {} };
        }
        categoryStats[cat].count++;
        
        const action = event.action || 'unknown';
        if (!categoryStats[cat].actions[action]) {
            categoryStats[cat].actions[action] = 0;
        }
        categoryStats[cat].actions[action]++;
    }

    // Get recent events (last 'limit' events)
    const recentEvents = events.slice(-(limit || 50));

    return {
        meta: data.meta,
        totalEvents: events.length,
        categoryStats,
        recentEvents
    };
}

// =============================================
// ROTATION
// =============================================

/**
 * Archive oldest events when exceeding MAX_ANALYTICS_EVENTS
 * Archives ANALYTICS_ARCHIVE_PERCENT (80%) of oldest events
 */
function rotateIfNeeded() {
    try {
        const data = loadAnalytics();
        const events = data.events || [];

        // Check if rotation needed
        if (events.length <= CONSTANTS.MAX_ANALYTICS_EVENTS) {
            return;
        }

        // Ensure archive directory exists
        if (!fs.existsSync(ARCHIVE_DIR)) {
            fs.mkdirSync(ARCHIVE_DIR, { recursive: true });
        }

        // Calculate how many to archive
        const archiveCount = Math.floor(events.length * CONSTANTS.ANALYTICS_ARCHIVE_PERCENT);
        const archived = events.splice(0, archiveCount);

        // Generate archive filename
        const timestamp = new Date().toISOString()
            .replace(/[:.]/g, '-')
            .replace('T', '_')
            .substring(0, 19);
        
        const archiveFile = path.join(ARCHIVE_DIR, `analytics_${timestamp}.json`);

        // Save archive
        store.save(archiveFile, {
            archivedAt: new Date().toISOString(),
            eventCount: archived.length,
            events: archived
        });

        // Save remaining events
        data.events = events;
        saveAnalytics(data);

        logger.info('Analytics', `Rotated ${archiveCount} events (remaining: ${events.length})`);
    } catch (error) {
        logger.error('Analytics', `Rotation error: ${error.message}`);
    }
}

/**
 * Start periodic rotation
 * @returns {Interval} Timer reference
 */
function startRotationInterval() {
    return setInterval(() => {
        rotateIfNeeded();
    }, CONSTANTS.ANALYTICS_ROTATION_INTERVAL_MS);
}

// =============================================
// STATS
// =============================================

/**
 * Get total event count
 * @returns {number} Total events
 */
function getTotalEventCount() {
    const data = loadAnalytics();
    return data.meta ? data.meta.totalEvents || 0 : 0;
}

/**
 * Get full stats
 * @returns {Object} Analytics statistics
 */
function getStats() {
    const data = loadAnalytics();
    const events = data.events || [];

    const stats = {
        totalEvents: data.meta?.totalEvents || 0,
        currentEvents: events.length,
        lastFlush: data.meta?.lastFlush || null,
        categories: {}
    };

    for (const event of events) {
        const cat = event.category || 'unknown';
        if (!stats.categories[cat]) {
            stats.categories[cat] = 0;
        }
        stats.categories[cat]++;
    }

    // Archive stats
    let archiveCount = 0;
    let archiveFiles = [];
    
    if (fs.existsSync(ARCHIVE_DIR)) {
        const files = fs.readdirSync(ARCHIVE_DIR);
        for (const file of files) {
            if (file.startsWith('analytics_') && file.endsWith('.json')) {
                archiveCount++;
                archiveFiles.push(file);
            }
        }
    }

    stats.archiveFiles = archiveCount;
    stats.archiveList = archiveFiles.slice(-10); // Last 10

    return stats;
}

// =============================================
// EXPORT
// =============================================

module.exports = {
    appendEvent,
    appendEvents,
    getDashboard,
    rotateIfNeeded,
    startRotationInterval,
    getTotalEventCount,
    getStats
};