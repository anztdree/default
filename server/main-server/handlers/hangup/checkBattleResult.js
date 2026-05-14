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
 *   Tutorial: always win, use actual curLess (NOT hardcoded tutorialLessons[0])
 *   Regular: respect checkResult, use actual curLess from user data
 *
 * [FIX-007] Tutorial lesson selection — CRITICAL BUG
 *   OLD: lessonId = String(tutorialLessons[0]) → ALWAYS 10101
 *   BUG: Tutorial battle 2 (lesson 10102) got rewards from lesson 10101
 *   FIX: lessonId = String(curLess) → use player's actual current lesson
 *
 * [FIX-008] Item reward sync — user._attribute._items NOT updated for NEW items
 *   OLD: if (user._attribute._items[itemId]) → only updates EXISTING items
 *   BUG: Equipment (3001+) and materials (131, 132) never added to attribute
 *   Client L97698: getItemNum(c) < n[u]._num → if attribute missing, delta wrong
 *   FIX: Always add/update item in user._attribute._items (create if missing)
 *
 * [FIX-009] parseInt safety for qty and newTotal
 *   qty from lesson.json num1-num5: ensure integer
 *   newTotal = currentNum + qty: ensure integer (no floats)
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
    const hangup = userData.hangup || {};
    let curLess = hangup._curLess || 10101;
    let maxPassLesson = hangup._maxPassLesson || 0;
    let maxPassChapter = hangup._maxPassChapter || 0;

    ctx.logger.details('progress',
        ['curLess', String(curLess)],
        ['maxPassLesson', String(maxPassLesson)],
        ['maxPassChapter', String(maxPassChapter)],
        ['source', 'userData.hangup']
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
            ['mode', 'TUTORIAL (forced win)'],
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
    // [FIX-007] Use curLess for BOTH tutorial and regular
    // Tutorial battle 1: curLess=10101 → rewards from lesson 10101
    // Tutorial battle 2: curLess=10102 → rewards from lesson 10102
    // OLD BUG: always used tutorialLessons[0] = 10101 for ALL tutorial battles
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

    // Read current item totals from userData.totalProps._items
    const currentItems = (userData.totalProps && userData.totalProps._items) || {};

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
                // [FIX-009] parseInt safety — ensure integer qty
                const intQty = parseInt(qty) || 0;
                if (intQty <= 0) continue;

                // FIX-004: _num = NEW TOTAL (current + reward)
                const currentNum = currentItems[itemId] ? (parseInt(currentItems[itemId]._num) || 0) : 0;
                const newTotal = currentNum + intQty;

                changeItems[itemIndex] = {
                    _id: parseInt(itemId),
                    _num: newTotal
                };

                // Update userData.totalProps._items with new total
                if (!userData.totalProps) userData.totalProps = { _items: {} };
                if (!userData.totalProps._items) userData.totalProps._items = {};
                userData.totalProps._items[itemId] = { _id: parseInt(itemId), _num: newTotal };

                // [FIX-008] ALWAYS update user._attribute._items (create if missing)
                // Client L97698: getItemNum(c) < n[u]._num → needs attribute in sync
                // OLD BUG: only updated if item ALREADY existed in attribute
                // Equipment (3001+) and materials (131, 132) were NEVER added
                if (userData.user && userData.user._attribute && userData.user._attribute._items) {
                    if (!userData.user._attribute._items[itemId]) {
                        // Item doesn't exist in attribute — CREATE it
                        userData.user._attribute._items[itemId] = { _id: parseInt(itemId), _num: 0 };
                    }
                    userData.user._attribute._items[itemId]._num = newTotal;
                }

                ctx.logger.details('reward',
                    ['#' + i, `item=${itemId} qty=+${qty} old=${currentNum} new=${newTotal}`]
                );
                rewardCount++;
            }
        }

        // FIX-005: Update progression using lesson.json nextID/nextChapter
        // On win: advance to next lesson
        const nextLessonId = lessonConfig.nextID;
        const nextChapter = lessonConfig.nextChapter;
        const thisChapter = lessonConfig.thisChapter;

        if (nextLessonId) {
            // There is a next lesson — advance
            curLess = nextLessonId;
        }
        // else: this is the last lesson (endpoint like 17417), stay here

        // Update maxPassLesson: highest lesson ID ever passed
        maxPassLesson = Math.max(maxPassLesson, parseInt(lessonId));

        // Update maxPassChapter: highest chapter ever passed
        if (thisChapter) {
            maxPassChapter = Math.max(maxPassChapter, thisChapter);
        }

        ctx.logger.details('progression',
            ['curLess', String(curLess)],
            ['maxPassLesson', String(maxPassLesson)],
            ['maxPassChapter', String(maxPassChapter)],
            ['nextLessonId', String(nextLessonId || '(endpoint)')],
            ['source', 'lesson.json nextID/thisChapter']
        );
    } else {
        // LOSE — no rewards, no progression
        ctx.logger.details('rewards', ['status', 'LOSE — no rewards given']);
    }

    // Update userData.hangup with new progression
    if (!userData.hangup) userData.hangup = {};
    userData.hangup._curLess = curLess;
    userData.hangup._maxPassLesson = maxPassLesson;
    userData.hangup._maxPassChapter = maxPassChapter;

    // Save to DB
    ctx.db.saveUser(userId, userData);

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
                ? 'L104882: 0 == e._battleResult -> true (tutorial forced win)'
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

    return ctx.buildDataResponse(0, responseData);
}

module.exports = handleCheckBattleResult;
