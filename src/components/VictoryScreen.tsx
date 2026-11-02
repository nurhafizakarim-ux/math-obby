import React from 'react';
import { Trophy, CheckCircle, XCircle, Clock, RotateCcw, Home, Award, Heart, Star, Sparkles, Medal } from 'lucide-react';
import { GameStats } from '../types/game';

interface VictoryScreenProps {
  stats: GameStats;
  onPlayAgain: () => void;
  onMainMenu: () => void;
}

export const VictoryScreen: React.FC<VictoryScreenProps> = ({
  stats,
  onPlayAgain,
  onMainMenu
}) => {
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const isNewHighScore = stats.score >= stats.bestScore && stats.score > 0;

  // Determine Rank styling
  const rankColors: Record<string, { bg: string; text: string; border: string }> = {
    'PLATINUM RUNNER': { bg: 'bg-cyan-500/20', text: 'text-cyan-300', border: 'border-cyan-400' },
    'GOLD RUNNER': { bg: 'bg-amber-500/20', text: 'text-amber-300', border: 'border-amber-400' },
    'SILVER RUNNER': { bg: 'bg-slate-400/20', text: 'text-slate-200', border: 'border-slate-300' },
    'BRONZE EXPLORER': { bg: 'bg-amber-800/30', text: 'text-amber-400', border: 'border-amber-700' }
  };

  const rankStyle = rankColors[stats.achievementRank] || rankColors['GOLD RUNNER'];

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md select-none animate-fadeIn">
      <div className="max-w-lg w-full bg-slate-900 border-2 border-amber-500/60 rounded-3xl p-6 md:p-8 text-center shadow-2xl relative overflow-hidden">
        {/* Ambient Victory Gold Glow */}
        <div className="absolute -top-24 -left-24 w-56 h-56 bg-amber-500/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-56 h-56 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Animated Trophy Header */}
        <div className="relative w-20 h-20 mx-auto mb-3">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-300 p-0.5 shadow-xl shadow-amber-500/30 flex items-center justify-center animate-bounce">
            <div className="w-full h-full bg-slate-900 rounded-[22px] flex items-center justify-center">
              <Trophy className="w-10 h-10 text-amber-300" />
            </div>
          </div>
          <Sparkles className="w-6 h-6 text-yellow-300 absolute -top-1 -right-2 animate-spin" style={{ animationDuration: '4s' }} />
        </div>

        {/* Victory Title */}
        <h1 className="text-2xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 mb-1 tracking-tight">
          MATH OBBY COMPLETED!
        </h1>
        <p className="text-xs md:text-sm text-slate-300 mb-4">
          Tahniah! Anda berjaya menewaskan kesemua 4 stesen halangan dan menyelesaikan cabaran matematik Tingkatan 1!
        </p>

        {/* Achievement Rank Banner */}
        <div className={`mb-5 p-3 rounded-2xl border ${rankStyle.border} ${rankStyle.bg} flex items-center justify-between shadow-lg`}>
          <div className="flex items-center gap-2 text-left">
            <Medal className={`w-6 h-6 ${rankStyle.text}`} />
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pangkat Pencapaian</div>
              <div className={`text-sm md:text-base font-black tracking-wide ${rankStyle.text}`}>
                {stats.achievementRank}
              </div>
            </div>
          </div>

          {/* Infinite Lives Badge */}
          <div className="flex items-center gap-1.5 bg-slate-950/60 px-3 py-1.5 rounded-xl border border-rose-500/40 shadow-sm">
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500 drop-shadow-[0_0_6px_rgba(244,63,94,0.7)]" />
            <span className="text-xs font-black text-rose-300 font-mono-num flex items-center gap-1">
              <span className="text-sm font-black">∞</span>
              <span className="text-[10px] text-rose-400 font-bold uppercase">Nyawa Infiniti</span>
            </span>
          </div>
        </div>

        {isNewHighScore && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold mb-4 animate-pulse">
            <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
            <span>REKOD TERBAIK BAHARU!</span>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2.5 mb-5 text-left text-xs">
          {/* Final Score */}
          <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-3">
            <div className="text-[10px] font-bold text-slate-400 uppercase">Markah Akhir</div>
            <div className="font-mono-num font-black text-2xl text-amber-300 mt-0.5">
              {stats.score} <span className="text-xs text-amber-400/70 font-normal">Mata</span>
            </div>
          </div>

          {/* Total Completion Time */}
          <div className="bg-slate-800/90 border border-slate-700 rounded-xl p-3">
            <div className="text-[10px] font-bold text-slate-400 uppercase">Masa Penamat</div>
            <div className="font-mono-num font-black text-2xl text-sky-300 flex items-center gap-1.5 mt-0.5">
              <Clock className="w-4 h-4 text-sky-400" />
              <span>{formatTime(stats.totalTime)}</span>
            </div>
          </div>

          {/* Correct Answers */}
          <div className="bg-slate-800/90 border border-emerald-500/30 rounded-xl p-3">
            <div className="text-[10px] font-bold text-slate-400 uppercase">Jawapan Betul</div>
            <div className="font-mono-num font-black text-xl text-emerald-400 flex items-center gap-1.5 mt-0.5">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>{Math.min(16, stats.correctCount)} / 16</span>
            </div>
          </div>

          {/* Soalan Salah Sahaja (Tidak termasuk gagal halangan) */}
          <div className="bg-slate-800/90 border border-rose-500/30 rounded-xl p-3">
            <div className="text-[10px] font-bold text-slate-400 uppercase">Soalan Salah</div>
            <div className="font-mono-num font-black text-xl text-rose-400 flex items-center gap-1.5 mt-0.5">
              <XCircle className="w-4 h-4 text-rose-400" />
              <span>{stats.wrongCount} <span className="text-xs text-slate-400 font-normal">soalan</span></span>
            </div>
          </div>
        </div>

        {/* Best Records info */}
        <div className="bg-slate-950/60 rounded-xl p-2.5 border border-slate-800 text-xs text-slate-400 flex justify-between items-center mb-6">
          <span>Stesen Selesai: <strong className="text-emerald-400 font-mono-num">4 / 4</strong></span>
          <span>Rekod Tertinggi: <strong className="text-amber-300 font-mono-num">{stats.bestScore} Mata</strong></span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onPlayAgain}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold text-sm shadow-lg shadow-emerald-500/25 transition-all hover:scale-102 active:scale-98 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>MAIN SEMULA (PLAY AGAIN)</span>
          </button>
          <button
            onClick={onMainMenu}
            className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-sm transition-all cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>MENU UTAMA</span>
          </button>
        </div>
      </div>
    </div>
  );
};
