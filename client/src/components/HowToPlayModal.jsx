export default function HowToPlayModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-surface-container rounded-2xl p-stack-lg shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.08)] border border-surface-variant my-8 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between pb-stack-sm border-b border-surface-variant shrink-0">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-[28px]">menu_book</span>
            <h2 className="font-display-lg text-[24px] text-on-surface uppercase tracking-widest">
              Game Rules & Roles
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-surface-variant flex items-center justify-center hover:bg-surface-bright transition-colors text-on-surface-variant hover:text-on-surface"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="overflow-y-auto pr-2 mt-stack-md flex flex-col gap-stack-lg custom-scrollbar">
          {/* Phase Flow */}
          <div>
            <span className="font-label-caps text-label-caps text-primary tracking-[0.2em] uppercase">
              Phase Flow
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-stack-sm">
              <div className="bg-surface-container-low p-3 rounded-lg border border-white/5">
                <span className="font-headline-md text-on-surface text-[15px] uppercase">1. Night Phase</span>
                <p className="font-body-md text-on-surface-variant text-[13px] mt-1">
                  Mafia secretly selects a target (1 min timer, all Mafias must agree on 1 target). Doctor saves someone. Cop investigates.
                </p>
              </div>
              <div className="bg-surface-container-low p-3 rounded-lg border border-white/5">
                <span className="font-headline-md text-on-surface text-[15px] uppercase">2. City Wake & Day</span>
                <p className="font-body-md text-on-surface-variant text-[13px] mt-1">
                  Night deaths are revealed. Living players join live video & audio discussion to debate and strategize.
                </p>
              </div>
              <div className="bg-surface-container-low p-3 rounded-lg border border-white/5">
                <span className="font-headline-md text-on-surface text-[15px] uppercase">3. Voting</span>
                <p className="font-body-md text-on-surface-variant text-[13px] mt-1">
                  Living players vote on suspects. The highest vote-getter is eliminated. In a tie, nobody dies.
                </p>
              </div>
              <div className="bg-surface-container-low p-3 rounded-lg border border-white/5">
                <span className="font-headline-md text-on-surface text-[15px] uppercase">4. Win Conditions</span>
                <p className="font-body-md text-on-surface-variant text-[13px] mt-1">
                  City wins when all Mafia are eliminated. Mafia wins when Mafia members equal or outnumber surviving Citizens.
                </p>
              </div>
            </div>
          </div>

          {/* Roles */}
          <div>
            <span className="font-label-caps text-label-caps text-secondary tracking-[0.2em] uppercase">
              Roles & Powers
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-stack-sm">
              <div className="bg-surface-container-low p-3 rounded-lg border border-error/20">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-error text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    domino_mask
                  </span>
                  <span className="font-headline-md text-error text-[15px] uppercase">Mafia</span>
                </div>
                <p className="font-body-md text-on-surface-variant text-[13px] mt-1">
                  Secretly conspire with teammates over video. Must reach 100% agreement on a single target within 1 minute.
                </p>
              </div>
              <div className="bg-surface-container-low p-3 rounded-lg border border-secondary/20">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    local_hospital
                  </span>
                  <span className="font-headline-md text-secondary text-[15px] uppercase">Doctor</span>
                </div>
                <p className="font-body-md text-on-surface-variant text-[13px] mt-1">
                  Protects one player each night from death. Can self-save.
                </p>
              </div>
              <div className="bg-surface-container-low p-3 rounded-lg border border-primary/20">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    local_police
                  </span>
                  <span className="font-headline-md text-primary text-[15px] uppercase">Cop</span>
                </div>
                <p className="font-body-md text-on-surface-variant text-[13px] mt-1">
                  Investigates one suspect per night to privately discover if they are Mafia.
                </p>
              </div>
              <div className="bg-surface-container-low p-3 rounded-lg border border-white/10">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-on-surface text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    person
                  </span>
                  <span className="font-headline-md text-on-surface text-[15px] uppercase">Citizen</span>
                </div>
                <p className="font-body-md text-on-surface-variant text-[13px] mt-1">
                  Sleeps through the night. Uses logic, deduction, and discussion during the day to vote out the Mafia.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-stack-lg pt-stack-sm border-t border-surface-variant flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-primary-container text-white font-label-caps uppercase tracking-widest rounded hover:brightness-110 transition-all"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
}
