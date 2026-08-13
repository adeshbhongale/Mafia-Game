import { useGameStore, loadSession, saveSession, clearSession } from '../store/gameStore';

const API_BASE = '/api';

async function handle(res) {
  let data;
  try {
    data = await res.json();
  } catch {
    data = {};
  }
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  createRoom: (username) =>
    fetch(`${API_BASE}/rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
    }).then(handle),

  joinRoom: (roomCode, username) =>
    fetch(`${API_BASE}/rooms/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomCode, username }),
    }).then(handle),

  getRoom: (roomCode) => fetch(`${API_BASE}/rooms/${roomCode}`).then(handle),

  leaveRoom: (roomCode, playerId) =>
    fetch(`${API_BASE}/rooms/${roomCode}/leave`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId }),
    }).then(handle),

  discardRoom: (roomCode, playerId) =>
    fetch(`${API_BASE}/rooms/${roomCode}/discard`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerId }),
    }).then(handle),
};

export { useGameStore, loadSession, saveSession, clearSession };
