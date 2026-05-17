[DB] Loaded 21 records from /var/www/html/server/main-server/data/main_server.json (241091 bytes)
🟢 09:41:41.649 INFO  📋 CONFIG   ▸ serverOpenDate auto-initialized: 1779010901648

  ┌─ LOADING RESOURCES ───────────────────────────────────┐

🟢 09:41:41.657 INFO  📋 CONFIG   ▸ Resource loaded: constant.json
🟢 09:41:41.697 INFO  📋 CONFIG   ▸ Resource loaded: hero.json
🟢 09:41:41.699 INFO  📋 CONFIG   ▸ Resource loaded: summon.json
🟢 09:41:41.701 INFO  📋 CONFIG   ▸ Resource loaded: heroLevelAttr.json
🟢 09:41:41.702 INFO  📋 CONFIG   ▸ Resource loaded: heroTypeParam.json
🟢 09:41:41.704 INFO  📋 CONFIG   ▸ Resource loaded: heroQualityParam.json
🟢 09:41:41.706 INFO  📋 CONFIG   ▸ Resource loaded: heroPower.json
🟢 09:41:41.707 INFO  📋 CONFIG   ▸ Resource loaded: zPowerQualityPara.json

  ──────────────────────────────


  ╔════════════════════════════════════════════════════════════╗
  ║  SUPER WARRIOR Z — MAIN SERVER                             ║
  ╚════════════════════════════════════════════════════════════╝


⚠️━⚠️━⚠️━⚠️━⚠️━⚠️━⚠️━⚠️━⚠️━⚠️━⚠️━⚠️━⚠️━⚠️━⚠️━⚠️━⚠️━⚠️━⚠️━⚠️━⚠️
  🛡️  CONFIG AUDIT  4 issues at startup
⚠️━⚠️━⚠️━⚠️━⚠️━⚠️━⚠️━⚠️━⚠️━⚠️━⚠️━⚠️━⚠️━⚠️━⚠️━⚠️━⚠️━⚠️━⚠️━⚠️━⚠️
   ❌ serverVersion  📭
       📎 impact : Client displays no/wrong version info
       🔧 fix    : config.serverVersion = "2026-05-15"
   ⚠️ sdkUrl  🏠
       📎 impact : SDK-Server authentication will fail
       🔧 fix    : config.sdkUrl = "http://127.0.0.1:9999"
   ⚠️ chatUrl  🏠
       📎 impact : Chat won't work in production (hardcoded localhost)
       🔧 fix    : Use process.env.CHAT_URL or env config
   ⚠️ dungeonUrl  🏠
       📎 impact : Dungeon won't work in production (hardcoded localhost)
       🔧 fix    : Use process.env.DUNGEON_URL or env config
⚠️━⚠️━⚠️━⚠️━⚠️━⚠️━⚠️━⚠️━⚠️━⚠️━⚠️━⚠️━⚠️━⚠️━⚠️━⚠️━⚠️━⚠️━⚠️━⚠️━⚠️


  ──────────────────────────────

🟢 09:41:41.790 INFO  📋 CONFIG   ▸ Resource JSON status:
  ══════════════════════════════════════════════════════════

🟢 09:41:41.791 INFO  ⚙️ HANDLER  ▸ Registered action handlers:

  ├ >> user::enterGame  handlers/user/enterGame.js
  ├ >> user::registChat  handlers/user/registChat.js
  ├ >> user::getBulletinBrief  handlers/user/getBulletinBrief.js
  ├ >> user::readBulletin  handlers/user/readBulletin.js
  ├ >> friend::friendServerAction  handlers/friend/friendServerAction.js
  ├ >> heroImage::getAll  handlers/heroImage/getAll.js
  ├ >> hero::getAttrs  handlers/hero/getAttrs.js
  ├ >> hero::autoLevelUp  handlers/hero/autoLevelUp.js
  ├ >> userMsg::getMsgList  handlers/userMsg/getMsgList.js
  ├ >> userMsg::getMsg  handlers/userMsg/getMsg.js
  ├ >> userMsg::sendMsg  handlers/userMsg/sendMsg.js
  ├ >> userMsg::readMsg  handlers/userMsg/readMsg.js
  ├ >> userMsg::delFriendMsg  handlers/userMsg/delFriendMsg.js
  ├ >> guide::saveGuide  handlers/guide/saveGuide.js
  ├ >> hangup::saveGuideTeam  handlers/hangup/saveGuideTeam.js
  ├ >> hangup::checkBattleResult  handlers/hangup/checkBattleResult.js
  ├ >> hangup::gain  handlers/hangup/gain.js
  ├ >> activity::getActivityBrief  handlers/activity/getActivityBrief.js
  ├ >> buryPoint::guideBattle  handlers/buryPoint/guideBattle.js
  └ >> summon::summonOneFree  handlers/summon/summonOneFree.js


  ──────────────────────────────


🟢 09:41:41.793 INFO  🚀 SERVER   ▸ Ready — listening on http://127.0.0.1:8001
🟢 09:41:41.793 INFO  🚀 SERVER   ▸ Waiting for Socket.IO connections...


  🔗⚡ Client connected  n8xtovlq...  📍 ::ffff:127.0.0.1  📡 polling
🟢 09:41:51.253 INFO  🔐 TEA      ▸ Sending verify challenge
🟢 09:41:51.290 INFO  🔐 TEA      ▸ TEA verification SUCCESS

  📤 user::enterGame        ──────────────────────────────────
🟢 09:41:51.323 INFO  ⚔️ ENTER    ▸ enterGame REQUEST RECEIVED
  [01/10] 🔄 Required fields check  █░░░░░░░░░
  [01/10] ✅ Required fields check  █░░░░░░░░░  All present
  [02/10] 🔄 Token auth via SDK-Server  ██░░░░░░░░
🟢 09:41:51.344 INFO  📡 SDKAPI   ▸ User verified via SDK-Server
  [02/10] ✅ Token auth via SDK-Server  ██░░░░░░░░  22ms ✅
  [03/10] 🔄 ServerId validation  ███░░░░░░░
  [03/10] ✅ ServerId validation  ███░░░░░░░  1 == 1 ✅
  [04/10] 🔄 User existence check  ████░░░░░░
  [04/10] 🌟 User existence check  ████░░░░░░  NEW USER 🌟
  [05/10] 🔄 Build user data  █████░░░░░
🟢 09:41:51.371 INFO  📋 CONFIG   ▸ Resource loaded: thingsID.json
  [05/10] ✅ Build user data  █████░░░░░  100 keys (42ms)
  [06/10] 🔄 Circular reference check  ██████░░░░
  [06/10] ✅ Circular reference check  ██████░░░░  0 circular refs ✅
  [07/10] 🔄 Structure validation  ███████░░░

  🔒 CRITICAL FIELDS AUDIT — game will crash/stuck if wrong
  ├ 🔒 lastTeam[9]._team        = {0}  EMPTY — tutorial safe (guide 2106)
  ├ 🔒 training._award          = null  present — FIX-001 safe
  ├ 🔒 user._attribute._items[104] = present  Level=1
  ├ 🔒 imprint._items           = Object{}  FIX-005: client L114925 uses for...in → needs Object
  ├ 🔒 weapon._items            = Object{}  FIX-005: client L130938 uses for...in → needs Object
  └ 🔒 genki._items             = Object{}  FIX-005: client L132158 uses for...in → needs Object
  ✅ CRITICAL AUDIT: 6/6 PASSED
  [07/10] ✅ Structure validation  ███████░░░  100 keys audited
  [08/10] 🔄 JSON serialization test  ████████░░
  [08/10] ✅ JSON serialization test  ████████░░  OK (10,115 bytes)
  [09/10] 🔄 Database save  █████████░
[DB] saveUser("guest_4d1443..."): 100 keys, 10115 bytes
  [09/10] ✅ Database save  █████████░  6ms 💾
  [10/10] 🔄 Response build  ██████████
  [10/10] ✅ Response build  ██████████  OK 📤

⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔
🏏️ ----  ✅ UNKNOWN  🏁 COMPLETE  ⚡ 145ms  📏 LZ 2397 chars
⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔
   👤 USER ....... guest_4d1443a866473f4d  New User
   🦸 HEROES ..... 1
   🏆 LEVEL ...... 1
   💎 DIAMOND .... 0
   📦 FIELDS ..... 100
   📏 JSON SIZE .. 10,115 chars
   📦 RESP SIZE .. 2,397 chars  (📉 LZ -76%)
   ⏱️  TOTAL ..... 145ms  ██████████████

   🔒 CRITICAL ... 6/6 ✅
⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔

  ┌ 📸 ENTER GAME ret=0 ──────────────────────────────────────┐
  ├   user                         Object{20}
  ├   heros                        Object{4}
  ├   hangup                       Object{16}
  ├   totalProps                   Object{1}
  ├   backpackLevel                1
  ├   imprint                      Object{2}
  ├   weapon                       Object{2}
  ├   summon                       Object{7}
  ├   dungeon                      Object{2}
  ├   equip                        Object{2}
  ├   scheduleInfo                 Object{53}
  ├   timesInfo                    Object{12}
  ├   serverVersion                ""
  ├   serverId                     1
  ├   serverOpenDate               1779010901648
  ├   newUser                      true
  ├   currency                     "USD"
  ├   lastTeam                     Object{2}
  ├   superSkill                   Object{2}
  ├   giftInfo                     Object{11}
  ├   guide                        Object{2}
  ├   userGuild                    Object{3}
  ├   userGuildPub                 Object{8}
  ├   expedition                   Object{7}
  ├   retrieve                     Object{7}
  ├   battleMedal                  Object{11}
  ├   training                     Object{9}
  ├   heroSkin                     Object{3}
  ├   userWar                      Object{9}
  ├   userBallWar                  Object{6}
  ├   headEffect                   Object{4}
  ├   userTopBattle                Object{10}
  ├   topBattleInfo                Object{4}
  ├   checkin                      Object{5}
  ├   curMainTask                  Object{0}
  ├   summonLog                    Array[0] ⚠️ EMPTY
  ├   vipLog                       Array[0] ⚠️ EMPTY
  ├   cardLog                      Array[0] ⚠️ EMPTY
  ├   onlineBulletin               Array[0] ⚠️ EMPTY
  ├   broadcastRecord              Array[0] ⚠️ EMPTY
  ├   blacklist                    Object{0}
  ├   forbiddenChat                Object{2}
  ├   guildLevel                   0
  ├   guildTreasureMatchRet        0
  ├   dragonEquiped                Object{0}
  ├   warInfo                      null ⚠️ NULL
  ├   ballWarState                 0
  ├   enableShowQQ                 false
  ├   showQQVip                    0
  ├   showQQ                       0
  ├   showQQImg1                   ""
  ├   showQQImg2                   ""
  ├   showQQUrl                    ""
  ├   cellgameHaveSetHero          false
  ├   globalWarBuffTag             ""
  ├   globalWarLastRank            Object{0}
  ├   globalWarBuff                0
  ├   globalWarBuffEndTime         0
  ├   guildName                    ""
  ├   guildActivePoints            Object{0}
  ├   ballBroadcast                null ⚠️ NULL
  ├   ballWarInfo                  Object{4}
  ├   teamTraining                 Object{4}
  ├   teamServerHttpUrl            ""
  ├   teamDungeonOpenTime          0
  ├   teamDungeonTask              Object{3}
  ├   teamDungeonSplBcst           null ⚠️ NULL
  ├   teamDungeonNormBcst          null ⚠️ NULL
  ├   teamDungeonHideInfo          null ⚠️ NULL
  ├   teamDungeon                  Object{3}
  ├   teamDungeonInvitedFriends    null ⚠️ NULL
  ├   myTeamServerSocketUrl        "http://127.0.0.1:8003"
  ├   shopNewHeroes                Object{0}
  ├   channelSpecial               Object{15}
  ├   hideHeroes                   Array[0] ⚠️ EMPTY
  ├   templeLess                   0
  ├   timeTrial                    Object{9}
  ├   timeTrialNextOpenTime        0
  ├   YouTuberRecruit              Object{7}
  ├   userYouTuberRecruit          Object{2}
  ├   heroImageVersion             0
  ├   superImageVersion            0
  ├   karinStartTime               0
  ├   karinEndTime                 0
  ├   timeBonusInfo                Object{2}
  ├   monthCard                    Object{2}
  ├   recharge                     Object{2}
  ├   userDownloadReward           Object{4}
  ├   clickSystem                  Object{2}
  ├   questionnaires               null ⚠️ NULL
  ├   littleGame                   Object{3}
  ├   genki                        Object{4}
  ├   gemstone                     Object{1}
  ├   resonance                    Object{6}
  ├   fastTeam                     Object{1}
  ├   gravity                      Object{0}
  ├   timeMachine                  Object{1}
  ├   _arenaTeam                   null ⚠️ NULL
  ├   _arenaSuper                  null ⚠️ NULL
  └   mergedServers                Array[0] ⚠️ EMPTY
  └──────────────────────────────────────────────────────────┘


  ┌──────────────────────────────────────────────────────────────┐
  │  ❌ FATAL ERROR AT STEP RESPONSE TYPE SCAN                  │
  │                                                              │
  │  STEP:   ENTER                                               │
  │  REASON: userData.serverId expected string but got number    │
  │  DETAIL: UserDataParser reads these fields on client         │
  │                                                              │
  │  IMPACT:  Client crash or silent data loss                    │
  │  FIX:     Check buildNewUserData or updateExistingUser        │
  │                                                              │
  └──────────────────────────────────────────────────────────────┘

✅ user::enterGame        OK     ────────────────────────────
  └ ret=0 2397 chars (LZ) 156ms

  ✅ SUCCESS  📏 data= 2397 chars  📦 proto= LZ-STRING  ⏱️ time= 156ms

  └ ⏱️ handler: 156ms █

  📤 user::getBulletinBrief ──────────────────────────────────

⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔
🏏️ ---- 📨 user/getBulletinBrief 👤 guest_4d1443a866473f4d
⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔

  ┌───────────────────────────────────────────────┐
│ 📍 1  ⚡ ENTRY CHECKms                           │
  └────────────────────────────────────────────────┘
  [01/02] 🔄 Validate request fields  █░
  [01/02] ✅ Validate request fields  █░  userId OK

  ┌───────────────────────────────────────────────┐
│ 📍 2  ⚡ DATA INJECTION CHECKms                  │
  └────────────────────────────────────────────────┘
  [01/01] 🔄 Load global bulletin data  █
  [01/01] ✅ Load global bulletin data  █  0 entries loaded

  ┌───────────────────────────────────────────────┐
│ 📍 3  ⚡ DEEP TYPE SCANms                        │
  └────────────────────────────────────────────────┘
  [01/01] 🔄 Type assert request fields  █
  [01/01] ✅ Type assert request fields  █  type verified

  ┌───────────────────────────────────────────────┐
│ 📍 4  ⚡ PLAYER STATE SNAPSHOTms                 │
  └────────────────────────────────────────────────┘
  [01/01] 🔄 Snapshot bulletin state  █
  [01/01] ✅ Snapshot bulletin state  █  0 bulletins in global store

  ┌───────────────────────────────────────────────┐
│ 📍 5  ⚡ INVARIANT CHECKms                       │
  └────────────────────────────────────────────────┘
  [01/02] 🔄 Validate business rules  █░
  [01/02] ✅ Validate business rules  █░  invariants checked

  ┌───────────────────────────────────────────────┐
│ 📍 6  ⚡ MAIN PROCESSms                          │
  └────────────────────────────────────────────────┘
  [01/01] 🔄 Build _brief object (strip body field)  █
  [01/01] ✅ Build _brief object (strip body field)  █  0 bulletins (body stripped)

  ┌───────────────────────────────────────────────┐
│ 📍 7  ⚡ MUTATION LOGms                          │
  └────────────────────────────────────────────────┘

  ┌───────────────────────────────────────────────┐
│ 📍 8  ⚡ SAVE VERIFYms                           │
  └────────────────────────────────────────────────┘

  ┌───────────────────────────────────────────────┐
│ 📍 9  ⚡ RESPONSE SNAPSHOTms                     │
  └────────────────────────────────────────────────┘

  🔒 CRITICAL FIELDS AUDIT — game will crash/stuck if wrong
  └ 🔒 _brief                   = Object{0}  L121094: for(var o in n._brief) iterates each bulletin
  ✅ CRITICAL AUDIT: 1/1 PASSED

  ┌ 📸 getBulletinBrief ret=0 ────────────────────────────────┐
  └   _brief                       Object{0}
  └──────────────────────────────────────────────────────────┘


  ┌───────────────────────────────────────────────┐
│ 📍 10  ⚡ EXECUTION SUMMARYms                    │
  └────────────────────────────────────────────────┘

⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔
🏏️ ----  ✅ UNKNOWN  🏁 COMPLETE
⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔
   👤 USER ....... guest_4d1443a866473f4d
⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔
✅ user::getBulletinBrief OK     ────────────────────────────
  └ ret=0 13 chars (raw) 7ms

  ✅ SUCCESS  📏 data= 13 chars  📦 proto= RAW  ⏱️ time= 7ms

  └ ⏱️ handler: 7ms 

  📤 friend::friendServerAction ──────────────────────────────────
  [01/02] 🔄 Route relay action  █░
  [01/02] ✅ Route relay action  █░  relayAction="${relayAction}"
  [02/02] 🔄 Handle queryFriends  ██
  [02/02] ✅ Handle queryFriends  ██  0 friends
✅ friend::friendServerAction OK     ────────────────────────────
  └ ret=0 12 chars (raw) 8ms

  ✅ SUCCESS  📏 data= 12 chars  📦 proto= RAW  ⏱️ time= 8ms

  └ ⏱️ handler: 8ms 

  📤 friend::friendServerAction ──────────────────────────────────
  [01/02] 🔄 Route relay action  █░
  [01/02] ✅ Route relay action  █░  relayAction="${relayAction}"
  [02/02] 🔄 Handle queryBlackList  ██
  [02/02] ✅ Handle queryBlackList  ██  0 entries
✅ friend::friendServerAction OK     ────────────────────────────
  └ ret=0 12 chars (raw) 3ms

  ✅ SUCCESS  📏 data= 12 chars  📦 proto= RAW  ⏱️ time= 3ms

  └ ⏱️ handler: 4ms 

  📤 heroImage::getAll      ──────────────────────────────────

⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔
🏏️ ---- 📨 heroImage/getAll 👤 guest_4d1443a866473f4d
⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔

  ┌───────────────────────────────────────────────┐
│ 📍 1  ⚡ ENTRY CHECKms                           │
  └────────────────────────────────────────────────┘
  [01/02] 🔄 Validate request fields  █░
  [01/02] ✅ Validate request fields  █░  userId OK

  ┌───────────────────────────────────────────────┐
│ 📍 2  ⚡ DATA INJECTION CHECKms                  │
  └────────────────────────────────────────────────┘
  [01/01] 🔄 Load userData from DB  █
  [01/01] ✅ Load userData from DB  █  userData loaded

  ┌───────────────────────────────────────────────┐
│ 📍 3  ⚡ DEEP TYPE SCANms                        │
  └────────────────────────────────────────────────┘
  [01/01] 🔄 Type assert request fields  █
  [01/01] ✅ Type assert request fields  █  type verified

  ┌───────────────────────────────────────────────┐
│ 📍 4  ⚡ PLAYER STATE SNAPSHOTms                 │
  └────────────────────────────────────────────────┘
  [01/01] 🔄 Snapshot hero collection state  █
  [01/01] ✅ Snapshot hero collection state  █  1 heroes in collection

  ┌───────────────────────────────────────────────┐
│ 📍 5  ⚡ INVARIANT CHECKms                       │
  └────────────────────────────────────────────────┘
  [01/02] 🔄 Validate business rules  █░
  [01/02] ✅ Validate business rules  █░  invariants checked

  ┌───────────────────────────────────────────────┐
│ 📍 6  ⚡ MAIN PROCESSms                          │
  └────────────────────────────────────────────────┘
  [01/01] 🔄 Build hero image data  █
  [01/01] ✅ Build hero image data  █  1 hero(es)

  ┌───────────────────────────────────────────────┐
│ 📍 7  ⚡ MUTATION LOGms                          │
  └────────────────────────────────────────────────┘

  ┌───────────────────────────────────────────────┐
│ 📍 8  ⚡ SAVE VERIFYms                           │
  └────────────────────────────────────────────────┘

  ┌───────────────────────────────────────────────┐
│ 📍 9  ⚡ RESPONSE SNAPSHOTms                     │
  └────────────────────────────────────────────────┘

  🔒 CRITICAL FIELDS AUDIT — game will crash/stuck if wrong
  └ 🔒 _heros                   = Object{1}  L134363: for(var n in e._heros) → Object, each has _id/_maxLevel/_selfComments
  ✅ CRITICAL AUDIT: 1/1 PASSED

  ┌ 📸 getAll ret=0 ──────────────────────────────────────────┐
  └   _heros                       Object{1}
  └──────────────────────────────────────────────────────────┘


  ┌───────────────────────────────────────────────┐
│ 📍 10  ⚡ EXECUTION SUMMARYms                    │
  └────────────────────────────────────────────────┘

⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔
🏏️ ----  ✅ UNKNOWN  🏁 COMPLETE
⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔
   👤 USER ....... guest_4d1443a866473f4d
   📦 FIELDS ..... 1
⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔
✅ heroImage::getAll      OK     ────────────────────────────
  └ ret=0 97 chars (raw) 7ms

  ✅ SUCCESS  📏 data= 97 chars  📦 proto= RAW  ⏱️ time= 7ms

  └ ⏱️ handler: 8ms 

  📤 hero::getAttrs         ──────────────────────────────────

⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔
🏏️ ---- 📨 hero/getAttrs 👤 guest_4d1443a866473f4d
⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔

  ┌───────────────────────────────────────────────┐
│ 📍 1  ⚡ ENTRY CHECKms                           │
  └────────────────────────────────────────────────┘
  [01/02] 🔄 Validate request fields  █░
  [01/02] ✅ Validate request fields  █░  1 hero(es) requested

  ┌───────────────────────────────────────────────┐
│ 📍 2  ⚡ DATA INJECTION CHECKms                  │
  └────────────────────────────────────────────────┘
  [01/01] 🔄 Load userData from DB  █
  [01/01] ✅ Load userData from DB  █  userData loaded

  ┌───────────────────────────────────────────────┐
│ 📍 3  ⚡ DEEP TYPE SCANms                        │
  └────────────────────────────────────────────────┘
  [01/02] 🔄 Type assert request fields  █░
  [01/02] ✅ Type assert request fields  █░  types verified

  ┌───────────────────────────────────────────────┐
│ 📍 4  ⚡ PLAYER STATE SNAPSHOTms                 │
  └────────────────────────────────────────────────┘
  [01/01] 🔄 Snapshot hero request vs found  █
  [01/01] ✅ Snapshot hero request vs found  █  1/1 heroes found

  ┌───────────────────────────────────────────────┐
│ 📍 5  ⚡ INVARIANT CHECKms                       │
  └────────────────────────────────────────────────┘
  [01/01] 🔄 Validate hero availability  █
  [01/01] ✅ Validate hero availability  █  all heroes found

  ┌───────────────────────────────────────────────┐
│ 📍 6  ⚡ MAIN PROCESSms                          │
  └────────────────────────────────────────────────┘
  [01/01] 🔄 Calculate hero attributes  █
  [01/01] ✅ Calculate hero attributes  █  1 heroes calculated

  ┌───────────────────────────────────────────────┐
│ 📍 7  ⚡ MUTATION LOGms                          │
  └────────────────────────────────────────────────┘

  ┌───────────────────────────────────────────────┐
│ 📍 8  ⚡ SAVE VERIFYms                           │
  └────────────────────────────────────────────────┘

  ┌───────────────────────────────────────────────┐
│ 📍 9  ⚡ RESPONSE SNAPSHOTms                     │
  └────────────────────────────────────────────────┘

  🔒 CRITICAL FIELDS AUDIT — game will crash/stuck if wrong
  ├ 🔒 _attrs                   = Object{1}  L133726: for(var o in t._attrs) — keyed by hero index, each has _items with calculated attrs
  ├ 🔒 _baseAttrs               = Object{1}  L133731: t._baseAttrs[o] — keyed by hero index, each has _items with base attrs (before talent)
  └ 🔒 POWER (attr 21)          = calculated per hero  L133821: 21==p._id → heroBaseAttr.power = floor(num)
  ✅ CRITICAL AUDIT: 3/3 PASSED

  ┌ 📸 getAttrs ret=0 ────────────────────────────────────────┐
  ├   _attrs                       Object{1}
  └   _baseAttrs                   Object{1}
  └──────────────────────────────────────────────────────────┘


  ┌───────────────────────────────────────────────┐
│ 📍 10  ⚡ EXECUTION SUMMARYms                    │
  └────────────────────────────────────────────────┘

⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔
🏏️ ----  ✅ UNKNOWN  🏁 COMPLETE
⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔
   👤 USER ....... guest_4d1443a866473f4d
   📦 FIELDS ..... 2
⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔
✅ hero::getAttrs         OK     ────────────────────────────
  └ ret=0 394 chars (raw) 10ms

  ✅ SUCCESS  📏 data= 394 chars  📦 proto= RAW  ⏱️ time= 10ms

  └ ⏱️ handler: 11ms 

  📤 userMsg::getMsgList    ──────────────────────────────────

⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔
🏏️ ---- 📨 userMsg/getMsgList 👤 guest_4d1443a866473f4d
⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔

  ┌───────────────────────────────────────────────┐
│ 📍 1  ⚡ ENTRY CHECKms                           │
  └────────────────────────────────────────────────┘
  [01/02] 🔄 Validate request fields  █░
  [01/02] ✅ Validate request fields  █░  userId OK

  ┌───────────────────────────────────────────────┐
│ 📍 2  ⚡ DATA INJECTION CHECKms                  │
  └────────────────────────────────────────────────┘
  [01/01] 🔄 Load userData from DB  █
  [01/01] ✅ Load userData from DB  █  userData loaded

  ┌───────────────────────────────────────────────┐
│ 📍 3  ⚡ DEEP TYPE SCANms                        │
  └────────────────────────────────────────────────┘
  [01/01] 🔄 Type assert request fields  █
  [01/01] ✅ Type assert request fields  █  type verified

  ┌───────────────────────────────────────────────┐
│ 📍 4  ⚡ PLAYER STATE SNAPSHOTms                 │
  └────────────────────────────────────────────────┘
  [01/01] 🔄 Snapshot message brief state  █
  [01/01] ✅ Snapshot message brief state  █  0 message entries

  ┌───────────────────────────────────────────────┐
│ 📍 5  ⚡ INVARIANT CHECKms                       │
  └────────────────────────────────────────────────┘
  [01/01] 🔄 Validate data integrity  █
  [01/01] ✅ Validate data integrity  █  valid object

  ┌───────────────────────────────────────────────┐
│ 📍 6  ⚡ MAIN PROCESSms                          │
  └────────────────────────────────────────────────┘
  [01/01] 🔄 Return storedBrief directly  █
  [01/01] ✅ Return storedBrief directly  █  0 entries returned as-is

  ┌───────────────────────────────────────────────┐
│ 📍 7  ⚡ MUTATION LOGms                          │
  └────────────────────────────────────────────────┘

  ┌───────────────────────────────────────────────┐
│ 📍 8  ⚡ SAVE VERIFYms                           │
  └────────────────────────────────────────────────┘

  ┌───────────────────────────────────────────────┐
│ 📍 9  ⚡ RESPONSE SNAPSHOTms                     │
  └────────────────────────────────────────────────┘

  🔒 CRITICAL FIELDS AUDIT — game will crash/stuck if wrong
  └ 🔒 _brief                   = Object{0}  L121134: setMessageFriendSimpleList iterates e[n].userInfo → UserSimpleInfo.deserialize
  ✅ CRITICAL AUDIT: 1/1 PASSED

  ┌ 📸 getMsgList ret=0 ──────────────────────────────────────┐
  └   _brief                       Object{0}
  └──────────────────────────────────────────────────────────┘


  ┌───────────────────────────────────────────────┐
│ 📍 10  ⚡ EXECUTION SUMMARYms                    │
  └────────────────────────────────────────────────┘

⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔
🏏️ ----  ✅ UNKNOWN  🏁 COMPLETE
⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔
   👤 USER ....... guest_4d1443a866473f4d
   📦 FIELDS ..... 1
⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔
✅ userMsg::getMsgList    OK     ────────────────────────────
  └ ret=0 13 chars (raw) 6ms

  ✅ SUCCESS  📏 data= 13 chars  📦 proto= RAW  ⏱️ time= 6ms

  └ ⏱️ handler: 6ms 

  📤 user::registChat       ──────────────────────────────────

⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔
🏏️ ---- 📨 user/registChat 👤 guest_4d1443a866473f4d
⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔

  ┌───────────────────────────────────────────────┐
│ 📍 1  ⚡ ENTRY CHECKms                           │
  └────────────────────────────────────────────────┘
🟢 09:41:56.638 INFO  ⚪ REGIST_CHAT ▸ registChat REQUEST RECEIVED
🟢 09:41:56.638 INFO  ⚪ REGIST_CHAT ▸ Entry check PASS — userId=guest_4d1443a866...

  ┌───────────────────────────────────────────────┐
│ 📍 2  ⚡ DATA INJECTION CHECKms                  │
  └────────────────────────────────────────────────┘
🟢 09:41:56.638 INFO  ⚪ REGIST_CHAT ▸ Loading config for chat registration
🟢 09:41:56.639 INFO  ⚪ REGIST_CHAT ▸ Config loaded — chatUrl and serverId resolved

  ┌───────────────────────────────────────────────┐
│ 📍 3  ⚡ DEEP TYPE SCANms                        │
  └────────────────────────────────────────────────┘

  ┌───────────────────────────────────────────────┐
│ 📍 4  ⚡ PLAYER STATE SNAPSHOTms                 │
  └────────────────────────────────────────────────┘
🟢 09:41:56.639 INFO  ⚪ REGIST_CHAT ▸ Loading player state for guild/room context

  ┌───────────────────────────────────────────────┐
│ 📍 5  ⚡ INVARIANT CHECKms                       │
  └────────────────────────────────────────────────┘

  ┌───────────────────────────────────────────────┐
│ 📍 6  ⚡ MAIN PROCESSms                          │
  └────────────────────────────────────────────────┘
🟢 09:41:56.640 INFO  ⚪ REGIST_CHAT ▸ Building chat registration response (6 fields)
🟢 09:41:56.640 INFO  ⚪ REGIST_CHAT ▸ Response fields built — 6 fields total

  ┌───────────────────────────────────────────────┐
│ 📍 7  ⚡ MUTATION LOGms                          │
  └────────────────────────────────────────────────┘
🟢 09:41:56.640 INFO  ⚪ REGIST_CHAT ▸ No data mutations (configuration handler)

  ┌───────────────────────────────────────────────┐
│ 📍 8  ⚡ SAVE VERIFYms                           │
  └────────────────────────────────────────────────┘
🟢 09:41:56.640 INFO  ⚪ REGIST_CHAT ▸ No DB save required (configuration handler)

  ┌───────────────────────────────────────────────┐
│ 📍 9  ⚡ RESPONSE SNAPSHOTms                     │
  └────────────────────────────────────────────────┘

  🔒 CRITICAL FIELDS AUDIT — game will crash/stuck if wrong
  ├ 🔒 _success                 = true  L114470: n._success ? connect chat : retry every 3s (max 15)
  ├ 🔒 _chatServerUrl           = http://127.0.0.1:8002  L114480→L82537: io.connect(url) — MUST be full URL
  ├ 🔒 _worldRoomId             = world_1  L114566: chatJoinRequest(worldRoomId) — ALWAYS joined after login
  ├ 🔒 _guildRoomId             = (undefined)  L114568: if(guildRoomId) join — undefined = skip (no guild)
  ├ 🔒 _teamDungeonChatRoom     = (undefined)  L114579: if(teamDungeonChatRoom) join — undefined = skip
  └ 🔒 _teamChatRoom            = (undefined)  L114590: if(teamChatRoomId) join — undefined = skip (no team)
  ✅ CRITICAL AUDIT: 6/6 PASSED

  ┌ 📸 registChat ret=0 ──────────────────────────────────────┐
  ├   _success                     true
  ├   _chatServerUrl               "http://127.0.0.1:8002"
  └   _worldRoomId                 "world_1"
  └──────────────────────────────────────────────────────────┘


  ┌───────────────────────────────────────────────┐
│ 📍 10  ⚡ EXECUTION SUMMARYms                    │
  └────────────────────────────────────────────────┘

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


⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔
🏏️ ----  ✅ UNKNOWN  🏁 COMPLETE  ⚡ 2ms
⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔
   👤 USER ....... guest_4d1443a866473f4d
   📦 FIELDS ..... 6
   ⏱️  TOTAL ..... 2ms  
⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔
✅ user::registChat       OK     ────────────────────────────
  └ ret=0 83 chars (raw) 6ms

  ✅ SUCCESS  📏 data= 83 chars  📦 proto= RAW  ⏱️ time= 6ms

  └ ⏱️ handler: 6ms 

  📤 guide::saveGuide       ──────────────────────────────────

⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔
🏏️ ---- 📨 guide/saveGuide 👤 guest_4d1443a866473f4d
⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔

  ┌───────────────────────────────────────────────┐
│ 📍 1  ⚡ ENTRY CHECKms                           │
  └────────────────────────────────────────────────┘
  [01/03] 🔄 Validate request fields  █░░
  [01/03] ✅ Validate request fields  █░░  type=2 step=2102

  ┌───────────────────────────────────────────────┐
│ 📍 2  ⚡ DATA INJECTION CHECKms                  │
  └────────────────────────────────────────────────┘
  [01/01] 🔄 Load userData from DB  █
  [01/01] ✅ Load userData from DB  █  userData loaded

  ┌───────────────────────────────────────────────┐
│ 📍 3  ⚡ DEEP TYPE SCANms                        │
  └────────────────────────────────────────────────┘
  [01/02] 🔄 Type assert request fields  █░
  [01/02] ✅ Type assert request fields  █░  all types verified

  ┌───────────────────────────────────────────────┐
│ 📍 4  ⚡ PLAYER STATE SNAPSHOTms                 │
  └────────────────────────────────────────────────┘
  [01/01] 🔄 Snapshot guide._steps before modification  █
  [01/01] ✅ Snapshot guide._steps before modification  █  guide._steps[2] was (none)

  ┌───────────────────────────────────────────────┐
│ 📍 5  ⚡ INVARIANT CHECKms                       │
  └────────────────────────────────────────────────┘
  [01/02] 🔄 Validate business rules  █░
  [01/02] ✅ Validate business rules  █░  invariants checked

  ┌───────────────────────────────────────────────┐
│ 📍 6  ⚡ MAIN PROCESSms                          │
  └────────────────────────────────────────────────┘
  [01/01] 🔄 Update guide._steps  █
  [01/01] ✅ Update guide._steps  █  guide._steps[2] = 2102

  ┌───────────────────────────────────────────────┐
│ 📍 7  ⚡ MUTATION LOGms                          │
  └────────────────────────────────────────────────┘

  ┌───────────────────────────────────────────────┐
│ 📍 8  ⚡ SAVE VERIFYms                           │
  └────────────────────────────────────────────────┘
[DB] saveUser("guest_4d1443..."): 100 keys, 10123 bytes

  ┌───────────────────────────────────────────────┐
│ 📍 9  ⚡ RESPONSE SNAPSHOTms                     │
  └────────────────────────────────────────────────┘

  ┌ 📸 saveGuide ret=0 ───────────────────────────────────────┐
  └──────────────────────────────────────────────────────────┘


  ┌───────────────────────────────────────────────┐
│ 📍 10  ⚡ EXECUTION SUMMARYms                    │
  └────────────────────────────────────────────────┘

⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔
🏏️ ----  ✅ UNKNOWN  🏁 COMPLETE
⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔
   👤 USER ....... guest_4d1443a866473f4d
⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔
✅ guide::saveGuide       OK     ────────────────────────────
  └ ret=0 2 chars (raw) 31ms

  ✅ SUCCESS  📏 data= 2 chars  📦 proto= RAW  ⏱️ time= 31ms

  └ ⏱️ handler: 32ms 

  📤 guide::saveGuide       ──────────────────────────────────

⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔
🏏️ ---- 📨 guide/saveGuide 👤 guest_4d1443a866473f4d
⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔

  ┌───────────────────────────────────────────────┐
│ 📍 1  ⚡ ENTRY CHECKms                           │
  └────────────────────────────────────────────────┘
  [01/03] 🔄 Validate request fields  █░░
  [01/03] ✅ Validate request fields  █░░  type=2 step=2107

  ┌───────────────────────────────────────────────┐
│ 📍 2  ⚡ DATA INJECTION CHECKms                  │
  └────────────────────────────────────────────────┘
  [01/01] 🔄 Load userData from DB  █
  [01/01] ✅ Load userData from DB  █  userData loaded

  ┌───────────────────────────────────────────────┐
│ 📍 3  ⚡ DEEP TYPE SCANms                        │
  └────────────────────────────────────────────────┘
  [01/02] 🔄 Type assert request fields  █░
  [01/02] ✅ Type assert request fields  █░  all types verified

  ┌───────────────────────────────────────────────┐
│ 📍 4  ⚡ PLAYER STATE SNAPSHOTms                 │
  └────────────────────────────────────────────────┘
  [01/01] 🔄 Snapshot guide._steps before modification  █
  [01/01] ✅ Snapshot guide._steps before modification  █  guide._steps[2] was 2102

  ┌───────────────────────────────────────────────┐
│ 📍 5  ⚡ INVARIANT CHECKms                       │
  └────────────────────────────────────────────────┘
  [01/02] 🔄 Validate business rules  █░
  [01/02] ✅ Validate business rules  █░  invariants checked

  ┌───────────────────────────────────────────────┐
│ 📍 6  ⚡ MAIN PROCESSms                          │
  └────────────────────────────────────────────────┘
  [01/01] 🔄 Update guide._steps  █
  [01/01] ✅ Update guide._steps  █  guide._steps[2] = 2107

  ┌───────────────────────────────────────────────┐
│ 📍 7  ⚡ MUTATION LOGms                          │
  └────────────────────────────────────────────────┘

  ┌───────────────────────────────────────────────┐
│ 📍 8  ⚡ SAVE VERIFYms                           │
  └────────────────────────────────────────────────┘
[DB] saveUser("guest_4d1443..."): 100 keys, 10123 bytes

  ┌───────────────────────────────────────────────┐
│ 📍 9  ⚡ RESPONSE SNAPSHOTms                     │
  └────────────────────────────────────────────────┘

  ┌ 📸 saveGuide ret=0 ───────────────────────────────────────┐
  └──────────────────────────────────────────────────────────┘


  ┌───────────────────────────────────────────────┐
│ 📍 10  ⚡ EXECUTION SUMMARYms                    │
  └────────────────────────────────────────────────┘

⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔
🏏️ ----  ✅ UNKNOWN  🏁 COMPLETE
⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔
   👤 USER ....... guest_4d1443a866473f4d
⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔
✅ guide::saveGuide       OK     ────────────────────────────
  └ ret=0 2 chars (raw) 11ms

  ✅ SUCCESS  📏 data= 2 chars  📦 proto= RAW  ⏱️ time= 11ms

  └ ⏱️ handler: 11ms 

  📤 hangup::saveGuideTeam  ──────────────────────────────────
  [01/02] 🔄 Save guide team  █░
  [01/02] ✅ Save guide team  █░  team=5 heroes
  [02/02] 🔄 Persist team data  ██
[DB] saveUser("guest_4d1443..."): 101 keys, 10238 bytes
  [02/02] ✅ Persist team data  ██  saved to DB
✅ hangup::saveGuideTeam  OK     ────────────────────────────
  └ ret=0 2 chars (raw) 9ms

  ✅ SUCCESS  📏 data= 2 chars  📦 proto= RAW  ⏱️ time= 9ms

  └ ⏱️ handler: 9ms 

  📤 hangup::checkBattleResult ──────────────────────────────────

⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔
🏏️ ---- 📨 hangup/checkBattleResult 👤 guest_4d1443a866473f4d
⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔

  ┌───────────────────────────────────────────────┐
│ 📍 1  ⚡ ENTRY CHECKms                           │
  └────────────────────────────────────────────────┘
  [01/10] 🔄 Validate request  █░░░░░░░░░
  [01/10] ✅ Validate request  █░░░░░░░░░

  ┌───────────────────────────────────────────────┐
│ 📍 2  ⚡ DATA INJECTION CHECKms                  │
  └────────────────────────────────────────────────┘
  [02/10] 🔄 Load data  ██░░░░░░░░
🟢 09:42:00.456 INFO  📋 CONFIG   ▸ Resource loaded: lesson.json
  [02/10] ✅ Load data  ██░░░░░░░░  lesson.json=611 entries

  ┌───────────────────────────────────────────────┐
│ 📍 3  ⚡ PLAYER STATE SNAPSHOTms                 │
  └────────────────────────────────────────────────┘
  [03/10] 🔄 Read progress  ███░░░░░░░
  [03/10] ✅ Read progress  ███░░░░░░░  lesson=10101

  ┌───────────────────────────────────────────────┐
│ 📍 4  ⚡ INVARIANT CHECKms                       │
  └────────────────────────────────────────────────┘
  [04/10] 🔄 Determine outcome  ████░░░░░░
  [04/10] ✅ Determine outcome  ████░░░░░░  WIN (0)

  ┌───────────────────────────────────────────────┐
│ 📍 5  ⚡ MAIN PROCESSms                          │
  └────────────────────────────────────────────────┘
  [05/10] 🔄 Build response  █████░░░░░
  [05/10] ✅ Build response  █████░░░░░  WIN rewards=5 lesson=10102

  ┌───────────────────────────────────────────────┐
│ 📍 6  ⚡ MUTATION LOGms                          │
  └────────────────────────────────────────────────┘

  ┌───────────────────────────────────────────────┐
│ 📍 7  ⚡ SAVE VERIFYms                           │
  └────────────────────────────────────────────────┘
[DB] saveUser("guest_4d1443..."): 101 keys, 10312 bytes

  ┌───────────────────────────────────────────────┐
│ 📍 8  ⚡ RESPONSE SNAPSHOTms                     │
  └────────────────────────────────────────────────┘

  🔒 CRITICAL FIELDS AUDIT — game will crash/stuck if wrong
  ├ 🔒 _battleResult            = 0  L104882: 0 == e._battleResult -> true (tutorial forced win)
  ├ 🔒 _changeInfo._items       = 5 items  L97686: getBattleAwardItems iterates _changeInfo._items for {_id, _num}
  ├ 🔒 _curLess                 = 10102  L104892/L97751: OnHookSingleton.lastSection = e._curLess
  └ 🔒 _maxPassLesson           = 10101  L104893/L97751: OnHookSingleton.maxPassLesson = e._maxPassLesson
  ✅ CRITICAL AUDIT: 4/4 PASSED

  ┌───────────────────────────────────────────────┐
│ 📍 9  ⚡ DEEP TYPE SCANms                        │
  └────────────────────────────────────────────────┘

  ┌───────────────────────────────────────────────┐
│ 📍 10  ⚡ EXECUTION SUMMARYms                    │
  └────────────────────────────────────────────────┘

⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔
🏏️ ----  ✅ UNKNOWN  🏁 COMPLETE
⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔
   👤 USER ....... guest_4d1443a866473f4d
   📦 FIELDS ..... 4
⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔

  ┌ 📸 CHECK BATTLE RESULT ret=0 ─────────────────────────────┐
  ├   _battleResult                0
  ├   _curLess                     10102
  ├   _maxPassLesson               10101
  └   _changeInfo                  Object{1}
  └──────────────────────────────────────────────────────────┘

✅ hangup::checkBattleResult OK     ────────────────────────────
  └ ret=0 218 chars (raw) 29ms

  ✅ SUCCESS  📏 data= 218 chars  📦 proto= RAW  ⏱️ time= 29ms

  └ ⏱️ handler: 29ms 

  📤 buryPoint::guideBattle ──────────────────────────────────
🟢 09:42:02.119 INFO  ⚪ BURYPOINT ▸ Guide battle analytics received
[DB] saveUser("guest_4d1443..."): 102 keys, 10420 bytes
✅ buryPoint::guideBattle OK     ────────────────────────────
  └ ret=0 2 chars (raw) 8ms

  ✅ SUCCESS  📏 data= 2 chars  📦 proto= RAW  ⏱️ time= 8ms

  └ ⏱️ handler: 8ms 

  📤 buryPoint::guideBattle ──────────────────────────────────
🟢 09:42:12.981 INFO  ⚪ BURYPOINT ▸ Guide battle analytics received
[DB] saveUser("guest_4d1443..."): 102 keys, 10499 bytes
✅ buryPoint::guideBattle OK     ────────────────────────────
  └ ret=0 2 chars (raw) 7ms

  ✅ SUCCESS  📏 data= 2 chars  📦 proto= RAW  ⏱️ time= 7ms

  └ ⏱️ handler: 7ms 

  📤 buryPoint::guideBattle ──────────────────────────────────
🟢 09:42:14.064 INFO  ⚪ BURYPOINT ▸ Guide battle analytics received
[DB] saveUser("guest_4d1443..."): 102 keys, 10576 bytes
✅ buryPoint::guideBattle OK     ────────────────────────────
  └ ret=0 2 chars (raw) 10ms

  ✅ SUCCESS  📏 data= 2 chars  📦 proto= RAW  ⏱️ time= 10ms

  └ ⏱️ handler: 11ms 

  📤 activity::getActivityBrief ──────────────────────────────────
  [01/03] 🔄 Validate request  █░░
  [01/03] ✅ Validate request  █░░
  [02/03] 🔄 Load user data  ██░
  [02/03] ✅ Load user data  ██░
  [03/03] 🔄 Generate activity list  ███
  [03/03] ✅ Generate activity list  ███
✅ activity::getActivityBrief OK     ────────────────────────────
  └ ret=0 334 chars (LZ) 7ms

  ✅ SUCCESS  📏 data= 334 chars  📦 proto= LZ-STRING  ⏱️ time= 7ms

  └ ⏱️ handler: 7ms 

  📤 guide::saveGuide       ──────────────────────────────────

⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔
🏏️ ---- 📨 guide/saveGuide 👤 guest_4d1443a866473f4d
⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔

  ┌───────────────────────────────────────────────┐
│ 📍 1  ⚡ ENTRY CHECKms                           │
  └────────────────────────────────────────────────┘
  [01/03] 🔄 Validate request fields  █░░
  [01/03] ✅ Validate request fields  █░░  type=2 step=2206

  ┌───────────────────────────────────────────────┐
│ 📍 2  ⚡ DATA INJECTION CHECKms                  │
  └────────────────────────────────────────────────┘
  [01/01] 🔄 Load userData from DB  █
  [01/01] ✅ Load userData from DB  █  userData loaded

  ┌───────────────────────────────────────────────┐
│ 📍 3  ⚡ DEEP TYPE SCANms                        │
  └────────────────────────────────────────────────┘
  [01/02] 🔄 Type assert request fields  █░
  [01/02] ✅ Type assert request fields  █░  all types verified

  ┌───────────────────────────────────────────────┐
│ 📍 4  ⚡ PLAYER STATE SNAPSHOTms                 │
  └────────────────────────────────────────────────┘
  [01/01] 🔄 Snapshot guide._steps before modification  █
  [01/01] ✅ Snapshot guide._steps before modification  █  guide._steps[2] was 2107

  ┌───────────────────────────────────────────────┐
│ 📍 5  ⚡ INVARIANT CHECKms                       │
  └────────────────────────────────────────────────┘
  [01/02] 🔄 Validate business rules  █░
  [01/02] ✅ Validate business rules  █░  invariants checked

  ┌───────────────────────────────────────────────┐
│ 📍 6  ⚡ MAIN PROCESSms                          │
  └────────────────────────────────────────────────┘
  [01/01] 🔄 Update guide._steps  █
  [01/01] ✅ Update guide._steps  █  guide._steps[2] = 2206

  ┌───────────────────────────────────────────────┐
│ 📍 7  ⚡ MUTATION LOGms                          │
  └────────────────────────────────────────────────┘

  ┌───────────────────────────────────────────────┐
│ 📍 8  ⚡ SAVE VERIFYms                           │
  └────────────────────────────────────────────────┘
[DB] saveUser("guest_4d1443..."): 102 keys, 10576 bytes

  ┌───────────────────────────────────────────────┐
│ 📍 9  ⚡ RESPONSE SNAPSHOTms                     │
  └────────────────────────────────────────────────┘

  ┌ 📸 saveGuide ret=0 ───────────────────────────────────────┐
  └──────────────────────────────────────────────────────────┘


  ┌───────────────────────────────────────────────┐
│ 📍 10  ⚡ EXECUTION SUMMARYms                    │
  └────────────────────────────────────────────────┘

⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔
🏏️ ----  ✅ UNKNOWN  🏁 COMPLETE
⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔
   👤 USER ....... guest_4d1443a866473f4d
⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔
✅ guide::saveGuide       OK     ────────────────────────────
  └ ret=0 2 chars (raw) 11ms

  ✅ SUCCESS  📏 data= 2 chars  📦 proto= RAW  ⏱️ time= 11ms

  └ ⏱️ handler: 11ms 

  📤 summon::summonOneFree  ──────────────────────────────────
🟢 09:42:19.033 INFO  ⚪ SUMMON-FREE ▸ summonOneFree REQUEST RECEIVED
🟢 09:42:19.038 INFO  📋 CONFIG   ▸ Resource loaded: summonPool.json
🟢 09:42:19.040 INFO  📋 CONFIG   ▸ Resource loaded: summonRandom.json
🟢 09:42:19.040 INFO  ⚪ SUMMON-FREE ▸ Free timer OK — proceeding with summon
🟢 09:42:19.040 INFO  ⚪ SUMMON-FREE ▸ [GUIDE] Predetermined hero: displayId=1309 quality=purple
[DB] saveUser("guest_4d1443..."): 102 keys, 11267 bytes
🟢 09:42:19.047 INFO  ⚪ SUMMON-FREE ▸ User data SAVED
🟢 09:42:19.048 INFO  ⚪ SUMMON-FREE ▸ summonOneFree SUCCESS

⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔
🏏️ ----  ✅ UNKNOWN  🏁 COMPLETE
⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔
   👤 USER ....... guest_4d1443a866473f4d
   📦 FIELDS ..... [object Object]
⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔
✅ summon::summonOneFree  OK     ────────────────────────────
  └ ret=0 767 chars (raw) 16ms

  ✅ SUCCESS  📏 data= 767 chars  📦 proto= RAW  ⏱️ time= 16ms

  └ ⏱️ handler: 17ms 

  📤 hero::getAttrs         ──────────────────────────────────

⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔
🏏️ ---- 📨 hero/getAttrs 👤 guest_4d1443a866473f4d
⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔

  ┌───────────────────────────────────────────────┐
│ 📍 1  ⚡ ENTRY CHECKms                           │
  └────────────────────────────────────────────────┘
  [01/02] 🔄 Validate request fields  █░
  [01/02] ✅ Validate request fields  █░  1 hero(es) requested

  ┌───────────────────────────────────────────────┐
│ 📍 2  ⚡ DATA INJECTION CHECKms                  │
  └────────────────────────────────────────────────┘
  [01/01] 🔄 Load userData from DB  █
  [01/01] ✅ Load userData from DB  █  userData loaded

  ┌───────────────────────────────────────────────┐
│ 📍 3  ⚡ DEEP TYPE SCANms                        │
  └────────────────────────────────────────────────┘
  [01/02] 🔄 Type assert request fields  █░
  [01/02] ✅ Type assert request fields  █░  types verified

  ┌───────────────────────────────────────────────┐
│ 📍 4  ⚡ PLAYER STATE SNAPSHOTms                 │
  └────────────────────────────────────────────────┘
  [01/01] 🔄 Snapshot hero request vs found  █
  [01/01] ✅ Snapshot hero request vs found  █  1/1 heroes found

  ┌───────────────────────────────────────────────┐
│ 📍 5  ⚡ INVARIANT CHECKms                       │
  └────────────────────────────────────────────────┘
  [01/01] 🔄 Validate hero availability  █
  [01/01] ✅ Validate hero availability  █  all heroes found

  ┌───────────────────────────────────────────────┐
│ 📍 6  ⚡ MAIN PROCESSms                          │
  └────────────────────────────────────────────────┘
  [01/01] 🔄 Calculate hero attributes  █
  [01/01] ✅ Calculate hero attributes  █  1 heroes calculated

  ┌───────────────────────────────────────────────┐
│ 📍 7  ⚡ MUTATION LOGms                          │
  └────────────────────────────────────────────────┘

  ┌───────────────────────────────────────────────┐
│ 📍 8  ⚡ SAVE VERIFYms                           │
  └────────────────────────────────────────────────┘

  ┌───────────────────────────────────────────────┐
│ 📍 9  ⚡ RESPONSE SNAPSHOTms                     │
  └────────────────────────────────────────────────┘

  🔒 CRITICAL FIELDS AUDIT — game will crash/stuck if wrong
  ├ 🔒 _attrs                   = Object{1}  L133726: for(var o in t._attrs) — keyed by hero index, each has _items with calculated attrs
  ├ 🔒 _baseAttrs               = Object{1}  L133731: t._baseAttrs[o] — keyed by hero index, each has _items with base attrs (before talent)
  └ 🔒 POWER (attr 21)          = calculated per hero  L133821: 21==p._id → heroBaseAttr.power = floor(num)
  ✅ CRITICAL AUDIT: 3/3 PASSED

  ┌ 📸 getAttrs ret=0 ────────────────────────────────────────┐
  ├   _attrs                       Object{1}
  └   _baseAttrs                   Object{1}
  └──────────────────────────────────────────────────────────┘


  ┌───────────────────────────────────────────────┐
│ 📍 10  ⚡ EXECUTION SUMMARYms                    │
  └────────────────────────────────────────────────┘

⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔
🏏️ ----  ✅ UNKNOWN  🏁 COMPLETE
⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔
   👤 USER ....... guest_4d1443a866473f4d
   📦 FIELDS ..... 2
⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔
✅ hero::getAttrs         OK     ────────────────────────────
  └ ret=0 392 chars (raw) 3ms

  ✅ SUCCESS  📏 data= 392 chars  📦 proto= RAW  ⏱️ time= 3ms

  └ ⏱️ handler: 3ms 

  📤 guide::saveGuide       ──────────────────────────────────

⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔
🏏️ ---- 📨 guide/saveGuide 👤 guest_4d1443a866473f4d
⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔

  ┌───────────────────────────────────────────────┐
│ 📍 1  ⚡ ENTRY CHECKms                           │
  └────────────────────────────────────────────────┘
  [01/03] 🔄 Validate request fields  █░░
  [01/03] ✅ Validate request fields  █░░  type=2 step=2210

  ┌───────────────────────────────────────────────┐
│ 📍 2  ⚡ DATA INJECTION CHECKms                  │
  └────────────────────────────────────────────────┘
  [01/01] 🔄 Load userData from DB  █
  [01/01] ✅ Load userData from DB  █  userData loaded

  ┌───────────────────────────────────────────────┐
│ 📍 3  ⚡ DEEP TYPE SCANms                        │
  └────────────────────────────────────────────────┘
  [01/02] 🔄 Type assert request fields  █░
  [01/02] ✅ Type assert request fields  █░  all types verified

  ┌───────────────────────────────────────────────┐
│ 📍 4  ⚡ PLAYER STATE SNAPSHOTms                 │
  └────────────────────────────────────────────────┘
  [01/01] 🔄 Snapshot guide._steps before modification  █
  [01/01] ✅ Snapshot guide._steps before modification  █  guide._steps[2] was 2206

  ┌───────────────────────────────────────────────┐
│ 📍 5  ⚡ INVARIANT CHECKms                       │
  └────────────────────────────────────────────────┘
  [01/02] 🔄 Validate business rules  █░
  [01/02] ✅ Validate business rules  █░  invariants checked

  ┌───────────────────────────────────────────────┐
│ 📍 6  ⚡ MAIN PROCESSms                          │
  └────────────────────────────────────────────────┘
  [01/01] 🔄 Update guide._steps  █
  [01/01] ✅ Update guide._steps  █  guide._steps[2] = 2210

  ┌───────────────────────────────────────────────┐
│ 📍 7  ⚡ MUTATION LOGms                          │
  └────────────────────────────────────────────────┘

  ┌───────────────────────────────────────────────┐
│ 📍 8  ⚡ SAVE VERIFYms                           │
  └────────────────────────────────────────────────┘
[DB] saveUser("guest_4d1443..."): 102 keys, 11267 bytes

  ┌───────────────────────────────────────────────┐
│ 📍 9  ⚡ RESPONSE SNAPSHOTms                     │
  └────────────────────────────────────────────────┘

  ┌ 📸 saveGuide ret=0 ───────────────────────────────────────┐
  └──────────────────────────────────────────────────────────┘


  ┌───────────────────────────────────────────────┐
│ 📍 10  ⚡ EXECUTION SUMMARYms                    │
  └────────────────────────────────────────────────┘

⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔
🏏️ ----  ✅ UNKNOWN  🏁 COMPLETE
⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔
   👤 USER ....... guest_4d1443a866473f4d
⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔
✅ guide::saveGuide       OK     ────────────────────────────
  └ ret=0 2 chars (raw) 9ms

  ✅ SUCCESS  📏 data= 2 chars  📦 proto= RAW  ⏱️ time= 9ms

  └ ⏱️ handler: 9ms 

  📤 summon::summonOneFree  ──────────────────────────────────
🟢 09:42:22.628 INFO  ⚪ SUMMON-FREE ▸ summonOneFree REQUEST RECEIVED
🟢 09:42:22.629 INFO  ⚪ SUMMON-FREE ▸ Free timer OK — proceeding with summon
🟢 09:42:22.630 INFO  ⚪ SUMMON-FREE ▸ [GUIDE] Predetermined hero: displayId=1206 quality=blue
[DB] saveUser("guest_4d1443..."): 102 keys, 11957 bytes
🟢 09:42:22.635 INFO  ⚪ SUMMON-FREE ▸ User data SAVED
🟢 09:42:22.636 INFO  ⚪ SUMMON-FREE ▸ summonOneFree SUCCESS

⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔
🏏️ ----  ✅ UNKNOWN  🏁 COMPLETE
⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔
   👤 USER ....... guest_4d1443a866473f4d
   📦 FIELDS ..... [object Object]
⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔
✅ summon::summonOneFree  OK     ────────────────────────────
  └ ret=0 767 chars (raw) 8ms

  ✅ SUCCESS  📏 data= 767 chars  📦 proto= RAW  ⏱️ time= 8ms

  └ ⏱️ handler: 8ms 

  📤 hero::getAttrs         ──────────────────────────────────

⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔
🏏️ ---- 📨 hero/getAttrs 👤 guest_4d1443a866473f4d
⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔

  ┌───────────────────────────────────────────────┐
│ 📍 1  ⚡ ENTRY CHECKms                           │
  └────────────────────────────────────────────────┘
  [01/02] 🔄 Validate request fields  █░
  [01/02] ✅ Validate request fields  █░  1 hero(es) requested

  ┌───────────────────────────────────────────────┐
│ 📍 2  ⚡ DATA INJECTION CHECKms                  │
  └────────────────────────────────────────────────┘
  [01/01] 🔄 Load userData from DB  █
  [01/01] ✅ Load userData from DB  █  userData loaded

  ┌───────────────────────────────────────────────┐
│ 📍 3  ⚡ DEEP TYPE SCANms                        │
  └────────────────────────────────────────────────┘
  [01/02] 🔄 Type assert request fields  █░
  [01/02] ✅ Type assert request fields  █░  types verified

  ┌───────────────────────────────────────────────┐
│ 📍 4  ⚡ PLAYER STATE SNAPSHOTms                 │
  └────────────────────────────────────────────────┘
  [01/01] 🔄 Snapshot hero request vs found  █
  [01/01] ✅ Snapshot hero request vs found  █  1/1 heroes found

  ┌───────────────────────────────────────────────┐
│ 📍 5  ⚡ INVARIANT CHECKms                       │
  └────────────────────────────────────────────────┘
  [01/01] 🔄 Validate hero availability  █
  [01/01] ✅ Validate hero availability  █  all heroes found

  ┌───────────────────────────────────────────────┐
│ 📍 6  ⚡ MAIN PROCESSms                          │
  └────────────────────────────────────────────────┘
  [01/01] 🔄 Calculate hero attributes  █
  [01/01] ✅ Calculate hero attributes  █  1 heroes calculated

  ┌───────────────────────────────────────────────┐
│ 📍 7  ⚡ MUTATION LOGms                          │
  └────────────────────────────────────────────────┘

  ┌───────────────────────────────────────────────┐
│ 📍 8  ⚡ SAVE VERIFYms                           │
  └────────────────────────────────────────────────┘

  ┌───────────────────────────────────────────────┐
│ 📍 9  ⚡ RESPONSE SNAPSHOTms                     │
  └────────────────────────────────────────────────┘

  🔒 CRITICAL FIELDS AUDIT — game will crash/stuck if wrong
  ├ 🔒 _attrs                   = Object{1}  L133726: for(var o in t._attrs) — keyed by hero index, each has _items with calculated attrs
  ├ 🔒 _baseAttrs               = Object{1}  L133731: t._baseAttrs[o] — keyed by hero index, each has _items with base attrs (before talent)
  └ 🔒 POWER (attr 21)          = calculated per hero  L133821: 21==p._id → heroBaseAttr.power = floor(num)
  ✅ CRITICAL AUDIT: 3/3 PASSED

  ┌ 📸 getAttrs ret=0 ────────────────────────────────────────┐
  ├   _attrs                       Object{1}
  └   _baseAttrs                   Object{1}
  └──────────────────────────────────────────────────────────┘


  ┌───────────────────────────────────────────────┐
│ 📍 10  ⚡ EXECUTION SUMMARYms                    │
  └────────────────────────────────────────────────┘

⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔
🏏️ ----  ✅ UNKNOWN  🏁 COMPLETE
⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔
   👤 USER ....... guest_4d1443a866473f4d
   📦 FIELDS ..... 2
⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔
✅ hero::getAttrs         OK     ────────────────────────────
  └ ret=0 396 chars (raw) 4ms

  ✅ SUCCESS  📏 data= 396 chars  📦 proto= RAW  ⏱️ time= 4ms

  └ ⏱️ handler: 5ms 

  📤 activity::getActivityBrief ──────────────────────────────────
  [01/03] 🔄 Validate request  █░░
  [01/03] ✅ Validate request  █░░
  [02/03] 🔄 Load user data  ██░
  [02/03] ✅ Load user data  ██░
  [03/03] 🔄 Generate activity list  ███
  [03/03] ✅ Generate activity list  ███
✅ activity::getActivityBrief OK     ────────────────────────────
  └ ret=0 334 chars (LZ) 7ms

  ✅ SUCCESS  📏 data= 334 chars  📦 proto= LZ-STRING  ⏱️ time= 7ms

  └ ⏱️ handler: 9ms 

  📤 guide::saveGuide       ──────────────────────────────────

⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔
🏏️ ---- 📨 guide/saveGuide 👤 guest_4d1443a866473f4d
⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔

  ┌───────────────────────────────────────────────┐
│ 📍 1  ⚡ ENTRY CHECKms                           │
  └────────────────────────────────────────────────┘
  [01/03] 🔄 Validate request fields  █░░
  [01/03] ✅ Validate request fields  █░░  type=2 step=2304

  ┌───────────────────────────────────────────────┐
│ 📍 2  ⚡ DATA INJECTION CHECKms                  │
  └────────────────────────────────────────────────┘
  [01/01] 🔄 Load userData from DB  █
  [01/01] ✅ Load userData from DB  █  userData loaded

  ┌───────────────────────────────────────────────┐
│ 📍 3  ⚡ DEEP TYPE SCANms                        │
  └────────────────────────────────────────────────┘
  [01/02] 🔄 Type assert request fields  █░
  [01/02] ✅ Type assert request fields  █░  all types verified

  ┌───────────────────────────────────────────────┐
│ 📍 4  ⚡ PLAYER STATE SNAPSHOTms                 │
  └────────────────────────────────────────────────┘
  [01/01] 🔄 Snapshot guide._steps before modification  █
  [01/01] ✅ Snapshot guide._steps before modification  █  guide._steps[2] was 2210

  ┌───────────────────────────────────────────────┐
│ 📍 5  ⚡ INVARIANT CHECKms                       │
  └────────────────────────────────────────────────┘
  [01/02] 🔄 Validate business rules  █░
  [01/02] ✅ Validate business rules  █░  invariants checked

  ┌───────────────────────────────────────────────┐
│ 📍 6  ⚡ MAIN PROCESSms                          │
  └────────────────────────────────────────────────┘
  [01/01] 🔄 Update guide._steps  █
  [01/01] ✅ Update guide._steps  █  guide._steps[2] = 2304

  ┌───────────────────────────────────────────────┐
│ 📍 7  ⚡ MUTATION LOGms                          │
  └────────────────────────────────────────────────┘

  ┌───────────────────────────────────────────────┐
│ 📍 8  ⚡ SAVE VERIFYms                           │
  └────────────────────────────────────────────────┘
[DB] saveUser("guest_4d1443..."): 102 keys, 11957 bytes

  ┌───────────────────────────────────────────────┐
│ 📍 9  ⚡ RESPONSE SNAPSHOTms                     │
  └────────────────────────────────────────────────┘

  ┌ 📸 saveGuide ret=0 ───────────────────────────────────────┐
  └──────────────────────────────────────────────────────────┘


  ┌───────────────────────────────────────────────┐
│ 📍 10  ⚡ EXECUTION SUMMARYms                    │
  └────────────────────────────────────────────────┘

⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔
🏏️ ----  ✅ UNKNOWN  🏁 COMPLETE
⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔
   👤 USER ....... guest_4d1443a866473f4d
⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔
✅ guide::saveGuide       OK     ────────────────────────────
  └ ret=0 2 chars (raw) 11ms

  ✅ SUCCESS  📏 data= 2 chars  📦 proto= RAW  ⏱️ time= 11ms

  └ ⏱️ handler: 11ms 

  📤 hero::autoLevelUp      ──────────────────────────────────
  [01/04] 🔄 Auto Level Up  █░░░
  [01/04] ✅ Auto Level Up  █░░░  heroId=39cd8381-59f1-4e8a-a7d3-cb582bf51379, times=1
  [02/04] 🔄 Load hero data  ██░░
  [03/04] 🔄 Calculate level up  ███░
🟢 09:42:33.094 INFO  📋 CONFIG   ▸ Resource loaded: heroLevelUpPurple.json
  [03/04] ✅ Calculate level up  ███░  1 levels (1 → 2)
  [04/04] 🔄 Save data & build response  ████
[DB] saveUser("guest_4d1443..."): 102 keys, 11955 bytes
  [04/04] ✅ Save data & build response  ████  ret=0, heroId=39cd8381-59f1-4e8a-a7d3-cb582bf51379, lvl 1→2

  🔒 CRITICAL FIELDS AUDIT — game will crash/stuck if wrong
  ├ 🔒 heroId                   = 39cd8381-59f1-4e8a-a7d3-cb582bf51379  L133741: getHero(e.heroId) — REQUIRED
  ├ 🔒 _heroLevel               = 2  L133751: heroBaseAttr.level = e._heroLevel
  ├ 🔒 _baseAttr                = Object{6}  L133805: setBaseAttr(e._baseAttr, hero)
  ├ 🔒 _totalAttr               = Object{7}  L133805: totalAttr loop _totalAttr._items
  ├ 🔒 _totalCost._levelUp      = 2 items (exp+gold)  L133385-133393: totalCost.levelUp[] deserialize
  └ 🔒 _changeInfo              = 2 items (exp+gold)  L118414-118417: resetTtemsCallBack → setItem(_id, _num)
  ✅ CRITICAL AUDIT: 6/6 PASSED
✅ hero::autoLevelUp      OK     ────────────────────────────
  └ ret=0 620 chars (raw) 21ms

  ✅ SUCCESS  📏 data= 620 chars  📦 proto= RAW  ⏱️ time= 21ms

  └ ⏱️ handler: 22ms 

  📤 hero::autoLevelUp      ──────────────────────────────────
  [01/04] 🔄 Auto Level Up  █░░░
  [01/04] ✅ Auto Level Up  █░░░  heroId=39cd8381-59f1-4e8a-a7d3-cb582bf51379, times=1
  [02/04] 🔄 Load hero data  ██░░
  [03/04] 🔄 Calculate level up  ███░
  [03/04] ✅ Calculate level up  ███░  1 levels (2 → 3)
  [04/04] 🔄 Save data & build response  ████
[DB] saveUser("guest_4d1443..."): 102 keys, 11955 bytes
  [04/04] ✅ Save data & build response  ████  ret=0, heroId=39cd8381-59f1-4e8a-a7d3-cb582bf51379, lvl 2→3

  🔒 CRITICAL FIELDS AUDIT — game will crash/stuck if wrong
  ├ 🔒 heroId                   = 39cd8381-59f1-4e8a-a7d3-cb582bf51379  L133741: getHero(e.heroId) — REQUIRED
  ├ 🔒 _heroLevel               = 3  L133751: heroBaseAttr.level = e._heroLevel
  ├ 🔒 _baseAttr                = Object{6}  L133805: setBaseAttr(e._baseAttr, hero)
  ├ 🔒 _totalAttr               = Object{7}  L133805: totalAttr loop _totalAttr._items
  ├ 🔒 _totalCost._levelUp      = 2 items (exp+gold)  L133385-133393: totalCost.levelUp[] deserialize
  └ 🔒 _changeInfo              = 2 items (exp+gold)  L118414-118417: resetTtemsCallBack → setItem(_id, _num)
  ✅ CRITICAL AUDIT: 6/6 PASSED
✅ hero::autoLevelUp      OK     ────────────────────────────
  └ ret=0 621 chars (raw) 8ms

  ✅ SUCCESS  📏 data= 621 chars  📦 proto= RAW  ⏱️ time= 8ms

  └ ⏱️ handler: 8ms 

  📤 guide::saveGuide       ──────────────────────────────────

⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔
🏏️ ---- 📨 guide/saveGuide 👤 guest_4d1443a866473f4d
⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔

  ┌───────────────────────────────────────────────┐
│ 📍 1  ⚡ ENTRY CHECKms                           │
  └────────────────────────────────────────────────┘
  [01/03] 🔄 Validate request fields  █░░
  [01/03] ✅ Validate request fields  █░░  type=2 step=2308

  ┌───────────────────────────────────────────────┐
│ 📍 2  ⚡ DATA INJECTION CHECKms                  │
  └────────────────────────────────────────────────┘
  [01/01] 🔄 Load userData from DB  █
  [01/01] ✅ Load userData from DB  █  userData loaded

  ┌───────────────────────────────────────────────┐
│ 📍 3  ⚡ DEEP TYPE SCANms                        │
  └────────────────────────────────────────────────┘
  [01/02] 🔄 Type assert request fields  █░
  [01/02] ✅ Type assert request fields  █░  all types verified

  ┌───────────────────────────────────────────────┐
│ 📍 4  ⚡ PLAYER STATE SNAPSHOTms                 │
  └────────────────────────────────────────────────┘
  [01/01] 🔄 Snapshot guide._steps before modification  █
  [01/01] ✅ Snapshot guide._steps before modification  █  guide._steps[2] was 2304

  ┌───────────────────────────────────────────────┐
│ 📍 5  ⚡ INVARIANT CHECKms                       │
  └────────────────────────────────────────────────┘
  [01/02] 🔄 Validate business rules  █░
  [01/02] ✅ Validate business rules  █░  invariants checked

  ┌───────────────────────────────────────────────┐
│ 📍 6  ⚡ MAIN PROCESSms                          │
  └────────────────────────────────────────────────┘
  [01/01] 🔄 Update guide._steps  █
  [01/01] ✅ Update guide._steps  █  guide._steps[2] = 2308

  ┌───────────────────────────────────────────────┐
│ 📍 7  ⚡ MUTATION LOGms                          │
  └────────────────────────────────────────────────┘

  ┌───────────────────────────────────────────────┐
│ 📍 8  ⚡ SAVE VERIFYms                           │
  └────────────────────────────────────────────────┘
[DB] saveUser("guest_4d1443..."): 102 keys, 11955 bytes

  ┌───────────────────────────────────────────────┐
│ 📍 9  ⚡ RESPONSE SNAPSHOTms                     │
  └────────────────────────────────────────────────┘

  ┌ 📸 saveGuide ret=0 ───────────────────────────────────────┐
  └──────────────────────────────────────────────────────────┘


  ┌───────────────────────────────────────────────┐
│ 📍 10  ⚡ EXECUTION SUMMARYms                    │
  └────────────────────────────────────────────────┘

⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔
🏏️ ----  ✅ UNKNOWN  🏁 COMPLETE
⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔
   👤 USER ....... guest_4d1443a866473f4d
⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔
✅ guide::saveGuide       OK     ────────────────────────────
  └ ret=0 2 chars (raw) 9ms

  ✅ SUCCESS  📏 data= 2 chars  📦 proto= RAW  ⏱️ time= 9ms

  └ ⏱️ handler: 10ms 

  📤 hero::autoLevelUp      ──────────────────────────────────
  [01/04] 🔄 Auto Level Up  █░░░
  [01/04] ✅ Auto Level Up  █░░░  heroId=fd38e138-053d-41e7-add3-ca0e22786ef5, times=1
  [02/04] 🔄 Load hero data  ██░░
  [03/04] 🔄 Calculate level up  ███░
🟢 09:42:35.220 INFO  📋 CONFIG   ▸ Resource loaded: heroLevelUpBlue.json
  [03/04] ✅ Calculate level up  ███░  1 levels (1 → 2)
  [04/04] 🔄 Save data & build response  ████
[DB] saveUser("guest_4d1443..."): 102 keys, 11955 bytes
  [04/04] ✅ Save data & build response  ████  ret=0, heroId=fd38e138-053d-41e7-add3-ca0e22786ef5, lvl 1→2

  🔒 CRITICAL FIELDS AUDIT — game will crash/stuck if wrong
  ├ 🔒 heroId                   = fd38e138-053d-41e7-add3-ca0e22786ef5  L133741: getHero(e.heroId) — REQUIRED
  ├ 🔒 _heroLevel               = 2  L133751: heroBaseAttr.level = e._heroLevel
  ├ 🔒 _baseAttr                = Object{6}  L133805: setBaseAttr(e._baseAttr, hero)
  ├ 🔒 _totalAttr               = Object{7}  L133805: totalAttr loop _totalAttr._items
  ├ 🔒 _totalCost._levelUp      = 2 items (exp+gold)  L133385-133393: totalCost.levelUp[] deserialize
  └ 🔒 _changeInfo              = 2 items (exp+gold)  L118414-118417: resetTtemsCallBack → setItem(_id, _num)
  ✅ CRITICAL AUDIT: 6/6 PASSED
✅ hero::autoLevelUp      OK     ────────────────────────────
  └ ret=0 622 chars (raw) 10ms

  ✅ SUCCESS  📏 data= 622 chars  📦 proto= RAW  ⏱️ time= 10ms

  └ ⏱️ handler: 11ms 

  📤 hero::autoLevelUp      ──────────────────────────────────
  [01/04] 🔄 Auto Level Up  █░░░
  [01/04] ✅ Auto Level Up  █░░░  heroId=fd38e138-053d-41e7-add3-ca0e22786ef5, times=1
  [02/04] 🔄 Load hero data  ██░░
  [03/04] 🔄 Calculate level up  ███░
  [03/04] ✅ Calculate level up  ███░  1 levels (2 → 3)
  [04/04] 🔄 Save data & build response  ████
[DB] saveUser("guest_4d1443..."): 102 keys, 11955 bytes
  [04/04] ✅ Save data & build response  ████  ret=0, heroId=fd38e138-053d-41e7-add3-ca0e22786ef5, lvl 2→3

  🔒 CRITICAL FIELDS AUDIT — game will crash/stuck if wrong
  ├ 🔒 heroId                   = fd38e138-053d-41e7-add3-ca0e22786ef5  L133741: getHero(e.heroId) — REQUIRED
  ├ 🔒 _heroLevel               = 3  L133751: heroBaseAttr.level = e._heroLevel
  ├ 🔒 _baseAttr                = Object{6}  L133805: setBaseAttr(e._baseAttr, hero)
  ├ 🔒 _totalAttr               = Object{7}  L133805: totalAttr loop _totalAttr._items
  ├ 🔒 _totalCost._levelUp      = 2 items (exp+gold)  L133385-133393: totalCost.levelUp[] deserialize
  └ 🔒 _changeInfo              = 2 items (exp+gold)  L118414-118417: resetTtemsCallBack → setItem(_id, _num)
  ✅ CRITICAL AUDIT: 6/6 PASSED
✅ hero::autoLevelUp      OK     ────────────────────────────
  └ ret=0 623 chars (raw) 10ms

  ✅ SUCCESS  📏 data= 623 chars  📦 proto= RAW  ⏱️ time= 10ms

  └ ⏱️ handler: 10ms 

  📤 activity::getActivityBrief ──────────────────────────────────
  [01/03] 🔄 Validate request  █░░
  [01/03] ✅ Validate request  █░░
  [02/03] 🔄 Load user data  ██░
  [02/03] ✅ Load user data  ██░
  [03/03] 🔄 Generate activity list  ███
  [03/03] ✅ Generate activity list  ███
✅ activity::getActivityBrief OK     ────────────────────────────
  └ ret=0 334 chars (LZ) 3ms

  ✅ SUCCESS  📏 data= 334 chars  📦 proto= LZ-STRING  ⏱️ time= 3ms

  └ ⏱️ handler: 4ms 

  📤 guide::saveGuide       ──────────────────────────────────

⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔
🏏️ ---- 📨 guide/saveGuide 👤 guest_4d1443a866473f4d
⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔

  ┌───────────────────────────────────────────────┐
│ 📍 1  ⚡ ENTRY CHECKms                           │
  └────────────────────────────────────────────────┘
  [01/03] 🔄 Validate request fields  █░░
  [01/03] ✅ Validate request fields  █░░  type=2 step=2508

  ┌───────────────────────────────────────────────┐
│ 📍 2  ⚡ DATA INJECTION CHECKms                  │
  └────────────────────────────────────────────────┘
  [01/01] 🔄 Load userData from DB  █
  [01/01] ✅ Load userData from DB  █  userData loaded

  ┌───────────────────────────────────────────────┐
│ 📍 3  ⚡ DEEP TYPE SCANms                        │
  └────────────────────────────────────────────────┘
  [01/02] 🔄 Type assert request fields  █░
  [01/02] ✅ Type assert request fields  █░  all types verified

  ┌───────────────────────────────────────────────┐
│ 📍 4  ⚡ PLAYER STATE SNAPSHOTms                 │
  └────────────────────────────────────────────────┘
  [01/01] 🔄 Snapshot guide._steps before modification  █
  [01/01] ✅ Snapshot guide._steps before modification  █  guide._steps[2] was 2308

  ┌───────────────────────────────────────────────┐
│ 📍 5  ⚡ INVARIANT CHECKms                       │
  └────────────────────────────────────────────────┘
  [01/02] 🔄 Validate business rules  █░
  [01/02] ✅ Validate business rules  █░  invariants checked

  ┌───────────────────────────────────────────────┐
│ 📍 6  ⚡ MAIN PROCESSms                          │
  └────────────────────────────────────────────────┘
  [01/01] 🔄 Update guide._steps  █
  [01/01] ✅ Update guide._steps  █  guide._steps[2] = 2508

  ┌───────────────────────────────────────────────┐
│ 📍 7  ⚡ MUTATION LOGms                          │
  └────────────────────────────────────────────────┘

  ┌───────────────────────────────────────────────┐
│ 📍 8  ⚡ SAVE VERIFYms                           │
  └────────────────────────────────────────────────┘
[DB] saveUser("guest_4d1443..."): 102 keys, 11955 bytes

  ┌───────────────────────────────────────────────┐
│ 📍 9  ⚡ RESPONSE SNAPSHOTms                     │
  └────────────────────────────────────────────────┘

  ┌ 📸 saveGuide ret=0 ───────────────────────────────────────┐
  └──────────────────────────────────────────────────────────┘


  ┌───────────────────────────────────────────────┐
│ 📍 10  ⚡ EXECUTION SUMMARYms                    │
  └────────────────────────────────────────────────┘

⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔
🏏️ ----  ✅ UNKNOWN  🏁 COMPLETE
⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔
   👤 USER ....... guest_4d1443a866473f4d
⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔
✅ guide::saveGuide       OK     ────────────────────────────
  └ ret=0 2 chars (raw) 12ms

  ✅ SUCCESS  📏 data= 2 chars  📦 proto= RAW  ⏱️ time= 12ms

  └ ⏱️ handler: 12ms 

  📤 hangup::saveGuideTeam  ──────────────────────────────────
  [01/02] 🔄 Save guide team  █░
  [01/02] ✅ Save guide team  █░  team=5 heroes
  [02/02] 🔄 Persist team data  ██
[DB] saveUser("guest_4d1443..."): 102 keys, 12036 bytes
  [02/02] ✅ Persist team data  ██  saved to DB
✅ hangup::saveGuideTeam  OK     ────────────────────────────
  └ ret=0 2 chars (raw) 7ms

  ✅ SUCCESS  📏 data= 2 chars  📦 proto= RAW  ⏱️ time= 7ms

  └ ⏱️ handler: 7ms 

  📤 hangup::checkBattleResult ──────────────────────────────────

⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔
🏏️ ---- 📨 hangup/checkBattleResult 👤 guest_4d1443a866473f4d
⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔

  ┌───────────────────────────────────────────────┐
│ 📍 1  ⚡ ENTRY CHECKms                           │
  └────────────────────────────────────────────────┘
  [01/10] 🔄 Validate request  █░░░░░░░░░
  [01/10] ✅ Validate request  █░░░░░░░░░

  ┌───────────────────────────────────────────────┐
│ 📍 2  ⚡ DATA INJECTION CHECKms                  │
  └────────────────────────────────────────────────┘
  [02/10] 🔄 Load data  ██░░░░░░░░
  [02/10] ✅ Load data  ██░░░░░░░░  lesson.json=611 entries

  ┌───────────────────────────────────────────────┐
│ 📍 3  ⚡ PLAYER STATE SNAPSHOTms                 │
  └────────────────────────────────────────────────┘
  [03/10] 🔄 Read progress  ███░░░░░░░
  [03/10] ✅ Read progress  ███░░░░░░░  lesson=10102

  ┌───────────────────────────────────────────────┐
│ 📍 4  ⚡ INVARIANT CHECKms                       │
  └────────────────────────────────────────────────┘
  [04/10] 🔄 Determine outcome  ████░░░░░░
  [04/10] ✅ Determine outcome  ████░░░░░░  WIN (0)

  ┌───────────────────────────────────────────────┐
│ 📍 5  ⚡ MAIN PROCESSms                          │
  └────────────────────────────────────────────────┘
  [05/10] 🔄 Build response  █████░░░░░
  [05/10] ✅ Build response  █████░░░░░  WIN rewards=5 lesson=10102

  ┌───────────────────────────────────────────────┐
│ 📍 6  ⚡ MUTATION LOGms                          │
  └────────────────────────────────────────────────┘

  ┌───────────────────────────────────────────────┐
│ 📍 7  ⚡ SAVE VERIFYms                           │
  └────────────────────────────────────────────────┘
[DB] saveUser("guest_4d1443..."): 102 keys, 12037 bytes

  ┌───────────────────────────────────────────────┐
│ 📍 8  ⚡ RESPONSE SNAPSHOTms                     │
  └────────────────────────────────────────────────┘

  🔒 CRITICAL FIELDS AUDIT — game will crash/stuck if wrong
  ├ 🔒 _battleResult            = 0  L104882: 0 == e._battleResult -> true (tutorial forced win)
  ├ 🔒 _changeInfo._items       = 5 items  L97686: getBattleAwardItems iterates _changeInfo._items for {_id, _num}
  ├ 🔒 _curLess                 = 10102  L104892/L97751: OnHookSingleton.lastSection = e._curLess
  └ 🔒 _maxPassLesson           = 10101  L104893/L97751: OnHookSingleton.maxPassLesson = e._maxPassLesson
  ✅ CRITICAL AUDIT: 4/4 PASSED

  ┌───────────────────────────────────────────────┐
│ 📍 9  ⚡ DEEP TYPE SCANms                        │
  └────────────────────────────────────────────────┘

  ┌───────────────────────────────────────────────┐
│ 📍 10  ⚡ EXECUTION SUMMARYms                    │
  └────────────────────────────────────────────────┘

⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔
🏏️ ----  ✅ UNKNOWN  🏁 COMPLETE
⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔
   👤 USER ....... guest_4d1443a866473f4d
   📦 FIELDS ..... 4
⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔

  ┌ 📸 CHECK BATTLE RESULT ret=0 ─────────────────────────────┐
  ├   _battleResult                0
  ├   _curLess                     10102
  ├   _maxPassLesson               10101
  └   _changeInfo                  Object{1}
  └──────────────────────────────────────────────────────────┘

✅ hangup::checkBattleResult OK     ────────────────────────────
  └ ret=0 218 chars (raw) 10ms

  ✅ SUCCESS  📏 data= 218 chars  📦 proto= RAW  ⏱️ time= 10ms

  └ ⏱️ handler: 10ms 

  📤 buryPoint::guideBattle ──────────────────────────────────
🟢 09:42:43.847 INFO  ⚪ BURYPOINT ▸ Guide battle analytics received
[DB] saveUser("guest_4d1443..."): 102 keys, 12114 bytes
✅ buryPoint::guideBattle OK     ────────────────────────────
  └ ret=0 2 chars (raw) 7ms

  ✅ SUCCESS  📏 data= 2 chars  📦 proto= RAW  ⏱️ time= 7ms

  └ ⏱️ handler: 7ms 

  📤 buryPoint::guideBattle ──────────────────────────────────
🟢 09:43:04.387 INFO  ⚪ BURYPOINT ▸ Guide battle analytics received
[DB] saveUser("guest_4d1443..."): 102 keys, 12193 bytes
✅ buryPoint::guideBattle OK     ────────────────────────────
  └ ret=0 2 chars (raw) 6ms

  ✅ SUCCESS  📏 data= 2 chars  📦 proto= RAW  ⏱️ time= 6ms

  └ ⏱️ handler: 7ms 

  📤 buryPoint::guideBattle ──────────────────────────────────
🟢 09:43:05.332 INFO  ⚪ BURYPOINT ▸ Guide battle analytics received
[DB] saveUser("guest_4d1443..."): 102 keys, 12270 bytes
✅ buryPoint::guideBattle OK     ────────────────────────────
  └ ret=0 2 chars (raw) 10ms

  ✅ SUCCESS  📏 data= 2 chars  📦 proto= RAW  ⏱️ time= 10ms

  └ ⏱️ handler: 10ms 

  📤 activity::getActivityBrief ──────────────────────────────────
  [01/03] 🔄 Validate request  █░░
  [01/03] ✅ Validate request  █░░
  [02/03] 🔄 Load user data  ██░
  [02/03] ✅ Load user data  ██░
  [03/03] 🔄 Generate activity list  ███
  [03/03] ✅ Generate activity list  ███
✅ activity::getActivityBrief OK     ────────────────────────────
  └ ret=0 334 chars (LZ) 2ms

  ✅ SUCCESS  📏 data= 334 chars  📦 proto= LZ-STRING  ⏱️ time= 2ms

  └ ⏱️ handler: 2ms 

  📤 guide::saveGuide       ──────────────────────────────────

⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔
🏏️ ---- 📨 guide/saveGuide 👤 guest_4d1443a866473f4d
⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔

  ┌───────────────────────────────────────────────┐
│ 📍 1  ⚡ ENTRY CHECKms                           │
  └────────────────────────────────────────────────┘
  [01/03] 🔄 Validate request fields  █░░
  [01/03] ✅ Validate request fields  █░░  type=2 step=2601

  ┌───────────────────────────────────────────────┐
│ 📍 2  ⚡ DATA INJECTION CHECKms                  │
  └────────────────────────────────────────────────┘
  [01/01] 🔄 Load userData from DB  █
  [01/01] ✅ Load userData from DB  █  userData loaded

  ┌───────────────────────────────────────────────┐
│ 📍 3  ⚡ DEEP TYPE SCANms                        │
  └────────────────────────────────────────────────┘
  [01/02] 🔄 Type assert request fields  █░
  [01/02] ✅ Type assert request fields  █░  all types verified

  ┌───────────────────────────────────────────────┐
│ 📍 4  ⚡ PLAYER STATE SNAPSHOTms                 │
  └────────────────────────────────────────────────┘
  [01/01] 🔄 Snapshot guide._steps before modification  █
  [01/01] ✅ Snapshot guide._steps before modification  █  guide._steps[2] was 2508

  ┌───────────────────────────────────────────────┐
│ 📍 5  ⚡ INVARIANT CHECKms                       │
  └────────────────────────────────────────────────┘
  [01/02] 🔄 Validate business rules  █░
  [01/02] ✅ Validate business rules  █░  invariants checked

  ┌───────────────────────────────────────────────┐
│ 📍 6  ⚡ MAIN PROCESSms                          │
  └────────────────────────────────────────────────┘
  [01/01] 🔄 Update guide._steps  █
  [01/01] ✅ Update guide._steps  █  guide._steps[2] = 2601

  ┌───────────────────────────────────────────────┐
│ 📍 7  ⚡ MUTATION LOGms                          │
  └────────────────────────────────────────────────┘

  ┌───────────────────────────────────────────────┐
│ 📍 8  ⚡ SAVE VERIFYms                           │
  └────────────────────────────────────────────────┘
[DB] saveUser("guest_4d1443..."): 102 keys, 12270 bytes

  ┌───────────────────────────────────────────────┐
│ 📍 9  ⚡ RESPONSE SNAPSHOTms                     │
  └────────────────────────────────────────────────┘

  ┌ 📸 saveGuide ret=0 ───────────────────────────────────────┐
  └──────────────────────────────────────────────────────────┘


  ┌───────────────────────────────────────────────┐
│ 📍 10  ⚡ EXECUTION SUMMARYms                    │
  └────────────────────────────────────────────────┘

⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔
🏏️ ----  ✅ UNKNOWN  🏁 COMPLETE
⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔
   👤 USER ....... guest_4d1443a866473f4d
⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔
✅ guide::saveGuide       OK     ────────────────────────────
  └ ret=0 2 chars (raw) 12ms

  ✅ SUCCESS  📏 data= 2 chars  📦 proto= RAW  ⏱️ time= 12ms

  └ ⏱️ handler: 12ms 

  📤 guide::saveGuide       ──────────────────────────────────

⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔
🏏️ ---- 📨 guide/saveGuide 👤 guest_4d1443a866473f4d
⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔

  ┌───────────────────────────────────────────────┐
│ 📍 1  ⚡ ENTRY CHECKms                           │
  └────────────────────────────────────────────────┘
  [01/03] 🔄 Validate request fields  █░░
  [01/03] ✅ Validate request fields  █░░  type=2 step=2603

  ┌───────────────────────────────────────────────┐
│ 📍 2  ⚡ DATA INJECTION CHECKms                  │
  └────────────────────────────────────────────────┘
  [01/01] 🔄 Load userData from DB  █
  [01/01] ✅ Load userData from DB  █  userData loaded

  ┌───────────────────────────────────────────────┐
│ 📍 3  ⚡ DEEP TYPE SCANms                        │
  └────────────────────────────────────────────────┘
  [01/02] 🔄 Type assert request fields  █░
  [01/02] ✅ Type assert request fields  █░  all types verified

  ┌───────────────────────────────────────────────┐
│ 📍 4  ⚡ PLAYER STATE SNAPSHOTms                 │
  └────────────────────────────────────────────────┘
  [01/01] 🔄 Snapshot guide._steps before modification  █
  [01/01] ✅ Snapshot guide._steps before modification  █  guide._steps[2] was 2601

  ┌───────────────────────────────────────────────┐
│ 📍 5  ⚡ INVARIANT CHECKms                       │
  └────────────────────────────────────────────────┘
  [01/02] 🔄 Validate business rules  █░
  [01/02] ✅ Validate business rules  █░  invariants checked

  ┌───────────────────────────────────────────────┐
│ 📍 6  ⚡ MAIN PROCESSms                          │
  └────────────────────────────────────────────────┘
  [01/01] 🔄 Update guide._steps  █
  [01/01] ✅ Update guide._steps  █  guide._steps[2] = 2603

  ┌───────────────────────────────────────────────┐
│ 📍 7  ⚡ MUTATION LOGms                          │
  └────────────────────────────────────────────────┘

  ┌───────────────────────────────────────────────┐
│ 📍 8  ⚡ SAVE VERIFYms                           │
  └────────────────────────────────────────────────┘
[DB] saveUser("guest_4d1443..."): 102 keys, 12270 bytes

  ┌───────────────────────────────────────────────┐
│ 📍 9  ⚡ RESPONSE SNAPSHOTms                     │
  └────────────────────────────────────────────────┘

  ┌ 📸 saveGuide ret=0 ───────────────────────────────────────┐
  └──────────────────────────────────────────────────────────┘


  ┌───────────────────────────────────────────────┐
│ 📍 10  ⚡ EXECUTION SUMMARYms                    │
  └────────────────────────────────────────────────┘

⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔
🏏️ ----  ✅ UNKNOWN  🏁 COMPLETE
⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔
   👤 USER ....... guest_4d1443a866473f4d
⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔️━⚔
✅ guide::saveGuide       OK     ────────────────────────────
  └ ret=0 2 chars (raw) 8ms

  ✅ SUCCESS  📏 data= 2 chars  📦 proto= RAW  ⏱️ time= 8ms

  └ ⏱️ handler: 9ms 

  📤 hangup::gain           ──────────────────────────────────
  [01/08] 🔄 Validate request  █░░░░░░░
  [01/08] ✅ Validate request  █░░░░░░░
  [02/08] 🔄 Load data  ██░░░░░░
🟢 09:43:09.032 INFO  📋 CONFIG   ▸ Resource loaded: idleVipPlus.json
🟢 09:43:09.034 INFO  📋 CONFIG   ▸ Resource loaded: idleAwardFirst.json
  [02/08] ✅ Load data  ██░░░░░░  lesson=611 entries, idleAwardEveryTime=300
  [03/08] 🔄 Calculate idle time  ███░░░░░
  [03/08] ✅ Calculate idle time  ███░░░░░  77s (max 28800s)
  [04/08] 🔄 Calculate ticks  ████░░░░
[DB] saveUser("guest_4d1443..."): 102 keys, 12270 bytes
  [04/08] ✅ Calculate ticks  ████░░░░  exCount=0 (no rewards)
  [05/08] ⏭ Build rewards  ░░░░░░░░  no ticks
  [06/08] ⏭ First-time bonus  ░░░░░░░░  no ticks
  [07/08] 🔄 Save & respond  ███████░
  [07/08] ✅ Save & respond  ███████░  zero rewards

  ┌ 📸 HANGUP GAIN ret=0 (zero ticks) ────────────────────────┐
  ├   _changeInfo                  Object{1}
  ├   _lastGainTime                1779010989035
  ├   _exCount                     0
  └   _clickGlobalWarBuffTag       ""
  └──────────────────────────────────────────────────────────┘

✅ hangup::gain           OK     ────────────────────────────
  └ ret=0 100 chars (raw) 35ms

  ✅ SUCCESS  📏 data= 100 chars  📦 proto= RAW  ⏱️ time= 35ms

  └ ⏱️ handler: 36ms 

  📤 activity::getActivityDetail ──────────────────────────────────
🟡 09:43:26.678 WARN  ⚙️ HANDLER  ▸ Unknown action "activity::getActivityDetail"

  📤 activity::getActivityBrief ──────────────────────────────────
  [01/03] 🔄 Validate request  █░░
  [01/03] ✅ Validate request  █░░
  [02/03] 🔄 Load user data  ██░
  [02/03] ✅ Load user data  ██░
  [03/03] 🔄 Generate activity list  ███
  [03/03] ✅ Generate activity list  ███
✅ activity::getActivityBrief OK     ────────────────────────────
  └ ret=0 334 chars (LZ) 2ms

  ✅ SUCCESS  📏 data= 334 chars  📦 proto= LZ-STRING  ⏱️ time= 2ms

  └ ⏱️ handler: 2ms 

  📤 activity::getActivityBrief ──────────────────────────────────
  [01/03] 🔄 Validate request  █░░
  [01/03] ✅ Validate request  █░░
  [02/03] 🔄 Load user data  ██░
  [02/03] ✅ Load user data  ██░
  [03/03] 🔄 Generate activity list  ███
  [03/03] ✅ Generate activity list  ███
✅ activity::getActivityBrief OK     ────────────────────────────
  └ ret=0 334 chars (LZ) 3ms

  ✅ SUCCESS  📏 data= 334 chars  📦 proto= LZ-STRING  ⏱️ time= 3ms

  └ ⏱️ handler: 3ms 

  📤 gift::getOnlineGift    ──────────────────────────────────
🟡 09:43:38.529 WARN  ⚙️ HANDLER  ▸ Unknown type "gift" — no handlers registered for this type

  📤 hangup::gain           ──────────────────────────────────
  [01/08] 🔄 Validate request  █░░░░░░░
  [01/08] ✅ Validate request  █░░░░░░░
  [02/08] 🔄 Load data  ██░░░░░░
  [02/08] ✅ Load data  ██░░░░░░  lesson=611 entries, idleAwardEveryTime=300
  [03/08] 🔄 Calculate idle time  ███░░░░░
  [03/08] ✅ Calculate idle time  ███░░░░░  30s (max 28800s)
  [04/08] 🔄 Calculate ticks  ████░░░░
[DB] saveUser("guest_4d1443..."): 102 keys, 12270 bytes
  [04/08] ✅ Calculate ticks  ████░░░░  exCount=0 (no rewards)
  [05/08] ⏭ Build rewards  ░░░░░░░░  no ticks
  [06/08] ⏭ First-time bonus  ░░░░░░░░  no ticks
  [07/08] 🔄 Save & respond  ███████░
  [07/08] ✅ Save & respond  ███████░  zero rewards

  ┌ 📸 HANGUP GAIN ret=0 (zero ticks) ────────────────────────┐
  ├   _changeInfo                  Object{1}
  ├   _lastGainTime                1779011019608
  ├   _exCount                     0
  └   _clickGlobalWarBuffTag       ""
  └──────────────────────────────────────────────────────────┘

✅ hangup::gain           OK     ────────────────────────────
  └ ret=0 100 chars (raw) 8ms

  ✅ SUCCESS  📏 data= 100 chars  📦 proto= RAW  ⏱️ time= 8ms

  └ ⏱️ handler: 9ms 
  ➖ Disconnected  n8xtovlq...  reason: reason=ping timeout

  🔗⚡ Client connected  vi5gdMRz...  📍 ::ffff:127.0.0.1  📡 polling
🟢 09:45:20.167 INFO  🔐 TEA      ▸ Sending verify challenge
🟢 09:45:20.221 INFO  🔐 TEA      ▸ TEA verification SUCCESS
