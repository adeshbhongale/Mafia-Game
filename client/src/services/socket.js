import { io } from 'socket.io-client';
import { useGameStore, clearSession } from '../store/gameStore';
import { playPhaseSound, playWinSound, playErrorSound } from './sound';

let socket = null;
let startedAt = null;

function wire(socket) {
  socket.on('connect', () => {
    const state = useGameStore.getState();
    state.set({ connected: true, latency: startedAt ? Math.max(0, Math.round(Date.now() - startedAt)) : null });
    // Every (re)connect (including refresh) re-joins the player's room.
    const s = state.session;
    if (s && s.roomCode) {
      socket.emit('room:rejoin', { playerId: s.playerId, roomCode: s.roomCode });
    }
  });
  socket.on('disconnect', () => useGameStore.getState().set({ connected: false }));
  socket.on('connect_error', () => useGameStore.getState().set({ connected: false }));

  socket.on('room:error', (d) => {
    const state = useGameStore.getState();
    const msg = d && d.message;
    playErrorSound();
    if (msg === 'Room not found.' || msg === 'Player not found in this room.') {
      // Room no longer exists → drop the stale session and go home.
      clearSession();
      state.resetGame();
      if (window.location.pathname !== '/') window.location.href = '/';
    } else {
      state.set({ error: msg });
    }
  });

  socket.on('room:state', (d) => {
    const state = useGameStore.getState();
    if (!d.room) {
      // Room was removed (host disbanded / everyone left) → go home.
      clearSession();
      state.resetGame();
      if (window.location.pathname !== '/') window.location.href = '/';
      return;
    }
    state.set({ room: d.room });
  });

  socket.on('room:discarded', () => {
    const state = useGameStore.getState();
    clearSession();
    state.resetGame();
    if (window.location.pathname !== '/') window.location.href = '/';
  });

  socket.on('game:role', (d) => useGameStore.getState().set({ role: d.role }));

  socket.on('game:started', (d) => {
    useGameStore.getState().set({ roleCounts: (d && d.roleCounts) || null });
    playPhaseSound('WELCOME');
  });

  socket.on('mafia:teammates', (d) => useGameStore.getState().set({ teammates: d.teammates || [] }));

  socket.on('game:phase', (d) => {
    playPhaseSound(d.phase);
    useGameStore.getState().set({
      phase: d.phase,
      phaseMessage: d.message || '',
      round: d.round,
      phaseEndsAt: d.phaseEndsAt,
      roleCounts: d.roleCounts || null,
      nightResult: d.nightResult || null,
      voteResult: d.voteResult || null,
      jitsi: null,
      copResult: null,
      myChoice: null,
      myVote: null,
      votes: {},
      votedCount: 0,
    });
  });

  socket.on('mafia:jitsi', (d) => useGameStore.getState().set({ jitsi: d }));
  socket.on('game:jitsi', (d) => useGameStore.getState().set({ jitsi: d }));
  socket.on('jitsi:end', () => useGameStore.getState().set({ jitsi: null }));

  socket.on('mafia:vote_update', (d) => useGameStore.getState().set({ myChoice: d.myChoice || null }));
  socket.on('doctor:ack', (d) => useGameStore.getState().set({ myChoice: d.savedId || null }));
  socket.on('cop:result', (d) =>
    useGameStore.getState().set({ copResult: { targetId: d.targetId, isMafia: d.isMafia }, myChoice: d.targetId })
  );

  socket.on('game:night_result', (d) => useGameStore.getState().set({ nightResult: d }));

  socket.on('game:vote_update', (d) =>
    useGameStore.getState().set({
      votes: d.counts || {},
      votedCount: d.votedCount || 0,
      aliveCount: d.total || 0,
      myVote: d.myVote || null,
    })
  );

  socket.on('game:vote_result', (d) => useGameStore.getState().set({ voteResult: d }));

  socket.on('game:win', (d) => {
    playWinSound(d.winner);
    useGameStore.getState().set({ winner: d.winner, finalRoles: d.roles || [] });
  });

  socket.on('chat:message', (d) => {
    const state = useGameStore.getState();
    state.set({ chat: [...state.chat, d].slice(-120) });
  });
}

export function getSocket() {
  if (!socket) {
    socket = io('/', {
      autoConnect: false,
      transports: ['polling', 'websocket'],
    });
    wire(socket);
  }
  if (!socket.connected) {
    startedAt = Date.now();
    socket.connect();
  }
  return socket;
}

export function rejoin() {
  const { session } = useGameStore.getState();
  if (!session) return;
  const s = getSocket();
  const doRejoin = () => s.emit('room:rejoin', { playerId: session.playerId, roomCode: session.roomCode });
  if (s.connected) {
    doRejoin();
  } else {
    s.once('connect', doRejoin);
  }
}

export function socketEmit(event, payload) {
  const s = getSocket();
  if (s.connected) s.emit(event, payload);
}
