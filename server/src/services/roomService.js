import { generateRoomCode, generatePlayerId } from '../utils/generateRoomCode.js';
import { store } from './store.js';

export const MAX_PLAYERS = 10;
export const MIN_PLAYERS = 5;

// Strip anything that could be interpreted as markup and normalize whitespace.
export function normalizeUsername(raw) {
  return String(raw || '')
    .replace(/[<>]/g, '')
    .trim()
    .replace(/\s+/g, ' ');
}

export function validateUsername(name) {
  if (name.length < 2 || name.length > 20) throw new Error('Username must be 2-20 characters.');
  return name;
}

// Public representation — NEVER contains role or other secret fields.
export function sanitizePlayer(p) {
  return {
    id: p.playerId,
    username: p.username,
    alive: p.alive !== false,
    connected: !!p.connected,
    isHost: !!p.isHost,
  };
}

export function sanitizeRoom(room) {
  return {
    roomCode: room.roomCode,
    hostId: room.hostPlayerId,
    status: room.status,
    maxPlayers: room.maxPlayers || MAX_PLAYERS,
    minPlayers: room.minPlayers || MIN_PLAYERS,
    round: room.round || 1,
    phase: room.phase || 'LOBBY',
    winner: room.winnerTeam || null,
    players: (room.players || []).map(sanitizePlayer),
  };
}

export const roomService = {
  async createRoom(username) {
    const name = validateUsername(normalizeUsername(username));
    let code;
    do {
      code = generateRoomCode();
    } while (await store.get(code));
    const playerId = generatePlayerId();
    const room = {
      roomCode: code,
      hostPlayerId: playerId,
      status: 'WAITING',
      maxPlayers: MAX_PLAYERS,
      minPlayers: MIN_PLAYERS,
      round: 1,
      phase: 'LOBBY',
      winnerTeam: null,
      players: [
        {
          playerId,
          username: name,
          socketId: null,
          role: null,
          alive: true,
          connected: true,
          isHost: true,
          joinedAt: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      startedAt: null,
      endedAt: null,
    };
    await store.create(room);
    return { room, playerId };
  },

  async joinRoom(roomCode, username) {
    const code = String(roomCode || '').trim();
    const name = validateUsername(normalizeUsername(username));
    const room = await store.get(code);
    if (!room) throw new Error('Room not found.');
    if (room.status !== 'WAITING') throw new Error('This room has already started the game.');
    if ((room.players || []).length >= (room.maxPlayers || MAX_PLAYERS)) throw new Error('Room is full.');
    if (room.players.some((p) => p.username.toLowerCase() === name.toLowerCase()))
      throw new Error('That username is already taken in this room.');
    const playerId = generatePlayerId();
    room.players.push({
      playerId,
      username: name,
      socketId: null,
      role: null,
      alive: true,
      connected: true,
      isHost: false,
      joinedAt: new Date().toISOString(),
    });
    await store.update(code, { players: room.players });
    return { room, playerId };
  },

  async leaveRoom(roomCode, playerId) {
    const room = await store.get(roomCode);
    if (!room) return { room: null, removed: false };
    room.players = (room.players || []).filter((p) => p.playerId !== playerId);
    if (room.players.length === 0) {
      room.status = 'CANCELLED';
      await store.update(roomCode, { players: room.players, status: 'CANCELLED' });
      return { room, removed: true };
    }
    if (room.hostPlayerId === playerId) {
      room.hostPlayerId = room.players[0].playerId;
      room.players[0].isHost = true;
    }
    await store.update(roomCode, { players: room.players, hostPlayerId: room.hostPlayerId });
    return { room, removed: false };
  },

  // Host permanently deletes the room and removes every player.
  async discardRoom(roomCode, playerId) {
    const room = await store.get(roomCode);
    if (!room) throw new Error('Room not found.');
    const player = room.players.find((p) => p.playerId === playerId);
    if (!player) throw new Error('Player not found in this room.');
    if (!player.isHost) throw new Error('Only the host can disband the room.');
    await store.remove(roomCode);
    return { room };
  },
};