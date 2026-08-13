import GameTimer from './GameTimer';

export default function PhaseCard({ title, subtitle, timer, phaseEndsAt, glitch = false, danger = false }) {
  return (
    <div className="bg-surface-container p-stack-md rounded-lg relative overflow-hidden shadow-[inset_0_2px_4px_rgba(255,255,255,0.05),0_8px_32px_rgba(0,0,0,0.5)]">
      <div className="absolute top-0 left-0 w-1 h-full bg-primary-container"></div>
      <div className="flex flex-col gap-unit">
        <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-[0.2em] opacity-60">
          Current Phase
        </span>
        <h1
          className={`font-display-lg text-display-lg ${danger ? 'text-error' : 'text-on-surface'} uppercase ${
            glitch ? 'glitch-text' : ''
          }`}
          data-text={title}
        >
          {title}
        </h1>
      </div>
      <div className="mt-stack-md pt-stack-sm border-t border-outline-variant/30 flex items-center justify-between">
        <span className={`font-label-caps text-label-caps text-on-surface uppercase animate-pulse ${danger ? 'text-error-container' : 'text-primary-container'}`}>
          {subtitle}
        </span>
        {phaseEndsAt && <GameTimer phaseEndsAt={phaseEndsAt} />}
      </div>
    </div>
  );
}
