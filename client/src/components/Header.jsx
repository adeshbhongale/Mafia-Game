import { Link } from 'react-router-dom';
import { LOGO_URL } from '../config';
import { useGameStore } from '../store/gameStore';

export default function Header({ active = 'home', onBlockNav }) {
  const room = useGameStore((s) => s.room);

  // When onBlockNav is provided (host in lobby), clicking nav is intercepted
  // so the parent can ask for confirmation before leaving/discarding the room.
  const handleHome = (e) => {
    if (onBlockNav) {
      e.preventDefault();
      onBlockNav('home');
    }
  };

  const handleHow = (e) => {
    if (onBlockNav) {
      e.preventDefault();
      onBlockNav('how');
    }
  };

  return (
    <header className="fixed top-0 w-full z-50 glass-panel shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      <div className="h-20 w-full px-container-padding-mobile md:px-container-padding-desktop flex items-center justify-between">
        <div className="flex items-center gap-stack-md">
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
            className={`transition-all uppercase ${
              active === 'home' ? 'text-primary font-bold' : 'font-label-caps text-label-caps text-on-surface-variant hover:text-primary'
            }`}
          >
            Home
          </Link>
          <a
            href="#how-to-play"
            onClick={handleHow}
            className="font-label-caps text-label-caps text-on-surface-variant hover:text-primary transition-all uppercase"
          >
            How to Play
          </a>
        </nav>
      </div>
    </header>
  );
}
