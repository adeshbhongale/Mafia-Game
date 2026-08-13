import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import cors from 'cors';
import routes from './routes/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function createApp() {
  const app = express();
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json());
  app.use('/api', routes);
  app.get('/health', (req, res) => res.json({ ok: true }));

  // Production: serve the built React client from this same server so the
  // frontend and backend share one origin (no proxy / no API URL needed).
  if (process.env.NODE_ENV === 'production') {
    const dist = path.resolve(__dirname, '../../client/dist');
    app.use(express.static(dist));
    app.get('*', (req, res) => {
      res.sendFile(path.join(dist, 'index.html'));
    });
  }

  return app;
}