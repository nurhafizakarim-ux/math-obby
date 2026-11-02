import React from 'react';
import { Play, BookOpen, Trophy, Compass, HelpCircle } from 'lucide-react';

interface MainMenuProps {
  onStart: () => void;
  onOpenGuide: () => void;
  bestScore: number;
  bestTime: number;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onStart,
  onOpenGuide,
  bestScore,
  bestTime
}) => {
  const formatTime = (secs: number) => {
    if (!secs || secs === 0) return '--:--';
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-slate-950/80">
      <div className="max-w-xl w-full bg-slate-900 border-2 border-indigo-500/40 rounded-3xl p-6 md:p-8 shadow-2xl text-center relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -top-24 -left-24 w-52 h-52 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-52 h-52 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-400/30 text-indigo-300 text-xs font-bold tracking-wider uppercase mb-3">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Matematik Tingkatan 1 · KSSM DSKP</span>
        </div>

        {/* Game Title Lockup */}
        <h1 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-rose-400 tracking-tight leading-tight mb-2">
          Math Obby
        </h1>
        <h2 className="text-lg md:text-xl font-bold text-sky-300 mb-4">
          Ultimate Math Challenge
        </h2>

        <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-6 max-w-md mx-auto">
          Terokai dunia obby 3D! Kawal watak, lari, melompat melepasi halangan, dan selesaikan cabaran <strong className="text-white">Nisbah, Kadar dan Kadaran</strong> (SP 4.4.1 hingga SP 4.4.4) sehingga ke garisan penamat!
        </p>

        {/* High Score & Best Time Card */}
        <div className="grid grid-cols-2 gap-3 bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3.5 mb-6 text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Trophy className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Rekod Markah</div>
              <div className="font-mono-num font-black text-lg text-amber-300">{bestScore} Mata</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center shrink-0">
              <Compass className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Masa Terpantas</div>
              <div className="font-mono-num font-black text-lg text-sky-300">{formatTime(bestTime)}</div>
            </div>
          </div>
        </div>

        {/* 4 Pusingan Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6 text-left">
          <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-2.5">
            <div className="text-[10px] font-bold text-emerald-400">Pusingan 1 (SP 4.4.1)</div>
            <div className="text-xs font-semibold text-white">Tile Jump Challenge</div>
          </div>
          <div className="bg-sky-950/40 border border-sky-500/30 rounded-xl p-2.5">
            <div className="text-[10px] font-bold text-sky-400">Pusingan 2 (SP 4.4.2)</div>
            <div className="text-xs font-semibold text-white">Fireball Escape</div>
          </div>
          <div className="bg-amber-950/40 border border-amber-500/30 rounded-xl p-2.5">
            <div className="text-[10px] font-bold text-amber-400">Pusingan 3 (SP 4.4.3)</div>
            <div className="text-xs font-semibold text-white">Rotating Lasers</div>
          </div>
          <div className="bg-purple-950/40 border border-purple-500/30 rounded-xl p-2.5">
            <div className="text-[10px] font-bold text-purple-400">Pusingan 4 (SP 4.4.4)</div>
            <div className="text-xs font-semibold text-white">Falling Floor Survival</div>
          </div>
        </div>

        {/* Main Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <button
            onClick={onStart}
            className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold text-base shadow-lg shadow-emerald-500/25 transition-all hover:scale-105 active:scale-95"
          >
            <Play className="w-5 h-5 fill-white" />
            <span>MULA BERMAIN</span>
          </button>

          <button
            onClick={onOpenGuide}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 font-bold text-base transition-all hover:scale-105 active:scale-95"
          >
            <HelpCircle className="w-5 h-5 text-indigo-400" />
            <span>PANDUAN</span>
          </button>
        </div>

        {/* Controls footer line */}
        <p className="mt-6 text-xs text-slate-400">
          🎮 Kawalan: <strong>WASD / Anak Panah</strong> untuk bergerak · <strong className="text-amber-300">Shift / B</strong> untuk ⚡ Boost Laju · <strong className="text-emerald-300">Spacebar</strong> untuk melompat.
        </p>
      </div>
    </div>
  );
};
