/**
 * config.js — MAIN-SERVER Configuration
 * Referensi: game.md §1, §13
 *
 * Port: 8001
 * Transport: Socket.IO 2.5.1
 * TEA: ON (key = 'verification')
 * Compression: LZString UTF-16 (threshold 1024 bytes)
 * server0Time: 25200000 (UTC+7 offset ms)
 */

const path = require('path');
const fs = require('fs');

// ─── Resolve resourcePath ───
// Coba beberapa lokasi yang mungkin, prioritas:
// 1. Environment variable RESOURCE_PATH
// 2. /var/www/html//resource/json (deploy path)
function resolveResourcePath() {
    const candidates = [];

    // 1. Environment variable override
    if (process.env.RESOURCE_PATH) {
        candidates.push(process.env.RESOURCE_PATH);
    }

    // 2. Deploy path (common setup)
    candidates.push('/var/www/html/resource/json');

    // 3. Relative from this file
    candidates.push(path.join(__dirname, '..', '..', 'html', 'resource', 'json'));

    // 4. Repo fallback
    candidates.push(path.join(__dirname, '..', '..', 'repo', 'resource', 'json'));

    // 5. repo-game fallback (current project structure)
    candidates.push(path.join(__dirname, '..', '..', '..', 'repo-game', 'resource', 'json'));

    // 6. download fallback
    candidates.push(path.join(__dirname, '..', '..', '..', 'download', 'resource', 'json'));

    for (const p of candidates) {
        try {
            if (fs.existsSync(p) && fs.statSync(p).isDirectory()) {
                // Quick check: at least constant.json should exist
                if (fs.existsSync(path.join(p, 'constant.json'))) {
                    return p;
                }
            }
        } catch (_) {
            // Skip this candidate
        }
    }

    // Fallback ke relative path (akan WARN saat loadResource gagal)
    return path.join(__dirname, '..', '..', 'html', 'resource', 'json');
}

module.exports = {
    port: parseInt(process.env.PORT) || 8001,
    host: '0.0.0.0',
    dbPrefix: 'ms_',
    sdkServerUrl: process.env.SDK_URL || 'http://127.0.0.1:9999',
    loginDbFile: path.join(__dirname, '..', 'login-server', 'data', 'login_server.db'),
    secretKey: 'SUPER_WARRIOR_Z_SDK_SECRET_2026',
    teaKey: 'verification',                          // L82582
    serverVersion: '',                               // L96070 — display-only, no comparison
    serverId: 1,                                     // L114417 — integer dari server list config
    serverOpenDate: 0,                               // Akan diset saat server pertama kali start
    currency: 'USD',                                 // L114795+L83816 — key ke currencyDisplay.json
    compressionThreshold: 1024,                      // L39134
    server0Time: 25200000,                           // L116952 — UTC+7 offset ms
    language: 'en',
    os: 'Android',
    version: '1.0',                                  // L114430 — SELALU '1.0'
    gameVersion: '2026-03-02143147',                 // Dari resource/properties/clientversion.json
    resourcePath: resolveResourcePath(),
    chatUrl: 'http://127.0.0.1:8002',
    dungeonUrl: 'http://127.0.0.1:8003'
};
