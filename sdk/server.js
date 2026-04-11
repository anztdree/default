/**
 * ================================================================
 *  PPGAME SDK Server — Backend untuk PPGAME SDK
 *  Super Warrior Z (超级战士Z)
 * ================================================================
 *
 *  Port: 9999
 *  Game server ada di port 8000 (terpisah — ini BUKAN game server)
 *
 *  Fitur:
 *    - Account management (guest, create, switch, list)
 *    - Session management (login, logout, verify, tracking)
 *    - Token validation dengan expiry yang benar
 *    - Payment processing (create order, complete, webhook)
 *    - Event tracking (all SDK events)
 *    - Settings management (dengan whitelist)
 *    - Server list configuration
 *    - Data stored in JSON files (Termux friendly)
 *
 *  Jalankan: node server.js
 */

var http = require("http");
var fs = require("fs");
var path = require("path");
var url = require("url");

// ============================================================
//  Konfigurasi
// ============================================================
var PORT = 9999;
var DATA_DIR = path.join(__dirname, "data");
var MAX_EVENTS = 5000;
var TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 hari
var MAX_ACCOUNTS = 50;          // Batas akun per device
var MAX_PAYMENTS_QUERY = 200;   // Batas query pembayaran
var SETTINGS_WHITELIST = [      // Key yang boleh di-update via API
    "language",
    "gameServerUrl",
    "maintenanceMode",
    "serverList",
    "webhookUrl",
    "webhookSecret",
    "paymentMode",
    "maxAccounts"
];

// Pastikan folder data ada
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// ============================================================
//  Data Storage (file-based, simpel untuk Termux)
// ============================================================
function loadData(filename, defaultVal) {
    var filepath = path.join(DATA_DIR, filename);
    try {
        if (fs.existsSync(filepath)) {
            var raw = fs.readFileSync(filepath, "utf-8");
            return JSON.parse(raw);
        }
    } catch (e) {
        console.log("[SDK-Server] Error loading " + filename + ":", e.message);
    }
    return defaultVal;
}

function saveData(filename, data) {
    var filepath = path.join(DATA_DIR, filename);
    try {
        fs.writeFileSync(filepath, JSON.stringify(data, null, 2), "utf-8");
    } catch (e) {
        console.log("[SDK-Server] Error saving " + filename + ":", e.message);
    }
}

// Debounced save — tidak save terlalu sering
var _saveTimers = {};
function saveDataDebounced(filename, data, delay) {
    delay = delay || 1000;
    if (_saveTimers[filename]) clearTimeout(_saveTimers[filename]);
    _saveTimers[filename] = setTimeout(function () {
        saveData(filename, data);
        delete _saveTimers[filename];
    }, delay);
}

/** Force save semua data (untuk shutdown) */
function saveAllData() {
    // Clear semua debounce timer, lalu save langsung
    Object.keys(_saveTimers).forEach(function (key) {
        clearTimeout(_saveTimers[key]);
        delete _saveTimers[key];
    });
    saveData("accounts.json", accounts);
    saveData("sessions.json", sessions);
    saveData("payments.json", payments);
    saveData("events.json", events);
    saveData("settings.json", settings);
}

// ============================================================
//  State
// ============================================================
var accounts = loadData("accounts.json", []);
var sessions = loadData("sessions.json", {});  // { token: { userId, createdAt, lastActivity } }
var payments = loadData("payments.json", []);
var events = loadData("events.json", []);
var settings = loadData("settings.json", {
    language: "en",
    gameServerUrl: "http://127.0.0.1:8000",
    maintenanceMode: false,
    serverList: [
        {
            id: "1",
            name: "Local Server",
            ip: "127.0.0.1",
            port: 8000,
            status: "normal",
            recommend: true,
            newTag: false
        }
    ],
    webhookUrl: "",
    webhookSecret: "",
    paymentMode: "sandbox",  // "sandbox" = auto-complete, "live" = tunggu konfirmasi
    maxAccounts: 50
});

// ============================================================
//  Helpers
// ============================================================
function generateUUID() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        var r = (Math.random() * 16) | 0;
        var v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

function generateToken() {
    return "tk_" + generateUUID() + "_" + Date.now().toString(36);
}

function timestamp() {
    return new Date().toISOString();
}

// ============================================================
//  Token Validation — BENAR-BENAR memvalidasi token
// ============================================================

/**
 * Cek apakah token valid (format + expiry + terdaftar di sessions).
 * @param {string} token - Token yang dicek
 * @returns {object|null} Session data jika valid, null jika tidak
 */
function validateToken(token) {
    if (!token) return null;

    // Cek format dasar
    if (!token.startsWith("tk_")) return null;

    // Cek apakah token ada di sessions
    var session = sessions[token];
    if (!session) return null;

    // Cek expiry
    var now = Date.now();
    var age = now - session.createdAt;
    if (age > TOKEN_EXPIRY_MS) {
        // Token expired — hapus session
        delete sessions[token];
        saveDataDebounced("sessions.json", sessions, 2000);
        return null;
    }

    // Update last activity
    session.lastActivity = now;
    saveDataDebounced("sessions.json", sessions, 10000); // debounce 10 detik untuk activity update

    return session;
}

/**
 * Cek apakah request punya token yang valid.
 * Membaca dari header Authorization: Bearer <token>
 * atau dari body.loginToken.
 * @returns {object|null} session data jika valid
 */
function authenticateRequest(req, body) {
    // 1. Cek Authorization header
    var authHeader = req.headers["authorization"];
    if (authHeader && authHeader.startsWith("Bearer ")) {
        var token = authHeader.substring(7);
        return validateToken(token);
    }

    // 2. Cek body.loginToken
    if (body && body.loginToken) {
        return validateToken(body.loginToken);
    }

    return null;
}

/** Buat session baru untuk account */
function createSession(userId, token) {
    sessions[token] = {
        userId: userId,
        token: token,
        createdAt: Date.now(),
        lastActivity: Date.now()
    };
    saveDataDebounced("sessions.json", sessions, 1000);
}

/** Hapus session */
function removeSession(token) {
    if (sessions[token]) {
        delete sessions[token];
        saveDataDebounced("sessions.json", sessions, 1000);
    }
}

/** Hapus semua session untuk userId */
function removeAllUserSessions(userId) {
    var tokens = Object.keys(sessions);
    for (var i = 0; i < tokens.length; i++) {
        if (sessions[tokens[i]].userId === userId) {
            delete sessions[tokens[i]];
        }
    }
    saveDataDebounced("sessions.json", sessions, 1000);
}

// ============================================================
//  Account Helpers
// ============================================================

/** Cari account by userId */
function findAccount(userId) {
    for (var i = 0; i < accounts.length; i++) {
        if (accounts[i].userId === userId) return accounts[i];
    }
    return null;
}

/** Cari account by deviceId */
function findAccountByDevice(deviceId) {
    var result = [];
    for (var i = 0; i < accounts.length; i++) {
        if (accounts[i].deviceId === deviceId) {
            result.push(accounts[i]);
        }
    }
    return result;
}

/** Hitung jumlah akun per device */
function countAccountsByDevice(deviceId) {
    var count = 0;
    for (var i = 0; i < accounts.length; i++) {
        if (accounts[i].deviceId === deviceId) count++;
    }
    return count;
}

/** Buat account baru */
function createAccount(opts) {
    var account = {
        userId: opts.userId || generateUUID(),
        nickname: opts.nickname || ("Player_" + Math.floor(Math.random() * 99999)),
        loginToken: generateToken(),
        sdk: opts.sdk || "ppgame",
        channelCode: opts.channelCode || "ppgame",
        deviceId: opts.deviceId || null,
        type: opts.type || "registered",  // "guest" or "registered"
        vipLevel: 0,
        createTime: Date.now(),
        lastLoginTime: Date.now(),
        loginCount: 1,
        banned: false
    };
    accounts.push(account);

    // Buat session untuk token baru
    createSession(account.userId, account.loginToken);

    saveDataDebounced("accounts.json", accounts, 500);
    return account;
}

/** Update last login saja (tanpa generate token baru) */
function touchAccountActivity(userId) {
    var acc = findAccount(userId);
    if (acc) {
        acc.lastLoginTime = Date.now();
        acc.loginCount = (acc.loginCount || 0) + 1;

        // Update session activity
        if (acc.loginToken && sessions[acc.loginToken]) {
            sessions[acc.loginToken].lastActivity = Date.now();
        }

        saveDataDebounced("accounts.json", accounts, 500);
    }
    return acc;
}

/** Update last login dan generate token baru */
function touchAccount(userId) {
    var acc = findAccount(userId);
    if (acc) {
        // Hapus session lama
        removeAllUserSessions(userId);

        // Generate token baru
        acc.loginToken = generateToken();
        acc.lastLoginTime = Date.now();
        acc.loginCount = (acc.loginCount || 0) + 1;

        // Buat session baru
        createSession(userId, acc.loginToken);

        saveDataDebounced("accounts.json", accounts, 500);
    }
    return acc;
}

/** Tambah event */
function addEvent(eventName, data, userId) {
    events.push({
        event: eventName,
        userId: userId || null,
        data: data || {},
        time: Date.now(),
        isoTime: timestamp()
    });
    // Trim events kalau kebanyakan
    if (events.length > MAX_EVENTS) {
        events = events.slice(-MAX_EVENTS);
    }
    saveDataDebounced("events.json", events, 2000);
}

// ============================================================
//  Webhook — Untuk notifikasi ke game server
// ============================================================

/**
 * Kirim webhook notification ke game server (jika URL terkonfigurasi).
 * Digunakan untuk: payment success, account events, dll.
 */
function sendWebhook(eventType, payload) {
    var webhookUrl = settings.webhookUrl;
    if (!webhookUrl) return; // Tidak ada webhook URL, skip

    var data = JSON.stringify({
        event: eventType,
        payload: payload,
        timestamp: Date.now(),
        signature: settings.webhookSecret || ""
    });

    // Parse URL
    var parsedUrl;
    try {
        parsedUrl = url.parse(webhookUrl);
    } catch (e) {
        console.log("[SDK-Server] Invalid webhook URL:", webhookUrl);
        return;
    }

    var options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || 80,
        path: parsedUrl.path || "/",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(data),
            "X-SDK-Event": eventType,
            "X-SDK-Signature": settings.webhookSecret || ""
        }
    };

    var req = http.request(options, function (res) {
        var body = "";
        res.on("data", function (chunk) { body += chunk; });
        res.on("end", function () {
            if (res.statusCode >= 200 && res.statusCode < 300) {
                console.log("[SDK-Server] Webhook sent:", eventType, "→", res.statusCode);
            } else {
                console.log("[SDK-Server] Webhook failed:", eventType, "→", res.statusCode, body);
            }
        });
    });

    req.on("error", function (e) {
        console.log("[SDK-Server] Webhook error:", eventType, e.message);
    });

    req.setTimeout(5000, function () {
        req.destroy();
        console.log("[SDK-Server] Webhook timeout:", eventType);
    });

    req.write(data);
    req.end();
}

// ============================================================
//  Payment Helpers
// ============================================================

/**
 * Proses payment completion — update status, kirim webhook, notifikasi.
 * @param {object} order - Order yang sudah ditemukan
 * @param {string} status - Status baru ("completed", "failed", "refunded")
 * @returns {object} Updated order
 */
function completePayment(order, status) {
    order.status = status;
    order.completeTime = Date.now();
    saveDataDebounced("payments.json", payments, 500);

    addEvent("payment_" + status, {
        orderId: order.orderId,
        userId: order.userId,
        productId: order.productId,
        price: order.price,
        currency: order.currency
    }, order.userId);

    // Kirim webhook ke game server jika ada
    if (status === "completed") {
        sendWebhook("payment_completed", {
            orderId: order.orderId,
            userId: order.userId,
            serverId: order.serverId,
            characterId: order.characterId,
            characterName: order.characterName,
            productId: order.productId,
            productName: order.productName,
            price: order.price,
            currency: order.currency,
            extras: order.extras,
            completeTime: order.completeTime
        });
    }

    console.log("[SDK-Server] Payment " + status + ":", order.orderId, "for user:", order.userId);
    return order;
}

// ============================================================
//  Response Helpers
// ============================================================

/** Kirim JSON response dengan CORS headers */
function sendJSON(res, statusCode, data) {
    var body = JSON.stringify(data);
    res.writeHead(statusCode, {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Length": Buffer.byteLength(body, "utf-8"),
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Login-Token",
        "Access-Control-Max-Age": "86400"
    });
    res.end(body);
}

/** Parse request body as JSON */
function parseBody(req, callback) {
    var body = "";
    var size = 0;
    var maxSize = 1024 * 1024; // 1MB limit

    req.on("data", function (chunk) {
        size += chunk.length;
        if (size > maxSize) {
            callback(new Error("Body too large"), null);
            req.destroy();
            return;
        }
        body += chunk;
    });

    req.on("end", function () {
        try {
            if (body.length > 0) {
                callback(null, JSON.parse(body));
            } else {
                callback(null, {});
            }
        } catch (e) {
            callback(e, null);
        }
    });

    req.on("error", function (e) {
        callback(e, null);
    });
}

// ============================================================
//  API Routes
// ============================================================
var server = http.createServer(function (req, res) {

    // CORS preflight
    if (req.method === "OPTIONS") {
        sendJSON(res, 200, {});
        return;
    }

    var parsedUrl = url.parse(req.url, true);
    var pathname = parsedUrl.pathname;
    var method = req.method;
    var query = parsedUrl.query;

    // Logging (hanya untuk non-event endpoints)
    if (pathname !== "/api/event") {
        console.log("[SDK-Server]", method, pathname);
    }

    // ==========================================
    //  GET / — API info
    // ==========================================
    if (method === "GET" && pathname === "/") {
        sendJSON(res, 200, {
            name: "PPGAME SDK Server",
            version: "2.1.0",
            status: "running",
            endpoints: {
                "POST /api/init": "SDK init / auto register",
                "POST /api/account/guest": "Guest login (quick)",
                "POST /api/account/create": "Create account",
                "POST /api/account/switch": "Switch to existing account",
                "GET  /api/accounts": "List all accounts",
                "POST /api/account/login": "Login with credentials",
                "POST /api/account/logout": "Logout",
                "POST /api/account/verify": "Verify token",
                "DELETE /api/account/:id": "Delete account",
                "POST /api/payment/create": "Create payment order",
                "POST /api/payment/complete": "Complete payment",
                "POST /api/payment/fail": "Mark payment as failed",
                "POST /api/payment/refund": "Refund payment",
                "GET  /api/payment/verify/:orderId": "Verify payment (for game server)",
                "POST /api/payment/notify": "Game server delivery confirmation",
                "GET  /api/payments": "List payments",
                "POST /api/event": "Track event",
                "GET  /api/events": "List events (filterable)",
                "GET  /api/settings": "Get settings",
                "POST /api/settings": "Update settings",
                "GET  /api/serverlist": "Get server list",
                "GET  /api/status": "Server status"
            }
        });
        return;
    }

    // ==========================================
    //  GET /api/serverlist — Daftar server game
    //  Dipakai oleh sdk.js untuk populate serverList
    // ==========================================
    if (method === "GET" && pathname === "/api/serverlist") {
        var serverList = settings.serverList || [];
        sendJSON(res, 200, {
            list: serverList,
            total: serverList.length
        });
        return;
    }

    // ==========================================
    //  POST /api/init — SDK init
    //  Kalau userId tidak ada, buat account baru.
    //  Kalau userId ada, verifikasi dan return info.
    // ==========================================
    if (method === "POST" && pathname === "/api/init") {
        parseBody(req, function (err, body) {
            if (err) {
                sendJSON(res, 400, { error: "Invalid request", detail: err.message });
                return;
            }

            // Cek maintenance mode
            if (settings.maintenanceMode) {
                sendJSON(res, 503, { error: "Maintenance mode", message: "Server sedang maintenance" });
                return;
            }

            // Kalau ada userId dan loginToken, verifikasi session
            if (body.userId && body.loginToken) {
                var session = validateToken(body.loginToken);
                if (session && session.userId === body.userId) {
                    var acc = findAccount(body.userId);
                    if (acc) {
                        // Session masih valid — HANYA update activity, JANGAN generate token baru!
                        // Kalau generate baru, token di URL params jadi invalid
                        // dan getSdkLoginInfo() masih baca dari URL params
                        touchAccountActivity(acc.userId);
                        addEvent("sdk_init", { source: "existing_session" }, acc.userId);
                        sendJSON(res, 200, {
                            userId: acc.userId,
                            nickname: acc.nickname,
                            loginToken: acc.loginToken,
                            sdk: acc.sdk,
                            type: acc.type,
                            serverList: settings.serverList
                        });
                        return;
                    }
                }
            }

            // Kalau ada userId saja (tanpa token), cek account
            if (body.userId) {
                var acc = findAccount(body.userId);
                if (acc) {
                    // Account ditemukan tapi token invalid — generate baru
                    touchAccount(acc.userId);
                    addEvent("sdk_init", { source: "token_refresh" }, acc.userId);
                    sendJSON(res, 200, {
                        userId: acc.userId,
                        nickname: acc.nickname,
                        loginToken: acc.loginToken,
                        sdk: acc.sdk,
                        type: acc.type,
                        serverList: settings.serverList
                    });
                    return;
                }
            }

            // Cek apakah device sudah punya account
            if (body.deviceId) {
                var deviceAccounts = findAccountByDevice(body.deviceId);
                if (deviceAccounts.length > 0) {
                    // Login ke account terakhir dari device ini
                    var lastAcc = deviceAccounts[deviceAccounts.length - 1];
                    touchAccount(lastAcc.userId);
                    addEvent("sdk_init", { source: "device_reuse" }, lastAcc.userId);
                    sendJSON(res, 200, {
                        userId: lastAcc.userId,
                        nickname: lastAcc.nickname,
                        loginToken: lastAcc.loginToken,
                        sdk: lastAcc.sdk,
                        type: lastAcc.type,
                        serverList: settings.serverList
                    });
                    return;
                }
            }

            // Buat account baru
            var account = createAccount({
                userId: body.userId || undefined,
                nickname: body.nickname || undefined,
                sdk: body.sdk || undefined,
                deviceId: body.deviceId || undefined,
                type: "guest"
            });
            addEvent("sdk_init", { source: "new_user" }, account.userId);
            console.log("[SDK-Server] Init -> new account:", account.nickname, "(" + account.userId.slice(0, 8) + ")");

            sendJSON(res, 200, {
                userId: account.userId,
                nickname: account.nickname,
                loginToken: account.loginToken,
                sdk: account.sdk,
                type: account.type,
                serverList: settings.serverList
            });
        });
        return;
    }

    // ==========================================
    //  POST /api/account/guest — Quick guest login
    //  Tombol GUEST di halaman login memanggil ini.
    //  Selalu buat account baru (satu device bisa punya banyak).
    // ==========================================
    if (method === "POST" && pathname === "/api/account/guest") {
        parseBody(req, function (err, body) {
            if (err) {
                sendJSON(res, 400, { error: "Invalid request" });
                return;
            }

            // Cek batas akun per device
            var deviceId = body.deviceId || null;
            if (deviceId) {
                var count = countAccountsByDevice(deviceId);
                if (count >= (settings.maxAccounts || MAX_ACCOUNTS)) {
                    sendJSON(res, 429, { error: "Too many accounts on this device", max: settings.maxAccounts || MAX_ACCOUNTS });
                    return;
                }
            }

            var account = createAccount({
                nickname: "Guest_" + Math.floor(Math.random() * 99999),
                sdk: "ppgame",
                channelCode: "ppgame",
                deviceId: deviceId,
                type: "guest"
            });

            addEvent("guest_login", { nickname: account.nickname }, account.userId);
            console.log("[SDK-Server] Guest account:", account.nickname, "(" + account.userId.slice(0, 8) + ")");

            sendJSON(res, 200, { account: account, serverList: settings.serverList });
        });
        return;
    }

    // ==========================================
    //  POST /api/account/create — Create account with nickname
    // ==========================================
    if (method === "POST" && pathname === "/api/account/create") {
        parseBody(req, function (err, body) {
            if (err) {
                sendJSON(res, 400, { error: "Invalid request" });
                return;
            }

            var nickname = (body.nickname || "").trim();
            if (!nickname || nickname.length < 2) {
                sendJSON(res, 400, { error: "Nickname too short", minLength: 2 });
                return;
            }
            if (nickname.length > 20) {
                sendJSON(res, 400, { error: "Nickname too long", maxLength: 20 });
                return;
            }

            // Cek batas akun per device
            var deviceId = body.deviceId || null;
            if (deviceId) {
                var count = countAccountsByDevice(deviceId);
                if (count >= (settings.maxAccounts || MAX_ACCOUNTS)) {
                    sendJSON(res, 429, { error: "Too many accounts on this device", max: settings.maxAccounts || MAX_ACCOUNTS });
                    return;
                }
            }

            var account = createAccount({
                nickname: nickname,
                sdk: body.sdk || "ppgame",
                channelCode: body.channelCode || "ppgame",
                deviceId: deviceId,
                type: "registered"
            });

            addEvent("account_create", { nickname: account.nickname }, account.userId);
            console.log("[SDK-Server] Account created:", account.nickname);

            sendJSON(res, 200, { account: account, serverList: settings.serverList });
        });
        return;
    }

    // ==========================================
    //  POST /api/account/switch — Switch to existing account
    // ==========================================
    if (method === "POST" && pathname === "/api/account/switch") {
        parseBody(req, function (err, body) {
            if (err) {
                sendJSON(res, 400, { error: "Invalid request" });
                return;
            }

            var account = findAccount(body.userId);
            if (account) {
                // Logout session lama
                if (body.currentToken) {
                    removeSession(body.currentToken);
                }

                // Generate new token untuk session baru
                touchAccount(account.userId);

                addEvent("account_switch", { to: account.nickname }, account.userId);
                console.log("[SDK-Server] Switch to:", account.nickname);

                sendJSON(res, 200, { account: account, serverList: settings.serverList });
            } else {
                sendJSON(res, 404, { error: "Account not found" });
            }
        });
        return;
    }

    // ==========================================
    //  POST /api/account/login — Login with credentials
    // ==========================================
    if (method === "POST" && pathname === "/api/account/login") {
        parseBody(req, function (err, body) {
            if (err) {
                sendJSON(res, 400, { error: "Invalid request" });
                return;
            }

            var account = findAccount(body.userId);
            if (!account) {
                sendJSON(res, 401, { error: "Account not found" });
                return;
            }

            if (account.banned) {
                sendJSON(res, 403, { error: "Account banned" });
                return;
            }

            // Validasi token — cek apakah token masih valid di sessions
            var session = validateToken(body.loginToken);
            if (session && session.userId === body.userId) {
                // Token valid — refresh dengan token baru
                touchAccount(account.userId);
                addEvent("account_login", { type: "token_valid" }, account.userId);
                sendJSON(res, 200, { account: account, serverList: settings.serverList });
            } else {
                // Token invalid atau expired
                addEvent("account_login_failed", { reason: session ? "user_mismatch" : "invalid_token" }, body.userId);
                sendJSON(res, 401, { error: "Invalid or expired token" });
            }
        });
        return;
    }

    // ==========================================
    //  POST /api/account/logout — Logout
    //  Hapus session yang aktif
    // ==========================================
    if (method === "POST" && pathname === "/api/account/logout") {
        parseBody(req, function (err, body) {
            if (err) {
                sendJSON(res, 400, { error: "Invalid request" });
                return;
            }

            var userId = body.userId;
            var loginToken = body.loginToken;

            // Hapus session spesifik
            if (loginToken) {
                removeSession(loginToken);
            }

            addEvent("account_logout", {}, userId);
            console.log("[SDK-Server] Logout:", userId ? userId.slice(0, 8) : "unknown");

            sendJSON(res, 200, { ok: true });
        });
        return;
    }

    // ==========================================
    //  POST /api/account/verify — Verify token
    //  DIPAKAI OLEH GAME SERVER untuk verifikasi login
    // ==========================================
    if (method === "POST" && pathname === "/api/account/verify") {
        parseBody(req, function (err, body) {
            if (err) {
                sendJSON(res, 400, { error: "Invalid request" });
                return;
            }

            var loginToken = body.loginToken;
            var userId = body.userId;

            if (!loginToken || !userId) {
                sendJSON(res, 400, { error: "Missing loginToken or userId" });
                return;
            }

            // Validasi token dengan benar
            var session = validateToken(loginToken);
            if (session && session.userId === userId) {
                var account = findAccount(userId);
                if (account && !account.banned) {
                    sendJSON(res, 200, {
                        valid: true,
                        account: {
                            userId: account.userId,
                            nickname: account.nickname,
                            type: account.type,
                            sdk: account.sdk,
                            vipLevel: account.vipLevel || 0,
                            lastLoginTime: account.lastLoginTime
                        }
                    });
                    return;
                }
            }

            sendJSON(res, 200, { valid: false, reason: "invalid_token" });
        });
        return;
    }

    // ==========================================
    //  GET /api/accounts — List all accounts
    // ==========================================
    if (method === "GET" && pathname === "/api/accounts") {
        var deviceId = query.deviceId;
        var list;

        if (deviceId) {
            // Filter by device
            list = findAccountByDevice(deviceId);
        } else {
            list = accounts;
        }

        var result = list.map(function (a) {
            return {
                userId: a.userId,
                nickname: a.nickname,
                type: a.type,
                sdk: a.sdk,
                vipLevel: a.vipLevel || 0,
                lastLoginTime: a.lastLoginTime,
                loginCount: a.loginCount
            };
        });
        sendJSON(res, 200, { accounts: result, total: result.length });
        return;
    }

    // ==========================================
    //  DELETE /api/account/:userId — Delete account
    // ==========================================
    if (method === "DELETE" && pathname.startsWith("/api/account/")) {
        var userId = pathname.replace("/api/account/", "");
        var idx = -1;
        for (var i = 0; i < accounts.length; i++) {
            if (accounts[i].userId === userId) { idx = i; break; }
        }
        if (idx >= 0) {
            var removed = accounts.splice(idx, 1)[0];
            // Hapus semua session untuk user ini
            removeAllUserSessions(userId);
            saveDataDebounced("accounts.json", accounts, 500);
            addEvent("account_delete", { nickname: removed.nickname }, null);
            console.log("[SDK-Server] Account deleted:", removed.nickname);
            sendJSON(res, 200, { ok: true, deleted: removed.nickname });
        } else {
            sendJSON(res, 404, { error: "Account not found" });
        }
        return;
    }

    // ==========================================
    //  POST /api/payment/create — Create payment order
    //
    //  Order data dari game berisi:
    //    goodsId, goodsName, price, currency,
    //    serverId, roleId, roleName, orderNo, ext
    // ==========================================
    if (method === "POST" && pathname === "/api/payment/create") {
        parseBody(req, function (err, body) {
            if (err) {
                sendJSON(res, 400, { error: "Invalid request" });
                return;
            }

            var orderData = body.order || body;
            var now = Date.now();

            // Cek duplicate order berdasarkan gameOrderNo
            var gameOrderNo = orderData.orderNo || "";
            if (gameOrderNo) {
                for (var i = 0; i < payments.length; i++) {
                    if (payments[i].gameOrderNo === gameOrderNo && payments[i].userId === body.userId) {
                        // Order sudah ada — return order yang sama
                        console.log("[SDK-Server] Duplicate order detected:", gameOrderNo, "-> returning existing:", payments[i].orderId);
                        sendJSON(res, 200, {
                            orderId: payments[i].orderId,
                            status: payments[i].status,
                            productId: payments[i].productId,
                            price: payments[i].price,
                            currency: payments[i].currency,
                            createTime: payments[i].createTime
                        });
                        return;
                    }
                }
            }

            var order = {
                orderId: "ORD_" + now + "_" + Math.floor(Math.random() * 10000),
                // Data dari game
                productId: orderData.goodsId || orderData.productId || "",
                productName: orderData.goodsName || orderData.productName || "",
                price: parseFloat(orderData.price || orderData.amount || 0),
                currency: orderData.currency || "USD",
                gameOrderNo: gameOrderNo,
                extras: orderData.ext || orderData.extras || {},
                // Context dari SDK
                userId: body.userId || null,
                serverId: body.serverId || orderData.serverId || orderData.serverID || null,
                characterId: body.characterId || orderData.roleId || orderData.roleID || null,
                characterName: body.characterName || orderData.roleName || null,
                // Status tracking
                status: "pending",         // pending → completed / failed / refunded
                deliveryStatus: "pending", // pending → delivered (confirmed by game server)
                createTime: now,
                completeTime: null,
                deliverTime: null
            };
            payments.push(order);
            saveDataDebounced("payments.json", payments, 500);

            addEvent("payment_create", {
                orderId: order.orderId,
                userId: order.userId,
                productId: order.productId,
                price: order.price,
                currency: order.currency,
                serverId: order.serverId
            }, order.userId);

            console.log("[SDK-Server] Payment order:", order.orderId,
                "| Product:", order.productName || order.productId,
                "| Price:", order.price, order.currency,
                "| User:", order.userId);

            sendJSON(res, 200, {
                orderId: order.orderId,
                status: "pending",
                productId: order.productId,
                price: order.price,
                currency: order.currency,
                createTime: order.createTime
            });

            // Sandbox mode: auto-complete setelah delay singkat
            if (settings.paymentMode === "sandbox") {
                setTimeout(function () {
                    // Cari order lagi (bisa sudah berubah)
                    for (var i = 0; i < payments.length; i++) {
                        if (payments[i].orderId === order.orderId && payments[i].status === "pending") {
                            completePayment(payments[i], "completed");
                            break;
                        }
                    }
                }, 1500); // Delay 1.5 detik agar terasa "nyata"
            }
        });
        return;
    }

    // ==========================================
    //  POST /api/payment/complete — Complete payment (manual)
    //  Digunakan jika paymentMode = "live"
    // ==========================================
    if (method === "POST" && pathname === "/api/payment/complete") {
        parseBody(req, function (err, body) {
            if (err) {
                sendJSON(res, 400, { error: "Invalid request" });
                return;
            }

            var found = null;
            for (var i = 0; i < payments.length; i++) {
                if (payments[i].orderId === body.orderId) {
                    found = payments[i];
                    break;
                }
            }

            if (found) {
                if (found.status !== "pending") {
                    sendJSON(res, 409, { error: "Order already processed", status: found.status });
                    return;
                }
                completePayment(found, "completed");
                sendJSON(res, 200, {
                    orderId: found.orderId,
                    status: "completed",
                    productId: found.productId,
                    price: found.price,
                    currency: found.currency,
                    completeTime: found.completeTime
                });
            } else {
                sendJSON(res, 404, { error: "Order not found" });
            }
        });
        return;
    }

    // ==========================================
    //  POST /api/payment/fail — Mark payment as failed
    // ==========================================
    if (method === "POST" && pathname === "/api/payment/fail") {
        parseBody(req, function (err, body) {
            if (err) {
                sendJSON(res, 400, { error: "Invalid request" });
                return;
            }

            var found = null;
            for (var i = 0; i < payments.length; i++) {
                if (payments[i].orderId === body.orderId) {
                    found = payments[i];
                    break;
                }
            }

            if (found) {
                if (found.status !== "pending") {
                    sendJSON(res, 409, { error: "Order already processed", status: found.status });
                    return;
                }
                completePayment(found, "failed");
                sendJSON(res, 200, { orderId: found.orderId, status: "failed" });
            } else {
                sendJSON(res, 404, { error: "Order not found" });
            }
        });
        return;
    }

    // ==========================================
    //  POST /api/payment/refund — Refund payment
    // ==========================================
    if (method === "POST" && pathname === "/api/payment/refund") {
        parseBody(req, function (err, body) {
            if (err) {
                sendJSON(res, 400, { error: "Invalid request" });
                return;
            }

            var found = null;
            for (var i = 0; i < payments.length; i++) {
                if (payments[i].orderId === body.orderId) {
                    found = payments[i];
                    break;
                }
            }

            if (found) {
                if (found.status !== "completed") {
                    sendJSON(res, 409, { error: "Only completed orders can be refunded", status: found.status });
                    return;
                }
                completePayment(found, "refunded");
                sendJSON(res, 200, { orderId: found.orderId, status: "refunded" });
            } else {
                sendJSON(res, 404, { error: "Order not found" });
            }
        });
        return;
    }

    // ==========================================
    //  GET /api/payment/verify/:orderId — Verify payment
    //  DIPAKAI OLEH GAME SERVER untuk cek apakah
    //  payment sudah benar-benar selesai.
    // ==========================================
    if (method === "GET" && pathname.startsWith("/api/payment/verify/")) {
        var orderId = pathname.replace("/api/payment/verify/", "");
        var found = null;
        for (var i = 0; i < payments.length; i++) {
            if (payments[i].orderId === orderId) {
                found = payments[i];
                break;
            }
        }

        if (found) {
            sendJSON(res, 200, {
                orderId: found.orderId,
                status: found.status,
                deliveryStatus: found.deliveryStatus,
                userId: found.userId,
                serverId: found.serverId,
                characterId: found.characterId,
                characterName: found.characterName,
                productId: found.productId,
                productName: found.productName,
                price: found.price,
                currency: found.currency,
                extras: found.extras,
                createTime: found.createTime,
                completeTime: found.completeTime,
                deliverTime: found.deliverTime
            });
        } else {
            sendJSON(res, 404, { error: "Order not found" });
        }
        return;
    }

    // ==========================================
    //  POST /api/payment/notify — Game server delivery confirmation
    //  Dipanggil oleh game server SETELAH item berhasil
    //  dikirim ke player. Menandai deliveryStatus = "delivered".
    // ==========================================
    if (method === "POST" && pathname === "/api/payment/notify") {
        parseBody(req, function (err, body) {
            if (err) {
                sendJSON(res, 400, { error: "Invalid request" });
                return;
            }

            var orderId = body.orderId;
            var deliveryStatus = body.deliveryStatus || "delivered";

            if (!orderId) {
                sendJSON(res, 400, { error: "Missing orderId" });
                return;
            }

            var found = null;
            for (var i = 0; i < payments.length; i++) {
                if (payments[i].orderId === orderId) {
                    found = payments[i];
                    break;
                }
            }

            if (found) {
                found.deliveryStatus = deliveryStatus;
                found.deliverTime = Date.now();
                saveDataDebounced("payments.json", payments, 500);

                addEvent("payment_delivered", {
                    orderId: found.orderId,
                    userId: found.userId
                }, found.userId);

                console.log("[SDK-Server] Payment delivered:", found.orderId);
                sendJSON(res, 200, {
                    orderId: found.orderId,
                    deliveryStatus: found.deliveryStatus,
                    deliverTime: found.deliverTime
                });
            } else {
                sendJSON(res, 404, { error: "Order not found" });
            }
        });
        return;
    }

    // ==========================================
    //  GET /api/payments — List payments
    //  Support filter: ?userId=ID &status=STATUS &limit=N &offset=N
    // ==========================================
    if (method === "GET" && pathname === "/api/payments") {
        var result = payments;

        // Filter by userId
        if (query.userId) {
            result = result.filter(function (p) { return p.userId === query.userId; });
        }

        // Filter by status
        if (query.status) {
            result = result.filter(function (p) { return p.status === query.status; });
        }

        // Sort by createTime descending
        result = result.slice().sort(function (a, b) { return b.createTime - a.createTime; });

        // Pagination
        var limit = Math.min(parseInt(query.limit) || 50, MAX_PAYMENTS_QUERY);
        var offset = parseInt(query.offset) || 0;
        var total = result.length;
        result = result.slice(offset, offset + limit);

        sendJSON(res, 200, {
            payments: result,
            total: total,
            limit: limit,
            offset: offset
        });
        return;
    }

    // ==========================================
    //  POST /api/event — Track event
    // ==========================================
    if (method === "POST" && pathname === "/api/event") {
        parseBody(req, function (err, body) {
            if (err) {
                sendJSON(res, 400, { error: "Invalid request" });
                return;
            }

            addEvent(body.event || "unknown", body.data || {}, body.userId || null);
            sendJSON(res, 200, { ok: true });
        });
        return;
    }

    // ==========================================
    //  GET /api/events — List events
    //  Support filter: ?event=NAME &userId=ID &limit=N &offset=N
    // ==========================================
    if (method === "GET" && pathname === "/api/events") {
        var result = events;

        // Filter by event name
        if (query.event) {
            result = result.filter(function (e) { return e.event === query.event; });
        }

        // Filter by userId
        if (query.userId) {
            result = result.filter(function (e) { return e.userId === query.userId; });
        }

        // Sort by time descending
        result = result.slice().sort(function (a, b) { return b.time - a.time; });

        // Pagination
        var limit = parseInt(query.limit) || 100;
        var offset = parseInt(query.offset) || 0;
        var total = result.length;
        result = result.slice(offset, offset + limit);

        sendJSON(res, 200, {
            events: result,
            total: total,
            limit: limit,
            offset: offset
        });
        return;
    }

    // ==========================================
    //  GET /api/settings — Get settings
    // ==========================================
    if (method === "GET" && pathname === "/api/settings") {
        // Return settings tanpa data sensitif
        var safeSettings = JSON.parse(JSON.stringify(settings));
        delete safeSettings.webhookSecret; // Jangan expose secret
        sendJSON(res, 200, { settings: safeSettings });
        return;
    }

    // ==========================================
    //  POST /api/settings — Update settings
    //  Hanya key yang ada di SETTINGS_WHITELIST yang boleh
    // ==========================================
    if (method === "POST" && pathname === "/api/settings") {
        parseBody(req, function (err, body) {
            if (err) {
                sendJSON(res, 400, { error: "Invalid request" });
                return;
            }

            var updated = {};
            var rejected = {};
            var keys = Object.keys(body);

            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                if (SETTINGS_WHITELIST.indexOf(key) !== -1) {
                    settings[key] = body[key];
                    updated[key] = body[key];
                } else {
                    rejected[key] = "Key not allowed";
                }
            }

            saveDataDebounced("settings.json", settings, 500);
            addEvent("settings_update", updated, null);

            var response = { ok: true, updated: updated };
            if (Object.keys(rejected).length > 0) {
                response.rejected = rejected;
            }
            sendJSON(res, 200, response);
        });
        return;
    }

    // ==========================================
    //  GET /api/status — Server status
    // ==========================================
    if (method === "GET" && pathname === "/api/status") {
        var uptime = process.uptime();
        var mem = process.memoryUsage();
        var activeSessions = Object.keys(sessions).length;

        sendJSON(res, 200, {
            status: "running",
            version: "2.1.0",
            uptime: Math.floor(uptime),
            uptimeHuman: Math.floor(uptime / 3600) + "h " + Math.floor((uptime % 3600) / 60) + "m",
            accounts: accounts.length,
            activeSessions: activeSessions,
            payments: payments.length,
            paymentsCompleted: payments.filter(function (p) { return p.status === "completed"; }).length,
            paymentsPending: payments.filter(function (p) { return p.status === "pending"; }).length,
            paymentsDelivered: payments.filter(function (p) { return p.deliveryStatus === "delivered"; }).length,
            events: events.length,
            paymentMode: settings.paymentMode,
            maintenanceMode: settings.maintenanceMode,
            webhookConfigured: !!settings.webhookUrl,
            memory: {
                rss: Math.round(mem.rss / 1024 / 1024) + "MB",
                heapUsed: Math.round(mem.heapUsed / 1024 / 1024) + "MB"
            }
        });
        return;
    }

    // ==========================================
    //  404 — Not Found
    // ==========================================
    sendJSON(res, 404, { error: "Not found", path: pathname, method: method });
});

// ============================================================
//  Graceful Shutdown
// ============================================================
function gracefulShutdown(signal) {
    console.log("\n[SDK-Server] " + signal + " received, saving data...");

    // Force save semua data
    saveAllData();

    console.log("[SDK-Server] Data saved. Shutting down.");
    process.exit(0);
}

process.on("SIGINT", function () { gracefulShutdown("SIGINT"); });
process.on("SIGTERM", function () { gracefulShutdown("SIGTERM"); });

// ============================================================
//  Periodic Cleanup — Bersihkan session expired setiap 1 jam
// ============================================================
setInterval(function () {
    var now = Date.now();
    var tokens = Object.keys(sessions);
    var expiredCount = 0;

    for (var i = 0; i < tokens.length; i++) {
        var session = sessions[tokens[i]];
        if (now - session.createdAt > TOKEN_EXPIRY_MS) {
            delete sessions[tokens[i]];
            expiredCount++;
        }
    }

    if (expiredCount > 0) {
        console.log("[SDK-Server] Cleaned up " + expiredCount + " expired sessions");
        saveDataDebounced("sessions.json", sessions, 1000);
    }
}, 3600000); // Setiap 1 jam

// ============================================================
//  Start Server
// ============================================================
server.listen(PORT, "0.0.0.0", function () {
    console.log("");
    console.log("╔══════════════════════════════════════════════════╗");
    console.log("║          PPGAME SDK Server v2.1.0                ║");
    console.log("║          http://0.0.0.0:" + PORT + "                     ║");
    console.log("╠══════════════════════════════════════════════════╣");
    console.log("║                                                  ║");
    console.log("║  Account Management:                             ║");
    console.log("║    POST /api/account/guest     Guest login        ║");
    console.log("║    POST /api/account/create    Create account     ║");
    console.log("║    POST /api/account/switch    Switch account     ║");
    console.log("║    POST /api/account/login     Login              ║");
    console.log("║    POST /api/account/logout    Logout             ║");
    console.log("║    POST /api/account/verify    Verify token       ║");
    console.log("║    GET  /api/accounts          List accounts      ║");
    console.log("║    DELETE /api/account/:id     Delete account     ║");
    console.log("║                                                  ║");
    console.log("║  Payment:                                        ║");
    console.log("║    POST /api/payment/create    Create order       ║");
    console.log("║    POST /api/payment/complete  Complete payment   ║");
    console.log("║    POST /api/payment/fail      Fail payment       ║");
    console.log("║    POST /api/payment/refund    Refund payment     ║");
    console.log("║    GET  /api/payment/verify/:id Verify order      ║");
    console.log("║    POST /api/payment/notify    Delivery confirm   ║");
    console.log("║    GET  /api/payments          List payments      ║");
    console.log("║                                                  ║");
    console.log("║  Events:                                         ║");
    console.log("║    POST /api/event             Track event        ║");
    console.log("║    GET  /api/events            List events        ║");
    console.log("║                                                  ║");
    console.log("║  Settings & Config:                              ║");
    console.log("║    GET  /api/settings          Get settings       ║");
    console.log("║    POST /api/settings          Update settings    ║");
    console.log("║    GET  /api/serverlist        Server list        ║");
    console.log("║                                                  ║");
    console.log("║  System:                                         ║");
    console.log("║    GET  /                      API info           ║");
    console.log("║    GET  /api/status            Server status      ║");
    console.log("║                                                  ║");
    console.log("╠══════════════════════════════════════════════════╣");
    console.log("║  Data dir: " + DATA_DIR);
    console.log("║  Accounts: " + accounts.length + "  Sessions: " + Object.keys(sessions).length + "  Payments: " + payments.length + "  Events: " + events.length);
    console.log("║  Payment mode: " + settings.paymentMode);
    console.log("║  Webhook: " + (settings.webhookUrl ? "configured" : "not set"));
    console.log("╚══════════════════════════════════════════════════╝");
    console.log("");
});
