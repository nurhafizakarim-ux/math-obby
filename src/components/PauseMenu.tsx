
import React from 'react';
import {
  Play,
  RotateCcw,
  Home,
  Volume2,
  VolumeX,
  LogOut,
  Clock,
  Trophy,
  MapPin,
  CheckCircle,
  XCircle,
  ListChecks
} from 'lucide-react';

interface PauseMenuProps {
  onResume: () => void;
  onRestart: () => void;
  onMainMenu: () => void;
  onExit: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  score: number;
  elapsedTime: number;
  currentStation: string;
  questionsAnswered: number;
  correctAnswers: number;
  incorrectAnswers: number;
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

export const PauseMenu: React.FC<PauseMenuProps> = ({
  onResume,
  onRestart,
  onMainMenu,
  onExit,
  isMuted,
  onToggleMute,
  score,
  elapsedTime,
  currentStation,
  questionsAnswered,
  correctAnswers,
  incorrectAnswers
}) => {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/85 overflow-y-auto">
      <div className="max-w-md w-full bg-slate-900 border-2 border-slate-700 rounded-3xl p-6 text-center shadow-2xl my-auto">

        <h2 className="text-2xl font-black text-white mb-2">
          Permainan Dijeda
        </h2>

        <p className="text-slate-400 text-xs mb-5">
          Prestasi semasa anda. Masa permainan berhenti ketika dijeda.
        </p>

        {/* SCORE AND TIME SUMMARY */}
        <div className="grid grid-cols-2 gap-3 mb-4">

          <div className="bg-indigo-950/70 border border-indigo-500/40 rounded-2xl p-4">
            <Trophy className="w-5 h-5 text-amber-400 mx-auto mb-2" />
            <p className="text-xs text-indigo-200">Jumlah Markah</p>
            <p className="text-3xl font-black text-white">
              {score}
            </p>
          </div>

          <div className="bg-slate-800 border border-slate-600 rounded-2xl p-4">
            <Clock className="w-5 h-5 text-cyan-400 mx-auto mb-2" />
            <p className="text-xs text-slate-300">Masa Berlalu</p>
            <p className="text-3xl font-black text-white">
              {formatTime(elapsedTime)}
            </p>
          </div>

        </div>

        {/* CURRENT STATION */}
        <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3 mb-4 text-left">
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold text-slate-400">
              STESEN SEMASA
            </span>
          </div>

          <p className="text-sm font-bold text-white">
            {currentStation}
          </p>
        </div>

        {/* QUESTION STATISTICS */}
        <div className="bg-slate-800/70 border border-slate-700 rounded-xl p-3 mb-5">

          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ListChecks className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold text-slate-300">
                STATISTIK SOALAN
              </span>
            </div>

            <span className="text-sm font-black text-white">
              {questionsAnswered}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">

            <div className="bg-emerald-950/50 rounded-lg p-3">
              <CheckCircle className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
              <p className="text-xs text-emerald-300">Betul</p>
              <p className="text-xl font-black text-white">
                {correctAnswers}
              </p>
            </div>

            <div className="bg-rose-950/50 rounded-lg p-3">
              <XCircle className="w-4 h-4 text-rose-400 mx-auto mb-1" />
              <p className="text-xs text-rose-300">Salah</p>
              <p className="text-xl font-black text-white">
                {incorrectAnswers}
              </p>
            </div>

          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex flex-col gap-3">

          <button
            onClick={onResume}
            className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-md transition-all"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>RESUME GAME</span>
          </button>

          <button
            onClick={onExit}
            className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-md transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>EXIT GAME</span>
          </button>

          <button
            onClick={onRestart}
            className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-sm transition-all"
          >
            <RotateCcw className="w-4 h-4 text-amber-400" />
            <span>MULA SEMULA SESI</span>
          </button>

          <button
            onClick={onToggleMute}
            className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-sm transition-all"
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
