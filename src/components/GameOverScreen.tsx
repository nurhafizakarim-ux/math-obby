import React from 'react';
import { Skull, Clock, Trophy, CheckCircle, XCircle, AlertTriangle, RotateCcw, Home, Heart, ShieldAlert } from 'lucide-react';
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
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md select-none animate-fadeIn">
      <div className="max-w-md w-full bg-slate-900 border-2 border-rose-600/60 rounded-3xl p-6 md:p-8 text-center shadow-2xl relative overflow-hidden">
        {/* Ambient Red Glow */}
        <div className="absolute -top-24 -left-24 w-52 h-52 bg-rose-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-52 h-52 bg-orange-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Skull / Game Over Badge */}
        <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-rose-500/20 border-2 border-rose-500 flex items-center justify-center shadow-lg shadow-rose-950/50">
          <Skull className="w-8 h-8 text-rose-400 animate-pulse" />
        </div>

        {/* Header */}
        <h1 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-red-300 to-rose-500 mb-1 tracking-tight">
          MATH OBBY GAME OVER
        </h1>
        <p className="text-xs text-rose-300/80 mb-4">
          Nyawa anda telah habis! Usah putus asa, kuasai konsep nisbah dan cuba lagi!
        </p>

        {/* Broken Hearts Display */}
        <div className="flex items-center justify-center gap-2 mb-4 bg-slate-950/60 py-2 px-4 rounded-xl border border-slate-800 w-fit mx-auto">
          {[1, 2, 3, 4, 5].map(h => (
            <Heart key={h} className="w-5 h-5 text-slate-700 fill-slate-800 opacity-60" />
          ))}
          <span className="text-xs font-bold text-rose-400 font-mono-num ml-1">0 / 5 NYAWA</span>
        </div>

        {/* Achievement Rank: Rookie Explorer */}
        <div className="mb-4 p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-300">Pangkat Pencapaian:</span>
          </div>
          <span className="px-2.5 py-0.5 rounded-md text-xs font-extrabold uppercase tracking-wider bg-slate-700 text-slate-300 border border-slate-600">
            {stats.achievementRank || 'ROOKIE EXPLORER'}
          </span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2.5 mb-5 text-left text-xs">
          {/* Final Score */}
          <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-3">
            <div className="text-[10px] font-bold text-slate-400 uppercase">Markah Terkumpul</div>
            <div className="font-mono-num font-black text-xl text-amber-300 flex items-center gap-1.5 mt-0.5">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>{stats.score} Mata</span>
            </div>
          </div>

          {/* Elapsed Time */}
          <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-3">
            <div className="text-[10px] font-bold text-slate-400 uppercase">Masa Bertahan</div>
            <div className="font-mono-num font-black text-xl text-sky-300 flex items-center gap-1.5 mt-0.5">
              <Clock className="w-4 h-4 text-sky-400" />
              <span>{formatTime(stats.totalTime)}</span>
            </div>
          </div>

          {/* Correct Count */}
          <div className="bg-slate-800/90 border border-emerald-500/30 rounded-xl p-3">
            <div className="text-[10px] font-bold text-slate-400 uppercase">Jawapan Betul</div>
            <div className="font-mono-num font-black text-lg text-emerald-400 flex items-center gap-1 mt-0.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>{stats.correctCount}</span>
            </div>
          </div>

          {/* Soalan Salah Sahaja (Tidak termasuk gagal halangan) */}
          <div className="bg-slate-800/90 border border-rose-500/30 rounded-xl p-3">
            <div className="text-[10px] font-bold text-slate-400 uppercase">Soalan Salah</div>
            <div className="font-mono-num font-bold text-base text-rose-300 flex items-center gap-1.5 mt-0.5">
              <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span>{stats.wrongCount} <span className="text-xs text-slate-400 font-normal">soalan</span></span>
            </div>
          </div>
        </div>

        {/* Stations Reached Info */}
        <div className="bg-slate-950/70 rounded-xl p-2.5 border border-slate-800 text-xs text-slate-300 flex justify-between items-center mb-5">
          <span>Stesen Terakhir: <strong className="text-white">{stats.lastStationReached}</strong></span>
          <span>Selesai: <strong className="text-sky-400 font-mono-num">{stats.stationsCompleted} / 4</strong></span>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <button
            onClick={onRestart}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white font-extrabold text-sm shadow-lg shadow-rose-950/60 transition-all hover:scale-102 active:scale-98 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>MULA SEMULA (RESTART)</span>
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
