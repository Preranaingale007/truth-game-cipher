import { AnimatePresence, motion } from "framer-motion";
import { Typed } from "./Visuals";

/** The Host: an original faceless "Curator" — smooth ovoid head, single slit, inverted triangle sigil. */
export function HostFigure({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className}>
      <defs>
        <radialGradient id="hg" cx="50%" cy="35%" r="60%">
          <stop offset="0%" stopColor="var(--foreground)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="var(--foreground)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="200" height="200" fill="url(#hg)" />
      <path d="M20 200 C30 150 70 135 100 135 C130 135 170 150 180 200 Z" fill="var(--void)" />
      <ellipse cx="100" cy="82" rx="36" ry="46" fill="var(--void)" stroke="var(--foreground)" strokeOpacity="0.25" />
      <line x1="76" y1="78" x2="124" y2="78" stroke="var(--signal)" strokeWidth="3" className="pulse-red" />
      <polygon points="92,98 108,98 100,111" fill="none" stroke="var(--foreground)" strokeOpacity="0.5" strokeWidth="1.5" />
      <path d="M86 160 L100 150 L114 160" stroke="var(--signal)" strokeWidth="2" fill="none" />
    </svg>
  );
}

export function HostScreen({ line, big = false }: { line: string; big?: boolean }) {
  return (
    <div className={`relative mx-auto ${big ? "w-[min(92vw,640px)]" : "w-72"}`}>
      <div className="scanlines glass relative aspect-video overflow-hidden border-steel/40">
        <motion.div animate={{ x: [0, -3, 2, 0], opacity: [1, 0.85, 1] }} transition={{ duration: 0.4, repeat: Infinity, repeatDelay: 2.6 }} className="absolute inset-0">
          <HostFigure className="h-full w-full" />
        </motion.div>
        <div className="absolute left-2 top-2 flex items-center gap-1.5 font-mono text-[10px] tracking-widest text-signal">
          <span className="pulse-red h-1.5 w-1.5 rounded-full bg-signal" /> LIVE · FEED 00
        </div>
        <div className="absolute bottom-2 right-2 font-mono text-[10px] text-muted-foreground">SIGNAL ▒▒▒░</div>
      </div>
      <p className={`mt-4 text-center font-mono ${big ? "text-lg sm:text-2xl" : "text-sm"} tracking-wide text-foreground`}>
        <Typed text={`"${line}"`} />
      </p>
    </div>
  );
}

export function HostToast({ line }: { line: string | null }) {
  return (
    <AnimatePresence>
      {line && (
        <motion.div key={line} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }}
          className="fixed bottom-4 right-4 z-40 flex w-64 items-center gap-3 glass p-2 sm:top-24 sm:bottom-auto">
          <div className="scanlines relative h-14 w-16 shrink-0 overflow-hidden bg-void"><HostFigure className="h-full w-full" /></div>
          <div>
            <div className="font-mono text-[9px] tracking-[0.3em] text-signal">THE CURATOR</div>
            <div className="font-mono text-sm"><Typed text={line} /></div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function HostInterrupt({ show, onClose }: { show: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-void/95 p-6">
          <div className="glitch"><HostScreen big line="PLAYER 047. You are running out of chances." /></div>
          <button onClick={onClose} className="mt-8 border border-signal px-6 py-2 font-mono text-xs tracking-[0.3em] text-signal hover:bg-signal hover:text-primary-foreground">ACKNOWLEDGE</button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
