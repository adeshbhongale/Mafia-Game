import mongoose from 'mongoose';

let connected = false;

export async function connectDB(uri) {
  if (!uri) return false;
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
    connected = true;
    console.log('[db] MongoDB connected');
    if (process.env.RESET_DB === '1') {
      try {
        await mongoose.connection.db.dropDatabase();
        console.log('[db] database wiped (RESET_DB=1) — fresh start, no old rooms restored');
      } catch (e) {
        console.log('[db] wipe skipped:', e.message);
      }
    }
    return true;
  } catch (e) {
    connected = false;
    console.warn(`[db] MongoDB unavailable (${e.message}). Using in-memory store.`);
    return false;
  }
}

export const isDBConnected = () => connected;
