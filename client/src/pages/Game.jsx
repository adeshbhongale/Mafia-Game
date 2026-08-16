import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import HowToPlayModal from '../components/HowToPlayModal';
import { api, clearSession } from '../services/api';
import { rejoin, socketEmit } from '../services/socket';
import { useGameStore } from '../store/gameStore';

import Welcome from '../components/phases/Welcome';
import CitySleep from '../components/phases/CitySleep';
import NightWait from '../components/phases/NightWait';
import MafiaPanel from '../components/phases/MafiaPanel';
import DoctorPanel from '../components/phases/DoctorPanel';
import CopPanel from '../components/phases/CopPanel';
import NightResult from '../components/phases/NightResult';
import Discussion from '../components/phases/Discussion';
import Voting from '../components/phases/Voting';
import VoteResult from '../components/phases/VoteResult';
import GameOver from '../components/phases/GameOver';

function LoadingScreen() {
  return (
    <div className="relative flex items-center justify-center min-h-[calc(100vh-80px)]">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(139,0,0,0.15)_0%,rgba(19,19,19,1)_80%)]"></div>
      <div className="relative z-10 flex flex-col items-center gap-stack-md">
        <span className="material-symbols-outlined text-primary animate-spin text-[48px]">autorenew</span>
        <p className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-[0.2em] animate-pulse">
          Entering the operation...
        </p>
      </div>
    </div>
  );
}

export default function Game() {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const room = useGameStore((s) => s.room);
  const session = useGameStore((s) => s.session);
  const phase = useGameStore((s) => s.phase);
  const role = useGameStore((s) => s.role);
  const error = useGameStore((s) => s.error);
  const set = useGameStore((s) => s.set);
  const [showLeave, setShowLeave] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  // Unload guard: browser prompt on close tab / refresh
  useEffect(() => {
    if (!session) return;
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
      return '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [session]);

  // Back button (popstate) guard: intercept browser back button to show confirmation
  useEffect(() => {
    if (!session) return;
    window.history.pushState({ inGame: true }, '');
    const handlePopState = () => {
      window.history.pushState({ inGame: true }, '');
      setShowLeave(true);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [session]);

  // Confirm leaving the game before heading home.
  const leaveGame = async () => {
    setShowLeave(false);
    if (session) {
      socketEmit('room:leave', {});
      await api.leaveRoom(roomCode, session.playerId).catch(() => {});
    }
    clearSession();
    useGameStore.getState().resetGame();
    navigate('/', { replace: true });
  };

  // Ensure we're synced with the server after refresh.
  useEffect(() => {
    rejoin();
  }, [roomCode]);

  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => set({ error: null }), 4000);
    return () => clearTimeout(t);
  }, [error, set]);

  // Room went back to waiting (e.g. fresh rejoin before start) → lobby.
  useEffect(() => {
    if (room?.status === 'WAITING') navigate(`/lobby/${roomCode}`, { replace: true });
  }, [room?.status, roomCode, navigate]);

  const me = room?.players?.find((p) => p.id === session?.playerId);
  const alive = me ? me.alive !== false : true;

  const handleLeave = () => setShowLeave(true);

  const renderPhase = () => {
    switch (phase) {
      case 'WELCOME':
        return <Welcome onLeave={handleLeave} />;
      case 'CITY_SLEEP':
        return <CitySleep onLeave={handleLeave} />;
      case 'MAFIA_WAKE':
        return role === 'MAFIA' && alive ? <MafiaPanel onLeave={handleLeave} /> : <NightWait onLeave={handleLeave} />;
      case 'MAFIA_SLEEP':
      case 'DOCTOR_SLEEP':
      case 'COP_SLEEP':
        return <NightWait onLeave={handleLeave} />;
      case 'DOCTOR_WAKE':
        return role === 'DOCTOR' && alive ? <DoctorPanel onLeave={handleLeave} /> : <NightWait onLeave={handleLeave} />;
      case 'COP_WAKE':
        return role === 'COP' && alive ? <CopPanel onLeave={handleLeave} /> : <NightWait onLeave={handleLeave} />;
      case 'CITY_WAKE':
        return <NightResult onLeave={handleLeave} />;
      case 'DISCUSSION':
        return <Discussion onLeave={handleLeave} />;
      case 'VOTING':
        return <Voting onLeave={handleLeave} />;
      case 'VOTE_RESULT':
        return <VoteResult onLeave={handleLeave} />;
      case 'GAME_OVER':
        return <GameOver onLeave={handleLeave} />;
      default:
        return <LoadingScreen />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onBlockNav={handleLeave} onHowToPlay={() => setShowHowToPlay(true)} />
      <main className="relative pt-20 min-h-screen w-full bg-background">
        <div className="flex flex-col w-full min-h-[calc(100vh-80px)] bg-background relative overflow-hidden">
          {renderPhase()}

          {/* Error toast */}
          {error && (
            <div className="fixed top-24 right-4 z-[70] bg-error-container text-on-error-container font-label-caps text-label-caps uppercase tracking-widest px-4 py-2 rounded shadow-lg animate-fade-in-up">
              {error}
            </div>
          )}
        </div>
      </main>

      {showLeave && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-sm bg-surface-container rounded-xl p-stack-lg shadow-[0_10px_30px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.05)]">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-error">warning</span>
              <h3 className="font-headline-md text-[20px] text-on-surface uppercase tracking-wider">Leave Game?</h3>
            </div>
            <p className="font-body-md text-on-surface-variant mt-stack-sm">
              Are you sure you want to leave the game and exit the room?
            </p>
            <div className="flex gap-gutter mt-stack-lg">
              <button
                onClick={() => setShowLeave(false)}
                className="flex-1 py-3 bg-surface-variant text-on-surface font-label-caps uppercase tracking-widest rounded hover:bg-surface-bright transition-colors"
              >
                No
              </button>
              <button
                onClick={leaveGame}
                className="flex-1 py-3 bg-error text-on-error font-label-caps uppercase tracking-widest rounded hover:opacity-90 transition-opacity"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}

      {showHowToPlay && <HowToPlayModal onClose={() => setShowHowToPlay(false)} />}

      <Footer />
    </div>
  );
}
