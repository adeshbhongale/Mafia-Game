import { useGameStore } from '../../store/gameStore';
import IdentityCard from '../../components/IdentityCard';
import GameTimer from '../../components/GameTimer';

export default function Welcome() {
  const phaseEndsAt = useGameStore((s) => s.phaseEndsAt);
  const role = useGameStore((s) => s.role);
  const roleCounts = useGameStore((s) => s.roleCounts);
  const username = useGameStore((s) => s.session?.username);

  return (
    <div className="relative flex items-center justify-center min-h-[calc(100vh-80px)]">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(139,0,0,0.25)_0%,rgba(19,19,19,1)_75%)]"></div>
      <div className="relative z-10 flex flex-col items-center gap-stack-lg px-container-padding-mobile md:px-container-padding-desktop text-center animate-fade-in-up">
        <div className="w-24 h-24 rounded-full bg-primary-container/40 flex items-center justify-center pulse-red">
          <span className="material-symbols-outlined text-primary text-[52px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            theater_comedy
          </span>
        </div>
        <div>
          <h1 className="font-display-lg text-display-lg text-on-surface uppercase tracking-widest text-shadow-glow">
            Welcome to <span className="text-primary">Mafia</span>
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant opacity-80 uppercase tracking-widest mt-stack-sm">
            Trust no one, {username}.
          </p>
        </div>

        {roleCounts && (
          <div className="w-full max-w-sm flex flex-col gap-stack-md">
            <div className="flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-on-surface-variant text-[16px]">group</span>
              <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest">
                {roleCounts.MAFIA + roleCounts.DOCTOR + roleCounts.COP + roleCounts.CITIZEN} players in the room
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'Mafia', value: roleCounts.MAFIA, icon: 'domino_mask', tone: 'text-error', ring: 'ring-error/40' },
                { label: 'Doctor', value: roleCounts.DOCTOR, icon: 'local_hospital', tone: 'text-secondary-fixed', ring: 'ring-secondary-fixed/40' },
                { label: 'Cop', value: roleCounts.COP, icon: 'local_police', tone: 'text-primary', ring: 'ring-primary/40' },
                { label: 'Citizen', value: roleCounts.CITIZEN, icon: 'person', tone: 'text-on-surface', ring: 'ring-on-surface/40' },
              ].map((r) => (
                <div key={r.label} className={`bg-surface-container rounded-lg p-3 flex flex-col items-center gap-1 ring-1 ${r.ring}`}>
                  <span className={`material-symbols-outlined text-[20px] ${r.tone}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                    {r.icon}
                  </span>
                  <span className={`font-display-lg text-[26px] leading-none ${r.tone}`}>{r.value}</span>
                  <span className="font-label-caps text-[9px] text-on-surface-variant uppercase tracking-widest">{r.label}</span>
                </div>
              ))}
            </div>
            <p className="font-label-caps text-[9px] text-on-surface-variant uppercase tracking-widest opacity-70 text-center">
              Public info only — who holds each role stays secret
            </p>
          </div>
        )}

        <IdentityCard role={role} />
        <GameTimer phaseEndsAt={phaseEndsAt} large className="mt-stack-md" />
      </div>
    </div>
  );
}