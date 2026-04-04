/**
 * ============================================================
 * GETACTIVITYBRIEF.JS - Mock Handler for activity.getActivityBrief
 * ============================================================
 * 
 * Purpose: Returns list of active activities (brief/summary view)
 * Called when home screen initializes and after various actions
 * Displayed as activity icons on the main UI with red dot notifications
 * 
 * HAR Reference: main-server(level 1 sampai 10).har
 * HAR Pattern: 35 requests (POST) -> 35 responses (GET, LZString compressed)
 * HAR Server: s2079-bs.popoh5.com:8001
 * 
 * Flow (from game code main.min.js):
 *   1. Game calls: ts.processHandler({
 *        type:"activity", action:"getActivityBrief",
 *        userId:"<uuid>", version:"1.0"
 *      }, callback, errorCallback)
 *   2. Response: { type, action, userId, version, _acts: { <actId>: <ActBriefItem>, ... } }
 *   3. Game iterates _acts via setActs() -> groups by actCycle -> renders icons
 *   4. Each act is classified by actType for special handling:
 *      - ITEM_DROP (100): parse hangupReward
 *      - FREE_INHERIT (102): set hasFreeInherit flag
 *      - NEW_USER_MAIL (101): skip (registration-only)
 *      - FBGIVELIKE/IOSGIVELIKE (5023/5024): call checkLikeIsOn
 *      - OFFLINEACT/OFFLINEACT_TWO (5031/5033): special icon handling
 *      - ALL OTHERS: group by actCycle into actCycleList
 * 
 * Response Schema (per activity item in _acts):
 *   id          : string  - Activity unique ID (UUID), used as dictionary key
 *   templateName: string  - Server-side config template name (Chinese)
 *   name        : string  - Display name (localized)
 *   icon        : string  - Icon asset path (relative URL)
 *   displayIndex: number  - Sort order for UI display (lower = shown first)
 *   showRed     : boolean - Whether to show red dot notification on icon
 *   actCycle    : number  - Activity cycle type (groups activities by lifecycle)
 *   actType     : number  - Activity type code (determines UI/behavior)
 *   haveExReward: boolean - (optional) Only on sign-in activity, extra reward flag
 *   endTime     : number  - (optional) End timestamp, triggers time-limited UI
 *   cycleType   : number  - (optional) Passed to checkLikeIsOn/getActivityDetail
 *   poolId      : number  - (optional) Passed to checkLikeIsOn/getActivityDetail
 *   hangupReward: object  - (optional) For ITEM_DROP type, structured reward data
 * 
 * HAR Data (12 activities, new server level 0-10):
 *   All 35 responses in the HAR contained IDENTICAL activity data.
 *   The _acts dictionary never changed across the ~13 minute session.
 *   All activities had showRed=true except Event Sign-in (showRed=false).
 * 
 * ACTIVITY_CYCLE values found in HAR:
 *   1 = NEW_USER (permanent per player)
 *   2 = SERVER_OPEN (permanent per server lifecycle)
 *   4 = RANK (session-based)
 *   8 = HOLIDAY (one-time)
 * 
 * ACTIVITY_TYPE values found in HAR:
 *   1001 = LOGIN           (Event Sign-in)
 *   1002 = GROW            (Growth Quest)
 *   1003 = RECHARGE_3      (7-Day Top-up At Will)
 *   2001 = HERO_GIFT       (Hero Grand Kickback)
 *   2002 = HERO_ORANGE     (Orange Hero Assembly)
 *   2003 = NEW_SERVER_GIFT (New Server Discount Pack)
 *   2004 = RECHARGE_GIFT   (Cumulative Top-up Gift)
 *   2007 = RECHARGE_DAILY  (Daily accumulated top-up)
 *   4001 = HERO_IMAGE_RANK (Ignition Illustration)
 *   4003 = TALENT_RANK     (Temple Contest)
 *   5003 = TODAY_DISCOUNT  (Discount Today)
 *   5037 = HERO_SUPER_GIFT (Hero Value Pack)
 * 
 * Author: Local SDK Bridge
 * Version: 1.0.0 - Based on HAR real server data
 * ============================================================
 */

(function(window) {
    'use strict';

    // ========================================================
    // 1. STYLISH LOGGER
    // ========================================================
    var LOG = {
        prefix: '\uD83C\uDFAE [ACTIVITY-BRIEF]',
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
        success: function(msg, data) { this._log('success', '\u2705', msg, data); },
        info: function(msg, data) { this._log('info', '\u2139\uFE0F', msg, data); },
        warn: function(msg, data) { this._log('warn', '\u26A0\uFE0F', msg, data); },
        error: function(msg, data) { this._log('error', '\u274C', msg, data); }
    };

    // ========================================================
    // 2. ACTIVITY BRIEF DATA (from HAR - new server)
    // ========================================================
    // 12 activities returned by real server for a new server session.
    // Data is IDENTICAL across all 35 getActivityBrief responses in the HAR.
    // UUIDs match the actId used in other requests (getActivityDetail, buyNewServerGift, etc.)
    // ========================================================
    var ACTIVITY_DATA = [
        {
            id: 'a0d76656-aa09-45c9-bb8e-92976ed016b0',
            templateName: '\u65B0\u670D\u7279\u60E0\u4E09\u9009\u4E00\u793C\u5305',
            name: 'Hero Value Pack',
            icon: '/activity/\u65B0\u670D\u6D3B\u52A8/xinfuyingxiongtehui_rukou.png?rnd=851641672116391',
            displayIndex: 0,
            showRed: true,
            actCycle: 2,
            actType: 5037
        },
        {
            id: '93a2ebab-7ca1-438b-a0df-da4d3ca3010d',
            templateName: '\uFF08\u5F00\u670D\uFF09\u65B0\u670D\u7279\u60E0\u5305\uFF08\u65B0\uFF09',
            name: 'New Server Discount Pack',
            icon: '/activity/\u65B0\u670D\u6D3B\u52A8/huodongnew42.png',
            displayIndex: 2,
            showRed: true,
            actCycle: 2,
            actType: 2003
        },
        {
            id: 'd02c4167-dc19-46ca-b854-f15125fbf781',
            templateName: '\uFF08\u5F00\u670D\uFF09\u4ECA\u65E5\u7279\u4EF7\uFF08\u65B0\uFF09',
            name: 'Discount Today',
            icon: '/activity/\u5F3A\u8005\u4E4B\u8DEF/huodongnew205.png?rnd=574051578983873',
            displayIndex: 3,
            showRed: true,
            actCycle: 2,
            actType: 5003
        },
        {
            id: 'f4f2041a-0391-48b7-bbd9-cbaf0f957761',
            templateName: '\uFF08\u5F00\u670D\uFF09\u7D2F\u5145\u8C6A\u793C\uFF08\u65B0\uFF09',
            name: 'Cumulative Top-up Gift',
            icon: '/activity/\u5F3A\u8005\u4E4B\u8DEF/huodongnew107.png',
            displayIndex: 4,
            showRed: true,
            actCycle: 2,
            actType: 2004
        },
        {
            id: '8df2ff74-e2d7-48f6-b32b-0beadee8f916',
            templateName: '\uFF08\u65B0\u7248\u5F00\u670D\uFF09\u6BCF\u65E5\u7D2F\u5145',
            name: 'Daily accumulated top-up',
            icon: '/activity/\u65B0\u670D\u6D3B\u52A8/huodongnew35.png?rnd=649231590140442',
            displayIndex: 6,
            showRed: true,
            actCycle: 2,
            actType: 2007
        },
        {
            id: '2a904fc5-07d1-489c-bec7-90bb178cd1ae',
            templateName: '\uFF08\u5F00\u670D\uFF09\u6210\u957F\u4EFB\u52A1',
            name: 'Growth Quest',
            icon: '/activity/\u65B0\u7528\u6237\u6D3B\u52A8/huodongnew47.png',
            displayIndex: 7,
            showRed: true,
            actCycle: 1,
            actType: 1002
        },
        {
            id: 'ee7c49ba-9a79-46b6-a15e-bd0dec2698a4',
            templateName: '\uFF08\u65B0\u7248\u5F00\u670D\uFF09\u82F1\u96C4\u5927\u8FD4\u5229',
            name: 'Hero Grand Kickback',
            icon: '/activity/\u65B0\u670D\u6D3B\u52A8/huodongnew39.png',
            displayIndex: 8,
            showRed: true,
            actCycle: 1,
            actType: 2001
        },
        {
            id: '54273e08-e5fd-4ea8-9f1d-01ad7927f0cc',
            templateName: '\uFF08\u65B0\u7248\u5F00\u670D\uFF09\u795E\u6BBF\u4E89\u5148',
            name: 'Temple Contest',
            icon: '/activity/\u62A2\u5360\u5148\u673A/huodongnew142.png?rnd=561581579242342',
            displayIndex: 9,
            showRed: true,
            actCycle: 4,
            actType: 4003
        },
        {
            id: 'ab188628-9f0b-476b-8ec9-8b52d581595c',
            templateName: '(\u65B0\u7248\u5F00\u670D)\u6A59\u5C06\u96C6\u7ED3\u53F7',
            name: 'Orange Hero Assembly',
            icon: '/activity/\u65B0\u670D\u6D3B\u52A8/huodongnew40.png?rnd=171461604461607',
            displayIndex: 9,
            showRed: true,
            actCycle: 1,
            actType: 2002
        },
        {
            id: '693a71e2-2aaa-4692-8bbd-a735b2aeeb86',
            templateName: '\uFF08\u65B0\u7248\u5F00\u670D\uFF09\u70B9\u4EAE\u56FE\u9274',
            name: 'Ignition Illustration',
            icon: '/activity/\u62A2\u5360\u5148\u673A/huodongnew137.png',
            displayIndex: 10,
            showRed: true,
            actCycle: 4,
            actType: 4001
        },
        {
            id: '99c3b0c4-d222-4ff8-bbcc-0de131f53e3c',
            templateName: '\uFF08\u5F00\u670D\uFF097\u65E5\u4EFB\u610F\u5145',
            name: '7-Day Top-up At Will',
            icon: '/activity/\u65B0\u7528\u6237\u6D3B\u52A8/huodongnew372.png?rnd=558541576031269',
            displayIndex: 85,
            showRed: true,
            actCycle: 1,
            actType: 1003
        },
        {
            id: '79864801-f914-4bdd-a454-b20fdee290e2',
            templateName: '\u5F00\u670D\u4E03\u65E5\u767B\u9646\u6709\u793C',
            name: 'Event Sign-in',
            icon: '/activity/\u65B0\u7528\u6237\u6D3B\u52A8/huodongnew43.png?rnd=92791669347101',
            displayIndex: 9999,
            showRed: false,
            actCycle: 8,
            actType: 1001,
            haveExReward: false
        }
    ];

    // ========================================================
    // 3. BUILD _acts DICTIONARY
    // ========================================================
    // _acts is keyed by activity UUID (same as id field)
    // This matches the HAR structure exactly
    // ========================================================
    function buildActs() {
        var acts = {};
        for (var i = 0; i < ACTIVITY_DATA.length; i++) {
            var act = ACTIVITY_DATA[i];
            acts[act.id] = {
                id: act.id,
                templateName: act.templateName,
                name: act.name,
                icon: act.icon,
                displayIndex: act.displayIndex,
                showRed: act.showRed,
                actCycle: act.actCycle,
                actType: act.actType
            };
            // Only add haveExReward if it exists (Event Sign-in)
            if (act.hasOwnProperty('haveExReward')) {
                acts[act.id].haveExReward = act.haveExReward;
            }
        }
        return acts;
    }

    // ========================================================
    // 4. HANDLER
    // ========================================================
    /**
     * Handler for activity.getActivityBrief
     * Registered via window.MAIN_SERVER_HANDLERS
     * 
     * Request (from HAR):
     *   { type:"activity", action:"getActivityBrief", userId:"<uuid>", version:"1.0" }
     * 
     * Response (from HAR, decompressed):
     *   { type:"activity", action:"getActivityBrief", userId:"<uuid>", version:"1.0",
     *     _acts: { <actId>: { id, templateName, name, icon, displayIndex, showRed,
     *                         actCycle, actType, [haveExReward] }, ... } }
     * 
     * Note: entergame.js wraps this with buildResponse():
     *   { ret:0, data:"<JSON string>", compress:false, serverTime:<ms>, server0Time:14400000 }
     */
    function handleGetActivityBrief(request, playerData) {
        LOG.info('Handling activity.getActivityBrief');
        LOG.info('UserId:', request.userId);

        // Build response matching HAR structure exactly
        var responseData = {
            type: 'activity',
            action: 'getActivityBrief',
            userId: request.userId,
            version: request.version || '1.0',
            _acts: buildActs()
        };

        var actCount = 0;
        for (var key in responseData._acts) {
            if (responseData._acts.hasOwnProperty(key)) {
                actCount++;
            }
        }

        LOG.success('getActivityBrief success');
        LOG.info('Activities returned: ' + actCount);

        // Log each activity briefly
        var cycleNames = {
            1: 'NEW_USER',
            2: 'SERVER_OPEN',
            4: 'RANK',
            8: 'HOLIDAY'
        };
        for (var actId in responseData._acts) {
            if (responseData._acts.hasOwnProperty(actId)) {
                var act = responseData._acts[actId];
                LOG.info('  [' + act.actType + '] ' + act.name +
                    ' (cycle=' + (cycleNames[act.actCycle] || act.actCycle) +
                    ', red=' + act.showRed + ')');
            }
        }

        return responseData;
    }

    // ========================================================
    // 5. REGISTER HANDLER
    // ========================================================
    // entergame.js checks window.MAIN_SERVER_HANDLERS for external handlers
    // The routing logic in _handleRequest does:
    //   1. Check window.MAIN_SERVER_HANDLERS["activity.getActivityBrief"]
    //   2. If found, call handler(request, playerData)
    //   3. Then wrap result with buildResponse() by entergame.js
    // ========================================================
    function register() {
        if (typeof window === 'undefined') {
            console.error('[ACTIVITY-BRIEF] window not available');
            return;
        }

        window.MAIN_SERVER_HANDLERS = window.MAIN_SERVER_HANDLERS || {};
        window.MAIN_SERVER_HANDLERS['activity.getActivityBrief'] = handleGetActivityBrief;

        LOG.success('Handler registered: activity.getActivityBrief');
        LOG.info('Total activities: ' + ACTIVITY_DATA.length);
    }

    // Auto-register with retry (same pattern as existing handlers)
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
