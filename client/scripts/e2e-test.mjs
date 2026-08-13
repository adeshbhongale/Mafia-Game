// Automated end-to-end test of the full MAFIA game flow.
// Requires the server running with TEST_MODE=1 (short timers).
//
// Run from client/ so socket.io-client resolves:
//   node scripts/e2e-test.mjs
import { io } from 'socket.io-client';

const BASE = 'http://localhost:5000';
const NAME = 'e2e';

function req(path, method = 'GET', body) {
  return fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  }).then(async (r) => ({ status: r.status, data: await r.json() }));
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let passed = 0;
let failed = 0;
function assert(cond, label) {
  if (cond) {
    passed++;
    console.log(`  ✔ ${label}`);
  } else {
    failed++;
    console.error(`  ✘ FAIL: ${label}`);
  }
}

function connect(name, playerId, roomCode) {
  return new Promise((resolve) => {
    const s = io(BASE, { transports: ['polling', 'websocket'] });
    const bag = {
      socket: s,
      name,
      playerId,
      role: null,
      teammates: [],
      phases: [],
      jitsi: [],
      copResults: [],
      nightResults: [],
      voteResults: [],
      voteUpdates: [],
      chats: [],
      errors: [],
      roomStates: [],
      win: null,
    };
    s.on('connect', () => s.emit('room:rejoin', { playerId, roomCode }));
    s.on('game:role', (d) => (bag.role = d.role));
    s.on('mafia:teammates', (d) => (bag.teammates = d.teammates || []));
    s.on('game:phase', (d) => bag.phases.push(d.phase));
    s.on('mafia:jitsi', (d) => bag.jitsi.push(d.roomName));
    s.on('game:jitsi', (d) => bag.jitsi.push(d.roomName));
    s.on('cop:result', (d) => bag.copResults.push(d));
    s.on('game:night_result', (d) => bag.nightResults.push(d));
    s.on('game:vote_result', (d) => bag.voteResults.push(d));
    s.on('game:vote_update', (d) => bag.voteUpdates.push(d));
    s.on('chat:message', (d) => bag.chats.push(d));
    s.on('game:win', (d) => (bag.win = d));
    s.on('room:error', (d) => bag.errors.push(d.message));
    s.on('room:state', (d) => bag.roomStates.push(d.room));
    // resolved once we have received the initial room:state + game:role (after game starts)
    const done = () => {
      if (bag.role) resolve(bag);
    };
    s.on('game:role', done);
  });
}

console.log('=== MAFIA E2E TEST ===');

// ---------- 1. REST: create + join ----------
const players = ['Adesh', 'Sanika', 'Rahul', 'Priya', 'Akshay'];
const rooms = [];
const { status: createStatus, data: createData } = await req('/api/rooms', 'POST', { username: players[0] });
assert(createStatus === 201, `create room status ${createStatus}`);
assert(/^\d{5}$/.test(createData.roomCode), `room code is 5 digits (${createData.roomCode})`);
const roomCode = createData.roomCode;
const host = { playerId: createData.playerId, username: players[0] };

for (let i = 1; i < players.length; i++) {
  const { status: jStatus, data: jData } = await req('/api/rooms/join', 'POST', { roomCode, username: players[i] });
  assert(jStatus === 200, `join ${players[i]} -> ${jStatus}`);
  rooms.push(jData);
}
const others = rooms.map((r, i) => ({ playerId: r.playerId, username: players[i + 1] }));

// invalid joins
let bad = await req('/api/rooms/join', 'POST', { roomCode, username: 'Adesh' });
assert(bad.status === 400, 'duplicate username rejected');
bad = await req('/api/rooms/join', 'POST', { roomCode: '00000', username: 'Xavier' });
assert(bad.status === 400, 'unknown room rejected');
bad = await req('/api/rooms/join', 'POST', { roomCode, username: 'A' });
assert(bad.status === 400, 'short username rejected');

// room lookup
const { data: roomData } = await req(`/api/rooms/${roomCode}`);
assert(roomData.room.players.length === 5, 'room has 5 players');
assert(!JSON.stringify(roomData.room).includes('"role"'), 'sanitized room has NO role field (security)');

// ---------- 2. sockets ----------
const hostBag = await connect('Adesh', host.playerId, roomCode);
const otherBags = [];
for (const o of others) otherBags.push(await connect(o.username, o.playerId, roomCode));
const allBags = [hostBag, ...otherBags];
await sleep(300);

// host starts game
hostBag.socket.emit('game:start', {});
await sleep(1500);

// ---------- 3. role delivery ----------
const roles = allBags.map((b) => b.role);
const mafia = allBags.filter((b) => b.role === 'MAFIA');
const doctor = allBags.find((b) => b.role === 'DOCTOR');
const cop = allBags.find((b) => b.role === 'COP');
const citizens = allBags.filter((b) => b.role === 'CITIZEN');
assert(mafia.length === 1, `5 players -> 1 mafia assigned (got ${mafia.length})`);
assert(doctor, 'doctor assigned');
assert(cop, 'cop assigned');
assert(citizens.length === 2, `5 players -> 2 citizens assigned (got ${citizens.length})`);
assert(allBags.every((b) => ['MAFIA', 'DOCTOR', 'COP', 'CITIZEN'].includes(b.role)), 'everyone got a valid private role');

// mafia teammates
mafia.forEach((b) => {
  const mates = b.teammates.map((t) => t.username);
  const otherMafia = mafia.filter((x) => x !== b).map((x) => x.name);
  assert(
    otherMafia.length === mates.length && otherMafia.every((u) => mates.includes(u)),
    `${b.name} sees correct teammates (${mates.join(',') || 'none'})`
  );
});
citizens.forEach((b) => assert(b.teammates.length === 0, `${b.name} (citizen) received NO mafia teammates`));

// ---------- 4. security: citizen tries mafia action ----------
const citizen = citizens[0];
const aliveNonMafia = allBags.filter((b) => !mafia.includes(b));
const target = aliveNonMafia.find((b) => b !== citizen);
citizen.socket.emit('mafia:vote', { targetId: target.playerId });
await sleep(300);
assert(citizen.errors.some((e) => /not Mafia/i.test(e)), `citizen mafia:vote rejected (${citizen.errors.at(-1)})`);

// ---------- 5. mafia vote -> one target ----------
await sleep(800); // wait for MAFIA_WAKE
assert(allBags.every((b) => b.phases.includes('MAFIA_WAKE')), 'all clients reached MAFIA_WAKE');
mafia.forEach((b) => {
  const legitTarget = allBags.find((x) => !mafia.includes(x) && x !== b);
  b.socket.emit('mafia:vote', { targetId: legitTarget.playerId });
});
// mafia tries to kill each other -> rejected (only when multiple mafia exist)
if (mafia.length > 1) {
  mafia[0].socket.emit('mafia:vote', { targetId: mafia[1].playerId });
  await sleep(300);
  assert(mafia[0].errors.some((e) => /Mafia/i.test(e)), 'mafia cannot kill another mafia');
}

await sleep(1500);
const mafiaTarget = doctor; // doctor decided to self-save? We'll let doctor choose self.

// ---------- 6. doctor save ----------
await sleep(800);
assert(doctor.phases.includes('DOCTOR_WAKE'), 'doctor reached DOCTOR_WAKE');
doctor.socket.emit('doctor:save', { targetId: doctor.playerId });
await sleep(800);
assert(cop.phases.includes('COP_WAKE'), 'cop reached COP_WAKE');

// ---------- 7. cop investigate ----------
const copTarget = mafia[0];
cop.socket.emit('cop:investigate', { targetId: copTarget.playerId });
await sleep(800);
assert(cop.copResults.length === 1, 'cop received exactly one private result');
assert(cop.copResults[0].isMafia === true, `cop result for mafia target is YES (${cop.copResults[0].isMafia})`);
assert(allBags.filter((b) => b !== cop).every((b) => b.copResults.length === 0), 'NO other player received cop result (security)');

// doctor saved self; mafia targeted a non-mafia (citizen/doctor/cop). Check night result.
await sleep(2500);
assert(allBags.every((b) => b.phases.includes('CITY_WAKE')), 'all reached CITY_WAKE');
const nr = hostBag.nightResults.at(-1);
const deathByMafia = mafiaTarget; // mafia all voted on different legit targets -> majority/tie random
console.log(`    [night_result] ${JSON.stringify(nr && nr.messages)}`);

// ---------- 8. discussion ----------
await sleep(6000);
assert(allBags.every((b) => b.phases.includes('DISCUSSION')), 'all reached DISCUSSION');
const aliveBags = allBags.filter((b) => b.roomStates.at(-1)?.players?.find((p) => p.id === b.playerId)?.alive !== false);
aliveBags[0].socket.emit('chat:send', { text: 'Hello citizens!' });
await sleep(300);
assert(aliveBags.every((b) => b.chats.some((m) => m.text === 'Hello citizens!')), 'chat broadcast to living players');
// dead player chat rejected
const deadBag = allBags.find((b) => b.roomStates.at(-1)?.players?.find((p) => p.id === b.playerId)?.alive === false);
if (deadBag) {
  const errsBefore = deadBag.errors.length;
  deadBag.socket.emit('chat:send', { text: 'I am dead speaking' });
  await sleep(300);
  assert(deadBag.errors.length > errsBefore, 'dead player chat rejected');
}

// ---------- 9. voting ----------
await sleep(6000);
assert(allBags.every((b) => b.phases.includes('VOTING')), 'all reached VOTING');
const voters = allBags.filter((b) => b.roomStates.at(-1)?.players?.find((p) => p.id === b.playerId)?.alive !== false);
if (voters.length >= 2) {
  voters.forEach((v, i) => {
    const t = voters[(i + 1) % voters.length];
    v.socket.emit('game:vote', { targetId: t.playerId });
  });
  await sleep(800);
  assert(voters.every((v) => v.voteUpdates.length > 0), 'vote updates received');
  assert(voters.every((v) => v.voteUpdates.at(-1).myVote), 'each voter has myVote set');
  // self-vote rejected
  voters[0].socket.emit('game:vote', { targetId: voters[0].playerId });
  await sleep(300);
  assert(voters[0].errors.some((e) => /yourself/i.test(e)), 'self-vote rejected');
}
// dead can't vote
if (deadBag) {
  const errsBefore = deadBag.errors.length;
  deadBag.socket.emit('game:vote', { targetId: voters[0].playerId });
  await sleep(300);
  assert(deadBag.errors.length > errsBefore, 'dead player vote rejected');
}

await sleep(2500);
assert(allBags.every((b) => b.phases.includes('VOTE_RESULT')), 'all reached VOTE_RESULT');
const vr = hostBag.voteResults.at(-1);
console.log(`    [vote_result] eliminated=${vr && vr.eliminated && vr.eliminated.username} tie=${vr && vr.tie}`);

// ---------- 10. next round / game over ----------
await sleep(12000);
const finished = allBags.filter((b) => b.win);
console.log(`    [win] ${finished.length} bag(s) saw game:win`);
if (finished.length) console.log(`    winner=${finished[0].win.winner}`);

// security re-check: no role leaked in any room:state
const leaked = allBags.some((b) => b.roomStates.some((r) => JSON.stringify(r).includes('"role"')));
assert(!leaked, 'role NEVER present in public room:state (security)');

// close sockets
allBags.forEach((b) => b.socket.close());

console.log(`\n=== RESULT: ${passed} passed, ${failed} failed ===`);
process.exit(failed ? 1 : 0);