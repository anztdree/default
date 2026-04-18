/**
 * =====================================================
 *  Summon Handler — handlers/summon.js
 *  Super Warrior Z Game Server — Main Server (Port 8001)
 *
 *  CLIENT PROTOCOL (100% from main.min.js + HAR verification):
 *
 *  === ACTIONS (6 total) ===
 *  type: "summon" — routes to this handler
 *
 *  1. summonOneFree  — Free single summon
 *     REQ: userId, sType (1=COMMON or 3=SUPER), isGuide?, version
 *     RES: { _addTotal[], _energy, _canFreeTime, _summonTimes, _changeInfo }
 *
 *  2. summonOne      — Paid single summon
 *     REQ: userId, sType (1/2/3/4), version
 *     RES: { _addTotal[], _energy, _summonTimes, _changeInfo }
 *
 *  3. summonTen       — x10 summon
 *     REQ: userId, sType (1/2/3/4), version
 *     RES: { _addTotal[10], _energy, _summonTimes, _changeInfo }
 *
 *  4. summonEnergy   — Pity/energy summon (no cost, uses accumulated energy)
 *     REQ: userId, version
 *     RES: { _addTotal[], _energy, _summonTimes, _changeInfo }
 *
 *  5. setWishList    — Save wish list
 *     REQ: userId, wishList (array of displayId numbers)
 *     RES: { wishList[] }
 *
 *  6. readWishList   — Read wish list (fire & forget)
 *     REQ: userId
 *     RES: {} (no callback on client)
 *
 *  === SummonType (sType) — NUMERIC enum from client ===
 *  1 = COMMON          — costID 122, free 21600ms, energyPerRoll 0
 *  2 = FRIEND          — costID 121, no free, energyPerRoll 0
 *  3 = SUPER           — costID 123, free 86400ms, energyPerRoll +10
 *  4 = SUPER_DIAMOND   — costID 101, no free, energyPerRoll +10
 *  5 = ENERGY          — pity summon (server-internal key for _summonTimes)
 *
 *  === SummonLocalName (summon.json key mapping) ===
 *  1 = summonSuper        → costID1:123, cost1:1, cost2:10, free:86400, energy:10
 *  2 = summonSuperDiamond → costID1:101, cost1:250, cost2:2200, energy:10
 *  3 = summonNormal       → costID1:122, cost1:1, cost2:10, free:21600, energy:0
 *  4 = summonFriend       → costID1:121, cost1:10, cost2:100, energy:0
 *
 *  === CLIENT RESPONSE FIELD PARSING ===
 *  requestCallBackCheck (main.min.js line ~61747):
 *    s = e._addTotal;   s || (s = e._addHeroes);   // PRIMARY: _addTotal, FALLBACK: _addHeroes
 *    l = e._energy;     // energy value
 *    e._canFreeTime     // optional free time override
 *  For each entry in s:
 *    void 0 != s[p]._heroId → hero result (add to HerosManager)
 *    else → item/fragment result (has _id, _num)
 *
 *  === HERO OBJECT FORMAT (from HAR) ===
 *  Client reads via HerosManager.SetHeroDataToModel(e, true):
 *  { _heroId, _heroDisplayId, _heroBaseAttr, _heroStar, _superSkillLevel,
 *    _potentialLevel, _superSkillResetCount, _potentialResetCount,
 *    _qigong, _qigongTmp, _qigongTmpPower, _qigongStage,
 *    _breakInfo, _totalCost, _expeditionMaxLevel, _gemstoneSuitId,
 *    _linkTo, _linkFrom, _resonanceType, _version }
 *
 *  === GACHA POOL (summonPool.json — 97 entries) ===
 *  Each entry: id, thingsId (heroDisplayId), thingsNum, type, quality,
 *    randomHigh (SUPER weight), randomNormal (COMMON weight),
 *    randomFriend (FRIEND weight), randomSummonEnergy (ENERGY weight),
 *    specialCompensatePool (pity SUPER), specialCompensatePoolNormal (pity COMMON)
 *
 *  === PITY SYSTEM ===
 *  summonEnergy.json: thresholds [800, 800, 800] → 80 premium rolls per step
 *  _summonTimes[5] = cumulative pity counter
 *  energyPercent = _energy / threshold → when >= 1, summonEnergy action becomes available
 *
 *  === FREE SUMMON ===
 *  _canCommonFreeTime: server timestamp (ms). If now >= _canCommonFreeTime → free available.
 *  _canSuperFreeTime:  server timestamp (ms). Same logic.
 *  After using free: set _canXxxFreeTime = now + freeCooldown (from summon.json)
 *
 *  === WISH LIST ===
 *  _wishList: array of displayId numbers (only flickerOrange heroes eligible)
 *  _wishVersion: incremented on server-side wish list changes
 *
 *  Usage:
 *    handler.handle(socket, parsedRequest, callback)
 * =====================================================
 */

'use strict';

var RH = require('../../shared/responseHelper');
var DB = require('../../database/connection');
var GameData = require('../../shared/gameData/loader');
var DefaultData = require('../../shared/defaultData');
var UserDataService = require('../services/userDataService');
var helpers = require('../utils/helpers');
var logger = require('../../shared/utils/logger');

// =============================================
// ENUMS — Must match client EXACTLY
// =============================================

/**
 * SummonType — client sends NUMERIC sType values.
 * Source: main.min.js line ~61514
 */
var SUMMON_TYPE = {
    INVALID: 0,
    COMMON: 1,
    FRIEND: 2,
    SUPER: 3,
    SUPER_DIAMOND: 4,
    ENERGY: 5,       // Internal — pity counter key in _summonTimes
    NormalLuckPool: 6,
    SuperLuckPool: 7,
};

/**
 * SummonLocalName — maps to summon.json keys.
 * Source: main.min.js line ~61522
 */
var SUMMON_LOCAL_NAME = {
    1: 'summonSuper',          // key "1" in summon.json
    2: 'summonSuperDiamond',   // key "2" in summon.json
    3: 'summonNormal',         // key "3" in summon.json
    4: 'summonFriend',         // key "4" in summon.json
};

/**
 * Maps SummonType to SummonLocalName (summon.json key).
 */
var STYPE_TO_CONFIG_KEY = {};
STYPE_TO_CONFIG_KEY[SUMMON_TYPE.SUPER] = 1;
STYPE_TO_CONFIG_KEY[SUMMON_TYPE.SUPER_DIAMOND] = 2;
STYPE_TO_CONFIG_KEY[SUMMON_TYPE.COMMON] = 3;
STYPE_TO_CONFIG_KEY[SUMMON_TYPE.FRIEND] = 4;

/**
 * Quality to star mapping (hero displayId prefix → initial star).
 * From hero config analysis: 1xxx=0star, 2xxx=0star, 3xxx=0star, 4xxx=0star, 5xxx=0star
 * All new heroes start at 0 stars — stars are increased by duplicate pulls.
 */
var QUALITY_ORDER = ['white', 'green', 'blue', 'purple', 'orange', 'flickerOrange', 'superOrange'];

// =============================================
// CONFIG ACCESSORS
// =============================================

/**
 * Get summon cost config by SummonType.
 * Returns the summon.json entry for the given sType.
 */
function getSummonConfig(sType) {
    var configKey = STYPE_TO_CONFIG_KEY[sType];
    if (!configKey) return null;
    var summonConfig = GameData.get('summon');
    return summonConfig ? summonConfig[String(configKey)] : null;
}

/**
 * Get the rate column name for a given SummonType.
 */
function getRateColumn(sType) {
    switch (sType) {
        case SUMMON_TYPE.SUPER:
        case SUMMON_TYPE.SUPER_DIAMOND:
            return 'randomHigh';
        case SUMMON_TYPE.COMMON:
            return 'randomNormal';
        case SUMMON_TYPE.FRIEND:
            return 'randomFriend';
        case SUMMON_TYPE.ENERGY:
            return 'randomSummonEnergy';
        default:
            return 'randomNormal';
    }
}

/**
 * Get the pity pool column name for a given SummonType.
 */
function getPityColumn(sType) {
    switch (sType) {
        case SUMMON_TYPE.SUPER:
        case SUMMON_TYPE.SUPER_DIAMOND:
            return 'specialCompensatePool';
        case SUMMON_TYPE.COMMON:
            return 'specialCompensatePoolNormal';
        default:
            return 'specialCompensatePoolNormal';
    }
}

// =============================================
// GACHA ENGINE
// =============================================

/**
 * Build the weighted pool for a given summon type.
 * Returns array of { poolEntry, weight } for all entries with weight > 0.
 *
 * @param {number} sType - SummonType enum value
 * @param {boolean} usePityPool - If true, only include pity pool entries
 * @returns {Array<{entry: object, weight: number}>}
 */
function buildWeightedPool(sType, usePityPool) {
    var pool = GameData.get('summonPool');
    if (!pool) return [];

    var rateColumn = getRateColumn(sType);
    var pityColumn = usePityPool ? getPityColumn(sType) : null;

    var weighted = [];
    for (var key in pool) {
        var entry = pool[key];
        if (!entry || !entry.thingsId) continue;

        if (usePityPool) {
            // Pity pool: only entries with non-zero pity weight
            var pityWeight = entry[pityColumn] || 0;
            if (pityWeight > 0) {
                weighted.push({ entry: entry, weight: pityWeight });
            }
        } else {
            // Normal pool: entries with non-zero rate weight
            var rateWeight = entry[rateColumn] || 0;
            if (rateWeight > 0) {
                weighted.push({ entry: entry, weight: rateWeight });
            }
        }
    }

    return weighted;
}

/**
 * Weighted random selection from a pool.
 *
 * @param {Array<{entry: object, weight: number}>} weightedPool
 * @returns {object|null} Selected pool entry, or null if pool is empty
 */
function weightedRandom(weightedPool) {
    if (!weightedPool || weightedPool.length === 0) return null;

    var totalWeight = 0;
    for (var i = 0; i < weightedPool.length; i++) {
        totalWeight += weightedPool[i].weight;
    }

    if (totalWeight <= 0) return null;

    var rand = Math.random() * totalWeight;
    var cumulative = 0;
    for (var j = 0; j < weightedPool.length; j++) {
        cumulative += weightedPool[j].weight;
        if (rand <= cumulative) {
            return weightedPool[j].entry;
        }
    }

    // Fallback: return last entry
    return weightedPool[weightedPool.length - 1].entry;
}

/**
 * Perform a single gacha roll.
 *
 * @param {number} sType - SummonType enum
 * @param {boolean} usePityPool - Whether to use pity pool
 * @returns {object|null} summonPool.json entry (has thingsId, quality, type, etc.)
 */
function rollGacha(sType, usePityPool) {
    var pool = buildWeightedPool(sType, usePityPool);
    return weightedRandom(pool);
}

// =============================================
// HERO OBJECT BUILDER
// =============================================

/**
 * Generate a unique hero instance ID.
 * Format: timestamp_base36 + random_base36
 */
function generateHeroId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 6);
}

/**
 * Build a complete hero object matching the HAR format.
 * Client reads this via HerosManager.SetHeroDataToModel(e, true).
 *
 * Source: HAR summonOne response hero object (verified).
 *
 * @param {object} poolEntry - Entry from summonPool.json (has thingsId, quality, type)
 * @param {boolean} isNew - Whether this hero is new to the player
 * @returns {object} Complete hero object for client
 */
function buildHeroObject(poolEntry, isNew) {
    var heroId = generateHeroId();
    var displayId = String(poolEntry.thingsId);

    // Fragment entries (type === "HeroPiece") don't have full hero data
    if (poolEntry.type === 'HeroPiece' || poolEntry.type === 'heroPiece') {
        return {
            _id: String(poolEntry.thingsId),
            _num: poolEntry.thingsNum || 1,
        };
    }

    return {
        _heroId: heroId,
        _heroDisplayId: displayId,
        _heroQuality: poolEntry.quality || 'white',
        _heroBaseAttr: {
            _level: 1,
            _evolveLevel: 0,
            _hp: 0,
            _attack: 0,
            _armor: 0,
            _speed: 0,
            _hit: 0,
            _dodge: 0,
            _block: 0,
            _blockEffect: 0,
            _skillDamage: 0,
            _critical: 0,
            _criticalResist: 0,
            _criticalDamage: 0,
            _armorBreak: 0,
            _damageReduce: 0,
            _controlResist: 0,
            _trueDamage: 0,
            _energy: 0,
            _power: 0,
            _extraArmor: 0,
            _hpPercent: 0,
            _armorPercent: 0,
            _attackPercent: 0,
            _speedPercent: 0,
            _orghp: 0,
            _superDamage: 0,
            _healPlus: 0,
            _healerPlus: 0,
            _damageDown: 0,
            _shielderPlus: 0,
            _damageUp: 0,
        },
        _heroStar: 0,
        _superSkillLevel: 0,
        _potentialLevel: {},
        _superSkillResetCount: 0,
        _potentialResetCount: 0,
        _qigong: { _items: {} },
        _qigongTmp: { _items: {} },
        _qigongTmpPower: 0,
        _qigongStage: 1,
        _breakInfo: {
            _breakLevel: 1,
            _level: 0,
            _attr: { _items: {} },
            _version: '',
        },
        _totalCost: {
            _wakeUp: {},
            _earring: {},
            _levelUp: {},
            _evolve: {},
            _skill: {},
            _qigong: {},
            _heroBreak: {},
        },
        _expeditionMaxLevel: 0,
        _gemstoneSuitId: 0,
        _linkTo: [],
        _linkFrom: '',
        _resonanceType: 0,
        _version: '202010131125',
    };
}

// =============================================
// COST & ENERGY HELPERS
// =============================================

/**
 * Deduct cost from user's totalProps._items.
 *
 * @param {object} userData - User game_data
 * @param {number} itemId - Item ID to deduct (e.g. 122, 123, 101, 121)
 * @param {number} count - Number to deduct
 * @returns {boolean} true if deduction succeeded (enough items)
 */
function deductCost(userData, itemId, count) {
    if (!userData || !userData.totalProps || !userData.totalProps._items) return false;

    var items = userData.totalProps._items;
    var itemKey = String(itemId);
    var item = items[itemKey];

    var currentNum = (item && item._num) ? item._num : 0;
    if (currentNum < count) {
        return false; // Not enough items
    }

    // Deduct
    items[itemKey] = { _id: itemId, _num: currentNum - count };
    return true;
}

/**
 * Add an item to user's totalProps._items or increment existing.
 *
 * @param {object} userData - User game_data
 * @param {number} itemId - Item ID
 * @param {number} count - Number to add
 */
function addItem(userData, itemId, count) {
    if (!userData || !userData.totalProps || !userData.totalProps._items) return;

    var items = userData.totalProps._items;
    var itemKey = String(itemId);
    var item = items[itemKey];

    var currentNum = (item && item._num) ? item._num : 0;
    items[itemKey] = { _id: itemId, _num: currentNum + count };
}

/**
 * Get current item count from user's totalProps._items.
 */
function getItemCount(userData, itemId) {
    if (!userData || !userData.totalProps || !userData.totalProps._items) return 0;
    var itemKey = String(itemId);
    var item = userData.totalProps._items[itemKey];
    return (item && item._num) ? item._num : 0;
}

/**
 * Build _changeInfo._items from user's totalProps (snapshot of changed items).
 * In a real server with transaction tracking, this would track only the delta.
 * For now, we return the items that were modified.
 *
 * @param {object} itemsSnapshot - { itemId: { _id, _num } } for modified items
 * @returns {object} { _items: {...} }
 */
function buildChangeInfoItems(itemsSnapshot) {
    return { _items: itemsSnapshot || {} };
}

// =============================================
// PITY / ENERGY SYSTEM
// =============================================

/**
 * Get the energy threshold for the current pity step.
 * summonEnergy.json: { "1": {id:1,summonEnergy:800}, "2": {id:2,summonEnergy:800}, "3": {id:3,summonEnergy:800} }
 *
 * Algorithm MUST match client energyPrecent() exactly (main.min.js line 61628):
 *   1. Find entry where id == energyCount + 1 (next tier threshold)
 *   2. If not found, fallback to max threshold across all entries
 *
 * @param {number} energyCount - _summonTimes[5] value (number of energy summons done)
 * @returns {number} Energy threshold for current step
 */
function getEnergyThreshold(energyCount) {
    var energyConfig = GameData.get('summonEnergy');
    if (!energyConfig) return 800; // Default

    // energyCount = _summonTimes[5] (0, 1, 2, 3...)
    // Cari entry dengan id == energyCount + 1 (threshold untuk step BERIKUTNYA)
    var nextThreshold = 0;
    var maxThreshold = 0;

    for (var key in energyConfig) {
        var entry = energyConfig[key];
        if (entry.id == energyCount + 1) {
            nextThreshold = entry.summonEnergy;
        }
        if (entry.summonEnergy > maxThreshold) {
            maxThreshold = entry.summonEnergy;
        }
    }

    // Jika next tier ditemukan, gunakan itu. Jika sudah melewati semua tier, fallback ke max.
    return nextThreshold > 0 ? nextThreshold : maxThreshold;
}

/**
 * Check if energy summon is available (pity is full).
 * Client checks: energyPrecent >= 1
 *
 * @param {object} summonState - User's summon state (has _energy, _summonTimes)
 * @returns {boolean}
 */
function isEnergySummonAvailable(summonState) {
    var energy = summonState._energy || 0;
    var pityCount = (summonState._summonTimes && summonState._summonTimes[String(SUMMON_TYPE.ENERGY)]) || 0;
    var threshold = getEnergyThreshold(pityCount);
    return energy >= threshold;
}

/**
 * Add energy from a premium summon roll.
 * summon.json energy values: SUPER=10, SUPER_DIAMOND=10, COMMON=0, FRIEND=0
 *
 * @param {number} sType - SummonType
 * @returns {number} Energy gained per roll
 */
function getEnergyPerRoll(sType) {
    var config = getSummonConfig(sType);
    return (config && config.summonEnergy) ? config.summonEnergy : 0;
}

// =============================================
// FREE SUMMON LOGIC
// =============================================

/**
 * Check if free summon is available for a given type.
 *
 * @param {object} summonState - User's summon state
 * @param {number} sType - COMMON(1) or SUPER(3)
 * @returns {boolean}
 */
function isFreeSummonAvailable(summonState, sType) {
    var now = Date.now();
    if (sType === SUMMON_TYPE.COMMON) {
        var commonTime = summonState._canCommonFreeTime || 0;
        return now >= commonTime;
    } else if (sType === SUMMON_TYPE.SUPER) {
        var superTime = summonState._canSuperFreeTime || 0;
        return now >= superTime;
    }
    return false;
}

/**
 * Set the next free summon time after using a free summon.
 *
 * @param {object} summonState - User's summon state (will be mutated)
 * @param {number} sType - COMMON(1) or SUPER(3)
 */
function setNextFreeTime(summonState, sType) {
    var now = Date.now();
    var config = getSummonConfig(sType);
    var freeCooldown = (config && config.free) ? config.free * 1000 : 0; // seconds → ms

    if (sType === SUMMON_TYPE.COMMON) {
        summonState._canCommonFreeTime = now + freeCooldown;
    } else if (sType === SUMMON_TYPE.SUPER) {
        summonState._canSuperFreeTime = now + freeCooldown;
    }
}

/**
 * Get the free time timestamp for response.
 * Returns the relevant _canFreeTime based on sType.
 *
 * @param {object} summonState
 * @param {number} sType
 * @returns {number} Timestamp in ms
 */
function getFreeTimeForResponse(summonState, sType) {
    if (sType === SUMMON_TYPE.COMMON) {
        return summonState._canCommonFreeTime || 0;
    } else if (sType === SUMMON_TYPE.SUPER) {
        return summonState._canSuperFreeTime || 0;
    }
    return 0;
}

// =============================================
// WISH LIST HELPERS
// =============================================

/**
 * Compute the current max wish version from heroBook.json.
 * Must match client HeroCommon.getWishMaxVersion() exactly (main.min.js line 53650):
 *   Scan all entries in heroBook.json, find flickerOrange heroes,
 *   return the max isNewVersion value.
 *
 * The client compares this value against player._wishVersion:
 *   if getWishMaxVersion() != WishVersion → show red dot
 *
 * @returns {number} Max isNewVersion across all flickerOrange heroes
 */
function getWishMaxVersion() {
    var heroBook = GameData.get('heroBook');
    var localHeroInfo = GameData.get('localHeroInfo');
    if (!heroBook || !localHeroInfo) return 0;

    var maxVersion = 0;
    for (var key in heroBook) {
        var entry = heroBook[key];
        var heroInfo = localHeroInfo[entry.id];
        if (heroInfo && heroInfo.quality === 'flickerOrange') {
            if (entry.isNewVersion > maxVersion) {
                maxVersion = entry.isNewVersion;
            }
        }
    }
    return maxVersion;
}

// =============================================
// GUIDE SUMMON — Predetermined heroes for tutorial
// =============================================

/**
 * Guide summon hero mapping from constant.json.
 * When isGuide=true, the server returns these predetermined heroes
 * instead of random gacha rolls. This ensures the tutorial battle
 * (tutorialBattle.json) has the correct heroes available.
 *
 * Source:
 *   constant.json → tutorialNormalHero: 1206 (blue quality)
 *   constant.json → tutorialHighHero: 1309 (purple quality)
 *   constant.json → startHero: 1205 (given at account creation, not from summon)
 *   tutorialBattle.json expects heroes: 1205, 1206, 1309
 *
 * errorDefine.json → ERROR_SUMMON_REPEAT_GUIDE (10052, isKick=1)
 *   Server must track guide summon to prevent duplicate predetermined summons.
 */
var GUIDE_HERO_MAP = {
    /* sType: { displayId, quality } */
};

(function() {
    var constants = GameData.get('constant');
    if (constants && constants[1]) {
        var c = constants[1];
        if (c.tutorialNormalHero) {
            GUIDE_HERO_MAP[SUMMON_TYPE.COMMON] = {
                displayId: c.tutorialNormalHero,
                quality: 'blue'
            };
        }
        if (c.tutorialHighHero) {
            GUIDE_HERO_MAP[SUMMON_TYPE.SUPER] = {
                displayId: c.tutorialHighHero,
                quality: 'purple'
            };
        }
    }
})();

/**
 * Build a predetermined guide hero object.
 *
 * @param {number} displayId - Hero displayId (from constant.json)
 * @param {string} quality - Hero quality (e.g. 'blue', 'purple')
 * @returns {object} Hero object matching buildHeroObject format
 */
function buildGuideHero(displayId, quality) {
    var heroId = generateHeroId();
    return {
        _heroId: heroId,
        _heroDisplayId: String(displayId),
        _heroQuality: quality || 'blue',
        _heroBaseAttr: {
            _level: 1,
            _evolveLevel: 0,
            _hp: 0, _attack: 0, _armor: 0, _speed: 0,
            _hit: 0, _dodge: 0, _block: 0, _blockEffect: 0,
            _skillDamage: 0, _critical: 0, _criticalResist: 0,
            _criticalDamage: 0, _armorBreak: 0, _damageReduce: 0,
            _controlResist: 0, _trueDamage: 0, _energy: 0, _power: 0,
            _extraArmor: 0, _hpPercent: 0, _armorPercent: 0,
            _attackPercent: 0, _speedPercent: 0, _orghp: 0,
            _superDamage: 0, _healPlus: 0, _healerPlus: 0,
            _damageDown: 0, _shielderPlus: 0, _damageUp: 0,
        },
        _heroStar: 0,
        _superSkillLevel: 0,
        _potentialLevel: {},
        _superSkillResetCount: 0,
        _potentialResetCount: 0,
        _qigong: { _items: {} },
        _qigongTmp: { _items: {} },
        _qigongTmpPower: 0,
        _qigongStage: 1,
        _breakInfo: {
            _breakLevel: 1, _level: 0,
            _attr: { _items: {} }, _version: '',
        },
        _totalCost: {
            _wakeUp: {}, _earring: {}, _levelUp: {},
            _evolve: {}, _skill: {}, _qigong: {}, _heroBreak: {},
        },
        _expeditionMaxLevel: 0,
        _gemstoneSuitId: 0,
        _linkTo: [],
        _linkFrom: '',
        _resonanceType: 0,
        _version: '202010131125',
    };
}

// =============================================
// MAIN SUMMON LOGIC
// =============================================

/**
 * Core summon execution logic.
 * Performs N gacha rolls, updates user state, and builds the response.
 *
 * @param {object} userData - User's game_data (MUTATED in place)
 * @param {number} sType - SummonType enum
 * @param {number} count - Number of rolls (1 or 10)
 * @param {boolean} isFree - Whether this is a free summon
 * @returns {object} Response data: { _addTotal, _energy, _summonTimes, _changeInfo, _canFreeTime? }
 */
function executeSummon(userData, sType, count, isFree) {
    var summonState = userData.summon || {};
    var now = Date.now();
    var addTotal = [];
    var changedItems = {};
    var energyGained = 0;

    // --- Step 1: Deduct cost (if not free) ---
    if (!isFree && sType !== SUMMON_TYPE.ENERGY) {
        var config = getSummonConfig(sType);
        if (config) {
            // summon.json fields: costID1/cost1 (single), costID2/cost2 (ten)
            // BUG FIX: was config['costID' + count] which produced costID10 (undefined!)
            var costIndex = (count >= 10) ? 2 : 1;
            var costId = config['costID' + costIndex];
            var costNum = config['cost' + costIndex];

            if (costId && costNum) {
                var success = deductCost(userData, costId, costNum);
                if (!success) {
                    // Not enough currency — but for draft, we still proceed
                    // In production: return error callback(RH.error(..., 'Not enough items'))
                    logger.warn('SUMMON', 'Not enough items for sType=' + sType +
                        ' costId=' + costId + ' need=' + costNum);
                }
                // Track changed item in _changeInfo
                changedItems[String(costId)] = {
                    _id: costId,
                    _num: getItemCount(userData, costId),
                };
            }
        }
    }

    // --- Step 2: Perform gacha rolls ---
    for (var i = 0; i < count; i++) {
        // Check pity threshold — if exceeded, force pity pool
        var pityCount = (summonState._summonTimes && summonState._summonTimes[String(sType)]) || 0;
        var usePityPool = (sType === SUMMON_TYPE.SUPER || sType === SUMMON_TYPE.SUPER_DIAMOND || sType === SUMMON_TYPE.COMMON) && pityCount >= 80;

        var poolEntry = rollGacha(sType, usePityPool);

        // Fallback: if pool is empty or no entry selected, use default
        if (!poolEntry) {
            poolEntry = {
                thingsId: 1205,
                thingsNum: 1,
                type: 'hero',
                quality: 'purple',
            };
            logger.warn('SUMMON', 'Pool returned null for sType=' + sType + ', using fallback hero 1205');
        }

        var heroObj = buildHeroObject(poolEntry, true);
        addTotal.push(heroObj);

        // --- Step 3: Update pity counter ---
        if (!summonState._summonTimes) {
            summonState._summonTimes = {};
        }
        var sTypeKey = String(sType);
        summonState._summonTimes[sTypeKey] = (summonState._summonTimes[sTypeKey] || 0) + 1;

        // --- Step 4: Accumulate energy (premium summons only) ---
        var energyPerRoll = getEnergyPerRoll(sType);
        if (energyPerRoll > 0) {
            energyGained += energyPerRoll;
            summonState._energy = (summonState._energy || 0) + energyPerRoll;

            // Cap energy at max threshold (3 steps × 800 = 2400)
            var maxEnergy = 2400;
            if (summonState._energy > maxEnergy) {
                summonState._energy = maxEnergy;
            }
        }
    }

    // --- Step 5: Update free time (for free summons) ---
    var canFreeTime = 0;
    if (isFree) {
        setNextFreeTime(summonState, sType);
        canFreeTime = getFreeTimeForResponse(summonState, sType);
    }

    // --- Step 6: Add new heroes to user's hero collection ---
    if (userData.heros && userData.heros._heros) {
        for (var h = 0; h < addTotal.length; h++) {
            var heroResult = addTotal[h];
            if (heroResult._heroId && heroResult._heroDisplayId) {
                userData.heros._heros[heroResult._heroId] = heroResult;
            }
        }
    }

    // --- Step 7: Write back summon state ---
    userData.summon = summonState;

    // --- Step 8: Build response ---
    var response = {
        _addTotal: addTotal,
        _energy: summonState._energy || 0,
        _summonTimes: summonState._summonTimes || {},
        _changeInfo: buildChangeInfoItems(changedItems),
    };

    // Only include _canFreeTime for free summons (overrides local timer)
    if (isFree && canFreeTime > 0) {
        response._canFreeTime = canFreeTime;
    }

    return response;
}

// =============================================
// ACTION HANDLERS
// =============================================

/**
 * summonOneFree — Perform a free single summon.
 *
 * CLIENT REQUEST (line ~61794):
 * { type:"summon", action:"summonOneFree", userId, sType:SummonType.SUPER/COMMON, isGuide?, version:"1.0" }
 *
 * Only sType 1 (COMMON) and 3 (SUPER) support free summons.
 * Free cooldown: from summon.json `free` field (seconds).
 *
 * RESPONSE: { _addTotal[], _energy, _canFreeTime, _summonTimes, _changeInfo }
 */
async function handleSummonOneFree(socket, parsed, callback) {
    var userId = parsed.userId;
    var sType = parseInt(parsed.sType) || SUMMON_TYPE.COMMON;
    var isGuide = parsed.isGuide;

    logger.info('SUMMON', 'summonOneFree: userId=' + (userId || '-') +
        ', sType=' + sType + ', isGuide=' + isGuide);

    // Validate sType — only COMMON(1) and SUPER(3) support free summons
    if (sType !== SUMMON_TYPE.COMMON && sType !== SUMMON_TYPE.SUPER) {
        logger.warn('SUMMON', 'summonOneFree: invalid sType=' + sType + ' for free summon');
        return callback(RH.error(RH.ErrorCode.INVALID, 'Invalid sType for free summon'));
    }

    try {
        // Load user data
        var userData = await UserDataService.loadUserData(userId);
        if (!userData) {
            logger.warn('SUMMON', 'summonOneFree: user not found userId=' + userId);
            return callback(RH.error(RH.ErrorCode.DATA_ERROR, 'User data not found'));
        }

        // Initialize summon state if missing
        if (!userData.summon) {
            userData.summon = {
                _energy: 0,
                _wishList: [],
                _wishVersion: 0,
                _canCommonFreeTime: 0,
                _canSuperFreeTime: 0,
                _summonTimes: {},
            };
        }

        // Check if free summon is available
        if (!isFreeSummonAvailable(userData.summon, sType)) {
            logger.warn('SUMMON', 'summonOneFree: free summon not ready for userId=' + userId +
                ', sType=' + sType);
            // Client handles this gracefully — return with current state
            return callback(RH.success({
                _addTotal: [],
                _energy: userData.summon._energy || 0,
                _summonTimes: userData.summon._summonTimes || {},
                _changeInfo: { _items: {} },
            }));
        }

        // --- GUIDE SUMMON: isGuide=true → predetermined hero ---
        if (isGuide) {
            var guideHero = GUIDE_HERO_MAP[sType];
            if (guideHero && !userData.summon._guideSummonDone) {
                // First guide summon: return predetermined hero
                var guideObj = buildGuideHero(guideHero.displayId, guideHero.quality);

                // Add hero to collection
                if (userData.heros && userData.heros._heros) {
                    userData.heros._heros[guideObj._heroId] = guideObj;
                }

                // Update free timer
                setNextFreeTime(userData.summon, sType);
                var guideFreeTime = getFreeTimeForResponse(userData.summon, sType);

                // Update summon times
                if (!userData.summon._summonTimes) userData.summon._summonTimes = {};
                var guideTypeKey = String(sType);
                userData.summon._summonTimes[guideTypeKey] = (userData.summon._summonTimes[guideTypeKey] || 0) + 1;

                // Mark guide summon as done — prevent future predetermined summons
                userData.summon._guideSummonDone = true;

                // Save
                try {
                    await UserDataService.saveUserData(userId, userData);
                } catch (saveErr) {
                    logger.error('SUMMON', 'summonOneFree: guide save failed: ' + saveErr.message);
                }

                var guideResponse = {
                    _addTotal: [guideObj],
                    _energy: userData.summon._energy || 0,
                    _canFreeTime: guideFreeTime,
                    _summonTimes: userData.summon._summonTimes || {},
                    _changeInfo: { _items: {} },
                };

                callback(RH.success(guideResponse));
                logger.info('SUMMON', 'summonOneFree: GUIDE summon userId=' + userId +
                    ', sType=' + sType + ', hero=' + guideHero.displayId);
                return;
            }
            else if (userData.summon._guideSummonDone) {
                // Guide already completed — proceed as normal summon below.
                // Do NOT return error 10052 (isKick=1 would disconnect the client).
                // Just log and fall through to normal summon.
                logger.info('SUMMON', 'summonOneFree: guide already done, falling through to normal summon userId=' + userId);
            }
        }

        // --- NORMAL SUMMON: standard gacha roll ---
        var response = executeSummon(userData, sType, 1, true);

        // Save user data
        try {
            await UserDataService.saveUserData(userId, userData);
        } catch (saveErr) {
            logger.error('SUMMON', 'summonOneFree: failed to save: ' + saveErr.message);
        }

        callback(RH.success(response));
        logger.info('SUMMON', 'summonOneFree: success userId=' + userId +
            ', hero=' + (response._addTotal[0] && response._addTotal[0]._heroDisplayId));

    } catch (err) {
        logger.error('SUMMON', 'summonOneFree: error userId=' + userId + ': ' + err.message);
        logger.error('SUMMON', 'summonOneFree: stack: ' + err.stack);
        callback(RH.error(RH.ErrorCode.UNKNOWN, 'Internal server error'));
    }
}

/**
 * summonOne — Perform a paid single summon.
 *
 * CLIENT REQUEST (line ~61803):
 * { type:"summon", action:"summonOne", userId, sType:1/2/3/4, version:"1.0" }
 *
 * sType: COMMON(1), FRIEND(2), SUPER(3), SUPER_DIAMOND(4)
 *
 * RESPONSE: { _addTotal[], _energy, _summonTimes, _changeInfo }
 */
async function handleSummonOne(socket, parsed, callback) {
    var userId = parsed.userId;
    var sType = parseInt(parsed.sType) || SUMMON_TYPE.COMMON;

    logger.info('SUMMON', 'summonOne: userId=' + (userId || '-') + ', sType=' + sType);

    // Validate sType
    if (sType < SUMMON_TYPE.COMMON || sType > SUMMON_TYPE.SUPER_DIAMOND) {
        logger.warn('SUMMON', 'summonOne: invalid sType=' + sType);
        return callback(RH.error(RH.ErrorCode.INVALID, 'Invalid sType'));
    }

    try {
        var userData = await UserDataService.loadUserData(userId);
        if (!userData) {
            logger.warn('SUMMON', 'summonOne: user not found userId=' + userId);
            return callback(RH.error(RH.ErrorCode.DATA_ERROR, 'User data not found'));
        }

        // Initialize summon state if missing
        if (!userData.summon) {
            userData.summon = {
                _energy: 0,
                _wishList: [],
                _wishVersion: 0,
                _canCommonFreeTime: 0,
                _canSuperFreeTime: 0,
                _summonTimes: {},
            };
        }

        // Execute summon (1 roll, paid)
        var response = executeSummon(userData, sType, 1, false);

        // Save user data
        try {
            await UserDataService.saveUserData(userId, userData);
        } catch (saveErr) {
            logger.error('SUMMON', 'summonOne: failed to save: ' + saveErr.message);
        }

        callback(RH.success(response));
        logger.info('SUMMON', 'summonOne: success userId=' + userId +
            ', hero=' + (response._addTotal[0] && response._addTotal[0]._heroDisplayId));

    } catch (err) {
        logger.error('SUMMON', 'summonOne: error userId=' + userId + ': ' + err.message);
        callback(RH.error(RH.ErrorCode.UNKNOWN, 'Internal server error'));
    }
}

/**
 * summonTen — Perform x10 summon.
 *
 * CLIENT REQUEST (line ~61822):
 * { type:"summon", action:"summonTen", userId, sType:1/2/3/4, version:"1.0" }
 *
 * Uses cost2 (10x discounted rate) from summon.json.
 *
 * RESPONSE: { _addTotal[10], _energy, _summonTimes, _changeInfo }
 */
async function handleSummonTen(socket, parsed, callback) {
    var userId = parsed.userId;
    var sType = parseInt(parsed.sType) || SUMMON_TYPE.COMMON;

    logger.info('SUMMON', 'summonTen: userId=' + (userId || '-') + ', sType=' + sType);

    // Validate sType
    if (sType < SUMMON_TYPE.COMMON || sType > SUMMON_TYPE.SUPER_DIAMOND) {
        logger.warn('SUMMON', 'summonTen: invalid sType=' + sType);
        return callback(RH.error(RH.ErrorCode.INVALID, 'Invalid sType'));
    }

    try {
        var userData = await UserDataService.loadUserData(userId);
        if (!userData) {
            logger.warn('SUMMON', 'summonTen: user not found userId=' + userId);
            return callback(RH.error(RH.ErrorCode.DATA_ERROR, 'User data not found'));
        }

        // Initialize summon state if missing
        if (!userData.summon) {
            userData.summon = {
                _energy: 0,
                _wishList: [],
                _wishVersion: 0,
                _canCommonFreeTime: 0,
                _canSuperFreeTime: 0,
                _summonTimes: {},
            };
        }

        // Execute summon (10 rolls, paid)
        var response = executeSummon(userData, sType, 10, false);

        // Save user data
        try {
            await UserDataService.saveUserData(userId, userData);
        } catch (saveErr) {
            logger.error('SUMMON', 'summonTen: failed to save: ' + saveErr.message);
        }

        callback(RH.success(response));
        logger.info('SUMMON', 'summonTen: success userId=' + userId +
            ', heroes=' + response._addTotal.length);

    } catch (err) {
        logger.error('SUMMON', 'summonTen: error userId=' + userId + ': ' + err.message);
        callback(RH.error(RH.ErrorCode.UNKNOWN, 'Internal server error'));
    }
}

/**
 * summonEnergy — Pity/energy summon.
 *
 * CLIENT REQUEST (line ~61998):
 * { type:"summon", action:"summonEnergy", userId, version:"1.0" }
 *
 * No sType — always uses ENERGY pool.
 * Only available when energyPrecent >= 1 (energy >= threshold).
 * After summon: reset energy to 0, increment _summonTimes[5].
 * Uses randomSummonEnergy rate column from summonPool.json.
 *
 * Client sets `e.justShowPage = !0` on response before processing.
 *
 * RESPONSE: { _addTotal[], _energy, _summonTimes, _changeInfo }
 */
async function handleSummonEnergy(socket, parsed, callback) {
    var userId = parsed.userId;

    logger.info('SUMMON', 'summonEnergy: userId=' + (userId || '-'));

    try {
        var userData = await UserDataService.loadUserData(userId);
        if (!userData) {
            logger.warn('SUMMON', 'summonEnergy: user not found userId=' + userId);
            return callback(RH.error(RH.ErrorCode.DATA_ERROR, 'User data not found'));
        }

        var summonState = userData.summon || {};

        // Check if energy summon is available
        if (!isEnergySummonAvailable(summonState)) {
            logger.warn('SUMMON', 'summonEnergy: not available for userId=' + userId +
                ', energy=' + (summonState._energy || 0));
            return callback(RH.success({
                _addTotal: [],
                _energy: summonState._energy || 0,
                _summonTimes: summonState._summonTimes || {},
                _changeInfo: { _items: {} },
            }));
        }

        // Initialize summon state
        if (!userData.summon) {
            userData.summon = {
                _energy: 0,
                _wishList: [],
                _wishVersion: 0,
                _canCommonFreeTime: 0,
                _canSuperFreeTime: 0,
                _summonTimes: {},
            };
            summonState = userData.summon;
        }

        // --- Roll gacha using ENERGY pool ---
        var poolEntry = rollGacha(SUMMON_TYPE.ENERGY, false);
        if (!poolEntry) {
            // Fallback: orange or higher hero
            poolEntry = { thingsId: 1319, thingsNum: 1, type: 'hero', quality: 'orange' };
            logger.warn('SUMMON', 'summonEnergy: ENERGY pool empty, using fallback');
        }

        var heroObj = buildHeroObject(poolEntry, true);

        // --- Reset energy and update pity counter ---
        summonState._energy = 0;
        if (!summonState._summonTimes) summonState._summonTimes = {};
        var energyKey = String(SUMMON_TYPE.ENERGY);
        var currentEnergyCount = summonState._summonTimes[energyKey] || 0;
        summonState._summonTimes[energyKey] = currentEnergyCount + 1;

        // --- Add hero to collection ---
        if (userData.heros && userData.heros._heros && heroObj._heroId) {
            userData.heros._heros[heroObj._heroId] = heroObj;
        }

        userData.summon = summonState;

        var response = {
            _addTotal: [heroObj],
            _energy: 0,  // Energy is consumed
            _summonTimes: summonState._summonTimes,
            _changeInfo: { _items: {} },
        };

        // Save
        try {
            await UserDataService.saveUserData(userId, userData);
        } catch (saveErr) {
            logger.error('SUMMON', 'summonEnergy: failed to save: ' + saveErr.message);
        }

        callback(RH.success(response));
        logger.info('SUMMON', 'summonEnergy: success userId=' + userId +
            ', hero=' + (heroObj._heroDisplayId || poolEntry.thingsId) +
            ', pityCount=' + summonState._summonTimes[energyKey]);

    } catch (err) {
        logger.error('SUMMON', 'summonEnergy: error userId=' + userId + ': ' + err.message);
        callback(RH.error(RH.ErrorCode.UNKNOWN, 'Internal server error'));
    }
}

/**
 * setWishList — Save player's wish list.
 *
 * CLIENT REQUEST (line ~172446):
 * { type:"summon", action:"setWishList", userId, wishList:[displayId1, displayId2, ...] }
 *
 * CLIENT RESPONSE HANDLER:
 *   SummonSingleton.getInstance().WishList = e.wishList
 *
 * Only flickerOrange quality heroes are eligible for wish list.
 * Server should validate and return confirmed wishList.
 *
 * RESPONSE: { wishList: [displayId...] }
 */
async function handleSetWishList(socket, parsed, callback) {
    var userId = parsed.userId;
    var wishList = parsed.wishList;

    logger.info('SUMMON', 'setWishList: userId=' + (userId || '-') +
        ', wishList=' + JSON.stringify(wishList));

    if (!Array.isArray(wishList)) {
        logger.warn('SUMMON', 'setWishList: invalid wishList (not array)');
        return callback(RH.error(RH.ErrorCode.LACK_PARAM, 'Invalid wishList'));
    }

    try {
        var userData = await UserDataService.loadUserData(userId);
        if (!userData) {
            logger.warn('SUMMON', 'setWishList: user not found userId=' + userId);
            return callback(RH.error(RH.ErrorCode.DATA_ERROR, 'User data not found'));
        }

        // Initialize summon state
        if (!userData.summon) {
            userData.summon = {
                _energy: 0,
                _wishList: [],
                _wishVersion: 0,
                _canCommonFreeTime: 0,
                _canSuperFreeTime: 0,
                _summonTimes: {},
            };
        }

        // Save wish list
        userData.summon._wishList = wishList;

        // Update wish version to match current max (clears red dot on next login).
        // Client: WishVersion = HeroCommon.getWishMaxVersion() → red dot check:
        //   getWishMaxVersion() != WishVersion → show red dot
        // Server must set _wishVersion = getWishMaxVersion() so next login has no red dot.
        userData.summon._wishVersion = getWishMaxVersion();

        // Save
        try {
            await UserDataService.saveUserData(userId, userData);
        } catch (saveErr) {
            logger.error('SUMMON', 'setWishList: failed to save: ' + saveErr.message);
        }

        callback(RH.success({
            wishList: wishList,
        }));

        logger.info('SUMMON', 'setWishList: success userId=' + userId +
            ', count=' + wishList.length + ', version=' + userData.summon._wishVersion);

    } catch (err) {
        logger.error('SUMMON', 'setWishList: error userId=' + userId + ': ' + err.message);
        callback(RH.error(RH.ErrorCode.UNKNOWN, 'Internal server error'));
    }
}

/**
 * readWishList — Read wish list (fire & forget).
 *
 * CLIENT REQUEST (line ~172784):
 * { type:"summon", action:"readWishList", userId }
 *
 * CLIENT: No callback — fire and forget.
 * Used to clear red dot notification on client.
 * Client already hides red dot locally before sending this request.
 *
 * Server-side: update _wishVersion to current max so red dot
 * stays cleared on next login.
 *
 * RESPONSE: {} (empty — client doesn't process response)
 */
async function handleReadWishList(socket, parsed, callback) {
    var userId = parsed.userId;

    logger.info('SUMMON', 'readWishList: userId=' + (userId || '-'));

    try {
        // Update _wishVersion server-side so red dot stays cleared on next login.
        // Client hides red dot locally, but on next login reads _wishVersion from server.
        // If server _wishVersion < getWishMaxVersion() → red dot reappears.
        var userData = await UserDataService.loadUserData(userId);
        if (userData && userData.summon) {
            userData.summon._wishVersion = getWishMaxVersion();
            try {
                await UserDataService.saveUserData(userId, userData);
            } catch (saveErr) {
                logger.error('SUMMON', 'readWishList: failed to save: ' + saveErr.message);
            }
        }
    } catch (err) {
        // Non-critical — fire and forget, don't block the response
        logger.warn('SUMMON', 'readWishList: failed to update wishVersion: ' + err.message);
    }

    // Fire and forget — client has no callback
    // But we still return success via callback to prevent socket error
    callback(RH.success({}));
}

// =============================================
// MAIN ROUTER
// =============================================

/**
 * Main handler function — routes actions to specific handlers.
 *
 * Called by main-server/index.js:
 *   handler.handle(socket, parsed, callback)
 *
 * @param {object} socket - Socket.IO socket instance
 * @param {object} parsed - Parsed request { type, action, userId, ...params }
 * @param {function} callback - Socket.IO acknowledgment callback
 */
async function handle(socket, parsed, callback) {
    var action = parsed.action;
    var userId = parsed.userId;

    if (!action) {
        return callback(RH.error(RH.ErrorCode.LACK_PARAM, 'Missing action'));
    }

    try {
        switch (action) {

            // === GACHA ACTIONS ===
            case 'summonOneFree':
                await handleSummonOneFree(socket, parsed, callback);
                break;

            case 'summonOne':
                await handleSummonOne(socket, parsed, callback);
                break;

            case 'summonTen':
                await handleSummonTen(socket, parsed, callback);
                break;

            // === PITY / ENERGY ACTION ===
            case 'summonEnergy':
                await handleSummonEnergy(socket, parsed, callback);
                break;

            // === WISH LIST ACTIONS ===
            case 'setWishList':
                await handleSetWishList(socket, parsed, callback);
                break;

            case 'readWishList':
                await handleReadWishList(socket, parsed, callback);
                break;

            // === UNKNOWN ACTION ===
            default:
                logger.warn('SUMMON', 'Unknown action: ' + action +
                    ' from userId=' + (userId || '-') + ', returning empty success');
                callback(RH.success({}));
                break;
        }
    } catch (err) {
        logger.error('SUMMON', 'Handler error for action=' + action + ': ' + err.message);
        logger.error('SUMMON', 'Stack: ' + err.stack);
        callback(RH.error(RH.ErrorCode.UNKNOWN, 'Internal server error'));
    }
}

module.exports = { handle: handle };
