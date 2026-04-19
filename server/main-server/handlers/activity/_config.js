'use strict';

/**
 * =====================================================
 *  activity/_config.js — Activity Shared Configuration
 *  Super Warrior Z Game Server — Main Server
 *
 *  Shared data used by activity handlers:
 *    - ACTIVITY_CYCLE: Full enum (client line 79710)
 *    - ACTIVITY_TYPE:  Full enum (client line 79722)
 *    - ACTIVITY_BRIEF_LIST: Activity entries with scheduling data
 *    - ACTS_MAP: Pre-built lookup map keyed by UUID (DEEP COPIED)
 *
 *  DATA SOURCE:
 *    - 12 activities: 100% verified against HAR (28 identical responses)
 *    - Scheduling fields (_cycleType, _timeType, _durationDay, _startDay,
 *      _startTime, _endTime): from getActivityDetail HAR (7 detail entries)
 *    - Enums: 100% from main.min.js client code
 *
 *  FIELD CLASSIFICATION:
 *    CLIENT fields  — sent in getActivityBrief response, read by client
 *    SERVER fields  — used for filtering/scheduling, STRIPPED before response
 *    DETAIL fields  — from getActivityDetail HAR, used to compute endTime
 *
 *  ═══════════════════════════════════════════════════════
 *  CLIENT FIELDS (in brief response):
 *    id           string   — UUID aktivitas
 *    templateName string   — Template name (client tidak baca, tapi ada di HAR)
 *    name         string   — Display name (client tidak baca, tapi ada di HAR)
 *    icon         string   — Path ikon (line 103410, 168162)
 *    displayIndex number   — Sort desc (line 103407: t.displayIndex - e.displayIndex)
 *    showRed      boolean  — Red dot flag (line 103414)
 *    actCycle     number   — ACTIVITY_CYCLE enum (line 168104)
 *    actType      number   — ACTIVITY_TYPE enum (line 168104)
 *    haveExReward boolean  — ONLY for actType=1001 (LOGIN). Client checks
 *                            _exRewards from detail instead (line 96464),
 *                            but field exists in HAR brief for actType=1001.
 *    cycleType    number   — Used by checkLikeIsOn (line 168104).
 *                            ONLY included when != actCycle.
 *                            Equals actCycle for most activities.
 *    poolId       number   — Used by setActivityList (line 103411) and
 *                            getActivityDetail request (line 168191).
 *                            ONLY included when > 0.
 *    endTime      number   — REGRESSION countdown (line 168102).
 *                            ONLY included for REGRESSION (actCycle=17).
 *                            Drives e.regressActEndtime + setTimeLimitBags().
 *    hangupReward object   — ONLY for actType=100 ITEM_DROP (line 168104).
 *
 *  SERVER-ONLY FIELDS (stripped before response):
 *    minDay       number   — Minimum openServerDays to show activity
 *    maxDay       number   — Maximum openServerDays (0 = no limit)
 *    timeType     number   — 1=fixed timestamps, 2=relative/user-based
 *    durationDay  number   — Activity duration in days
 *    startDay     number   — Offset from server open date (in days)
 *
 *  ═══════════════════════════════════════════════════════
 *  CLIENT PROCESSING — Home.setActs (line 168087-168113):
 *
 *    for(var a in t._acts) {
 *      var r = t._acts[a];
 *      r.endTime && (e.regressActEndtime = r.endTime, e.setTimeLimitBags())
 *      r.id → UUID
 *      r.actType → routing:
 *        101  NEW_USER_MAIL   → skip
 *        5025 FB_SHARE        → o=true, add FBSDKSHARE cycle later
 *        5023 FBGIVELIKE      → checkLikeIsOn(id, actType, cycleType, poolId)
 *        5024 IOSGIVELIKE     → checkLikeIsOn(id, actType, cycleType, poolId)
 *        100  ITEM_DROP       → setHangupReward(r.hangupReward)
 *        102  FREE_INHERIT    → push ke inheritHeroerActBriefDataList
 *        5031 OFFLINE_ACT     → offLineActCycle = r.actCycle
 *        5033 OFFLINE_ACT_TWO → offLineActCycleTwo = r.actCycle
 *        ALL OTHERS           → actCycleList[r.actCycle][].push(r)
 *    }
 *
 *  CLIENT PROCESSING — setActivityList (line 103400-103427):
 *    Sort: t.sort((e,t) => t.displayIndex - e.displayIndex)
 *    Baca: t.icon, t.poolId, t.id, t.showRed, t.actType
 *    Special: MERGESERVER cycle → add RECHARGE_MERGESERVER entry
 *
 *  CLIENT PROCESSING — backToActivityPage (line 57528-57551):
 *    Baca: l.id, l.actCycle → filter by cycle → pass ke BaseActivity
 * =====================================================
 */

// ═══════════════════════════════════════════════════════
// ACTIVITY_CYCLE enum — 100% from client main.min.js line 79710
// ═══════════════════════════════════════════════════════
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
    QUESTION:           60,
    DOWNLOADREWARD:     84,
    FBGIVELIKE:         88,
    IOSGIVELIKE:        89,
    FBSDKSHARE:         90,
    OFFLINEACT:         91,
    OFFLINEACT_TWO:     92,
    YouTubeRecruit:     93,
    RedFoxCommunity:    94,
    NEW_HERO_CHALLENGE: 5041
};

// ═══════════════════════════════════════════════════════
// ACTIVITY_TYPE enum — 100% from client main.min.js line 79722
// ═══════════════════════════════════════════════════════
var ACTIVITY_TYPE = {
    UNKNOWN:              0,
    ITEM_DROP:            100,
    NEW_USER_MAIL:        101,
    FREE_INHERIT:         102,
    LOGIN:                1001,
    GROW:                 1002,
    RECHARGE_3:           1003,
    HERO_GIFT:            2001,
    HERO_ORANGE:          2002,
    NEW_SERVER_GIFT:      2003,
    RECHARGE_GIFT:        2004,
    POWER_RANK:           2005,
    RECHARGE_7:           2006,
    RECHARGE_DAILY:       2007,
    NORMAL_LUCK:          3001,
    LUXURY_LUCK:          3002,
    SUPER_GIFT:           3003,
    LUCKY_FEEDBACK:       3004,
    DAILY_DISCOUNT:       3005,
    DAILY_BIG_GIFT:       3006,
    CUMULATIVE_RECHARGE:  3007,
    ENTRUST_ACT:          3008,
    FRIEND_BATTLE_ACT:    3009,
    MARKET_ACT:           3010,
    KARIN_ACT:            3011,
    BULMA_PARTY:          3012,
    HERO_HELP:            3013,
    SIGN_ACT:             3014,
    HERO_ARRIVAL:         3015,
    BE_STRONG:            3016,
    HERO_IMAGE_RANK:      4001,
    LESSON_RANK:          4002,
    TEMPLE_RANK:          4003,
    RK_POWER_RANK:        4004,
    CELL_GAME_RANK:       4005,
    HERO_POWER_RANK:      4006,
    IMPRINT_STAR_RANK:    4007,
    TALENT_RANK:          4008,
    LUCKY_EQUIP:          5001,
    IMPRINT_UP:           5002,
    TODAY_DISCOUNT:       5003,
    REFRESH_IMPRINT:      5004,
    SUMMON_GIFT:          5005,
    EQUIP_UP:             5006,
    COST_FEEDBACK:        5007,
    MERGE_SERVER_BOSS:    5008,
    GOOD_HARVESTS:        5009,
    TURNTABLE:            5010,
    SINGLE_RECHARGE:      5011,
    SHOP:                 5012,
    HERO_REWARD:          5013,
    WHIS_FEAST:           5014,
    NEW_HERO_REWARD:      5015,
    DOUBLE_ELEVEN:        5016,
    OLD_USER_CERTIFICATION: 5017,
    TIME_LIMIT_EXCHANGR:  5018,
    NIENBEAST:            5019,
    EXCHANGE_MERCHANT:    5020,
    IMPRINT_EXTRACTION:   5022,
    FBGIVELIKE:           5023,
    IOSGIVELIKE:          5024,
    FB_SHARE:             5025,
    BUGGY_TREASURE:       5026,
    DIAMOND_SHOP:         5027,
    EQUIP_CAST:           5028,
    KARIN_RICH:           5029,
    LUCKY_WHEEL:          5030,
    OFFLINE_ACT:          5031,
    BLIND_BOX:            5032,
    OFFLINE_ACT_TWO:      5033,
    FUND:                 5034,
    LANTENBLESSING:       5035,
    CROSS_SERVER_RANK:    5036,
    HERO_SUPER_GIFT:      5037,
    WELFARE_ACCOUNT:      5038,
    GALAXY_ADEVNTURE:     5039,
    GLEANING:             5040,
    NEW_HERO_CHALLENGE:   5041,
    RECHARGE_MERGESERVER: 99999999
};

// ═══════════════════════════════════════════════════════
// ActivityCycleInfoMap sort values — from client line 79029-79174
// Home screen sorts actCycleList by: B.sort - A.sort (DESCENDING)
// Negative sort = rendered first (pinned to top area)
// ═══════════════════════════════════════════════════════
var ACTIVITY_CYCLE_SORT = {
    0:    0,    // UNKNOWN
    1:    79,   // NEW_USER
    2:    69,   // SERVER_OPEN
    3:    0,    // WEEK (not in map)
    4:    89,   // RANK
    5:    58,   // SUMMON
    6:    49,   // BE_STRONG
    7:    59,   // LIMIT_HERO
    8:    99,   // HOLIDAY
    9:    38,   // EQUIPTOTALACTIVITY
    10:   37,   // SIGNTOTALACTIVITY
    11:   39,   // SUMARRYGIFT
    12:   68,   // MERGESERVER
    13:   98,   // SPECIALHOLIDY
    14:   48,   // BUDOPEAK
    15:   47,   // SUPERLEGEND
    16:   95,   // OLDUSERBACK
    17:   50,   // REGRESSION
    18:   60,   // ULTRA_INSTINCT
    19:   62,   // WEEKEND_SIGNIN
    20:   64,   // WELFARE_ACCOUNT
    60:  -1,    // QUESTION
    84:  -2,    // DOWNLOADREWARD
    88:  -3,    // FBGIVELIKE
    89:  -3,    // IOSGIVELIKE
    90:  -3,    // FBSDKSHARE
    91:  -4,    // OFFLINEACT
    92:  -4,    // OFFLINEACT_TWO
    93:  -5,    // YouTubeRecruit
    94:  -5,    // RedFoxCommunity
    5041: 65    // NEW_HERO_CHALLENGE
};

// ═══════════════════════════════════════════════════════
// ACTIVITY_BRIEF_LIST — Activity entries with scheduling
//
// Each entry has:
//   CLIENT fields (sent in response when applicable):
//     id, templateName, name, icon, displayIndex, showRed,
//     actCycle, actType, haveExReward
//
//   CONDITIONAL CLIENT fields (only sent when meaningful):
//     cycleType    — only if != actCycle (for FB/iOS activities)
//     poolId       — only if > 0 (for pool-based activities)
//     endTime      — only for REGRESSION (actCycle=17) activities
//     hangupReward — only for ITEM_DROP (actType=100) activities
//
//   SERVER-ONLY fields (always stripped before response):
//     minDay       — minimum openServerDays to show
//     maxDay       — maximum openServerDays (0 = no limit)
//     timeType     — 1=fixed timestamps, 2=relative/user-based
//     durationDay  — activity duration in days from start
//     startDay     — offset from server open date in days
//
// timeType logic:
//   timeType=1: endTime = serverOpenDate + (startDay + durationDay) * 86400000
//   timeType=2: no endTime (user-based, e.g. NEW_USER cycle)
//
// DATA SOURCE:
//   - Client fields: 100% from HAR (28 identical responses)
//   - Server fields: from getActivityDetail HAR (7 entries) +
//                    _durationDay=7, _startDay=0 for all captured activities
// ═══════════════════════════════════════════════════════
var ACTIVITY_BRIEF_LIST = [
    {
        // ── CLIENT fields ──
        id: '8df2ff74-e2d7-48f6-b32b-0beadee8f916',
        templateName: '（新版开服）每日累充',
        name: 'Daily accumulated top-up',
        icon: '/activity/新服活动/huodongnew35.png?rnd=649231590140442',
        displayIndex: 6,
        showRed: true,
        actCycle: 2,
        actType: 2007,
        // ── SERVER fields (stripped) ──
        cycleType: 2,       // _cycleType from detail HAR
        poolId: 0,
        timeType: 1,        // fixed timestamps
        durationDay: 7,     // _durationDay from detail HAR
        startDay: 0,        // _startDay from detail HAR
        minDay: 1,
        maxDay: 7
    },
    {
        id: 'a0d76656-aa09-45c9-bb8e-92976ed016b0',
        templateName: '新服特惠三选一礼包',
        name: 'Hero Value Pack',
        icon: '/activity/新服活动/xinfuyingxiongtehui_rukou.png?rnd=851641672116391',
        displayIndex: 0,
        showRed: true,
        actCycle: 2,
        actType: 5037,
        cycleType: 2,
        poolId: 0,
        timeType: 1,
        durationDay: 7,
        startDay: 0,
        minDay: 1,
        maxDay: 7
    },
    {
        id: 'ee7c49ba-9a79-46b6-a15e-bd0dec2698a4',
        templateName: '（新版开服）英雄大返利',
        name: 'Hero Grand Kickback',
        icon: '/activity/新服活动/huodongnew39.png',
        displayIndex: 8,
        showRed: true,
        actCycle: 1,
        actType: 2001,
        cycleType: 1,       // detail HAR: _cycleType=1
        poolId: 0,
        timeType: 2,        // detail HAR: _timeType=2 (relative/user-based)
        durationDay: 7,
        startDay: 0,
        minDay: 1,
        maxDay: 7
    },
    {
        id: '693a71e2-2aaa-4692-8bbd-a735b2aeeb86',
        templateName: '（新版开服）点亮图鉴',
        name: 'Ignition Illustration',
        icon: '/activity/抢占先机/huodongnew137.png',
        displayIndex: 10,
        showRed: true,
        actCycle: 4,
        actType: 4001,
        cycleType: 4,
        poolId: 0,
        timeType: 1,
        durationDay: 7,
        startDay: 0,
        minDay: 1,
        maxDay: 7
    },
    {
        id: '93a2ebab-7ca1-438b-a0df-da4d3ca3010d',
        templateName: '（开服）新服特惠包（新）',
        name: 'New Server Discount Pack',
        icon: '/activity/新服活动/huodongnew42.png',
        displayIndex: 2,
        showRed: true,
        actCycle: 2,
        actType: 2003,
        cycleType: 2,
        poolId: 0,
        timeType: 1,
        durationDay: 7,
        startDay: 0,
        minDay: 1,
        maxDay: 7
    },
    {
        id: '54273e08-e5fd-4ea8-9f1d-01ad7927f0cc',
        templateName: '（新版开服）神殿争先',
        name: 'Temple Contest',
        icon: '/activity/抢占先机/huodongnew142.png?rnd=561581579242342',
        displayIndex: 9,
        showRed: true,
        actCycle: 4,
        actType: 4003,
        cycleType: 4,
        poolId: 0,
        timeType: 1,
        durationDay: 7,
        startDay: 0,
        minDay: 1,
        maxDay: 7
    },
    {
        id: 'f4f2041a-0391-48b7-bbd9-cbaf0f957761',
        templateName: '（开服）累充豪礼（新）',
        name: 'Cumulative Top-up Gift',
        icon: '/activity/强者之路/huodongnew107.png',
        displayIndex: 4,
        showRed: true,
        actCycle: 2,
        actType: 2004,
        cycleType: 2,
        poolId: 0,
        timeType: 1,
        durationDay: 7,
        startDay: 0,
        minDay: 1,
        maxDay: 7
    },
    {
        id: 'ab188628-9f0b-476b-8ec9-8b52d581595c',
        templateName: '(新版开服)橙将集结号',
        name: 'Orange Hero Assembly',
        icon: '/activity/新服活动/huodongnew40.png?rnd=171461604461607',
        displayIndex: 9,
        showRed: true,
        actCycle: 1,
        actType: 2002,
        cycleType: 1,
        poolId: 0,
        timeType: 2,        // NEW_USER cycle → relative time
        durationDay: 7,
        startDay: 0,
        minDay: 1,
        maxDay: 7
    },
    {
        id: '99c3b0c4-d222-4ff8-bbcc-0de131f53e3c',
        templateName: '（开服）7日任意充',
        name: '7-Day Top-up At Will',
        icon: '/activity/新用户活动/huodongnew372.png?rnd=558541576031269',
        displayIndex: 85,
        showRed: true,
        actCycle: 1,
        actType: 1003,
        cycleType: 1,
        poolId: 0,
        timeType: 1,        // detail HAR: _timeType=1 with _startTime/_endTime
        durationDay: 7,
        startDay: 0,
        minDay: 1,
        maxDay: 7
    },
    {
        id: '79864801-f914-4bdd-a454-b20fdee290e2',
        templateName: '开服七日登陆有礼',
        name: 'Event Sign-in',
        icon: '/activity/新用户活动/huodongnew43.png?rnd=92791669347101',
        displayIndex: 9999,
        showRed: false,
        actCycle: 8,
        actType: 1001,
        haveExReward: false, // ONLY for actType=1001 (LOGIN)
        cycleType: 8,
        poolId: 0,
        timeType: 1,
        durationDay: 7,
        startDay: 0,
        minDay: 1,
        maxDay: 7
    },
    {
        id: 'd02c4167-dc19-46ca-b854-f15125fbf781',
        templateName: '（开服）今日特价（新）',
        name: 'Discount Today',
        icon: '/activity/强者之路/huodongnew205.png?rnd=574051578983873',
        displayIndex: 3,
        showRed: true,
        actCycle: 2,
        actType: 5003,
        cycleType: 2,
        poolId: 0,
        timeType: 1,
        durationDay: 7,
        startDay: 0,
        minDay: 1,
        maxDay: 7
    },
    {
        id: '2a904fc5-07d1-489c-bec7-90bb178cd1ae',
        templateName: '（开服）成长任务',
        name: 'Growth Quest',
        icon: '/activity/新用户活动/huodongnew47.png',
        displayIndex: 7,
        showRed: true,
        actCycle: 1,
        actType: 1002,
        cycleType: 1,
        poolId: 0,
        timeType: 2,        // NEW_USER cycle → relative time
        durationDay: 7,
        startDay: 0,
        minDay: 1,
        maxDay: 7
    }
];

// ═══════════════════════════════════════════════════════
// Pre-build ACTS_MAP — O(1) lookup by UUID
// DEEP COPIED so mutations don't affect ACTIVITY_BRIEF_LIST
// ═══════════════════════════════════════════════════════
var ACTS_MAP = {};
for (var _i = 0; _i < ACTIVITY_BRIEF_LIST.length; _i++) {
    ACTS_MAP[ACTIVITY_BRIEF_LIST[_i].id] = JSON.parse(JSON.stringify(ACTIVITY_BRIEF_LIST[_i]));
}

module.exports = {
    ACTIVITY_CYCLE: ACTIVITY_CYCLE,
    ACTIVITY_TYPE: ACTIVITY_TYPE,
    ACTIVITY_CYCLE_SORT: ACTIVITY_CYCLE_SORT,
    ACTIVITY_BRIEF_LIST: ACTIVITY_BRIEF_LIST,
    ACTS_MAP: ACTS_MAP
};
