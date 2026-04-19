'use strict';

/**
 * =====================================================
 *  activity/query/getActivityBrief.js — Get Activity Brief List
 *  Super Warrior Z Game Server — Main Server
 *
 *  ACTION: getActivityBrief — Return filtered list of active activities.
 *
 *  STATUS: SEMPURNA — 100% sesuai main.min.js client code & HAR
 *
 *  ═══════════════════════════════════════════════════════
 *  ALUR KERJA HANDLER:
 *
 *  1. Baca ACTIVITY_BRIEF_LIST dari _config.js
 *  2. Filter menggunakan ActivityManager.isActivityAvailableByDay()
 *     — Cek minDay ≤ openServerDays ≤ maxDay
 *  3. Deep clone setiap aktivitas yang lolos filter
 *  4. HITUNG endTime dinamis berdasarkan schedule:
 *     - timeType=1 (fixed): endTime = serverOpenDate + (startDay + durationDay) * 86400000
 *     - timeType=2 (relative): tidak ada endTime
 *     - Hanya kirim endTime untuk REGRESSION (actCycle=17) activities
 *       karena client hanya pakai endTime untuk regressActEndtime
 *  5. STRIP server-only fields dari response
 *  6. STRIP conditional fields jika tidak relevan:
 *     - cycleType: strip jika sama dengan actCycle (redundan)
 *     - poolId: strip jika 0 (tidak ada pool)
 *     - endTime: strip jika 0/falsy
 *     - hangupReward: strip jika null/undefined
 *     - haveExReward: strip jika bukan actType=1001
 *  7. Build ACTS_MAP { [id]: activityObj }
 *  8. Return { type, action, userId, version, _acts }
 *
 *  ═══════════════════════════════════════════════════════
 *  CLIENT REQUEST (main.min.js line 168092-168096):
 *    { type:"activity", action:"getActivityBrief", userId, version:"1.0" }
 *
 *  CLIENT CALLBACKS (2 call sites):
 *    1. Home.setActs (line 168087) — main entry, populates activity bar
 *    2. backToActivityPage (line 57528) — returning from activity detail
 *
 *  ═══════════════════════════════════════════════════════
 *  RESPONSE FORMAT — objek per aktivitas di _acts:
 *
 *    {
 *      id:           string   — UUID aktivitas
 *      templateName: string   — Nama template (HAR field, client tidak baca)
 *      name:         string   — Nama display (HAR field, client tidak baca)
 *      icon:         string   — Path ikon (line 103410, 168162)
 *      displayIndex: number   — Sort desc (line 103407)
 *      showRed:      boolean  — Flag red dot (line 103414)
 *      actCycle:     number   — ACTIVITY_CYCLE enum (line 168104)
 *      actType:      number   — ACTIVITY_TYPE enum (line 168104)
 *      haveExReward: boolean  — Hanya actType=1001 LOGIN (HAR field)
 *    }
 *
 *    CONDITIONAL FIELDS (only when meaningful):
 *      cycleType:    number   — Jika != actCycle (FB/iOS activities)
 *                               Dibaca checkLikeIsOn (line 168104)
 *                               Default = actCycle
 *      poolId:       number   — Jika > 0 (pool-based activities)
 *                               Dibaca setActivityList (line 103411)
 *                               & getActivityDetail request (line 168191)
 *      endTime:      number   — Hanya REGRESSION actCycle=17
 *                               Dibaca setActs (line 168102)
 *                               Drives regressActEndtime + setTimeLimitBags()
 *      hangupReward: object   — Hanya actType=100 ITEM_DROP
 *                               Dibaca setActs (line 168104)
 *    }
 *
 *    FIELD YANG DI-STRIP (tidak dikirim ke client):
 *      minDay, maxDay, timeType, durationDay, startDay — server-only
 *      cycleType (jika == actCycle) — redundant
 *      poolId (jika 0) — tidak ada pool
 *      endTime (jika 0) — tidak ada deadline
 *      hangupReward (jika null) — tidak ada drop
 *      haveExReward (jika bukan actType=1001) — tidak relevan
 *
 *  ═══════════════════════════════════════════════════════
 *  endTime COMPUTATION:
 *
 *    Berdasarkan getActivityDetail HAR data, aktivitas punya:
 *      _timeType:    1 = fixed timestamps, 2 = relative/user-based
 *      _startTime:   absolute ms (timeType=1) atau 0 (timeType=2)
 *      _endTime:     absolute ms (timeType=1) atau 0 (timeType=2)
 *      _startDay:    offset from server open (days)
 *      _durationDay: duration in days
 *
 *    Untuk getActivityBrief, endTime HANYA dipakai oleh client untuk
 *    REGRESSION countdown (regressActEndtime). Aktivitas lain tidak
 *    perlu endTime di brief — timing detail ada di getActivityDetail.
 *
 *    Formula (timeType=1):
 *      endTime = serverOpenDate + (startDay + durationDay) * 86400000
 *
 *    Contoh dari HAR:
 *      serverOpenDate = 1775199600000 (approx)
 *      startDay=0, durationDay=7
 *      endTime = 1775199600000 + 7 * 86400000 = 1775804400000
 *      HAR _endTime = 1775804399999 (1ms off = day boundary at midnight)
 *
 *  ═══════════════════════════════════════════════════════
 *  VERIFIKASI: Response harus identik dengan HAR untuk 12 aktivitas
 *  saat ini (tanpa cycleType, poolId, endTime karena tidak relevan).
 *  Ketika aktivitas REGRESSION/FB/iOS ditambahkan, field otomatis
 *  muncul sesuai kebutuhan client.
 * =====================================================
 */

var RH = require('../../../../shared/responseHelper');
var logger = require('../../../../shared/utils/logger');
var activityConfig = require('../_config');
var ActivityManager = require('../../../activity');

// ── Server-only fields — selalu di-strip dari response ──
var SERVER_ONLY_FIELDS = ['minDay', 'maxDay', 'timeType', 'durationDay', 'startDay'];

// ── Milliseconds per day — untuk endTime computation ──
var MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Compute endTime for an activity based on its schedule config.
 *
 * endTime hanya dikirim untuk REGRESSION activities (actCycle=17)
 * karena client hanya memakainya untuk regressActEndtime countdown.
 * Aktivitas lain mendapat timing dari getActivityDetail.
 *
 * Formula (timeType=1):
 *   endTime = serverOpenDate + (startDay + durationDay) * 86400000 - 1
 *   (subtract 1ms to match HAR boundary: 1775804399999 instead of 1775804400000)
 *
 * timeType=2 (relative/user-based): tidak ada endTime
 *
 * @param {Object} act - Activity config entry (deep cloned)
 * @param {number} serverOpenDate - Server open timestamp (ms)
 * @returns {number} endTime in ms, or 0 if not applicable
 */
function computeEndTime(act, serverOpenDate) {
    // Hanya timeType=1 yang punya fixed endTime
    if (act.timeType !== 1) {
        return 0;
    }

    // Hanya REGRESSION (actCycle=17) yang butuh endTime di brief
    // Client code: r.endTime && (e.regressActEndtime = r.endTime, e.setTimeLimitBags())
    // Variabel regressActEndtime hanya dipakai untuk REGRESSION countdown
    if (act.actCycle !== activityConfig.ACTIVITY_CYCLE.REGRESSION) {
        return 0;
    }

    if (!serverOpenDate || !act.durationDay) {
        return 0;
    }

    var startDay = act.startDay || 0;
    var durationDay = act.durationDay;

    // endTime = serverOpenDate + (startDay + durationDay) days - 1ms
    // -1ms agar sesuai HAR: 1775804399999 bukan 1775804400000
    var endTime = serverOpenDate + (startDay + durationDay) * MS_PER_DAY - 1;

    return endTime;
}

/**
 * Build filtered _acts map from activity config.
 *
 * Proses:
 *   1. Iterasi ACTIVITY_BRIEF_LIST
 *   2. Filter berdasarkan openServerDays (minDay/maxDay)
 *   3. Deep clone setiap entry yang lolos filter
 *   4. Compute endTime dinamis (hanya REGRESSION)
 *   5. Strip server-only fields dari clone
 *   6. Strip conditional fields jika tidak relevan:
 *      - cycleType jika == actCycle (redundan, client baca r.cycleType
 *        hanya untuk FB/iOS yang cycleType-nya beda dari actCycle)
 *      - poolId jika 0 (tidak ada pool)
 *      - endTime jika 0 (tidak ada deadline)
 *      - hangupReward jika null/undefined
 *      - haveExReward jika bukan actType=1001
 *   7. Return sebagai map { [id]: activityObj }
 *
 * @returns {Object} Filtered _acts map keyed by activity UUID
 */
function buildFilteredActsMap() {
    var list = activityConfig.ACTIVITY_BRIEF_LIST;
    var actsMap = {};
    var serverOpenDate = ActivityManager.getServerOpenDate();

    for (var i = 0; i < list.length; i++) {
        var act = list[i];

        // ── Filter: cek apakah aktivitas masih dalam range hari ──
        if (!ActivityManager.isActivityAvailableByDay(act)) {
            continue;
        }

        // ── Deep clone: mencegah mutasi config ──
        var entry = JSON.parse(JSON.stringify(act));

        // ── Compute endTime dinamis ──
        // Hanya untuk REGRESSION (actCycle=17) dengan timeType=1
        var endTime = computeEndTime(entry, serverOpenDate);
        if (endTime > 0) {
            entry.endTime = endTime;
        }

        // ── Strip server-only fields ──
        for (var j = 0; j < SERVER_ONLY_FIELDS.length; j++) {
            delete entry[SERVER_ONLY_FIELDS[j]];
        }

        // ── Strip cycleType jika sama dengan actCycle ──
        // Client membaca r.cycleType hanya untuk:
        //   1. checkLikeIsOn(id, actType, cycleType, poolId) — FB/iOS activities
        //      di mana cycleType mungkin berbeda dari actCycle
        //   2. getActivityDetail request — cycleType sebagai parameter
        // Untuk aktivitas standar, cycleType == actCycle, jadi redundant
        // dan TIDAK ADA di HAR response → strip untuk match HAR
        if (entry.cycleType === entry.actCycle) {
            delete entry.cycleType;
        }

        // ── Strip poolId jika 0 ──
        // Client membaca r.poolId untuk:
        //   1. setActivityList → poolId: t[o].poolId (line 103411)
        //   2. getActivityDetail request → poolId parameter (line 168191)
        // Hanya pool-based activities (gacha, etc.) yang punya poolId > 0
        // poolId=0 TIDAK ADA di HAR response → strip untuk match HAR
        if (!entry.poolId) {
            delete entry.poolId;
        }

        // ── Strip endTime jika 0/falsy ──
        // Hanya REGRESSION activities yang punya endTime di brief
        if (!entry.endTime) {
            delete entry.endTime;
        }

        // ── Strip hangupReward jika null/undefined ──
        // Hanya actType=100 (ITEM_DROP) yang butuh field ini
        if (entry.hangupReward == null) {
            delete entry.hangupReward;
        }

        // ── Strip haveExReward jika bukan actType=1001 (LOGIN) ──
        // Client mengecek _exRewards dari getActivityDetail (line 96464),
        // bukan haveExReward dari brief. Tapi field ini ada di HAR
        // untuk actType=1001 → keep hanya untuk LOGIN type.
        if (entry.actType !== activityConfig.ACTIVITY_TYPE.LOGIN) {
            delete entry.haveExReward;
        }

        actsMap[entry.id] = entry;
    }

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
 *   @param {string} parsed.type - "activity"
 *   @param {string} parsed.action - "getActivityBrief"
 *   @param {string} parsed.userId - User UUID
 *   @param {string} parsed.version - Protocol version (always "1.0")
 * @param {function} callback - Socket.IO acknowledgment callback
 */
function handle(socket, parsed, callback) {
    var userId = parsed.userId;
    var openDays = ActivityManager.getOpenServerDays();

    logger.info('ACTIVITY', 'getActivityBrief userId=' + userId +
        ' openServerDays=' + openDays);

    // Build filtered _acts map
    var actsData = buildFilteredActsMap();

    var actCount = Object.keys(actsData).length;
    logger.info('ACTIVITY', 'getActivityBrief returning ' + actCount +
        ' activities (filtered from ' + activityConfig.ACTIVITY_BRIEF_LIST.length + ')');

    callback(RH.success({
        type: parsed.type || 'activity',
        action: parsed.action || 'getActivityBrief',
        userId: userId || '',
        version: parsed.version || '1.0',
        _acts: actsData
    }));
}

module.exports = { handle: handle };
