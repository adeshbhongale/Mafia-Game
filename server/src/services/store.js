import { RoomModel } from '../models/Room.js';
import { isDBConnected } from '../db.js';

// In-memory cache is the authoritative runtime store (fast + reliable without DB).
const mem = new Map(); // roomCode -> room

export const store = {
  async create(room) {
    mem.set(room.roomCode, room);
    if (isDBConnected()) {
      try {
        await RoomModel.create(JSON.parse(JSON.stringify(room)));
      } catch (e) {
        console.error('[store] db create failed:', e.message);
      }
    }
    return room;
  },

  async get(code) {
    if (!code) return null;
    if (mem.has(code)) return mem.get(code);
    if (isDBConnected()) {
      const r = await RoomModel.findOne({ roomCode: code }).lean();
      if (r) {
        // hydrate a mutable working copy
        r.players = (r.players || []).map((p) => ({ ...p }));
        mem.set(code, r);
      }
      return r || null;
    }
    return null;
  },

  async update(code, patch) {
    const room = mem.get(code);
    if (!room) return null;
    Object.assign(room, patch);
    if (isDBConnected()) {
      try {
        await RoomModel.updateOne({ roomCode: code }, { $set: JSON.parse(JSON.stringify(patch)) });
      } catch (e) {
        console.error('[store] db update failed:', e.message);
      }
    }
    return room;
  },

  async remove(code) {
    mem.delete(code);
    if (isDBConnected()) {
      try {
        await RoomModel.deleteOne({ roomCode: code });
      } catch (e) {
        console.error('[store] db remove failed:', e.message);
      }
    }
  },

  async listActive() {
    if (mem.size > 0) return [...mem.values()].filter((r) => r.status === 'WAITING' || r.status === 'PLAYING');
    if (isDBConnected()) {
      const rows = await RoomModel.find({ status: { $in: ['WAITING', 'PLAYING'] } }).lean();
      return rows.map((r) => ({ ...r, players: (r.players || []).map((p) => ({ ...p })) }));
    }
    return [];
  },
};