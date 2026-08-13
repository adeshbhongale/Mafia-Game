import { useGameStore } from '../store/gameStore';

export default function Footer() {
  const connected = useGameStore((s) => s.connected);
  const latency = useGameStore((s) => s.latency);

  return (
    <footer className="fixed bottom-0 w-full h-8 glass-panel flex items-center px-container-padding-mobile md:px-container-padding-desktop z-40">
      <div className="flex items-center gap-stack-sm">
        <div
          className={`w-2 h-2 rounded-full animate-pulse ${
            connected ? 'bg-[#00FF00] shadow-[0_0_8px_#00FF00]' : 'bg-error shadow-[0_0_8px_#ffb4ab]'
          }`}
        ></div>
        <span className="font-label-caps text-[10px] text-on-tertiary-container uppercase tracking-widest">
          {connected
            ? `Secure Server Link Established // Latency: ${latency ?? '--'}ms`
            : 'Secure Server Link Lost // Reconnecting...'}
        </span>
      </div>
      <span className="ml-auto font-label-caps text-[10px] text-on-tertiary-container uppercase tracking-widest">
        Developed by Adesh Bhongale
      </span>
    </footer>
  );
}
