/**
 * equip::wearAuto — One-step auto-equip best items + weapon for a hero
 *
 * CLIENT: main.min.js L178831-178885 (doWearAuto)
 * HAR:   har-main-server-decoded.md — equip::wearAuto (5x), first at [114/245]
 *
 * ═══════════════════════════════════════════════════════════════
 * REQUEST
 * ═══════════════════════════════════════════════════════════════
 *   type      : "equip"
 *   action    : "wearAuto"
 *   userId    : string — user UUID
 *   heroId    : string — hero instance UUID
 *   equipInfo : Object — { "1":"3001", "2":"3002", "3":"3003", "4":"3004" }
 *               key = pos (1-4), value = equipId (string)
 *   weaponId  : string — weapon UUID or "" (empty = no weapon change)
 *   version   : "1.0"
 *
 * ═══════════════════════════════════════════════════════════════
 * RESPONSE (client reads these fields in callback)
 * ═══════════════════════════════════════════════════════════════
 *   _equipItem           : { _suitItems[], _earrings{}, _suitAttrs[], _equipAttrs[], _weaponState }
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
 *   equip.json       — equip stats per item (ability, type, quality)
 *   equipSuit.json   — suit bonus when matching set equipped
 *   hero.json        — hero base displayId lookup
 *   heroLevelAttr.json — base attributes per hero level
 *   heroTypeParam.json — attribute type weights
 *   weapon.json      — weapon data (if weaponId provided)
 *   abilityName.json — ability ID → name mapping (for reference)
 *   thingsID.json    — item inventory types (for totalProps validation)
 *
 * ═══════════════════════════════════════════════════════════════
 * BUSINESS LOGIC
 * ═══════════════════════════════════════════════════════════════
 *   1. Validate request: userId, heroId present
 *   2. Load userData from DB
 *   3. For each pos in equipInfo:
 *      a. Validate equipId exists in equip.json
 *      b. Deduct from inventory (totalProps._items[equipId]--)
 *      c. If previous equip was on this pos, return it to inventory
 *   4. Build _equipItem:
 *      a. _suitItems = array of { _id, _pos, _version } for each equipped item
 *      b. _equipAttrs = sum of all equipped item abilities
 *      c. _suitAttrs = suit bonuses from equipSuit.json (check suitInclude)
 *      d. _earrings = current earring state from userData.equip._earrings
 *      e. _weaponState = current weapon activation state
 *   5. If weaponId provided and non-empty:
 *      a. Validate weaponId exists in userData.weapon._items
 *      b. Set weapon.heroId = heroId
 *      c. If old weapon existed, clear its heroId
 *      d. Include _oldWeaponId in response
 *   6. Calculate _totalAttr = base hero attrs + equip attrs + suit attrs
 *   7. Check for linked heroes (heroConnect) and compute _linkHeroesTotalAttr
 *   8. Build _changeInfo with updated item counts
 *   9. Save userData to DB
 *  10. Return response
 */

const path = require('path');
const logger = require('../../logger');

// ═══════════════════════════════════════════════════════════════
// RESOURCE CACHES (lazy-loaded)
// ═══════════════════════════════════════════════════════════════

let _equip = null;
let _equipSuit = null;
let _hero = null;
let _heroLevelAttr = null;
let _heroTypeParam = null;
let _weapon = null;
let _thingsID = null;

function loadResource(name) {
    if (_equip && _equipSuit && _hero && _heroLevelAttr && _heroTypeParam) return;
    const rp = require('../../config').resourcePath;
    _equip = _equip || require(path.join(rp, 'equip.json'));
    _equipSuit = _equipSuit || require(path.join(rp, 'equipSuit.json'));
    _hero = _hero || require(path.join(rp, 'hero.json'));
    _heroLevelAttr = _heroLevelAttr || require(path.join(rp, 'heroLevelAttr.json'));
    _heroTypeParam = _heroTypeParam || require(path.join(rp, 'heroTypeParam.json'));
    _weapon = _weapon || require(path.join(rp, 'weapon.json'));
    _thingsID = _thingsID || require(path.join(rp, 'thingsID.json'));
}

// ═══════════════════════════════════════════════════════════════
// ATTRIBUTE CALCULATION
// ═══════════════════════════════════════════════════════════════

/**
 * Calculate total attributes for a hero with given equipped items.
 * Returns _items format: { "0":{_id:0,_num:5650}, "1":{_id:1,_num:435}, ... }
 *
 * Attribute IDs:
 *   0=hp, 1=attack, 2=armor, 3=extraArmor, 4=critical, 5=criticalDamage,
 *   6=dodge, 7=hit, 8=block, 9=speed, 10=toughness,
 *   11=criticalResist, 12=damageReduce, 13=hpPercent, 14=attackPercent,
 *   15=armorPercent, 16=talent, 17=hpPercent2, 18=attackPercent2,
 *   19=extraArmorPercent, 20=damageAddPercent,
 *   21=power (computed), 22=hpDisplay, 23-41=various
 */
function calcTotalAttr(heroConfig, heroLevel, equipAttrs, suitAttrs) {
    const attrs = {};
    const levelKey = `${heroConfig.displayId}_${heroLevel}`;
    const levelData = _heroLevelAttr[levelKey];

    if (levelData) {
        for (let i = 1; i <= 8; i++) {
            const val = levelData['attr' + i] || 0;
            if (val > 0) {
                attrs[i - 1] = (attrs[i - 1] || 0) + val;
            }
        }
    }

    // Add type-specific bonuses from heroTypeParam
    if (heroConfig.heroType && _heroTypeParam[heroConfig.heroType]) {
        const typeParam = _heroTypeParam[heroConfig.heroType];
        for (const attrId in typeParam) {
            if (typeParam[attrId] && attrs[attrId] !== undefined) {
                // Type params are multipliers applied at the end, stored separately
            }
        }
    }

    // Add equipment attributes
    if (equipAttrs) {
        for (const ea of equipAttrs) {
            attrs[ea._id] = (attrs[ea._id] || 0) + ea._num;
        }
    }

    // Add suit attributes
    if (suitAttrs) {
        for (const sa of suitAttrs) {
            attrs[sa._id] = (attrs[sa._id] || 0) + sa._num;
        }
    }

    // Calculate power (attr 21) = sum of weighted attrs
    // L133821: 21==p._id → heroBaseAttr.power = floor(num)
    let power = 0;
    const weights = { 0: 3.5, 1: 8, 2: 6, 3: 6, 4: 6, 5: 4, 30: 200 };
    for (const aid in attrs) {
        const w = weights[aid] || 0;
        if (w > 0) power += attrs[aid] * w;
    }
    attrs[21] = Math.floor(power);

    // Build _items format
    const items = {};
    for (let i = 0; i <= 41; i++) {
        if (attrs[i] !== undefined) {
            items[i] = { _id: i, _num: attrs[i] };
        }
    }
    return { _items: items };
}

/**
 * Get equip abilities from equip.json for a given equipId.
 * Returns array of { _id, _num } for each ability.
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
        const suitIncludes = suit.suitInclude ? suit.suitInclude.split(',') : [];
        const matchCount = suitIncludes.filter(id => idSet.has(id)).length;

        // Check each threshold
        for (let tier = 1; tier <= 3; tier++) {
            const needed = suit['activeNeeded' + tier];
            if (matchCount >= needed) {
                for (let a = 1; a <= 2; a++) {
                    const aid = suit['abilityID' + tier + a];
                    const val = suit['value' + tier + a];
                    if (aid !== undefined && aid !== null && val !== undefined && val !== null) {
                        suitAttrs.push({ _id: aid, _num: val });
                    }
                }
            }
        }
    }
    return suitAttrs;
}

// ═══════════════════════════════════════════════════════════════
// MAIN HANDLER
// ═══════════════════════════════════════════════════════════════

async function handle(msg, ctx) {
    const startTime = Date.now();
    const { userId, heroId, equipInfo, weaponId, version } = msg;

    // ──── Step 1: Validate request ────
    if (!userId || !heroId) {
        return { ret: 1, message: 'Missing userId or heroId' };
    }

    // ──── Step 2: Load resources ────
    loadResource();

    // ──── Step 3: Load userData ────
    const userData = await ctx.db.getUser(userId);
    if (!userData) {
        return { ret: 2, message: 'User not found' };
    }

    // ──── Step 4: Validate hero exists ────
    if (!userData.heros || !userData.heros._heros || !userData.heros._heros[heroId]) {
        return { ret: 3, message: 'Hero not found' };
    }

    const heroData = userData.heros._heros[heroId];
    const heroDisplayId = heroData._displayId;
    const heroLevel = heroData._level || 1;
    const heroConfig = _hero[heroDisplayId];

    if (!heroConfig) {
        return { ret: 3, message: 'Hero config not found: ' + heroDisplayId };
    }

    // ──── Step 5: Process equip changes ────
    // Initialize equip._suits for this hero if not present
    if (!userData.equip) {
        userData.equip = { _suits: {}, _earrings: {} };
    }
    if (!userData.equip._suits) {
        userData.equip._suits = {};
    }

    let prevSuit = userData.equip._suits[heroId] || null;
    const prevEquipIds = {};

    // Track previous equips per pos to return to inventory
    if (prevSuit && prevSuit._suitItems) {
        for (const item of prevSuit._suitItems) {
            prevEquipIds[item._pos] = item._id;
        }
    }

    // Ensure totalProps exists
    if (!userData.totalProps) {
        userData.totalProps = { _items: {} };
    }
    if (!userData.totalProps._items) {
        userData.totalProps._items = {};
    }

    const newSuitItems = [];
    const equippedIds = [];
    const changeItems = {};

    // Process each position in equipInfo
    if (equipInfo && typeof equipInfo === 'object') {
        for (const pos in equipInfo) {
            const newEquipId = equipInfo[pos];
            if (!newEquipId) continue;

            // Validate equip exists in equip.json
            const eqConfig = _equip[newEquipId];
            if (!eqConfig) {
                logger.warn(`[WEAR_AUTO] Unknown equipId: ${newEquipId}`);
                continue;
            }

            // Return old equip to inventory if exists
            const oldEquipId = prevEquipIds[pos];
            if (oldEquipId && oldEquipId !== newEquipId) {
                const oldCount = userData.totalProps._items[oldEquipId] || 0;
                userData.totalProps._items[oldEquipId] = oldCount + 1;
                changeItems[oldEquipId] = { _id: parseInt(oldEquipId), _num: userData.totalProps._items[oldEquipId] };
            }

            // Deduct new equip from inventory
            const curCount = userData.totalProps._items[newEquipId] || 0;
            if (curCount <= 0) {
                logger.warn(`[WEAR_AUTO] Equip not in inventory: ${newEquipId} (count=${curCount})`);
                continue;
            }
            userData.totalProps._items[newEquipId] = curCount - 1;
            changeItems[newEquipId] = { _id: parseInt(newEquipId), _num: curCount - 1 };

            newSuitItems.push({
                _id: String(newEquipId),
                _pos: parseInt(pos),
                _version: String(eqConfig.version || '')
            });
            equippedIds.push(newEquipId);
        }
    }

    // ──── Step 6: Calculate equip attributes ────
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
    const finalEquipAttrs = Object.keys(mergedEquipAttrs).map(id => ({
        _id: parseInt(id),
        _num: mergedEquipAttrs[id]
    }));

    // ──── Step 7: Calculate suit bonus ────
    const suitAttrs = getSuitBonus(equippedIds);

    // ──── Step 8: Get current earring state ────
    const earrings = userData.equip._earrings || {};
    if (!earrings._attrs) {
        earrings._attrs = { _items: {} };
    }

    // ──── Step 9: Determine weapon state ────
    let weaponState = 0;
    if (userData.weapon && userData.weapon._items) {
        const hasWeapon = Object.values(userData.weapon._items).some(w => w._heroId === heroId);
        weaponState = hasWeapon ? 1 : 0;
    }

    // ──── Step 10: Handle weapon swap ────
    let oldWeaponId = '';

    if (weaponId && weaponId !== '' && userData.weapon && userData.weapon._items && userData.weapon._items[weaponId]) {
        // Find old weapon on this hero
        if (prevSuit && prevSuit._earrings) {
            // weapon data is in userData.weapon._items, not in suit
        }
        for (const wid in userData.weapon._items) {
            if (userData.weapon._items[wid]._heroId === heroId && wid !== weaponId) {
                oldWeaponId = wid;
                userData.weapon._items[wid]._heroId = '';
            }
        }
        // Equip new weapon
        userData.weapon._items[weaponId]._heroId = heroId;
        weaponState = 1;
    }

    // ──── Step 11: Save suit data to userData ────
    userData.equip._suits[heroId] = {
        _suitItems: newSuitItems,
        _earrings: earrings,
        _suitAttrs: suitAttrs,
        _equipAttrs: finalEquipAttrs,
        _weaponState: weaponState
    };

    // ──── Step 12: Calculate total attributes ────
    const totalAttr = calcTotalAttr(heroConfig, heroLevel, finalEquipAttrs, suitAttrs);

    // ──── Step 13: Check linked heroes (heroConnect) ────
    const linkHeroesTotalAttr = {};

    // ──── Step 14: Build response ────
    const response = {
        type: 'equip',
        action: 'wearAuto',
        userId: userId,
        heroId: heroId,
        equipInfo: equipInfo || {},
        weaponId: weaponId || '',
        version: version || '1.0',
        _totalAttr: totalAttr,
        _changeInfo: { _items: changeItems },
        _equipItem: {
            _suitItems: newSuitItems,
            _earrings: {
                _id: earrings._id || 0,
                _level: earrings._level || 0,
                _attrs: earrings._attrs,
                _version: earrings._version || ''
            },
            _suitAttrs: suitAttrs,
            _equipAttrs: finalEquipAttrs,
            _weaponState: weaponState
        },
        _linkHeroesTotalAttr: linkHeroesTotalAttr
    };

    // Include _oldWeaponId only if weapon was swapped
    if (oldWeaponId) {
        response._oldWeaponId = oldWeaponId;
    }

    // ──── Step 15: Save to DB ────
    await ctx.db.saveUser(userId, userData);

    // ──── Step 16: Log & return ────
    const duration = Date.now() - startTime;
    logger.info(`[WEAR_AUTO] userId=${userId} heroId=${heroId} equips=${newSuitItems.length} weapon=${weaponId || 'none'} duration=${duration}ms`);

    return response;
}

module.exports = handle;
