/**
 * ============================================================================
 *  Payment Service — Log & manage payment data
 *  ============================================================================
 *
 *  Mengelola payment data di data/payments.json.
 *
 *  Data format:
 *  {
 *    "payments": [
 *      {
 *        "orderId": "ORD000001_mnvwiabc_7b367e2d",
 *        "userId": "1",
 *        "roleName": "GUEST_1",
 *        "roleLevel": "30",
 *        "roleVip": "5",
 *        "serverName": "Server 1",
 *        "amount": 9.99,
 *        "goodsId": "1001",
 *        "goodsName": "Monthly Card",
 *        "channel": "ppgame",
 *        "appId": "288",
 *        "receivedAt": "2026-04-12T15:11:07.618Z",
 *        "status": "received" | "confirmed" | "delivered"
 *      }
 *    ],
 *    "nextOrderNum": 2
 *  }
 *
 *  Payment flow (dari main.min.js):
 *    1. Client klik beli → main-server (8001)
 *    2. Main-server return { prePayRet: { errorCode:0, data:{...} } }
 *    3. Client enriches: roleId, roleName, roleLevel, roleVip, serverName
 *    4. Client calls window.paySdk(enrichedData)
 *    5. sdk.js → PPGAME.createPaymentOrder(data) → POST /api/payment/create
 *    6. sdk-server log → return orderId
 *    7. User confirms → POST /api/payment/verify
 *    8. Game server delivers goods → PUSH notifyData("payFinish")
 *
 *  CATATAN: Payment approval/reject terjadi di main-server (8001).
 *  sdk-server HANYA menerima log dari sdk.js.
 *
 * ============================================================================
 */

var store = require('../storage/jsonStore');
var cryptoUtil = require('../utils/crypto');

// File path
var PAYMENTS_FILE = store.buildPath('payments.json');

// =============================================
// DATA ACCESS
// =============================================

/**
 * Load seluruh payments data.
 * @returns {{ payments: Array, nextOrderNum: number }}
 */
function loadPayments() {
    return store.load(PAYMENTS_FILE, { payments: [], nextOrderNum: 1 });
}

/**
 * Save seluruh payments data.
 * @param {{ payments: Array, nextOrderNum: number }} data
 * @returns {boolean}
 */
function savePayments(data) {
    return store.save(PAYMENTS_FILE, data);
}

// =============================================
// PAYMENT OPERATIONS
// =============================================

/**
 * Log payment baru (dari sdk.js createPaymentOrder).
 *
 * @param {Object} paymentData - Payment data dari sdk.js
 * @returns {{ success: boolean, orderId: string, message: string }}
 */
function createOrder(paymentData) {
    var data = loadPayments();

    var orderId = paymentData.orderId || cryptoUtil.generateOrderId(data.nextOrderNum);
    if (!paymentData.orderId) {
        data.nextOrderNum = (data.nextOrderNum || 1) + 1;
    }

    var record = {
        orderId: orderId,
        userId: paymentData.roleId || paymentData.userId || 'unknown',
        roleName: paymentData.roleName || 'unknown',
        roleLevel: paymentData.roleLevel || 'unknown',
        roleVip: paymentData.roleVip || 'unknown',
        serverName: paymentData.serverName || 'unknown',
        amount: paymentData.price || paymentData.totalPrice || paymentData.money || 0,
        goodsId: paymentData.goodsId || paymentData.goodId || 'unknown',
        goodsName: paymentData.goodsName || paymentData.productId || ('Item ' + (paymentData.goodsId || '?')),
        goodsNum: paymentData.goodsNum || paymentData.goodNum || 1,
        currency: paymentData.currency || 'USD',
        channel: paymentData.channel || 'ppgame',
        appId: paymentData.appId || '288',
        sessionId: paymentData.sessionId || null,
        receivedAt: new Date().toISOString(),
        status: 'received'
    };

    data.payments.push(record);

    if (!savePayments(data)) {
        return { success: false, orderId: orderId, message: 'Failed to create order (storage error)' };
    }

    console.log('[Payment] Order created: ' + orderId +
        ' | User: ' + record.roleName + ' (' + record.userId + ')' +
        ' | Goods: ' + record.goodsName +
        ' | Amount: ' + record.amount);

    return { success: true, orderId: orderId, message: 'Order created successfully' };
}

/**
 * Proses payment log (dari sdk.js POST /api/payment/process).
 * Ini adalah endpoint legacy yang tetap didukung.
 *
 * @param {Object} paymentData - Payment data dari sdk.js
 * @returns {{ success: boolean, orderId: string, message: string }}
 */
function processPayment(paymentData) {
    return createOrder(paymentData);
}

/**
 * Verify payment (dari sdk.js confirmPayment).
 *
 * Update status: 'received' → 'confirmed'.
 * Catatan: Delivery barang sebenarnya dilakukan oleh main-server.
 *
 * @param {string} orderId - Order ID
 * @param {string} userId - User ID
 * @returns {{ success: boolean, message: string }}
 */
function verifyPayment(orderId, userId) {
    var data = loadPayments();

    var found = false;
    for (var i = 0; i < data.payments.length; i++) {
        if (data.payments[i].orderId === orderId) {
            data.payments[i].status = 'confirmed';
            data.payments[i].verifiedAt = new Date().toISOString();
            found = true;
            console.log('[Payment] Order verified: ' + orderId + ' by user ' + userId);
            break;
        }
    }

    if (!found) {
        return { success: false, message: 'Order not found: ' + orderId };
    }

    if (!savePayments(data)) {
        return { success: false, message: 'Failed to verify order (storage error)' };
    }

    return { success: true, message: 'Payment verified successfully' };
}

/**
 * Payment callback notification.
 * Dipanggil oleh sistem eksternal atau manual untuk update status.
 *
 * @param {string} orderId - Order ID
 * @param {string} status - New status ('delivered', 'failed', 'refunded')
 * @param {Object} [extraData] - Additional data
 * @returns {{ success: boolean, message: string }}
 */
function paymentCallback(orderId, status, extraData) {
    var data = loadPayments();
    var validStatuses = ['received', 'confirmed', 'delivered', 'failed', 'refunded'];

    if (validStatuses.indexOf(status) === -1) {
        return { success: false, message: 'Invalid status: ' + status };
    }

    var found = false;
    for (var i = 0; i < data.payments.length; i++) {
        if (data.payments[i].orderId === orderId) {
            data.payments[i].status = status;
            data.payments[i].callbackAt = new Date().toISOString();
            if (extraData) {
                data.payments[i].callbackData = extraData;
            }
            found = true;
            console.log('[Payment] Callback: ' + orderId + ' → ' + status);
            break;
        }
    }

    if (!found) {
        return { success: false, message: 'Order not found: ' + orderId };
    }

    if (!savePayments(data)) {
        return { success: false, message: 'Failed to update order (storage error)' };
    }

    return { success: true, message: 'Callback processed: ' + status };
}

// =============================================
// LIST OPERATIONS
// =============================================

/**
 * List payment history (admin/debug).
 *
 * @param {Object} [filters] - Filter options
 * @param {string} [filters.userId] - Filter by userId
 * @param {string} [filters.status] - Filter by status
 * @param {number} [filters.limit] - Max results (default 100)
 * @returns {{ payments: Array, count: number, total: number }}
 */
function listPayments(filters) {
    var data = loadPayments();
    var payments = data.payments || [];

    // Apply filters
    if (filters) {
        if (filters.userId) {
            payments = payments.filter(function (p) { return p.userId === filters.userId; });
        }
        if (filters.status) {
            payments = payments.filter(function (p) { return p.status === filters.status; });
        }
    }

    var limit = (filters && filters.limit) || 100;
    var total = payments.length;

    // Terbaru dulu, hapus rawData dari response
    var result = payments.slice(-limit).reverse().map(function (p) {
        var clean = {};
        for (var key in p) {
            if (p.hasOwnProperty(key) && key !== 'rawData') {
                clean[key] = p[key];
            }
        }
        return clean;
    });

    return { payments: result, count: result.length, total: total };
}

/**
 * Get total payment count.
 * @returns {number}
 */
function getTotalCount() {
    var data = loadPayments();
    return (data.payments || []).length;
}

module.exports = {
    createOrder: createOrder,
    processPayment: processPayment,
    verifyPayment: verifyPayment,
    paymentCallback: paymentCallback,
    listPayments: listPayments,
    getTotalCount: getTotalCount
};
