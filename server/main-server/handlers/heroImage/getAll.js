/**
 * getAll.js — Handler: heroImage/getAll
 *
 * ═══════════════════════════════════════════════════════════════
 * DEEP TRACE — main.min.js (100% verified)
 * ═══════════════════════════════════════════════════════════════
 *
 * CALLER: L236709-236722
 *   ts.processHandler({
 *       type: 'heroImage', action: 'getAll',
 *       userId: UserInfoSingleton.getInstance().userId, version: '1.0'
 *   }, callback)
 *
 * CONSUMER: L236715 → L134360-134370 setAlreadyGainHeroID(e):
 *   for (var n in e._heros) {
 *       var o = e._heros[n]._id;
 *       a.maxLevel = e._heros[n]._maxLevel;
 *       var r = e._heros[n]._selfComments;
 *       if (r) { for...in r { a.selfComments.push(r[i]); } }
 *   }
 *
 * RESPONSE: { _heros: Object{} }
 *   Each entry: { _id: number, _maxLevel: number, _selfComments: array }
 *   _heros MUST be Object (for...in iteration).
 *
 * DATA SOURCE: userData.heros._heros (same data as enterGame response)
 *   Each hero has: _heroDisplayId, _heroBaseAttr._level, etc.
 *
 * [FIX-001] _id: was h._heroId (internal UUID), changed to h._heroDisplayId
 *   Client keys alreadyGainHeroIDList by displayId (L133697: checkHeroAlreadyGain(t.heroDisplayId))
 *   Wrong ID type → hero handbook shows empty, super skill checks fail, summon "new" detection broken
 *
 * [FIX-002] _maxLevel: was hardcoded 1, changed to h._heroBaseAttr._level
 *   Client uses maxLevel for: progress display (L177514), super skill availability (L88871),
 *   auto-update on level-up (L133752). Hardcoded 1 = wrong progress, wrong skill availability
 *
 * [FIX-003] data path: was userData.hero._heros (wrong), changed to userData.heros._heros
 *   enterGame.js sends "heros" (not "hero") — wrong path = no heroes returned at all
 *
 * STRICT RULES: NO STUB, OVERRIDE, FORCE, BYPASS, DUMMY, ASUMSI
 */

function handleHeroImageGetAll(request, ctx) {
    const { userId } = request;

    ctx.logger.step(1, 2, 'Get hero image list', 'running');
    ctx.logger.details('request',
        ['userId', userId ? userId.substring(0, 20) : 'MISSING']
    );

    if (!userId) {
        ctx.logger.step(1, 2, 'Get hero image list', 'fail', 'userId MISSING ❌');
        return ctx.buildErrorResponse(8);
    }

    ctx.logger.step(1, 2, 'Get hero image list', 'pass', 'userId OK');

    // ─── STEP 2: Build hero image data from user's heroes ───
    ctx.logger.step(2, 2, 'Build hero image data', 'running');

    const userData = ctx.db.getUser(userId);
    const heros = {};

    if (userData && userData.heros && userData.heros._heros) {
        const userHeros = userData.heros._heros;
        for (const key in userHeros) {
            const h = userHeros[key];
            if (h && h._heroDisplayId) {
                // _id MUST be heroDisplayId — client keys alreadyGainHeroIDList by displayId
                // L133697: checkHeroAlreadyGain(t.heroDisplayId) → lookup by displayId
                // _maxLevel from actual hero level — client uses for progress & super skill checks
                const heroLevel = (h._heroBaseAttr && h._heroBaseAttr._level) || 1;
                heros[key] = {
                    _id: h._heroDisplayId,
                    _maxLevel: heroLevel,
                    _selfComments: []
                };
            }
        }
    }

    const heroCount = Object.keys(heros).length;
    ctx.logger.step(2, 2, 'Build hero image data', 'pass', `${heroCount} hero(es)`);

    ctx.logger.criticalFields([
        {
            name: '_heros',
            value: `Object{${heroCount}}`,
            status: 'ok',
            detail: 'L134363: for(var n in e._heros) → Object, each has _id/_maxLevel/_selfComments'
        }
    ]);

    ctx.logger.summaryCard({
        title: 'HERO IMAGE GET ALL COMPLETE',
        userId: userId,
        fields: 1,
        heroCount: heroCount,
        duration: 0
    });

    return ctx.buildDataResponse(0, { _heros: heros });
}

module.exports = handleHeroImageGetAll;
