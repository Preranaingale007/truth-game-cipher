import { motion } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";

export function Sigil({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="3">
      <circle cx="50" cy="50" r="42" />
      <polygon points="50,20 78,68 22,68" />
      <line x1="14" y1="84" x2="86" y2="84" />
    </svg>
  );
}

export function Glyph({ kind, className = "" }: { kind: number; className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} fill="none" stroke="currentColor" strokeWidth="2.5">
      {kind === 0 && <circle cx="20" cy="20" r="13" />}
      {kind === 1 && <line x1="6" y1="20" x2="34" y2="20" />}
      {kind === 2 && <polygon points="20,7 33,31 7,31" />}
      {kind === 3 && (<><circle cx="20" cy="20" r="14" /><line x1="6" y1="20" x2="34" y2="20" /></>)}
    </svg>
  );
}

export function Atmosphere({ dust = 28 }: { dust?: number }) {
  const [seeds, setSeeds] = useState<{ l: number; d: number; delay: number; s: number }[]>([]);
  useEffect(() => {
    setSeeds(Array.from({ length: dust }, () => ({ l: Math.random() * 100, d: 14 + Math.random() * 18, delay: -Math.random() * 30, s: 1 + Math.random() * 2 })));
  }, [dust]);
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="fog absolute -inset-x-1/4 bottom-0 h-1/2 bg-gradient-to-t from-foreground/10 via-foreground/5 to-transparent blur-2xl" />
      {seeds.map((p, i) => (
        <span key={i} className="dust absolute rounded-full bg-foreground/50" style={{ left: `${p.l}%`, bottom: "-10px", width: p.s, height: p.s, animationDuration: `${p.d}s`, animationDelay: `${p.delay}s` }} />
      ))}
      <div className="vignette absolute inset-0" />
    </div>
  );
}

export function Camera({ side, threat, alert }: { side: "left" | "right"; threat: number; alert: boolean }) {
  const dur = threat >= 4 ? 1.6 : 5;
  const flip = side === "right" ? -1 : 1;
  return (
    <div className={`absolute top-16 ${side === "left" ? "left-4" : "right-4"} z-10 hidden sm:block`} style={{ transform: `scaleX(${flip})` }}>
      <div className="h-6 w-1.5 translate-x-3 bg-muted-foreground/40" />
      <motion.svg
        width="56" height="34" viewBox="0 0 56 34" className="origin-left text-muted-foreground"
        animate={alert ? { rotate: 32 } : { rotate: [-10, 30, -10] }}
        transition={alert ? { duration: 0.3 } : { duration: dur, repeat: Infinity, ease: "easeInOut" }}
      >
        <rect x="4" y="6" width="38" height="20" rx="2" fill="currentColor" opacity="0.5" />
        <rect x="42" y="10" width="10" height="12" fill="currentColor" opacity="0.7" />
        <circle cx="12" cy="16" r="2.5" className={threat >= 3 || alert ? "fill-signal pulse-red" : "fill-steel"} />
      </motion.svg>
    </div>
  );
}

export function WarningLights({ on }: { on: boolean }) {
  if (!on) return null;
  return (
    <div className="pointer-events-none absolute inset-0 z-0">
      <div className="pulse-red absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--signal)_0%,transparent_55%)] opacity-40" />
      <div className="pulse-red absolute inset-x-0 top-0 h-1 bg-signal" />
      <div className="pulse-red absolute inset-x-0 bottom-0 h-1 bg-signal" />
    </div>
  );
}

/** Plays a list of timed beats, then calls onDone. */
export function Sequence({ beats, onDone }: { beats: { node: ReactNode; ms: number }[]; onDone: () => void }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (i >= beats.length) { onDone(); return; }
    const t = setTimeout(() => setI(i + 1), beats[i]!.ms);
    return () => clearTimeout(t);
  }, [i, beats, onDone]);
  return (
    <>
      {beats[Math.min(i, beats.length - 1)]!.node}
      <button onClick={onDone} className="fixed bottom-5 right-5 z-50 font-mono text-[10px] tracking-[0.3em] text-muted-foreground hover:text-foreground">SKIP ▸▸</button>
    </>
  );
}

export function Typed({ text, className = "" }: { text: string; className?: string }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    setN(0);
    const id = setInterval(() => setN((v) => (v >= text.length ? v : v + 1)), 35);
    return () => clearInterval(id);
  }, [text]);
  return <span className={className}>{text.slice(0, n)}<span className="animate-pulse">▌</span></span>;
}
