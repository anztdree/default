'use strict';

/**
 * =====================================================
 *  activity/query/getActivityBrief.js — Get Activity Brief List
 *  Super Warrior Z Game Server — Main Server
 *
 *  ACTION: getActivityBrief — Return filtered list of active activities.
 *
 *  ARCHITECTURE: Natural data flow
 *    resource/json/activityDefine.json (single source of truth)
 *      → GameData.get('activityDefine') (loaded at server startup)
 *        → getActivityBrief handler (filter by day, strip server fields)
 *          → client _acts response
 *
 *  No hardcoded data. No dummy entries. No forced overrides.
 *  Activity definitions live in activityDefine.json alongside
 *  the other 471 game config files. Adding/removing activities
 *  only requires editing the JSON — zero code changes.
 *
 *  ═══════════════════════════════════════════════════════
 *  ALUR KERJA:
 *
 *  1. Load activityDefine dari GameData (resource/json/)
 *  2. Filter: isActivityAvailableByDay() → minDay <= openServerDays <= maxDay
 *  3. Build entry dari definisi — hanya field yang dibutuhkan client
 *  4. Compute endTime dinamis (hanya REGRESSION, actCycle=17, timeType=1)
 *  5. Include conditional fields hanya ketika bermakna:
 *     - cycleType: hanya jika != actCycle (FB/iOS activities)
 *     - poolId: hanya jika > 0 (pool-based activities)
 *     - haveExReward: hanya untuk actType=1001 (LOGIN)
 *     - hangupReward: hanya untuk actType=100 (ITEM_DROP)
 *     - endTime: hanya untuk REGRESSION countdown
 *  6. Return { type, action, userId, version, _acts }
 *
 *  ═══════════════════════════════════════════════════════
 *  CLIENT REQUEST (main.min.js line 234743):
 *    { type:"activity", action:"getActivityBrief", userId, version:"1.0" }
 *
 *  CLIENT CALLBACK — Home.setActs (line 234743):
 *    Iterates t._acts, reads per entry:
 *      r.id          — UUID
 *      r.actType     — routing: NEW_USER_MAIL/FB_SHARE/ITEM_DROP/.../DEFAULT
 *      r.actCycle    — groups activities into tabs
 *      r.cycleType   — only read by checkLikeIsOn (FBGIVELIKE/IOSGIVELIKE)
 *      r.poolId      — only read for pool-based activities
 *      r.endTime     — only read for REGRESSION countdown
 *      r.hangupReward — only read for ITEM_DROP
 *      r.icon        — activity icon path (setActivityList line 155530)
 *      r.displayIndex — sort desc within cycle tab
 *      r.showRed     — red dot indicator
 *
 *  CLIENT CALLBACK — backToActivityPage (line 90691):
 *    Filters t._acts by actCycle, passes matching entries to BaseActivity.
 *
 *  ═══════════════════════════════════════════════════════
 *  RESPONSE FORMAT per aktivitas di _acts (verified HAR):
 *
 *  BASE FIELDS (selalu dikirim):
 *    id           string   — UUID
 *    templateName string   — template name (HAR field, client tidak baca)
 *    name         string   — display name (HAR field, client tidak baca)
 *    icon         string   — icon path
 *    displayIndex number   — sort descending
 *    showRed      boolean  — red dot flag
 *    actCycle     number   — ACTIVITY_CYCLE enum → tab grouping
 *    actType      number   — ACTIVITY_TYPE enum → routing
 *
 *  CONDITIONAL FIELDS (hanya ketika bermakna):
 *    cycleType    number   — != actCycle → FB/iOS activities
 *    poolId       number   — > 0 → pool-based
 *    haveExReward boolean  — actType=1001 (LOGIN) only
 *    endTime      number   — actCycle=17 (REGRESSION) only
 *    hangupReward object   — actType=100 (ITEM_DROP) only
 *
 *  STRIPPED (server-only, tidak dikirim):
 *    minDay, maxDay, timeType, durationDay, startDay
 *
 *  ═══════════════════════════════════════════════════════
 *  endTime COMPUTATION:
 *
 *    Formula (timeType=1, REGRESSION only):
 *      endTime = serverOpenDate + (startDay + durationDay) * 86400000 - 1
 *
 *    -1ms untuk match HAR boundary: 1775804399999 bukan 1775804400000
 *    Non-REGRESSION activities: endTime tidak relevan di brief
 *    (detail timing ada di getActivityDetail response)
 * =====================================================
 */

var RH = require('../../../../shared/responseHelper');
var logger = require('../../../../shared/utils/logger');
var GameData = require('../../../../shared/gameData/loader');
var ActivityManager = require('../../../activity');

// ── Milliseconds per day ──
var MS_PER_DAY = 86400000;

/**
 * Compute endTime for a REGRESSION activity (actCycle=17).
 *
 * Client reads r.endTime di setActs (line 234743):
 *   r.endTime && (e.regressActEndtime = r.endTime, e.setTimeLimitBags())
 *
 * Hanya REGRESSION yang pakai endTime di brief untuk countdown.
 * Activity lain mendapat timing dari getActivityDetail.
 *
 * @param {Object} def - Activity definition dari activityDefine.json
 * @param {number} serverOpenDate - Server open timestamp (ms)
 * @returns {number} endTime in ms, atau 0 jika tidak applicable
 */
function computeEndTime(def, serverOpenDate) {
    // Hanya timeType=1 (fixed) yang punya endTime
    if (def.timeType !== 1) {
        return 0;
    }

    // Hanya REGRESSION (actCycle=17) yang butuh endTime di brief
    if (def.actCycle !== 17) {
        return 0;
    }

    if (!serverOpenDate || !def.durationDay) {
        return 0;
    }

    var startDay = def.startDay || 0;
    return serverOpenDate + (startDay + def.durationDay) * MS_PER_DAY - 1;
}

/**
 * Build filtered _acts map dari activityDefine (GameData).
 *
 * Alur natural:
 *   activityDefine.json → GameData.get('activityDefine') → filter → strip → _acts
 *
 * Tidak ada:
 *   - hardcoded activity list
 *   - dummy data
 *   - forced overrides
 *   - bypass logic
 *
 * @returns {Object} _acts map { [id]: activityObj }
 */
function buildFilteredActsMap() {
    var activityDefine = GameData.get('activityDefine');

    if (!activityDefine || !Array.isArray(activityDefine) || activityDefine.length === 0) {
        logger.warn('ACTIVITY',
            'getActivityBrief: activityDefine kosong atau tidak dimuat.' +
            ' Pastikan resource/json/activityDefine.json ada dan valid.');
        return {};
    }

    var actsMap = {};
    var serverOpenDate = ActivityManager.getServerOpenDate();
    var totalInConfig = activityDefine.length;

    for (var i = 0; i < activityDefine.length; i++) {
        var def = activityDefine[i];

        // Skip entry tanpa id
        if (!def.id) {
            continue;
        }

        // ── Filter: cek range hari ──
        if (!ActivityManager.isActivityAvailableByDay(def)) {
            continue;
        }

        // ── Build entry: hanya field yang client butuhkan ──
        var entry = {};

        // Base fields (selalu dikirim — verified HAR)
        entry.id = def.id;
        if (def.templateName != null) entry.templateName = def.templateName;
        if (def.name != null) entry.name = def.name;
        if (def.icon != null) entry.icon = def.icon;
        if (def.displayIndex != null) entry.displayIndex = def.displayIndex;
        if (def.showRed != null) entry.showRed = def.showRed;
        if (def.actCycle != null) entry.actCycle = def.actCycle;
        if (def.actType != null) entry.actType = def.actType;

        // ── Conditional fields: hanya ketika bermakna ──

        // cycleType: client baca di checkLikeIsOn (line 234743)
        // Hanya dikirim jika != actCycle (FB/iOS activities yang cycle berbeda)
        // Untuk aktivitas standar: cycleType == actCycle → redundant, tidak ada di HAR
        if (def.cycleType != null && def.cycleType !== def.actCycle) {
            entry.cycleType = def.cycleType;
        }

        // poolId: client baca di setActivityList (line 155530)
        // dan getActivityDetail request (line 168191)
        // Hanya pool-based activities yang punya poolId > 0
        // poolId=0 tidak ada di HAR response → strip
        if (def.poolId != null && def.poolId > 0) {
            entry.poolId = def.poolId;
        }

        // haveExReward: client baca di setActs (line 234743)
        // Hanya relevan untuk actType=1001 (LOGIN)
        // Client cek _exRewards dari getActivityDetail untuk regression check
        // tapi field ini ada di HAR brief untuk LOGIN → keep
        if (def.actType === 1001 && def.haveExReward != null) {
            entry.haveExReward = def.haveExReward;
        }

        // hangupReward: client baca di setActs (line 234743)
        // Hanya untuk actType=100 (ITEM_DROP)
        if (def.actType === 100 && def.hangupReward != null) {
            entry.hangupReward = def.hangupReward;
        }

        // endTime: client baca di setActs (line 234743)
        // Hanya REGRESSION (actCycle=17) yang pakai untuk countdown
        var endTime = computeEndTime(def, serverOpenDate);
        if (endTime > 0) {
            entry.endTime = endTime;
        }

        actsMap[entry.id] = entry;
    }

    var filteredCount = Object.keys(actsMap).length;
    logger.info('ACTIVITY',
        'getActivityBrief: filtered ' + filteredCount + '/' + totalInConfig +
        ' activities (openServerDays=' + ActivityManager.getOpenServerDays() + ')');

    return actsMap;
}

/**
 * Handle getActivityBrief request.
 *
 * Endpoint READ-ONLY — tidak mengubah state user.
 * Response identik untuk semua user (static config + day filter).
 * State per-user (progress, reward claimed) ditangani oleh
 * getActivityDetail dan masing-masing action handler.
 *
 * @param {Object} socket - Socket.IO socket instance
 * @param {Object} parsed - Parsed request dari client
 * @param {function} callback - Socket.IO acknowledgment callback
 */
function handle(socket, parsed, callback) {
    var userId = parsed.userId;
    var openDays = ActivityManager.getOpenServerDays();

    logger.info('ACTIVITY',
        'getActivityBrief userId=' + userId + ' openServerDays=' + openDays);

    var actsData = buildFilteredActsMap();

    callback(RH.success({
        type: parsed.type || 'activity',
        action: parsed.action || 'getActivityBrief',
        userId: userId || '',
        version: parsed.version || '1.0',
        _acts: actsData
    }));
}

module.exports = { handle: handle };
