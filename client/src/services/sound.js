// Lightweight synthesized sound effects using the Web Audio API.
// No audio files needed — every "track" is generated procedurally.

let ctx = null;

function ac() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

// Browsers block audio until the user interacts — unlock on first gesture.
function unlock() {
  const a = ac();
  if (a && a.state === 'suspended') a.resume();
}
if (typeof window !== 'undefined') {
  window.addEventListener('click', unlock);
  window.addEventListener('keydown', unlock);
}

function tone({ freq, start = 0, dur, type = 'sine', vol = 0.2, slideTo = null }) {
  const a = ac();
  if (!a || a.state !== 'running') return;
  const t0 = a.currentTime + start;
  const osc = a.createOscillator();
  const gain = a.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(vol, t0 + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(gain).connect(a.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

function noise({ start = 0, dur, vol = 0.12 }) {
  const a = ac();
  if (!a || a.state !== 'running') return;
  const t0 = a.currentTime + start;
  const buffer = a.createBuffer(1, Math.floor(a.sampleRate * dur), a.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const src = a.createBufferSource();
  src.buffer = buffer;
  const filter = a.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 700;
  const gain = a.createGain();
  gain.gain.setValueAtTime(vol, t0);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(filter).connect(gain).connect(a.destination);
  src.start(t0);
  src.stop(t0 + dur + 0.05);
}

const S = {
  // Game start — rising dramatic fanfare.
  welcome() {
    tone({ freq: 220, dur: 0.5, type: 'triangle', vol: 0.22 });
    tone({ freq: 330, start: 0.15, dur: 0.5, type: 'triangle', vol: 0.22 });
    tone({ freq: 440, start: 0.3, dur: 0.7, type: 'triangle', vol: 0.25 });
    tone({ freq: 554, start: 0.45, dur: 0.9, type: 'triangle', vol: 0.28 });
  },

  // Night falls — deep ominous drone.
  nightFall() {
    tone({ freq: 82, dur: 1.2, type: 'sawtooth', vol: 0.1, slideTo: 65 });
    tone({ freq: 41, start: 0.1, dur: 1.3, type: 'sine', vol: 0.2 });
    noise({ start: 0, dur: 0.4, vol: 0.05 });
  },

  // Mafia wakes — dark pulsing bass.
  mafiaWake() {
    tone({ freq: 110, dur: 0.22, type: 'square', vol: 0.11 });
    tone({ freq: 110, start: 0.3, dur: 0.22, type: 'square', vol: 0.11 });
    tone({ freq: 87, start: 0.6, dur: 0.6, type: 'sawtooth', vol: 0.14, slideTo: 65 });
  },

  // Doctor wakes — calm, soft chime.
  doctorWake() {
    tone({ freq: 523, dur: 0.8, type: 'sine', vol: 0.14 });
    tone({ freq: 659, start: 0.2, dur: 0.8, type: 'sine', vol: 0.14 });
  },

  // Cop wakes — suspenseful rising notes.
  copWake() {
    tone({ freq: 392, dur: 0.4, type: 'sine', vol: 0.14 });
    tone({ freq: 466, start: 0.35, dur: 0.4, type: 'sine', vol: 0.14 });
    tone({ freq: 523, start: 0.7, dur: 0.6, type: 'sine', vol: 0.18 });
  },

  // Everyone else sleeps — faint whisper.
  sleep() {
    tone({ freq: 220, dur: 0.5, type: 'sine', vol: 0.05 });
  },

  // Day breaks — reveal chime.
  daybreak() {
    tone({ freq: 523, dur: 0.3, type: 'triangle', vol: 0.2 });
    tone({ freq: 659, start: 0.15, dur: 0.3, type: 'triangle', vol: 0.2 });
    tone({ freq: 784, start: 0.3, dur: 0.6, type: 'triangle', vol: 0.22 });
  },

  // Discussion — light ambient hum.
  discussion() {
    tone({ freq: 196, dur: 1.0, type: 'sine', vol: 0.05 });
    tone({ freq: 293, start: 0.2, dur: 0.8, type: 'sine', vol: 0.04 });
  },

  // Voting — clock ticks.
  voting() {
    tone({ freq: 1000, dur: 0.06, type: 'square', vol: 0.08 });
    setTimeout(() => tone({ freq: 1000, dur: 0.06, type: 'square', vol: 0.08 }), 260);
  },

  // Vote result — dramatic resolution.
  voteResult() {
    tone({ freq: 165, dur: 0.5, type: 'sawtooth', vol: 0.14, slideTo: 130 });
    tone({ freq: 220, start: 0.25, dur: 0.6, type: 'sawtooth', vol: 0.14, slideTo: 165 });
  },

  // Victory fanfare.
  win() {
    tone({ freq: 523, dur: 0.25, type: 'triangle', vol: 0.24 });
    tone({ freq: 659, start: 0.2, dur: 0.25, type: 'triangle', vol: 0.24 });
    tone({ freq: 784, start: 0.4, dur: 0.3, type: 'triangle', vol: 0.24 });
    tone({ freq: 1047, start: 0.6, dur: 0.8, type: 'triangle', vol: 0.28 });
  },

  // Defeat — somber descending notes.
  lose() {
    tone({ freq: 330, dur: 0.5, type: 'sine', vol: 0.14 });
    tone({ freq: 262, start: 0.4, dur: 0.5, type: 'sine', vol: 0.14 });
    tone({ freq: 196, start: 0.8, dur: 1.0, type: 'sine', vol: 0.16 });
  },

  // Error buzz.
  error() {
    tone({ freq: 180, dur: 0.2, type: 'square', vol: 0.1 });
    tone({ freq: 140, start: 0.2, dur: 0.25, type: 'square', vol: 0.1 });
  },
};

const PHASE_SOUNDS = {
  WELCOME: 'welcome',
  CITY_SLEEP: 'nightFall',
  MAFIA_WAKE: 'mafiaWake',
  MAFIA_SLEEP: 'sleep',
  DOCTOR_WAKE: 'doctorWake',
  DOCTOR_SLEEP: 'sleep',
  COP_WAKE: 'copWake',
  COP_SLEEP: 'sleep',
  CITY_WAKE: 'daybreak',
  DISCUSSION: 'discussion',
  VOTING: 'voting',
  VOTE_RESULT: 'voteResult',
};

export function playPhaseSound(phase) {
  const key = PHASE_SOUNDS[phase];
  if (key && S[key]) S[key]();
}

export function playWinSound(winner) {
  if (winner === 'CITY') S.win();
  else S.lose();
}

export function playErrorSound() {
  S.error();
}