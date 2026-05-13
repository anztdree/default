```
[DB] Chat database ready: /var/www/html/server/chat-server/data/chat_server.db
[DB] Main-server data path: /var/www/html/server/main-server/data/main_server.json

  ╔════════════════════════════════════════════════════════════╗
  ║  SUPER WARRIOR Z — CHAT SERVER v2.0                        ║
  ╚════════════════════════════════════════════════════════════╝



  ─  ─  ─  ─  ─  ─  ─  ─  ─  ─  ─  ─  ─  ─  ─  ─  ─  ─  ─  ─  ─  ─  ─  ─  ─  ─  ─  ─  ─  ─


🟢 02:08:22.125 INFO  ⚙️ HANDLER  ▸ Registered action handlers:

  ├ >> chat::login  handlers/chat/login.js
  ├ >> chat::joinRoom  handlers/chat/joinRoom.js
  ├ >> chat::leaveRoom  handlers/chat/leaveRoom.js
  ├ >> chat::sendMsg  handlers/chat/sendMsg.js
  └ >> chat::getRecord  handlers/chat/getRecord.js


  ─  ─  ─  ─  ─  ─  ─  ─  ─  ─  ─  ─  ─  ─  ─  ─  ─  ─  ─  ─  ─  ─  ─  ─  ─  ─  ─  ─  ─  ─


🟢 02:08:22.130 INFO  🚀 SERVER   ▸ Ready — listening on http://127.0.0.1:8002
🟢 02:08:22.130 INFO  🚀 SERVER   ▸ Waiting for Socket.IO connections...


  ➕ NEW CONNECTION ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─
🟢 02:08:49.283 INFO  🔐 TEA      ▸ Sending verify challenge
🟢 02:08:49.318 INFO  🔐 TEA      ▸ TEA verification SUCCESS

  📤 chat::login            ──────────────────────────────────
  [ 1/ 2] 🔄 Chat login  █░
  [ 1/ 2] ✅ Chat login  █░  session updated
  [ 2/ 2] 🔄 Sync profile  ██
  [ 2/ 2] ✅ Sync profile  ██  nick="New Userce9e" image="hero_icon_1205"
✅ chat::login            OK     ────────────────────────────
  └ ret=0 2 chars (raw) 12ms

  📤 chat::joinRoom         ──────────────────────────────────
  [ 1/ 2] 🔄 Join room  █░
  [ 1/ 2] ✅ Join room  █░  roomId="world_1"
  [ 2/ 2] 🔄 Build room history  ██
  [ 2/ 2] ✅ Build room history  ██  0 messages
✅ chat::joinRoom         OK     ────────────────────────────
  └ ret=0 14 chars (raw) 3ms

  ➖ DISCONNECT ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─
  └ 🔗 reason: reason=transport close  sid= Jqab4D7P...


```