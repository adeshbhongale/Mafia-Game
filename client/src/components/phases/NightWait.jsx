import GameTimer from '../../components/GameTimer';
import IdentityCard from '../../components/IdentityCard';
import { useGameStore } from '../../store/gameStore';

// Shown to players who have no action during a night sub-phase (or who are dead-spectating).
export default function NightWait({ onLeave }) {
  const phaseMessage = useGameStore((s) => s.phaseMessage);
  const phaseEndsAt = useGameStore((s) => s.phaseEndsAt);
  const role = useGameStore((s) => s.role);
  const room = useGameStore((s) => s.room);
  const session = useGameStore((s) => s.session);
  const me = room?.players?.find((p) => p.id === session?.playerId);
  const alive = me ? me.alive !== false : true;

  return (
    <div className="relative flex items-center justify-center min-h-[calc(100vh-80px)]">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(10,10,18,0.95)_0%,rgba(0,0,0,1)_80%)]"></div>
      <div className="relative z-10 flex flex-col items-center gap-stack-md text-center animate-fade-in-up">
        <span className="text-[64px] leading-none">🌙</span>
        <h1 className="font-display-lg text-display-lg text-on-surface uppercase tracking-widest">
          The City Sleeps...
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant opacity-70 uppercase tracking-[0.2em]">
          {alive ? phaseMessage : 'You are watching as a spectator.'}
        </p>
        {phaseEndsAt && (
          <div className="flex items-center gap-3">
            {onLeave && (
              <button
                onClick={onLeave}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded bg-surface-container hover:bg-error-container text-on-surface-variant hover:text-on-error-container transition-colors font-label-caps text-[12px] uppercase tracking-wider"
                title="Leave Game"
              >
                <span className="material-symbols-outlined text-[16px] text-error">logout</span>
                <span>Leave</span>
              </button>
            )}
            <GameTimer phaseEndsAt={phaseEndsAt} large />
          </div>
        )}
        <div className="mt-stack-md opacity-80">
          <IdentityCard role={role} />
        </div>
      </div>
    </div>
  );
}