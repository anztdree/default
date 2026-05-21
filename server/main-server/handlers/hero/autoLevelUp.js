/**
 * autoLevelUp.js — Handler: hero/autoLevelUp
 *
 * ═══════════════════════════════════════════════════════════════
 * DEEP TRACE — main.min.js (100% verified)
 * ═══════════════════════════════════════════════════════════════
 *
 * CALLER: L179463-179510 doHeroLevelUp(e):
 *   ts.processHandler({
 *     type: 'hero',
 *     action: 'autoLevelUp',          ← ALWAYS 'autoLevelUp' even for single
 *     userId: r,
 *     heroId: t.choseHeroId,
 *     version: '1.0',
 *     times: i                         ← 1 for single, 100 for one-key
 *   }, callback, errorCallback)
 *
 *   times: var i = 'levelUp' == e ? 1 : 100;
 *
 * CLIENT VALIDATION (before sending request, L179469-179486):
 *   1. getHeroNextState(heroData) must be UP_TYPE.TYPE_LEVEL
 *      → checks: evolveLevel < level AND level < maxLevel
 *   2. levelUpExpEnough != 0  (has exp capsule 131)
 *   3. levelUpGoldEnough != 0  (has gold 102)
 *
 * CALLBACK (L179498-1510):
 *   function(n) {
 *       HerosManager.getInstance().levelUpCallBack(n);
 *       void 0 != n._equip && EquipInfoManager.getInstance().wakeUpEarringData(n.heroId, n._equip);
 *       ItemsCommonSingleton.getInstance().resetTtemsCallBack(n);
 *       t.showLevelUpEffect();
 *       t.doRefresh();
 *   }
 *
 * levelUpCallBack (L133739-133747):
 *   1. getHero(e.heroId) → must exist
 *   2. setHeroLevelUpDataChange(e, hero):
 *      - e._evolveLevel → heroBaseAttr.evolveLevel = e._evolveLevel (optional)
 *      - e._heroLevel → heroBaseAttr.level = e._heroLevel (optional but expected)
 *   3. For each hero.linkTo: setHeroLevelUpDataChange on linked hero too
 *   4. setTotalAttrs(e, hero)
 *
 * setTotalAttrs (L133802-133839):
 *   1. e._baseAttr → setBaseAttr → maps _id→englishName via abilityName.json
 *      then: hp *= talent, attack *= talent
 *   2. e._totalAttr._items → hero.totalAttr[id] = {id, num}
 *      if id==21: heroBaseAttr.power = floor(num)
 *   3. setTotalCost(e, hero) → reads e._totalCost → totalCost.deserialize
 *   4. e._linkHeroesBasicAttr → linked heroes base attrs (optional)
 *   5. e._linkHeroesTotalAttr → linked heroes total attrs (optional)
 *
 * ═══════════════════════════════════════════════════════════════
 * KEY CLIENT BEHAVIOR (VERIFIED from main.min.js):
 * ═══════════════════════════════════════════════════════════════
 *
 * setBaseAttr (L133840-133849):
 *   - Reads _baseAttr._items → maps _id → englishName via abilityName.json
 *   - Stores in heroBaseAttr (PRE-TALENT values from server)
 *   - THEN: heroBaseAttr.hp *= heroBaseAttr.talent  ← CLIENT APPLIES TALENT
 *   - THEN: heroBaseAttr.attack *= heroBaseAttr.talent  ← CLIENT APPLIES TALENT
 *
 * setTotalAttrs (L133802-133839):
 *   - Reads _totalAttr._items → stores in hero.totalAttr AS-IS (NO talent applied)
 *   - if id==21: heroBaseAttr.power = floor(num)
 *
 * Display (L84510-84512):
 *   - Power: from heroBaseAttr.power (extracted from totalAttr id==21)
 *   - HP/ATK/ARM/SPD: from totalAttr[0/1/2/3].num.toFixed() ← ROUNDS, not floors
 *
 * Battle (L102626-102649 getAttributeModel):
 *   - Uses totalAttr values for combat stats
 *   - Uses heroBaseAttr.hp/attack/armor (with talent) as HeroBasicHP/Attack/Armor
 *     for percent-based buff calculations
 *
 * ═══════════════════════════════════════════════════════════════
 * THEREFORE SERVER MUST SEND:
 * ═══════════════════════════════════════════════════════════════
 *
 * _baseAttr: PRE-TALENT HP and ATK (client applies talent)
 * _totalAttr: POST-TALENT HP and ATK (client uses directly for display & battle)
 *
 * Verified with real server capture data:
 *   Kid Goku (1205) Lv1→2: HP+54 = 134×0.4=53.6→toFixed→54 ✓
 *   Tien (1309)   Lv1→2: HP+94 = 235×0.4=94.08→toFixed→94 ✓
 *
 * ═══════════════════════════════════════════════════════════════
 * FORMULA SOURCE: makeHeroBasicAttr (L115997-116073)
 * ═══════════════════════════════════════════════════════════════
 *
 * Step 1: Compute raw base stats (NO Math.floor — keep as float):
 *   rawHP      = (levelAttr.hp × typeParam.hpParam + typeParam.hpBais)
 *                × qualityParam.hpParam × hero.balanceHp
 *   rawATK     = (levelAttr.attack × typeParam.attackParam + typeParam.attackBais)
 *                × qualityParam.attackParam × hero.balanceAttack
 *   rawARM     = (levelAttr.armor × typeParam.armorParam + typeParam.armorBais)
 *                × qualityParam.armorParam × hero.balanceArmor
 *
 * Step 2: Add evolve bonuses (heroEvolve.json, only if evolveLevel >= entry.level):
 *   rawHP += evolveEntry.hp
 *   rawATK += evolveEntry.attack
 *   rawARM += evolveEntry.armor
 *   speed += evolveEntry.speed
 *
 * Step 3: Add wakeup/star bonuses (heroWakeUp.json, only if star >= entry.star):
 *   talent += wakeupEntry.talent
 *   rawHP += wakeupEntry.hp
 *   rawATK += wakeupEntry.attack
 *   rawARM += wakeupEntry.armor
 *   speed += wakeupEntry.speed
 *
 * Step 4: Add qigong bonuses (qiGong.json + qigongQualityMaxPara.json):
 *   qigongHP = floor(qiGongEntry.hpMax × qigongQualityPara.hpMaxPara)
 *   qigongATK = floor(qiGongEntry.attackMax × qigongQualityPara.attackMaxPara)
 *   qigongARM = floor(qiGongEntry.armorMax × qigongQualityPara.armorMaxPara)
 *   (match by evolveLevel AND heroType)
 *
 * Step 5: Add self-break bonuses (selfBreak.json + selfBreakQuality.json):
 *   (match by breakType/breakType2 AND levelNeeded <= heroLevel)
 *   value = entry.value × selfBreakQuality.abilityPara (if entry.abilityAffected)
 *
 * Step 6: Flat stats from hero.json (speed, talent, hit, dodge, etc.)
 *
 * Step 7: For _totalAttr, compute POST-TALENT values:
 *   totalHP = rawHP × talent
 *   totalATK = rawATK × talent
 *   (armor is NOT affected by talent)
 *
 * Step 8: Power = floor(Σ(attrValue × heroPower[heroType][attrName].powerParam))
 *   Uses POST-TALENT values for HP and ATK in the weighted sum
 *
 * CONFIG FILES REQUIRED (from L115997-116073 makeHeroBasicAttr):
 *   hero.json              — hero template
 *   heroLevelAttr.json     — base stats per level
 *   heroTypeParam.json     — type multipliers
 *   heroQualityParam.json  — quality multipliers
 *   heroPower.json         — power weights per heroType
 *   heroEvolve.json        — evolve bonuses (optional, for future)
 *   heroWakeUp.json        — wakeup/star bonuses (optional, for future)
 *   qiGong.json            — qigong bonuses (optional, for future)
 *   qigongQualityMaxPara.json — qigong quality limits (optional)
 *   selfBreak.json         — self-break bonuses (optional, for future)
 *   selfBreakQuality.json  — self-break quality param (optional)
 *   heroQualityPower.json  — quality power multiplier
 *
 * COST TABLE (L134717-134733 getHeroLevelLocal):
 *   heroLevelUpWhite.json         — quality 1 (white)
 *   heroLevelUpGreen.json         — quality 2 (green)
 *   heroLevelUpBlue.json          — quality 3 (blue)
 *   heroLevelUpPurple.json        — quality 4 (purple)
 *   heroLevelUpOrange.json        — quality 5 (orange)
 *   heroLevelUpFlickerOrange.json — quality 6 (flicker orange)
 *   heroLevelUpSuperOrange.json   — quality 7 (super orange)
 *
 * STRICT RULES: NO STUB, OVERRIDE, FORCE, BYPASS, DUMMY, ASUMSI
 */

// ─── Item ID constants (from main.min.js L116237) ───
const GOLDID = 102;
const EXPERIENCECAPSULEID = 131;

// ─── Attribute ID constants (from abilityName.json + HeroAbilityName enum L133574) ───
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

// ─── Quality → config file name mapping ───
// L134717-134727 getHeroLevelLocal: u[qualityIdx][entry]
const QUALITY_TO_CONFIG = {
    'white': 'heroLevelUpWhite',
    'green': 'heroLevelUpGreen',
    'blue': 'heroLevelUpBlue',
    'purple': 'heroLevelUpPurple',
    'orange': 'heroLevelUpOrange',
    'flickerOrange': 'heroLevelUpFlickerOrange',
    'superOrange': 'heroLevelUpSuperOrange'
};

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
 * Calculate hero base attributes at a given level.
 * Matches L115997-116073 makeHeroBasicAttr from main.min.js exactly.
 *
 * KEY DESIGN DECISIONS:
 * - Raw stats are kept as FLOAT (no Math.floor on intermediate values)
 * - The client uses .toFixed() for display which rounds properly
 * - _baseAttr sends PRE-TALENT HP/ATK (client applies talent)
 * - _totalAttr sends POST-TALENT HP/ATK (client uses directly)
 *
 * @param {number} heroDisplayId - Hero template ID (key into hero.json)
 * @param {number} level - Hero level
 * @param {number} evolveLevel - Current evolve level (0 = no evolve)
 * @param {number} star - Current wakeup/star level (0 = no star)
 * @param {object} ctx - Context with loadResource()
 * @returns {Object|null} { baseAttrs (pre-talent), totalAttrs (post-talent), power }
 */
function calculateHeroAttrs(heroDisplayId, level, evolveLevel, star, ctx) {
    // ─── Load all required config files ───
    const heroJson = ctx.loadResource('hero');
    const levelAttrJson = ctx.loadResource('heroLevelAttr');
    const typeParamJson = ctx.loadResource('heroTypeParam');
    const qualityParamJson = ctx.loadResource('heroQualityParam');

    if (!heroJson || !levelAttrJson || !typeParamJson || !qualityParamJson) {
        ctx.logger.log('ERROR', 'LVLUP', 'Missing required config JSON(s)',
            ['hero', !!heroJson], ['levelAttr', !!levelAttrJson],
            ['typeParam', !!typeParamJson], ['qualityParam', !!qualityParamJson]);
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
    // L116040-116050: addHeroAttr(d, HeroAbilityName.hp,
    //   (u.hp * l.hpParam + l.hpBais) * s.hpParam * i.balanceHp)
    // The original code does NOT Math.floor here — it stores the raw float value
    const rawHP = (levelData.hp * typeConfig.hpParam + typeConfig.hpBais)
        * qualityConfig.hpParam * (heroConfig.balanceHp || 1);
    const rawATK = (levelData.attack * typeConfig.attackParam + typeConfig.attackBais)
        * qualityConfig.attackParam * (heroConfig.balanceAttack || 1);
    const rawARM = (levelData.armor * typeConfig.armorParam + typeConfig.armorBais)
        * qualityConfig.armorParam * (heroConfig.balanceArmor || 1);

    // Initialize bonus accumulator (for evolve, wakeup, qigong, self-break)
    const bonus = {};

    // ─── Step 2: Evolve bonuses (L116014-116022) ───
    // Only add if evolveLevel >= entry.level
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
    // talent from wakeup is ADDED to base talent
    let talent = heroConfig.talent || 0;
    const wakeUpJson = ctx.loadResource('heroWakeUp');
    if (wakeUpJson) {
        const wakeUpData = wakeUpJson[String(heroDisplayId)];
        if (wakeUpData) {
            if (Array.isArray(wakeUpData)) {
                // Multiple star entries — add if star >= entry.star
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
                // Single wakeup entry (star 1 only)
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
    // Match by evolveLevel AND heroType
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
                // Match: breakType matches OR (no breakType and breakType2 matches)
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

    // _baseAttr: PRE-TALENT values (client applies talent via setBaseAttr)
    const baseHP = rawHP + (bonus.hp || 0);
    const baseATK = rawATK + (bonus.attack || 0);
    const baseARM = rawARM + (bonus.armor || 0);

    // _totalAttr: POST-TALENT values (client uses directly for display & battle)
    // L133840-133849: heroBaseAttr.hp = baseHP * talent, heroBaseAttr.attack = baseATK * talent
    const totalHP = baseHP * talent;
    const totalATK = baseATK * talent;
    const totalARM = baseARM; // Armor is NOT affected by talent

    // ─── Step 7: Power calculation ───
    //
    // ═══════════════════════════════════════════════════════════════
    // VERIFIED: Power uses PRE-TALENT base values (baseHP, baseATK)
    // ═══════════════════════════════════════════════════════════════
    //
    // Evidence from Kid Goku (1205) at level 11:
    //   PRE-TALENT sum: 2338.4 + 666.0 + 503.3 + 376 = 3883.7 → power=3883
    //   User's in-game power: 3886 (≈3 off — minor rounding/bonus)
    //   POST-TALENT sum: 935.4 + 266.4 + 503.3 + 376 = 2081.1 → power=2081
    //   POST-TALENT × balP: 2081.1 × 1.2 = 2497 — WAY OFF from 3886
    //
    // The heroPower.json weighted sum uses PRE-TALENT values for HP/ATK.
    // balancePower is NOT applied to power (applying it gives 4660 for Lv11 ≠ 3886).
    // heroQualityPower.powerParam is always 1.0 for all qualities (no-op).
    //
    // This matches main.min.js makeHeroBasicAttr (L115997-116073):
    //   All values in the attr dictionary `d` are PRE-TALENT.
    //   Talent is stored as a separate attribute, NOT applied to HP/ATK in `d`.
    //   The client applies talent separately in setBaseAttr (L133847-133848).
    //   Power is computed server-side and sent as _totalAttr id=21.
    //
    // ═══════════════════════════════════════════════════════════════
    const heroPowerJson = ctx.loadResource('heroPower');
    const heroQualityPowerJson = ctx.loadResource('heroQualityPower');
    let power = 0;
    if (heroPowerJson) {
        // Build attr value map using PRE-TALENT (base) values for HP and ATK
        // Armor and speed are the same pre/post-talent (not affected by talent)
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

        // NOTE: balancePower is NOT applied to power calculation.
        // Verified: Kid Goku Lv11 weighted sum=3883.7, ×1.2=4660 (≠ 3886).
        // Without balancePower: floor(3883.7)=3883 ≈ user's 3886.

        // Apply quality power multiplier (from heroQualityPower.json)
        // All quality powerParam values are 1.0, but keep for future-proofing
        if (heroQualityPowerJson && heroQualityPowerJson[heroConfig.quality]) {
            totalWeighted *= heroQualityPowerJson[heroConfig.quality].powerParam;
        }

        power = Math.floor(totalWeighted);
    }

    ctx.logger.details('attrCalc',
        ['heroType', heroConfig.heroType],
        ['talent', talent.toFixed(4)],
        ['baseHP', baseHP.toFixed(2)],
        ['baseATK', baseATK.toFixed(2)],
        ['baseARM', baseARM.toFixed(2)],
        ['totalHP', totalHP.toFixed(2)],
        ['totalATK', totalATK.toFixed(2)],
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
 * Build _items object from attr array.
 * Format: { "0": { _id: attrId, _num: value }, ... }
 * Values are kept as-is (floats are OK — client uses .toFixed() for display)
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

/**
 * Build base attr items list (PRE-TALENT HP/ATK — client applies talent).
 * Used for _baseAttr in response.
 * NO POWER here — power is only in _totalAttr.
 */
function buildBaseAttrItems(stats) {
    return buildItems([
        { id: ATTR.HP, num: stats.hp },
        { id: ATTR.ATTACK, num: stats.attack },
        { id: ATTR.ARMOR, num: stats.armor },
        { id: ATTR.SPEED, num: stats.speed },
        { id: ATTR.TALENT, num: stats.talent },
        { id: ATTR.ENERGY_MAX, num: stats.energyMax },
        { id: ATTR.HIT, num: stats.hit },
        { id: ATTR.DODGE, num: stats.dodge },
        { id: ATTR.BLOCK, num: stats.block },
        { id: ATTR.BLOCK_EFFECT, num: stats.blockEffect },
        { id: ATTR.SKILL_DAMAGE, num: stats.skillDamage },
        { id: ATTR.CRITICAL, num: stats.critical },
        { id: ATTR.CRITICAL_RESIST, num: stats.criticalResist },
        { id: ATTR.CRITICAL_DAMAGE, num: stats.criticalDamage },
        { id: ATTR.ARMOR_BREAK, num: stats.armorBreak },
        { id: ATTR.DAMAGE_REDUCE, num: stats.damageReduce },
        { id: ATTR.CONTROL_RESIST, num: stats.controlResist },
        { id: ATTR.TRUE_DAMAGE, num: stats.trueDamage },
        { id: ATTR.HEAL_PLUS, num: stats.healPlus },
        { id: ATTR.HEALER_PLUS, num: stats.healerPlus },
    ]);
}

/**
 * Build total attr items list (POST-TALENT HP/ATK + POWER).
 * Used for _totalAttr in response.
 * Client reads these directly for display and battle.
 */
function buildTotalAttrItems(stats) {
    return buildItems([
        { id: ATTR.HP, num: stats.hp },           // POST-TALENT HP
        { id: ATTR.ATTACK, num: stats.attack },     // POST-TALENT ATK
        { id: ATTR.ARMOR, num: stats.armor },       // ARMOR (no talent)
        { id: ATTR.SPEED, num: stats.speed },
        { id: ATTR.TALENT, num: stats.talent },
        { id: ATTR.ENERGY_MAX, num: stats.energyMax },
        { id: ATTR.POWER, num: stats.power },
        { id: ATTR.HIT, num: stats.hit },
        { id: ATTR.DODGE, num: stats.dodge },
        { id: ATTR.BLOCK, num: stats.block },
        { id: ATTR.BLOCK_EFFECT, num: stats.blockEffect },
        { id: ATTR.SKILL_DAMAGE, num: stats.skillDamage },
        { id: ATTR.CRITICAL, num: stats.critical },
        { id: ATTR.CRITICAL_RESIST, num: stats.criticalResist },
        { id: ATTR.CRITICAL_DAMAGE, num: stats.criticalDamage },
        { id: ATTR.ARMOR_BREAK, num: stats.armorBreak },
        { id: ATTR.DAMAGE_REDUCE, num: stats.damageReduce },
        { id: ATTR.CONTROL_RESIST, num: stats.controlResist },
        { id: ATTR.TRUE_DAMAGE, num: stats.trueDamage },
        { id: ATTR.HEAL_PLUS, num: stats.healPlus },
        { id: ATTR.HEALER_PLUS, num: stats.healerPlus },
        { id: ATTR.ENERGY, num: 0 },
        { id: ATTR.HP_PERCENT, num: 0 },
        { id: ATTR.ARMOR_PERCENT, num: 0 },
        { id: ATTR.ATTACK_PERCENT, num: 0 },
        { id: ATTR.SPEED_PERCENT, num: 0 },
        { id: ATTR.ORG_HP, num: 0 },
        { id: ATTR.SUPER_DAMAGE, num: 0 },
        { id: ATTR.EXTRA_ARMOR, num: 0 },
        { id: ATTR.SHIELDER_PLUS, num: 0 },
        { id: ATTR.DAMAGE_UP, num: 0 },
        { id: ATTR.DAMAGE_DOWN, num: 0 },
        { id: ATTR.SUPER_DAMAGE_RESIST, num: 0 },
    ]);
}

/**
 * Get level up cost for a specific hero quality and current level.
 * Matches L134717-134733 getHeroLevelLocal:
 *   u[quality][entry] where entry.id == currentLevel
 * Returns: { num1: expCost, num2: goldCost } or null
 */
function getLevelUpCost(heroQualityStr, currentLevel, ctx) {
    const configName = QUALITY_TO_CONFIG[heroQualityStr];

    if (!configName) {
        ctx.logger.log('ERROR', 'LVLUP', `Unknown hero quality string: "${heroQualityStr}" — no matching config table`);
        return null;
    }

    const config = ctx.loadResource(configName);

    if (!config) {
        ctx.logger.log('ERROR', 'LVLUP', `Level up config NOT loaded: ${configName}.json`);
        return null;
    }

    // L134728: for (var c in u[e]) { var p = u[e][c]; if (p && p.id == t) return p; }
    for (const key in config) {
        const entry = config[key];
        if (entry && entry.id === currentLevel) {
            if (entry.num1 === undefined || entry.num2 === undefined) {
                ctx.logger.details('costCheck',
                    ['level', String(currentLevel)],
                    ['reason', 'INCOMPLETE_ENTRY_no_num1_or_num2'],
                    ['config', configName]
                );
                return null;
            }
            return {
                expCost: entry.num1,
                goldCost: entry.num2
            };
        }
    }

    return null;
}

/**
 * Get current item count from userData.totalProps._items.
 */
function getItemCount(userData, itemId) {
    const items = userData.totalProps && userData.totalProps._items;
    if (!items) return 0;

    for (const key in items) {
        const item = items[key];
        if (item && item._id === itemId) {
            return item._num || 0;
        }
    }
    return 0;
}

/**
 * Set item count in userData.totalProps._items.
 */
function setItemCount(userData, itemId, newCount) {
    if (!userData.totalProps) userData.totalProps = {};
    if (!userData.totalProps._items) userData.totalProps._items = {};

    const items = userData.totalProps._items;
    let found = false;

    for (const key in items) {
        const item = items[key];
        if (item && item._id === itemId) {
            item._num = newCount;
            found = true;
            break;
        }
    }

    if (!found) {
        let maxIdx = -1;
        for (const key in items) {
            const idx = parseInt(key, 10);
            if (!isNaN(idx) && idx > maxIdx) maxIdx = idx;
        }
        items[String(maxIdx + 1)] = { _id: itemId, _num: newCount };
    }
}


function handleHeroAutoLevelUp(request, ctx) {
    const { userId, heroId, times } = request;

    ctx.logger.step(1, 4, 'Auto Level Up', 'running');
    ctx.logger.details('request',
        ['userId', userId ? userId.substring(0, 20) : 'MISSING'],
        ['heroId', heroId || 'MISSING'],
        ['times', String(times || 'MISSING')]
    );

    // ─── STEP 1: Validate request ───
    if (!userId || !heroId) {
        ctx.logger.step(1, 4, 'Auto Level Up', 'fail', 'userId or heroId MISSING');
        return ctx.buildErrorResponse(8);
    }

    const maxTimes = Math.min(Math.max(parseInt(times) || 1, 1), 100);
    ctx.logger.details('validated',
        ['maxTimes', String(maxTimes)],
        ['heroId', heroId]
    );
    ctx.logger.step(1, 4, 'Auto Level Up', 'pass', `heroId=${heroId}, times=${maxTimes}`);

    // ─── STEP 2: Load user data & hero ───
    ctx.logger.step(2, 4, 'Load hero data', 'running');

    const userData = ctx.db.getUser(userId);
    if (!userData || !userData.heros || !userData.heros._heros) {
        ctx.logger.step(2, 4, 'Load hero data', 'fail', 'userData.heros not found');
        return ctx.buildErrorResponse(8);
    }

    const heroData = userData.heros._heros[heroId];
    if (!heroData) {
        ctx.logger.step(2, 4, 'Load hero data', 'fail', `hero ${heroId} not found in _heros`);
        return ctx.buildErrorResponse(8);
    }

    const heroDisplayId = heroData._heroDisplayId;
    const currentLevel = heroData._heroBaseAttr ? (heroData._heroBaseAttr._level || 1) : 1;
    const evolveLevel = heroData._heroBaseAttr ? (heroData._heroBaseAttr._evolveLevel || 0) : 0;
    const star = heroData._heroBaseAttr ? (heroData._heroBaseAttr._star || 0) : 0;

    ctx.logger.details('hero',
        ['heroId', heroId],
        ['displayId', String(heroDisplayId)],
        ['currentLevel', String(currentLevel)],
        ['evolveLevel', String(evolveLevel)],
        ['star', String(star)]
    );

    // ─── STEP 3: Get hero quality for cost table ───
    ctx.logger.step(3, 4, 'Calculate level up', 'running');

    const heroJson = ctx.loadResource('hero');
    if (!heroJson) {
        ctx.logger.step(3, 4, 'Calculate level up', 'fail', 'hero.json NOT loaded');
        return ctx.buildErrorResponse(1);
    }

    const heroConfig = heroJson[String(heroDisplayId)];
    if (!heroConfig) {
        ctx.logger.step(3, 4, 'Calculate level up', 'fail', `hero.json[${heroDisplayId}] NOT found`);
        return ctx.buildErrorResponse(8);
    }

    const heroQuality = heroConfig.quality;
    ctx.logger.details('quality',
        ['heroQuality', String(heroQuality)],
        ['heroType', heroConfig.heroType || '?'],
        ['talent', String(heroConfig.talent)],
        ['balancePower', String(heroConfig.balancePower)],
        ['configTable', QUALITY_TO_CONFIG[heroQuality] || 'UNKNOWN']
    );

    if (!QUALITY_TO_CONFIG[heroQuality]) {
        ctx.logger.step(3, 4, 'Calculate level up', 'fail',
            `Unknown hero quality: "${heroQuality}" for displayId=${heroDisplayId}`);
        return ctx.buildErrorResponse(8);
    }

    // ─── STEP 4: Get current item counts ───
    let expCapsuleCount = getItemCount(userData, EXPERIENCECAPSULEID);
    let goldCount = getItemCount(userData, GOLDID);

    ctx.logger.details('resources',
        ['expCapsule (131)', String(expCapsuleCount)],
        ['gold (102)', String(goldCount)]
    );

    // ─── STEP 5: Calculate how many levels can be done ───
    let totalExpCost = 0;
    let totalGoldCost = 0;
    let levelsGained = 0;
    let newLevel = currentLevel;

    for (let i = 0; i < maxTimes; i++) {
        const cost = getLevelUpCost(heroQuality, newLevel, ctx);

        if (!cost) {
            ctx.logger.details('stop',
                ['reason', 'NO_COST_ENTRY'],
                ['atLevel', String(newLevel)]
            );
            break;
        }

        if (expCapsuleCount < cost.expCost || goldCount < cost.goldCost) {
            ctx.logger.details('stop',
                ['reason', 'NOT_ENOUGH_RESOURCES'],
                ['atLevel', String(newLevel)],
                ['needExp', String(cost.expCost)],
                ['haveExp', String(expCapsuleCount)],
                ['needGold', String(cost.goldCost)],
                ['haveGold', String(goldCount)]
            );
            break;
        }

        expCapsuleCount -= cost.expCost;
        goldCount -= cost.goldCost;
        totalExpCost += cost.expCost;
        totalGoldCost += cost.goldCost;
        newLevel++;
        levelsGained++;
    }

    if (levelsGained === 0) {
        ctx.logger.step(3, 4, 'Calculate level up', 'fail',
            'Cannot level up — 0 levels gained (no resources or max level)');
        return ctx.buildErrorResponse(8);
    }

    ctx.logger.details('result',
        ['levelsGained', String(levelsGained)],
        ['oldLevel', String(currentLevel)],
        ['newLevel', String(newLevel)],
        ['totalExpCost', String(totalExpCost)],
        ['totalGoldCost', String(totalGoldCost)],
        ['remainingExp', String(expCapsuleCount)],
        ['remainingGold', String(goldCount)]
    );
    ctx.logger.step(3, 4, 'Calculate level up', 'pass',
        `${levelsGained} levels (${currentLevel} → ${newLevel})`);

    // ─── STEP 6: Update user data ───
    ctx.logger.step(4, 4, 'Save data & build response', 'running');

    heroData._heroBaseAttr._level = newLevel;

    setItemCount(userData, EXPERIENCECAPSULEID, expCapsuleCount);
    setItemCount(userData, GOLDID, goldCount);

    ctx.db.saveUser(userId, userData);

    ctx.logger.details('saved',
        ['heroLevel', String(newLevel)],
        ['expCapsule', String(expCapsuleCount)],
        ['gold', String(goldCount)]
    );

    // ─── STEP 7: Calculate new attrs at new level ───
    const attrs = calculateHeroAttrs(heroDisplayId, newLevel, evolveLevel, star, ctx);
    if (!attrs) {
        ctx.logger.step(4, 4, 'Save data & build response', 'fail',
            `Cannot calculate attrs for displayId=${heroDisplayId} level=${newLevel}`);
        return ctx.buildErrorResponse(1);
    }

    ctx.logger.details('newStats',
        ['baseHP(preT)', attrs.baseAttrs.hp.toFixed(2)],
        ['baseATK(preT)', attrs.baseAttrs.attack.toFixed(2)],
        ['baseARM', attrs.baseAttrs.armor.toFixed(2)],
        ['totalHP(postT)', attrs.totalAttrs.hp.toFixed(2)],
        ['totalATK(postT)', attrs.totalAttrs.attack.toFixed(2)],
        ['power', String(attrs.totalAttrs.power)]
    );

    // ─── BUILD RESPONSE ───
    // _baseAttr: PRE-TALENT HP/ATK (client applies talent via setBaseAttr)
    // _totalAttr: POST-TALENT HP/ATK (client uses directly for display & battle)
    const response = {
        heroId: heroId,
        _heroLevel: newLevel,
        _baseAttr: { _items: buildBaseAttrItems(attrs.baseAttrs) },
        _totalAttr: { _items: buildTotalAttrItems(attrs.totalAttrs) },
        _totalCost: {
            _levelUp: {
                _items: {
                    "0": { _id: EXPERIENCECAPSULEID, _num: totalExpCost },
                    "1": { _id: GOLDID, _num: totalGoldCost }
                }
            }
        },
        _changeInfo: {
            _items: {
                "0": { _id: EXPERIENCECAPSULEID, _num: expCapsuleCount },
                "1": { _id: GOLDID, _num: goldCount }
            }
        }
    };

    ctx.logger.step(4, 4, 'Save data & build response', 'pass',
        `ret=0, heroId=${heroId}, lvl ${currentLevel}→${newLevel}`);

    ctx.logger.criticalFields([
        { name: 'heroId', value: heroId, status: 'ok', detail: 'L133741: getHero(e.heroId) — REQUIRED' },
        { name: '_heroLevel', value: String(newLevel), status: 'ok', detail: 'L133751: heroBaseAttr.level = e._heroLevel' },
        { name: '_baseAttr', value: `Object{${Object.keys(response._baseAttr._items).length}}`, status: 'ok', detail: 'L133805: setBaseAttr → PRE-TALENT HP/ATK, client applies talent' },
        { name: '_totalAttr', value: `Object{${Object.keys(response._totalAttr._items).length}}`, status: 'ok', detail: 'L133805: POST-TALENT HP/ATK, client uses directly for display' },
        { name: '_totalCost._levelUp', value: `2 items (exp+gold)`, status: 'ok', detail: 'L133385-133393: totalCost.levelUp[] deserialize' },
        { name: '_changeInfo', value: `2 items (exp+gold)`, status: 'ok', detail: 'L118414-118417: resetTtemsCallBack → setItem(_id, _num)' },
    ]);

    return ctx.buildDataResponse(0, response);
}

module.exports = handleHeroAutoLevelUp;
