import crypto from 'node:crypto';

export function generateRoomCode() {
  return crypto.randomInt(10000, 100000).toString();
}

export function generatePlayerId() {
  return crypto.randomUUID();
}