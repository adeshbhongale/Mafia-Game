import Avatar from './Avatar';

export default function PlayerRow({ player, isYou, meta, metaTone = 'text-primary', onClick, disabled, selected, right, leftAccent }) {
  return (
    <div
      onClick={disabled ? undefined : onClick}
      className={`bg-surface-container p-stack-md rounded flex items-center justify-between group relative overflow-hidden ${
        disabled
          ? 'opacity-60 cursor-default'
          : 'cursor-pointer shadow-[0_4px_12px_rgba(0,0,0,0.3)] hover:shadow-[0_0_20px_rgba(139,0,0,0.2)] hover:bg-surface-variant transition-colors'
      } ${selected ? 'ring-1 ring-primary' : ''}`}
    >
      <div
        className={`absolute left-0 top-0 w-1 h-full transition-colors ${selected ? 'bg-primary' : leftAccent || 'bg-surface-variant'}`}
      ></div>
      <div className="flex items-center gap-stack-md">
        <Avatar id={player.id} username={player.username} size="sm" rounded="rounded-full" className="w-10 h-10 shrink-0" />
        <div className="flex flex-col">
          <span className="font-body-md text-body-md text-on-surface font-bold group-hover:text-primary transition-colors">
            {player.username}
            {isYou ? ' (You)' : ''}
          </span>
          {meta && <span className={`font-label-caps text-label-caps uppercase ${metaTone}`}>{meta}</span>}
        </div>
      </div>
      {right && <div className="relative z-10">{right}</div>}
    </div>
  );
}
