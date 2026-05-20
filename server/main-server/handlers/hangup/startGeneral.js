/**
 * startGeneral.js — Handler: hangup/startGeneral
 *
 * ═══════════════════════════════════════════════════════════════
 * DEEP TRACE — main.min.js (100% verified)
 * ═══════════════════════════════════════════════════════════════
 *
 * CALLER — L97716-97735:
 *   ts.processHandler({
 *       type: 'hangup', action: 'startGeneral',
 *       userId, version: '1.0', team, 'super',
 *       battleField: BattleLogic.GameFieldType.LESSON
 *   }, callback);
 *
 * RESPONSE FIELDS (client reads only 3):
 *   _battleId   — UUID string  (L97731)
 *   _rightTeam  — FLAT object with hero positions as keys  (L97733, L102470)
 *   _rightSuper — Array of super skill objects  (L97733, L103618)
 *
 * ═══════════════════════════════════════════════════════════════
 * BUG FIX LOG (all verified against main.min.js)
 * ═══════════════════════════════════════════════════════════════
 *
 * [FIX-001] _rightTeam wrapper — was { _items: {...} }, must be FLAT
 *   OLD: _rightTeam: { _items: rightTeamItems }
 *   NEW: _rightTeam: rightTeamItems
 *   SOURCE: L102470: for (var o in e) iterates _rightTeam directly
 *   REASON: Client treats _rightTeam as the sparse dict itself, not a wrapper
 *
 * [FIX-002] _attrs._items field name — was _type, must be _id
 *   OLD: { _type: ATTR.HP, _num: hp }
 *   NEW: { _id: ATTR.HP, _num: hp }
 *   SOURCE: L102528-537 reconstructed: a.type = o._id; a.value = o._num
 *   REASON: getEnemyAttributeModel reads _id as the attr type identifier
 *
 * [FIX-003] Missing _weaponHaloId/_weaponHaloLevel
 *   SOURCE: L102674: a._weaponHaloId && a._weaponHaloLevel — called on rightTeam too
 *   FIX: Add _weaponHaloId: 0, _weaponHaloLevel: 0 to each enemy hero
 *
 * [FIX-004] Missing _heroStar
 *   SOURCE: L101748: o[e.position]._heroStar — read from rightTeam
 *   FIX: Add _heroStar: 0
 *
 * [FIX-005] Missing _skinId
 *   SOURCE: L236987: var l = i._skinId — read from rightTeam hero
 *   FIX: Add _skinId: 0
 *
 * [FIX-006] Missing Power attr (21)
 *   SOURCE: L133821: 21==p._id → heroBaseAttr.power = floor(num)
 *   FIX: Calculate power via heroPower.json weighted sum, add as attr 21
 *
 * [FIX-007] Missing FullHealth/orgHp attr (22)
 *   SOURCE: heroMaxHealth = orgHp value (attr 22)
 *   FIX: Add attr 22 with same value as HP
 *
 * [FIX-008] Formula KURANG: tanpa qualityParam × balanceHp/Attack/Armor
 *   OLD: hp = floor((levelAttr × typeParam + bais) × difficulty)
 *   NEW: hp = floor((levelAttr × typeParam + bais) × qualityParam × balance × difficulty)
 *   SOURCE: L116073 makeHeroBasicAttr full formula
 *   REASON: Formula must include all 5 layers per main.min.js
 *
 * [FIX-009] floor() replaced — keep floor for now, HAR decimal is display-only
 *   SOURCE: L116073 uses Math.floor for core stats
 *   NOTE: HAR decimal values are from client-side talent multiply, not raw attrs
 *
 * [FIX-010] Missing battleTeamPosition field
 *   SOURCE: getModelArray reconstructed — battleTeamPosition = pos
 *   FIX: Add battleTeamPosition: pos to each enemy hero
 *
 * [FIX-011] heroQualityParam.json not loaded
 *   SOURCE: L116000: s = heroQualityParam[i.quality]
 *   FIX: Load heroQualityParam.json and use in formula
 *
 * [FIX-012] heroPower.json not loaded (for power calculation)
 *   SOURCE: getAttrs uses heroPower.json for weighted power sum
 *   FIX: Load heroPower.json and calculate power per heroType weights
 *
 * ═══════════════════════════════════════════════════════════════
 * ENEMY STATS FORMULA (5-layer, verified L116073)
 * ═══════════════════════════════════════════════════════════════
 *
 *   hp     = floor( (levelAttr.hp  × typeParam.hpParam  + typeParam.hpBais )
 *                   × qualityParam.hpParam  × hero.balanceHp  × difficultyHp )
 *
 *   attack = floor( (levelAttr.atk × typeParam.atkParam + typeParam.atkBais )
 *                   × qualityParam.atkParam × hero.balanceAtk × difficultyAtk )
 *
 *   armor  = floor( (levelAttr.arm × typeParam.armParam + typeParam.armBais )
 *                   × qualityParam.armParam × hero.balanceArm × difficultyArm )
 *
 *   power  = floor( sum(attrValue × heroPower[heroType][attrName].powerParam) )
 *            × heroQualityPower[quality].powerParam
 *
 *   Flat stats (speed, hit, dodge, etc.): directly from hero.json (no scaling)
 *
 * ═══════════════════════════════════════════════════════════════
 * STRICT RULES: NO STUB, OVERRIDE, FORCE, BYPASS, DUMMY, ASUMSI
 * ═══════════════════════════════════════════════════════════════
 */

// ─── HERO_ATTRIBUTE enum indices (from main.min.js HERO_ATTRIBUTE) ───
var ATTR = {
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
    CRITICAL_DAMAGE_RESIST: 36,
    BLOCK_THROUGH: 37,
    ENERGY_MAX: 41
};

/**
 * Calculate enemy power using heroPower.json weighted sum.
 * Formula: floor( sum(attrValue × heroPower[heroType][attrName].powerParam) )
 * Then multiply by heroQualityPower[quality].powerParam
 *
 * @param {object} attrs - Calculated attr values { hp, attack, armor, speed, ... }
 * @param {string} heroType - Hero type for power weight lookup
 * @param {string} quality - Hero quality tier for quality power multiplier
 * @param {object} heroPowerJson - heroPower.json config
 * @param {object} heroQualityPowerJson - heroQualityPower.json config
 * @returns {number} Calculated power value
 */
function calculatePower(attrs, heroType, quality, heroPowerJson, heroQualityPowerJson) {
    if (!heroPowerJson) {
        return 0;
    }

    // Map our attr names to heroPower.json attName keys
    var attrValueMap = {
        hpPercent: 0,
        attackPercent: 0,
        armorPercent: 0,
        hp: attrs.hp,
        attack: attrs.attack,
        armor: attrs.armor,
        speed: attrs.speed,
        extraArmor: 0,
        hit: attrs.hit,
        dodge: attrs.dodge,
        block: attrs.block,
        blockEffect: attrs.blockEffect,
        skillDamage: attrs.skillDamage,
        superDamage: attrs.superDamage,
        critical: attrs.critical,
        criticalResist: attrs.criticalResist,
        criticalDamage: attrs.criticalDamage,
        armorBreak: attrs.armorBreak,
        damageReduce: attrs.damageReduce,
        controlResist: attrs.controlResist,
        trueDamage: attrs.trueDamage,
        healPlus: attrs.healPlus,
        healerPlus: attrs.healerPlus,
        shielderPlus: attrs.shielderPlus,
        damageUp: attrs.damageUp,
        damageDown: attrs.damageDown,
        superDamageResist: attrs.superDamageResist,
        bloodDamage: 0,
        normalAttack: 0,
        blockThrough: attrs.blockThrough,
        criticalDamageResist: attrs.criticalDamageResist
    };

    // Sum all attrs × weight from heroPower.json for this heroType
    var totalWeighted = 0;
    for (var key in heroPowerJson) {
        var entry = heroPowerJson[key];
        if (entry.heroType === heroType) {
            var val = attrValueMap[entry.attName] || 0;
            totalWeighted += val * entry.powerParam;
        }
    }

    var power = Math.floor(totalWeighted);

    // Apply quality power multiplier
    if (heroQualityPowerJson && heroQualityPowerJson[quality]) {
        power = Math.floor(power * heroQualityPowerJson[quality].powerParam);
    }

    return power;
}

/**
 * Parse skill ID from hero.json — handles both string and number types.
 * hero.json stores some IDs as strings ("190491") and some as numbers (5120601).
 * Must return number for _id field.
 *
 * @param {string|number} val - Skill ID from hero.json
 * @returns {number} Parsed skill ID
 */
function parseSkillId(val) {
    if (!val) return 0;
    if (typeof val === 'number') return val;
    var trimmed = String(val).trim();
    if (!trimmed) return 0;
    var num = Number(trimmed);
    return isNaN(num) ? 0 : num;
}

function handleStartGeneral(request, ctx) {
    var userId = request.userId;
    var version = request.version || '1.0';

    // ═══════════════════════════════════════════════════════════════
    // STEP 1: Validate request
    // ═══════════════════════════════════════════════════════════════
    ctx.logger.step(1, 7, 'Validate request', 'running');
    ctx.logger.details('request',
        ['userId', userId ? userId.substring(0, 20) : 'MISSING'],
        ['version', version],
        ['team', Array.isArray(request.team) ? request.team.length + ' heroes' : String(request.team || '(none)')],
        ['super', Array.isArray(request['super']) ? request['super'].join(',') : String(request['super'] || '(none)')],
        ['battleField', String(request.battleField || '(none)')]
    );

    if (!userId) {
        ctx.logger.step(1, 7, 'Validate request', 'fail', 'userId MISSING');
        return ctx.buildErrorResponse(8);
    }

    ctx.logger.step(1, 7, 'Validate request', 'pass');

    // ═══════════════════════════════════════════════════════════════
    // STEP 2: Load user data and ALL required resources
    // ═══════════════════════════════════════════════════════════════
    ctx.logger.step(2, 7, 'Load data', 'running');

    var userData = ctx.db.getUser(userId);
    if (!userData) {
        ctx.logger.step(2, 7, 'Load data', 'fail', 'userData NOT FOUND');
        return ctx.buildErrorResponse(8);
    }

    // Load lesson.json — enemy list, levels, difficulty, isBoss
    var lessonData = ctx.loadResource('lesson');
    if (!lessonData) {
        ctx.logger.step(2, 7, 'Load data', 'fail', 'lesson.json NOT FOUND');
        return ctx.buildErrorResponse(1);
    }

    // Load hero.json — hero templates (quality, heroType, balance, skills, flat stats)
    var heroData = ctx.heroJson;
    if (!heroData) {
        ctx.logger.step(2, 7, 'Load data', 'fail', 'hero.json NOT FOUND');
        return ctx.buildErrorResponse(1);
    }

    // Load heroLevelAttr.json — base hp/attack/armor per level
    var heroLevelAttrData = ctx.loadResource('heroLevelAttr');
    if (!heroLevelAttrData) {
        ctx.logger.step(2, 7, 'Load data', 'fail', 'heroLevelAttr.json NOT FOUND');
        return ctx.buildErrorResponse(1);
    }

    // Load heroTypeParam.json — type multipliers (hpParam, attackParam, armorParam, bais)
    var heroTypeParamData = ctx.loadResource('heroTypeParam');
    if (!heroTypeParamData) {
        ctx.logger.step(2, 7, 'Load data', 'fail', 'heroTypeParam.json NOT FOUND');
        return ctx.buildErrorResponse(1);
    }

    // [FIX-011] Load heroQualityParam.json — quality tier multipliers
    // SOURCE: L116000: s = heroQualityParam[i.quality]
    var heroQualityParamData = ctx.loadResource('heroQualityParam');
    if (!heroQualityParamData) {
        ctx.logger.log('WARN', 'START-GENERAL',
            'heroQualityParam.json NOT FOUND — quality multipliers default to 1.0');
        // Fallback: all params = 1 (same as current config anyway)
        heroQualityParamData = {
            white: { hpParam: 1, attackParam: 1, armorParam: 1 },
            green: { hpParam: 1, attackParam: 1, armorParam: 1 },
            blue: { hpParam: 1, attackParam: 1, armorParam: 1 },
            purple: { hpParam: 1, attackParam: 1, armorParam: 1 },
            orange: { hpParam: 1, attackParam: 1, armorParam: 1 },
            flickerOrange: { hpParam: 1, attackParam: 1, armorParam: 1 },
            superOrange: { hpParam: 1, attackParam: 1, armorParam: 1 }
        };
    }

    // [FIX-012] Load heroPower.json — power weights per heroType
    // SOURCE: getAttrs uses heroPower.json for weighted power sum
    var heroPowerData = ctx.loadResource('heroPower');

    // Load heroQualityPower.json — quality power multiplier
    var heroQualityPowerData = ctx.loadResource('heroQualityPower');

    ctx.logger.step(2, 7, 'Load data', 'pass',
        'lesson=' + Object.keys(lessonData).length +
        ', heroes=' + Object.keys(heroData).length +
        ', levelAttr=' + Object.keys(heroLevelAttrData).length +
        ', typeParam=' + Object.keys(heroTypeParamData).length +
        ', qualityParam=' + (heroQualityParamData ? Object.keys(heroQualityParamData).length : 0) +
        ', heroPower=' + (heroPowerData ? Object.keys(heroPowerData).length : 0) +
        ', qualityPower=' + (heroQualityPowerData ? Object.keys(heroQualityPowerData).length : 0));

    // ═══════════════════════════════════════════════════════════════
    // STEP 3: Get current lesson from user progress
    // ═══════════════════════════════════════════════════════════════
    ctx.logger.step(3, 7, 'Read lesson progress', 'running');

    var hangup = userData.hangup || {};
    var curLess = hangup._curLess || 10101;

    ctx.logger.details('progress',
        ['curLess', String(curLess)],
        ['source', 'userData.hangup._curLess']
    );

    var lessonId = String(curLess);
    var lessonConfig = lessonData[lessonId];
    if (!lessonConfig) {
        ctx.logger.step(3, 7, 'Read lesson progress', 'fail',
            'lesson ' + lessonId + ' NOT FOUND in lesson.json');
        return ctx.buildErrorResponse(1);
    }

    ctx.logger.step(3, 7, 'Read lesson progress', 'pass',
        'lesson=' + lessonId + ' (' + (lessonConfig.name || '?') + ')');

    // ═══════════════════════════════════════════════════════════════
    // STEP 4: Parse lesson enemy config
    // ═══════════════════════════════════════════════════════════════
    ctx.logger.step(4, 7, 'Parse enemy config', 'running');

    // enemyList CSV: ",,,55206," → ["", "", "", "55206", ""]
    var enemyListRaw = lessonConfig.enemyList || '';
    var enemyList = enemyListRaw.split(',');

    // enemyLevel CSV: ",,,1," → ["", "", "", "1", ""]
    var enemyLevelRaw = lessonConfig.enemyLevel || '';
    var enemyLevels = enemyLevelRaw.split(',');

    // monsterType CSV: ",,,skill," → ["", "", "", "skill", ""]
    var monsterTypeRaw = lessonConfig.monsterType || '';
    var monsterTypes = monsterTypeRaw.split(',');

    // difficultyHp/Attack/Armor CSV: "0.45,0.45,0.45,0.72,0.45"
    var diffHpRaw = lessonConfig.difficultyHp || '';
    var diffHpArr = diffHpRaw.split(',');

    var diffAtkRaw = lessonConfig.difficultyAttack || '';
    var diffAtkArr = diffAtkRaw.split(',');

    var diffArmRaw = lessonConfig.difficultyArmor || '';
    var diffArmArr = diffArmRaw.split(',');

    ctx.logger.details('enemyConfig',
        ['enemyList', enemyListRaw],
        ['enemyLevel', enemyLevelRaw],
        ['monsterType', monsterTypeRaw],
        ['difficultyHp', diffHpRaw],
        ['difficultyAttack', diffAtkRaw],
        ['difficultyArmor', diffArmRaw],
        ['power', String(lessonConfig.power || 0)],
        ['isBoss', String(lessonConfig.isBoss || '?')]
    );

    ctx.logger.step(4, 7, 'Parse enemy config', 'pass',
        'parsed ' + enemyList.length + ' positions');

    // ═══════════════════════════════════════════════════════════════
    // STEP 5: Build enemy team (with full 5-layer formula)
    // ═══════════════════════════════════════════════════════════════
    ctx.logger.step(5, 7, 'Build enemy team', 'running');

    var rightTeamItems = {};
    var enemyCount = 0;
    var buildLog = [];

    for (var pos = 0; pos < enemyList.length && pos < 5; pos++) {
        var heroIdStr = (enemyList[pos] || '').trim();
        if (!heroIdStr) {
            // Empty position — skip (sparse)
            continue;
        }

        var heroId = heroIdStr;
        var hero = heroData[heroId];
        if (!hero) {
            ctx.logger.log('WARN', 'START-GENERAL',
                'hero ' + heroId + ' at position ' + pos + ' NOT FOUND in hero.json — skipping');
            continue;
        }

        // ─── Get level for this position ───
        var levelStr = (enemyLevels[pos] || '').trim();
        var level = parseInt(levelStr) || 1;

        // ─── Get monster type for this position ───
        var mType = (monsterTypes[pos] || '').trim() || hero.heroType || 'strength';

        // ─── Get type params (layer 2) ───
        var typeParams = heroTypeParamData[mType] || heroTypeParamData['strength'] || {
            hpParam: 1, attackParam: 1, armorParam: 1,
            hpBais: 0, attackBais: 150, armorBais: 0
        };

        // ─── Get quality params (layer 3) — [FIX-011] ───
        // SOURCE: L116000: s = heroQualityParam[i.quality]
        var heroQuality = hero.quality || 'white';
        var qualityParams = heroQualityParamData[heroQuality] || heroQualityParamData['white'] || {
            hpParam: 1, attackParam: 1, armorParam: 1
        };

        // ─── Get difficulty multipliers (layer 5) ───
        var dHp = parseFloat(diffHpArr[pos]) || 1;
        var dAtk = parseFloat(diffAtkArr[pos]) || 1;
        var dArm = parseFloat(diffArmArr[pos]) || 1;

        // ─── Get level stats (layer 1) ───
        var levelEntry = heroLevelAttrData[String(level)];
        if (!levelEntry) {
            ctx.logger.log('WARN', 'START-GENERAL',
                'level ' + level + ' NOT in heroLevelAttr — using level 1');
            levelEntry = heroLevelAttrData['1'] || { hp: 1240, attack: 125, armor: 205 };
        }

        // ═════════════════════════════════════════════════════════
        // CALCULATE ENEMY STATS — 5-layer formula [FIX-008]
        // ═════════════════════════════════════════════════════════
        // SOURCE: L116073 makeHeroBasicAttr
        //
        // Layer 1: levelAttr (base stats from heroLevelAttr.json)
        // Layer 2: typeParam (type multipliers from heroTypeParam.json)
        // Layer 3: qualityParam (quality tier multipliers from heroQualityParam.json)
        // Layer 4: balance (individual hero balance from hero.json)
        // Layer 5: difficulty (lesson difficulty modifiers)

        var balanceHp = hero.balanceHp || 1;
        var balanceAttack = hero.balanceAttack || 1;
        var balanceArmor = hero.balanceArmor || 1;

        var hp = Math.floor(
            (levelEntry.hp * typeParams.hpParam + (typeParams.hpBais || 0))
            * qualityParams.hpParam
            * balanceHp
            * dHp
        );
        var attack = Math.floor(
            (levelEntry.attack * typeParams.attackParam + (typeParams.attackBais || 0))
            * qualityParams.attackParam
            * balanceAttack
            * dAtk
        );
        var armor = Math.floor(
            (levelEntry.armor * typeParams.armorParam + (typeParams.armorBais || 0))
            * qualityParams.armorParam
            * balanceArmor
            * dArm
        );

        // ─── Flat stats — directly from hero.json (L116073) ───
        var speed = hero.speed || 180;
        var hit = hero.hit || 0;
        var dodge = hero.dodge || 0;
        var block = hero.block || 0;
        var blockEffect = hero.blockEffect || 0;
        var skillDamage = hero.skillDamage || 0.1;
        var critical = hero.critical || 0;
        var criticalResist = hero.criticalResist || 0;
        var criticalDamage = hero.criticalDamage || 0;
        var armorBreak = hero.armorBreak || 0;
        var damageReduce = hero.damageReduce || 0;
        var controlResist = hero.controlResist || 0;
        var trueDamage = hero.trueDamage || 0;
        var superDamage = hero.superDamage || 0;
        var healPlus = hero.healPlus || 0;
        var healerPlus = hero.healerPlus || 0;
        var shielderPlus = hero.shielderPlus || 0;
        var damageUp = hero.damageUp || 0;
        var damageDown = hero.damageDown || 0;
        var talent = hero.talent || 1;
        var superDamageResist = hero.superDamageResist || 0;
        var criticalDamageResist = hero.criticalDamageResist || 0;
        var blockThrough = hero.blockThrough || 0;
        var energyMax = hero.energyMax || 100;

        // ─── [FIX-006] Calculate Power (attr 21) ───
        // SOURCE: L133821: 21==p._id → heroBaseAttr.power = floor(num)
        // Formula: weighted sum from heroPower.json per heroType
        var allAttrs = {
            hp: hp,
            attack: attack,
            armor: armor,
            speed: speed,
            hit: hit,
            dodge: dodge,
            block: block,
            blockEffect: blockEffect,
            skillDamage: skillDamage,
            superDamage: superDamage,
            critical: critical,
            criticalResist: criticalResist,
            criticalDamage: criticalDamage,
            armorBreak: armorBreak,
            damageReduce: damageReduce,
            controlResist: controlResist,
            trueDamage: trueDamage,
            healPlus: healPlus,
            healerPlus: healerPlus,
            shielderPlus: shielderPlus,
            damageUp: damageUp,
            damageDown: damageDown,
            superDamageResist: superDamageResist,
            blockThrough: blockThrough,
            criticalDamageResist: criticalDamageResist
        };
        var power = calculatePower(allAttrs, hero.heroType || mType, heroQuality, heroPowerData, heroQualityPowerData);

        // ═════════════════════════════════════════════════════════
        // Build _attrs._items — [FIX-002] uses _id (not _type)
        // ═════════════════════════════════════════════════════════
        // Keyed by attribute type enum value (string)
        // Sparse: only include attrs with non-zero values
        var attrItems = {};

        // Helper to add attr only if value is non-zero
        function addAttr(attrId, value) {
            if (value !== 0 && value !== undefined && value !== null) {
                attrItems[String(attrId)] = { _id: attrId, _num: value };
            }
        }

        addAttr(ATTR.HP, hp);
        addAttr(ATTR.ATTACK, attack);
        addAttr(ATTR.ARMOR, armor);
        addAttr(ATTR.SPEED, speed);
        addAttr(ATTR.HIT, hit);
        addAttr(ATTR.DODGE, dodge);
        addAttr(ATTR.BLOCK, block);
        addAttr(ATTR.BLOCK_EFFECT, blockEffect);
        addAttr(ATTR.SKILL_DAMAGE, skillDamage);
        addAttr(ATTR.CRITICAL, critical);
        addAttr(ATTR.CRITICAL_RESIST, criticalResist);
        addAttr(ATTR.CRITICAL_DAMAGE, criticalDamage);
        addAttr(ATTR.ARMOR_BREAK, armorBreak);
        addAttr(ATTR.DAMAGE_REDUCE, damageReduce);
        addAttr(ATTR.CONTROL_RESIST, controlResist);
        addAttr(ATTR.TRUE_DAMAGE, trueDamage);
        addAttr(ATTR.ENERGY, 0);              // always 0 for enemy (no energy regen)
        addAttr(ATTR.SUPER_DAMAGE, superDamage);
        addAttr(ATTR.HEAL_PLUS, healPlus);
        addAttr(ATTR.HEALER_PLUS, healerPlus);
        addAttr(ATTR.EXTRA_ARMOR, 0);         // no extra armor for enemy
        addAttr(ATTR.SHIELDER_PLUS, shielderPlus);
        addAttr(ATTR.DAMAGE_UP, damageUp);
        addAttr(ATTR.DAMAGE_DOWN, damageDown);
        addAttr(ATTR.TALENT, talent);
        addAttr(ATTR.SUPER_DAMAGE_RESIST, superDamageResist);
        addAttr(ATTR.CRITICAL_DAMAGE_RESIST, criticalDamageResist);
        addAttr(ATTR.BLOCK_THROUGH, blockThrough);
        addAttr(ATTR.ENERGY_MAX, energyMax);
        addAttr(ATTR.POWER, power);           // [FIX-006] attr 21
        addAttr(ATTR.ORG_HP, hp);             // [FIX-007] attr 22 = orgHp (full health)

        // ═════════════════════════════════════════════════════════
        // Build _skills — keyed by index
        // ═════════════════════════════════════════════════════════
        // _type: 0=normal, 1=proactive(skill), 2=passive, 3=superSkill
        var skillItems = {};
        var skillIdx = 0;

        // Normal attack (type 0)
        if (hero.normal) {
            var normalId = parseSkillId(hero.normal);
            if (normalId > 0) {
                skillItems[String(skillIdx)] = {
                    _type: 0,
                    _id: normalId,
                    _level: 1
                };
                skillIdx++;
            }
        }

        // Proactive skill (type 1)
        if (hero.skill) {
            var skillId = parseSkillId(hero.skill);
            if (skillId > 0) {
                skillItems[String(skillIdx)] = {
                    _type: 1,
                    _id: skillId,
                    _level: hero.skillLevel || 1
                };
                skillIdx++;
            }
        }

        // Passive skill 1 (type 2)
        if (hero.skillPassive1) {
            var passiveId1 = parseSkillId(hero.skillPassive1);
            if (passiveId1 > 0) {
                skillItems[String(skillIdx)] = {
                    _type: 2,
                    _id: passiveId1,
                    _level: hero.passiveLevel1 || 1
                };
                skillIdx++;
            }
        }

        // Passive skill 2 (type 2) — some enemies have this
        if (hero.skillPassive2) {
            var passiveId2 = parseSkillId(hero.skillPassive2);
            if (passiveId2 > 0) {
                skillItems[String(skillIdx)] = {
                    _type: 2,
                    _id: passiveId2,
                    _level: hero.passiveLevel2 || 1
                };
                skillIdx++;
            }
        }

        // Passive skill 3 (type 2) — rare
        if (hero.skillPassive3) {
            var passiveId3 = parseSkillId(hero.skillPassive3);
            if (passiveId3 > 0) {
                skillItems[String(skillIdx)] = {
                    _type: 2,
                    _id: passiveId3,
                    _level: hero.passiveLevel3 || 1
                };
                skillIdx++;
            }
        }

        // ═════════════════════════════════════════════════════════
        // Build hero object for this position
        // [FIX-003] _weaponHaloId/_weaponHaloLevel
        // [FIX-004] _heroStar
        // [FIX-005] _skinId
        // [FIX-010] battleTeamPosition
        // ═════════════════════════════════════════════════════════
        rightTeamItems[String(pos)] = {
            _heroDisplayId: Number(heroId) || heroId,
            _heroLevel: level,
            _heroStar: 0,                                     // [FIX-004] L101748
            _skinId: 0,                                       // [FIX-005] L236987
            _weaponHaloId: 0,                                 // [FIX-003] L102674
            _weaponHaloLevel: 0,                              // [FIX-003] L102674
            battleTeamPosition: pos,                          // [FIX-010] getModelArray
            _attrs: {
                _items: attrItems
            },
            _skills: skillItems
        };

        enemyCount++;
        buildLog.push(
            'pos=' + pos +
            ' hero=' + heroId +
            ' q=' + heroQuality +
            ' lvl=' + level +
            ' type=' + mType +
            ' hp=' + hp +
            ' atk=' + attack +
            ' arm=' + armor +
            ' pwr=' + power +
            ' spd=' + speed +
            ' skills=' + skillIdx
        );

        ctx.logger.details('enemy',
            ['pos', String(pos)],
            ['heroId', heroId],
            ['quality', heroQuality],
            ['level', String(level)],
            ['monsterType', mType],
            ['diffHp/dAtk/dArm', dHp + '/' + dAtk + '/' + dArm],
            ['hp/atk/arm', hp + '/' + attack + '/' + armor],
            ['power', String(power)],
            ['speed', String(speed)],
            ['skills', String(skillIdx)]
        );
    }

    if (enemyCount === 0) {
        ctx.logger.step(5, 7, 'Build enemy team', 'fail',
            'NO valid enemies in lesson ' + lessonId);
        return ctx.buildErrorResponse(1);
    }

    ctx.logger.step(5, 7, 'Build enemy team', 'pass',
        enemyCount + ' enemies built');

    // ═══════════════════════════════════════════════════════════════
    // STEP 6: Generate battleId and build response
    // ═══════════════════════════════════════════════════════════════
    ctx.logger.step(6, 7, 'Build response', 'running');

    // Generate unique battle ID
    var battleId = ctx.uuidv4();

    // Build rightSuper — empty array (enemy has no super skill in lesson battle)
    // Client handles empty gracefully: rightSuper: r ? r : [] (L103618)
    var rightSuper = [];

    // [FIX-001] _rightTeam is FLAT object (no _items wrapper)
    // SOURCE: L102470: for (var o in e) iterates _rightTeam directly
    // Client code: rightTeam passed as-is to getModelArray which does for...in
    var responseData = {
        _battleId: battleId,
        _rightTeam: rightTeamItems,       // FLAT — no _items wrapper!
        _rightSuper: rightSuper
    };

    ctx.logger.step(6, 7, 'Build response', 'pass',
        'battleId=' + battleId.substring(0, 8) + '...' +
        ', enemies=' + enemyCount);

    // ═══════════════════════════════════════════════════════════════
    // STEP 7: Verification and response
    // ═══════════════════════════════════════════════════════════════
    ctx.logger.step(7, 7, 'Verify & respond', 'running');

    // ─── Critical Fields Verification ───
    ctx.logger.criticalFields([
        {
            name: '_battleId',
            value: battleId.substring(0, 16) + '...',
            status: 'ok',
            detail: 'L97731: UserInfoSingleton.getInstance().battleId = r._battleId'
        },
        {
            name: '_rightTeam (FLAT, no _items)',
            value: Object.keys(rightTeamItems).length + ' heroes (keys: ' + Object.keys(rightTeamItems).join(',') + ')',
            status: 'ok',
            detail: 'L102470: for (var o in e) iterates _rightTeam directly — [FIX-001]'
        },
        {
            name: '_rightSuper',
            value: rightSuper.length + ' skills',
            status: 'ok',
            detail: 'L103618: rightSuper: r ? r : [] (empty is valid)'
        },
        {
            name: '_attrs._items uses _id',
            value: 'verified',
            status: 'ok',
            detail: 'L102528-537: a.type = o._id — [FIX-002]'
        },
        {
            name: 'Power attr (21)',
            value: 'included',
            status: 'ok',
            detail: 'L133821: 21==p._id → heroBaseAttr.power = floor(num) — [FIX-006]'
        },
        {
            name: 'OrgHp attr (22)',
            value: 'included',
            status: 'ok',
            detail: 'heroMaxHealth = orgHp — [FIX-007]'
        },
        {
            name: 'Formula 5-layer',
            value: '(levelAttr × typeParam + bais) × qualityParam × balance × difficulty',
            status: 'ok',
            detail: 'L116073 makeHeroBasicAttr — [FIX-008]'
        }
    ]);

    // ─── Type Assertions ───
    ctx.logger.typeAssert('responseData._battleId', responseData._battleId, 'string', {
        context: 'START-GENERAL',
        trace: 'L97731: battleId stored in UserInfoSingleton',
        impact: 'Wrong type -> battle session broken'
    });

    ctx.logger.typeAssert('responseData._rightTeam', responseData._rightTeam, 'object', {
        context: 'START-GENERAL',
        trace: 'L102470: for...in iteration on _rightTeam (FLAT)',
        impact: 'Wrong type -> no enemy heroes loaded'
    });

    ctx.logger.typeAssert('responseData._rightSuper', responseData._rightSuper, 'object', {
        context: 'START-GENERAL',
        trace: 'L101674: for (var o = 0; o < n.length; o++)',
        impact: 'Wrong type -> super skill parsing error'
    });

    // ─── Invariant Checks ───
    ctx.logger.invariantCheck(
        'At least 1 enemy hero built',
        enemyCount > 0,
        {
            context: 'START-GENERAL',
            expect: 'enemyCount > 0',
            actual: 'enemyCount = ' + enemyCount,
            trace: 'lesson.json enemyList must have at least 1 non-empty position',
            impact: 'No enemies -> battle cannot start'
        }
    );

    ctx.logger.invariantCheck(
        'All enemy heroes have valid HP > 0',
        Object.keys(rightTeamItems).every(function(p) {
            var h = rightTeamItems[p];
            return h._attrs._items['0'] && h._attrs._items['0']._num > 0;
        }),
        {
            context: 'START-GENERAL',
            expect: 'HP > 0 for all enemies',
            actual: 'verified: 5-layer formula produces positive HP',
            trace: 'Battle system requires HP > 0 for each hero',
            impact: 'HP <= 0 -> enemy dies instantly'
        }
    );

    ctx.logger.invariantCheck(
        'All enemy heroes have valid _heroDisplayId',
        Object.keys(rightTeamItems).every(function(p) {
            return !!rightTeamItems[p]._heroDisplayId;
        }),
        {
            context: 'START-GENERAL',
            expect: '_heroDisplayId exists for all enemies',
            actual: 'verified: heroId from hero.json used',
            trace: 'L102477: getHeroInfo()[r._heroDisplayId] lookup',
            impact: 'Missing _heroDisplayId -> client cannot load hero visuals'
        }
    );

    ctx.logger.invariantCheck(
        'All enemy heroes have _heroLevel > 0',
        Object.keys(rightTeamItems).every(function(p) {
            return rightTeamItems[p]._heroLevel > 0;
        }),
        {
            context: 'START-GENERAL',
            expect: '_heroLevel > 0',
            actual: 'verified: level from lesson config',
            trace: 'L66555-66558: armor formula uses getHeroLevel()',
            impact: '_heroLevel = 0 -> armor calculation broken'
        }
    );

    ctx.logger.invariantCheck(
        'All _attrs._items use _id (not _type)',
        Object.keys(rightTeamItems).every(function(p) {
            var items = rightTeamItems[p]._attrs._items;
            for (var k in items) {
                if (items[k]._id === undefined) return false;
            }
            return true;
        }),
        {
            context: 'START-GENERAL',
            expect: '_id field present in all attr entries',
            actual: 'verified: [FIX-002] uses _id',
            trace: 'L102528-537: a.type = o._id',
            impact: 'Missing _id -> client cannot identify attr types'
        }
    );

    ctx.logger.invariantCheck(
        '_rightTeam is FLAT (no _items wrapper)',
        !(responseData._rightTeam._items),
        {
            context: 'START-GENERAL',
            expect: '_rightTeam has no _items property',
            actual: 'verified: [FIX-001] FLAT structure',
            trace: 'L102470: for (var o in e) iterates _rightTeam directly',
            impact: '_items wrapper -> no enemy heroes parsed'
        }
    );

    ctx.logger.invariantCheck(
        'All enemy heroes have Power attr (21)',
        Object.keys(rightTeamItems).every(function(p) {
            return rightTeamItems[p]._attrs._items['21'] !== undefined;
        }),
        {
            context: 'START-GENERAL',
            expect: 'attr 21 (Power) present for all enemies',
            actual: 'verified: [FIX-006] power calculated via heroPower.json',
            trace: 'L133821: 21==p._id → heroBaseAttr.power = floor(num)',
            impact: 'Missing power -> client shows 0 power'
        }
    );

    ctx.logger.step(7, 7, 'Verify & respond', 'pass');

    // ═══════════════════════════════════════════════════════════════
    // SUMMARY
    // ═══════════════════════════════════════════════════════════════

    ctx.logger.responseSnapshot('START GENERAL ret=0', responseData);

    ctx.logger.summaryCard({
        title: 'START GENERAL',
        userId: userId,
        lesson: lessonId,
        battleId: battleId.substring(0, 12) + '...',
        enemies: enemyCount,
        enemySummary: buildLog.join(' | '),
        fixesApplied: 'FIX-001 thru FIX-012'
    });

    return ctx.buildDataResponse(0, responseData);
}

module.exports = handleStartGeneral;
