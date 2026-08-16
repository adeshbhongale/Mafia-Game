import { create } from 'zustand';

const SESSION_KEY = 'mafia_session';

export const loadSession = () => {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY));
  } catch {
    return null;
  }
};

export const saveSession = (session) => {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    /* ignore */
  }
};

export const clearSession = () => {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
};

export const useGameStore = create((set, get) => ({
  // session (seeded from localStorage so a refresh keeps you in the room)
  session: loadSession(),
  socket: null,
  connected: false,

  // room
  room: null,

  // game state (sanitized, server-authoritative)
  phase: null,
  phaseMessage: '',
  round: 1,
  phaseEndsAt: null,

  // private
  role: null,
  roleCounts: null,
  teammates: [],
  jitsi: null,
  myChoice: null,
  mafiaVotes: {}, // { [playerId]: targetId }
  mafiaVoteStatus: null, // { counts, totalMafia, votedCount, isUnanimous, unanimousTarget }
  copResult: null,

  // voting
  votes: {},
  votedCount: 0,
  aliveCount: 0,
  myVote: null,

  // results
  nightResult: null,
  voteResult: null,
  winner: null,
  finalRoles: [],

  // chat
  chat: [],

  error: null,

  set: (patch) => set(patch),
  resetGame: () =>
    set({
      session: null,
      room: null,
      phase: null,
      phaseMessage: '',
      round: 1,
      phaseEndsAt: null,
      role: null,
      roleCounts: null,
      teammates: [],
      jitsi: null,
      myChoice: null,
      mafiaVotes: {},
      mafiaVoteStatus: null,
      copResult: null,
      votes: {},
      votedCount: 0,
      aliveCount: 0,
      myVote: null,
      nightResult: null,
      voteResult: null,
      winner: null,
      finalRoles: [],
      chat: [],
      error: null,
    }),
}));
