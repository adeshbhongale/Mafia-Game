import { useCountdown } from '../hooks/useCountdown';

export default function GameTimer({ phaseEndsAt, className = '', large = false }) {
  const { remaining, display } = useCountdown(phaseEndsAt);
  const low = remaining !== null && remaining <= 10;
  return (
    <div className={`flex items-center gap-unit ${low ? 'text-error' : 'text-primary'} ${className}`}>
      <span className="material-symbols-outlined text-[20px]">timer</span>
      <span
        className={`${large ? 'font-headline-md text-headline-md' : 'font-headline-md text-[20px]'} font-bold tracking-wider ${
          low ? 'animate-pulse' : ''
        }`}
      >
        {display}
      </span>
    </div>
  );
}
