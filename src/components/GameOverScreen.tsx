import React from 'react';
import { Skull, RotateCcw, Home, CheckCircle } from 'lucide-react';
import { GameStats } from '../types/game';

interface GameOverScreenProps {
  stats: GameStats;
  onRestart: () => void;
  onMainMenu: () => void;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({
  stats,
  onRestart,
  onMainMenu
}) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md select-none animate-fadeIn">
      <div className="max-w-md w-full bg-slate-900 border-2 border-rose-600/60 rounded-3xl p-6 md:p-8 text-center shadow-2xl relative overflow-hidden">

        {/* Game Over Icon */}
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-rose-500/20 border-2 border-rose-500 flex items-center justify-center">
          <Skull className="w-8 h-8 text-rose-400" />
        </div>

        {/* Header */}
        <h1 className="text-2xl md:text-3xl font-black text-rose-400 mb-2">
          MATH OBBY GAME OVER
        </h1>

        <p className="text-sm text-slate-300 mb-6">
          Nyawa anda telah habis. Teruskan berlatih untuk menguasai konsep nisbah, kadar dan kadaran!
        </p>

        {/* Correct Questions Only */}
        <div className="bg-slate-800/90 border border-emerald-500/40 rounded-2xl p-6 mb-6">
          <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />

          <div className="text-sm font-bold text-slate-300 mb-2">
            BILANGAN SOALAN BETUL
          </div>

          <div className="text-4xl font-black text-emerald-400">
            {stats.correctCount} / 16
          </div>

          <p className="text-sm text-slate-300 mt-3">
            Anda menjawab {stats.correctCount} daripada 16 soalan dengan betul.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onRestart}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white font-extrabold text-sm shadow-lg transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>MULA SEMULA</span>
          </button>

          <button
            onClick={onMainMenu}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-sm transition-all cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>MENU UTAMA</span>
          </button>
        </div>
      </div>
    </div>
  );
};
