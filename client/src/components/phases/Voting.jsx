import { useGameStore } from '../../store/gameStore';
import { socketEmit } from '../../services/socket';
import ChatPanel from '../../components/ChatPanel';
import Roster from '../../components/Roster';
import GameTimer from '../../components/GameTimer';

export default function Voting() {
  const room = useGameStore((s) => s.room);
  const session = useGameStore((s) => s.session);
  const phaseEndsAt = useGameStore((s) => s.phaseEndsAt);
  const votes = useGameStore((s) => s.votes);
  const myVote = useGameStore((s) => s.myVote);
  const votedCount = useGameStore((s) => s.votedCount);
  const aliveCount = useGameStore((s) => s.aliveCount);

  const players = room?.players || [];
  const me = players.find((p) => p.id === session?.playerId);
  const alive = me ? me.alive !== false : true;
  const alivePlayers = players.filter((p) => p.alive);

  const cast = (p) => socketEmit('game:vote', { targetId: p.id });

  return (
    <div className="flex flex-col w-full h-full pb-container-padding-desktop">
      <div className="px-container-padding-mobile md:px-container-padding-desktop mt-stack-md flex justify-between items-end mb-stack-lg relative z-10">
        <div className="flex flex-col">
          <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-[0.2em] mb-unit">
            Current Phase
          </span>
          <h1 className="font-display-lg text-display-lg text-on-background uppercase relative inline-block">
            Vote
            <div className="absolute -bottom-2 left-0 w-1/3 h-1 bg-primary shadow-[0_0_10px_rgba(255,180,168,0.8)]"></div>
          </h1>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-stack-md bg-surface-container-high px-stack-md py-stack-sm rounded shadow-md relative overflow-hidden group">
            <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors"></div>
            <span className="material-symbols-outlined text-primary animate-pulse">timer</span>
            <GameTimer phaseEndsAt={phaseEndsAt} />
          </div>
          <span className="font-label-caps text-label-caps text-primary bg-primary/10 px-2 py-1 rounded">
            {votedCount} / {aliveCount || alivePlayers.length} Votes Cast
          </span>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-gutter px-container-padding-mobile md:px-container-padding-desktop flex-1 h-[calc(100vh-220px)] min-h-[600px]">
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-unit">
          <div className="flex items-center justify-between mb-stack-sm">
            <h2 className="font-headline-md text-headline-md text-on-surface uppercase tracking-wider flex items-center gap-stack-sm">
              <span className="material-symbols-outlined text-primary">how_to_vote</span> Who Is Mafia?
            </h2>
          </div>
          {alivePlayers.map((p) => {
            const isYou = p.id === session?.playerId;
            const count = votes[p.id] || 0;
            return (
              <div
                key={p.id}
                onClick={isYou ? undefined : () => cast(p)}
                className={`bg-surface-container p-stack-md rounded flex items-center justify-between group relative overflow-hidden ${
                  isYou
                    ? 'opacity-50'
                    : 'cursor-pointer shadow-[0_4px_12px_rgba(0,0,0,0.3)] hover:shadow-[0_0_20px_rgba(139,0,0,0.2)] hover:bg-surface-variant transition-colors'
                } ${myVote === p.id ? 'ring-1 ring-primary' : ''}`}
              >
                <div className={`absolute left-0 top-0 w-1 h-full ${myVote === p.id ? 'bg-primary' : 'bg-surface-variant'}`}></div>
                <div className="flex items-center gap-stack-md">
                  <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center">
                    <span className="font-headline-md text-headline-md text-on-surface">{p.username[0].toUpperCase()}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-body-md text-body-md text-on-surface font-bold group-hover:text-primary transition-colors">
                      {p.username}
                      {isYou ? ' (You)' : ''}
                    </span>
                    <span className="font-label-caps text-label-caps text-primary uppercase">{count} Vote{count === 1 ? '' : 's'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-stack-sm relative z-10">
                  {myVote === p.id && (
                    <span className="font-label-caps text-[10px] text-primary bg-primary/10 px-2 py-1 rounded uppercase">Your Vote</span>
                  )}
                  {!isYou && (
                    <button
                      onClick={() => cast(p)}
                      className="px-6 py-2 rounded bg-primary-container hover:bg-primary hover:shadow-[0_0_15px_rgba(255,180,168,0.4)] transition-all"
                    >
                      <span className="font-label-caps text-label-caps text-on-primary-container uppercase tracking-widest font-bold">
                        Vote
                      </span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          {!alive && (
            <p className="font-label-caps text-label-caps text-error uppercase tracking-widest text-center py-4">
              You are dead. You cannot vote.
            </p>
          )}
        </div>

        <div className="col-span-12 lg:col-span-4 flex flex-col gap-gutter h-full">
          <div className="h-2/5">
            <Roster />
          </div>
          <div className="h-3/5">
            <ChatPanel />
          </div>
        </div>
      </div>
    </div>
  );
}