import { useNavigate } from 'react-router-dom';
import { ROLE_META } from '../../components/IdentityCard';
import { clearSession, useGameStore } from '../../store/gameStore';

export default function GameOver() {
  const winner = useGameStore((s) => s.winner);
  const finalRoles = useGameStore((s) => s.finalRoles);
  const room = useGameStore((s) => s.room);
  const navigate = useNavigate();

  const cityWon = winner === 'CITY';

  return (
    <div className="relative flex items-center justify-center min-h-[calc(100vh-80px)] px-container-padding-mobile md:px-container-padding-desktop">
      <div
        className={`absolute inset-0 pointer-events-none ${cityWon
          ? 'bg-[radial-gradient(ellipse_at_center,rgba(0,255,0,0.08)_0%,rgba(19,19,19,1)_80%)]'
          : 'bg-[radial-gradient(ellipse_at_center,rgba(139,0,0,0.3)_0%,rgba(19,19,19,1)_80%)]'
          }`}
      ></div>
      <div className="relative z-10 w-full max-w-3xl mx-auto flex flex-col items-center gap-stack-lg text-center animate-fade-in-up">
        <span className="text-[80px] leading-none">{cityWon ? '🎉' : '☠'}</span>
        <div>
          <h1 className="font-display-lg text-display-lg uppercase tracking-widest text-shadow-glow">
            <span className={cityWon ? 'text-[#00FF00]' : 'text-error'}>{cityWon ? 'City Wins' : 'Mafia Wins'}</span>
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant uppercase tracking-widest opacity-80 mt-stack-sm">
            {cityWon ? 'All Mafia members have been eliminated.' : 'The Mafia has taken control of the city.'}
          </p>
        </div>

        <div className="w-full bg-surface-container rounded-xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          <div className="p-stack-md bg-surface-container-high border-b border-surface-variant">
            <span className="font-label-caps text-label-caps text-on-surface uppercase tracking-widest">Final Roles</span>
          </div>
          <div className="p-stack-md space-y-unit">
            {(finalRoles.length ? finalRoles : (room?.players || [])).map((p) => {
              const meta = ROLE_META[p.role] || ROLE_META.CITIZEN;
              return (
                <div
                  key={p.id}
                  className={`flex items-center justify-between p-stack-sm rounded ${p.alive ? 'bg-surface' : 'bg-surface/40 opacity-50'
                    }`}
                >
                  <div className="flex items-center gap-stack-md">
                    <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      {meta.icon}
                    </span>
                    <span className="font-body-md text-on-surface font-bold">
                      {p.username} {p.alive ? '' : '☠'}
                    </span>
                  </div>
                  <span className={`font-label-caps text-label-caps uppercase ${meta.tone}`}>{p.role}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex gap-gutter mb-7">
          <button
            onClick={() => {
              clearSession();
              useGameStore.getState().resetGame();
              navigate('/');
            }}
            className="relative group overflow-hidden rounded-sm bg-surface-variant/40 backdrop-blur-md px-10 py-3 shadow-[0_0_15px_rgba(0,0,0,0.5)] hover:shadow-[0_0_25px_rgba(255,255,255,0.1)] transition-all duration-300 border-t border-l border-white/10"
          >
            <span className="relative font-headline-md text-[18px] text-on-surface uppercase tracking-widest group-hover:text-white transition-colors">
              Back to Home
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}