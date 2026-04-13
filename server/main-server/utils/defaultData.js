/**
 * =====================================================
 *  defaultData.js — Default User Game Data
 *  Super Warrior Z Game Server — Main Server
 *
 *  CRITICAL: This file defines ALL 99 default fields for user game_data.
 *  When a new user enters the game, ALL fields must have default values.
 *  Missing fields will cause client errors and game logic failures.
 *
 *  Penggunaan:
 *    - DEFAULT_DATA — object berisi semua 99 default fields
 *    - mergeWithDefaults(gameData) — merge existing data, isi yang kosong
 *    - createNewUserData(userId) — buat data baru untuk user
 *
 *  Field Categories:
 *    1. Basic Info (userId, nickName, headImage, ...)
 *    2. Progression (level, exp, vipLevel, ...)
 *    3. Currency (diamonds, gold, stamina, ...)
 *    4. PvP (arena, topBattle, ...)
 *    5. PvE (tower, dungeon, expedition, ...)
 *    6. Collections (heroList, equipList, itemList, ...)
 *    7. Social (friendList, guild, ...)
 *    8. Time-based (signIn, online, train, hangup, ...)
 *    9. Special systems (imprint, resonance, potential, ...)
 *    10. Events (dragonBall, cellGame, snake, ...)
 *    11. Meta (scheduleInfo, activityData, broadcastRecord)
 * =====================================================
 */

'use strict';

/**
 * DEFAULT_DATA — Object containing all 99 default fields for a new user.
 *
 * Every field here corresponds to a field in the game_data JSON column
 * in the database. When a new user registers, ALL of these fields
 * are initialized to ensure the client never encounters undefined values.
 *
 * @type {object}
 */
var DEFAULT_DATA = {
    // ==========================================
    // 1. Basic Info (4 fields)
    // ==========================================
    /** @type {number} User unique ID */
    userId: 0,
    /** @type {string} Player display name */
    nickName: '',
    /** @type {number} Avatar/head image ID */
    headImage: 0,
    /** @type {number} Avatar frame/box ID */
    headBox: 0,

    // ==========================================
    // 2. Progression (4 fields)
    // ==========================================
    /** @type {number} Player level (1-based) */
    level: 1,
    /** @type {number} Current experience points */
    exp: 0,
    /** @type {number} VIP level */
    vipLevel: 0,
    /** @type {number} VIP experience points */
    vipExp: 0,

    // ==========================================
    // 3. Currency (3 fields)
    // ==========================================
    /** @type {number} Premium currency */
    diamonds: 0,
    /** @type {number} Standard currency */
    gold: 0,
    /** @type {number} Current stamina */
    stamina: 0,
    /** @type {number} Timestamp for stamina regeneration */
    staminaTime: 0,

    // ==========================================
    // 4. Arena / PvP (4 fields)
    // ==========================================
    /** @type {number} Arena ranking position */
    arenaRank: 0,
    /** @type {number} Arena score */
    arenaScore: 0,
    /** @type {number} Arena challenge times remaining */
    arenaTimes: 0,
    /** @type {number} Arena extra times purchased */
    arenaBuyTimes: 0,

    // ==========================================
    // 5. Tower (3 fields)
    // ==========================================
    /** @type {number} Highest tower floor reached */
    towerLevel: 0,
    /** @type {number} Tower climb times today */
    towerClimbTimes: 0,
    /** @type {number} Tower extra times purchased */
    towerBuyTimes: 0,

    // ==========================================
    // 6. Dungeons — Equipment (3 fields)
    // ==========================================
    /** @type {number} Dungeon (Equip) highest level */
    dungeonEquipLevel: 0,
    /** @type {number} Dungeon (Equip) times today */
    dungeonEquipTimes: 0,
    /** @type {number} Dungeon (Equip) extra times purchased */
    dungeonEquipBuyTimes: 0,

    // ==========================================
    // 7. Dungeons — Experience (3 fields)
    // ==========================================
    /** @type {number} Dungeon (Exp) highest level */
    dungeonExpLevel: 0,
    /** @type {number} Dungeon (Exp) times today */
    dungeonExpTimes: 0,
    /** @type {number} Dungeon (Exp) extra times purchased */
    dungeonExpBuyTimes: 0,

    // ==========================================
    // 8. Dungeons — Energy (3 fields)
    // ==========================================
    /** @type {number} Dungeon (Energy) highest level */
    dungeonEnergyLevel: 0,
    /** @type {number} Dungeon (Energy) times today */
    dungeonEnergyTimes: 0,
    /** @type {number} Dungeon (Energy) extra times purchased */
    dungeonEnergyBuyTimes: 0,

    // ==========================================
    // 9. Dungeons — Evolution (3 fields)
    // ==========================================
    /** @type {number} Dungeon (Evolve) highest level */
    dungeonEvolveLevel: 0,
    /** @type {number} Dungeon (Evolve) times today */
    dungeonEvolveTimes: 0,
    /** @type {number} Dungeon (Evolve) extra times purchased */
    dungeonEvolveBuyTimes: 0,

    // ==========================================
    // 10. Dungeons — Metal (3 fields)
    // ==========================================
    /** @type {number} Dungeon (Metal) highest level */
    dungeonMetalLevel: 0,
    /** @type {number} Dungeon (Metal) times today */
    dungeonMetalTimes: 0,
    /** @type {number} Dungeon (Metal) extra times purchased */
    dungeonMetalBuyTimes: 0,

    // ==========================================
    // 11. Dungeons — Z-Stone (3 fields)
    // ==========================================
    /** @type {number} Dungeon (ZStone) highest level */
    dungeonZStoneLevel: 0,
    /** @type {number} Dungeon (ZStone) times today */
    dungeonZStoneTimes: 0,
    /** @type {number} Dungeon (ZStone) extra times purchased */
    dungeonZStoneBuyTimes: 0,

    // ==========================================
    // 12. Expedition (2 fields)
    // ==========================================
    /** @type {number} Expedition highest level */
    expeditionLevel: 0,
    /** @type {number} Current expedition chapter ID */
    expeditionChapterId: 0,

    // ==========================================
    // 13. Collections — Inventory Lists (9 fields)
    // ==========================================
    /** @type {Array} Owned heroes array */
    heroList: [],
    /** @type {Array} Owned equipment array */
    equipList: [],
    /** @type {Array} Inventory items array */
    itemList: [],
    /** @type {Array} Gemstones array */
    gemstoneList: [],
    /** @type {Array} Genki (ki/energy) items array */
    genkiList: [],
    /** @type {Array} Weapons array */
    weaponList: [],
    /** @type {Array} Rings array */
    ringList: [],
    /** @type {Array} Earrings array */
    earringList: [],

    // ==========================================
    // 14. Social (2 fields)
    // ==========================================
    /** @type {Array} Friend list array */
    friendList: [],
    /** @type {Array} Mail list array */
    mailList: [],

    // ==========================================
    // 15. Sign-In (2 fields)
    // ==========================================
    /** @type {number} Consecutive sign-in days */
    signInDays: 0,
    /** @type {number} Last sign-in timestamp */
    signInTime: 0,

    // ==========================================
    // 16. Guild (4 fields)
    // ==========================================
    /** @type {string} Guild ID */
    guildId: '',
    /** @type {string} Guild UUID */
    guildUUID: '',
    /** @type {string} Guild display name */
    guildName: '',
    /** @type {number} Guild position/role (0=none, 1=member, 2=officer, 3=leader) */
    guildPosition: 0,

    // ==========================================
    // 17. Time Tracking (4 fields)
    // ==========================================
    /** @type {number} Last login timestamp */
    lastLoginTime: 0,
    /** @type {number} Last logout timestamp */
    lastLogoutTime: 0,
    /** @type {number} Total online time in seconds */
    onlineTime: 0,

    // ==========================================
    // 18. Training (2 fields + 1 array)
    // ==========================================
    /** @type {number} Current training stage ID */
    trainId: 0,
    /** @type {number} Training start timestamp */
    trainStartTime: 0,
    /** @type {Array} Heroes currently in training */
    trainHeroList: [],

    // ==========================================
    // 19. Team Training (2 fields)
    // ==========================================
    /** @type {number} Team training stage ID */
    teamTrainingId: 0,
    /** @type {Array} Heroes in team training */
    teamTrainingHeroList: [],

    // ==========================================
    // 20. Hangup / AFK Farming (3 fields)
    // ==========================================
    /** @type {number} Hangup stage ID */
    hangupId: 0,
    /** @type {Array} Heroes assigned to hangup */
    hangupHeroList: [],
    /** @type {number} Hangup start timestamp */
    hangupStartTime: 0,

    // ==========================================
    // 21. Imprint & Resonance (3 fields)
    // ==========================================
    /** @type {Array} Imprint data array */
    imprintList: [],
    /** @type {number} Resonance level */
    resonanceLevel: 0,
    /** @type {number} Resonance experience */
    resonanceExp: 0,

    // ==========================================
    // 22. Potential System (2 fields)
    // ==========================================
    /** @type {number} Potential level */
    potentialLevel: 0,
    /** @type {number} Potential experience */
    potentialExp: 0,

    // ==========================================
    // 23. World Boss (1 field)
    // ==========================================
    /** @type {number} Total world boss damage dealt */
    worldBossDamage: 0,

    // ==========================================
    // 24. Summon System (2 fields)
    // ==========================================
    /** @type {Array} Summon pool data */
    summonPool: [],
    /** @type {number} Summon energy */
    summonEnergy: 0,

    // ==========================================
    // 25. Top Battle / Ranked (4 fields)
    // ==========================================
    /** @type {number} Top battle ranking */
    topBattleRank: 0,
    /** @type {number} Top battle score */
    topBattleScore: 0,
    /** @type {number} Top battle times remaining */
    topBattleTimes: 0,
    /** @type {number} Top battle extra times purchased */
    topBattleBuyTimes: 0,

    // ==========================================
    // 26. Dragon Ball War (2 fields)
    // ==========================================
    /** @type {string} Dragon Ball War guild UUID */
    dragonBallWarGuildUUID: '',
    /** @type {number} Dragon Ball War area ID */
    dragonBallWarAreaId: 0,

    // ==========================================
    // 27. Snake Game (3 fields)
    // ==========================================
    /** @type {number} Snake game level */
    snakeLevel: 0,
    /** @type {number} Snake game times today */
    snakeTimes: 0,
    /** @type {number} Snake game extra times purchased */
    snakeBuyTimes: 0,

    // ==========================================
    // 28. Cell Game (2 fields)
    // ==========================================
    /** @type {number} Cell game level */
    cellGameLevel: 0,
    /** @type {Array} Heroes assigned to cell game */
    cellGameHeroList: [],

    // ==========================================
    // 29. Time Machine (1 field)
    // ==========================================
    /** @type {number} Time machine level */
    timeMachineLevel: 0,

    // ==========================================
    // 30. Boss Competition (3 fields)
    // ==========================================
    /** @type {number} Boss competition damage dealt */
    bossCompetitionDamage: 0,
    /** @type {number} Boss competition times today */
    bossCompetitionTimes: 0,
    /** @type {number} Boss competition extra times purchased */
    bossCompetitionBuyTimes: 0,

    // ==========================================
    // 31. Battle Medal (3 fields)
    // ==========================================
    /** @type {string} Equipped battle medal ID */
    battleMedalId: '',
    /** @type {number} Battle medal level */
    battleMedalLevel: 0,
    /** @type {number} Battle medal experience */
    battleMedalExp: 0,

    // ==========================================
    // 32. Activity & Meta (3 fields)
    // ==========================================
    /** @type {object} Activity-specific data (dynamic key-value) */
    activityData: {},
    /** @type {object} Schedule/tracking info for periodic activities */
    scheduleInfo: {
        signin: 0,
        signinReward: 0,
        onlineBonus: 0,
        download: 0,
        recharge7: 0,
        recharge3: 0,
        levelBonus: 0,
        firstRecharge: 0,
        timeLimitBonus: 0,
        vipUpgrade: 0,
        monthCard: 0,
        lifelongCard: 0
    },
    /** @type {Array} Record of broadcast messages received */
    broadcastRecord: []
};

/**
 * Deep clone the scheduleInfo default to avoid shared references.
 * @returns {object} Fresh copy of default scheduleInfo
 */
function _getDefaultScheduleInfo() {
    return {
        signin: 0,
        signinReward: 0,
        onlineBonus: 0,
        download: 0,
        recharge7: 0,
        recharge3: 0,
        levelBonus: 0,
        firstRecharge: 0,
        timeLimitBonus: 0,
        vipUpgrade: 0,
        monthCard: 0,
        lifelongCard: 0
    };
}

/**
 * Merge existing game_data with defaults.
 *
 * For each field in DEFAULT_DATA:
 *   - If gameData has the field and value is not null/undefined → keep gameData value
 *   - If gameData is missing the field or value is null/undefined → use default
 *
 * This function returns a NEW object and does NOT mutate the input.
 *
 * @param {object} gameData - Existing user game_data from database
 * @returns {object} New object with all fields guaranteed to have values
 */
function mergeWithDefaults(gameData) {
    // Start with a clean copy of defaults
    var result = {};
    var defaultKeys = Object.keys(DEFAULT_DATA);

    for (var i = 0; i < defaultKeys.length; i++) {
        var key = defaultKeys[i];
        var defaultValue = DEFAULT_DATA[key];

        // Special handling for scheduleInfo (nested object)
        if (key === 'scheduleInfo') {
            if (gameData && gameData[key] && typeof gameData[key] === 'object') {
                // Merge scheduleInfo fields individually
                var scheduleDefaults = _getDefaultScheduleInfo();
                var userSchedule = gameData[key];
                var scheduleKeys = Object.keys(scheduleDefaults);
                var mergedSchedule = {};

                for (var j = 0; j < scheduleKeys.length; j++) {
                    var sKey = scheduleKeys[j];
                    if (userSchedule[sKey] !== undefined && userSchedule[sKey] !== null) {
                        mergedSchedule[sKey] = userSchedule[sKey];
                    } else {
                        mergedSchedule[sKey] = scheduleDefaults[sKey];
                    }
                }
                result[key] = mergedSchedule;
            } else {
                result[key] = _getDefaultScheduleInfo();
            }
            continue;
        }

        // Special handling for array defaults — always use the value from gameData
        // if it's a valid array, otherwise use default
        if (Array.isArray(defaultValue)) {
            if (gameData && Array.isArray(gameData[key])) {
                result[key] = gameData[key];
            } else {
                // Create a new empty array (don't share reference)
                result[key] = [];
            }
            continue;
        }

        // Special handling for object defaults (activityData)
        if (typeof defaultValue === 'object' && defaultValue !== null && !Array.isArray(defaultValue)) {
            if (gameData && gameData[key] && typeof gameData[key] === 'object' && !Array.isArray(gameData[key])) {
                result[key] = gameData[key];
            } else {
                result[key] = {};
            }
            continue;
        }

        // Default handling for primitives
        if (gameData && gameData[key] !== undefined && gameData[key] !== null) {
            result[key] = gameData[key];
        } else {
            result[key] = defaultValue;
        }
    }

    // Preserve any extra fields from gameData that aren't in defaults
    // (forward compatibility for new fields added in future updates)
    if (gameData && typeof gameData === 'object') {
        var gameKeys = Object.keys(gameData);
        for (var k = 0; k < gameKeys.length; k++) {
            var gKey = gameKeys[k];
            if (!(gKey in DEFAULT_DATA)) {
                result[gKey] = gameData[gKey];
            }
        }
    }

    return result;
}

/**
 * Create a fresh user data object with all default values.
 *
 * This is used when a NEW user enters the game for the first time.
 * ALL 99 fields are initialized with their default values.
 *
 * @param {number} userId - The user's unique ID
 * @returns {object} Complete user data object ready for database insert
 */
function createNewUserData(userId) {
    var data = {};

    // Deep copy all default values
    var keys = Object.keys(DEFAULT_DATA);
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var value = DEFAULT_DATA[key];

        if (key === 'scheduleInfo') {
            data[key] = _getDefaultScheduleInfo();
        } else if (Array.isArray(value)) {
            data[key] = [];
        } else if (typeof value === 'object' && value !== null) {
            data[key] = {};
        } else {
            data[key] = value;
        }
    }

    // Set the userId
    data.userId = userId;

    return data;
}

module.exports = {
    DEFAULT_DATA: DEFAULT_DATA,
    mergeWithDefaults: mergeWithDefaults,
    createNewUserData: createNewUserData
};
