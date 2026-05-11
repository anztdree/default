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
 *       guideType: o.tutorialLine,   // guide category string
 *       step: e,                     // current step ID (integer)
 *       version: '1.0'
 *   }, function(e) { Logger.serverDebugLog('成功'); })
 *
 * CALLBACK: L120631 — reads NO response fields. Only logs "成功".
 * This is a FIRE-AND-FORGET save. Client sends tutorial progress.
 * If server returns error, client logs "失败" but continues.
 *
 * TRIGGER: L120611 — only fires when `o.isSave` is true.
 * When step == TaskGuideEndID, also fires analytics (Facebook, Google, etc.)
 *
 * For 50%: Save guideType + step to user data. Return ret=0.
 *
 * STRICT RULES: NO STUB, OVERRIDE, FORCE, BYPASS, DUMMY, ASUMSI
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
    ctx.logger.step(2, 2, 'Persist guide data', 'running');

    const userData = ctx.db.getUser(userId);
    if (userData) {
        if (!userData.guide) userData.guide = {};
        userData.guide[guideType] = step;
        ctx.db.saveUser(userId, userData);
        ctx.logger.step(2, 2, 'Persist guide data', 'pass', `saved guideType=${guideType} step=${step}`);
    } else {
        ctx.logger.log('WARN', 'GUIDE', `User not found in DB — guide progress NOT saved`);
        ctx.logger.step(2, 2, 'Persist guide data', 'warn', 'user not found');
    }

    return ctx.buildDataResponse(0, {});
}

module.exports = handleSaveGuide;
