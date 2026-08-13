import { useGameStore } from '../../store/gameStore';
import { socketEmit } from '../../services/socket';
import ActionLayout from '../../components/ActionLayout';
import PlayerRow from '../../components/PlayerRow';
import JitsiRoom from '../../components/JitsiRoom';
import { HOME_BG_URL } from '../../config';

export default function MafiaPanel() {
  const room = useGameStore((s) => s.room);
  const session = useGameStore((s) => s.session);
  const phaseEndsAt = useGameStore((s) => s.phaseEndsAt);
  const myChoice = useGameStore((s) => s.myChoice);
  const teammates = useGameStore((s) => s.teammates);
  const jitsi = useGameStore((s) => s.jitsi);
  const set = useGameStore((s) => s.set);

  const players = room?.players || [];
  const alive = players.filter((p) => p.alive);
  const mafiaIds = new Set([session?.playerId, ...teammates.map((t) => t.id)]);

  const select = (p) => socketEmit('mafia:vote', { targetId: p.id });

  return (
    <div className="relative">
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(ellipse_at_center,rgba(139,0,0,0.35)_0%,rgba(19,19,19,1)_75%)]"></div>
      <ActionLayout
        title="Night Phase"
        subtitle="Mafia Wake Up"
        phaseEndsAt={phaseEndsAt}
        role="MAFIA"
        watermark="Select Target"
        glitch
        danger
        comms={
          <div className="flex flex-col gap-stack-md">
            {jitsi ? (
              <div className="w-full h-[420px] md:h-[480px] rounded-xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.6)]">
                <JitsiRoom roomName={jitsi.roomName} displayName={session?.username || 'Mafia'} onEnd={() => set({ jitsi: null })} />
              </div>
            ) : (
              <div className="w-full h-[420px] md:h-[480px] rounded-xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.6)] relative">
                <img src={HOME_BG_URL} alt="Mafia" className="absolute inset-0 w-full h-full object-cover opacity-50" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/70 flex items-center justify-center">
                  <p className="font-label-caps text-[10px] text-on-surface uppercase tracking-widest text-shadow-glow">
                    Channel closed — decide in silence
                  </p>
                </div>
              </div>
            )}
            <div className="bg-surface-container rounded-xl p-stack-md">
              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest flex items-center gap-unit">
                <span className="w-2 h-2 rounded-full bg-error animate-pulse"></span> Your Mafia Team
              </span>
              <div className="mt-stack-sm flex flex-col gap-unit">
                {alive
                  .filter((p) => mafiaIds.has(p.id))
                  .map((p) => (
                    <div key={p.id} className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-error text-[16px]">domino_mask</span>
                      <span className="font-body-md text-on-surface">{p.username}</span>
                      {p.id === session?.playerId && (
                        <span className="font-label-caps text-[10px] text-on-surface-variant">(You)</span>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        }
        rightHeader={
          <div className="flex items-center justify-between mb-stack-md">
            <h2 className="font-headline-md text-headline-md text-on-surface uppercase tracking-wider flex items-center gap-stack-sm">
              <span className="material-symbols-outlined text-primary">target</span> Living Players
            </h2>
            <span className="font-label-caps text-label-caps text-on-surface-variant bg-surface-container px-3 py-1 rounded-full uppercase">
              {alive.length} Alive
            </span>
          </div>
        }
        right={
          <div className="flex flex-col gap-unit">
            {alive.map((p) => {
              const isYou = p.id === session?.playerId;
              const isAlly = mafiaIds.has(p.id);
              if (isAlly) {
                return (
                  <PlayerRow
                    key={p.id}
                    player={p}
                    isYou={isYou}
                    meta={isYou ? 'Mafia' : 'Mafia'}
                    metaTone="text-error"
                    disabled
                    leftAccent="bg-tertiary-container"
                    right={
                      <div className="px-4 py-2 rounded bg-surface-variant/50 cursor-not-allowed">
                        <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Ally</span>
                      </div>
                    }
                  />
                );
              }
              return (
                <PlayerRow
                  key={p.id}
                  player={p}
                  isYou={isYou}
                  meta="Unknown"
                  metaTone="text-on-surface-variant"
                  onClick={() => select(p)}
                  selected={myChoice === p.id}
                  right={
                    <button
                      onClick={() => select(p)}
                      className="px-6 py-2 rounded bg-primary-container hover:bg-error-container hover:shadow-[0_0_15px_rgba(255,180,168,0.4)] transition-all flex items-center gap-unit group/btn"
                    >
                      <span className="material-symbols-outlined text-on-primary-container text-[18px] group-hover/btn:scale-110 transition-transform">
                        close
                      </span>
                      <span className="font-label-caps text-label-caps text-on-primary-container uppercase tracking-widest font-bold">
                        Kill
                      </span>
                    </button>
                  }
                />
              );
            })}
          </div>
        }
      />
    </div>
  );
}