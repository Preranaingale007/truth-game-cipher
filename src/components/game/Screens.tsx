import { motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import hall from "@/assets/hall.jpg";
import { blip, startAudio } from "@/game/audio";
import { useGame } from "@/game/engine";
import { LEVELS } from "@/game/questions";
import { ENV_IMG } from "./Environment";
import { HostScreen } from "./Host";
import { formatTime } from "./Hud";
import { Atmosphere, Camera, Glyph, Sequence, Sigil } from "./Visuals";

const Center = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <div className={`relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-void px-6 text-center ${className}`}>{children}</div>
);
const Term = ({ t }: { t: string }) => (
  <Center><motion.p key={t} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-mono text-sm tracking-[0.4em] text-foreground sm:text-lg">{t}<span className="animate-pulse">_</span></motion.p></Center>
);
const HostBeat = ({ line }: { line: string }) => (
  <Center><img src={hall} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" /><Atmosphere /><div className="relative"><HostScreen big line={line} /></div></Center>
);

export function Boot() {
  const { dispatch, saved } = useGame();
  return (
    <Center>
      <img src={hall} alt="" width={1920} height={1088} className="absolute inset-0 h-full w-full object-cover opacity-25" />
      <Atmosphere />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.5 }} className="relative">
        <Sigil className="mx-auto mb-6 h-16 w-16 text-signal" />
        <h1 className="font-display text-5xl font-bold tracking-[0.2em] sm:text-7xl">THE LOGIC GAMES</h1>
        <p className="mt-4 font-mono text-sm tracking-[0.3em] text-muted-foreground">"Think carefully. Every answer matters."</p>
        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <button onClick={() => { startAudio(); dispatch({ type: "NEW" }); }} className="glow-signal bg-primary px-8 py-3 font-mono text-sm font-bold tracking-[0.3em] text-primary-foreground hover:brightness-125">
            {saved ? "NEW SESSION" : "ENTER THE GAMES"}
          </button>
          {saved && (
            <button onClick={() => { startAudio(); dispatch({ type: "RESUME", state: saved }); }} className="border border-foreground/50 px-8 py-3 font-mono text-sm tracking-[0.3em] hover:bg-foreground/10">
              CONTINUE · {LEVELS[saved.level]!.code}
            </button>
          )}
        </div>
        <p className="mt-10 font-mono text-[10px] tracking-[0.3em] text-muted-foreground">DISCRETE MATHEMATICS · 4 GAMES · 30 CHALLENGES · SOUND RECOMMENDED</p>
      </motion.div>
    </Center>
  );
}

function RoomReveal({ lit }: { lit: boolean }) {
  const [t, setT] = useState(5999);
  useEffect(() => { const id = setInterval(() => setT((v) => v - 1), 1000); return () => clearInterval(id); }, []);
  return (
    <Center>
      <motion.img src={hall} alt="" className="absolute inset-0 h-full w-full object-cover"
        initial={{ opacity: 0, scale: 1.25 }} animate={{ opacity: lit ? 1 : 0.3, scale: lit ? 1.05 : 1.15 }} transition={{ duration: lit ? 0.3 : 4 }} />
      {lit && <motion.div initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ duration: 1 }} className="absolute inset-0 bg-foreground" />}
      <Camera side="left" threat={2} alert={false} /><Camera side="right" threat={2} alert={false} />
      <Atmosphere />
      <div className="relative font-mono text-5xl font-bold tabular-nums text-signal text-glow sm:text-7xl">{formatTime(t % 6000).replace(":", " : ")}</div>
    </Center>
  );
}

export function Intro() {
  const { dispatch } = useGame();
  const done = useCallback(() => dispatch({ type: "INTRO_DONE" }), [dispatch]);
  const beats = useMemo(() => [
    { node: <Center>{null}</Center>, ms: 1500 },
    { node: <Term t="CONNECTION ESTABLISHED..." />, ms: 2600 },
    { node: <Term t="PLAYER ID: 047" />, ms: 2400 },
    { node: <Term t="MEMORY STATUS: UNKNOWN" />, ms: 2600 },
    { node: <RoomReveal lit={false} />, ms: 4200 },
    { node: <RoomReveal lit />, ms: 1600 },
    ...["Welcome, Player 047.", "You have been selected for the Logic Games.", "Four games.", "Four doors.", "One way out.", "Your greatest enemy is not the clock.", "It is your own reasoning."]
      .map((l, i) => ({ node: <HostBeat key={i} line={l} />, ms: 1200 + l.length * 55 })),
    { node: <Center>{null}</Center>, ms: 1400 },
    { node: <Center><motion.h2 initial={{ opacity: 0, letterSpacing: "1em" }} animate={{ opacity: 1, letterSpacing: "0.3em" }} transition={{ duration: 1.5 }} className="font-display text-5xl font-bold sm:text-7xl">GAME 01</motion.h2></Center>, ms: 2400 },
  ], []);
  return <Sequence beats={beats} onDone={done} />;
}

export function LevelIntro() {
  const { state, dispatch } = useGame();
  const L = LEVELS[state.level]!;
  const [i, setI] = useState(0);
  useEffect(() => { if (i < L.hostIntro.length - 1) { const t = setTimeout(() => setI(i + 1), 2600); return () => clearTimeout(t); } return undefined; }, [i, L]);
  return (
    <Center>
      <motion.img src={ENV_IMG[L.env]} alt="" initial={{ scale: 1.2, opacity: 0 }} animate={{ scale: 1, opacity: 0.45 }} transition={{ duration: 3 }} className="absolute inset-0 h-full w-full object-cover" />
      <Atmosphere />
      <div className="relative">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-mono text-xs tracking-[0.5em] text-signal">{L.code}</motion.div>
        <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-2 font-display text-4xl font-bold tracking-[0.2em] sm:text-6xl">{L.title}</motion.h2>
        <p className="mt-2 font-mono text-sm tracking-[0.3em] text-steel">TOPIC · {L.topic.toUpperCase()}</p>
        <div className="mt-8"><HostScreen line={L.hostIntro[i]} /></div>
        <p className="mt-6 font-mono text-[11px] tracking-[0.2em] text-muted-foreground">{L.questions.length} CHALLENGES · {L.required} CORRECT TO UNLOCK · {formatTime(L.timeLimit)} ON THE CLOCK</p>
        <button onClick={() => { startAudio(); dispatch({ type: "BEGIN_LEVEL" }); }} className="glow-signal mt-6 bg-primary px-8 py-3 font-mono text-sm font-bold tracking-[0.3em] text-primary-foreground hover:brightness-125">BEGIN ▸</button>
      </div>
    </Center>
  );
}

export function LevelComplete() {
  const { state, dispatch } = useGame();
  const L = LEVELS[state.level]!;
  const [open, setOpen] = useState(false);
  useEffect(() => { const t = setTimeout(() => { setOpen(true); blip("open"); }, 1400); return () => clearTimeout(t); }, []);
  return (
    <Center>
      <img src={ENV_IMG[L.env]} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
      <div className="relative h-[55vh] w-[min(80vw,420px)] overflow-hidden border-2 border-steel/60 glow-neon">
        <motion.div animate={{ opacity: open ? 1 : 0 }} transition={{ duration: 1.5, delay: 0.8 }} className="absolute inset-0 bg-[radial-gradient(circle,var(--foreground)_0%,var(--neon)_40%,transparent_80%)]" />
        {[0, 1].map((side) => (
          <motion.div key={side} className={`absolute inset-y-0 w-1/2 border-steel/40 bg-gradient-to-b from-secondary to-void ${side ? "right-0 border-l" : "left-0 border-r"}`}
            animate={{ x: open ? (side ? "100%" : "-100%") : 0 }} transition={{ duration: 1.8, delay: 0.6, ease: [0.7, 0, 0.3, 1] }}>
            {[0.25, 0.5, 0.75].map((y) => (
              <motion.div key={y} className={`absolute h-6 w-6 rounded-full border-2 ${side ? "-left-3" : "-right-3"} ${open ? "border-success" : "border-signal"}`} style={{ top: `${y * 100}%` }}
                animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.5 }} />
            ))}
          </motion.div>
        ))}
      </div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.4 }} className="relative mt-8">
        <div className="font-mono text-xs tracking-[0.5em] text-success">LOCKS DISENGAGED</div>
        <h2 className="mt-2 font-display text-3xl font-bold tracking-[0.2em]">{L.code} COMPLETE</h2>
        <p className="mt-2 font-mono text-sm text-muted-foreground">{state.levelCorrect}/{L.questions.length} correct · score {state.score}</p>
        <button onClick={() => dispatch({ type: "LEVEL_NEXT" })} className="mt-6 bg-foreground px-8 py-3 font-mono text-sm font-bold tracking-[0.3em] text-background hover:bg-neon">
          {state.level < LEVELS.length - 1 ? "WALK THROUGH ▸" : "APPROACH THE EXIT ▸"}
        </button>
      </motion.div>
    </Center>
  );
}

export function LevelFailed() {
  const { state, dispatch } = useGame();
  const L = LEVELS[state.level]!;
  return (
    <Center className="glitch">
      <div className="pulse-red absolute inset-0 bg-[radial-gradient(circle,var(--signal)_0%,transparent_60%)] opacity-20" />
      <div className="relative">
        <div className="font-mono text-xs tracking-[0.5em] text-signal">{state.failReason === "time" ? "TIME EXPIRED" : "DOOR REMAINS SEALED"}</div>
        <h2 className="mt-2 font-display text-4xl font-bold tracking-[0.2em]">SESSION REWOUND</h2>
        <div className="mt-8"><HostScreen line="Perhaps you are not ready. Again." /></div>
        <p className="mt-6 font-mono text-sm text-muted-foreground">{state.levelCorrect}/{L.required} required correct answers in {L.code}.</p>
        <button onClick={() => dispatch({ type: "RETRY" })} className="mt-6 border border-signal px-8 py-3 font-mono text-sm tracking-[0.3em] text-signal hover:bg-signal hover:text-primary-foreground">RETRY {L.code}</button>
      </div>
    </Center>
  );
}

function Wall({ phase }: { phase: number }) {
  return (
    <Center>
      <div className="absolute inset-0 grid grid-cols-4 gap-1 p-1 sm:grid-cols-8">
        {Array.from({ length: 48 }).map((_, i) => (
          <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: (i % 13) * 0.05 }}
            className="scanlines relative flex items-center justify-center border border-steel/30 bg-secondary/40 font-mono text-[10px] text-steel sm:text-xs">PLAYER 047</motion.div>
        ))}
      </div>
      <div className="relative bg-void/90 px-8 py-6 font-mono">
        <div className="text-3xl font-bold tracking-[0.3em] sm:text-5xl">PLAYER 047</div>
        {phase >= 1 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 text-sm tracking-[0.3em]">STATUS: <span className="text-neon">EXPERIMENT COMPLETE</span></motion.div>}
        {phase >= 2 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 text-sm tracking-[0.3em]">LOGIC MODEL: <span className="text-success">SUCCESSFUL</span></motion.div>}
        {phase >= 3 && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 text-sm tracking-[0.3em] text-signal">NEW SESSION READY · PLAYER 048</motion.div>}
      </div>
    </Center>
  );
}

function Walk() {
  return (
    <Center>
      <motion.img src={hall} alt="" className="absolute inset-0 h-full w-full object-cover" initial={{ scale: 1 }} animate={{ scale: 1.6 }} transition={{ duration: 4.5, ease: "easeIn" }} />
      <motion.div className="absolute h-[40vh] w-[18vh] bg-foreground" initial={{ opacity: 0, scale: 0.3 }} animate={{ opacity: 0.9, scale: 1.4 }} transition={{ duration: 4.5 }} style={{ filter: "blur(8px)" }} />
      <p className="relative mt-[60vh] font-mono text-xs tracking-[0.5em] text-muted-foreground">EXIT · UNLOCKED</p>
    </Center>
  );
}

export function Ending() {
  const { state, dispatch } = useGame();
  const [finished, setFinished] = useState(false);
  const done = useCallback(() => setFinished(true), []);
  const beats = useMemo(() => [
    { node: <HostBeat line="CONGRATULATIONS, PLAYER 047." />, ms: 3000 },
    { node: <HostBeat line="You have successfully completed all four games." />, ms: 3800 },
    { node: <Walk />, ms: 4600 },
    { node: <Wall phase={0} />, ms: 2200 },
    { node: <Wall phase={1} />, ms: 2200 },
    { node: <Wall phase={2} />, ms: 2200 },
    { node: <Wall phase={3} />, ms: 3200 },
    { node: <Center>{null}</Center>, ms: 1500 },
    { node: <Term t='"THE GAMES WERE NEVER ABOUT ESCAPING."' />, ms: 3500 },
    { node: <Term t='"They were about finding someone capable of solving them."' />, ms: 4500 },
  ], []);
  if (!finished) return <Sequence beats={beats} onDone={done} />;
  return (
    <Center>
      <Atmosphere />
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} className="relative">
        <div className="mb-6 flex justify-center gap-4 text-signal">{[0, 1, 2].map((k) => <Glyph key={k} kind={k === 1 ? 2 : k} className="h-8 w-8" />)}</div>
        <h1 className="font-display text-5xl font-bold tracking-[0.2em] sm:text-7xl">THE LOGIC GAMES</h1>
        <p className="mt-4 font-mono tracking-[0.5em] text-steel">SESSION 002</p>
        <p className="mt-2 font-mono text-sm tracking-[0.5em] text-signal">COMING SOON</p>
        <div className="mx-auto mt-10 grid max-w-md grid-cols-3 gap-4 border-y border-border py-4 font-mono">
          <div><div className="text-[9px] tracking-widest text-muted-foreground">SCORE</div><div className="text-xl">{state.score}</div></div>
          <div><div className="text-[9px] tracking-widest text-muted-foreground">CORRECT</div><div className="text-xl text-success">{state.correct}</div></div>
          <div><div className="text-[9px] tracking-widest text-muted-foreground">MISTAKES</div><div className="text-xl text-signal">{state.mistakes}</div></div>
        </div>
        <button onClick={() => dispatch({ type: "RESET" })} className="mt-8 border border-foreground/50 px-8 py-3 font-mono text-sm tracking-[0.3em] hover:bg-foreground/10">PLAY AGAIN</button>
      </motion.div>
    </Center>
  );
}
