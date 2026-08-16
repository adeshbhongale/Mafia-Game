import { useState } from 'react';
import { pickAvatar } from '../config';

export default function Avatar({ id, username, index, size = 'md', className = '', rounded = 'rounded' }) {
  const [err, setErr] = useState(false);
  const src = pickAvatar(id || username, index);
  const initial = username ? username[0].toUpperCase() : '?';

  const sizeCls = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  }[size] || 'w-12 h-12';

  if (!src || err) {
    return (
      <div
        className={`${sizeCls} ${rounded} bg-surface-variant flex items-center justify-center overflow-hidden relative shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)] ${className}`}
      >
        <span className="font-headline-md text-headline-md text-primary/80">{initial}</span>
      </div>
    );
  }

  return (
    <div className={`${sizeCls} ${rounded} overflow-hidden relative shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)] ${className}`}>
      <img
        src={src}
        alt={username}
        className="w-full h-full object-cover opacity-80 mix-blend-luminosity hover:mix-blend-normal transition-all duration-500"
        loading="lazy"
        onError={() => setErr(true)}
      />
    </div>
  );
}
