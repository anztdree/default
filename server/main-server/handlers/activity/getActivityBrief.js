/**
 * activity/getActivityBrief.js — Handler: activity/getActivityBrief
 *
 * ═══════════════════════════════════════════════════════════════════
 * DEEP TRACE — main.min(unminfy).js (100% verified)
 * ═══════════════════════════════════════════════════════════════════
 *
 * CALLER #1: Home.setActs() L234743 — called every Home screen entry
 *   ts.processHandler({
 *       type: 'activity', action: 'getActivityBrief',
 *       userId: UserInfoSingleton.getInstance().userId,
 *       version: '1.0'
 *   }, callback);
 *
 * CALLER #2: backToActivityPage() L90691 — returning from detail page
 *   Same request structure, same callback pattern.
 *
 * RESPONSE CONSUMED BY CLIENT:
 *   setActs() L234752: iterates t._acts[] — each item is a plain object
 *   Field names in _acts items have NO underscore prefix (raw: id, actType, actCycle, etc.)
 *   The _acts KEY itself has underscore: { _acts: {...} }
 *   CRITICAL: _acts is an OBJECT keyed by activity id, NOT an array.
 *
 * CLIENT ROUTING (setActs L234755-234770):
 *   actType 101 (NEW_USER_MAIL)  → SKIPPED, never displayed
 *   actType 100 (ITEM_DROP)       → setHangupReward(r.hangupReward), no UI
 *   actType 102 (FREE_INHERIT)    → push to inheritHeroerActBriefDataList
 *   actType 5023/5024 (FB_LIKE)   → checkLikeIsOn() → getActivityDetail
 *   actType 5025 (FB_SHARE)       → set flag, add FBSDKSHARE tab
 *   actType 5031 (OFFLINE_ACT)    → store in ACTIVITY_CYCLE.OFFLINEACT(91) slot
 *   actType 5033 (OFFLINE_ACT_TWO)→ store in ACTIVITY_CYCLE.OFFLINEACT_TWO(92) slot
 *   ALL OTHER actTypes            → push to actCycleList[r.actCycle][]
 *
 * RESPONSE FORMAT (verified from HAR — 31 identical responses):
 *   { _acts: {
 *       "<actId>": {
 *           id:           string   — Activity ID (passed to getActivityDetail as actId)
 *           templateName: string   — Internal template name (Chinese, from server config)
 *           name:         string   — Display name (localized)
 *           icon:         string   — Tab icon URL path
 *           displayIndex: number   — Sort within cycle tab (client sorts DESC at L155535)
 *           showRed:      boolean  — Red dot indicator
 *           actCycle:     number   — ACTIVITY_CYCLE enum (tab grouping)
 *           actType:      number   — ACTIVITY_TYPE enum (determines client routing)
 *           haveExReward: boolean  — (optional) only on LOGIN(1001)
 *       }
 *   }}
 *
 * DATA SOURCE: 100% SERVER-DRIVEN
 *   - No config JSON in resource/json for activity list
 *   - Server decides which activities are active based on conditions
 *   - Activity catalog embedded in this handler (matches HAR capture)
 *
 * CONDITIONS (evaluated per user per request):
 *   K1: userData.user._createTime  → user account age (days since creation)
 *   K2: config.serverOpenDate       → server age (days since first start)
 *   K3: userData.user._attribute._items[104]._num → player level
 *   K4: dayOfWeek                   → weekend detection (Sat/Sun in UTC+7)
 *
 * HAR REFERENCE: har-main-server-decoded.md
 *   - 35 calls captured, 31 returned identical 12-activity response
 *   - All 12 activities verified with correct fields, types, and values
 *
 * ═══════════════════════════════════════════════════════════════
 * BUG FIX LOG
 * ═══════════════════════════════════════════════════════════════
 *
 * [FIX-013] Response missing request echo fields
 *   CAUSE: Response was { _acts: acts } but HAR shows real server
 *     always includes type, action, userId, version in response data.
 *   EVIDENCE: HAR Entry 2 — top-level keys: ["type","action","userId","version","_acts"]
 *     Our response only had ["_acts"].
 *   FIX: Add request.type, request.action, request.userId, request.version to responseData.
 *   NOTE: Client reads t._acts directly (ts.processHandler unwraps), so missing
 *     fields don't break _acts access, but protocol must match HAR exactly.
 *
 * ═══════════════════════════════════════════════════════════════
 * STRICT RULES: NO STUB, OVERRIDE, FORCE, BYPASS, DUMMY, ASUMSI
 */

// ═══════════════════════════════════════════════════════════════
// CLIENT CONSTANTS — Verified from main.min(unminfy).js
// ═══════════════════════════════════════════════════════════════

/**
 * ACTIVITY_TYPE enum — L127063-127145
 * Maps to actType field in brief items. Determines client routing in setActs().
 */
var ACTIVITY_TYPE = {
    ITEM_DROP:              100,
    NEW_USER_MAIL:          101,
    FREE_INHERIT:           102,
    LOGIN:                  1001,
    GROW:                   1002,
    RECHARGE_3:             1003,
    HERO_GIFT:              2001,
    HERO_ORANGE:            2002,
    NEW_SERVER_GIFT:        2003,
    RECHARGE_GIFT:          2004,
    POWER_RANK:             2005,
    RECHARGE_7:             2006,
    RECHARGE_DAILY:         2007,
    NORMAL_LUCK:            3001,
    LUXURY_LUCK:            3002,
    SUPER_GIFT:             3003,
    LUCKY_FEEDBACK:         3004,
    DAILY_DISCOUNT:         3005,
    DAILY_BIG_GIFT:         3006,
    CUMULATIVE_RECHARGE:    3007,
    ENTRUST_ACT:            3008,
    FRIEND_BATTLE_ACT:      3009,
    MARKET_ACT:             3010,
    KARIN_ACT:              3011,
    BULMA_PARTY:            3012,
    HERO_HELP:              3013,
    SIGN_ACT:               3014,
    HERO_ARRIVAL:           3015,
    BE_STRONG:              3016,
    HERO_IMAGE_RANK:        4001,
    LESSON_RANK:            4002,
    TEMPLE_RANK:            4003,
    RK_POWER_RANK:          4004,
    CELL_GAME_RANK:         4005,
    HERO_POWER_RANK:        4006,
    IMPRINT_STAR_RANK:      4007,
    TALENT_RANK:            4008,
    LUCKY_EQUIP:            5001,
    IMPRINT_UP:             5002,
    TODAY_DISCOUNT:         5003,
    REFRESH_IMPRINT:        5004,
    SUMMON_GIFT:            5005,
    EQUIP_UP:               5006,
    COST_FEEDBACK:          5007,
    MERGE_SERVER_BOSS:      5008,
    GOOD_HARVESTS:          5009,
    TURNTABLE:              5010,
    SINGLE_RECHARGE:        5011,
    SHOP:                   5012,
    HERO_REWARD:            5013,
    WHIS_FEAST:             5014,
    NEW_HERO_REWARD:        5015,
    DOUBLE_ELEVEN:          5016,
    OLD_USER_CERTIFICATION: 5017,
    TIME_LIMIT_EXCHANGR:    5018,
    NIENBEAST:              5019,
    EXCHANGE_MERCHANT:      5020,
    IMPRINT_EXTRACTION:     5022,
    RECHARGE_MERGESERVER:   99999999,
    FBGIVELIKE:             5023,
    IOSGIVELIKE:            5024,
    FB_SHARE:               5025,
    BUGGY_TREASURE:         5026,
    DIAMOND_SHOP:           5027,
    EQUIP_CAST:             5028,
    KARIN_RICH:             5029,
    LUCKY_WHEEL:            5030,
    OFFLINE_ACT:            5031,
    BLIND_BOX:              5032,
    OFFLINE_ACT_TWO:        5033,
    FUND:                   5034,
    LANTENBLESSING:         5035,
    CROSS_SERVER_RANK:      5036,
    HERO_SUPER_GIFT:        5037,
    WELFARE_ACCOUNT:        5038,
    GALAXY_ADEVNTURE:       5039,
    GLEANING:               5040,
    NEW_HERO_CHALLENGE:     5041
};

/**
 * ACTIVITY_CYCLE enum — L127000-127034
 * Maps to actCycle field in brief items. Determines tab grouping in UI.
 */
var ACTIVITY_CYCLE = {
    UNKNOWN:            0,
    NEW_USER:           1,
    SERVER_OPEN:        2,
    WEEK:               3,
    RANK:               4,
    SUMMON:             5,
    BE_STRONG:          6,
    LIMIT_HERO:         7,
    HOLIDAY:            8,
    EQUIPTOTALACTIVITY: 9,
    SIGNTOTALACTIVITY:  10,
    SUMARRYGIFT:        11,
    MERGESERVER:        12,
    SPECIALHOLIDY:      13,
    BUDOPEAK:           14,
    SUPERLEGEND:        15,
    OLDUSERBACK:        16,
    REGRESSION:         17,
    ULTRA_INSTINCT:     18,
    WEEKEND_SIGNIN:     19,
    WELFARE_ACCOUNT:    20,
    FBSDKSHARE:         90,
    QUESTION:           60,
    DOWNLOADREWARD:     84,
    OFFLINEACT:         91,
    OFFLINEACT_TWO:     92,
    YouTubeRecruit:     93,
    RedFoxCommunity:    94,
    NEW_HERO_CHALLENGE: 5041
};

/**
 * ActivityCycleInfoMap — L116349-116494
 * Used by client for home screen icon rendering and sort order.
 * Included here for reference only — NOT sent to client in response.
 * homeIcon: resource key for the activity cycle's home screen button
 * titleImg: resource key for the activity page title banner
 * sort: display priority on home screen (higher = shown first)
 */
var ACTIVITY_CYCLE_INFO = {
    1:    { titleImg: 'huodongnew6_png',     homeIcon: 'zhujiemiannew87_png',  sort: 79  },
    2:    { titleImg: 'huodongnew53_png',    homeIcon: 'zhujiemiannew88_png',  sort: 69  },
    4:    { titleImg: 'huodongnew176_png',   homeIcon: 'zhujiemiannew101_png', sort: 89  },
    5:    { titleImg: 'huodongnew175_png',   homeIcon: 'zhujiemiannew106_png', sort: 58  },
    6:    { titleImg: 'huodongnew174_png',   homeIcon: 'zhujiemiannew105_png', sort: 49  },
    7:    { titleImg: 'huodongnew193_png',   homeIcon: 'zhujiemiannew108_png', sort: 59  },
    8:    { titleImg: 'huodongnew219_png',   homeIcon: 'zhujiemiannew125_png', sort: 99  },
    9:    { titleImg: 'huodongnew236_png',   homeIcon: 'zhujiemiannew112_png', sort: 38  },
    10:   { titleImg: 'huodongnew237_png',   homeIcon: 'zhujiemiannew111_png', sort: 37  },
    11:   { titleImg: 'huodongnew235_png',   homeIcon: 'zhujiemiannew110_png', sort: 39  },
    12:   { titleImg: 'huodongnew268_png',   homeIcon: 'zhujiemiannew124_png', sort: 68  },
    13:   { titleImg: 'huodongnew349_png',   homeIcon: 'zhujiemiannew126_png', sort: 98  },
    14:   { titleImg: 'huodongnew385_png',   homeIcon: 'zhujiemiannew129_png', sort: 48  },
    15:   { titleImg: 'huodongnew384_png',   homeIcon: 'zhujiemiannew128_png', sort: 47  },
    16:   { titleImg: 'zhujiemiannew134_png',homeIcon: 'zhujiemiannew133_png', sort: 95  },
    17:   { titleImg: 'huodonghuiguihaoli49_png', homeIcon: 'zhujiemiannew151_png', sort: 50 },
    18:   { titleImg: 'huodongnew856_png',   homeIcon: 'zhujiemiannew152_png', sort: 60  },
    19:   { titleImg: 'huodongnew892_png',   homeIcon: 'zhujiemiannew153_png', sort: 62  },
    20:   { titleImg: 'huodongnew983_png',   homeIcon: 'zhujiemiannew154_png', sort: 64  },
    60:   { titleImg: '',                    homeIcon: 'zhujiemiannew141_png', sort: -1  },
    84:   { titleImg: '',                    homeIcon: 'zhujiemiannew148_png', sort: -2  },
    88:   { titleImg: '',                    homeIcon: 'zhujiemiannew142_language_png', sort: -3 },
    89:   { titleImg: '',                    homeIcon: 'zhujiemiannew136_language_png', sort: -3 },
    90:   { titleImg: '',                    homeIcon: 'zhujiemiannew137_language_png', sort: -3 },
    91:   { titleImg: '',                    homeIcon: 'zhujiemiannew149_png', sort: -4  },
    92:   { titleImg: '',                    homeIcon: 'zhujiemiannew150_png', sort: -4  },
    93:   { titleImg: '',                    homeIcon: 'youtobe_6_png',        sort: -5  },
    94:   { titleImg: '',                    homeIcon: 'honghushequ_png',      sort: -5  },
    5041: { titleImg: '',                    homeIcon: 'honghushequ_png',      sort: 65  }
};

// ═══════════════════════════════════════════════════════════════
// ACTIVITY CATALOG — Embedded server config
// ═══════════════════════════════════════════════════════════════
//
// 12 activities matching real server behavior (HAR verified).
// Each entry = one activity with activation conditions.
// Conditions are evaluated at request time against user data + server state.
// If ALL conditions pass → activity is included in the brief response.
//
// DATA VERIFIED against har-main-server-decoded.md:
//   - 31/35 HAR entries returned these exact 12 activities
//   - All field names, types, and values match byte-for-byte
//   - Response is an OBJECT keyed by activity id (not an array)
//
// CONDITIONS:
//   serverAge  — Active if server opened within N days (uses config.serverOpenDate)
//   userAge    — Active if user account is within N days old (uses userData.user._createTime)
//   always     — Always active regardless of conditions
//   userLevel  — Active if player level >= N
//   weekend    — Active on Saturday/Sunday (UTC+7)
//
// ICON FORMAT: HTTP URL path to game CDN resources.
//   Client loads these as tab icons inside the activity page.
//   Example: "/activity/新服活动/xinfuyingxiongtehui_rukou.png?rnd=851641672116391"
//
// DISPLAY INDEX: Sort order WITHIN a cycle tab.
//   Client sorts by displayIndex DESC at L155535 (higher = shown first).
//   Special value 9999 = hidden from main list (e.g., LOGIN cycle 8).
//
// SHOW RED: Red dot indicator on the activity tab.
//   true = show red dot (has unclaimed rewards or content)
//   false = no red dot (no new content)

var MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Activity catalog — 12 activities verified from HAR capture.
 * Source: har-main-server-decoded.md (31 identical responses captured)
 */
var ACTIVITY_CATALOG = [

    // ─── SERVER OPEN (cycle 2) — 5 activities ─────────────────
    // Active within 14 days of server launch (config.serverOpenDate)
    // These are the "new server" promotion events.

    {
        templateName: '新服特惠三选一礼包',
        name: 'Hero Value Pack',
        actType: ACTIVITY_TYPE.HERO_SUPER_GIFT,    // 5037
        actCycle: ACTIVITY_CYCLE.SERVER_OPEN,       // 2
        icon: '/activity/新服活动/xinfuyingxiongtehui_rukou.png?rnd=851641672116391',
        displayIndex: 0,
        showRed: true,
        conditions: [
            { check: 'serverAge', maxDays: 14 }
        ]
    },
    {
        templateName: '（开服）新服特惠包（新）',
        name: 'New Server Discount Pack',
        actType: ACTIVITY_TYPE.NEW_SERVER_GIFT,    // 2003
        actCycle: ACTIVITY_CYCLE.SERVER_OPEN,       // 2
        icon: '/activity/新服活动/huodongnew42.png',
        displayIndex: 2,
        showRed: true,
        conditions: [
            { check: 'serverAge', maxDays: 14 }
        ]
    },
    {
        templateName: '（开服）今日特价（新）',
        name: 'Discount Today',
        actType: ACTIVITY_TYPE.TODAY_DISCOUNT,      // 5003
        actCycle: ACTIVITY_CYCLE.SERVER_OPEN,       // 2
        icon: '/activity/强者之路/huodongnew205.png?rnd=574051578983873',
        displayIndex: 3,
        showRed: true,
        conditions: [
            { check: 'serverAge', maxDays: 14 }
        ]
    },
    {
        templateName: '（开服）累充豪礼（新）',
        name: 'Cumulative Top-up Gift',
        actType: ACTIVITY_TYPE.RECHARGE_GIFT,       // 2004
        actCycle: ACTIVITY_CYCLE.SERVER_OPEN,       // 2
        icon: '/activity/强者之路/huodongnew107.png',
        displayIndex: 4,
        showRed: true,
        conditions: [
            { check: 'serverAge', maxDays: 14 }
        ]
    },
    {
        templateName: '（新版开服）每日累充',
        name: 'Daily accumulated top-up',
        actType: ACTIVITY_TYPE.RECHARGE_DAILY,      // 2007
        actCycle: ACTIVITY_CYCLE.SERVER_OPEN,       // 2
        icon: '/activity/新服活动/huodongnew35.png?rnd=649231590140442',
        displayIndex: 6,
        showRed: true,
        conditions: [
            { check: 'serverAge', maxDays: 14 }
        ]
    },

    // ─── NEW USER (cycle 1) — 4 activities ─────────────────────
    // Active for users within 7 days of account creation (userData.user._createTime)

    {
        templateName: '（开服）成长任务',
        name: 'Growth Quest',
        actType: ACTIVITY_TYPE.GROW,               // 1002
        actCycle: ACTIVITY_CYCLE.NEW_USER,          // 1
        icon: '/activity/新用户活动/huodongnew47.png',
        displayIndex: 7,
        showRed: true,
        conditions: [
            { check: 'userAge', maxDays: 7 }
        ]
    },
    {
        templateName: '（新版开服）英雄大返利',
        name: 'Hero Grand Kickback',
        actType: ACTIVITY_TYPE.HERO_GIFT,          // 2001
        actCycle: ACTIVITY_CYCLE.NEW_USER,          // 1
        icon: '/activity/新服活动/huodongnew39.png',
        displayIndex: 8,
        showRed: true,
        conditions: [
            { check: 'userAge', maxDays: 7 }
        ]
    },
    {
        templateName: '(新版开服)橙将集结号',
        name: 'Orange Hero Assembly',
        actType: ACTIVITY_TYPE.HERO_ORANGE,        // 2002
        actCycle: ACTIVITY_CYCLE.NEW_USER,          // 1
        icon: '/activity/新服活动/huodongnew40.png?rnd=171461604461607',
        displayIndex: 9,
        showRed: true,
        conditions: [
            { check: 'userAge', maxDays: 7 }
        ]
    },
    {
        templateName: '（开服）7日任意充',
        name: '7-Day Top-up At Will',
        actType: ACTIVITY_TYPE.RECHARGE_3,          // 1003
        actCycle: ACTIVITY_CYCLE.NEW_USER,          // 1
        icon: '/activity/新用户活动/huodongnew372.png?rnd=558541576031269',
        displayIndex: 85,
        showRed: true,
        conditions: [
            { check: 'userAge', maxDays: 7 }
        ]
    },

    // ─── RANK (cycle 4) — 2 activities ─────────────────────────
    // Always active. Competitive ranking events.

    {
        templateName: '（新版开服）神殿争先',
        name: 'Temple Contest',
        actType: ACTIVITY_TYPE.TEMPLE_RANK,        // 4003
        actCycle: ACTIVITY_CYCLE.RANK,              // 4
        icon: '/activity/抢占先机/huodongnew142.png?rnd=561581579242342',
        displayIndex: 9,
        showRed: true,
        conditions: [
            { check: 'always' }
        ]
    },
    {
        templateName: '（新版开服）点亮图鉴',
        name: 'Ignition Illustration',
        actType: ACTIVITY_TYPE.HERO_IMAGE_RANK,    // 4001
        actCycle: ACTIVITY_CYCLE.RANK,              // 4
        icon: '/activity/抢占先机/huodongnew137.png',
        displayIndex: 10,
        showRed: true,
        conditions: [
            { check: 'always' }
        ]
    },

    // ─── HOLIDAY (cycle 8) — 1 activity ────────────────────────
    // Login sign-in reward — always active, hidden from main list (displayIndex 9999)

    {
        templateName: '开服七日登陆有礼',
        name: 'Event Sign-in',
        actType: ACTIVITY_TYPE.LOGIN,               // 1001
        actCycle: ACTIVITY_CYCLE.HOLIDAY,           // 8
        icon: '/activity/新用户活动/huodongnew43.png?rnd=92791669347101',
        displayIndex: 9999,
        showRed: false,
        haveExReward: false,
        conditions: [
            { check: 'always' }
        ]
    }
];

// ═══════════════════════════════════════════════════════════════
// CONDITION EVALUATORS
// ═══════════════════════════════════════════════════════════════

/**
 * Evaluate a single condition against user data and server config.
 * Returns true if the condition is met.
 *
 * @param {object} cond    - Condition object { check: string, ...params }
 * @param {object} context - { userData, serverOpenDate, userLevel, userAgeDays, serverAgeDays, dayOfWeek }
 * @returns {boolean}
 */
function evaluateCondition(cond, context) {
    switch (cond.check) {

        case 'always':
            return true;

        case 'userAge':
            // Active if user account age is within maxDays
            // Uses userData.user._createTime (write-once, set at account creation)
            return context.userAgeDays >= 0 && context.userAgeDays <= (cond.maxDays || 999);

        case 'serverAge':
            // Active if server age is within maxDays
            // Uses config.serverOpenDate (auto-set on first server start)
            return context.serverAgeDays >= 0 && context.serverAgeDays <= (cond.maxDays || 999);

        case 'userLevel':
            // Active if user level meets minimum requirement
            // Level path: userData.user._attribute._items[104]._num
            return context.userLevel >= (cond.minLevel || 0);

        case 'weekend':
            // Active on Saturday (6) or Sunday (0) in UTC+7 timezone
            return context.dayOfWeek === 0 || context.dayOfWeek === 6;

        default:
            return false;
    }
}

/**
 * Evaluate ALL conditions for a catalog entry. All must pass (AND logic).
 * @param {object} entry   - Activity catalog entry with .conditions array
 * @param {object} context - Same context passed to evaluateCondition
 * @returns {boolean}
 */
function evaluateAllConditions(entry, context) {
    if (!entry.conditions || entry.conditions.length === 0) {
        return true;
    }
    for (var i = 0; i < entry.conditions.length; i++) {
        if (!evaluateCondition(entry.conditions[i], context)) {
            return false;
        }
    }
    return true;
}

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

var PLAYERLEVELID = 104;

/**
 * Extract user level from userData.
 * Path: userData.user._attribute._items[104]._num
 * Falls back to 0 if path is missing (should not happen for valid accounts).
 */
function getUserLevel(userData) {
    try {
        return userData.user._attribute._items[PLAYERLEVELID]._num || 0;
    } catch (e) {
        return 0;
    }
}

/**
 * Get current day of week in UTC+7 timezone.
 * Returns 0 (Sunday) through 6 (Saturday).
 */
function getDayOfWeekUTC7() {
    var now = new Date();
    // UTC+7 = UTC + 7 hours
    var utc7 = new Date(now.getTime() + 7 * 60 * 60 * 1000);
    return utc7.getDay();
}

/**
 * Generate a deterministic activity ID from actType and actCycle.
 * Same actType + actCycle always produces the same ID → client can track state.
 * Format: act_<actType>_<actCycle>
 */
function generateActId(actType, actCycle) {
    return 'act_' + actType + '_' + actCycle;
}

// ═══════════════════════════════════════════════════════════════
// MAIN HANDLER
// ═══════════════════════════════════════════════════════════════

function handleGetActivityBrief(request, ctx) {
    var userId = request.userId;

    // ─── STEP 1: Validate request ───
    ctx.logger.step(1, 3, 'Validate request', 'running');
    ctx.logger.details('request',
        ['userId', userId ? userId.substring(0, 20) + '...' : 'MISSING']
    );

    if (!userId) {
        ctx.logger.step(1, 3, 'Validate request', 'fail', 'userId MISSING');
        return ctx.buildErrorResponse(8);
    }
    ctx.logger.step(1, 3, 'Validate request', 'pass');

    // ─── STEP 2: Load user data ───
    ctx.logger.step(2, 3, 'Load user data', 'running');
    var userData = ctx.db.getUser(userId);
    if (!userData) {
        ctx.logger.step(2, 3, 'Load user data', 'fail', 'User not found in DB');
        return ctx.buildErrorResponse(8);
    }

    // Extract condition inputs from userData
    var userLevel = getUserLevel(userData);
    var userCreateTime = (userData.user && userData.user._createTime) || 0;
    var userAgeDays = userCreateTime > 0 ? (Date.now() - userCreateTime) / MS_PER_DAY : -1;
    var serverOpenDate = ctx.config.serverOpenDate || 0;
    var serverAgeDays = serverOpenDate > 0 ? (Date.now() - serverOpenDate) / MS_PER_DAY : -1;
    var dayOfWeek = getDayOfWeekUTC7();

    ctx.logger.step(2, 3, 'Load user data', 'pass');
    ctx.logger.details('userData',
        ['userLevel', String(userLevel)],
        ['userCreateTime', userCreateTime > 0 ? new Date(userCreateTime).toISOString() : 'N/A'],
        ['userAgeDays', userAgeDays >= 0 ? userAgeDays.toFixed(1) + ' days' : 'N/A'],
        ['serverOpenDate', serverOpenDate > 0 ? new Date(serverOpenDate).toISOString() : 'N/A'],
        ['serverAgeDays', serverAgeDays >= 0 ? serverAgeDays.toFixed(1) + ' days' : 'N/A'],
        ['dayOfWeek(UTC+7)', String(dayOfWeek) + ' (' + (dayOfWeek === 0 ? 'Sun' : dayOfWeek === 6 ? 'Sat' : 'Weekday') + ')']
    );

    // ─── STEP 3: Evaluate activity catalog ───
    ctx.logger.step(3, 3, 'Generate activity list', 'running');

    var context = {
        userData:      userData,
        serverOpenDate: serverOpenDate,
        userLevel:     userLevel,
        userAgeDays:   userAgeDays,
        serverAgeDays: serverAgeDays,
        dayOfWeek:     dayOfWeek
    };

    // _acts is an OBJECT keyed by activity id (HAR verified)
    var acts = {};
    var evaluatedCount = 0;
    var activatedCount = 0;

    for (var i = 0; i < ACTIVITY_CATALOG.length; i++) {
        var entry = ACTIVITY_CATALOG[i];
        evaluatedCount++;

        if (evaluateAllConditions(entry, context)) {
            activatedCount++;
            var actId = generateActId(entry.actType, entry.actCycle);

            // Build brief item with fields matching HAR response exactly
            var briefItem = {
                id:           actId,
                templateName: entry.templateName,
                name:         entry.name,
                icon:         entry.icon,
                displayIndex: entry.displayIndex,
                showRed:      entry.showRed,
                actCycle:     entry.actCycle,
                actType:      entry.actType
            };

            // Optional fields (only included when present in catalog entry)
            if (entry.haveExReward !== undefined) {
                briefItem.haveExReward = entry.haveExReward;
            }

            acts[actId] = briefItem;

            ctx.logger.details('activated',
                ['name', entry.name],
                ['actType', String(entry.actType)],
                ['actCycle', String(entry.actCycle)],
                ['displayIndex', String(entry.displayIndex)],
                ['showRed', String(entry.showRed)]
            );
        }
    }

    ctx.logger.step(3, 3, 'Generate activity list', 'pass');
    ctx.logger.details('summary',
        ['catalog', String(evaluatedCount)],
        ['activated', String(activatedCount)],
        ['returned', String(Object.keys(acts).length)]
    );

    // Log cycle summary
    var actIds = Object.keys(acts);
    var cycleSummary = {};
    for (var j = 0; j < actIds.length; j++) {
        var cycle = acts[actIds[j]].actCycle;
        if (!cycleSummary[cycle]) {
            cycleSummary[cycle] = 0;
        }
        cycleSummary[cycle]++;
    }
    var cycleKeys = Object.keys(cycleSummary);
    for (var k = 0; k < cycleKeys.length; k++) {
        var c = cycleKeys[k];
        var info = ACTIVITY_CYCLE_INFO[c];
        ctx.logger.details('cycle_' + c,
            ['count', String(cycleSummary[c])],
            ['homeIcon', info ? info.homeIcon : 'N/A'],
            ['sort', info ? String(info.sort) : 'N/A']
        );
    }

    // ─── Build response ───
    // [FIX-013] Echo request fields in response (HAR verified)
    var responseData = {
        type: request.type,
        action: request.action,
        userId: request.userId,
        version: request.version || '1.0',
        _acts: acts
    };

    ctx.logger.responseSnapshot('ACTIVITY BRIEF ret=0', responseData);

    return ctx.buildDataResponse(0, responseData);
}

module.exports = handleGetActivityBrief;
