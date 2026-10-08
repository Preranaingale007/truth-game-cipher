import { motion } from "framer-motion";
import { useState } from "react";
import { toggleMute } from "@/game/audio";
import { LEVELS } from "@/game/questions";
import type { GameState } from "@/game/types";
import { Sigil } from "./Visuals";

export function formatTime(s: number) {
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

export function Countdown({ seconds, paused }: { seconds: number; paused: boolean }) {
  const low = seconds <= 30;
  return (
    <div className="text-center">
      <motion.div key={low ? seconds : "n"} initial={low ? { scale: 1.15 } : false} animate={{ scale: 1 }}
        className={`font-mono text-2xl font-bold tabular-nums sm:text-3xl ${low ? "text-signal text-glow" : paused ? "text-neon" : "text-foreground"}`}>
        {formatTime(seconds)}
      </motion.div>
      <div className={`font-mono text-[9px] tracking-[0.3em] ${low ? "pulse-red text-signal" : "text-muted-foreground"}`}>
        {low ? "⚠ WARNING" : paused ? "PAUSED" : "TIME REMAINING"}
      </div>
    </div>
  );
}

function Stat({ label, value, tone = "" }: { label: string; value: string | number; tone?: string }) {
  return (
    <div className="min-w-0">
      <div className="font-mono text-[9px] tracking-[0.25em] text-muted-foreground">{label}</div>
      <div className={`font-mono text-sm font-semibold tabular-nums sm:text-base ${tone}`}>{value}</div>
    </div>
  );
}

export function Hud({ s }: { s: GameState }) {
  const [muted, setMuted] = useState(false);
  const L = LEVELS[s.level]!;
  return (
    <header className="relative z-20 border-b border-border bg-void/70 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Sigil className="h-7 w-7 text-signal" />
          <div>
            <div className="font-mono text-[9px] tracking-[0.3em] text-muted-foreground">PLAYER</div>
            <div className="font-display text-lg font-bold leading-none tracking-widest">047</div>
          </div>
        </div>
        <Stat label="CURRENT GAME" value={`${L.code.replace("GAME ", "")} · ${L.title}`} />
        <div className="order-last flex w-full justify-between gap-4 sm:order-none sm:w-auto sm:gap-6">
          <Stat label="SCORE" value={s.score} />
          <Stat label="CORRECT" value={s.correct} tone="text-success" />
          <Stat label="MISTAKES" value={s.mistakes} tone="text-signal" />
          <div>
            <div className="font-mono text-[9px] tracking-[0.25em] text-muted-foreground">THREAT</div>
            <div className="mt-1 flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <span key={n} className={`h-3 w-2.5 ${n <= s.threat ? (s.threat >= 4 ? "bg-signal pulse-red" : "bg-signal") : "bg-muted"}`} />
              ))}
            </div>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <Countdown seconds={s.timeLeft} paused={!!s.answered} />
          <button onClick={() => setMuted(toggleMute())} className="font-mono text-[10px] tracking-widest text-muted-foreground hover:text-foreground" aria-label="Toggle sound">
            {muted ? "SND OFF" : "SND ON"}
          </button>
        </div>
      </div>
      <div className="h-0.5 bg-muted">
        <motion.div className="h-full bg-steel" animate={{ width: `${(s.qIndex / L.questions.length) * 100}%` }} />
      </div>
    </header>
  );
}
