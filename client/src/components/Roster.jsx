import { useGameStore } from '../store/gameStore';
import Avatar from './Avatar';

// Public roster — username, alive/dead, connected/disconnected. Never reveals roles.
export default function Roster({ compact = false }) {
  const room = useGameStore((s) => s.room);
  const session = useGameStore((s) => s.session);
  const players = room?.players || [];

  return (
    <div className="bg-surface-container rounded-lg shadow-lg flex flex-col relative overflow-hidden h-full">
      <div className="absolute top-0 left-0 w-[1px] h-full bg-gradient-to-b from-white/10 to-transparent z-20 pointer-events-none"></div>
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-white/10 to-transparent z-20 pointer-events-none"></div>
      <div className="p-stack-sm bg-surface-container-high border-b border-surface-variant flex items-center gap-2 z-10">
        <span className="material-symbols-outlined text-on-surface-variant text-[18px]">group</span>
        <span className="font-label-caps text-label-caps text-on-surface uppercase">Agents</span>
        <span className="font-label-caps text-label-caps text-primary bg-primary/10 px-2 py-1 rounded ml-auto">
          {players.filter((p) => p.alive).length} Alive
        </span>
      </div>
      <div className={`flex-1 overflow-y-auto custom-scrollbar ${compact ? 'p-stack-sm' : 'p-stack-md'} space-y-unit`}>
        {players.map((p, i) => {
          const isYou = p.id === session?.playerId;
          return (
            <div
              key={p.id}
              className={`flex items-center gap-stack-sm p-stack-sm rounded ${
                p.alive ? 'bg-surface hover:bg-surface-variant transition-colors' : 'bg-surface/40 opacity-50'
              }`}
            >
              <Avatar id={p.id} username={p.username} index={i} size="sm" rounded="rounded-full" className="w-6 h-6 shrink-0" />
              <div
                className={`w-2 h-2 rounded-full shrink-0 ${
                  p.alive ? (p.connected ? 'bg-[#00FF00] shadow-[0_0_6px_#00FF00]' : 'bg-error') : 'bg-on-surface-variant/40'
                }`}
              ></div>
              <span className="font-body-md text-body-md text-on-surface font-bold truncate">
                {p.username}
                {isYou ? ' (You)' : ''}
              </span>
              <span className="ml-auto font-label-caps text-[10px] text-on-surface-variant uppercase">
                {p.alive ? (p.connected ? 'Alive' : 'Offline') : '☠ Dead'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
