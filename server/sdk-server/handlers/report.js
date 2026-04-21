/**
 * ============================================================================
 *  SDK Server v3 — Report Handlers
 *  ============================================================================
 *
 *  Endpoints:
 *    POST /api/report/event  — Single report (fire-and-forget)
 *    POST /api/report/batch  — Batch from sdk.js flushReportQueue()
 *
 *  ALWAYS returns { success: true } — reports must never fail.
 *  sdk.js re-queues on failure.
 *
 * ============================================================================
 */

var analyticsService = require('../services/analyticsService');

function event(req, res) {
    if (req.body && req.body.eventType) {
        analyticsService.appendEvent(req.body);
    }
    return res.json({ success: true });
}

function batch(req, res) {
    var reports = (req.body && req.body.reports) || [];
    if (Array.isArray(reports) && reports.length > 0) {
        var count = analyticsService.appendEvents(reports);
        return res.json({ success: true, count: count });
    }
    return res.json({ success: true });
}

module.exports = {
    event: event,
    batch: batch
};
