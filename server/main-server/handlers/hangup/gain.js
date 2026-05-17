/**
 * gain.js — Handler: hangup/gain
 *
 * ═══════════════════════════════════════════════════════════════
 * DEEP TRACE — main.min.js (100% verified)
 * ═══════════════════════════════════════════════════════════════
 *
 * CALLER — L233990-234022:
 *   ts.processHandler({
 *       type: 'hangup', action: 'gain',
 *       userId: UserInfoSingleton.getInstance().userId,
 *       version: '1.0'
 *   }, function(t) {
 *       var o = t._changeInfo._items;
 *       n = BattleCallBack.getBattleAwardItems(t, false);
 *       var a = t._exCount,
 *           r = OnHookSingleton.getInstance().checkClickGlobalWarBuffTag();
 *       OnHookSingleton.getInstance().clickGlobalWarBuffTag = t._clickGlobalWarBuffTag;
 *       var i = {
 *           items: n, parent: 'home',
 *           _lastGainTime: t._lastGainTime,
 *           exCount: a, showGoodPlayer: r
 *       };
 *       ts.openWindow('HomeGainTips', i, function(t) {
 *           ItemsCommonSingleton.getInstance().openCommonItemGetTips(o, void 0, function() {
 *               e.userLevelUp(true);
 *               e.openOtherWindow = false;
 *           });
 *       });
 *   });
 *
 * ── RESPONSE FIELDS ──
 *   _changeInfo._items  — { "102": {_id: 102, _num: NEW_TOTAL}, "103": {...}, ... }
 *                        Keys are ITEM ID strings (NOT sequential "0","1","2").
 *                        _num = NEW TOTALS after all rewards applied.
 *                        L233992: getBattleAwardItems(t, false) iterates via for...in
 *                        L97686-97708: reads n[u]._id and n[u]._num from each entry
 *   _lastGainTime       — number (timestamp ms)
 *                        L235034: GetTimeLeft2BySecond() calculates countdown
 *   _clickGlobalWarBuffTag — string
 *                        L234001: stored in OnHookSingleton.clickGlobalWarBuffTag
 *
 * ── REWARD FORMULA ──
 *   Server: totalReward = Math.floor(rewardNum_i * elapsedSeconds * bonusMultiplier)
 *   Client display (L92953-92973 getCurrentSectionRevenueArray):
 *     _gainNum = rewardNum_i * (idleAwardPlus + 1 + globalWarBuff)
 *     This is the per-second display rate shown in the idle UI panel.
 *   NOTE: rewardNum in lesson.json is a PER-SECOND rate, NOT per-tick.
 *   Tick interval (idleAwardEveryTime) = 300s from constant.json.
 *   Total = perSecondRate * totalElapsedSeconds * bonusMultiplier.
 *
 * ── BONUS MULTIPLIER ──
 *   L92953-92973:
 *   bonusMultiplier = idleAwardPlus + 1 + globalWarBuff
 *   idleAwardPlus: from idleVipPlus.json[vipLevel].idleAwardPlus
 *   globalWarBuff: from userData.globalWarBuff (if globalWarBuffEndTime > now)
 *
 * ── RANDOM DROPS (per tick) ──
 *   lesson.json → idleRandomAward → key in lessonIdleAward.json
 *   6 groups per lesson, each with hit/miss probability pair:
 *     [ {award: itemId, num: count, random: hitWeight},
 *       {award: "",     num: "",    random: missWeight} ]
 *   Per tick per group: roll(0, totalWeight-1), if < hitWeight → drop item.
 *   Accumulate across all ticks.
 *   VERIFIED: HAR Call #2 shows items 134 (超神水) and 136 (能量石) from random drops.
 *
 * ── LEVEL-UP CASCADE ──
 *   After EXP gain, check userUpgrade.json[level].expNeeded.
 *   userUpgrade["N"].expNeeded = total cumulative EXP threshold for level N.
 *   While currentExp >= threshold → increment level.
 *   Cap at constant[1].maxUserLevel (300).
 *   Send new level as item 104 in _changeInfo._items.
 *   VERIFIED: HAR Call #1 shows "104": {"_id": 104, "_num": 4} (level 4).
 *
 * ── FIRST-TIME BONUS ──
 *   idleAwardFirst.json entries applied when hangup._firstGain !== true.
 *   After applying, set _firstGain = true.
 *
 * ── DATA PATHS ──
 *   userData.hangup._lastGainTime       — timestamp of last gain
 *   userData.hangup._curLess            — current lesson ID (e.g., 10101)
 *   userData.hangup._firstGain          — boolean, first-time idle bonus flag
 *   userData.hangup._clickGlobalWarBuffTag — string
 *   userData.user._attribute._items[106]._num — VIP level (PLAYERVIPLEVELID)
 *   userData.totalProps._items[itemId]._num  — item totals (NEW TOTALS after gain)
 *   userData.user._attribute._items[itemId]._num — currency/attribute totals
 *   userData.globalWarBuff              — global war buff multiplier (top-level)
 *   userData.globalWarBuffEndTime       — global war buff end time (top-level)
 *
 * ── CURRENCY IDS ──
 *   101 = DIAMOND, 102 = GOLD, 103 = EXP, 104 = LEVEL
 *   106 = VIP LEVEL, 131 = EXP CAPSULE, 132 = EVOLVE CAPSULE
 *
 * ═══════════════════════════════════════════════════════════════
 * STRICT RULES: NO STUB, OVERRIDE, FORCE, BYPASS, DUMMY, ASUMSI
 * All reward values from lesson.json config + calculated formulas.
 * _changeInfo._items uses NEW TOTALS (current + reward), not deltas.
 * Keys are item ID strings, NOT sequential indices.
 * ═══════════════════════════════════════════════════════════════
 */

// ─── Currency/Attribute IDs ───
const DIAMONDID = 101;
const GOLDID = 102;
const PLAYEREXPERIENCEID = 103;
const PLAYERLEVELID = 104;
const PLAYERVIPLEVELID = 106;

function handleHangupGain(request, ctx) {
    const { userId } = request;

    // ═══════════════════════════════════════════════════════════════
    // STEP 1: Validate request
    // ═══════════════════════════════════════════════════════════════
    ctx.logger.step(1, 8, 'Validate request', 'running');
    ctx.logger.details('request',
        ['userId', userId ? userId.substring(0, 20) : 'MISSING'],
        ['version', String(request.version || '(none)')]
    );

    if (!userId) {
        ctx.logger.step(1, 8, 'Validate request', 'fail', 'userId MISSING');
        return ctx.buildErrorResponse(8);
    }

    ctx.logger.step(1, 8, 'Validate request', 'pass');

    // ═══════════════════════════════════════════════════════════════
    // STEP 2: Load user data + resources
    // ═══════════════════════════════════════════════════════════════
    ctx.logger.step(2, 8, 'Load data', 'running');

    const userData = ctx.db.getUser(userId);
    if (!userData) {
        ctx.logger.step(2, 8, 'Load data', 'fail', 'userData NOT FOUND in DB');
        return ctx.buildErrorResponse(8);
    }

    // Deep clone to prevent mutating DB cache directly
    var user;
    try {
        user = JSON.parse(JSON.stringify(userData));
    } catch (err) {
        ctx.logger.log('ERROR', 'HANGUP-GAIN', 'Deep clone failed: ' + err.message);
        return ctx.buildErrorResponse(1);
    }

    // Load resource configs
    const lessonData = ctx.loadResource('lesson');
    if (!lessonData) {
        ctx.logger.step(2, 8, 'Load data', 'fail', 'lesson.json NOT FOUND');
        return ctx.buildErrorResponse(1);
    }

    const constant = ctx.constantJson;
    const idleAwardEveryTime = (constant && constant['1'] && constant['1'].idleAwardEveryTime) || 300;
    const defaultIdleMaxTime = (constant && constant['1'] && constant['1'].idle) || 28800;
    const maxUserLevel = (constant && constant['1'] && constant['1'].maxUserLevel) || 300;

    const idleVipPlusData = ctx.loadResource('idleVipPlus') || {};
    const idleAwardFirstData = ctx.loadResource('idleAwardFirst') || {};
    const lessonIdleAwardData = ctx.loadResource('lessonIdleAward') || {};
    const userUpgradeData = ctx.loadResource('userUpgrade') || {};

    ctx.logger.step(2, 8, 'Load data', 'pass',
        'lesson=' + Object.keys(lessonData).length +
        ', everyTime=' + idleAwardEveryTime + 's' +
        ', maxIdle=' + defaultIdleMaxTime + 's' +
        ', maxLevel=' + maxUserLevel +
        ', firstBonus=' + Object.keys(idleAwardFirstData).length +
        ', idleAwardKeys=' + Object.keys(lessonIdleAwardData).length +
        ', upgradeLevels=' + Object.keys(userUpgradeData).length);

    // ═══════════════════════════════════════════════════════════════
    // STEP 3: Calculate idle time elapsed (capped at idleMaxTime)
    // ═══════════════════════════════════════════════════════════════
    ctx.logger.step(3, 8, 'Calculate idle time', 'running');

    const hangup = user.hangup || {};
    const lastGainTime = hangup._lastGainTime || 0;
    const now = Date.now();

    // If _lastGainTime is 0 or missing, this is first gain — no elapsed time
    let elapsedSeconds;
    if (!lastGainTime || lastGainTime <= 0) {
        elapsedSeconds = 0;
        ctx.logger.details('idle', ['lastGainTime', 'MISSING/0 — treating as first gain']);
    } else {
        elapsedSeconds = Math.floor((now - lastGainTime) / 1000);
        if (elapsedSeconds < 0) {
            elapsedSeconds = 0; // Guard against clock skew
        }
    }

    // Get VIP level from userData.user._attribute._items[PLAYERVIPLEVELID]
    const vipLevel = (user.user && user.user._attribute && user.user._attribute._items &&
        user.user._attribute._items[PLAYERVIPLEVELID])
        ? (user.user._attribute._items[PLAYERVIPLEVELID]._num || 0)
        : 0;

    // Get idleMaxTime from VIP config or fallback to default
    // L235034: o = a ? a.idleMaxTime : constant[1].idle
    const vipConfig = idleVipPlusData[String(vipLevel)];
    const idleMaxTime = (vipConfig && vipConfig.idleMaxTime) || defaultIdleMaxTime;

    // Cap elapsed time at idleMaxTime
    // L235037: n >= o && (n = o)
    if (elapsedSeconds > idleMaxTime) {
        elapsedSeconds = idleMaxTime;
    }

    // Calculate number of idle ticks (used for random drops)
    // L235037: exCount = floor(elapsed / idleAwardEveryTime)
    const exCount = Math.floor(elapsedSeconds / idleAwardEveryTime);

    ctx.logger.details('idle',
        ['lastGainTime', String(lastGainTime || '(none)')],
        ['now', String(now)],
        ['elapsedRaw', lastGainTime ? String(Math.floor((now - lastGainTime) / 1000) + 's') : 'N/A'],
        ['elapsedCapped', elapsedSeconds + 's (max ' + idleMaxTime + 's)'],
        ['exCount', String(exCount) + ' ticks (' + idleAwardEveryTime + 's each)'],
        ['vipLevel', String(vipLevel)]
    );
    ctx.logger.step(3, 8, 'Calculate idle time', 'pass',
        elapsedSeconds + 's, ' + exCount + ' ticks');

    // ═══════════════════════════════════════════════════════════════
    // EARLY RETURN: zero ticks — no rewards, just update timestamp
    // ═══════════════════════════════════════════════════════════════
    if (exCount <= 0) {
        if (!user.hangup) user.hangup = {};
        user.hangup._lastGainTime = now;
        ctx.db.saveUser(userId, user);

        ctx.logger.step(4, 8, 'Lesson config', 'skip', 'no ticks');
        ctx.logger.step(5, 8, 'Calculate rewards', 'skip', 'no ticks');
        ctx.logger.step(6, 8, 'Level-up cascade', 'skip', 'no ticks');
        ctx.logger.step(7, 8, 'Save & respond', 'running');

        // NOTE: Real server does NOT send _exCount (verified from 3 HAR captures)
        const zeroResponse = {
            _changeInfo: { _items: {} },
            _lastGainTime: now,
            _clickGlobalWarBuffTag: hangup._clickGlobalWarBuffTag || ''
        };

        ctx.logger.step(7, 8, 'Save & respond', 'pass', 'zero rewards');
        ctx.logger.responseSnapshot('HANGUP GAIN ret=0 (zero ticks)', zeroResponse);
        return ctx.buildDataResponse(0, zeroResponse);
    }

    // ═══════════════════════════════════════════════════════════════
    // STEP 4: Get lesson config & bonus multiplier
    // ═══════════════════════════════════════════════════════════════
    ctx.logger.step(4, 8, 'Lesson config & bonus', 'running');

    const curLess = hangup._curLess || 10101;
    const lessonConfig = lessonData[String(curLess)];

    if (!lessonConfig) {
        ctx.logger.step(4, 8, 'Lesson config & bonus', 'fail',
            'lesson ' + curLess + ' NOT FOUND in lesson.json');
        return ctx.buildErrorResponse(1);
    }

    // L92953-92973: VIP idle award bonus multiplier
    const idleAwardPlus = (vipConfig && vipConfig.idleAwardPlus) || 0;

    // L92963: Global war buff check
    // Server equivalent: check if globalWarBuffEndTime > now
    let globalWarBuff = 0;
    const globalWarBuffEndTime = user.globalWarBuffEndTime || 0;
    if (globalWarBuffEndTime > now) {
        globalWarBuff = user.globalWarBuff || 0;
    }

    // L92966: bonusMultiplier = idleAwardPlus + 1 + globalWarBuff
    const bonusMultiplier = idleAwardPlus + 1 + globalWarBuff;

    ctx.logger.details('bonus',
        ['curLess', String(curLess)],
        ['lessonName', lessonConfig.lessonName || lessonConfig.name || '?'],
        ['idleAwardPlus', String(idleAwardPlus)],
        ['globalWarBuff', String(globalWarBuff) + (globalWarBuffEndTime > now ? ' (ACTIVE)' : ' (inactive)')],
        ['bonusMultiplier', String(bonusMultiplier)]
    );
    ctx.logger.step(4, 8, 'Lesson config & bonus', 'pass',
        'lesson=' + curLess + ', mult=' + bonusMultiplier);

    // ═══════════════════════════════════════════════════════════════
    // STEP 5: Calculate all rewards
    //   5a: Deterministic idle rewards (lesson.json idleReward1-4)
    //   5b: Random drops (lessonIdleAward.json, per tick per group)
    //   5c: First-time idle bonus (idleAwardFirst.json)
    // ═══════════════════════════════════════════════════════════════
    ctx.logger.step(5, 8, 'Calculate rewards', 'running');

    // ── Item total management helpers ──
    // changeItems tracks all modified items: itemId (number) → newTotal (number)
    // Response uses item ID string keys: changeItems["102"] = { _id: 102, _num: newTotal }
    const changeItems = {};

    /**
     * Get current total for an item from live user data.
     * Reads from totalProps first, then _attribute as fallback.
     */
    function getItemTotal(itemId) {
        if (user.totalProps && user.totalProps._items && user.totalProps._items[itemId]) {
            return user.totalProps._items[itemId]._num || 0;
        }
        if (user.user && user.user._attribute && user.user._attribute._items &&
            user.user._attribute._items[itemId]) {
            return user.user._attribute._items[itemId]._num || 0;
        }
        return 0;
    }

    /**
     * Apply a reward amount to an item.
     * Updates totalProps and _attribute, tracks change in changeItems.
     * IMPORTANT: Reads latest total from live data (not snapshot),
     * so multiple calls for the same item accumulate correctly.
     */
    function applyItemReward(itemId, amount) {
        if (!amount || amount === 0) return;

        var currentNum = getItemTotal(itemId);
        var newTotal = currentNum + amount;

        // Update totalProps
        if (!user.totalProps) user.totalProps = { _items: {} };
        if (!user.totalProps._items) user.totalProps._items = {};
        user.totalProps._items[itemId] = { _id: itemId, _num: newTotal };

        // Update _attribute if item already exists there
        if (user.user && user.user._attribute && user.user._attribute._items &&
            user.user._attribute._items[itemId]) {
            user.user._attribute._items[itemId]._num = newTotal;
        }

        // Track in changeItems (overwrite with latest newTotal)
        changeItems[itemId] = newTotal;
    }

    // ── 5a: Deterministic idle rewards ──
    // FIXED: rewardNum is PER-SECOND rate.
    // Total = Math.floor(rewardNum × elapsedSeconds × bonusMultiplier)
    // NOT: rewardNum × bonusMultiplier × exCount (was off by 300x)
    var detRewardLog = [];
    for (var ri = 1; ri <= 4; ri++) {
        var rewId = lessonConfig['idleReward' + ri];
        var rewNum = lessonConfig['rewardNum' + ri];
        if (rewId && rewNum) {
            var totalReward = Math.floor(rewNum * elapsedSeconds * bonusMultiplier);
            if (totalReward > 0) {
                applyItemReward(rewId, totalReward);
                detRewardLog.push('id=' + rewId + ' +' + totalReward +
                    ' (' + rewNum + '/s x ' + elapsedSeconds + 's x ' + bonusMultiplier + ')');
            }
        }
    }

    if (detRewardLog.length > 0) {
        for (var dl = 0; dl < detRewardLog.length; dl++) {
            ctx.logger.details('detReward', [detRewardLog[dl]]);
        }
    } else {
        ctx.logger.log('WARN', 'HANGUP-GAIN',
            'lesson ' + curLess + ' has NO idleReward/rewardNum entries');
    }

    // ── 5b: Random drops from lessonIdleAward.json ──
    // Per tick per group: roll probability, accumulate drops.
    // lesson.json[idleRandomAward] → key in lessonIdleAward.json
    var randomDropLog = [];
    var randomAwardKey = lessonConfig.idleRandomAward;
    var awardTable = randomAwardKey ? lessonIdleAwardData[String(randomAwardKey)] : null;

    if (awardTable && awardTable.length > 0) {
        // Pre-process: build group roll configs
        // Each group has 2 entries: hit (award != "") and miss (award == "")
        var groups = {};
        for (var ai = 0; ai < awardTable.length; ai++) {
            var aEntry = awardTable[ai];
            var gid = aEntry.group;
            if (!groups[gid]) groups[gid] = [];
            groups[gid].push(aEntry);
        }

        var groupConfigs = [];
        for (var gk in groups) {
            if (!groups.hasOwnProperty(gk)) continue;
            var gEntries = groups[gk];
            var hitE = null, missE = null;
            for (var ge = 0; ge < gEntries.length; ge++) {
                if (gEntries[ge].award && gEntries[ge].award !== '') {
                    hitE = gEntries[ge];
                } else {
                    missE = gEntries[ge];
                }
            }
            if (hitE && missE) {
                var totalWeight = (hitE.random || 0) + (missE.random || 0);
                if (totalWeight > 0) {
                    groupConfigs.push({
                        awardId: Number(hitE.award),
                        num: Number(hitE.num) || 1,
                        hitWeight: hitE.random || 0,
                        totalWeight: totalWeight
                    });
                }
            }
        }

        // Roll per tick per group
        if (groupConfigs.length > 0) {
            var randomDrops = {}; // itemId → accumulated drop count
            for (var tick = 0; tick < exCount; tick++) {
                for (var gc = 0; gc < groupConfigs.length; gc++) {
                    var cfg = groupConfigs[gc];
                    var roll = Math.floor(Math.random() * cfg.totalWeight);
                    if (roll < cfg.hitWeight) {
                        randomDrops[cfg.awardId] = (randomDrops[cfg.awardId] || 0) + cfg.num;
                    }
                }
            }

            // Apply random drops to user data
            var randomDropItemIds = Object.keys(randomDrops);
            for (var di = 0; di < randomDropItemIds.length; di++) {
                var dropId = Number(randomDropItemIds[di]);
                var dropAmount = randomDrops[dropId];
                if (dropAmount > 0) {
                    applyItemReward(dropId, dropAmount);
                    randomDropLog.push('id=' + dropId + ' +' + dropAmount);
                }
            }
        }
    }

    if (randomDropLog.length > 0) {
        for (var rl = 0; rl < randomDropLog.length; rl++) {
            ctx.logger.details('randDrop', [randomDropLog[rl]]);
        }
    }

    // ── 5c: First-time idle bonus ──
    var firstBonusLog = [];
    var isFirstGain = !(hangup._firstGain === true);
    var firstBonusEntries = Object.keys(idleAwardFirstData).length;

    if (isFirstGain && firstBonusEntries > 0) {
        for (var fbKey in idleAwardFirstData) {
            if (!idleAwardFirstData.hasOwnProperty(fbKey)) continue;
            var fbEntry = idleAwardFirstData[fbKey];
            var fbAwardId = fbEntry.award;
            var fbAwardNum = fbEntry.num;
            if (fbAwardId && fbAwardNum) {
                applyItemReward(fbAwardId, fbAwardNum);
                firstBonusLog.push('id=' + fbAwardId + ' +' + fbAwardNum);
            }
        }

        // Mark first gain as claimed
        if (!user.hangup) user.hangup = {};
        user.hangup._firstGain = true;
    }

    if (firstBonusLog.length > 0) {
        for (var fl = 0; fl < firstBonusLog.length; fl++) {
            ctx.logger.details('firstBonus', [firstBonusLog[fl]]);
        }
    }

    ctx.logger.step(5, 8, 'Calculate rewards', 'pass',
        'deterministic=' + detRewardLog.length +
        ', randomDrops=' + randomDropLog.length +
        ', firstBonus=' + firstBonusLog.length +
        ', totalItems=' + Object.keys(changeItems).length);

    // ═══════════════════════════════════════════════════════════════
    // STEP 6: Level-up cascade (userUpgrade.json)
    // ═══════════════════════════════════════════════════════════════
    ctx.logger.step(6, 8, 'Level-up cascade', 'running');

    var levelChanged = false;
    var oldLevel = 0;
    var newLevel = 0;

    // Only check if EXP (103) was gained and userUpgrade data exists
    if (changeItems[PLAYEREXPERIENCEID] !== undefined && Object.keys(userUpgradeData).length > 0) {
        // Get current level from user attributes
        var currentLevel = 1;
        if (user.user && user.user._attribute && user.user._attribute._items &&
            user.user._attribute._items[PLAYERLEVELID]) {
            currentLevel = user.user._attribute._items[PLAYERLEVELID]._num || 1;
        }

        var newExpTotal = changeItems[PLAYEREXPERIENCEID];
        oldLevel = currentLevel;

        // userUpgrade.json: key = level number, expNeeded = cumulative EXP threshold
        // Level 1: expNeeded 60 → at 60+ exp you are at least level 2
        // Level 2: expNeeded 150 → at 150+ exp you are at least level 3
        while (currentLevel < maxUserLevel) {
            var lvlConfig = userUpgradeData[String(currentLevel)];
            if (lvlConfig && newExpTotal >= lvlConfig.expNeeded) {
                currentLevel++;
            } else {
                break;
            }
        }

        newLevel = currentLevel;
        if (newLevel > oldLevel) {
            levelChanged = true;

            // Update level in _attribute
            if (user.user && user.user._attribute && user.user._attribute._items &&
                user.user._attribute._items[PLAYERLEVELID]) {
                user.user._attribute._items[PLAYERLEVELID]._num = newLevel;
            }

            // Update level in totalProps if it exists there
            if (user.totalProps && user.totalProps._items &&
                user.totalProps._items[PLAYERLEVELID]) {
                user.totalProps._items[PLAYERLEVELID]._num = newLevel;
            }

            // Add level to changeItems (so client receives it)
            changeItems[PLAYERLEVELID] = newLevel;

            ctx.logger.details('levelUp',
                ['oldLevel', String(oldLevel)],
                ['newLevel', String(newLevel)],
                ['levelsGained', String(newLevel - oldLevel)],
                ['expTotal', String(newExpTotal)]
            );
        }
    } else {
        if (changeItems[PLAYEREXPERIENCEID] === undefined) {
            ctx.logger.details('levelUp', ['skip', 'no EXP gained']);
        } else if (Object.keys(userUpgradeData).length === 0) {
            ctx.logger.details('levelUp', ['skip', 'userUpgrade.json empty']);
        }
    }

    ctx.logger.step(6, 8, 'Level-up cascade', 'pass',
        levelChanged ? 'LEVELED UP ' + oldLevel + ' -> ' + newLevel : 'no change');

    // ═══════════════════════════════════════════════════════════════
    // STEP 7: Update _lastGainTime, save to DB
    // ═══════════════════════════════════════════════════════════════
    ctx.logger.step(7, 8, 'Save & respond', 'running');

    if (!user.hangup) user.hangup = {};
    user.hangup._lastGainTime = now;

    ctx.db.saveUser(userId, user);

    ctx.logger.saveVerify(userId, ctx.db, user, [
        'hangup._lastGainTime',
        'hangup._firstGain',
        'totalProps._items'
    ]);
    ctx.logger.step(7, 8, 'Save & respond', 'pass');

    // ═══════════════════════════════════════════════════════════════
    // STEP 8: Build response
    // ═══════════════════════════════════════════════════════════════
    ctx.logger.step(8, 8, 'Build response', 'running');

    // Build _changeInfo._items with ITEM ID string keys
    // HAR verified: keys are "102", "103", etc. — NOT "0", "1", "2"
    var responseItems = {};
    for (var cKey in changeItems) {
        if (!changeItems.hasOwnProperty(cKey)) continue;
        responseItems[String(cKey)] = {
            _id: Number(cKey),
            _num: changeItems[cKey]
        };
    }

    // NOTE: _exCount is NOT included in response.
    // Verified from 3 HAR captures — real server never sends _exCount.
    // Client reads t._exCount at L234004 but handles undefined gracefully.
    var responseData = {
        _changeInfo: { _items: responseItems },
        _lastGainTime: now,
        _clickGlobalWarBuffTag: hangup._clickGlobalWarBuffTag || ''
    };

    // ── Mutation log for key currencies ──
    var mutationPairs = [
        [GOLDID, 'GOLD'],
        [PLAYEREXPERIENCEID, 'EXP']
    ];
    for (var mi = 0; mi < mutationPairs.length; mi++) {
        var mId = mutationPairs[mi][0];
        var mName = mutationPairs[mi][1];
        var mOld = userData.totalProps && userData.totalProps._items &&
            userData.totalProps._items[mId] ? (userData.totalProps._items[mId]._num || 0) : 0;
        var mNew = changeItems[mId];
        if (mNew !== undefined && mNew !== mOld) {
            ctx.logger.mutationLog({
                field: 'totalProps._items[' + mId + '] (' + mName + ')',
                before: mOld,
                after: mNew,
                unit: mName.toLowerCase(),
                context: 'IDLE-GAIN'
            });
        }
    }

    ctx.logger.step(8, 8, 'Build response', 'pass',
        Object.keys(responseItems).length + ' items' +
        (levelChanged ? ', LEVEL UP ' + oldLevel + '->' + newLevel : ''));

    // ═══════════════════════════════════════════════════════════════
    // TYPE ASSERTIONS & INVARIANT CHECKS
    // ═══════════════════════════════════════════════════════════════

    ctx.logger.typeAssert('responseData._lastGainTime', responseData._lastGainTime, 'number', {
        context: 'HANGUP-GAIN',
        trace: 'L235034: GetTimeLeft2BySecond()',
        impact: 'Wrong type -> countdown display broken'
    });

    ctx.logger.typeAssert('responseData._changeInfo._items', responseData._changeInfo._items, 'object', {
        context: 'HANGUP-GAIN',
        trace: 'L233992: getBattleAwardItems iterates _changeInfo._items',
        impact: 'Wrong type -> client cannot read rewards'
    });

    ctx.logger.invariantCheck(
        'Positive exCount produces reward items',
        exCount > 0 ? Object.keys(changeItems).length > 0 : true,
        {
            context: 'HANGUP-GAIN',
            expect: 'changeItems has entries when exCount > 0',
            actual: 'changeItems count = ' + Object.keys(changeItems).length + ', exCount = ' + exCount,
            trace: 'lesson.json idleReward1-4 + rewardNum1-4',
            impact: 'Player waited for idle rewards but gets NOTHING'
        }
    );

    ctx.logger.invariantCheck(
        '_changeInfo._items keys are item IDs not indices',
        Object.keys(responseItems).every(function(k) { return k === String(Number(k)); }),
        {
            context: 'HANGUP-GAIN',
            expect: 'Keys are item ID strings like "102", "103"',
            actual: 'Keys: ' + Object.keys(responseItems).join(', '),
            trace: 'HAR verified: real server uses item ID keys',
            impact: 'Sequential keys -> client misreads reward items'
        }
    );

    ctx.logger.invariantCheck(
        '_changeInfo._items values are NEW TOTALS not deltas',
        true,
        {
            context: 'HANGUP-GAIN',
            expect: '_num = currentTotal + accumulatedReward',
            actual: 'verified: applyItemReward adds to current total',
            trace: 'L233992: getBattleAwardItems reads _num as authoritative total',
            impact: 'Sending deltas -> client overwrites totals -> item loss'
        }
    );

    ctx.logger.invariantCheck(
        'First gain sets _firstGain = true',
        isFirstGain && firstBonusEntries > 0 ? user.hangup._firstGain === true : true,
        {
            context: 'HANGUP-GAIN',
            expect: 'hangup._firstGain = true after first gain',
            actual: 'hangup._firstGain = ' + String(user.hangup._firstGain),
            trace: 'Prevents double-claiming idleAwardFirst bonus',
            impact: 'Player could claim first-time bonus multiple times'
        }
    );

    ctx.logger.invariantCheck(
        '_lastGainTime updated to now',
        user.hangup._lastGainTime === now,
        {
            context: 'HANGUP-GAIN',
            expect: 'hangup._lastGainTime = now',
            actual: 'hangup._lastGainTime = ' + String(user.hangup._lastGainTime),
            trace: 'Resets idle timer for next gain',
            impact: 'Stale _lastGainTime -> double-reward or zero-reward'
        }
    );

    // ═══════════════════════════════════════════════════════════════
    // SUMMARY
    // ═══════════════════════════════════════════════════════════════

    ctx.logger.responseSnapshot('HANGUP GAIN ret=0', responseData);

    ctx.logger.summaryCard({
        title: 'HANGUP GAIN',
        userId: userId,
        elapsed: elapsedSeconds + 's',
        ticks: exCount,
        items: Object.keys(changeItems).length,
        lesson: curLess,
        vipLevel: vipLevel,
        bonusMultiplier: bonusMultiplier,
        detRewards: detRewardLog.length,
        randomDrops: randomDropLog.length,
        firstBonus: firstBonusLog.length,
        levelUp: levelChanged ? (oldLevel + '->' + newLevel) : 'none'
    });

    return ctx.buildDataResponse(0, responseData);
}

module.exports = handleHangupGain;
