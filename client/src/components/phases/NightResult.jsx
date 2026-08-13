import { useGameStore } from '../../store/gameStore';
import GameTimer from '../../components/GameTimer';

export default function NightResult() {
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

        {phaseEndsAt && <GameTimer phaseEndsAt={phaseEndsAt} large className="mt-stack-md" />}
      </div>
    </div>
  );
}