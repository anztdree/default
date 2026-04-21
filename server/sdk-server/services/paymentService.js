/**
 * ============================================================================
 * SDK Server — Payment Service (Natural Implementation)
 * ============================================================================
 *
 * Payment logging in data/payments.json
 * 
 * NOTE: Actual payment approval/delivery happens in main-server (8001).
 * sdk-server ONLY logs orders from sdk.js.
 *
 * Flow (from main.min.js):
 * 1. Client taps buy → main-server prePayRet
 * 2. Client enriches with roleId/roleName/roleLevel/roleVip/serverName
 * 3. Client calls TSBrowser.executeFunction("paySdk", data)
 * 4. → sdk.js PPGAME.createPaymentOrder → POST /api/payment/create
 * 5. sdk-server logs order → returns orderId
 * 6. User confirms → POST /api/payment/verify → status confirmed
 * 7. Main-server delivers goods → PUSH notifyData("payFinish")
 *
 * ============================================================================
 */

const store = require('../storage/jsonStore');
const cryptoUtil = require('../utils/crypto');
const logger = require('../utils/logger');

const PAYMENTS_FILE = store.buildPath('payments.json');

// =============================================
// DATA ACCESS
// =============================================

/**
 * Load payments data
 * @returns {Object} Payments data with payments[] and nextOrderNum
 */
function loadPayments() {
    return store.load(PAYMENTS_FILE, {
        payments: [],
        nextOrderNum: 1,
        meta: { createdAt: new Date().toISOString() }
    });
}

/**
 * Save payments data atomically
 * @param {Object} data - Payments data
 * @returns {boolean} Success
 */
function savePayments(data) {
    return store.save(PAYMENTS_FILE, data);
}

// =============================================
// CREATE ORDER
// =============================================

/**
 * Create payment order from sdk.js
 * 
 * @param {Object} paymentData - Payment data from client
 * @returns {Object} Result with success, orderId, message
 */
function createOrder(paymentData) {
    const data = loadPayments();

    // Generate order ID if not provided
    let orderId = paymentData.orderId;
    if (!orderId) {
        orderId = cryptoUtil.generateOrderId(data.nextOrderNum);
        data.nextOrderNum = (data.nextOrderNum || 1) + 1;
    }

    // Normalize payment data
    const record = {
        orderId: orderId,
        userId: paymentData.roleId || paymentData.userId || 'unknown',
        roleName: paymentData.roleName || 'unknown',
        roleLevel: String(paymentData.roleLevel || 'unknown'),
        roleVip: String(paymentData.roleVip || '0'),
        serverName: paymentData.serverName || 'unknown',
        amount: parseFloat(paymentData.price || paymentData.totalPrice || paymentData.money || 0),
        goodsId: String(paymentData.goodsId || paymentData.goodId || 'unknown'),
        goodsName: paymentData.goodsName || `Item ${paymentData.goodsId || '?'}`,
        goodsNum: parseInt(paymentData.goodsNum || paymentData.goodNum || 1),
        currency: paymentData.currency || 'USD',
        channel: paymentData.channel || 'ppgame',
        appId: paymentData.appId || '288',
        sessionId: paymentData.sessionId || null,
        receivedAt: new Date().toISOString(),
        status: 'received'
    };

    data.payments.push(record);

    if (!savePayments(data)) {
        logger.error('Payment', `Failed to save order: ${orderId}`);
        return {
            success: false,
            orderId: orderId,
            message: 'Gagal menyimpan order'
        };
    }

    logger.info('Payment', `Order created: ${orderId} | ${record.roleName} | $${record.amount}`);

    return {
        success: true,
        orderId: orderId,
        message: 'Order berhasil dibuat'
    };
}

// =============================================
// PROCESS PAYMENT (Legacy)
// =============================================

/**
 * Legacy payment log (backward compatibility)
 * @param {Object} paymentData - Payment data
 * @returns {Object} Result
 */
function processPayment(paymentData) {
    return createOrder(paymentData);
}

// =============================================
// VERIFY PAYMENT
// =============================================

/**
 * Verify payment — status: received → confirmed
 * 
 * @param {string} orderId - Order ID
 * @param {string} userId - User ID (for logging)
 * @returns {Object} Result
 */
function verifyPayment(orderId, userId) {
    const data = loadPayments();
    let found = false;

    for (let i = 0; i < data.payments.length; i++) {
        if (data.payments[i].orderId === orderId) {
            data.payments[i].status = 'confirmed';
            data.payments[i].verifiedAt = new Date().toISOString();
            found = true;
            logger.info('Payment', `Verified: ${orderId} by ${userId}`);
            break;
        }
    }

    if (!found) {
        logger.warn('Payment', `Order not found: ${orderId}`);
        return {
            success: false,
            message: `Order tidak ditemukan: ${orderId}`
        };
    }

    if (!savePayments(data)) {
        return {
            success: false,
            message: 'Gagal menyimpan'
        };
    }

    return {
        success: true,
        message: 'Payment verified'
    };
}

// =============================================
// PAYMENT CALLBACK
// =============================================

/**
 * Payment callback — external status update
 * 
 * @param {string} orderId - Order ID
 * @param {string} status - New status
 * @param {Object} extraData - Extra callback data
 * @returns {Object} Result
 */
function paymentCallback(orderId, status, extraData) {
    // Validate status
    const validStatuses = ['received', 'confirmed', 'delivered', 'failed', 'refunded'];
    if (validStatuses.indexOf(status) === -1) {
        return {
            success: false,
            message: `Status tidak valid: ${status}`
        };
    }

    const data = loadPayments();
    let found = false;

    for (let i = 0; i < data.payments.length; i++) {
        if (data.payments[i].orderId === orderId) {
            data.payments[i].status = status;
            data.payments[i].callbackAt = new Date().toISOString();
            
            if (extraData) {
                data.payments[i].callbackData = extraData;
            }
            
            found = true;
            logger.info('Payment', `Callback: ${orderId} → ${status}`);
            break;
        }
    }

    if (!found) {
        return {
            success: false,
            message: `Order tidak ditemukan: ${orderId}`
        };
    }

    if (!savePayments(data)) {
        return {
            success: false,
            message: 'Gagal menyimpan'
        };
    }

    return {
        success: true,
        message: `Callback processed: ${status}`
    };
}

// =============================================
// LIST PAYMENTS
// =============================================

/**
 * List payments with optional filters
 * 
 * @param {Object} filters - Filter options
 * @returns {Object} List result with payments, count, total
 */
function listPayments(filters = {}) {
    const data = loadPayments();
    let payments = data.payments || [];

    // Apply filters
    if (filters.userId) {
        payments = payments.filter(p => p.userId === filters.userId);
    }
    if (filters.status) {
        payments = payments.filter(p => p.status === filters.status);
    }
    if (filters.goodsId) {
        payments = payments.filter(p => p.goodsId === filters.goodsId);
    }

    const total = payments.length;
    const limit = filters.limit || 100;
    
    // Get recent payments (last limit, reversed for newest first)
    const result = payments.slice(-limit).reverse();

    return {
        payments: result,
        count: result.length,
        total: total
    };
}

// =============================================
// STATS
// =============================================

/**
 * Get payment count
 * @returns {number} Total payments
 */
function getTotalCount() {
    const data = loadPayments();
    return (data.payments || []).length;
}

/**
 * Get payment stats
 * @returns {Object} Payment statistics
 */
function getStats() {
    const data = loadPayments();
    const payments = data.payments || [];

    const stats = {
        total: payments.length,
        byStatus: {},
        byChannel: {},
        totalAmount: 0,
        currencies: {}
    };

    for (const payment of payments) {
        // By status
        const status = payment.status || 'unknown';
        stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;

        // By channel
        const channel = payment.channel || 'unknown';
        stats.byChannel[channel] = (stats.byChannel[channel] || 0) + 1;

        // Total amount (in original currency)
        stats.totalAmount += payment.amount || 0;

        // By currency
        const currency = payment.currency || 'USD';
        if (!stats.currencies[currency]) {
            stats.currencies[currency] = 0;
        }
        stats.currencies[currency]++;
    }

    return stats;
}

/**
 * Get payment by order ID
 * @param {string} orderId - Order ID
 * @returns {Object|null} Payment record or null
 */
function getPayment(orderId) {
    const data = loadPayments();
    const payments = data.payments || [];

    for (const payment of payments) {
        if (payment.orderId === orderId) {
            return payment;
        }
    }
    return null;
}

// =============================================
// EXPORT
// =============================================

module.exports = {
    createOrder,
    processPayment,
    verifyPayment,
    paymentCallback,
    listPayments,
    getPayment,
    getTotalCount,
    getStats
};