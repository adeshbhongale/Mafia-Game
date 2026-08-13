import mongoose from 'mongoose';

const playerSchema = new mongoose.Schema(
  {
    playerId: { type: String, index: true },
    username: String,
    socketId: String,
    role: { type: String, default: null },
    alive: { type: Boolean, default: true },
    connected: { type: Boolean, default: true },
    isHost: { type: Boolean, default: false },
    joinedAt: Date,
  },
  { _id: false }
);

const roomSchema = new mongoose.Schema(
  {
    roomCode: { type: String, unique: true, index: true },
    hostPlayerId: String,
    status: { type: String, default: 'WAITING', index: true }, // WAITING | PLAYING | FINISHED | CANCELLED
    maxPlayers: { type: Number, default: 10 },
    minPlayers: { type: Number, default: 5 },
    players: [playerSchema],
    round: { type: Number, default: 1 },
    phase: { type: String, default: 'LOBBY' },
    winnerTeam: String,
    createdAt: { type: Date, default: Date.now },
    startedAt: Date,
    endedAt: Date,
  },
  { versionKey: false }
);

export const RoomModel = mongoose.models.Room || mongoose.model('Room', roomSchema);