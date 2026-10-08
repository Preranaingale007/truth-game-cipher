import { createContext, useContext, useEffect, useReducer, useState, type Dispatch, type ReactNode } from "react";
import { LEVELS } from "./questions";
import type { GameState } from "./types";

const KEY = "logic-games-047-v1";

export const initialState: GameState = {
  phase: "boot", level: 0, qIndex: 0, score: 0, correct: 0, mistakes: 0, threat: 1,
  timeLeft: LEVELS[0]!.timeLimit, streak: 0, levelCorrect: 0, levelMistakes: 0, answered: null, wrongPulse: 0,
};

export type Action =
  | { type: "NEW" } | { type: "RESUME"; state: GameState } | { type: "INTRO_DONE" } | { type: "BEGIN_LEVEL" }
  | { type: "ANSWER"; choice: number } | { type: "NEXT" } | { type: "TICK" } | { type: "RETRY" }
  | { type: "LEVEL_NEXT" } | { type: "RESET" };

const levelReset = (s: GameState, level: number): GameState => ({
  ...s, level, qIndex: 0, levelCorrect: 0, levelMistakes: 0, answered: null, streak: 0,
  timeLeft: LEVELS[level]!.timeLimit, threat: Math.max(1, s.threat - 2), failReason: undefined,
});

export function reducer(s: GameState, a: Action): GameState {
  switch (a.type) {
    case "NEW": return { ...initialState, phase: "intro" };
    case "RESUME": return { ...a.state, answered: null, phase: a.state.phase === "playing" ? "levelIntro" : a.state.phase };
    case "INTRO_DONE": return { ...s, phase: "levelIntro" };
    case "BEGIN_LEVEL": return { ...levelReset(s, s.level), threat: s.threat, phase: "playing" };
    case "ANSWER": {
      if (s.answered || s.phase !== "playing") return s;
      const q = LEVELS[s.level]!.questions[s.qIndex]!;
      const ok = a.choice === q.answer;
      return ok
        ? { ...s, answered: { choice: a.choice, ok }, correct: s.correct + 1, levelCorrect: s.levelCorrect + 1, streak: s.streak + 1, score: s.score + 100 + s.streak * 25 + Math.floor(s.timeLeft / 10) }
        : { ...s, answered: { choice: a.choice, ok }, mistakes: s.mistakes + 1, levelMistakes: s.levelMistakes + 1, streak: 0, threat: Math.min(5, s.threat + 1), timeLeft: Math.max(1, s.timeLeft - 15), wrongPulse: s.wrongPulse + 1 };
    }
    case "NEXT": {
      const L = LEVELS[s.level]!;
      if (s.qIndex + 1 < L.questions.length) return { ...s, qIndex: s.qIndex + 1, answered: null };
      return s.levelCorrect >= L.required ? { ...s, answered: null, phase: "levelComplete" } : { ...s, answered: null, phase: "levelFailed", failReason: "score" };
    }
    case "TICK":
      if (s.phase !== "playing" || s.answered) return s;
      return s.timeLeft <= 1 ? { ...s, timeLeft: 0, phase: "levelFailed", failReason: "time" } : { ...s, timeLeft: s.timeLeft - 1 };
    case "RETRY": return { ...levelReset(s, s.level), phase: "playing" };
    case "LEVEL_NEXT": return s.level < LEVELS.length - 1 ? { ...levelReset(s, s.level + 1), phase: "levelIntro" } : { ...s, phase: "ending" };
    case "RESET": return { ...initialState };
  }
}

const Ctx = createContext<{ state: GameState; dispatch: Dispatch<Action>; saved: GameState | null } | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [saved, setSaved] = useState<GameState | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) { const p = JSON.parse(raw) as GameState; if (p.phase !== "boot" && p.phase !== "ending") setSaved(p); }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (state.phase === "boot") return;
    if (state.phase === "ending") localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, JSON.stringify(state));
  }, [state]);

  return <Ctx.Provider value={{ state, dispatch, saved }}>{children}</Ctx.Provider>;
}

export function useGame() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useGame outside provider");
  return c;
}

/** Countdown: ticks faster as threat rises. */
export function useCountdown() {
  const { state, dispatch } = useGame();
  const running = state.phase === "playing" && !state.answered;
  const interval = 1000 - (state.threat - 1) * 90;
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => dispatch({ type: "TICK" }), interval);
    return () => clearInterval(id);
  }, [running, interval, dispatch]);
}
