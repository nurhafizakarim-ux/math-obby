import React from 'react';
import { Volume2, VolumeX, Pause, Trophy, Clock, CheckCircle2, AlertTriangle, Zap, ArrowUp, Heart } from 'lucide-react';
import { Question, QuestionFeedback } from '../types/game';
import { SP_DETAILS } from '../data/questions';

interface HUDProps {
  currentQuestion: Question | undefined;
  questionIndex: number;
  totalQuestions: number;
  score: number;
  raceTime: number; // in seconds
  timeLeft: number; // in seconds (0..25)
  lives: number; // 0..5
  feedback: QuestionFeedback | null;
  isMuted: boolean;
  raceStarted: boolean;
  waitingForSpIsland?: string | null;
  isBridgeUnlocked?: boolean;
  isBoostActive: boolean;
  onBoostDown: () => void;
  onBoostUp: () => void;
  onJumpDown: () => void;
  onJumpUp: () => void;
  onToggleMute: () => void;
  onPause: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  currentQuestion,
  questionIndex,
  totalQuestions,
  score,
  raceTime,
  timeLeft,
  lives,
  feedback,
  isMuted,
  raceStarted,
  waitingForSpIsland = null,
  isBridgeUnlocked = false,
  isBoostActive,
  onBoostDown,
  onBoostUp,
  onJumpDown,
  onJumpUp,
  onToggleMute,
  onPause
}) => {
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const spInfo = currentQuestion ? SP_DETAILS[currentQuestion.spCode] : null;

  // Calculate timer percentage (25s total)
  const timerPercent = Math.max(0, Math.min(100, (timeLeft / 25) * 100));
  const isUrgent = timeLeft <= 6;

  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-3 select-none">
      {/* 1. TOP BAR: Status cluster & Compact Question Dock */}
      <div className="w-full flex flex-col items-center gap-1.5 pointer-events-auto">
        {/* Top Status Indicators (Score, Time, Lives, Mute, Pause) */}
        <div className="flex items-center justify-between w-full max-w-4xl px-2">
          {/* Left: Active Zone / SP Name */}
          <div className="flex items-center gap-2">
            {waitingForSpIsland ? (
              <div className="flex items-center gap-1.5 bg-amber-950/90 border border-amber-500/80 px-2.5 py-1 rounded-xl shadow-md">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-200">
                  MENUJU KE {waitingForSpIsland}
                </span>
              </div>
            ) : raceStarted && spInfo ? (
              <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-700/80 px-2.5 py-1 rounded-xl shadow-md">
                <span className={`w-2.5 h-2.5 rounded-full ${spInfo.badgeColor}`} />
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-200">
                  {spInfo.title.split('—')[0]}
                </span>
                <span className="text-[10px] text-slate-400 font-mono-num font-semibold">
                  (Soalan {questionIndex + 1})
                </span>
              </div>
            ) : (
              <div className="bg-sky-950/80 border border-sky-400/60 px-3 py-1 rounded-xl text-sky-200 text-xs font-bold shadow-md flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
                <span>🚩 MENUJU KE PINTU MULA</span>
              </div>
            )}
          </div>

          {/* Center: Lives, Race Time & Score */}
          <div className="flex items-center gap-2">
            {/* Lives Meter */}
            <div className="flex items-center gap-1.5 bg-slate-900/90 border border-rose-500/60 px-2.5 py-1 rounded-xl shadow-md">
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500 drop-shadow-[0_0_6px_rgba(244,63,94,0.7)]" />
                <span className="font-extrabold text-xs text-rose-300 tracking-wide font-mono-num flex items-center gap-1">
                  <span className="text-sm leading-none font-black">{lives}/5</span>
                  <span className="text-[10px] text-rose-400 font-semibold">NYAWA</span>
               </span>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-700/80 px-2.5 py-1 rounded-xl shadow-md">
              <Clock className="w-3.5 h-3.5 text-sky-400" />
              <span className="font-mono-num font-bold text-xs text-white">
                {formatTime(raceTime)}
              </span>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-900/90 border border-amber-500/60 px-2.5 py-1 rounded-xl shadow-md">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-mono-num font-extrabold text-xs text-amber-300">
                {score} <span className="text-[10px] text-amber-400/80 font-normal">MATA</span>
              </span>
            </div>
          </div>

          {/* Right: Controls */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={onToggleMute}
              className="p-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 transition-all shadow-md"
              title={isMuted ? 'Buka Bunyi' : 'Senyapkan'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
            </button>
            <button
              onClick={onPause}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 transition-all shadow-md font-semibold text-[11px]"
            >
              <Pause className="w-3 h-3 text-indigo-400" />
              <span>JEDA</span>
            </button>
          </div>
        </div>

        {/* 2. SP TRANSITION BANNER OR COMPACT QUESTION DOCK */}
        {!raceStarted ? (
          /* Hub Welcome / Start Gate Instruction Banner */
          <div className="w-full max-w-2xl bg-slate-900/95 border-2 border-sky-400/80 rounded-2xl p-3 shadow-2xl text-center mt-0.5 animate-fadeIn">
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="text-xl">🏃‍♂️💨</span>
              <span className="text-xs font-black uppercase tracking-widest text-sky-300">
                GARISAN PERMULAAN
              </span>
            </div>
            <p className="text-white text-xs md:text-sm font-semibold">
              Sila berjalan melepasi <strong className="text-sky-300 font-extrabold underline">PINTU MULA</strong> di hadapan untuk memulakan <strong className="text-emerald-400 font-bold">Pusingan 1</strong>!
            </p>
          </div>
        ) : waitingForSpIsland ? (
          /* Transition Banner while crossing bridge between SPs */
          <div className="w-full max-w-3xl bg-slate-900/95 border-2 border-amber-500/80 rounded-2xl p-3 shadow-2xl text-center mt-0.5 animate-pulse">
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="text-xl">🏃‍♂️💨</span>
              <span className="text-xs font-black uppercase tracking-widest text-amber-300">
                TAHNIAH! SELESAI PUSINGAN SEBELUMNYA
              </span>
            </div>
            <p className="text-white text-xs md:text-sm font-semibold">
              Teruskan berlari melintasi jambatan ke <strong className="text-amber-400 font-extrabold underline decoration-amber-400">Platform Permulaan {waitingForSpIsland}</strong> di hadapan untuk soalan seterusnya!
            </p>
          </div>
        ) : raceStarted && currentQuestion ? (
          <div className="w-full max-w-3xl bg-slate-900/95 border border-slate-700/90 rounded-2xl shadow-xl overflow-hidden mt-0.5">
            {/* 3px Ultra-thin 25s Countdown Progress Line */}
            <div className="w-full bg-slate-800 h-1.5 relative">
              <div
                className={`h-full transition-all duration-200 ease-linear ${
                  isUrgent ? 'bg-rose-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${timerPercent}%` }}
              />
            </div>

            <div className="px-3.5 py-2 flex flex-col md:flex-row md:items-center justify-between gap-2">
              {/* Question Text */}
              <div className="flex-1 min-w-0 pr-2">
                <p className="text-white font-semibold text-xs md:text-sm leading-tight truncate md:whitespace-normal">
                  <span className="text-amber-400 font-bold mr-1.5">S{questionIndex + 1}:</span>
                  {currentQuestion.question}
                </p>
              </div>

              {/* Options Chips & Countdown Pill */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Visual order matching 3D world: A (Kiri/Left), B (Tengah/Center), C (Kanan/Right) */}
                <div className="flex items-center gap-1.5">
                  {/* [A] on LEFT */}
                  <div className="flex items-center gap-1 bg-slate-800/95 px-2 py-0.5 rounded-lg border border-emerald-500/50 text-[11px] shadow-sm">
                    <span className="w-4 h-4 rounded bg-emerald-600 font-bold text-white flex items-center justify-center text-[10px] shrink-0">
                      A
                    </span>
                    <span className="text-emerald-300 text-[9px] font-bold">Kiri:</span>
                    <span className="text-slate-100 font-medium whitespace-nowrap">{currentQuestion.options[0]}</span>
                  </div>

                  {/* [B] in CENTER */}
                  <div className="flex items-center gap-1 bg-slate-800/95 px-2 py-0.5 rounded-lg border border-sky-500/50 text-[11px] shadow-sm">
                    <span className="w-4 h-4 rounded bg-sky-600 font-bold text-white flex items-center justify-center text-[10px] shrink-0">
                      B
                    </span>
                    <span className="text-sky-300 text-[9px] font-bold">Tengah:</span>
                    <span className="text-slate-100 font-medium whitespace-nowrap">{currentQuestion.options[1]}</span>
                  </div>

                  {/* [C] on RIGHT */}
                  <div className="flex items-center gap-1 bg-slate-800/95 px-2 py-0.5 rounded-lg border border-purple-500/50 text-[11px] shadow-sm">
                    <span className="w-4 h-4 rounded bg-purple-600 font-bold text-white flex items-center justify-center text-[10px] shrink-0">
                      C
                    </span>
                    <span className="text-purple-300 text-[9px] font-bold">Kanan:</span>
                    <span className="text-slate-100 font-medium whitespace-nowrap">{currentQuestion.options[2]}</span>
                  </div>
                </div>

                {/* 25s Timer Pill */}
                <span
                  className={`font-mono-num font-bold text-[11px] px-2 py-0.5 rounded-full shrink-0 ${
                    isUrgent ? 'bg-rose-500/20 text-rose-400 border border-rose-500/50' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  ⏱ {Math.ceil(timeLeft)}s
                </span>
              </div>
            </div>

            {/* Station 4 Gameplay Instruction Banner */}
            {currentQuestion.spCode === 'SP 4.4.4' && (
              <div className={`border-t px-3 py-1 text-center flex items-center justify-center gap-2 transition-colors duration-300 ${
                isBridgeUnlocked ? 'bg-emerald-950/90 border-emerald-500/80 animate-pulse' : 'bg-purple-950/80 border-purple-800/50'
              }`}>
                <span className={`w-2 h-2 rounded-full animate-ping ${isBridgeUnlocked ? 'bg-emerald-400' : 'bg-purple-400'}`} />
                <span className={`text-[11px] font-semibold ${isBridgeUnlocked ? 'text-emerald-100 font-bold' : 'text-purple-200'}`}>
                  {isBridgeUnlocked ? (
                    <span>🌉 <strong className="text-amber-300 uppercase tracking-wide">PAGAR DIBUKA:</strong> Lari & lompat seberangi Jambatan Runtuh sebelum platform jatuh!</span>
                  ) : (
                    <span><strong className="text-amber-300">PANDUAN:</strong> Baca soalan di atas. Lompat ke atas jubin (<strong className="text-emerald-300">A</strong>, <strong className="text-sky-300">B</strong>, atau <strong className="text-purple-300">C</strong>) dengan jawapan yang betul!</span>
                  )}
                </span>
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* 3. QUESTION FEEDBACK / ELECTRIC SHOCK MODAL */}
      {feedback && (
        <div className="fixed inset-0 pointer-events-auto flex items-center justify-center p-4 z-50 bg-black/60 select-none animate-fadeIn">
          <div
            className={`max-w-md w-full rounded-2xl p-5 border-2 shadow-2xl transform transition-all ${
              feedback.type === 'CORRECT'
                ? 'bg-slate-900 border-emerald-500 text-emerald-400'
                : feedback.type === 'WRONG'
                ? 'bg-slate-900 border-rose-500 text-rose-400'
                : 'bg-slate-900 border-amber-500 text-amber-400'
            }`}
          >
            <div className="flex items-center gap-3 mb-2.5">
              {feedback.type === 'CORRECT' && <CheckCircle2 className="w-7 h-7 text-emerald-400 shrink-0" />}
              {feedback.type === 'WRONG' && (
                <div className="w-8 h-8 rounded-full bg-rose-500/20 border border-rose-500 flex items-center justify-center shrink-0">
                  <Zap className="w-5 h-5 text-amber-300 fill-amber-300" />
                </div>
              )}
              {feedback.type === 'TIMEOUT' && <AlertTriangle className="w-7 h-7 text-amber-400 shrink-0" />}
              <div>
                <h3 className="text-lg font-bold text-white">
                  {feedback.type === 'CORRECT' && 'Tahniah! Jawapan Tepat'}
                  {feedback.type === 'WRONG' && (feedback.revealCorrectAnswer ? 'Jawapan Tidak Tepat (Incorrect Answer)' : 'Cabaran Halangan Gagal')}
                  {feedback.type === 'TIMEOUT' && 'Masa 25s Tamat (Time Out)'}
                </h3>
                <span className="text-xs font-semibold font-mono-num">
                  {feedback.pointsChange > 0 ? `+${feedback.pointsChange}` : `${feedback.pointsChange}`} MATA
                </span>
              </div>
            </div>

            {/* Reveal correct answer ONLY when player actually submitted an incorrect answer */}
            {feedback.revealCorrectAnswer && (
              <div className="bg-slate-800/95 rounded-xl p-3 border border-rose-500/40 mb-2.5 text-slate-200 text-xs shadow-inner">
                <div className="flex items-center gap-1.5 font-bold text-rose-300 mb-1">
                  <span className="bg-rose-500/30 text-rose-200 px-1.5 py-0.5 rounded text-[10px] uppercase font-black tracking-wide">
                    Jawapan Sebenar
                  </span>
                  <span>
                    Jawapan Betul: <strong className="text-emerald-400 font-extrabold">{['A', 'B', 'C'][feedback.question.correctIndex]} — {feedback.question.options[feedback.question.correctIndex]}</strong>
                  </span>
                </div>
                <div className="text-slate-300 leading-relaxed font-sans text-[11.5px] mt-1.5 bg-slate-900/70 p-2 rounded-lg border border-slate-700/60">
                  <strong className="text-amber-300 font-semibold">Penerangan Konsep:</strong> {feedback.question.explanation}
                </div>
              </div>
            )}

            <p className="text-[11px] text-slate-300 italic text-center">
              {feedback.message}
            </p>
          </div>
        </div>
      )}

      {/* 4. PERMANENT ON-SCREEN ACTION DOCK (ALWAYS VISIBLE FOR PC & MOBILE) */}
      <div className="w-full flex items-end justify-between pointer-events-auto">
        {/* Bottom Left: Keyboard Hints */}
        <div className="bg-slate-900/90 border border-slate-700/80 px-3.5 py-1.5 rounded-full text-slate-300 text-[11px] hidden md:flex items-center gap-3 shadow-lg">
          <span><strong className="text-white">WASD</strong> : Bergerak</span>
          <span><strong className="text-amber-300">Shift / B</strong> : ⚡ Boost Laju</span>
          <span><strong className="text-emerald-300">Space</strong> : ⬆ Lompat</span>
        </div>

        {/* Bottom Right: Big Floating BOOST & LOMPAT Buttons (ALWAYS VISIBLE) */}
        <div className="flex items-center gap-3 ml-auto">
          {/* ⚡ BOOST BUTTON */}
          <button
            onMouseDown={onBoostDown}
            onMouseUp={onBoostUp}
            onTouchStart={onBoostDown}
            onTouchEnd={onBoostUp}
            className={`w-16 h-16 md:w-18 md:h-18 rounded-2xl border-2 font-bold text-white flex flex-col items-center justify-center shadow-xl transition-all active:scale-90 touch-none select-none cursor-pointer ${
              isBoostActive
                ? 'bg-amber-500 border-white scale-95 shadow-amber-500/60 ring-4 ring-amber-400/40'
                : 'bg-gradient-to-b from-amber-500 to-amber-700 border-amber-300/80 hover:brightness-110 shadow-amber-900/40'
            }`}
            title="Tahan untuk memecut laju (Shift / B)"
          >
            <Zap className={`w-6 h-6 md:w-7 md:h-7 ${isBoostActive ? 'fill-white' : 'fill-amber-200'}`} />
            <span className="text-[10px] md:text-[11px] tracking-wider uppercase font-black leading-none mt-0.5">
              {isBoostActive ? 'LAJU!' : 'BOOST'}
            </span>
          </button>

          {/* ⬆ LOMPAT BUTTON */}
          <button
            onMouseDown={onJumpDown}
            onMouseUp={onJumpUp}
            onTouchStart={onJumpDown}
            onTouchEnd={onJumpUp}
            className="w-16 h-16 md:w-18 md:h-18 rounded-2xl border-2 bg-gradient-to-b from-emerald-500 to-teal-700 border-emerald-300/80 hover:brightness-110 font-bold text-white flex flex-col items-center justify-center shadow-xl shadow-emerald-950/50 transition-all active:scale-90 touch-none select-none cursor-pointer"
            title="Tekan untuk melompat (Spacebar)"
          >
            <ArrowUp className="w-6 h-6 md:w-7 md:h-7 stroke-[3]" />
            <span className="text-[10px] md:text-[11px] tracking-wider uppercase font-black leading-none mt-0.5">
              LOMPAT
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
