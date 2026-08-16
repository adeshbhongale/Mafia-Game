import PhaseCard from './PhaseCard';
import IdentityCard from './IdentityCard';

export default function ActionLayout({
  title,
  subtitle,
  timer,
  phaseEndsAt,
  onLeave,
  role,
  comms,
  rightHeader,
  right,
  watermark,
  glitch = false,
  danger = false,
}) {
  return (
    <div className="w-full max-w-[1440px] mx-auto px-container-padding-mobile md:px-container-padding-desktop py-stack-lg relative z-10 grid grid-cols-12 gap-gutter">
      {/* Left column: command & status */}
      <div className="col-span-12 md:col-span-4 lg:col-span-3 flex flex-col gap-stack-lg">
        <PhaseCard title={title} subtitle={subtitle} timer={timer} phaseEndsAt={phaseEndsAt} onLeave={onLeave} glitch={glitch} danger={danger} />
        <IdentityCard role={role} />
        {comms}
      </div>

      {/* Right column: target selection */}
      <div className="col-span-12 md:col-span-8 lg:col-span-9 flex flex-col h-full relative">
        {watermark && (
          <div
            className="absolute -right-12 -top-12 text-[120px] font-display-lg text-surface-container-high opacity-20 pointer-events-none rotate-90 origin-bottom-right uppercase whitespace-nowrap"
            style={{ writingMode: 'vertical-rl' }}
          >
            {watermark}
          </div>
        )}
        {rightHeader}
        {right}
      </div>
    </div>
  );
}
