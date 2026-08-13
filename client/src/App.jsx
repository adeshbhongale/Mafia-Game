import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Lobby from './pages/Lobby.jsx';
import Game from './pages/Game.jsx';
import { useGameStore } from './store/gameStore';
import { getSocket } from './services/socket';

function RequireSession({ children }) {
  const session = useGameStore((s) => s.session);
  if (!session) return <Navigate to="/" replace />;
  return children;
}

function Bootstrapper() {
  const session = useGameStore((s) => s.session);

  // Connect the socket whenever we have a session. The store is seeded from
  // localStorage, so this also runs on refresh — the socket auto-rejoins the
  // room and keeps the player on the lobby/game page instead of the home page.
  useEffect(() => {
    if (session && session.roomCode) {
      getSocket();
    }
  }, [session]);

  return null;
}

export default function App() {
  return (
    <>
      <Bootstrapper />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/lobby/:roomCode"
          element={<Lobby />}
        />
        <Route
          path="/game/:roomCode"
          element={
            <RequireSession>
              <Game />
            </RequireSession>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
