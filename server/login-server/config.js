/**
 * config.js — LOGIN-SERVER Configuration
 * Referensi: login-server.md v3.0 Section 8
 *
 * Option A: HTTP API call ke SDK-Server (bukan direct DB access)
 * server0Time: hardcoded 25200000
 */

module.exports = {
    port: 8000,
    host: '0.0.0.0',
    dbFile: './data/login_server.db',
    sdkServerUrl: 'http://127.0.0.1:9999',
    secretKey: 'SUPER_WARRIOR_Z_SDK_SECRET_2026',
    server0Time: 25200000,                    // Hardcoded, BUKAN dynamic
    servers: [
        {
            serverId: '1',
            name: 'Server 1',
            url: 'http://127.0.0.1:8001',
            chaturl: 'http://127.0.0.1:8002',
            dungeonurl: 'http://127.0.0.1:8003',
            online: true,
            hot: false,
            new: false
        }
    ],
    // LoginAnnounce welcome message
    announce: {
        '1': {
            text: { en: 'Welcome to Super Warrior Z!', id: 'Selamat datang di Super Warrior Z!' },
            title: { en: 'Welcome', id: 'Selamat Datang' },
            version: '1',
            orderNo: 1,
            alwaysPopup: true
        }
    }
};
