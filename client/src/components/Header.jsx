import { Link } from 'react-router-dom';
import { LOGO_URL } from '../config';
import { useGameStore } from '../store/gameStore';

export default function Header({ active = 'home', onBlockNav, onHowToPlay }) {
  const room = useGameStore((s) => s.room);

  const handleHome = (e) => {
    if (onBlockNav) {
      e.preventDefault();
      onBlockNav('home');
    }
  };

  const handleHow = (e) => {
    e.preventDefault();
    if (onHowToPlay) {
      onHowToPlay();
    } else if (onBlockNav) {
      onBlockNav('how');
    } else {
      const el = document.getElementById('how-to-play');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="fixed top-0 w-full z-50 glass-panel shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      <div className="h-20 w-full px-container-padding-mobile md:px-container-padding-desktop flex items-center justify-between">
        <div
          onClick={handleHome}
          className={`flex items-center gap-stack-md ${onBlockNav ? 'cursor-pointer' : ''}`}
        >
          <img
            alt="Mafia Game Logo"
            className="h-10 w-auto object-contain"
            src={LOGO_URL}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <span className="font-headline-md text-headline-md text-on-surface uppercase tracking-widest">Mafia</span>
          {room?.roomCode && (
            <span className="hidden sm:flex font-label-caps text-label-caps text-on-surface-variant bg-surface-container px-3 py-1 rounded uppercase tracking-widest">
              Room {room.roomCode}
            </span>
          )}
        </div>
        <nav className="flex items-center gap-stack-lg" data-active-classes="text-primary font-bold">
          <Link
            to="/"
            onClick={handleHome}
            className={`transition-all uppercase ${active === 'home' ? 'text-primary font-bold' : 'font-label-caps text-label-caps text-on-surface-variant hover:text-primary'
              }`}
          >
            Home
          </Link>
          <a
            href="#how-to-play"
            onClick={handleHow}
            className="font-label-caps text-label-caps text-on-surface-variant hover:text-primary transition-all uppercase cursor-pointer"
          >
            How to Play
          </a>
        </nav>
      </div>
    </header>
  );
}
