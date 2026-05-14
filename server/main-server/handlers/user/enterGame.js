/**
 * enterGame.js — Handler: user/enterGame
 *
 * Deep-traced from main.min.js UserDataParser.saveUserData (line ~5319)
 * Every field traced to its consumer function in the client.
 *
 * STRICT RULES: NO STUB, OVERRIDE, FORCE, BYPASS, DUMMY, ASUMSI
 * Every value traced to main.min.js logic or resource/json config.
 *
 * ═══════════════════════════════════════════════════════════════
 * TRACE MAP — 99 response fields → client consumer functions
 * ═══════════════════════════════════════════════════════════════
 *
 *   UserDataParser.setUserInfo         → e.user
 *   UserDataParser.setOnHook           → e.hangup + e.globalWarBuffTag/LastRank/Buff/BuffEndTime
 *   UserDataParser.setSummon           → e.summon
 *   UserDataParser.setBackpack         → e.totalProps._items + e.backpackLevel
 *   UserDataParser.setSign             → e.imprint._items
 *   UserDataParser.setEquip            → e.equip + e.weapon + e.genki (via EquipInfoManager.readByData)
 *   UserDataParser.setCounterpart      → e.dungeon._dungeons
 *   UserDataParser.setTeamTechnology   → e.userGuild._tech
 *   UserDataParser.setTeamTraining     → e.teamTraining
 *   SuperSkillSingleton.initSuperSkill → e.superSkill
 *   HerosManager.setSkinData           → e.heroSkin
 *   HerosManager.readByData            → e.heros
 *   SummonSingleton.setSummomLogList   → e.summonLog
 *   UserDataParser.setTeam             → e.userGuild + e.userGuildPub + e.guildLevel + e.guildTreasureMatchRet
 *   UserDataParser.setMainTask         → e.curMainTask
 *   UserDataParser.setSignIn           → e.checkin
 *   MailInfoManager.getBulletinBrief   → (no data needed)
 *   WelfareInfoManager.channelSpecial  → e.channelSpecial
 *   AllRefreshCount.initData           → e.scheduleInfo
 *   ItemsCommonSingleton.initDragonBallEquip → e.dragonEquiped
 *   WelfareInfoManager.setVipLogList   → e.vipLog
 *   WelfareInfoManager.setMonthCardLogList → e.cardLog
 *   GuideInfoManager.setGuideInfo      → e.guide
 *   TeamInfoManager.setTeamName        → e.guildName
 *   UserClickSingleton.setClickSys     → e.clickSystem._clickSys
 *   WelfareInfoManager (gift sub-set)  → e.giftInfo
 *   WelfareInfoManager.setMonthCardInfo → e.monthCard
 *   WelfareInfoManager.setRechargeInfo → e.recharge
 *   TimesInfoSingleton.initData        → e.timesInfo
 *   UserInfoSingleton.userDownloadModel → e.userDownloadReward
 *   YouTuberRecruitModel               → e.YouTuberRecruit + e.userYouTuberRecruit
 *   TimeLeapSingleton.initData         → e.timeMachine
 *   AltarInfoManger.setArenaTeamInfo   → e._arenaTeam
 *   AltarInfoManger.setArenaSuperInfo  → e._arenaSuper
 *   TimeLimitGiftBagManager            → e.timeBonusInfo
 *   BulletinSingleton.setBulletInfo    → e.onlineBulletin
 *   TowerDataManager.setKarinTime      → e.karinStartTime + e.karinEndTime
 *   UserInfoSingleton.serverVersion    → e.serverVersion
 *   UserInfoSingleton.setServerOpenDate → e.serverOpenDate
 *   UserInfoSingleton.firstLoginSetMyTeam → e.lastTeam._lastTeamInfo
 *   UserInfoSingleton.heroImageVersion → e.heroImageVersion
 *   UserInfoSingleton.superImageVersion → e.superImageVersion
 *   PadipataInfoManager.setPadipataModel → e.training
 *   GlobalWarManager.setWarLoginInfo   → e.warInfo
 *   GlobalWarManager.setUserWarModel   → e.userWar
 *   UserInfoSingleton.setServerId      → e.serverId
 *   HeadEffectModel.deserialize        → e.headEffect
 *   TeamInfoManager.UserBallWar        → e.userBallWar
 *   TeamInfoManager.BallWarState       → e.ballWarState
 *   TeamInfoManager.setBallWarBrodecast → e.ballBroadcast
 *   GuildBallWarInfo.deserialize       → e.ballWarInfo
 *   TeamInfoManager.setActivePoints    → e.guildActivePoints
 *   WelfareInfoManager.enableShowQQ    → e.enableShowQQ
 *   WelfareInfoManager.showQQVip       → e.showQQVip
 *   WelfareInfoManager.showQQ          → e.showQQ
 *   WelfareInfoManager.showQQImg1/2    → e.showQQImg1/2
 *   WelfareInfoManager.showQQUrl       → e.showQQUrl
 *   WelfareInfoManager.setHideHeroes   → e.hideHeroes
 *   ExpeditionManager.setExpeditionModel → e.expedition
 *   SpaceTrialManager.setSpaceTrialModel → e.timeTrial + e.timeTrialNextOpenTime
 *   GetBackReourceManager.setRetrieveModel → e.retrieve
 *   BattleMedalManager.setBattleMedal  → e.battleMedal
 *   ShopInfoManager.shopNewHero        → e.shopNewHeroes
 *   TeamworkManager.setLoginInfo       → e.teamDungeon
 *   TeamworkManager.teamServerHttpUrl  → e.teamServerHttpUrl
 *   TeamworkManager.teamDungeonOpenTime → e.teamDungeonOpenTime
 *   TeamworkManager.teamDungeonTask    → e.teamDungeonTask
 *   TeamworkManager.SetTeamDungeonBroadcast → e.teamDungeonSplBcst/NormBcst
 *   TeamworkManager.setTeamDungeonHideInfo → e.teamDungeonHideInfo
 *   TrialManager.setTempleLess         → e.templeLess
 *   TeamworkManager.teamDungeonInvitedFriends → e.teamDungeonInvitedFriends
 *   ts.loginInfo.serverItem.dungeonurl → e.myTeamServerSocketUrl
 *   EquipInfoManager.saveGemStone      → e.gemstone
 *   UserInfoSingleton.setQuestData     → e.questionnaires
 *   HerosManager.setResonanceModel     → e.resonance
 *   TopBattleManager.setTopBattleLoginInfo → e.userTopBattle + e.topBattleInfo
 *   HerosManager.saveLoginFastTeam     → e.fastTeam
 *   BroadcastSingleton.setBlacklistPlayerInfo → e.blacklist
 *   BroadcastSingleton.setUserBidden   → e.forbiddenChat
 *   TrialManager.setGravityTrialInfo   → e.gravity
 *   LittleGameManager.saveData         → e.littleGame
 *   ts.currency                        → e.currency
 *   e.newUser                          → newUser flag
 *   e.broadcastRecord                  → chatJoinRecord
 *
 * ═══════════════════════════════════════════════════════════════
 * BUG FIX LOG
 * ═══════════════════════════════════════════════════════════════
 *
 * [FIX-001] _award field missing from training object
 *   TRACE: main.min.js L121387 — PadipataInfoManager.setPadipataModel
 *     t._padipataInfo._award = e   (assigns ENTIRE param, not e._award)
 *   CAUSE: Client expects _award to exist. Without it, client reads undefined.
 *     If _award is missing → client side _award = entire training object (client bug)
 *     If training._award exists in stored data → circular reference on re-login
 *   FIX: Add _award: null for new users (no training reward yet)
 *   EVIDENCE: L190426 — resetTtemsCallBack(e.trainingModel._award) expects award format
 *
 * [FIX-002] updateExistingUser mutates DB cache directly (no deep clone)
 *   CAUSE: db.getUser() returns reference to _cache Map value
 *     Mutating returned object = mutating cache = data corruption risk
 *   FIX: Deep clone via JSON.parse(JSON.stringify()) before modification
 *
 * [FIX-003] Circular reference safety before JSON.stringify
 *   CAUSE: Client bug (L121387) sets _award = entire training object
 *     If server stores + re-sends data with _award, nesting grows each login
 *     Eventually creates circular: training._award._award._award... = training
 *   FIX: Strip self-referencing _award before save and before response
 *
 * [FIX-004] Super detail logging — every step, every field, every value
 *   CAUSE: Previous logs too vague, cannot debug silent errors
 *   FIX: Step-by-step logging with field counts, data sizes, validation checks
 *
 * [FIX-005] imprint._items, weapon._items, genki._items — ARRAY vs OBJECT
 *   TRACE: L114925 (imprint), L130938 (weapon), L132158 (genki) — all use for(var o in n)
 *   CAUSE: for...in iterates OBJECT keys, not array indices.
 *     Server sent [] (empty array) → for...in on array iterates index strings "0","1"...
 *     For existing users with items stored as array indices → WRONG key format on client
 *   FIX: Changed from [] to {} for all three _items containers
 *
 * [FIX-006] hero._heroStar wrong value for new starter hero
 *   TRACE: L134098 — u[d].star == o.heroStar lookup in wakeup config
 *   CAUSE: heroConfig.wakeupMax is a max LEVEL value, NOT a star count.
 *     Client uses _heroStar as star number to match against config entries.
 *     Sending wakeupMax (e.g. 80) → no config match → wrong level cap
 *   FIX: _heroStar = 0 (new hero starts at 0 stars, always)
 *
 * [FIX-007] Dead fields removal — client never reads these (0 refs in 244K+ lines)
 *   TRACE: Full-text search of main.min(unminfy).js for each field name
 *   REMOVED:
 *     summon._logicInfo, summon._haveCommonGuide, summon._haveSuperGuide, summon._firstDiamond10
 *     hero._resonanceType, hero._version (in hero context)
 *     training._enemyHp
 *     scheduleInfo._commentedHeroes
 *   NOTE: These may be needed for server-side logic — store in DB separately if needed
 *
 * [FIX-008] lastTeam[9]._team hero pre-placed — tutorial STUCK at guide 2106
 *   TRACE: main.min.js L96167 — firstLoginSetMyTeam(e)
 *     for(var l in i) { u._heroId = i[l]._heroId; u._position = i[l]._position; a.push(u); }
 *     → iterates _team object keys → creates BattleTeamItem for each → pushes to array
 *     If _team has hero entries → client creates team with heroes pre-placed
 *   CAUSE: Server sent {0: {_heroId, _position: 0}} in lastTeam[9]._team for new user
 *     Client L104862: tutorial sets HANGUP team via setMyTeamByType AFTER battle
 *     But if team already has heroes → tutorial flow breaks at guide 2106
 *   FIX: Send _team: {} (empty object) for new users
 *     Client iterates {} → pushes nothing → o._team = [] → tutorial teaches placement correctly
 *   EVIDENCE: Critical Fields Audit caught this: lastTeam[9]._team = {1} HERO PRE-PLACED!
 */

// ─── Currency/Attribute IDs — main.min.js L82352-82360 ───
const DIAMONDID = 101;
const GOLDID = 102;
const PLAYEREXPERIENCEID = 103;
const PLAYERLEVELID = 104;
const PLAYERVIPEXPERIENCEID = 105;
const PLAYERVIPLEVELID = 106;
const PLAYERVIPEXPALLID = 107;
const SOULCOINID = 111;
const ARENACOINID = 112;
const SNAKECOINID = 113;
const TEAMCOINID = 114;
const HEROPIECEID = 131;

// ─── Dragon Ball IDs — main.min.js L118500-118503 ───
const ONESTARBALLID = 151;
const TWOSTARBALLID = 152;
const THREESTARBALLID = 153;
const FOURSTARBALLID = 154;
const FIVESTARBALLID = 155;
const SIXSTARBALLID = 156;
const SEVENSTARBALLID = 157;

// ─── Dungeon Types — main.min.js DUNGEON_TYPE enum ───
// DT_NULL=0, EXP=1, EVOLVE=2, ENERGY=3(skip), EQUIP=4, SINGA=5, SINGB=6, METAL=7, Z_STONE=8
const DUNGEON_TYPES = {
    EXP: 1, EVOLVE: 2, EQUIP: 4, SINGA: 5, SINGB: 6, METAL: 7, Z_STONE: 8
};

// ═══════════════════════════════════════════════════════════════
// CIRCULAR REFERENCE SAFETY
// ═══════════════════════════════════════════════════════════════

/**
 * Strip dangerous circular references from userData before JSON.stringify.
 *
 * Client bug (main.min.js L121387): setPadipataModel sets _award = entire param.
 * If stored data contains _award that references parent, JSON.stringify crashes.
 *
 * This function walks known danger zones and removes self-referencing properties.
 *
 * @param {object} userData - The user data object to sanitize
 * @param {object} logger - Logger instance for reporting
 * @returns {number} Number of circular references removed
 */
function stripCircularReferences(userData, logger) {
    let removed = 0;

    // ─── Danger Zone 1: training._award ───
    // Client L121387: t._padipataInfo._award = e (entire training param)
    // If training._award === training itself, or training._award contains training → STRIP
    if (userData.training) {
        if (userData.training._award !== undefined && userData.training._award !== null) {
            // Check if _award references the training object itself
            if (userData.training._award === userData.training) {
                logger.log('WARN', 'ENTER', '[CIRCULAR-SAFETY] training._award === training (self-ref) → DELETED');
                delete userData.training._award;
                removed++;
            }
            // Check if _award contains a nested _award (cascading nesting)
            else if (userData.training._award && typeof userData.training._award === 'object') {
                let depth = 0;
                let ptr = userData.training._award;
                while (ptr && ptr._award && typeof ptr._award === 'object') {
                    depth++;
                    if (depth > 3) {
                        logger.log('WARN', 'ENTER', `[CIRCULAR-SAFETY] training._award nesting depth=${depth} → RESETTING _award to null`);
                        userData.training._award = null;
                        removed++;
                        break;
                    }
                    ptr = ptr._award;
                }
            }
        }
    }

    return removed;
}

/**
 * Deep clone an object using JSON round-trip.
 * Throws with clear error if object contains circular references.
 *
 * @param {object} obj - Object to clone
 * @param {string} label - Label for error messages
 * @param {object} logger - Logger instance
 * @returns {object} Deep-cloned object
 */
function deepClone(obj, label, logger) {
    try {
        return JSON.parse(JSON.stringify(obj));
    } catch (err) {
        logger.log('ERROR', 'ENTER', `[DEEP-CLONE] Failed to clone "${label}": ${err.message}`);
        // Attempt to identify which field causes the circular reference
        if (obj && typeof obj === 'object') {
            const keys = Object.keys(obj);
            for (const key of keys) {
                try {
                    JSON.stringify(obj[key]);
                } catch (innerErr) {
                    logger.log('ERROR', 'ENTER', `[DEEP-CLONE] Circular ref found in field: "${key}" → ${innerErr.message}`);
                }
            }
        }
        throw err;
    }
}

/**
 * Validate and log the structure of userData before it's sent to client.
 * Catches missing required fields and logs warnings.
 *
 * @param {object} userData - The user data object to validate
 * @param {boolean} isNewUser - Whether this is a new user
 * @param {object} logger - Logger instance
 */
function validateUserData(userData, isNewUser, logger) {
    // ─── Check required top-level keys that client ALWAYS reads ───
    const requiredKeys = [
        'user', 'heros', 'hangup', 'totalProps', 'backpackLevel',
        'imprint', 'weapon', 'summon', 'dungeon', 'equip',
        'scheduleInfo', 'timesInfo', 'serverVersion', 'serverId',
        'serverOpenDate', 'newUser', 'currency', 'lastTeam',
        'superSkill', 'giftInfo', 'guide', 'training'
    ];

    const missingKeys = requiredKeys.filter(k => userData[k] === undefined);
    if (missingKeys.length > 0) {
        logger.log('WARN', 'ENTER', `[VALIDATE] Missing required keys: ${missingKeys.join(', ')}`);
    }

    // ─── Check user._attribute._items has PLAYERLEVELID ───
    if (userData.user && userData.user._attribute && userData.user._attribute._items) {
        const items = userData.user._attribute._items;
        if (!items[PLAYERLEVELID]) {
            logger.log('WARN', 'ENTER', `[VALIDATE] user._attribute._items missing PLAYERLEVELID(${PLAYERLEVELID})`);
        }
        if (!items[DIAMONDID]) {
            logger.log('WARN', 'ENTER', `[VALIDATE] user._attribute._items missing DIAMONDID(${DIAMONDID})`);
        }
    } else {
        logger.log('WARN', 'ENTER', '[VALIDATE] user._attribute._items is MISSING');
    }

    // ─── Check training._award exists (FIX-001) ───
    if (userData.training) {
        if (!userData.training.hasOwnProperty('_award')) {
            logger.log('WARN', 'ENTER', '[VALIDATE] training._award is MISSING — client L121387 will assign _award=entire param');
        }
    }

    // ─── Check heros has at least 1 hero ───
    if (userData.heros && userData.heros._heros) {
        const heroCount = Object.keys(userData.heros._heros).length;
        if (heroCount === 0) {
            logger.log('WARN', 'ENTER', '[VALIDATE] heros._heros is EMPTY — new user must have starter hero');
        }
    }

    // ─── Summary ───
    const totalKeys = Object.keys(userData).length;
    logger.log('DEBUG', 'ENTER', `[VALIDATE] userData keys=${totalKeys} missing=${missingKeys.length} isNewUser=${isNewUser}`);
}

// ═══════════════════════════════════════════════════════════════
// MAIN HANDLER
// ═══════════════════════════════════════════════════════════════

/**
 * Main handler function
 * @param {object} request - { type:'user', action:'enterGame', loginToken, userId, serverId, version, language, gameVersion }
 * @param {object} ctx - Context with db, config, logger, etc.
 * @returns {object} Response envelope
 */
async function handleEnterGame(request, ctx) {
    const startTime = Date.now();
    const { loginToken, userId, serverId, version, language, gameVersion } = request;

    ctx.logger.log('INFO', 'ENTER', 'enterGame REQUEST RECEIVED');
    ctx.logger.details('request',
        ['userId', userId || 'MISSING'],
        ['serverId', String(serverId)],
        ['loginToken', loginToken ? loginToken.substring(0, 15) + '...' : 'MISSING'],
        ['gameVersion', gameVersion || '']
    );

    // ─── Step 1: Validate required fields ───
    let warningCount = 0;
    let errorCount = 0;
    ctx.logger.step(1, 10, 'Required fields check', 'running');
    if (!loginToken || !userId || serverId === undefined) {
        errorCount++;
        ctx.logger.errorBanner({
            module: 'ENTER',
            step: '01/10 Required Fields Check',
            message: 'Required fields MISSING — request rejected',
            impact: 'Cannot authenticate user — game cannot proceed',
            fix: 'Client must send loginToken + userId + serverId'
        });
        return ctx.buildErrorResponse(8);
    }
    ctx.logger.step(1, 10, 'Required fields check', 'pass', 'All present');

    // ─── Step 2: Validate loginToken via SDK-Server ───
    ctx.logger.step(2, 10, 'Token auth via SDK-Server', 'running');
    const tokenStart = Date.now();
    const tokenValid = await ctx.validateLoginToken(loginToken, userId);
    const tokenDuration = Date.now() - tokenStart;
    if (!tokenValid) {
        errorCount++;
        ctx.logger.errorBanner({
            module: 'ENTER',
            step: '02/10 Token Auth via SDK-Server',
            message: 'loginToken INVALID — authentication rejected',
            trace: 'SDK-Server API',
            impact: 'User cannot enter game — security block',
            fix: 'Return error code 37 to client'
        });
        ctx.logger.step(2, 10, 'Token auth via SDK-Server', 'fail', tokenDuration + 'ms ❌');
        return ctx.buildErrorResponse(37);
    }
    ctx.logger.step(2, 10, 'Token auth via SDK-Server', 'pass', tokenDuration + 'ms ✅');

    // ─── Step 3: Validate serverId ───
    ctx.logger.step(3, 10, 'ServerId validation', 'running');
    if (parseInt(serverId) !== ctx.config.serverId) {
        errorCount++;
        ctx.logger.errorBanner({
            module: 'ENTER',
            step: '03/10 ServerId Validation',
            message: 'serverId MISMATCH — got ' + serverId + ', want ' + ctx.config.serverId,
            impact: 'User connected to wrong server instance',
            fix: 'Return error code 4 to client'
        });
        ctx.logger.step(3, 10, 'ServerId validation', 'fail', 'MISMATCH ❌');
        return ctx.buildErrorResponse(4);
    }
    ctx.logger.step(3, 10, 'ServerId validation', 'pass', serverId + ' == ' + ctx.config.serverId + ' ✅');

    // ─── Step 4: Check new vs existing user ───
    const collectedWarnings = []; // v3.0: collect warnings for warningSection()
    ctx.logger.step(4, 10, 'User existence check', 'running');
    const existingData = ctx.db.getUser(userId);
    const isNewUser = !existingData;

    if (isNewUser) {
        ctx.logger.step(4, 10, 'User existence check', 'new', 'NEW USER 🌟');
    } else {
        const existingKeys = Object.keys(existingData).length;
        ctx.logger.step(4, 10, 'User existence check', 'pass', 'EXISTING USER (' + existingKeys + ' keys)');
        ctx.logger.log('DEBUG', 'ENTER', `[STEP-4] Existing data keys: ${Object.keys(existingData).join(', ')}`);
        // Check if stored training has _award (potential circular source)
        if (existingData.training && existingData.training._award !== undefined) {
            collectedWarnings.push({
                id: 'W001',
                message: 'training._award EXISTS in stored data — potential circular ref',
                got: 'type=' + typeof existingData.training._award,
                impact: 'Client bug L121387 may create nesting loop on re-login',
                fix: 'stripCircularReferences will sanitize before response'
            });
            warningCount++;
        }
    }

    // ─── Step 5: Build or load user data ───
    let userData;
    const buildStart = Date.now();
    if (isNewUser) {
        ctx.logger.step(5, 10, 'Build user data', 'running');
        userData = buildNewUserData(userId, request, ctx);
        const buildDuration = Date.now() - buildStart;
        ctx.logger.step(5, 10, 'Build user data', 'ok', Object.keys(userData).length + ' keys (' + buildDuration + 'ms)');
    } else {
        ctx.logger.step(5, 10, 'Build user data', 'running');
        userData = updateExistingUser(existingData, request, ctx);
        const buildDuration = Date.now() - buildStart;
        ctx.logger.step(5, 10, 'Build user data', 'pass', Object.keys(userData).length + ' keys (' + buildDuration + 'ms)');
    }

    // ─── Step 6: Circular reference safety check ───
    ctx.logger.step(6, 10, 'Circular reference check', 'running');
    const circRemoved = stripCircularReferences(userData, ctx.logger);
    if (circRemoved > 0) {
        warningCount += circRemoved;
        ctx.logger.warnCallout(circRemoved + ' circular reference(s) DETECTED and REMOVED', {
            source: 'main.min.js L121387 — PadipataInfoManager.setPadipataModel',
            action: 'Stripped self-referencing _award fields (removed=' + circRemoved + ')',
            reason: 'Client bug: _award = entire training object → creates nesting loop on re-login',
            module: 'CIRCULAR'
        });
        ctx.logger.step(6, 10, 'Circular reference check', 'warn', circRemoved + ' circular ref(s) removed ⚠️');
    } else {
        ctx.logger.step(6, 10, 'Circular reference check', 'pass', '0 circular refs ✅');
    }

    // ─── Step 7: Validate userData structure + Critical Fields Audit ───
    ctx.logger.step(7, 10, 'Structure validation', 'running');
    validateUserData(userData, isNewUser, ctx.logger);

    // v3.0: Critical Fields Audit — ALWAYS shows regardless of LOG_LEVEL
    const auditFields = [];
    if (isNewUser && userData.lastTeam && userData.lastTeam._lastTeamInfo && userData.lastTeam._lastTeamInfo[9]) {
        const teamKeys = Object.keys(userData.lastTeam._lastTeamInfo[9]._team || {}).length;
        auditFields.push({ name: 'lastTeam[9]._team', value: '{' + teamKeys + '}', status: teamKeys === 0 ? 'ok' : 'fail', detail: teamKeys === 0 ? 'EMPTY — tutorial safe (guide 2106)' : 'HERO PRE-PLACED! → tutorial STUCK' });
    }
    const hasAward = userData.training && userData.training.hasOwnProperty('_award');
    auditFields.push({ name: 'training._award', value: hasAward ? String(userData.training._award === null ? 'null' : 'object') : 'MISSING', status: hasAward ? 'ok' : 'fail', detail: hasAward ? 'present — FIX-001 safe' : 'MISSING → client L121387 assigns _award=entire param' });
    const hasLevel = !!(userData.user && userData.user._attribute && userData.user._attribute._items && userData.user._attribute._items[PLAYERLEVELID]);
    auditFields.push({ name: 'user._attribute._items[' + PLAYERLEVELID + ']', value: hasLevel ? 'present' : 'MISSING', status: hasLevel ? 'ok' : 'fail', detail: hasLevel ? 'Level=' + userData.user._attribute._items[PLAYERLEVELID]._num : 'NO LEVEL → client cannot render UI' });
    const imprintOk = userData.imprint && userData.imprint._items && !Array.isArray(userData.imprint._items);
    auditFields.push({ name: 'imprint._items', value: imprintOk ? 'Object{}' : 'MISSING', status: imprintOk ? 'ok' : 'fail', detail: 'FIX-005: client L114925 uses for...in → needs Object' });
    const weaponOk = userData.weapon && userData.weapon._items && !Array.isArray(userData.weapon._items);
    auditFields.push({ name: 'weapon._items', value: weaponOk ? 'Object{}' : 'MISSING', status: weaponOk ? 'ok' : 'fail', detail: 'FIX-005: client L130938 uses for...in → needs Object' });
    const genkiOk = userData.genki && userData.genki._items && !Array.isArray(userData.genki._items);
    auditFields.push({ name: 'genki._items', value: genkiOk ? 'Object{}' : 'MISSING', status: genkiOk ? 'ok' : 'fail', detail: 'FIX-005: client L132158 uses for...in → needs Object' });
    const criticalStats = ctx.logger.criticalFields(auditFields);
    if (criticalStats.failed > 0) errorCount += criticalStats.failed;
    if (criticalStats.warned > 0) warningCount += criticalStats.warned;
    ctx.logger.step(7, 10, 'Structure validation', criticalStats.failed > 0 ? 'warn' : 'pass', Object.keys(userData).length + ' keys audited' + (criticalStats.warned > 0 ? ' (' + criticalStats.warned + ' warnings)' : ''));

    // ─── Warning Section — display all collected warnings ───
    if (collectedWarnings.length > 0) {
        ctx.logger.warningSection(collectedWarnings);
    }

    // ─── Step 8: Verify JSON.stringify works BEFORE saving ───
    ctx.logger.step(8, 10, 'JSON serialization test', 'running');
    let jsonSize = 0;
    try {
        const jsonStr = JSON.stringify(userData);
        jsonSize = jsonStr.length;
        ctx.logger.step(8, 10, 'JSON serialization test', 'pass', 'OK (' + jsonSize.toLocaleString() + ' bytes)');
    } catch (err) {
        errorCount++;
        const badFields = [];
        const keys = Object.keys(userData);
        for (const key of keys) { try { JSON.stringify(userData[key]); } catch (e) { badFields.push(key); } }
        ctx.logger.errorBanner({
            module: 'ENTER', step: '08/10 JSON Serialization Test',
            message: 'JSON.stringify FAILED — circular reference in ' + badFields.length + ' field(s)',
            trace: 'stripCircularReferences missed something',
            impact: 'Response CANNOT be sent — client receives nothing',
            fix: badFields.length > 0 ? 'Check fields: ' + badFields.join(', ') : 'Unknown field',
            err: err
        });
        ctx.logger.step(8, 10, 'JSON serialization test', 'fail', err.message);
        return ctx.buildErrorResponse(1);
    }

    // ─── Step 9: Save user data ───
    ctx.logger.step(9, 10, 'Database save', 'running');
    const saveStart = Date.now();
    ctx.db.saveUser(userId, userData);
    ctx.logger.step(9, 10, 'Database save', 'pass', (Date.now() - saveStart) + 'ms 💾');

    // ─── Step 10: Build response ───
    ctx.logger.step(10, 10, 'Response build', 'running');
    let response;
    try {
        response = ctx.buildDataResponse(0, userData);
    } catch (err) {
        errorCount++;
        ctx.logger.errorBanner({
            module: 'ENTER', step: '10/10 Response Build',
            message: 'buildDataResponse FAILED: ' + err.message,
            impact: 'User data is valid but response serialization failed',
            fix: 'Return error code 1 to client', err: err
        });
        ctx.logger.step(10, 10, 'Response build', 'fail', err.message);
        return ctx.buildErrorResponse(1);
    }
    ctx.logger.step(10, 10, 'Response build', 'pass', 'OK 📤');

    // ─── Final Summary — v3.0 Summary Card ───
    const totalDuration = Date.now() - startTime;
    const keyCount = Object.keys(userData).length;
    const dataBytes = typeof response.data === 'string' ? response.data.length : 0;
    const heroCount = userData.heros && userData.heros._heros ? Object.keys(userData.heros._heros).length : 0;
    const diamondCount = userData.user && userData.user._attribute && userData.user._attribute._items && userData.user._attribute._items[DIAMONDID] ? (userData.user._attribute._items[DIAMONDID]._num || 0) : 0;
    const userLevel = userData.user && userData.user._attribute && userData.user._attribute._items && userData.user._attribute._items[PLAYERLEVELID] ? (userData.user._attribute._items[PLAYERLEVELID]._num || 0) : 0;

    ctx.logger.summaryCard({
        title: 'ENTER GAME COMPLETE',
        userId: userId,
        userType: isNewUser ? 'New User' : 'Returning User',
        fields: keyCount,
        heroes: heroCount,
        diamond: diamondCount,
        level: userLevel,
        jsonSize: jsonSize,
        respSize: dataBytes,
        compressed: response.compress,
        duration: totalDuration,
        critical: criticalStats,
        warnings: warningCount,
        errors: errorCount
    });

    return response;
}

// ═══════════════════════════════════════════════════════════════
// BUILD NEW USER DATA
// Deep-traced from main.min.js saveUserData + all consumer functions
// ═══════════════════════════════════════════════════════════════
function buildNewUserData(userId, request, ctx) {
    const now = Date.now();
    const config = ctx.config;

    // ─── Load resource JSONs ───
    const constant = (ctx.constantJson && ctx.constantJson['1']) ? ctx.constantJson['1'] : {};
    const heroRes = ctx.heroJson || {};
    const summonRes = ctx.summonJson || {};

    ctx.logger.log('DEBUG', 'ENTER', '[BUILD] Resource JSONs loaded');
    ctx.logger.details('resources',
        ['constantKeys', String(Object.keys(constant).length)],
        ['heroEntries', String(Object.keys(heroRes).length)],
        ['summonPools', String(Object.keys(summonRes).length)]
    );

    // ─── Starter hero config ───
    // Traced: constant.json → startHero="1205", startHeroLevel="3"
    const startHero = constant.startHero || '1205';
    const startHeroLevel = parseInt(constant.startHeroLevel) || 3;
    const heroId = ctx.uuidv4();
    const heroConfig = heroRes[startHero] || {};

    ctx.logger.log('DEBUG', 'ENTER', '[BUILD] Starter hero config');
    ctx.logger.details('hero',
        ['startHero', startHero],
        ['startHeroLevel', String(startHeroLevel)],
        ['heroInstanceId', heroId.substring(0, 12) + '...'],
        ['heroConfigFound', String(Object.keys(heroConfig).length > 0)],
        ['heroName', heroConfig.name || 'UNKNOWN']
    );

    // ─── Currency defaults from constant.json ───
    // Traced: constant.json → startDiamond=0, startGold=0, startUserExp=0, startUserLevel=1
    const startDiamond = parseInt(constant.startDiamond) || 0;
    const startGold = parseInt(constant.startGold) || 0;
    const startUserExp = parseInt(constant.startUserExp) || 0;
    const startUserLevel = parseInt(constant.startUserLevel) || 1;

    ctx.logger.log('DEBUG', 'ENTER', '[BUILD] Currency defaults from constant.json');
    ctx.logger.details('currency',
        ['startDiamond', String(startDiamond)],
        ['startGold', String(startGold)],
        ['startUserExp', String(startUserExp)],
        ['startUserLevel', String(startUserLevel)]
    );

    // ─── Dungeon times — keyed by DUNGEON_TYPE number string ───
    // Traced: CounterpartSingleton.setCounterPartTime — iterates e._dungeonTimes with Number(n) == DUNGEON_TYPE
    // ENERGY (3) is ALWAYS SKIPPED by client — do NOT include it
    // Traced: constant.json → expDungeonTimes=2, evolveDungeonTimes=2, equipDungeonTimes=2, signDungeonTimes=2, metalDungeonTimes=2, zStoneDungeonTimes=2
    const dungeonTimes = {};
    const dungeonBuyTimes = {};
    if (constant.expDungeonTimes !== undefined) { dungeonTimes['1'] = constant.expDungeonTimes; dungeonBuyTimes['1'] = 0; }
    if (constant.evolveDungeonTimes !== undefined) { dungeonTimes['2'] = constant.evolveDungeonTimes; dungeonBuyTimes['2'] = 0; }
    if (constant.equipDungeonTimes !== undefined) { dungeonTimes['4'] = constant.equipDungeonTimes; dungeonBuyTimes['4'] = 0; }
    if (constant.signDungeonTimes !== undefined) { dungeonTimes['5'] = constant.signDungeonTimes; dungeonBuyTimes['5'] = 0; }
    if (constant.signDungeonTimes !== undefined) { dungeonTimes['6'] = constant.signDungeonTimes; dungeonBuyTimes['6'] = 0; }
    if (constant.metalDungeonTimes !== undefined) { dungeonTimes['7'] = constant.metalDungeonTimes; dungeonBuyTimes['7'] = 0; }
    if (constant.zStoneDungeonTimes !== undefined) { dungeonTimes['8'] = constant.zStoneDungeonTimes; dungeonBuyTimes['8'] = 0; }

    ctx.logger.log('DEBUG', 'ENTER', `[BUILD] Dungeon times: ${Object.keys(dungeonTimes).length} types configured`);
    ctx.logger.details('dungeonTimes',
        ['types', Object.keys(dungeonTimes).join(',')],
        ['values', Object.values(dungeonTimes).join(',')]
    );

    // ─── Build attribute items for user._attribute._items ───
    // Traced: UserDataParser.setBackpack → ItemsCommonSingleton.setItem(a, r) where a=n[o]._id, r=n[o]._num
    // Also: a==PLAYERLEVELID(104) → NewOpenSystemManager.setLastUserLevel(r)
    const attributeItems = {
        [DIAMONDID]: { _id: DIAMONDID, _num: startDiamond },
        [GOLDID]: { _id: GOLDID, _num: startGold },
        [PLAYEREXPERIENCEID]: { _id: PLAYEREXPERIENCEID, _num: startUserExp },
        [PLAYERLEVELID]: { _id: PLAYERLEVELID, _num: startUserLevel },
        [PLAYERVIPEXPERIENCEID]: { _id: PLAYERVIPEXPERIENCEID, _num: 0 },
        [PLAYERVIPLEVELID]: { _id: PLAYERVIPLEVELID, _num: 0 },
        [PLAYERVIPEXPALLID]: { _id: PLAYERVIPEXPALLID, _num: 0 },
        [SOULCOINID]: { _id: SOULCOINID, _num: 0 },
        [ARENACOINID]: { _id: ARENACOINID, _num: 0 },
        [SNAKECOINID]: { _id: SNAKECOINID, _num: 0 },
        [TEAMCOINID]: { _id: TEAMCOINID, _num: 0 }
    };

    ctx.logger.log('DEBUG', 'ENTER', `[BUILD] Attribute items: ${Object.keys(attributeItems).length} currency fields`);

    // ─── Build totalProps._items (same as attribute items for new user) ───
    // Traced: UserDataParser.setBackpack reads e.totalProps._items
    const totalPropsItems = {};
    for (const [id, item] of Object.entries(attributeItems)) {
        totalPropsItems[id] = { _id: item._id, _num: item._num };
    }

    // ─── Build hero object ───
    // Traced: HerosManager.readByData → SetHeroDataToModel
    const heroObj = buildStarterHero(heroId, startHero, startHeroLevel, heroConfig, now, constant);

    ctx.logger.log('DEBUG', 'ENTER', '[BUILD] Starter hero object built');
    ctx.logger.details('heroObj',
        ['_heroId', heroId.substring(0, 12) + '...'],
        ['_heroDisplayId', String(heroObj._heroDisplayId)],
        ['_level', String(heroObj._heroBaseAttr._level)],
        ['_heroStar', String(heroObj._heroStar)]
    );

    // ─── Summon defaults ───
    // Traced: UserDataParser.setSummon → SummonSingleton reads n._energy, n._wishList, n._wishVersion, n._canCommonFreeTime, n._canSuperFreeTime, n._summonTimes
    // Also: SummonSingleton.setSummomLogList reads e.summonLog
    // Initial energy MUST be 0 for new user.
    // summonRes['1'].summonEnergy (=10) is energy GAINED per SUPER pull, NOT initial energy.
    // Client display: this._energy + '/' + max (L95335)
    const summonEnergy = 0;
    const summonTimes = {};
    for (const [poolId, poolData] of Object.entries(summonRes)) {
        summonTimes[poolId] = 0;
    }

    ctx.logger.log('DEBUG', 'ENTER', `[BUILD] Summon config: energy=${summonEnergy} pools=${Object.keys(summonTimes).length}`);

    // ─── Dungeon _dungeons — keyed by DUNGEON_TYPE number ───
    // Traced: UserDataParser.setCounterpart → CounterpartSingleton.setCounterPart(n)
    //   reads e[n]._type, e[n]._curMaxLevel, e[n]._lastLevel
    // ENERGY (3) is ALWAYS SKIPPED
    const dungeonDict = {};
    for (const [name, type] of Object.entries(DUNGEON_TYPES)) {
        dungeonDict[String(type)] = { _type: type, _curMaxLevel: 0, _lastLevel: 0 };
    }

    // ═══════════════════════════════════════════════════════════
    // BUILD RESPONSE — ALL 99+ KEYS
    // ═══════════════════════════════════════════════════════════

    const result = {
        // ═══ 1. user — setUserInfo ═══
        // Traced: setUserInfo reads n._id, n._pwd, n._nickName, n._headImage, n._lastLoginTime, n._createTime,
        //   n._bulletinVersions, n._oriServerId, n._nickChangeTimes (optional), n._oldName, n._account,
        //   n._channelId, n._privilege, n._attribute, n._offlineTime, n._levelChangeTime, n._vipLevelVersion,
        //   n._os, n._oldUserBackTime, n._channelParam
        user: {
            _id: userId,
            _pwd: '',
            _nickName: 'New User' + userId.slice(-4),
            _headImage: constant.playerIcon || 'hero_icon_1205',
            _lastLoginTime: now,
            _createTime: now,
            _bulletinVersions: {},
            _oriServerId: parseInt(request.serverId) || config.serverId,
            _nickChangeTimes: 0,
            _oldName: '',
            _account: userId,
            _channelId: 'BSNative',
            _privilege: 0,
            _attribute: { _items: attributeItems },
            _offlineTime: 0,
            _levelChangeTime: now,
            _vipLevelVersion: '',
            _os: request.language || 'Android',
            _oldUserBackTime: 0,
            _channelParam: {}
        },

        // ═══ 2. heros — HerosManager.readByData ═══
        // Traced: readByData iterates e._heros with for(o in n), each hero → SetHeroDataToModel(a)
        // SetHeroDataToModel reads: _heroId, _heroDisplayId, _heroStar, _expeditionMaxLevel, _heroTag,
        //   _fragment, _superSkillResetCount, _potentialResetCount, _heroBaseAttr, _superSkillLevel,
        //   _potentialLevel, _qigong, _qigongTmp, _qigongStage, _qigongTmpPower, _totalCost, _breakInfo,
        //   _gemstoneSuitId, _linkTo, _linkFrom
        heros: {
            _id: userId,
            _heros: { [heroId]: heroObj },
            _maxPower: 0,
            _maxPowerChangeTime: now
        },

        // ═══ 3. hangup — setOnHook ═══
        // Traced: setOnHook reads n._curLess, n._maxPassLesson, n._haveGotChapterReward, n._maxPassChapter,
        //   n._clickGlobalWarBuffTag, n._buyFund, n._haveGotFundReward
        // Also: e.globalWarBuffTag, e.globalWarLastRank, e.globalWarBuff, e.globalWarBuffEndTime
        hangup: {
            _id: userId,
            _lastGainTime: now,
            _waitGain: { _items: {} },
            _waitRand: { _items: {} },
            _actReward: { _items: {} },
            _curLess: constant.startLesson || 10101,
            _maxPassLesson: 0,
            _passLessonTime: 0,
            _maxPassChapter: 0,
            _lastNormalGainTime: now,
            _lastRandGainTime: now,
            _haveGotChapterReward: {},
            _firstGain: false,
            _clickGlobalWarBuffTag: '',
            _buyFund: false,
            _haveGotFundReward: {}
        },

        // ═══ 4. totalProps — setBackpack ═══
        // Traced: setBackpack reads e.totalProps._items, iterates for(n[o]._id, n[o]._num)
        totalProps: { _items: totalPropsItems },

        // ═══ 5. backpackLevel — setBackpack ═══
        // Traced: UserInfoSingleton.getInstance().heroBackPack = e.backpackLevel
        backpackLevel: 1,

        // ═══ 6. imprint — setSign ═══
        // Traced: setSign (L114925) — for(var o in n) iterates e.imprint._items as OBJECT
        // _items is OBJECT {} (NOT array) — client uses for...in
        imprint: {
            _id: userId,
            _items: {}
        },

        // ═══ 7. weapon — EquipInfoManager.readByData ═══
        // Traced: readByData (L130938) — for(var s in i) iterates e.weapon._items as OBJECT
        // _items is OBJECT {} (NOT array) — client uses for...in
        weapon: {
            _id: userId,
            _items: {}
        },

        // ═══ 8. summon — setSummon ═══
        // Traced: setSummon reads n._energy, n._wishList, n._wishVersion, n._canCommonFreeTime, n._canSuperFreeTime, n._summonTimes
        summon: {
            _id: userId,
            _energy: 0,
            _canCommonFreeTime: now,
            _canSuperFreeTime: now,
            _summonTimes: summonTimes,
            _wishList: [],
            _wishVersion: 0
        },

        // ═══ 9. dungeon — setCounterpart ═══
        // Traced: setCounterpart reads e.dungeon._dungeons, each entry has _type, _curMaxLevel, _lastLevel
        dungeon: {
            _id: userId,
            _dungeons: dungeonDict
        },

        // ═══ 10. equip — EquipInfoManager.readByData ═══
        // Traced: readByData reads e.equip._suits, iterates for(o in n)
        //   Each suit: _suitItems (array of {_id, _pos}), _earrings (object deserialize), _suitAttrs (array of {_id, _num}),
        //   _equipAttrs (array of {_id, _num}), _weaponState
        equip: {
            _id: userId,
            _suits: {
                [heroId]: {
                    _suitItems: [],
                    _earrings: { _id: 0, _level: 0, _attrs: { _items: {} }, _version: '' },
                    _suitAttrs: [],
                    _equipAttrs: [],
                    _weaponState: 0
                }
            }
        },

        // ═══ 11. scheduleInfo — AllRefreshCount.initData ═══
        // Deep-traced from AllRefreshCount.initData — EXACT field names the client reads:
        //   _marketDiamondRefreshCount, _vipMarketDiamondRefreshCount, _arenaAttackTimes, _arenaBuyTimesCount,
        //   _snakeResetTimes, _snakeSweepCount, _cellGameHaveGotReward, _cellGameHaveTimes,
        //   _cellgameHaveSetHero, _strongEnemyTimes, _strongEnemyBuyCount, _mergeBossBuyCount,
        //   _dungeonTimes, _dungeonBuyTimesCount, _karinBattleTimes, _karinBuyBattleTimesCount,
        //   _karinBuyFeetCount, _entrustResetTimes, _dragonExchangeSSPoolId, _dragonExchangeSSSPoolId,
        //   _teamDugeonUsedRobots, _timeTrialBuyTimesCount, _monthCardHaveGotReward, _goldBuyCount,
        //   _likeRank, _mahaAttackTimes, _mahaBuyTimesCount, _mineResetTimes, _mineBuyResetTimesCount,
        //   _mineBuyStepCount, _guildBossTimes, _guildBossTimesBuyCount, _treasureTimes, _guildCheckInType,
        //   _templeBuyCount, _trainingBuyCount, _bossCptTimes, _bossCptBuyCount, _ballWarBuyCount,
        //   _expeditionEvents, _expeditionSpeedUpCost, _clickExpedition, _templeDailyReward,
        //   _templeYesterdayLess, _topBattleTimes, _topBattleBuyCount, _gravityTrialBuyTimesCount
        //
        // CRITICAL NAME MISMATCH: Server sends _timeTrialBuyTimesCount → client stores as _spaceTrialBuyCount
        // CRITICAL: _dragonExchangeSSPoolId and _dragonExchangeSSSPoolId default=0 (not 1)
        // CRITICAL: bossFightTime has NO underscore (unlike all other fields)
        scheduleInfo: {
            _id: userId,
            _refreshTime: now,
            _marketDiamondRefreshCount: 0,
            _vipMarketDiamondRefreshCount: 0,
            _arenaAttackTimes: constant.arenaAttackTimes || 5,
            _arenaBuyTimesCount: 0,
            _snakeResetTimes: constant.snakeTimes || 1,
            _snakeSweepCount: 0,
            _cellGameHaveGotReward: true,
            _cellGameHaveTimes: constant.cellGameTimes || 1,
            _cellgameHaveSetHero: false,
            _strongEnemyTimes: 6,
            _strongEnemyBuyCount: 0,
            _monthCardHaveGotReward: {},
            _dungeonTimes: dungeonTimes,
            _dungeonBuyTimesCount: dungeonBuyTimes,
            _karinBattleTimes: constant.karinTowerBattleTimes || 10,
            _karinBuyBattleTimesCount: 0,
            _karinBuyFeetCount: 0,
            _goldBuyCount: 0,
            _entrustResetTimes: 1,
            _likeRank: {},
            _giveHearts: [],
            _getHearts: [],
            _mahaAttackTimes: constant.mahaAdventureBattleTimes || 10,
            _mahaBuyTimesCount: 0,
            _mineResetTimes: constant.mineRestartFree || 3,
            _mineBuyResetTimesCount: 0,
            _mineBuyStepCount: 0,
            _guildBossTimes: constant.guildBOSSTimes || 2,
            _guildBossTimesBuyCount: 0,
            _treasureTimes: 0,
            _guildCheckInType: 0,
            _dragonExchangeSSPoolId: 0,
            _dragonExchangeSSSPoolId: 0,
            _clickTimeGift: false,
            _trainingBuyCount: 0,
            _bossCptTimes: constant.bossAttackTimes || 6,
            _bossCptBuyCount: 0,
            bossFightTime: 0,
            _ballWarBuyCount: 0,
            _mergeBossBuyCount: 0,
            _expeditionEvents: {},
            _expeditionSpeedUpCost: 0,
            _clickExpedition: false,
            _teamDugeonUsedRobots: [],
            _topBattleTimes: 0,
            _topBattleBuyCount: 0,
            _timeTrialBuyTimesCount: 0,
            _gravityTrialBuyTimesCount: 0,
            _templeBuyCount: 0,
            _templeDailyReward: false,
            _templeYesterdayLess: 0
        },

        // ═══ 12. timesInfo — TimesInfoSingleton.initData ═══
        // Traced: initData reads e.marketRefreshTimes, e.marketRefreshTimesRecover, e.vipMarketRefreshTimes,
        //   e.vipMarketRefreshTimesRecover, e.templeTimes, e.templeTimesRecover, e.mahaTimes, e.mahaTimesRecover,
        //   e.mineSteps, e.mineStepsRecover, e.karinFeet, e.karinFeetRecover
        // WARNING: NO underscore prefix on keys!
        timesInfo: {
            templeTimes: constant.templeTestTimes || 10,
            templeTimesRecover: 0,
            mineSteps: 0,
            mineStepsRecover: 0,
            karinFeet: constant.karinTowerFeet || 5,
            karinFeetRecover: 0,
            mahaTimes: 0,
            mahaTimesRecover: 0,
            marketRefreshTimes: 0,
            marketRefreshTimesRecover: 0,
            vipMarketRefreshTimes: 0,
            vipMarketRefreshTimesRecover: 0
        },

        // ═══ 13. serverVersion — UserInfoSingleton.serverVersion ═══
        serverVersion: config.serverVersion,

        // ═══ 14. serverId — UserInfoSingleton.setServerId ═══
        serverId: config.serverId,

        // ═══ 15. serverOpenDate — UserInfoSingleton.setServerOpenDate ═══
        serverOpenDate: config.serverOpenDate,

        // ═══ 16. newUser — loginSuccessCallBack checks e.newUser ═══
        newUser: true,

        // ═══ 17. currency — ts.currency = e.currency ═══
        currency: config.currency,

        // ═══ 18. lastTeam — UserInfoSingleton.firstLoginSetMyTeam(e.lastTeam._lastTeamInfo) ═══
        // Traced: L96167 — for(var n in e) iterates _lastTeamInfo, for(var l in i) iterates _team
        //   Creates BattleTeamItem for each entry in _team → pushes to array → sets o._team = a[]
        // LAST_TEAM_TYPE.HANGUP = 9 — hangup/AFK team used by tutorial
        // FIX-008: _team MUST be {} for new users — tutorial guide 2106 expects empty team
        //   Client L104862: setMyTeamByType(HANGUP, battleHero, superSkill) — sets team AFTER tutorial battle
        //   If heroes pre-placed here → tutorial flow STUCK (guide 2106 cannot proceed)
        lastTeam: {
            _id: userId,
            _lastTeamInfo: {
                [9]: {
                    _team: {},
                    _superSkill: []
                }
            }
        },

        // ═══ 19. superSkill — SuperSkillSingleton.initSuperSkill ═══
        superSkill: {
            _id: userId,
            _skills: {}
        },

        // ═══ 20. giftInfo — WelfareInfoManager (multiple sub-sets) ═══
        // Traced: setGotChannelWeeklyRewardTag(e.giftInfo), setFirstRecharge(e.giftInfo._fristRecharge),
        //   setVIPRewrd(e.giftInfo._haveGotVipRewrd), setVIPPrerogativeGift(e.giftInfo._buyVipGiftCount),
        //   setOnlineGift(e.giftInfo._onlineGift), _gotBSAddToHomeReward, _clickHonghuUrlTime
        giftInfo: {
            _id: userId,
            _isBuyFund: false,
            _levelGiftCount: {},
            _fundGiftCount: {},
            _fristRecharge: { _canGetReward: false, _haveGotReward: false },
            _haveGotVipRewrd: {},
            _buyVipGiftCount: {},
            _onlineGift: { _curId: 0, _nextTime: 0 },
            _gotChannelWeeklyRewardTag: '',
            _clickHonghuUrlTime: 0,
            _gotBSAddToHomeReward: false
        },

        // ═══ 21. guide — GuideInfoManager.setGuideInfo ═══
        guide: { _id: userId, _steps: {} },

        // ═══ 22. userGuild — TeamTechnologyManager.saveGuildTech + TeamInfoManager.setUserTeamInfoModel ═══
        // Traced: saveGuildTech reads e.userGuild._tech, iterates for(n in e.userGuild._tech)
        //   Each tech entry has _totalLevel, and is deserialized by GuildTech.deserialize
        // setUserTeamInfoModel reads _satanGift._exp, _satanGift._level, _satanGift._canRewardTime
        userGuild: {
            _id: userId,
            _satanGift: { _exp: 0, _level: 1, _canRewardTime: {} },
            _tech: {}
        },

        // ═══ 23. userGuildPub — TeamInfoManager.setUserTeamInfoModel ═══
        // Traced: reads _guildId, _haveReadBulletin, _requestedGuild, _canJoinGuildTime,
        //   _createGuildCD, _ballWarJoin, _lastRefreshTime
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

        // ═══ 24. expedition — ExpeditionManager.setExpeditionModel ═══
        // Traced: new ExpeditionModel.deserialize(e)
        expedition: {
            _id: userId,
            _passLesson: {},
            _machines: {},
            _collection: [],
            _teams: {},
            _times: constant.expeditionBattleTimes || 10,
            _timesStartRecover: 0
        },

        // ═══ 25. retrieve — GetBackReourceManager.setRetrieveModel ═══
        // Traced: new RetrieveModel.deserialize(e)
        retrieve: {
            _id: userId,
            _finishDungeons: {},
            _calHangupTime: 0,
            _retrieveHangupReward: { _items: {} },
            _retrieveHangupTime: 0,
            _retrieveDungeons: {},
            _finishTime: 0
        },

        // ═══ 26. battleMedal — BattleMedalManager.setBattleMedal ═══
        // Traced: new BattleMedalModel.deserialize(e)
        battleMedal: {
            _id: userId,
            _battleMedalId: '',
            _cycle: 0,
            _nextRefreshTime: 0,
            _level: 0,
            _curExp: 0,
            _openSuper: false,
            _task: {},
            _levelReward: {},
            _shopBuyTimes: {},
            _buyLevelCount: 0
        },

        // ═══ 27. training — PadipataInfoManager.setPadipataModel ═══
        // Traced: setPadipataModel reads _id, _type, _times, _timesStartRecover, _surpriseReward,
        //   _questionId, _enemyId, _cfgId, _award(=e)
        //
        // [FIX-001] _award field added
        //   EVIDENCE: main.min.js L121387 — t._padipataInfo._award = e
        //   Client BUG: assigns ENTIRE param (e) to _award, not e._award
        //   For new user: _award = null (no training reward yet)
        //   EVIDENCE: L190426 — resetTtemsCallBack(e.trainingModel._award) expects award format
        //     Award format = { _changeInfo: { _items: {...} } }
        //     null is safe because client checks with void 0 != n._award before use
        training: {
            _id: userId,
            _cfgId: 0,
            _type: 0,
            _times: constant.trainingTimesMax || 10,
            _timesStartRecover: now,
            _surpriseReward: null,
            _questionId: 0,
            _enemyId: 0,
            _award: null
        },

        // ═══ 28. heroSkin — HerosManager.setSkinData ═══
        // Traced: setSkinData → setSkinsWithServerData reads e._skins, e._curSkin
        heroSkin: {
            _id: userId,
            _skins: {},
            _curSkin: {}
        },

        // ═══ 29. userWar — GlobalWarManager.setUserWarModel ═══
        userWar: {
            _id: userId,
            _session: 0,
            _worldId: 0,
            _areaId: 0,
            _auditionWinCount: 0,
            _gotAuditionReward: {},
            _bet: {},
            _championCount: 0,
            _liked: false
        },

        // ═══ 30. userBallWar — TeamInfoManager.UserBallWar ═══
        userBallWar: {
            _id: userId,
            _times: 0,
            _timesStartRecover: 0,
            _fieldId: '',
            _readRecordTime: 0,
            _nextCanFightTime: 0
        },

        // ═══ 31. headEffect — HeadEffectModel.deserialize ═══
        // Traced: deserialize strips underscore prefix for primitive values,
        //   special handling for _effects → array of HeadEffectItem
        headEffect: {
            _id: userId,
            _curBox: 0,
            _curEffect: 0,
            _effects: []
        },

        // ═══ 32. userTopBattle — TopBattleManager.setTopBattleLoginInfo ═══
        // Traced: e.userTopBattle → userTopBattle.deserialize
        userTopBattle: {
            _id: userId,
            _teams: {},
            _teamTag: '',
            _nextSetTeamTime: 0,
            _lastPoint: 0,
            _records: [],
            _history: [],
            _bet: {},
            _liked: false,
            _gotRankReward: []
        },

        // ═══ 33. topBattleInfo — TopBattleManager.setTopBattleLoginInfo ═══
        // Traced: e.topBattleInfo → topBattleInfo.deserialize
        topBattleInfo: {
            topBattleInfo: null,
            topUserInfo: {},
            lastChampion: null,
            _season: 0
        },

        // ═══ 34. checkin — WelfareInfoManager.setSignInInfo ═══
        checkin: {
            _id: userId,
            _activeItem: [],
            _curCycle: 0,
            _maxActiveDay: 0,
            _lastActiveDate: 0
        },

        // ═══ 35. curMainTask — UserInfoSingleton.setMianTask ═══
        curMainTask: {},

        // ═══ 36. summonLog — SummonSingleton.setSummomLogList ═══
        // Traced: if(e.summonLog) iterate → new SummonLog.deserialize
        summonLog: [],

        // ═══ 37. vipLog — WelfareInfoManager.setVipLogList ═══
        // Traced: if(e.vipLog) → setVipLogList
        vipLog: [],

        // ═══ 38. cardLog — WelfareInfoManager.setMonthCardLogList ═══
        // Traced: if(e.cardLog) → setMonthCardLogList
        cardLog: [],

        // ═══ 39. onlineBulletin — BulletinSingleton.setBulletInfo ═══
        // Traced: if(e.onlineBulletin) → setBulletInfo
        onlineBulletin: [],

        // ═══ 40. broadcastRecord — chatJoinRecord ═══
        // Traced: ts.chatJoinRecord({_record: t.broadcastRecord}) → iterates _record array
        broadcastRecord: [],

        // ═══ 41. blacklist — BroadcastSingleton.setBlacklistPlayerInfo ═══
        // Traced: if(e.blacklist) iterate for(n in e.blacklist) → push to array
        blacklist: {},

        // ═══ 42. forbiddenChat — BroadcastSingleton.setUserBidden ═══
        // Traced: reads e.users, e.finishTime → iterates for(a in n) → forbiddenChat[n[a]] = o[n[a]] || 0
        forbiddenChat: { users: [], finishTime: {} },

        // ═══ 43. guildLevel — TeamInfoManager.setMyTeamLevel ═══
        // Traced: void 0 != e.guildLevel → setMyTeamLevel
        guildLevel: 0,

        // ═══ 44. guildTreasureMatchRet — GuildTreasureManager.setTreasureMatchState ═══
        // Traced: void 0 != e.guildTreasureMatchRet → setTreasureMatchState
        guildTreasureMatchRet: 0,

        // ═══ 45. dragonEquiped — ItemsCommonSingleton.initDragonBallEquip ═══
        dragonEquiped: {},

        // ═══ 46. warInfo — GlobalWarManager.setWarLoginInfo ═══
        // Traced: if(e.warInfo) → setWarLoginInfo (guard: truthy check)
        warInfo: null,

        // ═══ 47. ballWarState — TeamInfoManager.BallWarState ═══
        // Traced: if(e.ballWarState) → BallWarState = e.ballWarState (truthy check)
        ballWarState: 0,

        // ═══ 48. enableShowQQ — WelfareInfoManager.enableShowQQ ═══
        // Traced: direct assignment (no guard)
        enableShowQQ: false,

        // ═══ 49. showQQVip — WelfareInfoManager.showQQVip ═══
        showQQVip: 0,

        // ═══ 50. showQQ — WelfareInfoManager.showQQ ═══
        showQQ: 0,

        // ═══ 51. showQQImg1 — WelfareInfoManager.showQQImg1 ═══
        showQQImg1: '',

        // ═══ 52. showQQImg2 — WelfareInfoManager.showQQImg2 ═══
        showQQImg2: '',

        // ═══ 53. showQQUrl — WelfareInfoManager.showQQUrl ═══
        showQQUrl: '',

        // ═══ 54. cellgameHaveSetHero — copied into scheduleInfo._cellgameHaveSetHero before initData ═══
        // Traced: void 0 != e.cellgameHaveSetHero → e.scheduleInfo._cellgameHaveSetHero = e.cellgameHaveSetHero
        cellgameHaveSetHero: false,

        // ═══ 55. globalWarBuffTag — setOnHook → OnHookSingleton.setGlobalWarBuffTag ═══
        globalWarBuffTag: '',

        // ═══ 56. globalWarLastRank — setOnHook → OnHookSingleton.setGlobalWarLastRank ═══
        globalWarLastRank: {},

        // ═══ 57. globalWarBuff — setOnHook → OnHookSingleton.globalWarBuff ═══
        globalWarBuff: 0,

        // ═══ 58. globalWarBuffEndTime — setOnHook → OnHookSingleton.globalWarBuffEndTime ═══
        globalWarBuffEndTime: 0,

        // ═══ 59. guildName — TeamInfoManager.setTeamName ═══
        // Traced: if(e.guildName) → setTeamName (guard: truthy check)
        guildName: '',

        // ═══ 60. guildActivePoints — TeamInfoManager.setActivePoints ═══
        // Traced: if(e.guildActivePoints) → setActivePoints
        guildActivePoints: {},

        // ═══ 61. ballBroadcast — TeamInfoManager.setBallWarBrodecast ═══
        // Traced: if(e.ballBroadcast) → setBallWarBrodecast
        ballBroadcast: null,

        // ═══ 62. ballWarInfo — GuildBallWarInfo.deserialize ═══
        // Traced: deserialize strips underscore, reads _signed→signed, _fieldId→fieldId, _point→point, _topMsg→topMsg
        ballWarInfo: {
            _signed: false,
            _fieldId: '',
            _point: 0,
            _topMsg: ''
        },

        // ═══ 63. teamTraining — TeamTrainingManager.saveTeamTraining ═══
        // Traced: if(e.teamTraining) → trainingData.deserialize(e.teamTraining)
        teamTraining: {
            _id: userId,
            _levels: {},
            _unlock: false,
            _version: ''
        },

        // ═══ 64. teamServerHttpUrl — TeamworkManager.teamServerHttpUrl ═══
        // Traced: if(e.teamServerHttpUrl) → teamServerHttpUrl = e.teamServerHttpUrl + getTodayMaps/getTodayRobot/queryMyDungeonTeamRecord
        teamServerHttpUrl: '',

        // ═══ 65. teamDungeonOpenTime — TeamworkManager.teamDungeonOpenTime ═══
        // Traced: if(e.teamDungeonOpenTime) → teamDungeonOpenTime
        teamDungeonOpenTime: 0,

        // ═══ 66. teamDungeonTask — TeamworkManager.teamDungeonTask.deserialize ═══
        // Traced: if(e.teamDungeonTask) → teamDungeonTask.deserialize
        teamDungeonTask: {
            _dailyRefreshTime: 0,
            _achievement: {},
            _daily: {}
        },

        // ═══ 67. teamDungeonSplBcst — TeamworkManager.SetTeamDungeonBroadcast(, true) ═══
        // Traced: if(e.teamDungeonSplBcst) → SetTeamDungeonBroadcast(e.teamDungeonSplBcst, true)
        teamDungeonSplBcst: null,

        // ═══ 68. teamDungeonNormBcst — TeamworkManager.SetTeamDungeonBroadcast(, false) ═══
        // Traced: if(e.teamDungeonNormBcst) → SetTeamDungeonBroadcast(e.teamDungeonNormBcst, false)
        teamDungeonNormBcst: null,

        // ═══ 69. teamDungeonHideInfo — TeamworkManager.setTeamDungeonHideInfo ═══
        // Traced: if(e.teamDungeonHideInfo) → setTeamDungeonHideInfo
        teamDungeonHideInfo: null,

        // ═══ 70. teamDungeon — TeamworkManager.setLoginInfo ═══
        // Traced: setLoginInfo reads e._myTeam, e._canCreateTeamTime, e._nextCanJoinTime
        teamDungeon: {
            _myTeam: '',
            _canCreateTeamTime: 0,
            _nextCanJoinTime: 0
        },

        // ═══ 71. teamDungeonInvitedFriends — TeamworkManager.teamDungeonInvitedFriends ═══
        // Traced: if(e.teamDungeonInvitedFriends) → teamDungeonInvitedFriends = e.teamDungeonInvitedFriends
        teamDungeonInvitedFriends: null,

        // ═══ 72. myTeamServerSocketUrl — ts.loginInfo.serverItem.dungeonurl ═══
        // Traced: if(e.myTeamServerSocketUrl) → ts.loginInfo.serverItem.dungeonurl = e.myTeamServerSocketUrl
        myTeamServerSocketUrl: config.dungeonUrl,

        // ═══ 73. shopNewHeroes — ShopInfoManager.shopNewHero ═══
        // Traced: if(e.shopNewHeroes) → shopNewHero = e.shopNewHeroes
        shopNewHeroes: {},

        // ═══ 74. channelSpecial — WelfareInfoManager.channelSpecial ═══
        // Traced: direct assignment, then if(e.channelSpecial._honghuUrl) → read _honghuUrl/StartTime/EndTime
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

        // ═══ 75. hideHeroes — WelfareInfoManager.setHideHeroes ═══
        // Traced: if(e.hideHeroes) → setHideHeroes
        hideHeroes: [],

        // ═══ 76. templeLess — TrialManager.setTempleLess ═══
        // Traced: if(e.templeLess) → setTempleLess (truthy check, not void 0 check)
        templeLess: 0,

        // ═══ 77. timeTrial — SpaceTrialManager.setSpaceTrialModel ═══
        // Traced: if(e.timeTrial) → new SpaceTrialModel.deserialize(e.timeTrial)
        timeTrial: {
            _id: userId,
            _level: 1,
            _totalStars: 0,
            _haveTimes: 0,
            _timesStartRecover: 0,
            _lastRefreshTime: 0,
            _startTime: 0,
            _levelStars: {},
            _gotStarReward: {}
        },

        // ═══ 78. timeTrialNextOpenTime — passed as 2nd arg to setSpaceTrialModel ═══
        timeTrialNextOpenTime: 0,

        // ═══ 79. YouTuberRecruit — YouTuberRecruitModel ═══
        // Traced: if(e.YouTuberRecruit && !e.YouTuberRecruit._hidden) → new YouTuberRecruitModel.setData
        YouTuberRecruit: {
            _id: '',
            _image: '',
            _content: '',
            _reward: null,
            _mailAddr: '',
            _jumpLink: [],
            _hidden: false
        },

        // ═══ 80. userYouTuberRecruit — YouTuberRecruitModel.initUserInfo ═══
        // Traced: if(e.userYouTuberRecruit) → YouTuberModel.initUserInfo
        userYouTuberRecruit: {
            _gotReward: false,
            _hasJoin: false
        },

        // ═══ 81. heroImageVersion — UserInfoSingleton.heroImageVersion ═══
        // Traced: void 0 != e.heroImageVersion → heroImageVersion
        heroImageVersion: 0,

        // ═══ 82. superImageVersion — UserInfoSingleton.superImageVersion ═══
        // Traced: void 0 != e.superImageVersion → superImageVersion
        superImageVersion: 0,

        // ═══ 83. karinStartTime — TowerDataManager.setKarinTime ═══
        karinStartTime: 0,

        // ═══ 84. karinEndTime — TowerDataManager.setKarinTime ═══
        karinEndTime: 0,

        // ═══ 85. timeBonusInfo — TimeLimitGiftBagManager.setTimeLimitGiftBag ═══
        // Traced: if(e.timeBonusInfo) → setTimeLimitGiftBag
        timeBonusInfo: {
            _id: userId,
            _timeBonus: {}
        },

        // ═══ 86. monthCard — WelfareInfoManager.setMonthCardInfo ═══
        // Traced: if(e.monthCard) → setMonthCardInfo
        monthCard: {
            _id: userId,
            _card: {}
        },

        // ═══ 87. recharge — WelfareInfoManager.setRechargeInfo ═══
        // Traced: if(e.recharge) → setRechargeInfo
        recharge: {
            _id: userId,
            _haveBought: {}
        },

        // ═══ 88. userDownloadReward — UserInfoSingleton.userDownloadModel ═══
        // Traced: if(e.userDownloadReward) → reads _isClick, _haveGotDlReward, _isBind, _haveGotBindReward
        userDownloadReward: {
            _isClick: false,
            _haveGotDlReward: false,
            _isBind: false,
            _haveGotBindReward: false
        },

        // ═══ 89. clickSystem — UserClickSingleton.setClickSys ═══
        // Traced: if(e.clickSystem) → iterate e.clickSystem._clickSys for(n) → setClickSys(n, value)
        clickSystem: {
            _id: userId,
            _clickSys: {}
        },

        // ═══ 90. questionnaires — UserInfoSingleton.setQuestData ═══
        // Traced: if(e.questionnaires) → setQuestData
        questionnaires: null,

        // ═══ 91. littleGame — LittleGameManager.saveData ═══
        // Traced: if(e.littleGame) → reads _gotBattleReward, _gotChapterReward, _clickTime
        littleGame: {
            _gotBattleReward: {},
            _gotChapterReward: {},
            _clickTime: 0
        },

        // ═══ 92. genki — EquipInfoManager.readByData reads e.genki ═══
        // Traced: GenkiModel.deserialize (L132158) — for(var o in n) iterates e.genki._items as OBJECT
        // _items is OBJECT {} (NOT array) — client uses for...in
        genki: {
            _id: userId,
            _items: {},
            _curSmeltNormalExp: 0,
            _curSmeltSuperExp: 0
        },

        // ═══ 93. gemstone — EquipInfoManager.saveGemStone ═══
        // Traced: if(e.gemstone) → iterate e.gemstone._items → new GemstoneItem.deserialize
        gemstone: { _items: {} },

        // ═══ 94. resonance — HerosManager.setResonanceModel ═══
        // Traced: if(e.resonance) → new ResonanceModel.deserialize(e)
        resonance: {
            _id: userId,
            _diamondCabin: 0,
            _buySeatCount: 0,
            _totalTalent: 0,
            _unlockSpecial: false,
            _cabins: {}
        },

        // ═══ 95. fastTeam — HerosManager.saveLoginFastTeam ═══
        // Traced: if(e.fastTeam) → iterate e._teamInfo → new FastTeam.deserialize
        fastTeam: {
            _teamInfo: {}
        },

        // ═══ 96. gravity — TrialManager.setGravityTrialInfo ═══
        // Traced: if(e.gravity) → checks e.gravity first, then e._model
        gravity: {},

        // ═══ 97. timeMachine — TimeLeapSingleton.initData ═══
        // Traced: if(e.timeMachine) → iterate e._items → new TimeMachineItem
        timeMachine: { _items: {} },

        // ═══ 98. _arenaTeam — AltarInfoManger.setArenaTeamInfo ═══
        // Traced: direct call, if(e) check inside setArenaTeamInfo
        _arenaTeam: null,

        // ═══ 99. _arenaSuper — AltarInfoManger.setArenaSuperInfo ═══
        // Traced: direct call, if(e) check inside setArenaSuperInfo
        _arenaSuper: null,

        // ═══ Extra: mergedServers — seen in live server responses ═══
        mergedServers: []
    };

    // ─── Log build result ───
    const totalKeys = Object.keys(result).length;
    ctx.logger.log('DEBUG', 'ENTER', `[BUILD] New user data object: ${totalKeys} top-level keys`);

    return result;
}

// ═══════════════════════════════════════════════════════════════
// BUILD STARTER HERO
// Deep-traced from HerosManager.SetHeroDataToModel
// ═══════════════════════════════════════════════════════════════
function buildStarterHero(heroId, displayId, level, heroConfig, now, constant) {
    return {
        _heroId: heroId,
        _heroDisplayId: parseInt(displayId),
        _heroBaseAttr: {
            _level: level,
            _evolveLevel: 0
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
        _linkFrom: ''
    };
}

// ═══════════════════════════════════════════════════════════════
// UPDATE EXISTING USER
// [FIX-002] Deep clone before mutation to prevent cache corruption
// ═══════════════════════════════════════════════════════════════
function updateExistingUser(data, request, ctx) {
    const now = Date.now();

    ctx.logger.log('DEBUG', 'ENTER', '[UPDATE] Deep cloning existing user data...');

    // [FIX-002] Deep clone to prevent mutating DB cache directly
    // db.getUser() returns reference to _cache Map value
    // Without clone: mutations affect cache = data corruption risk
    let cloned;
    try {
        cloned = deepClone(data, 'existingUserData', ctx.logger);
    } catch (err) {
        ctx.logger.log('ERROR', 'ENTER', `[UPDATE] Deep clone failed — attempting to strip circular refs and retry`);
        // Emergency: strip _award from training if it's causing circular
        if (data.training && data.training._award) {
            ctx.logger.log('WARN', 'ENTER', `[UPDATE] Emergency: stripping training._award to break circular ref`);
            data.training._award = null;
        }
        try {
            cloned = JSON.parse(JSON.stringify(data));
        } catch (err2) {
            ctx.logger.log('ERROR', 'ENTER', `[UPDATE] Deep clone still failed after strip: ${err2.message}`);
            // Last resort: return minimal data that won't crash
            return ctx.buildErrorResponse(1);
        }
    }

    // Update login timestamps
    if (cloned.user) {
        const prevLoginTime = cloned.user._lastLoginTime || 0;
        cloned.user._offlineTime = prevLoginTime;
        cloned.user._lastLoginTime = now;
        ctx.logger.log('DEBUG', 'ENTER', `[UPDATE] user._lastLoginTime: ${prevLoginTime} → ${now}`);
    } else {
        ctx.logger.log('WARN', 'ENTER', '[UPDATE] cloned.user is MISSING — cannot update login timestamps');
    }

    // Mark as NOT new user
    cloned.newUser = false;

    // [FIX-003] Strip circular _award from existing training data
    // If client previously set _award = entire training object via L121387,
    // and that was saved to DB, it will cause circular JSON on next login
    if (cloned.training && cloned.training._award !== undefined && cloned.training._award !== null) {
        ctx.logger.log('WARN', 'ENTER', `[UPDATE] Existing training._award found — type=${typeof cloned.training._award}`);
        // Check if _award is self-referencing
        if (cloned.training._award === cloned.training) {
            ctx.logger.log('WARN', 'ENTER', '[UPDATE] training._award is self-referencing → setting to null');
            cloned.training._award = null;
        } else if (typeof cloned.training._award === 'object') {
            // Check nesting depth
            let depth = 0;
            let ptr = cloned.training._award;
            while (ptr && ptr._award && typeof ptr._award === 'object') {
                depth++;
                if (depth > 2) {
                    ctx.logger.log('WARN', 'ENTER', `[UPDATE] training._award nesting depth=${depth} → resetting to null`);
                    cloned.training._award = null;
                    break;
                }
                ptr = ptr._award;
            }
        }
    }

    // Update serverTime-sensitive fields
    cloned.serverVersion = ctx.config.serverVersion;
    cloned.serverId = ctx.config.serverId;
    cloned.serverOpenDate = ctx.config.serverOpenDate;
    cloned.currency = ctx.config.currency;

    ctx.logger.log('DEBUG', 'ENTER', '[UPDATE] Existing user data updated successfully');

    return cloned;
}

module.exports = handleEnterGame;
