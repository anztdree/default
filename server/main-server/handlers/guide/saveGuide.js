/**
 * saveGuide.js — Handler: guide/saveGuide
 *
 * ═══════════════════════════════════════════════════════════════
 * DEEP TRACE — main.min.js (100% verified)
 * ═══════════════════════════════════════════════════════════════
 *
 * CALLER: L120624-120635 — fired during tutorial
 *   ts.processHandler({
 *       type: 'guide', action: 'saveGuide',
 *       userId: UserInfoSingleton.getInstance().userId,
 *       guideType: o.tutorialLine,   // GUIDE_TYPE enum integer (MAIN=2, TASK=3, ARENA=4, ...)
 *       step: e,                     // current step ID (integer, e.g. 2101, 2717, 3102)
 *       version: '1.0'
 *   }, function(e) { Logger.serverDebugLog('成功！！！'); },
 *     function(e) { Logger.serverDebugLog('失败！！！'); })
 *
 * CALLBACK: L120631-120635 — reads NO response fields.
 *   Success → logs "成功！！！". Error → logs "失败！！！". Both fire-and-forget.
 * If server returns error, client continues silently (no retry, no UI feedback).
 *
 * TRIGGER: L120611 — only fires when `o.isSave` is true.
 *   `isSave` is a property in tutorial.json: 1 = checkpoint step (last step of section).
 *   ~38 out of ~200+ steps have isSave=1 (milestone steps).
 *   NOTE: setGuideStep() is called UNCONDITIONALLY (comma operator before isSave check),
 *   so client always updates in-memory progress, but only checkpoints go to server.
 *   When step == TaskGuideEndID, also fires analytics (Facebook, Google, etc.)
 *
 * STORAGE FORMAT (critical):
 *   enterGame.js sends:  { _id: userId, _steps: { "2": 2717, "4": 4301, ... } }
 *   Client reads:        e.guide._steps[guideType] = step  (L120569-120575)
 *   So we MUST save to   userData.guide._steps[guideType] = step
 *
 * STRICT RULES: NO STUB, OVERRIDE, FORCE, BYPASS, DUMMY, ASUMSI
 *
 * [FIX-001] guide._steps path — was saving to guide[guideType] (flat key)
 *   Client reads e.guide._steps during login (setGuideInfo L120569).
 *   Old code wrote guide["2"] = 2717 → sibling of _steps, never read back.
 *   New code writes guide._steps["2"] = 2717 → inside _steps, correctly restored.
 *   WITHOUT THIS FIX: tutorial progress LOST on every re-login.
 */

function handleSaveGuide(request, ctx) {
    const { userId, guideType, step } = request;

    ctx.logger.step(1, 2, 'Save guide progress', 'running');
    ctx.logger.details('request',
        ['userId', userId ? userId.substring(0, 20) : 'MISSING'],
        ['guideType', String(guideType || '(none)')],
        ['step', String(step ?? '(none)')]
    );

    if (!userId) {
        ctx.logger.step(1, 2, 'Save guide progress', 'fail', 'userId MISSING ❌');
        return ctx.buildErrorResponse(8);
    }

    if (guideType === undefined || step === undefined) {
        ctx.logger.step(1, 2, 'Save guide progress', 'fail', 'guideType or step MISSING ❌');
        return ctx.buildErrorResponse(8);
    }

    ctx.logger.step(1, 2, 'Save guide progress', 'pass', `type=${guideType} step=${step}`);

    // ─── STEP 2: Save to DB ───
    // [FIX-001] Must save to guide._steps[guideType], NOT guide[guideType]
    // Client reads e.guide._steps during login (setGuideInfo L120569-120575)
    // Saving to flat key causes tutorial progress to be LOST on re-login
    ctx.logger.step(2, 2, 'Persist guide data', 'running');

    const userData = ctx.db.getUser(userId);
    if (userData) {
        if (!userData.guide) {
            userData.guide = { _id: userId, _steps: {} };
        }
        if (!userData.guide._steps) {
            userData.guide._steps = {};
        }
        userData.guide._steps[guideType] = step;
        ctx.db.saveUser(userId, userData);
        ctx.logger.step(2, 2, 'Persist guide data', 'pass', `saved guide._steps[${guideType}]=${step}`);
    } else {
        ctx.logger.log('WARN', 'GUIDE', `User not found in DB — guide progress NOT saved`);
        ctx.logger.step(2, 2, 'Persist guide data', 'warn', 'user not found');
    }

    return ctx.buildDataResponse(0, {});
}

module.exports = handleSaveGuide;
