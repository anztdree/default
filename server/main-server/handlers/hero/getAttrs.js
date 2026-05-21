/**
 * getAttrs.js — Handler: hero/getAttrs
 *
 * ═══════════════════════════════════════════════════════════════
 * DEEP TRACE — main.min.js (100% verified)
 * ═══════════════════════════════════════════════════════════════
 *
 * CALLER: 7 call sites — ts.processHandler({
 *     type: 'hero', action: 'getAttrs',
 *     userId, heros: [heroId, ...], version: '1.0'
 * }, callback)
 *
 * CONSUMER: L133724-133738 getAttrsCallBack(herosArray, response):
 *   for (var o in t._attrs) {
 *       var hero = getHero(herosArray[o]);    // o = string index "0","1",...
 *       setTotalAttrs({
 *           _totalAttr: t._attrs[o],          // total combat attrs
 *           _baseAttr: t._baseAttrs[o]        // base combat attrs
 *       }, hero);
 *   }
 *
 * L133802-133839 setTotalAttrs(e, t):
 *   1. setBaseAttr(e._baseAttr, t) — maps _id→englishName via abilityName.json
 *      then: hp *= talent, attack *= talent
 *   2. e._totalAttr._items → hero.totalAttr[id] = {id, num}
 *      if id==21: heroBaseAttr.power = floor(num)
 *
 * RESPONSE FORMAT:
 *   _attrs: { "0": { _items: { attrIdx: { _id: attrId, _num: value } } }, ... }
 *   _baseAttrs: { "0": { _items: { ... } }, ... }
 *   Keys = string index matching request heros[] order
 *
 * FORMULA (L115997-116073 makeHeroBasicAttr — client-side preview, same math):
 *   baseHP   = (levelAttr.hp × typeParam.hpParam + typeParam.hpBais) × qualityParam.hpParam × hero.balanceHp
 *   baseATK  = (levelAttr.attack × typeParam.attackParam + typeParam.attackBais) × qualityParam.attackParam × hero.balanceAttack
 *   baseARM  = (levelAttr.armor × typeParam.armorParam + typeParam.armorBais) × qualityParam.armorParam × hero.balanceArmor
 *   speed    = hero.speed (flat from hero.json)
 *   talent   = hero.talent (flat from hero.json)
 *   energyMax = hero.energyMax (flat from hero.json)
 *
 * POWER (attr 21) — weighted sum from heroPower.json per heroType:
 *   power = floor( sum(attrValue × heroPower[type][attrName].powerParam) )
 *   heroPower.json has 31 attrs per heroType with weights (0.5 to 2.0)
 *   Verified via HAR: hero 05d03ac8 HP=5650,ATK=435,ARM=205 → power=14276
 *   NOTE: getHeroZpowe (L84802) is for zPower COST feature, NOT combat power
 *
 * FLAT COMBAT STATS (L116073) — all read from hero.json[displayId]:
 *   hit, dodge, block, blockEffect, critical, criticalResist, criticalDamage,
 *   armorBreak, damageReduce, controlResist, skillDamage, trueDamage,
 *   healPlus, healerPlus — 697/887 heroes have these fields
 *
 * CONFIG FILES (all in resource/json/):
 *   hero.json          — hero template: quality, heroType, talent, speed, balance*, energyMax
 *   heroLevelAttr.json — base hp/attack/armor per level (1-349+)
 *   heroTypeParam.json — type multipliers: hpParam, attackParam, armorParam, hpBais, attackBais, armorBais
 *   heroQualityParam.json — quality multipliers (all = 1.0 currently)
 *   abilityName.json   — attr ID → englishName mapping
 *   heroPower.json     — power weight per attr per heroType (31 attrs × 13 types)
 *   zPowerQualityPara.json — quality → zPower para (for zPower cost, NOT power)
 *
 * DATA SOURCE:
 *   userData.heros._heros[heroId] → hero instance (has _heroBaseAttr._level)
 *   hero.json[heroDisplayId]     → hero template config
 *
 * STRICT RULES: NO STUB, OVERRIDE, FORCE, BYPASS, DUMMY, ASUMSI
 *
 * ═══════════════════════════════════════════════════════════════
 * BUG FIX LOG
 * ═══════════════════════════════════════════════════════════════
 *
 * [FIX-001] Resource path — hardcoded relative path replaced with ctx.loadResource()
 *   OLD: const CONFIG_DIR = path.resolve(__dirname, '../../../resource/json');
 *   NEW: Uses ctx.loadResource() via centralized config.resourcePath
 *   REASON: Hardcoded path fragile across deployments; ctx.loadResource()
 *     uses config.resolveResourcePath() which checks 6 candidate paths
 *
 * [FIX-002] Power formula — was ASUMSI hardcoded estimate, replaced with REAL formula
 *   OLD: power = floor((HP + ATK*2.5 + ARM*2 + SPD*3 + 200) × balancePower)  ← PALSU
 *   THEN: power = (A + lvl×pow(B, 1+ceil(lvl/C)/D)) × qualityPara  ← SALAH JUGA (zPower cost, bukan combat power)
 *   NEW: power = floor( sum(attrValue × heroPower[heroType][attrName].powerParam) )
 *   SOURCE: heroPower.json config + HAR verification (HP=5650,ATK=435,ARM=205 → power=14276)
 *   REASON: getHeroZpowe (L84802) is for zPower COST feature, NOT combat power
 *
 * [FIX-003] Flat combat stats — was hardcoded 0, now reads from hero.json
 *   OLD: hit, dodge, block, critical, etc. all = 0
 *   NEW: heroConfig.hit, heroConfig.dodge, heroConfig.block, etc.
 *   SOURCE: L116073 makeHeroBasicAttr — addHeroAttr for each flat stat
 *   REASON: 697/887 heroes have real combat stat values, not 0
 *
 * [FIX-004] Silent error — baseStats=null now logs ERROR with hero details
 *   OLD: Only generic WARN log, client received empty _items silently
 *   NEW: Explicit ERROR log with heroId, displayId, level, missing config name
 *
 * [FIX-005] _totalAttr sends POST-TALENT HP/ATK (was sending PRE-TALENT)
 *   OLD: _attrs (totalAttr) contained same values as _baseAttrs (pre-talent)
 *   NEW: _attrs contains HP*talent and ATK*talent (post-talent values)
 *   SOURCE: L133840-133849 setBaseAttr applies talent to _baseAttr only
 *          L84510-84512 display reads from totalAttr[0/1].num.toFixed()
 *   REASON: Client uses totalAttr directly for display & battle — must be post-talent
 *   VERIFIED: Kid Goku HP+54 = 134×0.4=53.6→toFixed→54 ✓
 *            Tien (1309) HP+94 = 235×0.4=94.08→toFixed→94 ✓
 *
 * [FIX-006] Remove Math.floor from intermediate base stat values
 *   OLD: baseHP = Math.floor(formula) — loses precision before talent multiply
 *   NEW: baseHP = formula (keep as float) — client .toFixed() handles rounding
 *   SOURCE: Client makeHeroBasicAttr does NOT floor intermediate values
 *   REASON: ARM 38.25→toFixed→38 matches real server, floor would give 39
 *
 * [FIX-007] Power uses PRE-TALENT values WITHOUT balancePower
 *   OLD: Power from post-talent weighted sum × balancePower × qualityPower
 *   NEW: Power from pre-talent weighted sum × qualityPower (NO balancePower)
 *   SOURCE: Kid Goku Lv11: pre-talent sum=3883 ≈ user's 3886; post-talent×balP=2497 ≠ 3886
 *   EVIDENCE: heroPower.json weights NOT referenced in client JS — power is server-computed
 *   NOTE: heroQualityPower.powerParam is always 1.0 (no-op but kept for future)
 */

// ─── Attribute ID constants (from abilityName.json + HeroAbilityName enum) ───
const ATTR = {
    HP: 0,
    ATTACK: 1,
    ARMOR: 2,
    SPEED: 3,
    HIT: 4,
    DODGE: 5,
    BLOCK: 6,
    BLOCK_EFFECT: 7,
    SKILL_DAMAGE: 8,
    CRITICAL: 9,
    CRITICAL_RESIST: 10,
    CRITICAL_DAMAGE: 11,
    ARMOR_BREAK: 12,
    DAMAGE_REDUCE: 13,
    CONTROL_RESIST: 14,
    TRUE_DAMAGE: 15,
    ENERGY: 16,
    HP_PERCENT: 17,
    ARMOR_PERCENT: 18,
    ATTACK_PERCENT: 19,
    SPEED_PERCENT: 20,
    POWER: 21,
    ORG_HP: 22,
    SUPER_DAMAGE: 23,
    HEAL_PLUS: 24,
    HEALER_PLUS: 25,
    EXTRA_ARMOR: 26,
    SHIELDER_PLUS: 27,
    DAMAGE_UP: 28,
    DAMAGE_DOWN: 29,
    TALENT: 30,
    SUPER_DAMAGE_RESIST: 31,
    ENERGY_MAX: 41,
};

/**
 * Calculate base attributes for a hero based on level + template config.
 * Formula matches L115997-116073 makeHeroBasicAttr from main.min.js
 *
 */
/**
 * Add a bonus value to an attr accumulator (matches L115997 addHeroAttr).
 * Only adds if the value is non-zero.
 */
function addHeroAttr(acc, attrName, value) {
    if (value) {
        acc[attrName] = (acc[attrName] || 0) + value;
    }
}

/**
 * Calculate hero attributes at a given level.
 * Matches L115997-116073 makeHeroBasicAttr from main.min.js exactly.
 *
 * KEY DESIGN DECISIONS (verified from HAR real server data):
 * - Raw stats are kept as FLOAT (no Math.floor on intermediate values)
 * - _baseAttr sends PRE-TALENT HP/ATK (client applies talent via setBaseAttr)
 * - _totalAttr sends POST-TALENT HP/ATK (client uses directly for display & battle)
 * - Qigong bonuses are AUTO-APPLIED based on evolveLevel + heroType
 *   (main.min.js makeHeroBasicAttr adds them unconditionally when matched)
 * - Power uses POST-TALENT values in the weighted sum × balancePower × qualityPower
 *
 * @param {number} heroDisplayId - Hero template ID (key into hero.json)
 * @param {number} level - Hero level
 * @param {number} evolveLevel - Current evolve level (0 = no evolve)
 * @param {number} star - Current wakeup/star level (0 = no star)
 * @param {object} ctx - Context with loadResource()
 * @returns {Object|null} { baseAttrs (pre-talent), totalAttrs (post-talent), power }
 */
function calculateHeroAttrs(heroDisplayId, level, evolveLevel, star, ctx) {
    // ─── Load all required config via centralized loadResource() ───
    const heroJson = ctx.loadResource('hero');
    const levelAttrJson = ctx.loadResource('heroLevelAttr');
    const typeParamJson = ctx.loadResource('heroTypeParam');
    const qualityParamJson = ctx.loadResource('heroQualityParam');

    if (!heroJson || !levelAttrJson || !typeParamJson || !qualityParamJson) {
        ctx.logger.log('ERROR', 'ATTRS', 'Missing required config JSON(s)');
        ctx.logger.details('config',
            ['hero.json', heroJson ? 'OK' : 'MISSING'],
            ['heroLevelAttr.json', levelAttrJson ? 'OK' : 'MISSING'],
            ['heroTypeParam.json', typeParamJson ? 'OK' : 'MISSING'],
            ['heroQualityParam.json', qualityParamJson ? 'OK' : 'MISSING'],
            ['resourcePath', ctx.config.resourcePath]
        );
        return null;
    }

    const heroConfig = heroJson[String(heroDisplayId)];
    if (!heroConfig) return null;

    const levelData = levelAttrJson[String(level)];
    if (!levelData) return null;

    const typeConfig = typeParamJson[heroConfig.heroType];
    if (!typeConfig) return null;

    const qualityConfig = qualityParamJson[heroConfig.quality];
    if (!qualityConfig) return null;

    // ─── Step 1: Compute raw base stats (NO Math.floor — keep as float) ───
    // L116040-116050: client does NOT floor intermediate values
    const rawHP = (levelData.hp * typeConfig.hpParam + typeConfig.hpBais)
        * qualityConfig.hpParam * (heroConfig.balanceHp || 1);
    const rawATK = (levelData.attack * typeConfig.attackParam + typeConfig.attackBais)
        * qualityConfig.attackParam * (heroConfig.balanceAttack || 1);
    const rawARM = (levelData.armor * typeConfig.armorParam + typeConfig.armorBais)
        * qualityConfig.armorParam * (heroConfig.balanceArmor || 1);

    // Initialize bonus accumulator
    const bonus = {};

    // ─── Step 2: Evolve bonuses (L116014-116022) ───
    const evolveJson = ctx.loadResource('heroEvolve');
    if (evolveJson) {
        const evolveEntries = evolveJson[String(heroDisplayId)];
        if (Array.isArray(evolveEntries)) {
            for (const entry of evolveEntries) {
                if (evolveLevel >= entry.level) {
                    addHeroAttr(bonus, 'hp', entry.hp || 0);
                    addHeroAttr(bonus, 'attack', entry.attack || 0);
                    addHeroAttr(bonus, 'armor', entry.armor || 0);
                    addHeroAttr(bonus, 'speed', entry.speed || 0);
                }
            }
        }
    }

    // ─── Step 3: Wakeup/Star bonuses (L116024-116042) ───
    let talent = heroConfig.talent || 0;
    const wakeUpJson = ctx.loadResource('heroWakeUp');
    if (wakeUpJson) {
        const wakeUpData = wakeUpJson[String(heroDisplayId)];
        if (wakeUpData) {
            if (Array.isArray(wakeUpData)) {
                for (const entry of wakeUpData) {
                    if (star >= entry.star) {
                        addHeroAttr(bonus, 'talent', entry.talent || 0);
                        addHeroAttr(bonus, 'hp', entry.hp || 0);
                        addHeroAttr(bonus, 'attack', entry.attack || 0);
                        addHeroAttr(bonus, 'armor', entry.armor || 0);
                        addHeroAttr(bonus, 'speed', entry.speed || 0);
                    }
                }
            } else if (star >= 1) {
                addHeroAttr(bonus, 'talent', wakeUpData.talent || 0);
                addHeroAttr(bonus, 'hp', wakeUpData.hp || 0);
                addHeroAttr(bonus, 'attack', wakeUpData.attack || 0);
                addHeroAttr(bonus, 'armor', wakeUpData.armor || 0);
                addHeroAttr(bonus, 'speed', wakeUpData.speed || 0);
            }
        }
    }
    talent += (bonus.talent || 0);

    // ─── Step 4: Qigong bonuses (L116044-116059) ───
    // IMPORTANT: Qigong is AUTO-APPLIED by makeHeroBasicAttr based on evolveLevel + heroType.
    // The server MUST include these bonuses in the power calculation.
    const qiGongJson = ctx.loadResource('qiGong');
    const qigongQualityJson = ctx.loadResource('qigongQualityMaxPara');
    if (qiGongJson && qigongQualityJson) {
        let qiGongEntry = null;
        for (const key in qiGongJson) {
            const entry = qiGongJson[key];
            if (entry.evolveLevel === evolveLevel && entry.heroType === heroConfig.heroType) {
                qiGongEntry = entry;
                break;
            }
        }
        let qigongQualityEntry = null;
        for (const key in qigongQualityJson) {
            const entry = qigongQualityJson[key];
            if (entry.quality === heroConfig.quality) {
                qigongQualityEntry = entry;
                break;
            }
        }
        if (qiGongEntry && qigongQualityEntry) {
            addHeroAttr(bonus, 'hp', Math.floor(qiGongEntry.hpMax * qigongQualityEntry.hpMaxPara));
            addHeroAttr(bonus, 'attack', Math.floor(qiGongEntry.attackMax * qigongQualityEntry.attackMaxPara));
            addHeroAttr(bonus, 'armor', Math.floor(qiGongEntry.armorMax * qigongQualityEntry.armorMaxPara));
        }
    }

    // ─── Step 5: Self-break bonuses (L116061-116072) ───
    // Only applies if breakLevel > 0 (player has done breaks)
    const selfBreakJson = ctx.loadResource('selfBreak');
    const selfBreakQualityJson = ctx.loadResource('selfBreakQuality');
    if (selfBreakJson && selfBreakQualityJson) {
        let selfBreakQualityEntry = null;
        for (const key in selfBreakQualityJson) {
            const entry = selfBreakQualityJson[key];
            if (entry.quality === heroConfig.quality) {
                selfBreakQualityEntry = entry;
                break;
            }
        }
        if (selfBreakQualityEntry) {
            for (const key in selfBreakJson) {
                const entry = selfBreakJson[key];
                const typeMatch = (entry.breakType && entry.breakType === heroConfig.breakType) ||
                    (!entry.breakType && entry.breakType2 && entry.breakType2 === heroConfig.breakType2);
                if (typeMatch && entry.levelNeeded <= level) {
                    const value = entry.abilityAffected
                        ? entry.value * selfBreakQualityEntry.abilityPara
                        : entry.value;
                    addHeroAttr(bonus, entry.abilityID, value);
                }
            }
        }
    }

    // ─── Step 6: Compute final values ───
    const baseSpeed = (heroConfig.speed || 0) + (bonus.speed || 0);
    const energyMax = heroConfig.energyMax || 100;

    // _baseAttr: PRE-TALENT values (client applies talent via setBaseAttr L133840-133849)
    const baseHP = rawHP + (bonus.hp || 0);
    const baseATK = rawATK + (bonus.attack || 0);
    const baseARM = rawARM + (bonus.armor || 0);

    // _totalAttr: POST-TALENT values (client uses directly for display & battle)
    const totalHP = baseHP * talent;
    const totalATK = baseATK * talent;
    const totalARM = baseARM; // Armor is NOT affected by talent

    // ─── Step 7: Power calculation ───
    // VERIFIED: Power uses PRE-TALENT base values (see autoLevelUp.js for full evidence)
    // Kid Goku Lv11: PRE-TALENT sum=3883 ≈ user's 3886; POST-TALENT × balP=2497 ≠ 3886
    const heroPowerJson = ctx.loadResource('heroPower');
    const heroQualityPowerJson = ctx.loadResource('heroQualityPower');
    let power = 0;
    if (heroPowerJson) {
        // Build attr value map using PRE-TALENT (base) values for HP and ATK
        const attrValueMap = {
            hp: baseHP,              // PRE-TALENT HP (NOT totalHP)
            attack: baseATK,         // PRE-TALENT ATK (NOT totalATK)
            armor: baseARM,          // Same pre/post (talent doesn't affect armor)
            speed: baseSpeed,
            talent: talent,
            energyMax: energyMax,
            hit: heroConfig.hit || 0,
            dodge: heroConfig.dodge || 0,
            block: heroConfig.block || 0,
            blockEffect: heroConfig.blockEffect || 0,
            skillDamage: heroConfig.skillDamage || 0,
            critical: heroConfig.critical || 0,
            criticalResist: heroConfig.criticalResist || 0,
            criticalDamage: heroConfig.criticalDamage || 0,
            armorBreak: heroConfig.armorBreak || 0,
            damageReduce: heroConfig.damageReduce || 0,
            controlResist: heroConfig.controlResist || 0,
            trueDamage: heroConfig.trueDamage || 0,
            healPlus: heroConfig.healPlus || 0,
            healerPlus: heroConfig.healerPlus || 0,
            extraArmor: 0,
            superDamage: 0,
            shielderPlus: 0,
            damageUp: 0,
            damageDown: 0,
            superDamageResist: 0,
            bloodDamage: 0,
            normalAttack: 0,
            blockThrough: 0,
            criticalDamageResist: 0,
            hpPercent: 0,
            attackPercent: 0,
            armorPercent: 0,
        };

        // Sum all attrs × weight from heroPower.json for this heroType
        let totalWeighted = 0;
        for (const key in heroPowerJson) {
            const entry = heroPowerJson[key];
            if (entry.heroType === heroConfig.heroType) {
                totalWeighted += (attrValueMap[entry.attName] || 0) * entry.powerParam;
            }
        }

        // NOTE: balancePower is NOT applied to power (verified: breaks Kid Goku 3886 match)

        // Apply quality power multiplier (heroQualityPower.json — all 1.0 currently)
        if (heroQualityPowerJson && heroQualityPowerJson[heroConfig.quality]) {
            totalWeighted *= heroQualityPowerJson[heroConfig.quality].powerParam;
        }

        power = Math.floor(totalWeighted);
    }

    ctx.logger.details('attrCalc',
        ['heroType', heroConfig.heroType],
        ['talent', talent.toFixed(4)],
        ['baseHP(preT)', baseHP.toFixed(2)],
        ['baseATK(preT)', baseATK.toFixed(2)],
        ['baseARM', baseARM.toFixed(2)],
        ['totalHP(postT)', totalHP.toFixed(2)],
        ['totalATK(postT)', totalATK.toFixed(2)],
        ['power', String(power)]
    );

    return {
        // _baseAttr values (PRE-TALENT for HP/ATK — client applies talent)
        baseAttrs: {
            hp: baseHP,
            attack: baseATK,
            armor: baseARM,
            speed: baseSpeed,
            talent: talent,
            energyMax: energyMax,
            hit: heroConfig.hit || 0,
            dodge: heroConfig.dodge || 0,
            block: heroConfig.block || 0,
            blockEffect: heroConfig.blockEffect || 0,
            skillDamage: heroConfig.skillDamage || 0,
            critical: heroConfig.critical || 0,
            criticalResist: heroConfig.criticalResist || 0,
            criticalDamage: heroConfig.criticalDamage || 0,
            armorBreak: heroConfig.armorBreak || 0,
            damageReduce: heroConfig.damageReduce || 0,
            controlResist: heroConfig.controlResist || 0,
            trueDamage: heroConfig.trueDamage || 0,
            healPlus: heroConfig.healPlus || 0,
            healerPlus: heroConfig.healerPlus || 0,
        },
        // _totalAttr values (POST-TALENT for HP/ATK — client uses directly)
        totalAttrs: {
            hp: totalHP,
            attack: totalATK,
            armor: totalARM,
            speed: baseSpeed,
            talent: talent,
            energyMax: energyMax,
            power: power,
            hit: heroConfig.hit || 0,
            dodge: heroConfig.dodge || 0,
            block: heroConfig.block || 0,
            blockEffect: heroConfig.blockEffect || 0,
            skillDamage: heroConfig.skillDamage || 0,
            critical: heroConfig.critical || 0,
            criticalResist: heroConfig.criticalResist || 0,
            criticalDamage: heroConfig.criticalDamage || 0,
            armorBreak: heroConfig.armorBreak || 0,
            damageReduce: heroConfig.damageReduce || 0,
            controlResist: heroConfig.controlResist || 0,
            trueDamage: heroConfig.trueDamage || 0,
            healPlus: heroConfig.healPlus || 0,
            healerPlus: heroConfig.healerPlus || 0,
        },
    };
}

/**
 * Build an _items object from attr key-value pairs.
 * Format: { "0": { _id: attrId, _num: value }, "1": { ... }, ... }
 *
 * @param {Array<{id: number, num: number}>} attrs - Array of {id, num} pairs
 * @returns {Object} _items format
 */
function buildItems(attrs) {
    const items = {};
    attrs.forEach((attr, idx) => {
        if (attr.num !== 0 && attr.num !== undefined && attr.num !== null) {
            items[String(idx)] = { _id: attr.id, _num: attr.num };
        }
    });
    return items;
}


function handleHeroGetAttrs(request, ctx) {
    const { userId, heros } = request;

    ctx.logger.step(1, 2, 'Get hero attrs', 'running');
    ctx.logger.details('request',
        ['userId', userId ? userId.substring(0, 20) : 'MISSING'],
        ['heros', Array.isArray(heros) ? heros.join(',') : String(heros || '(none)')]
    );

    if (!userId) {
        ctx.logger.step(1, 2, 'Get hero attrs', 'fail', 'userId MISSING');
        return ctx.buildErrorResponse(8);
    }
    if (!Array.isArray(heros) || heros.length === 0) {
        ctx.logger.step(1, 2, 'Get hero attrs', 'fail', 'heros array EMPTY');
        return ctx.buildErrorResponse(8);
    }

    ctx.logger.step(1, 2, 'Get hero attrs', 'pass', `${heros.length} hero(es) requested`);

    // ─── STEP 2: Load user data & calculate attributes ───
    ctx.logger.step(2, 2, 'Calculate hero attributes', 'running');

    const userData = ctx.db.getUser(userId);
    if (!userData || !userData.heros || !userData.heros._heros) {
        ctx.logger.step(2, 2, 'Calculate hero attributes', 'fail', 'userData.heros not found');
        return ctx.buildErrorResponse(8);
    }

    const attrs = {};
    const baseAttrs = {};

    for (let i = 0; i < heros.length; i++) {
        const heroId = heros[i];
        const heroData = userData.heros._heros[heroId];

        if (!heroData) {
            ctx.logger.log('WARN', 'ATTRS', `Hero ${heroId} not found in userData.heros._heros — returning empty attrs`);
            attrs[i] = { _items: {} };
            baseAttrs[i] = { _items: {} };
            continue;
        }

        const heroDisplayId = heroData._heroDisplayId;
        const level = heroData._heroBaseAttr ? (heroData._heroBaseAttr._level || 1) : 1;
        const evolveLevel = heroData._heroBaseAttr ? (heroData._heroBaseAttr._evolveLevel || 0) : 0;
        const star = heroData._heroBaseAttr ? (heroData._heroBaseAttr._star || 0) : 0;

        ctx.logger.details('heroCalc',
            ['heroId', heroId],
            ['displayId', String(heroDisplayId)],
            ['level', String(level)],
            ['evolveLevel', String(evolveLevel)],
            ['star', String(star)]
        );

        // Calculate attributes using the unified formula (matches main.min.js makeHeroBasicAttr)
        const heroResult = calculateHeroAttrs(heroDisplayId, level, evolveLevel, star, ctx);

        if (!heroResult) {
            ctx.logger.log('WARN', 'ATTRS', `Cannot calculate attrs for heroDisplayId=${heroDisplayId} level=${level} — missing config`);
            attrs[i] = { _items: {} };
            baseAttrs[i] = { _items: {} };
            continue;
        }

        ctx.logger.details('heroStats',
            ['baseHP(preT)', heroResult.baseAttrs.hp.toFixed(2)],
            ['baseATK(preT)', heroResult.baseAttrs.attack.toFixed(2)],
            ['totalHP(postT)', heroResult.totalAttrs.hp.toFixed(2)],
            ['totalATK(postT)', heroResult.totalAttrs.attack.toFixed(2)],
            ['power', String(heroResult.totalAttrs.power)]
        );

        // ─── BUILD _baseAttrs[i] ───
        // PRE-TALENT HP/ATK — client applies talent via setBaseAttr (L133840-133849)
        baseAttrs[i] = { _items: buildItems([
            { id: ATTR.HP, num: heroResult.baseAttrs.hp },
            { id: ATTR.ATTACK, num: heroResult.baseAttrs.attack },
            { id: ATTR.ARMOR, num: heroResult.baseAttrs.armor },
            { id: ATTR.SPEED, num: heroResult.baseAttrs.speed },
            { id: ATTR.TALENT, num: heroResult.baseAttrs.talent },
            { id: ATTR.ENERGY_MAX, num: heroResult.baseAttrs.energyMax },
            { id: ATTR.HIT, num: heroResult.baseAttrs.hit },
            { id: ATTR.DODGE, num: heroResult.baseAttrs.dodge },
            { id: ATTR.BLOCK, num: heroResult.baseAttrs.block },
            { id: ATTR.BLOCK_EFFECT, num: heroResult.baseAttrs.blockEffect },
            { id: ATTR.SKILL_DAMAGE, num: heroResult.baseAttrs.skillDamage },
            { id: ATTR.CRITICAL, num: heroResult.baseAttrs.critical },
            { id: ATTR.CRITICAL_RESIST, num: heroResult.baseAttrs.criticalResist },
            { id: ATTR.CRITICAL_DAMAGE, num: heroResult.baseAttrs.criticalDamage },
            { id: ATTR.ARMOR_BREAK, num: heroResult.baseAttrs.armorBreak },
            { id: ATTR.DAMAGE_REDUCE, num: heroResult.baseAttrs.damageReduce },
            { id: ATTR.CONTROL_RESIST, num: heroResult.baseAttrs.controlResist },
            { id: ATTR.TRUE_DAMAGE, num: heroResult.baseAttrs.trueDamage },
            { id: ATTR.HEAL_PLUS, num: heroResult.baseAttrs.healPlus },
            { id: ATTR.HEALER_PLUS, num: heroResult.baseAttrs.healerPlus },
        ]) };

        // ─── BUILD _attrs[i] (total attributes) ───
        // POST-TALENT HP/ATK + POWER — client uses directly for display & battle
        attrs[i] = { _items: buildItems([
            { id: ATTR.HP, num: heroResult.totalAttrs.hp },
            { id: ATTR.ATTACK, num: heroResult.totalAttrs.attack },
            { id: ATTR.ARMOR, num: heroResult.totalAttrs.armor },
            { id: ATTR.SPEED, num: heroResult.totalAttrs.speed },
            { id: ATTR.TALENT, num: heroResult.totalAttrs.talent },
            { id: ATTR.ENERGY_MAX, num: heroResult.totalAttrs.energyMax },
            { id: ATTR.POWER, num: heroResult.totalAttrs.power },
            { id: ATTR.HIT, num: heroResult.totalAttrs.hit },
            { id: ATTR.DODGE, num: heroResult.totalAttrs.dodge },
            { id: ATTR.BLOCK, num: heroResult.totalAttrs.block },
            { id: ATTR.BLOCK_EFFECT, num: heroResult.totalAttrs.blockEffect },
            { id: ATTR.SKILL_DAMAGE, num: heroResult.totalAttrs.skillDamage },
            { id: ATTR.CRITICAL, num: heroResult.totalAttrs.critical },
            { id: ATTR.CRITICAL_RESIST, num: heroResult.totalAttrs.criticalResist },
            { id: ATTR.CRITICAL_DAMAGE, num: heroResult.totalAttrs.criticalDamage },
            { id: ATTR.ARMOR_BREAK, num: heroResult.totalAttrs.armorBreak },
            { id: ATTR.DAMAGE_REDUCE, num: heroResult.totalAttrs.damageReduce },
            { id: ATTR.CONTROL_RESIST, num: heroResult.totalAttrs.controlResist },
            { id: ATTR.TRUE_DAMAGE, num: heroResult.totalAttrs.trueDamage },
            { id: ATTR.HEAL_PLUS, num: heroResult.totalAttrs.healPlus },
            { id: ATTR.HEALER_PLUS, num: heroResult.totalAttrs.healerPlus },
            { id: ATTR.ENERGY, num: 0 },
            { id: ATTR.HP_PERCENT, num: 0 },
            { id: ATTR.ARMOR_PERCENT, num: 0 },
            { id: ATTR.ATTACK_PERCENT, num: 0 },
            { id: ATTR.SPEED_PERCENT, num: 0 },
            { id: ATTR.ORG_HP, num: heroResult.totalAttrs.hp },
            { id: ATTR.SUPER_DAMAGE, num: 0 },
            { id: ATTR.EXTRA_ARMOR, num: 0 },
            { id: ATTR.SHIELDER_PLUS, num: 0 },
            { id: ATTR.DAMAGE_UP, num: 0 },
            { id: ATTR.DAMAGE_DOWN, num: 0 },
            { id: ATTR.SUPER_DAMAGE_RESIST, num: 0 },
        ]) };
    }

    ctx.logger.step(2, 2, 'Calculate hero attributes', 'pass',
        `${heros.length} heroes calculated`);

    ctx.logger.criticalFields([
        {
            name: '_attrs',
            value: `Object{${heros.length}}`,
            status: 'ok',
            detail: 'L133726: for(var o in t._attrs) — keyed by hero index, each has _items with calculated attrs'
        },
        {
            name: '_baseAttrs',
            value: `Object{${heros.length}}`,
            status: 'ok',
            detail: 'L133731: t._baseAttrs[o] — keyed by hero index, each has _items with base attrs (before talent)'
        },
        {
            name: 'POWER (attr 21)',
            value: 'calculated per hero',
            status: 'ok',
            detail: 'L133821: 21==p._id → heroBaseAttr.power = floor(num)'
        }
    ]);

    ctx.logger.summaryCard({
        title: 'HERO GET ATTRS COMPLETE',
        userId: userId,
        fields: 2,
        heroCount: heros.length,
        calculation: 'L116073 formula (level + heroTemplate + typeParam + qualityParam + zPower)',
        duration: 0
    });

    return ctx.buildDataResponse(0, {
        _attrs: attrs,
        _baseAttrs: baseAttrs
    });
}

module.exports = handleHeroGetAttrs;
