(function() {
    'use strict';

    /* ========================================================================
     *  PPGAME SDK — Super Warrior Z
     *  Complete client-side SDK (IIFE, IE11+ compatible, var only)
     * ======================================================================== */

    var SDK_SERVER = 'http://127.0.0.1:9999';

    /* ------------------------------------------------------------------
     *  1. URL Parameter Parsing
     * ------------------------------------------------------------------ */

    function getParams() {
        var search = location.search;
        var params = {};
        if (search.indexOf('?') !== -1) {
            var pairs = search.substr(1).split('&');
            for (var i = 0; i < pairs.length; i++) {
                var kv = pairs[i].split('=');
                params[kv[0]] = decodeURIComponent(kv[1] || '');
            }
        }
        return params;
    }

    function getQueryStringByName(name) {
        return getParams()[name] || '';
    }

    /* ------------------------------------------------------------------
     *  2. HTTP Helper
     * ------------------------------------------------------------------ */

    function postJSON(url, data, callback) {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', url, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                try {
                    var res = JSON.parse(xhr.responseText);
                    callback(res);
                } catch (e) {
                    callback({ success: false, error: 'parse_error' });
                }
            }
        };
        xhr.send(JSON.stringify(data));
    }

    /* ------------------------------------------------------------------
     *  3. Timestamp Helper (same format as server)
     * ------------------------------------------------------------------ */

    function ppgNow() {
        var d = new Date();
        var p2 = function(n) { return n < 10 ? '0' + n : '' + n; };
        var p3 = function(n) { return n < 10 ? '00' + n : n < 100 ? '0' + n : '' + n; };
        return p2(d.getHours()) + ':' + p2(d.getMinutes()) + ':' + p2(d.getSeconds()) + '.' + p3(d.getMilliseconds());
    }

    /* ------------------------------------------------------------------
     *  4. CSS Badge Styles for Eruda
     * ------------------------------------------------------------------ */

    var BADGE = {
        AUTH:     'background:#e94560;color:#fff;padding:2px 8px;border-radius:3px;font-weight:bold',
        INIT:     'background:#533483;color:#fff;padding:2px 8px;border-radius:3px;font-weight:bold',
        LIFECYCLE:'background:#4ecdc4;color:#fff;padding:2px 8px;border-radius:3px;font-weight:bold',
        EVENT:    'background:#2ecc71;color:#fff;padding:2px 8px;border-radius:3px;font-weight:bold',
        PAYMENT:  'background:#f39c12;color:#fff;padding:2px 8px;border-radius:3px;font-weight:bold',
        ERROR:    'background:#c0392b;color:#fff;padding:2px 8px;border-radius:3px;font-weight:bold',
        RESET:    'color:inherit;font-weight:normal'
    };

    /* ------------------------------------------------------------------
     *  Stored params (closure) — so getSdkLoginInfo() always works
     * ------------------------------------------------------------------ */

    var storedParams = {};

    /* ------------------------------------------------------------------
     *  5. Login UI Overlay
     * ------------------------------------------------------------------ */

    function showLoginUI() {
        console.group('%c[PPGAME]%c 🔐 LOGIN FLOW', BADGE.AUTH, BADGE.RESET);
        console.log(ppgNow() + '  🔍 URL params → TIDAK ada loginToken');
        console.log(ppgNow() + '  🖥 Login UI overlay rendered');
        console.groupEnd();

        /* --- Build overlay DOM --- */
        var overlay = document.createElement('div');
        overlay.id = 'ppg-login-overlay';
        overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;'
            + 'background:rgba(0,0,0,0.85);z-index:99999;display:flex;'
            + 'align-items:center;justify-content:center;font-family:"Segoe UI",Arial,sans-serif;';

        var card = document.createElement('div');
        card.style.cssText = 'background:linear-gradient(135deg,#1a1a2e 0%,#16213e 100%);'
            + 'border-radius:16px;padding:48px 40px;width:360px;max-width:90vw;'
            + 'box-shadow:0 20px 60px rgba(0,0,0,0.5),0 0 40px rgba(233,69,96,0.15);'
            + 'text-align:center;';

        /* Title */
        var title = document.createElement('h1');
        title.textContent = 'SUPER WARRIOR Z';
        title.style.cssText = 'color:#e94560;font-size:28px;margin:0 0 8px 0;'
            + 'letter-spacing:3px;text-shadow:0 0 20px rgba(233,69,96,0.4);';
        card.appendChild(title);

        /* Subtitle */
        var subtitle = document.createElement('p');
        subtitle.textContent = 'PPGAME SDK';
        subtitle.style.cssText = 'color:#888;font-size:13px;margin:0 0 32px 0;letter-spacing:2px;';
        card.appendChild(subtitle);

        /* UserID input */
        var input = document.createElement('input');
        input.id = 'ppg-userid-input';
        input.type = 'text';
        input.placeholder = 'Enter User ID';
        input.style.cssText = 'width:100%;padding:14px 16px;border:2px solid #333;'
            + 'border-radius:10px;background:#0f0f1a;color:#fff;font-size:16px;'
            + 'outline:none;box-sizing:border-box;margin-bottom:16px;'
            + 'transition:border-color 0.3s ease;';
        input.onfocus = function() { this.style.borderColor = '#e94560'; };
        input.onblur = function() { this.style.borderColor = '#333'; };
        card.appendChild(input);

        /* Error message */
        var errorMsg = document.createElement('div');
        errorMsg.id = 'ppg-error-msg';
        errorMsg.style.cssText = 'color:#e94560;font-size:13px;margin-bottom:12px;'
            + 'min-height:18px;display:none;';
        card.appendChild(errorMsg);

        /* LOGIN button */
        var loginBtn = document.createElement('button');
        loginBtn.textContent = 'LOGIN';
        loginBtn.style.cssText = 'width:100%;padding:14px;border:none;border-radius:10px;'
            + 'background:linear-gradient(135deg,#e94560,#c23152);color:#fff;font-size:16px;'
            + 'font-weight:bold;cursor:pointer;letter-spacing:1px;margin-bottom:12px;'
            + 'transition:transform 0.15s ease,box-shadow 0.15s ease;';
        loginBtn.onmouseenter = function() {
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 6px 20px rgba(233,69,96,0.4)';
        };
        loginBtn.onmouseleave = function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = 'none';
        };
        loginBtn.onclick = function() { ppgameLogin(); };
        card.appendChild(loginBtn);

        /* GUEST button */
        var guestBtn = document.createElement('button');
        guestBtn.textContent = 'LOGIN AS GUEST';
        guestBtn.style.cssText = 'width:100%;padding:14px;border:none;border-radius:10px;'
            + 'background:linear-gradient(135deg,#533483,#3d2660);color:#fff;font-size:16px;'
            + 'font-weight:bold;cursor:pointer;letter-spacing:1px;'
            + 'transition:transform 0.15s ease,box-shadow 0.15s ease;';
        guestBtn.onmouseenter = function() {
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 6px 20px rgba(83,52,131,0.4)';
        };
        guestBtn.onmouseleave = function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = 'none';
        };
        guestBtn.onclick = function() { ppgameGuest(); };
        card.appendChild(guestBtn);

        overlay.appendChild(card);
        document.body.appendChild(overlay);
    }

    /* ------------------------------------------------------------------
     *  Show error inside the login overlay
     * ------------------------------------------------------------------ */

    function showLoginError(msg) {
        var el = document.getElementById('ppg-error-msg');
        if (el) {
            el.textContent = msg;
            el.style.display = 'block';
        }
    }

    /* ------------------------------------------------------------------
     *  6. ppgameLogin — login with userId
     * ------------------------------------------------------------------ */

    window.ppgameLogin = function() {
        var input = document.getElementById('ppg-userid-input');
        var userId = input ? input.value.trim() : '';

        if (!userId) {
            showLoginError('User ID cannot be empty');
            return;
        }

        var url = SDK_SERVER + '/api/auth/login';
        var body = { userId: userId };
        var t0 = Date.now();

        console.group('%c[PPGAME]%c 🔐 LOGIN FLOW', BADGE.AUTH, BADGE.RESET);
        console.log(ppgNow() + '  📡 POST ' + url);
        console.log(ppgNow() + '  📦 Body: ' + JSON.stringify(body));

        postJSON(url, body, function(res) {
            var elapsed = Date.now() - t0;

            if (res.success) {
                console.log(ppgNow() + '  ✅ Response (' + elapsed + 'ms): ' + JSON.stringify(res));
                console.log(ppgNow() + '  🔑 Token: ' + (res.loginToken || '').substring(0, 20) + '...');
                console.log(ppgNow() + '  👤 userId: ' + (res.userId || ''));
                console.log(ppgNow() + '  📛 nickname: ' + (res.nickname || ''));
                console.log(ppgNow() + '  🔏 sign: ' + (res.sign || '').substring(0, 16) + '...');
                console.log(ppgNow() + '  🛡 security: ' + (res.security || '').substring(0, 16) + '...');

                var redir = window.location.origin + window.location.pathname
                    + '?sdk=' + encodeURIComponent('ppgame')
                    + '&logintoken=' + encodeURIComponent(res.loginToken || '')
                    + '&nickname=' + encodeURIComponent(res.nickname || '')
                    + '&userid=' + encodeURIComponent(res.userId || '')
                    + '&sign=' + encodeURIComponent(res.sign || '')
                    + '&security=' + encodeURIComponent(res.security || '');

                console.log(ppgNow() + '  🔄 Redirect → ?sdk=ppgame&logintoken=' + (res.loginToken || '').substring(0, 12) + '...');
                console.groupEnd();

                window.location.href = redir;
            } else {
                console.log(ppgNow() + '  ❌ Response (' + elapsed + 'ms): ' + JSON.stringify(res));
                console.groupEnd();
                showLoginError(res.error || 'Login failed');
            }
        });
    };

    /* ------------------------------------------------------------------
     *  7. ppgameGuest — login as guest
     * ------------------------------------------------------------------ */

    window.ppgameGuest = function() {
        var url = SDK_SERVER + '/api/auth/guest';
        var body = {};
        var t0 = Date.now();

        console.group('%c[PPGAME]%c 🔐 LOGIN FLOW', BADGE.AUTH, BADGE.RESET);
        console.log(ppgNow() + '  📡 POST ' + url);
        console.log(ppgNow() + '  📦 Body: {}');

        postJSON(url, body, function(res) {
            var elapsed = Date.now() - t0;

            if (res.success) {
                console.log(ppgNow() + '  ✅ Response (' + elapsed + 'ms): ' + JSON.stringify(res));
                console.log(ppgNow() + '  🔑 Token: ' + (res.loginToken || '').substring(0, 20) + '...');
                console.log(ppgNow() + '  👤 userId: ' + (res.userId || ''));
                console.log(ppgNow() + '  📛 nickname: ' + (res.nickname || ''));
                console.log(ppgNow() + '  🔏 sign: ' + (res.sign || '').substring(0, 16) + '...');
                console.log(ppgNow() + '  🛡 security: ' + (res.security || '').substring(0, 16) + '...');

                var redir = window.location.origin + window.location.pathname
                    + '?sdk=' + encodeURIComponent('ppgame')
                    + '&logintoken=' + encodeURIComponent(res.loginToken || '')
                    + '&nickname=' + encodeURIComponent(res.nickname || '')
                    + '&userid=' + encodeURIComponent(res.userId || '')
                    + '&sign=' + encodeURIComponent(res.sign || '')
                    + '&security=' + encodeURIComponent(res.security || '');

                console.log(ppgNow() + '  🔄 Redirect → ?sdk=ppgame&logintoken=' + (res.loginToken || '').substring(0, 12) + '...');
                console.groupEnd();

                window.location.href = redir;
            } else {
                console.log(ppgNow() + '  ❌ Response (' + elapsed + 'ms): ' + JSON.stringify(res));
                console.groupEnd();
                showLoginError(res.error || 'Guest login failed');
            }
        });
    };

    /* ------------------------------------------------------------------
     *  8. Game Init — validate token & set window variables
     * ------------------------------------------------------------------ */

    function initGame(params) {
        var loginToken = params.logintoken || '';
        var userId = params.userid || '';
        var sdk = params.sdk || 'ppgame';

        storedParams = {
            logintoken: loginToken,
            nickname: params.nickname || '',
            userid: userId,
            sign: params.sign || '',
            security: params.security || '',
            sdk: sdk
        };

        console.group('%c[PPGAME]%c 🎮 GAME INIT', BADGE.INIT, BADGE.RESET);
        console.log(ppgNow() + '  🔍 URL params → ADA loginToken');

        var url = SDK_SERVER + '/api/auth/validate';
        var body = { loginToken: loginToken, userId: userId, sdk: sdk };
        var t0 = Date.now();

        console.log(ppgNow() + '  📡 POST ' + url);
        console.log(ppgNow() + '  📦 Body: {loginToken: "' + loginToken.substring(0, 12) + '...", userId: "' + userId + '", sdk: "' + sdk + '"}');

        postJSON(url, body, function(res) {
            var elapsed = Date.now() - t0;

            if (res.valid) {
                console.log(ppgNow() + '  ✅ Validate OK (' + elapsed + 'ms)');
                console.log(ppgNow() + '  🔏 sign received: ' + (res.sign || '').substring(0, 16) + '...');
                console.log(ppgNow() + '  🛡 securityCode received: ' + (res.securityCode || '').substring(0, 16) + '...');

                /* Update stored sign/security from validate response */
                if (res.sign) { storedParams.sign = res.sign; }
                if (res.securityCode) { storedParams.security = res.securityCode; }

                setWindowVariables();
                setPPGAME();
                setWindowFunctions();

                console.log(ppgNow() + '  🎮 Game ready to start!');
                console.groupEnd();
            } else {
                console.log(ppgNow() + '  ❌ Validate FAILED (' + elapsed + 'ms): ' + JSON.stringify(res));
                console.groupEnd();

                /* Log error group */
                console.group('%c[PPGAME]%c ❌ ERROR', BADGE.ERROR, BADGE.RESET);
                console.log(ppgNow() + '  ❌ POST ' + url + ' → validation failed');
                console.log(ppgNow() + '  📦 Response: ' + JSON.stringify(res));
                console.log(ppgNow() + '  🛡 loginToken: ' + loginToken.substring(0, 8) + '..' + loginToken.substring(loginToken.length - 3));
                console.log(ppgNow() + '  👤 userId: ' + userId);
                console.groupEnd();

                showLoginUI();
            }
        });
    }

    /* ------------------------------------------------------------------
     *  9. Set Window Variables
     * ------------------------------------------------------------------ */

    function setWindowVariables() {
        console.log(ppgNow() + '  🔧 Setting window variables...');

        window["hideList"] = ["1.99", "2.99", "14.99", "59.99", "89.99"];
        window["activityUrl"] = "";
        window["clientver"] = "2026-03-02143147";
        window["Log_Clean"] = false;
        window["debug"] = true;
        window["sdkChannel"] = "ppgame";
        window["gameIcon"] = "";
        window["debugLanguage"] = "en";

        console.log(ppgNow() + '  📋 window.sdkChannel = "ppgame"');
        console.log(ppgNow() + '  📋 window.hideList = ["1.99","2.99","14.99","59.99","89.99"]');
        console.log(ppgNow() + '  📋 window.clientver = "2026-03-02143147"');
        console.log(ppgNow() + '  📋 window.debug = true');
    }

    /* ------------------------------------------------------------------
     *  10. Set Window.PPGAME Object (7 methods)
     * ------------------------------------------------------------------ */

    function setPPGAME() {
        console.log(ppgNow() + '  🔧 Setting window.PPGAME (7 methods)');

        window.PPGAME = {

            /* 1 */ createPaymentOrder: function(data) {
                var url = SDK_SERVER + '/api/payment/create';
                var payload = {
                    userId: storedParams.userid,
                    loginToken: storedParams.logintoken,
                    sign: storedParams.sign,
                    security: storedParams.security,
                    data: data
                };
                var t0 = Date.now();

                console.group('%c[PPGAME]%c 💳 PAYMENT', BADGE.PAYMENT, BADGE.RESET);
                console.log(ppgNow() + '  💳 createPaymentOrder → ' + (data.orderId || data.productId || ''));
                console.log(ppgNow() + '  📦 ' + JSON.stringify(data));
                console.log(ppgNow() + '  📤 POST /payment/create');

                postJSON(url, payload, function(res) {
                    var elapsed = Date.now() - t0;
                    if (res.success) {
                        console.log(ppgNow() + '  ✅ OK → paymentUrl (' + elapsed + 'ms)');
                        if (res.paymentUrl) {
                            console.log(ppgNow() + '  🔗 ' + res.paymentUrl);
                            window.open(res.paymentUrl, '_blank');
                        }
                    } else {
                        console.log(ppgNow() + '  ❌ FAILED (' + elapsed + 'ms): ' + JSON.stringify(res));
                    }
                    console.groupEnd();
                });
            },

            /* 2 */ playerEnterServer: function(data) {
                var url = SDK_SERVER + '/api/event/enter-server';
                var payload = {
                    userId: storedParams.userid,
                    loginToken: storedParams.logintoken,
                    sign: storedParams.sign,
                    security: storedParams.security,
                    data: data
                };
                var t0 = Date.now();

                console.group('%c[PPGAME]%c 📊 SDK EVENTS', BADGE.EVENT, BADGE.RESET);
                console.log(ppgNow() + '  📊 PPGAME.playerEnterServer()');
                console.log(ppgNow() + '  📤 POST /event/enter-server ' + JSON.stringify(data));

                postJSON(url, payload, function(res) {
                    var elapsed = Date.now() - t0;
                    if (res.success) {
                        console.log(ppgNow() + '  ✅ OK (' + elapsed + 'ms)');
                    } else {
                        console.log(ppgNow() + '  ❌ FAILED (' + elapsed + 'ms): ' + JSON.stringify(res));
                    }
                    console.groupEnd();
                });
            },

            /* 3 */ submitEvent: function(name, data) {
                var url = SDK_SERVER + '/api/event/submit';
                var payload = {
                    userId: storedParams.userid,
                    loginToken: storedParams.logintoken,
                    sign: storedParams.sign,
                    security: storedParams.security,
                    eventName: name,
                    data: data || {}
                };
                var t0 = Date.now();

                console.group('%c[PPGAME]%c 📊 SDK EVENTS', BADGE.EVENT, BADGE.RESET);
                console.log(ppgNow() + '  📊 PPGAME.submitEvent("' + name + '")');
                console.log(ppgNow() + '  📤 POST /event/submit ' + JSON.stringify(data || {}));

                postJSON(url, payload, function(res) {
                    var elapsed = Date.now() - t0;
                    if (res.success) {
                        console.log(ppgNow() + '  ✅ OK (' + elapsed + 'ms)');
                    } else {
                        console.log(ppgNow() + '  ❌ FAILED (' + elapsed + 'ms): ' + JSON.stringify(res));
                    }
                    console.groupEnd();
                });
            },

            /* 4 */ gameChapterFinish: function(chapterId) {
                var url = SDK_SERVER + '/api/event/chapter-finish';
                var payload = {
                    userId: storedParams.userid,
                    loginToken: storedParams.logintoken,
                    sign: storedParams.sign,
                    security: storedParams.security,
                    chapterId: chapterId
                };
                var t0 = Date.now();

                console.group('%c[PPGAME]%c 📊 SDK EVENTS', BADGE.EVENT, BADGE.RESET);
                console.log(ppgNow() + '  📊 PPGAME.gameChapterFinish(' + chapterId + ')');
                console.log(ppgNow() + '  📤 POST /event/chapter-finish');

                postJSON(url, payload, function(res) {
                    var elapsed = Date.now() - t0;
                    if (res.success) {
                        console.log(ppgNow() + '  ✅ OK (' + elapsed + 'ms)');
                    } else {
                        console.log(ppgNow() + '  ❌ FAILED (' + elapsed + 'ms): ' + JSON.stringify(res));
                    }
                    console.groupEnd();
                });
            },

            /* 5 */ gameLevelUp: function(level) {
                var url = SDK_SERVER + '/api/event/level-up';
                var payload = {
                    userId: storedParams.userid,
                    loginToken: storedParams.logintoken,
                    sign: storedParams.sign,
                    security: storedParams.security,
                    level: level
                };
                var t0 = Date.now();

                console.group('%c[PPGAME]%c 📊 SDK EVENTS', BADGE.EVENT, BADGE.RESET);
                console.log(ppgNow() + '  📊 PPGAME.gameLevelUp(' + level + ')');
                console.log(ppgNow() + '  📤 POST /event/level-up');

                postJSON(url, payload, function(res) {
                    var elapsed = Date.now() - t0;
                    if (res.success) {
                        console.log(ppgNow() + '  ✅ OK (' + elapsed + 'ms)');
                    } else {
                        console.log(ppgNow() + '  ❌ FAILED (' + elapsed + 'ms): ' + JSON.stringify(res));
                    }
                    console.groupEnd();
                });
            },

            /* 6 */ openShopPage: function() {
                console.log('%c[PPGAME]%c 🛒 openShopPage', BADGE.EVENT, BADGE.RESET);
                window.open(SDK_SERVER + '/shop?userId=' + encodeURIComponent(storedParams.userid), '_blank');
            },

            /* 7 */ gameReady: function() {
                var url = SDK_SERVER + '/api/event/game-ready';
                var payload = {
                    userId: storedParams.userid,
                    loginToken: storedParams.logintoken,
                    sign: storedParams.sign,
                    security: storedParams.security
                };
                var t0 = Date.now();

                console.group('%c[PPGAME]%c 📊 SDK EVENTS', BADGE.EVENT, BADGE.RESET);
                console.log(ppgNow() + '  📊 PPGAME.gameReady()');
                console.log(ppgNow() + '  📤 POST /event/game-ready');

                postJSON(url, payload, function(res) {
                    var elapsed = Date.now() - t0;
                    if (res.success) {
                        console.log(ppgNow() + '  ✅ OK (' + elapsed + 'ms)');
                    } else {
                        console.log(ppgNow() + '  ❌ FAILED (' + elapsed + 'ms): ' + JSON.stringify(res));
                    }
                    console.groupEnd();
                });
            }
        };
    }

    /* ------------------------------------------------------------------
     *  11. Set Window SDK Functions (ALL must be set)
     * ------------------------------------------------------------------ */

    function setWindowFunctions() {
        console.log(ppgNow() + '  🔧 Setting window.checkSDK() → true');
        console.log(ppgNow() + '  🔧 Setting window.getSdkLoginInfo() → 6 fields');
        console.log(ppgNow() + '  🔧 Setting window.checkFromNative() → false');
        console.log(ppgNow() + '  🔧 Setting 27 window.* functions');

        /* CORE SDK */
        window.checkSDK = function() { return true; };

        window.getSdkLoginInfo = function() {
            return {
                sdk: 'ppgame',
                loginToken: storedParams.logintoken,
                nickName: storedParams.nickname,
                userId: storedParams.userid,
                sign: storedParams.sign,
                security: storedParams.security
            };
        };

        window.checkFromNative = function() { return false; };
        window.getAppId = function() { return ''; };
        window.getLoginServer = function() { return ''; };
        window.reload = function() { location.reload(); };
        window.getQueryStringByName = function(name) { return getParams()[name] || ''; };

        /* SDK REPORT */
        window.reportLogToPP = function(stageName, data) {
            var url = SDK_SERVER + '/api/event/lifecycle';
            var payload = {
                userId: storedParams.userid,
                loginToken: storedParams.logintoken,
                stageName: stageName,
                data: data || null
            };
            var t0 = Date.now();

            console.groupCollapsed('%c[PPGAME]%c 🔄 LIFECYCLE', BADGE.LIFECYCLE, BADGE.RESET);
            console.log(ppgNow() + '  🔄 ' + stageName + ' → ' + JSON.stringify(data || null));
            console.log(ppgNow() + '  📤 POST /event/lifecycle');

            postJSON(url, payload, function(res) {
                var elapsed = Date.now() - t0;
                if (res.success) {
                    console.log(ppgNow() + '  ✅ OK (' + elapsed + 'ms)');
                } else {
                    console.log(ppgNow() + '  ❌ FAILED (' + elapsed + 'ms): ' + JSON.stringify(res));
                }
                console.groupEnd();
            });
        };

        window.reportToCpapiCreaterole = function(data) {
            var url = SDK_SERVER + '/api/event/submit';
            var payload = {
                userId: storedParams.userid,
                loginToken: storedParams.logintoken,
                eventName: 'create_role',
                data: data || {}
            };
            var t0 = Date.now();

            console.group('%c[PPGAME]%c 📊 SDK EVENTS', BADGE.EVENT, BADGE.RESET);
            console.log(ppgNow() + '  📊 reportToCpapiCreaterole');
            console.log(ppgNow() + '  📤 POST /event/submit');

            postJSON(url, payload, function(res) {
                var elapsed = Date.now() - t0;
                if (res.success) {
                    console.log(ppgNow() + '  ✅ OK (' + elapsed + 'ms)');
                } else {
                    console.log(ppgNow() + '  ❌ FAILED (' + elapsed + 'ms): ' + JSON.stringify(res));
                }
                console.groupEnd();
            });
        };

        window.reportToBSH5Createrole = function(data) {
            var url = SDK_SERVER + '/api/event/submit';
            var payload = {
                userId: storedParams.userid,
                loginToken: storedParams.logintoken,
                eventName: 'create_role',
                data: data || {}
            };
            var t0 = Date.now();

            console.group('%c[PPGAME]%c 📊 SDK EVENTS', BADGE.EVENT, BADGE.RESET);
            console.log(ppgNow() + '  📊 reportToBSH5Createrole');
            console.log(ppgNow() + '  📤 POST /event/submit');

            postJSON(url, payload, function(res) {
                var elapsed = Date.now() - t0;
                if (res.success) {
                    console.log(ppgNow() + '  ✅ OK (' + elapsed + 'ms)');
                } else {
                    console.log(ppgNow() + '  ❌ FAILED (' + elapsed + 'ms): ' + JSON.stringify(res));
                }
                console.groupEnd();
            });
        };

        window.report2Sdk350CreateRole = function(data) {
            var url = SDK_SERVER + '/api/event/submit';
            var payload = {
                userId: storedParams.userid,
                loginToken: storedParams.logintoken,
                eventName: 'create_role',
                data: data || {}
            };
            var t0 = Date.now();

            console.group('%c[PPGAME]%c 📊 SDK EVENTS', BADGE.EVENT, BADGE.RESET);
            console.log(ppgNow() + '  📊 report2Sdk350CreateRole');
            console.log(ppgNow() + '  📤 POST /event/submit');

            postJSON(url, payload, function(res) {
                var elapsed = Date.now() - t0;
                if (res.success) {
                    console.log(ppgNow() + '  ✅ OK (' + elapsed + 'ms)');
                } else {
                    console.log(ppgNow() + '  ❌ FAILED (' + elapsed + 'ms): ' + JSON.stringify(res));
                }
                console.groupEnd();
            });
        };

        window.report2Sdk350LoginUser = function(data) {
            var url = SDK_SERVER + '/api/event/submit';
            var payload = {
                userId: storedParams.userid,
                loginToken: storedParams.logintoken,
                eventName: 'login_user',
                data: data || {}
            };
            var t0 = Date.now();

            console.group('%c[PPGAME]%c 📊 SDK EVENTS', BADGE.EVENT, BADGE.RESET);
            console.log(ppgNow() + '  📊 report2Sdk350LoginUser');
            console.log(ppgNow() + '  📤 POST /event/submit');

            postJSON(url, payload, function(res) {
                var elapsed = Date.now() - t0;
                if (res.success) {
                    console.log(ppgNow() + '  ✅ OK (' + elapsed + 'ms)');
                } else {
                    console.log(ppgNow() + '  ❌ FAILED (' + elapsed + 'ms): ' + JSON.stringify(res));
                }
                console.groupEnd();
            });
        };

        /* NATIVE CHANNEL (no-op) */
        window.switchAccountSdk = function() {};
        window.switchUser = function() {};
        window.contactSdk = function() {};
        window.userCenterSdk = function() {};
        window.fbGiveLiveSdk = function() {};
        window.giveLikeSdk = function() {};
        window.changeVipLink = function() {};
        window.openURL = function(url) { window.open(url, '_blank'); };
        window.changeLanguage = function() {};

        window.sendCustomEvent = function(eventName, data) {
            var url = SDK_SERVER + '/api/event/submit';
            var payload = {
                userId: storedParams.userid,
                loginToken: storedParams.logintoken,
                eventName: eventName,
                data: data || {}
            };
            var t0 = Date.now();

            console.group('%c[PPGAME]%c 📊 SDK EVENTS', BADGE.EVENT, BADGE.RESET);
            console.log(ppgNow() + '  📊 sendCustomEvent("' + eventName + '")');
            console.log(ppgNow() + '  📤 POST /event/submit');

            postJSON(url, payload, function(res) {
                var elapsed = Date.now() - t0;
                if (res.success) {
                    console.log(ppgNow() + '  ✅ OK (' + elapsed + 'ms)');
                } else {
                    console.log(ppgNow() + '  ❌ FAILED (' + elapsed + 'ms): ' + JSON.stringify(res));
                }
                console.groupEnd();
            });
        };

        window.accountLoginCallback = function() {};

        /* SWITCH ACCOUNT */
        window.switchAccount = function() {
            console.log('%c[PPGAME]%c 🔄 Switch account → redirecting to login', BADGE.AUTH, BADGE.RESET);
            window.location.href = window.location.origin + window.location.pathname;
        };

        /* ANALYTICS (no-op) */
        window.fbq = function() {};
        window.gtag = function() {};
        window.reportToFbq = function() {};
        window.reportChatMsg = function() {};
        window.urlEncode = function() {};
        window.maskLayerClear = function() {};
        window.showSixteenImg = function() {};
    }

    /* ====================================================================
     *  5. INIT SEQUENCE — Entry Point
     * ==================================================================== */

    function ppgInit() {
        var params = getParams();

        if (params.logintoken && params.userid && params.sign && params.security) {
            /* Already logged in → validate token → init game */
            initGame(params);
        } else {
            /* Not logged in → show login UI overlay */
            showLoginUI();
        }
    }

    /* Wait for DOM ready — sdk.js loads in <head>, body may not exist yet */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', ppgInit);
    } else {
        ppgInit();
    }

})();
