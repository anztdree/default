# MAIN-SERVER — Kamus Pondasi v3

> **Super Warrior Z** — MAIN-SERVER Pondasi Awal
> Port: 8001 | Socket.IO 2.5.1 | TEA: ON | Database: LocalStorage
> Source: reverse-engineering `main.min(unminfy).js`
> Metode: Tanpa STUB, OVERRIDE, FORCE, BYPASS, DUMMY, ASUMSI
> Prinsip: Pondasi awal = KONEKSI + TEA HANDSHAKE + enterGame.js SEMPURNA. Selebihnya menyusul.

---

> ### 🎯 PRINSIP UTAMA: SEMUA FILE SUPPORT main.min.js
> **Konsep Reverse Engineering yang Baik & Benar:**
> Seluruh file yang kita buat — server, handler, config, db — semuanya ada untuk SATU tujuan:
> **melayani apa yang main.min.js harapkan.** main.min.js adalah source of truth.
> Setiap keputusan implementasi harus bisa ditelusuri ke main.min.js.
> Jika tidak ada di main.min.js dan tidak ada di resource/json → TANYA DULU.

---

> ### ⛔ PERINGATAN KRITIS TENTANG HAR
> **HAR adalah ALAT BANTU ANALISA semata. BUKAN sumber data. BUKAN acuan value.**
>
> - STRUKTUR (key names, nested shape, type) → boleh referensi HAR untuk memahami bentuk data
> - VALUE (angka, string, amount) → **JANGAN SAMAKAN DENGAN HAR!** Value di HAR adalah data user tertentu yang sudah bermain
> - Default value untuk user baru → diturunkan dari **resource/json** config + server logic
> - **Setiap value di dokumen ini yang bertanda "Dari config" atau "Dari resource/json" → harus diverifikasi ke file tersebut, BUKAN ke HAR**

---

> ### 📋 CHANGELOG v2→v3
> - **ALL 99 keys** sekarang punya dokumentasi struktur detail dari tracing deserialize functions
> - **CORRECTED** `genki._items` = ARRAY (bukan object dengan `_items` nested) — dari GenkiModel.deserialize L132147
> - **CORRECTED** `weapon` = `{ _items: { [id]: WeaponDataModel } }` — dari readByData L130936
> - **CORRECTED** `timesInfo` keys = NO underscore prefix (berbeda dari kebanyakan object lain)
> - **CORRECTED** `_arenaTeam` = array of 5 slots (bukan object) — dari setArenaTeamInfo L119258
> - **ADDED** §7.25–7.55: 31 struktur key baru yang sebelumnya hanya tabel singkat
> - **ADDED** §16: ENUM REFERENCE — semua konstanta yang dipakai client
> - **ADDED** §17: SERIALIZABLE PATTERN — pola deserialisasi universal client
> - **VERIFIED** semua config values dari constant.json + main.min.js (VERIFIKASI tags dihapus)
> - **VERIFIED** `server0Time = 25200000` dari L116952 (UTC+7 offset)

---

## 1. SPESIFIKASI TEKNIS

| Property | Value | Bukti (main.min.js line) |
|----------|-------|--------------------------|
| Port | 8001 | config |
| Transport | Socket.IO 2.5.1 | L82537: `io.connect(e, {reconnectionAttempts:10})` |
| Transports | `['websocket','polling']` | Default Socket.IO |
| CORS | `origin:'*', methods:['GET','POST']` | Sama seperti login-server |
| TEA Verification | **ON** | L82497: `this.verifyEnable = true` |
| TEA Key | `'verification'` | L82582: `new TEA().encrypt(n, 'verification')` |
| TEA Algorithm | XXTEA (corrected block TEA) | L117041-117091 |
| TEA Delta | `2654435769` (0x9E3779B9) | L117051 |
| TEA Rounds | `Math.floor(6 + 52/blockCount)` | L117050 |
| TEA Output | Base64 encoded | L117062 |
| Reconnection | `{reconnectionAttempts:10}` | L82537 |
| Max Offline Time | 600000ms (10 menit) | L82503: `this.maxReconnectWaitTime=600000` |
| Database | Pure LocalStorage API | Keputusan bersama |
| Compression | LZString UTF-16 | L113853: `LZString.decompressFromUTF16(i)` |
| Compression Direction | Server→Client saja | Client TIDAK pernah compress |
| Compression Threshold | **1024 bytes** | L39134: `perMessageDeflate.threshold = 1024` |

### Bukti 4 Socket Client (L113445):

```javascript
t.loginClient   = new TSSocketClient('login-server',   false)  // TEA: OFF
t.mainClient    = new TSSocketClient('main-server',     true)   // TEA: ON  ← INI
t.chatClient    = new TSSocketClient('chat-server',     true)   // TEA: ON
t.dungeonClient = new TSSocketClient('dungeon-server',  true)   // TEA: ON
```

---

## 2. PERBEDAAN KRITIS: Login-Server vs Main-Server

| Aspek | Login-Server (8000) | Main-Server (8001) |
|-------|---------------------|---------------------|
| `type` field | `'User'` (UPPERCASE U) | `'user'` (lowercase u) |
| TEA Verification | OFF (`verifyEnable=false`) | **ON** (`verifyEnable=true`) |
| Socket.IO event | `'handler.process'` | `'handler.process'` (sama) |
| Response `ret` success | `0` (number) | `0` (number) |
| Notify `ret` success | N/A | `'SUCCESS'` (STRING!) |
| Compression | Jarang | Sering (`compress:true`) |
| Error handling | Log saja | `ErrorHandler.ShowErrorTips` |
| Connection URL | `serversetting.json` | `serverItem.url` dari GetServerList |
| Reconnection | Tidak ada | 10 attempts, max 10 menit offline |
| Post-login | Destroy socket | Tetap hidup, listen notify |

---

## 3. ALUR LENGKAP: KONEKSI → GAME BERJALAN

### 3.1 Sequence Diagram

```
CLIENT                                          SERVER
  │                                               │
  │══ STEP 1: KONEKSI ═══════════════════════════│
  │── io.connect(url, {reconnectionAttempts:10}) ─>│
  │<── socket.io 'connect' event ────────────────│
  │                                               │
  │══ STEP 2: TEA HANDSHAKE ═════════════════════│
  │<── emit('verify', challenge) ────────────────│  ← Random string (UUID)
  │   TEA.encrypt(challenge, 'verification')      │
  │── emit('verify', encrypted, callback) ───────>│
  │<── callback({ret:0}) ────────────────────────│
  │                                               │
  │══ STEP 3: LISTEN NOTIFY ═════════════════════│
  │   socket.on('Notify', handler)                │
  │                                               │
  │══ STEP 4: ENTERGAME ═════════════════════════│
  │── emit('handler.process', {                   │
  │     type:'user', action:'enterGame',          │
  │     loginToken, userId, serverId,             │
  │     version:'1.0', language, gameVersion      │
  │   }, callback) ──────────────────────────────>│
  │<── callback({ret:0, data:LZString,           │
  │   compress:true, serverTime, server0Time}) ───│  ← 99 top-level keys
  │                                               │
  │══ STEP 5: POST-ENTERGAME (PARALEL) ══════════│
  │   TRACK A: loginSuccessCallBack(e)            │
  │   ├── UserDataParser.saveUserData(e)          │
  │   │   └── user::getBulletinBrief (auto)       │
  │   ├── [if e.newUser] SDK createRole events    │
  │   └── runScene('OverScene') → goHome()        │
  │       ├── heroImage::getAll                   │
  │       ├── hero::getAttrs                      │
  │       ├── userMsg::getMsgList                 │
  │       └── entrust::getInfo                    │
  │   TRACK B: reportToLoginEnterInfo()           │
  │   └── User::SaveUserEnterInfo → destroy login │
  │   TRACK C: registChat (setInterval 3s)        │
  │   └── user::registChat → chat server URL      │
```

### 3.2 Detail Setiap Step

**STEP 1 — Koneksi (L82508-82568)**

```javascript
o = io.connect(url, { reconnectionAttempts: 10 });
// On 'connect': if verifyEnable → socketOnVerify(callback)
```

**STEP 2 — TEA Handshake (L82579-82587)**

```javascript
// Server kirim: socket.emit('verify', challengeString);
// Client proses (L82582):
var encrypted = new TEA().encrypt(challenge, 'verification');
socket.emit('verify', encrypted, function(ack) {
    if (ack.ret === 0) { /* success */ }
    else { ErrorHandler.ShowErrorTips(ack.ret); socket.destroy(); }
});
```

**STEP 3 — Listen Notify (L114210-114239)**

```javascript
mainClient.listenNotify(handler);  // → socket.on('Notify', handler)
// Format: { ret: 'SUCCESS', data: JSON_string, compress: boolean }
// Special: action='Kickout' → destroy semua socket, runScene('Login')
```

**STEP 4 — enterGame (L114411-114447)**

```javascript
e.processHandler({
    type: 'user', action: 'enterGame',
    loginToken: ts.loginInfo.userInfo.loginToken,
    userId: ts.loginInfo.userInfo.userId,
    serverId: parseInt(ts.loginInfo.serverItem.serverId),
    version: '1.0', language: ToolCommon.getLanguage(),
    gameVersion: await ToolCommon.getClientVer()
}, successCallback, errorCallback);
```

**STEP 5 — Post-enterGame Paralel**

Track A — `loginSuccessCallBack` (L114523):
```javascript
UserDataParser.saveUserData(e)  // simpan 99 keys ke singleton
if (e.newUser) { ToolCommon.ReportSdkInfoXX(ReportDataType.CreateRole); }
runScene('OverScene', {runType: OverSceneType.FIRSTENTER})
```

Track B — `reportToLoginEnterInfo` (L114448):
```javascript
{ type: 'User', action: 'SaveUserEnterInfo', accountToken, channelCode, subChannel, createTime, userLevel, version:'1.0' }
// Lalu: ts.loginClient.destroy()
```

Track C — `registChat` (L114462):
```javascript
{ type: 'user', action: 'registChat', userId, version: '1.0' }
// Response: { _success: true, _chatServerUrl, _worldRoomId, _guildRoomId, _teamDungeonChatRoom }
// Retry setiap 3 detik, max 15 kali
```

### 3.3 Auto-Request Chain Setelah goHome

```
1. heroImage::getAll → 2. hero::getAttrs → 3. userMsg::getMsgList
4. [if entrustResetTimes>0] entrust::reset → 5. entrust::getInfo → 6. goGuideHome()
```

### 3.4 Daftar Handler yang Dibutuhkan Client

> **PONDASI AWAL**: Hanya `user/enterGame.js` yang dibuat dan di-router.
> Semua handler lain akan dibuat & di-router **SETELAH enterGame SEMPURNA**.

| # | type | action | Dipanggil Saat | Status |
|---|------|--------|----------------|--------|
| 1 | `user` | `enterGame` | Pertama kali masuk game | **AKTIF** |
| 2 | `user` | `registChat` | Auto setelah enterGame (interval 3s) | MENUNGGU |
| 3 | `user` | `getBulletinBrief` | Auto dari saveUserData | MENUNGGU |
| 4 | `heroImage` | `getAll` | Auto dari goHome | MENUNGGU |
| 5 | `hero` | `getAttrs` | Auto dari goHome | MENUNGGU |
| 6 | `userMsg` | `getMsgList` | Auto dari goHome | MENUNGGU |
| 7 | `entrust` | `getInfo` | Auto dari goHome | MENUNGGU |
| 8 | `entrust` | `reset` | Kondisional dari goHome | MENUNGGU |

---

## 4. PROTOCOL: `handler.process`

### 4.1 Request/Response Pattern

```javascript
socket.emit('handler.process', requestObject, callbackFunction)
callbackFunction(responseObject)
```

### 4.2 Request Object Format

```javascript
{
    type: 'user',       // ⚠️ LOWERCASE — beda dari Login-Server 'User'
    action: string,
    loginToken: string, // hanya enterGame
    userId: string,
    serverId: number,   // parseInt dari serverList
    version: '1.0',     // SELALU '1.0'
    language: string,
    gameVersion: string // hanya enterGame
}
```

### 4.3 Response Object Format

```javascript
{
    ret: 0,                     // WAJIB — 0 = success (NUMBER)
    data: string,               // WAJIB — JSON string (raw atau LZString compressed)
    compress: boolean,          // WAJIB — true jika data LZString compressed
    serverTime: number,         // WAJIB — Date.now() timestamp
    server0Time: number         // WAJIB — timezone offset ms (25200000 untuk UTC+7) L116952
}
```

### 4.4 Notify Object Format (Server → Client PUSH)

```javascript
{ ret: 'SUCCESS', data: string, compress: boolean }  // ⚠️ STRING, bukan number!
```

### 4.5 Client Response Processing (processHandler L113843-113869)

```javascript
1. Cek ret === 0
2. Jika compress → LZString.decompressFromUTF16(data)
3. Jika serverTime → updateServerTime(serverTime, server0Time)
4. Special: data === '70001' → reportBattleLog
5. JSON.parse(data) → callback
6. ret !== 0: '22'→reportBattleLog, '38'→force reload, else→ShowErrorTips
```

### 4.6 Socket.IO Event Summary

| Event | Direction | Payload | Purpose |
|-------|-----------|---------|---------|
| `connect` | S→C | (none) | Socket connected |
| `verify` | S→C | challenge string | TEA handshake |
| `verify` | C→S | Base64(TEA(challenge,'verification')), ackFn | TEA response |
| `handler.process` | C→S | requestObj, ackCallback | Request utama |
| `Notify` | S→C | {ret:'SUCCESS', data, compress} | Server push |
| `disconnect` | S→C | reason string | Connection lost |

---

## 5. TEA VERIFICATION — IMPLEMENTASI LENGKAP

### 5.1 XXTEA Algorithm (L117041-117091)

```javascript
encrypt(plaintext, key) {
    if (plaintext.length === 0) return '';
    var n = strToLongs(Utf8.encode(plaintext));
    if (n.length <= 1) n[1] = 0;                    // Min 2 blocks
    var k = strToLongs(Utf8.encode(key).slice(0, 16)); // Key 16 bytes max
    var len = n.length, z = n[len-1], y = n[0];
    var rounds = Math.floor(6 + 52 / len), sum = 0;
    while (rounds-- > 0) {
        sum += 2654435769;  // Delta = 0x9E3779B9
        var e = sum >>> 2 & 3;
        for (var p = 0; p < len; p++) {
            y = n[(p + 1) % len];
            var mx = (z >>> 5 ^ y << 2) + (y >>> 3 ^ z << 4) ^ (sum ^ y) + (k[3 & p ^ e] ^ z);
            z = n[p] += mx;
        }
    }
    return Base64.encode(longsToStr(n));
}

decrypt(ciphertext, key) {
    var n = strToLongs(Base64.decode(ciphertext));
    var k = strToLongs(Utf8.encode(key).slice(0, 16));
    var len = n.length, rounds = Math.floor(6 + 52 / len);
    var sum = rounds * 2654435769;
    while (rounds-- > 0) {
        var e = sum >>> 2 & 3;
        for (var p = len - 1; p >= 0; p--) {
            var z = n[(p - 1 + len) % len];
            var y = n[(p + 1) % len];
            var mx = (z >>> 5 ^ y << 2) + (y >>> 3 ^ z << 4) ^ (sum ^ y) + (k[3 & p ^ e] ^ z);
            n[p] -= mx;
        }
        sum -= 2654435769;
    }
    return Utf8.decode(longsToStr(n)).replace(/\0+$/, '');
}

strToLongs(s) { // Little-endian: charCodeAt(4n) + (charCodeAt(4n+1)<<8) + ... }
longsToStr(l) { // Reverse: String.fromCharCode(255&l, l>>>8&255, ...) }
```

### 5.2 Server Implementation Logic

```
1. On socket 'connect': Generate UUID challenge → socket.emit('verify', challenge)
2. On socket 'verify': TEA.decrypt(encrypted,'verification') == socket.challenge?
   → match: callback({ret:0}), socket.verified=true
   → mismatch: callback({ret:38}), socket.disconnect()
```

### 5.3 Konstanta TEA

| Konstanta | Nilai | Keterangan |
|-----------|-------|------------|
| Key | `'verification'` | UTF-8, truncated ke 16 bytes |
| Delta | `2654435769` (0x9E3779B9) | Golden ratio |
| Rounds | `Math.floor(6 + 52/blockCount)` | Dynamic |
| Min blocks | `2` | Pad jika < 2 |
| Output encoding | Base64 | Encrypt output |
| Endianness | Little-endian | strToLongs / longsToStr |
| Null strip | `replace(/\0+$/, '')` | Decrypt output |

---

## 6. `enterGame` — HANDLER PERTAMA

### 6.1 Client Request (L114411-114447)

```javascript
e.processHandler({
    type: 'user', action: 'enterGame',
    loginToken: ts.loginInfo.userInfo.loginToken,
    userId: ts.loginInfo.userInfo.userId,
    serverId: parseInt(ts.loginInfo.serverItem.serverId),
    version: '1.0', language: ToolCommon.getLanguage(),
    gameVersion: await ToolCommon.getClientVer()
}, successCallback, errorCallback);
```

### 6.2 Request Fields

| Field | Type | Source | Wajib | Contoh |
|-------|------|--------|-------|--------|
| `type` | string | hardcoded | ✅ | `'user'` |
| `action` | string | hardcoded | ✅ | `'enterGame'` |
| `loginToken` | string | SaveHistory response | ✅ | `<dari login flow>` |
| `userId` | string | loginInfo.userInfo | ✅ | `<dari login flow>` |
| `serverId` | number | parseInt(serverItem.serverId) | ✅ | `<dari serverList>` |
| `version` | string | hardcoded | ✅ | `'1.0'` |
| `language` | string | ToolCommon.getLanguage() | ✅ | `<dari client>` |
| `gameVersion` | string | ToolCommon.getClientVer() | ✅ | `<dari client>` |

### 6.3 Response Data — 99 Top-Level Keys

> ⛔ **STRUKTUR dari main.min.js saveUserData parser (L114793-114955). VALUE BUKAN dari HAR.**

#### CORE DATA (WAJIB — game tidak jalan tanpa ini):

| # | Key | Type | Handler | Line |
|---|-----|------|---------|------|
| 1 | `user` | object | `setUserInfo` | L114875 |
| 2 | `heros` | object | `HerosManager.readByData` | L114795 |
| 3 | `hangup` | object | `setOnHook` | L114887 |
| 4 | `totalProps` | object | `setBackpack` | L114913 |
| 5 | `equip` | object | `setEquip` → `readByData` | L130931 |
| 6 | `summon` | object | `setSummon` | L114902 |
| 7 | `dungeon` | object | `setCounterpart` | L114945 |
| 8 | `scheduleInfo` | object | `AllRefreshCount.initData` | L114795 |
| 9 | `timesInfo` | object | `TimesInfoSingleton.initData` | L114814 |
| 10 | `serverVersion` | string | `UserInfoSingleton.serverVersion` | L114823 |
| 11 | `serverId` | number | `UserInfoSingleton.setServerId` | L114823 |
| 12 | `serverOpenDate` | number | `UserInfoSingleton.setServerOpenDate` | L114823 |
| 13 | `newUser` | boolean | checked in `loginSuccessCallBack` | L114524 |
| 14 | `currency` | string | `ts.currency = e.currency` | L114795 |
| 15 | `lastTeam` | object | `UserInfoSingleton.firstLoginSetMyTeam` | L114823 |

#### IMPORTANT DATA:

| # | Key | Type | Handler | Line |
|---|-----|------|---------|------|
| 16 | `weapon` | object | `setEquip` → `readByData` | L130938 |
| 17 | `imprint` | object | `setSign` | L114924 |
| 18 | `training` | object | `PadipataInfoManager.setPadipataModel` | L114823 |
| 19 | `superSkill` | object | `SuperSkillSingleton.initSuperSkill` | L114795 |
| 20 | `giftInfo` | object | `WelfareInfoManager` (multiple calls) | L114799 |
| 21 | `guide` | object | `GuideInfoManager.setGuideInfo` | L114795 |
| 22 | `userGuild` | object | `setTeam` + `setTeamTechnology` | L114935 |
| 23 | `userGuildPub` | object | `setTeam` | L114936 |
| 24 | `expedition` | object | `ExpeditionManager.setExpeditionModel` | L114847 |
| 25 | `retrieve` | object | `GetBackReourceManager.setRetrieveModel` | L114849 |
| 26 | `battleMedal` | object | `BattleMedalManager.setBattleMedal` | L114850 |
| 27 | `backpackLevel` | number | `setBackpack` → `UserInfoSingleton.heroBackPack` | L114921 |
| 28 | `headEffect` | object | `HeadEffectModel.deserialize` | L114823 |
| 29 | `userWar` | object | `GlobalWarManager.setUserWarModel` | L114823 |
| 30 | `userBallWar` | object | `TeamInfoManager.UserBallWar` | L114829 |
| 31 | `userTopBattle` | object | `TopBattleManager.setTopBattleLoginInfo` | L125300 |
| 32 | `checkin` | object | `WelfareInfoManager.setSignInInfo` | L114932 |
| 33 | `curMainTask` | object | `UserInfoSingleton.setMianTask` | L114954 |
| 34 | `heroSkin` | object | `HerosManager.setSkinData` | L114795 |

#### SOCIAL/LOG DATA:

| # | Key | Type | Handler | Line |
|---|-----|------|---------|------|
| 35 | `summonLog` | object | `SummonSingleton.setSummomLogList` | L95232 |
| 36 | `vipLog` | array | `WelfareInfoManager.setVipLogList` | L114795 |
| 37 | `cardLog` | array | `WelfareInfoManager.setMonthCardLogList` | L114795 |
| 38 | `onlineBulletin` | array | `BulletinSingleton.setBulletInfo` | L114823 |
| 39 | `broadcastRecord` | array | enterGame callback | L114436 |
| 40 | `blacklist` | object | `BroadcastSingleton.setBlacklistPlayerInfo` | L92033 |
| 41 | `forbiddenChat` | object | `BroadcastSingleton.setUserBidden` | L114870 |

#### GUILD/SERVER DATA:

| # | Key | Type | Handler | Line |
|---|-----|------|---------|------|
| 42 | `guildLevel` | number | `setTeam` | L114937 |
| 43 | `guildTreasureMatchRet` | number | `GuildTreasureManager.setTreasureMatchState` | L114938 |
| 44 | `dragonEquiped` | object | `ItemsCommonSingleton.initDragonBallEquip` | L114795 |
| 45 | `warInfo` | object | `GlobalWarManager.setWarLoginInfo` | L114823 |
| 46 | `ballWarState` | number | `TeamInfoManager.BallWarState` | L114829 |
| 47 | `enableShowQQ` | boolean | `WelfareInfoManager.enableShowQQ` | L114839 |
| 48 | `showQQVip` | number | `WelfareInfoManager.showQQVip` | L114840 |
| 49 | `showQQ` | number | `WelfareInfoManager.showQQ` | L114841 |
| 50 | `showQQImg1` | string | `WelfareInfoManager.showQQImg1` | L114842 |
| 51 | `showQQImg2` | string | `WelfareInfoManager.showQQImg2` | L114843 |
| 52 | `showQQUrl` | string | `WelfareInfoManager.showQQUrl` | L114844 |
| 53 | `cellgameHaveSetHero` | boolean | injected ke `e.scheduleInfo._cellgameHaveSetHero` | L114795 |
| 54 | `globalWarBuffTag` | string | `setOnHook` | L114894 |
| 55 | `globalWarLastRank` | object | `setOnHook` | L114895 |
| 56 | `globalWarBuff` | number | `setOnHook` | L114896 |
| 57 | `globalWarBuffEndTime` | number | `setOnHook` | L114897 |
| 58 | `guildName` | string | `TeamInfoManager.setTeamName` | L114795 |
| 59 | `guildActivePoints` | object | `TeamInfoManager.setActivePoints` | L114838 |

#### BALL WAR DATA:

| # | Key | Type | Handler | Line |
|---|-----|------|---------|------|
| 60 | `ballBroadcast` | object | `TeamInfoManager.setBallWarBrodecast` | L114829 |
| 61 | `ballWarInfo` | object | `TeamInfoManager` → GuildBallWarInfo.deserialize | L114829 |

#### TEAM DUNGEON DATA:

| # | Key | Type | Handler | Line |
|---|-----|------|---------|------|
| 62 | `teamTraining` | object | `setTeamTraining` | L114952 |
| 63 | `teamServerHttpUrl` | string | `TeamworkManager.teamServerHttpUrl` | L114853 |
| 64 | `teamDungeonOpenTime` | number | `TeamworkManager.teamDungeonOpenTime` | L114856 |
| 65 | `teamDungeonTask` | object | `TeamworkManager.teamDungeonTask.deserialize` | L114857 |
| 66 | `teamDungeonSplBcst` | object | `TeamworkManager.SetTeamDungeonBroadcast` (spl=true) | L114858 |
| 67 | `teamDungeonNormBcst` | object | `TeamworkManager.SetTeamDungeonBroadcast` (spl=false) | L114859 |
| 68 | `teamDungeonHideInfo` | object | `TeamworkManager.setTeamDungeonHideInfo` | L114860 |
| 69 | `teamDungeon` | object | `TeamworkManager.setLoginInfo` | L114852 |
| 70 | `teamDungeonInvitedFriends` | object | `TeamworkManager.teamDungeonInvitedFriends` | L114862 |
| 71 | `myTeamServerSocketUrl` | string | `ts.loginInfo.serverItem.dungeonurl` | L114863 |

#### ACTIVITY/SHOP DATA:

| # | Key | Type | Handler | Line |
|---|-----|------|---------|------|
| 72 | `shopNewHeroes` | object | `ShopInfoManager.shopNewHero` | L114851 |
| 73 | `channelSpecial` | object | `WelfareInfoManager.channelSpecial` | L114795 |
| 74 | `hideHeroes` | array | `WelfareInfoManager.setHideHeroes` | L114845 |
| 75 | `templeLess` | number | `TrialManager.setTempleLess` | L114861 |
| 76 | `timeTrial` | object | `SpaceTrialManager.setSpaceTrialModel` | L114848 |
| 77 | `timeTrialNextOpenTime` | number | 2nd param to setSpaceTrialModel | L114848 |
| 78 | `YouTuberRecruit` | object | `UserInfoSingleton.YouTuberModel.setData` | L114823 |
| 79 | `userYouTuberRecruit` | object | `UserInfoSingleton.YouTuberModel.initUserInfo` | L114823 |
| 80 | `heroImageVersion` | number | `UserInfoSingleton.heroImageVersion` | L114823 |
| 81 | `superImageVersion` | number | `UserInfoSingleton.superImageVersion` | L114823 |
| 82 | `karinStartTime` | number | `TowerDataManager.setKarinTime` (arg1) | L114823 |
| 83 | `karinEndTime` | number | `TowerDataManager.setKarinTime` (arg2) | L114823 |
| 84 | `timeBonusInfo` | object | `TimeLimitGiftBagManager.setTimeLimitGiftBag` | L114823 |
| 85 | `monthCard` | object | `WelfareInfoManager.setMonthCardInfo` | L114814 |
| 86 | `recharge` | object | `WelfareInfoManager.setRechargeInfo` | L114814 |
| 87 | `userDownloadReward` | object | `UserInfoSingleton.userDownloadModel` | L114814 |
| 88 | `clickSystem` | object | `UserClickSingleton.setClickSys` | L114795 |
| 89 | `questionnaires` | object | `UserInfoSingleton.setQuestData` | L114865 |
| 90 | `littleGame` | object | `LittleGameManager.saveData` | L114872 |

#### EQUIPMENT/GEM DATA:

| # | Key | Type | Handler | Line |
|---|-----|------|---------|------|
| 91 | `genki` | object | `setEquip` → `readByData` → genkiDataModel.deserialize | L130947 |
| 92 | `gemstone` | object | `EquipInfoManager.saveGemStone` | L131754 |
| 93 | `resonance` | object | `HerosManager.setResonanceModel` | L114866 |

#### BATTLE/TRIAL DATA:

| # | Key | Type | Handler | Line |
|---|-----|------|---------|------|
| 94 | `topBattleInfo` | object | `TopBattleManager.setTopBattleLoginInfo` | L125301 |
| 95 | `fastTeam` | object | `HerosManager.saveLoginFastTeam` | L114868 |
| 96 | `gravity` | object | `TrialManager.setGravityTrialInfo` | L114871 |
| 97 | `timeMachine` | object | `TimeLeapSingleton.initData` | L114823 |

#### ARENA DATA:

| # | Key | Type | Handler | Line |
|---|-----|------|---------|------|
| 98 | `_arenaTeam` | array | `AltarInfoManger.setArenaTeamInfo` | L114823 |
| 99 | `_arenaSuper` | array | `AltarInfoManger.setArenaSuperInfo` | L114823 |

---

## 7. DATA STRUCTURE — STRUKTUR KEY (Bukan Value!)

> ⛔ **VALUE DI BAWAH INI BUKAN DEFAULT!** Yang ditampilkan adalah STRUKTUR.
> Value konkret ditentukan oleh server logic + resource/json config.
>
> **Pola universal**: Semua key server→client menggunakan prefix `_` (underscore).
> Client deserialize: `_fieldName` → `this.fieldName` via `isCommonType` (string/number/boolean).
> Sub-objects & arrays membutuhkan penanganan khusus di setiap `deserialize()` method.

### 7.1 `user` Object — Struktur (20 fields, L114874-114885)

> ⚠️ **KOREKSI PENTING**: TIDAK ADA field `_level`, `_vipLevel`, `_exp` di user object!
> Level/VIP/Exp disimpan sebagai item ID di `_attribute._items`:
> - Level = item ID 104 (`_num` = level number)
> - VIP Level = item ID 106
> - Exp = item ID 103
> Client membaca via `ItemsCommonSingleton.getItemNum(PLAYERLEVELID)` dll.

| Key | Type | Sumber Value | Dibaca Client? |
|-----|------|-------------|----------------|
| `_id` | string (UUID) | Server generate: `uuid.v4()` | ✅ → `UserInfoSingleton.userId` |
| `_pwd` | string | Server decides default | ✅ → `UserInfoSingleton.userPassward` |
| `_nickName` | string | `"New User" + id.slice(0,4)` | ✅ → `UserInfoSingleton.userNickName` |
| `_headImage` | string | `"hero_icon_" + displayId` | ✅ → `UserInfoSingleton.userHeadImage` |
| `_lastLoginTime` | number | `Date.now()` saat enterGame | ✅ → `UserInfoSingleton.userLastLoginTime` |
| `_createTime` | number | `Date.now()` saat create | ✅ → `UserInfoSingleton.createTime` |
| `_bulletinVersions` | object | `{}` untuk new user | ✅ → `UserInfoSingleton.bulletinVersions` |
| `_oriServerId` | number | `= request.serverId` | ✅ → `UserInfoSingleton.setOriServerId()` |
| `_nickChangeTimes` | number | `0` untuk new user | ✅ → `UserInfoSingleton.nickChangeTimes` |
| `_oldName` | string | `""` untuk new | ❌ Tidak dibaca |
| `_account` | string | `= request.userId` | ❌ |
| `_channelId` | string | Dari SDK login data | ❌ |
| `_privilege` | number | `0` untuk new | ❌ |
| `_attribute` | object | Lihat §7.1.1 di bawah | ❌ (dibaca terpisah via totalProps) |
| `_offlineTime` | number | `0` untuk new, prev._lastLoginTime untuk lama | ❌ |
| `_levelChangeTime` | number | `Date.now()` untuk new | ❌ |
| `_vipLevelVersion` | string | Server config | ❌ |
| `_os` | string | Dari request language | ❌ |
| `_oldUserBackTime` | number | `0` untuk new | ❌ |
| `_channelParam` | object | `{}` untuk new | ❌ |

#### 7.1.1 `_attribute._items` — Currency/Attribute IDs (L116237)

> ⚠️ Client TIDAK membaca `user._attribute._items` langsung! Client membaca currency dari `totalProps._items`.
> Tapi `user._attribute._items` tetap HARUS dikirim — beberapa code path mungkin mengaksesnya.

| Item ID | Constant | Nama | Default New User (dari constant.json) |
|---------|----------|------|---------------------------------------|
| 101 | DIAMONDID | Diamond | `startDiamond: 0` |
| 102 | GOLDID | Gold | `startGold: 0` |
| 103 | PLAYEREXPERIENCEID | Player Exp | `startUserExp: 0` |
| 104 | PLAYERLEVELID | Player Level | `startUserLevel: 1` |
| 105 | PLAYERVIPEXPERIENCEID | VIP Exp | `0` |
| 106 | PLAYERVIPLEVELID | VIP Level | `0` |
| 107 | PLAYERVIPEXPALLID | VIP Total Exp | `0` |
| 111 | SoulCoinID | Soul Coins | `0` |
| 112 | ArenaCoinID | Arena Coins | `0` |
| 113 | SnakeCoinID | Snake Coins | `0` |
| 114 | TeamCoinID | Team Coins | `0` |

Struktur each item: `{ _id: number, _num: number }`

### 7.2 `heros` Object — Struktur (L133718-134052)

| Key (top) | Type | Sumber Value |
|-----------|------|-------------|
| `_heros` | object | Key = heroId (UUID), Value = hero object |
| `_maxPower` | number | Dihitung server dari hero stats |
| `_maxPowerChangeTime` | number | `Date.now()` saat power berubah |

**Hero Object Structure (each entry in `_heros`):**

| Key | Type | Sumber Value |
|-----|------|-------------|
| `_heroId` | string (UUID) | Server generate |
| `_heroDisplayId` | number | Dari resource/json/hero.json (constant.json: `startHero: "1205"`) |
| `_heroBaseAttr` | object | `{ _level: number, _evolveLevel: number, ...all HeroAttribute fields }` — constant.json: `startHeroLevel: "3"` |
| `_heroStar` | number | Starter level dari hero config |
| `_superSkillLevel` | number | `0` untuk new |
| `_potentialLevel` | object | `{}` untuk new |
| `_superSkillResetCount` | number | `0` untuk new |
| `_potentialResetCount` | number | `0` untuk new |
| `_qigong` | object | `{ _items: {} }` untuk new |
| `_qigongTmp` | object | `{ _items: {} }` untuk new |
| `_qigongTmpPower` | number | `0` untuk new |
| `_qigongStage` | number | Initial stage dari config |
| `_breakInfo` | object | `{ _breakLevel: 1, _level: 0, _attr: {_items:[]}, _version: "" }` |
| `_totalCost` | object | `{ _items: { wakeUp:[], earring:[], levelUp:[], evolve:[], skill:[], qigong:[], heroBreak:[] } }` |
| `_expeditionMaxLevel` | number | `0` untuk new |
| `_gemstoneSuitId` | number | `0` untuk new |
| `_linkTo` | array | `[]` untuk new |
| `_linkFrom` | string | `""` untuk new |
| `_resonanceType` | number | `0` untuk new |
| `_version` | string | Dari hero config |

### 7.3 Starter Heroes

> Starter hero ditentukan oleh **resource/json/constant.json**: `startHero: "1205"`, `startHeroLevel: "3"`.
> `_headImage` = `"hero_icon_" + startHero` = `"hero_icon_1205"` (constant.json: `playerIcon: "hero_icon_1205"`).
> Jumlah dan level starter hero → dari resource/json config, BUKAN HAR.

### 7.4 `hangup` Object — Struktur (L114886-114900)

| Key | Type | Sumber Value |
|-----|------|-------------|
| `_id` | string (UUID) | `= user._id` |
| `_lastGainTime` | number | `Date.now()` saat create |
| `_waitGain` | object | `{ _items: {} }` untuk new |
| `_waitRand` | object | `{ _items: {} }` untuk new |
| `_actReward` | object | `{ _items: {} }` untuk new |
| `_curLess` | number | constant.json: `startLesson: 10101` |
| `_maxPassLesson` | number | Initial dari config |
| `_passLessonTime` | number | `0` untuk new |
| `_maxPassChapter` | number | `0` untuk new |
| `_lastNormalGainTime` | number | `Date.now()` saat create |
| `_lastRandGainTime` | number | `Date.now()` saat create |
| `_haveGotChapterReward` | object | `{}` untuk new |
| `_firstGain` | boolean | `false` untuk new |
| `_clickGlobalWarBuffTag` | string | `""` untuk new |
| `_buyFund` | boolean | `false` untuk new |
| `_haveGotFundReward` | object | `{}` untuk new |

### 7.5 `totalProps` — Struktur Item/Currency (L114912-114921)

> ⛔ Jangan copy _num dari HAR! Starting amount dari constant.json.

| Key | Type | Sumber Value |
|-----|------|-------------|
| `_items` | object | Key = item ID string, Value = `{ _id: number, _num: number }` |

**Item ID Categories (dari resource/json):**

| ID Range | Kategori | Default Source |
|----------|----------|----------------|
| 101–107 | Currency utama + VIP | constant.json: startDiamond=0, startGold=0 |
| 111–114 | Coins (Soul/Arena/Snake/Team) | `0` untuk new |
| 123 | Advanced Summon Orb | `0` untuk new |
| 131–134 | EXP/Evolve capsules | thingsID.json: startNum values |
| 3001+ | Equipment items | dari equip config |
| 9002+ | Misc/special items | dari config |

### 7.6 `equip` Object — Struktur (L130929-130983)

| Key | Type | Sumber Value |
|-----|------|-------------|
| `_id` | string (UUID) | `= user._id` |
| `_suits` | object | Key = heroId, Value = suit object |

**Suit Object (L130957-130983):**
| Key | Type | Sumber Value |
|-----|------|-------------|
| `_suitItems` | array | `[{ _id: number, _pos: number }]` — equip items per slot |
| `_suitAttrs` | array | `[{ _id: number, _num: number }]` — suit-set bonus attrs |
| `_equipAttrs` | array | `[{ _id: number, _num: number }]` — individual equip attrs |
| `_earrings` | object | `{ _id: number, _level: number, _attrs: { _items: [{ _id, _num }] }, _version: string }` |
| `_weaponState` | number | `0` untuk new (0=notActivate, 1=allReadyActivated) |

### 7.7 `summon` Object — Struktur (L114901-114911)

| Key | Type | Sumber Value |
|-----|------|-------------|
| `_id` | string (UUID) | `= user._id` |
| `_energy` | number | Dari resource/json/summon.json |
| `_haveCommonGuide` | boolean | Server logic |
| `_haveSuperGuide` | boolean | Server logic |
| `_canCommonFreeTime` | number | `Date.now()` saat create |
| `_canSuperFreeTime` | number | `Date.now()` saat create |
| `_summonTimes` | object | `{ [poolId]: count }` — dari summon config |
| `_logicInfo` | object | `{ [poolId]: logicObj }` — dari summon config |
| `_firstDiamond10` | boolean | Server logic |
| `_wishList` | array | `[]` untuk new |
| `_wishVersion` | number | `0` untuk new |

### 7.8 `scheduleInfo` Object — Struktur (L91274)

> ⛔ Value angka dari HAR BUKAN default! Semua initial count dari resource/json config.

| Key | Type | Default New |
|-----|------|-------------|
| `_id` | string (UUID) | `= user._id` |
| `_refreshTime` | number | `Date.now()` |
| `_templeBuyCount` | number | `0` |
| `_marketDiamondRefreshCount` | number | `0` |
| `_vipMarketDiamondRefreshCount` | number | `0` |
| `_arenaAttackTimes` | number | Dari config |
| `_arenaBuyTimesCount` | number | `0` |
| `_arenaHaveJoinToday` | boolean | `false` |
| `_snakeResetTimes` | number | Dari config |
| `_snakeSweepCount` | number | `0` |
| `_cellGameHaveGotReward` | boolean | `false` |
| `_cellGameHaveTimes` | number | Dari config |
| `_cellgameHaveSetHero` | boolean | Dari top-level `e.cellgameHaveSetHero` (injected sebelum initData) |
| `_strongEnemyTimes` | number | Dari config |
| `_strongEnemyBuyCount` | number | `0` |
| `_monthCardHaveGotReward` | object | `{}` |
| `_dungeonTimes` | object | `{ [type]: count }` dari dungeon config |
| `_dungeonBuyTimesCount` | object | `{ [type]: 0 }` |
| `_karinBattleTimes` | number | Dari config |
| `_karinBuyBattleTimesCount` | number | `0` |
| `_karinBuyFeetCount` | number | `0` |
| `_goldBuyCount` | number | Dari config |
| `_entrustResetTimes` | number | Dari config |
| `_likeRank` | object | `{}` |
| `_giveHearts` | array | `[]` |
| `_getHearts` | array | `[]` |
| `_mahaAttackTimes` | number | Dari config |
| `_mahaBuyTimesCount` | number | `0` |
| `_mineResetTimes` | number | Dari config |
| `_mineBuyResetTimesCount` | number | `0` |
| `_mineBuyStepCount` | number | `0` |
| `_guildBossTimes` | number | Dari config |
| `_guildBossTimesBuyCount` | number | `0` |
| `_treasureTimes` | number | Dari config |
| `_guildCheckInType` | number | `0` |
| `_dragonExchangeSSPoolId` | number | Dari config |
| `_dragonExchangeSSSPoolId` | number | Dari config |
| `_clickTimeGift` | boolean | `false` |
| `_trainingBuyCount` | number | `0` |
| `_commentedHeroes` | object | `{}` |
| `_bossCptTimes` | number | Dari config |
| `_bossCptBuyCount` | number | `0` |
| `_ballWarBuyCount` | number | `0` |
| `_expeditionEvents` | object | `{}` |
| `_expeditionSpeedUpCost` | number | `0` |
| `_clickExpedition` | boolean | `false` |
| `_mergeBossBuyCount` | number | `0` |
| `_templeDailyReward` | boolean | `false` |
| `_templeYesterdayLess` | number | `0` |
| `_teamDugeonUsedRobots` | array | `[]` |
| `_topBattleTimes` | number | Dari config |
| `_topBattleBuyCount` | number | `0` |
| `_timeTrialBuyTimesCount` | number | `0` |
| `_keyItemCount` | object | `{ [itemId]: threshold }` dari config |
| `_gravityTrialBuyTimesCount` | number | `0` |

### 7.9 `timesInfo` Object — Struktur (L96001)

> ⚠️ **KEYS TIDAK PAKAI UNDERSCORE!** Berbeda dari kebanyakan object lain.

| Key | Type | Default New |
|-----|------|-------------|
| `templeTimes` | number | Dari config |
| `templeTimesRecover` | number | `0` |
| `mineSteps` | number | `0` |
| `mineStepsRecover` | number | `0` |
| `karinFeet` | number | Dari config |
| `karinFeetRecover` | number | `0` |
| `mahaTimes` | number | `0` |
| `mahaTimesRecover` | number | `0` |
| `marketRefreshTimes` | number | `0` |
| `marketRefreshTimesRecover` | number | `0` |
| `vipMarketRefreshTimes` | number | `0` |
| `vipMarketRefreshTimesRecover` | number | `0` |

### 7.10 `dungeon` Object — Struktur (L92503)

```
{
  _dungeons: {
    [index]: {
      _type: number,         // DUNGEON_TYPE: 1=EXP, 2=EVOLVE, 3=ENERGY(skip), 4=EQUIP, 5=SINGA, 6=SINGB, 7=METAL, 8=Z_STONE
      _curMaxLevel: number,  // current max level cleared
      _lastLevel: number     // last attempted level
    }
  }
}
```
⚠️ Type 3 (ENERGY) di-skip oleh client! Jangan kirim entry dengan `_type: 3`.

### 7.11 `weapon` Object — Struktur (L130936, L137133)

```
weapon = {
  _items: {
    [weaponId: string]: {
      _weaponId: string,
      _displayId: number,       // juga triggers quality lookup dari weapon.json
      _heroId: string,          // default: '' (equipped hero)
      _star: number,            // default: 0
      _level: number,           // default: 1
      _attrs: { _items: [{ _id: number, _num: number }] },
      _strengthenCost: { _items: [{ _id: number, _num: number }] },
      _haloId: number,          // default: 0
      _haloLevel: number,       // default: 0
      _haloCost: { _items: [{ _id: number, _num: number }] }
    }
  }
}
```

### 7.12 `genki` Object — Struktur (L132147)

> ⚠️ **`_items` = ARRAY LANGSUNG**, bukan nested `{ _items: {...} }`!
> Berbeda dari kebanyakan model lain yang pakai `_items: { _items: [...] }`.

```
{
  _id: string,
  _items: [                           // ← ARRAY, bukan object!
    {
      _id: string,
      _displayId: number,             // default: 0
      _heroId: string,                // default: ''
      _heroPos: number,               // default: 0
      _mainAttr: { _items: [{ _id: number, _num: number }] },   // [0] selalu ada
      _viceAttr: { _items: [{ _id: number, _num: number }] },   // [0] mungkin absent
      _disable: boolean               // default: false
    }
  ],
  _curSmeltNormalExp: number,         // default: 0
  _curSmeltSuperExp: number           // default: 0
}
```

### 7.13 `training` (padipata) Object — Struktur (L121377)

```
{
  _id: string,                        // optional (void 0 check)
  _cfgId: number,                     // optional (void 0 check)
  _type: number,                      // optional — training type
  _times: number,                     // optional — remaining times
  _timesStartRecover: number,         // optional — timestamp
  _surpriseReward: any,               // always assigned (no guard)
  _questionId: number,                // optional
  _enemyId: number                    // optional
}
```
Note: `_trainingBuyCount` ada di `scheduleInfo`, bukan di training object. Seluruh `e` juga disimpan sebagai `_award`.

### 7.14 `superSkill` Object — Struktur (L88732)

```
{
  _skills: {
    [index]: {
      _skillId: number,           // super skill ID
      _level: number,             // ⚠️ 0 = not learned → SKIPPED oleh client!
      _needEvolve: any,           // boolean-like
      _totalCost: any             // cost data (optional)
    }
  }
}
```
⚠️ Entry dengan `_level === 0` di-skip! Jangan kirim skill yang belum dipelajari.

### 7.15 `giftInfo` Object — Struktur (L114799-114813)

```
{
  _id: string,
  _fristRecharge: { _canGetReward: boolean, _haveGotReward: boolean },
  _haveGotVipRewrd: { [vipLevel: string]: boolean },
  _buyVipGiftCount: { [giftId: string]: number },
  _onlineGift: { _curId: number, _nextTime: number },
  _gotBSAddToHomeReward: boolean,
  _clickHonghuUrlTime: number,
  _gotChannelWeeklyRewardTag: string,
  _levelGiftCount: { [level: string]: number },
  _levelBuyGift: { [level: string]: { _id: number, _buyCount: number, _finishTime: number } },
  _isBuyFund: boolean,
  _fundGiftCount: { [fundId: string]: number }
}
```

### 7.16 `guide` Object — Struktur (L120569)

```
{ _id: any, _steps: { [guideLine: string]: number } }
```

### 7.17 `lastTeam` Object — Struktur

```
{
  _id: string,
  _lastTeamInfo: {
    [LAST_TEAM_TYPE]: {           // 1=FRIEND, 2=TRAINING, 5=ARENA, 6=DUNGEON, 9=HANGUP, dll (lihat §16)
      _team: [{ _heroId: string, _position: number }],
      _superSkill: [{ _id: number }]
    }
  }
}
```

### 7.18 `expedition` Object — Struktur (L120006)

```
{
  _id: string,
  _passLesson: { [lessonId: string]: any },
  _machines: {
    [machineId: string]: {
      _level: number,            // default: 0
      _heroId: string,           // default: ''
      _outCount: number          // default: 0
    }
  },
  _collection: [any],
  _teams: { [teamSlot: string]: any },
  _times: number,
  _timesStartRecover: number
}
```

### 7.19 `checkin` Object — Struktur (L126160)

```
{ _id: string, _activeItem: [any], _curCycle: number, _maxActiveDay: number, _lastActiveDate: number }
```

### 7.20 `curMainTask` Object — Struktur

```
{ [taskIndex: string]: { _id: number, _state: number } }
```
`_state`: 0=DEFAULT, 1=DOING, 2=COMPLETE, 3=FINISH. Empty object → client sets `_mainTask = null`.

### 7.21 `heroSkin` Object — Struktur (L133537)

```
{
  _skins: { [heroDisplayId: string]: [skinId, ...] },    // owned skins per hero
  _curSkin: { [heroDisplayId: string]: { _id: number } } // current skin per hero
}
```

### 7.22 `headEffect` Object — Struktur (L96555)

```
{
  _effects: [{ _id: number, ... }],  // HeadEffectItem array (flat: semua _field primitif auto-mapped)
  curBox: number,                    // NO underscore prefix!
  curEffect: number                  // NO underscore prefix!
}
```
⚠️ `curBox` dan `curEffect` TIDAK punya underscore prefix — berbeda dari kebanyakan key lain.

### 7.23 `userWar` Object — Struktur (L132750)

```
{
  _id: string,
  _session: number,
  _worldId: number,
  _areaId: number,
  _auditionWinCount: number,
  _gotAuditionReward: { [key: string]: any },
  _bet: { [stageKey: string]: [WarBet] },
  _championCount: number,
  _liked: boolean
}
```

### 7.24 `retrieve` Object — Struktur (L120230)

```
{
  _id: string,
  _finishDungeons: { [key: string]: { [k: string]: any } },
  _calHangupTime: number,
  _retrieveHangupReward: { _items: [{ _id: number, _num: number }] },
  _retrieveHangupTime: number,
  _retrieveDungeons: { [key: string]: any },
  _finishTime: number
}
```

### 7.25 `imprint` Object — Struktur (L123072, L123407)

```
{
  _items: {
    [imprintId: string]: {
      _id: string,
      _displayId: number,          // juga derives signType, part, SignQuality dari JSON
      _heroId: string,
      _level: number,              // default: 1
      _star: number,               // default: 0
      _mainAttr: { _items: [{ _id: number, _num: number }] },
      _starAttr: { _items: [{ _id: number, _num: number }] },
      _viceAttr: [{ _attrId: number, _attrValue: number, _level: number }],
      _tmpViceAttr: [{ _attrId: number, _attrValue: number, _level: number }],
      _totalCost: { _items: [{ _id: number, _num: number }] },
      _addAttr: { [key: string]: any }
    }
  }
}
```

### 7.26 `battleMedal` Object — Struktur (L119555)

```
{
  _id: string,
  _battleMedalId: string,
  _cycle: number,
  _nextRefreshTime: number,
  _level: number,
  _curExp: number,
  _openSuper: boolean,
  _buyLevelCount: number,
  _task: {
    [key: string]: {
      _id: number,
      _curCount: number,
      _haveGotReward: boolean
    }
  },
  _levelReward: {
    [key: string]: {
      _gotNormal: boolean,
      _gotSuper: boolean
    }
  },
  _shopBuyTimes: { [key: string]: number }
}
```

### 7.27 `userGuild` Object — Struktur (L124362, L135729)

```
{
  _guildId: string,               // optional
  _requestedGuild: [any],         // optional, array
  _satanGift: any,                // optional
  _haveReadBulletin: any,         // optional
  _canJoinGuildTime: number,      // optional
  _createGuildCD: number,         // optional
  _ballWarJoin: any,
  _tech: {
    [techType: string]: {
      _totalLevel: number,
      _totalCost: { _items: [{ _id: number, _num: number }] },
      _techItems: {
        [itemId: string]: {
          _level: number,
          _parent: number,
          _attrs: { _items: [{ _id: number, _num: number }] }
        }
      }
    }
  }
}
```

### 7.28 `userGuildPub` Object — Struktur (L124362)

> Struktur sama seperti `userGuild` (keduanya diproses oleh `setUserTeamInfoModel`).
> Bedanya: `userGuildPub` TIDAK memicu `saveGuildTech` (hanya `userGuild` yang punya `_tech`).

### 7.29 `warInfo` Object — Struktur (L132840)

```
{
  _rank64: [WarGroup],            // array of WarGroup
  _rank16: [WarGroup],            // array of WarGroup
  _rank4: WarGroup,               // single WarGroup
  _rank2: WarBattle,              // single WarBattle
  _users: { [userId: string]: WarUserData },
  // + any common-type _prefix fields
}
```

### 7.30 `ballWarInfo` Object — Struktur (L85159)

```
{
  _signed: boolean,               // default: false
  _fieldId: string,               // default: ''
  _point: number,                 // default: 0
  _topMsg: string,                // default: ''
  // + any other _prefix primitive fields auto-mapped
}
```

### 7.31 `userTopBattle` Object — Struktur (L125685)

```
{
  _id: string,
  _teams: object,                 // raw copy, no sub-deserialize
  _teamTag: string,
  _nextSetTeamTime: number,
  _lastPoint: number,
  _records: [{
    _attack: boolean,             // default: true
    _win: boolean,                // default: false
    _time: number,                // default: 0
    _enemyHeadImage: string,
    _enemyLevel: number,
    _enemyName: string,
    _enemyPoint: number,
    _point: number,
    _pointChange: number,
    _battles: [{ _battleId, _win, _left: {}, _right: {} }]
  }],
  _history: [any],                // raw array
  _bet: { [group: string]: [WarBet] },
  _liked: boolean,
  _gotRankReward: [any]
}
```

### 7.32 `topBattleInfo` Object — Struktur (L125767)

```
{
  topBattleInfo: TopBattleArea,   // ⚠️ NO underscore! Special handling
  topUserInfo: { [userId: string]: UserSimpleInfo },
  lastChampion: UserSimpleInfo,
  _season: number,                // ⚠️ maps to _season (getter adds offSeason)
  // + other common-type fields (preserved as-is, no substring(1))
}
```
⚠️ **QUIRK**: `TopBattleInfoModel.deserialize` uses `this[t] = n` (NO underscore strip) for common types!

### 7.33 `onlineBulletin` Object — Struktur (L92127)

> ⚠️ **ARRAY**, bukan object! Langsung di-iterasi.

```
[
  {
    _startTime: number,
    _endTime: number,
    _info: string,
    _interval: number,
    _duration: number
  },
  ...
]
```

### 7.34 `summonLog` Object — Struktur (L95230)

> ⚠️ Diakses via `e.summonLog` (top-level key), bukan `e.summonLog.summonLog`.

```
{
  summonLog: {                     // ← inner key also called summonLog
    [key: string]: {
      _userId: string,
      _userName: string,
      _heroDisplayId: number,
      _time: number
    }
  }
}
```

### 7.35 `vipLog` Array — Struktur (L126098)

```
[
  { _displayId: number, _userName: string },
  ...
]
```

### 7.36 `cardLog` Array — Struktur (L126212)

```
[
  { _cardId: number, _userName: string },   // _cardId = MONTH_CARD_TYPE enum
  ...
]
```

### 7.37 `blacklist` Object — Struktur (L92031)

```
{ [key: string]: <playerInfo> }    // dict of player info objects, values pushed ke array
```

### 7.38 `dragonEquiped` Object — Struktur (L118500)

```
{
  [dragonBallId.toString()]: any   // Keys: "151"-"157" (ONESTAR-SEVENSTAR)
}
```
> ⚠️ Hanya key presence yang dicek, value diabaikan!
> Dragon Ball IDs: 151=OneStar, 152=TwoStar, 153=ThreeStar, 154=FourStar, 155=FiveStar, 156=SixStar, 157=SevenStar

### 7.39 `monthCard` Object — Struktur (L126202)

```
{
  _id: string,
  _card: {
    [cardId: string]: {
      _endTime: number
    }
  }
}
```

### 7.40 `recharge` Object — Struktur (L126193)

```
{
  _id: string,
  _haveBought: { [key: string]: any }    // dict of purchase flags
}
```

### 7.41 `userDownloadReward` Object — Struktur (L114814)

```
{
  _isClick: boolean,             // default: false
  _haveGotDlReward: boolean,     // default: false
  _isBind: any,
  _haveGotBindReward: any
}
```

### 7.42 `clickSystem` Object — Struktur (L114795)

```
{
  _clickSys: { [key: string]: any }    // dict of click system data
}
```

### 7.43 `gemstone` Object — Struktur (L131752, L132182)

```
{
  _items: {
    [key: string]: {
      _id: number,
      _displayId: number,
      _heroId: string,
      _level: number,
      _totalExp: number,
      _version: string
    }
  }
}
```

### 7.44 `resonance` Object — Struktur (L135270)

```
{
  _id: any,
  _diamondCabin: any,
  _buySeatCount: any,
  _totalTalent: any,
  _unlockSpecial: any,
  _cabins: {
    [cabinId: string]: {
      _id: any,
      _mainHero: any,
      _diamondSeat: any,
      _specialSeat: any,
      _seats: { [seatId: string]: any }
    }
  }
}
```

### 7.45 `fastTeam` Object — Struktur (L133674)

```
{
  _teamInfo: {
    [teamId: string]: {
      _team: object,
      _superSkill: [any],
      _name: string
    }
  }
}
```

### 7.46 `timeMachine` Object — Struktur (L95912, L95942)

```
{
  _items: {
    [machineId: string]: {
      _level: number,               // default: 0
      _heroId: string,              // default: ''
      _heroDisplayId: number,       // default: 0
      _timeType: number,            // TIME_MACHINE_TIME_TYPE: 0=UNKNOWN, 1=6H, 2=12H, 3=24H
      _finishTime: number           // default: 0
    }
  }
}
```

### 7.47 `_arenaTeam` Object — Struktur (L119258)

> ⚠️ **ARRAY of exactly 5 slots**, bukan object!

```
[
  { _id: heroId } | undefined,     // slot 0
  { _id: heroId } | undefined,     // slot 1
  { _id: heroId } | undefined,     // slot 2
  { _id: heroId } | undefined,     // slot 3
  { _id: heroId } | undefined      // slot 4
]
```
Undefined slots → client stores `null`. Exactly 5 iterations (hardcoded `n < 5`).

### 7.48 `_arenaSuper` Object — Struktur (L119267)

```
[
  { _id: heroId },
  ...
]
```

### 7.49 `littleGame` Object — Struktur (L121000)

```
{
  _gotBattleReward: any,          // map of battle reward flags
  _gotChapterReward: any,         // map of chapter reward flags
  _clickTime: number              // optional, default: 0
}
```

### 7.50 `gravity` Object — Struktur (L125981)

> Dua form diterima client:
> - Dari enterGame: `e.gravity` → assigned directly as `_gravityTrialInfo`
> - Dari server push: `e._model` → assigned directly as `_gravityTrialInfo`
> Struktur internal: object, detail spesifik belum diperlukan untuk new user (bisa `{}`).

### 7.51 `timeTrial` Object — Struktur (L123818)

```
{
  _id: string,
  _level: number,                  // default: 1
  _totalStars: number,             // ⚠️ maps to _totalStars (NOT totalStars)
  _haveTimes: number,              // default: 0
  _timesStartRecover: number,      // default: 0
  _lastRefreshTime: number,        // default: 0
  _startTime: number,              // default: 0
  _levelStars: { [key: string]: number },
  _gotStarReward: { [key: string]: boolean }
}
```
`timeTrialNextOpenTime` (top-level key #77) = number, passed as 2nd arg.

### 7.52 `teamDungeon` Object — Struktur (L136680)

```
{
  _myTeam: any,                   // teamId
  _canCreateTeamTime: number,
  _nextCanJoinTime: number
}
```

### 7.53 `teamDungeonTask` Object — Struktur (L124761)

```
{
  _dailyRefreshTime: number,
  _achievement: {
    [dungeonType: string]: {
      _version: string,
      _tasks: {
        [key: string]: {
          _id: number,
          _curCount: number,
          _haveGotReward: boolean
        }
      }
    }
  },
  _daily: {
    [key: string]: {
      _id: number,
      _curCount: number,
      _haveGotReward: boolean
    }
  }
}
```

### 7.54 `teamTraining` Object — Struktur (L136062)

```
{
  _id: string,
  _levels: { [key: string]: number },
  _unlock: boolean,
  _version: string
}
```

### 7.55 `timeBonusInfo` Object — Struktur (L125109)

```
{
  _id: any,
  _timeBonus: {
    [giftId: string]: {
      _endTime: number,
      _isBuy: boolean,
      _buyRemian: number,
      _thingsId: number
    }
  }
}
```
⚠️ Client filters: hanya push jika `(_buyRemian > 0) || (!_isBuy)`. Sort by `_endTime` desc.

### 7.56 `YouTuberRecruit` Object — Struktur (L96636)

```
{
  _id: any,
  _image: string,
  _content: string,
  _reward: any,
  _mailAddr: string,
  _jumpLink: [
    { _icon: any, _linkUrl: string },
    ...
  ]
}
```

### 7.57 `userYouTuberRecruit` Object — Struktur (L96653)

```
{
  _gotReward: boolean,            // default: false
  _hasJoin: boolean               // default: false
}
```

### 7.58 `channelSpecial` Object — Struktur (L114795, L114846)

```
{
  _hideHeroes: [heroId, ...],     // populated by setHideHeroes
  _honghuUrl: string,             // optional
  _honghuUrlStartTime: number,    // optional
  _honghuUrlEndTime: number       // optional
}
```

### 7.59 `guildActivePoints` Object — Struktur (L124234)

```
{ [key: string]: number }         // dict of activity point categories
```

### 7.60 New User Minimal Values (non-object keys)

| Key | Type | New User Default |
|-----|------|-----------------|
| `serverVersion` | string | `""` (display-only, no comparison) |
| `serverId` | number | Dari server config |
| `serverOpenDate` | number | `Date.now()` |
| `newUser` | boolean | `true` |
| `currency` | string | `"USD"` |
| `backpackLevel` | number | `0` |
| `ballWarState` | number | `0` |
| `enableShowQQ` | boolean | `false` |
| `showQQVip` | number | `0` |
| `showQQ` | number | `0` |
| `showQQImg1` | string | `""` |
| `showQQImg2` | string | `""` |
| `showQQUrl` | string | `""` |
| `cellgameHaveSetHero` | boolean | `false` |
| `globalWarBuffTag` | string | `""` |
| `globalWarLastRank` | object | `null` |
| `globalWarBuff` | number | `0` |
| `globalWarBuffEndTime` | number | `0` |
| `guildLevel` | number | `0` |
| `guildTreasureMatchRet` | number | `0` (UNKNOW) |
| `guildName` | string | `""` |
| `templeLess` | number | `0` |
| `timeTrialNextOpenTime` | number | `0` |
| `heroImageVersion` | number | `0` |
| `superImageVersion` | number | `0` |
| `karinStartTime` | number | `0` |
| `karinEndTime` | number | `0` |
| `teamServerHttpUrl` | string | `""` |
| `teamDungeonOpenTime` | number | `0` |
| `myTeamServerSocketUrl` | string | `""` |
| `shopNewHeroes` | object | `null` |
| `forbiddenChat` | object | `null` |
| `broadcastRecord` | array | `[]` |
| `questionnaires` | object | `null` |

---

## 8. HANDLER YANG AKAN DATANG — Referensi

> Handler di bawah dibuat & di-router **SETELAH enterGame SEMPURNA**.

### 8.1 `user/registChat`

**Request:** `{ type:'user', action:'registChat', userId, version:'1.0' }`
**Response:** `{ _success: true, _chatServerUrl: "<server config>", _worldRoomId: "<server config>", _guildRoomId: "<server config>", _teamDungeonChatRoom: "<server config>" }`
**Client:** Retry 3s, max 15x. `_success === true` → connect chatServerUrl.

### 8.2 `user/getBulletinBrief`

**Request:** `{ type:'user', action:'getBulletinBrief', userId, version:'1.0' }`
**Response:** `{ _brief: { [id]: { title, version, order } } }`

### 8.3 `heroImage/getAll`

**Request:** `{ type:'heroImage', action:'getAll', userId, version:'1.0' }`
**Response:** `{ _heros: { [displayId]: { _id, _maxLevel, _selfComments } } }`

### 8.4 `hero/getAttrs`

**Request:** `{ type:'hero', action:'getAttrs', userId, heros:[heroIdList], version:'1.0' }`
**Response:** `{ _attrs: { [index]: { _items: [{_id,_num}] } }, _baseAttrs: { [index]: { _items: [{_id,_num}] } } }`

### 8.5 `userMsg/getMsgList`

**Request:** `{ type:'userMsg', action:'getMsgList', userId, version:'1.0' }`
**Response:** `{ _brief: { [friendId]: { /* message brief */ } } }`

### 8.6 `entrust/getInfo` & `entrust/reset`

**Request getInfo:** `{ type:'entrust', action:'getInfo', userId, version:'1.0' }`
**Request reset:** `{ type:'entrust', action:'reset', userId }`
**Response:** Akan dianalisa saat handler dibuat.

---

## 9. NOTIFY HANDLING

### 9.1 Server → Client Push

```javascript
socket.emit('Notify', {
    ret: 'SUCCESS',           // ⚠️ STRING
    data: JSON.stringify({ action: '<actionType>', ... }),
    compress: false
});
```

### 9.2 Client Notify Processing (L114210-114239)

```javascript
// 1. ret === 'SUCCESS' (string) → 2. compress? decompress → 3. JSON.parse
// 4. action='Kickout' → destroy semua socket, runScene('Login')
// 5. ts.notifyData(o) → scene.notify(o)
```

### 9.3 Notification Actions

| Action | Kapan | Priority |
|--------|-------|----------|
| `Kickout` | Force disconnect | **WAJIB** |
| `payFinish` | Payment berhasil | **WAJIB** |
| `itemChange` | Item/currency berubah | PERLU |
| `vipLevel` | VIP level naik | PERLU |
| `notifySummon` | Hero summoned | PERLU |
| `scheduleModelRefresh` | Daily reset | PERLU |
| `monthCard` | Month card update | NANTI |
| `onlineBulletin` | Announcement | NANTI |

---

## 10. ERROR CODES

Dari `resource/json/errorDefine.json`:

| Code | errorType | Kapan | Client Action |
|------|-----------|-------|---------------|
| 0 | SUCCESS | Request berhasil | Lanjut |
| 1 | ERROR_UNKNOWN | Error umum | ShowErrorTips |
| 3 | ERROR_DATA_ERROR | Data corrupt | ShowErrorTips |
| 4 | ERROR_INVALID | Data tidak valid | ShowErrorTips |
| 8 | ERROR_LACK_PARAM | Parameter kurang | ShowErrorTips |
| 22 | — | Battle error | reportBattleLog |
| 29 | IP_NOT_IN_WHITE_LIST | IP diblokir | ShowErrorTips |
| 37 | ERROR_NO_LOGIN_CLIENT | User tidak ditemukan | ShowErrorTips |
| 38 | — | Session invalid | **FORCE RELOAD** |
| 41 | PARAM_ERR | Parameter error | ShowErrorTips |
| 45 | FORBIDDEN_LOGIN | Akun dilarang | ShowErrorTips |
| 55 | SIGN_ERROR | Security code salah | ShowErrorTips |
| 61 | ONLINE_USER_MAX | Server penuh | ShowErrorTips |
| 62 | CLIENT_VERSION_ERR | Versi tidak cocok | ShowErrorTips |
| 65 | MAINTAIN | Maintenance | ShowErrorTips |

---

## 11. DATABASE: PURE LOCALSTORAGE API

### 11.1 Konsep

- **HAR files = alat bantuan analisa**, BUKAN sumber data
- **Resource/json = static config** — read-only
- **Database dimulai KOSONG** — terisi natural melalui server logic
- **Pure LocalStorage API** — setItem/getItem/removeItem pattern

### 11.2 db.js API

```javascript
class DB {
    constructor(prefix)              // prefix = 'ms_'
    setItem(key, value)              // JSON.stringify auto
    getItem(key)                     // JSON.parse auto, return null jika tidak ada
    removeItem(key)                  // Hapus data
    getUser(userId)                  // getItem('user_' + userId)
    saveUser(userId, data)           // setItem('user_' + userId, data)
    userExists(userId)               // getItem !== null
    createUser(userId, data)         // saveUser jika belum ada
}
```

### 11.3 User Data Storage Key Pattern

```
ms_user_{userId}         → Full user data object (semua 99 keys)
ms_schedule_{userId}     → Schedule data (jika perlu terpisah)
ms_global                → Global server state
```

---

## 12. FILE STRUCTURE — PONDASI AWAL

> **HANYA file di bawah ini yang dibuat untuk pondasi awal.**

```
server/main-server/
├── package.json                    # Dependencies: socket.io@2.5.1, lz-string, uuid
├── config.js                       # Port, paths, server settings
├── index.js                        # Main entry: Socket.IO + TEA + handler.process router
├── tea.js                          # XXTEA encrypt/decrypt (dari scratch)
├── db.js                           # Pure LocalStorage API
├── logger.js                       # Logging utility
├── handlers/
│   └── user/
│       └── enterGame.js            # SATU-SATUNYA handler pondasi awal
└── resource/json → /var/www/html/resource/json   # Symlink ke config static
```

---

## 13. CONFIG — DIVERIFIKASI DARI main.min.js & constant.json

```javascript
module.exports = {
    port: 8001,                                     // config
    host: '0.0.0.0',
    dbPrefix: 'ms_',
    sdkDbFile: '../sdk-server/data/sdk.db',          // Read-only: user validation
    loginDbFile: '../login-server/data/login_server.db', // Read-only: loginToken
    secretKey: 'SUPER_WARRIOR_Z_SDK_SECRET_2026',
    teaKey: 'verification',                          // L82582
    serverVersion: '',                               // Display-only string, L96070. Tidak ada comparison.
    serverId: 1,                                     // Dari server list config (integer), L114417
    serverOpenDate: Date.now(),                      // Akan diganti saat deploy
    currency: 'USD',                                 // L114795+L83816 — key ke currencyDisplay.json
                                                     // Valid values: "CNY", "USD", "KRW", "VND", "IRR"
    compressionThreshold: 1024,                      // L39134
    server0Time: 25200000,                           // L116952 — UTC+7 offset ms
    language: 'en',                                  // Default, override oleh request
    os: 'Android',                                   // Default, override oleh request
    version: '1.0',                                  // L114430 — SELALU '1.0'
    gameVersion: '2026-03-02143147',                 // Dari resource/properties/clientversion.json
    // ❌ REMOVED: vipLevelVersion — TIDAK ADA di client code!
    // ❌ REMOVED: pwd — Tidak ada default di client, server decides
};
```

### Config Verification Summary

| Value | Status | Evidence |
|-------|--------|----------|
| `port: 8001` | ✅ | config |
| `teaKey: 'verification'` | ✅ | L82582 |
| `compressionThreshold: 1024` | ✅ | L39134, L40757 |
| `server0Time: 25200000` | ✅ | L116952 — UTC+7 offset |
| `serverVersion: ''` | ✅ | L96070 — display-only, no comparison |
| `currency: 'USD'` | ✅ | L83816 — key into currencyDisplay.json |
| `version: '1.0'` | ✅ | L114430 |
| `gameVersion` | ✅ | clientversion.json: `"2026-03-02143147"` |
| `vipLevelVersion` | ❌ REMOVED | NOT FOUND in client code |
| `pwd` | ❌ REMOVED | No client default, server decides |

---

## 14. NEW USER LOGIC — Di Dalam enterGame.js

### 14.1 Deteksi User Baru

```javascript
const existingData = db.getUser(userId);
const isNewUser = !existingData;  // null = belum ada = user baru
```

### 14.2 Default Values dari resource/json/constant.json (DIVERIFIKASI)

> ⛔ **VALUE TIDAK DARI HAR!** Semua default value dari resource/json + server logic.

| Parameter | Value | Source |
|-----------|-------|--------|
| `startUserLevel` | 1 | constant.json |
| `startUserExp` | 0 | constant.json |
| `startDiamond` | 0 | constant.json |
| `startGold` | 0 | constant.json |
| `startHero` | "1205" | constant.json |
| `startHeroLevel` | "3" | constant.json |
| `startChapter` | 801 | constant.json |
| `startLesson` | 10101 | constant.json |
| `startMana` | 50 | constant.json |
| `playerIcon` | "hero_icon_1205" | constant.json |
| `resetTime` | "6:00:00" | constant.json |
| `idle` | 28800 (8 jam) | constant.json |
| `maxUserLevel` | 300 | constant.json |
| `goldBuyTimesMax` | 10 | constant.json |
| `goldBuyFree` | 20 | constant.json |

### 14.3 Resource JSON — SUMBER UTAMA Default Values

| File | Digunakan Untuk |
|------|----------------|
| `constant.json` | Starting values (level, diamond, gold, hero, lesson, etc.) |
| `hero.json` | Starter heroes (displayId, initial level, star, attrs) |
| `item.json` / `thingsID.json` | Item definitions, starting amounts |
| `summon.json` | Summon pool config, energy, logic |
| `dungeon.json` / `dungeonTimesBuy.json` | Dungeon type definitions, times |
| `lesson.json` / `chapter.json` | Starting lesson, chapter structure |
| `schedule.json` (various) | Schedule times config per feature |
| `equip.json` / `equipSuit.json` | Equipment config |
| `errorDefine.json` | Error codes (referensi saja) |
| `currencyDisplay.json` | Currency format per region |
| `goldBuy.json` | Gold buy tiers (51 levels, first free) |
| `register.json` | Sign-in reward calendar (6 cycles x 30 days) |
| `vipUpgrade.json` | VIP level upgrade config |

> **PRINSIP**: Setiap value di buildNewX() harus bisa ditelusuri ke sumbernya.
> Jika tidak ada di resource/json dan tidak ada di config → TANYA DULU.

---

## 15. enterGame.js — LOGIC FLOW

```
1. Terima request { type:'user', action:'enterGame', loginToken, userId, serverId, version, language, gameVersion }

2. Validasi:
   a. Socket sudah TEA-verified? → jika tidak, return {ret:38}
   b. loginToken valid? → cek ke login-server DB (read-only)
   c. userId cocok dengan loginToken? → jika tidak, return {ret:55}
   d. serverId cocok? → jika tidak, return {ret:4}

3. Cek user exists:
   a. db.getUser(userId) → null = new user, object = existing user

4. Jika NEW USER:
   a. Bangun semua 99 keys data default (inline, lihat §14)
   b. newUser = true
   c. db.saveUser(userId, fullData)

5. Jika EXISTING USER:
   a. Load data dari db
   b. Update _offlineTime = _lastLoginTime
   c. Update _lastLoginTime = Date.now()
   d. newUser = false
   e. db.saveUser(userId, updatedData)

6. Bangun response:
   a. jsonData = JSON.stringify(userData)
   b. Jika jsonData.length > 1024 → compress = true, data = LZString.compressToUTF16(jsonData)
   c. Jika tidak → compress = false, data = jsonData

7. Return response:
   {
       ret: 0,
       data: data,
       compress: compress,
       serverTime: Date.now(),
       server0Time: config.server0Time
   }
```

---

## 16. ENUM REFERENCE — Konstanta Client (Dari main.min.js)

### 16.1 Currency/Attribute IDs (L116237)

| Constant | Value | Nama |
|----------|-------|------|
| DIAMONDID | 101 | Diamond |
| GOLDID | 102 | Gold |
| PLAYEREXPERIENCEID | 103 | Player Exp |
| PLAYERLEVELID | 104 | Player Level |
| PLAYERVIPEXPERIENCEID | 105 | VIP Exp |
| PLAYERVIPLEVELID | 106 | VIP Level |
| PLAYERVIPEXPALLID | 107 | VIP Total Exp |

### 16.2 Dragon Ball IDs (L116249)

| Constant | Value |
|----------|-------|
| ONESTARBALLID | 151 |
| TWOSTARBALLID | 152 |
| THREESTARBALLID | 153 |
| FOURSTARBALLID | 154 |
| FIVESTARBALLID | 155 |
| SIXSTARBALLID | 156 |
| SEVENSTARBALLID | 157 |

### 16.3 DUNGEON_TYPE (L92518)

| Key | Value |
|-----|-------|
| DT_NULL | 0 |
| EXP | 1 |
| EVOLVE | 2 |
| ENERGY | 3 |
| EQUIP | 4 |
| SINGA | 5 |
| SINGB | 6 |
| METAL | 7 |
| Z_STONE | 8 |

### 16.4 LAST_TEAM_TYPE (L96493)

| Key | Value | Key | Value |
|-----|-------|-----|-------|
| FRIEND | 1 | GUILD_TREASURE | 8 |
| TRAINING | 2 | HANGUP | 9 |
| BOSS_COMPETITION_BOSS | 3 | KARIN | 10 |
| BOSS_COMPETITION_OWNER | 4 | MAHA | 11 |
| ARENA | 5 | MINE | 12 |
| DUNGEON | 6 | SNAKE | 13 |
| GUILD_BOSS | 7 | STRONG_ENEMY | 14 |
| | | TEMPLE | 15 |
| | | TIME_MACHINE | 16 |
| | | DRAGON_BALL_WAR | 17 |
| | | MERGE_BOSS | 18 |
| | | EXPEDITION | 19 |
| | | TOP_BATTLE_1 | 20 |
| | | TOP_BATTLE_2 | 21 |
| | | TOP_BATTLE_3 | 22 |
| | | TIME_TRIAL | 23 |
| | | GRAVITY_TRIAL | 24 |

### 16.5 MONTH_CARD_TYPE (L137279)

| Key | Value |
|-----|-------|
| MCT_NULL | 0 |
| SHORT | 1 |
| LONG | 2 |
| NO_LIMIT | 3 |
| EVO_MONTHCARD | 4 |

### 16.6 WEAPON_QUAILTY (L137182, typo in source)

| Key | Value |
|-----|-------|
| WQ_NULL | 0 |
| GREEN | 1 |
| BLUE | 2 |
| PURPLE | 3 |
| ORGANE | 4 |
| RED | 5 |

### 16.7 TIME_MACHINE_TIME_TYPE (L95960)

| Key | Value |
|-----|-------|
| UNKNOWN | 0 |
| HOUR_6 | 1 |
| HOUR_12 | 2 |
| HOUR_24 | 3 |

### 16.8 GUILD_TREASURE_MATCH_RET (L133162)

| Key | Value |
|-----|-------|
| UNKNOW | 0 |
| SUCCESS | 1 |
| LEVEL_NOT_ENOUGH | 2 |
| MEMBER_NOT_ENOUGH | 3 |
| GUILD_NOT_ENOUGH | 4 |

### 16.9 SIGN_TYPE_EX (L123482)

| Key | Value |
|-----|-------|
| ST_NULL | 0 |
| TURTLE | 1 |
| GOD | 2 |
| DEMON | 3 |
| WORLD | 4 |
| WU | 5 |
| ALL | 6 |

### 16.10 SignQuality (L123493)

| Key | Value |
|-----|-------|
| ST_NULL | 0 |
| GREEN | 1 |
| BLUE | 2 |
| PURPLE | 3 |
| ORANGE | 4 |

---

## 17. SERIALIZABLE PATTERN — Pola Deserialisasi Universal Client

> Semua `deserialize()` method di client mengikuti pola yang sama (L82357):

```javascript
// isCommonType gate (L82357):
e.prototype.isCommonType = function(t) {
    var n = typeof t;
    return n == 'string' || n == 'number' || n == 'boolean';
};

// Universal deserialize pattern:
t.prototype.deserialize = function(e) {
    for (var t in e) {
        var n = e[t];
        if ('_specificKey' == t) {
            // Special handling for complex sub-objects/arrays
        } else {
            this.isCommonType(n) && (this[t.substring(1)] = n);
            // Strips leading '_' and assigns: _foo → this.foo
        }
    }
};
```

**Aturan universal:**
1. Server-side key = `_fieldName` (selalu underscore prefix)
2. Client maps → `this.fieldName` (strip leading `_`)
3. Hanya `string | number | boolean` yang auto-map via `isCommonType`
4. Objects & arrays memerlukan explicit handling di `if` branch
5. `{ _items: [{ _id, _num }] }` = pola atom untuk attribute arrays (BasicItem)
6. Beberapa exceptions: `timesInfo` keys TIDAK pakai underscore, `headEffect.curBox/curEffect` TIDAK pakai underscore

---

## 18. SAVEUSERDATA PARSER — EXACT FLOW (L114793-114955)

> Ini adalah urutan EKSAK pemrosesan 99 keys di client.
> Server harus mengirim semua key yang diperlukan SEBELUM key yang memprosesnya.

```
1.  ts.currency = e.currency
2.  setUserInfo(e)                      → e.user → UserInfoSingleton
3.  setOnHook(e)                        → e.hangup + e.globalWarBuffTag/LastRank/Buff/BuffEndTime
4.  setSummon(e)                        → e.summon
5.  setBackpack(e)                      → e.totalProps._items + e.backpackLevel
6.  setSign(e)                          → e.imprint._items
7.  setEquip(e)                         → e.equip._suits + e.weapon._items + e.genki
8.  setCounterpart(e)                   → e.dungeon._dungeons
9.  setTeamTechnology(e)                → e.userGuild._tech
10. setTeamTraining(e)                  → e.teamTraining
11. SuperSkillSingleton.initSuperSkill  → e.superSkill._skills
12. HerosManager.setSkinData            → e.heroSkin._skins + _curSkin
13. HerosManager.readByData             → e.heros._heros
14. SummonSingleton.setSummomLogList    → e.summonLog
15. setTeam(e)                          → e.userGuild + e.userGuildPub + e.guildLevel + e.guildTreasureMatchRet
16. setMainTask(e)                      → e.curMainTask
17. setSignIn(e)                        → e.checkin
18. MailInfoManager.getBulletinBrief    → (auto-request, no data from e)
19. channelSpecial = e.channelSpecial
20. e.cellgameHaveSetHero → e.scheduleInfo._cellgameHaveSetHero (INJECT before initData!)
21. AllRefreshCount.initData            → e.scheduleInfo (all 40+ fields)
22. ItemsCommonSingleton.initDragonBallEquip → e.dragonEquiped
23. WelfareInfoManager.setVipLogList    → e.vipLog
24. WelfareInfoManager.setMonthCardLogList → e.cardLog
25. GuideInfoManager.setGuideInfo       → e.guide._id + _steps
26. TeamInfoManager.setTeamName         → e.guildName
27. UserClickSingleton.setClickSys      → e.clickSystem._clickSys
28. WelfareInfoManager.setGotChannelWeeklyRewardTag → e.giftInfo
29. WelfareInfoManager.setFirstRecharge → e.giftInfo._fristRecharge
30. WelfareInfoManager.setVIPRewrd      → e.giftInfo._haveGotVipRewrd
31. WelfareInfoManager.setVIPPrerogativeGift → e.giftInfo._buyVipGiftCount
32. WelfareInfoManager.setOnlineGift    → e.giftInfo._onlineGift
33. UserInfoSingleton.gotBSAddToHomeReward → e.giftInfo._gotBSAddToHomeReward
34. hongHuGiftModel                     → e.giftInfo._clickHonghuUrlTime
35. WelfareInfoManager.setMonthCardInfo → e.monthCard._id + _card
36. WelfareInfoManager.setRechargeInfo  → e.recharge._id + _haveBought
37. TimesInfoSingleton.initData         → e.timesInfo (12 fields, NO underscore)
38. UserInfoSingleton.userDownloadModel → e.userDownloadReward
39. YouTuberRecruitModel.setData        → e.YouTuberRecruit (if !_hidden)
40. YouTuberRecruitModel.initUserInfo   → e.userYouTuberRecruit
41. TimeLeapSingleton.initData          → e.timeMachine._items
42. AltarInfoManger.setArenaTeamInfo    → e._arenaTeam (array of 5)
43. AltarInfoManger.setArenaSuperInfo   → e._arenaSuper (array)
44. TimeLimitGiftBagManager.setTimeLimitGiftBag → e.timeBonusInfo
45. BulletinSingleton.setBulletInfo     → e.onlineBulletin (array)
46. TowerDataManager.setKarinTime       → e.karinStartTime, e.karinEndTime
47. UserInfoSingleton.serverVersion     → e.serverVersion
48. UserInfoSingleton.setServerOpenDate → e.serverOpenDate
49. UserInfoSingleton.firstLoginSetMyTeam → e.lastTeam._lastTeamInfo
50. UserInfoSingleton.heroImageVersion  → e.heroImageVersion
51. UserInfoSingleton.superImageVersion → e.superImageVersion
52. PadipataInfoManager.setPadipataModel → e.training
53. GlobalWarManager.setWarLoginInfo    → e.warInfo
54. GlobalWarManager.setUserWarModel    → e.userWar
55. UserInfoSingleton.setServerId       → e.serverId
56. HeadEffectModel.deserialize         → e.headEffect._effects + curBox + curEffect
57. TeamInfoManager.UserBallWar         → e.userBallWar
58. TeamInfoManager.BallWarState        → e.ballWarState
59. TeamInfoManager.setBallWarBrodecast → e.ballBroadcast
60. GuildBallWarInfo.deserialize        → e.ballWarInfo._signed + _fieldId + _point + _topMsg
61. TeamInfoManager.setActivePoints     → e.guildActivePoints
62. WelfareInfoManager.enableShowQQ     → e.enableShowQQ
63-68. showQQVip, showQQ, showQQImg1/2, showQQUrl
69. WelfareInfoManager.setHideHeroes    → e.hideHeroes
70. channelSpecial._honghuUrl/StartTime/EndTime → e.channelSpecial._honghuUrl etc.
71. ExpeditionManager.setExpeditionModel → e.expedition
72. SpaceTrialManager.setSpaceTrialModel → e.timeTrial + e.timeTrialNextOpenTime
73. GetBackReourceManager.setRetrieveModel → e.retrieve
74. BattleMedalManager.setBattleMedal   → e.battleMedal
75. ShopInfoManager.shopNewHero         → e.shopNewHeroes
76. TeamworkManager.setLoginInfo        → e.teamDungeon._myTeam + _canCreateTeamTime + _nextCanJoinTime
77. TeamworkManager.teamServerHttpUrl   → e.teamServerHttpUrl
78. TeamworkManager.teamDungeonOpenTime → e.teamDungeonOpenTime
79. TeamworkManager.teamDungeonTask     → e.teamDungeonTask
80. TeamworkManager.SetTeamDungeonBroadcast → e.teamDungeonSplBcst (spl=true)
81. TeamworkManager.SetTeamDungeonBroadcast → e.teamDungeonNormBcst (spl=false)
82. TeamworkManager.setTeamDungeonHideInfo → e.teamDungeonHideInfo
83. TrialManager.setTempleLess          → e.templeLess
84. TeamworkManager.teamDungeonInvitedFriends → e.teamDungeonInvitedFriends
85. ts.loginInfo.serverItem.dungeonurl  → e.myTeamServerSocketUrl
86. EquipInfoManager.saveGemStone       → e.gemstone._items
87. UserInfoSingleton.setQuestData      → e.questionnaires
88. HerosManager.setResonanceModel      → e.resonance
89. TopBattleManager.setTopBattleLoginInfo → e.userTopBattle + e.topBattleInfo
90. HerosManager.saveLoginFastTeam      → e.fastTeam._teamInfo
91. BroadcastSingleton.setBlacklistPlayerInfo → e.blacklist
92. BroadcastSingleton.setUserBidden    → e.forbiddenChat
93. TrialManager.setGravityTrialInfo    → e.gravity
94. LittleGameManager.saveData          → e.littleGame._gotBattleReward + _gotChapterReward + _clickTime
```

⚠️ **CRITICAL ORDER DEPENDENCY**: Step 20 (cellgameHaveSetHero inject) MUST happen BEFORE step 21 (scheduleInfo.initData).
