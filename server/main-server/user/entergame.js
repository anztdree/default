/**
 * ============================================================
 * ENTERGAME.JS - DragonBall HTML5 Mock Main Game Server
 * ============================================================
 * 
 * Purpose: Handler for user.enterGame - Main login handler
 * Returns ALL player data when user enters the game
 * 
 * IMPORTANT: All fields must be present per saveUserData() in main.min.js
 * There are no optional fields - if it's in the handler, it must be in the response
 * 
 * Author: Local SDK Bridge
 * Version: 5.0.0 - Added 17 conditional fields from main.min.js saveUserData(),
 *                  fixed teamDungeonNormBcst/teamDungeonSplBcst format to match HAR
 * ============================================================
 */

(function(window) {
    'use strict';

    // ========================================================
    // 1. STYLISH LOGGER
    // ========================================================
    var LOG = {
        prefix: '🎮 [MAIN-SERVER]',
        styles: {
            title: 'background: linear-gradient(90deg, #f59e0b 0%, #ef4444 100%); color: white; padding: 2px 8px; border-radius: 4px; font-weight: bold;',
            success: 'color: #22c55e; font-weight: bold;',
            info: 'color: #6b7280;',
            warn: 'color: #f59e0b; font-weight: bold;',
            error: 'color: #ef4444; font-weight: bold;',
            data: 'color: #8b5cf6;',
            separator: 'color: #6b7280;',
            socket: 'color: #ec4899; font-weight: bold;'
        },
        
        _log: function(level, icon, message, data) {
            var timestamp = new Date().toISOString().substr(11, 12);
            var style = this.styles[level] || this.styles.info;
            var format = '%c' + this.prefix + ' %c[' + timestamp + '] ' + icon + ' ' + message;
            
            if (data !== undefined) {
                console.log(format + ' %o', this.styles.title, style, data);
            } else {
                console.log(format, this.styles.title, style);
            }
        },
        
        title: function(message) {
            var line = '══════════════════════════════════════════════════════';
            console.log('%c' + this.prefix + ' %c' + line, this.styles.title, this.styles.separator);
            console.log('%c' + this.prefix + ' %c' + message, this.styles.title, this.styles.title);
            console.log('%c' + this.prefix + ' %c' + line, this.styles.title, this.styles.separator);
        },
        
        success: function(message, data) { this._log('success', '✅', message, data); },
        info: function(message, data) { this._log('info', 'ℹ️', message, data); },
        warn: function(message, data) { this._log('warn', '⚠️', message, data); },
        error: function(message, data) { this._log('error', '❌', message, data); },
        data: function(message, data) { this._log('data', '📊', message, data); },
        socket: function(message, data) { this._log('socket', '🔌', message, data); }
    };

    // ========================================================
    // 2. CONFIGURATION
    // ========================================================
    var CONFIG = {
        serverId: 1,
        serverName: 'Local Server 1',
        mainServerUrl: 'http://127.0.0.1:9998',
        
        // Starting hero from constant.json
        // Hero 1205 (Wukong) has quality 'purple' in hero.json
        startHero: {
            displayId: 1205,
            level: 3,
            star: 0
        },
        
        // Starting items from thingsID.json
        // Item IDs:
        // 101 = Diamond, 102 = Gold, 111 = Soul Stone, 112 = Arena Coin
        // 113 = Snake Coin, 114 = Guild Coin, 121 = Friendship Points
        // 122 = Normal Summon Orb, 123 = Advanced Summon Orb, 124 = Dragon Soul
        // 131 = Exp Capsule (startNum: 1000), 132 = Breakthrough Capsule
        // 133 = Ultra Holy Water, 134 = Ultra Divine Water (startNum: 50)
        // 136 = Power Stone, 137 = Alloy, 139 = Potara Jade
        startItems: {
            gold: 10000,           // 102: Starting gold
            diamond: 1000,         // 101: Starting diamonds
            expCapsule: 5000,      // 131: Exp Capsule for hero upgrades
            breakCapsule: 500,     // 132: Breakthrough Capsule
            soulStone: 1000,       // 111: Soul Stone
            powerStone: 500,       // 136: Power Stone
            alloy: 500,            // 137: Alloy
            advancedSummonOrb: 10, // 123: Advanced Summon Orb
            normalSummonOrb: 50,   // 122: Normal Summon Orb
            friendshipPoints: 100, // 121: Friendship Points
            godWater: 50           // 134: Ultra Divine Water
        }
    };

    // ========================================================
    // 3. PLAYER DATA STORAGE
    // ========================================================
    var STORAGE_KEY = 'dragonball_player_data';
    
    function generateHeroId() {
        return 'h_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 8);
    }
    
    function getServerTime() {
        return Date.now();
    }
    
    /**
     * Build default dungeon data matching HAR structure
     */
    function buildDungeonData() {
        var types = [1, 2, 4, 5, 6, 7, 8];
        var dungeons = {};
        for (var i = 0; i < types.length; i++) {
            var t = types[i];
            dungeons[t] = { _type: t, _lastLevel: 0, _curMaxLevel: 0 };
        }
        return dungeons;
    }
    
    /**
     * Build default userGuild tech data matching HAR structure
     * 3 tech categories with their tech items
     */
    function buildGuildTech() {
        return {
            "1": {
                _firstRest: true,
                _totalCost: { _items: {} },
                _totalLevel: 0,
                _techItems: {
                    "31": { _level: 0, _attrs: { _items: {} }, _version: "201912101403" },
                    "32": { _level: 0, _attrs: { _items: {} }, _version: "201912101403" },
                    "33": { _level: 0, _attrs: { _items: {} }, _version: "201912101403" },
                    "34": { _level: 0, _attrs: { _items: {} }, _version: "201912101403" },
                    "35": { _level: 0, _attrs: { _items: {} }, _version: "201912101403" },
                    "36": { _level: 0, _attrs: { _items: {} }, _version: "201912101403" },
                    "37": { _level: 0, _attrs: { _items: {} }, _version: "201912101403" },
                    "38": { _level: 0, _attrs: { _items: {} }, _version: "201912101403" },
                    "39": { _level: 0, _attrs: { _items: {} }, _version: "201912101403" },
                    "40": { _level: 0, _attrs: { _items: {} }, _version: "201912101403" },
                    "41": { _level: 0, _attrs: { _items: {} }, _version: "201912101403" }
                }
            },
            "2": {
                _firstRest: true,
                _totalCost: { _items: {} },
                _totalLevel: 0,
                _techItems: {
                    "1": { _level: 0, _attrs: { _items: {} }, _version: "201912101403" },
                    "2": { _level: 0, _attrs: { _items: {} }, _version: "201912101403" },
                    "3": { _level: 0, _attrs: { _items: {} }, _version: "201912101403" },
                    "4": { _level: 0, _attrs: { _items: {} }, _version: "201912101403" },
                    "5": { _level: 0, _attrs: { _items: {} }, _version: "201912101403" },
                    "6": { _level: 0, _attrs: { _items: {} }, _version: "201912101403" },
                    "7": { _level: 0, _attrs: { _items: {} }, _version: "201912101403" },
                    "8": { _level: 0, _attrs: { _items: {} }, _version: "201912101403" },
                    "9": { _level: 0, _attrs: { _items: {} }, _version: "201912101403" },
                    "10": { _level: 0, _attrs: { _items: {} }, _version: "201912101403" },
                    "11": { _level: 0, _attrs: { _items: {} }, _version: "201912101403" }
                }
            },
            "3": {
                _firstRest: true,
                _totalCost: { _items: {} },
                _totalLevel: 0,
                _techItems: {
                    "61": { _level: 0, _attrs: { _items: {} }, _version: "201912101403" },
                    "62": { _level: 0, _attrs: { _items: {} }, _version: "201912101403" },
                    "63": { _level: 0, _attrs: { _items: {} }, _version: "201912101403" },
                    "64": { _level: 0, _attrs: { _items: {} }, _version: "201912101403" },
                    "65": { _level: 0, _attrs: { _items: {} }, _version: "201912101403" },
                    "66": { _level: 0, _attrs: { _items: {} }, _version: "201912101403" },
                    "67": { _level: 0, _attrs: { _items: {} }, _version: "201912101403" },
                    "68": { _level: 0, _attrs: { _items: {} }, _version: "201912101403" },
                    "69": { _level: 0, _attrs: { _items: {} }, _version: "201912101403" },
                    "70": { _level: 0, _attrs: { _items: {} }, _version: "201912101403" },
                    "71": { _level: 0, _attrs: { _items: {} }, _version: "201912101403" }
                }
            }
        };
    }
    
    /**
     * Build default teamDungeonTask achievement data matching HAR structure
     */
    function buildTeamDungeonAchievements() {
        var ids = [101, 102, 103, 104, 105, 106, 107, 108];
        var versions = {
            101: "202603021000", 102: "202412301006", 103: "202505271744",
            104: "202410221037", 105: "202503121715", 106: "202508081025",
            107: "202510151400", 108: "202512261000"
        };
        var achievement = {};
        for (var i = 0; i < ids.length; i++) {
            var id = ids[i];
            achievement[id] = { _version: versions[id], _tasks: {}, _type: id };
        }
        return achievement;
    }
    
    /**
     * Load existing player data or create new player data
     * CRITICAL: All fields must match what saveUserData expects
     */
    function loadOrCreatePlayerData(request) {
        // Get userId from request if available
        var requestUserId = request ? request.userId : null;
        
        // Try to load existing data
        if (requestUserId) {
            try {
                var stored = localStorage.getItem(STORAGE_KEY + '_' + requestUserId);
                if (stored) {
                    var parsed = JSON.parse(stored);
                    LOG.info('Loaded existing player data:', parsed.userId);
                    return parsed;
                }
            } catch (e) {
                LOG.warn('Failed to load stored player data:', e);
            }
        }
        
        // Get user info from SDK or request
        var sdkUser = window.LOCAL_SDK ? window.LOCAL_SDK.user : null;
        var userId = requestUserId || (sdkUser ? sdkUser.userId : 'player_' + Date.now().toString(36));
        var nickname = sdkUser ? sdkUser.nickname : 'Player';
        
        // Create new player data
        var now = Date.now();
        var heroId = generateHeroId();
        
        // Build items matching HAR structure
        var items = {
            '101': { _id: 101, _num: 0 },    // Diamond (HAR starts at 0 for new player)
            '102': { _id: 102, _num: 10000 }, // Gold
            '103': { _id: 103, _num: 0 },     // PlayerExp
            '104': { _id: 104, _num: 1 },     // PlayerLevel
            '105': { _id: 105, _num: 0 },     // VipExp
            '106': { _id: 106, _num: 0 },     // VipLevel
            '111': { _id: 111, _num: 0 },     // Soul Stone
            '112': { _id: 112, _num: 0 },     // Arena Coin
            '113': { _id: 113, _num: 0 },     // Snake Coin
            '114': { _id: 114, _num: 0 },     // Guild Coin
            '131': { _id: 131, _num: CONFIG.startItems.expCapsule },  // Exp Capsule
            '134': { _id: 134, _num: CONFIG.startItems.godWater },    // Ultra Divine Water
            '9015': { _id: 9015, _num: 1 }    // Starting item from HAR
        };
        
        // Add extra starting items from CONFIG (for convenience)
        if (CONFIG.startItems.soulStone > 0) items['111']._num = CONFIG.startItems.soulStone;
        if (CONFIG.startItems.advancedSummonOrb > 0) items['123'] = { _id: 123, _num: CONFIG.startItems.advancedSummonOrb };
        if (CONFIG.startItems.normalSummonOrb > 0) items['122'] = { _id: 122, _num: CONFIG.startItems.normalSummonOrb };
        if (CONFIG.startItems.breakCapsule > 0) items['132'] = { _id: 132, _num: CONFIG.startItems.breakCapsule };
        if (CONFIG.startItems.powerStone > 0) items['136'] = { _id: 136, _num: CONFIG.startItems.powerStone };
        if (CONFIG.startItems.alloy > 0) items['137'] = { _id: 137, _num: CONFIG.startItems.alloy };
        if (CONFIG.startItems.diamond > 0) items['101']._num = CONFIG.startItems.diamond;
        
        var newPlayerData = {
            userId: userId,
            isNewUser: true,
            createTime: now,
            lastLoginTime: now,
            
            // ========================================================
            // USER INFO - matching HAR structure exactly
            // ========================================================
            user: {
                _id: userId,
                _nickName: nickname,
                _oldName: '',
                _headImage: 'hero_icon_' + CONFIG.startHero.displayId,
                _account: userId,
                _channelId: 'PP',
                _pwd: '',
                _privilege: 0,
                _attribute: { _items: items },
                _lastLoginTime: now,
                _offlineTime: now - 18000000, // ~5 hours ago
                _nickChangeTimes: 0,
                _levelChangeTime: 0,
                _createTime: now,
                _oriServerId: CONFIG.serverId,
                _vipLevelVersion: '201912301726',
                _os: 'other',
                _bulletinVersions: {},
                _oldUserBackTime: 0,
                _channelParam: {}
            },
            
            // ========================================================
            // ITEMS/INVENTORY - matching HAR totalProps._items structure
            // ========================================================
            items: items,
            
            // ========================================================
            // HANGUP/AFK DATA - matching HAR structure
            // ========================================================
            hangup: {
                _id: userId,
                _lastGainTime: now,
                _waitGain: { _items: {} },
                _waitRand: { _items: {} },
                _actReward: { _items: {} },
                _curLess: 10101,
                _maxPassLesson: 0,
                _passLessonTime: 0,
                _maxPassChapter: 0,
                _lastNormalGainTime: now,
                _lastRandGainTime: now,
                _haveGotChapterReward: {},
                _firstGain: true,
                _clickGlobalWarBuffTag: '',
                _buyFund: false,
                _haveGotFundReward: {}
            },
            
            // ========================================================
            // SUMMON DATA - matching HAR structure
            // ========================================================
            summon: {
                _id: userId,
                _energy: 0,
                _haveCommonGuide: false,
                _haveSuperGuide: false,
                _canCommonFreeTime: 0,
                _canSuperFreeTime: 0,
                _summonTimes: {},
                _logicInfo: {},
                _firstDiamond10: true,
                _wishList: [],
                _wishVersion: 0
            },
            
            // ========================================================
            // EQUIPMENT - matching HAR structure (has _id)
            // ========================================================
            equip: {
                _suits: {},
                _id: userId
            },
            
            // ========================================================
            // IMPRINT - matching HAR structure (_items is ARRAY not object)
            // ========================================================
            imprint: {
                _id: userId,
                _items: []
            },
            
            // ========================================================
            // DUNGEON - matching HAR structure with default dungeon types
            // ========================================================
            dungeon: {
                _id: userId,
                _dungeons: buildDungeonData()
            },
            
            // ========================================================
            // LAST TEAM - matching HAR structure
            // ========================================================
            lastTeam: {
                _id: userId,
                _lastTeamInfo: {}
            },
            
            // ========================================================
            // SCHEDULE INFO - matching HAR structure with correct types
            // ========================================================
            scheduleInfo: {
                _id: userId,
                _refreshTime: now,
                _templeBuyCount: 0,
                _marketDiamondRefreshCount: 0,
                _vipMarketDiamondRefreshCount: 0,
                _arenaAttackTimes: 5,
                _arenaBuyTimesCount: 0,
                _arenaHaveJoinToday: false,
                _snakeResetTimes: 1,
                _snakeSweepCount: 0,
                _cellGameHaveGotReward: false,
                _cellGameHaveTimes: 1,
                _strongEnemyTimes: 6,
                _strongEnemyBuyCount: 0,
                _monthCardHaveGotReward: {},
                _dungeonTimes: { "1": 2, "2": 2, "4": 2, "5": 2, "7": 2, "8": 2 },
                _dungeonBuyTimesCount: { "1": 0, "2": 0, "4": 0, "5": 0, "7": 0, "8": 0 },
                _karinBattleTimes: 10,
                _karinBuyBattleTimesCount: 0,
                _karinBuyFeetCount: 0,
                _goldBuyCount: 0,
                _entrustResetTimes: 1,
                _likeRank: {},
                _giveHearts: [],
                _getHearts: [],
                _mahaAttackTimes: 10,
                _mahaBuyTimesCount: 0,
                _mineResetTimes: 3,
                _mineBuyResetTimesCount: 0,
                _mineBuyStepCount: 0,
                _guildBossTimes: 2,
                _guildBossTimesBuyCount: 0,
                _treasureTimes: 3,
                _guildCheckInType: 0,
                _dragonExchangeSSPoolId: 1,
                _dragonExchangeSSSPoolId: 1,
                _clickTimeGift: false,
                _trainingBuyCount: 0,
                _commentedHeroes: {},
                _bossCptTimes: 3,
                _bossCptBuyCount: 0,
                _ballWarBuyCount: 0,
                _expeditionEvents: {},
                _expeditionSpeedUpCost: 0,
                _clickExpedition: false,
                _mergeBossBuyCount: 0,
                _templeDailyReward: false,
                _templeYesterdayLess: 0,
                _teamDugeonUsedRobots: [],
                _topBattleTimes: 5,
                _topBattleBuyCount: 0,
                _timeTrialBuyTimesCount: 0,
                _keyItemCount: {},
                _gravityTrialBuyTimesCount: 0
            },
            
            // ========================================================
            // GIFT INFO - matching HAR structure
            // ========================================================
            giftInfo: {
                _id: userId,
                _isBuyFund: false,
                _levelGiftCount: {},
                _fundGiftCount: {},
                _fristRecharge: {
                    _canGetReward: false,
                    _haveGotReward: false
                },
                _haveGotVipRewrd: {},
                _buyVipGiftCount: {},
                _onlineGift: {
                    _curId: 0,
                    _nextTime: now + 300000
                },
                _gotChannelWeeklyRewardTag: '',
                _clickHonghuUrlTime: 0,
                _gotBSAddToHomeReward: false
            },
            
            // ========================================================
            // GUIDE - matching HAR structure
            // ========================================================
            guide: {
                _id: userId,
                _steps: {}
            },
            
            // ========================================================
            // CHECKIN - matching HAR structure
            // ========================================================
            checkin: {
                _id: userId,
                _activeItem: [1],
                _curCycle: 1,
                _maxActiveDay: 1,
                _lastActiveDate: now
            },
            
            // ========================================================
            // CUR MAIN TASK - matching HAR structure (object not 0)
            // ========================================================
            curMainTask: {
                "6001": { _id: 6001, _curCount: 0, _targetCount: 10102, _state: 1 }
            }
        };
        
        // ========================================================
        // ADD STARTING HERO - matching HAR structure exactly
        // Only keep fields that exist in real server data
        // ========================================================
        newPlayerData.heros = {};
        newPlayerData.heros[heroId] = {
            _heroId: heroId,
            _heroDisplayId: CONFIG.startHero.displayId,
            _heroBaseAttr: { _level: CONFIG.startHero.level, _evolveLevel: 0 },
            _heroStar: CONFIG.startHero.star,
            _superSkillLevel: 0,           // number, not array
            _potentialLevel: {},            // object, not array
            _superSkillResetCount: 0,
            _potentialResetCount: 0,
            _qigong: { _items: {} },        // object with _items, not null
            _qigongTmp: { _items: {} },     // object with _items, not null
            _qigongTmpPower: 0,
            _qigongStage: 1,
            _breakInfo: {
                _breakLevel: 1,
                _level: 0,
                _attr: { _items: {} },
                _version: ''
            },
            _totalCost: {
                _wakeUp: { _items: {} },
                _earring: { _items: {} },
                _levelUp: { _items: {} },
                _evolve: { _items: {} },
                _skill: { _items: {} },
                _qigong: { _items: {} },
                _heroBreak: { _items: {} }
            },
            _expeditionMaxLevel: 0,
            _gemstoneSuitId: 0,
            _linkTo: [],
            _linkFrom: '',
            _resonanceType: 0,
            _version: '202010131125'
        };
        
        // Save to localStorage
        try {
            localStorage.setItem(STORAGE_KEY + '_' + userId, JSON.stringify(newPlayerData));
            LOG.success('Created new player data:', userId);
        } catch (e) {
            LOG.warn('Failed to store player data:', e);
        }
        
        return newPlayerData;
    }
    
    // ========================================================
    // 4. BUILD RESPONSE
    // ========================================================
    function buildResponse(data) {
        return {
            ret: 0,
            data: typeof data === 'string' ? data : JSON.stringify(data),
            compress: false,
            serverTime: getServerTime(),
            // CRITICAL: server0Time = 14400000 (4 hours in ms = UTC+4 timezone offset)
            // Real server always returns this fixed value, NOT a timestamp!
            // Used by game client for timezone/time calculations
            server0Time: 14400000
        };
    }

    // ========================================================
    // 5. REQUEST HANDLERS
    // ========================================================
    var RequestHandlers = {
        
        /**
         * Handle user.enterGame
         * Main login handler - returns all player data
         * This is called AFTER verify is complete
         * 
         * CRITICAL: All 80 top-level fields must be present matching HAR data
         */
        enterGame: function(request, playerData) {
            LOG.title('HANDLING: user.enterGame');
            LOG.data('Request:', request);
            
            var now = Date.now();
            var userId = playerData.userId;
            
            // Update last login time
            playerData.lastLoginTime = now;
            playerData.user._lastLoginTime = now;
            
            // Check if new user
            var isNewUser = playerData.isNewUser;
            playerData.isNewUser = false;
            
            // Sync user._attribute with current items
            playerData.user._attribute = { _items: playerData.items };
            
            // Save updated data
            try {
                localStorage.setItem(STORAGE_KEY + '_' + userId, JSON.stringify(playerData));
            } catch (e) {
                LOG.warn('Failed to save player data:', e);
            }
            
            // ========================================================
            // BUILD COMPLETE RESPONSE DATA - 79 keys matching HAR
            // Based on real server data structure
            // ========================================================
            var responseData = {
                
                // --- P0: _arenaTeam = {} (not array) ---
                _arenaTeam: {},
                
                // --- P1: _arenaSuper = [] ---
                _arenaSuper: [],
                
                // --- backpackLevel ---
                backpackLevel: 1,
                
                // --- ballWarState ---
                ballWarState: 0,
                
                // --- battleMedal: full structure from HAR ---
                battleMedal: {
                    _id: userId,
                    _battleMedalId: '0bfa5db0-148c-4af0-9a82-5a716b62b502',
                    _cycle: 1,
                    _nextRefreshTime: now + 2592000000,
                    _level: 0,
                    _curExp: 0,
                    _openSuper: false,
                    _task: {},
                    _levelReward: {},
                    _shopBuyTimes: {},
                    _buyLevelCount: 0
                },
                
                // --- blacklist: empty array ---
                blacklist: [],
                
                // --- P0: broadcastRecord = [] (not object) ---
                broadcastRecord: [],
                
                // --- cardLog: empty array for new server ---
                cardLog: [],
                
                // --- cellgameHaveSetHero ---
                cellgameHaveSetHero: false,
                
                // --- channelSpecial: full 16-field structure from HAR ---
                channelSpecial: {
                    _id: '',
                    _show: false,
                    _icon: '',
                    _bg: '',
                    _btn1Url: '',
                    _btn2Url: '',
                    _vip: 0,
                    _hideHeroes: [],
                    _weeklyReward: { _items: {} },
                    _weeklyRewardTag: '',
                    _honghuUrl: '',
                    _honghuUrlStartTime: 0,
                    _honghuUrlEndTime: 0,
                    _bsAddToHomeIcon: '',
                    _bsAddToHomeReward: { _items: {} }
                },
                
                // --- checkin: full structure from HAR ---
                checkin: playerData.checkin || {
                    _id: userId,
                    _activeItem: [1],
                    _curCycle: 1,
                    _maxActiveDay: 1,
                    _lastActiveDate: now
                },
                
                // --- P0: curMainTask = object (not 0) ---
                curMainTask: playerData.curMainTask || {
                    "6001": { _id: 6001, _curCount: 0, _targetCount: 10102, _state: 1 }
                },
                
                // --- P0: currency = "USD" string (not object) ---
                currency: 'USD',
                
                // --- dragonEquiped ---
                dragonEquiped: {},
                
                // --- dungeon ---
                dungeon: playerData.dungeon || {
                    _id: userId,
                    _dungeons: buildDungeonData()
                },
                
                // --- enableShowQQ ---
                enableShowQQ: false,
                
                // --- equip: has _id from HAR ---
                equip: {
                    _suits: playerData.equip ? (playerData.equip._suits || {}) : {},
                    _id: userId
                },
                
                // --- expedition: full structure from HAR ---
                expedition: {
                    _id: userId,
                    _passLesson: { "1": 0, "2": 0, "3": 0 },
                    _machines: {},
                    _collection: [],
                    _teams: {},
                    _times: 10,
                    _timesStartRecover: 0
                },
                
                // --- forbiddenChat: users is [] not {} ---
                forbiddenChat: {
                    users: [],
                    finishTime: {}
                },
                
                // --- giftInfo ---
                giftInfo: playerData.giftInfo || {
                    _id: userId,
                    _isBuyFund: false,
                    _levelGiftCount: {},
                    _fundGiftCount: {},
                    _fristRecharge: { _canGetReward: false, _haveGotReward: false },
                    _haveGotVipRewrd: {},
                    _buyVipGiftCount: {},
                    _onlineGift: { _curId: 0, _nextTime: now + 300000 },
                    _gotChannelWeeklyRewardTag: '',
                    _clickHonghuUrlTime: 0,
                    _gotBSAddToHomeReward: false
                },
                
                // --- P0: globalWarBuffTag = "" not null ---
                globalWarBuffTag: '',
                
                // --- P0: globalWarBuffEndTime ---
                globalWarBuffEndTime: 0,
                
                // --- P0: globalWarBuff = 0 not null ---
                globalWarBuff: 0,
                
                // --- P0: globalWarLastRank = {} not 0 ---
                globalWarLastRank: {},
                
                // --- guide ---
                guide: playerData.guide || { _id: userId, _steps: {} },
                
                // --- guildLevel ---
                guildLevel: 0,
                
                // --- P0: guildTreasureMatchRet = 0 not null ---
                guildTreasureMatchRet: 0,
                
                // --- hangup: full structure from HAR ---
                hangup: playerData.hangup || {
                    _id: userId,
                    _lastGainTime: now,
                    _waitGain: { _items: {} },
                    _waitRand: { _items: {} },
                    _actReward: { _items: {} },
                    _curLess: 10101,
                    _maxPassLesson: 0,
                    _passLessonTime: 0,
                    _maxPassChapter: 0,
                    _lastNormalGainTime: now,
                    _lastRandGainTime: now,
                    _haveGotChapterReward: {},
                    _firstGain: true,
                    _clickGlobalWarBuffTag: '',
                    _buyFund: false,
                    _haveGotFundReward: {}
                },
                
                // --- headEffect: full structure from HAR ---
                headEffect: {
                    _id: userId,
                    _curBox: 0,
                    _curEffect: 0,
                    _effects: []
                },
                
                // --- heroImageVersion ---
                heroImageVersion: 0,
                
                // --- heroSkin: full structure from HAR ---
                heroSkin: {
                    _id: userId,
                    _skins: {},
                    _curSkin: {}
                },
                
                // --- P0: heros wrapper with _id, _maxPower, _maxPowerChangeTime ---
                heros: {
                    _id: userId,
                    _heros: playerData.heros,
                    _maxPower: 0,
                    _maxPowerChangeTime: 0
                },
                
                // --- hideHeroes ---
                hideHeroes: [],
                
                // --- P0: imprint._items = [] (array, not object) ---
                imprint: playerData.imprint || {
                    _id: userId,
                    _items: []
                },
                
                // --- karinStartTime: use a fixed Monday timestamp ---
                karinStartTime: now - ((now % 604800000) + 259200000),
                
                // --- karinEndTime: Saturday night ---
                karinEndTime: now - ((now % 604800000) - 259200000),
                
                // --- lastTeam ---
                lastTeam: playerData.lastTeam || {
                    _id: userId,
                    _lastTeamInfo: {}
                },
                
                // --- mergedServers ---
                mergedServers: [],
                
                // --- newUser ---
                newUser: !!isNewUser,
                
                // --- onlineBulletin ---
                onlineBulletin: [],
                
                // --- retrieve: full structure from HAR ---
                retrieve: {
                    _id: userId,
                    _finishDungeons: {},
                    _calHangupTime: 0,
                    _retrieveHangupReward: { _items: {} },
                    _retrieveHangupTime: 0,
                    _retrieveDungeons: {},
                    _finishTime: 0
                },
                
                // --- scheduleInfo: full structure with correct types from HAR ---
                scheduleInfo: playerData.scheduleInfo || {
                    _id: userId,
                    _refreshTime: now,
                    _templeBuyCount: 0,
                    _marketDiamondRefreshCount: 0,
                    _vipMarketDiamondRefreshCount: 0,
                    _arenaAttackTimes: 5,
                    _arenaBuyTimesCount: 0,
                    _arenaHaveJoinToday: false,
                    _snakeResetTimes: 1,
                    _snakeSweepCount: 0,
                    _cellGameHaveGotReward: false,
                    _cellGameHaveTimes: 1,
                    _strongEnemyTimes: 6,
                    _strongEnemyBuyCount: 0,
                    _monthCardHaveGotReward: {},
                    _dungeonTimes: { "1": 2, "2": 2, "4": 2, "5": 2, "7": 2, "8": 2 },
                    _dungeonBuyTimesCount: { "1": 0, "2": 0, "4": 0, "5": 0, "7": 0, "8": 0 },
                    _karinBattleTimes: 10,
                    _karinBuyBattleTimesCount: 0,
                    _karinBuyFeetCount: 0,
                    _goldBuyCount: 0,
                    _entrustResetTimes: 1,
                    _likeRank: {},
                    _giveHearts: [],
                    _getHearts: [],
                    _mahaAttackTimes: 10,
                    _mahaBuyTimesCount: 0,
                    _mineResetTimes: 3,
                    _mineBuyResetTimesCount: 0,
                    _mineBuyStepCount: 0,
                    _guildBossTimes: 2,
                    _guildBossTimesBuyCount: 0,
                    _treasureTimes: 3,
                    _guildCheckInType: 0,
                    _dragonExchangeSSPoolId: 1,
                    _dragonExchangeSSSPoolId: 1,
                    _clickTimeGift: false,
                    _trainingBuyCount: 0,
                    _commentedHeroes: {},
                    _bossCptTimes: 3,
                    _bossCptBuyCount: 0,
                    _ballWarBuyCount: 0,
                    _expeditionEvents: {},
                    _expeditionSpeedUpCost: 0,
                    _clickExpedition: false,
                    _mergeBossBuyCount: 0,
                    _templeDailyReward: false,
                    _templeYesterdayLess: 0,
                    _teamDugeonUsedRobots: [],
                    _topBattleTimes: 5,
                    _topBattleBuyCount: 0,
                    _timeTrialBuyTimesCount: 0,
                    _keyItemCount: {},
                    _gravityTrialBuyTimesCount: 0
                },
                
                // --- serverId ---
                serverId: CONFIG.serverId,
                
                // --- serverOpenDate ---
                serverOpenDate: playerData.createTime || now,
                
                // --- serverVersion ---
                serverVersion: 'v2024102918',
                
                // --- shopNewHeroes ---
                shopNewHeroes: {},
                
                // --- QQ fields ---
                showQQ: 0,
                showQQImg1: '',
                showQQImg2: '',
                showQQUrl: '',
                showQQVip: 0,
                
                // --- summon: full structure from HAR ---
                summon: playerData.summon || {
                    _id: userId,
                    _energy: 0,
                    _haveCommonGuide: false,
                    _haveSuperGuide: false,
                    _canCommonFreeTime: 0,
                    _canSuperFreeTime: 0,
                    _summonTimes: {},
                    _logicInfo: {},
                    _firstDiamond10: true,
                    _wishList: [],
                    _wishVersion: 0
                },
                
                // --- summonLog ---
                summonLog: [],
                
                // --- superImageVersion ---
                superImageVersion: 0,
                
                // --- superSkill: full structure from HAR ---
                superSkill: {
                    _id: userId,
                    _skills: {}
                },
                
                // --- teamDungeonHideInfo ---
                teamDungeonHideInfo: {},
                
                // --- teamDungeonNormBcst: empty object (dynamic keys like msg-XXXXXXXXXX from HAR) ---
                teamDungeonNormBcst: {},
                
                // --- teamDungeonOpenTime: far future ---
                teamDungeonOpenTime: now + 86400000 * 365,
                
                // --- teamDungeonSplBcst: empty object (dynamic keys like msg-XXXXXXXXXX from HAR) ---
                teamDungeonSplBcst: {},
                
                // --- teamDungeonTask: full structure from HAR ---
                teamDungeonTask: {
                    _achievement: buildTeamDungeonAchievements(),
                    _dailyRefreshTime: now,
                    _daily: {},
                    _id: userId
                },
                
                // --- teamServerHttpUrl ---
                teamServerHttpUrl: '',
                
                // --- myTeamServerSocketUrl: CRITICAL for dungeon server connection ---
                // Game uses this to set ts.loginInfo.serverItem.dungeonurl
                // Must point to local dungeon mock server (port 9996)
                myTeamServerSocketUrl: 'http://127.0.0.1:9996',
                
                // --- teamTraining: full structure from HAR ---
                teamTraining: {
                    _id: userId,
                    _levels: {},
                    _unlock: false,
                    _version: ''
                },
                
                // --- templeLess ---
                templeLess: 0,
                
                // --- timeBonusInfo: time-limited bonus offers (HAR verified) ---
                timeBonusInfo: {
                    _id: userId,
                    _timeBonus: {},
                    _triggerBonus: 0
                },
                
                // --- P1: timeTrial: full structure from HAR ---
                timeTrial: {
                    _id: userId,
                    _levelStars: {},
                    _gotStarReward: {},
                    _totalStars: 0,
                    _totalStarChangeTime: 0,
                    _haveTimes: 0,
                    _timesStartRecover: 0,
                    _startTime: now - 86400000 * 14
                },
                
                // --- timeTrialNextOpenTime ---
                timeTrialNextOpenTime: now + 86400000 * 14,
                
                // --- P0: timesInfo: full structure (not null) ---
                timesInfo: {
                    templeTimes: 10,
                    templeTimesRecover: 0,
                    mineSteps: 0,
                    mineStepsRecover: 0,
                    karinFeet: 5,
                    karinFeetRecover: 0,
                    mahaTimes: 0,
                    mahaTimesRecover: 0,
                    marketRefreshTimes: 3,
                    marketRefreshTimesRecover: now,
                    vipMarketRefreshTimes: 0,
                    vipMarketRefreshTimesRecover: 0
                },
                
                // --- totalProps ---
                totalProps: {
                    _items: playerData.items
                },
                
                // --- training: full structure from HAR ---
                training: {
                    _id: userId,
                    _type: 0,
                    _cfgId: 0,
                    _questionId: 0,
                    _enemyId: 0,
                    _enemyHp: {},
                    _times: 10,
                    _timesStartRecover: now
                },
                
                // --- user: with _attribute clone of items ---
                user: playerData.user,
                
                // --- userBallWar: full structure from HAR ---
                userBallWar: {
                    _id: userId,
                    _times: 0,
                    _timesStartRecover: 0,
                    _fieldId: '',
                    _readRecordTime: 0,
                    _nextCanFightTime: 0
                },
                
                // --- userGuild: full structure from HAR with tech items ---
                userGuild: {
                    _id: userId,
                    _satanGift: { _exp: 0, _level: 1, _canRewardTime: {} },
                    _tech: buildGuildTech()
                },
                
                // --- userGuildPub: full structure from HAR ---
                userGuildPub: {
                    _id: userId,
                    _guildId: '',
                    _haveReadBulletin: false,
                    _requestedGuild: [],
                    _canJoinGuildTime: 0,
                    _createGuildCD: false,
                    _ballWarJoin: false,
                    _lastRefreshTime: now
                },
                
                // --- userTopBattle: full structure from HAR ---
                userTopBattle: {
                    _id: userId,
                    _teams: {},
                    _teamTag: '',
                    _nextSetTeamTime: 0,
                    _lastPoint: 0,
                    _history: [],
                    _records: [],
                    _areaId: 0,
                    _season: 0,
                    _bet: {},
                    _liked: false,
                    _gotRankReward: []
                },
                
                // --- userWar: full structure from HAR ---
                userWar: {
                    _id: userId,
                    _session: 0,
                    _worldId: 0,
                    _areaId: 0,
                    _auditionWinCount: 0,
                    _gotAuditionReward: {},
                    _bet: {},
                    _liked: false,
                    _championCount: 0
                },
                
                // --- P1: userYouTuberRecruit: full structure from HAR ---
                userYouTuberRecruit: {
                    _id: userId,
                    _hasJoin: false,
                    _gotReward: false,
                    _nextRefreshTime: 0,
                    _mailAddr: '',
                    _joinTime: 0
                },
                
                // --- vipLog ---
                vipLog: [],
                
                // --- warInfo ---
                warInfo: null,
                
                // --- P1: weapon: full structure from HAR ---
                weapon: {
                    _id: userId,
                    _items: []
                },
                
                // --- P1: YouTuberRecruit: full structure from HAR ---
                YouTuberRecruit: {
                    _id: 'YouTuberRecruitPlan',
                    _image: '',
                    _content: '',
                    _reward: { _items: {} },
                    _mailAddr: '',
                    _jumpLink: [],
                    _nextRefreshTime: 0,
                    _hidden: true
                },

                // ========================================================
                // ADDITIONAL FIELDS from main.min.js saveUserData()
                // These are conditionally sent by real server but client
                // reads them via if() guards. Included for 100% coverage.
                // ========================================================

                // --- ballBroadcast: array of broadcast messages, max 70 ---
                ballBroadcast: [],

                // --- ballWarInfo: GuildBallWarInfo deserialize reads _signed,_fieldId,_point,_topMsg ---
                ballWarInfo: {
                    _signed: false,
                    _fieldId: '',
                    _point: 0,
                    _topMsg: ''
                },

                // --- clickSystem: UserClickSingleton reads _clickSys dict (key=string, value=boolean) ---
                clickSystem: {
                    _id: userId,
                    _clickSys: {
                        '1': false,  // LESSON_FUND
                        '2': false   // TEMPLE_FUND
                    }
                },

                // --- fastTeam: HerosManager reads _teamInfo dict of FastTeam objects ---
                fastTeam: {
                    _teamInfo: {}
                },

                // --- gemstone: EquipInfoManager reads e.gemstone._items ---
                gemstone: {
                    _items: {}
                },

                // --- gravity: TrialManager reads e.gravity directly as GravityTrialModel ---
                gravity: {
                    _id: userId,
                    _haveTimes: 0,
                    _timesStartRecover: 0,
                    _lastLess: 0,
                    _lastTime: 0
                },

                // --- guildActivePoints: TeamInfoManager iterates dict (key=string, value=number) ---
                guildActivePoints: {},

                // --- guildName: TeamInfoManager.setTeamName(e.guildName) ---
                guildName: '',

                // --- littleGame: LittleGameManager reads _gotBattleReward, _gotChapterReward, _clickTime ---
                littleGame: {
                    _gotBattleReward: {},
                    _gotChapterReward: {},
                    _clickTime: 0
                },

                // --- monthCard: WelfareInfoManager reads _id, _card[N]._endTime ---
                monthCard: {
                    _id: '',
                    _card: {}
                },

                // --- questionnaires: UserInfoSingleton iterates dict of QuestionData ---
                questionnaires: {},

                // --- recharge: WelfareInfoManager reads _id, _haveBought[productId] ---
                recharge: {
                    _id: '',
                    _haveBought: {}
                },

                // --- resonance: HerosManager reads ResonanceModel with _cabins, _diamondCabin, etc ---
                resonance: {
                    _id: userId,
                    _diamondCabin: 0,
                    _buySeatCount: 0,
                    _totalTalent: 0,
                    _unlockSpecial: false,
                    _cabins: {}
                },

                // --- teamDungeon: TeamworkManager reads _myTeam, _canCreateTeamTime, _nextCanJoinTime ---
                teamDungeon: {
                    _myTeam: null,
                    _canCreateTeamTime: 0,
                    _nextCanJoinTime: 0
                },

                // --- teamDungeonInvitedFriends: TeamworkManager reads array ---
                teamDungeonInvitedFriends: [],

                // --- timeMachine: TimeLeapSingleton reads _items dict of TimeMachineItem ---
                timeMachine: {
                    _items: {}
                },

                // --- userDownloadReward: UserInfoSingleton reads _isClick, _haveGotDlReward, _isBind, _haveGotBindReward ---
                userDownloadReward: {
                    _isClick: false,
                    _haveGotDlReward: false,
                    _isBind: false,
                    _haveGotBindReward: false
                }
            };
            
            LOG.success('enterGame successful for user:', userId);
            LOG.data('Response Data Keys (' + Object.keys(responseData).length + '):', Object.keys(responseData).sort());
            
            return buildResponse(responseData);
        },
        
        /**
         * Default handler for unknown actions - 1 line log only
         */
        default: function(request, playerData) {
            LOG.warn('no handler: ' + request.type + '.' + request.action);
            return buildResponse({});
        }
    };

    // ========================================================
    // 6. MOCK SOCKET CLASS - Behaves like real socket.io Socket
    // ========================================================
    // IMPORTANT: Must match the API the game expects:
    //   socket.on('connect', fn)        → listen for connect
    //   socket.on('verify', fn)         → listen for server verify challenge
    //   socket.on('message', fn)        → listen for server messages
    //   socket.emit('verify', data, cb) → client sends verify to server
    //   socket.emit('user.enterGame', data, cb) → client sends enterGame
    //   socket.emit('handler.process', data, cb) → client sends action
    //   socket.id                       → session ID string
    //   socket.connected                → boolean
    // ========================================================
    function MockSocket(serverUrl) {
        var self = this;
        
        self.url = serverUrl;
        self.connected = false;
        self.disconnected = false;
        self.eventListeners = {};
        
        // Generate a realistic socket.io session ID (format: 20 hex chars)
        self.id = '';
        for (var i = 0; i < 20; i++) {
            self.id += Math.floor(Math.random() * 16).toString(16);
        }
        
        // Socket.io internal stubs (game code may check these)
        self.io = {
            engine: {
                transport: { name: 'polling' },
                readyState: 'open'
            },
            opts: {}
        };
        
        LOG.socket('─────────────────────────────────────────');
        LOG.socket('MockSocket created');
        LOG.socket('URL:', serverUrl);
        LOG.socket('Socket ID:', self.id);
        LOG.socket('─────────────────────────────────────────');
        
        // ========================================================
        // SIMULATE REAL CONNECTION LIFECYCLE (from HAR analysis):
        // 1. Connect fires (simulating handshake + polling success)
        // 2. Server sends 'verify' event with UUID string as nonce
        //    Real server: 51:42["verify","02238096-3bee-4331-b223-641f6e4bb37b"]
        // 3. Client encrypts nonce with TEA(key="verification")
        //    Client emits: 64:420["verify","d7+eK0Hd3Yo6UiidsCZeG4bsvJUFId/NWjUZOHmBOomaWEpB"]
        // 4. Server validates → callback({ret:0})
        // 5. Client then emits 'user.enterGame' via handler.process
        // ========================================================
        
        // Generate a UUID v4 nonce for verify challenge (matching real server format)
        var nonce = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random() * 16 | 0;
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
        
        // Step 1: Fire 'connect' after realistic delay
        setTimeout(function() {
            self.connected = true;
            LOG.socket('Connection established');
            self._trigger('connect');
            
            // Step 2: Server sends 'verify' challenge with UUID nonce
            // Game code: socket.on('verify', function(nonce) { TEA.encrypt(nonce, 'verification') })
            setTimeout(function() {
                LOG.socket('Server sending verify challenge: ' + nonce);
                self._trigger('verify', nonce);
            }, 80);
            
        }, 30);
    }
    
    MockSocket.prototype = {
        
        on: function(event, callback) {
            LOG.socket('ON() Event: ' + event);
            
            if (!this.eventListeners[event]) {
                this.eventListeners[event] = [];
            }
            this.eventListeners[event].push(callback);
            
            return this;
        },
        
        /**
         * EMIT - Client sends event to server
         * Signature: emit(event, data, callback)
         * 
         * Events game uses:
         *   'verify'           → client sends credentials, expects {ret:0} callback
         *   'user.enterGame'   → client requests player data, expects response callback  
         *   'handler.process'  → generic action wrapper, data has type+action
         */
        emit: function(event, data, callback) {
            var self = this;
            
            LOG.socket('─────────────────────────────────────────');
            LOG.socket('EMIT() Event: ' + event);
            if (data !== undefined) LOG.data('EMIT() Data:', data);
            LOG.data('EMIT() Has callback:', !!callback);
            
            // ========================================
            // Handle 'verify' event
            // Client sends: socket.emit('verify', {loginToken, userId, ...}, callback)
            // Server responds: callback({ret: 0})
            // ========================================
            if (event === 'verify') {
                LOG.success('🔑 Verify received - authenticating...');
                if (callback) {
                    setTimeout(function() {
                        LOG.success('🔑 Verify success → calling callback');
                        callback({ ret: 0 });
                    }, 50);
                }
                return;
            }
            
            // ========================================
            // Handle 'handler.process' event  
            // Client sends: socket.emit('handler.process', {type, action, ...}, callback)
            // This is the standard request format used by login-server
            // ========================================
            if (event === 'handler.process') {
                LOG.info('Processing handler.process request...');
                if (data && data.action) {
                    self._handleRequest(data, callback);
                } else {
                    LOG.warn('handler.process missing data.action');
                    if (callback) callback(buildResponse({}));
                }
                return;
            }
            
            // ========================================
            // Handle dot-notation events like 'user.enterGame', 'hero.autoLevelUp'
            // Client may send: socket.emit('user.enterGame', data, callback)
            // ========================================
            if (event && event.indexOf('.') !== -1) {
                var parts = event.split('.');
                var type = parts[0];
                var method = parts.slice(1).join('.');
                
                LOG.info('Processing request: ' + type + '.' + method);
                
                var request = data || {};
                request.type = type;
                request.action = method;
                
                self._processAction(request, callback);
                return;
            }
            
            // ========================================
            // Fallback for unknown events
            // ========================================
            LOG.warn('Unknown emit event: ' + event);
            if (callback) {
                callback({ ret: 0 });
            }
        },
        
        /**
         * _handleRequest - Process handler.process format
         * Checks: window.MAIN_SERVER_HANDLERS > local RequestHandlers > default
         * 
         * Log rules:
         *   - Handler NOT found  → 1 line: "no handler: type.action"  (from default handler)
         *   - Handler found OK   → detail: action + response keys
         *   - Handler found ERR  → 1 line: "ERR type.action: error"
         */
        _handleRequest: function(data, callback) {
            var self = this;
            var action = data.action || '';
            var type = data.type || '';
            var fullAction = type + '.' + action;
            
            // 1. External handler files
            var handler = null;
            var externalHandlers = window.MAIN_SERVER_HANDLERS || {};
            if (externalHandlers[fullAction]) {
                handler = externalHandlers[fullAction];
            }
            // 2. Local RequestHandlers
            if (!handler && RequestHandlers[action]) {
                handler = RequestHandlers[action];
            }
            // 3. Default (1 line warning)
            if (!handler) {
                handler = RequestHandlers['default'];
            }
            
            var isDefault = (handler === RequestHandlers['default']);
            var isExternal = !!externalHandlers[fullAction];
            var playerData = loadOrCreatePlayerData(data);
            
            setTimeout(function() {
                try {
                    var response = handler(data, playerData);
                    if (isExternal) {
                        response = buildResponse(response);
                    }
                    
                    // Handler found & executed → show detail
                    if (!isDefault) {
                        var respData = response.data;
                        var respKeys = '';
                        if (typeof respData === 'string') {
                            try {
                                var parsed = JSON.parse(respData);
                                respKeys = Object.keys(parsed).join(', ');
                            } catch(e) {
                                respKeys = '(raw string)';
                            }
                        } else if (respData && typeof respData === 'object') {
                            respKeys = Object.keys(respData).join(', ');
                        }
                        LOG.success(fullAction + ' [' + respKeys + ']');
                    }
                    
                    if (callback) {
                        callback(response);
                    }
                } catch (e) {
                    LOG.error('ERR ' + fullAction + ':', e);
                    if (e instanceof Error) {
                        console.error('[MOCK-SERVER] Original error detail:', e.message);
                        console.error('[MOCK-SERVER] Stack:', e.stack);
                    }
                    if (callback) {
                        try {
                            callback(buildResponse({}));
                        } catch (e2) {
                            console.warn('[MOCK-SERVER] Fallback callback also failed (suppressed):', e2.message);
                        }
                    }
                }
            }, 10);
        },
        
        /**
         * _processAction - same logic as _handleRequest
         */
        _processAction: function(request, callback) {
            var type = request.type || '';
            var method = request.action || '';
            var fullAction = type + '.' + method;
            
            var handler = null;
            var externalHandlers = window.MAIN_SERVER_HANDLERS || {};
            if (externalHandlers[fullAction]) {
                handler = externalHandlers[fullAction];
            }
            if (!handler && RequestHandlers[method]) {
                handler = RequestHandlers[method];
            }
            if (!handler) {
                handler = RequestHandlers['default'];
            }
            
            var isDefault = (handler === RequestHandlers['default']);
            var isExternal = !!externalHandlers[fullAction];
            var playerData = loadOrCreatePlayerData(request);
            
            setTimeout(function() {
                try {
                    var response = handler(request, playerData);
                    if (isExternal) {
                        response = buildResponse(response);
                    }
                    
                    if (!isDefault) {
                        var respData = response.data;
                        var respKeys = '';
                        if (typeof respData === 'string') {
                            try {
                                var parsed = JSON.parse(respData);
                                respKeys = Object.keys(parsed).join(', ');
                            } catch(e) {
                                respKeys = '(raw string)';
                            }
                        } else if (respData && typeof respData === 'object') {
                            respKeys = Object.keys(respData).join(', ');
                        }
                        LOG.success(fullAction + ' [' + respKeys + ']');
                    }
                    
                    if (callback) {
                        callback(response);
                    }
                } catch (e) {
                    LOG.error('ERR ' + fullAction + ':', e);
                    if (e instanceof Error) {
                        console.error('[MOCK-SERVER] Original error detail:', e.message);
                        console.error('[MOCK-SERVER] Stack:', e.stack);
                    }
                    if (callback) {
                        try {
                            callback(buildResponse({}));
                        } catch (e2) {
                            console.warn('[MOCK-SERVER] Fallback callback also failed (suppressed):', e2.message);
                        }
                    }
                }
            }, 10);
        },
        
        _trigger: function(event, data) {
            LOG.socket('TRIGGER() Event: ' + event);
            
            if (this.eventListeners[event]) {
                for (var i = 0; i < this.eventListeners[event].length; i++) {
                    try {
                        this.eventListeners[event][i](data);
                    } catch (e) {
                        LOG.error('Error in listener for ' + event + ':', e);
                    }
                }
            }
        },
        
        connect: function() {
            LOG.socket('connect() called - already connected');
        },
        
        disconnect: function() {
            LOG.socket('disconnect() called');
            this.connected = false;
            this.disconnected = true;
            this._trigger('disconnect');
        },
        
        destroy: function() {
            LOG.socket('destroy() called');
            this.connected = false;
            this.disconnected = true;
            this.eventListeners = {};
        },
        
        // Additional socket.io methods the game might call
        off: function(event, callback) {
            if (event && this.eventListeners[event]) {
                if (callback) {
                    var idx = this.eventListeners[event].indexOf(callback);
                    if (idx !== -1) this.eventListeners[event].splice(idx, 1);
                } else {
                    this.eventListeners[event] = [];
                }
            }
        },
        
        removeAllListeners: function(event) {
            if (event) {
                this.eventListeners[event] = [];
            } else {
                this.eventListeners = {};
            }
        }
    };

    // ========================================================
    // 7. SERVER CLASS
    // ========================================================
    function MainServer(options) {
        var self = this;
        
        self.options = options || {};
        self.url = self.options.url || CONFIG.mainServerUrl;
        self.handlers = RequestHandlers;
        
        LOG.title('🎮 MAIN SERVER INITIALIZED');
        LOG.info('Server URL:', self.url);
        LOG.info('Server ID:', CONFIG.serverId);
        LOG.info('Server Name:', CONFIG.serverName);
    }
    
    MainServer.prototype = {
        
        connect: function() {
            LOG.title('CONNECTING TO MAIN SERVER');
            return new MockSocket(this.url);
        },
        
        getHandler: function(action) {
            var parts = action.split('.');
            var method = parts.length > 1 ? parts[1] : parts[0];
            return this.handlers[method] || this.handlers['default'];
        },
        
        request: function(action, data, callback) {
            LOG.data('Direct request: ' + action, data);
            
            var parts = action.split('.');
            var type = parts[0] || '';
            var method = parts.slice(1).join('.') || '';
            
            var request = data || {};
            request.type = type;
            request.action = method;
            
            var playerData = loadOrCreatePlayerData(request);
            var handler = this.getHandler(action);
            
            try {
                var response = handler(request, playerData);
                if (callback) {
                    callback(response);
                }
                return response;
            } catch (e) {
                LOG.error('Direct request error:', e);
                if (callback) {
                    callback(buildResponse({}));
                }
                return buildResponse({});
            }
        }
    };

    // ========================================================
    // 8. EXPORTS & REGISTRATION
    // ========================================================
    
    // Export as module if possible
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = { MainServer: MainServer, MockSocket: MockSocket };
    }
    
    // Register on window
    window.MainServer = MainServer;
    window.MockMainSocket = MockSocket;
    window.MainServerHandlers = RequestHandlers;
    window.MainServerConfig = CONFIG;
    window.MainServerLOG = LOG;
    
    // Auto-initialize
    window.LOCAL_MAIN_SERVER = new MainServer();
    
    LOG.title('🎮 MAIN SERVER READY');
    LOG.success('MainServer registered on window');
    LOG.success('Connect via: new MainServer().connect() or window.LOCAL_MAIN_SERVER.connect()');
    
    // ========================================================
    // 9. INTERCEPT io.connect() for MAIN SERVER (port 9998)
    // ========================================================
    // This intercepts socket.io connections to the main game server
    // and replaces them with our MockSocket.
    // 
    // IMPORTANT: login-server.js also intercepts io.connect() but 
    // only for port 9999 (login). Non-login URLs are passed through
    // to original io.connect. We intercept here for port 9998.
    // ========================================================
    function interceptMainServerSocket() {
        if (typeof window.io === 'undefined') {
            LOG.error('Socket.IO not found! Cannot intercept main server connections.');
            return;
        }
        
        var currentConnect = window.io.connect;
        
        if (!currentConnect) {
            LOG.error('io.connect not found!');
            return;
        }
        
        // Store the current io.connect (may be wrapped by login-server.js)
        var previousConnect = currentConnect;
        
        window.io.connect = function(url, options) {
            LOG.socket('═══════════════════════════════════════════════');
            LOG.socket('io.connect() intercepted by MAIN-SERVER');
            LOG.socket('URL:', url);
            LOG.socket('Options:', options);
            
            var isMainServer = false;
            
            // Check if this is main server URL (port 9998)
            if (url && (
                url.indexOf('9998') !== -1 ||
                url.indexOf(CONFIG.mainServerUrl) !== -1 ||
                url.indexOf('main') !== -1
            )) {
                isMainServer = true;
            }
            
            // Also check via SDK config
            if (!isMainServer && window.LOCAL_SDK && window.LOCAL_SDK.config) {
                if (url && url.indexOf(window.LOCAL_SDK.config.mainServer) !== -1) {
                    isMainServer = true;
                }
            }
            
            if (isMainServer) {
                LOG.success('✅ MAIN-SERVER DETECTED (port 9998) - Using MockSocket');
                LOG.socket('═══════════════════════════════════════════════');
                return new MockSocket(url);
            } else {
                LOG.info('⏩ Not main-server, passing through to previous handler');
                LOG.socket('═══════════════════════════════════════════════');
                return previousConnect.call(window.io, url, options);
            }
        };
        
        LOG.success('io.connect() interceptor for MAIN-SERVER installed!');
    }
    
    // ========================================================
    // 10. INITIALIZE
    // ========================================================
    function init() {
        LOG.title('🎮 MAIN SERVER v4.2.0 INITIALIZED');
        LOG.info('Main Server URL:', CONFIG.mainServerUrl);
        LOG.info('Server ID:', CONFIG.serverId);
        LOG.info('Server Name:', CONFIG.serverName);
        
        // Install io.connect interceptor
        interceptMainServerSocket();
        
        LOG.success('Main server interceptor ready for port 9998');
        LOG.info('💡 Will intercept io.connect() calls to ' + CONFIG.mainServerUrl);
    }
    
    // Start initialization
    if (typeof window.io !== 'undefined') {
        init();
    } else {
        var _checkInterval = setInterval(function() {
            if (typeof window.io !== 'undefined') {
                clearInterval(_checkInterval);
                init();
            }
        }, 50);
        
        setTimeout(function() {
            clearInterval(_checkInterval);
            if (typeof window.io === 'undefined') {
                LOG.error('Timeout waiting for Socket.IO to load!');
            }
        }, 10000);
    }

})(window);
