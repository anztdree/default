/**
 * ============================================================================
 *  SDK Server v3 — Analytics Handlers
 *  ============================================================================
 *
 *  Endpoints:
 *    POST /api/analytics/event     — Single event (fire-and-forget)
 *    GET  /api/analytics/dashboard  — Dashboard (admin)
 *
 *  /api/analytics/event vs /api/report/event:
 *    - analytics: { category, action, ... }
 *    - report:    { eventType, eventData, ... }
 *    Both normalize in analyticsService.
 *
 * ============================================================================
 */

var analyticsService = require('../services/analyticsService');

function event(req, res) {
    if (req.body && req.body.category && req.body.action) {
        analyticsService.appendEvent(req.body);
    }
    return res.json({ success: true });
}

function dashboard(req, res) {
    var category = req.query.category || null;
    var limit = parseInt(req.query.limit) || 50;

    var data = analyticsService.getDashboard(category, limit);

    res.json({
        success: true,
        meta: data.meta,
        totalEvents: data.totalEvents,
        categoryStats: data.categoryStats,
        recentEvents: data.recentEvents
    });
}

module.exports = {
    event: event,
    dashboard: dashboard
};
