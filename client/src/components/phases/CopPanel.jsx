import { useGameStore } from '../../store/gameStore';
import { socketEmit } from '../../services/socket';
import ActionLayout from '../../components/ActionLayout';
import PlayerRow from '../../components/PlayerRow';

export default function CopPanel() {
  const room = useGameStore((s) => s.room);
  const session = useGameStore((s) => s.session);
  const phaseEndsAt = useGameStore((s) => s.phaseEndsAt);
  const copResult = useGameStore((s) => s.copResult);

  const alive = (room?.players || []).filter((p) => p.alive && p.id !== session?.playerId);
  const select = (p) => socketEmit('cop:investigate', { targetId: p.id });

  const resultPlayer = copResult && room?.players?.find((p) => p.id === copResult.targetId);

  return (
    <div className="relative">
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(ellipse_at_center,rgba(255,180,168,0.15)_0%,rgba(19,19,19,1)_75%)]"></div>
      <ActionLayout
        title="Cop Phase"
        subtitle="Cop Wake Up"
        phaseEndsAt={phaseEndsAt}
        role="COP"
        watermark="Investigate"
        rightHeader={
          <div className="flex items-center justify-between mb-stack-md">
            <h2 className="font-headline-md text-headline-md text-on-surface uppercase tracking-wider flex items-center gap-stack-sm">
              <span className="material-symbols-outlined text-primary">local_police</span> Choose One To Investigate
            </h2>
            <span className="font-label-caps text-label-caps text-on-surface-variant bg-surface-container px-3 py-1 rounded-full uppercase">
              {alive.length} Suspects
            </span>
          </div>
        }
        right={
          <div className="flex flex-col gap-unit">
            {copResult && resultPlayer && (
              <div
                className={`mb-stack-sm p-stack-md rounded flex items-center gap-stack-md ${
                  copResult.isMafia
                    ? 'bg-error-container/30 ring-1 ring-error/50'
                    : 'bg-surface-container ring-1 ring-[#00FF00]/40'
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[28px] ${
                    copResult.isMafia ? 'text-error' : 'text-[#00FF00]'
                  }`}
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {copResult.isMafia ? 'report' : 'verified'}
                </span>
                <div className="flex flex-col">
                  <span className="font-headline-md text-headline-md text-on-surface">{resultPlayer.username}</span>
                  <span className={`font-label-caps text-label-caps uppercase ${copResult.isMafia ? 'text-error' : 'text-[#00FF00]'}`}>
                    {copResult.isMafia ? 'YES — This player is MAFIA' : 'NO — Not Mafia'}
                  </span>
                </div>
              </div>
            )}
            {alive.map((p) => (
              <PlayerRow
                key={p.id}
                player={p}
                meta="Unknown"
                metaTone="text-on-surface-variant"
                onClick={() => select(p)}
                selected={copResult?.targetId === p.id}
                right={
                  <button
                    onClick={() => select(p)}
                    className="px-6 py-2 rounded bg-primary-container hover:bg-primary hover:shadow-[0_0_15px_rgba(255,180,168,0.4)] transition-all flex items-center gap-unit"
                  >
                    <span className="material-symbols-outlined text-on-primary-container text-[18px] group-hover/btn:scale-110 transition-transform">
                      search
                    </span>
                    <span className="font-label-caps text-label-caps text-on-primary-container uppercase tracking-widest font-bold">
                      Investigate
                    </span>
                  </button>
                }
              />
            ))}
          </div>
        }
      />
    </div>
  );
}