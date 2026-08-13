# 🕵️ MAFIA — Multiplayer Online Mafia Game

🎮 A real-time multiplayer **Mafia / Werewolf** game with **video chat** (Jitsi), built with **React + Node.js + Socket.IO + MongoDB**.

👥 Play with **5–10 players** in one browser — create a room, share the invite link, and fight to find the Mafia before they take over the city. 🌃

> 🛠️ Developed by **Adesh Bhongale**

---

## ✨ Features

- 🎭 **4 Roles** — Mafia, Doctor, Cop, and Citizens, assigned secretly per game.
- 🧠 **Server-authoritative engine** — roles, night actions, votes, and win logic are validated on the server (no cheating). 🙅‍♂️
- 🎥 **Live video meetings**:
  - Mafia members get a **private room** to pick their victim. 🤫
  - All alive players get a **discussion room** during the day. 🗣️
  - Powered by **Jitsi Meet** (embedded, no extra installs).
- 🔗 **Invite links** — share `/lobby/<room-code>` so friends can join with just a username.
- 🔄 **Refresh-safe** — your session is saved; refreshing or reconnecting automatically re-joins your room.
- 🏠 **Host controls** — start the game and **discard the room** (with confirmation) when done.
- 💬 **In-game chat** during discussion.
- 🔊 **Sound effects** — fanfares, night falls, daybreak, vote ticks, win/lose sounds (synthesized in-browser, no files).
- 🎴 **Role cards** & **role-count summary** at game start.
- 🌃 **Themed UI** with background art, avatars, timers, and phase cards.
- ☁️ **Single-origin hosting** — one server serves the frontend + backend, ready for Render/Railway.

---

## 🎭 Roles

| Role | Emoji | Team | Ability |
|------|-------|------|---------|
| **Mafia** | 🐺 | Evil | Kills one player each night (all Mafia agree on one target). |
| **Doctor** | 🏥 | Good | Saves one player each night from the Mafia's kill. |
| **Cop** | 👮 | Good | Investigates one player each night to learn if they are Mafia. |
| **Citizen** | 🏙️ | Good | No power — but votes during the day to eliminate Mafia. |

### 🎲 Role Distribution

| Players | Mafia | Doctor | Cop | Citizens |
|---------|-------|--------|-----|----------|
| 5 | 1 | 1 | 1 | 2 |
| 6–8 | 2 | 1 | 1 | rest |
| 9–10 | 3 | 1 | 1 | rest |

### 🏆 Win Conditions

- 🐺 **Mafia wins** when their count ≥ number of alive good players.
- 🏙️ **Good team wins** when all Mafia are eliminated.

---

## 🌙 Game Flow (Phases)

```
WELCOME → CITY_SLEEP → MAFIA_WAKE → MAFIA_SLEEP → DOCTOR_WAKE → DOCTOR_SLEEP
        → COP_WAKE → COP_SLEEP → CITY_WAKE → DISCUSSION → VOTING → VOTE_RESULT
        → next round or GAME_OVER
```

| Phase | ⏱️ Duration | What happens |
|-------|------------|--------------|
| 👋 Welcome | 5s | Everyone sees the role-count summary. |
| 🌙 City Sleep | 2s | Night begins, everyone closes their eyes. |
| 🐺 Mafia Wake | 30s | Mafia chat privately and vote a target. |
| 😴 Mafia Sleep | 1.5s | |
| 🏥 Doctor Wake | 30s | Doctor picks who to save. |
| 😴 Doctor Sleep | 1.5s | |
| 👮 Cop Wake | 30s | Cop investigates one player (result shown privately). |
| 😴 Cop Sleep | 1.5s | |
| 🌅 City Wake | 7s | Night results are revealed ("X is dead" / "Nobody died tonight"). |
| 🗣️ Discussion | **5 min** | All alive players video-chat and share suspicions. |
| 🗳️ Voting | 60s | Everyone votes to eliminate a player. |
| 📜 Vote Result | 7s | Eliminated player is revealed (or tie → no one dies). |

> ⚡ **TEST_MODE** (`TEST_MODE=1`) shrinks all phases to a few seconds for fast automated testing (via the E2E script).

---

## 🛠️ Tech Stack

### Frontend (`client/`)
- ⚛️ **React 18** + **Vite 5**
- 🎨 **Tailwind CSS 3**
- 🧠 **Zustand** state management
- 🔌 **socket.io-client**
- 🎥 **@jitsi/react-sdk**

### Backend (`server/`)
- 🟢 **Node.js** + **Express 4** (ESM)
- 🔌 **Socket.IO 4**
- 🍃 **MongoDB** via **Mongoose 8** (with in-memory fallback if DB is unreachable)

---

## 📂 Project Structure

```
mafia-game/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/          # Home, Lobby, Game
│   │   ├── components/     # Header, Footer, JitsiRoom, Chat, Roster, Timer…
│   │   ├── components/phases/  # Welcome, CitySleep, MafiaPanel, DoctorPanel,
│   │   │                        #   CopPanel, NightWait, NightResult, Discussion,
│   │   │                        #   Voting, VoteResult, GameOver
│   │   ├── services/       # api.js, socket.js, sound.js, config.js
│   │   ├── store/          # gameStore.js (Zustand)
│   │   └── hooks/          # useCountdown.js
│   ├── scripts/            # E2E test script
│   └── dist/               # Production build (served by the server)
├── server/                 # Node backend
│   └── src/
│       ├── app.js          # Express app (+ serves client/dist in production)
│       ├── server.js       # HTTP + Socket.IO bootstrap
│       ├── db.js           # MongoDB connection (+ RESET_DB flag)
│       ├── models/         # Mongoose models
│       ├── controllers/    # roomController.js
│       ├── routes/         # /api routes
│       ├── services/       # gameEngine.js, roomService.js, store.js
│       ├── socket/         # socket/index.js (Socket.IO handlers)
│       └── utils/          # roleGenerator.js, generateRoomCode.js
├── package.json            # Root scripts (install / build / dev / start)
└── readme.md
```

---

## 🚀 Local Setup

### Prerequisites
- Node.js **18+**
- (Optional) MongoDB — otherwise the server uses an in-memory store automatically.

### 1️⃣ Install
```bash
npm install          # installs root + client + server dependencies
```

### 2️⃣ Configure environment
Copy `server/.env.example` → `server/.env` and set your values.

### 3️⃣ Run in development
```bash
npm run dev          # starts server (port 5000) + Vite client (port 5173) together
```
Open 👉 **http://localhost:5173**

### 4️⃣ Run in production (single origin)
```bash
npm run build        # builds the client into client/dist
npm start            # NODE_ENV=production → server serves API + frontend on port 5000
```
Open 👉 **http://localhost:5000**

---

## 🔧 Environment Variables (`server/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `5000` | Server port (Render injects its own). |
| `MONGO_URI` | — | MongoDB connection string (falls back to in-memory store if unreachable). |
| `JITSI_DOMAIN` | `meet.jit.si` | Jitsi Meet server domain. |
| `TEST_MODE` | off | `1` → fast phases for automated testing. |
| `RESET_DB` | off | `1` → drop the database on server start (clears stale rooms). |

---

## 🌐 REST API

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/rooms` | Create a room → `{ roomCode, playerId, room }`. |
| POST | `/api/rooms/join` | Join a room by code + username. |
| GET | `/api/rooms/:roomCode` | Get public room state. |
| POST | `/api/rooms/:roomCode/leave` | Leave a room. |
| POST | `/api/rooms/:roomCode/discard` | Host-only: delete the room. |
| GET | `/api/games/:roomCode` | Get sanitized game state. |
| GET | `/health` | Health check for hosting platforms. |

---

## 🔌 Socket Events

### 📤 Client → Server
| Event | Payload | Purpose |
|-------|---------|---------|
| `room:rejoin` | `{ playerId, roomCode }` | Reconnect / refresh session. |
| `game:start` | — | Host starts the game. |
| `mafia:vote` | `{ targetId }` | Mafia picks a target. |
| `doctor:save` | `{ targetId }` | Doctor saves a player. |
| `cop:investigate` | `{ targetId }` | Cop investigates a player. |
| `game:vote` | `{ targetId }` | Day voting. |
| `chat:send` | `{ text }` | Discussion chat. |
| `room:discard` | — | Host discards the room. |
| `room:leave` | — | Player leaves. |

### 📥 Server → Client
| Event | Payload | Purpose |
|-------|---------|---------|
| `room:state` | `{ room }` | Public room state (or `null` if removed). |
| `room:error` | `{ message }` | Error message (also clears stale sessions). |
| `room:discarded` | `{ roomCode }` | Host removed the room → send players home. |
| `game:started` | `{ round, roleCounts }` | Game begins. |
| `game:role` | `{ role }` | **Your private role**. |
| `mafia:teammates` | `{ teammates }` | Other Mafia members (Mafia only). |
| `game:phase` | `{ phase, round, phaseEndsAt, … }` | Phase change + result payload. |
| `game:night_result` | `{ deaths, … }` | Who died last night. |
| `game:vote_result` | `{ eliminated, tie, isMafia }` | Day elimination result. |
| `mafia:vote_update` / `doctor:ack` | — | Private confirmation of your night action. |
| `cop:result` | `{ targetId, isMafia }` | **Private cop verdict**. |
| `game:vote_update` | `{ counts, votedCount }` | Live vote tallies. |
| `game:win` | `{ winner, roles }` | Game over + final roles. |
| `game:jitsi` / `mafia:jitsi` | `{ roomName }` | Open discussion / mafia video room. |
| `jitsi:end` | — | Close the video room. |
| `chat:message` | `{ … }` | New chat message. |

---

## ☁️ Deploying on Render

The game is designed to run as **one Node Web Service** (frontend + backend together — no separate frontend hosting needed).

1. **Push the code to GitHub**:
   ```bash
   git init && git add . && git commit -m "Mafia game"
   git branch -M main
   git remote add origin https://github.com/<USER>/mafia-game.git
   git push -u origin main
   ```
2. **MongoDB Atlas** → Network Access → allow IP `0.0.0.0/0`.
3. **Render** → New → **Web Service** → connect the repo.
4. Settings:
   - 🏷️ Root directory: *(repo root)*
   - ⚙️ Build command: `npm install && npm run build`
   - ▶️ Start command: `npm start`
   - 🟢 Node version: `20`
5. **Environment variables**: `MONGO_URI` (Atlas string), `JITSI_DOMAIN=meet.jit.si`. *(Don't set `PORT` — Render injects it.)*
6. 🚀 **Deploy** and open your `https://<app>.onrender.com` URL.

> ⏳ Free tier sleeps after ~15 min idle (first load after sleep is slow, and WebSockets drop while asleep).

---

## 🧪 Testing

Run the E2E flow (uses `TEST_MODE=1` fast phases):
```bash
cd client && npm run e2e
```

---

## 🗺️ Roadmap (ideas)

- 🪑 Assignable seats / permanent player identities.
- 📊 Stats & game history stored in MongoDB.
- 🎤 Push-to-talk instead of always-on mic.
- 🌍 Multi-language support.

---

Made with ❤️ by **Adesh Bhongale**