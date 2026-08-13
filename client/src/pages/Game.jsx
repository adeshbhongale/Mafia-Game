import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { rejoin } from '../services/socket';
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

  const renderPhase = () => {
    switch (phase) {
      case 'WELCOME':
        return <Welcome />;
      case 'CITY_SLEEP':
        return <CitySleep />;
      case 'MAFIA_WAKE':
        return role === 'MAFIA' && alive ? <MafiaPanel /> : <NightWait />;
      case 'MAFIA_SLEEP':
      case 'DOCTOR_SLEEP':
      case 'COP_SLEEP':
        return <NightWait />;
      case 'DOCTOR_WAKE':
        return role === 'DOCTOR' && alive ? <DoctorPanel /> : <NightWait />;
      case 'COP_WAKE':
        return role === 'COP' && alive ? <CopPanel /> : <NightWait />;
      case 'CITY_WAKE':
        return <NightResult />;
      case 'DISCUSSION':
        return <Discussion />;
      case 'VOTING':
        return <Voting />;
      case 'VOTE_RESULT':
        return <VoteResult />;
      case 'GAME_OVER':
        return <GameOver />;
      default:
        return <LoadingScreen />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="relative pt-20 min-h-screen w-full bg-background">
        <div className="flex flex-col w-full min-h-[calc(100vh-80px)] bg-background relative overflow-hidden">
          {renderPhase()}

          {/* Error toast */}
          {error && (
            <div className="fixed top-24 right-4 z-[70] bg-error-container text-on-error-container font-label-caps text-label-caps uppercase tracking-widest px-4 py-2 rounded shadow-lg animate-fade-in-up">
              {error}
            </div>
          )}

          {/* Exit */}
          <button
            onClick={() => navigate('/')}
            className="fixed bottom-12 right-4 z-[60] w-10 h-10 rounded-full bg-surface-variant/80 backdrop-blur-md flex items-center justify-center hover:bg-surface-bright transition-colors shadow-lg"
            title="Exit game"
          >
            <span className="material-symbols-outlined text-on-surface-variant text-[20px]">logout</span>
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
