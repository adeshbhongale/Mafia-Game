import 'dotenv/config';
import http from 'node:http';
import { Server } from 'socket.io';
import { createApp } from './app.js';
import { connectDB } from './db.js';
import { registerSocketHandlers } from './socket/index.js';
import { GameEngine } from './services/gameEngine.js';

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mafia';

await connectDB(MONGO_URI);

const app = createApp();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: true, credentials: true },
});

const engine = new GameEngine(io);
await engine.resumeActive();

registerSocketHandlers(io, engine);

server.listen(PORT, () => {
  console.log(`[server] Mafia server listening on http://localhost:${PORT}`);
});