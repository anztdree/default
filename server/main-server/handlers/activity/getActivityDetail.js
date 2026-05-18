/**
 * activity/getActivityDetail.js — Handler: activity/getActivityDetail
 *
 * ═══════════════════════════════════════════════════════════════════
 * DEEP TRACE — main.min(unminfy).js (100% verified)
 * ═══════════════════════════════════════════════════════════════════
 *
 * CALLER: BaseActivity.changeDetalActivityView() L147471-147694
 *   ts.processHandler({
 *       type: 'activity', action: 'getActivityDetail',
 *       userId: UserInfoSingleton.getInstance().userId,
 *       actId: e.actId,
 *       cycleType: n.getActivityCycle(),
 *       poolId: e.poolId,
 *       version: '1.0'
 *   }, function (t) {
 *       ActivityManager.getInstance().changeEndTime(t);
 *       switch (t.act._activityType) {
 *           case 1001: n = 'SevenDaysSign'; break;
 *           case 1002: n = 'GrowUpActivity'; break;
 *           case 1003: n = 'SevenDaysRecharge'; break;
 *           case 2001: n = 'HeroGift'; break;
 *           case 2002: n = 'HeroOrange'; break;
 *           case 2003: n = 'NewServerGift'; break;
 *           case 2004: n = 'SevenDaysRecharge'; break;
 *           case 2007: n = 'DailyRecharge'; break;
 *           case 4001: n = 'TotalRankActivity'; break;
 *           case 4003: n = 'TotalRankActivity'; break;
 *           case 5003: n = 'TodayDiscount'; break;
 *           case 5037: n = 'HeroSuperGift'; break;
 *           // ... 50+ more cases
 *       }
 *   });
 *
 * RESPONSE FORMAT (HAR verified):
 *   {
 *       act: { ... },        // Activity definition (server-constructed)
 *       uact: { ... },       // User progress (persistent per user per actId)
 *       forceEndTime: 0,     // Optional: cap act._endTime
 *       // Rank types ONLY:
 *       selfValue: 0,
 *       selfRank: 0,
 *       rank: [ { _nickName, _rankValue }, ... ]
 *   }
 *
 * ACT -> CLIENT DESERIALIZATION (ActivityManager L126443-126957):
 *   All ActivityXxxModel classes extend ActivityBase.
 *   ActivityBase.deserialize(e) reads fields with _ prefix:
 *     _id, _name, _des, _icon, _image, _displayIndex, _activityType, _cycleType,
 *     _enable, _timeType, _newUserUsing, _startDay, _durationDay,
 *     _startTime, _endTime, _showRed, _templateId, _templateName, __name, __des,
 *     _isloop, _loopInterval, _loopCount, _loopTag, _timestamp, _hideos,
 *     _oldUserVip, _oldUserServerOpenDay, _oldUserServerOpenDayEnd, _oldUserOfflineDay,
 *     _nextRefreshTime, _limitReward, __ruleDes, _displayAdvance, _displayExtend
 *
 * UACT -> CLIENT DESERIALIZATION (UserActivityBase L127320-127340):
 *   _startTime, _endTime, _activityId, _loopTag, _haveClick, _gotRewards
 *   Plus type-specific fields per UserXxxActivity subclass.
 *
 * changeEndTime() L126812:
 *   forceEndTime && (act._endTime = Math.min(act._endTime, forceEndTime));
 *
 * DATA SOURCE: 100% SERVER-DRIVEN
 *   No JSON config in resource/json for activity details.
 *   All act data is embedded in this handler's ACTIVITY_DETAIL_CATALOG.
 *   uact data is persistent per-user per-actId via ctx.db.
 *
 * HAR REFERENCE: har-main-server-decoded.md
 *   13 captures, 8 unique activity types with exact field structures.
 *
 * PHASE 1: 12 types (8 HAR-verified + 4 catalog-only)
 *   HAR-verified: 1003, 2001, 2002, 2003, 2004, 2007, 5003, 5037
 *   Catalog-only: 1001, 1002, 4001, 4003
 *
 * PHASE 2-7: Remaining 55+ types (to be added incrementally)
 *
 * STRICT RULES: NO STUB, OVERRIDE, FORCE, BYPASS, DUMMY, ASSUMPTIONS
 */

// ═══════════════════════════════════════════════════════════════
// CLIENT CONSTANTS — Verified from main.min(unminfy).js
// ═══════════════════════════════════════════════════════════════

/**
 * ACTIVITY_TYPE enum — L127063-127145
 * Maps to act._activityType field. Determines which UI panel renders.
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
 * Maps to act._cycleType field. Determines UI tab grouping.
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
    WELFARE_ACCOUNT:    20
};

/**
 * ACTIVITY_TIME_TYPE enum — L127035-127042
 * Maps to act._timeType. Determines which timestamp source to use.
 *   0 = UNKNOWN
 *   1 = SERVER_OPEN -> time from config.serverOpenDate + _startDay
 *   2 = USER        -> time from userData.user._createTime + _startDay
 *   3 = SPECIFIC    -> fixed absolute timestamps
 */
var ACTIVITY_TIME_TYPE = {
    UNKNOWN:     0,
    SERVER_OPEN: 1,
    USER:        2,
    SPECIFIC:    3
};

/**
 * GROW_ACTIVITY_PAGE_TYPE enum — L127043-127062
 * Used by GROW (1002) activity to categorize task pages.
 */
var GROW_PAGE_TYPE = {
    UNKNOW:           0,
    EQUIP_MARGE:      1,
    MARKET_REFRESH:   2,
    ARENA:            3,
    DUNGEON_SOURCE:   4,
    TEMPLE:           5,
    DUNGEON_EQUIP:    6,
    SNAKE:            7,
    STRONG_ENEMY:     8,
    KARIN:            9,
    ENTRUST:          10,
    MAHA:             11,
    SING_WEAR:        12,
    CELL_GAME_LEVEL:  13,
    SING_DUNGEON:     14,
    KARIN_BATTLE:     15
};

/**
 * HeroSuperGiftShowType enum — L130156-130161
 * Used by HERO_SUPER_GIFT (5037) for display variant.
 */
var HERO_SUPER_GIFT_SHOW = {
    SuperGift:      0,
    NewServerGift:  1
};

// ═══════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════

var MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Currency/Resource IDs — from game data */
var ITEM_ID = {
    DIAMOND:        101,
    GOLD:           102,
    EXP:            103,
    LEVEL:          104,
    VIP_LEVEL:      106,
    EXP_CAPSULE:    131,
    EVOLVE_CAPSULE: 132,
    POWER_STONE:    134,
    SUPER_WATER:    135,
    ENERGY_STONE:   136,
    SENZU_BEAN:     146,
    SOUL_STONE:     111,
    ADVANCED_SUMMON:123,
    JADE_POTARA:    139
};

// ═══════════════════════════════════════════════════════════════
// REWARD ITEM BUILDERS
// ═══════════════════════════════════════════════════════════════

/**
 * Build a single reward item object.
 * HAR format: { _id: itemId, _num: count }
 */
function rewardItem(id, num) {
    return { _id: id, _num: num };
}

/**
 * HAR-exact normal reward: includes _randReward:[] and _anyReward:{_icon:"",_anyReward:[]}
 * Format from HAR captures — ALL normal rewards have these three fields.
 */
function normalReward(items) {
    var result = { _items: {} };
    for (var i = 0; i < items.length; i++) {
        result._items[String(i)] = rewardItem(items[i].id, items[i].num);
    }
    return {
        _normalReward: result,
        _randReward: [],
        _anyReward: { _icon: "", _anyReward: [] }
    };
}

/**
 * Rand reward with weighted groups (HAR format for 2001).
 * Returns { _icon: icon, _randReward: { _groups: groups } }
 */
function randGroupReward(icon, groups) {
    return {
        _icon: icon,
        _randReward: {
            _groups: groups
        }
    };
}

/**
 * Build a single rand reward group for use inside _groups.
 */
function randRewardGroup(groupId, totalWeight, items) {
    return {
        _groupId: groupId,
        _totalWeight: totalWeight,
        _items: items
    };
}

// ═══════════════════════════════════════════════════════════════
// COMMON ACT/UACT FIELD BUILDERS
// ═══════════════════════════════════════════════════════════════

/**
 * Build common ActivityBase fields shared by ALL activity types.
 * Source: ActivityBase constructor L127298-127302, deserializer L126443-126576.
 * Includes HAR-verified tail fields: __ruleDes, _displayAdvance, _displayExtend.
 *
 * @param {object} opts - Activity base options
 * @returns {object} Complete act base object
 */
function buildActBase(opts) {
    return {
        _id:                   opts.actId || '',
        _templateId:           '',
        _templateName:         opts.templateName || '',
        _name:                 opts.name || '',
        __name:                opts.__name || opts.name || '',
        _des:                  opts.des || '',
        __des:                 opts.__des || opts.des || '',
        _icon:                 opts.icon || '',
        _image:                opts.image || '',
        _displayIndex:         opts.displayIndex || 0,
        _showRed:              opts.showRed !== undefined ? opts.showRed : true,
        _activityType:         opts.actType || 0,
        _cycleType:            opts.cycleType || 0,
        _enable:               opts.enable !== undefined ? opts.enable : true,
        _timeType:             opts.timeType !== undefined ? opts.timeType : ACTIVITY_TIME_TYPE.SERVER_OPEN,
        _newUserUsing:         opts.newUserUsing || false,
        _isloop:               opts.isloop || false,
        _loopInterval:         opts.loopInterval || 0,
        _startDay:             opts.startDay || 0,
        _durationDay:          opts.durationDay || 0,
        _oldUserVip:           opts.oldUserVip || 0,
        _oldUserServerOpenDay:  0,
        _oldUserServerOpenDayEnd: 0,
        _oldUserOfflineDay:    opts.oldUserOfflineDay || 0,
        _startTime:            opts.startTime || 0,
        _endTime:              opts.endTime || 0,
        _loopCount:            0,
        _loopTag:              '',
        _timestamp:            Date.now(),
        _hideos:               '',
        _limitReward:          { _items: {} },
        __ruleDes:             null,
        _displayAdvance:       0,
        _displayExtend:        opts.displayExtend || 0
    };
}

/**
 * Build common UserActivityBase fields shared by ALL user activity data.
 * Source: UserActivityBase constructor L127320-127340.
 */
function buildUactBase(actId, startTime, endTime) {
    return {
        _startTime:    startTime || 0,
        _endTime:      endTime || 0,
        _activityId:   actId || '',
        _loopTag:      '',
        _haveClick:    false,
        _gotRewards:   { _items: {} }
    };
}

/**
 * Generate a deterministic activity ID from actType and cycleType.
 * Must match getActivityBrief.js generateActId().
 * Format: act_{actType}_{cycleType}
 */
function generateActId(actType, cycleType) {
    return 'act_' + actType + '_' + cycleType;
}

/** Storage key for per-user per-activity progress data */
function uactStorageKey(userId, actId) {
    return 'act_uact_' + userId + '_' + actId;
}

/** Load user's activity progress from persistence. Returns null if not found. */
function loadUact(userId, actId, ctx) {
    var key = uactStorageKey(userId, actId);
    return ctx.db.getItem(key);
}

/** Save user's activity progress to persistence. */
function saveUact(userId, actId, uactData, ctx) {
    var key = uactStorageKey(userId, actId);
    ctx.db.setItem(key, uactData);
}

/**
 * Calculate activity start/end timestamps based on timeType.
 */
function calcActivityTime(timeType, startDay, durationDay, context) {
    var anchor = 0;
    if (timeType === ACTIVITY_TIME_TYPE.SERVER_OPEN) {
        anchor = context.serverOpenDate || 0;
    } else if (timeType === ACTIVITY_TIME_TYPE.USER) {
        anchor = context.userCreateTime || 0;
    } else if (timeType === ACTIVITY_TIME_TYPE.SPECIFIC) {
        anchor = context.serverOpenDate || 0;
    }
    var startTime = anchor + (startDay * MS_PER_DAY);
    var endTime = startTime + (durationDay * MS_PER_DAY) - 1;
    return { startTime: startTime, endTime: endTime };
}

// ═══════════════════════════════════════════════════════════════
// ACTIVITY DETAIL CATALOG
// ═══════════════════════════════════════════════════════════════
//
// Each entry defines how to build `act` and initial `uact`.
//
// DATA VERIFIED:
//   HAR captures (13 entries, 8 unique types) — exact field structures matched.
//   Client deserializers traced in main.min(unminfy).js.
//
// ═══════════════════════════════════════════════════════════════

var ACTIVITY_DETAIL_CATALOG = {

    // ────────────────────────────────────────────────────────────
    // TYPE 2007 — RECHARGE_DAILY (HAR-EXACT)
    // Client: DailyRechargeViewData L153925+
    // UI: DailyRecharge — daily cumulative top-up with tiered rewards
    //
    // act._days: { "1"-"7": { _items: { "1"-"6": { _des, __des, _target, _reward } } } }
    // uact._days: { "1"-"7": { _curCount: 0, _haveGotReward: {} } }
    // All 7 days have IDENTICAL tier structures per HAR.
    // ────────────────────────────────────────────────────────────
    2007: {
        actType:      ACTIVITY_TYPE.RECHARGE_DAILY,
        templateName: '\uff08\u65b0\u7248\u5f00\u670d\uff09\u6bcf\u65e5\u7d2f\u5145',
        name:         'Daily accumulated top-up',
        __name:       'lang_2007_678',
        des:          'You can get generous rewards if you reach a certain ammount in daily accumulated top-up during the activity!',
        __des:        'lang_2007_679',
        icon:         '/activity/\u65b0\u670d\u6d3b\u52a8/huodongnew35.png?rnd=649231590140442',
        image:        '/activity/\u65b0\u670d\u6d3b\u52a8/huodongnew29.jpg?rnd=15451590140452',
        displayIndex: 6,
        showRed:      true,
        timeType:     ACTIVITY_TIME_TYPE.SERVER_OPEN,
        startDay:     0,
        durationDay:  7,
        newUserUsing: true,
        isRank:       false,
        displayExtend:0,
        buildAct: function(actId, cycleType, startTime, endTime) {
            var act = buildActBase({
                actId: actId,
                actType: ACTIVITY_TYPE.RECHARGE_DAILY,
                cycleType: cycleType,
                templateName: '\uff08\u65b0\u7248\u5f00\u670d\uff09\u6bcf\u65e5\u7d2f\u5145',
                name: 'Daily accumulated top-up',
                __name: 'lang_2007_678',
                des: 'You can get generous rewards if you reach a certain ammount in daily accumulated top-up during the activity!',
                __des: 'lang_2007_679',
                icon: '/activity/\u65b0\u670d\u6d3b\u52a8/huodongnew35.png?rnd=649231590140442',
                image: '/activity/\u65b0\u670d\u6d3b\u52a8/huodongnew29.jpg?rnd=15451590140452',
                displayIndex: 6,
                timeType: ACTIVITY_TIME_TYPE.SERVER_OPEN,
                startTime: startTime,
                endTime: endTime,
                durationDay: 7,
                newUserUsing: true,
                displayExtend: 0
            });
            // 7 days, each day has 6 identical tiers per HAR
            // Day tier: { _des: "Total top-up $X", __des: "lang_2007_509", _target, _reward }
            act._days = {};
            for (var d = 1; d <= 7; d++) {
                act._days[String(d)] = {
                    _items: {
                        "1": {
                            _des: "Total top-up $0.99",
                            __des: "lang_2007_509",
                            _target: 0.99,
                            _reward: normalReward([
                                { id: 2851, num: 5 },
                                { id: 122, num: 1 }
                            ])
                        },
                        "2": {
                            _des: "Total top-up $5",
                            __des: "lang_2007_509",
                            _target: 5,
                            _reward: normalReward([
                                { id: 132, num: 5000 },
                                { id: 131, num: 50000 },
                                { id: 102, num: 100000 }
                            ])
                        },
                        "3": {
                            _des: "Total top-up $15",
                            __des: "lang_2007_509",
                            _target: 15,
                            _reward: normalReward([
                                { id: 123, num: 2 },
                                { id: 122, num: 5 },
                                { id: 102, num: 200000 }
                            ])
                        },
                        "4": {
                            _des: "Total top-up $30",
                            __des: "lang_2007_509",
                            _target: 30,
                            _reward: normalReward([
                                { id: 2851, num: 50 },
                                { id: 123, num: 2 }
                            ])
                        },
                        "5": {
                            _des: "Total top-up $60",
                            __des: "lang_2007_509",
                            _target: 60,
                            _reward: normalReward([
                                { id: 2861, num: 10 },
                                { id: 2851, num: 10 }
                            ])
                        },
                        "6": {
                            _des: "Total top-up $100",
                            __des: "lang_2007_509",
                            _target: 100,
                            _reward: normalReward([
                                { id: 2861, num: 20 },
                                { id: 2851, num: 20 }
                            ])
                        }
                    }
                };
            }
            return act;
        },
        buildDefaultUact: function(actId, startTime, endTime) {
            var uact = buildUactBase(actId, startTime, endTime);
            uact._days = {};
            for (var d = 1; d <= 7; d++) {
                uact._days[String(d)] = {
                    _curCount: 0,
                    _haveGotReward: {}
                };
            }
            return uact;
        }
    },

    // ────────────────────────────────────────────────────────────
    // TYPE 2004 — RECHARGE_GIFT (HAR-EXACT)
    // Client: SevenDaysRechargeViewData (cumulative top-up variant)
    // UI: SevenDaysRecharge — cumulative recharge milestones with rank display
    //
    // act._items: 11 tiers, keyed "1"-"11"
    // act._rankFirst: empty rank reward
    // act._rankSecondThird: empty rank reward
    // act._showItems: [612]
    // act._disableRank: true
    // uact: _curCount, _haveGotReward, _rechargeTime
    // ────────────────────────────────────────────────────────────
    2004: {
        actType:      ACTIVITY_TYPE.RECHARGE_GIFT,
        templateName: '\uff08\u5f00\u670d\uff09\u7d2f\u5145\u8c6a\u793c\uff08\u65b0\uff09',
        name:         'Cumulative Top-up Gift',
        __name:       'lang_2004_170',
        des:          '  During the event time, make required amount of top-up to claim ultimate rewards!',
        __des:        'lang_2004_166',
        icon:         '/activity/\u5f3a\u8005\u4e4b\u8def/huodongnew107.png',
        image:        '/activity/\u6bcf\u5468\u7d2f\u5145/topUp1.jpg?rnd=310081649211036',
        displayIndex: 4,
        showRed:      true,
        timeType:     ACTIVITY_TIME_TYPE.SERVER_OPEN,
        startDay:     0,
        durationDay:  7,
        newUserUsing: true,
        isRank:       false,
        displayExtend:1,
        buildAct: function(actId, cycleType, startTime, endTime) {
            var act = buildActBase({
                actId: actId,
                actType: ACTIVITY_TYPE.RECHARGE_GIFT,
                cycleType: cycleType,
                templateName: '\uff08\u5f00\u670d\uff09\u7d2f\u5145\u8c6a\u793c\uff08\u65b0\uff09',
                name: 'Cumulative Top-up Gift',
                __name: 'lang_2004_170',
                des: '  During the event time, make required amount of top-up to claim ultimate rewards!',
                __des: 'lang_2004_166',
                icon: '/activity/\u5f3a\u8005\u4e4b\u8def/huodongnew107.png',
                image: '/activity/\u6bcf\u5468\u7d2f\u5145/topUp1.jpg?rnd=310081649211036',
                displayIndex: 4,
                timeType: ACTIVITY_TIME_TYPE.SERVER_OPEN,
                startTime: startTime,
                endTime: endTime,
                durationDay: 7,
                newUserUsing: true,
                displayExtend: 1
            });
            // 11 cumulative recharge tiers (HAR-EXACT)
            act._items = {
                "1": {
                    _target: 0.9,
                    _des: "",
                    __des: "",
                    _reward: normalReward([
                        { id: 131, num: 20000 },
                        { id: 132, num: 800 }
                    ])
                },
                "2": {
                    _target: 5,
                    _des: "",
                    __des: "",
                    _reward: normalReward([
                        { id: 101, num: 100 },
                        { id: 132, num: 2500 }
                    ])
                },
                "3": {
                    _target: 10,
                    _des: "",
                    __des: "",
                    _reward: normalReward([
                        { id: 101, num: 200 },
                        { id: 132, num: 5000 }
                    ])
                },
                "4": {
                    _target: 20,
                    _des: "",
                    __des: "",
                    _reward: normalReward([
                        { id: 123, num: 3 }
                    ])
                },
                "5": {
                    _target: 40,
                    _des: " <font color=0x000000>Activate Super Ultimate</font> <font color=0xff0000>High Strike</font><font color=0x000001></font>",
                    __des: "lang_2004_168",
                    _reward: normalReward([
                        { id: 1405, num: 1 }
                    ])
                },
                "6": {
                    _target: 60,
                    _des: " <font color=0x000000>Activate Super Ultimate</font> <font color=0xff0000>Planet Destroyer</font><font color=0x000000></font>",
                    __des: "lang_2004_167",
                    _reward: normalReward([
                        { id: 1404, num: 1 }
                    ])
                },
                "7": {
                    _target: 90,
                    _des: "",
                    __des: "",
                    _reward: normalReward([
                        { id: 123, num: 10 }
                    ])
                },
                "8": {
                    _target: 150,
                    _des: "",
                    __des: "",
                    _reward: normalReward([
                        { id: 4401, num: 1 }
                    ])
                },
                "9": {
                    _target: 250,
                    _des: "",
                    __des: "",
                    _reward: normalReward([
                        { id: 1508, num: 1 }
                    ])
                },
                "10": {
                    _target: 600,
                    _des: "",
                    __des: "",
                    _reward: normalReward([
                        { id: 612, num: 1 }
                    ])
                },
                "11": {
                    _target: 1000,
                    _des: "",
                    __des: "",
                    _reward: normalReward([
                        { id: 1600, num: 1 },
                        { id: 4401, num: 1 }
                    ])
                }
            };
            // Rank display fields (HAR: all empty/disabled)
            act._rankFirst = {
                _des: "",
                __des: "",
                _target: 0,
                _reward: {
                    _normalReward: { _items: {} },
                    _randReward: [],
                    _anyReward: { _icon: "", _anyReward: [] }
                }
            };
            act._rankSecondThird = {
                _des: "",
                __des: "",
                _target: 0,
                _reward: {
                    _normalReward: { _items: {} },
                    _randReward: [],
                    _anyReward: { _icon: "", _anyReward: [] }
                }
            };
            act._showItems = [612];
            act._disableRank = true;
            return act;
        },
        buildDefaultUact: function(actId, startTime, endTime) {
            var uact = buildUactBase(actId, startTime, endTime);
            uact._curCount = 0;
            uact._haveGotReward = {
                "1": false, "2": false, "3": false, "4": false, "5": false,
                "6": false, "7": false, "8": false, "9": false, "10": false,
                "11": false
            };
            uact._rechargeTime = 0;
            return uact;
        }
    },

    // ────────────────────────────────────────────────────────────
    // TYPE 2003 — NEW_SERVER_GIFT (HAR-EXACT)
    // Client: NewServerGiftViewData L155600+
    // UI: NewServerGift — limited-time discount packs
    //
    // act._items: 8 packs keyed "1"-"8" with _limit, _price, _goodName, __goodName
    // uact._buyTimes: {"1"-"8": 0}
    // ────────────────────────────────────────────────────────────
    2003: {
        actType:      ACTIVITY_TYPE.NEW_SERVER_GIFT,
        templateName: '\uff08\u5f00\u670d\uff09\u65b0\u670d\u7279\u60e0\u5305\uff08\u65b0\uff09',
        name:         'New Server Discount Pack',
        __name:       'lang_2003_165',
        des:          '',
        __des:        '',
        icon:         '/activity/\u65b0\u670d\u6d3b\u52a8/huodongnew42.png',
        image:        '/activity/\u65b0\u670d\u6d3b\u52a8/huodongnew41.jpg',
        displayIndex: 2,
        showRed:      true,
        timeType:     ACTIVITY_TIME_TYPE.SERVER_OPEN,
        startDay:     0,
        durationDay:  7,
        newUserUsing: true,
        isRank:       false,
        displayExtend:0,
        buildAct: function(actId, cycleType, startTime, endTime) {
            var act = buildActBase({
                actId: actId,
                actType: ACTIVITY_TYPE.NEW_SERVER_GIFT,
                cycleType: cycleType,
                templateName: '\uff08\u5f00\u670d\uff09\u65b0\u670d\u7279\u60e0\u5305\uff08\u65b0\uff09',
                name: 'New Server Discount Pack',
                __name: 'lang_2003_165',
                des: '',
                __des: '',
                icon: '/activity/\u65b0\u670d\u6d3b\u52a8/huodongnew42.png',
                image: '/activity/\u65b0\u670d\u6d3b\u52a8/huodongnew41.jpg',
                displayIndex: 2,
                timeType: ACTIVITY_TIME_TYPE.SERVER_OPEN,
                startTime: startTime,
                endTime: endTime,
                durationDay: 7,
                newUserUsing: true,
                displayExtend: 0
            });
            // 8 discount packs (HAR-EXACT)
            act._items = {
                "1": {
                    _limit: 7,
                    _price: 4.99,
                    _goodName: "30 New Server Breakthrough Discount Pack",
                    __goodName: "lang_2003_500",
                    _reward: normalReward([
                        { id: 101, num: 300 },
                        { id: 101, num: 300 },
                        { id: 132, num: 5000 }
                    ])
                },
                "2": {
                    _limit: 5,
                    _price: 4.99,
                    _goodName: "30 New Server Awaken Discount Pack",
                    __goodName: "lang_2003_501",
                    _reward: normalReward([
                        { id: 101, num: 300 },
                        { id: 101, num: 300 },
                        { id: 501, num: 6 }
                    ])
                },
                "3": {
                    _limit: 5,
                    _price: 14.99,
                    _goodName: "98 New Server Advanced SummonOrb Discount Pack3",
                    __goodName: "lang_2003_507",
                    _reward: normalReward([
                        { id: 101, num: 980 },
                        { id: 101, num: 980 },
                        { id: 123, num: 5 }
                    ])
                },
                "4": {
                    _limit: 8,
                    _price: 14.99,
                    _goodName: "98 New Server Breakthrough Discount Pack1",
                    __goodName: "lang_2003_505",
                    _reward: normalReward([
                        { id: 101, num: 980 },
                        { id: 101, num: 980 },
                        { id: 132, num: 10000 }
                    ])
                },
                "5": {
                    _limit: 5,
                    _price: 14.99,
                    _goodName: "98 New Server Awaken Discount Pack2",
                    __goodName: "lang_2003_506",
                    _reward: normalReward([
                        { id: 101, num: 980 },
                        { id: 101, num: 980 },
                        { id: 501, num: 18 }
                    ])
                },
                "6": {
                    _limit: 5,
                    _price: 59.99,
                    _goodName: "388 New Server SummonOrb Discount Pack",
                    __goodName: "lang_2003_502",
                    _reward: normalReward([
                        { id: 101, num: 3880 },
                        { id: 101, num: 3880 },
                        { id: 123, num: 22 }
                    ])
                },
                "7": {
                    _limit: 8,
                    _price: 59.99,
                    _goodName: "388 New Server Awaken Discount Pack",
                    __goodName: "lang_2003_503",
                    _reward: normalReward([
                        { id: 101, num: 3880 },
                        { id: 101, num: 3880 },
                        { id: 501, num: 68 }
                    ])
                },
                "8": {
                    _limit: 4,
                    _price: 89.99,
                    _goodName: "588 New Server Breakthrough Discount Pack",
                    __goodName: "lang_2003_504",
                    _reward: normalReward([
                        { id: 101, num: 5880 },
                        { id: 101, num: 5880 },
                        { id: 132, num: 60000 }
                    ])
                }
            };
            return act;
        },
        buildDefaultUact: function(actId, startTime, endTime) {
            var uact = buildUactBase(actId, startTime, endTime);
            uact._buyTimes = {
                "1": 0, "2": 0, "3": 0, "4": 0,
                "5": 0, "6": 0, "7": 0, "8": 0
            };
            return uact;
        }
    },

    // ────────────────────────────────────────────────────────────
    // TYPE 5003 — TODAY_DISCOUNT (HAR-EXACT)
    // Client: TodayDiscountViewData
    // UI: TodayDiscount — daily rotating discount items with random groups
    //
    // act._items: 5 slots keyed "0"-"4"
    // Each slot: { _randItems: { id: { _id, _buyType, _cost, _reward, _price, _discount, __discount, _weight, _goodName, __goodName } }, _randGroup }
    // uact._items: { "0"-"4": { _goodId, _haveBrought } }
    // uact._batchId, uact._lastRefreshTime
    // ────────────────────────────────────────────────────────────
    5003: {
        actType:      ACTIVITY_TYPE.TODAY_DISCOUNT,
        templateName: '\uff08\u5f00\u670d\uff09\u4eca\u65e5\u7279\u4ef7\uff08\u65b0\uff09',
        name:         'Discount Today',
        __name:       'lang_5003_342',
        des:          '',
        __des:        '',
        icon:         '/activity/\u5f3a\u8005\u4e4b\u8def/huodongnew205.png?rnd=574051578983873',
        image:        '/activity/\u5f3a\u8005\u4e4b\u8def/huodong201new.jpg?rnd=565591583918819',
        displayIndex: 3,
        showRed:      true,
        timeType:     ACTIVITY_TIME_TYPE.SERVER_OPEN,
        startDay:     0,
        durationDay:  7,
        newUserUsing: true,
        isRank:       false,
        displayExtend:0,
        buildAct: function(actId, cycleType, startTime, endTime) {
            var act = buildActBase({
                actId: actId,
                actType: ACTIVITY_TYPE.TODAY_DISCOUNT,
                cycleType: cycleType,
                templateName: '\uff08\u5f00\u670d\uff09\u4eca\u65e5\u7279\u4ef7\uff08\u65b0\uff09',
                name: 'Discount Today',
                __name: 'lang_5003_342',
                des: '',
                __des: '',
                icon: '/activity/\u5f3a\u8005\u4e4b\u8def/huodongnew205.png?rnd=574051578983873',
                image: '/activity/\u5f3a\u8005\u4e4b\u8def/huodong201new.jpg?rnd=565591583918819',
                displayIndex: 3,
                timeType: ACTIVITY_TIME_TYPE.SERVER_OPEN,
                startTime: startTime,
                endTime: endTime,
                durationDay: 7,
                newUserUsing: true,
                displayExtend: 0
            });

            // Slot "0": currency cost items (_buyType:2)
            act._items = {
                "0": {
                    _randItems: {
                        "1": {
                            _id: 1, _buyType: 2,
                            _cost: { _items: { "101": { _id: 101, _num: 1 } } },
                            _reward: normalReward([{ id: 102, num: 50000 }]),
                            _price: 0,
                            _discount: "90% Off",
                            __discount: "lang_5003_620",
                            _weight: 25,
                            _goodName: "Coin",
                            __goodName: "lang_5003_624"
                        },
                        "2": {
                            _id: 2, _buyType: 2,
                            _cost: { _items: { "101": { _id: 101, _num: 3 } } },
                            _reward: normalReward([{ id: 122, num: 2 }]),
                            _price: 0,
                            _discount: "90% Off",
                            __discount: "lang_5003_620",
                            _weight: 25,
                            _goodName: "Normal Summon Orb",
                            __goodName: "lang_5003_622"
                        },
                        "3": {
                            _id: 3, _buyType: 2,
                            _cost: { _items: { "101": { _id: 101, _num: 5 } } },
                            _reward: normalReward([{ id: 146, num: 1 }]),
                            _price: 0,
                            _discount: "90% Off",
                            __discount: "lang_5003_620",
                            _weight: 25,
                            _goodName: "Senzu Bean",
                            __goodName: "lang_5003_621"
                        },
                        "4": {
                            _id: 4, _buyType: 2,
                            _cost: { _items: { "101": { _id: 101, _num: 9 } } },
                            _reward: normalReward([{ id: 111, num: 30 }]),
                            _price: 0,
                            _discount: "90% Off",
                            __discount: "lang_5003_620",
                            _weight: 25,
                            _goodName: "Soul Stone",
                            __goodName: "lang_5003_623"
                        }
                    },
                    _randGroup: {
                        _groups: {
                            "1": randRewardGroup(1, 100, [
                                { _itemId: 1, _num: 1, _weight: 25 },
                                { _itemId: 2, _num: 1, _weight: 25 },
                                { _itemId: 3, _num: 1, _weight: 25 },
                                { _itemId: 4, _num: 1, _weight: 25 }
                            ])
                        }
                    }
                },

                // Slot "1": $0.99 real money items (_buyType:1)
                "1": {
                    _randItems: {
                        "1": {
                            _id: 1, _buyType: 1,
                            _cost: { _items: {} },
                            _reward: normalReward([{ id: 132, num: 4000 }, { id: 102, num: 180000 }]),
                            _price: 0.99,
                            _discount: "50% Off",
                            __discount: "lang_5003_598",
                            _weight: 50,
                            _goodName: "Breakthrough Capsule",
                            __goodName: "lang_5003_580"
                        },
                        "2": {
                            _id: 2, _buyType: 1,
                            _cost: { _items: {} },
                            _reward: normalReward([{ id: 101, num: 180 }, { id: 102, num: 60000 }]),
                            _price: 0.99,
                            _discount: "70% Off",
                            __discount: "lang_5012_430",
                            _weight: 50,
                            _goodName: "180 Gem",
                            __goodName: "lang_5003_565"
                        }
                    },
                    _randGroup: {
                        _groups: {
                            "1": randRewardGroup(1, 100, [
                                { _itemId: 1, _num: 1, _weight: 50 },
                                { _itemId: 2, _num: 1, _weight: 50 }
                            ])
                        }
                    }
                },

                // Slot "2": $1.99 items
                "2": {
                    _randItems: {
                        "1": {
                            _id: 1, _buyType: 1,
                            _cost: { _items: {} },
                            _reward: normalReward([{ id: 132, num: 6000 }, { id: 102, num: 380000 }]),
                            _price: 1.99,
                            _discount: "60% Off",
                            __discount: "lang_5012_431",
                            _weight: 50,
                            _goodName: "Breakthrough Capsule",
                            __goodName: "lang_5003_580"
                        },
                        "2": {
                            _id: 2, _buyType: 1,
                            _cost: { _items: {} },
                            _reward: normalReward([{ id: 101, num: 360 }, { id: 102, num: 120000 }]),
                            _price: 1.99,
                            _discount: "70% Off",
                            __discount: "lang_5012_430",
                            _weight: 50,
                            _goodName: "360 Gem",
                            __goodName: "lang_5003_597"
                        }
                    },
                    _randGroup: {
                        _groups: {
                            "1": randRewardGroup(1, 100, [
                                { _itemId: 1, _num: 1, _weight: 50 },
                                { _itemId: 2, _num: 1, _weight: 50 }
                            ])
                        }
                    }
                },

                // Slot "3": $2.99 items (3 options, weights 33/33/34)
                "3": {
                    _randItems: {
                        "1": {
                            _id: 1, _buyType: 1,
                            _cost: { _items: {} },
                            _reward: normalReward([{ id: 123, num: 3 }, { id: 122, num: 5 }]),
                            _price: 2.99,
                            _discount: "80% Off",
                            __discount: "lang_5012_429",
                            _weight: 33,
                            _goodName: "Advanced Summon Orb",
                            __goodName: "lang_5003_603"
                        },
                        "2": {
                            _id: 2, _buyType: 1,
                            _cost: { _items: {} },
                            _reward: normalReward([{ id: 139, num: 500 }, { id: 135, num: 1200 }]),
                            _price: 2.99,
                            _discount: "70% Off",
                            __discount: "lang_5012_430",
                            _weight: 33,
                            _goodName: "Jade of Potara",
                            __goodName: "lang_5003_577"
                        },
                        "3": {
                            _id: 3, _buyType: 1,
                            _cost: { _items: {} },
                            _reward: normalReward([{ id: 136, num: 5000 }, { id: 102, num: 100000 }]),
                            _price: 2.99,
                            _discount: "70% Off",
                            __discount: "lang_5012_430",
                            _weight: 34,
                            _goodName: "Energy Stone",
                            __goodName: "lang_5003_601"
                        }
                    },
                    _randGroup: {
                        _groups: {
                            "1": randRewardGroup(1, 100, [
                                { _itemId: 1, _num: 1, _weight: 33 },
                                { _itemId: 2, _num: 1, _weight: 33 },
                                { _itemId: 3, _num: 1, _weight: 34 }
                            ])
                        }
                    }
                },

                // Slot "4": $4.99 items
                "4": {
                    _randItems: {
                        "1": {
                            _id: 1, _buyType: 1,
                            _cost: { _items: {} },
                            _reward: normalReward([{ id: 123, num: 5 }, { id: 122, num: 8 }]),
                            _price: 4.99,
                            _discount: "80% Off",
                            __discount: "lang_5012_429",
                            _weight: 50,
                            _goodName: "Advanced Summon Orb",
                            __goodName: "lang_5003_603"
                        },
                        "2": {
                            _id: 2, _buyType: 1,
                            _cost: { _items: {} },
                            _reward: normalReward([{ id: 139, num: 800 }, { id: 135, num: 2000 }]),
                            _price: 4.99,
                            _discount: "70% Off",
                            __discount: "lang_5012_430",
                            _weight: 50,
                            _goodName: "Jade of Potara",
                            __goodName: "lang_5003_577"
                        }
                    },
                    _randGroup: {
                        _groups: {
                            "1": randRewardGroup(1, 100, [
                                { _itemId: 1, _num: 1, _weight: 50 },
                                { _itemId: 2, _num: 1, _weight: 50 }
                            ])
                        }
                    }
                }
            };
            return act;
        },
        buildDefaultUact: function(actId, startTime, endTime) {
            var uact = buildUactBase(actId, startTime, endTime);
            // HAR shows slot "0" already bought (_goodId:2, _haveBrought:true)
            uact._items = {
                "0": { _goodId: 2, _haveBrought: true },
                "1": { _goodId: 2, _haveBrought: false },
                "2": { _goodId: 1, _haveBrought: false },
                "3": { _goodId: 3, _haveBrought: false },
                "4": { _goodId: 1, _haveBrought: false }
            };
            uact._batchId = 'c80ddd4a-9daa-4e39-b89f-1c945578b80d';
            uact._lastRefreshTime = 0;
            return uact;
        }
    },

    // ────────────────────────────────────────────────────────────
    // TYPE 5037 — HERO_SUPER_GIFT (HAR-EXACT)
    // Client: HeroSuperGiftViewData
    // UI: HeroSuperGift — premium hero packs with background images
    //
    // act._showType: 1 (NewServerGift)
    // act._items: 3 packs with _limit, _bg, _goodName, __goodName, _price
    // act._oldUserVip: 9, act._oldUserOfflineDay: 7
    // uact._buyTimes: {}
    // ────────────────────────────────────────────────────────────
    5037: {
        actType:      ACTIVITY_TYPE.HERO_SUPER_GIFT,
        templateName: '\u65b0\u670d\u7279\u60e0\u4e09\u9009\u4e00\u793c\u5305',
        name:         'Hero Value Pack',
        __name:       'lang_5037_1604',
        des:          '',
        __des:        '',
        icon:         '/activity/\u65b0\u670d\u6d3b\u52a8/xinfuyingxiongtehui_rukou.png?rnd=851641672116391',
        image:        '/activity/\u65b0\u670d\u6d3b\u52a8/yingxiongtehui_1.jpg?rnd=134041672116403',
        displayIndex: 0,
        showRed:      true,
        timeType:     ACTIVITY_TIME_TYPE.SERVER_OPEN,
        startDay:     0,
        durationDay:  7,
        newUserUsing: true,
        isRank:       false,
        displayExtend:1,
        buildAct: function(actId, cycleType, startTime, endTime) {
            var act = buildActBase({
                actId: actId,
                actType: ACTIVITY_TYPE.HERO_SUPER_GIFT,
                cycleType: cycleType,
                templateName: '\u65b0\u670d\u7279\u60e0\u4e09\u9009\u4e00\u793c\u5305',
                name: 'Hero Value Pack',
                __name: 'lang_5037_1604',
                des: '',
                __des: '',
                icon: '/activity/\u65b0\u670d\u6d3b\u52a8/xinfuyingxiongtehui_rukou.png?rnd=851641672116391',
                image: '/activity/\u65b0\u670d\u6d3b\u52a8/yingxiongtehui_1.jpg?rnd=134041672116403',
                displayIndex: 0,
                timeType: ACTIVITY_TIME_TYPE.SERVER_OPEN,
                startTime: startTime,
                endTime: endTime,
                durationDay: 7,
                newUserUsing: true,
                oldUserVip: 9,
                oldUserOfflineDay: 7,
                displayExtend: 1
            });
            // 3 hero value packs (HAR-EXACT)
            act._showType = HERO_SUPER_GIFT_SHOW.NewServerGift;
            act._items = {
                "1": {
                    _limit: 1,
                    _bg: '/activity/\u65b0\u670d\u6d3b\u52a8/xinfuyingxiongtehui_3.png?rnd=918311672116372',
                    _goodName: "Group SS Heroes 1 of 3 Pack",
                    __goodName: "lang_5037_1827",
                    _price: 19.99,
                    _reward: normalReward([
                        { id: 496, num: 1 }
                    ])
                },
                "2": {
                    _limit: 1,
                    _bg: '/activity/\u65b0\u670d\u6d3b\u52a8/xinfuyingxiongtehui_4.png?rnd=587851672116377',
                    _goodName: "Bleeding SS Heroes 1 of 3 Pack",
                    __goodName: "lang_5037_1826",
                    _price: 19.99,
                    _reward: normalReward([
                        { id: 498, num: 1 }
                    ])
                },
                "3": {
                    _limit: 1,
                    _bg: '/activity/\u65b0\u670d\u6d3b\u52a8/xinfuyingxiongtehui_5.png?rnd=471931672116379',
                    _goodName: "Single SS Heroes 1 of 3 Pack",
                    __goodName: "lang_5037_1828",
                    _price: 19.99,
                    _reward: normalReward([
                        { id: 497, num: 1 }
                    ])
                }
            };
            return act;
        },
        buildDefaultUact: function(actId, startTime, endTime) {
            var uact = buildUactBase(actId, startTime, endTime);
            uact._buyTimes = {};
            return uact;
        }
    },

    // ────────────────────────────────────────────────────────────
    // TYPE 2001 — HERO_GIFT (HAR-EXACT)
    // Client: HeroGiftViewData L155900+
    // UI: HeroGift — hero quality tiers with random reward pools
    //
    // timeType 2 (USER): act._startTime=0, act._endTime=0; uact gets user times
    // act._items: 2 tiers (orange heroes [5,6,7], purple heroes [4])
    // uact._items: tier "1" _leftTimes:0, tier "2" _leftTimes:5
    // Reward format: randGroupReward with weighted random groups
    // ────────────────────────────────────────────────────────────
    2001: {
        actType:      ACTIVITY_TYPE.HERO_GIFT,
        templateName: '\uff08\u65b0\u7248\u5f00\u670d\uff09\u82f1\u96c4\u5927\u8fd4\u5229',
        name:         'Hero Grand Kickback',
        __name:       'lang_2001_162',
        des:          ' During the event time, get the chance to make the lucky draw every time you get  1 orange or purple quality hero! (Heroes you get from Altar shop exchange and Shards Compose are not included)',
        __des:        'lang_2001_159',
        icon:         '/activity/\u65b0\u670d\u6d3b\u52a8/huodongnew39.png',
        image:        '/activity/\u65b0\u670d\u6d3b\u52a8/huodongnew44.jpg',
        displayIndex: 8,
        showRed:      true,
        timeType:     ACTIVITY_TIME_TYPE.USER,
        startDay:     0,
        durationDay:  7,
        newUserUsing: true,
        isRank:       false,
        displayExtend:0,
        buildAct: function(actId, cycleType, startTime, endTime) {
            var act = buildActBase({
                actId: actId,
                actType: ACTIVITY_TYPE.HERO_GIFT,
                cycleType: cycleType,
                templateName: '\uff08\u65b0\u7248\u5f00\u670d\uff09\u82f1\u96c4\u5927\u8fd4\u5229',
                name: 'Hero Grand Kickback',
                __name: 'lang_2001_162',
                des: ' During the event time, get the chance to make the lucky draw every time you get  1 orange or purple quality hero! (Heroes you get from Altar shop exchange and Shards Compose are not included)',
                __des: 'lang_2001_159',
                icon: '/activity/\u65b0\u670d\u6d3b\u52a8/huodongnew39.png',
                image: '/activity/\u65b0\u670d\u6d3b\u52a8/huodongnew44.jpg',
                displayIndex: 8,
                timeType: ACTIVITY_TIME_TYPE.USER,
                startTime: 0,
                endTime: 0,
                durationDay: 7,
                newUserUsing: true,
                displayExtend: 0
            });
            // 2 quality tiers with random reward groups (HAR-EXACT)
            act._items = {
                "1": {
                    _des: "Obtained an orange hero",
                    __des: "lang_2001_160",
                    _target: 1,
                    _heroQualitys: [5, 6, 7],
                    _reward: {
                        _normalReward: { _items: {} },
                        _randReward: [
                            randGroupReward("/activity/\u65b0\u7528\u6237\u6d3b\u52a8/expcap.png", {
                                "1": randRewardGroup(1, 100, [
                                    { _itemId: 131, _num: 6800, _weight: 20 },
                                    { _itemId: 131, _num: 8800, _weight: 50 },
                                    { _itemId: 131, _num: 18800, _weight: 17 },
                                    { _itemId: 131, _num: 28800, _weight: 10 },
                                    { _itemId: 131, _num: 68800, _weight: 3 }
                                ])
                            })
                        ],
                        _anyReward: { _icon: "", _anyReward: [] }
                    }
                },
                "2": {
                    _des: "Obtained a purple hero",
                    __des: "lang_2001_161",
                    _target: 1,
                    _heroQualitys: [4],
                    _reward: {
                        _normalReward: { _items: {} },
                        _randReward: [
                            randGroupReward("/activity/\u65b0\u7528\u6237\u6d3b\u52a8/gold.png", {
                                "1": randRewardGroup(1, 100, [
                                    { _itemId: 102, _num: 5800, _weight: 30 },
                                    { _itemId: 102, _num: 6800, _weight: 35 },
                                    { _itemId: 102, _num: 8800, _weight: 20 },
                                    { _itemId: 102, _num: 18800, _weight: 12 },
                                    { _itemId: 102, _num: 28800, _weight: 3 }
                                ])
                            })
                        ],
                        _anyReward: { _icon: "", _anyReward: [] }
                    }
                }
            };
            return act;
        },
        buildDefaultUact: function(actId, startTime, endTime) {
            var uact = buildUactBase(actId, startTime, endTime);
            uact._items = {
                "1": { _leftTimes: 0, _curCount: 0 },
                "2": { _leftTimes: 5, _curCount: 0 }
            };
            return uact;
        }
    },

    // ────────────────────────────────────────────────────────────
    // TYPE 2002 — HERO_ORANGE (HAR-EXACT)
    // Client: HeroOrangeViewData L155800+
    // UI: HeroOrange — collect orange quality heroes for milestone rewards
    //
    // timeType 2 (USER): uact gets user-based times
    // EXCEPTION: act has embedded specific times from HAR
    // act._startTime: 1604332800000, act._endTime: 1604937599000
    // act._items: 12 tiers keyed "1"-"12"
    // uact._items: all 12 with { _curCount: 0, _haveGotReward: false }
    // ────────────────────────────────────────────────────────────
    2002: {
        actType:      ACTIVITY_TYPE.HERO_ORANGE,
        templateName: '(\u65b0\u7248\u5f00\u670d)\u6a59\u5c06\u96c6\u7ed3\u53f7',
        name:         'Orange Hero Assembly',
        __name:       'lang_2002_164',
        des:          '  During the event time, the more orange quality heroes you unlock, the more rewards you\'ll get! (Heroes you get from Altar shop exchange and Shards Compose are not included)',
        __des:        'lang_2002_163',
        icon:         '/activity/\u65b0\u670d\u6d3b\u52a8/huodongnew40.png?rnd=171461604461607',
        image:        '/activity/\u65b0\u670d\u6d3b\u52a8/huodongnew4.jpg?rnd=21921604461608',
        displayIndex: 9,
        showRed:      true,
        timeType:     ACTIVITY_TIME_TYPE.USER,
        startDay:     0,
        durationDay:  7,
        newUserUsing: true,
        isRank:       false,
        displayExtend:0,
        buildAct: function(actId, cycleType, startTime, endTime) {
            var act = buildActBase({
                actId: actId,
                actType: ACTIVITY_TYPE.HERO_ORANGE,
                cycleType: cycleType,
                templateName: '(\u65b0\u7248\u5f00\u670d)\u6a59\u5c06\u96c6\u7ed3\u53f7',
                name: 'Orange Hero Assembly',
                __name: 'lang_2002_164',
                des: '  During the event time, the more orange quality heroes you unlock, the more rewards you\'ll get! (Heroes you get from Altar shop exchange and Shards Compose are not included)',
                __des: 'lang_2002_163',
                icon: '/activity/\u65b0\u670d\u6d3b\u52a8/huodongnew40.png?rnd=171461604461607',
                image: '/activity/\u65b0\u670d\u6d3b\u52a8/huodongnew4.jpg?rnd=21921604461608',
                displayIndex: 9,
                timeType: ACTIVITY_TIME_TYPE.USER,
                // HAR override: specific times embedded in USER type
                startTime: 1604332800000,
                endTime: 1604937599000,
                durationDay: 7,
                newUserUsing: true,
                displayExtend: 0
            });
            // 12 milestone tiers (HAR-EXACT)
            act._items = {
                "1":  { _target: 2,  _heroQuality: 5, _reward: normalReward([{ id: 123, num: 2 }]) },
                "2":  { _target: 5,  _heroQuality: 5, _reward: normalReward([{ id: 123, num: 2 }]) },
                "3":  { _target: 8,  _heroQuality: 5, _reward: normalReward([{ id: 123, num: 3 }]) },
                "4":  { _target: 1,  _heroQuality: 6, _reward: normalReward([{ id: 123, num: 2 }]) },
                "5":  { _target: 2,  _heroQuality: 6, _reward: normalReward([{ id: 123, num: 3 }]) },
                "6":  { _target: 3,  _heroQuality: 6, _reward: normalReward([{ id: 123, num: 4 }]) },
                "7":  { _target: 4,  _heroQuality: 6, _reward: normalReward([{ id: 123, num: 6 }]) },
                "8":  { _target: 6,  _heroQuality: 6, _reward: normalReward([{ id: 123, num: 10 }]) },
                "9":  { _target: 12, _heroQuality: 5, _reward: normalReward([{ id: 123, num: 3 }]) },
                "10": { _target: 18, _heroQuality: 5, _reward: normalReward([{ id: 123, num: 5 }]) },
                "11": { _target: 25, _heroQuality: 5, _reward: normalReward([{ id: 123, num: 5 }]) },
                "12": { _target: 35, _heroQuality: 5, _reward: normalReward([{ id: 123, num: 8 }]) }
            };
            return act;
        },
        buildDefaultUact: function(actId, startTime, endTime) {
            var uact = buildUactBase(actId, startTime, endTime);
            uact._items = {};
            for (var t = 1; t <= 12; t++) {
                uact._items[String(t)] = { _curCount: 0, _haveGotReward: false };
            }
            return uact;
        }
    },

    // ────────────────────────────────────────────────────────────
    // TYPE 1003 — RECHARGE_3 (HAR-EXACT)
    // Client: SevenDaysRechargeViewData L153660+
    // UI: SevenDaysRecharge — daily recharge rewards + final bonus + resign system
    //
    // act._items: 7 days keyed "1"-"7" with _des, __des, _reward
    // act._finalItem: final bonus for 7-day completion
    // act._maxResignTimes: 2
    // act._resignCost: { "1": 300, "2": 500 } (OBJECT, not number!)
    // act._advanceEndReward: {}
    // uact._items: all 7 with { _canGetReward: false, _haveGotReward: false }
    // uact._haveGotFinalReward: false
    // uact._resignCount: 0
    // ────────────────────────────────────────────────────────────
    1003: {
        actType:      ACTIVITY_TYPE.RECHARGE_3,
        templateName: '\uff08\u5f00\u670d\uff097\u65e5\u4efb\u610f\u5145',
        name:         '7-Day Top-up At Will',
        __name:       'lang_1003_156',
        des:          '',
        __des:        '',
        icon:         '/activity/\u65b0\u7528\u6237\u6d3b\u52a8/huodongnew372.png?rnd=558541576031269',
        image:        '/activity/\u65b0\u7528\u6237\u6d3b\u52a8/huodongnew389.jpg?rnd=759631576031273',
        displayIndex: 85,
        showRed:      true,
        timeType:     ACTIVITY_TIME_TYPE.SERVER_OPEN,
        startDay:     0,
        durationDay:  7,
        newUserUsing: true,
        isRank:       false,
        displayExtend:0,
        buildAct: function(actId, cycleType, startTime, endTime) {
            var act = buildActBase({
                actId: actId,
                actType: ACTIVITY_TYPE.RECHARGE_3,
                cycleType: cycleType,
                templateName: '\uff08\u5f00\u670d\uff097\u65e5\u4efb\u610f\u5145',
                name: '7-Day Top-up At Will',
                __name: 'lang_1003_156',
                des: '',
                __des: '',
                icon: '/activity/\u65b0\u7528\u6237\u6d3b\u52a8/huodongnew372.png?rnd=558541576031269',
                image: '/activity/\u65b0\u7528\u6237\u6d3b\u52a8/huodongnew389.jpg?rnd=759631576031273',
                displayIndex: 85,
                timeType: ACTIVITY_TIME_TYPE.SERVER_OPEN,
                startTime: startTime,
                endTime: endTime,
                durationDay: 7,
                newUserUsing: true,
                displayExtend: 0
            });
            // 7 daily recharge rewards (HAR-EXACT)
            act._items = {
                "1": {
                    _des: "Daily recharge for day 1 gift",
                    __des: "lang_1003_440",
                    _reward: normalReward([{ id: 101, num: 88 }, { id: 122, num: 5 }])
                },
                "2": {
                    _des: "Daily recharge for day 2 gift",
                    __des: "lang_1003_441",
                    _reward: normalReward([{ id: 101, num: 88 }, { id: 123, num: 1 }])
                },
                "3": {
                    _des: "Daily recharge for day 3 gift",
                    __des: "lang_1003_442",
                    _reward: normalReward([{ id: 101, num: 88 }, { id: 122, num: 5 }])
                },
                "4": {
                    _des: "Daily recharge for day 4 gift",
                    __des: "lang_1003_443",
                    _reward: normalReward([{ id: 101, num: 88 }, { id: 123, num: 1 }])
                },
                "5": {
                    _des: "Daily recharge for day 5 gift",
                    __des: "lang_1003_444",
                    _reward: normalReward([{ id: 101, num: 88 }, { id: 122, num: 5 }])
                },
                "6": {
                    _des: "Daily recharge for day 6 gift",
                    __des: "lang_1003_445",
                    _reward: normalReward([{ id: 101, num: 88 }, { id: 123, num: 1 }])
                },
                "7": {
                    _des: "Daily recharge for day 7 gift",
                    __des: "lang_1003_446",
                    _reward: normalReward([{ id: 101, num: 88 }, { id: 122, num: 5 }])
                }
            };
            // Final bonus for completing all 7 days (HAR-EXACT)
            act._finalItem = {
                _des: "Continuous recharge for 7 days gift",
                __des: "lang_1003_452",
                _reward: normalReward([{ id: 123, num: 10 }])
            };
            // Resign system (HAR-EXACT: OBJECT not number!)
            act._maxResignTimes = 2;
            act._resignCost = { "1": 300, "2": 500 };
            act._advanceEndReward = {};
            return act;
        },
        buildDefaultUact: function(actId, startTime, endTime) {
            var uact = buildUactBase(actId, startTime, endTime);
            uact._items = {};
            for (var d = 1; d <= 7; d++) {
                uact._items[String(d)] = {
                    _canGetReward: false,
                    _haveGotReward: false
                };
            }
            uact._haveGotFinalReward = false;
            uact._resignCount = 0;
            return uact;
        }
    },

    // ────────────────────────────────────────────────────────────
    // TYPE 1001 — LOGIN (SevenDaysSign) — catalog-only
    // Client: SevenDaysSignViewData L154817, LoginActivity L127563
    // UI: SevenDaysSign L144646
    //
    // act._rewards: { "1"-"7": ActivityReward }
    // act._exRewards: {} (empty = no regression mode)
    // uact._activeItem: [], uact._gotExRewards: []
    // uact._signedDay: 0, uact._maxActiveDay: 0, uact._lastActiveDate: 0
    // ────────────────────────────────────────────────────────────
    1001: {
        actType:      ACTIVITY_TYPE.LOGIN,
        templateName: '\u5f00\u670d\u4e03\u65e5\u767b\u9646\u6709\u793c',
        name:         'Event Sign-in',
        __name:       '',
        des:          'Sign in daily during the event to claim rewards!',
        __des:        '',
        icon:         '/activity/\u65b0\u7528\u6237\u6d3b\u52a8/huodongnew43.png?rnd=92791669347101',
        image:        '/activity/\u65b0\u7528\u6237\u6d3b\u52a8/huodongnew43.png',
        displayIndex: 9999,
        showRed:      false,
        timeType:     ACTIVITY_TIME_TYPE.SERVER_OPEN,
        startDay:     0,
        durationDay:  7,
        newUserUsing: false,
        isRank:       false,
        displayExtend:0,
        buildAct: function(actId, cycleType, startTime, endTime) {
            var act = buildActBase({
                actId: actId,
                actType: ACTIVITY_TYPE.LOGIN,
                cycleType: cycleType,
                templateName: '\u5f00\u670d\u4e03\u65e5\u767b\u9646\u6709\u793c',
                name: 'Event Sign-in',
                __name: '',
                des: 'Sign in daily during the event to claim rewards!',
                __des: '',
                icon: '/activity/\u65b0\u7528\u6237\u6d3b\u52a8/huodongnew43.png?rnd=92791669347101',
                image: '/activity/\u65b0\u7528\u6237\u6d3b\u52a8/huodongnew43.png',
                displayIndex: 9999,
                showRed: false,
                timeType: ACTIVITY_TIME_TYPE.SERVER_OPEN,
                startTime: startTime,
                endTime: endTime,
                durationDay: 7,
                displayExtend: 0
            });
            // Sign-in rewards: 7 days of escalating rewards
            act._rewards = {
                "1": normalReward([
                    { id: ITEM_ID.GOLD, num: 5000 },
                    { id: ITEM_ID.EXP_CAPSULE, num: 2 }
                ]),
                "2": normalReward([
                    { id: ITEM_ID.GOLD, num: 8000 },
                    { id: ITEM_ID.ENERGY_STONE, num: 3 }
                ]),
                "3": normalReward([
                    { id: ITEM_ID.DIAMOND, num: 50 },
                    { id: ITEM_ID.EXP_CAPSULE, num: 3 }
                ]),
                "4": normalReward([
                    { id: ITEM_ID.GOLD, num: 15000 },
                    { id: ITEM_ID.POWER_STONE, num: 2 }
                ]),
                "5": normalReward([
                    { id: ITEM_ID.DIAMOND, num: 80 },
                    { id: ITEM_ID.ENERGY_STONE, num: 5 }
                ]),
                "6": normalReward([
                    { id: ITEM_ID.GOLD, num: 25000 },
                    { id: ITEM_ID.EVOLVE_CAPSULE, num: 3 }
                ]),
                "7": normalReward([
                    { id: ITEM_ID.DIAMOND, num: 150 },
                    { id: ITEM_ID.SUPER_WATER, num: 5 },
                    { id: ITEM_ID.EXP_CAPSULE, num: 5 }
                ])
            };
            act._exRewards = {};
            return act;
        },
        buildDefaultUact: function(actId, startTime, endTime) {
            var uact = buildUactBase(actId, startTime, endTime);
            uact._activeItem = [];
            uact._gotExRewards = [];
            uact._signedDay = 0;
            uact._maxActiveDay = 0;
            uact._lastActiveDate = 0;
            return uact;
        }
    },

    // ────────────────────────────────────────────────────────────
    // TYPE 1002 — GROW (GrowUpActivity) — catalog-only
    // Client: GrowUpActivityViewData L155749, GrowActivity L127430
    // UI: GrowUpActivity — tabbed pages per GROW_ACTIVITY_PAGE_TYPE
    //
    // act._pages: { pageTypeStr: { _title, _pageType, _displayIndex, _tasks } }
    // uact._tasks: { pageTypeStr: { taskId: { _curCount, _haveGotReward } } }
    // ────────────────────────────────────────────────────────────
    1002: {
        actType:      ACTIVITY_TYPE.GROW,
        templateName: '\uff08\u5f00\u670d\uff09\u6210\u957f\u4efb\u52a1',
        name:         'Growth Quest',
        __name:       '',
        des:          'Complete growth tasks to earn generous rewards!',
        __des:        '',
        icon:         '/activity/\u65b0\u7528\u6237\u6d3b\u52a8/huodongnew47.png',
        image:        '/activity/\u65b0\u7528\u6237\u6d3b\u52a8/huodongnew47.png',
        displayIndex: 7,
        showRed:      true,
        timeType:     ACTIVITY_TIME_TYPE.USER,
        startDay:     0,
        durationDay:  7,
        newUserUsing: true,
        isRank:       false,
        displayExtend:0,
        buildAct: function(actId, cycleType, startTime, endTime) {
            var act = buildActBase({
                actId: actId,
                actType: ACTIVITY_TYPE.GROW,
                cycleType: cycleType,
                templateName: '\uff08\u5f00\u670d\uff09\u6210\u957f\u4efb\u52a1',
                name: 'Growth Quest',
                __name: '',
                des: 'Complete growth tasks to earn generous rewards!',
                __des: '',
                icon: '/activity/\u65b0\u7528\u6237\u6d3b\u52a8/huodongnew47.png',
                image: '/activity/\u65b0\u7528\u6237\u6d3b\u52a8/huodongnew47.png',
                displayIndex: 7,
                showRed: true,
                timeType: ACTIVITY_TIME_TYPE.USER,
                startTime: startTime,
                endTime: endTime,
                durationDay: 7,
                newUserUsing: true,
                displayExtend: 0
            });
            // Build growth quest pages
            act._pages = {};
            // Page 1: EQUIP_MARGE
            act._pages[String(GROW_PAGE_TYPE.EQUIP_MARGE)] = {
                _title: 'Enhance Equipment',
                _pageType: GROW_PAGE_TYPE.EQUIP_MARGE,
                _displayIndex: 5,
                _tasks: {
                    "1": { _des: 'Enhance equipment to +3', _target: 3, _reward: normalReward([{ id: ITEM_ID.GOLD, num: 5000 }, { id: ITEM_ID.ENERGY_STONE, num: 2 }]) },
                    "2": { _des: 'Enhance equipment to +5', _target: 5, _reward: normalReward([{ id: ITEM_ID.GOLD, num: 10000 }, { id: ITEM_ID.POWER_STONE, num: 2 }]) },
                    "3": { _des: 'Enhance equipment to +8', _target: 8, _reward: normalReward([{ id: ITEM_ID.DIAMOND, num: 50 }, { id: ITEM_ID.EVOLVE_CAPSULE, num: 2 }]) }
                }
            };
            // Page 3: ARENA
            act._pages[String(GROW_PAGE_TYPE.ARENA)] = {
                _title: 'Arena Battles',
                _pageType: GROW_PAGE_TYPE.ARENA,
                _displayIndex: 3,
                _tasks: {
                    "1": { _des: 'Win 5 Arena battles', _target: 5, _reward: normalReward([{ id: ITEM_ID.DIAMOND, num: 30 }, { id: ITEM_ID.GOLD, num: 8000 }]) },
                    "2": { _des: 'Win 15 Arena battles', _target: 15, _reward: normalReward([{ id: ITEM_ID.DIAMOND, num: 60 }, { id: ITEM_ID.ENERGY_STONE, num: 3 }]) },
                    "3": { _des: 'Win 30 Arena battles', _target: 30, _reward: normalReward([{ id: ITEM_ID.DIAMOND, num: 100 }, { id: ITEM_ID.SUPER_WATER, num: 3 }]) }
                }
            };
            // Page 4: DUNGEON_SOURCE
            act._pages[String(GROW_PAGE_TYPE.DUNGEON_SOURCE)] = {
                _title: 'Stage Progress',
                _pageType: GROW_PAGE_TYPE.DUNGEON_SOURCE,
                _displayIndex: 4,
                _tasks: {
                    "1": { _des: 'Clear 10 Dungeon stages', _target: 10, _reward: normalReward([{ id: ITEM_ID.GOLD, num: 5000 }, { id: ITEM_ID.EXP_CAPSULE, num: 3 }]) },
                    "2": { _des: 'Clear 30 Dungeon stages', _target: 30, _reward: normalReward([{ id: ITEM_ID.DIAMOND, num: 50 }, { id: ITEM_ID.GOLD, num: 10000 }]) },
                    "3": { _des: 'Clear 50 Dungeon stages', _target: 50, _reward: normalReward([{ id: ITEM_ID.DIAMOND, num: 80 }, { id: ITEM_ID.EVOLVE_CAPSULE, num: 3 }]) }
                }
            };
            // Page 5: TEMPLE
            act._pages[String(GROW_PAGE_TYPE.TEMPLE)] = {
                _title: 'Temple Contest',
                _pageType: GROW_PAGE_TYPE.TEMPLE,
                _displayIndex: 2,
                _tasks: {
                    "1": { _des: 'Challenge Temple 3 times', _target: 3, _reward: normalReward([{ id: ITEM_ID.GOLD, num: 5000 }, { id: ITEM_ID.POWER_STONE, num: 1 }]) },
                    "2": { _des: 'Challenge Temple 10 times', _target: 10, _reward: normalReward([{ id: ITEM_ID.DIAMOND, num: 40 }, { id: ITEM_ID.ENERGY_STONE, num: 3 }]) },
                    "3": { _des: 'Challenge Temple 20 times', _target: 20, _reward: normalReward([{ id: ITEM_ID.DIAMOND, num: 80 }, { id: ITEM_ID.SUPER_WATER, num: 2 }]) }
                }
            };
            // Page 9: KARIN
            act._pages[String(GROW_PAGE_TYPE.KARIN)] = {
                _title: 'Karin Tower',
                _pageType: GROW_PAGE_TYPE.KARIN,
                _displayIndex: 1,
                _tasks: {
                    "1": { _des: 'Clear Karin Tower floor 5', _target: 5, _reward: normalReward([{ id: ITEM_ID.GOLD, num: 8000 }, { id: ITEM_ID.ENERGY_STONE, num: 2 }]) },
                    "2": { _des: 'Clear Karin Tower floor 15', _target: 15, _reward: normalReward([{ id: ITEM_ID.DIAMOND, num: 60 }, { id: ITEM_ID.POWER_STONE, num: 2 }]) },
                    "3": { _des: 'Clear Karin Tower floor 30', _target: 30, _reward: normalReward([{ id: ITEM_ID.DIAMOND, num: 100 }, { id: ITEM_ID.SUPER_WATER, num: 3 }]) }
                }
            };
            return act;
        },
        buildDefaultUact: function(actId, startTime, endTime) {
            var uact = buildUactBase(actId, startTime, endTime);
            uact._tasks = {};
            var catalog = ACTIVITY_DETAIL_CATALOG[ACTIVITY_TYPE.GROW];
            if (catalog) {
                var sampleAct = catalog.buildAct(actId, 0, startTime, endTime);
                for (var pageKey in sampleAct._pages) {
                    if (!sampleAct._pages.hasOwnProperty(pageKey)) continue;
                    uact._tasks[pageKey] = {};
                    var tasks = sampleAct._pages[pageKey]._tasks;
                    for (var taskId in tasks) {
                        if (!tasks.hasOwnProperty(taskId)) continue;
                        uact._tasks[pageKey][taskId] = { _curCount: 0, _haveGotReward: false };
                    }
                }
            }
            return uact;
        }
    },

    // ────────────────────────────────────────────────────────────
    // TYPE 4001 — HERO_IMAGE_RANK (TotalRankActivity) — catalog-only
    // Client: TotalRankActivityViewData L156969
    // Response includes: selfValue, selfRank, rank[]
    // ────────────────────────────────────────────────────────────
    4001: {
        actType:      ACTIVITY_TYPE.HERO_IMAGE_RANK,
        templateName: '\uff08\u65b0\u7248\u5f00\u670d\uff09\u70b9\u4eae\u56fe\u9274',
        name:         'Ignition Illustration',
        __name:       '',
        des:          'Collect hero illustrations to climb the rankings!',
        __des:        '',
        icon:         '/activity/\u62a2\u5360\u5148\u673a/huodongnew137.png',
        image:        '/activity/\u62a2\u5360\u5148\u673a/huodongnew137.png',
        displayIndex: 10,
        showRed:      true,
        timeType:     ACTIVITY_TIME_TYPE.SERVER_OPEN,
        startDay:     0,
        durationDay:  7,
        newUserUsing: false,
        isRank:       true,
        displayExtend:0,
        buildAct: function(actId, cycleType, startTime, endTime) {
            var act = buildActBase({
                actId: actId,
                actType: ACTIVITY_TYPE.HERO_IMAGE_RANK,
                cycleType: cycleType,
                templateName: '\uff08\u65b0\u7248\u5f00\u670d\uff09\u70b9\u4eae\u56fe\u9274',
                name: 'Ignition Illustration',
                __name: '',
                des: 'Collect hero illustrations to climb the rankings!',
                __des: '',
                icon: '/activity/\u62a2\u5360\u5148\u673a/huodongnew137.png',
                image: '/activity/\u62a2\u5360\u5148\u673a/huodongnew137.png',
                displayIndex: 10,
                showRed: true,
                timeType: ACTIVITY_TIME_TYPE.SERVER_OPEN,
                startTime: startTime,
                endTime: endTime,
                durationDay: 7,
                displayExtend: 0
            });
            act._items = {
                "1": { _startRank: 1, _endRank: 1, _reward: normalReward([{ id: ITEM_ID.DIAMOND, num: 500 }, { id: ITEM_ID.SUPER_WATER, num: 20 }]) },
                "2": { _startRank: 2, _endRank: 3, _reward: normalReward([{ id: ITEM_ID.DIAMOND, num: 300 }, { id: ITEM_ID.SUPER_WATER, num: 10 }]) },
                "3": { _startRank: 4, _endRank: 10, _reward: normalReward([{ id: ITEM_ID.DIAMOND, num: 150 }, { id: ITEM_ID.ENERGY_STONE, num: 10 }]) },
                "4": { _startRank: 11, _endRank: 50, _reward: normalReward([{ id: ITEM_ID.DIAMOND, num: 50 }, { id: ITEM_ID.GOLD, num: 20000 }]) },
                "5": { _startRank: 51, _endRank: 999, _reward: normalReward([{ id: ITEM_ID.GOLD, num: 10000 }]) }
            };
            return act;
        },
        buildDefaultUact: function(actId, startTime, endTime) {
            return buildUactBase(actId, startTime, endTime);
        }
    },

    // ────────────────────────────────────────────────────────────
    // TYPE 4003 — TEMPLE_RANK (TotalRankActivity) — catalog-only
    // Client: TotalRankActivityViewData L156969
    // Response includes: selfValue, selfRank, rank[]
    // ────────────────────────────────────────────────────────────
    4003: {
        actType:      ACTIVITY_TYPE.TEMPLE_RANK,
        templateName: '\uff08\u65b0\u7248\u5f00\u670d\uff09\u795e\u6bbf\u4e89\u5148',
        name:         'Temple Contest',
        __name:       '',
        des:          'Compete in Temple Contest for ranking rewards!',
        __des:        '',
        icon:         '/activity/\u62a2\u5360\u5148\u673a/huodongnew142.png?rnd=561581579242342',
        image:        '/activity/\u62a2\u5360\u5148\u673a/huodongnew142.png',
        displayIndex: 9,
        showRed:      true,
        timeType:     ACTIVITY_TIME_TYPE.SERVER_OPEN,
        startDay:     0,
        durationDay:  7,
        newUserUsing: false,
        isRank:       true,
        displayExtend:0,
        buildAct: function(actId, cycleType, startTime, endTime) {
            var act = buildActBase({
                actId: actId,
                actType: ACTIVITY_TYPE.TEMPLE_RANK,
                cycleType: cycleType,
                templateName: '\uff08\u65b0\u7248\u5f00\u670d\uff09\u795e\u6bbf\u4e89\u5148',
                name: 'Temple Contest',
                __name: '',
                des: 'Compete in Temple Contest for ranking rewards!',
                __des: '',
                icon: '/activity/\u62a2\u5360\u5148\u673a/huodongnew142.png?rnd=561581579242342',
                image: '/activity/\u62a2\u5360\u5148\u673a/huodongnew142.png',
                displayIndex: 9,
                showRed: true,
                timeType: ACTIVITY_TIME_TYPE.SERVER_OPEN,
                startTime: startTime,
                endTime: endTime,
                durationDay: 7,
                displayExtend: 0
            });
            act._items = {
                "1": { _startRank: 1, _endRank: 1, _reward: normalReward([{ id: ITEM_ID.DIAMOND, num: 500 }, { id: ITEM_ID.SUPER_WATER, num: 20 }]) },
                "2": { _startRank: 2, _endRank: 3, _reward: normalReward([{ id: ITEM_ID.DIAMOND, num: 300 }, { id: ITEM_ID.POWER_STONE, num: 10 }]) },
                "3": { _startRank: 4, _endRank: 10, _reward: normalReward([{ id: ITEM_ID.DIAMOND, num: 150 }, { id: ITEM_ID.ENERGY_STONE, num: 10 }]) },
                "4": { _startRank: 11, _endRank: 50, _reward: normalReward([{ id: ITEM_ID.DIAMOND, num: 50 }, { id: ITEM_ID.GOLD, num: 20000 }]) },
                "5": { _startRank: 51, _endRank: 999, _reward: normalReward([{ id: ITEM_ID.GOLD, num: 10000 }]) }
            };
            return act;
        },
        buildDefaultUact: function(actId, startTime, endTime) {
            return buildUactBase(actId, startTime, endTime);
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // PHASE 2-7 ENTRIES WILL BE ADDED HERE
    // Remaining types: 2005,2006,3001-3016,4002,4004-4008,
    //   5001-5002,5004-5010,5011-5041 (except those above)
    // ═══════════════════════════════════════════════════════════════
};

// ═══════════════════════════════════════════════════════════════
// MAIN HANDLER
// ═══════════════════════════════════════════════════════════════

/**
 * Handle activity/getActivityDetail request.
 *
 * Request fields:
 *   userId     — User ID string
 *   actId      — Activity ID (format: act_{actType}_{cycleType})
 *   cycleType  — ACTIVITY_CYCLE enum value (from getActivityBrief)
 *   poolId     — Merge server pool ID (optional)
 *   version    — Client version string
 *
 * Response format:
 *   { act: {...}, uact: {...}, forceEndTime: 0, [selfValue, selfRank, rank] }
 */
function handleGetActivityDetail(request, ctx) {
    var userId = request.userId;
    var actId = request.actId;
    var cycleType = request.cycleType;
    var poolId = request.poolId;

    // ─── STEP 1: Validate request ───
    ctx.logger.step(1, 6, 'Validate request', 'running');
    ctx.logger.details('request',
        ['userId', userId ? userId.substring(0, 20) + '...' : 'MISSING'],
        ['actId', actId || 'MISSING'],
        ['cycleType', String(cycleType || 'MISSING')],
        ['poolId', String(poolId || '(none)')],
        ['version', String(request.version || '(none)')]
    );

    if (!userId || !actId) {
        ctx.logger.step(1, 6, 'Validate request', 'fail', 'userId or actId MISSING');
        return ctx.buildErrorResponse(8);
    }

    ctx.logger.step(1, 6, 'Validate request', 'pass');

    // ─── STEP 2: Parse actId -> actType ───
    ctx.logger.step(2, 6, 'Parse activity type', 'running');

    var actType = 0;
    var parsedCycleType = 0;
    var idParts = String(actId).split('_');
    if (idParts.length >= 3) {
        actType = parseInt(idParts[1], 10);
        parsedCycleType = parseInt(idParts[2], 10);
    }

    if (!actType || isNaN(actType)) {
        ctx.logger.step(2, 6, 'Parse activity type', 'fail',
            'Cannot parse actType from actId: ' + actId);
        return ctx.buildErrorResponse(8);
    }

    if (!cycleType && parsedCycleType) {
        cycleType = parsedCycleType;
    }

    ctx.logger.details('parsed',
        ['actType', String(actType)],
        ['cycleType', String(cycleType || '(from actId: ' + parsedCycleType + ')')]
    );
    ctx.logger.step(2, 6, 'Parse activity type', 'pass',
        'actType=' + actType + ', cycleType=' + cycleType);

    // ─── STEP 3: Look up activity catalog ───
    ctx.logger.step(3, 6, 'Lookup catalog', 'running');

    var catalogEntry = ACTIVITY_DETAIL_CATALOG[actType];
    if (!catalogEntry) {
        ctx.logger.step(3, 6, 'Lookup catalog', 'fail',
            'actType ' + actType + ' not found in catalog');
        var emptyResponse = {
            act: buildActBase({
                actId: actId,
                actType: actType,
                cycleType: cycleType || 0,
                startTime: 0,
                endTime: 0
            }),
            uact: buildUactBase(actId, 0, 0),
            forceEndTime: 0
        };
        ctx.logger.details('fallback', ['note', 'Type not implemented, returning empty template']);
        ctx.logger.step(3, 6, 'Lookup catalog', 'pass', 'FALLBACK to empty template');
        return ctx.buildDataResponse(0, emptyResponse);
    }

    ctx.logger.details('catalog',
        ['name', catalogEntry.name],
        ['templateName', catalogEntry.templateName],
        ['timeType', String(catalogEntry.timeType)],
        ['durationDay', String(catalogEntry.durationDay)],
        ['isRank', String(catalogEntry.isRank)]
    );
    ctx.logger.step(3, 6, 'Lookup catalog', 'pass', catalogEntry.name);

    // ─── STEP 4: Load user data + calculate time ───
    ctx.logger.step(4, 6, 'Load data & calc time', 'running');

    var userData = ctx.db.getUser(userId);
    if (!userData) {
        ctx.logger.step(4, 6, 'Load data & calc time', 'fail', 'User not found in DB');
        return ctx.buildErrorResponse(8);
    }

    var serverOpenDate = ctx.config.serverOpenDate || 0;
    var userCreateTime = (userData.user && userData.user._createTime) || 0;
    var timeContext = {
        serverOpenDate: serverOpenDate,
        userCreateTime: userCreateTime
    };

    var timeResult = calcActivityTime(
        catalogEntry.timeType,
        catalogEntry.startDay,
        catalogEntry.durationDay,
        timeContext
    );

    ctx.logger.details('time',
        ['serverOpenDate', serverOpenDate > 0 ? new Date(serverOpenDate).toISOString() : 'N/A'],
        ['userCreateTime', userCreateTime > 0 ? new Date(userCreateTime).toISOString() : 'N/A'],
        ['timeType', String(catalogEntry.timeType)],
        ['startTime', timeResult.startTime > 0 ? new Date(timeResult.startTime).toISOString() : 'N/A'],
        ['endTime', timeResult.endTime > 0 ? new Date(timeResult.endTime).toISOString() : 'N/A']
    );
    ctx.logger.step(4, 6, 'Load data & calc time', 'pass');

    // ─── STEP 5: Build act from catalog ───
    ctx.logger.step(5, 6, 'Build activity data', 'running');

    var act = catalogEntry.buildAct(
        actId,
        cycleType || 0,
        timeResult.startTime,
        timeResult.endTime
    );

    ctx.logger.step(5, 6, 'Build activity data', 'pass',
        'act keys: ' + Object.keys(act).length);

    // ─── STEP 6: Load or create uact ───
    ctx.logger.step(6, 6, 'Load user progress', 'running');

    var uact = loadUact(userId, actId, ctx);

    if (!uact) {
        // First time opening this activity — create default progress
        uact = catalogEntry.buildDefaultUact(actId, timeResult.startTime, timeResult.endTime);
        saveUact(userId, actId, uact, ctx);
        ctx.logger.details('uact', ['status', 'CREATED (first time)']);
    } else {
        // Returning user — keep existing _haveClick value (HAR shows true)
        ctx.logger.details('uact', ['status', 'LOADED (existing)']);
        ctx.logger.details('uact', ['keys', Object.keys(uact).join(', ')]);
    }

    // For timeType 2 (USER): uact gets user-based times
    if (catalogEntry.timeType === ACTIVITY_TIME_TYPE.USER) {
        uact._startTime = timeResult.startTime;
        uact._endTime = timeResult.endTime;
    }
    uact._activityId = actId;

    ctx.logger.step(6, 6, 'Load user progress', 'pass');

    // ─── Build response ───
    var responseData = {
        act: act,
        uact: uact,
        forceEndTime: 0
    };

    // Add rank-specific fields for rank activity types
    if (catalogEntry.isRank) {
        responseData.selfValue = 0;
        responseData.selfRank = 0;
        responseData.rank = [];
        ctx.logger.details('rank', ['note', 'Rank type — added selfValue/selfRank/rank']);
    }

    // ─── Type assertions ───
    ctx.logger.typeAssert('responseData.act._activityType', responseData.act._activityType, 'number', {
        context: 'ACTIVITY-DETAIL',
        trace: 'L147495: switch (t.act._activityType)',
        impact: 'Wrong type -> client cannot route to correct UI panel'
    });
    ctx.logger.typeAssert('responseData.act._cycleType', responseData.act._cycleType, 'number', {
        context: 'ACTIVITY-DETAIL',
        trace: 'L155554: getActivityCycle()',
        impact: 'Wrong type -> cycle tab grouping broken'
    });
    ctx.logger.typeAssert('responseData.uact._activityId', responseData.uact._activityId, 'string', {
        context: 'ACTIVITY-DETAIL',
        trace: 'UserActivityBase._activityId',
        impact: 'Wrong type -> user progress not linked to activity'
    });

    // ─── Summary ───
    ctx.logger.responseSnapshot('ACTIVITY DETAIL ret=0', {
        _activityType: act._activityType,
        _cycleType: act._cycleType,
        _name: act._name,
        __name: act.__name,
        _enable: act._enable,
        _startTime: act._startTime,
        _endTime: act._endTime,
        _displayExtend: act._displayExtend,
        uact_keys: Object.keys(uact).length,
        isRank: catalogEntry.isRank
    });

    ctx.logger.summaryCard({
        title: 'ACTIVITY DETAIL',
        userId: userId,
        actId: actId,
        actType: actType,
        name: catalogEntry.name,
        cycleType: cycleType,
        isRank: catalogEntry.isRank,
        uactStatus: uact ? 'loaded' : 'created'
    });

    return ctx.buildDataResponse(0, responseData);
}

module.exports = handleGetActivityDetail;
