import { useGameStore } from '../../store/gameStore';

export default function CitySleep({ label = 'City Sleep' }) {
  const phaseMessage = useGameStore((s) => s.phaseMessage);
  return (
    <div className="relative flex items-center justify-center min-h-[calc(100vh-80px)]">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(20,20,30,0.9)_0%,rgba(0,0,0,1)_80%)]"></div>
      <div className="relative z-10 flex flex-col items-center gap-stack-md text-center animate-fade-in-up">
        <span className="text-[64px] leading-none">🌙</span>
        <h1 className="font-display-lg text-display-lg text-on-surface uppercase tracking-widest">{label}</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant opacity-70 uppercase tracking-[0.2em]">
          {phaseMessage || 'Everyone close your eyes...'}
        </p>
      </div>
    </div>
  );
}