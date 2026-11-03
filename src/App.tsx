/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { GameCanvas } from './game3d/GameCanvas';
import { HUD } from './components/HUD';
import { MainMenu } from './components/MainMenu';
import { PauseMenu } from './components/PauseMenu';
import { VictoryScreen } from './components/VictoryScreen';
import { GuideModal } from './components/GuideModal';
import { MobileControls } from './components/MobileControls';
import { GameOverScreen } from './components/GameOverScreen';
import { generateSessionQuestions, SP_DETAILS } from './data/questions';
import { GameScreen, Question, QuestionFeedback, GameStats } from './types/game';
import { soundManager } from './audio/soundManager';

// Exact starting checkpoint coordinates for each SP matching 3D world spawn circles
const SP_START_COORDINATES: Record<'SP 4.4.1' | 'SP 4.4.2' | 'SP 4.4.3' | 'SP 4.4.4', THREE.Vector3> = {
  'SP 4.4.1': new THREE.Vector3(0, 1.2, 6),   // SP 1 Start Runway
  'SP 4.4.2': new THREE.Vector3(0, 1.2, 242), // SP 2 Starting Island
  'SP 4.4.3': new THREE.Vector3(0, 1.2, 482), // SP 3 Starting Island
  'SP 4.4.4': new THREE.Vector3(0, 1.2, 730)  // SP 4 Starting Island
};

export default function App() {
  const [screen, setScreen] = useState<GameScreen>('MENU');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState<number>(0);
  const [lives, setLives] = useState<number>(5);
  const [score, setScore] = useState<number>(0);
  const [raceTime, setRaceTime] = useState<number>(0);
  const [questionTimer, setQuestionTimer] = useState<number>(25.0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [wrongCount, setWrongCount] = useState<number>(0);
  const [obstacleFails, setObstacleFails] = useState<number>(0);
  const [timeoutCount, setTimeoutCount] = useState<number>(0);
  const [feedback, setFeedback] = useState<QuestionFeedback | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(soundManager.getMuted());
  const [guideOpen, setGuideOpen] = useState<boolean>(false);
  const [raceStarted, setRaceStarted] = useState<boolean>(true);
  const [waitingForSpIsland, setWaitingForSpIsland] = useState<string | null>(null);
  const [isShocking, setIsShocking] = useState<boolean>(false);
  const [isBoostActive, setIsBoostActive] = useState<boolean>(false);
  const [isJumpActive, setIsJumpActive] = useState<boolean>(false);
  const [station4BridgeUnlocked, setStation4BridgeUnlocked] = useState<boolean>(false);
  const [teleportTarget, setTeleportTarget] = useState<THREE.Vector3 | null>(null);
  const [touchInput, setTouchInput] = useState<{ x: number; y: number; jump: boolean; boost: boolean }>({
    x: 0,
    y: 0,
    jump: false,
    boost: false
  });

  // Best scores from localStorage
  const [bestScore, setBestScore] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem('math_obby_best_score') || '0', 10);
    } catch {
      return 0;
    }
  });

  const [bestTime, setBestTime] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem('math_obby_best_time') || '0', 10);
    } catch {
      return 0;
    }
  });

  const lastWarnSecRef = useRef<number>(-1);
  const attemptedQuestionsRef = useRef<Set<number>>(new Set());
  const awardedQuestionsRef = useRef<Set<number>>(new Set());
  const correctlyAnsweredQuestionsRef = useRef<Set<number>>(new Set());
  const isFailureLockedRef = useRef<boolean>(false);

  // Initialize new session (Player spawns on hub behind PINTU MULA, walks to Pusingan 1)
  const startNewGame = useCallback(() => {
    const sessionQuestions = generateSessionQuestions();
    setQuestions(sessionQuestions);
    setCurrentQIndex(0);
    setLives(5);
    setScore(0);
    setRaceTime(0);
    setQuestionTimer(25.0);
    setCorrectCount(0);
    setWrongCount(0);
    setObstacleFails(0);
    setTimeoutCount(0);
    setFeedback(null);
    setWaitingForSpIsland(null);
    setRaceStarted(false); // Player must walk through PINTU MULA to start!
    setIsShocking(false);
    setIsBoostActive(false);
    setIsJumpActive(false);
    setStation4BridgeUnlocked(false);
    isFailureLockedRef.current = false;
    attemptedQuestionsRef.current.clear();
    awardedQuestionsRef.current.clear();
    correctlyAnsweredQuestionsRef.current.clear();
    setScreen('PLAYING');

    // Teleport to starting hub behind PINTU MULA (Z = -12)
    setTeleportTarget(new THREE.Vector3(0, 1.2, -12));
    setTimeout(() => setTeleportTarget(null), 150);

    soundManager.playClick();
    soundManager.startBgm();
  }, []);

  // Called when player walks through PINTU MULA archway into Pusingan 1
  const handleStartGatePassed = useCallback(() => {
    setRaceStarted(true);
    setQuestionTimer(25.0);
    soundManager.playCheckpoint();
  }, []);

  // Called when player steps onto the starting island of next SP
  const handleSpIslandReached = useCallback((spCode: string) => {
    setWaitingForSpIsland(currentWaiting => {
      if (!currentWaiting) return null;
      const spCodeMap: Record<string, string> = {
        'SP 4.4.1': 'Pusingan 1',
        'SP 4.4.2': 'Pusingan 2',
        'SP 4.4.3': 'Pusingan 3',
        'SP 4.4.4': 'Pusingan 4'
      };
      const expectedPusingan = spCodeMap[spCode] || spCode;
      const isMatch =
        currentWaiting === expectedPusingan ||
        currentWaiting === spCode ||
        (currentWaiting.includes('2') && (spCode.includes('4.4.2') || spCode.includes('2'))) ||
        (currentWaiting.includes('3') && (spCode.includes('4.4.3') || spCode.includes('3'))) ||
        (currentWaiting.includes('4') && (spCode.includes('4.4.4') || spCode.includes('4')));

      if (isMatch) {
        soundManager.playCheckpoint();
        setQuestionTimer(25.0);
        return null; // Unlocks next question!
      }
      return currentWaiting;
    });
  }, []);

  const handleToggleMute = useCallback(() => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  }, []);

  // Central Failure Handling (1 life deducted per failure event, restarting current station)
  const handleFailure = useCallback(
    (
      reason: 'WRONG' | 'TIMEOUT' | 'HAZARD' | 'FALL',
      extra?: { hazardType?: string; station?: string; optionIndex?: number }
    ) => {
      if (isFailureLockedRef.current || screen !== 'PLAYING') return;
      isFailureLockedRef.current = true;

      // Deduct 10 points
      setScore(s => Math.max(0, s - 10));

      if (reason === 'WRONG') {
        // Hanya menambah bilangan soalan yang salah (bukan halangan fizikal!)
        setWrongCount(w => w + 1);
      } else if (reason === 'TIMEOUT') {
        setTimeoutCount(c => c + 1);
      } else {
        // 'FALL' atau 'HAZARD' - gagal halangan, tidak dimasukkan dalam soalan salah
        setObstacleFails(f => f + 1);
      }

      // Determine current station
      let spCode: 'SP 4.4.1' | 'SP 4.4.2' | 'SP 4.4.3' | 'SP 4.4.4' = 'SP 4.4.1';
      let spStartIdx = 0;
      let pusinganNum = 1;
      let spTitle = 'Pusingan 1 (Soalan 1)';

      if (extra?.station === 'SP 4.4.4' || currentQIndex >= 12) {
        spCode = 'SP 4.4.4';
        spStartIdx = 12;
        pusinganNum = 4;
        spTitle = 'Pusingan 4 (Soalan 13)';
      } else if (extra?.station === 'SP 4.4.3' || currentQIndex >= 8) {
        spCode = 'SP 4.4.3';
        spStartIdx = 8;
        pusinganNum = 3;
        spTitle = 'Pusingan 3 (Soalan 9)';
      } else if (extra?.station === 'SP 4.4.2' || currentQIndex >= 4) {
        spCode = 'SP 4.4.2';
        spStartIdx = 4;
        pusinganNum = 2;
        spTitle = 'Pusingan 2 (Soalan 5)';
      }

      const respawnPoint = SP_START_COORDINATES[spCode];
      const activeQ = questions[currentQIndex] || questions[spStartIdx];

      // Sound effects with Infinite Lives (no Game Over)
      if (reason === 'HAZARD') {
        if (extra?.hazardType === 'FIREBALL') soundManager.playFireballHit();
        else if (extra?.hazardType === 'LASER') soundManager.playLaserZap();
        else soundManager.playLifeLost();
      } else if (reason === 'WRONG') {
        setIsShocking(true);
        soundManager.playShock();
        setTimeout(() => setIsShocking(false), 1200);
      } else {
        soundManager.playLifeLost();
      }

      const isIncorrectAnswer = reason === 'WRONG';

      let reasonMsg = '';
      if (reason === 'WRONG') {
        reasonMsg = activeQ?.spCode === 'SP 4.4.4'
          ? '❌ Jawapan Tidak Tepat (Incorrect Answer)!'
          : '⚡ Renjatan Elektrik! Jawapan tidak tepat.';
      } else if (reason === 'TIMEOUT') {
        reasonMsg = '⏰ Masa 25 saat telah tamat!';
      } else if (reason === 'FALL') {
        reasonMsg = currentQIndex >= 12 ? '🔥 Terjatuh ke dalam lahar panas!' : '⚠️ Terjatuh dari halangan!';
      } else if (reason === 'HAZARD') {
        if (extra?.hazardType === 'FIREBALL') reasonMsg = '☄️ Terkena bola api membara!';
        else if (extra?.hazardType === 'LASER') reasonMsg = '⚡ Terkena pancaran laser berputar!';
        else reasonMsg = '🧱 Terhempap blok siling!';
      }

      if (activeQ) {
        setFeedback({
          type: reason === 'TIMEOUT' ? 'TIMEOUT' : 'WRONG',
          question: activeQ,
          selectedOption: extra?.optionIndex !== undefined ? ['A', 'B', 'C'][extra.optionIndex] : undefined,
          pointsChange: -10,
          message: `♾️ [Nyawa Infiniti] ${reasonMsg} (-10 Mata). Dihantar semula ke titik permulaan ${spTitle}.`,
          revealCorrectAnswer: isIncorrectAnswer, // ONLY TRUE on submitted incorrect answer!
          timestamp: Date.now()
        });
      }

      const feedbackDuration = isIncorrectAnswer ? 3500 : 2000;
      const teleportDelay = isIncorrectAnswer ? 1200 : 200;

      // Teleport player back to current station start
      setTimeout(() => {
        setTeleportTarget(new THREE.Vector3(respawnPoint.x, respawnPoint.y, respawnPoint.z));
        setTimeout(() => setTeleportTarget(null), 150);
      }, teleportDelay);

      setTimeout(() => {
        setFeedback(null);
        setWaitingForSpIsland(null);
        setStation4BridgeUnlocked(false);
        setCurrentQIndex(spStartIdx);
        setQuestionTimer(25.0);
        lastWarnSecRef.current = -1;
        isFailureLockedRef.current = false;
      }, feedbackDuration);
    },
    [currentQIndex, questions, screen]
  );

  const handleHazardCollision = useCallback(
    (hazardType: string, station: string) => {
      handleFailure('HAZARD', { hazardType, station });
    },
    [handleFailure]
  );

  // Question 25-second countdown & Race timer
  useEffect(() => {
    if (screen !== 'PLAYING') return;

    const interval = setInterval(() => {
      if (raceStarted) {
        setRaceTime(prev => prev + 1);
      }

      setQuestionTimer(prev => {
        // Countdown only runs when race is started, no feedback showing, not waiting for SP island, within questions, and not crossing station 4 crumbling bridge
        if (!raceStarted || waitingForSpIsland !== null || feedback !== null || currentQIndex >= 16 || station4BridgeUnlocked) {
          return prev;
        }

        const next = Math.max(0, prev - 1);

        if (next <= 6 && next > 0 && Math.floor(next) !== lastWarnSecRef.current) {
          lastWarnSecRef.current = Math.floor(next);
          soundManager.playWarning();
        }

        // Question Timeout
        if (next <= 0) {
          handleFailure('TIMEOUT');
        }

        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [screen, raceStarted, waitingForSpIsland, feedback, currentQIndex, station4BridgeUnlocked, handleFailure]);

  // Handle 3D Answer selection (Gate / Floor / Switch)
  const handleAnswerSelected = useCallback((optionIndex: number) => {
    if (feedback !== null || currentQIndex >= 16 || screen !== 'PLAYING' || !raceStarted) return;

    const activeQ = questions[currentQIndex];
    if (!activeQ) return;

    const isCorrect = optionIndex === activeQ.correctIndex;

    const isFirstTimeAttempt = !attemptedQuestionsRef.current.has(currentQIndex);
    // Mark as attempted in this session immediately
    attemptedQuestionsRef.current.add(currentQIndex);

    if (isCorrect) {
      // Markah betul sentiasa bertambah +100 mata walaupun mengulang semula stesen
      const pointsChange = 100;

      soundManager.playCorrect();
      setScore(s => s + pointsChange);
      correctlyAnsweredQuestionsRef.current.add(currentQIndex);
      setCorrectCount(Math.min(16, correctlyAnsweredQuestionsRef.current.size));

      if (activeQ.spCode === 'SP 4.4.4') {
        // Station 4: Unlock Crumbling Bridge!
        setStation4BridgeUnlocked(true);
        const feedbackData: QuestionFeedback = {
          type: 'CORRECT',
          question: activeQ,
          selectedOption: ['A', 'B', 'C'][optionIndex],
          pointsChange: pointsChange,
          revealCorrectAnswer: false,
          message: '🎉 Jawapan Tepat! (+100 Mata). Halangan Jambatan Runtuh telah dibuka! Seberangi jambatan ke pulau seberang!',
          timestamp: Date.now()
        };
        setFeedback(feedbackData);
        setTimeout(() => {
          setFeedback(null);
        }, 1800);
        return;
      }

      const isEndOfP1 = currentQIndex === 3;
      const isEndOfP2 = currentQIndex === 7;
      const isEndOfP3 = currentQIndex === 11;

      const nextSpWaiting = isEndOfP1
        ? 'Pusingan 2'
        : isEndOfP2
        ? 'Pusingan 3'
        : isEndOfP3
        ? 'Pusingan 4'
        : null;

      const pusinganNum = currentQIndex < 4 ? 1 : currentQIndex < 8 ? 2 : 3;

      const feedbackData: QuestionFeedback = {
        type: 'CORRECT',
        question: activeQ,
        selectedOption: ['A', 'B', 'C'][optionIndex],
        pointsChange: pointsChange,
        revealCorrectAnswer: false,
        message: nextSpWaiting
          ? `🎉 Tahniah! Selesai Pusingan ${pusinganNum}! Teruskan melintasi jambatan ke Platform Permulaan ${nextSpWaiting} di hadapan!`
          : 'Tahniah! Jawapan tepat (+100 Mata). Teruskan melompat/berjalan ke hadapan!',
        timestamp: Date.now()
      };
      setFeedback(feedbackData);

      // Pemain tidak diteleport, boleh terus melintas
      setTimeout(() => {
        setFeedback(null);
        setCurrentQIndex(q => Math.min(q + 1, 16));
        setQuestionTimer(25.0);
        lastWarnSecRef.current = -1;
        if (nextSpWaiting) {
          setWaitingForSpIsland(nextSpWaiting);
        }
      }, 1500);
    } else {
      // JAWAPAN SALAH: 1 nyawa ditolak, dihantar semula ke starting point
      handleFailure('WRONG', { optionIndex });
    }
  }, [currentQIndex, feedback, questions, screen, raceStarted, handleFailure]);

  // Crumbling Bridge in Station 4 completed
  const handleBridgeCompleted = useCallback((qIndex: number) => {
    if (screen !== 'PLAYING' || !raceStarted) return;
    soundManager.playCheckpoint();
    setStation4BridgeUnlocked(false);

    if (qIndex >= 15) {
      // Selesai Soalan 16 & Station 4
      setCurrentQIndex(16);
    } else {
      setCurrentQIndex(qIndex + 1);
      setQuestionTimer(25.0);
      lastWarnSecRef.current = -1;
    }
  }, [screen, raceStarted]);

  // Physical Fall (Respawn at current Pusingan Starting Point and restart from the first question of that Pusingan)
  const handleFallRespawn = useCallback(() => {
    handleFailure('FALL');
  }, [handleFailure]);

  // Finish Line Reached
  const handleFinishReached = useCallback(() => {
    if (screen !== 'PLAYING') return;

    soundManager.playVictory();
    setScreen('VICTORY');

    setScore(currentScore => {
      setBestScore(prevBest => {
        const newBest = Math.max(prevBest, currentScore);
        try {
          localStorage.setItem('math_obby_best_score', newBest.toString());
        } catch {
          // ignore
        }
        return newBest;
      });
      return currentScore;
    });

    setRaceTime(currentTime => {
      setBestTime(prevBestTime => {
        const newBestTime = prevBestTime === 0 ? currentTime : Math.min(prevBestTime, currentTime);
        try {
          localStorage.setItem('math_obby_best_time', newBestTime.toString());
        } catch {
          // ignore
        }
        return newBestTime;
      });
      return currentTime;
    });
  }, [screen]);

  // Keyboard shortcut for Pause (Escape)
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        if (screen === 'PLAYING') {
          setScreen('PAUSED');
        } else if (screen === 'PAUSED') {
          setScreen('PLAYING');
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [screen]);

  const getAchievementRank = (wrongs: number, fails: number, isFinished: boolean) => {
    if (!isFinished) return 'ROOKIE EXPLORER';
    if (wrongs === 0 && fails <= 1) return 'PLATINUM RUNNER';
    if (wrongs <= 2 && fails <= 3) return 'GOLD RUNNER';
    if (wrongs <= 4) return 'SILVER RUNNER';
    return 'BRONZE EXPLORER';
  };

  const stationsCompletedCount = screen === 'VICTORY'
    ? 4
    : Math.min(4, Math.floor(currentQIndex / 4));

  const lastStationName = currentQIndex >= 12
    ? 'Pusingan 4 (SP 4.4.4)'
    : currentQIndex >= 8
    ? 'Pusingan 3 (SP 4.4.3)'
    : currentQIndex >= 4
    ? 'Pusingan 2 (SP 4.4.2)'
    : 'Pusingan 1 (SP 4.4.1)';

  const stats: GameStats = {
    score,
    totalTime: raceTime,
    correctCount: Math.min(16, correctCount),
    wrongCount,
    obstacleFails,
    timeoutCount,
    livesRemaining: '∞',
    livesLost: 0,
    stationsCompleted: stationsCompletedCount,
    lastStationReached: lastStationName,
    achievementRank: getAchievementRank(wrongCount, obstacleFails, screen === 'VICTORY'),
    bestScore,
    bestTime
  };

  const currentQ = questions[currentQIndex];

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
      {/* 3D VIEWPORT */}
      <GameCanvas
        questions={questions}
        currentQuestionIndex={currentQIndex}
        isPaused={screen !== 'PLAYING'}
        raceStarted={raceStarted}
        teleportTarget={teleportTarget}
        isShocking={isShocking}
        externalBoost={isBoostActive}
        externalJump={isJumpActive}
        onStartGatePassed={handleStartGatePassed}
        onSpIslandReached={handleSpIslandReached}
        onAnswerSelected={handleAnswerSelected}
        onBridgeCompleted={handleBridgeCompleted}
        onFinishReached={handleFinishReached}
        onFallRespawn={handleFallRespawn}
        onHazardCollision={handleHazardCollision}
        touchInput={touchInput}
      />

      {/* COMPACT HUD OVERLAY & ACTION DOCK */}
      {screen === 'PLAYING' && (
        <>
          <HUD
            currentQuestion={currentQ}
            questionIndex={currentQIndex}
            totalQuestions={questions.length || 16}
            score={score}
            raceTime={raceTime}
            timeLeft={questionTimer}
            lives={lives}
            feedback={feedback}
            isMuted={isMuted}
            raceStarted={raceStarted}
            waitingForSpIsland={waitingForSpIsland}
            isBridgeUnlocked={station4BridgeUnlocked}
            isBoostActive={isBoostActive}
            onBoostDown={() => setIsBoostActive(true)}
            onBoostUp={() => setIsBoostActive(false)}
            onJumpDown={() => {
              setIsJumpActive(true);
              setTimeout(() => setIsJumpActive(false), 120);
            }}
            onJumpUp={() => setIsJumpActive(false)}
            onToggleMute={handleToggleMute}
            onPause={() => setScreen('PAUSED')}
          />
          <MobileControls onUpdateInput={setTouchInput} />
        </>
      )}

      {/* MAIN MENU */}
      {screen === 'MENU' && (
        <MainMenu
          onStart={startNewGame}
          onOpenGuide={() => setGuideOpen(true)}
          bestScore={bestScore}
          bestTime={bestTime}
        />
      )}


{/* PAUSE MENU */}
{screen === 'PAUSED' && (
  <PauseMenu
    onResume={() => setScreen('PLAYING')}
    onRestart={startNewGame}
    onMainMenu={() => setScreen('MENU')}
    onExit={() => setScreen('GAMEOVER')}
    isMuted={isMuted}
    onToggleMute={handleToggleMute}
    score={score}
    elapsedTime={raceTime}
    currentStation={lastStationName}
    questionsAnswered={correctCount + wrongCount + timeoutCount}
    correctAnswers={correctCount}
    incorrectAnswers={wrongCount + timeoutCount}
  />
)}


      {/* VICTORY RESULTS */}
      {screen === 'VICTORY' && (
        <VictoryScreen
          stats={stats}
          onPlayAgain={startNewGame}
          onMainMenu={() => setScreen('MENU')}
        />
      )}

      {/* GAME OVER RESULTS */}
      {screen === 'GAMEOVER' && (
        <GameOverScreen
          stats={stats}
          onRestart={startNewGame}
          onMainMenu={() => setScreen('MENU')}
        />
      )}

      {/* DSKP CURRICULUM GUIDE MODAL */}
      {guideOpen && <GuideModal onClose={() => setGuideOpen(false)} />}
    </div>
  );
}
