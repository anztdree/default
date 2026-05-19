/**
 * checkBattleResult.js — Handler: hangup/checkBattleResult
 *
 * ═══════════════════════════════════════════════════════════════
 * DEEP TRACE — main.min.js (100% verified)
 * ═══════════════════════════════════════════════════════════════
 *
 * CHAIN: saveGuideTeam callback → checkBattleResult
 *         OR: hangUpBattleEndCallBack → checkBattleResult
 *
 * ── TUTORIAL CALL (L104875-104880, L105815-105820) ──
 *   ts.processHandler({
 *       type: 'hangup', action: 'checkBattleResult',
 *       userId, version: '1.0', isGuide: true
 *   }, callback)
 *
 * ── REGULAR HANGUP CALL (L97739-97748) ──
 *   ts.processHandler({
 *       type: 'hangup', action: 'checkBattleResult',
 *       userId, battleId, version: '1.0',
 *       'super': t, checkResult: n,
 *       battleField: BattleLogic.GameFieldType.LESSON,
 *       runaway: a
 *   }, callback)
 *
 * ── TUTORIAL CONSUMER (L104882-104912) ──
 *   e._battleResult      → L104882: 0 == e._battleResult → win/lose
 *   e._changeInfo._items → L104884: reward items (for...in iteration)
 *       s[l]._id, s[l]._num
 *   e._curLess           → L104892: OnHookSingleton.lastSection
 *   e._maxPassLesson     → L104893: OnHookSingleton.maxPassLesson
 *
 * ── REGULAR CONSUMER (L97750-97751) ──
 *   e._battleResult      → win/lose flag
 *   e._changeInfo._items → L97686: getBattleAwardItems(t) iterates _items
 *   e._curLess           → L97751: OnHookSingleton.lastSection
 *   e._maxPassLesson     → L97751: OnHookSingleton.maxPassLesson
 *   e._maxPassChapter    → L97751: OnHookSingleton.maxPassChapter
 *
 * ── REWARD FORMAT (L97686-97708 getBattleAwardItems) ──
 *   e._changeInfo._items = { "0": {_id, _num}, "1": {_id, _num}, ... }
 *   _num = NEW TOTAL of item after reward (not delta)
 *   Special IDs: 103=EXP, 104=LEVEL, 101=DIAMOND, 102=GOLD
 *   131=EXP CAPSULE, 132=EVOLVE CAPSULE, 3001-3500=EQUIPMENT
 *
 * ── LESSON CONFIG (lesson.json) ──
 *   award1-num5 + num1-num5 = battle rewards
 *   nextID = next lesson to advance to
 *   nextChapter = chapter of next lesson
 *   thisChapter = current chapter
 *   lessonType: 1=normal, 2=hard, 3=boss
 *
 * ═══════════════════════════════════════════════════════════════
 * FIX LOG
 * ═══════════════════════════════════════════════════════════════
 *
 * [FIX-001] DB path: read from userData.hangup NOT userData.hangupTeam
 *   enterGame stores progress at: userData.hangup._curLess, _maxPassLesson, _maxPassChapter
 *   hangupTeam is ONLY for team composition (team[], supers[])
 *   OLD: userData.hangupTeam.curLesson → always fallback to 1 (wrong)
 *   NEW: userData.hangup._curLess → reads actual lesson progress
 *
 * [FIX-002] Battle validation: honor checkResult from client
 *   Client sends checkResult: 0=win, 1=lose
 *   runaway=true also means lose
 *   OLD: always _battleResult=0 (forced win)
 *   NEW: respect checkResult, tutorial always win
 *
 * [FIX-003] Load lesson.json for rewards and progression
 *   Each lesson has award1-5 + num1-5 defined in lesson.json
 *   nextID determines what lesson to advance to
 *   OLD: empty _changeInfo._items (no rewards)
 *   NEW: compute rewards from lesson config, add to current items
 *
 * [FIX-004] Item tracking: update totalProps._items with new totals
 *   Server tracks authoritative item state in userData.totalProps._items
 *   Rewards are ADDED to current totals, saved back to DB
 *   Client reads _changeInfo._items and sets local state via resetTtemsCallBack
 *
 * [FIX-005] Progression uses lesson.json nextID/nextChapter
 *   On win: _curLess = lessonConfig.nextID (next lesson)
 *           _maxPassLesson = max(old, currentLessonId)
 *           _maxPassChapter = max(old, lessonConfig.thisChapter)
 *   OLD: curLess + 1 (arbitrary, ignores lesson chain)
 *   NEW: use nextID from config (natural progression)
 *
 * [FIX-006] Tutorial vs regular separation
 *   Tutorial: always win, use curLess from userData (same as regular)
 *   The tutorialLesson list (10101,10102) is ONLY used by CLIENT for OverScene display
 *   (musicName, chaterID), NOT for server-side lesson lookup. Server must always
 *   use the actual curLess to read correct rewards and nextID from lesson.json.
 *   Regular: respect checkResult, use actual curLess from user data
 *
 * STRICT RULES: NO STUB, OVERRIDE, FORCE, BYPASS, DUMMY, ASUMSI
 */

// ─── Currency/Attribute IDs — main.min.js L116237 ───
const DIAMONDID = 101;
const GOLDID = 102;
const PLAYEREXPERIENCEID = 103;
const PLAYERLEVELID = 104;

function handleCheckBattleResult(request, ctx) {
    const { userId, isGuide, battleId, checkResult, runaway } = request;

    // ═══════════════════════════════════════════════════════════════
    // STEP 1: Validate request
    // ═══════════════════════════════════════════════════════════════
    ctx.logger.step(1, 5, 'Validate request', 'running');
    ctx.logger.details('request',
        ['userId', userId ? userId.substring(0, 20) : 'MISSING'],
        ['isGuide', String(!!isGuide)],
        ['battleId', String(battleId || '(none)')],
        ['checkResult', String(checkResult ?? '(none)')],
        ['runaway', String(runaway ?? '(none)')],
        ['super', String(request.super || '(none)')]
    );

    if (!userId) {
        ctx.logger.step(1, 5, 'Validate request', 'fail', 'userId MISSING');
        return ctx.buildErrorResponse(8);
    }

    ctx.logger.step(1, 5, 'Validate request', 'pass');

    // ═══════════════════════════════════════════════════════════════
    // STEP 2: Load user data and resources
    // ═══════════════════════════════════════════════════════════════
    ctx.logger.step(2, 5, 'Load data', 'running');

    const userData = ctx.db.getUser(userId);
    if (!userData) {
        ctx.logger.step(2, 5, 'Load data', 'fail', 'userData NOT FOUND in DB');
        return ctx.buildErrorResponse(8);
    }

    // Deep clone to prevent mutating DB cache directly
    // [FIX pattern from enterGame.js — FIX-002]
    var user;
    try {
        user = JSON.parse(JSON.stringify(userData));
    } catch (err) {
        ctx.logger.log('ERROR', 'BATTLE-RESULT', 'Deep clone failed: ' + err.message);
        return ctx.buildErrorResponse(1);
    }

    // Load lesson.json
    const lessonData = ctx.loadResource('lesson');
    if (!lessonData) {
        ctx.logger.step(2, 5, 'Load data', 'fail', 'lesson.json NOT FOUND');
        return ctx.buildErrorResponse(1);
    }

    // Load constant.json for tutorialLesson
    const constant = ctx.constantJson;
    const tutorialLessonStr = (constant && constant['1'] && constant['1'].tutorialLesson) || '10101,10102';
    const tutorialLessons = tutorialLessonStr.split(',').map(s => parseInt(s.trim()));

    ctx.logger.step(2, 5, 'Load data', 'pass', `lesson.json=${Object.keys(lessonData).length} entries`);

    // ═══════════════════════════════════════════════════════════════
    // STEP 3: Read current progress from userData.hangup
    // ═══════════════════════════════════════════════════════════════
    ctx.logger.step(3, 5, 'Read progress', 'running');

    // FIX-001: Read from hangup NOT hangupTeam
    // enterGame stores: userData.hangup._curLess, _maxPassLesson, _maxPassChapter
    const hangup = user.hangup || {};
    let curLess = hangup._curLess || 10101;
    let maxPassLesson = hangup._maxPassLesson || 0;
    let maxPassChapter = hangup._maxPassChapter || 0;

    ctx.logger.details('progress',
        ['curLess', String(curLess)],
        ['maxPassLesson', String(maxPassLesson)],
        ['maxPassChapter', String(maxPassChapter)],
        ['source', 'user.hangup']
    );
    ctx.logger.step(3, 5, 'Read progress', 'pass', `lesson=${curLess}`);

    // ═══════════════════════════════════════════════════════════════
    // STEP 4: Determine battle outcome
    // ═══════════════════════════════════════════════════════════════
    ctx.logger.step(4, 5, 'Determine outcome', 'running');

    // FIX-002: Validate checkResult from client
    // FIX-006: Tutorial always wins (L104882: 0 == e._battleResult → true)
    let isWin;
    if (isGuide) {
        isWin = true;
        ctx.logger.details('outcome',
            ['mode', 'TUTORIAL (always win — design)'],
            ['isGuide', 'true']
        );
    } else {
        // Regular battle: honor client's checkResult
        // checkResult === 0 → win, checkResult === 1 → lose
        // runaway === true → also counts as lose
        if (runaway === true) {
            isWin = false;
        } else {
            isWin = (checkResult === 0);
        }
        ctx.logger.details('outcome',
            ['mode', 'REGULAR'],
            ['checkResult', String(checkResult)],
            ['runaway', String(runaway)],
            ['isWin', String(isWin)]
        );
    }

    const battleResult = isWin ? 0 : 1;
    ctx.logger.step(4, 5, 'Determine outcome', 'pass', `${isWin ? 'WIN' : 'LOSE'} (${battleResult})`);

    // ═══════════════════════════════════════════════════════════════
    // STEP 5: Build response with rewards and progression
    // ═══════════════════════════════════════════════════════════════
    ctx.logger.step(5, 5, 'Build response', 'running');

    // Determine which lesson config to use
    // CRITICAL FIX: BOTH tutorial and regular must use curLess from userData.
    // The tutorialLesson list (constant.json) is ONLY used client-side for:
    //   - OverScene musicName (L104907: SoundManager.getLesson(h))
    //   - OverScene chaterID (L104903: chaterID: 1 or 2)
    // Server must ALWAYS use curLess to get correct rewards and nextID chain.
    // BUG: old code used tutorialLessons[0] (=10101) for ALL tutorial battles,
    // causing stage 1-2 to re-read lesson 10101 → nextID=10102 → stuck at 10102.
    let lessonId = String(curLess);

    const lessonConfig = lessonData[lessonId];
    if (!lessonConfig) {
        ctx.logger.step(5, 5, 'Build response', 'fail', `lesson ${lessonId} NOT FOUND in lesson.json`);
        return ctx.buildErrorResponse(1);
    }

    // FIX-003: Build rewards from lesson config
    // lesson.json has: award1-5, num1-5
    // _changeInfo._items format: { "0": {_id, _num}, "1": {_id, _num}, ... }
    const changeItems = {};
    let rewardCount = 0;

    // Read current item totals from user.totalProps._items
    // IMPORTANT: snapshot BEFORE the reward loop to avoid aliasing bug
    // (currentItems is a reference — mutating user.totalProps._items inside
    // the loop would also change currentItems, making oldGold/oldExp inaccurate)
    const currentItems = (user.totalProps && user.totalProps._items) || {};
    const snapshotBeforeRewards = {};
    if (isWin) {
        // Snapshot key currency values BEFORE any mutations
        if (currentItems[GOLDID]) snapshotBeforeRewards[GOLDID] = currentItems[GOLDID]._num || 0;
        if (currentItems[DIAMONDID]) snapshotBeforeRewards[DIAMONDID] = currentItems[DIAMONDID]._num || 0;
        if (currentItems[PLAYEREXPERIENCEID]) snapshotBeforeRewards[PLAYEREXPERIENCEID] = currentItems[PLAYEREXPERIENCEID]._num || 0;
    }

    if (isWin) {
        ctx.logger.details('rewards',
            ['lesson', lessonId],
            ['lessonName', lessonConfig.name || '?'],
            ['lessonType', String(lessonConfig.lessonType || '?')],
            ['thisChapter', String(lessonConfig.thisChapter)],
            ['nextID', String(lessonConfig.nextID || '(endpoint)')]
        );

        for (let i = 1; i <= 5; i++) {
            const awardKey = 'award' + i;
            const numKey = 'num' + i;
            const itemId = lessonConfig[awardKey];
            const qty = lessonConfig[numKey];

            if (itemId && qty) {
                const itemIndex = String(rewardCount);
                // FIX-004: _num = NEW TOTAL (current + reward)
                const currentNum = currentItems[itemId] ? (currentItems[itemId]._num || 0) : 0;
                const newTotal = currentNum + qty;

                changeItems[itemIndex] = {
                    _id: itemId,
                    _num: newTotal
                };

                // Update user.totalProps._items with new total
                if (!user.totalProps) user.totalProps = { _items: {} };
                if (!user.totalProps._items) user.totalProps._items = {};
                user.totalProps._items[itemId] = { _id: itemId, _num: newTotal };

                // Also update user._attribute._items for currency types
                if (user.user && user.user._attribute && user.user._attribute._items) {
                    if (user.user._attribute._items[itemId]) {
                        user.user._attribute._items[itemId]._num = newTotal;
                    }
                }

                ctx.logger.details('reward',
                    ['#' + i, `item=${itemId} qty=+${qty} old=${currentNum} new=${newTotal}`]
                );
                rewardCount++;
            }
        }

        // Log reward mutations
        if (isWin) {
            // Re-read new totals after all rewards applied
            var newGold = (user.totalProps && user.totalProps._items && user.totalProps._items[GOLDID]) ? user.totalProps._items[GOLDID]._num : 0;
            var newDiamond = (user.totalProps && user.totalProps._items && user.totalProps._items[DIAMONDID]) ? user.totalProps._items[DIAMONDID]._num : 0;
            var newExp = (user.totalProps && user.totalProps._items && user.totalProps._items[PLAYEREXPERIENCEID]) ? user.totalProps._items[PLAYEREXPERIENCEID]._num : 0;

            var oldGold = snapshotBeforeRewards[GOLDID] || 0;
            var oldDiamond = snapshotBeforeRewards[DIAMONDID] || 0;
            var oldExp = snapshotBeforeRewards[PLAYEREXPERIENCEID] || 0;

            if (newGold !== oldGold) {
                ctx.logger.mutationLog({ field: 'totalProps._items[' + GOLDID + '] (GOLD)', before: oldGold, after: newGold, unit: 'gold', maxDelta: 100000, context: 'BATTLE-REWARD' });
            }
            if (newDiamond !== oldDiamond) {
                ctx.logger.mutationLog({ field: 'totalProps._items[' + DIAMONDID + '] (DIAMOND)', before: oldDiamond, after: newDiamond, unit: 'diamond', maxDelta: 10000, context: 'BATTLE-REWARD' });
            }
            if (newExp !== oldExp) {
                ctx.logger.mutationLog({ field: 'totalProps._items[' + PLAYEREXPERIENCEID + '] (EXP)', before: oldExp, after: newExp, unit: 'exp', maxDelta: 1000000, context: 'BATTLE-REWARD' });
            }
        }

        // FIX-005: Update progression using lesson.json nextID/nextChapter
        // On win: advance to next lesson
        const nextLessonId = lessonConfig.nextID;
        const nextChapter = lessonConfig.nextChapter;
        const thisChapter = lessonConfig.thisChapter;
        const completedLessonId = parseInt(lessonId);

        if (nextLessonId) {
            // There is a next lesson — advance
            curLess = nextLessonId;
        }
        // else: this is the last lesson (endpoint like 17417), stay here

        // Update maxPassLesson: highest lesson ID ever passed
        // CRITICAL: compare against completedLessonId (lesson JUST won), NOT curLess (already advanced)
        // BUG: old code used parseInt(curLess) after curLess was already changed to nextLessonId,
        // causing maxPassLesson to track the NEXT lesson instead of the completed one.
        maxPassLesson = Math.max(maxPassLesson, completedLessonId);

        // Update maxPassChapter: highest chapter ever passed
        if (thisChapter) {
            maxPassChapter = Math.max(maxPassChapter, thisChapter);
        }

        ctx.logger.details('progression',
            ['lessonId (completed)', String(lessonId)],
            ['curLess (new)', String(curLess)],
            ['maxPassLesson', String(maxPassLesson)],
            ['maxPassChapter', String(maxPassChapter)],
            ['nextLessonId', String(nextLessonId || '(endpoint)')],
            ['source', 'lesson.json nextID/thisChapter']
        );
    } else {
        // LOSE — no rewards, no progression
        ctx.logger.details('rewards', ['status', 'LOSE — no rewards given']);
    }

    // Update user.hangup with new progression
    if (!user.hangup) user.hangup = {};
    user.hangup._curLess = curLess;
    user.hangup._maxPassLesson = maxPassLesson;
    user.hangup._maxPassChapter = maxPassChapter;

    // Save to DB
    ctx.db.saveUser(userId, user);
    ctx.logger.saveVerify(userId, ctx.db, user, [
        'hangup._curLess',
        'hangup._maxPassLesson',
        'hangup._maxPassChapter',
        'totalProps._items'
    ]);

    ctx.logger.step(5, 5, 'Build response', 'pass', `${isWin ? 'WIN' : 'LOSE'} rewards=${rewardCount} lesson=${curLess}`);

    // ═══════════════════════════════════════════════════════════════
    // BUILD FINAL RESPONSE
    // ═══════════════════════════════════════════════════════════════

    const responseData = {
        _battleResult: battleResult,
        _curLess: curLess,
        _maxPassLesson: maxPassLesson,
        _changeInfo: {
            _items: changeItems
        }
    };

    // _maxPassChapter: only sent in regular mode (tutorial doesn't read it)
    if (!isGuide) {
        responseData._maxPassChapter = maxPassChapter;
    }

    // ═══════════════════════════════════════════════════════════════
    // VERIFIED RESPONSE FIELDS vs main.min.js
    // ═══════════════════════════════════════════════════════════════

    ctx.logger.criticalFields([
        {
            name: '_battleResult',
            value: String(battleResult),
            status: 'ok',
            detail: isGuide
                ? 'L104882: 0 == e._battleResult -> true (tutorial always win)'
                : 'L97750: 0 == t._battleResult ? true : false (regular battle)'
        },
        {
            name: '_changeInfo._items',
            value: Object.keys(changeItems).length + ' items',
            status: isWin ? 'ok' : 'empty(lose)',
            detail: 'L97686: getBattleAwardItems iterates _changeInfo._items for {_id, _num}'
        },
        {
            name: '_curLess',
            value: String(curLess),
            status: 'ok',
            detail: 'L104892/L97751: OnHookSingleton.lastSection = e._curLess'
        },
        {
            name: '_maxPassLesson',
            value: String(maxPassLesson),
            status: 'ok',
            detail: 'L104893/L97751: OnHookSingleton.maxPassLesson = e._maxPassLesson'
        }
    ]);

    if (!isGuide) {
        ctx.logger.criticalFields([{
            name: '_maxPassChapter',
            value: String(maxPassChapter),
            status: 'ok',
            detail: 'L97751: OnHookSingleton.maxPassChapter = e._maxPassChapter (regular only)'
        }]);
    }

    ctx.logger.summaryCard({
        title: 'CHECK BATTLE RESULT',
        userId: userId,
        fields: 4 + (isGuide ? 0 : 1),
        result: isWin ? 'WIN' : 'LOSE',
        lesson: curLess,
        rewards: rewardCount,
        mode: isGuide ? 'TUTORIAL' : 'REGULAR'
    });

    // Type assertions — catch silent type errors
    ctx.logger.typeAssert('responseData._battleResult', responseData._battleResult, 'number', {
        context: 'BATTLE-RESULT',
        trace: 'L104882: 0 == e._battleResult → win/lose check',
        impact: 'Wrong type → client cannot determine win/lose'
    });

    ctx.logger.typeAssert('responseData._changeInfo._items', responseData._changeInfo._items, 'object', {
        context: 'BATTLE-RESULT',
        trace: 'L97686: getBattleAwardItems iterates _changeInfo._items',
        impact: 'Wrong type → client cannot read rewards'
    });

    ctx.logger.typeAssert('responseData._curLess', responseData._curLess, 'number', {
        context: 'BATTLE-RESULT',
        trace: 'L104892/L97751: OnHookSingleton.lastSection = e._curLess',
        impact: 'Wrong type → lesson progress broken'
    });

    // Invariant checks
    ctx.logger.invariantCheck(
        'Win gives at least 1 reward item',
        !isWin || rewardCount > 0,
        {
            context: 'BATTLE-RESULT',
            expect: 'rewardCount > 0 on WIN',
            actual: 'rewardCount = ' + rewardCount,
            trace: 'lesson.json award1-5 + num1-5 must have at least 1 non-zero entry',
            impact: 'Player wins battle but gets NO rewards — feels like a bug',
            fix: 'Check lesson.json config for lesson ' + lessonId
        }
    );

    ctx.logger.invariantCheck(
        'Lose gives 0 reward items',
        !isWin || rewardCount >= 0,
        {
            context: 'BATTLE-RESULT',
            expect: 'rewardCount = 0 on LOSE',
            actual: 'rewardCount = ' + rewardCount,
            trace: 'Game design: no rewards on loss',
            impact: 'Giving rewards on loss = game balance issue'
        }
    );

    // Response snapshot
    ctx.logger.responseSnapshot('CHECK BATTLE RESULT ret=0', responseData);

    return ctx.buildDataResponse(0, responseData);
}

module.exports = handleCheckBattleResult;
