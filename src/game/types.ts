export interface Question {
  id: string;
  concept: string;
  prompt: string;
  given?: string[];
  expr?: string;
  pair?: [string, string];
  premises?: string[];
  options: string[];
  answer: number;
  steps: string[];
  chain?: { premise: string[]; rule: string; conclusion: string };
}

export type EnvKind = "doors" | "control" | "mirror" | "arena";

export interface Level {
  code: string;
  title: string;
  topic: string;
  env: EnvKind;
  timeLimit: number;
  required: number;
  hostIntro: string[];
  questions: Question[];
}

export type Phase = "boot" | "intro" | "levelIntro" | "playing" | "levelComplete" | "levelFailed" | "ending";

export interface GameState {
  phase: Phase;
  level: number;
  qIndex: number;
  score: number;
  correct: number;
  mistakes: number;
  threat: number;
  timeLeft: number;
  streak: number;
  levelCorrect: number;
  levelMistakes: number;
  answered: null | { choice: number; ok: boolean };
  failReason?: "time" | "score";
  wrongPulse: number;
}
