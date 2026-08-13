import { useEffect, useRef, useState } from 'react';
import { socketEmit } from '../services/socket';
import { useGameStore } from '../store/gameStore';

function formatTime(iso) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function ChatPanel({ compact = false }) {
  const chat = useGameStore((s) => s.chat);
  const session = useGameStore((s) => s.session);
  const room = useGameStore((s) => s.room);
  const [text, setText] = useState('');
  const boxRef = useRef(null);

  const me = room?.players?.find((p) => p.id === session?.playerId);
  const alive = me ? me.alive !== false : false;

  useEffect(() => {
    if (boxRef.current) boxRef.current.scrollTop = boxRef.current.scrollHeight;
  }, [chat]);

  const send = (e) => {
    e.preventDefault();
    if (!text.trim() || !alive) return;
    socketEmit('chat:send', { text });
    setText('');
  };

  return (
    <div className={`flex flex-col ${compact ? '' : 'h-full'} relative overflow-hidden`}>
      <div className="absolute top-0 left-0 w-[1px] h-full bg-gradient-to-b from-white/10 to-transparent z-20 pointer-events-none"></div>
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-white/10 to-transparent z-20 pointer-events-none"></div>
      <div className="p-stack-sm bg-surface-container-high border-b border-surface-variant flex items-center gap-2 z-10">
        <span className="material-symbols-outlined text-on-surface-variant text-[18px]">chat</span>
        <span className="font-label-caps text-label-caps text-on-surface uppercase">Town Square</span>
        {!alive && <span className="font-label-caps text-[9px] text-error uppercase ml-auto">Spectator — Muted</span>}
      </div>
      <div className="flex-1 p-stack-sm overflow-y-auto space-y-stack-sm bg-surface/50 font-body-md text-[14px] custom-scrollbar">
        {chat.length === 0 && (
          <p className="text-on-surface-variant/60 text-center text-[12px] uppercase tracking-widest pt-4">
            No messages yet...
          </p>
        )}
        {chat.map((m, i) => (
          <div key={m.id || i} className="flex flex-col gap-1">
            <div className="flex items-baseline gap-2">
              <span className={`font-bold ${m.playerId === session?.playerId ? 'text-primary' : 'text-on-surface'}`}>
                {m.playerId === session?.playerId ? 'You' : m.username}
              </span>
              <span className="font-label-caps text-[9px] text-on-surface-variant">{formatTime(m.time)}</span>
            </div>
            <p className="text-on-surface-variant break-words">{m.text}</p>
          </div>
        ))}
      </div>
      <div className="p-stack-sm bg-surface-container-high z-10">
        <form onSubmit={send} className="relative flex items-center">
          <input
            className={`w-full bg-[#000000] text-on-surface font-body-md text-[14px] px-3 py-2 outline-none border-b border-primary/30 focus:border-primary focus:bg-white/5 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] placeholder:text-on-surface-variant/50 ${
              alive ? '' : 'opacity-40 cursor-not-allowed'
            }`}
            placeholder={alive ? 'Send a message...' : 'Dead players cannot speak.'}
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={!alive}
          />
          <button
            type="submit"
            disabled={!alive}
            className={`absolute right-2 material-symbols-outlined text-primary hover:text-white transition-colors cursor-pointer text-[20px] ${
              alive ? '' : 'opacity-40 cursor-not-allowed'
            }`}
          >
            send
          </button>
        </form>
      </div>
    </div>
  );
}
