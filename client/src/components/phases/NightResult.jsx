import GameTimer from '../../components/GameTimer';
import { useGameStore } from '../../store/gameStore';

export default function NightResult({ onLeave }) {
  const nightResult = useGameStore((s) => s.nightResult);
  const phaseEndsAt = useGameStore((s) => s.phaseEndsAt);
  const deaths = nightResult?.deaths || [];

  return (
    <div className="relative flex items-center justify-center min-h-[calc(100vh-80px)]">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(139,0,0,0.2)_0%,rgba(19,19,19,1)_80%)]"></div>
      <div className="relative z-10 flex flex-col items-center gap-stack-md text-center animate-fade-in-up px-container-padding-mobile md:px-container-padding-desktop">
        <h1 className="font-display-lg text-display-lg text-on-surface uppercase tracking-widest">City Wake Up</h1>
        <p className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-[0.2em]">City sees...</p>

        {deaths.length > 0 ? (
          <div className="flex flex-col items-center gap-stack-sm">
            <span className="text-[72px] leading-none">💀</span>
            <h2 className="font-headline-md text-headline-md text-error uppercase">{deaths.join(', ')} is dead.</h2>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-stack-sm">
            <span className="text-[72px] leading-none">🌅</span>
            <h2 className="font-headline-md text-headline-md text-on-surface uppercase">Nobody died tonight.</h2>
          </div>
        )}

        {phaseEndsAt && (
          <div className="flex items-center gap-3 mt-stack-md">
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
      </div>
    </div>
  );
}