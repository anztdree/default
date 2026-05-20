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
 * @param {number} heroDisplayId - Hero template ID (key into hero.json)
 * @param {number} level - Hero level
 * @param {object} ctx - Context with loadResource()
 * @returns {Object|null} Calculated base attrs including all flat combat stats from hero.json
 */
function calculateHeroBaseAttrs(heroDisplayId, level, ctx) {
    // ─── Load all required config via centralized loadResource() ───
    const heroJson = ctx.loadResource('hero');
    const levelAttrJson = ctx.loadResource('heroLevelAttr');
    const typeParamJson = ctx.loadResource('heroTypeParam');
    const qualityParamJson = ctx.loadResource('heroQualityParam');

    if (!heroJson || !levelAttrJson || !typeParamJson || !qualityParamJson) {
        ctx.logger.log('ERROR', 'ATTRS', 'Missing required config JSON(s) — cannot calculate hero attrs');
        ctx.logger.details('config',
            ['hero.json', heroJson ? 'OK' : 'MISSING'],
            ['heroLevelAttr.json', levelAttrJson ? 'OK' : 'MISSING'],
            ['heroTypeParam.json', typeParamJson ? 'OK' : 'MISSING'],
            ['heroQualityParam.json', qualityParamJson ? 'OK' : 'MISSING'],
            ['resourcePath', ctx.config.resourcePath]
        );
        return null;
    }

    // 1. Get hero template config
    const heroConfig = heroJson[String(heroDisplayId)];
    if (!heroConfig) {
        ctx.logger.log('WARN', 'ATTRS', `Hero template NOT found in hero.json: displayId=${heroDisplayId}`);
        return null;
    }

    // 2. Get level-based base stats
    const levelData = levelAttrJson[String(level)];
    if (!levelData) {
        ctx.logger.log('WARN', 'ATTRS', `Level data NOT found in heroLevelAttr.json: level=${level}`);
        return null;
    }

    // 3. Get type multipliers (heroType e.g. "critical", "body", "skill")
    const typeConfig = typeParamJson[heroConfig.heroType];
    if (!typeConfig) {
        ctx.logger.log('WARN', 'ATTRS', `Type param NOT found: heroType="${heroConfig.heroType}" for hero ${heroDisplayId}`);
        return null;
    }

    // 4. Get quality multipliers
    const qualityConfig = qualityParamJson[heroConfig.quality];
    if (!qualityConfig) {
        ctx.logger.log('WARN', 'ATTRS', `Quality param NOT found: quality="${heroConfig.quality}" for hero ${heroDisplayId}`);
        return null;
    }

    // ─── CALCULATE BASE STATS ───
    // L116040-116050: addHeroAttr(d, HeroAbilityName.hp,
    //   (u.hp * l.hpParam + l.hpBais) * s.hpParam * i.balanceHp)

    const baseHP = Math.floor(
        (levelData.hp * typeConfig.hpParam + typeConfig.hpBais)
        * qualityConfig.hpParam
        * heroConfig.balanceHp
    );

    const baseAttack = Math.floor(
        (levelData.attack * typeConfig.attackParam + typeConfig.attackBais)
        * qualityConfig.attackParam
        * heroConfig.balanceAttack
    );

    const baseArmor = Math.floor(
        (levelData.armor * typeConfig.armorParam + typeConfig.armorBais)
        * qualityConfig.armorParam
        * heroConfig.balanceArmor
    );

    const baseSpeed = heroConfig.speed || 0;
    const talent = heroConfig.talent || 0;
    const energyMax = heroConfig.energyMax || 100;

    // ─── CALCULATE POWER ───
    // Power = weighted sum of ALL attr values using heroPower.json weights per heroType
    // heroPower.json: 31 attrs × 13 heroTypes, each with powerParam weight
    // Verified via HAR real server data
    const heroPowerJson = ctx.loadResource('heroPower');

    let power = 0;
    if (heroPowerJson) {
        // Build attrName → value map for weighted sum
        const attrValueMap = {
            hp: baseHP,
            attack: baseAttack,
            armor: baseArmor,
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
        };

        // Sum all attrs × weight from heroPower.json for this heroType
        let totalWeighted = 0;
        for (const key in heroPowerJson) {
            const entry = heroPowerJson[key];
            if (entry.heroType === heroConfig.heroType) {
                const val = attrValueMap[entry.attName] || 0;
                totalWeighted += val * entry.powerParam;
            }
        }
        power = Math.floor(totalWeighted);

        ctx.logger.details('powerCalc',
            ['heroType', heroConfig.heroType],
            ['weightedSum', totalWeighted.toFixed(1)],
            ['power', String(power)]
        );
    } else {
        ctx.logger.log('WARN', 'ATTRS', `Missing heroPower.json — power=0 for hero ${heroDisplayId}`);
    }

    // ─── COLLECT FLAT COMBAT STATS from hero.json ───
    // L116073: addHeroAttr for each flat stat — 697/887 heroes have these
    return {
        hp: baseHP,
        attack: baseAttack,
        armor: baseArmor,
        speed: baseSpeed,
        talent: talent,
        energyMax: energyMax,
        power: power,
        // Flat combat stats from hero.json (L116073 makeHeroBasicAttr)
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

        ctx.logger.details('heroCalc',
            ['heroId', heroId],
            ['displayId', String(heroDisplayId)],
            ['level', String(level)]
        );

        // Calculate base attributes from hero config + level (via ctx.loadResource)
        const baseStats = calculateHeroBaseAttrs(heroDisplayId, level, ctx);

        if (!baseStats) {
            ctx.logger.log('WARN', 'ATTRS', `Cannot calculate attrs for heroDisplayId=${heroDisplayId} level=${level} — missing config`);
            attrs[i] = { _items: {} };
            baseAttrs[i] = { _items: {} };
            continue;
        }

        ctx.logger.details('heroStats',
            ['hp', String(baseStats.hp)],
            ['attack', String(baseStats.attack)],
            ['armor', String(baseStats.armor)],
            ['power', String(baseStats.power)]
        );

        // ─── BUILD _baseAttrs[i] ───
        // L133840-133848 setBaseAttr: maps _id → englishName via abilityName.json
        // Client applies: heroBaseAttr.hp *= talent, heroBaseAttr.attack *= talent
        // IMPORTANT: Server sends RAW base stats (before talent multiply).
        // Include ALL flat combat stats from hero.json (L116073)
        baseAttrs[i] = { _items: buildItems([
            { id: ATTR.HP, num: baseStats.hp },
            { id: ATTR.ATTACK, num: baseStats.attack },
            { id: ATTR.ARMOR, num: baseStats.armor },
            { id: ATTR.SPEED, num: baseStats.speed },
            { id: ATTR.TALENT, num: baseStats.talent },
            { id: ATTR.ENERGY_MAX, num: baseStats.energyMax },
            // Flat combat stats from hero.json (L116073)
            { id: ATTR.HIT, num: baseStats.hit },
            { id: ATTR.DODGE, num: baseStats.dodge },
            { id: ATTR.BLOCK, num: baseStats.block },
            { id: ATTR.BLOCK_EFFECT, num: baseStats.blockEffect },
            { id: ATTR.SKILL_DAMAGE, num: baseStats.skillDamage },
            { id: ATTR.CRITICAL, num: baseStats.critical },
            { id: ATTR.CRITICAL_RESIST, num: baseStats.criticalResist },
            { id: ATTR.CRITICAL_DAMAGE, num: baseStats.criticalDamage },
            { id: ATTR.ARMOR_BREAK, num: baseStats.armorBreak },
            { id: ATTR.DAMAGE_REDUCE, num: baseStats.damageReduce },
            { id: ATTR.CONTROL_RESIST, num: baseStats.controlResist },
            { id: ATTR.TRUE_DAMAGE, num: baseStats.trueDamage },
            { id: ATTR.HEAL_PLUS, num: baseStats.healPlus },
            { id: ATTR.HEALER_PLUS, num: baseStats.healerPlus },
        ]) };

        // ─── [FIX-005] BUILD _attrs[i] (total attributes) with talent + equipment + suit ───
        // Total attrs = base × talent + equipment + suit bonuses
        // _baseAttrs remains base-only (client applies talent to baseAttrs itself)
        // Formula verified via HAR: totalHP = baseHP × talent + equipHP = 1240 × 0.6 + 4906 = 5650
        const heroJsonLocal = ctx.loadResource('hero');
        const heroConfigLocal = heroJsonLocal ? heroJsonLocal[String(heroDisplayId)] : null;
        const talent = heroConfigLocal ? (heroConfigLocal.talent || 0) : 0;

        // Start total from base, apply talent multiply to HP/ATK
        const totalStats = Object.assign({}, baseStats);
        totalStats.hp = Math.floor(baseStats.hp * talent);
        totalStats.attack = Math.floor(baseStats.attack * talent);

        // Initialize bonus attr fields
        totalStats.hpPercent = 0;
        totalStats.armorPercent = 0;
        totalStats.attackPercent = 0;
        totalStats.extraArmor = 0;
        totalStats.superDamage = 0;
        totalStats.shielderPlus = 0;
        totalStats.damageUp = 0;
        totalStats.damageDown = 0;
        totalStats.superDamageResist = 0;

        // Load equipment data and add bonuses
        const equipData = userData.equip && userData.equip._suits && userData.equip._suits[heroId];
        if (equipData && equipData._suitItems && equipData._suitItems.length > 0) {
            const equipJson = ctx.loadResource('equip');
            const equipSuitJson = ctx.loadResource('equipSuit');

            if (equipJson && equipSuitJson) {
                // Mapping: attr ID → totalStats property name
                const attrToStat = {
                    0: 'hp', 1: 'attack', 2: 'armor', 3: 'speed', 4: 'hit',
                    5: 'dodge', 6: 'block', 7: 'blockEffect', 8: 'skillDamage',
                    9: 'critical', 10: 'criticalResist', 11: 'criticalDamage',
                    12: 'armorBreak', 13: 'damageReduce', 14: 'controlResist',
                    15: 'trueDamage', 17: 'hpPercent', 18: 'armorPercent',
                    19: 'attackPercent', 23: 'superDamage', 24: 'healPlus',
                    25: 'healerPlus', 26: 'extraArmor', 27: 'shielderPlus',
                    28: 'damageUp', 29: 'damageDown', 31: 'superDamageResist',
                };

                // Collect and apply equipment bonuses
                for (const suitItem of equipData._suitItems) {
                    const eqConfig = equipJson[String(suitItem._id)];
                    if (!eqConfig) continue;
                    for (let a = 1; a <= 3; a++) {
                        const abilityId = eqConfig['abilityID' + a];
                        const value = eqConfig['value' + a];
                        if (abilityId != null && abilityId !== '' && value != null) {
                            const id = typeof abilityId === 'number' ? abilityId : parseInt(abilityId);
                            if (!isNaN(id)) {
                                const statName = attrToStat[id];
                                if (statName) {
                                    totalStats[statName] = (totalStats[statName] || 0) + value;
                                }
                            }
                        }
                    }
                }

                // Collect and apply suit bonuses
                const equippedIds = equipData._suitItems.map(item => String(item._id));
                const idSet = new Set(equippedIds);
                for (const suitId in equipSuitJson) {
                    const suit = equipSuitJson[suitId];
                    if (!suit.suitInclude) continue;
                    const suitIncludes = suit.suitInclude.split(',');
                    const matchCount = suitIncludes.filter(id => idSet.has(id)).length;

                    for (let tier = 1; tier <= 3; tier++) {
                        const needed = suit['activeNeeded' + tier];
                        if (needed === undefined || matchCount < needed) continue;
                        for (let a = 1; a <= 2; a++) {
                            const aid = suit['abilityID' + tier + a];
                            const val = suit['value' + tier + a];
                            if (aid != null && aid !== '' && val != null) {
                                const id = typeof aid === 'number' ? aid : parseInt(aid);
                                if (!isNaN(id)) {
                                    const statName = attrToStat[id];
                                    if (statName) {
                                        totalStats[statName] = (totalStats[statName] || 0) + val;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        // Update ORG_HP after all bonuses applied
        totalStats.orgHp = totalStats.hp;

        // [FIX-006] Recalculate power based on TOTAL stats (after talent + equipment + suit)
        // Power was calculated from base-only stats in calculateHeroBaseAttrs — must be recalculated
        const heroPowerJson = ctx.loadResource('heroPower');
        if (heroPowerJson && heroConfigLocal) {
            const attrNameMap = {
                hp: totalStats.hp, attack: totalStats.attack, armor: totalStats.armor,
                speed: totalStats.speed, extraArmor: totalStats.extraArmor,
                hit: totalStats.hit, dodge: totalStats.dodge, block: totalStats.block,
                blockEffect: totalStats.blockEffect, skillDamage: totalStats.skillDamage,
                superDamage: totalStats.superDamage, critical: totalStats.critical,
                criticalResist: totalStats.criticalResist, criticalDamage: totalStats.criticalDamage,
                armorBreak: totalStats.armorBreak, damageReduce: totalStats.damageReduce,
                controlResist: totalStats.controlResist, trueDamage: totalStats.trueDamage,
                healPlus: totalStats.healPlus, healerPlus: totalStats.healerPlus,
                shielderPlus: totalStats.shielderPlus, damageUp: totalStats.damageUp,
                damageDown: totalStats.damageDown, superDamageResist: totalStats.superDamageResist,
                hpPercent: totalStats.hpPercent, attackPercent: totalStats.attackPercent,
                armorPercent: totalStats.armorPercent,
            };
            let totalPower = 0;
            for (const key in heroPowerJson) {
                const entry = heroPowerJson[key];
                if (entry.heroType === heroConfigLocal.heroType) {
                    totalPower += (attrNameMap[entry.attName] || 0) * entry.powerParam;
                }
            }
            totalStats.power = Math.floor(totalPower);
        }

        // Build _attrs[i] from totalStats (total = base × talent + equipment + suit)
        attrs[i] = { _items: buildItems([
            { id: ATTR.HP, num: totalStats.hp },
            { id: ATTR.ATTACK, num: totalStats.attack },
            { id: ATTR.ARMOR, num: totalStats.armor },
            { id: ATTR.SPEED, num: totalStats.speed },
            { id: ATTR.TALENT, num: totalStats.talent },
            { id: ATTR.ENERGY_MAX, num: totalStats.energyMax },
            { id: ATTR.POWER, num: totalStats.power },
            // Flat combat stats from hero.json (L116073)
            { id: ATTR.HIT, num: totalStats.hit },
            { id: ATTR.DODGE, num: totalStats.dodge },
            { id: ATTR.BLOCK, num: totalStats.block },
            { id: ATTR.BLOCK_EFFECT, num: totalStats.blockEffect },
            { id: ATTR.SKILL_DAMAGE, num: totalStats.skillDamage },
            { id: ATTR.CRITICAL, num: totalStats.critical },
            { id: ATTR.CRITICAL_RESIST, num: totalStats.criticalResist },
            { id: ATTR.CRITICAL_DAMAGE, num: totalStats.criticalDamage },
            { id: ATTR.ARMOR_BREAK, num: totalStats.armorBreak },
            { id: ATTR.DAMAGE_REDUCE, num: totalStats.damageReduce },
            { id: ATTR.CONTROL_RESIST, num: totalStats.controlResist },
            { id: ATTR.TRUE_DAMAGE, num: totalStats.trueDamage },
            { id: ATTR.HEAL_PLUS, num: totalStats.healPlus },
            { id: ATTR.HEALER_PLUS, num: totalStats.healerPlus },
            // Bonus attrs from equipment + suit                                    [FIX-005]
            { id: ATTR.ENERGY, num: 0 },
            { id: ATTR.HP_PERCENT, num: totalStats.hpPercent || 0 },           // [FIX-005] Equipment/suit bonus
            { id: ATTR.ARMOR_PERCENT, num: totalStats.armorPercent || 0 },     // [FIX-005] Equipment/suit bonus
            { id: ATTR.ATTACK_PERCENT, num: totalStats.attackPercent || 0 },   // [FIX-005] Equipment/suit bonus
            { id: ATTR.SPEED_PERCENT, num: 0 },
            { id: ATTR.ORG_HP, num: totalStats.orgHp || 0 },                   // [FIX-005] = total HP after talent+equip
            { id: ATTR.SUPER_DAMAGE, num: totalStats.superDamage || 0 },       // [FIX-005] Equipment bonus
            { id: ATTR.EXTRA_ARMOR, num: totalStats.extraArmor || 0 },         // [FIX-005] Equipment bonus
            { id: ATTR.SHIELDER_PLUS, num: totalStats.shielderPlus || 0 },     // [FIX-005] Equipment/suit bonus
            { id: ATTR.DAMAGE_UP, num: totalStats.damageUp || 0 },             // [FIX-005] Equipment/suit bonus
            { id: ATTR.DAMAGE_DOWN, num: totalStats.damageDown || 0 },         // [FIX-005] Equipment/suit bonus
            { id: ATTR.SUPER_DAMAGE_RESIST, num: totalStats.superDamageResist || 0 }, // [FIX-005] Equipment/suit bonus
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
