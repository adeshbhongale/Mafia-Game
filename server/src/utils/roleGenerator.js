// Fixed, server-side role distribution per player count.
//   5 players  -> 1 Mafia, 1 Doctor, 1 Cop, 2 Citizens
//   6-8 players -> 2 Mafia, 1 Doctor, 1 Cop, remaining Citizens
//   9-10 players -> 3 Mafia, 1 Doctor, 1 Cop, remaining Citizens
export const ROLE_DISTRIBUTION = {
  5: { mafia: 1, doctor: 1, cop: 1 },
  6: { mafia: 2, doctor: 1, cop: 1 },
  7: { mafia: 2, doctor: 1, cop: 1 },
  8: { mafia: 2, doctor: 1, cop: 1 },
  9: { mafia: 3, doctor: 1, cop: 1 },
  10: { mafia: 3, doctor: 1, cop: 1 },
};

// Fisher-Yates shuffle
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function assignRoles(playerCount) {
  const dist = ROLE_DISTRIBUTION[playerCount];
  if (!dist) throw new Error(`Invalid player count: ${playerCount}`);
  const pool = [];
  for (let i = 0; i < dist.mafia; i++) pool.push('MAFIA');
  for (let i = 0; i < dist.doctor; i++) pool.push('DOCTOR');
  for (let i = 0; i < dist.cop; i++) pool.push('COP');
  while (pool.length < playerCount) pool.push('CITIZEN');
  return shuffle(pool);
}