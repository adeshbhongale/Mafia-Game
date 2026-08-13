const ROLE_META = {
  MAFIA: { label: 'MAFIA', icon: 'domino_mask', tone: 'text-error', ring: 'ring-error/40' },
  DOCTOR: { label: 'DOCTOR', icon: 'local_hospital', tone: 'text-secondary-fixed', ring: 'ring-secondary-fixed/40' },
  COP: { label: 'COP', icon: 'local_police', tone: 'text-primary', ring: 'ring-primary/40' },
  CITIZEN: { label: 'CITIZEN', icon: 'person', tone: 'text-on-surface', ring: 'ring-on-surface/40' },
};

export default function IdentityCard({ role }) {
  const meta = ROLE_META[role] || ROLE_META.CITIZEN;
  return (
    <div className="bg-surface-variant p-stack-md rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.6)] relative group cursor-default">
      <div className="absolute -inset-0.5 bg-gradient-to-br from-primary-container/40 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
      <div className="relative flex items-center gap-stack-md">
        <div className={`w-16 h-16 rounded-full bg-background flex items-center justify-center shadow-inner relative overflow-hidden ring-1 ${meta.ring}`}>
          <div className="absolute inset-0 bg-primary/10"></div>
          <span className={`material-symbols-outlined text-[32px] z-10 ${meta.tone}`} style={{ fontVariationSettings: "'FILL' 1" }}>
            {meta.icon}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Your Role</span>
          <span className={`font-headline-md text-headline-md tracking-wide ${meta.tone}`}>{meta.label}</span>
        </div>
      </div>
    </div>
  );
}

export { ROLE_META };
