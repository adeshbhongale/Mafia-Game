import { useEffect, useRef, useState } from 'react';

export function useCountdown(phaseEndsAt) {
  const [remaining, setRemaining] = useState(null);
  const raf = useRef();

  useEffect(() => {
    if (!phaseEndsAt) {
      setRemaining(null);
      return;
    }
    const tick = () => {
      const r = Math.max(0, Math.ceil((phaseEndsAt - Date.now()) / 1000));
      setRemaining(r);
      if (r > 0) {
        raf.current = setTimeout(tick, 200);
      }
    };
    tick();
    return () => clearTimeout(raf.current);
  }, [phaseEndsAt]);

  const mm = remaining === null ? null : String(Math.floor(remaining / 60)).padStart(2, '0');
  const ss = remaining === null ? null : String(remaining % 60).padStart(2, '0');
  return { remaining, display: remaining === null ? '--:--' : `${mm}:${ss}`, mm, ss };
}
