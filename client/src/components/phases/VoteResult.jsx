import GameTimer from '../../components/GameTimer';
import { useGameStore } from '../../store/gameStore';

export default function VoteResult({ onLeave }) {
  const voteResult = useGameStore((s) => s.voteResult);
  const phaseEndsAt = useGameStore((s) => s.phaseEndsAt);

  const tie = voteResult?.tie;
  const eliminated = voteResult?.eliminated;
  const isMafia = voteResult?.isMafia;

  return (
    <div className="relative flex items-center justify-center min-h-[calc(100vh-80px)]">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(139,0,0,0.2)_0%,rgba(19,19,19,1)_80%)]"></div>
      <div className="relative z-10 flex flex-col items-center gap-stack-md text-center animate-fade-in-up px-container-padding-mobile md:px-container-padding-desktop">
        <h1 className="font-display-lg text-display-lg text-on-surface uppercase tracking-widest">Vote Result</h1>

        {tie ? (
          <>
            <span className="text-[72px] leading-none">⚖️</span>
            <h2 className="font-headline-md text-headline-md text-on-surface uppercase">The city could not decide.</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant uppercase tracking-widest opacity-80">
              Nobody was eliminated.
            </p>
          </>
        ) : eliminated ? (
          <>
            <span className="text-[72px] leading-none">🗳️</span>
            <h2 className="font-headline-md text-headline-md text-error uppercase">
              {eliminated.username} has been eliminated.
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant uppercase tracking-widest opacity-90">
              {isMafia ? 'You kicked out one MAFIA.' : 'You kicked out one CITIZEN.'}
            </p>
          </>
        ) : (
          <>
            <span className="text-[72px] leading-none">🗳️</span>
            <h2 className="font-headline-md text-headline-md text-on-surface uppercase">Votes are being counted...</h2>
          </>
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