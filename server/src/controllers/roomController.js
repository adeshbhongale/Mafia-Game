import { roomService, sanitizeRoom } from '../services/roomService.js';
import { store } from '../services/store.js';

export const createRoom = async (req, res) => {
  try {
    const { room, playerId } = await roomService.createRoom(req.body.username);
    res.status(201).json({ roomCode: room.roomCode, playerId, room: sanitizeRoom(room) });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

export const joinRoom = async (req, res) => {
  try {
    const { room, playerId } = await roomService.joinRoom(req.body.roomCode, req.body.username);
    res.json({ roomCode: room.roomCode, playerId, room: sanitizeRoom(room) });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

export const getRoom = async (req, res) => {
  const room = await store.get(req.params.roomCode);
  if (!room) return res.status(404).json({ error: 'Room not found.' });
  res.json({ room: sanitizeRoom(room) });
};

export const leaveRoom = async (req, res) => {
  const { room, removed } = await roomService.leaveRoom(req.params.roomCode, req.body.playerId);
  res.json({ ok: true, room: room ? sanitizeRoom(room) : null, removed });
};

export const discardRoom = async (req, res) => {
  try {
    await roomService.discardRoom(req.params.roomCode, req.body.playerId);
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
};

export const getGame = async (req, res) => {
  const room = await store.get(req.params.roomCode);
  if (!room) return res.status(404).json({ error: 'Game not found.' });
  res.json({ game: sanitizeRoom(room) });
};