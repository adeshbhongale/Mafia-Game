import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { api, saveSession } from '../services/api';
import { useGameStore } from '../store/gameStore';
import { rejoin } from '../services/socket';
import { HOME_BG_URL } from '../config';

export default function Home() {
  const navigate = useNavigate();
  const set = useGameStore((s) => s.set);

  const [step, setStep] = useState(null); // 'create' | 'join-code' | 'join-username'
  const [username, setUsername] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const openCreate = () => {
    setError('');
    setUsername('');
    setStep('create');
  };

  const openJoin = () => {
    setError('');
    setRoomCode('');
    setStep('join-code');
  };

  const submitCreate = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.createRoom(username);
      const sess = { playerId: data.playerId, roomCode: data.roomCode, username: data.room.players[0].username };
      saveSession(sess);
      set({ session: sess, room: data.room, error: null });
      rejoin();
      navigate(`/lobby/${data.roomCode}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const submitCode = async (e) => {
    e.preventDefault();
    setError('');
    // validate code format before asking username
    const code = roomCode.trim();
    if (!/^\d{5}$/.test(code)) return setError('Room code must be 5 digits.');
    setStep('join-username');
  };

  const submitJoin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.joinRoom(roomCode, username);
      const sess = { playerId: data.playerId, roomCode: data.roomCode, username: data.room.players.at(-1).username };
      saveSession(sess);
      set({ session: sess, room: data.room, error: null });
      rejoin();
      navigate(`/lobby/${data.roomCode}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header active="home" />
      <main className="relative pt-20 min-h-screen w-full bg-background">
        <div className="flex flex-col w-full h-full min-h-[calc(100vh-80px)] -mt-20 relative overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(139,0,0,0.22)_0%,rgba(19,19,19,1)_78%)]"></div>
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url('${HOME_BG_URL}')` }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-transparent to-background/90"></div>
            <div className="absolute inset-0 opacity-10 mix-blend-overlay bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjMDAwIiBmaWxsLW9wYWNpdHk9IjAuMSI+PC9yZWN0Pgo8L3N2Zz4=')]"></div>
          </div>

          {/* Hero */}
          <div className="relative z-10 flex flex-col items-center justify-center flex-grow w-full px-container-padding-mobile md:px-container-padding-desktop pt-32 pb-24">
            <div className="text-center max-w-4xl mx-auto flex flex-col items-center gap-stack-lg animate-fade-in-up">
              <div className="space-y-stack-sm flex flex-col items-center">
                <h1 className="font-display-lg-mobile text-display-lg-mobile md:font-display-lg md:text-display-lg text-on-surface uppercase tracking-widest text-shadow-glow">
                  <span className="block text-primary">Trust</span>
                  <span className="block">No One.</span>
                </h1>
                <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl text-center mt-stack-md opacity-80 uppercase tracking-widest border-t border-outline/30 pt-stack-sm">
                  A Real-Time Social Game of Betrayal and Deception
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-gutter w-full justify-center mt-stack-lg">
                <button
                  onClick={openCreate}
                  className="relative group w-full sm:w-auto overflow-hidden rounded-sm bg-primary-container/40 backdrop-blur-md px-12 py-4 shadow-[0_0_20px_rgba(139,0,0,0.3)] hover:shadow-[0_0_40px_rgba(255,180,168,0.5)] transition-all duration-300 border-t border-l border-primary/30"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative font-headline-md text-headline-md text-on-primary-container uppercase tracking-widest group-hover:text-primary transition-colors">
                    Create Room
                  </span>
                  <div className="absolute bottom-0 left-0 h-1 w-full bg-primary transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
                </button>

                <button
                  onClick={openJoin}
                  className="relative group w-full sm:w-auto overflow-hidden rounded-sm bg-surface-variant/40 backdrop-blur-md px-12 py-4 shadow-[0_0_15px_rgba(0,0,0,0.5)] hover:shadow-[0_0_25px_rgba(255,255,255,0.1)] transition-all duration-300 border-t border-l border-white/10"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative font-headline-md text-headline-md text-on-surface uppercase tracking-widest group-hover:text-white transition-colors">
                    Join Room
                  </span>
                  <div className="absolute bottom-0 left-0 h-1 w-full bg-tertiary-fixed transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
                </button>
              </div>
            </div>

            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-unit opacity-50 animate-pulse">
              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-[0.2em]">Scroll to Enter</span>
              <span className="material-symbols-outlined text-on-surface-variant">keyboard_arrow_down</span>
            </div>
          </div>
        </div>

        {/* How to Play */}
        <section id="how-to-play" className="relative w-full px-container-padding-mobile md:px-container-padding-desktop pt-stack-lg pb-40">
          <div className="max-w-4xl mx-auto flex flex-col gap-stack-lg">
            <h2 className="font-display-lg text-[36px] text-on-surface uppercase tracking-widest">
              How to <span className="text-primary">Play</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
              {[
                {
                  icon: 'nightlight',
                  title: 'Night Phase',
                  body: 'Mafia wakes first to secretly choose one victim. The Doctor picks someone to save. The Cop investigates a player for Mafia — the result is private.',
                },
                {
                  icon: 'groups',
                  title: 'Day Discussion',
                  body: 'All living players join a live video call to accuse, defend and debate. Dead players watch silently.',
                },
                {
                  icon: 'how_to_vote',
                  title: 'Voting',
                  body: 'Everyone votes for who they believe is Mafia. The top vote-getter is eliminated — a tie means nobody is eliminated.',
                },
                {
                  icon: 'workspace_premium',
                  title: 'Win Conditions',
                  body: 'The City wins when all Mafia are eliminated. The Mafia wins when Mafia players are at least half of the living players.',
                },
              ].map((c) => (
                <div key={c.title} className="bg-surface-container rounded-xl p-stack-md shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                  <span className="material-symbols-outlined text-primary text-[32px]">{c.icon}</span>
                  <h3 className="font-headline-md text-[18px] text-on-surface uppercase tracking-wider mt-stack-sm">{c.title}</h3>
                  <p className="font-body-md text-on-surface-variant mt-stack-sm">{c.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Role Rules */}
        <section id="roles" className="relative w-full px-container-padding-mobile md:px-container-padding-desktop pb-40">
          <div className="max-w-4xl mx-auto flex flex-col gap-stack-lg">
            <h2 className="font-display-lg text-[36px] text-on-surface uppercase tracking-widest">
              Know Your <span className="text-primary">Role</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
              {[
                {
                  icon: 'domino_mask',
                  name: 'Mafia',
                  tone: 'text-error',
                  ring: 'ring-error/40',
                  lines: [
                    'Wakes first every night to choose ONE target.',
                    'See each other and talk privately over video.',
                    'The team must agree on a single elimination.',
                    'Cannot kill another Mafia member.',
                  ],
                },
                {
                  icon: 'local_hospital',
                  name: 'Doctor',
                  tone: 'text-secondary-fixed',
                  ring: 'ring-secondary-fixed/40',
                  lines: [
                    'Wakes after the Mafia each night.',
                    'Chooses one player to save from death.',
                    'Saving the Mafia\u2019s target cancels the kill.',
                    'May save yourself.',
                  ],
                },
                {
                  icon: 'local_police',
                  name: 'Cop',
                  tone: 'text-primary',
                  ring: 'ring-primary/40',
                  lines: [
                    'Wakes after the Doctor each night.',
                    'Investigates one player each night.',
                    'Learns privately whether the target is MAFIA.',
                    'The result is secret — the city never sees it.',
                  ],
                },
                {
                  icon: 'person',
                  name: 'Citizen',
                  tone: 'text-on-surface',
                  ring: 'ring-on-surface/40',
                  lines: [
                    'No night power — sleep through the night.',
                    'During the day, discuss and accuse.',
                    'Vote to eliminate suspected Mafia members.',
                    'Win when every Mafia player is removed.',
                  ],
                },
              ].map((r) => (
                <div
                  key={r.name}
                  className={`bg-surface-container rounded-xl p-stack-md shadow-[0_10px_30px_rgba(0,0,0,0.5)] ring-1 ${r.ring}`}
                >
                  <div className="flex items-center gap-stack-sm">
                    <span className={`material-symbols-outlined text-[34px] ${r.tone}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                      {r.icon}
                    </span>
                    <h3 className="font-headline-md text-[20px] text-on-surface uppercase tracking-wider">{r.name}</h3>
                  </div>
                  <ul className="mt-stack-md space-y-unit">
                    {r.lines.map((line, i) => (
                      <li key={i} className="flex items-start gap-2 font-body-md text-on-surface-variant">
                        <span className={`material-symbols-outlined text-[16px] mt-1 ${r.tone}`}>radio_button_checked</span>
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Flow Modal */}
      {step && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-container-padding-mobile">
          <div className="w-full max-w-md bg-surface-container-high rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] border-t border-l border-white/10 overflow-hidden animate-fade-in-up">
            <div className="p-stack-md bg-surface-container border-b border-surface-variant flex items-center justify-between">
              <h3 className="font-headline-md text-[20px] text-on-surface uppercase tracking-widest">
                {step === 'create' && 'Create Room'}
                {step === 'join-code' && 'Enter Room Code'}
                {step === 'join-username' && 'Enter Username'}
              </h3>
              <button onClick={() => setStep(null)} className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors">
                close
              </button>
            </div>

            <div className="p-stack-lg">
              {step === 'create' && (
                <form onSubmit={submitCreate} className="flex flex-col gap-stack-md">
                  <div>
                    <label className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider mb-unit block">
                      Username
                    </label>
                    <input
                      autoFocus
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Your name (2-20 chars)"
                      className="w-full bg-[#000000] text-on-surface font-body-md px-3 py-3 outline-none border-b border-primary/30 focus:border-primary focus:bg-white/5 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] placeholder:text-on-surface-variant/50"
                    />
                  </div>
                  {error && <p className="font-label-caps text-label-caps text-error uppercase">{error}</p>}
                  <button
                    type="submit"
                    disabled={loading || username.trim().length < 2}
                    className="w-full py-4 bg-primary-container relative overflow-hidden group shadow-[0_0_20px_rgba(139,0,0,0.2),inset_0_1px_1px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(139,0,0,0.5)] transition-all duration-300 rounded disabled:opacity-40"
                  >
                    <span className="relative z-10 font-display-lg-mobile text-[22px] text-white uppercase tracking-wider">
                      {loading ? 'Creating...' : 'Create Room'}
                    </span>
                  </button>
                </form>
              )}

              {step === 'join-code' && (
                <form onSubmit={submitCode} className="flex flex-col gap-stack-md">
                  <input
                    autoFocus
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
                    placeholder="Enter 5-digit room code"
                    className="w-full bg-[#000000] border-b border-primary focus:border-secondary focus:shadow-[0_4px_15px_-3px_rgba(139,0,0,0.4)] transition-all font-display-lg text-[32px] text-center text-primary tracking-[0.4em] py-4 outline-none placeholder:text-on-surface-variant/40 placeholder:tracking-[0.15em] placeholder:text-[18px]"
                  />
                  <p className="text-center font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest">
                    {roomCode.length}/5 digits — type your code
                  </p>
                  {error && <p className="font-label-caps text-label-caps text-error uppercase text-center">{error}</p>}
                  <button
                    type="submit"
                    disabled={roomCode.length !== 5}
                    className="w-full py-4 bg-primary-container relative overflow-hidden group shadow-[0_0_20px_rgba(139,0,0,0.2),inset_0_1px_1px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(139,0,0,0.5)] transition-all duration-300 rounded disabled:opacity-40"
                  >
                    <span className="relative z-10 font-display-lg-mobile text-[22px] text-white uppercase tracking-wider">Continue</span>
                  </button>
                </form>
              )}

              {step === 'join-username' && (
                <form onSubmit={submitJoin} className="flex flex-col gap-stack-md">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-headline-md text-[26px] text-primary tracking-[0.3em]">{roomCode}</span>
                    <button
                      type="button"
                      onClick={() => setStep('join-code')}
                      className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest hover:text-primary transition-colors"
                    >
                      ← change
                    </button>
                  </div>
                  <div>
                    <label className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider mb-unit block">
                      Username
                    </label>
                    <input
                      autoFocus
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Your name (2-20 chars)"
                      className="w-full bg-[#000000] text-on-surface font-body-md px-3 py-3 outline-none border-b border-primary/30 focus:border-primary focus:bg-white/5 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] placeholder:text-on-surface-variant/50"
                    />
                  </div>
                  {error && <p className="font-label-caps text-label-caps text-error uppercase">{error}</p>}
                  <button
                    type="submit"
                    disabled={loading || username.trim().length < 2}
                    className="w-full py-4 bg-primary-container relative overflow-hidden group shadow-[0_0_20px_rgba(139,0,0,0.2),inset_0_1px_1px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(139,0,0,0.5)] transition-all duration-300 rounded disabled:opacity-40"
                  >
                    <span className="relative z-10 font-display-lg-mobile text-[22px] text-white uppercase tracking-wider">
                      {loading ? 'Joining...' : 'Enter Room'}
                    </span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
