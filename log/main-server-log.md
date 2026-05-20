[DB] Loaded 5 records from /var/www/html/server/main-server/data/main_server.json (64374 bytes)
🟢 23:34:19 INFO  📋 CONFIG   ▸ serverOpenDate auto-initialized: 1779320059452

  ──────────────────── LOADING RESOURCES ────────────────────

🟢 23:34:19 INFO  📋 CONFIG   ▸ Resource loaded: constant.json
     ├─ entries: 1
     ├─ bytes: 17728
     └─ path: /var/www/html/resource/json/constant.json
🟢 23:34:19 INFO  📋 CONFIG   ▸ Resource loaded: hero.json
     ├─ entries: 887
     ├─ bytes: 1467869
     └─ path: /var/www/html/resource/json/hero.json
🟢 23:34:19 INFO  📋 CONFIG   ▸ Resource loaded: summon.json
     ├─ entries: 4
     ├─ bytes: 736
     └─ path: /var/www/html/resource/json/summon.json
🟢 23:34:19 INFO  📋 CONFIG   ▸ Resource loaded: heroLevelAttr.json
     ├─ entries: 360
     ├─ bytes: 32275
     └─ path: /var/www/html/resource/json/heroLevelAttr.json
🟢 23:34:19 INFO  📋 CONFIG   ▸ Resource loaded: heroTypeParam.json
     ├─ entries: 13
     ├─ bytes: 2241
     └─ path: /var/www/html/resource/json/heroTypeParam.json
🟢 23:34:19 INFO  📋 CONFIG   ▸ Resource loaded: heroQualityParam.json
     ├─ entries: 7
     ├─ bytes: 746
     └─ path: /var/www/html/resource/json/heroQualityParam.json
🟢 23:34:19 INFO  📋 CONFIG   ▸ Resource loaded: heroPower.json
     ├─ entries: 403
     ├─ bytes: 43864
     └─ path: /var/www/html/resource/json/heroPower.json
🟢 23:34:19 INFO  📋 CONFIG   ▸ Resource loaded: zPowerQualityPara.json
     ├─ entries: 7
     ├─ bytes: 484
     └─ path: /var/www/html/resource/json/zPowerQualityPara.json

══════════════════════════════════════════════════════════════════

══════════════════════════════════════════════════════════════════
  🎮 SUPER WARRIOR Z — MAIN SERVER
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
  🛡️  CONFIG AUDIT  4 issues at startup
══════════════════════════════════════════════════════════════════
     ❌ serverVersion
          📎 impact : Client displays no/wrong version info
          🔧 fix    : config.serverVersion = "2026-05-15"
     ⚠️ sdkUrl
          📎 impact : SDK-Server authentication will fail
          🔧 fix    : config.sdkUrl = "http://127.0.0.1:9999"
     ⚠️ chatUrl
          📎 impact : Chat won't work in production (hardcoded localhost)
          🔧 fix    : Use process.env.CHAT_URL or env config
     ⚠️ dungeonUrl
          📎 impact : Dungeon won't work in production (hardcoded localhost)
          🔧 fix    : Use process.env.DUNGEON_URL or env config
══════════════════════════════════════════════════════════════════

  │  Port             : 8001
  │  Socket.IO        : 2.5.1
  │  TEA              : ON (verification)
  │  DB               : /var/www/html/server/main-server/data/main_server.json
  │  SDK API          : http://127.0.0.1:9999
  │  server0Time      : 25200000
  │  serverOpenDate   : 1779320059452
  │  resourcePath     : /var/www/html/resource/json
  │  chatUrl          : http://127.0.0.1:8002
  │  dungeonUrl       : http://127.0.0.1:8003
  └─ LOG_LEVEL        : INFO

══════════════════════════════════════════════════════════════════


  ──────────────────── RESOURCE JSON STATUS ────────────────────

  │  constant.json            : 1 entries
  │  hero.json                : 887 entries
  │  summon.json              : 4 entries
  │  heroLevelAttr.json       : 360 entries
  │  heroTypeParam.json       : 13 entries
  │  heroQualityParam.json    : 7 entries
  │  zPowerQualityPara.json   : 7 entries
  └─ heroPower.json           : 403 entries

  ──────────────────── REGISTERED HANDLERS ────────────────────


  ├─ >> user::enterGame  handlers/user/enterGame.js
  ├─ >> user::registChat  handlers/user/registChat.js
  ├─ >> user::getBulletinBrief  handlers/user/getBulletinBrief.js
  ├─ >> user::readBulletin  handlers/user/readBulletin.js
  ├─ >> friend::friendServerAction  handlers/friend/friendServerAction.js
  ├─ >> heroImage::getAll  handlers/heroImage/getAll.js
  ├─ >> hero::getAttrs  handlers/hero/getAttrs.js
  ├─ >> hero::autoLevelUp  handlers/hero/autoLevelUp.js
  ├─ >> userMsg::getMsgList  handlers/userMsg/getMsgList.js
  ├─ >> userMsg::getMsg  handlers/userMsg/getMsg.js
  ├─ >> userMsg::sendMsg  handlers/userMsg/sendMsg.js
  ├─ >> userMsg::readMsg  handlers/userMsg/readMsg.js
  ├─ >> userMsg::delFriendMsg  handlers/userMsg/delFriendMsg.js
  ├─ >> guide::saveGuide  handlers/guide/saveGuide.js
  ├─ >> hangup::saveGuideTeam  handlers/hangup/saveGuideTeam.js
  ├─ >> hangup::startGeneral  handlers/hangup/startGeneral.js
  ├─ >> hangup::checkBattleResult  handlers/hangup/checkBattleResult.js
  ├─ >> hangup::gain  handlers/hangup/gain.js
  ├─ >> activity::getActivityBrief  handlers/activity/getActivityBrief.js
  ├─ >> buryPoint::guideBattle  handlers/buryPoint/guideBattle.js
  ├─ >> summon::summonOneFree  handlers/summon/summonOneFree.js
  ├─ >> equip::wearAuto  handlers/equip/wearAuto.js
  └─ >> battle::getRandom  handlers/battle/getRandom.js

     └─ total: 23

══════════════════════════════════════════════════════════════════


🟢 23:34:19 INFO  🚀 SERVER   ▸ Ready — listening on http://127.0.0.1:8001
🟢 23:34:19 INFO  🚀 SERVER   ▸ Waiting for Socket.IO connections...

══════════════════════════════════════════════════════════════════
  🔗⚡ Client connected  mQxVEBxRASeU...  📍 ::ffff:127.0.0.1  📡 polling
🟢 23:34:36 INFO  🔐 TEA      ▸ Sending verify challenge
     ├─ challenge: 806c77c2-14a5-4435-8085-c39fce589df1
     └─ socketId: mQxVEBxRASeU17vC...
     ├─ type: string
     └─ length: 48
🟢 23:34:36 INFO  🔐 TEA      ▸ TEA verification SUCCESS
     ├─ socketId: mQxVEBxRASeU17vC...
     ├─ duration: 4ms
     └─ transport: polling
     ├─ socketId: mQxVEBxRASeU17vC...
     ├─ from: polling
     └─ to: websocket
══════════════════════════════════════════════════════════════════
▼ [1] 👤 user::enterGame  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: user
     ├─ action ............: enterGame
     ├─ userId ............: guest_093786dcde975077
     └─ serverId ..........: 1
🟢 23:34:36 INFO  ⚔️ ENTER    ▸ enterGame REQUEST RECEIVED
     ├─ userId: guest_093786dcde975077
     ├─ serverId: 1
     ├─ loginToken: 90e96ce3c07e99d...
     └─ gameVersion: 2026-03-02143147
     🔄 [1/10] Required fields check .
     ✅ [1/10] Required fields check .All present
     🔄 [2/10] Token auth via SDK-Server .
🟢 23:34:36 INFO  📡 SDKAPI   ▸ User verified via SDK-Server
     ├─ userId: guest_093786dcde975077
     ├─ httpStatus: 200
     ├─ bodySize: 268 bytes
     └─ duration: 19ms
     ✅ [2/10] Token auth via SDK-Server .22ms ✅
     🔄 [3/10] ServerId validation .
     ✅ [3/10] ServerId validation .1 == 1 ✅
     🔄 [4/10] User existence check .
     🌟 [4/10] User existence check .NEW USER 🌟
     🔄 [5/10] Build user data ..
🟢 23:34:36 INFO  📋 CONFIG   ▸ Resource loaded: task.json
     ├─ entries: 44
     ├─ bytes: 22978
     └─ path: /var/www/html/resource/json/task.json
     ├─ constantKeys: 505
     ├─ heroEntries: 887
     ├─ summonPools: 4
     └─ taskEntries: 44
     ├─ startHero: 1205
     ├─ startHeroLevel: 3
     ├─ heroInstanceId: e6e8872e-16f...
     ├─ heroConfigFound: true
     └─ heroName: hero_name_15
     ├─ startDiamond: 0
     ├─ startGold: 0
     ├─ startUserExp: 0
     └─ startUserLevel: 1
     ├─ types: 1,2,4,5,6,7,8
     └─ values: 2,2,2,2,2,2,2
🟢 23:34:36 INFO  📋 CONFIG   ▸ Resource loaded: thingsID.json
     ├─ entries: 1636
     ├─ bytes: 884038
     └─ path: /var/www/html/resource/json/thingsID.json
     ├─ _heroId: e6e8872e-16f...
     ├─ _heroDisplayId: 1205
     ├─ _level: 3
     └─ _heroStar: 0
     ✅ [5/10] Build user data ..100 keys (43ms)
     🔄 [6/10] Circular reference check .
     ✅ [6/10] Circular reference check .0 circular refs ✅
     🔄 [7/10] Structure validation .

     🔒 CRITICAL FIELDS AUDIT — game will crash/stuck if wrong
     ├─ 🔒 lastTeam[9]._team        = {0}  EMPTY — tutorial safe (guide 2106)
     ├─ 🔒 training._award          = null  present — FIX-001 safe
     ├─ 🔒 user._attribute._items[104] = present  Level=1
     ├─ 🔒 imprint._items           = Object{}  FIX-005: client L114925 uses for...in → needs Object
     ├─ 🔒 weapon._items            = Object{}  FIX-005: client L130938 uses for...in → needs Object
     └─ 🔒 genki._items             = Object{}  FIX-005: client L132158 uses for...in → needs Object
     ✅ CRITICAL AUDIT: 6/6 PASSED
     ✅ [7/10] Structure validation .100 keys audited
     🔄 [8/10] JSON serialization test .
     ✅ [8/10] JSON serialization test .OK (10,122 bytes)
     🔄 [9/10] Database save ....
[DB] saveUser("guest_093786..."): 100 keys, 10122 bytes
     ✅ [9/10] Database save ....3ms 💾
     🔄 [10/10] Response build ..
     ├─ original: 10122 chars
     ├─ compressed: 2391 chars
     ├─ reduction: 76%
     └─ threshold: 1024 chars
     ✅ [10/10] Response build ..OK 📤

     🏏️ SUMMARY
     👤 User ......... guest_093786dcde975077
     🦸 Heroes ........ 1
     🏆 Level ......... 1
     💎 Diamond ....... 0
     📦 Fields ........ 100
     ⏱️  Duration ..... 197ms
     📦 Data .......... 2,391 chars (LZ)


     📸 ENTER GAME ret=0
     ├─   user                         Object{20}
     ├─   heros                        Object{4}
     ├─   hangup                       Object{16}
     ├─   totalProps                   Object{1}
     ├─   backpackLevel                1
     ├─   imprint                      Object{2}
     ├─   weapon                       Object{2}
     ├─   summon                       Object{7}
     ├─   dungeon                      Object{2}
     ├─   equip                        Object{2}
     ├─   scheduleInfo                 Object{53}
     ├─   timesInfo                    Object{12}
     ├─   serverVersion                ""
     ├─   serverId                     1
     ├─   serverOpenDate               1779320059452
     ├─   newUser                      true
     ├─   currency                     "USD"
     ├─   lastTeam                     Object{2}
     ├─   superSkill                   Object{2}
     ├─   giftInfo                     Object{11}
     ├─   guide                        Object{2}
     ├─   userGuild                    Object{3}
     ├─   userGuildPub                 Object{8}
     ├─   expedition                   Object{7}
     ├─   retrieve                     Object{7}
     ├─   battleMedal                  Object{11}
     ├─   training                     Object{9}
     ├─   heroSkin                     Object{3}
     ├─   userWar                      Object{9}
     ├─   userBallWar                  Object{6}
     ├─   headEffect                   Object{4}
     ├─   userTopBattle                Object{10}
     ├─   topBattleInfo                Object{4}
     ├─   checkin                      Object{5}
     ├─   curMainTask                  Object{1}
     ├─   summonLog                    Array[0] ⚠️ EMPTY
     ├─   vipLog                       Array[0] ⚠️ EMPTY
     ├─   cardLog                      Array[0] ⚠️ EMPTY
     ├─   onlineBulletin               Array[0] ⚠️ EMPTY
     ├─   broadcastRecord              Array[0] ⚠️ EMPTY
     ├─   blacklist                    Object{0}
     ├─   forbiddenChat                Object{2}
     ├─   guildLevel                   0
     ├─   guildTreasureMatchRet        0
     ├─   dragonEquiped                Object{0}
     ├─   warInfo                      null ⚠️ NULL
     ├─   ballWarState                 0
     ├─   enableShowQQ                 false
     ├─   showQQVip                    0
     ├─   showQQ                       0
     ├─   showQQImg1                   ""
     ├─   showQQImg2                   ""
     ├─   showQQUrl                    ""
     ├─   cellgameHaveSetHero          false
     ├─   globalWarBuffTag             ""
     ├─   globalWarLastRank            Object{0}
     ├─   globalWarBuff                0
     ├─   globalWarBuffEndTime         0
     ├─   guildName                    ""
     ├─   guildActivePoints            Object{0}
     ├─   ballBroadcast                null ⚠️ NULL
     ├─   ballWarInfo                  Object{4}
     ├─   teamTraining                 Object{4}
     ├─   teamServerHttpUrl            ""
     ├─   teamDungeonOpenTime          0
     ├─   teamDungeonTask              Object{3}
     ├─   teamDungeonSplBcst           null ⚠️ NULL
     ├─   teamDungeonNormBcst          null ⚠️ NULL
     ├─   teamDungeonHideInfo          null ⚠️ NULL
     ├─   teamDungeon                  Object{3}
     ├─   teamDungeonInvitedFriends    null ⚠️ NULL
     ├─   myTeamServerSocketUrl        "http://127.0.0.1:8003"
     ├─   shopNewHeroes                Object{0}
     ├─   channelSpecial               Object{15}
     ├─   hideHeroes                   Array[0] ⚠️ EMPTY
     ├─   templeLess                   0
     ├─   timeTrial                    Object{9}
     ├─   timeTrialNextOpenTime        0
     ├─   YouTuberRecruit              Object{7}
     ├─   userYouTuberRecruit          Object{2}
     ├─   heroImageVersion             0
     ├─   superImageVersion            0
     ├─   karinStartTime               0
     ├─   karinEndTime                 0
     ├─   timeBonusInfo                Object{2}
     ├─   monthCard                    Object{2}
     ├─   recharge                     Object{2}
     ├─   userDownloadReward           Object{4}
     ├─   clickSystem                  Object{2}
     ├─   questionnaires               null ⚠️ NULL
     ├─   littleGame                   Object{3}
     ├─   genki                        Object{4}
     ├─   gemstone                     Object{1}
     ├─   resonance                    Object{6}
     ├─   fastTeam                     Object{1}
     ├─   gravity                      Object{0}
     ├─   timeMachine                  Object{1}
     ├─   _arenaTeam                   Object{0}
     ├─   _arenaSuper                  Array[0] ⚠️ EMPTY
     └─   mergedServers                Array[0] ⚠️ EMPTY

     📤 RESPONSE
     ├─ ret ...............: 0
     ├─ fields ............: (raw string)
     └─ size ..............: 2,391 chars (LZ)

     ⏱️  TIMING
     └─ Total .............: 205ms  ████████████████████
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
▼ [2] 👤 user::getBulletinBrief  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: user
     ├─ action ............: getBulletinBrief
     ├─ userId ............: guest_093786dcde975077
     └─ serverId ..........: (missing)
     🔄 [1/2] Validate request fields .
     └─ userId: guest_093786dcde9750
     ✅ [1/2] Validate request fields .userId OK
     🔄 [1/1] Load global bulletin data .
     ├─ source: ctx.db.getGlobal("bulletinBrief")
     └─ entryCount: 0
     ✅ [1/1] Load global bulletin data .0 entries loaded
     🔄 [1/1] Type assert request fields .
     ✅ [1/1] Type assert request fields .type verified
     🔄 [1/1] Snapshot bulletin state .
     ├─ bulletinCount: 0
     └─ bulletinIds: (empty)
     ✅ [1/1] Snapshot bulletin state .0 bulletins in global store
     🔄 [1/2] Validate business rules .
     ✅ [1/2] Validate business rules .invariants checked
     🔄 [1/1] Build _brief object (strip body field) .
     ✅ [1/1] Build _brief object (strip body field) .0 bulletins (body stripped)
     ├─ status: read-only, no mutations
     └─ reason: bulletin data is global — only read and returned
     ├─ status: no DB save (read-only handler)
     └─ reason: bulletin brief is global data — no user data changes

     🔒 CRITICAL FIELDS AUDIT — game will crash/stuck if wrong
     └─ 🔒 _brief                   = Object{0}  L121094: for(var o in n._brief) iterates each bulletin
     ✅ CRITICAL AUDIT: 1/1 PASSED

     📸 getBulletinBrief ret=0
     └─   _brief                       Object{0}

     🏏️ SUMMARY
     👤 User ......... guest_093786dcde975077
     📦 Data .......... 0 chars (RAW)


     📤 RESPONSE
     ├─ ret ...............: 0
     ├─ fields ............: (raw string)
     └─ size ..............: 13 chars (RAW)

     ⏱️  TIMING
     └─ Total .............: 4ms  
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
▼ [3] 🤝 friend::friendServerAction  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: friend
     ├─ action ............: friendServerAction
     ├─ userId ............: guest_093786dcde975077
     └─ serverId ..........: (missing)
     🔄 [1/2] Route relay action .
     ├─ userId: guest_093786dcde9750
     ├─ relayAction: queryFriends
     └─ extraFields: (none)
     ✅ [1/2] Route relay action .relayAction="${relayAction}"
     🔄 [2/2] Handle queryFriends .
     ✅ [2/2] Handle queryFriends .0 friends

     📤 RESPONSE
     ├─ ret ...............: 0
     ├─ fields ............: (raw string)
     └─ size ..............: 12 chars (RAW)

     ⏱️  TIMING
     └─ Total .............: 5ms  
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
▼ [4] 🤝 friend::friendServerAction  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: friend
     ├─ action ............: friendServerAction
     ├─ userId ............: guest_093786dcde975077
     └─ serverId ..........: (missing)
     🔄 [1/2] Route relay action .
     ├─ userId: guest_093786dcde9750
     ├─ relayAction: queryBlackList
     └─ extraFields: (none)
     ✅ [1/2] Route relay action .relayAction="${relayAction}"
     🔄 [2/2] Handle queryBlackList .
     ✅ [2/2] Handle queryBlackList .0 entries

     📤 RESPONSE
     ├─ ret ...............: 0
     ├─ fields ............: (raw string)
     └─ size ..............: 12 chars (RAW)

     ⏱️  TIMING
     └─ Total .............: 9ms  
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
▼ [5] 🖼️ heroImage::getAll  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: heroImage
     ├─ action ............: getAll
     ├─ userId ............: guest_093786dcde975077
     └─ serverId ..........: (missing)
     🔄 [1/2] Validate request fields .
     └─ userId: guest_093786dcde9750
     ✅ [1/2] Validate request fields .userId OK
     🔄 [1/1] Load userData from DB .
     ├─ heros: exists
     └─ heros._heros: exists
     ✅ [1/1] Load userData from DB .userData loaded
     🔄 [1/1] Type assert request fields .
     ✅ [1/1] Type assert request fields .type verified
     🔄 [1/1] Snapshot hero collection state .
     ├─ heroCount: 1
     └─ heroIds: e6e8872e-16f1-4ca3-bef2-4bba35e93356
     ✅ [1/1] Snapshot hero collection state .1 heroes in collection
     🔄 [1/2] Validate business rules .
     ✅ [1/2] Validate business rules .invariants checked
     🔄 [1/1] Build hero image data .
     ✅ [1/1] Build hero image data .1 hero(es)
     ├─ status: read-only, no mutations
     └─ reason: hero image data is derived from userData.heros — no writes
     ├─ status: no DB save (read-only handler)
     └─ reason: hero image list is a read-only view of hero collection

     🔒 CRITICAL FIELDS AUDIT — game will crash/stuck if wrong
     └─ 🔒 _heros                   = Object{1}  L134363: for(var n in e._heros) → Object, each has _id/_maxLevel/_selfComments
     ✅ CRITICAL AUDIT: 1/1 PASSED

     📸 getAll ret=0
     └─   _heros                       Object{1}

     🏏️ SUMMARY
     👤 User ......... guest_093786dcde975077
     📦 Fields ........ 1
     📦 Data .......... 0 chars (RAW)


     📤 RESPONSE
     ├─ ret ...............: 0
     ├─ fields ............: (raw string)
     └─ size ..............: 97 chars (RAW)

     ⏱️  TIMING
     └─ Total .............: 5ms  
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
▼ [6] 🦸 hero::getAttrs  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: hero
     ├─ action ............: getAttrs
     ├─ userId ............: guest_093786dcde975077
     └─ serverId ..........: (missing)
     🔄 [1/2] Get hero attrs ....
     ├─ userId: guest_093786dcde9750
     └─ heros: e6e8872e-16f1-4ca3-bef2-4bba35e93356
     ✅ [1/2] Get hero attrs ....1 hero(es) requested
     🔄 [2/2] Calculate hero attributes .
     ├─ heroId: e6e8872e-16f1-4ca3-bef2-4bba35e93356
     ├─ displayId: 1205
     └─ level: 3
     ├─ heroType: critical
     ├─ weightedSum: 2312.0
     └─ power: 2312
     ├─ hp: 1260
     ├─ attack: 462
     ├─ armor: 214
     └─ power: 2312
     ✅ [2/2] Calculate hero attributes .1 heroes calculated

     🔒 CRITICAL FIELDS AUDIT — game will crash/stuck if wrong
     ├─ 🔒 _attrs                   = Object{1}  L133726: for(var o in t._attrs) — keyed by hero index, each has _items with calculated attrs
     ├─ 🔒 _baseAttrs               = Object{1}  L133731: t._baseAttrs[o] — keyed by hero index, each has _items with base attrs (before talent)
     └─ 🔒 POWER (attr 21)          = calculated per hero  L133821: 21==p._id → heroBaseAttr.power = floor(num)
     ✅ CRITICAL AUDIT: 3/3 PASSED

     🏏️ SUMMARY
     👤 User ......... guest_093786dcde975077
     📦 Fields ........ 2
     ⏱️  Duration ..... 0ms
     📦 Data .......... 0 chars (RAW)


     📤 RESPONSE
     ├─ ret ...............: 0
     ├─ fields ............: (raw string)
     └─ size ..............: 394 chars (RAW)

     ⏱️  TIMING
     └─ Total .............: 7ms  
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
▼ [7] 💬 userMsg::getMsgList  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: userMsg
     ├─ action ............: getMsgList
     ├─ userId ............: guest_093786dcde975077
     └─ serverId ..........: (missing)
     🔄 [1/2] Validate request fields .
     └─ userId: guest_093786dcde9750
     ✅ [1/2] Validate request fields .userId OK
     🔄 [1/1] Load userData from DB .
     └─ userMsgBrief: 0 entries
     ✅ [1/1] Load userData from DB .userData loaded
     🔄 [1/1] Type assert request fields .
     ✅ [1/1] Type assert request fields .type verified
     🔄 [1/1] Snapshot message brief state .
     ├─ entryCount: 0
     └─ keys: (empty)
     ✅ [1/1] Snapshot message brief state .0 message entries
     🔄 [1/1] Validate data integrity .
     ✅ [1/1] Validate data integrity .valid object
     🔄 [1/1] Return storedBrief directly .
     ✅ [1/1] Return storedBrief directly .0 entries returned as-is
     ├─ status: read-only, no mutations
     └─ reason: message list is returned directly from userData.userMsgBrief
     ├─ status: no DB save (read-only handler)
     └─ reason: getMsgList only reads stored message brief — no writes

     🔒 CRITICAL FIELDS AUDIT — game will crash/stuck if wrong
     └─ 🔒 _brief                   = Object{0}  L121134: setMessageFriendSimpleList iterates e[n].userInfo → UserSimpleInfo.deserialize
     ✅ CRITICAL AUDIT: 1/1 PASSED

     📸 getMsgList ret=0
     └─   _brief                       Object{0}

     🏏️ SUMMARY
     👤 User ......... guest_093786dcde975077
     📦 Fields ........ 1
     📦 Data .......... 0 chars (RAW)


     📤 RESPONSE
     ├─ ret ...............: 0
     ├─ fields ............: (raw string)
     └─ size ..............: 13 chars (RAW)

     ⏱️  TIMING
     └─ Total .............: 4ms  
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
▼ [8] 👤 user::registChat  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: user
     ├─ action ............: registChat
     ├─ userId ............: guest_093786dcde975077
     └─ serverId ..........: (missing)
🟢 23:34:41 INFO  ⚪ REGIST_CHAT ▸ registChat REQUEST RECEIVED
     ├─ userId: guest_093786dcde9750
     └─ version: 1.0
🟢 23:34:41 INFO  ⚪ REGIST_CHAT ▸ Entry check PASS — userId=guest_093786dcde...
🟢 23:34:41 INFO  ⚪ REGIST_CHAT ▸ Loading config for chat registration
     ├─ chatUrl: http://127.0.0.1:8002
     ├─ serverId: 1
     └─ source: DEFAULT (chatUrl not set)
🟢 23:34:41 INFO  ⚪ REGIST_CHAT ▸ Config loaded — chatUrl and serverId resolved
🟢 23:34:41 INFO  ⚪ REGIST_CHAT ▸ Loading player state for guild/room context
     ├─ userData: LOADED (100 top keys)
     ├─ guild: NO
     └─ guildRoomId: undefined (by design — updated dynamically by guild handler L114204)
🟢 23:34:41 INFO  ⚪ REGIST_CHAT ▸ Building chat registration response (6 fields)
     ├─ worldRoomId: world_1 (L114566 — ALWAYS joined)
     ├─ guildRoomId: undefined (L114568 — undefined = skip)
     ├─ teamDungeonChatRoom: undefined (L114579 — undefined = skip)
     └─ teamChatRoom: undefined (L114590 — undefined = skip)
     ├─ consumer: L114470 — 6 fields read from callback(n)
     ├─ next-step: L114480: io.connect(chatServerUrl) → TEA verify required
     ├─ post-login: L114550: chat::login → joinRoom(world, guild?, team?, dungeon?)
     └─ dynamic-update: guild L114207 | teamDungeon L136514 | team L136531
🟢 23:34:41 INFO  ⚪ REGIST_CHAT ▸ Response fields built — 6 fields total
🟢 23:34:41 INFO  ⚪ REGIST_CHAT ▸ No data mutations (configuration handler)
     ├─ type: NONE — registChat is a read-only configuration handler
     ├─ reason: Only returns chat URL and room IDs — no user data modified
     └─ trace: L114462-114470: client reads response fields, does not write back
🟢 23:34:41 INFO  ⚪ REGIST_CHAT ▸ No DB save required (configuration handler)
     ├─ action: SKIP — no mutations to persist
     ├─ reason: registChat returns configuration data only — no user state changes
     └─ dbWrite: NONE

     🔒 CRITICAL FIELDS AUDIT — game will crash/stuck if wrong
     ├─ 🔒 _success                 = true  L114470: n._success ? connect chat : retry every 3s (max 15)
     ├─ 🔒 _chatServerUrl           = http://127.0.0.1:8002  L114480→L82537: io.connect(url) — MUST be full URL
     ├─ 🔒 _worldRoomId             = world_1  L114566: chatJoinRequest(worldRoomId) — ALWAYS joined after login
     ├─ 🔒 _guildRoomId             = (undefined)  L114568: if(guildRoomId) join — undefined = skip (no guild)
     ├─ 🔒 _teamDungeonChatRoom     = (undefined)  L114579: if(teamDungeonChatRoom) join — undefined = skip
     └─ 🔒 _teamChatRoom            = (undefined)  L114590: if(teamChatRoomId) join — undefined = skip (no team)
     ✅ CRITICAL AUDIT: 6/6 PASSED

     📸 registChat ret=0
     ├─   _success                     true
     ├─   _chatServerUrl               "http://127.0.0.1:8002"
     └─   _worldRoomId                 "world_1"

     ⚠️ WARNINGS DETECTED
     ⚠️  [WARN-001] chat-server must be running on http://127.0.0.1:8002
          Expected: (server operational)
          Got:      may fail if chat-server down
          Impact:   Chat will never connect. Client stops retrying registChat after 15 attempts (45s).
          Fix:      Ensure chat-server is started before main-server

     ⚠️  [WARN-002] chat-server MUST implement TEA handshake (verifyEnable=true)
          Expected: (TEA verify event emitted by chat-server)
          Got:      L113445: chatClient verifyEnable=TRUE → waits for verify event
          Impact:   Client connection stalls — callback never fires, no chat, no error shown.
          Fix:      chat-server must emit "verify" event with TEA challenge on connect

     ⚠️  [WARN-003] guildRoomId, teamDungeonChatRoom, teamChatRoom = undefined (by design)
          Expected: (undefined for new/no-guild/no-team users)
          Got:      Returning undefined — client L114568/114579/114590 checks truthy before join
          Impact:   None — client correctly skips joining these rooms when undefined.
          Fix:      N/A — this is correct behavior. Guild handler (L114204) updates guildRoomId dynamically.
     ⚠️ TOTAL WARNINGS: 3


     🏏️ SUMMARY
     👤 User ......... guest_093786dcde975077
     📦 Fields ........ 6
     ⏱️  Duration ..... 16ms
     📦 Data .......... 0 chars (RAW)


     📤 RESPONSE
     ├─ ret ...............: 0
     ├─ fields ............: (raw string)
     └─ size ..............: 83 chars (RAW)

     ⏱️  TIMING
     └─ Total .............: 30ms  ███
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
▼ [9] 🎯 guide::saveGuide  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: guide
     ├─ action ............: saveGuide
     ├─ userId ............: guest_093786dcde975077
     └─ serverId ..........: (missing)
     🔄 [1/3] Validate request fields .
     ├─ userId: guest_093786dcde9750
     ├─ guideType: 2
     └─ step: 2102
     ✅ [1/3] Validate request fields .type=2 step=2102
     🔄 [1/1] Load userData from DB .
     ✅ [1/1] Load userData from DB .userData loaded
     🔄 [1/2] Type assert request fields .
     ✅ [1/2] Type assert request fields .all types verified
     🔄 [1/1] Snapshot guide._steps before modification .
     ├─ guideType: 2
     ├─ currentStep: (none)
     └─ allSteps: {}
     ✅ [1/1] Snapshot guide._steps before modification .guide._steps[2] was (none)
     🔄 [1/2] Validate business rules .
     ✅ [1/2] Validate business rules .invariants checked
     🔄 [1/1] Update guide._steps .
     ✅ [1/1] Update guide._steps .guide._steps[2] = 2102
     └─ guide._steps[2]: (none) step → 2102 step (NaN step) [SAVE-GUIDE]
[DB] saveUser("guest_093786..."): 100 keys, 10130 bytes

     📸 saveGuide ret=0

     🏏️ SUMMARY
     👤 User ......... guest_093786dcde975077
     📦 Data .......... 0 chars (RAW)


     📤 RESPONSE
     ├─ ret ...............: 0
     ├─ fields ............: (raw string)
     └─ size ..............: 2 chars (RAW)

     ⏱️  TIMING
     └─ Total .............: 9ms  
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
▼ [10] 🎯 guide::saveGuide  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: guide
     ├─ action ............: saveGuide
     ├─ userId ............: guest_093786dcde975077
     └─ serverId ..........: (missing)
     🔄 [1/3] Validate request fields .
     ├─ userId: guest_093786dcde9750
     ├─ guideType: 2
     └─ step: 2107
     ✅ [1/3] Validate request fields .type=2 step=2107
     🔄 [1/1] Load userData from DB .
     ✅ [1/1] Load userData from DB .userData loaded
     🔄 [1/2] Type assert request fields .
     ✅ [1/2] Type assert request fields .all types verified
     🔄 [1/1] Snapshot guide._steps before modification .
     ├─ guideType: 2
     ├─ currentStep: 2102
     └─ allSteps: {"2":2102}
     ✅ [1/1] Snapshot guide._steps before modification .guide._steps[2] was 2102
     🔄 [1/2] Validate business rules .
     ✅ [1/2] Validate business rules .invariants checked
     🔄 [1/1] Update guide._steps .
     ✅ [1/1] Update guide._steps .guide._steps[2] = 2107
     └─ guide._steps[2]: 2102 step → 2107 step (+5 step) [SAVE-GUIDE]
[DB] saveUser("guest_093786..."): 100 keys, 10130 bytes

     📸 saveGuide ret=0

     🏏️ SUMMARY
     👤 User ......... guest_093786dcde975077
     📦 Data .......... 0 chars (RAW)


     📤 RESPONSE
     ├─ ret ...............: 0
     ├─ fields ............: (raw string)
     └─ size ..............: 2 chars (RAW)

     ⏱️  TIMING
     └─ Total .............: 7ms  
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
▼ [11] ⏳ hangup::saveGuideTeam  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: hangup
     ├─ action ............: saveGuideTeam
     ├─ userId ............: guest_093786dcde975077
     └─ serverId ..........: (missing)
     🔄 [1/2] Save guide team ...
     ├─ userId: guest_093786dcde9750
     ├─ team: 5 hero(es)
     └─ supers: 1120561
     ✅ [1/2] Save guide team ...team=5 heroes
     🔄 [2/2] Persist team data .
[DB] saveUser("guest_093786..."): 101 keys, 10245 bytes
     ✅ [2/2] Persist team data .saved to DB

     📤 RESPONSE
     ├─ ret ...............: 0
     ├─ fields ............: (raw string)
     └─ size ..............: 2 chars (RAW)

     ⏱️  TIMING
     └─ Total .............: 6ms  
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
▼ [12] ⏳ hangup::checkBattleResult  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: hangup
     ├─ action ............: checkBattleResult
     ├─ userId ............: guest_093786dcde975077
     └─ serverId ..........: (missing)
     🔄 [1/5] Validate request ..
     ├─ userId: guest_093786dcde9750
     ├─ isGuide: true
     ├─ battleId: (none)
     ├─ checkResult: (none)
     ├─ runaway: (none)
     └─ super: (none)
     ✅ [1/5] Validate request ..
     🔄 [2/5] Load data .........
🟢 23:34:44 INFO  📋 CONFIG   ▸ Resource loaded: lesson.json
     ├─ entries: 611
     ├─ bytes: 833203
     └─ path: /var/www/html/resource/json/lesson.json
     ✅ [2/5] Load data .........lesson.json=611 entries
     🔄 [3/5] Read progress .....
     ├─ curLess: 10101
     ├─ maxPassLesson: 0
     ├─ maxPassChapter: 0
     └─ source: user.hangup
     ✅ [3/5] Read progress .....lesson=10101
     🔄 [4/5] Determine outcome .
     ├─ mode: TUTORIAL (always win — design)
     └─ isGuide: true
     ✅ [4/5] Determine outcome .WIN (0)
     🔄 [5/5] Build response ....
     ├─ lesson: 10101
     ├─ lessonName: lesson_name_1
     ├─ lessonType: 1
     ├─ thisChapter: 801
     └─ nextID: 10102
     └─ #1: item=103 qty=+20 old=0 new=20
     └─ #2: item=102 qty=+1000 old=0 new=1000
     └─ #3: item=3001 qty=+3 old=0 new=3
     └─ #4: item=3002 qty=+3 old=0 new=3
     └─ #5: item=101 qty=+20 old=0 new=20
     └─ totalProps._items[102] (GOLD): 0 gold → 1000 gold (+1000 gold) [BATTLE-REWARD]
     └─ totalProps._items[101] (DIAMOND): 0 diamond → 20 diamond (+20 diamond) [BATTLE-REWARD]
     └─ totalProps._items[103] (EXP): 0 exp → 20 exp (+20 exp) [BATTLE-REWARD]
     ├─ lessonId (completed): 10101
     ├─ curLess (new): 10102
     ├─ maxPassLesson: 10101
     ├─ maxPassChapter: 801
     ├─ nextLessonId: 10102
     └─ source: lesson.json nextID/thisChapter
     🔄 [6/7] Update curMainTask .
     ✅ [6/7] Update curMainTask .No lesson task matched completed lesson 10101 — no change
[DB] saveUser("guest_093786..."): 101 keys, 10319 bytes
     ✅ [5/7] Build response ....WIN rewards=5 lesson=10102

     🔒 CRITICAL FIELDS AUDIT — game will crash/stuck if wrong
     ├─ 🔒 _battleResult            = 0  L104882: 0 == e._battleResult -> true (tutorial always win)
     ├─ 🔒 _changeInfo._items       = 5 items  L97686: getBattleAwardItems iterates _changeInfo._items for {_id, _num}
     ├─ 🔒 _curLess                 = 10102  L104892/L97751: OnHookSingleton.lastSection = e._curLess
     └─ 🔒 _maxPassLesson           = 10101  L104893/L97751: OnHookSingleton.maxPassLesson = e._maxPassLesson
     ✅ CRITICAL AUDIT: 4/4 PASSED

     🏏️ SUMMARY
     👤 User ......... guest_093786dcde975077
     📦 Fields ........ 4
     📦 Data .......... 0 chars (RAW)


     📸 CHECK BATTLE RESULT ret=0
     ├─   _battleResult                0
     ├─   _curLess                     10102
     ├─   _maxPassLesson               10101
     └─   _changeInfo                  Object{1}

     📤 RESPONSE
     ├─ ret ...............: 0
     ├─ fields ............: (raw string)
     └─ size ..............: 218 chars (RAW)

     ⏱️  TIMING
     └─ Total .............: 25ms  ██
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
▼ [13] 📋 buryPoint::guideBattle  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: buryPoint
     ├─ action ............: guideBattle
     ├─ userId ............: guest_093786dcde975077
     └─ serverId ..........: (missing)
🟢 23:34:46 INFO  ⚪ BURYPOINT ▸ Guide battle analytics received
     ├─ userId: guest_093786dcde9750
     ├─ point: load
     ├─ passLesson: 10101
     └─ version: 1.0
[DB] saveUser("guest_093786..."): 102 keys, 10427 bytes

     📤 RESPONSE
     ├─ ret ...............: 0
     ├─ fields ............: (raw string)
     └─ size ..............: 2 chars (RAW)

     ⏱️  TIMING
     └─ Total .............: 7ms  
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
  📊 IDLE SUMMARY — 10s no activity — mQxVEBxRASeU
══════════════════════════════════════════════════════════════════
  📊 Calls: 13  ✅ 13 OK  ⚡ 24.8ms avg  📦 3,241 chars
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
▼ [14] 📋 buryPoint::guideBattle  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: buryPoint
     ├─ action ............: guideBattle
     ├─ userId ............: guest_093786dcde975077
     └─ serverId ..........: (missing)
🟢 23:34:57 INFO  ⚪ BURYPOINT ▸ Guide battle analytics received
     ├─ userId: guest_093786dcde9750
     ├─ point: battle
     ├─ passLesson: 10101
     └─ version: 1.0
[DB] saveUser("guest_093786..."): 102 keys, 10506 bytes

     📤 RESPONSE
     ├─ ret ...............: 0
     ├─ fields ............: (raw string)
     └─ size ..............: 2 chars (RAW)

     ⏱️  TIMING
     └─ Total .............: 5ms  
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
▼ [15] 📋 buryPoint::guideBattle  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: buryPoint
     ├─ action ............: guideBattle
     ├─ userId ............: guest_093786dcde975077
     └─ serverId ..........: (missing)
🟢 23:34:58 INFO  ⚪ BURYPOINT ▸ Guide battle analytics received
     ├─ userId: guest_093786dcde9750
     ├─ point: home
     ├─ passLesson: 10101
     └─ version: 1.0
[DB] saveUser("guest_093786..."): 102 keys, 10583 bytes

     📤 RESPONSE
     ├─ ret ...............: 0
     ├─ fields ............: (raw string)
     └─ size ..............: 2 chars (RAW)

     ⏱️  TIMING
     └─ Total .............: 5ms  
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
▼ [16] 🏆 activity::getActivityBrief  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: activity
     ├─ action ............: getActivityBrief
     ├─ userId ............: guest_093786dcde975077
     └─ serverId ..........: (missing)
     🔄 [1/3] Validate request ..
     └─ userId: guest_093786dcde9750...
     ✅ [1/3] Validate request ..
     🔄 [2/3] Load user data ....
     ✅ [2/3] Load user data ....
     ├─ userLevel: 1
     ├─ userCreateTime: 2026-05-20T23:34:36.427Z
     ├─ userAgeDays: 0.0 days
     ├─ serverOpenDate: 2026-05-20T23:34:19.452Z
     ├─ serverAgeDays: 0.0 days
     └─ dayOfWeek(UTC+7): 4 (Weekday)
     🔄 [3/3] Generate activity list .
     ├─ name: Hero Value Pack
     ├─ actType: 5037
     ├─ actCycle: 2
     ├─ displayIndex: 0
     └─ showRed: true
     ├─ name: New Server Discount Pack
     ├─ actType: 2003
     ├─ actCycle: 2
     ├─ displayIndex: 2
     └─ showRed: true
     ├─ name: Discount Today
     ├─ actType: 5003
     ├─ actCycle: 2
     ├─ displayIndex: 3
     └─ showRed: true
     ├─ name: Cumulative Top-up Gift
     ├─ actType: 2004
     ├─ actCycle: 2
     ├─ displayIndex: 4
     └─ showRed: true
     ├─ name: Daily accumulated top-up
     ├─ actType: 2007
     ├─ actCycle: 2
     ├─ displayIndex: 6
     └─ showRed: true
     ├─ name: Growth Quest
     ├─ actType: 1002
     ├─ actCycle: 1
     ├─ displayIndex: 7
     └─ showRed: true
     ├─ name: Hero Grand Kickback
     ├─ actType: 2001
     ├─ actCycle: 1
     ├─ displayIndex: 8
     └─ showRed: true
     ├─ name: Orange Hero Assembly
     ├─ actType: 2002
     ├─ actCycle: 1
     ├─ displayIndex: 9
     └─ showRed: true
     ├─ name: 7-Day Top-up At Will
     ├─ actType: 1003
     ├─ actCycle: 1
     ├─ displayIndex: 85
     └─ showRed: true
     ├─ name: Temple Contest
     ├─ actType: 4003
     ├─ actCycle: 4
     ├─ displayIndex: 9
     └─ showRed: true
     ├─ name: Ignition Illustration
     ├─ actType: 4001
     ├─ actCycle: 4
     ├─ displayIndex: 10
     └─ showRed: true
     ├─ name: Event Sign-in
     ├─ actType: 1001
     ├─ actCycle: 8
     ├─ displayIndex: 9999
     └─ showRed: false
     ✅ [3/3] Generate activity list .
     ├─ catalog: 12
     ├─ activated: 12
     └─ returned: 12
     ├─ count: 4
     ├─ homeIcon: zhujiemiannew87_png
     └─ sort: 79
     ├─ count: 5
     ├─ homeIcon: zhujiemiannew88_png
     └─ sort: 69
     ├─ count: 2
     ├─ homeIcon: zhujiemiannew101_png
     └─ sort: 89
     ├─ count: 1
     ├─ homeIcon: zhujiemiannew125_png
     └─ sort: 99

     📸 ACTIVITY BRIEF ret=0
     ├─   type                         "activity"
     ├─   action                       "getActivityBrief"
     ├─   userId                       "guest_093786dcde975077"
     ├─   version                      "1.0"
     └─   _acts                        Object{12}
     ├─ original: 2576 chars
     ├─ compressed: 776 chars
     ├─ reduction: 70%
     └─ threshold: 1024 chars

     📤 RESPONSE
     ├─ ret ...............: 0
     ├─ fields ............: (raw string)
     └─ size ..............: 776 chars (LZ)

     ⏱️  TIMING
     └─ Total .............: 13ms  █
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
▼ [17] 🎯 guide::saveGuide  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: guide
     ├─ action ............: saveGuide
     ├─ userId ............: guest_093786dcde975077
     └─ serverId ..........: (missing)
     🔄 [1/3] Validate request fields .
     ├─ userId: guest_093786dcde9750
     ├─ guideType: 2
     └─ step: 2206
     ✅ [1/3] Validate request fields .type=2 step=2206
     🔄 [1/1] Load userData from DB .
     ✅ [1/1] Load userData from DB .userData loaded
     🔄 [1/2] Type assert request fields .
     ✅ [1/2] Type assert request fields .all types verified
     🔄 [1/1] Snapshot guide._steps before modification .
     ├─ guideType: 2
     ├─ currentStep: 2107
     └─ allSteps: {"2":2107}
     ✅ [1/1] Snapshot guide._steps before modification .guide._steps[2] was 2107
     🔄 [1/2] Validate business rules .
     ✅ [1/2] Validate business rules .invariants checked
     🔄 [1/1] Update guide._steps .
     ✅ [1/1] Update guide._steps .guide._steps[2] = 2206
     └─ guide._steps[2]: 2107 step → 2206 step (+99 step) [SAVE-GUIDE]
[DB] saveUser("guest_093786..."): 102 keys, 10583 bytes

     📸 saveGuide ret=0

     🏏️ SUMMARY
     👤 User ......... guest_093786dcde975077
     📦 Data .......... 0 chars (RAW)


     📤 RESPONSE
     ├─ ret ...............: 0
     ├─ fields ............: (raw string)
     └─ size ..............: 2 chars (RAW)

     ⏱️  TIMING
     └─ Total .............: 6ms  
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
▼ [18] ✨ summon::summonOneFree  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: summon
     ├─ action ............: summonOneFree
     ├─ userId ............: guest_093786dcde975077
     └─ serverId ..........: (missing)
🟢 23:35:02 INFO  ⚪ SUMMON-FREE ▸ summonOneFree REQUEST RECEIVED
     ├─ userId: guest_093786dcde975077
     ├─ sType: 3
     └─ isGuide: true
🟢 23:35:02 INFO  📋 CONFIG   ▸ Resource loaded: summonPool.json
     ├─ entries: 200
     ├─ bytes: 75170
     └─ path: /var/www/html/resource/json/summonPool.json
🟢 23:35:02 INFO  📋 CONFIG   ▸ Resource loaded: summonRandom.json
     ├─ entries: 10
     ├─ bytes: 2157
     └─ path: /var/www/html/resource/json/summonRandom.json
     ├─ poolId: 1
     ├─ poolType: summonSuper
     ├─ freeTimer: 86400s
     └─ summonEnergyGain: 10
🟢 23:35:02 INFO  ⚪ SUMMON-FREE ▸ Free timer OK — proceeding with summon
🟢 23:35:02 INFO  ⚪ SUMMON-FREE ▸ [GUIDE] Predetermined hero: displayId=1309 quality=purple
     ├─ heroInstanceId: d88cb0a2-8ad...
     ├─ displayId: 1309
     ├─ heroName: hero_name_31
     ├─ quality: purple
     ├─ heroColor: 4
     └─ heroType: body
     ├─ oldEnergy: 0
     ├─ newEnergy: 10
     ├─ energyGained: 10
     ├─ freeTimeField: _canSuperFreeTime
     ├─ newFreeTime: 2026-05-21T23:35:02.072Z
     ├─ summonTimes[1]: 1
     └─ totalHeroes: 2
[DB] saveUser("guest_093786..."): 102 keys, 11274 bytes
🟢 23:35:02 INFO  ⚪ SUMMON-FREE ▸ User data SAVED
🟢 23:35:02 INFO  ⚪ SUMMON-FREE ▸ summonOneFree SUCCESS

     🏏️ SUMMARY
     👤 User ......... guest_093786dcde975077
     📦 Fields ........ [object Object]
     📦 Data .......... 0 chars (RAW)


     📤 RESPONSE
     ├─ ret ...............: 0
     ├─ fields ............: (raw string)
     └─ size ..............: 767 chars (RAW)

     ⏱️  TIMING
     └─ Total .............: 13ms  █
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
▼ [19] 🦸 hero::getAttrs  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: hero
     ├─ action ............: getAttrs
     ├─ userId ............: guest_093786dcde975077
     └─ serverId ..........: (missing)
     🔄 [1/2] Get hero attrs ....
     ├─ userId: guest_093786dcde9750
     └─ heros: d88cb0a2-8ada-4074-a60d-289a63af4034
     ✅ [1/2] Get hero attrs ....1 hero(es) requested
     🔄 [2/2] Calculate hero attributes .
     ├─ heroId: d88cb0a2-8ada-4074-a60d-289a63af4034
     ├─ displayId: 1309
     └─ level: 1
     ├─ heroType: body
     ├─ weightedSum: 3760.0
     └─ power: 3760
     ├─ hp: 3136
     ├─ attack: 93
     ├─ armor: 153
     └─ power: 3760
     ✅ [2/2] Calculate hero attributes .1 heroes calculated

     🔒 CRITICAL FIELDS AUDIT — game will crash/stuck if wrong
     ├─ 🔒 _attrs                   = Object{1}  L133726: for(var o in t._attrs) — keyed by hero index, each has _items with calculated attrs
     ├─ 🔒 _baseAttrs               = Object{1}  L133731: t._baseAttrs[o] — keyed by hero index, each has _items with base attrs (before talent)
     └─ 🔒 POWER (attr 21)          = calculated per hero  L133821: 21==p._id → heroBaseAttr.power = floor(num)
     ✅ CRITICAL AUDIT: 3/3 PASSED

     🏏️ SUMMARY
     👤 User ......... guest_093786dcde975077
     📦 Fields ........ 2
     ⏱️  Duration ..... 0ms
     📦 Data .......... 0 chars (RAW)


     📤 RESPONSE
     ├─ ret ...............: 0
     ├─ fields ............: (raw string)
     └─ size ..............: 392 chars (RAW)

     ⏱️  TIMING
     └─ Total .............: 3ms  
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
▼ [20] 🎯 guide::saveGuide  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: guide
     ├─ action ............: saveGuide
     ├─ userId ............: guest_093786dcde975077
     └─ serverId ..........: (missing)
     🔄 [1/3] Validate request fields .
     ├─ userId: guest_093786dcde9750
     ├─ guideType: 2
     └─ step: 2210
     ✅ [1/3] Validate request fields .type=2 step=2210
     🔄 [1/1] Load userData from DB .
     ✅ [1/1] Load userData from DB .userData loaded
     🔄 [1/2] Type assert request fields .
     ✅ [1/2] Type assert request fields .all types verified
     🔄 [1/1] Snapshot guide._steps before modification .
     ├─ guideType: 2
     ├─ currentStep: 2206
     └─ allSteps: {"2":2206}
     ✅ [1/1] Snapshot guide._steps before modification .guide._steps[2] was 2206
     🔄 [1/2] Validate business rules .
     ✅ [1/2] Validate business rules .invariants checked
     🔄 [1/1] Update guide._steps .
     ✅ [1/1] Update guide._steps .guide._steps[2] = 2210
     └─ guide._steps[2]: 2206 step → 2210 step (+4 step) [SAVE-GUIDE]
[DB] saveUser("guest_093786..."): 102 keys, 11274 bytes

     📸 saveGuide ret=0

     🏏️ SUMMARY
     👤 User ......... guest_093786dcde975077
     📦 Data .......... 0 chars (RAW)


     📤 RESPONSE
     ├─ ret ...............: 0
     ├─ fields ............: (raw string)
     └─ size ..............: 2 chars (RAW)

     ⏱️  TIMING
     └─ Total .............: 6ms  
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
▼ [21] ✨ summon::summonOneFree  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: summon
     ├─ action ............: summonOneFree
     ├─ userId ............: guest_093786dcde975077
     └─ serverId ..........: (missing)
🟢 23:35:05 INFO  ⚪ SUMMON-FREE ▸ summonOneFree REQUEST RECEIVED
     ├─ userId: guest_093786dcde975077
     ├─ sType: 1
     └─ isGuide: true
     ├─ poolId: 3
     ├─ poolType: summonNormal
     ├─ freeTimer: 21600s
     └─ summonEnergyGain: 0
🟢 23:35:05 INFO  ⚪ SUMMON-FREE ▸ Free timer OK — proceeding with summon
🟢 23:35:05 INFO  ⚪ SUMMON-FREE ▸ [GUIDE] Predetermined hero: displayId=1206 quality=blue
     ├─ heroInstanceId: cdda52c1-448...
     ├─ displayId: 1206
     ├─ heroName: hero_name_17
     ├─ quality: blue
     ├─ heroColor: 3
     └─ heroType: skill
     ├─ oldEnergy: 10
     ├─ newEnergy: 10
     ├─ energyGained: 0
     ├─ freeTimeField: _canCommonFreeTime
     ├─ newFreeTime: 2026-05-21T05:35:05.745Z
     ├─ summonTimes[3]: 1
     └─ totalHeroes: 3
[DB] saveUser("guest_093786..."): 102 keys, 11964 bytes
🟢 23:35:05 INFO  ⚪ SUMMON-FREE ▸ User data SAVED
🟢 23:35:05 INFO  ⚪ SUMMON-FREE ▸ summonOneFree SUCCESS

     🏏️ SUMMARY
     👤 User ......... guest_093786dcde975077
     📦 Fields ........ [object Object]
     📦 Data .......... 0 chars (RAW)


     📤 RESPONSE
     ├─ ret ...............: 0
     ├─ fields ............: (raw string)
     └─ size ..............: 767 chars (RAW)

     ⏱️  TIMING
     └─ Total .............: 8ms  
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
▼ [22] 🦸 hero::getAttrs  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: hero
     ├─ action ............: getAttrs
     ├─ userId ............: guest_093786dcde975077
     └─ serverId ..........: (missing)
     🔄 [1/2] Get hero attrs ....
     ├─ userId: guest_093786dcde9750
     └─ heros: cdda52c1-4488-44d3-91a2-5dc05d019860
     ✅ [1/2] Get hero attrs ....1 hero(es) requested
     🔄 [2/2] Calculate hero attributes .
     ├─ heroId: cdda52c1-4488-44d3-91a2-5dc05d019860
     ├─ displayId: 1206
     └─ level: 1
     ├─ heroType: skill
     ├─ weightedSum: 2080.0
     └─ power: 2080
     ├─ hp: 1240
     ├─ attack: 275
     ├─ armor: 205
     └─ power: 2080
     ✅ [2/2] Calculate hero attributes .1 heroes calculated

     🔒 CRITICAL FIELDS AUDIT — game will crash/stuck if wrong
     ├─ 🔒 _attrs                   = Object{1}  L133726: for(var o in t._attrs) — keyed by hero index, each has _items with calculated attrs
     ├─ 🔒 _baseAttrs               = Object{1}  L133731: t._baseAttrs[o] — keyed by hero index, each has _items with base attrs (before talent)
     └─ 🔒 POWER (attr 21)          = calculated per hero  L133821: 21==p._id → heroBaseAttr.power = floor(num)
     ✅ CRITICAL AUDIT: 3/3 PASSED

     🏏️ SUMMARY
     👤 User ......... guest_093786dcde975077
     📦 Fields ........ 2
     ⏱️  Duration ..... 0ms
     📦 Data .......... 0 chars (RAW)


     📤 RESPONSE
     ├─ ret ...............: 0
     ├─ fields ............: (raw string)
     └─ size ..............: 396 chars (RAW)

     ⏱️  TIMING
     └─ Total .............: 2ms  
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
▼ [23] 🏆 activity::getActivityBrief  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: activity
     ├─ action ............: getActivityBrief
     ├─ userId ............: guest_093786dcde975077
     └─ serverId ..........: (missing)
     🔄 [1/3] Validate request ..
     └─ userId: guest_093786dcde9750...
     ✅ [1/3] Validate request ..
     🔄 [2/3] Load user data ....
     ✅ [2/3] Load user data ....
     ├─ userLevel: 1
     ├─ userCreateTime: 2026-05-20T23:34:36.427Z
     ├─ userAgeDays: 0.0 days
     ├─ serverOpenDate: 2026-05-20T23:34:19.452Z
     ├─ serverAgeDays: 0.0 days
     └─ dayOfWeek(UTC+7): 4 (Weekday)
     🔄 [3/3] Generate activity list .
     ├─ name: Hero Value Pack
     ├─ actType: 5037
     ├─ actCycle: 2
     ├─ displayIndex: 0
     └─ showRed: true
     ├─ name: New Server Discount Pack
     ├─ actType: 2003
     ├─ actCycle: 2
     ├─ displayIndex: 2
     └─ showRed: true
     ├─ name: Discount Today
     ├─ actType: 5003
     ├─ actCycle: 2
     ├─ displayIndex: 3
     └─ showRed: true
     ├─ name: Cumulative Top-up Gift
     ├─ actType: 2004
     ├─ actCycle: 2
     ├─ displayIndex: 4
     └─ showRed: true
     ├─ name: Daily accumulated top-up
     ├─ actType: 2007
     ├─ actCycle: 2
     ├─ displayIndex: 6
     └─ showRed: true
     ├─ name: Growth Quest
     ├─ actType: 1002
     ├─ actCycle: 1
     ├─ displayIndex: 7
     └─ showRed: true
     ├─ name: Hero Grand Kickback
     ├─ actType: 2001
     ├─ actCycle: 1
     ├─ displayIndex: 8
     └─ showRed: true
     ├─ name: Orange Hero Assembly
     ├─ actType: 2002
     ├─ actCycle: 1
     ├─ displayIndex: 9
     └─ showRed: true
     ├─ name: 7-Day Top-up At Will
     ├─ actType: 1003
     ├─ actCycle: 1
     ├─ displayIndex: 85
     └─ showRed: true
     ├─ name: Temple Contest
     ├─ actType: 4003
     ├─ actCycle: 4
     ├─ displayIndex: 9
     └─ showRed: true
     ├─ name: Ignition Illustration
     ├─ actType: 4001
     ├─ actCycle: 4
     ├─ displayIndex: 10
     └─ showRed: true
     ├─ name: Event Sign-in
     ├─ actType: 1001
     ├─ actCycle: 8
     ├─ displayIndex: 9999
     └─ showRed: false
     ✅ [3/3] Generate activity list .
     ├─ catalog: 12
     ├─ activated: 12
     └─ returned: 12
     ├─ count: 4
     ├─ homeIcon: zhujiemiannew87_png
     └─ sort: 79
     ├─ count: 5
     ├─ homeIcon: zhujiemiannew88_png
     └─ sort: 69
     ├─ count: 2
     ├─ homeIcon: zhujiemiannew101_png
     └─ sort: 89
     ├─ count: 1
     ├─ homeIcon: zhujiemiannew125_png
     └─ sort: 99

     📸 ACTIVITY BRIEF ret=0
     ├─   type                         "activity"
     ├─   action                       "getActivityBrief"
     ├─   userId                       "guest_093786dcde975077"
     ├─   version                      "1.0"
     └─   _acts                        Object{12}
     ├─ original: 2576 chars
     ├─ compressed: 776 chars
     ├─ reduction: 70%
     └─ threshold: 1024 chars

     📤 RESPONSE
     ├─ ret ...............: 0
     ├─ fields ............: (raw string)
     └─ size ..............: 776 chars (LZ)

     ⏱️  TIMING
     └─ Total .............: 9ms  
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
▼ [24] 🎯 guide::saveGuide  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: guide
     ├─ action ............: saveGuide
     ├─ userId ............: guest_093786dcde975077
     └─ serverId ..........: (missing)
     🔄 [1/3] Validate request fields .
     ├─ userId: guest_093786dcde9750
     ├─ guideType: 2
     └─ step: 2304
     ✅ [1/3] Validate request fields .type=2 step=2304
     🔄 [1/1] Load userData from DB .
     ✅ [1/1] Load userData from DB .userData loaded
     🔄 [1/2] Type assert request fields .
     ✅ [1/2] Type assert request fields .all types verified
     🔄 [1/1] Snapshot guide._steps before modification .
     ├─ guideType: 2
     ├─ currentStep: 2210
     └─ allSteps: {"2":2210}
     ✅ [1/1] Snapshot guide._steps before modification .guide._steps[2] was 2210
     🔄 [1/2] Validate business rules .
     ✅ [1/2] Validate business rules .invariants checked
     🔄 [1/1] Update guide._steps .
     ✅ [1/1] Update guide._steps .guide._steps[2] = 2304
     └─ guide._steps[2]: 2210 step → 2304 step (+94 step) [SAVE-GUIDE]
[DB] saveUser("guest_093786..."): 102 keys, 11964 bytes

     📸 saveGuide ret=0

     🏏️ SUMMARY
     👤 User ......... guest_093786dcde975077
     📦 Data .......... 0 chars (RAW)


     📤 RESPONSE
     ├─ ret ...............: 0
     ├─ fields ............: (raw string)
     └─ size ..............: 2 chars (RAW)

     ⏱️  TIMING
     └─ Total .............: 10ms  █
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
▼ [25] 🦸 hero::autoLevelUp  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: hero
     ├─ action ............: autoLevelUp
     ├─ userId ............: guest_093786dcde975077
     └─ serverId ..........: (missing)
     🔄 [1/4] Auto Level Up .....
     ├─ userId: guest_093786dcde9750
     ├─ heroId: d88cb0a2-8ada-4074-a60d-289a63af4034
     └─ times: 1
     ├─ maxTimes: 1
     └─ heroId: d88cb0a2-8ada-4074-a60d-289a63af4034
     ✅ [1/4] Auto Level Up .....heroId=d88cb0a2-8ada-4074-a60d-289a63af4034, times=1
     🔄 [2/4] Load hero data ....
     ├─ heroId: d88cb0a2-8ada-4074-a60d-289a63af4034
     ├─ displayId: 1309
     └─ currentLevel: 1
     🔄 [3/4] Calculate level up .
     ├─ heroQuality: purple
     ├─ heroType: body
     └─ configTable: heroLevelUpPurple
     ├─ expCapsule (131): 1000
     └─ gold (102): 1000
🟢 23:35:12 INFO  📋 CONFIG   ▸ Resource loaded: heroLevelUpPurple.json
     ├─ entries: 220
     ├─ bytes: 23450
     └─ path: /var/www/html/resource/json/heroLevelUpPurple.json
     ├─ levelsGained: 1
     ├─ oldLevel: 1
     ├─ newLevel: 2
     ├─ totalExpCost: 18
     ├─ totalGoldCost: 81
     ├─ remainingExp: 982
     └─ remainingGold: 919
     ✅ [3/4] Calculate level up .1 levels (1 → 2)
     🔄 [4/4] Save data & build response .
[DB] saveUser("guest_093786..."): 102 keys, 11962 bytes
     ├─ heroLevel: 2
     ├─ expCapsule: 982
     └─ gold: 919
     ├─ hp: 3371
     ├─ attack: 105
     ├─ armor: 192
     └─ power: 4046
     ✅ [4/4] Save data & build response .ret=0, heroId=d88cb0a2-8ada-4074-a60d-289a63af4034, lvl 1→2

     🔒 CRITICAL FIELDS AUDIT — game will crash/stuck if wrong
     ├─ 🔒 heroId                   = d88cb0a2-8ada-4074-a60d-289a63af4034  L133741: getHero(e.heroId) — REQUIRED
     ├─ 🔒 _heroLevel               = 2  L133751: heroBaseAttr.level = e._heroLevel
     ├─ 🔒 _baseAttr                = Object{6}  L133805: setBaseAttr(e._baseAttr, hero)
     ├─ 🔒 _totalAttr               = Object{7}  L133805: totalAttr loop _totalAttr._items
     ├─ 🔒 _totalCost._levelUp      = 2 items (exp+gold)  L133385-133393: totalCost.levelUp[] deserialize
     └─ 🔒 _changeInfo              = 2 items (exp+gold)  L118414-118417: resetTtemsCallBack → setItem(_id, _num)
     ✅ CRITICAL AUDIT: 6/6 PASSED

     📤 RESPONSE
     ├─ ret ...............: 0
     ├─ fields ............: (raw string)
     └─ size ..............: 620 chars (RAW)

     ⏱️  TIMING
     └─ Total .............: 23ms  ██
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
▼ [26] 🦸 hero::autoLevelUp  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: hero
     ├─ action ............: autoLevelUp
     ├─ userId ............: guest_093786dcde975077
     └─ serverId ..........: (missing)
     🔄 [1/4] Auto Level Up .....
     ├─ userId: guest_093786dcde9750
     ├─ heroId: d88cb0a2-8ada-4074-a60d-289a63af4034
     └─ times: 1
     ├─ maxTimes: 1
     └─ heroId: d88cb0a2-8ada-4074-a60d-289a63af4034
     ✅ [1/4] Auto Level Up .....heroId=d88cb0a2-8ada-4074-a60d-289a63af4034, times=1
     🔄 [2/4] Load hero data ....
     ├─ heroId: d88cb0a2-8ada-4074-a60d-289a63af4034
     ├─ displayId: 1309
     └─ currentLevel: 2
     🔄 [3/4] Calculate level up .
     ├─ heroQuality: purple
     ├─ heroType: body
     └─ configTable: heroLevelUpPurple
     ├─ expCapsule (131): 982
     └─ gold (102): 919
     ├─ levelsGained: 1
     ├─ oldLevel: 2
     ├─ newLevel: 3
     ├─ totalExpCost: 36
     ├─ totalGoldCost: 135
     ├─ remainingExp: 946
     └─ remainingGold: 784
     ✅ [3/4] Calculate level up .1 levels (2 → 3)
     🔄 [4/4] Save data & build response .
[DB] saveUser("guest_093786..."): 102 keys, 11962 bytes
     ├─ heroLevel: 3
     ├─ expCapsule: 946
     └─ gold: 784
     ├─ hp: 3606
     ├─ attack: 118
     ├─ armor: 230
     └─ power: 4332
     ✅ [4/4] Save data & build response .ret=0, heroId=d88cb0a2-8ada-4074-a60d-289a63af4034, lvl 2→3

     🔒 CRITICAL FIELDS AUDIT — game will crash/stuck if wrong
     ├─ 🔒 heroId                   = d88cb0a2-8ada-4074-a60d-289a63af4034  L133741: getHero(e.heroId) — REQUIRED
     ├─ 🔒 _heroLevel               = 3  L133751: heroBaseAttr.level = e._heroLevel
     ├─ 🔒 _baseAttr                = Object{6}  L133805: setBaseAttr(e._baseAttr, hero)
     ├─ 🔒 _totalAttr               = Object{7}  L133805: totalAttr loop _totalAttr._items
     ├─ 🔒 _totalCost._levelUp      = 2 items (exp+gold)  L133385-133393: totalCost.levelUp[] deserialize
     └─ 🔒 _changeInfo              = 2 items (exp+gold)  L118414-118417: resetTtemsCallBack → setItem(_id, _num)
     ✅ CRITICAL AUDIT: 6/6 PASSED

     📤 RESPONSE
     ├─ ret ...............: 0
     ├─ fields ............: (raw string)
     └─ size ..............: 621 chars (RAW)

     ⏱️  TIMING
     └─ Total .............: 6ms  
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
▼ [27] 🎯 guide::saveGuide  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: guide
     ├─ action ............: saveGuide
     ├─ userId ............: guest_093786dcde975077
     └─ serverId ..........: (missing)
     🔄 [1/3] Validate request fields .
     ├─ userId: guest_093786dcde9750
     ├─ guideType: 2
     └─ step: 2308
     ✅ [1/3] Validate request fields .type=2 step=2308
     🔄 [1/1] Load userData from DB .
     ✅ [1/1] Load userData from DB .userData loaded
     🔄 [1/2] Type assert request fields .
     ✅ [1/2] Type assert request fields .all types verified
     🔄 [1/1] Snapshot guide._steps before modification .
     ├─ guideType: 2
     ├─ currentStep: 2304
     └─ allSteps: {"2":2304}
     ✅ [1/1] Snapshot guide._steps before modification .guide._steps[2] was 2304
     🔄 [1/2] Validate business rules .
     ✅ [1/2] Validate business rules .invariants checked
     🔄 [1/1] Update guide._steps .
     ✅ [1/1] Update guide._steps .guide._steps[2] = 2308
     └─ guide._steps[2]: 2304 step → 2308 step (+4 step) [SAVE-GUIDE]
[DB] saveUser("guest_093786..."): 102 keys, 11962 bytes

     📸 saveGuide ret=0

     🏏️ SUMMARY
     👤 User ......... guest_093786dcde975077
     📦 Data .......... 0 chars (RAW)


     📤 RESPONSE
     ├─ ret ...............: 0
     ├─ fields ............: (raw string)
     └─ size ..............: 2 chars (RAW)

     ⏱️  TIMING
     └─ Total .............: 8ms  
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
▼ [28] 🦸 hero::autoLevelUp  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: hero
     ├─ action ............: autoLevelUp
     ├─ userId ............: guest_093786dcde975077
     └─ serverId ..........: (missing)
     🔄 [1/4] Auto Level Up .....
     ├─ userId: guest_093786dcde9750
     ├─ heroId: cdda52c1-4488-44d3-91a2-5dc05d019860
     └─ times: 1
     ├─ maxTimes: 1
     └─ heroId: cdda52c1-4488-44d3-91a2-5dc05d019860
     ✅ [1/4] Auto Level Up .....heroId=cdda52c1-4488-44d3-91a2-5dc05d019860, times=1
     🔄 [2/4] Load hero data ....
     ├─ heroId: cdda52c1-4488-44d3-91a2-5dc05d019860
     ├─ displayId: 1206
     └─ currentLevel: 1
     🔄 [3/4] Calculate level up .
     ├─ heroQuality: blue
     ├─ heroType: skill
     └─ configTable: heroLevelUpBlue
     ├─ expCapsule (131): 946
     └─ gold (102): 784
🟢 23:35:17 INFO  📋 CONFIG   ▸ Resource loaded: heroLevelUpBlue.json
     ├─ entries: 220
     ├─ bytes: 23431
     └─ path: /var/www/html/resource/json/heroLevelUpBlue.json
     ├─ levelsGained: 1
     ├─ oldLevel: 1
     ├─ newLevel: 2
     ├─ totalExpCost: 16
     ├─ totalGoldCost: 72
     ├─ remainingExp: 930
     └─ remainingGold: 712
     ✅ [3/4] Calculate level up .1 levels (1 → 2)
     🔄 [4/4] Save data & build response .
[DB] saveUser("guest_093786..."): 102 keys, 11962 bytes
     ├─ heroLevel: 2
     ├─ expCapsule: 930
     └─ gold: 712
     ├─ hp: 1408
     ├─ attack: 291
     ├─ armor: 256
     └─ power: 2315
     ✅ [4/4] Save data & build response .ret=0, heroId=cdda52c1-4488-44d3-91a2-5dc05d019860, lvl 1→2

     🔒 CRITICAL FIELDS AUDIT — game will crash/stuck if wrong
     ├─ 🔒 heroId                   = cdda52c1-4488-44d3-91a2-5dc05d019860  L133741: getHero(e.heroId) — REQUIRED
     ├─ 🔒 _heroLevel               = 2  L133751: heroBaseAttr.level = e._heroLevel
     ├─ 🔒 _baseAttr                = Object{6}  L133805: setBaseAttr(e._baseAttr, hero)
     ├─ 🔒 _totalAttr               = Object{7}  L133805: totalAttr loop _totalAttr._items
     ├─ 🔒 _totalCost._levelUp      = 2 items (exp+gold)  L133385-133393: totalCost.levelUp[] deserialize
     └─ 🔒 _changeInfo              = 2 items (exp+gold)  L118414-118417: resetTtemsCallBack → setItem(_id, _num)
     ✅ CRITICAL AUDIT: 6/6 PASSED

     📤 RESPONSE
     ├─ ret ...............: 0
     ├─ fields ............: (raw string)
     └─ size ..............: 622 chars (RAW)

     ⏱️  TIMING
     └─ Total .............: 30ms  ███
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
▼ [29] 🦸 hero::autoLevelUp  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: hero
     ├─ action ............: autoLevelUp
     ├─ userId ............: guest_093786dcde975077
     └─ serverId ..........: (missing)
     🔄 [1/4] Auto Level Up .....
     ├─ userId: guest_093786dcde9750
     ├─ heroId: cdda52c1-4488-44d3-91a2-5dc05d019860
     └─ times: 1
     ├─ maxTimes: 1
     └─ heroId: cdda52c1-4488-44d3-91a2-5dc05d019860
     ✅ [1/4] Auto Level Up .....heroId=cdda52c1-4488-44d3-91a2-5dc05d019860, times=1
     🔄 [2/4] Load hero data ....
     ├─ heroId: cdda52c1-4488-44d3-91a2-5dc05d019860
     ├─ displayId: 1206
     └─ currentLevel: 2
     🔄 [3/4] Calculate level up .
     ├─ heroQuality: blue
     ├─ heroType: skill
     └─ configTable: heroLevelUpBlue
     ├─ expCapsule (131): 930
     └─ gold (102): 712
     ├─ levelsGained: 1
     ├─ oldLevel: 2
     ├─ newLevel: 3
     ├─ totalExpCost: 32
     ├─ totalGoldCost: 120
     ├─ remainingExp: 898
     └─ remainingGold: 592
     ✅ [3/4] Calculate level up .1 levels (2 → 3)
     🔄 [4/4] Save data & build response .
[DB] saveUser("guest_093786..."): 102 keys, 11962 bytes
     ├─ heroLevel: 3
     ├─ expCapsule: 898
     └─ gold: 592
     ├─ hp: 1576
     ├─ attack: 308
     ├─ armor: 307
     └─ power: 2551
     ✅ [4/4] Save data & build response .ret=0, heroId=cdda52c1-4488-44d3-91a2-5dc05d019860, lvl 2→3

     🔒 CRITICAL FIELDS AUDIT — game will crash/stuck if wrong
     ├─ 🔒 heroId                   = cdda52c1-4488-44d3-91a2-5dc05d019860  L133741: getHero(e.heroId) — REQUIRED
     ├─ 🔒 _heroLevel               = 3  L133751: heroBaseAttr.level = e._heroLevel
     ├─ 🔒 _baseAttr                = Object{6}  L133805: setBaseAttr(e._baseAttr, hero)
     ├─ 🔒 _totalAttr               = Object{7}  L133805: totalAttr loop _totalAttr._items
     ├─ 🔒 _totalCost._levelUp      = 2 items (exp+gold)  L133385-133393: totalCost.levelUp[] deserialize
     └─ 🔒 _changeInfo              = 2 items (exp+gold)  L118414-118417: resetTtemsCallBack → setItem(_id, _num)
     ✅ CRITICAL AUDIT: 6/6 PASSED

     📤 RESPONSE
     ├─ ret ...............: 0
     ├─ fields ............: (raw string)
     └─ size ..............: 623 chars (RAW)

     ⏱️  TIMING
     └─ Total .............: 6ms  
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
▼ [30] 🏆 activity::getActivityBrief  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: activity
     ├─ action ............: getActivityBrief
     ├─ userId ............: guest_093786dcde975077
     └─ serverId ..........: (missing)
     🔄 [1/3] Validate request ..
     └─ userId: guest_093786dcde9750...
     ✅ [1/3] Validate request ..
     🔄 [2/3] Load user data ....
     ✅ [2/3] Load user data ....
     ├─ userLevel: 1
     ├─ userCreateTime: 2026-05-20T23:34:36.427Z
     ├─ userAgeDays: 0.0 days
     ├─ serverOpenDate: 2026-05-20T23:34:19.452Z
     ├─ serverAgeDays: 0.0 days
     └─ dayOfWeek(UTC+7): 4 (Weekday)
     🔄 [3/3] Generate activity list .
     ├─ name: Hero Value Pack
     ├─ actType: 5037
     ├─ actCycle: 2
     ├─ displayIndex: 0
     └─ showRed: true
     ├─ name: New Server Discount Pack
     ├─ actType: 2003
     ├─ actCycle: 2
     ├─ displayIndex: 2
     └─ showRed: true
     ├─ name: Discount Today
     ├─ actType: 5003
     ├─ actCycle: 2
     ├─ displayIndex: 3
     └─ showRed: true
     ├─ name: Cumulative Top-up Gift
     ├─ actType: 2004
     ├─ actCycle: 2
     ├─ displayIndex: 4
     └─ showRed: true
     ├─ name: Daily accumulated top-up
     ├─ actType: 2007
     ├─ actCycle: 2
     ├─ displayIndex: 6
     └─ showRed: true
     ├─ name: Growth Quest
     ├─ actType: 1002
     ├─ actCycle: 1
     ├─ displayIndex: 7
     └─ showRed: true
     ├─ name: Hero Grand Kickback
     ├─ actType: 2001
     ├─ actCycle: 1
     ├─ displayIndex: 8
     └─ showRed: true
     ├─ name: Orange Hero Assembly
     ├─ actType: 2002
     ├─ actCycle: 1
     ├─ displayIndex: 9
     └─ showRed: true
     ├─ name: 7-Day Top-up At Will
     ├─ actType: 1003
     ├─ actCycle: 1
     ├─ displayIndex: 85
     └─ showRed: true
     ├─ name: Temple Contest
     ├─ actType: 4003
     ├─ actCycle: 4
     ├─ displayIndex: 9
     └─ showRed: true
     ├─ name: Ignition Illustration
     ├─ actType: 4001
     ├─ actCycle: 4
     ├─ displayIndex: 10
     └─ showRed: true
     ├─ name: Event Sign-in
     ├─ actType: 1001
     ├─ actCycle: 8
     ├─ displayIndex: 9999
     └─ showRed: false
     ✅ [3/3] Generate activity list .
     ├─ catalog: 12
     ├─ activated: 12
     └─ returned: 12
     ├─ count: 4
     ├─ homeIcon: zhujiemiannew87_png
     └─ sort: 79
     ├─ count: 5
     ├─ homeIcon: zhujiemiannew88_png
     └─ sort: 69
     ├─ count: 2
     ├─ homeIcon: zhujiemiannew101_png
     └─ sort: 89
     ├─ count: 1
     ├─ homeIcon: zhujiemiannew125_png
     └─ sort: 99

     📸 ACTIVITY BRIEF ret=0
     ├─   type                         "activity"
     ├─   action                       "getActivityBrief"
     ├─   userId                       "guest_093786dcde975077"
     ├─   version                      "1.0"
     └─   _acts                        Object{12}
     ├─ original: 2576 chars
     ├─ compressed: 776 chars
     ├─ reduction: 70%
     └─ threshold: 1024 chars

     📤 RESPONSE
     ├─ ret ...............: 0
     ├─ fields ............: (raw string)
     └─ size ..............: 776 chars (LZ)

     ⏱️  TIMING
     └─ Total .............: 7ms  
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
▼ [31] 🎯 guide::saveGuide  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: guide
     ├─ action ............: saveGuide
     ├─ userId ............: guest_093786dcde975077
     └─ serverId ..........: (missing)
     🔄 [1/3] Validate request fields .
     ├─ userId: guest_093786dcde9750
     ├─ guideType: 2
     └─ step: 2508
     ✅ [1/3] Validate request fields .type=2 step=2508
     🔄 [1/1] Load userData from DB .
     ✅ [1/1] Load userData from DB .userData loaded
     🔄 [1/2] Type assert request fields .
     ✅ [1/2] Type assert request fields .all types verified
     🔄 [1/1] Snapshot guide._steps before modification .
     ├─ guideType: 2
     ├─ currentStep: 2308
     └─ allSteps: {"2":2308}
     ✅ [1/1] Snapshot guide._steps before modification .guide._steps[2] was 2308
     🔄 [1/2] Validate business rules .
     ✅ [1/2] Validate business rules .invariants checked
     🔄 [1/1] Update guide._steps .
     ✅ [1/1] Update guide._steps .guide._steps[2] = 2508
     └─ guide._steps[2]: 2308 step → 2508 step (+200 step) [SAVE-GUIDE]
[DB] saveUser("guest_093786..."): 102 keys, 11962 bytes

     📸 saveGuide ret=0

     🏏️ SUMMARY
     👤 User ......... guest_093786dcde975077
     📦 Data .......... 0 chars (RAW)


     📤 RESPONSE
     ├─ ret ...............: 0
     ├─ fields ............: (raw string)
     └─ size ..............: 2 chars (RAW)

     ⏱️  TIMING
     └─ Total .............: 7ms  
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
▼ [32] ⏳ hangup::saveGuideTeam  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: hangup
     ├─ action ............: saveGuideTeam
     ├─ userId ............: guest_093786dcde975077
     └─ serverId ..........: (missing)
     🔄 [1/2] Save guide team ...
     ├─ userId: guest_093786dcde9750
     ├─ team: 5 hero(es)
     └─ supers: 
     ✅ [1/2] Save guide team ...team=5 heroes
     🔄 [2/2] Persist team data .
[DB] saveUser("guest_093786..."): 102 keys, 12043 bytes
     ✅ [2/2] Persist team data .saved to DB

     📤 RESPONSE
     ├─ ret ...............: 0
     ├─ fields ............: (raw string)
     └─ size ..............: 2 chars (RAW)

     ⏱️  TIMING
     └─ Total .............: 7ms  
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
▼ [33] ⏳ hangup::checkBattleResult  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: hangup
     ├─ action ............: checkBattleResult
     ├─ userId ............: guest_093786dcde975077
     └─ serverId ..........: (missing)
     🔄 [1/5] Validate request ..
     ├─ userId: guest_093786dcde9750
     ├─ isGuide: true
     ├─ battleId: (none)
     ├─ checkResult: (none)
     ├─ runaway: (none)
     └─ super: (none)
     ✅ [1/5] Validate request ..
     🔄 [2/5] Load data .........
     ✅ [2/5] Load data .........lesson.json=611 entries
     🔄 [3/5] Read progress .....
     ├─ curLess: 10102
     ├─ maxPassLesson: 10101
     ├─ maxPassChapter: 801
     └─ source: user.hangup
     ✅ [3/5] Read progress .....lesson=10102
     🔄 [4/5] Determine outcome .
     ├─ mode: TUTORIAL (always win — design)
     └─ isGuide: true
     ✅ [4/5] Determine outcome .WIN (0)
     🔄 [5/5] Build response ....
     ├─ lesson: 10102
     ├─ lessonName: lesson_name_3
     ├─ lessonType: 1
     ├─ thisChapter: 801
     └─ nextID: 10103
     └─ #1: item=103 qty=+39 old=20 new=59
     └─ #2: item=102 qty=+1100 old=592 new=1692
     └─ #3: item=3003 qty=+4 old=0 new=4
     └─ #4: item=3004 qty=+4 old=0 new=4
     └─ #5: item=101 qty=+20 old=20 new=40
     └─ totalProps._items[102] (GOLD): 592 gold → 1692 gold (+1100 gold) [BATTLE-REWARD]
     └─ totalProps._items[101] (DIAMOND): 20 diamond → 40 diamond (+20 diamond) [BATTLE-REWARD]
     └─ totalProps._items[103] (EXP): 20 exp → 59 exp (+39 exp) [BATTLE-REWARD]
     ├─ lessonId (completed): 10102
     ├─ curLess (new): 10103
     ├─ maxPassLesson: 10102
     ├─ maxPassChapter: 801
     ├─ nextLessonId: 10103
     └─ source: lesson.json nextID/thisChapter
     🔄 [6/7] Update curMainTask .
     ├─ matchedTask: 6001
     ├─ taskType: lesson
     └─ targetWas: 10102
     ├─ nextTask: 6002
     ├─ nextTaskType: lesson
     ├─ curCount: 10102
     ├─ targetCount: 10103
     └─ levelNeeded: 1
     ✅ [6/7] Update curMainTask .Task advanced — curMainTask updated
     ✅ [6/7] Update curMainTask .Task advanced — curMainTask updated
[DB] saveUser("guest_093786..."): 102 keys, 12106 bytes
     ✅ [5/7] Build response ....WIN rewards=5 lesson=10103

     🔒 CRITICAL FIELDS AUDIT — game will crash/stuck if wrong
     ├─ 🔒 _battleResult            = 0  L104882: 0 == e._battleResult -> true (tutorial always win)
     ├─ 🔒 _changeInfo._items       = 5 items  L97686: getBattleAwardItems iterates _changeInfo._items for {_id, _num}
     ├─ 🔒 _curLess                 = 10103  L104892/L97751: OnHookSingleton.lastSection = e._curLess
     └─ 🔒 _maxPassLesson           = 10102  L104893/L97751: OnHookSingleton.maxPassLesson = e._maxPassLesson
     ✅ CRITICAL AUDIT: 4/4 PASSED

     🏏️ SUMMARY
     👤 User ......... guest_093786dcde975077
     📦 Fields ........ 4
     📦 Data .......... 0 chars (RAW)


     📸 CHECK BATTLE RESULT ret=0
     ├─   _battleResult                0
     ├─   _curLess                     10103
     ├─   _maxPassLesson               10102
     └─   _changeInfo                  Object{1}

     📤 RESPONSE
     ├─ ret ...............: 0
     ├─ fields ............: (raw string)
     └─ size ..............: 218 chars (RAW)

     ⏱️  TIMING
     └─ Total .............: 8ms  
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
▼ [34] 📋 buryPoint::guideBattle  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: buryPoint
     ├─ action ............: guideBattle
     ├─ userId ............: guest_093786dcde975077
     └─ serverId ..........: (missing)
🟢 23:35:27 INFO  ⚪ BURYPOINT ▸ Guide battle analytics received
     ├─ userId: guest_093786dcde9750
     ├─ point: load
     ├─ passLesson: 10102
     └─ version: 1.0
[DB] saveUser("guest_093786..."): 102 keys, 12183 bytes

     📤 RESPONSE
     ├─ ret ...............: 0
     ├─ fields ............: (raw string)
     └─ size ..............: 2 chars (RAW)

     ⏱️  TIMING
     └─ Total .............: 5ms  
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
  📊 IDLE SUMMARY — 10s no activity — mQxVEBxRASeU
══════════════════════════════════════════════════════════════════
  📊 Calls: 34  ✅ 34 OK  ⚡ 15.0ms avg  📦 10,613 chars
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
▼ [35] 📋 buryPoint::guideBattle  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: buryPoint
     ├─ action ............: guideBattle
     ├─ userId ............: guest_093786dcde975077
     └─ serverId ..........: (missing)
🟢 23:35:47 INFO  ⚪ BURYPOINT ▸ Guide battle analytics received
     ├─ userId: guest_093786dcde9750
     ├─ point: battle
     ├─ passLesson: 10102
     └─ version: 1.0
[DB] saveUser("guest_093786..."): 102 keys, 12262 bytes

     📤 RESPONSE
     ├─ ret ...............: 0
     ├─ fields ............: (raw string)
     └─ size ..............: 2 chars (RAW)

     ⏱️  TIMING
     └─ Total .............: 6ms  
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
▼ [36] 📋 buryPoint::guideBattle  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: buryPoint
     ├─ action ............: guideBattle
     ├─ userId ............: guest_093786dcde975077
     └─ serverId ..........: (missing)
🟢 23:35:48 INFO  ⚪ BURYPOINT ▸ Guide battle analytics received
     ├─ userId: guest_093786dcde9750
     ├─ point: home
     ├─ passLesson: 10102
     └─ version: 1.0
[DB] saveUser("guest_093786..."): 102 keys, 12339 bytes

     📤 RESPONSE
     ├─ ret ...............: 0
     ├─ fields ............: (raw string)
     └─ size ..............: 2 chars (RAW)

     ⏱️  TIMING
     └─ Total .............: 5ms  
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
▼ [37] 🏆 activity::getActivityBrief  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: activity
     ├─ action ............: getActivityBrief
     ├─ userId ............: guest_093786dcde975077
     └─ serverId ..........: (missing)
     🔄 [1/3] Validate request ..
     └─ userId: guest_093786dcde9750...
     ✅ [1/3] Validate request ..
     🔄 [2/3] Load user data ....
     ✅ [2/3] Load user data ....
     ├─ userLevel: 1
     ├─ userCreateTime: 2026-05-20T23:34:36.427Z
     ├─ userAgeDays: 0.0 days
     ├─ serverOpenDate: 2026-05-20T23:34:19.452Z
     ├─ serverAgeDays: 0.0 days
     └─ dayOfWeek(UTC+7): 4 (Weekday)
     🔄 [3/3] Generate activity list .
     ├─ name: Hero Value Pack
     ├─ actType: 5037
     ├─ actCycle: 2
     ├─ displayIndex: 0
     └─ showRed: true
     ├─ name: New Server Discount Pack
     ├─ actType: 2003
     ├─ actCycle: 2
     ├─ displayIndex: 2
     └─ showRed: true
     ├─ name: Discount Today
     ├─ actType: 5003
     ├─ actCycle: 2
     ├─ displayIndex: 3
     └─ showRed: true
     ├─ name: Cumulative Top-up Gift
     ├─ actType: 2004
     ├─ actCycle: 2
     ├─ displayIndex: 4
     └─ showRed: true
     ├─ name: Daily accumulated top-up
     ├─ actType: 2007
     ├─ actCycle: 2
     ├─ displayIndex: 6
     └─ showRed: true
     ├─ name: Growth Quest
     ├─ actType: 1002
     ├─ actCycle: 1
     ├─ displayIndex: 7
     └─ showRed: true
     ├─ name: Hero Grand Kickback
     ├─ actType: 2001
     ├─ actCycle: 1
     ├─ displayIndex: 8
     └─ showRed: true
     ├─ name: Orange Hero Assembly
     ├─ actType: 2002
     ├─ actCycle: 1
     ├─ displayIndex: 9
     └─ showRed: true
     ├─ name: 7-Day Top-up At Will
     ├─ actType: 1003
     ├─ actCycle: 1
     ├─ displayIndex: 85
     └─ showRed: true
     ├─ name: Temple Contest
     ├─ actType: 4003
     ├─ actCycle: 4
     ├─ displayIndex: 9
     └─ showRed: true
     ├─ name: Ignition Illustration
     ├─ actType: 4001
     ├─ actCycle: 4
     ├─ displayIndex: 10
     └─ showRed: true
     ├─ name: Event Sign-in
     ├─ actType: 1001
     ├─ actCycle: 8
     ├─ displayIndex: 9999
     └─ showRed: false
     ✅ [3/3] Generate activity list .
     ├─ catalog: 12
     ├─ activated: 12
     └─ returned: 12
     ├─ count: 4
     ├─ homeIcon: zhujiemiannew87_png
     └─ sort: 79
     ├─ count: 5
     ├─ homeIcon: zhujiemiannew88_png
     └─ sort: 69
     ├─ count: 2
     ├─ homeIcon: zhujiemiannew101_png
     └─ sort: 89
     ├─ count: 1
     ├─ homeIcon: zhujiemiannew125_png
     └─ sort: 99

     📸 ACTIVITY BRIEF ret=0
     ├─   type                         "activity"
     ├─   action                       "getActivityBrief"
     ├─   userId                       "guest_093786dcde975077"
     ├─   version                      "1.0"
     └─   _acts                        Object{12}
     ├─ original: 2576 chars
     ├─ compressed: 776 chars
     ├─ reduction: 70%
     └─ threshold: 1024 chars

     📤 RESPONSE
     ├─ ret ...............: 0
     ├─ fields ............: (raw string)
     └─ size ..............: 776 chars (LZ)

     ⏱️  TIMING
     └─ Total .............: 10ms  █
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
▼ [38] 🎯 guide::saveGuide  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: guide
     ├─ action ............: saveGuide
     ├─ userId ............: guest_093786dcde975077
     └─ serverId ..........: (missing)
     🔄 [1/3] Validate request fields .
     ├─ userId: guest_093786dcde9750
     ├─ guideType: 2
     └─ step: 2601
     ✅ [1/3] Validate request fields .type=2 step=2601
     🔄 [1/1] Load userData from DB .
     ✅ [1/1] Load userData from DB .userData loaded
     🔄 [1/2] Type assert request fields .
     ✅ [1/2] Type assert request fields .all types verified
     🔄 [1/1] Snapshot guide._steps before modification .
     ├─ guideType: 2
     ├─ currentStep: 2508
     └─ allSteps: {"2":2508}
     ✅ [1/1] Snapshot guide._steps before modification .guide._steps[2] was 2508
     🔄 [1/2] Validate business rules .
     ✅ [1/2] Validate business rules .invariants checked
     🔄 [1/1] Update guide._steps .
     ✅ [1/1] Update guide._steps .guide._steps[2] = 2601
     └─ guide._steps[2]: 2508 step → 2601 step (+93 step) [SAVE-GUIDE]
[DB] saveUser("guest_093786..."): 102 keys, 12339 bytes

     📸 saveGuide ret=0

     🏏️ SUMMARY
     👤 User ......... guest_093786dcde975077
     📦 Data .......... 0 chars (RAW)


     📤 RESPONSE
     ├─ ret ...............: 0
     ├─ fields ............: (raw string)
     └─ size ..............: 2 chars (RAW)

     ⏱️  TIMING
     └─ Total .............: 9ms  
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
▼ [39] 🎯 guide::saveGuide  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: guide
     ├─ action ............: saveGuide
     ├─ userId ............: guest_093786dcde975077
     └─ serverId ..........: (missing)
     🔄 [1/3] Validate request fields .
     ├─ userId: guest_093786dcde9750
     ├─ guideType: 2
     └─ step: 2603
     ✅ [1/3] Validate request fields .type=2 step=2603
     🔄 [1/1] Load userData from DB .
     ✅ [1/1] Load userData from DB .userData loaded
     🔄 [1/2] Type assert request fields .
     ✅ [1/2] Type assert request fields .all types verified
     🔄 [1/1] Snapshot guide._steps before modification .
     ├─ guideType: 2
     ├─ currentStep: 2601
     └─ allSteps: {"2":2601}
     ✅ [1/1] Snapshot guide._steps before modification .guide._steps[2] was 2601
     🔄 [1/2] Validate business rules .
     ✅ [1/2] Validate business rules .invariants checked
     🔄 [1/1] Update guide._steps .
     ✅ [1/1] Update guide._steps .guide._steps[2] = 2603
     └─ guide._steps[2]: 2601 step → 2603 step (+2 step) [SAVE-GUIDE]
[DB] saveUser("guest_093786..."): 102 keys, 12339 bytes

     📸 saveGuide ret=0

     🏏️ SUMMARY
     👤 User ......... guest_093786dcde975077
     📦 Data .......... 0 chars (RAW)


     📤 RESPONSE
     ├─ ret ...............: 0
     ├─ fields ............: (raw string)
     └─ size ..............: 2 chars (RAW)

     ⏱️  TIMING
     └─ Total .............: 6ms  
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
▼ [40] ⏳ hangup::gain  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: hangup
     ├─ action ............: gain
     ├─ userId ............: guest_093786dcde975077
     └─ serverId ..........: (missing)
     🔄 [1/8] Validate request ..
     ├─ userId: guest_093786dcde9750
     └─ version: 1.0
     ✅ [1/8] Validate request ..
     🔄 [2/8] Load data .........
🟢 23:35:51 INFO  📋 CONFIG   ▸ Resource loaded: idleVipPlus.json
     ├─ entries: 18
     ├─ bytes: 1418
     └─ path: /var/www/html/resource/json/idleVipPlus.json
🟢 23:35:51 INFO  📋 CONFIG   ▸ Resource loaded: idleAwardFirst.json
     ├─ entries: 3
     ├─ bytes: 182
     └─ path: /var/www/html/resource/json/idleAwardFirst.json
🟢 23:35:51 INFO  📋 CONFIG   ▸ Resource loaded: lessonIdleAward.json
     ├─ entries: 611
     ├─ bytes: 1143151
     └─ path: /var/www/html/resource/json/lessonIdleAward.json
🟢 23:35:51 INFO  📋 CONFIG   ▸ Resource loaded: userUpgrade.json
     ├─ entries: 299
     ├─ bytes: 16357
     └─ path: /var/www/html/resource/json/userUpgrade.json
     ✅ [2/8] Load data .........lesson=611, everyTime=300s, maxIdle=28800s, maxLevel=300, firstBonus=3, idleAwardKeys=611, upgradeLevels=299
     🔄 [3/8] Calculate idle time .
     ├─ lastGainTime: 1779320076427
     ├─ now: 1779320151641
     ├─ elapsedRaw: 75s
     ├─ elapsedCapped: 75s (max 28800s)
     ├─ exCount: 0 ticks (300s each)
     └─ vipLevel: 0
     ✅ [3/8] Calculate idle time .75s, 0 ticks
     🔄 [4/8] Lesson config & bonus .
     ├─ curLess: 10103
     ├─ lessonName: 3
     ├─ idleAwardPlus: 0
     ├─ globalWarBuff: 0 (inactive)
     └─ bonusMultiplier: 1
     ✅ [4/8] Lesson config & bonus .lesson=10103, mult=1
     🔄 [5/8] Calculate rewards .
     └─ id=102 +217 (2.90416666666667/s x 75s x 1): undefined
     └─ id=103 +25 (0.3425/s x 75s x 1): undefined
     └─ id=131 +59 (0.794722222222222/s x 75s x 1): undefined
     └─ id=102 +1000: undefined
     └─ id=103 +20: undefined
     └─ id=131 +500: undefined
     ✅ [5/8] Calculate rewards .deterministic=3, randomDrops=0, firstBonus=3, totalItems=3
     🔄 [6/8] Level-up cascade ..
     ├─ oldLevel: 1
     ├─ newLevel: 2
     ├─ levelsGained: 1
     └─ expTotal: 104
     ✅ [6/8] Level-up cascade ..LEVELED UP 1 -> 2
     🔄 [7/8] Save & respond ....
[DB] saveUser("guest_093786..."): 102 keys, 12341 bytes
     ✅ [7/8] Save & respond ....
     🔄 [8/8] Build response ....
     └─ totalProps._items[102] (GOLD): 1692 gold → 2909 gold (+1217 gold) [IDLE-GAIN]
     └─ totalProps._items[103] (EXP): 59 exp → 104 exp (+45 exp) [IDLE-GAIN]
     ✅ [8/8] Build response ....4 items, LEVEL UP 1->2

     📸 HANGUP GAIN ret=0
     ├─   type                         "hangup"
     ├─   action                       "gain"
     ├─   userId                       "guest_093786dcde975077"
     ├─   version                      "1.0"
     ├─   _changeInfo                  Object{1}
     ├─   _lastGainTime                1779320076427
     └─   _clickGlobalWarBuffTag       ""

     🏏️ SUMMARY
     👤 User ......... guest_093786dcde975077
     📦 Data .......... 0 chars (RAW)


     📤 RESPONSE
     ├─ ret ...............: 0
     ├─ fields ............: (raw string)
     └─ size ..............: 284 chars (RAW)

     ⏱️  TIMING
     └─ Total .............: 71ms  ███████
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
▼ [41] 🎯 guide::saveGuide  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: guide
     ├─ action ............: saveGuide
     ├─ userId ............: guest_093786dcde975077
     └─ serverId ..........: (missing)
     🔄 [1/3] Validate request fields .
     ├─ userId: guest_093786dcde9750
     ├─ guideType: 2
     └─ step: 2708
     ✅ [1/3] Validate request fields .type=2 step=2708
     🔄 [1/1] Load userData from DB .
     ✅ [1/1] Load userData from DB .userData loaded
     🔄 [1/2] Type assert request fields .
     ✅ [1/2] Type assert request fields .all types verified
     🔄 [1/1] Snapshot guide._steps before modification .
     ├─ guideType: 2
     ├─ currentStep: 2603
     └─ allSteps: {"2":2603}
     ✅ [1/1] Snapshot guide._steps before modification .guide._steps[2] was 2603
     🔄 [1/2] Validate business rules .
     ✅ [1/2] Validate business rules .invariants checked
     🔄 [1/1] Update guide._steps .
     ✅ [1/1] Update guide._steps .guide._steps[2] = 2708
     └─ guide._steps[2]: 2603 step → 2708 step (+105 step) [SAVE-GUIDE]
[DB] saveUser("guest_093786..."): 102 keys, 12341 bytes

     📸 saveGuide ret=0

     🏏️ SUMMARY
     👤 User ......... guest_093786dcde975077
     📦 Data .......... 0 chars (RAW)


     📤 RESPONSE
     ├─ ret ...............: 0
     ├─ fields ............: (raw string)
     └─ size ..............: 2 chars (RAW)

     ⏱️  TIMING
     └─ Total .............: 6ms  
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
▼ [42] 🛠️ equip::wearAuto  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: equip
     ├─ action ............: wearAuto
     ├─ userId ............: guest_093786dcde975077
     └─ serverId ..........: (missing)
     🔄 [1/8] Validate request fields .
     ├─ userId: guest_093786dcde9750...
     ├─ heroId: d88cb0a2-8ada-4074-a60d-289a63af4034
     ├─ equipInfo: 1,2,3,4
     └─ weaponId: (none)
     ✅ [1/8] Validate request fields .userId + heroId present
     🔄 [2/8] Load resource JSONs .
🟢 23:35:59 INFO  📋 CONFIG   ▸ Resource loaded: equip.json
     ├─ entries: 84
     ├─ bytes: 44152
     └─ path: /var/www/html/resource/json/equip.json
🟢 23:35:59 INFO  📋 CONFIG   ▸ Resource loaded: equipSuit.json
     ├─ entries: 15
     ├─ bytes: 8619
     └─ path: /var/www/html/resource/json/equipSuit.json
🟢 23:35:59 INFO  📋 CONFIG   ▸ Resource loaded: weapon.json
     ├─ entries: 20
     ├─ bytes: 3725
     └─ path: /var/www/html/resource/json/weapon.json
     ✅ [2/8] Load resource JSONs .8 JSONs loaded
     🔄 [3/8] Load userData from DB .
     ✅ [3/8] Load userData from DB .userData loaded
     🔄 [4/8] Validate hero exists .
     ├─ heroId: d88cb0a2-8ada-4074-a60d-289a63af4034
     ├─ _heroDisplayId: 1309
     └─ _level: 3
     ✅ [4/8] Validate hero exists .hero found: displayId=1309 level=3
     🔄 [5/8] Get hero config ...
     ✅ [5/8] Get hero config ...heroType=body quality=purple
     🔄 [6/8] Process equip changes .
     ├─ equippedCount: 4
     ├─ equippedIds: 3001,3002,3003,3004
     └─ changeCount: 4
     ✅ [6/8] Process equip changes .4 equips processed
     🔄 [7/8] Calculate equip attributes .
     ├─ equipAttrs: 3 types
     └─ suitAttrs: 5 bonuses
     ✅ [7/8] Calculate equip attributes .3 equip + 5 suit
     🔄 [8/8] Calculate total attributes .
     ├─ hp: 6348
     ├─ attack: 317
     ├─ armor: 230
     ├─ extraArmor: 1430
     └─ power: 8703
     ✅ [8/8] Calculate total attributes .power=8703
[DB] saveUser("guest_093786..."): 102 keys, 12828 bytes
🟢 23:35:59 INFO  ⚪ WEAR_AUTO ▸ equip::wearAuto SUCCESS
     ├─ userId: guest_093786dcde9750...
     ├─ heroId: d88cb0a2-8ada-4074-a60d-289a63af4034
     ├─ equips: 4
     ├─ weapon: (none)
     ├─ power: 8703
     └─ duration: 41ms
     ├─ original: 1836 chars
     ├─ compressed: 382 chars
     ├─ reduction: 79%
     └─ threshold: 1024 chars

     📤 RESPONSE
     ├─ ret ...............: 0
     ├─ fields ............: (raw string)
     └─ size ..............: 382 chars (LZ)

     ⏱️  TIMING
     └─ Total .............: 45ms  ████
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
▼ [43] 🎯 guide::saveGuide  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: guide
     ├─ action ............: saveGuide
     ├─ userId ............: guest_093786dcde975077
     └─ serverId ..........: (missing)
     🔄 [1/3] Validate request fields .
     ├─ userId: guest_093786dcde9750
     ├─ guideType: 2
     └─ step: 2717
     ✅ [1/3] Validate request fields .type=2 step=2717
     🔄 [1/1] Load userData from DB .
     ✅ [1/1] Load userData from DB .userData loaded
     🔄 [1/2] Type assert request fields .
     ✅ [1/2] Type assert request fields .all types verified
     🔄 [1/1] Snapshot guide._steps before modification .
     ├─ guideType: 2
     ├─ currentStep: 2708
     └─ allSteps: {"2":2708}
     ✅ [1/1] Snapshot guide._steps before modification .guide._steps[2] was 2708
     🔄 [1/2] Validate business rules .
     ✅ [1/2] Validate business rules .invariants checked
     🔄 [1/1] Update guide._steps .
     ✅ [1/1] Update guide._steps .guide._steps[2] = 2717
     └─ guide._steps[2]: 2708 step → 2717 step (+9 step) [SAVE-GUIDE]
[DB] saveUser("guest_093786..."): 102 keys, 12828 bytes

     📸 saveGuide ret=0

     🏏️ SUMMARY
     👤 User ......... guest_093786dcde975077
     📦 Data .......... 0 chars (RAW)


     📤 RESPONSE
     ├─ ret ...............: 0
     ├─ fields ............: (raw string)
     └─ size ..............: 2 chars (RAW)

     ⏱️  TIMING
     └─ Total .............: 6ms  
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
▼ [44] 🏆 activity::getActivityBrief  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: activity
     ├─ action ............: getActivityBrief
     ├─ userId ............: guest_093786dcde975077
     └─ serverId ..........: (missing)
     🔄 [1/3] Validate request ..
     └─ userId: guest_093786dcde9750...
     ✅ [1/3] Validate request ..
     🔄 [2/3] Load user data ....
     ✅ [2/3] Load user data ....
     ├─ userLevel: 2
     ├─ userCreateTime: 2026-05-20T23:34:36.427Z
     ├─ userAgeDays: 0.0 days
     ├─ serverOpenDate: 2026-05-20T23:34:19.452Z
     ├─ serverAgeDays: 0.0 days
     └─ dayOfWeek(UTC+7): 4 (Weekday)
     🔄 [3/3] Generate activity list .
     ├─ name: Hero Value Pack
     ├─ actType: 5037
     ├─ actCycle: 2
     ├─ displayIndex: 0
     └─ showRed: true
     ├─ name: New Server Discount Pack
     ├─ actType: 2003
     ├─ actCycle: 2
     ├─ displayIndex: 2
     └─ showRed: true
     ├─ name: Discount Today
     ├─ actType: 5003
     ├─ actCycle: 2
     ├─ displayIndex: 3
     └─ showRed: true
     ├─ name: Cumulative Top-up Gift
     ├─ actType: 2004
     ├─ actCycle: 2
     ├─ displayIndex: 4
     └─ showRed: true
     ├─ name: Daily accumulated top-up
     ├─ actType: 2007
     ├─ actCycle: 2
     ├─ displayIndex: 6
     └─ showRed: true
     ├─ name: Growth Quest
     ├─ actType: 1002
     ├─ actCycle: 1
     ├─ displayIndex: 7
     └─ showRed: true
     ├─ name: Hero Grand Kickback
     ├─ actType: 2001
     ├─ actCycle: 1
     ├─ displayIndex: 8
     └─ showRed: true
     ├─ name: Orange Hero Assembly
     ├─ actType: 2002
     ├─ actCycle: 1
     ├─ displayIndex: 9
     └─ showRed: true
     ├─ name: 7-Day Top-up At Will
     ├─ actType: 1003
     ├─ actCycle: 1
     ├─ displayIndex: 85
     └─ showRed: true
     ├─ name: Temple Contest
     ├─ actType: 4003
     ├─ actCycle: 4
     ├─ displayIndex: 9
     └─ showRed: true
     ├─ name: Ignition Illustration
     ├─ actType: 4001
     ├─ actCycle: 4
     ├─ displayIndex: 10
     └─ showRed: true
     ├─ name: Event Sign-in
     ├─ actType: 1001
     ├─ actCycle: 8
     ├─ displayIndex: 9999
     └─ showRed: false
     ✅ [3/3] Generate activity list .
     ├─ catalog: 12
     ├─ activated: 12
     └─ returned: 12
     ├─ count: 4
     ├─ homeIcon: zhujiemiannew87_png
     └─ sort: 79
     ├─ count: 5
     ├─ homeIcon: zhujiemiannew88_png
     └─ sort: 69
     ├─ count: 2
     ├─ homeIcon: zhujiemiannew101_png
     └─ sort: 89
     ├─ count: 1
     ├─ homeIcon: zhujiemiannew125_png
     └─ sort: 99

     📸 ACTIVITY BRIEF ret=0
     ├─   type                         "activity"
     ├─   action                       "getActivityBrief"
     ├─   userId                       "guest_093786dcde975077"
     ├─   version                      "1.0"
     └─   _acts                        Object{12}
     ├─ original: 2576 chars
     ├─ compressed: 776 chars
     ├─ reduction: 70%
     └─ threshold: 1024 chars

     📤 RESPONSE
     ├─ ret ...............: 0
     ├─ fields ............: (raw string)
     └─ size ..............: 776 chars (LZ)

     ⏱️  TIMING
     └─ Total .............: 4ms  
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
▼ [45] 🎯 guide::saveGuide  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: guide
     ├─ action ............: saveGuide
     ├─ userId ............: guest_093786dcde975077
     └─ serverId ..........: (missing)
     🔄 [1/3] Validate request fields .
     ├─ userId: guest_093786dcde9750
     ├─ guideType: 3
     └─ step: 3102
     ✅ [1/3] Validate request fields .type=3 step=3102
     🔄 [1/1] Load userData from DB .
     ✅ [1/1] Load userData from DB .userData loaded
     🔄 [1/2] Type assert request fields .
     ✅ [1/2] Type assert request fields .all types verified
     🔄 [1/1] Snapshot guide._steps before modification .
     ├─ guideType: 3
     ├─ currentStep: (none)
     └─ allSteps: {"2":2717}
     ✅ [1/1] Snapshot guide._steps before modification .guide._steps[3] was (none)
     🔄 [1/2] Validate business rules .
     ✅ [1/2] Validate business rules .invariants checked
     🔄 [1/1] Update guide._steps .
     ✅ [1/1] Update guide._steps .guide._steps[3] = 3102
     └─ guide._steps[3]: (none) step → 3102 step (NaN step) [SAVE-GUIDE]
[DB] saveUser("guest_093786..."): 102 keys, 12837 bytes

     📸 saveGuide ret=0

     🏏️ SUMMARY
     👤 User ......... guest_093786dcde975077
     📦 Data .......... 0 chars (RAW)


     📤 RESPONSE
     ├─ ret ...............: 0
     ├─ fields ............: (raw string)
     └─ size ..............: 2 chars (RAW)

     ⏱️  TIMING
     └─ Total .............: 12ms  █
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
▼ [46] ⏳ hangup::startGeneral  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: hangup
     ├─ action ............: startGeneral
     ├─ userId ............: guest_093786dcde975077
     └─ serverId ..........: (missing)
     🔄 [1/7] Validate request ..
     ├─ userId: guest_093786dcde9750
     ├─ version: 1.0
     ├─ team: 5 heroes
     ├─ super: 
     └─ battleField: 20
     ✅ [1/7] Validate request ..
     🔄 [2/7] Load data .........
🟢 23:36:08 INFO  📋 CONFIG   ▸ Resource loaded: heroQualityPower.json
     ├─ entries: 7
     ├─ bytes: 466
     └─ path: /var/www/html/resource/json/heroQualityPower.json
     ✅ [2/7] Load data .........lesson=611, heroes=887, levelAttr=360, typeParam=13, qualityParam=7, heroPower=403, qualityPower=7
     🔄 [3/7] Read lesson progress .
     ├─ curLess: 10103
     └─ source: userData.hangup._curLess
     ✅ [3/7] Read lesson progress .lesson=10103 (lesson_name_5)
     🔄 [4/7] Parse enemy config .
     ├─ enemyList: ,,,55202,
     ├─ enemyLevel: ,,,8,
     ├─ monsterType: ,,,critical,
     ├─ difficultyHp: 1.89,1.89,1.89,3.024,1.89
     ├─ difficultyAttack: 4.4,4.4,4.4,4.84,4.4
     ├─ difficultyArmor: 1,1,1,1,1
     ├─ power: 10000
     └─ isBoss: 4
     ✅ [4/7] Parse enemy config .parsed 5 positions
     🔄 [5/7] Build enemy team ..
     ├─ pos: 3
     ├─ heroId: 55202
     ├─ quality: blue
     ├─ level: 8
     ├─ monsterType: critical
     ├─ diffHp/dAtk/dArm: 3.024/4.84/1
     ├─ hp/atk/arm: 5844.79/2853.18/394.10
     ├─ power: 9283
     ├─ speed: 187
     └─ skills: 120201,120211,120291
     ✅ [5/7] Build enemy team ..1 enemies built
     🔄 [6/7] Build response ....
     ├─ battleId: 80c6cdb3-076...
     ├─ userId: guest_093786dcde...
     ├─ lessonId: 10103
     └─ status: REGISTERED
     ✅ [6/7] Build response ....battleId=80c6cdb3..., enemies=1
     🔄 [7/7] Verify & respond ..

     🔒 CRITICAL FIELDS AUDIT — game will crash/stuck if wrong
     ├─ 🔒 _battleId                = 80c6cdb3-0768-48...  L97731: UserInfoSingleton.getInstance().battleId = r._battleId
     ├─ 🔒 _rightTeam (FLAT, no _items) = 1 heroes (keys: 3)  L102470: for (var o in e) iterates _rightTeam directly — [FIX-001]
     ├─ 🔒 _rightSuper              = 0 skills  L103618: rightSuper: r ? r : [] (empty is valid)
     ├─ 🔒 _attrs._items uses _id   = verified  L102528-537: a.type = o._id — [FIX-002]
     ├─ 🔒 Power attr (21)          = included (integer)  L133821: 21==p._id → floor(num) — [FIX-006][FIX-015]
     ├─ 🔒 FullHealth attr (22)     = included (= HP with decimals)  L74988: heroMaxHealth = FullHealth || Health — [FIX-007]
     ├─ 🔒 HP/ATK/ARM decimal values = NOT floored — matches HAR  HAR: _num:702.45, _num:174.24 — [FIX-009]
     ├─ 🔒 ENERGY attr (16)         = 50 (starting energy)  HAR: _num:50 — [FIX-014]
     ├─ 🔒 Skills keyed by skill ID = verified  HAR: "190401":{...} — [FIX-013]
     └─ 🔒 Formula 5-layer          = (levelAttr × typeParam + bais) × qualityParam × balance × difficulty  L116073 makeHeroBasicAttr — [FIX-008]
     ✅ CRITICAL AUDIT: 10/10 PASSED

  ┌──────────────────────────────────────────────────────────┐
  │  ❌ FATAL ERROR AT STEP L101674: for (var o = 0; o < n.length; o++)│
  │                                                          │
  │  STEP:   START-GENERAL                                   │
  │  REASON: TYPE ASSERTION FAILED: responseData._rightSuper │
  │  DETAIL: L101674: for (var o = 0; o < n.length; o++)     │
  │                                                          │
  │  IMPACT:  Wrong type -> super skill parsing error         │
  │                                                          │
  └──────────────────────────────────────────────────────────┘

     ├─ field: responseData._rightSuper
     ├─ expected: object
     ├─ actual: object
     └─ value: 
     ✅ [7/7] Verify & respond ..

     📸 START GENERAL ret=0
     ├─   _battleId                    "80c6cdb3-0768-48b7-8784-2b81..."
     ├─   _rightTeam                   Object{1}
     └─   _rightSuper                  Array[0] ⚠️ EMPTY

     🏏️ SUMMARY
     👤 User ......... guest_093786dcde975077
     📦 Data .......... 0 chars (RAW)


     📤 RESPONSE
     ├─ ret ...............: 0
     ├─ fields ............: (raw string)
     └─ size ..............: 994 chars (RAW)

     ⏱️  TIMING
     └─ Total .............: 32ms  ███
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
▼ [47] 🛠️ battle::getRandom  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: battle
     ├─ action ............: getRandom
     ├─ userId ............: guest_093786dcde975077
     └─ serverId ..........: (missing)
     🔄 [1/5] Validate request ..
     ├─ userId: guest_093786dcde9750
     ├─ battleId: 80c6cdb3-0768-48b7-8...
     ├─ count: 100
     └─ version: 1.0
     ✅ [1/5] Validate request ..
     🔄 [2/5] Validate battleId .
     ✅ [2/5] Validate battleId .battleId=80c6cdb3-076... lesson=10103
     🔄 [3/5] Generate randoms ..
     ├─ count: 100
     ├─ min: 0.023155
     ├─ max: 0.984813
     ├─ avg: 0.517686
     ├─ first5: 0.742985, 0.535107, 0.023155, 0.905833, 0.860194
     └─ precision: ~16 decimal places (Math.random)
     ✅ [3/5] Generate randoms ..100 randoms generated (avg=0.5177)
     🔄 [4/5] Update session ....
     ├─ battleId: 80c6cdb3-076...
     ├─ randomUsed: true
     └─ nextStep: hangup::checkBattleResult
     ✅ [4/5] Update session ....
     🔄 [5/5] Build response ....

  ┌──────────────────────────────────────────────────────────┐
  │  ❌ FATAL ERROR AT STEP L102462: t(e._rand) — callback receives array│
  │                                                          │
  │  STEP:   GET-RANDOM                                      │
  │  REASON: TYPE ASSERTION FAILED: responseData._rand       │
  │  DETAIL: L102462: t(e._rand) — callback receives array   │
  │                                                          │
  │  IMPACT:  Wrong type -> RandomManager.addRandomList fails -> battle crash│
  │                                                          │
  └──────────────────────────────────────────────────────────┘

     ├─ field: responseData._rand
     ├─ expected: object
     ├─ actual: object
     └─ value: 0.7429847905734034,0.5351073896766932,0.023154997801464017,0.9058328172929924,0.8601936391715124,0.8787903614164971,0.5465355772250786,0.6122111043228998,0.7303008649703907,0.93147132183701,0.36923957337841273,0.591677564914659,0.8395528938031499,0.33838893063573483,0.38207756053416997,0.7492308060808548,0.6102845977178608,0.9848134368269396,0.9454014981797783,0.12458575609653288,0.4584722038109046,0.27476098245139746,0.27943854988826955,0.4990378013444903,0.6883158127253867,0.1356062801841622,0.22383972062316693,0.04540503788529804,0.8060851080984711,0.4368779259155272,0.9047856657652246,0.9704256579764718,0.7324001363945526,0.3311548344025974,0.17291996068535664,0.9379785697047605,0.31050152478257775,0.10761673978186692,0.526462295194191,0.5473212084462935,0.48117881359490977,0.15314171464620252,0.7837712265315305,0.857455039431749,0.6076678674271673,0.7255125016258478,0.6323747056456942,0.7351710369917421,0.13138416244520768,0.9269557524730279,0.46290060618478623,0.35269507836741754,0.3127112969656344,0.77027080183248,0.7669884345464155,0.12319590099088995,0.26979453803814335,0.16032868045275506,0.5325500836170823,0.2985008867483605,0.8759212661602499,0.34666883429226236,0.040984117889099725,0.8125630034022528,0.07790982827585613,0.6588286479207739,0.7788291555918785,0.3663122887068493,0.1937558256291435,0.750937303706481,0.6629823856598617,0.6127599428177384,0.18438066278653742,0.3232034301971387,0.030063566862564617,0.41610375025385193,0.2719643305330972,0.21640361495633087,0.6724177444610197,0.515082132350544,0.975801448428612,0.43900061139736646,0.25958201842141826,0.28137665712343407,0.1726442753748927,0.45518279855020116,0.5966467559506843,0.5808852280308188,0.6122155863324426,0.9119104004862222,0.627080420615482,0.11000720682915299,0.9315685419608282,0.43811363097192735,0.7947174707108234,0.2205188885147692,0.9046861029210904,0.38428649191810105,0.7609778974259258,0.3275530279883615
     ✅ [5/5] Build response ....

     📸 GET RANDOM ret=0
     ├─   _rand_length                 100
     ├─   _rand_first3                 Array[3]
     └─   _rand_avg                    "0.517686"

     🏏️ SUMMARY
     👤 User ......... guest_093786dcde975077
     📦 Data .......... 0 chars (RAW)

     ├─ original: 1937 chars
     ├─ compressed: 539 chars
     ├─ reduction: 72%
     └─ threshold: 1024 chars

     📤 RESPONSE
     ├─ ret ...............: 0
     ├─ fields ............: (raw string)
     └─ size ..............: 539 chars (LZ)

     ⏱️  TIMING
     └─ Total .............: 7ms  
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
▼ [48] ⏳ hangup::checkBattleResult  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: hangup
     ├─ action ............: checkBattleResult
     ├─ userId ............: guest_093786dcde975077
     └─ serverId ..........: (missing)
     🔄 [1/5] Validate request ..
     ├─ userId: guest_093786dcde9750
     ├─ isGuide: false
     ├─ battleId: 80c6cdb3-0768-48b7-8784-2b81feb603dc
     ├─ checkResult: [object Object],[object Object],[object Object],[object Object]
     ├─ runaway: false
     └─ super: 
     ✅ [1/5] Validate request ..
     🔄 [2/5] Load data .........
     ✅ [2/5] Load data .........lesson.json=611 entries
     🔄 [3/5] Read progress .....
     ├─ curLess: 10103
     ├─ maxPassLesson: 10102
     ├─ maxPassChapter: 801
     └─ source: user.hangup
     ✅ [3/5] Read progress .....lesson=10103
     🔄 [4/5] Determine outcome .
     ├─ mode: REGULAR
     ├─ checkResult: [object Object],[object Object],[object Object],[object Object]
     ├─ runaway: false
     └─ isWin: false
     ✅ [4/5] Determine outcome .LOSE (1)
     🔄 [5/5] Build response ....
     └─ status: LOSE — no rewards given
[DB] saveUser("guest_093786..."): 102 keys, 12837 bytes
     ✅ [5/7] Build response ....LOSE rewards=0 lesson=10103

     🔒 CRITICAL FIELDS AUDIT — game will crash/stuck if wrong
     ├─ 🔒 _battleResult            = 1  L97750: 0 == t._battleResult ? true : false (regular battle)
     ├─ 🔒 _changeInfo._items       = 0 items  L97686: getBattleAwardItems iterates _changeInfo._items for {_id, _num}
     ├─ 🔒 _curLess                 = 10103  L104892/L97751: OnHookSingleton.lastSection = e._curLess
     └─ 🔒 _maxPassLesson           = 10102  L104893/L97751: OnHookSingleton.maxPassLesson = e._maxPassLesson
     ✅ CRITICAL AUDIT: 3/4 PASSED, 1 warning(s)

     🔒 CRITICAL FIELDS AUDIT — game will crash/stuck if wrong
     └─ 🔒 _maxPassChapter          = 801  L97751: OnHookSingleton.maxPassChapter = e._maxPassChapter (regular only)
     ✅ CRITICAL AUDIT: 1/1 PASSED

     🏏️ SUMMARY
     👤 User ......... guest_093786dcde975077
     📦 Fields ........ 5
     📦 Data .......... 0 chars (RAW)


     📸 CHECK BATTLE RESULT ret=0
     ├─   _battleResult                1
     ├─   _curLess                     10103
     ├─   _maxPassLesson               10102
     ├─   _changeInfo                  Object{1}
     └─   _maxPassChapter              801

     📤 RESPONSE
     ├─ ret ...............: 0
     ├─ fields ............: (raw string)
     └─ size ..............: 109 chars (RAW)

     ⏱️  TIMING
     └─ Total .............: 8ms  
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
▼ [49] 🏆 activity::getActivityBrief  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: activity
     ├─ action ............: getActivityBrief
     ├─ userId ............: guest_093786dcde975077
     └─ serverId ..........: (missing)
     🔄 [1/3] Validate request ..
     └─ userId: guest_093786dcde9750...
     ✅ [1/3] Validate request ..
     🔄 [2/3] Load user data ....
     ✅ [2/3] Load user data ....
     ├─ userLevel: 2
     ├─ userCreateTime: 2026-05-20T23:34:36.427Z
     ├─ userAgeDays: 0.0 days
     ├─ serverOpenDate: 2026-05-20T23:34:19.452Z
     ├─ serverAgeDays: 0.0 days
     └─ dayOfWeek(UTC+7): 4 (Weekday)
     🔄 [3/3] Generate activity list .
     ├─ name: Hero Value Pack
     ├─ actType: 5037
     ├─ actCycle: 2
     ├─ displayIndex: 0
     └─ showRed: true
     ├─ name: New Server Discount Pack
     ├─ actType: 2003
     ├─ actCycle: 2
     ├─ displayIndex: 2
     └─ showRed: true
     ├─ name: Discount Today
     ├─ actType: 5003
     ├─ actCycle: 2
     ├─ displayIndex: 3
     └─ showRed: true
     ├─ name: Cumulative Top-up Gift
     ├─ actType: 2004
     ├─ actCycle: 2
     ├─ displayIndex: 4
     └─ showRed: true
     ├─ name: Daily accumulated top-up
     ├─ actType: 2007
     ├─ actCycle: 2
     ├─ displayIndex: 6
     └─ showRed: true
     ├─ name: Growth Quest
     ├─ actType: 1002
     ├─ actCycle: 1
     ├─ displayIndex: 7
     └─ showRed: true
     ├─ name: Hero Grand Kickback
     ├─ actType: 2001
     ├─ actCycle: 1
     ├─ displayIndex: 8
     └─ showRed: true
     ├─ name: Orange Hero Assembly
     ├─ actType: 2002
     ├─ actCycle: 1
     ├─ displayIndex: 9
     └─ showRed: true
     ├─ name: 7-Day Top-up At Will
     ├─ actType: 1003
     ├─ actCycle: 1
     ├─ displayIndex: 85
     └─ showRed: true
     ├─ name: Temple Contest
     ├─ actType: 4003
     ├─ actCycle: 4
     ├─ displayIndex: 9
     └─ showRed: true
     ├─ name: Ignition Illustration
     ├─ actType: 4001
     ├─ actCycle: 4
     ├─ displayIndex: 10
     └─ showRed: true
     ├─ name: Event Sign-in
     ├─ actType: 1001
     ├─ actCycle: 8
     ├─ displayIndex: 9999
     └─ showRed: false
     ✅ [3/3] Generate activity list .
     ├─ catalog: 12
     ├─ activated: 12
     └─ returned: 12
     ├─ count: 4
     ├─ homeIcon: zhujiemiannew87_png
     └─ sort: 79
     ├─ count: 5
     ├─ homeIcon: zhujiemiannew88_png
     └─ sort: 69
     ├─ count: 2
     ├─ homeIcon: zhujiemiannew101_png
     └─ sort: 89
     ├─ count: 1
     ├─ homeIcon: zhujiemiannew125_png
     └─ sort: 99

     📸 ACTIVITY BRIEF ret=0
     ├─   type                         "activity"
     ├─   action                       "getActivityBrief"
     ├─   userId                       "guest_093786dcde975077"
     ├─   version                      "1.0"
     └─   _acts                        Object{12}
     ├─ original: 2576 chars
     ├─ compressed: 776 chars
     ├─ reduction: 70%
     └─ threshold: 1024 chars

     📤 RESPONSE
     ├─ ret ...............: 0
     ├─ fields ............: (raw string)
     └─ size ..............: 776 chars (LZ)

     ⏱️  TIMING
     └─ Total .............: 12ms  █
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
  📊 IDLE SUMMARY — 10s no activity — mQxVEBxRASeU
══════════════════════════════════════════════════════════════════
  📊 Calls: 49  ✅ 49 OK  ⚡ 15.3ms avg  📦 15,263 chars
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
▼ [50] 🦸 hero::autoLevelUp  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: hero
     ├─ action ............: autoLevelUp
     ├─ userId ............: guest_093786dcde975077
     └─ serverId ..........: (missing)
     🔄 [1/4] Auto Level Up .....
     ├─ userId: guest_093786dcde9750
     ├─ heroId: d88cb0a2-8ada-4074-a60d-289a63af4034
     └─ times: 1
     ├─ maxTimes: 1
     └─ heroId: d88cb0a2-8ada-4074-a60d-289a63af4034
     ✅ [1/4] Auto Level Up .....heroId=d88cb0a2-8ada-4074-a60d-289a63af4034, times=1
     🔄 [2/4] Load hero data ....
     ├─ heroId: d88cb0a2-8ada-4074-a60d-289a63af4034
     ├─ displayId: 1309
     └─ currentLevel: 3
     🔄 [3/4] Calculate level up .
     ├─ heroQuality: purple
     ├─ heroType: body
     └─ configTable: heroLevelUpPurple
     ├─ expCapsule (131): 1457
     └─ gold (102): 2909
     ├─ levelsGained: 1
     ├─ oldLevel: 3
     ├─ newLevel: 4
     ├─ totalExpCost: 45
     ├─ totalGoldCost: 189
     ├─ remainingExp: 1412
     └─ remainingGold: 2720
     ✅ [3/4] Calculate level up .1 levels (3 → 4)
     🔄 [4/4] Save data & build response .
[DB] saveUser("guest_093786..."): 102 keys, 12837 bytes
     ├─ heroLevel: 4
     ├─ expCapsule: 1412
     └─ gold: 2720
     ├─ hp: 3841
     ├─ attack: 131
     ├─ armor: 268
     └─ power: 4618
     ✅ [4/4] Save data & build response .ret=0, heroId=d88cb0a2-8ada-4074-a60d-289a63af4034, lvl 3→4

     🔒 CRITICAL FIELDS AUDIT — game will crash/stuck if wrong
     ├─ 🔒 heroId                   = d88cb0a2-8ada-4074-a60d-289a63af4034  L133741: getHero(e.heroId) — REQUIRED
     ├─ 🔒 _heroLevel               = 4  L133751: heroBaseAttr.level = e._heroLevel
     ├─ 🔒 _baseAttr                = Object{6}  L133805: setBaseAttr(e._baseAttr, hero)
     ├─ 🔒 _totalAttr               = Object{7}  L133805: totalAttr loop _totalAttr._items
     ├─ 🔒 _totalCost._levelUp      = 2 items (exp+gold)  L133385-133393: totalCost.levelUp[] deserialize
     └─ 🔒 _changeInfo              = 2 items (exp+gold)  L118414-118417: resetTtemsCallBack → setItem(_id, _num)
     ✅ CRITICAL AUDIT: 6/6 PASSED

     📤 RESPONSE
     ├─ ret ...............: 0
     ├─ fields ............: (raw string)
     └─ size ..............: 623 chars (RAW)

     ⏱️  TIMING
     └─ Total .............: 13ms  █
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
▼ [51] 🦸 hero::autoLevelUp  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: hero
     ├─ action ............: autoLevelUp
     ├─ userId ............: guest_093786dcde975077
     └─ serverId ..........: (missing)
     🔄 [1/4] Auto Level Up .....
     ├─ userId: guest_093786dcde9750
     ├─ heroId: d88cb0a2-8ada-4074-a60d-289a63af4034
     └─ times: 100
     ├─ maxTimes: 100
     └─ heroId: d88cb0a2-8ada-4074-a60d-289a63af4034
     ✅ [1/4] Auto Level Up .....heroId=d88cb0a2-8ada-4074-a60d-289a63af4034, times=100
     🔄 [2/4] Load hero data ....
     ├─ heroId: d88cb0a2-8ada-4074-a60d-289a63af4034
     ├─ displayId: 1309
     └─ currentLevel: 4
     🔄 [3/4] Calculate level up .
     ├─ heroQuality: purple
     ├─ heroType: body
     └─ configTable: heroLevelUpPurple
     ├─ expCapsule (131): 1412
     └─ gold (102): 2720
     ├─ reason: NOT_ENOUGH_RESOURCES
     ├─ atLevel: 10
     ├─ needExp: 126
     ├─ haveExp: 890
     ├─ needGold: 549
     └─ haveGold: 524
     ├─ levelsGained: 6
     ├─ oldLevel: 4
     ├─ newLevel: 10
     ├─ totalExpCost: 522
     ├─ totalGoldCost: 2196
     ├─ remainingExp: 890
     └─ remainingGold: 524
     ✅ [3/4] Calculate level up .6 levels (4 → 10)
     🔄 [4/4] Save data & build response .
[DB] saveUser("guest_093786..."): 102 keys, 12836 bytes
     ├─ heroLevel: 10
     ├─ expCapsule: 890
     └─ gold: 524
     ├─ hp: 5255
     ├─ attack: 207
     ├─ armor: 500
     └─ power: 6340
     ✅ [4/4] Save data & build response .ret=0, heroId=d88cb0a2-8ada-4074-a60d-289a63af4034, lvl 4→10

     🔒 CRITICAL FIELDS AUDIT — game will crash/stuck if wrong
     ├─ 🔒 heroId                   = d88cb0a2-8ada-4074-a60d-289a63af4034  L133741: getHero(e.heroId) — REQUIRED
     ├─ 🔒 _heroLevel               = 10  L133751: heroBaseAttr.level = e._heroLevel
     ├─ 🔒 _baseAttr                = Object{6}  L133805: setBaseAttr(e._baseAttr, hero)
     ├─ 🔒 _totalAttr               = Object{7}  L133805: totalAttr loop _totalAttr._items
     ├─ 🔒 _totalCost._levelUp      = 2 items (exp+gold)  L133385-133393: totalCost.levelUp[] deserialize
     └─ 🔒 _changeInfo              = 2 items (exp+gold)  L118414-118417: resetTtemsCallBack → setItem(_id, _num)
     ✅ CRITICAL AUDIT: 6/6 PASSED

     📤 RESPONSE
     ├─ ret ...............: 0
     ├─ fields ............: (raw string)
     └─ size ..............: 624 chars (RAW)

     ⏱️  TIMING
     └─ Total .............: 8ms  
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
▼ [52] 🦸 hero::autoLevelUp  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: hero
     ├─ action ............: autoLevelUp
     ├─ userId ............: guest_093786dcde975077
     └─ serverId ..........: (missing)
     🔄 [1/4] Auto Level Up .....
     ├─ userId: guest_093786dcde9750
     ├─ heroId: e6e8872e-16f1-4ca3-bef2-4bba35e93356
     └─ times: 1
     ├─ maxTimes: 1
     └─ heroId: e6e8872e-16f1-4ca3-bef2-4bba35e93356
     ✅ [1/4] Auto Level Up .....heroId=e6e8872e-16f1-4ca3-bef2-4bba35e93356, times=1
     🔄 [2/4] Load hero data ....
     ├─ heroId: e6e8872e-16f1-4ca3-bef2-4bba35e93356
     ├─ displayId: 1205
     └─ currentLevel: 3
     🔄 [3/4] Calculate level up .
     ├─ heroQuality: purple
     ├─ heroType: critical
     └─ configTable: heroLevelUpPurple
     ├─ expCapsule (131): 890
     └─ gold (102): 524
     ├─ levelsGained: 1
     ├─ oldLevel: 3
     ├─ newLevel: 4
     ├─ totalExpCost: 45
     ├─ totalGoldCost: 189
     ├─ remainingExp: 845
     └─ remainingGold: 335
     ✅ [3/4] Calculate level up .1 levels (3 → 4)
     🔄 [4/4] Save data & build response .
[DB] saveUser("guest_093786..."): 102 keys, 12836 bytes
     ├─ heroLevel: 4
     ├─ expCapsule: 845
     └─ gold: 335
     ├─ hp: 1395
     ├─ attack: 487
     ├─ armor: 250
     └─ power: 2508
     ✅ [4/4] Save data & build response .ret=0, heroId=e6e8872e-16f1-4ca3-bef2-4bba35e93356, lvl 3→4

     🔒 CRITICAL FIELDS AUDIT — game will crash/stuck if wrong
     ├─ 🔒 heroId                   = e6e8872e-16f1-4ca3-bef2-4bba35e93356  L133741: getHero(e.heroId) — REQUIRED
     ├─ 🔒 _heroLevel               = 4  L133751: heroBaseAttr.level = e._heroLevel
     ├─ 🔒 _baseAttr                = Object{6}  L133805: setBaseAttr(e._baseAttr, hero)
     ├─ 🔒 _totalAttr               = Object{7}  L133805: totalAttr loop _totalAttr._items
     ├─ 🔒 _totalCost._levelUp      = 2 items (exp+gold)  L133385-133393: totalCost.levelUp[] deserialize
     └─ 🔒 _changeInfo              = 2 items (exp+gold)  L118414-118417: resetTtemsCallBack → setItem(_id, _num)
     ✅ CRITICAL AUDIT: 6/6 PASSED

     📤 RESPONSE
     ├─ ret ...............: 0
     ├─ fields ............: (raw string)
     └─ size ..............: 621 chars (RAW)

     ⏱️  TIMING
     └─ Total .............: 11ms  █
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
▼ [53] 🦸 hero::autoLevelUp  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: hero
     ├─ action ............: autoLevelUp
     ├─ userId ............: guest_093786dcde975077
     └─ serverId ..........: (missing)
     🔄 [1/4] Auto Level Up .....
     ├─ userId: guest_093786dcde9750
     ├─ heroId: e6e8872e-16f1-4ca3-bef2-4bba35e93356
     └─ times: 100
     ├─ maxTimes: 100
     └─ heroId: e6e8872e-16f1-4ca3-bef2-4bba35e93356
     ✅ [1/4] Auto Level Up .....heroId=e6e8872e-16f1-4ca3-bef2-4bba35e93356, times=100
     🔄 [2/4] Load hero data ....
     ├─ heroId: e6e8872e-16f1-4ca3-bef2-4bba35e93356
     ├─ displayId: 1205
     └─ currentLevel: 4
     🔄 [3/4] Calculate level up .
     ├─ heroQuality: purple
     ├─ heroType: critical
     └─ configTable: heroLevelUpPurple
     ├─ expCapsule (131): 845
     └─ gold (102): 335
     ├─ reason: NOT_ENOUGH_RESOURCES
     ├─ atLevel: 5
     ├─ needExp: 72
     ├─ haveExp: 791
     ├─ needGold: 288
     └─ haveGold: 101
     ├─ levelsGained: 1
     ├─ oldLevel: 4
     ├─ newLevel: 5
     ├─ totalExpCost: 54
     ├─ totalGoldCost: 234
     ├─ remainingExp: 791
     └─ remainingGold: 101
     ✅ [3/4] Calculate level up .1 levels (4 → 5)
     🔄 [4/4] Save data & build response .
[DB] saveUser("guest_093786..."): 102 keys, 12836 bytes
     ├─ heroLevel: 5
     ├─ expCapsule: 791
     └─ gold: 101
     ├─ hp: 1529
     ├─ attack: 513
     ├─ armor: 286
     └─ power: 2704
     ✅ [4/4] Save data & build response .ret=0, heroId=e6e8872e-16f1-4ca3-bef2-4bba35e93356, lvl 4→5

     🔒 CRITICAL FIELDS AUDIT — game will crash/stuck if wrong
     ├─ 🔒 heroId                   = e6e8872e-16f1-4ca3-bef2-4bba35e93356  L133741: getHero(e.heroId) — REQUIRED
     ├─ 🔒 _heroLevel               = 5  L133751: heroBaseAttr.level = e._heroLevel
     ├─ 🔒 _baseAttr                = Object{6}  L133805: setBaseAttr(e._baseAttr, hero)
     ├─ 🔒 _totalAttr               = Object{7}  L133805: totalAttr loop _totalAttr._items
     ├─ 🔒 _totalCost._levelUp      = 2 items (exp+gold)  L133385-133393: totalCost.levelUp[] deserialize
     └─ 🔒 _changeInfo              = 2 items (exp+gold)  L118414-118417: resetTtemsCallBack → setItem(_id, _num)
     ✅ CRITICAL AUDIT: 6/6 PASSED

     📤 RESPONSE
     ├─ ret ...............: 0
     ├─ fields ............: (raw string)
     └─ size ..............: 621 chars (RAW)

     ⏱️  TIMING
     └─ Total .............: 11ms  █
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
▼ [54] 🏆 activity::getActivityBrief  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: activity
     ├─ action ............: getActivityBrief
     ├─ userId ............: guest_093786dcde975077
     └─ serverId ..........: (missing)
     🔄 [1/3] Validate request ..
     └─ userId: guest_093786dcde9750...
     ✅ [1/3] Validate request ..
     🔄 [2/3] Load user data ....
     ✅ [2/3] Load user data ....
     ├─ userLevel: 2
     ├─ userCreateTime: 2026-05-20T23:34:36.427Z
     ├─ userAgeDays: 0.0 days
     ├─ serverOpenDate: 2026-05-20T23:34:19.452Z
     ├─ serverAgeDays: 0.0 days
     └─ dayOfWeek(UTC+7): 4 (Weekday)
     🔄 [3/3] Generate activity list .
     ├─ name: Hero Value Pack
     ├─ actType: 5037
     ├─ actCycle: 2
     ├─ displayIndex: 0
     └─ showRed: true
     ├─ name: New Server Discount Pack
     ├─ actType: 2003
     ├─ actCycle: 2
     ├─ displayIndex: 2
     └─ showRed: true
     ├─ name: Discount Today
     ├─ actType: 5003
     ├─ actCycle: 2
     ├─ displayIndex: 3
     └─ showRed: true
     ├─ name: Cumulative Top-up Gift
     ├─ actType: 2004
     ├─ actCycle: 2
     ├─ displayIndex: 4
     └─ showRed: true
     ├─ name: Daily accumulated top-up
     ├─ actType: 2007
     ├─ actCycle: 2
     ├─ displayIndex: 6
     └─ showRed: true
     ├─ name: Growth Quest
     ├─ actType: 1002
     ├─ actCycle: 1
     ├─ displayIndex: 7
     └─ showRed: true
     ├─ name: Hero Grand Kickback
     ├─ actType: 2001
     ├─ actCycle: 1
     ├─ displayIndex: 8
     └─ showRed: true
     ├─ name: Orange Hero Assembly
     ├─ actType: 2002
     ├─ actCycle: 1
     ├─ displayIndex: 9
     └─ showRed: true
     ├─ name: 7-Day Top-up At Will
     ├─ actType: 1003
     ├─ actCycle: 1
     ├─ displayIndex: 85
     └─ showRed: true
     ├─ name: Temple Contest
     ├─ actType: 4003
     ├─ actCycle: 4
     ├─ displayIndex: 9
     └─ showRed: true
     ├─ name: Ignition Illustration
     ├─ actType: 4001
     ├─ actCycle: 4
     ├─ displayIndex: 10
     └─ showRed: true
     ├─ name: Event Sign-in
     ├─ actType: 1001
     ├─ actCycle: 8
     ├─ displayIndex: 9999
     └─ showRed: false
     ✅ [3/3] Generate activity list .
     ├─ catalog: 12
     ├─ activated: 12
     └─ returned: 12
     ├─ count: 4
     ├─ homeIcon: zhujiemiannew87_png
     └─ sort: 79
     ├─ count: 5
     ├─ homeIcon: zhujiemiannew88_png
     └─ sort: 69
     ├─ count: 2
     ├─ homeIcon: zhujiemiannew101_png
     └─ sort: 89
     ├─ count: 1
     ├─ homeIcon: zhujiemiannew125_png
     └─ sort: 99

     📸 ACTIVITY BRIEF ret=0
     ├─   type                         "activity"
     ├─   action                       "getActivityBrief"
     ├─   userId                       "guest_093786dcde975077"
     ├─   version                      "1.0"
     └─   _acts                        Object{12}
     ├─ original: 2576 chars
     ├─ compressed: 776 chars
     ├─ reduction: 70%
     └─ threshold: 1024 chars

     📤 RESPONSE
     ├─ ret ...............: 0
     ├─ fields ............: (raw string)
     └─ size ..............: 776 chars (LZ)

     ⏱️  TIMING
     └─ Total .............: 12ms  █
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
▼ [55] ⏳ hangup::startGeneral  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: hangup
     ├─ action ............: startGeneral
     ├─ userId ............: guest_093786dcde975077
     └─ serverId ..........: (missing)
     🔄 [1/7] Validate request ..
     ├─ userId: guest_093786dcde9750
     ├─ version: 1.0
     ├─ team: 5 heroes
     ├─ super: 
     └─ battleField: 20
     ✅ [1/7] Validate request ..
     🔄 [2/7] Load data .........
     ✅ [2/7] Load data .........lesson=611, heroes=887, levelAttr=360, typeParam=13, qualityParam=7, heroPower=403, qualityPower=7
     🔄 [3/7] Read lesson progress .
     ├─ curLess: 10103
     └─ source: userData.hangup._curLess
     ✅ [3/7] Read lesson progress .lesson=10103 (lesson_name_5)
     🔄 [4/7] Parse enemy config .
     ├─ enemyList: ,,,55202,
     ├─ enemyLevel: ,,,8,
     ├─ monsterType: ,,,critical,
     ├─ difficultyHp: 1.89,1.89,1.89,3.024,1.89
     ├─ difficultyAttack: 4.4,4.4,4.4,4.84,4.4
     ├─ difficultyArmor: 1,1,1,1,1
     ├─ power: 10000
     └─ isBoss: 4
     ✅ [4/7] Parse enemy config .parsed 5 positions
     🔄 [5/7] Build enemy team ..
     ├─ pos: 3
     ├─ heroId: 55202
     ├─ quality: blue
     ├─ level: 8
     ├─ monsterType: critical
     ├─ diffHp/dAtk/dArm: 3.024/4.84/1
     ├─ hp/atk/arm: 5844.79/2853.18/394.10
     ├─ power: 9283
     ├─ speed: 187
     └─ skills: 120201,120211,120291
     ✅ [5/7] Build enemy team ..1 enemies built
     🔄 [6/7] Build response ....
     ├─ battleId: 2629b997-a4f...
     ├─ userId: guest_093786dcde...
     ├─ lessonId: 10103
     └─ status: REGISTERED
     ✅ [6/7] Build response ....battleId=2629b997..., enemies=1
     🔄 [7/7] Verify & respond ..

     🔒 CRITICAL FIELDS AUDIT — game will crash/stuck if wrong
     ├─ 🔒 _battleId                = 2629b997-a4f0-43...  L97731: UserInfoSingleton.getInstance().battleId = r._battleId
     ├─ 🔒 _rightTeam (FLAT, no _items) = 1 heroes (keys: 3)  L102470: for (var o in e) iterates _rightTeam directly — [FIX-001]
     ├─ 🔒 _rightSuper              = 0 skills  L103618: rightSuper: r ? r : [] (empty is valid)
     ├─ 🔒 _attrs._items uses _id   = verified  L102528-537: a.type = o._id — [FIX-002]
     ├─ 🔒 Power attr (21)          = included (integer)  L133821: 21==p._id → floor(num) — [FIX-006][FIX-015]
     ├─ 🔒 FullHealth attr (22)     = included (= HP with decimals)  L74988: heroMaxHealth = FullHealth || Health — [FIX-007]
     ├─ 🔒 HP/ATK/ARM decimal values = NOT floored — matches HAR  HAR: _num:702.45, _num:174.24 — [FIX-009]
     ├─ 🔒 ENERGY attr (16)         = 50 (starting energy)  HAR: _num:50 — [FIX-014]
     ├─ 🔒 Skills keyed by skill ID = verified  HAR: "190401":{...} — [FIX-013]
     └─ 🔒 Formula 5-layer          = (levelAttr × typeParam + bais) × qualityParam × balance × difficulty  L116073 makeHeroBasicAttr — [FIX-008]
     ✅ CRITICAL AUDIT: 10/10 PASSED

  ┌──────────────────────────────────────────────────────────┐
  │  ❌ FATAL ERROR AT STEP L101674: for (var o = 0; o < n.length; o++)│
  │                                                          │
  │  STEP:   START-GENERAL                                   │
  │  REASON: TYPE ASSERTION FAILED: responseData._rightSuper │
  │  DETAIL: L101674: for (var o = 0; o < n.length; o++)     │
  │                                                          │
  │  IMPACT:  Wrong type -> super skill parsing error         │
  │                                                          │
  └──────────────────────────────────────────────────────────┘

     ├─ field: responseData._rightSuper
     ├─ expected: object
     ├─ actual: object
     └─ value: 
     ✅ [7/7] Verify & respond ..

     📸 START GENERAL ret=0
     ├─   _battleId                    "2629b997-a4f0-4307-bc05-c27a..."
     ├─   _rightTeam                   Object{1}
     └─   _rightSuper                  Array[0] ⚠️ EMPTY

     🏏️ SUMMARY
     👤 User ......... guest_093786dcde975077
     📦 Data .......... 0 chars (RAW)


     📤 RESPONSE
     ├─ ret ...............: 0
     ├─ fields ............: (raw string)
     └─ size ..............: 994 chars (RAW)

     ⏱️  TIMING
     └─ Total .............: 6ms  
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
▼ [56] 🛠️ battle::getRandom  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: battle
     ├─ action ............: getRandom
     ├─ userId ............: guest_093786dcde975077
     └─ serverId ..........: (missing)
     🔄 [1/5] Validate request ..
     ├─ userId: guest_093786dcde9750
     ├─ battleId: 2629b997-a4f0-4307-b...
     ├─ count: 100
     └─ version: 1.0
     ✅ [1/5] Validate request ..
     🔄 [2/5] Validate battleId .
     ✅ [2/5] Validate battleId .battleId=2629b997-a4f... lesson=10103
     🔄 [3/5] Generate randoms ..
     ├─ count: 100
     ├─ min: 0.021060
     ├─ max: 0.997666
     ├─ avg: 0.516990
     ├─ first5: 0.155796, 0.914827, 0.058361, 0.954259, 0.763860
     └─ precision: ~16 decimal places (Math.random)
     ✅ [3/5] Generate randoms ..100 randoms generated (avg=0.5170)
     🔄 [4/5] Update session ....
     ├─ battleId: 2629b997-a4f...
     ├─ randomUsed: true
     └─ nextStep: hangup::checkBattleResult
     ✅ [4/5] Update session ....
     🔄 [5/5] Build response ....

  ┌──────────────────────────────────────────────────────────┐
  │  ❌ FATAL ERROR AT STEP L102462: t(e._rand) — callback receives array│
  │                                                          │
  │  STEP:   GET-RANDOM                                      │
  │  REASON: TYPE ASSERTION FAILED: responseData._rand       │
  │  DETAIL: L102462: t(e._rand) — callback receives array   │
  │                                                          │
  │  IMPACT:  Wrong type -> RandomManager.addRandomList fails -> battle crash│
  │                                                          │
  └──────────────────────────────────────────────────────────┘

     ├─ field: responseData._rand
     ├─ expected: object
     ├─ actual: object
     └─ value: 0.15579649385471295,0.9148268243496434,0.05836126353998605,0.9542591648804757,0.7638601331104603,0.6434400768455691,0.22417013269874775,0.021243524117738,0.12910295889011347,0.6712929679290065,0.37848626551752096,0.5292588827438026,0.5773557966242484,0.15960243177626732,0.26673471898316536,0.5519633152840421,0.07354984982796364,0.7715714397429922,0.501956980591261,0.6548788410799878,0.8168718769319642,0.9347093822171249,0.3668997752149965,0.12698812137781756,0.7261506042165197,0.17932995621157022,0.5069267851216549,0.09194811975767436,0.06265981635460227,0.6449669585846007,0.02761336510415524,0.5050875112649312,0.9570463240897793,0.0966948776282548,0.05390845241439801,0.9569957116358293,0.49990564900684586,0.7278142205145115,0.2905024960453242,0.315214947211204,0.6784274239377361,0.42986113722072383,0.9293543315948359,0.43605779681901,0.4661503979563215,0.5640940110254268,0.02105973770368419,0.7325158335920466,0.8137145557807635,0.34368279399152724,0.4403488594379078,0.5143247418672088,0.967954161045519,0.7514100914072667,0.23459768835381956,0.6410366707868171,0.33389804392658895,0.8574476441743133,0.18006773334363235,0.7732681261509788,0.05598937241513491,0.7450109073413,0.25194632288830543,0.09362434278814402,0.35658383963426776,0.6476781263205162,0.9753649268365384,0.15875297265956478,0.25632388170121534,0.3622416507015712,0.8333959320967662,0.6765333585567493,0.4083013613388423,0.8955828104875743,0.9479554292918825,0.35922173229506826,0.8132069676480581,0.5939427706603594,0.5135799401235449,0.539307542795264,0.5816541451763093,0.8121425887217902,0.6793107944117249,0.32649984285412614,0.8019162654967201,0.75463049110867,0.9448549735954055,0.1538103929150565,0.8918256996199074,0.27295047361777525,0.9323006044245772,0.9976656828876332,0.28872451490473905,0.4104592834902654,0.9904839831475439,0.4461465956217411,0.9325430845448286,0.5808419027594978,0.07273810011953064,0.343696453522671
     ✅ [5/5] Build response ....

     📸 GET RANDOM ret=0
     ├─   _rand_length                 100
     ├─   _rand_first3                 Array[3]
     └─   _rand_avg                    "0.516990"

     🏏️ SUMMARY
     👤 User ......... guest_093786dcde975077
     📦 Data .......... 0 chars (RAW)

     ├─ original: 1930 chars
     ├─ compressed: 539 chars
     ├─ reduction: 72%
     └─ threshold: 1024 chars

     📤 RESPONSE
     ├─ ret ...............: 0
     ├─ fields ............: (raw string)
     └─ size ..............: 539 chars (LZ)

     ⏱️  TIMING
     └─ Total .............: 5ms  
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
▼ [57] ⏳ hangup::checkBattleResult  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: hangup
     ├─ action ............: checkBattleResult
     ├─ userId ............: guest_093786dcde975077
     └─ serverId ..........: (missing)
     🔄 [1/5] Validate request ..
     ├─ userId: guest_093786dcde9750
     ├─ isGuide: false
     ├─ battleId: 2629b997-a4f0-4307-bc05-c27ae1f02332
     ├─ checkResult: [object Object],[object Object],[object Object],[object Object]
     ├─ runaway: false
     └─ super: 
     ✅ [1/5] Validate request ..
     🔄 [2/5] Load data .........
     ✅ [2/5] Load data .........lesson.json=611 entries
     🔄 [3/5] Read progress .....
     ├─ curLess: 10103
     ├─ maxPassLesson: 10102
     ├─ maxPassChapter: 801
     └─ source: user.hangup
     ✅ [3/5] Read progress .....lesson=10103
     🔄 [4/5] Determine outcome .
     ├─ mode: REGULAR
     ├─ checkResult: [object Object],[object Object],[object Object],[object Object]
     ├─ runaway: false
     └─ isWin: false
     ✅ [4/5] Determine outcome .LOSE (1)
     🔄 [5/5] Build response ....
     └─ status: LOSE — no rewards given
[DB] saveUser("guest_093786..."): 102 keys, 12836 bytes
     ✅ [5/7] Build response ....LOSE rewards=0 lesson=10103

     🔒 CRITICAL FIELDS AUDIT — game will crash/stuck if wrong
     ├─ 🔒 _battleResult            = 1  L97750: 0 == t._battleResult ? true : false (regular battle)
     ├─ 🔒 _changeInfo._items       = 0 items  L97686: getBattleAwardItems iterates _changeInfo._items for {_id, _num}
     ├─ 🔒 _curLess                 = 10103  L104892/L97751: OnHookSingleton.lastSection = e._curLess
     └─ 🔒 _maxPassLesson           = 10102  L104893/L97751: OnHookSingleton.maxPassLesson = e._maxPassLesson
     ✅ CRITICAL AUDIT: 3/4 PASSED, 1 warning(s)

     🔒 CRITICAL FIELDS AUDIT — game will crash/stuck if wrong
     └─ 🔒 _maxPassChapter          = 801  L97751: OnHookSingleton.maxPassChapter = e._maxPassChapter (regular only)
     ✅ CRITICAL AUDIT: 1/1 PASSED

     🏏️ SUMMARY
     👤 User ......... guest_093786dcde975077
     📦 Fields ........ 5
     📦 Data .......... 0 chars (RAW)


     📸 CHECK BATTLE RESULT ret=0
     ├─   _battleResult                1
     ├─   _curLess                     10103
     ├─   _maxPassLesson               10102
     ├─   _changeInfo                  Object{1}
     └─   _maxPassChapter              801

     📤 RESPONSE
     ├─ ret ...............: 0
     ├─ fields ............: (raw string)
     └─ size ..............: 109 chars (RAW)

     ⏱️  TIMING
     └─ Total .............: 11ms  █
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
▼ [58] 🏆 activity::getActivityBrief  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: activity
     ├─ action ............: getActivityBrief
     ├─ userId ............: guest_093786dcde975077
     └─ serverId ..........: (missing)
     🔄 [1/3] Validate request ..
     └─ userId: guest_093786dcde9750...
     ✅ [1/3] Validate request ..
     🔄 [2/3] Load user data ....
     ✅ [2/3] Load user data ....
     ├─ userLevel: 2
     ├─ userCreateTime: 2026-05-20T23:34:36.427Z
     ├─ userAgeDays: 0.0 days
     ├─ serverOpenDate: 2026-05-20T23:34:19.452Z
     ├─ serverAgeDays: 0.0 days
     └─ dayOfWeek(UTC+7): 4 (Weekday)
     🔄 [3/3] Generate activity list .
     ├─ name: Hero Value Pack
     ├─ actType: 5037
     ├─ actCycle: 2
     ├─ displayIndex: 0
     └─ showRed: true
     ├─ name: New Server Discount Pack
     ├─ actType: 2003
     ├─ actCycle: 2
     ├─ displayIndex: 2
     └─ showRed: true
     ├─ name: Discount Today
     ├─ actType: 5003
     ├─ actCycle: 2
     ├─ displayIndex: 3
     └─ showRed: true
     ├─ name: Cumulative Top-up Gift
     ├─ actType: 2004
     ├─ actCycle: 2
     ├─ displayIndex: 4
     └─ showRed: true
     ├─ name: Daily accumulated top-up
     ├─ actType: 2007
     ├─ actCycle: 2
     ├─ displayIndex: 6
     └─ showRed: true
     ├─ name: Growth Quest
     ├─ actType: 1002
     ├─ actCycle: 1
     ├─ displayIndex: 7
     └─ showRed: true
     ├─ name: Hero Grand Kickback
     ├─ actType: 2001
     ├─ actCycle: 1
     ├─ displayIndex: 8
     └─ showRed: true
     ├─ name: Orange Hero Assembly
     ├─ actType: 2002
     ├─ actCycle: 1
     ├─ displayIndex: 9
     └─ showRed: true
     ├─ name: 7-Day Top-up At Will
     ├─ actType: 1003
     ├─ actCycle: 1
     ├─ displayIndex: 85
     └─ showRed: true
     ├─ name: Temple Contest
     ├─ actType: 4003
     ├─ actCycle: 4
     ├─ displayIndex: 9
     └─ showRed: true
     ├─ name: Ignition Illustration
     ├─ actType: 4001
     ├─ actCycle: 4
     ├─ displayIndex: 10
     └─ showRed: true
     ├─ name: Event Sign-in
     ├─ actType: 1001
     ├─ actCycle: 8
     ├─ displayIndex: 9999
     └─ showRed: false
     ✅ [3/3] Generate activity list .
     ├─ catalog: 12
     ├─ activated: 12
     └─ returned: 12
     ├─ count: 4
     ├─ homeIcon: zhujiemiannew87_png
     └─ sort: 79
     ├─ count: 5
     ├─ homeIcon: zhujiemiannew88_png
     └─ sort: 69
     ├─ count: 2
     ├─ homeIcon: zhujiemiannew101_png
     └─ sort: 89
     ├─ count: 1
     ├─ homeIcon: zhujiemiannew125_png
     └─ sort: 99

     📸 ACTIVITY BRIEF ret=0
     ├─   type                         "activity"
     ├─   action                       "getActivityBrief"
     ├─   userId                       "guest_093786dcde975077"
     ├─   version                      "1.0"
     └─   _acts                        Object{12}
     ├─ original: 2576 chars
     ├─ compressed: 776 chars
     ├─ reduction: 70%
     └─ threshold: 1024 chars

     📤 RESPONSE
     ├─ ret ...............: 0
     ├─ fields ............: (raw string)
     └─ size ..............: 776 chars (LZ)

     ⏱️  TIMING
     └─ Total .............: 5ms  
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
▼ [59] 🏆 activity::getActivityBrief  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: activity
     ├─ action ............: getActivityBrief
     ├─ userId ............: guest_093786dcde975077
     └─ serverId ..........: (missing)
     🔄 [1/3] Validate request ..
     └─ userId: guest_093786dcde9750...
     ✅ [1/3] Validate request ..
     🔄 [2/3] Load user data ....
     ✅ [2/3] Load user data ....
     ├─ userLevel: 2
     ├─ userCreateTime: 2026-05-20T23:34:36.427Z
     ├─ userAgeDays: 0.0 days
     ├─ serverOpenDate: 2026-05-20T23:34:19.452Z
     ├─ serverAgeDays: 0.0 days
     └─ dayOfWeek(UTC+7): 4 (Weekday)
     🔄 [3/3] Generate activity list .
     ├─ name: Hero Value Pack
     ├─ actType: 5037
     ├─ actCycle: 2
     ├─ displayIndex: 0
     └─ showRed: true
     ├─ name: New Server Discount Pack
     ├─ actType: 2003
     ├─ actCycle: 2
     ├─ displayIndex: 2
     └─ showRed: true
     ├─ name: Discount Today
     ├─ actType: 5003
     ├─ actCycle: 2
     ├─ displayIndex: 3
     └─ showRed: true
     ├─ name: Cumulative Top-up Gift
     ├─ actType: 2004
     ├─ actCycle: 2
     ├─ displayIndex: 4
     └─ showRed: true
     ├─ name: Daily accumulated top-up
     ├─ actType: 2007
     ├─ actCycle: 2
     ├─ displayIndex: 6
     └─ showRed: true
     ├─ name: Growth Quest
     ├─ actType: 1002
     ├─ actCycle: 1
     ├─ displayIndex: 7
     └─ showRed: true
     ├─ name: Hero Grand Kickback
     ├─ actType: 2001
     ├─ actCycle: 1
     ├─ displayIndex: 8
     └─ showRed: true
     ├─ name: Orange Hero Assembly
     ├─ actType: 2002
     ├─ actCycle: 1
     ├─ displayIndex: 9
     └─ showRed: true
     ├─ name: 7-Day Top-up At Will
     ├─ actType: 1003
     ├─ actCycle: 1
     ├─ displayIndex: 85
     └─ showRed: true
     ├─ name: Temple Contest
     ├─ actType: 4003
     ├─ actCycle: 4
     ├─ displayIndex: 9
     └─ showRed: true
     ├─ name: Ignition Illustration
     ├─ actType: 4001
     ├─ actCycle: 4
     ├─ displayIndex: 10
     └─ showRed: true
     ├─ name: Event Sign-in
     ├─ actType: 1001
     ├─ actCycle: 8
     ├─ displayIndex: 9999
     └─ showRed: false
     ✅ [3/3] Generate activity list .
     ├─ catalog: 12
     ├─ activated: 12
     └─ returned: 12
     ├─ count: 4
     ├─ homeIcon: zhujiemiannew87_png
     └─ sort: 79
     ├─ count: 5
     ├─ homeIcon: zhujiemiannew88_png
     └─ sort: 69
     ├─ count: 2
     ├─ homeIcon: zhujiemiannew101_png
     └─ sort: 89
     ├─ count: 1
     ├─ homeIcon: zhujiemiannew125_png
     └─ sort: 99

     📸 ACTIVITY BRIEF ret=0
     ├─   type                         "activity"
     ├─   action                       "getActivityBrief"
     ├─   userId                       "guest_093786dcde975077"
     ├─   version                      "1.0"
     └─   _acts                        Object{12}
     ├─ original: 2576 chars
     ├─ compressed: 776 chars
     ├─ reduction: 70%
     └─ threshold: 1024 chars

     📤 RESPONSE
     ├─ ret ...............: 0
     ├─ fields ............: (raw string)
     └─ size ..............: 776 chars (LZ)

     ⏱️  TIMING
     └─ Total .............: 19ms  █
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
▼ [60] 🏆 activity::getActivityBrief  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: activity
     ├─ action ............: getActivityBrief
     ├─ userId ............: guest_093786dcde975077
     └─ serverId ..........: (missing)
     🔄 [1/3] Validate request ..
     └─ userId: guest_093786dcde9750...
     ✅ [1/3] Validate request ..
     🔄 [2/3] Load user data ....
     ✅ [2/3] Load user data ....
     ├─ userLevel: 2
     ├─ userCreateTime: 2026-05-20T23:34:36.427Z
     ├─ userAgeDays: 0.0 days
     ├─ serverOpenDate: 2026-05-20T23:34:19.452Z
     ├─ serverAgeDays: 0.0 days
     └─ dayOfWeek(UTC+7): 4 (Weekday)
     🔄 [3/3] Generate activity list .
     ├─ name: Hero Value Pack
     ├─ actType: 5037
     ├─ actCycle: 2
     ├─ displayIndex: 0
     └─ showRed: true
     ├─ name: New Server Discount Pack
     ├─ actType: 2003
     ├─ actCycle: 2
     ├─ displayIndex: 2
     └─ showRed: true
     ├─ name: Discount Today
     ├─ actType: 5003
     ├─ actCycle: 2
     ├─ displayIndex: 3
     └─ showRed: true
     ├─ name: Cumulative Top-up Gift
     ├─ actType: 2004
     ├─ actCycle: 2
     ├─ displayIndex: 4
     └─ showRed: true
     ├─ name: Daily accumulated top-up
     ├─ actType: 2007
     ├─ actCycle: 2
     ├─ displayIndex: 6
     └─ showRed: true
     ├─ name: Growth Quest
     ├─ actType: 1002
     ├─ actCycle: 1
     ├─ displayIndex: 7
     └─ showRed: true
     ├─ name: Hero Grand Kickback
     ├─ actType: 2001
     ├─ actCycle: 1
     ├─ displayIndex: 8
     └─ showRed: true
     ├─ name: Orange Hero Assembly
     ├─ actType: 2002
     ├─ actCycle: 1
     ├─ displayIndex: 9
     └─ showRed: true
     ├─ name: 7-Day Top-up At Will
     ├─ actType: 1003
     ├─ actCycle: 1
     ├─ displayIndex: 85
     └─ showRed: true
     ├─ name: Temple Contest
     ├─ actType: 4003
     ├─ actCycle: 4
     ├─ displayIndex: 9
     └─ showRed: true
     ├─ name: Ignition Illustration
     ├─ actType: 4001
     ├─ actCycle: 4
     ├─ displayIndex: 10
     └─ showRed: true
     ├─ name: Event Sign-in
     ├─ actType: 1001
     ├─ actCycle: 8
     ├─ displayIndex: 9999
     └─ showRed: false
     ✅ [3/3] Generate activity list .
     ├─ catalog: 12
     ├─ activated: 12
     └─ returned: 12
     ├─ count: 4
     ├─ homeIcon: zhujiemiannew87_png
     └─ sort: 79
     ├─ count: 5
     ├─ homeIcon: zhujiemiannew88_png
     └─ sort: 69
     ├─ count: 2
     ├─ homeIcon: zhujiemiannew101_png
     └─ sort: 89
     ├─ count: 1
     ├─ homeIcon: zhujiemiannew125_png
     └─ sort: 99

     📸 ACTIVITY BRIEF ret=0
     ├─   type                         "activity"
     ├─   action                       "getActivityBrief"
     ├─   userId                       "guest_093786dcde975077"
     ├─   version                      "1.0"
     └─   _acts                        Object{12}
     ├─ original: 2576 chars
     ├─ compressed: 776 chars
     ├─ reduction: 70%
     └─ threshold: 1024 chars

     📤 RESPONSE
     ├─ ret ...............: 0
     ├─ fields ............: (raw string)
     └─ size ..............: 776 chars (LZ)

     ⏱️  TIMING
     └─ Total .............: 18ms  █
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
  📊 IDLE SUMMARY — 10s no activity — mQxVEBxRASeU
══════════════════════════════════════════════════════════════════
  📊 Calls: 60  ✅ 60 OK  ⚡ 14.5ms avg  📦 22,498 chars
══════════════════════════════════════════════════════════════════
