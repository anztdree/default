/**
 * =====================================================
 *  constants.js — Game Constants & Enums
 *  Super Warrior Z Game Server — Main Server
 *
 *  Centralized game constants and enumeration values.
 *  Semua handler modules harus menggunakan konstanta dari
 *  file ini untuk memastikan konsistensi.
 *
 *  Kategori:
 *    - Dungeon Types
 *    - Battle Fields
 *    - Hero Quality / Rarity
 *    - Item Types
 *    - Max Limits
 *    - Activity Types
 *    - Rank Types
 * =====================================================
 */

'use strict';

/**
 * Dungeon type enumeration.
 *
 * Maps dungeon type names to their string identifiers
 * used in dungeon-related requests and game_data fields.
 *
 * @enum {string}
 */
var DUNGEON_TYPE = {
    /** Equipment dungeon — drops equipment materials */
    EQUIP: 'equip',
    /** Experience dungeon — grants hero EXP */
    EXP: 'exp',
    /** Energy dungeon — grants stamina/energy items */
    ENERGY: 'energy',
    /** Evolution dungeon — drops evolution materials */
    EVOLVE: 'evolve',
    /** Metal dungeon — drops metal/currency materials */
    METAL: 'metal',
    /** Z-Stone dungeon — drops Z-Stone upgrade materials */
    ZSTONE: 'zstone'
};

/**
 * Battle field enumeration.
 *
 * Identifies all possible battle contexts in the game.
 * Used for battle record validation, rewards, and tracking.
 *
 * @enum {string}
 */
var BATTLE_FIELD = {
    /** PvP Arena battles */
    ARENA: 'arena',
    /** PvE Dungeon runs (all dungeon types) */
    DUNGEON: 'dungeon',
    /** Expedition / campaign stages */
    EXPEDITION: 'expedition',
    /** Tower of trials floors */
    TOWER: 'tower',
    /** Guild boss raids */
    GUILDBOSS: 'guildboss',
    /** Dragon Ball War guild vs guild */
    DRAGONBALL: 'dragonball',
    /** Cell Game mini-game battles */
    CELLGAME: 'cellgame',
    /** Gravity Test / Hyperbolic Time Chamber */
    GRAVITYTEST: 'gravitytest',
    /** Friendly practice battles between friends */
    FRIENDBATTLE: 'friendbattle',
    /** Boss snatching / world boss competition */
    BOSSSNATCH: 'bosssnatch',
    /** Merged boss events */
    MERGEBOSS: 'mergeboss',
    /** Top Battle / cross-server ranked */
    TOPBATTLE: 'topbattle',
    /** Training battles */
    TRAINING: 'training'
};

/**
 * Hero quality / rarity enumeration.
 *
 * Maps quality names to their numeric values.
 * Higher quality = rarer heroes with better base stats.
 *
 * @enum {number}
 */
var HERO_QUALITY = {
    /** Common — basic heroes */
    WHITE: 1,
    /** Uncommon — slightly better heroes */
    GREEN: 2,
    /** Rare — good heroes */
    BLUE: 3,
    /** Epic — strong heroes */
    PURPLE: 4,
    /** Legendary — very strong heroes */
    ORANGE: 5,
    /** Mythic — the strongest heroes */
    RED: 6
};

/**
 * Item type enumeration.
 *
 * Categorizes items by their function in the game.
 * Used for inventory management and shop filtering.
 *
 * @enum {string}
 */
var ITEM_TYPES = {
    /** Consumable items (potions, buffs, etc.) */
    CONSUMABLE: 'consumable',
    /** Equipment pieces */
    EQUIPMENT: 'equipment',
    /** Hero fragments/shards for summoning */
    HERO_FRAGMENT: 'heroFragment',
    /** Evolution materials */
    EVOLVE_MATERIAL: 'evolveMaterial',
    /** Enhancement/upgrade materials */
    UPGRADE_MATERIAL: 'upgradeMaterial',
    /** Gift boxes / treasure chests */
    GIFT_BOX: 'giftBox',
    /** Currency items (gold packs, diamond packs) */
    CURRENCY: 'currency',
    /** Stamina/energy items */
    STAMINA_ITEM: 'staminaItem',
    /** Guild contribution items */
    GUILD_ITEM: 'guildItem',
    /** Special/limited event items */
    SPECIAL: 'special',
    /** Gemstones for socketing */
    GEMSTONE: 'gemstone',
    /** Genki (ki energy) items */
    GENKI: 'genki',
    /** Weapon items */
    WEAPON: 'weapon',
    /** Ring accessories */
    RING: 'ring',
    /** Earring accessories */
    EARRING: 'earring',
    /** Battle medals */
    MEDAL: 'medal',
    /** Imprint items */
    IMPRINT: 'imprint',
    /** Summon energy / tickets */
    SUMMON_TICKET: 'summonTicket'
};

/**
 * Maximum limits for game systems.
 *
 * These are the absolute upper bounds for various
 * progression systems.
 *
 * @enum {number}
 */
var MAX_LIMITS = {
    /** Maximum arena rank (highest = best) */
    MAX_ARENA_RANK: 9999,
    /** Maximum tower floor */
    MAX_TOWER_LEVEL: 999,
    /** Maximum player level */
    MAX_USER_LEVEL: 300,
    /** Maximum hero level */
    MAX_HERO_LEVEL: 200,
    /** Maximum VIP level */
    MAX_VIP_LEVEL: 15,
    /** Maximum friend count */
    MAX_FRIENDS: 50,
    /** Maximum mail count */
    MAX_MAILS: 100,
    /** Maximum hero roster size */
    MAX_HEROES: 200,
    /** Maximum equipment inventory size */
    MAX_EQUIPS: 300,
    /** Maximum item inventory size */
    MAX_ITEMS: 200,
    /** Maximum team size for battle */
    MAX_TEAM_SIZE: 6
};

/**
 * Activity type enumeration.
 *
 * Identifies server-side scheduled activities and events.
 *
 * @enum {string}
 */
var ACTIVITY_TYPE = {
    /** Cost feedback — spend X get Y rewards */
    COST_FEEDBACK: 'costFeedback',
    /** Login reward for consecutive days */
    LOGIN_REWARD: 'loginReward',
    /** Online time bonus rewards */
    ONLINE_BONUS: 'onlineBonus',
    /** First recharge bonus */
    FIRST_RECHARGE: 'firstRecharge',
    /** 7-day cumulative recharge rewards */
    RECHARGE_7_DAYS: 'recharge7Days',
    /** Monthly card subscription */
    MONTH_CARD: 'monthCard',
    /** Lifelong / permanent card */
    LIFELONG_CARD: 'lifelongCard',
    /** Growth fund — level-based rewards */
    GROWTH_FUND: 'growthFund',
    /** Limited time events */
    LIMITED_EVENT: 'limitedEvent',
    /** Festival / holiday events */
    FESTIVAL: 'festival',
    /** Cross-server events */
    CROSS_SERVER: 'crossServer',
    /** Guild war events */
    GUILD_WAR: 'guildWar',
    /** World boss event */
    WORLD_BOSS: 'worldBoss',
    /** Download milestone reward */
    DOWNLOAD_REWARD: 'downloadReward',
    /** VIP level upgrade reward */
    VIP_UPGRADE: 'vipUpgrade',
    /** Level milestone bonus */
    LEVEL_BONUS: 'levelBonus',
    /** Time-limited bonus spending */
    TIME_LIMIT_BONUS: 'timeLimitBonus'
};

/**
 * Rank / leaderboard type enumeration.
 *
 * Identifies different ranking categories used
 * in leaderboards and ranking rewards.
 *
 * @enum {string}
 */
var RANK_TYPE = {
    /** Arena ranking */
    ARENA: 'arena',
    /** Top battle / cross-server ranking */
    TOP_BATTLE: 'topBattle',
    /** Guild ranking */
    GUILD: 'guild',
    /** Guild member contribution ranking */
    GUILD_CONTRIBUTION: 'guildContribution',
    /** Activity: Whis Feast ranking */
    ACTIVITY_WHIS_FEAST: 'activityWhisFeast',
    /** Activity: Power Up ranking */
    ACTIVITY_POWER_UP: 'activityPowerUp',
    /** Boss competition damage ranking */
    BOSS_COMPETITION: 'bossCompetition',
    /** World boss damage ranking */
    WORLD_BOSS: 'worldBoss',
    /** Expedition progress ranking */
    EXPEDITION: 'expedition',
    /** Tower progress ranking */
    TOWER: 'tower',
    /** Total power ranking */
    TOTAL_POWER: 'totalPower',
    /** Hero power ranking */
    HERO_POWER: 'heroPower'
};

/**
 * Backward-compatible aliases for commonly used constants.
 * These allow shorter access: Constants.MAX_ARENA_RANK instead of
 * Constants.MAX_LIMITS.MAX_ARENA_RANK
 */
var MAX_ARENA_RANK = MAX_LIMITS.MAX_ARENA_RANK;
var MAX_TOWER_LEVEL = MAX_LIMITS.MAX_TOWER_LEVEL;
var MAX_USER_LEVEL = MAX_LIMITS.MAX_USER_LEVEL;

module.exports = {
    DUNGEON_TYPE: DUNGEON_TYPE,
    BATTLE_FIELD: BATTLE_FIELD,
    HERO_QUALITY: HERO_QUALITY,
    ITEM_TYPES: ITEM_TYPES,
    MAX_LIMITS: MAX_LIMITS,
    ACTIVITY_TYPE: ACTIVITY_TYPE,
    RANK_TYPE: RANK_TYPE,
    // Backward-compatible aliases
    MAX_ARENA_RANK: MAX_ARENA_RANK,
    MAX_TOWER_LEVEL: MAX_TOWER_LEVEL,
    MAX_USER_LEVEL: MAX_USER_LEVEL
};
