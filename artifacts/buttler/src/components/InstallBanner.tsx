import { useInstallPrompt } from '@/hooks/use-install-prompt';
import { X, Download } from 'lucide-react';

export function InstallBanner() {
  const { canInstall, triggerInstall, dismiss } = useInstallPrompt();

  if (!canInstall) return null;

  return (
    <div
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border border-white/20"
      style={{
        background: 'linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)',
        maxWidth: 'calc(100vw - 2rem)',
        width: '360px',
      }}
    >
      <img
        src="/icons/icon-192.png"
        alt="Buttler icon"
        className="w-10 h-10 rounded-xl shrink-0 shadow-sm"
      />
      <div className="flex-1 min-w-0">
        <p className="text-white font-semibold text-sm leading-tight">Add to Home Screen</p>
        <p className="text-white/80 text-xs mt-0.5 leading-tight">
          Use Buttler offline, anytime in Dumaguete
        </p>
      </div>
      <button
        onClick={triggerInstall}
        className="flex items-center gap-1.5 bg-white text-sky-600 font-semibold text-xs px-3 py-2 rounded-xl shrink-0 hover:bg-sky-50 active:scale-95 transition-all"
      >
        <Download className="w-3.5 h-3.5" />
        Install
      </button>
      <button
        onClick={dismiss}
        className="text-white/70 hover:text-white transition-colors shrink-0 -mr-1"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
