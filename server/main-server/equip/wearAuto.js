/**
 * ============================================================
 * WEARAUTO.JS - Mock Handler for equip.wearAuto
 * ============================================================
 *
 * Purpose: Processes batch equipment wear requests (multiple equips at once).
 * Called when player batch-equips items to a hero (e.g., "Equip All" or preset).
 *
 * HAR Reference: HAR analysis (5 entries verified)
 * Client Flow:
 *   1. Player triggers batch equip action (e.g., "Equip All" button)
 *   2. Client sends: ts.processHandler({
 *        type:"equip", action:"wearAuto",
 *        userId:"<uuid>", heroId:"<hero-uuid>",
 *        equipInfo:{"1":"3001","2":"3002","3":"3003","4":"3004"},
 *        weaponId:"", version:"1.0"
 *      }, successCb, errorCb)
 *   3. On response, client updates hero stats, equip display, and item counts
 *
 * Request Format:
 *   { type:"equip", action:"wearAuto", userId:"<uuid>", heroId:"<uuid>",
 *     equipInfo:{"1":"3001","2":"3002","3":"3003","4":"3004"},
 *     weaponId:"", version:"1.0" }
 *
 * Response Schema (full response including echoed fields):
 *   {
 *     type:"equip", action:"wearAuto", userId:"<uuid>", heroId:"<uuid>",
 *     equipInfo:{"1":"3001","2":"3002","3":"3003","4":"3004"},
 *     weaponId:"", version:"1.0",
 *     _totalAttr: { _items: { "0":{_id:0,_num:HP}, ... 41 entries total } },
 *     _changeInfo: { _items: { "3001":{_id:3001,_num:NEW_TOTAL_COUNT}, ... } },
 *     _equipItem: {
 *       _suitItems: [ {_id:"3001", _pos:1, _version:"201906201330"}, ... ],
 *       _earrings: {_id:0, _level:0, _attrs:{_items:{}}, _version:""},
 *       _suitAttrs: [],
 *       _equipAttrs: [ {_id:1, _num:270}, {_id:26, _num:1430}, {_id:0, _num:4906} ],
 *       _weaponState: 0
 *     },
 *     _linkHeroesTotalAttr: {}
 *   }
 *
 * HAR TEST CASE #1 — Full 4-equip batch wear (pos 1-4, equips 3001-3004):
 *   Request: equipInfo:{"1":"3001","2":"3002","3":"3003","4":"3004"}
 *   Equip 3001 abilities: abilityID1=1,value1=270 / abilityID2=26,value2=715
 *   Equip 3002 abilities: abilityID1=0,value1=2453
 *   Equip 3003 abilities: abilityID1=26,value1=715
 *   Equip 3004 abilities: abilityID1=0,value1=2453
 *   Summed abilities: {1:270, 26:1430, 0:4906}
 *   _equipAttrs (insertion order): [{_id:1,_num:270},{_id:26,_num:1430},{_id:0,_num:4906}]
 *   _suitItems: [{_id:"3001",_pos:1},{_id:"3002",_pos:2},{_id:"3003",_pos:3},{_id:"3004",_pos:4}]
 *
 * HAR TEST CASE #2 — Partial 2-equip batch wear (pos 3-4, equips 3003-3004):
 *   Request: equipInfo:{"3":"3003","4":"3004"}
 *   Equip 3003 abilities: abilityID1=26,value1=715
 *   Equip 3004 abilities: abilityID1=0,value1=2453
 *   Summed abilities: {26:715, 0:2453}
 *   _equipAttrs (insertion order): [{_id:26,_num:715},{_id:0,_num:2453}]
 *   _suitItems: [{_id:"3003",_pos:3},{_id:"3004",_pos:4}]
 *
 * HAR TEST CASE #3 — Single equip batch wear:
 *   Request: equipInfo:{"2":"3005"}
 *   Single equip processed, swap logic applies if pos occupied
 *   _changeInfo shows new equip count and old equip count (if swapped)
 *
 * HAR TEST CASE #4 — Batch wear with swap on multiple slots:
 *   Request: equipInfo:{"1":"3006","3":"3007"}
 *   If pos 1 had equip 3001 and pos 3 had equip 3003:
 *     - 3001 returned to inventory (+1), 3006 deducted (-1)
 *     - 3003 returned to inventory (+1), 3007 deducted (-1)
 *   _changeInfo has 4 entries: 3006, 3001, 3007, 3003
 *
 * HAR TEST CASE #5 — Partial batch (only some slots provided):
 *   Request: equipInfo:{"1":"3001","4":"3004"}
 *   Only pos 1 and pos 4 are processed
 *   Existing equips on pos 2 and pos 3 are untouched
 *   Stats reflect ALL worn equips (including untouched ones)
 *
 * CRITICAL BEHAVIORAL RULES (from HAR analysis):
 *   1. _totalAttr._items has exactly 42 entries (IDs 0-41), same as hero.getAttrs
 *   2. _equipAttrs uses INSERTION ORDER (first appearance by position), NOT sorted
 *   3. _suitItems lists ALL currently worn equips with _id as STRING
 *   4. _suitAttrs is always [] for green equips (suit 3901 all values = 0)
 *   5. _changeInfo._items.<equipId>._num = NEW TOTAL inventory count
 *   6. NO _clearStoneSuit field in response (unlike equip.wear)
 *   7. _linkHeroesTotalAttr is always {}
 *   8. _earrings is always {_id:0,_level:0,_attrs:{_items:{}},_version:""}
 *   9. _weaponState is always 0
 *  10. Response echoes all request fields: type, action, userId, heroId, equipInfo, weaponId, version
 *  11. _suitItems._id is STRING (e.g., "3001"), NOT integer (unlike equip.wear)
 *  12. equipInfo keys are string positions, values are string equipIds
 *
 * Batch processing logic:
 *   For each entry in equipInfo (pos → equipId):
 *     a. If hero already has equip at that pos → return old equip to inventory (+1)
 *     b. Deduct 1 from new equipId inventory count
 *     c. Store new equip on hero._equips[pos]
 *   After all equips processed, compute hero stats once.
 *
 * Config files loaded from /resource/json/:
 *   equip.json            — Equipment definitions (abilities, version, belongToSuit)
 *   equipSuit.json        — Suit set bonuses
 *   hero.json             — Hero definitions (heroType, talent, speed, balance values)
 *   heroLevelAttr.json    — Base stats per level
 *   heroTypeParam.json    — Hero type multipliers
 *   heroEvolve.json       — Evolve flat bonuses
 *   heroLevelUpMul.json   — Evolve multipliers
 *   heroPower.json        — Combat power weights
 *
 * Author: Local SDK Bridge
 * Version: 1.0.0 - Based on HAR real server data (5 entries analyzed)
 * ============================================================
 */

(function(window) {
    'use strict';

    // ========================================================
    // 1. STYLISH LOGGER
    // ========================================================
    var LOG = {
        prefix: '\uD83D\uDEE1\uFE0F [EQUIP-WEAR-AUTO]',
        _log: function(level, icon, message, data) {
            var timestamp = new Date().toISOString().substr(11, 12);
            var styles = {
                success: 'color: #22c55e; font-weight: bold;',
                info: 'color: #6b7280;',
                warn: 'color: #f59e0b; font-weight: bold;',
                error: 'color: #ef4444; font-weight: bold;'
            };
            var style = styles[level] || styles.info;
            var format = '%c' + this.prefix + ' ' + icon + ' [' + timestamp + '] ' + message;
            if (data !== undefined) {
                console.log(format + ' %o', style, data);
            } else {
                console.log(format, style);
            }
        },
        success: function(msg, data) { this._log('success', '\u2705', msg, data); },
        info: function(msg, data) { this._log('info', '\u2139\uFE0F', msg, data); },
        warn: function(msg, data) { this._log('warn', '\u26A0\uFE0F', msg, data); },
        error: function(msg, data) { this._log('error', '\u274C', msg, data); }
    };

    // ========================================================
    // 2. CONFIG CACHE
    // ========================================================
    var CONFIGS = {
        hero: null,
        heroLevelAttr: null,
        heroTypeParam: null,
        heroLevelUpMul: null,
        heroEvolve: null,
        heroPower: null,
        equip: null,
        equipSuit: null
    };

    // ========================================================
    // 3. CONFIG LOADING
    // ========================================================
    function loadJsonFile(name, callback) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', '/resource/json/' + name + '.json', true);
        xhr.onload = function() {
            if (xhr.status === 200 || xhr.status === 0) {
                try {
                    CONFIGS[name] = JSON.parse(xhr.responseText);
                    LOG.info('Loaded config: ' + name);
                } catch (e) {
                    LOG.error('Parse error for config: ' + name, e.message);
                }
            } else {
                LOG.warn('Failed to load config: ' + name + ' (status ' + xhr.status + ')');
            }
            if (callback) callback();
        };
        xhr.onerror = function() {
            LOG.error('Network error loading config: ' + name);
            if (callback) callback();
        };
        xhr.send();
    }

    function loadAllConfigs(onReady) {
        var mainConfigs = ['hero', 'heroLevelAttr', 'heroTypeParam', 'heroLevelUpMul', 'heroEvolve', 'heroPower', 'equip', 'equipSuit'];
        var mainLoaded = 0;
        var mainTotal = mainConfigs.length;

        function checkMainDone() {
            mainLoaded++;
            if (mainLoaded >= mainTotal) {
                LOG.info('All ' + mainTotal + ' main configs loaded');
                if (onReady) onReady();
            }
        }

        for (var i = 0; i < mainConfigs.length; i++) {
            (function(name) {
                loadJsonFile(name, checkMainDone);
            })(mainConfigs[i]);
        }
    }

    // ========================================================
    // 4. EVOLVE MULTIPLIER (from heroLevelUpMul.json)
    // ========================================================
    var QUALITY_TO_MUL_ID = {
        'white': '1',
        'green': '2',
        'blue': '3',
        'purple': '4',
        'orange': '5',
        'flickerOrange': '6'
    };

    function getEvolveMultiplier(quality, evolveLevel) {
        var qualityId = QUALITY_TO_MUL_ID[quality] || '1';
        var mulEntries = CONFIGS.heroLevelUpMul ? CONFIGS.heroLevelUpMul[qualityId] : null;

        if (!mulEntries || !mulEntries.length) {
            return { hpMul: 1, attackMul: 1, armorMul: 1 };
        }

        var best = mulEntries[0];
        for (var i = 0; i < mulEntries.length; i++) {
            if (mulEntries[i].evolveLevel <= evolveLevel) {
                best = mulEntries[i];
            }
        }

        return {
            hpMul: parseFloat(best.hpMul) || 1,
            attackMul: parseFloat(best.attackMul) || 1,
            armorMul: parseFloat(best.armorMul) || 1
        };
    }

    // ========================================================
    // 5. EVOLVE FLAT BONUS (from heroEvolve.json)
    // ========================================================
    function getEvolveFlatBonus(displayId, evolveLevel) {
        var entries = CONFIGS.heroEvolve ? CONFIGS.heroEvolve[displayId] : null;

        if (!entries || !entries.length) {
            return { hp: 0, attack: 0, armor: 0, speed: 0 };
        }

        var best = entries[0];
        for (var i = 0; i < entries.length; i++) {
            if (entries[i].level <= evolveLevel) {
                best = entries[i];
            }
        }

        return {
            hp: parseInt(best.hp) || 0,
            attack: parseInt(best.attack) || 0,
            armor: parseInt(best.armor) || 0,
            speed: parseInt(best.speed) || 0
        };
    }

    // ========================================================
    // 6. COMPUTE HERO BASE STATS (same formula as autoLevelUp.js)
    // ========================================================
    function computeHeroBaseStats(heroData) {
        var displayId = String(heroData._heroDisplayId);
        var level = (heroData._heroBaseAttr && heroData._heroBaseAttr._level) || 1;
        var evolveLevel = (heroData._heroBaseAttr && heroData._heroBaseAttr._evolveLevel) || 0;

        var heroConfig = CONFIGS.hero ? CONFIGS.hero[displayId] : null;
        if (!heroConfig) {
            LOG.warn('Hero template not found for displayId: ' + displayId);
            return getDefaultBaseStats(level);
        }

        var heroType = heroConfig.heroType || 'strength';
        var talent = parseFloat(heroConfig.talent) || 0.26;
        var speed = parseInt(heroConfig.speed) || 360;
        var quality = heroConfig.quality || 'white';
        var balanceHp = parseFloat(heroConfig.balanceHp) || 1;
        var balanceAttack = parseFloat(heroConfig.balanceAttack) || 1;
        var balanceArmor = parseFloat(heroConfig.balanceArmor) || 1;

        var levelAttr = CONFIGS.heroLevelAttr ? CONFIGS.heroLevelAttr[String(level)] : null;
        if (!levelAttr) {
            levelAttr = CONFIGS.heroLevelAttr ? CONFIGS.heroLevelAttr['1'] : { hp: 1240, attack: 125, armor: 205 };
            LOG.warn('Level attr not found for level ' + level + ', using level 1');
        }

        var baseHp = parseFloat(levelAttr.hp) || 1240;
        var baseAtk = parseFloat(levelAttr.attack) || 125;
        var baseDef = parseFloat(levelAttr.armor) || 205;

        var typeParam = CONFIGS.heroTypeParam ? CONFIGS.heroTypeParam[heroType] : null;
        if (!typeParam) {
            typeParam = { hpParam: 1, attackParam: 1, armorParam: 1, hpBais: 0, attackBais: 0, armorBais: 0 };
            LOG.warn('Type param not found for heroType: ' + heroType);
        }

        var rawHp = baseHp * (typeParam.hpParam || 1) * balanceHp * talent + (typeParam.hpBais || 0);
        var rawAtk = baseAtk * (typeParam.attackParam || 1) * balanceAttack * talent + (typeParam.attackBais || 0);
        var rawDef = baseDef * (typeParam.armorParam || 1) * balanceArmor * talent + (typeParam.armorBais || 0);

        var evolveMul = getEvolveMultiplier(quality, evolveLevel);
        var finalHp = rawHp * evolveMul.hpMul;
        var finalAtk = rawAtk * evolveMul.attackMul;
        var finalDef = rawDef * evolveMul.armorMul;

        var evolveFlat = getEvolveFlatBonus(displayId, evolveLevel);
        finalHp += evolveFlat.hp;
        finalAtk += evolveFlat.attack;
        finalDef += evolveFlat.armor;
        speed += evolveFlat.speed;

        return {
            hp: parseFloat(finalHp.toFixed(1)),
            atk: parseFloat(finalAtk.toFixed(1)),
            def: parseFloat(finalDef.toFixed(1)),
            speed: speed,
            talent: talent,
            heroType: heroType,
            balancePower: parseFloat(heroConfig.balancePower) || 1,
            quality: quality
        };
    }

    function getDefaultBaseStats(level) {
        var levelAttr = CONFIGS.heroLevelAttr ? CONFIGS.heroLevelAttr[String(level)] : null;
        var hp = levelAttr ? parseFloat(levelAttr.hp) : 1240;
        var atk = levelAttr ? parseFloat(levelAttr.attack) : 125;
        var def = levelAttr ? parseFloat(levelAttr.armor) : 205;

        return {
            hp: hp, atk: atk, def: def, speed: 360,
            talent: 0.26, heroType: 'strength', balancePower: 1, quality: 'white'
        };
    }

    // ========================================================
    // 7. GATHER EQUIP ABILITIES FROM ALL WORN EQUIPS
    // ========================================================

    /**
     * Extracts abilities from a single equip config entry.
     * Iterates abilityID1/value1, abilityID2/value2, ... until undefined.
     *
     * @param {object} equipConfig - Equipment definition from equip.json
     * @returns {Array} Array of {abilityID: number, value: number}
     */
    function getEquipAbilities(equipConfig) {
        if (!equipConfig) return [];
        var abilities = [];
        for (var i = 1; i <= 10; i++) {
            var abilityID = parseInt(equipConfig['abilityID' + i]);
            var value = parseFloat(equipConfig['value' + i]);
            if (!abilityID || isNaN(abilityID) || !value || isNaN(value)) break;
            abilities.push({ abilityID: abilityID, value: value });
        }
        return abilities;
    }

    /**
     * Collects and sums all abilities from all currently worn equips on a hero.
     * IMPORTANT: Iterates slots in Object.keys order to preserve insertion order
     * for _equipAttrs first-appearance ordering.
     *
     * @param {object} heroData - Hero data from playerData.heros
     * @returns {object} Map of abilityID → summed value (insertion-order preserved)
     */
    function sumWornEquipAbilities(heroData) {
        var sumMap = {};
        if (!heroData || !heroData._equips) return sumMap;

        var slots = Object.keys(heroData._equips);
        for (var s = 0; s < slots.length; s++) {
            var slotKey = slots[s];
            var slotData = heroData._equips[slotKey];
            if (!slotData || !slotData._id) continue;

            var equipId = String(slotData._id);
            var equipConfig = CONFIGS.equip ? CONFIGS.equip[equipId] : null;
            if (!equipConfig) {
                LOG.warn('Equip config not found for equipId: ' + equipId);
                continue;
            }

            var abilities = getEquipAbilities(equipConfig);
            for (var a = 0; a < abilities.length; a++) {
                var aid = abilities[a].abilityID;
                var val = abilities[a].value;
                sumMap[aid] = (sumMap[aid] || 0) + val;
            }
        }

        return sumMap;
    }

    // ========================================================
    // 8. BUILD _suitItems FROM WORN EQUIPS
    // ========================================================

    /**
     * Builds _suitItems array listing all worn equips with pos and version.
     * CRITICAL DIFFERENCE FROM wear.js: _id is STRING, not integer.
     *
     * @param {object} heroData - Hero data from playerData.heros
     * @returns {Array} Array of {_id: string, _pos: number, _version: string}
     */
    function buildSuitItems(heroData) {
        var suitItems = [];
        if (!heroData || !heroData._equips) return suitItems;

        var slots = Object.keys(heroData._equips);
        for (var s = 0; s < slots.length; s++) {
            var slotKey = slots[s];
            var slotData = heroData._equips[slotKey];
            if (!slotData || !slotData._id) continue;

            var equipId = String(slotData._id);
            var equipConfig = CONFIGS.equip ? CONFIGS.equip[equipId] : null;
            var version = equipConfig ? (equipConfig.version || '') : '';

            suitItems.push({
                _id: equipId,
                _pos: parseInt(slotKey),
                _version: version
            });
        }

        return suitItems;
    }

    // ========================================================
    // 9. BUILD _equipAttrs (summed abilities as response format)
    // ========================================================

    /**
     * Builds _equipAttrs array from summed ability map.
     * CRITICAL DIFFERENCE FROM wear.js: Uses INSERTION ORDER (first appearance),
     * NOT sorted by _id. This matches the HAR data where the order reflects
     * the order abilities were first encountered during equip processing.
     *
     * @param {object} sumMap - Map of abilityID → summed value (insertion-order preserved)
     * @returns {Array} Array of {_id: abilityID, _num: value} in first-appearance order
     */
    function buildEquipAttrsArray(sumMap) {
        var attrs = [];
        var keys = Object.keys(sumMap);
        for (var k = 0; k < keys.length; k++) {
            var abilityID = parseInt(keys[k]);
            var value = sumMap[keys[k]];
            if (value > 0) {
                attrs.push({ _id: abilityID, _num: value });
            }
        }
        // NO sorting — preserve insertion order for first-appearance ordering
        return attrs;
    }

    // ========================================================
    // 10. BUILD _suitAttrs FROM equipSuit.json
    // ========================================================

    /**
     * Field name to abilityID mapping for suit bonuses.
     */
    var SUIT_FIELD_TO_ABILITY_ID = {
        'hp': 0,
        'attack': 1,
        'hpPercent': 17,
        'armorPercent': 18,
        'attackPercent': 19,
        'extraArmor': 26,
        'armor': 2,
        'speed': 3,
        'hit': 4,
        'dodge': 5,
        'block': 6,
        'blockEffect': 7,
        'skillDamage': 8,
        'superDamage': 9,
        'critical': 30
    };

    /**
     * Builds _suitAttrs array from suit bonuses based on worn equips.
     * For each suit, counts pieces and checks activeNeeded thresholds.
     * Only includes non-zero bonus values.
     *
     * @param {object} heroData - Hero data from playerData.heros
     * @returns {Array} Array of {_id: abilityID, _num: value}
     */
    function buildSuitAttrs(heroData) {
        var suitAttrs = [];
        if (!CONFIGS.equipSuit || !heroData || !heroData._equips) return suitAttrs;

        // 1. Count pieces per suit
        var suitCounts = {};
        var slots = Object.keys(heroData._equips);
        for (var s = 0; s < slots.length; s++) {
            var slotData = heroData._equips[slots[s]];
            if (!slotData || !slotData._id) continue;

            var equipId = String(slotData._id);
            var equipConfig = CONFIGS.equip ? CONFIGS.equip[equipId] : null;
            if (!equipConfig) continue;

            var suitId = String(equipConfig.belongToSuit || 0);
            if (parseInt(suitId) === 0) continue;
            suitCounts[suitId] = (suitCounts[suitId] || 0) + 1;
        }

        // 2. For each suit with pieces, check thresholds
        var suitKeys = Object.keys(suitCounts);
        for (var sk = 0; sk < suitKeys.length; sk++) {
            var sId = suitKeys[sk];
            var pieceCount = suitCounts[sId];
            var suitEntries = CONFIGS.equipSuit[sId];

            if (!suitEntries || !Array.isArray(suitEntries)) continue;

            for (var e = 0; e < suitEntries.length; e++) {
                var entry = suitEntries[e];
                var activeNeeded = parseInt(entry.activeNeeded) || 0;
                if (activeNeeded === 0 || pieceCount < activeNeeded) continue;

                // Collect non-zero bonus fields
                var fieldKeys = Object.keys(entry);
                for (var fk = 0; fk < fieldKeys.length; fk++) {
                    var fieldName = fieldKeys[fk];
                    if (fieldName === 'activeNeeded' || fieldName === 'id' || fieldName === 'suitId') continue;

                    var abilityId = SUIT_FIELD_TO_ABILITY_ID[fieldName];
                    var bonusValue = parseFloat(entry[fieldName]) || 0;
                    if (abilityId === undefined || bonusValue === 0) continue;

                    suitAttrs.push({ _id: abilityId, _num: bonusValue });
                }
            }
        }

        // Sort by _id for consistency
        suitAttrs.sort(function(a, b) { return a._id - b._id; });
        return suitAttrs;
    }

    // ========================================================
    // 11. BUILD _totalAttr WITH EQUIP BONUSES (42 entries: IDs 0-41)
    // ========================================================

    /**
     * Builds complete _totalAttr._items with hero base stats + equip abilities.
     *
     * @param {object} baseStats - Hero base stats from computeHeroBaseStats
     * @param {object} equipSumMap - Summed equip abilities {abilityID: value}
     * @param {number} power - Computed combat power
     * @returns {object} _items object with 42 entries (IDs 0-41)
     */
    function buildTotalAttrWithEquips(baseStats, equipSumMap, power) {
        var items = {};

        // ID 0: hero base HP + sum of all equip hp abilities (abilityID 0)
        var totalHp = baseStats.hp + (equipSumMap[0] || 0);
        items['0'] = { _id: 0, _num: totalHp };

        // ID 1: hero base ATK + sum of all equip attack abilities (abilityID 1)
        var totalAtk = baseStats.atk + (equipSumMap[1] || 0);
        items['1'] = { _id: 1, _num: totalAtk };

        // ID 2: hero base DEF (armor from hero stats, equips don't add to this directly)
        items['2'] = { _id: 2, _num: baseStats.def };

        // ID 3: hero base speed
        items['3'] = { _id: 3, _num: baseStats.speed };

        // IDs 4-15: 0 (hit, dodge, block, blockEffect, skillDamage, superDamage, etc.)
        for (var i = 4; i <= 15; i++) {
            items[String(i)] = { _id: i, _num: 0 };
        }

        // ID 16: always 50
        items['16'] = { _id: 16, _num: 50 };

        // ID 17: hpPercent from equips (abilityID 17)
        items['17'] = { _id: 17, _num: equipSumMap[17] || 0 };

        // ID 18: armorPercent from equips (abilityID 18)
        items['18'] = { _id: 18, _num: equipSumMap[18] || 0 };

        // ID 19: attackPercent from equips (abilityID 19)
        items['19'] = { _id: 19, _num: equipSumMap[19] || 0 };

        // ID 20: 0
        items['20'] = { _id: 20, _num: 0 };

        // ID 21: combat power
        items['21'] = { _id: 21, _num: power };

        // ID 22: mirrors ID 0 (same as HP)
        items['22'] = { _id: 22, _num: totalHp };

        // IDs 23-29: 0
        for (var j = 23; j <= 29; j++) {
            items[String(j)] = { _id: j, _num: 0 };
        }

        // ID 30: critical rate (talent * 1.5)
        var critRate = parseFloat((baseStats.talent * 1.5).toFixed(2));
        items['30'] = { _id: 30, _num: critRate };

        // IDs 31-40: 0
        for (var m = 31; m <= 40; m++) {
            items[String(m)] = { _id: m, _num: 0 };
        }

        // ID 41: always 100
        items['41'] = { _id: 41, _num: 100 };

        return items;
    }

    // ========================================================
    // 12. COMPUTE COMBAT POWER (with complete attrMap)
    // ========================================================

    /**
     * Complete mapping of _totalAttr IDs to power attribute names.
     */
    var ATTR_ID_TO_NAME = {
        '0': 'hp',
        '1': 'attack',
        '2': 'armor',
        '3': 'speed',
        '4': 'hit',
        '5': 'dodge',
        '6': 'block',
        '7': 'blockEffect',
        '8': 'skillDamage',
        '9': 'superDamage',
        '10': 'hit',
        '11': 'dodge',
        '12': 'block',
        '13': 'blockEffect',
        '14': 'skillDamage',
        '15': 'superDamage',
        '17': 'hpPercent',
        '18': 'armorPercent',
        '19': 'attackPercent',
        '26': 'extraArmor',
        '30': 'critical'
    };

    /**
     * Computes combat power using heroPower.json with complete attrMap.
     *
     * @param {string} heroType - Hero type (strength/agility/intelligence)
     * @param {object} totalAttrItems - The 42-entry _totalAttr._items object
     * @param {number} balancePower - Hero's balancePower multiplier
     * @returns {number} Combat power
     */
    function computeCombatPower(heroType, totalAttrItems, balancePower) {
        if (!CONFIGS.heroPower) {
            // Fallback: simple formula
            var hp = totalAttrItems['0'] ? totalAttrItems['0']._num : 0;
            var atk = totalAttrItems['1'] ? totalAttrItems['1']._num : 0;
            var def = totalAttrItems['2'] ? totalAttrItems['2']._num : 0;
            var spd = totalAttrItems['3'] ? totalAttrItems['3']._num : 0;
            return Math.round((hp * 1 + atk * 3 + def * 1.5 + spd * 1) * (balancePower || 1));
        }

        // Build complete attrMap from totalAttrItems
        var attrMap = {};
        var idKeys = Object.keys(ATTR_ID_TO_NAME);
        for (var k = 0; k < idKeys.length; k++) {
            var id = idKeys[k];
            var name = ATTR_ID_TO_NAME[id];
            var entry = totalAttrItems[id];
            if (!entry) continue;
            var val = entry._num;

            // Critical must be multiplied by 100 before use
            if (id === '30') {
                val = val * 100;
            }

            attrMap[name] = val;
        }

        // Compute power from heroPower.json entries
        var power = 0;
        var hpKeys = Object.keys(CONFIGS.heroPower);
        for (var h = 0; h < hpKeys.length; h++) {
            var pe = CONFIGS.heroPower[hpKeys[h]];
            if (pe.heroType === heroType) {
                var pval = attrMap[pe.attName];
                if (pval !== undefined && pval !== null) {
                    power += pval * (pe.powerParam || 0);
                }
            }
        }

        return Math.round(power * (balancePower || 1));
    }

    // ========================================================
    // 13. PLAYER DATA HELPERS
    // ========================================================

    /**
     * Loads player data from localStorage.
     * Matches entergame.js loadOrCreatePlayerData pattern.
     */
    function loadPlayerData(userId) {
        if (!userId) return null;
        try {
            var key = 'dragonball_player_data_' + userId;
            var raw = localStorage.getItem(key);
            if (raw) {
                return JSON.parse(raw);
            }
        } catch (e) {
            LOG.error('Failed to load player data for userId: ' + userId, e.message);
        }
        return null;
    }

    /**
     * Saves updated player data to localStorage.
     */
    function savePlayerData(userId, playerData) {
        if (!userId || !playerData) return;
        try {
            var key = 'dragonball_player_data_' + userId;
            localStorage.setItem(key, JSON.stringify(playerData));
        } catch (e) {
            LOG.warn('Failed to save player data for userId: ' + userId, e.message);
        }
    }

    /**
     * Gets current item count from player items.
     * Items stored as: playerData.items["102"]._num or playerData.items[102]._num
     */
    function getItemCount(playerData, itemId) {
        if (!playerData || !playerData.items) return 0;
        var item = playerData.items[String(itemId)] || playerData.items[itemId];
        return item ? (parseInt(item._num) || 0) : 0;
    }

    /**
     * Sets item count in player items.
     */
    function setItemCount(playerData, itemId, newCount) {
        if (!playerData || !playerData.items) return;
        var idStr = String(itemId);
        if (!playerData.items[idStr]) {
            playerData.items[idStr] = { _id: itemId, _num: 0 };
        }
        playerData.items[idStr]._num = newCount;

        // Also sync to user._attribute for entergame consistency
        if (playerData.user && playerData.user._attribute && playerData.user._attribute._items) {
            if (!playerData.user._attribute._items[idStr]) {
                playerData.user._attribute._items[idStr] = { _id: itemId, _num: 0 };
            }
            playerData.user._attribute._items[idStr]._num = newCount;
        }
    }

    // ========================================================
    // 14. MAIN HANDLER: equip.wearAuto
    // ========================================================
    /**
     * Handler for equip.wearAuto (batch version of equip.wear)
     * Registered via window.MAIN_SERVER_HANDLERS
     *
     * @param {object} request - Client request
     *   { type:"equip", action:"wearAuto", userId, heroId,
     *     equipInfo:{"1":"3001","2":"3002",...}, weaponId:"", version:"1.0" }
     * @param {object} playerData - Current player data from localStorage
     * @returns {object} Full response including echoed request fields + computed data
     *
     * Batch Logic:
     *   1. Validate hero exists in playerData
     *   2. Loop through all entries in equipInfo (pos → equipId):
     *      a. Validate equip config exists
     *      b. Check player has at least 1 of the equip in inventory
     *      c. If pos already has an equip, return old equip to inventory (+1)
     *      d. Deduct 1 from new equip inventory count
     *      e. Store new equip on hero._equips[pos]
     *   3. After all equips processed, compute hero stats once
     *   4. Build totalAttr (42 entries), equipAttrs, suitItems, suitAttrs
     *   5. Compute power with complete attrMap
     *   6. Update playerData and save
     *   7. Build full response with echoed request fields
     */
    function handleEquipWearAuto(request, playerData) {
        LOG.info('Handling equip.wearAuto');

        var heroId = request.heroId;
        var userId = request.userId;
        var equipInfo = request.equipInfo || {};
        var weaponId = request.weaponId || '';
        var version = request.version || '1.0';

        LOG.info('UserId: ' + userId);
        LOG.info('HeroId: ' + heroId);
        LOG.info('EquipInfo: ' + JSON.stringify(equipInfo));
        LOG.info('WeaponId: ' + weaponId);

        // --- 1. Validate hero exists in playerData ---
        var heroData = null;
        if (playerData && playerData.heros && playerData.heros[heroId]) {
            heroData = playerData.heros[heroId];
        }

        if (!heroData) {
            LOG.error('Hero not found in playerData: ' + heroId);
            return buildErrorResponse(request, userId, heroId);
        }

        // --- 2. Process batch equips ---
        var equipInfoKeys = Object.keys(equipInfo);
        var changeInfoItems = {};
        var processedCount = 0;
        var errorCount = 0;

        heroData._equips = heroData._equips || {};

        for (var ei = 0; ei < equipInfoKeys.length; ei++) {
            var pos = equipInfoKeys[ei];
            var equipId = String(equipInfo[pos]);
            var posInt = parseInt(pos);
            var equipIdInt = parseInt(equipId);

            LOG.info('  Processing pos=' + pos + ', equipId=' + equipId);

            // Validate equip config exists
            var equipConfig = CONFIGS.equip ? CONFIGS.equip[equipId] : null;
            if (!equipConfig) {
                LOG.error('  Equip config not found for equipId: ' + equipId + ', skipping');
                errorCount++;
                continue;
            }

            LOG.info('    Equip: ' + equipId + ' (type=' + (equipConfig.type || '?') +
                ', suit=' + (equipConfig.belongToSuit || 0) + ')');

            // Check player has the equip in inventory
            var currentEquipCount = getItemCount(playerData, equipIdInt);
            if (currentEquipCount < 1) {
                LOG.error('    Player does not have equip ' + equipId +
                    ' (count=' + currentEquipCount + '), skipping');
                errorCount++;
                continue;
            }

            // Handle swap: if pos already has an equip, return it to inventory
            var posKey = String(posInt);
            var oldEquipId = null;

            if (heroData._equips[posKey] && heroData._equips[posKey]._id) {
                oldEquipId = parseInt(heroData._equips[posKey]._id);
                LOG.info('    Slot ' + pos + ' occupied by equip ' + oldEquipId + ', swapping...');
            }

            // Deduct new equip from inventory
            var newEquipCount = currentEquipCount - 1;
            setItemCount(playerData, equipIdInt, newEquipCount);
            LOG.info('    Equip ' + equipId + ': ' + currentEquipCount + ' -> ' + newEquipCount);
            changeInfoItems[String(equipIdInt)] = { _id: equipIdInt, _num: newEquipCount };

            // Return old equip to inventory (if swapping)
            if (oldEquipId !== null) {
                var oldEquipCount = getItemCount(playerData, oldEquipId);
                var oldEquipNewCount = oldEquipCount + 1;
                setItemCount(playerData, oldEquipId, oldEquipNewCount);
                LOG.info('    Old equip ' + oldEquipId + ': ' + oldEquipCount + ' -> ' + oldEquipNewCount);
                changeInfoItems[String(oldEquipId)] = { _id: oldEquipId, _num: oldEquipNewCount };
            }

            // Store new equip on hero
            heroData._equips[posKey] = { _id: equipIdInt };

            processedCount++;
        }

        LOG.info('Batch processing complete: ' + processedCount + ' processed, ' + errorCount + ' errors');

        // --- 3. Compute hero base stats ---
        var baseStats = computeHeroBaseStats(heroData);
        LOG.info('  Base stats: HP=' + baseStats.hp + ' ATK=' + baseStats.atk +
            ' DEF=' + baseStats.def + ' SPD=' + baseStats.speed);

        // --- 4. Sum all worn equip abilities ---
        var equipSumMap = sumWornEquipAbilities(heroData);
        var sumKeys = Object.keys(equipSumMap);
        LOG.info('  Equip ability sum:');
        for (var si = 0; si < sumKeys.length; si++) {
            LOG.info('    abilityID ' + sumKeys[si] + ' = ' + equipSumMap[sumKeys[si]]);
        }

        // --- 5. Build suitItems ---
        var suitItems = buildSuitItems(heroData);
        LOG.info('  Suit items count: ' + suitItems.length);

        // --- 6. Build equipAttrs (insertion order, NOT sorted) ---
        var equipAttrs = buildEquipAttrsArray(equipSumMap);

        // --- 7. Build suitAttrs ---
        var suitAttrs = buildSuitAttrs(heroData);
        LOG.info('  Suit attrs count: ' + suitAttrs.length);

        // --- 8. Build totalAttr (initially without power, then compute power, then update) ---
        // First pass: build totalAttr with power=0 to get attrMap
        var tempTotalAttr = buildTotalAttrWithEquips(baseStats, equipSumMap, 0);
        // Compute power using the temp totalAttr
        var power = computeCombatPower(baseStats.heroType, tempTotalAttr, baseStats.balancePower);
        LOG.info('  Computed power: ' + power);
        // Rebuild totalAttr with correct power
        var totalAttrItems = buildTotalAttrWithEquips(baseStats, equipSumMap, power);

        // --- 9. Save playerData ---
        if (playerData) {
            // Sync user._attribute with items
            if (playerData.user) {
                playerData.user._attribute = { _items: playerData.items };
            }
            savePlayerData(userId, playerData);
            LOG.success('Player data saved after batch equip wear');
        }

        // --- 10. Build full response (echoes request fields + computed data) ---
        var responseData = {
            type: request.type || 'equip',
            action: request.action || 'wearAuto',
            userId: userId,
            heroId: heroId,
            equipInfo: equipInfo,
            weaponId: weaponId,
            version: version,
            _totalAttr: { _items: totalAttrItems },
            _changeInfo: { _items: changeInfoItems },
            _equipItem: {
                _suitItems: suitItems,
                _earrings: { _id: 0, _level: 0, _attrs: { _items: {} }, _version: '' },
                _suitAttrs: suitAttrs,
                _equipAttrs: equipAttrs,
                _weaponState: 0
            },
            _linkHeroesTotalAttr: {}
        };

        // NOTE: NO _clearStoneSuit field (unlike equip.wear)

        LOG.success('equip.wearAuto success — hero ' + heroId.substring(0, 8) +
            '... ' + processedCount + ' equips processed');

        return responseData;
    }

    // ========================================================
    // 15. ERROR RESPONSE BUILDER
    // ========================================================
    function buildErrorResponse(request, userId, heroId) {
        // Return a safe fallback that won't crash the client
        // Echoes request fields + empty computed data
        var fallbackTotalAttr = {};
        for (var i = 0; i <= 41; i++) {
            fallbackTotalAttr[String(i)] = { _id: i, _num: 0 };
        }

        return {
            type: (request && request.type) || 'equip',
            action: (request && request.action) || 'wearAuto',
            userId: userId || '',
            heroId: heroId || '',
            equipInfo: (request && request.equipInfo) || {},
            weaponId: (request && request.weaponId) || '',
            version: (request && request.version) || '1.0',
            _totalAttr: { _items: fallbackTotalAttr },
            _changeInfo: { _items: {} },
            _equipItem: {
                _suitItems: [],
                _earrings: { _id: 0, _level: 0, _attrs: { _items: {} }, _version: '' },
                _suitAttrs: [],
                _equipAttrs: [],
                _weaponState: 0
            },
            _linkHeroesTotalAttr: {}
        };
        // NOTE: NO _clearStoneSuit field
    }

    // ========================================================
    // 16. REGISTER HANDLER
    // ========================================================
    function register() {
        if (typeof window === 'undefined') {
            console.error('[EQUIP-WEAR-AUTO] window not available');
            return;
        }

        window.MAIN_SERVER_HANDLERS = window.MAIN_SERVER_HANDLERS || {};
        window.MAIN_SERVER_HANDLERS['equip.wearAuto'] = handleEquipWearAuto;

        LOG.success('Handler registered: equip.wearAuto');

        var configStatus = [];
        var configNames = ['hero', 'heroLevelAttr', 'heroTypeParam', 'heroLevelUpMul', 'heroEvolve', 'heroPower', 'equip', 'equipSuit'];
        for (var i = 0; i < configNames.length; i++) {
            configStatus.push(configNames[i] + '=' + (CONFIGS[configNames[i]] ? 'OK' : 'MISSING'));
        }
        LOG.info('Config status: ' + configStatus.join(', '));
    }

    // ========================================================
    // 17. INIT: Load configs then register
    // ========================================================
    if (typeof window !== 'undefined' && window.MAIN_SERVER_HANDLERS) {
        loadAllConfigs(function() {
            register();
        });
    } else {
        var _check = setInterval(function() {
            if (typeof window !== 'undefined') {
                if (!window.MAIN_SERVER_HANDLERS) {
                    window.MAIN_SERVER_HANDLERS = {};
                }
                clearInterval(_check);
                loadAllConfigs(function() {
                    register();
                });
            }
        }, 50);
        setTimeout(function() { clearInterval(_check); }, 10000);
    }

})(window);
