[DB] Loaded 6 records from /var/www/html/server/main-server/data/main_server.json (77241 bytes)
🟢 17:30:15 INFO  📋 CONFIG   ▸ serverOpenDate auto-initialized: 1779384615148

  ──────────────────── LOADING RESOURCES ────────────────────

🟢 17:30:15 INFO  📋 CONFIG   ▸ Resource loaded: constant.json
     ├─ entries: 1
     ├─ bytes: 17728
     └─ path: /var/www/html/resource/json/constant.json
🟢 17:30:15 INFO  📋 CONFIG   ▸ Resource loaded: hero.json
     ├─ entries: 887
     ├─ bytes: 1467869
     └─ path: /var/www/html/resource/json/hero.json
🟢 17:30:15 INFO  📋 CONFIG   ▸ Resource loaded: summon.json
     ├─ entries: 4
     ├─ bytes: 736
     └─ path: /var/www/html/resource/json/summon.json
🟢 17:30:15 INFO  📋 CONFIG   ▸ Resource loaded: heroLevelAttr.json
     ├─ entries: 360
     ├─ bytes: 32275
     └─ path: /var/www/html/resource/json/heroLevelAttr.json
🟢 17:30:15 INFO  📋 CONFIG   ▸ Resource loaded: heroTypeParam.json
     ├─ entries: 13
     ├─ bytes: 2241
     └─ path: /var/www/html/resource/json/heroTypeParam.json
🟢 17:30:15 INFO  📋 CONFIG   ▸ Resource loaded: heroQualityParam.json
     ├─ entries: 7
     ├─ bytes: 746
     └─ path: /var/www/html/resource/json/heroQualityParam.json
🟢 17:30:15 INFO  📋 CONFIG   ▸ Resource loaded: heroPower.json
     ├─ entries: 403
     ├─ bytes: 43864
     └─ path: /var/www/html/resource/json/heroPower.json
🟢 17:30:15 INFO  📋 CONFIG   ▸ Resource loaded: heroQualityPower.json
     ├─ entries: 7
     ├─ bytes: 466
     └─ path: /var/www/html/resource/json/heroQualityPower.json
🟢 17:30:15 INFO  📋 CONFIG   ▸ Resource loaded: zPowerQualityPara.json
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
  │  serverOpenDate   : 1779384615148
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
  │  heroQualityPower.json    : 7 entries
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


🟢 17:30:15 INFO  🚀 SERVER   ▸ Ready — listening on http://127.0.0.1:8001
🟢 17:30:15 INFO  🚀 SERVER   ▸ Waiting for Socket.IO connections...

══════════════════════════════════════════════════════════════════
  🔗⚡ Client connected  4ttRnaTDBVMG...  📍 ::ffff:127.0.0.1  📡 polling
🟢 17:30:31 INFO  🔐 TEA      ▸ Sending verify challenge
     ├─ challenge: d546fc93-5ebc-4279-8922-bf07095e52be
     └─ socketId: 4ttRnaTDBVMGQ7ao...
     ├─ type: string
     └─ length: 48
🟢 17:30:31 INFO  🔐 TEA      ▸ TEA verification SUCCESS
     ├─ socketId: 4ttRnaTDBVMGQ7ao...
     ├─ duration: 3ms
     └─ transport: polling
     ├─ socketId: 4ttRnaTDBVMGQ7ao...
     ├─ from: polling
     └─ to: websocket
══════════════════════════════════════════════════════════════════
▼ [1] 👤 user::enterGame  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: user
     ├─ action ............: enterGame
     ├─ userId ............: guest_d43888e81e93a38d
     └─ serverId ..........: 1
🟢 17:30:31 INFO  ⚔️ ENTER    ▸ enterGame REQUEST RECEIVED
     ├─ userId: guest_d43888e81e93a38d
     ├─ serverId: 1
     ├─ loginToken: e657779033b3ccc...
     └─ gameVersion: 2026-03-02143147
     🔄 [1/10] Required fields check .
     ✅ [1/10] Required fields check .All present
     🔄 [2/10] Token auth via SDK-Server .
🟢 17:30:31 INFO  📡 SDKAPI   ▸ User verified via SDK-Server
     ├─ userId: guest_d43888e81e93a38d
     ├─ httpStatus: 200
     ├─ bodySize: 268 bytes
     └─ duration: 18ms
     ✅ [2/10] Token auth via SDK-Server .22ms ✅
     🔄 [3/10] ServerId validation .
     ✅ [3/10] ServerId validation .1 == 1 ✅
     🔄 [4/10] User existence check .
     🌟 [4/10] User existence check .NEW USER 🌟
     🔄 [5/10] Build user data ..
🟢 17:30:31 INFO  📋 CONFIG   ▸ Resource loaded: task.json
     ├─ entries: 44
     ├─ bytes: 22978
     └─ path: /var/www/html/resource/json/task.json
     ├─ constantKeys: 505
     ├─ heroEntries: 887
     ├─ summonPools: 4
     └─ taskEntries: 44
     ├─ startHero: 1205
     ├─ startHeroLevel: 3
     ├─ heroInstanceId: eeeb8e71-b30...
     ├─ heroConfigFound: true
     └─ heroName: hero_name_15
     ├─ startDiamond: 0
     ├─ startGold: 0
     ├─ startUserExp: 0
     └─ startUserLevel: 1
     ├─ types: 1,2,4,5,6,7,8
     └─ values: 2,2,2,2,2,2,2
🟢 17:30:31 INFO  📋 CONFIG   ▸ Resource loaded: thingsID.json
     ├─ entries: 1636
     ├─ bytes: 884038
     └─ path: /var/www/html/resource/json/thingsID.json
     ├─ _heroId: eeeb8e71-b30...
     ├─ _heroDisplayId: 1205
     ├─ _level: 3
     └─ _heroStar: 0
     ✅ [5/10] Build user data ..100 keys (42ms)
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
[DB] saveUser("guest_d43888..."): 100 keys, 10122 bytes
     ✅ [9/10] Database save ....5ms 💾
     🔄 [10/10] Response build ..
     ├─ original: 10122 chars
     ├─ compressed: 2394 chars
     ├─ reduction: 76%
     └─ threshold: 1024 chars
     ✅ [10/10] Response build ..OK 📤

     🏏️ SUMMARY
     👤 User ......... guest_d43888e81e93a38d
     🦸 Heroes ........ 1
     🏆 Level ......... 1
     💎 Diamond ....... 0
     📦 Fields ........ 100
     ⏱️  Duration ..... 196ms
     📦 Data .......... 2,394 chars (LZ)


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
     ├─   serverOpenDate               1779384615148
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
     └─ size ..............: 2,394 chars (LZ)

     ⏱️  TIMING
     └─ Total .............: 213ms  ████████████████████
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
▼ [2] 👤 user::getBulletinBrief  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: user
     ├─ action ............: getBulletinBrief
     ├─ userId ............: guest_d43888e81e93a38d
     └─ serverId ..........: (missing)
     🔄 [1/2] Validate request fields .
     └─ userId: guest_d43888e81e93a3
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
     👤 User ......... guest_d43888e81e93a38d
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
     ├─ userId ............: guest_d43888e81e93a38d
     └─ serverId ..........: (missing)
     🔄 [1/2] Route relay action .
     ├─ userId: guest_d43888e81e93a3
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
     └─ Total .............: 7ms  
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
▼ [4] 🤝 friend::friendServerAction  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: friend
     ├─ action ............: friendServerAction
     ├─ userId ............: guest_d43888e81e93a38d
     └─ serverId ..........: (missing)
     🔄 [1/2] Route relay action .
     ├─ userId: guest_d43888e81e93a3
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
     └─ Total .............: 2ms  
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
▼ [5] 🖼️ heroImage::getAll  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: heroImage
     ├─ action ............: getAll
     ├─ userId ............: guest_d43888e81e93a38d
     └─ serverId ..........: (missing)
     🔄 [1/2] Validate request fields .
     └─ userId: guest_d43888e81e93a3
     ✅ [1/2] Validate request fields .userId OK
     🔄 [1/1] Load userData from DB .
     ├─ heros: exists
     └─ heros._heros: exists
     ✅ [1/1] Load userData from DB .userData loaded
     🔄 [1/1] Type assert request fields .
     ✅ [1/1] Type assert request fields .type verified
     🔄 [1/1] Snapshot hero collection state .
     ├─ heroCount: 1
     └─ heroIds: eeeb8e71-b300-425c-ab24-207e8bf33d64
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
     👤 User ......... guest_d43888e81e93a38d
     📦 Fields ........ 1
     📦 Data .......... 0 chars (RAW)


     📤 RESPONSE
     ├─ ret ...............: 0
     ├─ fields ............: (raw string)
     └─ size ..............: 97 chars (RAW)

     ⏱️  TIMING
     └─ Total .............: 4ms  
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
▼ [6] 🦸 hero::getAttrs  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: hero
     ├─ action ............: getAttrs
     ├─ userId ............: guest_d43888e81e93a38d
     └─ serverId ..........: (missing)
     🔄 [1/2] Get hero attrs ....
     ├─ userId: guest_d43888e81e93a3
     └─ heros: eeeb8e71-b300-425c-ab24-207e8bf33d64
     ✅ [1/2] Get hero attrs ....1 hero(es) requested
     🔄 [2/2] Calculate hero attributes .
     ├─ heroId: eeeb8e71-b300-425c-ab24-207e8bf33d64
     ├─ displayId: 1205
     ├─ level: 3
     ├─ evolveLevel: 0
     └─ star: 0
🟢 17:30:35 INFO  📋 CONFIG   ▸ Resource loaded: heroEvolve.json
     ├─ entries: 159
     ├─ bytes: 2060075
     └─ path: /var/www/html/resource/json/heroEvolve.json
🟢 17:30:35 INFO  📋 CONFIG   ▸ Resource loaded: heroWakeUp.json
     ├─ entries: 149
     ├─ bytes: 407271
     └─ path: /var/www/html/resource/json/heroWakeUp.json
🟡 17:30:35 WARN  📋 CONFIG   ▸ Resource NOT found: qiGong.json
     ├─ path: /var/www/html/resource/json
     └─ reason: ENOENT: no such file or directory, open '/var/www/html/resource/json/qiGong.json'
🟢 17:30:35 INFO  📋 CONFIG   ▸ Resource loaded: qigongQualityMaxPara.json
     ├─ entries: 7
     ├─ bytes: 860
     └─ path: /var/www/html/resource/json/qigongQualityMaxPara.json
🟢 17:30:35 INFO  📋 CONFIG   ▸ Resource loaded: selfBreak.json
     ├─ entries: 1360
     ├─ bytes: 499504
     └─ path: /var/www/html/resource/json/selfBreak.json
🟢 17:30:35 INFO  📋 CONFIG   ▸ Resource loaded: selfBreakQuality.json
     ├─ entries: 4
     ├─ bytes: 382
     └─ path: /var/www/html/resource/json/selfBreakQuality.json
     ├─ heroType: critical
     ├─ talent: 0.4000
     ├─ baseHP(preT): 1260.80
     ├─ baseATK(preT): 462.00
     ├─ baseARM: 214.90
     ├─ totalHP(postT): 504.32
     ├─ totalATK(postT): 184.80
     └─ power: 2313
     ├─ baseHP(preT): 1260.80
     ├─ baseATK(preT): 462.00
     ├─ totalHP(postT): 504.32
     ├─ totalATK(postT): 184.80
     └─ power: 2313
     ✅ [2/2] Calculate hero attributes .1 heroes calculated

     🔒 CRITICAL FIELDS AUDIT — game will crash/stuck if wrong
     ├─ 🔒 _attrs                   = Object{1}  L133726: for(var o in t._attrs) — keyed by hero index, each has _items with calculated attrs
     ├─ 🔒 _baseAttrs               = Object{1}  L133731: t._baseAttrs[o] — keyed by hero index, each has _items with base attrs (before talent)
     └─ 🔒 POWER (attr 21)          = calculated per hero  L133821: 21==p._id → heroBaseAttr.power = floor(num)
     ✅ CRITICAL AUDIT: 3/3 PASSED

     🏏️ SUMMARY
     👤 User ......... guest_d43888e81e93a38d
     📦 Fields ........ 2
     ⏱️  Duration ..... 0ms
     📦 Data .......... 0 chars (RAW)


     📤 RESPONSE
     ├─ ret ...............: 0
     ├─ fields ............: (raw string)
     └─ size ..............: 494 chars (RAW)

     ⏱️  TIMING
     └─ Total .............: 54ms  █████
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
▼ [7] 💬 userMsg::getMsgList  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: userMsg
     ├─ action ............: getMsgList
     ├─ userId ............: guest_d43888e81e93a38d
     └─ serverId ..........: (missing)
     🔄 [1/2] Validate request fields .
     └─ userId: guest_d43888e81e93a3
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
     👤 User ......... guest_d43888e81e93a38d
     📦 Fields ........ 1
     📦 Data .......... 0 chars (RAW)


     📤 RESPONSE
     ├─ ret ...............: 0
     ├─ fields ............: (raw string)
     └─ size ..............: 13 chars (RAW)

     ⏱️  TIMING
     └─ Total .............: 5ms  
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
▼ [8] 👤 user::registChat  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: user
     ├─ action ............: registChat
     ├─ userId ............: guest_d43888e81e93a38d
     └─ serverId ..........: (missing)
🟢 17:30:38 INFO  ⚪ REGIST_CHAT ▸ registChat REQUEST RECEIVED
     ├─ userId: guest_d43888e81e93a3
     └─ version: 1.0
🟢 17:30:38 INFO  ⚪ REGIST_CHAT ▸ Entry check PASS — userId=guest_d43888e81e...
🟢 17:30:38 INFO  ⚪ REGIST_CHAT ▸ Loading config for chat registration
     ├─ chatUrl: http://127.0.0.1:8002
     ├─ serverId: 1
     └─ source: DEFAULT (chatUrl not set)
🟢 17:30:38 INFO  ⚪ REGIST_CHAT ▸ Config loaded — chatUrl and serverId resolved
🟢 17:30:38 INFO  ⚪ REGIST_CHAT ▸ Loading player state for guild/room context
     ├─ userData: LOADED (100 top keys)
     ├─ guild: NO
     └─ guildRoomId: undefined (by design — updated dynamically by guild handler L114204)
🟢 17:30:38 INFO  ⚪ REGIST_CHAT ▸ Building chat registration response (6 fields)
     ├─ worldRoomId: world_1 (L114566 — ALWAYS joined)
     ├─ guildRoomId: undefined (L114568 — undefined = skip)
     ├─ teamDungeonChatRoom: undefined (L114579 — undefined = skip)
     └─ teamChatRoom: undefined (L114590 — undefined = skip)
     ├─ consumer: L114470 — 6 fields read from callback(n)
     ├─ next-step: L114480: io.connect(chatServerUrl) → TEA verify required
     ├─ post-login: L114550: chat::login → joinRoom(world, guild?, team?, dungeon?)
     └─ dynamic-update: guild L114207 | teamDungeon L136514 | team L136531
🟢 17:30:38 INFO  ⚪ REGIST_CHAT ▸ Response fields built — 6 fields total
🟢 17:30:38 INFO  ⚪ REGIST_CHAT ▸ No data mutations (configuration handler)
     ├─ type: NONE — registChat is a read-only configuration handler
     ├─ reason: Only returns chat URL and room IDs — no user data modified
     └─ trace: L114462-114470: client reads response fields, does not write back
🟢 17:30:38 INFO  ⚪ REGIST_CHAT ▸ No DB save required (configuration handler)
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
     👤 User ......... guest_d43888e81e93a38d
     📦 Fields ........ 6
     ⏱️  Duration ..... 4ms
     📦 Data .......... 0 chars (RAW)


     📤 RESPONSE
     ├─ ret ...............: 0
     ├─ fields ............: (raw string)
     └─ size ..............: 83 chars (RAW)

     ⏱️  TIMING
     └─ Total .............: 9ms  
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
▼ [9] 🎯 guide::saveGuide  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: guide
     ├─ action ............: saveGuide
     ├─ userId ............: guest_d43888e81e93a38d
     └─ serverId ..........: (missing)
     🔄 [1/3] Validate request fields .
     ├─ userId: guest_d43888e81e93a3
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
[DB] saveUser("guest_d43888..."): 100 keys, 10130 bytes

     📸 saveGuide ret=0

     🏏️ SUMMARY
     👤 User ......... guest_d43888e81e93a38d
     📦 Data .......... 0 chars (RAW)


     📤 RESPONSE
     ├─ ret ...............: 0
     ├─ fields ............: (raw string)
     └─ size ..............: 2 chars (RAW)

     ⏱️  TIMING
     └─ Total .............: 10ms  █
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
▼ [10] 🎯 guide::saveGuide  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: guide
     ├─ action ............: saveGuide
     ├─ userId ............: guest_d43888e81e93a38d
     └─ serverId ..........: (missing)
     🔄 [1/3] Validate request fields .
     ├─ userId: guest_d43888e81e93a3
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
[DB] saveUser("guest_d43888..."): 100 keys, 10130 bytes

     📸 saveGuide ret=0

     🏏️ SUMMARY
     👤 User ......... guest_d43888e81e93a38d
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
     ├─ userId ............: guest_d43888e81e93a38d
     └─ serverId ..........: (missing)
     🔄 [1/2] Save guide team ...
     ├─ userId: guest_d43888e81e93a3
     ├─ team: 5 hero(es)
     └─ supers: 1120561
     ✅ [1/2] Save guide team ...team=5 heroes
     🔄 [2/2] Persist team data .
[DB] saveUser("guest_d43888..."): 101 keys, 10245 bytes
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
     ├─ userId ............: guest_d43888e81e93a38d
     └─ serverId ..........: (missing)
     🔄 [1/5] Validate request ..
     ├─ userId: guest_d43888e81e93a3
     ├─ isGuide: true
     ├─ battleId: (none)
     ├─ checkResult: (none)
     ├─ runaway: (none)
     └─ super: (none)
     ✅ [1/5] Validate request ..
     🔄 [2/5] Load data .........
🟢 17:30:44 INFO  📋 CONFIG   ▸ Resource loaded: lesson.json
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
[DB] saveUser("guest_d43888..."): 101 keys, 10319 bytes
     ✅ [5/7] Build response ....WIN rewards=5 lesson=10102

     🔒 CRITICAL FIELDS AUDIT — game will crash/stuck if wrong
     ├─ 🔒 _battleResult            = 0  L104882: 0 == e._battleResult -> true (tutorial always win)
     ├─ 🔒 _changeInfo._items       = 5 items  L97686: getBattleAwardItems iterates _changeInfo._items for {_id, _num}
     ├─ 🔒 _curLess                 = 10102  L104892/L97751: OnHookSingleton.lastSection = e._curLess
     └─ 🔒 _maxPassLesson           = 10101  L104893/L97751: OnHookSingleton.maxPassLesson = e._maxPassLesson
     ✅ CRITICAL AUDIT: 4/4 PASSED

     🏏️ SUMMARY
     👤 User ......... guest_d43888e81e93a38d
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
     ├─ userId ............: guest_d43888e81e93a38d
     └─ serverId ..........: (missing)
🟢 17:30:45 INFO  ⚪ BURYPOINT ▸ Guide battle analytics received
     ├─ userId: guest_d43888e81e93a3
     ├─ point: load
     ├─ passLesson: 10101
     └─ version: 1.0
[DB] saveUser("guest_d43888..."): 102 keys, 10427 bytes

     📤 RESPONSE
     ├─ ret ...............: 0
     ├─ fields ............: (raw string)
     └─ size ..............: 2 chars (RAW)

     ⏱️  TIMING
     └─ Total .............: 8ms  
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
  📊 IDLE SUMMARY — 10s no activity — 4ttRnaTDBVMG
══════════════════════════════════════════════════════════════════
  📊 Calls: 13  ✅ 13 OK  ⚡ 27.2ms avg  📦 3,344 chars
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
▼ [14] 📋 buryPoint::guideBattle  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: buryPoint
     ├─ action ............: guideBattle
     ├─ userId ............: guest_d43888e81e93a38d
     └─ serverId ..........: (missing)
🟢 17:30:57 INFO  ⚪ BURYPOINT ▸ Guide battle analytics received
     ├─ userId: guest_d43888e81e93a3
     ├─ point: battle
     ├─ passLesson: 10101
     └─ version: 1.0
[DB] saveUser("guest_d43888..."): 102 keys, 10506 bytes

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
     ├─ userId ............: guest_d43888e81e93a38d
     └─ serverId ..........: (missing)
🟢 17:30:58 INFO  ⚪ BURYPOINT ▸ Guide battle analytics received
     ├─ userId: guest_d43888e81e93a3
     ├─ point: home
     ├─ passLesson: 10101
     └─ version: 1.0
[DB] saveUser("guest_d43888..."): 102 keys, 10583 bytes

     📤 RESPONSE
     ├─ ret ...............: 0
     ├─ fields ............: (raw string)
     └─ size ..............: 2 chars (RAW)

     ⏱️  TIMING
     └─ Total .............: 4ms  
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
▼ [16] 🏆 activity::getActivityBrief  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: activity
     ├─ action ............: getActivityBrief
     ├─ userId ............: guest_d43888e81e93a38d
     └─ serverId ..........: (missing)
     🔄 [1/3] Validate request ..
     └─ userId: guest_d43888e81e93a3...
     ✅ [1/3] Validate request ..
     🔄 [2/3] Load user data ....
     ✅ [2/3] Load user data ....
     ├─ userLevel: 1
     ├─ userCreateTime: 2026-05-21T17:30:31.608Z
     ├─ userAgeDays: 0.0 days
     ├─ serverOpenDate: 2026-05-21T17:30:15.148Z
     ├─ serverAgeDays: 0.0 days
     └─ dayOfWeek(UTC+7): 5 (Weekday)
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
     ├─   userId                       "guest_d43888e81e93a38d"
     ├─   version                      "1.0"
     └─   _acts                        Object{12}
     ├─ original: 2576 chars
     ├─ compressed: 775 chars
     ├─ reduction: 70%
     └─ threshold: 1024 chars

     📤 RESPONSE
     ├─ ret ...............: 0
     ├─ fields ............: (raw string)
     └─ size ..............: 775 chars (LZ)

     ⏱️  TIMING
     └─ Total .............: 11ms  █
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
▼ [17] 🎯 guide::saveGuide  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: guide
     ├─ action ............: saveGuide
     ├─ userId ............: guest_d43888e81e93a38d
     └─ serverId ..........: (missing)
     🔄 [1/3] Validate request fields .
     ├─ userId: guest_d43888e81e93a3
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
[DB] saveUser("guest_d43888..."): 102 keys, 10583 bytes

     📸 saveGuide ret=0

     🏏️ SUMMARY
     👤 User ......... guest_d43888e81e93a38d
     📦 Data .......... 0 chars (RAW)


     📤 RESPONSE
     ├─ ret ...............: 0
     ├─ fields ............: (raw string)
     └─ size ..............: 2 chars (RAW)

     ⏱️  TIMING
     └─ Total .............: 8ms  
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
▼ [18] ✨ summon::summonOneFree  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: summon
     ├─ action ............: summonOneFree
     ├─ userId ............: guest_d43888e81e93a38d
     └─ serverId ..........: (missing)
🟢 17:31:02 INFO  ⚪ SUMMON-FREE ▸ summonOneFree REQUEST RECEIVED
     ├─ userId: guest_d43888e81e93a38d
     ├─ sType: 3
     └─ isGuide: true
🟢 17:31:02 INFO  📋 CONFIG   ▸ Resource loaded: summonPool.json
     ├─ entries: 200
     ├─ bytes: 75170
     └─ path: /var/www/html/resource/json/summonPool.json
🟢 17:31:02 INFO  📋 CONFIG   ▸ Resource loaded: summonRandom.json
     ├─ entries: 10
     ├─ bytes: 2157
     └─ path: /var/www/html/resource/json/summonRandom.json
     ├─ poolId: 1
     ├─ poolType: summonSuper
     ├─ freeTimer: 86400s
     └─ summonEnergyGain: 10
🟢 17:31:02 INFO  ⚪ SUMMON-FREE ▸ Free timer OK — proceeding with summon
🟢 17:31:02 INFO  ⚪ SUMMON-FREE ▸ [GUIDE] Predetermined hero: displayId=1309 quality=purple
     ├─ heroInstanceId: ae2251b2-9dc...
     ├─ displayId: 1309
     ├─ heroName: hero_name_31
     ├─ quality: purple
     ├─ heroColor: 4
     └─ heroType: body
     ├─ oldEnergy: 0
     ├─ newEnergy: 10
     ├─ energyGained: 10
     ├─ freeTimeField: _canSuperFreeTime
     ├─ newFreeTime: 2026-05-22T17:31:02.829Z
     ├─ summonTimes[1]: 1
     └─ totalHeroes: 2
[DB] saveUser("guest_d43888..."): 102 keys, 11274 bytes
🟢 17:31:02 INFO  ⚪ SUMMON-FREE ▸ User data SAVED
🟢 17:31:02 INFO  ⚪ SUMMON-FREE ▸ summonOneFree SUCCESS

     🏏️ SUMMARY
     👤 User ......... guest_d43888e81e93a38d
     📦 Fields ........ [object Object]
     📦 Data .......... 0 chars (RAW)


     📤 RESPONSE
     ├─ ret ...............: 0
     ├─ fields ............: (raw string)
     └─ size ..............: 767 chars (RAW)

     ⏱️  TIMING
     └─ Total .............: 14ms  █
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
▼ [19] 🦸 hero::getAttrs  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: hero
     ├─ action ............: getAttrs
     ├─ userId ............: guest_d43888e81e93a38d
     └─ serverId ..........: (missing)
     🔄 [1/2] Get hero attrs ....
     ├─ userId: guest_d43888e81e93a3
     └─ heros: ae2251b2-9dce-4df0-9134-e8f0b12dd2b3
     ✅ [1/2] Get hero attrs ....1 hero(es) requested
     🔄 [2/2] Calculate hero attributes .
     ├─ heroId: ae2251b2-9dce-4df0-9134-e8f0b12dd2b3
     ├─ displayId: 1309
     ├─ level: 1
     ├─ evolveLevel: 0
     └─ star: 0
🟡 17:31:04 WARN  📋 CONFIG   ▸ Resource NOT found: qiGong.json
     ├─ path: /var/www/html/resource/json
     └─ reason: ENOENT: no such file or directory, open '/var/www/html/resource/json/qiGong.json'
     ├─ heroType: body
     ├─ talent: 0.4000
     ├─ baseHP(preT): 3136.00
     ├─ baseATK(preT): 93.75
     ├─ baseARM: 153.75
     ├─ totalHP(postT): 1254.40
     ├─ totalATK(postT): 37.50
     └─ power: 3761
     ├─ baseHP(preT): 3136.00
     ├─ baseATK(preT): 93.75
     ├─ totalHP(postT): 1254.40
     ├─ totalATK(postT): 37.50
     └─ power: 3761
     ✅ [2/2] Calculate hero attributes .1 heroes calculated

     🔒 CRITICAL FIELDS AUDIT — game will crash/stuck if wrong
     ├─ 🔒 _attrs                   = Object{1}  L133726: for(var o in t._attrs) — keyed by hero index, each has _items with calculated attrs
     ├─ 🔒 _baseAttrs               = Object{1}  L133731: t._baseAttrs[o] — keyed by hero index, each has _items with base attrs (before talent)
     └─ 🔒 POWER (attr 21)          = calculated per hero  L133821: 21==p._id → heroBaseAttr.power = floor(num)
     ✅ CRITICAL AUDIT: 3/3 PASSED

     🏏️ SUMMARY
     👤 User ......... guest_d43888e81e93a38d
     📦 Fields ........ 2
     ⏱️  Duration ..... 0ms
     📦 Data .......... 0 chars (RAW)


     📤 RESPONSE
     ├─ ret ...............: 0
     ├─ fields ............: (raw string)
     └─ size ..............: 435 chars (RAW)

     ⏱️  TIMING
     └─ Total .............: 7ms  
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
▼ [20] 🎯 guide::saveGuide  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: guide
     ├─ action ............: saveGuide
     ├─ userId ............: guest_d43888e81e93a38d
     └─ serverId ..........: (missing)
     🔄 [1/3] Validate request fields .
     ├─ userId: guest_d43888e81e93a3
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
[DB] saveUser("guest_d43888..."): 102 keys, 11274 bytes

     📸 saveGuide ret=0

     🏏️ SUMMARY
     👤 User ......... guest_d43888e81e93a38d
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
     ├─ userId ............: guest_d43888e81e93a38d
     └─ serverId ..........: (missing)
🟢 17:31:06 INFO  ⚪ SUMMON-FREE ▸ summonOneFree REQUEST RECEIVED
     ├─ userId: guest_d43888e81e93a38d
     ├─ sType: 1
     └─ isGuide: true
     ├─ poolId: 3
     ├─ poolType: summonNormal
     ├─ freeTimer: 21600s
     └─ summonEnergyGain: 0
🟢 17:31:06 INFO  ⚪ SUMMON-FREE ▸ Free timer OK — proceeding with summon
🟢 17:31:06 INFO  ⚪ SUMMON-FREE ▸ [GUIDE] Predetermined hero: displayId=1206 quality=blue
     ├─ heroInstanceId: 4a802f37-1d6...
     ├─ displayId: 1206
     ├─ heroName: hero_name_17
     ├─ quality: blue
     ├─ heroColor: 3
     └─ heroType: skill
     ├─ oldEnergy: 10
     ├─ newEnergy: 10
     ├─ energyGained: 0
     ├─ freeTimeField: _canCommonFreeTime
     ├─ newFreeTime: 2026-05-21T23:31:06.387Z
     ├─ summonTimes[3]: 1
     └─ totalHeroes: 3
[DB] saveUser("guest_d43888..."): 102 keys, 11964 bytes
🟢 17:31:06 INFO  ⚪ SUMMON-FREE ▸ User data SAVED
🟢 17:31:06 INFO  ⚪ SUMMON-FREE ▸ summonOneFree SUCCESS

     🏏️ SUMMARY
     👤 User ......... guest_d43888e81e93a38d
     📦 Fields ........ [object Object]
     📦 Data .......... 0 chars (RAW)


     📤 RESPONSE
     ├─ ret ...............: 0
     ├─ fields ............: (raw string)
     └─ size ..............: 767 chars (RAW)

     ⏱️  TIMING
     └─ Total .............: 9ms  
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
▼ [22] 🦸 hero::getAttrs  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: hero
     ├─ action ............: getAttrs
     ├─ userId ............: guest_d43888e81e93a38d
     └─ serverId ..........: (missing)
     🔄 [1/2] Get hero attrs ....
     ├─ userId: guest_d43888e81e93a3
     └─ heros: 4a802f37-1d62-4060-8658-844310d278c3
     ✅ [1/2] Get hero attrs ....1 hero(es) requested
     🔄 [2/2] Calculate hero attributes .
     ├─ heroId: 4a802f37-1d62-4060-8658-844310d278c3
     ├─ displayId: 1206
     ├─ level: 1
     ├─ evolveLevel: 0
     └─ star: 0
🟡 17:31:07 WARN  📋 CONFIG   ▸ Resource NOT found: qiGong.json
     ├─ path: /var/www/html/resource/json
     └─ reason: ENOENT: no such file or directory, open '/var/www/html/resource/json/qiGong.json'
     ├─ heroType: skill
     ├─ talent: 0.3200
     ├─ baseHP(preT): 1240.00
     ├─ baseATK(preT): 275.00
     ├─ baseARM: 205.00
     ├─ totalHP(postT): 396.80
     ├─ totalATK(postT): 88.00
     └─ power: 2080
     ├─ baseHP(preT): 1240.00
     ├─ baseATK(preT): 275.00
     ├─ totalHP(postT): 396.80
     ├─ totalATK(postT): 88.00
     └─ power: 2080
     ✅ [2/2] Calculate hero attributes .1 heroes calculated

     🔒 CRITICAL FIELDS AUDIT — game will crash/stuck if wrong
     ├─ 🔒 _attrs                   = Object{1}  L133726: for(var o in t._attrs) — keyed by hero index, each has _items with calculated attrs
     ├─ 🔒 _baseAttrs               = Object{1}  L133731: t._baseAttrs[o] — keyed by hero index, each has _items with base attrs (before talent)
     └─ 🔒 POWER (attr 21)          = calculated per hero  L133821: 21==p._id → heroBaseAttr.power = floor(num)
     ✅ CRITICAL AUDIT: 3/3 PASSED

     🏏️ SUMMARY
     👤 User ......... guest_d43888e81e93a38d
     📦 Fields ........ 2
     ⏱️  Duration ..... 0ms
     📦 Data .......... 0 chars (RAW)


     📤 RESPONSE
     ├─ ret ...............: 0
     ├─ fields ............: (raw string)
     └─ size ..............: 425 chars (RAW)

     ⏱️  TIMING
     └─ Total .............: 7ms  
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
▼ [23] 🏆 activity::getActivityBrief  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: activity
     ├─ action ............: getActivityBrief
     ├─ userId ............: guest_d43888e81e93a38d
     └─ serverId ..........: (missing)
     🔄 [1/3] Validate request ..
     └─ userId: guest_d43888e81e93a3...
     ✅ [1/3] Validate request ..
     🔄 [2/3] Load user data ....
     ✅ [2/3] Load user data ....
     ├─ userLevel: 1
     ├─ userCreateTime: 2026-05-21T17:30:31.608Z
     ├─ userAgeDays: 0.0 days
     ├─ serverOpenDate: 2026-05-21T17:30:15.148Z
     ├─ serverAgeDays: 0.0 days
     └─ dayOfWeek(UTC+7): 5 (Weekday)
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
     ├─   userId                       "guest_d43888e81e93a38d"
     ├─   version                      "1.0"
     └─   _acts                        Object{12}
     ├─ original: 2576 chars
     ├─ compressed: 775 chars
     ├─ reduction: 70%
     └─ threshold: 1024 chars

     📤 RESPONSE
     ├─ ret ...............: 0
     ├─ fields ............: (raw string)
     └─ size ..............: 775 chars (LZ)

     ⏱️  TIMING
     └─ Total .............: 10ms  █
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
▼ [24] 🎯 guide::saveGuide  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: guide
     ├─ action ............: saveGuide
     ├─ userId ............: guest_d43888e81e93a38d
     └─ serverId ..........: (missing)
     🔄 [1/3] Validate request fields .
     ├─ userId: guest_d43888e81e93a3
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
[DB] saveUser("guest_d43888..."): 102 keys, 11964 bytes

     📸 saveGuide ret=0

     🏏️ SUMMARY
     👤 User ......... guest_d43888e81e93a38d
     📦 Data .......... 0 chars (RAW)


     📤 RESPONSE
     ├─ ret ...............: 0
     ├─ fields ............: (raw string)
     └─ size ..............: 2 chars (RAW)

     ⏱️  TIMING
     └─ Total .............: 8ms  
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
▼ [25] 🦸 hero::autoLevelUp  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: hero
     ├─ action ............: autoLevelUp
     ├─ userId ............: guest_d43888e81e93a38d
     └─ serverId ..........: (missing)
     🔄 [1/4] Auto Level Up .....
     ├─ userId: guest_d43888e81e93a3
     ├─ heroId: ae2251b2-9dce-4df0-9134-e8f0b12dd2b3
     └─ times: 1
     ├─ maxTimes: 1
     └─ heroId: ae2251b2-9dce-4df0-9134-e8f0b12dd2b3
     ✅ [1/4] Auto Level Up .....heroId=ae2251b2-9dce-4df0-9134-e8f0b12dd2b3, times=1
     🔄 [2/4] Load hero data ....
     ├─ heroId: ae2251b2-9dce-4df0-9134-e8f0b12dd2b3
     ├─ displayId: 1309
     ├─ currentLevel: 1
     ├─ evolveLevel: 0
     └─ star: 0
     🔄 [3/4] Calculate level up .
     ├─ heroQuality: purple
     ├─ heroType: body
     ├─ talent: 0.4
     ├─ balancePower: 0.996
     └─ configTable: heroLevelUpPurple
     ├─ expCapsule (131): 1000
     └─ gold (102): 1000
🟢 17:31:12 INFO  📋 CONFIG   ▸ Resource loaded: heroLevelUpPurple.json
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
[DB] saveUser("guest_d43888..."): 102 keys, 11962 bytes
     ├─ heroLevel: 2
     ├─ expCapsule: 982
     └─ gold: 919
🟡 17:31:12 WARN  📋 CONFIG   ▸ Resource NOT found: qiGong.json
     ├─ path: /var/www/html/resource/json
     └─ reason: ENOENT: no such file or directory, open '/var/www/html/resource/json/qiGong.json'
     ├─ heroType: body
     ├─ talent: 0.4000
     ├─ baseHP: 3371.20
     ├─ baseATK: 105.75
     ├─ baseARM: 192.00
     ├─ totalHP: 1348.48
     ├─ totalATK: 42.30
     └─ power: 4046
     ├─ baseHP(preT): 3371.20
     ├─ baseATK(preT): 105.75
     ├─ baseARM: 192.00
     ├─ totalHP(postT): 1348.48
     ├─ totalATK(postT): 42.30
     └─ power: 4046
     ✅ [4/4] Save data & build response .ret=0, heroId=ae2251b2-9dce-4df0-9134-e8f0b12dd2b3, lvl 1→2

     🔒 CRITICAL FIELDS AUDIT — game will crash/stuck if wrong
     ├─ 🔒 heroId                   = ae2251b2-9dce-4df0-9134-e8f0b12dd2b3  L133741: getHero(e.heroId) — REQUIRED
     ├─ 🔒 _heroLevel               = 2  L133751: heroBaseAttr.level = e._heroLevel
     ├─ 🔒 _baseAttr                = Object{6}  L133805: setBaseAttr → PRE-TALENT HP/ATK, client applies talent
     ├─ 🔒 _totalAttr               = Object{7}  L133805: POST-TALENT HP/ATK, client uses directly for display
     ├─ 🔒 _totalCost._levelUp      = 2 items (exp+gold)  L133385-133393: totalCost.levelUp[] deserialize
     └─ 🔒 _changeInfo              = 2 items (exp+gold)  L118414-118417: resetTtemsCallBack → setItem(_id, _num)
     ✅ CRITICAL AUDIT: 6/6 PASSED

     📤 RESPONSE
     ├─ ret ...............: 0
     ├─ fields ............: (raw string)
     └─ size ..............: 643 chars (RAW)

     ⏱️  TIMING
     └─ Total .............: 17ms  █
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
▼ [26] 🦸 hero::autoLevelUp  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: hero
     ├─ action ............: autoLevelUp
     ├─ userId ............: guest_d43888e81e93a38d
     └─ serverId ..........: (missing)
     🔄 [1/4] Auto Level Up .....
     ├─ userId: guest_d43888e81e93a3
     ├─ heroId: ae2251b2-9dce-4df0-9134-e8f0b12dd2b3
     └─ times: 1
     ├─ maxTimes: 1
     └─ heroId: ae2251b2-9dce-4df0-9134-e8f0b12dd2b3
     ✅ [1/4] Auto Level Up .....heroId=ae2251b2-9dce-4df0-9134-e8f0b12dd2b3, times=1
     🔄 [2/4] Load hero data ....
     ├─ heroId: ae2251b2-9dce-4df0-9134-e8f0b12dd2b3
     ├─ displayId: 1309
     ├─ currentLevel: 2
     ├─ evolveLevel: 0
     └─ star: 0
     🔄 [3/4] Calculate level up .
     ├─ heroQuality: purple
     ├─ heroType: body
     ├─ talent: 0.4
     ├─ balancePower: 0.996
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
[DB] saveUser("guest_d43888..."): 102 keys, 11962 bytes
     ├─ heroLevel: 3
     ├─ expCapsule: 946
     └─ gold: 784
🟡 17:31:14 WARN  📋 CONFIG   ▸ Resource NOT found: qiGong.json
     ├─ path: /var/www/html/resource/json
     └─ reason: ENOENT: no such file or directory, open '/var/www/html/resource/json/qiGong.json'
     ├─ heroType: body
     ├─ talent: 0.4000
     ├─ baseHP: 3606.40
     ├─ baseATK: 118.50
     ├─ baseARM: 230.25
     ├─ totalHP: 1442.56
     ├─ totalATK: 47.40
     └─ power: 4333
     ├─ baseHP(preT): 3606.40
     ├─ baseATK(preT): 118.50
     ├─ baseARM: 230.25
     ├─ totalHP(postT): 1442.56
     ├─ totalATK(postT): 47.40
     └─ power: 4333
     ✅ [4/4] Save data & build response .ret=0, heroId=ae2251b2-9dce-4df0-9134-e8f0b12dd2b3, lvl 2→3

     🔒 CRITICAL FIELDS AUDIT — game will crash/stuck if wrong
     ├─ 🔒 heroId                   = ae2251b2-9dce-4df0-9134-e8f0b12dd2b3  L133741: getHero(e.heroId) — REQUIRED
     ├─ 🔒 _heroLevel               = 3  L133751: heroBaseAttr.level = e._heroLevel
     ├─ 🔒 _baseAttr                = Object{6}  L133805: setBaseAttr → PRE-TALENT HP/ATK, client applies talent
     ├─ 🔒 _totalAttr               = Object{7}  L133805: POST-TALENT HP/ATK, client uses directly for display
     ├─ 🔒 _totalCost._levelUp      = 2 items (exp+gold)  L133385-133393: totalCost.levelUp[] deserialize
     └─ 🔒 _changeInfo              = 2 items (exp+gold)  L118414-118417: resetTtemsCallBack → setItem(_id, _num)
     ✅ CRITICAL AUDIT: 6/6 PASSED

     📤 RESPONSE
     ├─ ret ...............: 0
     ├─ fields ............: (raw string)
     └─ size ..............: 661 chars (RAW)

     ⏱️  TIMING
     └─ Total .............: 9ms  
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
▼ [27] 🎯 guide::saveGuide  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: guide
     ├─ action ............: saveGuide
     ├─ userId ............: guest_d43888e81e93a38d
     └─ serverId ..........: (missing)
     🔄 [1/3] Validate request fields .
     ├─ userId: guest_d43888e81e93a3
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
[DB] saveUser("guest_d43888..."): 102 keys, 11962 bytes

     📸 saveGuide ret=0

     🏏️ SUMMARY
     👤 User ......... guest_d43888e81e93a38d
     📦 Data .......... 0 chars (RAW)


     📤 RESPONSE
     ├─ ret ...............: 0
     ├─ fields ............: (raw string)
     └─ size ..............: 2 chars (RAW)

     ⏱️  TIMING
     └─ Total .............: 7ms  
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
▼ [28] 🦸 hero::autoLevelUp  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: hero
     ├─ action ............: autoLevelUp
     ├─ userId ............: guest_d43888e81e93a38d
     └─ serverId ..........: (missing)
     🔄 [1/4] Auto Level Up .....
     ├─ userId: guest_d43888e81e93a3
     ├─ heroId: 4a802f37-1d62-4060-8658-844310d278c3
     └─ times: 1
     ├─ maxTimes: 1
     └─ heroId: 4a802f37-1d62-4060-8658-844310d278c3
     ✅ [1/4] Auto Level Up .....heroId=4a802f37-1d62-4060-8658-844310d278c3, times=1
     🔄 [2/4] Load hero data ....
     ├─ heroId: 4a802f37-1d62-4060-8658-844310d278c3
     ├─ displayId: 1206
     ├─ currentLevel: 1
     ├─ evolveLevel: 0
     └─ star: 0
     🔄 [3/4] Calculate level up .
     ├─ heroQuality: blue
     ├─ heroType: skill
     ├─ talent: 0.32
     ├─ balancePower: 0.996
     └─ configTable: heroLevelUpBlue
     ├─ expCapsule (131): 946
     └─ gold (102): 784
🟢 17:31:17 INFO  📋 CONFIG   ▸ Resource loaded: heroLevelUpBlue.json
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
[DB] saveUser("guest_d43888..."): 102 keys, 11962 bytes
     ├─ heroLevel: 2
     ├─ expCapsule: 930
     └─ gold: 712
🟡 17:31:17 WARN  📋 CONFIG   ▸ Resource NOT found: qiGong.json
     ├─ path: /var/www/html/resource/json
     └─ reason: ENOENT: no such file or directory, open '/var/www/html/resource/json/qiGong.json'
     ├─ heroType: skill
     ├─ talent: 0.3200
     ├─ baseHP: 1408.00
     ├─ baseATK: 291.00
     ├─ baseARM: 256.00
     ├─ totalHP: 450.56
     ├─ totalATK: 93.12
     └─ power: 2315
     ├─ baseHP(preT): 1408.00
     ├─ baseATK(preT): 291.00
     ├─ baseARM: 256.00
     ├─ totalHP(postT): 450.56
     ├─ totalATK(postT): 93.12
     └─ power: 2315
     ✅ [4/4] Save data & build response .ret=0, heroId=4a802f37-1d62-4060-8658-844310d278c3, lvl 1→2

     🔒 CRITICAL FIELDS AUDIT — game will crash/stuck if wrong
     ├─ 🔒 heroId                   = 4a802f37-1d62-4060-8658-844310d278c3  L133741: getHero(e.heroId) — REQUIRED
     ├─ 🔒 _heroLevel               = 2  L133751: heroBaseAttr.level = e._heroLevel
     ├─ 🔒 _baseAttr                = Object{6}  L133805: setBaseAttr → PRE-TALENT HP/ATK, client applies talent
     ├─ 🔒 _totalAttr               = Object{7}  L133805: POST-TALENT HP/ATK, client uses directly for display
     ├─ 🔒 _totalCost._levelUp      = 2 items (exp+gold)  L133385-133393: totalCost.levelUp[] deserialize
     └─ 🔒 _changeInfo              = 2 items (exp+gold)  L118414-118417: resetTtemsCallBack → setItem(_id, _num)
     ✅ CRITICAL AUDIT: 6/6 PASSED

     📤 RESPONSE
     ├─ ret ...............: 0
     ├─ fields ............: (raw string)
     └─ size ..............: 626 chars (RAW)

     ⏱️  TIMING
     └─ Total .............: 11ms  █
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
▼ [29] 🦸 hero::autoLevelUp  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: hero
     ├─ action ............: autoLevelUp
     ├─ userId ............: guest_d43888e81e93a38d
     └─ serverId ..........: (missing)
     🔄 [1/4] Auto Level Up .....
     ├─ userId: guest_d43888e81e93a3
     ├─ heroId: 4a802f37-1d62-4060-8658-844310d278c3
     └─ times: 1
     ├─ maxTimes: 1
     └─ heroId: 4a802f37-1d62-4060-8658-844310d278c3
     ✅ [1/4] Auto Level Up .....heroId=4a802f37-1d62-4060-8658-844310d278c3, times=1
     🔄 [2/4] Load hero data ....
     ├─ heroId: 4a802f37-1d62-4060-8658-844310d278c3
     ├─ displayId: 1206
     ├─ currentLevel: 2
     ├─ evolveLevel: 0
     └─ star: 0
     🔄 [3/4] Calculate level up .
     ├─ heroQuality: blue
     ├─ heroType: skill
     ├─ talent: 0.32
     ├─ balancePower: 0.996
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
[DB] saveUser("guest_d43888..."): 102 keys, 11962 bytes
     ├─ heroLevel: 3
     ├─ expCapsule: 898
     └─ gold: 592
🟡 17:31:18 WARN  📋 CONFIG   ▸ Resource NOT found: qiGong.json
     ├─ path: /var/www/html/resource/json
     └─ reason: ENOENT: no such file or directory, open '/var/www/html/resource/json/qiGong.json'
     ├─ heroType: skill
     ├─ talent: 0.3200
     ├─ baseHP: 1576.00
     ├─ baseATK: 308.00
     ├─ baseARM: 307.00
     ├─ totalHP: 504.32
     ├─ totalATK: 98.56
     └─ power: 2551
     ├─ baseHP(preT): 1576.00
     ├─ baseATK(preT): 308.00
     ├─ baseARM: 307.00
     ├─ totalHP(postT): 504.32
     ├─ totalATK(postT): 98.56
     └─ power: 2551
     ✅ [4/4] Save data & build response .ret=0, heroId=4a802f37-1d62-4060-8658-844310d278c3, lvl 2→3

     🔒 CRITICAL FIELDS AUDIT — game will crash/stuck if wrong
     ├─ 🔒 heroId                   = 4a802f37-1d62-4060-8658-844310d278c3  L133741: getHero(e.heroId) — REQUIRED
     ├─ 🔒 _heroLevel               = 3  L133751: heroBaseAttr.level = e._heroLevel
     ├─ 🔒 _baseAttr                = Object{6}  L133805: setBaseAttr → PRE-TALENT HP/ATK, client applies talent
     ├─ 🔒 _totalAttr               = Object{7}  L133805: POST-TALENT HP/ATK, client uses directly for display
     ├─ 🔒 _totalCost._levelUp      = 2 items (exp+gold)  L133385-133393: totalCost.levelUp[] deserialize
     └─ 🔒 _changeInfo              = 2 items (exp+gold)  L118414-118417: resetTtemsCallBack → setItem(_id, _num)
     ✅ CRITICAL AUDIT: 6/6 PASSED

     📤 RESPONSE
     ├─ ret ...............: 0
     ├─ fields ............: (raw string)
     └─ size ..............: 627 chars (RAW)

     ⏱️  TIMING
     └─ Total .............: 9ms  
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
▼ [30] 🏆 activity::getActivityBrief  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: activity
     ├─ action ............: getActivityBrief
     ├─ userId ............: guest_d43888e81e93a38d
     └─ serverId ..........: (missing)
     🔄 [1/3] Validate request ..
     └─ userId: guest_d43888e81e93a3...
     ✅ [1/3] Validate request ..
     🔄 [2/3] Load user data ....
     ✅ [2/3] Load user data ....
     ├─ userLevel: 1
     ├─ userCreateTime: 2026-05-21T17:30:31.608Z
     ├─ userAgeDays: 0.0 days
     ├─ serverOpenDate: 2026-05-21T17:30:15.148Z
     ├─ serverAgeDays: 0.0 days
     └─ dayOfWeek(UTC+7): 5 (Weekday)
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
     ├─   userId                       "guest_d43888e81e93a38d"
     ├─   version                      "1.0"
     └─   _acts                        Object{12}
     ├─ original: 2576 chars
     ├─ compressed: 775 chars
     ├─ reduction: 70%
     └─ threshold: 1024 chars

     📤 RESPONSE
     ├─ ret ...............: 0
     ├─ fields ............: (raw string)
     └─ size ..............: 775 chars (LZ)

     ⏱️  TIMING
     └─ Total .............: 5ms  
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
▼ [31] 🎯 guide::saveGuide  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: guide
     ├─ action ............: saveGuide
     ├─ userId ............: guest_d43888e81e93a38d
     └─ serverId ..........: (missing)
     🔄 [1/3] Validate request fields .
     ├─ userId: guest_d43888e81e93a3
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
[DB] saveUser("guest_d43888..."): 102 keys, 11962 bytes

     📸 saveGuide ret=0

     🏏️ SUMMARY
     👤 User ......... guest_d43888e81e93a38d
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
     ├─ userId ............: guest_d43888e81e93a38d
     └─ serverId ..........: (missing)
     🔄 [1/2] Save guide team ...
     ├─ userId: guest_d43888e81e93a3
     ├─ team: 5 hero(es)
     └─ supers: 
     ✅ [1/2] Save guide team ...team=5 heroes
     🔄 [2/2] Persist team data .
[DB] saveUser("guest_d43888..."): 102 keys, 12043 bytes
     ✅ [2/2] Persist team data .saved to DB

     📤 RESPONSE
     ├─ ret ...............: 0
     ├─ fields ............: (raw string)
     └─ size ..............: 2 chars (RAW)

     ⏱️  TIMING
     └─ Total .............: 5ms  
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
▼ [33] ⏳ hangup::checkBattleResult  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: hangup
     ├─ action ............: checkBattleResult
     ├─ userId ............: guest_d43888e81e93a38d
     └─ serverId ..........: (missing)
     🔄 [1/5] Validate request ..
     ├─ userId: guest_d43888e81e93a3
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
[DB] saveUser("guest_d43888..."): 102 keys, 12106 bytes
     ✅ [5/7] Build response ....WIN rewards=5 lesson=10103

     🔒 CRITICAL FIELDS AUDIT — game will crash/stuck if wrong
     ├─ 🔒 _battleResult            = 0  L104882: 0 == e._battleResult -> true (tutorial always win)
     ├─ 🔒 _changeInfo._items       = 5 items  L97686: getBattleAwardItems iterates _changeInfo._items for {_id, _num}
     ├─ 🔒 _curLess                 = 10103  L104892/L97751: OnHookSingleton.lastSection = e._curLess
     └─ 🔒 _maxPassLesson           = 10102  L104893/L97751: OnHookSingleton.maxPassLesson = e._maxPassLesson
     ✅ CRITICAL AUDIT: 4/4 PASSED

     🏏️ SUMMARY
     👤 User ......... guest_d43888e81e93a38d
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
     └─ Total .............: 9ms  
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
▼ [34] 📋 buryPoint::guideBattle  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: buryPoint
     ├─ action ............: guideBattle
     ├─ userId ............: guest_d43888e81e93a38d
     └─ serverId ..........: (missing)
🟢 17:31:27 INFO  ⚪ BURYPOINT ▸ Guide battle analytics received
     ├─ userId: guest_d43888e81e93a3
     ├─ point: load
     ├─ passLesson: 10102
     └─ version: 1.0
[DB] saveUser("guest_d43888..."): 102 keys, 12183 bytes

     📤 RESPONSE
     ├─ ret ...............: 0
     ├─ fields ............: (raw string)
     └─ size ..............: 2 chars (RAW)

     ⏱️  TIMING
     └─ Total .............: 5ms  
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
  📊 IDLE SUMMARY — 10s no activity — 4ttRnaTDBVMG
══════════════════════════════════════════════════════════════════
  📊 Calls: 34  ✅ 34 OK  ⚡ 15.5ms avg  📦 10,856 chars
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
▼ [35] 📋 buryPoint::guideBattle  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: buryPoint
     ├─ action ............: guideBattle
     ├─ userId ............: guest_d43888e81e93a38d
     └─ serverId ..........: (missing)
🟢 17:31:48 INFO  ⚪ BURYPOINT ▸ Guide battle analytics received
     ├─ userId: guest_d43888e81e93a3
     ├─ point: battle
     ├─ passLesson: 10102
     └─ version: 1.0
[DB] saveUser("guest_d43888..."): 102 keys, 12262 bytes

     📤 RESPONSE
     ├─ ret ...............: 0
     ├─ fields ............: (raw string)
     └─ size ..............: 2 chars (RAW)

     ⏱️  TIMING
     └─ Total .............: 7ms  
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
▼ [36] 📋 buryPoint::guideBattle  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: buryPoint
     ├─ action ............: guideBattle
     ├─ userId ............: guest_d43888e81e93a38d
     └─ serverId ..........: (missing)
🟢 17:31:49 INFO  ⚪ BURYPOINT ▸ Guide battle analytics received
     ├─ userId: guest_d43888e81e93a3
     ├─ point: home
     ├─ passLesson: 10102
     └─ version: 1.0
[DB] saveUser("guest_d43888..."): 102 keys, 12339 bytes

     📤 RESPONSE
     ├─ ret ...............: 0
     ├─ fields ............: (raw string)
     └─ size ..............: 2 chars (RAW)

     ⏱️  TIMING
     └─ Total .............: 6ms  
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
▼ [37] 🏆 activity::getActivityBrief  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: activity
     ├─ action ............: getActivityBrief
     ├─ userId ............: guest_d43888e81e93a38d
     └─ serverId ..........: (missing)
     🔄 [1/3] Validate request ..
     └─ userId: guest_d43888e81e93a3...
     ✅ [1/3] Validate request ..
     🔄 [2/3] Load user data ....
     ✅ [2/3] Load user data ....
     ├─ userLevel: 1
     ├─ userCreateTime: 2026-05-21T17:30:31.608Z
     ├─ userAgeDays: 0.0 days
     ├─ serverOpenDate: 2026-05-21T17:30:15.148Z
     ├─ serverAgeDays: 0.0 days
     └─ dayOfWeek(UTC+7): 5 (Weekday)
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
     ├─   userId                       "guest_d43888e81e93a38d"
     ├─   version                      "1.0"
     └─   _acts                        Object{12}
     ├─ original: 2576 chars
     ├─ compressed: 775 chars
     ├─ reduction: 70%
     └─ threshold: 1024 chars

     📤 RESPONSE
     ├─ ret ...............: 0
     ├─ fields ............: (raw string)
     └─ size ..............: 775 chars (LZ)

     ⏱️  TIMING
     └─ Total .............: 13ms  █
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
▼ [38] 🎯 guide::saveGuide  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: guide
     ├─ action ............: saveGuide
     ├─ userId ............: guest_d43888e81e93a38d
     └─ serverId ..........: (missing)
     🔄 [1/3] Validate request fields .
     ├─ userId: guest_d43888e81e93a3
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
[DB] saveUser("guest_d43888..."): 102 keys, 12339 bytes

     📸 saveGuide ret=0

     🏏️ SUMMARY
     👤 User ......... guest_d43888e81e93a38d
     📦 Data .......... 0 chars (RAW)


     📤 RESPONSE
     ├─ ret ...............: 0
     ├─ fields ............: (raw string)
     └─ size ..............: 2 chars (RAW)

     ⏱️  TIMING
     └─ Total .............: 11ms  █
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
▼ [39] 🎯 guide::saveGuide  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: guide
     ├─ action ............: saveGuide
     ├─ userId ............: guest_d43888e81e93a38d
     └─ serverId ..........: (missing)
     🔄 [1/3] Validate request fields .
     ├─ userId: guest_d43888e81e93a3
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
[DB] saveUser("guest_d43888..."): 102 keys, 12339 bytes

     📸 saveGuide ret=0

     🏏️ SUMMARY
     👤 User ......... guest_d43888e81e93a38d
     📦 Data .......... 0 chars (RAW)


     📤 RESPONSE
     ├─ ret ...............: 0
     ├─ fields ............: (raw string)
     └─ size ..............: 2 chars (RAW)

     ⏱️  TIMING
     └─ Total .............: 7ms  
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
▼ [40] ⏳ hangup::gain  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: hangup
     ├─ action ............: gain
     ├─ userId ............: guest_d43888e81e93a38d
     └─ serverId ..........: (missing)
     🔄 [1/8] Validate request ..
     ├─ userId: guest_d43888e81e93a3
     └─ version: 1.0
     ✅ [1/8] Validate request ..
     🔄 [2/8] Load data .........
🟢 17:31:52 INFO  📋 CONFIG   ▸ Resource loaded: idleVipPlus.json
     ├─ entries: 18
     ├─ bytes: 1418
     └─ path: /var/www/html/resource/json/idleVipPlus.json
🟢 17:31:52 INFO  📋 CONFIG   ▸ Resource loaded: idleAwardFirst.json
     ├─ entries: 3
     ├─ bytes: 182
     └─ path: /var/www/html/resource/json/idleAwardFirst.json
🟢 17:31:52 INFO  📋 CONFIG   ▸ Resource loaded: lessonIdleAward.json
     ├─ entries: 611
     ├─ bytes: 1143151
     └─ path: /var/www/html/resource/json/lessonIdleAward.json
🟢 17:31:52 INFO  📋 CONFIG   ▸ Resource loaded: userUpgrade.json
     ├─ entries: 299
     ├─ bytes: 16357
     └─ path: /var/www/html/resource/json/userUpgrade.json
     ✅ [2/8] Load data .........lesson=611, everyTime=300s, maxIdle=28800s, maxLevel=300, firstBonus=3, idleAwardKeys=611, upgradeLevels=299
     🔄 [3/8] Calculate idle time .
     ├─ lastGainTime: 1779384631608
     ├─ now: 1779384712439
     ├─ elapsedRaw: 80s
     ├─ elapsedCapped: 80s (max 28800s)
     ├─ exCount: 0 ticks (300s each)
     └─ vipLevel: 0
     ✅ [3/8] Calculate idle time .80s, 0 ticks
     🔄 [4/8] Lesson config & bonus .
     ├─ curLess: 10103
     ├─ lessonName: 3
     ├─ idleAwardPlus: 0
     ├─ globalWarBuff: 0 (inactive)
     └─ bonusMultiplier: 1
     ✅ [4/8] Lesson config & bonus .lesson=10103, mult=1
     🔄 [5/8] Calculate rewards .
     └─ id=102 +232 (2.90416666666667/s x 80s x 1): undefined
     └─ id=103 +27 (0.3425/s x 80s x 1): undefined
     └─ id=131 +63 (0.794722222222222/s x 80s x 1): undefined
     └─ id=102 +1000: undefined
     └─ id=103 +20: undefined
     └─ id=131 +500: undefined
     ✅ [5/8] Calculate rewards .deterministic=3, randomDrops=0, firstBonus=3, totalItems=3
     🔄 [6/8] Level-up cascade ..
     ├─ oldLevel: 1
     ├─ newLevel: 2
     ├─ levelsGained: 1
     └─ expTotal: 106
     ✅ [6/8] Level-up cascade ..LEVELED UP 1 -> 2
     🔄 [7/8] Save & respond ....
[DB] saveUser("guest_d43888..."): 102 keys, 12341 bytes
     ✅ [7/8] Save & respond ....
     🔄 [8/8] Build response ....
     └─ totalProps._items[102] (GOLD): 1692 gold → 2924 gold (+1232 gold) [IDLE-GAIN]
     └─ totalProps._items[103] (EXP): 59 exp → 106 exp (+47 exp) [IDLE-GAIN]
     ✅ [8/8] Build response ....4 items, LEVEL UP 1->2

     📸 HANGUP GAIN ret=0
     ├─   type                         "hangup"
     ├─   action                       "gain"
     ├─   userId                       "guest_d43888e81e93a38d"
     ├─   version                      "1.0"
     ├─   _changeInfo                  Object{1}
     ├─   _lastGainTime                1779384631608
     └─   _clickGlobalWarBuffTag       ""

     🏏️ SUMMARY
     👤 User ......... guest_d43888e81e93a38d
     📦 Data .......... 0 chars (RAW)


     📤 RESPONSE
     ├─ ret ...............: 0
     ├─ fields ............: (raw string)
     └─ size ..............: 284 chars (RAW)

     ⏱️  TIMING
     └─ Total .............: 67ms  ██████
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
▼ [41] 🎯 guide::saveGuide  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: guide
     ├─ action ............: saveGuide
     ├─ userId ............: guest_d43888e81e93a38d
     └─ serverId ..........: (missing)
     🔄 [1/3] Validate request fields .
     ├─ userId: guest_d43888e81e93a3
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
[DB] saveUser("guest_d43888..."): 102 keys, 12341 bytes

     📸 saveGuide ret=0

     🏏️ SUMMARY
     👤 User ......... guest_d43888e81e93a38d
     📦 Data .......... 0 chars (RAW)


     📤 RESPONSE
     ├─ ret ...............: 0
     ├─ fields ............: (raw string)
     └─ size ..............: 2 chars (RAW)

     ⏱️  TIMING
     └─ Total .............: 7ms  
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
▼ [42] 🛠️ equip::wearAuto  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: equip
     ├─ action ............: wearAuto
     ├─ userId ............: guest_d43888e81e93a38d
     └─ serverId ..........: (missing)
     🔄 [1/8] Validate request fields .
     ├─ userId: guest_d43888e81e93a3...
     ├─ heroId: ae2251b2-9dce-4df0-9134-e8f0b12dd2b3
     ├─ equipInfo: 1,2,3,4
     └─ weaponId: (none)
     ✅ [1/8] Validate request fields .userId + heroId present
     🔄 [2/8] Load resource JSONs .
🟢 17:31:57 INFO  📋 CONFIG   ▸ Resource loaded: equip.json
     ├─ entries: 84
     ├─ bytes: 44152
     └─ path: /var/www/html/resource/json/equip.json
🟢 17:31:57 INFO  📋 CONFIG   ▸ Resource loaded: equipSuit.json
     ├─ entries: 15
     ├─ bytes: 8619
     └─ path: /var/www/html/resource/json/equipSuit.json
🟢 17:31:57 INFO  📋 CONFIG   ▸ Resource loaded: weapon.json
     ├─ entries: 20
     ├─ bytes: 3725
     └─ path: /var/www/html/resource/json/weapon.json
     ✅ [2/8] Load resource JSONs .8 JSONs loaded
     🔄 [3/8] Load userData from DB .
     ✅ [3/8] Load userData from DB .userData loaded
     🔄 [4/8] Validate hero exists .
     ├─ heroId: ae2251b2-9dce-4df0-9134-e8f0b12dd2b3
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
     ├─ hp: 8512
     ├─ attack: 388
     ├─ armor: 230
     └─ power: 4332
     ✅ [8/8] Calculate total attributes .power=4332
[DB] saveUser("guest_d43888..."): 102 keys, 12896 bytes
🟢 17:31:57 INFO  ⚪ WEAR_AUTO ▸ equip::wearAuto SUCCESS
     ├─ userId: guest_d43888e81e93a3...
     ├─ heroId: ae2251b2-9dce-4df0-9134-e8f0b12dd2b3
     ├─ equips: 4
     ├─ weapon: (none)
     ├─ power: 4332
     └─ duration: 37ms
     ├─ original: 1821 chars
     ├─ compressed: 373 chars
     ├─ reduction: 80%
     └─ threshold: 1024 chars

     📤 RESPONSE
     ├─ ret ...............: 0
     ├─ fields ............: (raw string)
     └─ size ..............: 373 chars (LZ)

     ⏱️  TIMING
     └─ Total .............: 41ms  ████
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
▼ [43] 🛠️ equip::wearAuto  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: equip
     ├─ action ............: wearAuto
     ├─ userId ............: guest_d43888e81e93a38d
     └─ serverId ..........: (missing)
     🔄 [1/8] Validate request fields .
     ├─ userId: guest_d43888e81e93a3...
     ├─ heroId: eeeb8e71-b300-425c-ab24-207e8bf33d64
     ├─ equipInfo: 1,2,3,4
     └─ weaponId: (none)
     ✅ [1/8] Validate request fields .userId + heroId present
     🔄 [2/8] Load resource JSONs .
     ✅ [2/8] Load resource JSONs .8 JSONs loaded
     🔄 [3/8] Load userData from DB .
     ✅ [3/8] Load userData from DB .userData loaded
     🔄 [4/8] Validate hero exists .
     ├─ heroId: eeeb8e71-b300-425c-ab24-207e8bf33d64
     ├─ _heroDisplayId: 1205
     └─ _level: 3
     ✅ [4/8] Validate hero exists .hero found: displayId=1205 level=3
     🔄 [5/8] Get hero config ...
     ✅ [5/8] Get hero config ...heroType=critical quality=purple
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
     ├─ hp: 6166
     ├─ attack: 732
     ├─ armor: 214
     └─ power: 2312
     ✅ [8/8] Calculate total attributes .power=2312
[DB] saveUser("guest_d43888..."): 102 keys, 13259 bytes
🟢 17:31:57 INFO  ⚪ WEAR_AUTO ▸ equip::wearAuto SUCCESS
     ├─ userId: guest_d43888e81e93a3...
     ├─ heroId: eeeb8e71-b300-425c-ab24-207e8bf33d64
     ├─ equips: 4
     ├─ weapon: (none)
     ├─ power: 2312
     └─ duration: 6ms
     ├─ original: 1821 chars
     ├─ compressed: 377 chars
     ├─ reduction: 79%
     └─ threshold: 1024 chars

     📤 RESPONSE
     ├─ ret ...............: 0
     ├─ fields ............: (raw string)
     └─ size ..............: 377 chars (LZ)

     ⏱️  TIMING
     └─ Total .............: 8ms  
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
▼ [44] 🛠️ equip::wearAuto  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: equip
     ├─ action ............: wearAuto
     ├─ userId ............: guest_d43888e81e93a38d
     └─ serverId ..........: (missing)
     🔄 [1/8] Validate request fields .
     ├─ userId: guest_d43888e81e93a3...
     ├─ heroId: 4a802f37-1d62-4060-8658-844310d278c3
     ├─ equipInfo: 1,2,3,4
     └─ weaponId: (none)
     ✅ [1/8] Validate request fields .userId + heroId present
     🔄 [2/8] Load resource JSONs .
     ✅ [2/8] Load resource JSONs .8 JSONs loaded
     🔄 [3/8] Load userData from DB .
     ✅ [3/8] Load userData from DB .userData loaded
     🔄 [4/8] Validate hero exists .
     ├─ heroId: 4a802f37-1d62-4060-8658-844310d278c3
     ├─ _heroDisplayId: 1206
     └─ _level: 3
     ✅ [4/8] Validate hero exists .hero found: displayId=1206 level=3
     🔄 [5/8] Get hero config ...
     ✅ [5/8] Get hero config ...heroType=skill quality=blue
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
     ├─ hp: 6482
     ├─ attack: 578
     ├─ armor: 307
     └─ power: 2551
     ✅ [8/8] Calculate total attributes .power=2551
[DB] saveUser("guest_d43888..."): 102 keys, 13799 bytes
🟢 17:31:57 INFO  ⚪ WEAR_AUTO ▸ equip::wearAuto SUCCESS
     ├─ userId: guest_d43888e81e93a3...
     ├─ heroId: 4a802f37-1d62-4060-8658-844310d278c3
     ├─ equips: 4
     ├─ weapon: (none)
     ├─ power: 2551
     └─ duration: 6ms
     ├─ original: 1822 chars
     ├─ compressed: 373 chars
     ├─ reduction: 80%
     └─ threshold: 1024 chars

     📤 RESPONSE
     ├─ ret ...............: 0
     ├─ fields ............: (raw string)
     └─ size ..............: 373 chars (LZ)

     ⏱️  TIMING
     └─ Total .............: 8ms  
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
▼ [45] 🎯 guide::saveGuide  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: guide
     ├─ action ............: saveGuide
     ├─ userId ............: guest_d43888e81e93a38d
     └─ serverId ..........: (missing)
     🔄 [1/3] Validate request fields .
     ├─ userId: guest_d43888e81e93a3
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
[DB] saveUser("guest_d43888..."): 102 keys, 13799 bytes

     📸 saveGuide ret=0

     🏏️ SUMMARY
     👤 User ......... guest_d43888e81e93a38d
     📦 Data .......... 0 chars (RAW)


     📤 RESPONSE
     ├─ ret ...............: 0
     ├─ fields ............: (raw string)
     └─ size ..............: 2 chars (RAW)

     ⏱️  TIMING
     └─ Total .............: 6ms  
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
▼ [46] 🏆 activity::getActivityBrief  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: activity
     ├─ action ............: getActivityBrief
     ├─ userId ............: guest_d43888e81e93a38d
     └─ serverId ..........: (missing)
     🔄 [1/3] Validate request ..
     └─ userId: guest_d43888e81e93a3...
     ✅ [1/3] Validate request ..
     🔄 [2/3] Load user data ....
     ✅ [2/3] Load user data ....
     ├─ userLevel: 2
     ├─ userCreateTime: 2026-05-21T17:30:31.608Z
     ├─ userAgeDays: 0.0 days
     ├─ serverOpenDate: 2026-05-21T17:30:15.148Z
     ├─ serverAgeDays: 0.0 days
     └─ dayOfWeek(UTC+7): 5 (Weekday)
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
     ├─   userId                       "guest_d43888e81e93a38d"
     ├─   version                      "1.0"
     └─   _acts                        Object{12}
     ├─ original: 2576 chars
     ├─ compressed: 775 chars
     ├─ reduction: 70%
     └─ threshold: 1024 chars

     📤 RESPONSE
     ├─ ret ...............: 0
     ├─ fields ............: (raw string)
     └─ size ..............: 775 chars (LZ)

     ⏱️  TIMING
     └─ Total .............: 6ms  
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
▼ [47] 🎯 guide::saveGuide  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: guide
     ├─ action ............: saveGuide
     ├─ userId ............: guest_d43888e81e93a38d
     └─ serverId ..........: (missing)
     🔄 [1/3] Validate request fields .
     ├─ userId: guest_d43888e81e93a3
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
[DB] saveUser("guest_d43888..."): 102 keys, 13808 bytes

     📸 saveGuide ret=0

     🏏️ SUMMARY
     👤 User ......... guest_d43888e81e93a38d
     📦 Data .......... 0 chars (RAW)


     📤 RESPONSE
     ├─ ret ...............: 0
     ├─ fields ............: (raw string)
     └─ size ..............: 2 chars (RAW)

     ⏱️  TIMING
     └─ Total .............: 12ms  █
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
▼ [48] 🏆 activity::getActivityBrief  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: activity
     ├─ action ............: getActivityBrief
     ├─ userId ............: guest_d43888e81e93a38d
     └─ serverId ..........: (missing)
     🔄 [1/3] Validate request ..
     └─ userId: guest_d43888e81e93a3...
     ✅ [1/3] Validate request ..
     🔄 [2/3] Load user data ....
     ✅ [2/3] Load user data ....
     ├─ userLevel: 2
     ├─ userCreateTime: 2026-05-21T17:30:31.608Z
     ├─ userAgeDays: 0.0 days
     ├─ serverOpenDate: 2026-05-21T17:30:15.148Z
     ├─ serverAgeDays: 0.0 days
     └─ dayOfWeek(UTC+7): 5 (Weekday)
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
     ├─   userId                       "guest_d43888e81e93a38d"
     ├─   version                      "1.0"
     └─   _acts                        Object{12}
     ├─ original: 2576 chars
     ├─ compressed: 775 chars
     ├─ reduction: 70%
     └─ threshold: 1024 chars

     📤 RESPONSE
     ├─ ret ...............: 0
     ├─ fields ............: (raw string)
     └─ size ..............: 775 chars (LZ)

     ⏱️  TIMING
     └─ Total .............: 9ms  
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
  📊 IDLE SUMMARY — 10s no activity — 4ttRnaTDBVMG
══════════════════════════════════════════════════════════════════
  📊 Calls: 48  ✅ 48 OK  ⚡ 15.3ms avg  📦 14,602 chars
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
▼ [49] 🦸 hero::autoLevelUp  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: hero
     ├─ action ............: autoLevelUp
     ├─ userId ............: guest_d43888e81e93a38d
     └─ serverId ..........: (missing)
     🔄 [1/4] Auto Level Up .....
     ├─ userId: guest_d43888e81e93a3
     ├─ heroId: eeeb8e71-b300-425c-ab24-207e8bf33d64
     └─ times: 1
     ├─ maxTimes: 1
     └─ heroId: eeeb8e71-b300-425c-ab24-207e8bf33d64
     ✅ [1/4] Auto Level Up .....heroId=eeeb8e71-b300-425c-ab24-207e8bf33d64, times=1
     🔄 [2/4] Load hero data ....
     ├─ heroId: eeeb8e71-b300-425c-ab24-207e8bf33d64
     ├─ displayId: 1205
     ├─ currentLevel: 3
     ├─ evolveLevel: 0
     └─ star: 0
     🔄 [3/4] Calculate level up .
     ├─ heroQuality: purple
     ├─ heroType: critical
     ├─ talent: 0.4
     ├─ balancePower: 1.2
     └─ configTable: heroLevelUpPurple
     ├─ expCapsule (131): 1461
     └─ gold (102): 2924
     ├─ levelsGained: 1
     ├─ oldLevel: 3
     ├─ newLevel: 4
     ├─ totalExpCost: 45
     ├─ totalGoldCost: 189
     ├─ remainingExp: 1416
     └─ remainingGold: 2735
     ✅ [3/4] Calculate level up .1 levels (3 → 4)
     🔄 [4/4] Save data & build response .
[DB] saveUser("guest_d43888..."): 102 keys, 13808 bytes
     ├─ heroLevel: 4
     ├─ expCapsule: 1416
     └─ gold: 2735
🟡 17:32:22 WARN  📋 CONFIG   ▸ Resource NOT found: qiGong.json
     ├─ path: /var/www/html/resource/json
     └─ reason: ENOENT: no such file or directory, open '/var/www/html/resource/json/qiGong.json'
     ├─ heroType: critical
     ├─ talent: 0.4000
     ├─ baseHP: 1395.20
     ├─ baseATK: 487.50
     ├─ baseARM: 250.60
     ├─ totalHP: 558.08
     ├─ totalATK: 195.00
     └─ power: 2509
     ├─ baseHP(preT): 1395.20
     ├─ baseATK(preT): 487.50
     ├─ baseARM: 250.60
     ├─ totalHP(postT): 558.08
     ├─ totalATK(postT): 195.00
     └─ power: 2509
     ✅ [4/4] Save data & build response .ret=0, heroId=eeeb8e71-b300-425c-ab24-207e8bf33d64, lvl 3→4

     🔒 CRITICAL FIELDS AUDIT — game will crash/stuck if wrong
     ├─ 🔒 heroId                   = eeeb8e71-b300-425c-ab24-207e8bf33d64  L133741: getHero(e.heroId) — REQUIRED
     ├─ 🔒 _heroLevel               = 4  L133751: heroBaseAttr.level = e._heroLevel
     ├─ 🔒 _baseAttr                = Object{6}  L133805: setBaseAttr → PRE-TALENT HP/ATK, client applies talent
     ├─ 🔒 _totalAttr               = Object{7}  L133805: POST-TALENT HP/ATK, client uses directly for display
     ├─ 🔒 _totalCost._levelUp      = 2 items (exp+gold)  L133385-133393: totalCost.levelUp[] deserialize
     └─ 🔒 _changeInfo              = 2 items (exp+gold)  L118414-118417: resetTtemsCallBack → setItem(_id, _num)
     ✅ CRITICAL AUDIT: 6/6 PASSED

     📤 RESPONSE
     ├─ ret ...............: 0
     ├─ fields ............: (raw string)
     └─ size ..............: 633 chars (RAW)

     ⏱️  TIMING
     └─ Total .............: 12ms  █
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
▼ [50] 🦸 hero::autoLevelUp  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: hero
     ├─ action ............: autoLevelUp
     ├─ userId ............: guest_d43888e81e93a38d
     └─ serverId ..........: (missing)
     🔄 [1/4] Auto Level Up .....
     ├─ userId: guest_d43888e81e93a3
     ├─ heroId: 4a802f37-1d62-4060-8658-844310d278c3
     └─ times: 1
     ├─ maxTimes: 1
     └─ heroId: 4a802f37-1d62-4060-8658-844310d278c3
     ✅ [1/4] Auto Level Up .....heroId=4a802f37-1d62-4060-8658-844310d278c3, times=1
     🔄 [2/4] Load hero data ....
     ├─ heroId: 4a802f37-1d62-4060-8658-844310d278c3
     ├─ displayId: 1206
     ├─ currentLevel: 3
     ├─ evolveLevel: 0
     └─ star: 0
     🔄 [3/4] Calculate level up .
     ├─ heroQuality: blue
     ├─ heroType: skill
     ├─ talent: 0.32
     ├─ balancePower: 0.996
     └─ configTable: heroLevelUpBlue
     ├─ expCapsule (131): 1416
     └─ gold (102): 2735
     ├─ levelsGained: 1
     ├─ oldLevel: 3
     ├─ newLevel: 4
     ├─ totalExpCost: 40
     ├─ totalGoldCost: 168
     ├─ remainingExp: 1376
     └─ remainingGold: 2567
     ✅ [3/4] Calculate level up .1 levels (3 → 4)
     🔄 [4/4] Save data & build response .
[DB] saveUser("guest_d43888..."): 102 keys, 13808 bytes
     ├─ heroLevel: 4
     ├─ expCapsule: 1376
     └─ gold: 2567
🟡 17:32:25 WARN  📋 CONFIG   ▸ Resource NOT found: qiGong.json
     ├─ path: /var/www/html/resource/json
     └─ reason: ENOENT: no such file or directory, open '/var/www/html/resource/json/qiGong.json'
     ├─ heroType: skill
     ├─ talent: 0.3200
     ├─ baseHP: 1744.00
     ├─ baseATK: 325.00
     ├─ baseARM: 358.00
     ├─ totalHP: 558.08
     ├─ totalATK: 104.00
     └─ power: 2787
     ├─ baseHP(preT): 1744.00
     ├─ baseATK(preT): 325.00
     ├─ baseARM: 358.00
     ├─ totalHP(postT): 558.08
     ├─ totalATK(postT): 104.00
     └─ power: 2787
     ✅ [4/4] Save data & build response .ret=0, heroId=4a802f37-1d62-4060-8658-844310d278c3, lvl 3→4

     🔒 CRITICAL FIELDS AUDIT — game will crash/stuck if wrong
     ├─ 🔒 heroId                   = 4a802f37-1d62-4060-8658-844310d278c3  L133741: getHero(e.heroId) — REQUIRED
     ├─ 🔒 _heroLevel               = 4  L133751: heroBaseAttr.level = e._heroLevel
     ├─ 🔒 _baseAttr                = Object{6}  L133805: setBaseAttr → PRE-TALENT HP/ATK, client applies talent
     ├─ 🔒 _totalAttr               = Object{7}  L133805: POST-TALENT HP/ATK, client uses directly for display
     ├─ 🔒 _totalCost._levelUp      = 2 items (exp+gold)  L133385-133393: totalCost.levelUp[] deserialize
     └─ 🔒 _changeInfo              = 2 items (exp+gold)  L118414-118417: resetTtemsCallBack → setItem(_id, _num)
     ✅ CRITICAL AUDIT: 6/6 PASSED

     📤 RESPONSE
     ├─ ret ...............: 0
     ├─ fields ............: (raw string)
     └─ size ..............: 627 chars (RAW)

     ⏱️  TIMING
     └─ Total .............: 10ms  █
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
▼ [51] 🦸 hero::autoLevelUp  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: hero
     ├─ action ............: autoLevelUp
     ├─ userId ............: guest_d43888e81e93a38d
     └─ serverId ..........: (missing)
     🔄 [1/4] Auto Level Up .....
     ├─ userId: guest_d43888e81e93a3
     ├─ heroId: ae2251b2-9dce-4df0-9134-e8f0b12dd2b3
     └─ times: 1
     ├─ maxTimes: 1
     └─ heroId: ae2251b2-9dce-4df0-9134-e8f0b12dd2b3
     ✅ [1/4] Auto Level Up .....heroId=ae2251b2-9dce-4df0-9134-e8f0b12dd2b3, times=1
     🔄 [2/4] Load hero data ....
     ├─ heroId: ae2251b2-9dce-4df0-9134-e8f0b12dd2b3
     ├─ displayId: 1309
     ├─ currentLevel: 3
     ├─ evolveLevel: 0
     └─ star: 0
     🔄 [3/4] Calculate level up .
     ├─ heroQuality: purple
     ├─ heroType: body
     ├─ talent: 0.4
     ├─ balancePower: 0.996
     └─ configTable: heroLevelUpPurple
     ├─ expCapsule (131): 1376
     └─ gold (102): 2567
     ├─ levelsGained: 1
     ├─ oldLevel: 3
     ├─ newLevel: 4
     ├─ totalExpCost: 45
     ├─ totalGoldCost: 189
     ├─ remainingExp: 1331
     └─ remainingGold: 2378
     ✅ [3/4] Calculate level up .1 levels (3 → 4)
     🔄 [4/4] Save data & build response .
[DB] saveUser("guest_d43888..."): 102 keys, 13808 bytes
     ├─ heroLevel: 4
     ├─ expCapsule: 1331
     └─ gold: 2378
🟡 17:32:28 WARN  📋 CONFIG   ▸ Resource NOT found: qiGong.json
     ├─ path: /var/www/html/resource/json
     └─ reason: ENOENT: no such file or directory, open '/var/www/html/resource/json/qiGong.json'
     ├─ heroType: body
     ├─ talent: 0.4000
     ├─ baseHP: 3841.60
     ├─ baseATK: 131.25
     ├─ baseARM: 268.50
     ├─ totalHP: 1536.64
     ├─ totalATK: 52.50
     └─ power: 4619
     ├─ baseHP(preT): 3841.60
     ├─ baseATK(preT): 131.25
     ├─ baseARM: 268.50
     ├─ totalHP(postT): 1536.64
     ├─ totalATK(postT): 52.50
     └─ power: 4619
     ✅ [4/4] Save data & build response .ret=0, heroId=ae2251b2-9dce-4df0-9134-e8f0b12dd2b3, lvl 3→4

     🔒 CRITICAL FIELDS AUDIT — game will crash/stuck if wrong
     ├─ 🔒 heroId                   = ae2251b2-9dce-4df0-9134-e8f0b12dd2b3  L133741: getHero(e.heroId) — REQUIRED
     ├─ 🔒 _heroLevel               = 4  L133751: heroBaseAttr.level = e._heroLevel
     ├─ 🔒 _baseAttr                = Object{6}  L133805: setBaseAttr → PRE-TALENT HP/ATK, client applies talent
     ├─ 🔒 _totalAttr               = Object{7}  L133805: POST-TALENT HP/ATK, client uses directly for display
     ├─ 🔒 _totalCost._levelUp      = 2 items (exp+gold)  L133385-133393: totalCost.levelUp[] deserialize
     └─ 🔒 _changeInfo              = 2 items (exp+gold)  L118414-118417: resetTtemsCallBack → setItem(_id, _num)
     ✅ CRITICAL AUDIT: 6/6 PASSED

     📤 RESPONSE
     ├─ ret ...............: 0
     ├─ fields ............: (raw string)
     └─ size ..............: 636 chars (RAW)

     ⏱️  TIMING
     └─ Total .............: 9ms  
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
▼ [52] 🦸 hero::autoLevelUp  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: hero
     ├─ action ............: autoLevelUp
     ├─ userId ............: guest_d43888e81e93a38d
     └─ serverId ..........: (missing)
     🔄 [1/4] Auto Level Up .....
     ├─ userId: guest_d43888e81e93a3
     ├─ heroId: ae2251b2-9dce-4df0-9134-e8f0b12dd2b3
     └─ times: 100
     ├─ maxTimes: 100
     └─ heroId: ae2251b2-9dce-4df0-9134-e8f0b12dd2b3
     ✅ [1/4] Auto Level Up .....heroId=ae2251b2-9dce-4df0-9134-e8f0b12dd2b3, times=100
     🔄 [2/4] Load hero data ....
     ├─ heroId: ae2251b2-9dce-4df0-9134-e8f0b12dd2b3
     ├─ displayId: 1309
     ├─ currentLevel: 4
     ├─ evolveLevel: 0
     └─ star: 0
     🔄 [3/4] Calculate level up .
     ├─ heroQuality: purple
     ├─ heroType: body
     ├─ talent: 0.4
     ├─ balancePower: 0.996
     └─ configTable: heroLevelUpPurple
     ├─ expCapsule (131): 1331
     └─ gold (102): 2378
     ├─ reason: NOT_ENOUGH_RESOURCES
     ├─ atLevel: 10
     ├─ needExp: 126
     ├─ haveExp: 809
     ├─ needGold: 549
     └─ haveGold: 182
     ├─ levelsGained: 6
     ├─ oldLevel: 4
     ├─ newLevel: 10
     ├─ totalExpCost: 522
     ├─ totalGoldCost: 2196
     ├─ remainingExp: 809
     └─ remainingGold: 182
     ✅ [3/4] Calculate level up .6 levels (4 → 10)
     🔄 [4/4] Save data & build response .
[DB] saveUser("guest_d43888..."): 102 keys, 13807 bytes
     ├─ heroLevel: 10
     ├─ expCapsule: 809
     └─ gold: 182
🟡 17:32:28 WARN  📋 CONFIG   ▸ Resource NOT found: qiGong.json
     ├─ path: /var/www/html/resource/json
     └─ reason: ENOENT: no such file or directory, open '/var/www/html/resource/json/qiGong.json'
     ├─ heroType: body
     ├─ talent: 0.4000
     ├─ baseHP: 5255.60
     ├─ baseATK: 207.75
     ├─ baseARM: 500.25
     ├─ totalHP: 2102.24
     ├─ totalATK: 83.10
     └─ power: 6341
     ├─ baseHP(preT): 5255.60
     ├─ baseATK(preT): 207.75
     ├─ baseARM: 500.25
     ├─ totalHP(postT): 2102.24
     ├─ totalATK(postT): 83.10
     └─ power: 6341
     ✅ [4/4] Save data & build response .ret=0, heroId=ae2251b2-9dce-4df0-9134-e8f0b12dd2b3, lvl 4→10

     🔒 CRITICAL FIELDS AUDIT — game will crash/stuck if wrong
     ├─ 🔒 heroId                   = ae2251b2-9dce-4df0-9134-e8f0b12dd2b3  L133741: getHero(e.heroId) — REQUIRED
     ├─ 🔒 _heroLevel               = 10  L133751: heroBaseAttr.level = e._heroLevel
     ├─ 🔒 _baseAttr                = Object{6}  L133805: setBaseAttr → PRE-TALENT HP/ATK, client applies talent
     ├─ 🔒 _totalAttr               = Object{7}  L133805: POST-TALENT HP/ATK, client uses directly for display
     ├─ 🔒 _totalCost._levelUp      = 2 items (exp+gold)  L133385-133393: totalCost.levelUp[] deserialize
     └─ 🔒 _changeInfo              = 2 items (exp+gold)  L118414-118417: resetTtemsCallBack → setItem(_id, _num)
     ✅ CRITICAL AUDIT: 6/6 PASSED

     📤 RESPONSE
     ├─ ret ...............: 0
     ├─ fields ............: (raw string)
     └─ size ..............: 663 chars (RAW)

     ⏱️  TIMING
     └─ Total .............: 12ms  █
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
▼ [53] 🏆 activity::getActivityBrief  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: activity
     ├─ action ............: getActivityBrief
     ├─ userId ............: guest_d43888e81e93a38d
     └─ serverId ..........: (missing)
     🔄 [1/3] Validate request ..
     └─ userId: guest_d43888e81e93a3...
     ✅ [1/3] Validate request ..
     🔄 [2/3] Load user data ....
     ✅ [2/3] Load user data ....
     ├─ userLevel: 2
     ├─ userCreateTime: 2026-05-21T17:30:31.608Z
     ├─ userAgeDays: 0.0 days
     ├─ serverOpenDate: 2026-05-21T17:30:15.148Z
     ├─ serverAgeDays: 0.0 days
     └─ dayOfWeek(UTC+7): 5 (Weekday)
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
     ├─   userId                       "guest_d43888e81e93a38d"
     ├─   version                      "1.0"
     └─   _acts                        Object{12}
     ├─ original: 2576 chars
     ├─ compressed: 775 chars
     ├─ reduction: 70%
     └─ threshold: 1024 chars

     📤 RESPONSE
     ├─ ret ...............: 0
     ├─ fields ............: (raw string)
     └─ size ..............: 775 chars (LZ)

     ⏱️  TIMING
     └─ Total .............: 17ms  █
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
▼ [54] ⏳ hangup::startGeneral  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: hangup
     ├─ action ............: startGeneral
     ├─ userId ............: guest_d43888e81e93a38d
     └─ serverId ..........: (missing)
     🔄 [1/7] Validate request ..
     ├─ userId: guest_d43888e81e93a3
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
     ├─ battleId: 1315eabc-9d0...
     ├─ userId: guest_d43888e81e...
     ├─ lessonId: 10103
     └─ status: REGISTERED
     ✅ [6/7] Build response ....battleId=1315eabc..., enemies=1
     🔄 [7/7] Verify & respond ..

     🔒 CRITICAL FIELDS AUDIT — game will crash/stuck if wrong
     ├─ 🔒 _battleId                = 1315eabc-9d08-4c...  L97731: UserInfoSingleton.getInstance().battleId = r._battleId
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
     ├─   _battleId                    "1315eabc-9d08-4cce-a062-fd5c..."
     ├─   _rightTeam                   Object{1}
     └─   _rightSuper                  Array[0] ⚠️ EMPTY

     🏏️ SUMMARY
     👤 User ......... guest_d43888e81e93a38d
     📦 Data .......... 0 chars (RAW)


     📤 RESPONSE
     ├─ ret ...............: 0
     ├─ fields ............: (raw string)
     └─ size ..............: 994 chars (RAW)

     ⏱️  TIMING
     └─ Total .............: 11ms  █
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
▼ [55] 🛠️ battle::getRandom  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: battle
     ├─ action ............: getRandom
     ├─ userId ............: guest_d43888e81e93a38d
     └─ serverId ..........: (missing)
     🔄 [1/5] Validate request ..
     ├─ userId: guest_d43888e81e93a3
     ├─ battleId: 1315eabc-9d08-4cce-a...
     ├─ count: 100
     └─ version: 1.0
     ✅ [1/5] Validate request ..
     🔄 [2/5] Validate battleId .
     ✅ [2/5] Validate battleId .battleId=1315eabc-9d0... lesson=10103
     🔄 [3/5] Generate randoms ..
     ├─ count: 100
     ├─ min: 0.000149
     ├─ max: 0.998331
     ├─ avg: 0.549884
     ├─ first5: 0.439107, 0.849043, 0.343155, 0.270456, 0.715582
     └─ precision: ~16 decimal places (Math.random)
     ✅ [3/5] Generate randoms ..100 randoms generated (avg=0.5499)
     🔄 [4/5] Update session ....
     ├─ battleId: 1315eabc-9d0...
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
     └─ value: 0.4391072744786363,0.8490431915826276,0.34315502593180547,0.2704562897547207,0.7155818519345889,0.1638028453494531,0.7665458148743708,0.44209821382455683,0.33953534251954565,0.24880064673178892,0.8923619450857693,0.1921760937887963,0.1830631474130483,0.9369782135809731,0.000148505454825254,0.08344578488449261,0.9571609349759249,0.911917929144296,0.5270106320116303,0.6167942222661024,0.8086850438446962,0.30929769473329716,0.1808331824732703,0.9257635537575252,0.8945377057931367,0.6028409691888804,0.6161062582008947,0.4786156999987823,0.9204710780688902,0.5680743457204065,0.8389954175926704,0.7407404156479009,0.19245688346132894,0.030479376744169118,0.5200426223022809,0.19162675174230692,0.06028088706303991,0.4454890845435082,0.5861060523570144,0.021408662890981534,0.42260110349137614,0.6864818068751006,0.7550057186067504,0.9566478254630791,0.3892590208137211,0.47060751133783174,0.8126754517810687,0.5784116072470072,0.3751081396449333,0.11390053166031988,0.7519244837196939,0.52203325599314,0.6790431626286649,0.8340159645089822,0.9983310139604613,0.6024813280322165,0.32090952598397093,0.6399310137093703,0.26156016578948316,0.9824504976396541,0.6390479928459305,0.76212270325609,0.4971760659318626,0.9190984177817084,0.5179767644035935,0.30294074359082745,0.8622033697004025,0.9877095734374995,0.40935030982821574,0.392046921094815,0.9493792055227804,0.7999774644207863,0.8213112268144673,0.647274938982956,0.5001524649478211,0.6536005152893081,0.4863379429354484,0.4349553233690754,0.9856073779689464,0.9880190416722727,0.6979506844999578,0.3805458765298717,0.7287859215108345,0.5208687031063866,0.8076567580075696,0.48936453034533245,0.38650951602626504,0.6713124161753498,0.1537564911224767,0.04640764342671799,0.4432621438836307,0.306608105495091,0.3487650632392526,0.5977167553328983,0.8753845842184771,0.17555824942903975,0.3063533913902856,0.8038849455026144,0.31057438820384764,0.4153967984559168
     ✅ [5/5] Build response ....

     📸 GET RANDOM ret=0
     ├─   _rand_length                 100
     ├─   _rand_first3                 Array[3]
     └─   _rand_avg                    "0.549884"

     🏏️ SUMMARY
     👤 User ......... guest_d43888e81e93a38d
     📦 Data .......... 0 chars (RAW)

     ├─ original: 1930 chars
     ├─ compressed: 533 chars
     ├─ reduction: 72%
     └─ threshold: 1024 chars

     📤 RESPONSE
     ├─ ret ...............: 0
     ├─ fields ............: (raw string)
     └─ size ..............: 533 chars (LZ)

     ⏱️  TIMING
     └─ Total .............: 11ms  █
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
▼ [56] ⏳ hangup::checkBattleResult  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: hangup
     ├─ action ............: checkBattleResult
     ├─ userId ............: guest_d43888e81e93a38d
     └─ serverId ..........: (missing)
     🔄 [1/5] Validate request ..
     ├─ userId: guest_d43888e81e93a3
     ├─ isGuide: false
     ├─ battleId: 1315eabc-9d08-4cce-a062-fd5ca6ccccd1
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
[DB] saveUser("guest_d43888..."): 102 keys, 13807 bytes
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
     👤 User ......... guest_d43888e81e93a38d
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
▼ [57] 🏆 activity::getActivityBrief  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: activity
     ├─ action ............: getActivityBrief
     ├─ userId ............: guest_d43888e81e93a38d
     └─ serverId ..........: (missing)
     🔄 [1/3] Validate request ..
     └─ userId: guest_d43888e81e93a3...
     ✅ [1/3] Validate request ..
     🔄 [2/3] Load user data ....
     ✅ [2/3] Load user data ....
     ├─ userLevel: 2
     ├─ userCreateTime: 2026-05-21T17:30:31.608Z
     ├─ userAgeDays: 0.0 days
     ├─ serverOpenDate: 2026-05-21T17:30:15.148Z
     ├─ serverAgeDays: 0.0 days
     └─ dayOfWeek(UTC+7): 5 (Weekday)
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
     ├─   userId                       "guest_d43888e81e93a38d"
     ├─   version                      "1.0"
     └─   _acts                        Object{12}
     ├─ original: 2576 chars
     ├─ compressed: 775 chars
     ├─ reduction: 70%
     └─ threshold: 1024 chars

     📤 RESPONSE
     ├─ ret ...............: 0
     ├─ fields ............: (raw string)
     └─ size ..............: 775 chars (LZ)

     ⏱️  TIMING
     └─ Total .............: 11ms  █
══════════════════════════════════════════════════════════════════
══════════════════════════════════════════════════════════════════
▼ [58] 🎁 gift::getOnlineGift  —  ⚡—  📦—
══════════════════════════════════════════════════════════════════

     📕 REQUEST
     ├─ type ..............: gift
     ├─ action ............: getOnlineGift
     ├─ userId ............: guest_d43888e81e93a38d
     └─ serverId ..........: (missing)
     ❌ NOT_FOUND: Unknown type "gift" ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─
     ├─ registeredTypes: user, friend, heroImage, hero, userMsg, guide, hangup, activity, buryPoint, summon, equip, battle
     ├─ requestedType: gift
     └─ fix: Client is sending unknown type — check protocol version

     📤 RESPONSE
     ├─ ret ...............: 4 (NOT_FOUND)
     └─ size ..............: 0 chars

     ⏱️  TIMING
     └─ Total .............: 0ms
══════════════════════════════════════════════════════════════════

  ➖ Disconnected  4ttRnaTDBVMG...  reason: reason=transport close
══════════════════════════════════════════════════════════════════
  📊 FINAL SUMMARY — 4ttRnaTDBVMG  ⏱️ alive 2m 26s
══════════════════════════════════════════════════════════════════
  👤 User ........... guest_d43888e81e93a3...88e81e93a38d
  📊 Calls: 58  ✅ 57 OK  ❌ 1 (gift::getOnlineGift)  ⚡ 14.4ms avg  📦 20,347 chars
  📋 Handlers ........ 23 registered, 1 missing
══════════════════════════════════════════════════════════════════
