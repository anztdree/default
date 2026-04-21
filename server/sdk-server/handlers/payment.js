/**
 * ============================================================================
 *  SDK Server v3 — Payment Handlers
 *  ============================================================================
 *
 *  Endpoints:
 *    POST /api/payment/process   — Legacy payment log
 *    POST /api/payment/create    — Create order (from sdk.js)
 *    POST /api/payment/verify    — Verify payment (from sdk.js confirm)
 *    POST /api/payment/callback  — External callback
 *
 *  Payment APPROVAL happens in main-server (8001).
 *  sdk-server ONLY logs orders from sdk.js.
 *
 * ============================================================================
 */

var paymentService = require('../services/paymentService');
var logger = require('../utils/logger');

function process(req, res) {
    if (!req.body) {
        return res.json({ success: false, message: 'No payment data' });
    }
    return res.json(paymentService.processPayment(req.body));
}

function create(req, res) {
    if (!req.body || !req.body.goodsId) {
        return res.json({ success: false, message: 'Missing goodsId' });
    }
    return res.json(paymentService.createOrder(req.body));
}

function verify(req, res) {
    var orderId = req.body.orderId;
    var userId = req.body.userId;

    if (!orderId) {
        return res.json({ success: false, message: 'Order ID diperlukan' });
    }
    return res.json(paymentService.verifyPayment(orderId, userId || 'unknown'));
}

function callback(req, res) {
    var orderId = req.body.orderId;
    var status = req.body.status;
    var extra = req.body.data;

    if (!orderId || !status) {
        return res.json({ success: false, message: 'Order ID dan status diperlukan' });
    }
    return res.json(paymentService.paymentCallback(orderId, status, extra));
}

module.exports = {
    process: process,
    create: create,
    verify: verify,
    callback: callback
};
