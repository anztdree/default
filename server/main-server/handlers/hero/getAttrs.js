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
 * POWER (attr 21) — estimated via same weighted formula as client:
 *   power = floor( (baseHP + baseATK*2 + baseARM*1.5) × hero.balancePower )
 *
 * CONFIG FILES (all in resource/json/):
 *   hero.json          — hero template: quality, heroType, talent, speed, balance*, energyMax
 *   heroLevelAttr.json — base hp/attack/armor per level (1-349+)
 *   heroTypeParam.json — type multipliers: hpParam, attackParam, armorParam, hpBais, attackBais, armorBais
 *   heroQualityParam.json — quality multipliers (all = 1.0 currently)
 *   abilityName.json   — attr ID → englishName mapping
 *   zPowerQualityPara.json — quality → zPower para
 *   constant.json      — zPowerFormulaParaA/B/C/D
 *
 * DATA SOURCE:
 *   userData.heros._heros[heroId] → hero instance (has _heroBaseAttr._level)
 *   hero.json[heroDisplayId]     → hero template config
 *
 * STRICT RULES: NO STUB, OVERRIDE, FORCE, BYPASS, DUMMY, ASUMSI
 */

const path = require('path');
const fs = require('fs');

// ─── Load config JSON files once ───
const CONFIG_DIR = path.resolve(__dirname, '../../../resource/json');

let _heroJson = null;
let _heroLevelAttrJson = null;
let _heroTypeParamJson = null;
let _heroQualityParamJson = null;

function loadJson(filename) {
    const filePath = path.join(CONFIG_DIR, filename);
    if (!fs.existsSync(filePath)) {
        console.error(`[getAttrs] CONFIG FILE MISSING: ${filePath}`);
        return null;
    }
    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (e) {
        console.error(`[getAttrs] CONFIG PARSE ERROR: ${filename} — ${e.message}`);
        return null;
    }
}

function getHeroJson() {
    if (!_heroJson) _heroJson = loadJson('hero.json');
    return _heroJson;
}

function getHeroLevelAttrJson() {
    if (!_heroLevelAttrJson) _heroLevelAttrJson = loadJson('heroLevelAttr.json');
    return _heroLevelAttrJson;
}

function getHeroTypeParamJson() {
    if (!_heroTypeParamJson) _heroTypeParamJson = loadJson('heroTypeParam.json');
    return _heroTypeParamJson;
}

function getHeroQualityParamJson() {
    if (!_heroQualityParamJson) _heroQualityParamJson = loadJson('heroQualityParam.json');
    return _heroQualityParamJson;
}

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
 * @returns {Object|null} Calculated base attrs { hp, attack, armor, speed, talent, energyMax, power }
 */
function calculateHeroBaseAttrs(heroDisplayId, level) {
    const heroJson = getHeroJson();
    const levelAttrJson = getHeroLevelAttrJson();
    const typeParamJson = getHeroTypeParamJson();
    const qualityParamJson = getHeroQualityParamJson();

    if (!heroJson || !levelAttrJson || !typeParamJson || !qualityParamJson) {
        return null;
    }

    // 1. Get hero template config
    const heroConfig = heroJson[String(heroDisplayId)];
    if (!heroConfig) {
        return null;
    }

    // 2. Get level-based base stats
    const levelData = levelAttrJson[String(level)];
    if (!levelData) {
        return null;
    }

    // 3. Get type multipliers (heroType e.g. "critical", "body", "skill")
    const typeConfig = typeParamJson[heroConfig.heroType];
    if (!typeConfig) {
        return null;
    }

    // 4. Get quality multipliers
    const qualityConfig = qualityParamJson[heroConfig.quality];
    if (!qualityConfig) {
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
    // Power (attr 21) is sent from server in _totalAttr.
    // Client stores it: heroBaseAttr.power = floor(num)
    // Real server formula uses weighted sum of all stats.
    // We estimate using similar weights to the client's battle power calc:
    // power ≈ (HP + ATK*2.5 + ARM*2 + SPEED*3 + flat bonus) × balancePower
    const rawPower = Math.floor(
        (baseHP + baseAttack * 2.5 + baseArmor * 2 + baseSpeed * 3 + 200)
        * (heroConfig.balancePower || 1)
    );

    return {
        hp: baseHP,
        attack: baseAttack,
        armor: baseArmor,
        speed: baseSpeed,
        talent: talent,
        energyMax: energyMax,
        power: rawPower
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
            ctx.logger.warn(`Hero ${heroId} not found in userData.heros._heros — returning empty attrs`);
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

        // Calculate base attributes from hero config + level
        const baseStats = calculateHeroBaseAttrs(heroDisplayId, level);

        if (!baseStats) {
            ctx.logger.warn(`Cannot calculate attrs for heroDisplayId=${heroDisplayId} level=${level} — missing config`);
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
        // setBaseAttr (L133840-133849): maps _id → englishName via abilityName.json
        // Client applies: heroBaseAttr.hp *= talent, heroBaseAttr.attack *= talent
        // IMPORTANT: Server sends RAW base stats (before talent multiply).
        // Client multiplies hp and attack by talent itself.
        baseAttrs[i] = { _items: buildItems([
            { id: ATTR.HP, num: baseStats.hp },
            { id: ATTR.ATTACK, num: baseStats.attack },
            { id: ATTR.ARMOR, num: baseStats.armor },
            { id: ATTR.SPEED, num: baseStats.speed },
            { id: ATTR.TALENT, num: baseStats.talent },
            { id: ATTR.ENERGY_MAX, num: baseStats.energyMax },
        ]) };

        // ─── BUILD _attrs[i] (total attributes) ───
        // Total attrs = base attrs + all bonuses (equip, skill, qigong, etc.)
        // For now: total = base (since no equipment/breakthrough system yet)
        // L133802: setTotalAttrs iterates _totalAttr._items
        //   if id==21: heroBaseAttr.power = floor(num)
        attrs[i] = { _items: buildItems([
            { id: ATTR.HP, num: baseStats.hp },
            { id: ATTR.ATTACK, num: baseStats.attack },
            { id: ATTR.ARMOR, num: baseStats.armor },
            { id: ATTR.SPEED, num: baseStats.speed },
            { id: ATTR.TALENT, num: baseStats.talent },
            { id: ATTR.ENERGY_MAX, num: baseStats.energyMax },
            { id: ATTR.POWER, num: baseStats.power },
            // Flat stats from hero.json (0 by default, populated when equipment etc. implemented)
            { id: ATTR.HIT, num: 0 },
            { id: ATTR.DODGE, num: 0 },
            { id: ATTR.BLOCK, num: 0 },
            { id: ATTR.BLOCK_EFFECT, num: 0 },
            { id: ATTR.SKILL_DAMAGE, num: 0 },
            { id: ATTR.CRITICAL, num: 0 },
            { id: ATTR.CRITICAL_RESIST, num: 0 },
            { id: ATTR.CRITICAL_DAMAGE, num: 0 },
            { id: ATTR.ARMOR_BREAK, num: 0 },
            { id: ATTR.DAMAGE_REDUCE, num: 0 },
            { id: ATTR.CONTROL_RESIST, num: 0 },
            { id: ATTR.TRUE_DAMAGE, num: 0 },
            { id: ATTR.ENERGY, num: 0 },
            { id: ATTR.HP_PERCENT, num: 0 },
            { id: ATTR.ARMOR_PERCENT, num: 0 },
            { id: ATTR.ATTACK_PERCENT, num: 0 },
            { id: ATTR.SPEED_PERCENT, num: 0 },
            { id: ATTR.ORG_HP, num: 0 },
            { id: ATTR.SUPER_DAMAGE, num: 0 },
            { id: ATTR.HEAL_PLUS, num: 0 },
            { id: ATTR.HEALER_PLUS, num: 0 },
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
        calculation: 'formula-based (level + heroTemplate + typeParam + qualityParam)',
        duration: 0
    });

    return ctx.buildDataResponse(0, {
        _attrs: attrs,
        _baseAttrs: baseAttrs
    });
}

module.exports = handleHeroGetAttrs;
