/**
 * equip::wearAuto — One-step auto-equip best items + weapon for a hero
 *
 * CLIENT: main.min.js L178831-178885 (doWearAuto)
 * CLIENT CALLBACK: L178851-178857
 *   ts.processHandler({ type:'equip', action:'wearAuto', userId, heroId, equipInfo, weaponId, version:'1.0' },
 *     function(e) {
 *       EquipInfoManager.getInstance().oneSteapWear(e);       // L131088-131098
 *       HerosManager.getInstance().setTotalAttrsByHeroId(e, e.heroId);  // L133766-133839
 *       ItemsCommonSingleton.getInstance().resetTtemsCallBack(e);      // L118412-118419
 *     })
 *
 * CLIENT processHandler UNWRAPS (L113843-113857):
 *   e = { ret, data, compress, serverTime, server0Time }
 *   if (e.ret === 0):
 *     inner = JSON.parse(e.data)  // (decompress if e.compress)
 *     callback(inner)             // callback receives UNWRAPPED inner data
 *
 * HAR: har-main-server-decoded.md — equip::wearAuto (5x), first at [114/245]
 *
 * ═══════════════════════════════════════════════════════════════
 * REQUEST
 * ═══════════════════════════════════════════════════════════════
 *   type      : "equip"
 *   action    : "wearAuto"
 *   userId    : string — user UUID
 *   heroId    : string — hero instance UUID (key in userData.heros._heros)
 *   equipInfo : Object — { "1":"3001", "2":"3002", "3":"3003", "4":"3004",
 *                            "haloId":..., "haloLevel":..., "haloCost":[] }
 *               key = pos (1-4), value = equipId (string)
 *               NOTE: client getOneSteapWearBestEquip (L131062-131071) includes
 *                     haloId, haloLevel, haloCost in the same object — must skip
 *   weaponId  : string — weapon UUID or "" (empty = no weapon change)
 *   version   : "1.0"
 *
 * ═══════════════════════════════════════════════════════════════
 * RESPONSE (inner data — what client callback receives after unwrap)
 * ═══════════════════════════════════════════════════════════════
 *   heroId               : string — hero instance UUID (L131092: delete t.equipDataList[e.heroId])
 *   weaponId             : string — weapon UUID (L131097: e.weaponId.length > 0)
 *   _equipItem           : { _suitItems[], _suitAttrs[], _equipAttrs[], _earrings{}, _weaponState }
 *       → SetEquipDataToModel (L130957-130983)
 *       → oneSteapWear (L131088-131098): updates equipDataList[heroId]
 *   _totalAttr           : { _items: { "0":{_id:0,_num:5650}, ... } }
 *       → setTotalAttrsByHeroId (L133766-133831): updates hero totalAttr
 *   _changeInfo          : { _items: { "3001":{_id:3001,_num:0}, ... } }
 *       → resetTtemsCallBack (L118412-118419): updates item counts
 *   _linkHeroesTotalAttr : {} (L133836-133839)
 *       → keyed by linked heroId, each has _items[]
 *   _oldWeaponId         : string (optional — L131096)
 *       → only present when weapon changed; old weapon's heroId cleared
 *
 * ═══════════════════════════════════════════════════════════════
 * RESOURCE/JSON REQUIRED
 * ═══════════════════════════════════════════════════════════════
 *   equip.json           — equip stats per item (ability, type, quality, version)
 *   equipSuit.json       — suit bonus when matching set equipped
 *   hero.json            — hero base displayId lookup (quality, heroType, speed, talent, etc.)
 *   heroLevelAttr.json   — base attributes per hero level
 *   heroTypeParam.json   — attribute type weights (hpParam, attackParam, armorParam)
 *   heroQualityParam.json — quality multipliers
 *   heroPower.json       — power weight per attr per heroType
 *   weapon.json          — weapon data (if weaponId provided)
 *   thingsID.json        — item inventory types (for totalProps validation)
 *
 * ═══════════════════════════════════════════════════════════════
 * BUG FIX LOG
 * ═══════════════════════════════════════════════════════════════
 *
 * [FIX-001] Response format — handler returned raw object instead of ctx.buildDataResponse()
 *   CLIENT L113843-113857 processHandler expects: { ret, data, compress, serverTime, server0Time }
 *   OLD: return { type:'equip', action:'wearAuto', ... } — NO ret field → client treats as error
 *   OLD: return { ret:3, message:'Hero not found' } — missing data/compress/serverTime/server0Time
 *   FIX: Use ctx.buildDataResponse(0, innerData) and ctx.buildErrorResponse(code)
 *
 * [FIX-002] No logging — handler was completely silent, no way to debug ret=3
 *   OLD: No ctx.logger calls at all
 *   FIX: Full step-by-step logging like other handlers (hero::getAttrs pattern)
 *
 * [FIX-003] Wrong field names for hero data
 *   OLD: heroData._displayId (doesn't exist)
 *   ENTER GAME stores: heroData._heroDisplayId
 *   FIX: heroData._heroDisplayId
 *
 *   OLD: heroData._level (doesn't exist)
 *   ENTER GAME stores: heroData._heroBaseAttr._level
 *   FIX: heroData._heroBaseAttr._level
 *
 * [FIX-004] await on synchronous function
 *   OLD: const userData = await ctx.db.getUser(userId);
 *   db.getUser() is synchronous (returns value, not Promise)
 *   FIX: const userData = ctx.db.getUser(userId);
 *
 * [FIX-005] Total attr calculation was wrong — didn't match HAR
 *   OLD: calcTotalAttr() used simplified formula, only included non-zero attrs
 *   HAR shows ALL attrs 0-41 present (even 0 values), and proper base formula
 *   Base formula must match hero::getAttrs (L115997-116073 makeHeroBasicAttr):
 *     hp = floor((levelAttr.hp × typeParam.hpParam + typeParam.hpBais) × qualityParam.hpParam × hero.balanceHp)
 *     attack = floor((levelAttr.attack × typeParam.attackParam + typeParam.attackBais) × qualityParam.attackParam × hero.balanceAttack)
 *     armor = floor((levelAttr.armor × typeParam.armorParam + typeParam.armorBais) × qualityParam.armorParam × hero.balanceArmor)
 *     + flat stats from hero.json (speed, talent, hit, dodge, block, etc.)
 *     + ALL attrs 0-41 with 0 values for missing ones
 *   FIX: Reuse same calculation as getAttrs (heroLevelAttr + heroTypeParam + qualityParam + heroConfig)
 *     then ADD equip attrs and suit attrs on top
 *
 * [FIX-006] equipInfo contains non-position keys (haloId, haloLevel, haloCost)
 *   CLIENT L131062-131071 getOneSteapWearBestEquip returns:
 *     { haloId:..., haloLevel:..., haloCost:[], "1":"3001", "2":"3002", ... }
 *   Handler was iterating ALL keys, trying to look up "haloId"/"haloCost" as equip IDs
 *   FIX: Only process numeric position keys (1-4), skip everything else
 *
 * [FIX-007] _equipItem._earrings format mismatch
 *   OLD: Built earrings from userData.equip._earrings (which may not have all fields)
 *   HAR: { _id:0, _level:0, _attrs:{ _items:{} }, _version:"" }
 *   CLIENT L130983: t.earrings.deserialize(e._earrings) — expects this exact structure
 *   FIX: Ensure all 4 fields always present in _earrings
 *
 * [FIX-008] totalProps._items inventory format mismatch — ROOT CAUSE of "only 1 set can equip"
 *   CAUSE: enterGame + checkBattleResult + gain store items as:
 *     totalProps._items[itemId] = { _id: itemId, _num: count }
 *   But wearAuto read/wrote as if it's a plain NUMBER:
 *     const curCount = items[newEquipId] || 0;     ← reads OBJECT not number
 *     items[newEquipId] = curCount - 1;              ← replaces OBJECT with NaN
 *   CONSEQUENCE: First equip works (object is truthy, passes <=0 check), but
 *     curCount = { _id:3001, _num:3 } → curCount-1 = NaN → items[3001] = NaN.
 *     Second equip: NaN || 0 → 0 → curCount=0 → curCount<=0 → SKIP.
 *     So only the FIRST set can be equipped; inventory is corrupted after that.
 *   EVIDENCE: Stage 1-1 gives 3001x3 + 3002x3, stage 1-2 gives 3003x4 + 3004x4
 *     = enough for 3 full sets (3001-3004 per hero). But only 1 set equips.
 *   FIX: Read count via items[id]._num, write back as { _id, _num } object.
 *     Also create entry as { _id, _num } if item not yet in inventory.
 */

// ═══════════════════════════════════════════════════════════════
// ATTRIBUTE ID CONSTANTS (from abilityName.json)
// ═══════════════════════════════════════════════════════════════
const ATTR = {
    HP: 0, ATTACK: 1, ARMOR: 2, SPEED: 3, HIT: 4, DODGE: 5,
    BLOCK: 6, BLOCK_EFFECT: 7, SKILL_DAMAGE: 8, CRITICAL: 9,
    CRITICAL_RESIST: 10, CRITICAL_DAMAGE: 11, ARMOR_BREAK: 12,
    DAMAGE_REDUCE: 13, CONTROL_RESIST: 14, TRUE_DAMAGE: 15, ENERGY: 16,
    HP_PERCENT: 17, ARMOR_PERCENT: 18, ATTACK_PERCENT: 19,
    SPEED_PERCENT: 20, POWER: 21, ORG_HP: 22, SUPER_DAMAGE: 23,
    HEAL_PLUS: 24, HEALER_PLUS: 25, EXTRA_ARMOR: 26, SHIELDER_PLUS: 27,
    DAMAGE_UP: 28, DAMAGE_DOWN: 29, TALENT: 30, SUPER_DAMAGE_RESIST: 31,
    ENERGY_MAX: 41
};

// ═══════════════════════════════════════════════════════════════
// RESOURCE CACHES (lazy-loaded)
// ═══════════════════════════════════════════════════════════════

let _equip = null;
let _equipSuit = null;
let _hero = null;
let _heroLevelAttr = null;
let _heroTypeParam = null;
let _heroQualityParam = null;
let _heroPower = null;
let _weapon = null;
let _thingsID = null;

function loadResources(ctx) {
    const rp = ctx.config.resourcePath;
    if (!_equip) _equip = ctx.loadResource('equip') || require(require('path').join(rp, 'equip.json'));
    if (!_equipSuit) _equipSuit = ctx.loadResource('equipSuit') || require(require('path').join(rp, 'equipSuit.json'));
    if (!_hero) _hero = ctx.loadResource('hero') || require(require('path').join(rp, 'hero.json'));
    if (!_heroLevelAttr) _heroLevelAttr = ctx.loadResource('heroLevelAttr') || require(require('path').join(rp, 'heroLevelAttr.json'));
    if (!_heroTypeParam) _heroTypeParam = ctx.loadResource('heroTypeParam') || require(require('path').join(rp, 'heroTypeParam.json'));
    if (!_heroQualityParam) _heroQualityParam = ctx.loadResource('heroQualityParam') || require(require('path').join(rp, 'heroQualityParam.json'));
    if (!_heroPower) _heroPower = ctx.loadResource('heroPower') || require(require('path').join(rp, 'heroPower.json'));
    if (!_weapon) _weapon = ctx.loadResource('weapon') || require(require('path').join(rp, 'weapon.json'));
    if (!_thingsID) _thingsID = ctx.loadResource('thingsID') || require(require('path').join(rp, 'thingsID.json'));
}

// ═══════════════════════════════════════════════════════════════
// ATTRIBUTE CALCULATION (same formula as hero::getAttrs L115997-116073)
// ═══════════════════════════════════════════════════════════════

/**
 * Calculate base attributes for a hero using the same formula as getAttrs.
 * Formula: L115997-116073 makeHeroBasicAttr
 *   baseHP = floor((levelAttr.hp × typeParam.hpParam + typeParam.hpBais) × qualityParam.hpParam × hero.balanceHp)
 *   baseATK = floor((levelAttr.attack × typeParam.attackParam + typeParam.attackBais) × qualityParam.attackParam × hero.balanceAttack)
 *   baseARM = floor((levelAttr.armor × typeParam.armorParam + typeParam.armorBais) × qualityParam.armorParam × hero.balanceArmor)
 *   + flat stats from hero.json (speed, talent, hit, dodge, etc.)
 *   + power = floor(sum(attrValue × heroPower[heroType].powerParam))
 *
 * @returns {Object} Map of attrId → attrValue (including ALL attrs 0-41)
 */
function calculateBaseAttrs(heroDisplayId, heroLevel) {
    const heroConfig = _hero[String(heroDisplayId)];
    if (!heroConfig) return null;

    // Level data keyed by level number
    const levelData = _heroLevelAttr[String(heroLevel)];
    if (!levelData) return null;

    // Type multipliers
    const typeConfig = _heroTypeParam[heroConfig.heroType];
    if (!typeConfig) return null;

    // Quality multipliers
    const qualityConfig = _heroQualityParam[heroConfig.quality];
    if (!qualityConfig) return null;

    // ─── CALCULATE BASE STATS ───
    const baseHP = Math.floor(
        (levelData.hp * typeConfig.hpParam + typeConfig.hpBais)
        * qualityConfig.hpParam * heroConfig.balanceHp
    );
    const baseAttack = Math.floor(
        (levelData.attack * typeConfig.attackParam + typeConfig.attackBais)
        * qualityConfig.attackParam * heroConfig.balanceAttack
    );
    const baseArmor = Math.floor(
        (levelData.armor * typeConfig.armorParam + typeConfig.armorBais)
        * qualityConfig.armorParam * heroConfig.balanceArmor
    );

    // Build attr map (ALL attrs 0-41 to match HAR format)
    const attrs = {};
    attrs[ATTR.HP] = baseHP;
    attrs[ATTR.ATTACK] = baseAttack;
    attrs[ATTR.ARMOR] = baseArmor;
    attrs[ATTR.SPEED] = heroConfig.speed || 0;
    attrs[ATTR.TALENT] = heroConfig.talent || 0;
    attrs[ATTR.ENERGY_MAX] = heroConfig.energyMax || 100;

    // Flat combat stats from hero.json (L116073)
    attrs[ATTR.HIT] = heroConfig.hit || 0;
    attrs[ATTR.DODGE] = heroConfig.dodge || 0;
    attrs[ATTR.BLOCK] = heroConfig.block || 0;
    attrs[ATTR.BLOCK_EFFECT] = heroConfig.blockEffect || 0;
    attrs[ATTR.SKILL_DAMAGE] = heroConfig.skillDamage || 0;
    attrs[ATTR.CRITICAL] = heroConfig.critical || 0;
    attrs[ATTR.CRITICAL_RESIST] = heroConfig.criticalResist || 0;
    attrs[ATTR.CRITICAL_DAMAGE] = heroConfig.criticalDamage || 0;
    attrs[ATTR.ARMOR_BREAK] = heroConfig.armorBreak || 0;
    attrs[ATTR.DAMAGE_REDUCE] = heroConfig.damageReduce || 0;
    attrs[ATTR.CONTROL_RESIST] = heroConfig.controlResist || 0;
    attrs[ATTR.TRUE_DAMAGE] = heroConfig.trueDamage || 0;
    attrs[ATTR.HEAL_PLUS] = heroConfig.healPlus || 0;
    attrs[ATTR.HEALER_PLUS] = heroConfig.healerPlus || 0;

    // Zero-fill remaining attrs (match HAR: ALL 0-41 present)
    const zeroAttrs = [
        ATTR.ENERGY, ATTR.HP_PERCENT, ATTR.ARMOR_PERCENT, ATTR.ATTACK_PERCENT,
        ATTR.SPEED_PERCENT, ATTR.ORG_HP, ATTR.SUPER_DAMAGE, ATTR.SHIELDER_PLUS,
        ATTR.DAMAGE_UP, ATTR.DAMAGE_DOWN, ATTR.SUPER_DAMAGE_RESIST
    ];
    for (const id of zeroAttrs) {
        if (attrs[id] === undefined) attrs[id] = 0;
    }

    // Fill any gaps 0-41
    for (let i = 0; i <= 41; i++) {
        if (attrs[i] === undefined) attrs[i] = 0;
    }

    // ─── CALCULATE POWER (attr 21) — same as getAttrs ───
    let power = 0;
    if (_heroPower) {
        const attrNameMap = {
            hp: baseHP, attack: baseAttack, armor: baseArmor, speed: attrs[ATTR.SPEED],
            talent: attrs[ATTR.TALENT], energyMax: attrs[ATTR.ENERGY_MAX],
            hit: attrs[ATTR.HIT], dodge: attrs[ATTR.DODGE], block: attrs[ATTR.BLOCK],
            blockEffect: attrs[ATTR.BLOCK_EFFECT], skillDamage: attrs[ATTR.SKILL_DAMAGE],
            critical: attrs[ATTR.CRITICAL], criticalResist: attrs[ATTR.CRITICAL_RESIST],
            criticalDamage: attrs[ATTR.CRITICAL_DAMAGE], armorBreak: attrs[ATTR.ARMOR_BREAK],
            damageReduce: attrs[ATTR.DAMAGE_REDUCE], controlResist: attrs[ATTR.CONTROL_RESIST],
            trueDamage: attrs[ATTR.TRUE_DAMAGE], healPlus: attrs[ATTR.HEAL_PLUS],
            healerPlus: attrs[ATTR.HEALER_PLUS]
        };
        for (const key in _heroPower) {
            const entry = _heroPower[key];
            if (entry.heroType === heroConfig.heroType) {
                const val = attrNameMap[entry.attName] || 0;
                power += val * entry.powerParam;
            }
        }
    }
    attrs[ATTR.POWER] = Math.floor(power);

    return attrs;
}

/**
 * Get equip abilities from equip.json for a given equipId.
 * Returns array of { _id, _num } for each ability slot.
 */
function getEquipAbilities(equipId) {
    const eq = _equip[equipId];
    if (!eq) return [];
    const abilities = [];
    for (let i = 1; i <= 3; i++) {
        const abilityId = eq['abilityID' + i];
        const value = eq['value' + i];
        if (abilityId !== undefined && abilityId !== null && value !== undefined && value !== null) {
            abilities.push({ _id: abilityId, _num: value });
        }
    }
    return abilities;
}

/**
 * Check if equipped items form a suit and return suit bonus attributes.
 * equipSuit.json: { id, suitInclude:"3001,3002,3003,3004", activeNeeded1:2, ability11, abilityID11, value11, ... }
 */
function getSuitBonus(equippedIds) {
    const suitAttrs = [];
    const idSet = new Set(equippedIds);

    for (const suitId in _equipSuit) {
        const suit = _equipSuit[suitId];
        if (!suit.suitInclude) continue;
        const suitIncludes = suit.suitInclude.split(',');
        const matchCount = suitIncludes.filter(id => idSet.has(id)).length;

        for (let tier = 1; tier <= 3; tier++) {
            const needed = suit['activeNeeded' + tier];
            if (needed === undefined || matchCount < needed) continue;
            for (let a = 1; a <= 2; a++) {
                const aid = suit['abilityID' + tier + a];
                const val = suit['value' + tier + a];
                if (aid !== undefined && aid !== null && val !== undefined && val !== null) {
                    suitAttrs.push({ _id: aid, _num: val });
                }
            }
        }
    }
    return suitAttrs;
}

/**
 * Build _items format from attr map (all attrs 0-41).
 * @param {Object} attrs - Map of attrId → attrValue
 * @returns {Object} { _items: { "0":{_id:0,_num:5650}, "1":{_id:1,_num:435}, ... } }
 */
function buildTotalAttrItems(attrs) {
    const items = {};
    for (let i = 0; i <= 41; i++) {
        items[String(i)] = { _id: i, _num: attrs[i] || 0 };
    }
    return { _items: items };
}

// ═══════════════════════════════════════════════════════════════
// MAIN HANDLER
// ═══════════════════════════════════════════════════════════════

async function handle(msg, ctx) {
    const startTime = Date.now();
    const { userId, heroId, equipInfo, weaponId, version } = msg;

    // ──── Step 1: Validate request ────
    ctx.logger.step(1, 8, 'Validate request fields', 'running');
    if (!userId || !heroId) {
        ctx.logger.step(1, 8, 'Validate request fields', 'fail', 'userId or heroId MISSING');
        return ctx.buildErrorResponse(8);
    }
    ctx.logger.details('request',
        ['userId', userId ? userId.substring(0, 20) + '...' : 'MISSING'],
        ['heroId', heroId],
        ['equipInfo', equipInfo ? Object.keys(equipInfo).join(',') : '(none)'],
        ['weaponId', weaponId || '(none)']
    );
    ctx.logger.step(1, 8, 'Validate request fields', 'pass', 'userId + heroId present');

    // ──── Step 2: Load resources ────
    ctx.logger.step(2, 8, 'Load resource JSONs', 'running');
    loadResources(ctx);
    const resOk = _equip && _equipSuit && _hero && _heroLevelAttr && _heroTypeParam && _heroQualityParam && _heroPower;
    if (!resOk) {
        ctx.logger.step(2, 8, 'Load resource JSONs', 'fail', 'Missing config files');
        return ctx.buildErrorResponse(1);
    }
    ctx.logger.step(2, 8, 'Load resource JSONs', 'pass', '8 JSONs loaded');

    // ──── Step 3: Load userData ────
    ctx.logger.step(3, 8, 'Load userData from DB', 'running');
    // [FIX-004] db.getUser is synchronous — no await needed
    const userData = ctx.db.getUser(userId);
    if (!userData) {
        ctx.logger.step(3, 8, 'Load userData from DB', 'fail', 'User not found in DB');
        return ctx.buildErrorResponse(2);
    }
    ctx.logger.step(3, 8, 'Load userData from DB', 'pass', 'userData loaded');

    // ──── Step 4: Validate hero exists ────
    ctx.logger.step(4, 8, 'Validate hero exists', 'running');
    if (!userData.heros || !userData.heros._heros) {
        ctx.logger.step(4, 8, 'Validate hero exists', 'fail', 'userData.heros._heros is MISSING');
        ctx.logger.details('heroCheck',
            ['heros', userData.heros ? 'exists' : 'MISSING'],
            ['_heros', userData.heros && userData.heros._heros ? 'exists' : 'MISSING']
        );
        return ctx.buildErrorResponse(3);
    }

    const heroData = userData.heros._heros[heroId];
    if (!heroData) {
        ctx.logger.step(4, 8, 'Validate hero exists', 'fail', 'Hero not found in _heros');
        ctx.logger.details('heroCheck',
            ['requested heroId', heroId],
            ['available heroIds', Object.keys(userData.heros._heros).join(', ')],
            ['heroCount', String(Object.keys(userData.heros._heros).length)]
        );
        return ctx.buildErrorResponse(3);
    }

    // [FIX-003] Correct field names — _heroDisplayId (not _displayId), _heroBaseAttr._level (not _level)
    const heroDisplayId = heroData._heroDisplayId;
    const heroLevel = heroData._heroBaseAttr ? (heroData._heroBaseAttr._level || 1) : 1;

    ctx.logger.details('heroInfo',
        ['heroId', heroId],
        ['_heroDisplayId', String(heroDisplayId)],
        ['_level', String(heroLevel)]
    );
    ctx.logger.step(4, 8, 'Validate hero exists', 'pass', 'hero found: displayId=' + heroDisplayId + ' level=' + heroLevel);

    // ──── Step 5: Get hero config ────
    ctx.logger.step(5, 8, 'Get hero config', 'running');
    const heroConfig = _hero[String(heroDisplayId)];
    if (!heroConfig) {
        ctx.logger.step(5, 8, 'Get hero config', 'fail', 'Hero template not found in hero.json: ' + heroDisplayId);
        return ctx.buildErrorResponse(3);
    }
    ctx.logger.step(5, 8, 'Get hero config', 'pass', 'heroType=' + (heroConfig.heroType || '?') + ' quality=' + (heroConfig.quality || '?'));

    // ──── Step 6: Process equip changes ────
    ctx.logger.step(6, 8, 'Process equip changes', 'running');

    // Initialize equip._suits for this hero if not present
    if (!userData.equip) userData.equip = { _suits: {}, _earrings: {} };
    if (!userData.equip._suits) userData.equip._suits = {};
    if (!userData.equip._earrings) userData.equip._earrings = {};

    const prevSuit = userData.equip._suits[heroId] || null;
    const prevEquipIds = {};

    // Track previous equips per pos
    if (prevSuit && prevSuit._suitItems) {
        for (const item of prevSuit._suitItems) {
            prevEquipIds[item._pos] = item._id;
        }
    }

    // Ensure totalProps exists
    if (!userData.totalProps) userData.totalProps = { _items: {} };
    if (!userData.totalProps._items) userData.totalProps._items = {};

    const newSuitItems = [];
    const equippedIds = [];
    const changeItems = {};

    // [FIX-006] Only process numeric position keys (1-4), skip haloId/haloLevel/haloCost
    if (equipInfo && typeof equipInfo === 'object') {
        for (const pos in equipInfo) {
            // Skip non-position keys from getOneSteapWearBestEquip
            if (pos === 'haloId' || pos === 'haloLevel' || pos === 'haloCost') continue;
            const posNum = parseInt(pos);
            if (isNaN(posNum) || posNum < 1 || posNum > 4) continue;

            const newEquipId = String(equipInfo[pos]);
            if (!newEquipId) continue;

            // Validate equip exists in equip.json
            const eqConfig = _equip[newEquipId];
            if (!eqConfig) {
                ctx.logger.log('WARN', 'WEAR_AUTO', 'Unknown equipId: ' + newEquipId + ' — skipping');
                continue;
            }

            // [FIX-008] Return old equip to inventory if exists
            // Inventory format: totalProps._items[id] = { _id: id, _num: count }
            const oldEquipId = prevEquipIds[posNum];
            if (oldEquipId && oldEquipId !== newEquipId) {
                const oldEntry = userData.totalProps._items[oldEquipId];
                const oldCount = (oldEntry && typeof oldEntry._num === 'number') ? oldEntry._num : (typeof oldEntry === 'number' ? oldEntry : 0);
                const newOldCount = oldCount + 1;
                userData.totalProps._items[oldEquipId] = { _id: parseInt(oldEquipId), _num: newOldCount };
                changeItems[oldEquipId] = { _id: parseInt(oldEquipId), _num: newOldCount };
            }

            // [FIX-008] Deduct new equip from inventory
            // Inventory format: totalProps._items[id] = { _id: id, _num: count }
            const newEntry = userData.totalProps._items[newEquipId];
            const curCount = (newEntry && typeof newEntry._num === 'number') ? newEntry._num : (typeof newEntry === 'number' ? newEntry : 0);
            if (curCount <= 0) {
                ctx.logger.log('WARN', 'WEAR_AUTO', 'Equip not in inventory: ' + newEquipId + ' (count=' + curCount + ') — skipping');
                continue;
            }
            const newCount = curCount - 1;
            userData.totalProps._items[newEquipId] = { _id: parseInt(newEquipId), _num: newCount };
            changeItems[newEquipId] = { _id: parseInt(newEquipId), _num: newCount };

            newSuitItems.push({
                _id: newEquipId,
                _pos: posNum,
                _version: String(eqConfig.version || '')
            });
            equippedIds.push(newEquipId);
        }
    }

    ctx.logger.details('equipProcess',
        ['equippedCount', String(newSuitItems.length)],
        ['equippedIds', equippedIds.join(',') || '(none)'],
        ['changeCount', String(Object.keys(changeItems).length)]
    );
    ctx.logger.step(6, 8, 'Process equip changes', 'pass', newSuitItems.length + ' equips processed');

    // ──── Step 7: Calculate equip + suit attributes ────
    ctx.logger.step(7, 8, 'Calculate equip attributes', 'running');

    const equipAttrs = [];
    for (const eid of equippedIds) {
        const abilities = getEquipAbilities(eid);
        equipAttrs.push(...abilities);
    }

    // Merge duplicate attr IDs
    const mergedEquipAttrs = {};
    for (const ea of equipAttrs) {
        mergedEquipAttrs[ea._id] = (mergedEquipAttrs[ea._id] || 0) + ea._num;
    }
    const finalEquipAttrs = Object.keys(mergedEquipAttrs).map(function(id) {
        return { _id: parseInt(id), _num: mergedEquipAttrs[id] };
    });

    const suitAttrs = getSuitBonus(equippedIds);

    ctx.logger.details('attrCalc',
        ['equipAttrs', String(finalEquipAttrs.length) + ' types'],
        ['suitAttrs', String(suitAttrs.length) + ' bonuses']
    );
    ctx.logger.step(7, 8, 'Calculate equip attributes', 'pass', finalEquipAttrs.length + ' equip + ' + suitAttrs.length + ' suit');

    // ──── Step 8: Calculate total attributes ────
    ctx.logger.step(8, 8, 'Calculate total attributes', 'running');

    // [FIX-005] Use same formula as getAttrs (not simplified calcTotalAttr)
    const baseAttrs = calculateBaseAttrs(heroDisplayId, heroLevel);
    if (!baseAttrs) {
        ctx.logger.step(8, 8, 'Calculate total attributes', 'fail', 'Cannot calculate base attrs');
        return ctx.buildErrorResponse(1);
    }

    // Add equipment attributes
    for (const ea of finalEquipAttrs) {
        baseAttrs[ea._id] = (baseAttrs[ea._id] || 0) + ea._num;
    }

    // Add suit attributes
    for (const sa of suitAttrs) {
        baseAttrs[sa._id] = (baseAttrs[sa._id] || 0) + sa._num;
    }

    const totalAttr = buildTotalAttrItems(baseAttrs);

    ctx.logger.details('totalAttr',
        ['hp', String(baseAttrs[ATTR.HP])],
        ['attack', String(baseAttrs[ATTR.ATTACK])],
        ['armor', String(baseAttrs[ATTR.ARMOR])],
        ['power', String(baseAttrs[ATTR.POWER])]
    );
    ctx.logger.step(8, 8, 'Calculate total attributes', 'pass', 'power=' + baseAttrs[ATTR.POWER]);

    // ──── Step 9: Handle weapon swap ────
    let oldWeaponId = '';
    let weaponState = 0;

    if (userData.weapon && userData.weapon._items) {
        // Check if hero currently has weapon
        for (const wid in userData.weapon._items) {
            if (userData.weapon._items[wid]._heroId === heroId) {
                weaponState = 1;
                // If new weapon requested and different, unequip old
                if (weaponId && weaponId !== '' && wid !== weaponId) {
                    oldWeaponId = wid;
                    userData.weapon._items[wid]._heroId = '';
                    weaponState = 0;
                }
            }
        }
        // Equip new weapon
        if (weaponId && weaponId !== '' && userData.weapon._items[weaponId]) {
            // Unequip weapon from other hero if any
            if (userData.weapon._items[weaponId]._heroId && userData.weapon._items[weaponId]._heroId !== heroId) {
                // Weapon was on another hero — find and clear
                // (no _oldWeaponId for this case per HAR behavior)
            }
            userData.weapon._items[weaponId]._heroId = heroId;
            weaponState = 1;
        }
    }

    // ──── Step 10: Build _equipItem response ────
    // [FIX-007] Ensure earrings has all required fields for client deserialize
    const earrings = userData.equip._earrings || {};
    const earringsResponse = {
        _id: earrings._id || 0,
        _level: earrings._level || 0,
        _attrs: (earrings._attrs && earrings._attrs._items) ? earrings._attrs : { _items: {} },
        _version: earrings._version || ''
    };

    const equipItemResponse = {
        _suitItems: newSuitItems,
        _suitAttrs: suitAttrs,
        _equipAttrs: finalEquipAttrs,
        _earrings: earringsResponse,
        _weaponState: weaponState
    };

    // ──── Step 11: Save suit data to userData ────
    userData.equip._suits[heroId] = {
        _suitItems: newSuitItems,
        _earrings: earringsResponse,
        _suitAttrs: suitAttrs,
        _equipAttrs: finalEquipAttrs,
        _weaponState: weaponState
    };

    // ──── Step 12: Build response inner data ────
    const innerData = {
        heroId: heroId,
        weaponId: weaponId || '',
        _totalAttr: totalAttr,
        _changeInfo: { _items: changeItems },
        _equipItem: equipItemResponse,
        _linkHeroesTotalAttr: {}
    };

    // Include _oldWeaponId only if weapon was swapped
    if (oldWeaponId) {
        innerData._oldWeaponId = oldWeaponId;
    }

    // ──── Step 13: Save to DB ────
    ctx.db.saveUser(userId, userData);

    // ──── Log ────
    const duration = Date.now() - startTime;
    ctx.logger.log('INFO', 'WEAR_AUTO', 'equip::wearAuto SUCCESS');
    ctx.logger.details('result',
        ['userId', userId.substring(0, 20) + '...'],
        ['heroId', heroId],
        ['equips', String(newSuitItems.length)],
        ['weapon', weaponId || '(none)'],
        ['power', String(baseAttrs[ATTR.POWER])],
        ['duration', duration + 'ms']
    );

    // ──── [FIX-001] Return proper response format via ctx.buildDataResponse ────
    return ctx.buildDataResponse(0, innerData);
}

module.exports = handle;
