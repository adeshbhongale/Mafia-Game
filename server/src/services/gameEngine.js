import { assignRoles } from '../utils/roleGenerator.js';
import { store } from './store.js';
import { sanitizeRoom } from './roomService.js';

const TEST = process.env.TEST_MODE === '1';

export const PHASE_TIMES = TEST
  ? {
      WELCOME: 800,
      CITY_SLEEP: 600,
      MAFIA_WAKE: 5000,
      MAFIA_SLEEP: 400,
      DOCTOR_WAKE: 5000,
      DOCTOR_SLEEP: 400,
      COP_WAKE: 5000,
      COP_SLEEP: 400,
      CITY_WAKE: 2500,
      DISCUSSION: 6000,
      VOTING: 6000,
      VOTE_RESULT: 2000,
    }
  : {
      WELCOME: 5000,
      CITY_SLEEP: 2000,
      MAFIA_WAKE: 30000,
      MAFIA_SLEEP: 1500,
      DOCTOR_WAKE: 30000,
      DOCTOR_SLEEP: 1500,
      COP_WAKE: 30000,
      COP_SLEEP: 1500,
      CITY_WAKE: 7000,
      DISCUSSION: 5 * 60 * 1000,
      VOTING: 60000,
      VOTE_RESULT: 7000,
    };

// How long a night-action result (cop result / doctor ack) stays on screen before the game moves on.
export const ACTION_RESULT_DELAY = 5000;

export const PHASE_NAMES = {
  WELCOME: 'Welcome to Mafia',
  CITY_SLEEP: 'City Sleep',
  MAFIA_WAKE: 'Mafia Wake Up',
  MAFIA_SLEEP: 'Mafia Sleep',
  DOCTOR_WAKE: 'Doctor Wake Up',
  DOCTOR_SLEEP: 'Doctor Sleep',
  COP_WAKE: 'Cop Wake Up',
  COP_SLEEP: 'Cop Sleep',
  CITY_WAKE: 'City Wake Up',
  DISCUSSION: 'Day Discussion',
  VOTING: 'Voting',
  VOTE_RESULT: 'Vote Result',
  GAME_OVER: 'Game Over',
};

export class GameEngine {
  constructor(io) {
    this.io = io;
    this.games = new Map(); // roomCode -> room (authoritative in-memory state)
    this.timers = new Map(); // roomCode -> timeout handle
  }

  // ---------- emit helpers ----------
  emitToGame(code, event, data) {
    this.io.to(`game:${code}`).emit(event, data);
  }

  emitToPlayer(player, event, data) {
    if (player && player.socketId) this.io.to(player.socketId).emit(event, data);
  }

  emitRoom(code) {
    const room = this.games.get(code);
    if (room) this.emitToGame(code, 'room:state', { room: sanitizeRoom(room) });
  }

  hasGame(code) {
    return this.games.has(code);
  }

  // Public (non-secret) role distribution — counts only, never identities.
  roleCountsOf(room) {
    const counts = { MAFIA: 0, DOCTOR: 0, COP: 0, CITIZEN: 0 };
    (room.players || []).forEach((p) => {
      if (counts[p.role] !== undefined) counts[p.role]++;
    });
    return counts;
  }

  getGame(code) {
    return this.games.get(code) || null;
  }

  clearTimer(code) {
    if (this.timers.has(code)) {
      clearTimeout(this.timers.get(code));
      this.timers.delete(code);
    }
  }

  cancelGame(code) {
    const room = this.games.get(code);
    if (!room) return;
    this.clearTimer(code);
    this.closeJitsi(code);
    this.games.delete(code);
  }

  // ---------- game lifecycle ----------
  async startGame(room) {
    const players = room.players;
    const roles = assignRoles(players.length);
    players.forEach((p, i) => {
      p.role = roles[i];
      p.alive = true;
      p.connected = true;
      p.mafiaChoice = null;
    });
    room.status = 'PLAYING';
    room.round = 1;
    room.winnerTeam = null;
    room.mafiaTarget = null;
    room.doctorTarget = null;
    room.copTarget = null;
    room.votes = {};
    room.deaths = [];
    room.lastNightResult = null;
    room.lastVoteResult = null;
    room.startedAt = new Date().toISOString();
    room.roleCounts = this.roleCountsOf(room);
    this.games.set(room.roomCode, room);

    await store.update(room.roomCode, {
      status: 'PLAYING',
      phase: 'WELCOME',
      round: 1,
      startedAt: room.startedAt,
      roleCounts: room.roleCounts,
      players: players.map((p) => ({ ...p })),
    });

    this.emitToGame(room.roomCode, 'room:state', { room: sanitizeRoom(room) });
    this.emitToGame(room.roomCode, 'game:started', { round: 1, roleCounts: room.roleCounts });

    // Private role delivery — each player only ever receives their OWN role.
    players.forEach((p) => {
      this.emitToPlayer(p, 'game:role', { role: p.role });
      if (p.role === 'MAFIA') {
        const teammates = players
          .filter((x) => x.role === 'MAFIA' && x.playerId !== p.playerId)
          .map((x) => ({ id: x.playerId, username: x.username }));
        this.emitToPlayer(p, 'mafia:teammates', { teammates });
      }
    });

    this.transition(room.roomCode, 'WELCOME');
  }

  transition(code, phase) {
    const room = this.games.get(code);
    if (!room || room.status !== 'PLAYING') return;
    const dur = PHASE_TIMES[phase] ?? 2000;
    room.phase = phase;
    room.phaseEndsAt = Date.now() + dur;
    this.emitToGame(code, 'game:phase', {
      phase,
      round: room.round,
      phaseEndsAt: room.phaseEndsAt,
      serverTime: Date.now(),
      message: PHASE_NAMES[phase],
      roleCounts: room.roleCounts || null,
      nightResult: room.lastNightResult || null,
      voteResult: room.lastVoteResult || null,
    });
    this.persist(code, { phase, round: room.round, phaseEndsAt: room.phaseEndsAt });
    this.clearTimer(code);
    this.timers.set(code, setTimeout(() => this.handleTimeout(code, phase), dur + 300));

    if (phase === 'MAFIA_WAKE') this.openMafiaJitsi(code);
    if (phase === 'DISCUSSION') {
      room.votes = {};
      this.openDiscussionJitsi(code);
    }
    if (phase === 'VOTING') room.votes = {};
  }

  handleTimeout(code, expectedPhase) {
    const room = this.games.get(code);
    if (!room || room.status !== 'PLAYING' || room.phase !== expectedPhase) return;
    switch (expectedPhase) {
      case 'WELCOME':
        this.transition(code, 'CITY_SLEEP');
        break;
      case 'CITY_SLEEP':
        this.transition(code, 'MAFIA_WAKE');
        break;
      case 'MAFIA_WAKE':
        this.resolveMafia(code);
        this.closeJitsi(code);
        this.transition(code, 'MAFIA_SLEEP');
        break;
      case 'MAFIA_SLEEP':
        this.transition(code, 'DOCTOR_WAKE');
        break;
      case 'DOCTOR_WAKE':
        this.transition(code, 'DOCTOR_SLEEP');
        break;
      case 'DOCTOR_SLEEP':
        this.transition(code, 'COP_WAKE');
        break;
      case 'COP_WAKE':
        this.transition(code, 'COP_SLEEP');
        break;
      case 'COP_SLEEP':
        this.resolveNight(code);
        this.closeJitsi(code);
        this.transition(code, 'CITY_WAKE');
        break;
      case 'CITY_WAKE':
        this.afterNight(code);
        break;
      case 'DISCUSSION':
        this.closeJitsi(code);
        this.transition(code, 'VOTING');
        break;
      case 'VOTING':
        this.resolveVoting(code);
        break;
      case 'VOTE_RESULT':
        this.afterVote(code);
        break;
      default:
        break;
    }
  }

  // ---------- night actions ----------
  openMafiaJitsi(code) {
    const room = this.games.get(code);
    if (!room) return;
    const name = `mafia-${room.roomCode}-${room.round}`;
    room.players
      .filter((p) => p.role === 'MAFIA' && p.alive)
      .forEach((p) => this.emitToPlayer(p, 'mafia:jitsi', { roomName: name }));
  }

  openDiscussionJitsi(code) {
    const room = this.games.get(code);
    if (!room) return;
    const name = `discussion-${room.roomCode}-${room.round}`;
    room.players.filter((p) => p.alive).forEach((p) => this.emitToPlayer(p, 'game:jitsi', { roomName: name }));
  }

  closeJitsi(code) {
    this.emitToGame(code, 'jitsi:end', {});
  }

  mafiaVote(code, playerId, targetId) {
    const room = this.games.get(code);
    if (!room || room.status !== 'PLAYING') return { ok: false, error: 'Game is not running.' };
    if (room.phase !== 'MAFIA_WAKE') return { ok: false, error: 'Not the Mafia phase.' };
    const player = room.players.find((p) => p.playerId === playerId);
    if (!player) return { ok: false, error: 'Player not found.' };
    if (player.role !== 'MAFIA') return { ok: false, error: 'You are not Mafia.' };
    if (!player.alive) return { ok: false, error: 'You are dead.' };
    const target = room.players.find((p) => p.playerId === targetId);
    if (!target) return { ok: false, error: 'Invalid target.' };
    if (!target.alive) return { ok: false, error: 'Target is dead.' };
    if (targetId === playerId) return { ok: false, error: 'You cannot kill yourself.' };
    if (target.role === 'MAFIA') return { ok: false, error: 'You cannot kill another Mafia member.' };

    player.mafiaChoice = targetId;
    this.emitToPlayer(player, 'mafia:vote_update', { myChoice: targetId });

    // Early resolve when every living Mafia member has submitted.
    const mafiaAlive = room.players.filter((p) => p.alive && p.role === 'MAFIA');
    const submitted = mafiaAlive.filter((p) => p.mafiaChoice);
    if (submitted.length >= mafiaAlive.length) {
      this.resolveMafia(code);
      this.closeJitsi(code);
      this.transition(code, 'MAFIA_SLEEP');
    }
    return { ok: true };
  }

  resolveMafia(code) {
    const room = this.games.get(code);
    if (!room) return;
    const mafia = room.players.filter((p) => p.alive && p.role === 'MAFIA');
    const counts = {};
    mafia.forEach((p) => {
      if (p.mafiaChoice) counts[p.mafiaChoice] = (counts[p.mafiaChoice] || 0) + 1;
    });
    let targetId = null;
    const ids = Object.keys(counts);
    if (ids.length) {
      const max = Math.max(...Object.values(counts));
      const top = ids.filter((k) => counts[k] === max);
      targetId = top.length === 1 ? top[0] : top[Math.floor(Math.random() * top.length)];
    }
    room.mafiaTarget = targetId;
  }

  doctorSave(code, playerId, targetId) {
    const room = this.games.get(code);
    if (!room || room.status !== 'PLAYING') return { ok: false, error: 'Game is not running.' };
    if (room.phase !== 'DOCTOR_WAKE') return { ok: false, error: 'Not the Doctor phase.' };
    if (room.doctorTarget) return { ok: false, error: 'You already saved one player tonight.' };
    const player = room.players.find((p) => p.playerId === playerId);
    if (!player) return { ok: false, error: 'Player not found.' };
    if (player.role !== 'DOCTOR') return { ok: false, error: 'You are not the Doctor.' };
    if (!player.alive) return { ok: false, error: 'You are dead.' };
    const target = room.players.find((p) => p.playerId === targetId);
    if (!target) return { ok: false, error: 'Invalid target.' };
    if (!target.alive) return { ok: false, error: 'Target is dead.' };

    room.doctorTarget = targetId;
    this.emitToPlayer(player, 'doctor:ack', { savedId: targetId, savedName: target.username });
    // Let the Doctor read the ack for a moment, then move on.
    setTimeout(() => {
      const r = this.games.get(code);
      if (r && r.status === 'PLAYING' && r.phase === 'DOCTOR_WAKE') this.transition(code, 'DOCTOR_SLEEP');
    }, ACTION_RESULT_DELAY);
    return { ok: true };
  }

  copInvestigate(code, playerId, targetId) {
    const room = this.games.get(code);
    if (!room || room.status !== 'PLAYING') return { ok: false, error: 'Game is not running.' };
    if (room.phase !== 'COP_WAKE') return { ok: false, error: 'Not the Cop phase.' };
    if (room.copTarget) return { ok: false, error: 'You already investigated one player tonight.' };
    const player = room.players.find((p) => p.playerId === playerId);
    if (!player) return { ok: false, error: 'Player not found.' };
    if (player.role !== 'COP') return { ok: false, error: 'You are not the Cop.' };
    if (!player.alive) return { ok: false, error: 'You are dead.' };
    const target = room.players.find((p) => p.playerId === targetId);
    if (!target) return { ok: false, error: 'Invalid target.' };
    if (!target.alive) return { ok: false, error: 'Target is dead.' };
    if (targetId === playerId) return { ok: false, error: 'You cannot investigate yourself.' };

    room.copTarget = targetId;
    // Private result — NEVER broadcast to the room.
    this.emitToPlayer(player, 'cop:result', { targetId, isMafia: target.role === 'MAFIA' });
    // Let the Cop read the result for a moment, then move on to COP_SLEEP.
    setTimeout(() => {
      const r = this.games.get(code);
      if (r && r.status === 'PLAYING' && r.phase === 'COP_WAKE') this.transition(code, 'COP_SLEEP');
    }, ACTION_RESULT_DELAY);
    return { ok: true };
  }

  resolveNight(code) {
    const room = this.games.get(code);
    if (!room) return;
    const mt = room.mafiaTarget;
    const dt = room.doctorTarget;
    const deaths = [];
    if (mt && mt !== dt) {
      const target = room.players.find((p) => p.playerId === mt);
      if (target && target.alive) {
        target.alive = false;
        deaths.push(target.username);
      }
    }
    room.deaths = deaths;
    const result = {
      deaths,
      messages: deaths.length ? [`${deaths.join(', ')} is dead.`] : ['Nobody died tonight.'],
    };
    room.lastNightResult = result;
    this.emitToGame(code, 'game:night_result', result);
    this.emitRoom(code);
    this.persist(code, { players: room.players.map((p) => ({ ...p })) });
  }

  afterNight(code) {
    const winner = this.checkWin(code);
    if (winner) {
      this.finishGame(code, winner);
      return;
    }
    this.transition(code, 'DISCUSSION');
  }

  // ---------- voting ----------
  broadcastVotes(code) {
    const room = this.games.get(code);
    if (!room) return;
    const alive = room.players.filter((p) => p.alive);
    const counts = {};
    alive.forEach((p) => (counts[p.playerId] = 0));
    Object.values(room.votes).forEach((tid) => {
      if (counts[tid] !== undefined) counts[tid]++;
    });
    const votedCount = Object.keys(room.votes).length;
    room.players.forEach((p) =>
      this.emitToPlayer(p, 'game:vote_update', {
        counts,
        votedCount,
        total: alive.length,
        myVote: room.votes[p.playerId] || null,
      })
    );
  }

  castVote(code, playerId, targetId) {
    const room = this.games.get(code);
    if (!room || room.status !== 'PLAYING') return { ok: false, error: 'Game is not running.' };
    if (room.phase !== 'VOTING') return { ok: false, error: 'Voting is not open.' };
    const player = room.players.find((p) => p.playerId === playerId);
    if (!player) return { ok: false, error: 'Player not found.' };
    if (!player.alive) return { ok: false, error: 'Dead players cannot vote.' };
    const target = room.players.find((p) => p.playerId === targetId);
    if (!target) return { ok: false, error: 'Invalid target.' };
    if (!target.alive) return { ok: false, error: 'Target is dead.' };
    if (targetId === playerId) return { ok: false, error: 'You cannot vote for yourself.' };

    room.votes[playerId] = targetId;
    this.broadcastVotes(code);

    const alive = room.players.filter((p) => p.alive);
    if (Object.keys(room.votes).length >= alive.length) {
      this.resolveVoting(code);
    }
    return { ok: true };
  }

  resolveVoting(code) {
    const room = this.games.get(code);
    if (!room) return;
    const alive = room.players.filter((p) => p.alive);
    const counts = {};
    alive.forEach((p) => (counts[p.playerId] = 0));
    Object.values(room.votes).forEach((tid) => {
      if (counts[tid] !== undefined) counts[tid]++;
    });

    let eliminated = null;
    let tie = false;
    const max = Math.max(...Object.values(counts));
    if (max > 0) {
      const top = alive.filter((p) => counts[p.playerId] === max);
      if (top.length === 1) eliminated = top[0];
      else tie = true;
    }

    let isMafia = null;
    if (eliminated) {
      eliminated.alive = false;
      isMafia = eliminated.role === 'MAFIA';
    }

    const result = {
      eliminated: eliminated ? { id: eliminated.playerId, username: eliminated.username } : null,
      tie,
      isMafia,
    };
    room.lastVoteResult = result;
    this.emitToGame(code, 'game:vote_result', result);
    this.emitRoom(code);
    this.persist(code, { players: room.players.map((p) => ({ ...p })) });
    this.transition(code, 'VOTE_RESULT');
  }

  afterVote(code) {
    const winner = this.checkWin(code);
    if (winner) {
      this.finishGame(code, winner);
      return;
    }
    const room = this.games.get(code);
    room.round++;
    room.mafiaTarget = null;
    room.doctorTarget = null;
    room.copTarget = null;
    room.votes = {};
    room.deaths = [];
    room.players.forEach((p) => {
      p.mafiaChoice = null;
    });
    this.persist(code, { round: room.round, players: room.players.map((p) => ({ ...p })) });
    this.transition(code, 'CITY_SLEEP');
  }

  // ---------- win conditions ----------
  checkWin(code) {
    const room = this.games.get(code);
    if (!room) return null;
    const alive = room.players.filter((p) => p.alive);
    const mafia = alive.filter((p) => p.role === 'MAFIA').length;
    const nonMafia = alive.length - mafia;
    if (mafia === 0) return 'CITY';
    if (mafia >= nonMafia) return 'MAFIA';
    return null;
  }

  finishGame(code, winner) {
    const room = this.games.get(code);
    if (!room) return;
    room.status = 'FINISHED';
    room.phase = 'GAME_OVER';
    room.winnerTeam = winner;
    room.endedAt = new Date().toISOString();
    this.clearTimer(code);
    this.closeJitsi(code);
    const roles = room.players.map((p) => ({ id: p.playerId, username: p.username, role: p.role, alive: p.alive }));
    this.emitToGame(code, 'game:win', { winner, roles });
    this.emitToGame(code, 'game:phase', {
      phase: 'GAME_OVER',
      round: room.round,
      phaseEndsAt: null,
      serverTime: Date.now(),
      message: winner === 'CITY' ? 'City Wins' : 'Mafia Wins',
    });
    this.emitRoom(code);
    this.persist(code, { status: 'FINISHED', phase: 'GAME_OVER', winnerTeam: winner, endedAt: room.endedAt });
    // A match has a winner — remove only this finished room's data, not others.
    store.remove(code).catch(() => {});
  }

  // ---------- chat ----------
  chatSend(code, playerId, text) {
    const room = this.games.get(code);
    if (!room) return { ok: false, error: 'Game not found.' };
    if (!['DISCUSSION', 'VOTING', 'VOTE_RESULT'].includes(room.phase))
      return { ok: false, error: 'Chat is only available during the day.' };
    const player = room.players.find((p) => p.playerId === playerId);
    if (!player) return { ok: false, error: 'Player not found.' };
    if (!player.alive) return { ok: false, error: 'Dead players cannot speak.' };
    const clean = String(text || '').trim().replace(/[<>]/g, '').slice(0, 240);
    if (!clean) return { ok: false, error: 'Empty message.' };
    const msg = {
      id: `${Date.now()}-${playerId}`,
      playerId,
      username: player.username,
      text: clean,
      time: new Date().toISOString(),
      system: false,
    };
    this.emitToGame(code, 'chat:message', msg);
    return { ok: true };
  }

  // ---------- persistence / recovery ----------
  persist(code, patch = {}) {
    const room = this.games.get(code);
    if (room) store.update(code, patch).catch(() => {});
  }

  async resumeActive() {
    const active = await store.listActive();
    for (const room of active) {
      if (room.status === 'WAITING') {
        this.games.set(room.roomCode, room);
        continue;
      }
      // PLAYING — restore and restart the current phase with a fresh authoritative timer.
      this.games.set(room.roomCode, room);
      room.players.forEach((p) => {
        p.connected = false;
        p.socketId = null;
      });
      this.transition(room.roomCode, room.phase || 'WELCOME');
    }
  }

  resyncPlayer(socket, room, player) {
    socket.emit('game:role', { role: player.role });
    if (player.role === 'MAFIA') {
      const teammates = room.players
        .filter((x) => x.role === 'MAFIA' && x.playerId !== player.playerId)
        .map((x) => ({ id: x.playerId, username: x.username }));
      socket.emit('mafia:teammates', { teammates });
    }

    if (room.status === 'FINISHED') {
      socket.emit('game:win', {
        winner: room.winnerTeam,
        roles: room.players.map((p) => ({ id: p.playerId, username: p.username, role: p.role, alive: p.alive })),
      });
      socket.emit('game:phase', {
        phase: 'GAME_OVER',
        round: room.round,
        phaseEndsAt: null,
        serverTime: Date.now(),
        message: PHASE_NAMES.GAME_OVER,
      });
      return;
    }

    socket.emit('game:phase', {
      phase: room.phase,
      round: room.round,
      phaseEndsAt: room.phaseEndsAt || null,
      serverTime: Date.now(),
      message: PHASE_NAMES[room.phase],
      roleCounts: room.roleCounts || null,
      nightResult: room.lastNightResult || null,
      voteResult: room.lastVoteResult || null,
    });

    if (room.phase === 'MAFIA_WAKE' && player.role === 'MAFIA' && player.alive)
      socket.emit('mafia:jitsi', { roomName: `mafia-${room.roomCode}-${room.round}` });
    if (room.phase === 'DISCUSSION' && player.alive)
      socket.emit('game:jitsi', { roomName: `discussion-${room.roomCode}-${room.round}` });
    if (room.phase === 'MAFIA_WAKE' && player.role === 'MAFIA' && player.alive)
      socket.emit('mafia:vote_update', { myChoice: player.mafiaChoice || null });
    if (room.phase === 'DOCTOR_WAKE' && player.role === 'DOCTOR' && room.doctorTarget)
      socket.emit('doctor:ack', { savedId: room.doctorTarget });
    if (room.phase === 'COP_WAKE' && player.role === 'COP' && room.copTarget) {
      const t = room.players.find((x) => x.playerId === room.copTarget);
      if (t) socket.emit('cop:result', { targetId: room.copTarget, isMafia: t.role === 'MAFIA' });
    }
    if (room.phase === 'VOTING') this.broadcastVotesTo(room.roomCode, player);
    if (room.phase === 'VOTE_RESULT' && room.lastVoteResult) socket.emit('game:vote_result', room.lastVoteResult);
    if (room.phase === 'CITY_WAKE' && room.lastNightResult) socket.emit('game:night_result', room.lastNightResult);
  }

  broadcastVotesTo(code, player) {
    const room = this.games.get(code);
    if (!room) return;
    const alive = room.players.filter((p) => p.alive);
    const counts = {};
    alive.forEach((p) => (counts[p.playerId] = 0));
    Object.values(room.votes).forEach((tid) => {
      if (counts[tid] !== undefined) counts[tid]++;
    });
    this.emitToPlayer(player, 'game:vote_update', {
      counts,
      votedCount: Object.keys(room.votes).length,
      total: alive.length,
      myVote: room.votes[player.playerId] || null,
    });
  }
}