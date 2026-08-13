import { useGameStore } from '../../store/gameStore';
import JitsiRoom from '../../components/JitsiRoom';
import ChatPanel from '../../components/ChatPanel';
import Roster from '../../components/Roster';
import GameTimer from '../../components/GameTimer';
import { HOME_BG_URL } from '../../config';

export default function Discussion() {
  const room = useGameStore((s) => s.room);
  const session = useGameStore((s) => s.session);
  const phaseEndsAt = useGameStore((s) => s.phaseEndsAt);
  const jitsi = useGameStore((s) => s.jitsi);
  const round = useGameStore((s) => s.round);
  const set = useGameStore((s) => s.set);

  const me = room?.players?.find((p) => p.id === session?.playerId);
  const alive = me ? me.alive !== false : true;

  return (
    <div className="flex flex-col w-full h-full pb-container-padding-desktop">
      <div className="px-container-padding-mobile md:px-container-padding-desktop mt-stack-md flex justify-between items-end mb-stack-lg relative z-10">
        <div className="flex flex-col">
          <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-[0.2em] mb-unit">
            Current Phase
          </span>
          <h1 className="font-display-lg text-display-lg text-on-background uppercase relative inline-block">
            Day Discussion
            <div className="absolute -bottom-2 left-0 w-1/3 h-1 bg-primary shadow-[0_0_10px_rgba(255,180,168,0.8)]"></div>
          </h1>
        </div>
        <div className="flex items-center gap-stack-md bg-surface-container-high px-stack-md py-stack-sm rounded shadow-md relative overflow-hidden group">
          <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors"></div>
          <span className="material-symbols-outlined text-primary animate-pulse">timer</span>
          <div className="flex flex-col">
            <span className="font-label-caps text-[10px] text-on-surface-variant uppercase">Time Remaining</span>
            <GameTimer phaseEndsAt={phaseEndsAt} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-gutter px-container-padding-mobile md:px-container-padding-desktop flex-1 h-[calc(100vh-220px)] min-h-[600px]">
        {/* Video / Jitsi area */}
        <div className="col-span-12 lg:col-span-8 bg-surface-container rounded-lg shadow-xl relative overflow-hidden flex flex-col">
          <div className="absolute top-0 left-0 w-full p-stack-md bg-gradient-to-b from-surface-container-lowest to-transparent z-10 flex justify-between items-start pointer-events-none">
            <div className="bg-surface-variant/80 backdrop-blur-md px-stack-sm py-unit rounded flex items-center gap-stack-sm pointer-events-auto">
              <div className="w-2 h-2 rounded-full bg-[#00FF00] shadow-[0_0_8px_#00FF00]"></div>
              <span className="font-label-caps text-[10px] text-on-surface">Secure Channel — Round {round}</span>
            </div>
          </div>
          {alive && jitsi ? (
            <JitsiRoom roomName={jitsi.roomName} displayName={session?.username || 'Agent'} onEnd={() => set({ jitsi: null })} />
          ) : (
            <div className="flex-1 relative flex flex-col items-center justify-center overflow-hidden">
              <img src={HOME_BG_URL} alt="Mafia" className="absolute inset-0 w-full h-full object-cover opacity-60" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/70"></div>
              <div className="relative z-10 flex flex-col items-center gap-stack-md">
                <span className="material-symbols-outlined text-[56px] text-primary opacity-80">visibility_off</span>
                <p className="font-label-caps text-label-caps text-on-surface uppercase tracking-[0.2em] text-shadow-glow">
                  {alive ? 'Channel closed...' : 'You are dead. Observing only.'}
                </p>
                {alive && (
                  <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest">
                    Keep strategizing in the chat
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar: roster + chat */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-gutter h-full">
          <div className="h-2/5">
            <Roster />
          </div>
          <div className="h-3/5">
            <ChatPanel />
          </div>
        </div>
      </div>
    </div>
  );
}