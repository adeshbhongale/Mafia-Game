import { store } from '../services/store.js';
import { roomService, sanitizeRoom } from '../services/roomService.js';

export function registerSocketHandlers(io, engine) {
  io.on('connection', (socket) => {
    // ---------- session / reconnect ----------
    socket.on('room:rejoin', async (payload) => {
      const playerId = payload && payload.playerId;
      const roomCode = payload && payload.roomCode;
      if (!playerId || !roomCode) return socket.emit('room:error', { message: 'Missing session.' });
      const room = await store.get(roomCode);
      if (!room) return socket.emit('room:error', { message: 'Room not found.' });
      const player = room.players.find((p) => p.playerId === playerId);
      if (!player) return socket.emit('room:error', { message: 'Player not found in this room.' });

      player.socketId = socket.id;
      player.connected = true;
      socket.data.roomCode = roomCode;
      socket.data.playerId = playerId;
      socket.join(`game:${roomCode}`);

      socket.emit('room:state', { room: sanitizeRoom(room), playerId, username: player.username });

      if (room.status === 'PLAYING' && engine.hasGame(roomCode)) {
        engine.resyncPlayer(socket, room, player);
      } else if (room.status === 'FINISHED') {
        engine.resyncPlayer(socket, room, player);
      }

      io.to(`game:${roomCode}`).emit('room:state', { room: sanitizeRoom(room) });
    });

    // ---------- host action ----------
    socket.on('game:start', async () => {
      const roomCode = socket.data.roomCode;
      const room = await store.get(roomCode);
      if (!room) return socket.emit('room:error', { message: 'Room not found.' });
      if (room.status !== 'WAITING') return socket.emit('room:error', { message: 'Game already started.' });
      const player = room.players.find((p) => p.playerId === socket.data.playerId);
      if (!player || !player.isHost) return socket.emit('room:error', { message: 'Only the host can start the game.' });
      if (room.players.length < room.minPlayers)
        return socket.emit('room:error', { message: `Need at least ${room.minPlayers} players to start.` });
      await engine.startGame(room);
    });

    // ---------- secret role actions (server is the authority) ----------
    socket.on('mafia:vote', (payload) => {
      const r = engine.mafiaVote(socket.data.roomCode, socket.data.playerId, payload && payload.targetId);
      if (!r.ok) socket.emit('room:error', { message: r.error });
    });

    socket.on('doctor:save', (payload) => {
      const r = engine.doctorSave(socket.data.roomCode, socket.data.playerId, payload && payload.targetId);
      if (!r.ok) socket.emit('room:error', { message: r.error });
    });

    socket.on('cop:investigate', (payload) => {
      const r = engine.copInvestigate(socket.data.roomCode, socket.data.playerId, payload && payload.targetId);
      if (!r.ok) socket.emit('room:error', { message: r.error });
    });

    socket.on('game:vote', (payload) => {
      const r = engine.castVote(socket.data.roomCode, socket.data.playerId, payload && payload.targetId);
      if (!r.ok) socket.emit('room:error', { message: r.error });
    });

    // ---------- chat ----------
    socket.on('chat:send', (payload) => {
      const r = engine.chatSend(socket.data.roomCode, socket.data.playerId, payload && payload.text);
      if (!r.ok) socket.emit('room:error', { message: r.error });
    });

    // ---------- leave ----------
    socket.on('room:discard', async () => {
      const { roomCode, playerId } = socket.data;
      if (!roomCode) return;
      try {
        await roomService.discardRoom(roomCode, playerId);
      } catch (e) {
        return socket.emit('room:error', { message: e.message });
      }
      engine.cancelGame(roomCode);
      io.to(`game:${roomCode}`).emit('room:discarded', { roomCode });
      io.in(`game:${roomCode}`).socketsLeave(`game:${roomCode}`);
    });

    socket.on('room:leave', async () => {
      const { roomCode, playerId } = socket.data;
      if (!roomCode) return;
      const room = await store.get(roomCode);
      if (!room) return;
      socket.leave(`game:${roomCode}`);
      socket.data = {};
      if (room.status === 'WAITING') {
        const result = await roomService.leaveRoom(roomCode, playerId);
        if (result.room && !result.removed) {
          io.to(`game:${roomCode}`).emit('room:state', { room: sanitizeRoom(result.room) });
        } else {
          io.to(`game:${roomCode}`).emit('room:state', { room: null });
        }
      } else {
        const player = room.players.find((p) => p.playerId === playerId);
        if (player) {
          player.connected = false;
          player.socketId = null;
          io.to(`game:${roomCode}`).emit('room:state', { room: sanitizeRoom(room) });
        }
      }
    });

    // ---------- disconnect ----------
    socket.on('disconnect', async () => {
      const { roomCode, playerId } = socket.data;
      if (!roomCode) return;
      const room = await store.get(roomCode);
      if (!room) return;
      const player = room.players.find((p) => p.playerId === playerId);
      // Ignore if the player already reconnected on a new socket (refresh).
      if (!player || player.socketId !== socket.id) return;
      player.connected = false;
      player.socketId = null;
      io.to(`game:${roomCode}`).emit('room:state', { room: sanitizeRoom(room) });
    });
  });
}