import { useGameStore } from '../../store/gameStore';
import { socketEmit } from '../../services/socket';
import ActionLayout from '../../components/ActionLayout';
import PlayerRow from '../../components/PlayerRow';

export default function DoctorPanel() {
  const room = useGameStore((s) => s.room);
  const session = useGameStore((s) => s.session);
  const phaseEndsAt = useGameStore((s) => s.phaseEndsAt);
  const myChoice = useGameStore((s) => s.myChoice);

  const alive = (room?.players || []).filter((p) => p.alive);
  const select = (p) => socketEmit('doctor:save', { targetId: p.id });

  return (
    <div className="relative">
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(ellipse_at_center,rgba(255,219,60,0.12)_0%,rgba(19,19,19,1)_75%)]"></div>
      <ActionLayout
        title="Doctor Phase"
        subtitle="Doctor Wake Up"
        phaseEndsAt={phaseEndsAt}
        role="DOCTOR"
        watermark="Save A Life"
        rightHeader={
          <div className="flex items-center justify-between mb-stack-md">
            <h2 className="font-headline-md text-headline-md text-on-surface uppercase tracking-wider flex items-center gap-stack-sm">
              <span className="material-symbols-outlined text-secondary-fixed">local_hospital</span> Choose One To Save
            </h2>
            <span className="font-label-caps text-label-caps text-on-surface-variant bg-surface-container px-3 py-1 rounded-full uppercase">
              {alive.length} Alive
            </span>
          </div>
        }
        right={
          <div className="flex flex-col gap-unit">
            {alive.map((p) => (
              <PlayerRow
                key={p.id}
                player={p}
                isYou={p.id === session?.playerId}
                meta="Unknown"
                metaTone="text-on-surface-variant"
                onClick={() => select(p)}
                selected={myChoice === p.id}
                right={
                  <button
                    onClick={() => select(p)}
                    className="px-6 py-2 rounded bg-secondary-container/30 hover:bg-secondary-container hover:shadow-[0_0_15px_rgba(255,219,60,0.4)] transition-all flex items-center gap-unit"
                  >
                    <span className="material-symbols-outlined text-secondary-fixed text-[18px] group-hover/btn:scale-110 transition-transform">
                      favorite
                    </span>
                    <span className="font-label-caps text-label-caps text-secondary-fixed uppercase tracking-widest font-bold">
                      Save
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