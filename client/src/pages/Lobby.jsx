import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Avatar from '../components/Avatar';
import Footer from '../components/Footer';
import Header from '../components/Header';
import { api, clearSession } from '../services/api';
import { rejoin, socketEmit } from '../services/socket';
import { saveSession, useGameStore } from '../store/gameStore';

export default function Lobby() {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const room = useGameStore((s) => s.room);
  const session = useGameStore((s) => s.session);
  const error = useGameStore((s) => s.error);
  const set = useGameStore((s) => s.set);
  const [copied, setCopied] = useState(false);
  const [starting, setStarting] = useState(false);
  const [localError, setLocalError] = useState('');
  const [joinName, setJoinName] = useState('');
  const [joining, setJoining] = useState(false);
  const [showDiscard, setShowDiscard] = useState(false);
  const [pendingNav, setPendingNav] = useState(null);

  const players = room?.players || [];
  const isHost = session?.playerId === room?.hostId;
  const canStart = players.length >= (room?.minPlayers || 5);
  const link = `${window.location.origin}/lobby/${roomCode}`;

  // If the game starts, move to the game page.
  useEffect(() => {
    if (room?.status === 'PLAYING') {
      navigate(`/game/${roomCode}`, { replace: true });
    }
  }, [room?.status, roomCode, navigate]);

  const copy = (text) => {
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const start = () => {
    if (!canStart) {
      setLocalError(`Need at least ${room?.minPlayers || 5} players to start.`);
      return;
    }
    setStarting(true);
    socketEmit('game:start', {});
    setTimeout(() => setStarting(false), 3000);
  };

  const leave = async () => {
    if (session) {
      socketEmit('room:leave', {});
      await api.leaveRoom(roomCode, session.playerId).catch(() => { });
    }
    clearSession();
    useGameStore.getState().resetGame();
    navigate('/', { replace: true });
  };

  // Host confirmed leaving → permanently discard the room.
  const discard = async () => {
    setShowDiscard(false);
    setPendingNav(null);
    if (session) {
      socketEmit('room:discard', {});
      await api.discardRoom(roomCode, session.playerId).catch(() => { });
    }
    clearSession();
    useGameStore.getState().resetGame();
    navigate('/', { replace: true });
  };

  // Anyone clicked Home / How to Play in the header → confirm leaving first.
  const handleNavAttempt = (dest) => {
    setPendingNav(dest);
    setShowDiscard(true);
  };

  // Confirmed leaving from the header (host discards the room, others just leave).
  const confirmNavLeave = async () => {
    setShowDiscard(false);
    setPendingNav(null);
    if (session) {
      if (isHost) {
        socketEmit('room:discard', {});
        await api.discardRoom(roomCode, session.playerId).catch(() => { });
      } else {
        socketEmit('room:leave', {});
        await api.leaveRoom(roomCode, session.playerId).catch(() => { });
      }
    }
    clearSession();
    useGameStore.getState().resetGame();
    navigate('/', { replace: true });
  };

  const closeDiscard = () => {
    setShowDiscard(false);
    setPendingNav(null);
  };

  // Visitor opened a room link directly (no session, or a session for another room)
  // → ask for a username and join that room.
  const handleJoin = async (e) => {
    e.preventDefault();
    const name = joinName.trim();
    if (name.length < 2 || joining) return;
    setJoining(true);
    setLocalError('');
    try {
      const data = await api.joinRoom(roomCode, name);
      const sess = { playerId: data.playerId, roomCode: data.roomCode, username: data.room.players.at(-1).username };
      set({ session: sess, room: data.room, error: null });
      saveSession(sess);
      rejoin();
    } catch (err) {
      setLocalError(err.message || 'Failed to join room');
    } finally {
      setJoining(false);
    }
  };

  if (!session || session.roomCode !== roomCode) {
    return (
      <div className="min-h-screen bg-background">
        <Header active="home" />
        <main className="relative pt-20 min-h-screen w-full bg-background">
          <div className="flex items-center justify-center min-h-[calc(100vh-80px)] relative overflow-hidden px-container-padding-mobile md:px-container-padding-desktop">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,0,0,0.1)_0%,rgba(19,19,19,1)_80%)] z-0"></div>
            <div className="relative z-10 w-full max-w-md bg-surface-container rounded-xl p-stack-lg shadow-[0_10px_30px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.05)]">
              <h2 className="font-display-lg text-[28px] text-on-surface uppercase tracking-widest text-center">
                Join Room <span className="text-primary">{roomCode}</span>
              </h2>
              <p className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest text-center mt-stack-sm">
                You were invited — enter your name to join
              </p>
              <form onSubmit={handleJoin} className="flex flex-col gap-stack-md mt-stack-lg">
                <div className="flex flex-col gap-1">
                  <label className="font-label-caps text-[10px] text-on-surface-variant tracking-wider uppercase">Your Name</label>
                  <input
                    autoFocus
                    value={joinName}
                    onChange={(e) => setJoinName(e.target.value)}
                    placeholder="Enter your name"
                    className="bg-transparent border-b border-primary focus:border-secondary font-body-md text-on-surface p-2 outline-none placeholder:text-on-surface-variant/40 transition-colors"
                  />
                </div>
                {(localError || error) && (
                  <p className="font-label-caps text-label-caps text-error uppercase text-center">{localError || error}</p>
                )}
                <button
                  type="submit"
                  disabled={joining || joinName.trim().length < 2}
                  className="w-full py-4 bg-primary-container relative overflow-hidden group shadow-[0_0_20px_rgba(139,0,0,0.2),inset_0_1px_1px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(139,0,0,0.5)] transition-all duration-300 rounded disabled:opacity-40"
                >
                  <span className="relative z-10 font-display-lg-mobile text-[22px] text-white uppercase tracking-wider">
                    {joining ? 'Joining...' : 'Enter Room'}
                  </span>
                </button>
              </form>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header active="home" onBlockNav={handleNavAttempt} />
      <main className="relative pt-20 min-h-screen w-full bg-background">
        <div className="flex flex-col w-full relative min-h-[calc(100vh-80px)] overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,0,0,0.1)_0%,rgba(19,19,19,1)_80%)] z-0"></div>
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjMDAwIiBmaWxsLW9wYWNpdHk9IjAuMSI+PC9yZWN0Pgo8L3N2Zz4=')] z-0 mix-blend-overlay"></div>

          <div className="relative z-10 flex flex-col w-full max-w-7xl mx-auto px-container-padding-mobile md:px-container-padding-desktop py-stack-lg gap-gutter h-full flex-grow">
            {/* Top Section: Room Code & Status */}
            <div className="flex flex-row justify-between items-end w-full flex-wrap gap-4">
              <div className="flex flex-col gap-unit">
                <span className="font-label-caps text-label-caps text-on-surface-variant tracking-[0.2em]">Syndicate Room</span>
                <div className="flex items-center gap-stack-md">
                  <h1 className="font-display-lg text-display-lg text-on-surface drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                    {roomCode}
                  </h1>
                  <button
                    onClick={() => copy(roomCode)}
                    className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center hover:bg-surface-bright transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] group relative"
                  >
                    <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors text-[20px]">
                      content_copy
                    </span>
                    <span
                      className={`absolute -top-8 bg-surface-container text-on-surface font-label-caps text-[10px] px-2 py-1 rounded whitespace-nowrap transition-opacity ${copied ? 'opacity-100' : 'opacity-0'
                        }`}
                    >
                      Copied
                    </span>
                  </button>
                </div>
              </div>
              <div className="flex flex-col items-end gap-unit">
                <div className="flex items-center gap-stack-sm bg-surface-container-low px-4 py-2 rounded shadow-[inset_0_1px_2px_rgba(255,255,255,0.05)] border-l border-t border-white/5">
                  <span className="w-2 h-2 rounded-full bg-[#00FF00] shadow-[0_0_8px_#00FF00] animate-[pulse_2s_ease-in-out_infinite]"></span>
                  <span className="font-label-caps text-label-caps text-on-surface uppercase tracking-widest">
                    {room?.status === 'PLAYING' ? 'Operation Active' : 'Awaiting Operatives'}
                  </span>
                </div>
                <span className="font-headline-md text-headline-md text-on-surface-variant opacity-80">
                  {players.length} / {room?.maxPlayers || 10} PLAYERS
                </span>
              </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-12 gap-gutter flex-grow h-full items-stretch">
              {/* Player Roster */}
              <div className="col-span-12 lg:col-span-8 flex flex-col gap-stack-md relative h-full">
                <div className="flex justify-between items-center pb-stack-sm border-b border-surface-variant relative">
                  <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">
                    Connected Agents
                  </span>
                  <div className="w-12 h-1 bg-gradient-to-r from-primary to-transparent absolute bottom-0 left-0 translate-y-[50%]"></div>
                </div>
                <div className="flex flex-col gap-stack-sm overflow-y-auto pr-2 pb-stack-lg custom-scrollbar h-[50vh] lg:h-auto">
                  {players.map((p, i) => (
                    <div
                      key={p.id}
                      className={`flex items-center justify-between p-stack-md bg-surface-container rounded shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] border-l-[3px] relative overflow-hidden group hover:bg-surface-container-high transition-colors ${p.isHost ? 'border-secondary' : 'border-surface-variant'
                        }`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-secondary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="flex items-center gap-stack-md relative z-10">
                        <Avatar username={p.username} size="md" />
                        <div className="flex flex-col">
                          <span className={`font-headline-md text-[20px] leading-tight ${p.isHost ? 'text-secondary' : 'text-on-surface group-hover:text-white transition-colors'}`}>
                            {p.username}
                            {p.id === session?.playerId && <span className="text-on-surface-variant text-[12px] ml-2">(You)</span>}
                          </span>
                          <span className="font-label-caps text-[10px] text-on-surface-variant opacity-60">
                            {p.connected ? 'Status: Secure' : 'Status: Offline'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-stack-sm relative z-10">
                        {p.isHost && (
                          <div className="px-3 py-1 bg-surface-container-lowest rounded flex items-center gap-2 border border-surface-variant/50">
                            <span className="material-symbols-outlined text-secondary text-[16px]">local_police</span>
                            <span className="font-label-caps text-[10px] text-secondary tracking-wider">Host</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center justify-center p-stack-md mt-stack-sm opacity-30 border border-dashed border-surface-variant rounded">
                    <span className="font-label-caps text-[12px] text-on-surface-variant uppercase tracking-widest">
                      {(room?.maxPlayers || 10) - players.length} Slots Remaining
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Panel */}
              <div className="col-span-12 lg:col-span-4 flex flex-col gap-stack-lg relative">
                <div className="bg-surface-container rounded-xl p-stack-md shadow-[0_10px_30px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.05)] flex flex-col gap-stack-md relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-secondary opacity-5 blur-[50px] pointer-events-none"></div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary">share</span>
                    <h3 className="font-headline-md text-[18px] text-on-surface">Invite Syndicate Members</h3>
                  </div>
                  <div className="flex flex-col gap-unit relative">
                    <label className="font-label-caps text-[10px] text-on-surface-variant tracking-wider uppercase">Direct Link</label>
                    <div className="flex w-full bg-[#000000] border-b border-primary focus-within:border-primary focus-within:shadow-[0_4px_15px_-3px_rgba(139,0,0,0.3)] transition-all group">
                      <input
                        readOnly
                        value={link}
                        className="bg-transparent w-full font-body-md text-on-surface p-3 outline-none cursor-text opacity-70 group-focus-within:opacity-100 transition-opacity"
                      />
                      <button
                        onClick={() => copy(link)}
                        className="px-4 bg-primary-container/20 hover:bg-primary-container/40 text-primary transition-colors flex items-center justify-center border-l border-surface-variant/30 relative"
                      >
                        <span className="material-symbols-outlined text-[20px]">content_copy</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-auto flex flex-col gap-stack-sm pb-stack-lg lg:pb-0">
                  {(localError || error) && (
                    <p className="font-label-caps text-label-caps text-error uppercase text-center">{localError || error}</p>
                  )}
                  {isHost ? (
                    <button
                      onClick={start}
                      disabled={!canStart || starting}
                      className={`w-full py-6 bg-primary-container relative overflow-hidden group shadow-[0_0_20px_rgba(139,0,0,0.2),inset_0_1px_1px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(139,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.3)] transition-all duration-300 rounded ${canStart ? '' : 'opacity-40'
                        }`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none"></div>
                      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
                      <span className="relative z-10 font-display-lg-mobile text-[28px] text-white uppercase tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                        {starting ? (
                          <>
                            <span className="material-symbols-outlined animate-spin inline-block align-middle mr-2">autorenew</span>
                            <span className="align-middle">Connecting...</span>
                          </>
                        ) : canStart ? (
                          'Start Game  ̸/̸̅̅ ̆̅ ̅̅ ̅̅'
                        ) : (
                          `Need ${(room?.minPlayers || 5) - players.length} more`
                        )}
                      </span>
                    </button>
                  ) : (
                    <div className="w-full py-6 bg-surface-container rounded text-center opacity-70">
                      <span className="font-display-lg-mobile text-[20px] text-on-surface uppercase tracking-wider">
                        Waiting for host to start...
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-center gap-2 opacity-60">
                    <span className="material-symbols-outlined text-[16px] text-on-surface-variant">info</span>
                    <span className="font-label-caps text-[10px] text-on-surface-variant tracking-wider uppercase">
                      {isHost ? 'Only Host Can Initiate' : 'The host will start the operation'}
                    </span>
                  </div>
                  <button
                    onClick={isHost ? () => setShowDiscard(true) : leave}
                    className="font-label-caps text-label-caps text-on-surface-variant hover:text-error uppercase tracking-widest transition-colors py-2"
                  >
                    {isHost ? 'Leave & Discard Room' : 'Leave Room'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {showDiscard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-sm bg-surface-container rounded-xl p-stack-lg shadow-[0_10px_30px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.05)]">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-error">warning</span>
              <h3 className="font-headline-md text-[20px] text-on-surface uppercase tracking-wider">Leave Room?</h3>
            </div>
            <p className="font-body-md text-on-surface-variant mt-stack-sm">
              {isHost
                ? `You are the host. ${pendingNav ? 'Navigating away will permanently discard' : 'Leaving will permanently discard'} this room and remove every player. This cannot be undone.`
                : 'Are you sure you want to leave the room and exit the game?'}
            </p>
            <div className="flex gap-gutter mt-stack-lg">
              <button
                onClick={closeDiscard}
                className="flex-1 py-3 bg-surface-variant text-on-surface font-label-caps uppercase tracking-widest rounded hover:bg-surface-bright transition-colors"
              >
                No
              </button>
              <button
                onClick={confirmNavLeave}
                className="flex-1 py-3 bg-error text-on-error font-label-caps uppercase tracking-widest rounded hover:opacity-90 transition-opacity"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
