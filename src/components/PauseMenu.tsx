import React from 'react';
import { Play, RotateCcw, Home, Volume2, VolumeX } from 'lucide-react';

interface PauseMenuProps {
  onResume: () => void;
  onRestart: () => void;
  onMainMenu: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const PauseMenu: React.FC<PauseMenuProps> = ({
  onResume,
  onRestart,
  onMainMenu,
  isMuted,
  onToggleMute
}) => {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/80">
      <div className="max-w-sm w-full bg-slate-900 border-2 border-slate-700 rounded-3xl p-6 text-center shadow-2xl">
        <h2 className="text-2xl font-black text-white mb-2">Permainan Dijeda</h2>
        <p className="text-slate-400 text-xs mb-6">Ambil nafas dan bersedia untuk sambung cabaran!</p>

        <div className="flex flex-col gap-3">
          <button
            onClick={onResume}
            className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-md transition-all hover:scale-102 active:scale-98"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>SAMBUNG</span>
          </button>

          <button
            onClick={onRestart}
            className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-sm transition-all hover:scale-102 active:scale-98"
          >
            <RotateCcw className="w-4 h-4 text-amber-400" />
            <span>MULA SEMULA SESI</span>
          </button>

          <button
            onClick={onToggleMute}
            className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-sm transition-all hover:scale-102 active:scale-98"
          >
            {isMuted ? (
              <>
                <VolumeX className="w-4 h-4 text-rose-400" />
                <span>BUKA BUNYI</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-emerald-400" />
                <span>SENYAPKAN BUNYI</span>
              </>
            )}
          </button>

          <button
            onClick={onMainMenu}
            className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-slate-800/60 hover:bg-slate-700/80 text-slate-400 hover:text-white font-medium text-sm transition-all"
          >
            <Home className="w-4 h-4" />
            <span>KEMBALI KE MENU UTAMA</span>
          </button>
        </div>
      </div>
    </div>
  );
};
