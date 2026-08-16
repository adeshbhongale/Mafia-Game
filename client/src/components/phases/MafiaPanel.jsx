import ActionLayout from '../../components/ActionLayout';
import Avatar from '../../components/Avatar';
import JitsiRoom from '../../components/JitsiRoom';
import PlayerRow from '../../components/PlayerRow';
import { HOME_BG_URL } from '../../config';
import { socketEmit } from '../../services/socket';
import { useGameStore } from '../../store/gameStore';

export default function MafiaPanel() {
  const room = useGameStore((s) => s.room);
  const session = useGameStore((s) => s.session);
  const phaseEndsAt = useGameStore((s) => s.phaseEndsAt);
  const myChoice = useGameStore((s) => s.myChoice);
  const teammates = useGameStore((s) => s.teammates);
  const mafiaVotes = useGameStore((s) => s.mafiaVotes);
  const mafiaVoteStatus = useGameStore((s) => s.mafiaVoteStatus);
  const jitsi = useGameStore((s) => s.jitsi);
  const set = useGameStore((s) => s.set);

  const players = room?.players || [];
  const alive = players.filter((p) => p.alive);
  const mafiaIds = new Set([session?.playerId, ...teammates.map((t) => t.id)]);
  const aliveMafia = alive.filter((p) => mafiaIds.has(p.id));
  const isMultiMafia = aliveMafia.length > 1;
  const isUnanimous = mafiaVoteStatus?.isUnanimous;

  const select = (p) => socketEmit('mafia:vote', { targetId: p.id });

  return (
    <div className="relative">
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(ellipse_at_center,rgba(139,0,0,0.35)_0%,rgba(19,19,19,1)_75%)]"></div>
      <ActionLayout
        title="Night Phase"
        subtitle="Mafia Wake Up"
        phaseEndsAt={phaseEndsAt}
        role="MAFIA"
        watermark="Select Target"
        glitch
        danger
        comms={
          <div className="flex flex-col gap-stack-md">
            {jitsi ? (
              <div className="w-full h-[420px] md:h-[480px] rounded-xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.6)]">
                <JitsiRoom roomName={jitsi.roomName} displayName={session?.username || 'Mafia'} />
              </div>
            ) : (
              <div className="w-full h-[420px] md:h-[480px] rounded-xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.6)] relative">
                <img src={HOME_BG_URL} alt="Mafia" className="absolute inset-0 w-full h-full object-cover opacity-50" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/70 flex items-center justify-center">
                  <p className="font-label-caps text-[10px] text-on-surface uppercase tracking-widest text-shadow-glow">
                    Channel closed — decide in silence
                  </p>
                </div>
              </div>
            )}
            <div className="bg-surface-container rounded-xl p-stack-md">
              <div className="flex items-center justify-between">
                <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest flex items-center gap-unit">
                  <span className="w-2 h-2 rounded-full bg-error animate-pulse"></span> Your Mafia Team
                </span>
                <span className="font-label-caps text-[10px] text-error font-bold uppercase">
                  {aliveMafia.length} Alive
                </span>
              </div>
              <div className="mt-stack-sm flex flex-col gap-2">
                {aliveMafia.map((p) => {
                  const targetId = p.id === session?.playerId ? myChoice : mafiaVotes[p.id];
                  const targetPlayer = targetId ? players.find((x) => x.id === targetId) : null;
                  return (
                    <div key={p.id} className="flex items-center justify-between bg-surface-container-low p-2 rounded">
                      <div className="flex items-center gap-2">
                        <Avatar id={p.id} username={p.username} size="sm" rounded="rounded-full" className="w-6 h-6 shrink-0" />
                        <span className="material-symbols-outlined text-error text-[16px]">domino_mask</span>
                        <span className="font-body-md text-on-surface text-[14px]">{p.username}</span>
                        {p.id === session?.playerId && (
                          <span className="font-label-caps text-[10px] text-on-surface-variant">(You)</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {targetPlayer ? (
                          <span className="font-label-caps text-[10px] bg-error-container/60 text-on-error-container px-2 py-0.5 rounded uppercase">
                            Target: {targetPlayer.username}
                          </span>
                        ) : (
                          <span className="font-label-caps text-[10px] text-on-surface-variant/60 italic">
                            Choosing...
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        }
        rightHeader={
          <div className="flex flex-col gap-2 mb-stack-md">
            <div className="flex items-center justify-between">
              <h2 className="font-headline-md text-headline-md text-on-surface uppercase tracking-wider flex items-center gap-stack-sm">
                <span className="material-symbols-outlined text-primary">target</span> Living Players
              </h2>
              <span className="font-label-caps text-label-caps text-on-surface-variant bg-surface-container px-3 py-1 rounded-full uppercase">
                {alive.length} Alive
              </span>
            </div>
            {isMultiMafia && (
              <div className={`p-2.5 rounded-lg border flex items-center gap-2 ${isUnanimous
                  ? 'bg-success-container/20 border-green-500/40 text-green-400'
                  : 'bg-error-container/20 border-error/40 text-error'
                }`}>
                <span className="material-symbols-outlined text-[18px]">
                  {isUnanimous ? 'check_circle' : 'group'}
                </span>
                <span className="font-label-caps text-[11px] uppercase tracking-wider">
                  {isUnanimous
                    ? 'Consensus Reached! Target Locked.'
                    : 'Consensus Required: All Mafias must choose the SAME target. Timer runs for 1 min.'}
                </span>
              </div>
            )}
          </div>
        }
        right={
          <div className="flex flex-col gap-unit">
            {alive.map((p) => {
              const isYou = p.id === session?.playerId;
              const isAlly = mafiaIds.has(p.id);
              if (isAlly) {
                return (
                  <PlayerRow
                    key={p.id}
                    player={p}
                    isYou={isYou}
                    meta={isYou ? 'Mafia' : 'Mafia'}
                    metaTone="text-error"
                    disabled
                    leftAccent="bg-tertiary-container"
                    right={
                      <div className="px-4 py-2 rounded bg-surface-variant/50 cursor-not-allowed">
                        <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Ally</span>
                      </div>
                    }
                  />
                );
              }

              // Who among living Mafias voted for this target?
              const votersForThis = aliveMafia.filter((m) => {
                const choice = m.id === session?.playerId ? myChoice : mafiaVotes[m.id];
                return choice === p.id;
              });

              return (
                <PlayerRow
                  key={p.id}
                  player={p}
                  isYou={isYou}
                  meta={votersForThis.length > 0 ? `${votersForThis.length}/${aliveMafia.length} Mafia agreed` : 'Unknown'}
                  metaTone={votersForThis.length > 0 ? 'text-error' : 'text-on-surface-variant'}
                  onClick={() => select(p)}
                  selected={myChoice === p.id}
                  right={
                    <div className="flex items-center gap-2">
                      {votersForThis.length > 0 && (
                        <div className="flex items-center gap-1">
                          {votersForThis.map((v) => (
                            <span
                              key={v.id}
                              className="font-label-caps text-[9px] bg-error text-white px-1.5 py-0.5 rounded uppercase"
                              title={`${v.username} chose this target`}
                            >
                              {v.id === session?.playerId ? 'You' : v.username}
                            </span>
                          ))}
                        </div>
                      )}
                      <button
                        onClick={() => select(p)}
                        className={`px-5 py-2 rounded transition-all flex items-center gap-unit group/btn ${myChoice === p.id
                            ? 'bg-error text-white shadow-[0_0_15px_rgba(255,0,0,0.5)]'
                            : 'bg-primary-container hover:bg-error-container hover:shadow-[0_0_15px_rgba(255,180,168,0.4)] text-on-primary-container'
                          }`}
                      >
                        <span className="material-symbols-outlined text-[18px] group-hover/btn:scale-110 transition-transform">
                          close
                        </span>
                        <span className="font-label-caps text-label-caps uppercase tracking-widest font-bold">
                          {myChoice === p.id ? 'Selected' : 'Kill'}
                        </span>
                      </button>
                    </div>
                  }
                />
              );
            })}
          </div>
        }
      />
    </div>
  );
}