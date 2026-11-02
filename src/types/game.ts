export interface Question {
  id: number;
  spCode: 'SP 4.4.1' | 'SP 4.4.2' | 'SP 4.4.3' | 'SP 4.4.4';
  topic: string;
  question: string;
  options: [string, string, string];
  correctIndex: number; // 0, 1, or 2
  explanation: string;
  hint?: string;
}

export type GameScreen = 'MENU' | 'PLAYING' | 'PAUSED' | 'VICTORY' | 'GAMEOVER';

export interface GameStats {
  score: number;
  totalTime: number; // in seconds
  correctCount: number;
  wrongCount: number; // Soalan salah sahaja (tidak termasuk gagal halangan)
  obstacleFails: number; // Gagal halangan obby (jatuh / hazard)
  timeoutCount: number;
  livesRemaining: number | string; // '∞' Nyawa Infiniti
  livesLost: number;
  stationsCompleted: number;
  lastStationReached: string;
  achievementRank: string;
  bestScore: number;
  bestTime: number;
}

export interface QuestionFeedback {
  type: 'CORRECT' | 'WRONG' | 'TIMEOUT';
  question: Question;
  selectedOption?: string;
  pointsChange: number;
  message: string;
  revealCorrectAnswer?: boolean;
  timestamp: number;
}
