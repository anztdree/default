/**
 * ============================================================
 * GUIDEBATTLE.JS - Mock Handler for buryPoint.guideBattle
 * ============================================================
 * 
 * Purpose: Tracking checkpoint/burial point during guide battle flow
 * Called at 3 stages: load -> battle -> home (per lesson)
 * Server echoes back all request fields to confirm
 * 
 * HAR Reference: s398-zd.pksilo.com_2026_04_01_22_14_53.har
 *   6 entries total: 3 unique points (load, battle, home)
 * 
 * HAR Verified Response Pattern:
 *   Response = exact echo of request (no added fields, no removed fields)
 * 
 * HAR Request Fields (6 fields, all 6 entries identical structure):
 *   type:"buryPoint", action:"guideBattle", userId:"...",
 *   point:"load"|"battle"|"home", passLesson:10102, version:"1.0"
 * 
 * HAR Response Fields (6 fields, identical to request):
 *   type:"buryPoint", action:"guideBattle", userId:"...",
 *   point:"load"|"battle"|"home", passLesson:10102, version:"1.0"
 * 
 * main.min.js Verified (Hakim):
 *   guideBuriedPoint = function(e, t) {
 *     ts.processHandler(
 *       {type:"buryPoint",action:"guideBattle",userId:n,point:e,passLesson:t,version:"1.0"},
 *       function(e) { Logger.serverDebugLog("新手引导埋点！！！") },
 *       function(e) { Logger.serverDebugLog("新手引导埋点失败！！！") }
 *     )
 *   }
 *   - Client does NOT read any response field
 *   - Only checks success/error callback (log only)
 *   - But HAR proves: server must echo all request fields exactly
 * 
 * Flow (per lesson, 3 calls in order):
 *   1. point:"load"   - game loading battle scene
 *   2. point:"battle" - battle finished
 *   3. point:"home"   - returning to home screen
 * 
 * Author: Local SDK Bridge
 * Version: 2.0.0 - Fixed: echo loop instead of hardcoded fields
 * ============================================================
 */

(function(window) {
    'use strict';

    var LOG = {
        prefix: '[BURY-POINT]',
        _log: function(level, icon, message, data) {
            var timestamp = new Date().toISOString().substr(11, 12);
            var styles = {
                success: 'color: #22c55e; font-weight: bold;',
                info: 'color: #6b7280;',
                warn: 'color: #f59e0b; font-weight: bold;',
                error: 'color: #ef4444; font-weight: bold;'
            };
            var style = styles[level] || styles.info;
            var format = '%c' + this.prefix + ' ' + icon + ' [' + timestamp + '] ' + message;
            if (data !== undefined) {
                console.log(format + ' %o', style, data);
            } else {
                console.log(format, style);
            }
        },
        success: function(msg, data) { this._log('success', 'OK', msg, data); },
        info: function(msg, data) { this._log('info', '>>', msg, data); },
        warn: function(msg, data) { this._log('warn', '!!', msg, data); },
        error: function(msg, data) { this._log('error', 'XX', msg, data); }
    };

    /**
     * Handler for buryPoint.guideBattle
     * HAR: Server echoes ALL request fields as-is (exact copy)
     */
    function handleGuideBattle(request, playerData) {
        LOG.info('guideBattle point=' + request.point + ' lesson=' + request.passLesson);

        // Echo all request fields (HAR: exact copy, no hardcoding, no defaults)
        var responseData = {};
        for (var key in request) {
            if (request.hasOwnProperty(key) && request[key] !== undefined) {
                responseData[key] = request[key];
            }
        }

        LOG.success('guideBattle -> ' + request.point);
        return responseData;
    }

    // ========================================================
    // REGISTER HANDLER
    // ========================================================
    function register() {
        if (typeof window === 'undefined') {
            console.error('[BURY-POINT] window not available');
            return;
        }
        window.MAIN_SERVER_HANDLERS = window.MAIN_SERVER_HANDLERS || {};
        window.MAIN_SERVER_HANDLERS['buryPoint.guideBattle'] = handleGuideBattle;
        LOG.success('Handler registered: buryPoint.guideBattle');
    }

    if (typeof window !== 'undefined') {
        register();
    } else {
        var _check = setInterval(function() {
            if (typeof window !== 'undefined') {
                clearInterval(_check);
                register();
            }
        }, 50);
        setTimeout(function() { clearInterval(_check); }, 10000);
    }

})(window);
