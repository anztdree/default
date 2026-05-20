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
 * HeroTotalCost.deserialize (L133362-133410):
 *   Reads e._levelUp._items → creates BasicItem[] for totalCost.levelUp[]
 *   Each _items entry: { _id: itemId, _num: amount }
 *
 * resetTtemsCallBack (L118412-118419):
 *   e._changeInfo._items → for each: setItem(_id, _num) → updates ItemsCommonSingleton
 *
 * RESPONSE FIELDS:
 *   heroId       — REQUIRED (string, used to find hero in HerosManager)
 *   _heroLevel   — new hero level (number, set to heroBaseAttr.level)
 *   _evolveLevel — new evolve level (optional, only if evolved)
 *   _baseAttr    — { _items: { "0": { _id, _num }, ... } } base attrs at new level
 *   _totalAttr   — { _items: { "0": { _id, _num }, ... } } total attrs at new level
 *   _totalCost   — { _levelUp: { _items: { "0": { _id: 131, _num: totalExp }, "1": { _id: 102, _num: totalGold } } } }
 *   _changeInfo  — { _items: { "0": { _id: 131, _num: newExpCount }, "1": { _id: 102, _num: newGoldCount } } }
 *   _equip       — equip data (optional, not relevant for level up)
 *   _linkHeroesBasicAttr  — optional, linked heroes base attrs
 *   _linkHeroesTotalAttr  — optional, linked heroes total attrs
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
 *   Each entry: { id: level, costID1: 131, num1: expCost, costID2: 102, num2: goldCost }
 *   Selection: u[heroQuality][levelEntry] where u = [null, white, green, blue, purple, orange, flicker, super]
 *   Match: entry.id == currentHeroLevel → that's the cost to go FROM current TO next level
 *
 * ITEM IDs (L116237):
 *   GOLDID = 102
 *   EXPERIENCECAPSULEID = 131
 *
 * DATA SOURCE:
 *   userData.heros._heros[heroId] → hero instance
 *   hero.json[heroDisplayId] → hero template (quality, heroType, etc.)
 *   heroLevelUp{Quality}.json[levelKey] → cost for that level
 *   userData.totalProps._items[itemId] → { _id, _num } current item counts
 *
 * STRICT RULES: NO STUB, OVERRIDE, FORCE, BYPASS, DUMMY, ASUMSI
 */

// ─── Item ID constants (from main.min.js L116237) ───
const GOLDID = 102;
const EXPERIENCECAPSULEID = 131;

// ─── Attribute ID constants (from abilityName.json) ───
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
// client indexes array by NUMBER (1-7), but hero.json stores quality as STRING
// Mapping: 1=white, 2=green, 3=blue, 4=purple, 5=orange, 6=flickerOrange, 7=superOrange
// VERIFIED: hero.json quality values = {white, green, blue, purple, orange, flickerOrange, superOrange}
// VERIFIED: all 7 heroLevelUp*.json files exist in resource/json/
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
 * Calculate base attributes for a hero at a given level.
 * Same formula as getAttrs.js — L115997-116073 makeHeroBasicAttr.
 * Duplicated here because getAttrs.js doesn't export it.
 */
function calculateHeroBaseAttrs(heroDisplayId, level, ctx) {
    const heroJson = ctx.loadResource('hero');
    const levelAttrJson = ctx.loadResource('heroLevelAttr');
    const typeParamJson = ctx.loadResource('heroTypeParam');
    const qualityParamJson = ctx.loadResource('heroQualityParam');

    if (!heroJson || !levelAttrJson || !typeParamJson || !qualityParamJson) {
        ctx.logger.log('ERROR', 'LVLUP', 'Missing required config JSON(s)');
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

    // Power calculation
    const heroPowerJson = ctx.loadResource('heroPower');
    let power = 0;
    if (heroPowerJson) {
        const attrValueMap = {
            hp: baseHP, attack: baseAttack, armor: baseArmor,
            speed: baseSpeed, talent: talent, energyMax: energyMax,
            hit: heroConfig.hit || 0, dodge: heroConfig.dodge || 0,
            block: heroConfig.block || 0, blockEffect: heroConfig.blockEffect || 0,
            skillDamage: heroConfig.skillDamage || 0, critical: heroConfig.critical || 0,
            criticalResist: heroConfig.criticalResist || 0,
            criticalDamage: heroConfig.criticalDamage || 0,
            armorBreak: heroConfig.armorBreak || 0,
            damageReduce: heroConfig.damageReduce || 0,
            controlResist: heroConfig.controlResist || 0,
            trueDamage: heroConfig.trueDamage || 0,
            healPlus: heroConfig.healPlus || 0, healerPlus: heroConfig.healerPlus || 0,
        };
        let totalWeighted = 0;
        for (const key in heroPowerJson) {
            const entry = heroPowerJson[key];
            if (entry.heroType === heroConfig.heroType) {
                totalWeighted += (attrValueMap[entry.attName] || 0) * entry.powerParam;
            }
        }
        power = Math.floor(totalWeighted);
    }

    return {
        hp: baseHP, attack: baseAttack, armor: baseArmor,
        speed: baseSpeed, talent: talent, energyMax: energyMax, power: power,
        hit: heroConfig.hit || 0, dodge: heroConfig.dodge || 0,
        block: heroConfig.block || 0, blockEffect: heroConfig.blockEffect || 0,
        skillDamage: heroConfig.skillDamage || 0, critical: heroConfig.critical || 0,
        criticalResist: heroConfig.criticalResist || 0,
        criticalDamage: heroConfig.criticalDamage || 0,
        armorBreak: heroConfig.armorBreak || 0,
        damageReduce: heroConfig.damageReduce || 0,
        controlResist: heroConfig.controlResist || 0,
        trueDamage: heroConfig.trueDamage || 0,
        healPlus: heroConfig.healPlus || 0, healerPlus: heroConfig.healerPlus || 0,
    };
}

/**
 * Build _items object from attr array.
 * Format: { "0": { _id: attrId, _num: value }, ... }
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
 * Build base attr items list (without POWER — that's only in total attrs).
 * Used for _baseAttr in response.
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
 * Build total attr items list (includes POWER + bonus attrs with 0).
 * Used for _totalAttr in response.
 */
function buildTotalAttrItems(stats) {
    return buildItems([
        { id: ATTR.HP, num: stats.hp },
        { id: ATTR.ATTACK, num: stats.attack },
        { id: ATTR.ARMOR, num: stats.armor },
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
        { id: ATTR.HP_PERCENT, num: stats.hpPercent || 0 },           // [FIX-008] Equipment/suit bonus
        { id: ATTR.ARMOR_PERCENT, num: stats.armorPercent || 0 },     // [FIX-008] Equipment/suit bonus
        { id: ATTR.ATTACK_PERCENT, num: stats.attackPercent || 0 },   // [FIX-008] Equipment/suit bonus
        { id: ATTR.SPEED_PERCENT, num: 0 },
        { id: ATTR.ORG_HP, num: stats.orgHp || 0 },                   // [FIX-008] = total HP after talent+equip
        { id: ATTR.SUPER_DAMAGE, num: stats.superDamage || 0 },       // [FIX-008] Equipment bonus
        { id: ATTR.EXTRA_ARMOR, num: stats.extraArmor || 0 },         // [FIX-008] Equipment bonus
        { id: ATTR.SHIELDER_PLUS, num: stats.shielderPlus || 0 },     // [FIX-008] Equipment/suit bonus
        { id: ATTR.DAMAGE_UP, num: stats.damageUp || 0 },             // [FIX-008] Equipment/suit bonus
        { id: ATTR.DAMAGE_DOWN, num: stats.damageDown || 0 },         // [FIX-008] Equipment/suit bonus
        { id: ATTR.SUPER_DAMAGE_RESIST, num: stats.superDamageResist || 0 }, // [FIX-008] Equipment/suit bonus
    ]);
}

/**
 * Get level up cost for a specific hero quality and current level.
 * Matches L134717-134733 getHeroLevelLocal:
 *   u[quality][entry] where entry.id == currentLevel
 * Returns: { num1: expCost, num2: goldCost } or null
 */
function getLevelUpCost(heroQualityStr, currentLevel, ctx) {
    // heroQualityStr = hero.json quality field (string: 'white', 'green', etc.)
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
            // FIX: Last entry in some tables (e.g. White lv220) has costID but NO num1/num2
            // undefined means CANNOT level up — NOT free level up!
            // heroLevelUpWhite[220] = {id:220, costID1:131, costID2:102} ← missing num1, num2
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

    // No cost entry for this level — hero cannot level up further
    return null;
}

/**
 * Get current item count from userData.totalProps._items.
 * Items are stored as: { _id: itemId, _num: count }
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
 * Updates existing or adds new entry.
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
        // Find next available key index
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

    ctx.logger.details('hero',
        ['heroId', heroId],
        ['displayId', String(heroDisplayId)],
        ['currentLevel', String(currentLevel)]
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
            // No cost entry — hero reached max level for this quality
            ctx.logger.details('stop',
                ['reason', 'NO_COST_ENTRY'],
                ['atLevel', String(newLevel)]
            );
            break;
        }

        if (expCapsuleCount < cost.expCost || goldCount < cost.goldCost) {
            // Not enough resources for next level
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

        // Deduct costs
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

    // Update hero level
    heroData._heroBaseAttr._level = newLevel;

    // Update item counts
    setItemCount(userData, EXPERIENCECAPSULEID, expCapsuleCount);
    setItemCount(userData, GOLDID, goldCount);

    // Save user data
    ctx.db.saveUser(userId, userData);

    ctx.logger.details('saved',
        ['heroLevel', String(newLevel)],
        ['expCapsule', String(expCapsuleCount)],
        ['gold', String(goldCount)]
    );

    // ─── STEP 7: Calculate new attrs at new level ───
    const newStats = calculateHeroBaseAttrs(heroDisplayId, newLevel, ctx);
    if (!newStats) {
        ctx.logger.step(4, 4, 'Save data & build response', 'fail',
            `Cannot calculate attrs for displayId=${heroDisplayId} level=${newLevel}`);
        return ctx.buildErrorResponse(1);
    }

    ctx.logger.details('newStats',
        ['hp', String(newStats.hp)],
        ['attack', String(newStats.attack)],
        ['armor', String(newStats.armor)],
        ['power', String(newStats.power)]
    );

    // ─── [FIX-008] Build total attrs with talent + equipment + suit bonuses ───
    // _baseAttr remains base-only (no talent, no equipment) — client applies talent to baseAttr itself
    // Formula verified via HAR: totalHP = baseHP × talent + equipHP = 1240 × 0.6 + 4906 = 5650
    const talent = heroConfig.talent || 0;

    // Start total from base, apply talent multiply to HP/ATK
    const totalStats = Object.assign({}, newStats);
    totalStats.hp = Math.floor(newStats.hp * talent);
    totalStats.attack = Math.floor(newStats.attack * talent);

    // Initialize bonus attr fields that aren't in base stats
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

    // [FIX-009] Recalculate power based on TOTAL stats (after talent + equipment + suit)
    // Power was calculated from base-only stats in calculateHeroBaseAttrs — must be recalculated
    const heroPowerJson = ctx.loadResource('heroPower');
    if (heroPowerJson) {
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
            if (entry.heroType === heroConfig.heroType) {
                totalPower += (attrNameMap[entry.attName] || 0) * entry.powerParam;
            }
        }
        totalStats.power = Math.floor(totalPower);
    }

    ctx.logger.details('totalStats',
        ['hp', String(totalStats.hp)],
        ['attack', String(totalStats.attack)],
        ['armor', String(totalStats.armor)],
        ['extraArmor', String(totalStats.extraArmor)],
        ['power', String(totalStats.power)]
    );

    // ─── BUILD RESPONSE ───
    const response = {
        heroId: heroId,
        _heroLevel: newLevel,
        _baseAttr: { _items: buildBaseAttrItems(newStats) },
        _totalAttr: { _items: buildTotalAttrItems(totalStats) },
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
        { name: '_baseAttr', value: `Object{${Object.keys(response._baseAttr._items).length}}`, status: 'ok', detail: 'L133805: setBaseAttr(e._baseAttr, hero)' },
        { name: '_totalAttr', value: `Object{${Object.keys(response._totalAttr._items).length}}`, status: 'ok', detail: 'L133805: totalAttr loop _totalAttr._items' },
        { name: '_totalCost._levelUp', value: `2 items (exp+gold)`, status: 'ok', detail: 'L133385-133393: totalCost.levelUp[] deserialize' },
        { name: '_changeInfo', value: `2 items (exp+gold)`, status: 'ok', detail: 'L118414-118417: resetTtemsCallBack → setItem(_id, _num)' },
    ]);

    return ctx.buildDataResponse(0, response);
}

module.exports = handleHeroAutoLevelUp;
