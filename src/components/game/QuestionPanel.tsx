import { AnimatePresence, motion } from "framer-motion";
import type { Question } from "@/game/types";

interface Props {
  q: Question; index: number; total: number;
  answered: null | { choice: number; ok: boolean };
  onAnswer: (i: number) => void; onNext: () => void;
}

export function QuestionPanel({ q, index, total, answered, onAnswer, onNext }: Props) {
  return (
    <motion.section key={q.id} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -24 }} transition={{ duration: 0.45 }}
      className="glass relative w-full max-w-3xl p-5 sm:p-8">
      <div className="mb-4 flex items-center justify-between font-mono text-[10px] tracking-[0.3em] text-muted-foreground">
        <span>CHALLENGE {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}</span>
        <span className="text-steel">{q.concept.toUpperCase()}</span>
      </div>
      <h2 className="text-lg font-semibold sm:text-xl">{q.prompt}</h2>

      {q.given && (
        <div className="mt-4 flex flex-wrap gap-2">
          {q.given.map((g) => <span key={g} className="border border-steel/50 bg-steel/10 px-3 py-1 font-mono text-sm">{g}</span>)}
        </div>
      )}
      {q.expr && <div className="mt-5 border-y border-border py-4 text-center font-mono text-3xl tracking-wider text-neon sm:text-4xl">{q.expr}</div>}
      {q.pair && (
        <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <div className="border border-border bg-void/60 p-4 text-center font-mono text-xl sm:text-2xl"><div className="mb-1 text-[9px] tracking-[0.3em] text-muted-foreground">WALL A</div>{q.pair[0]}</div>
          <div className={`font-mono text-2xl ${answered ? (answered.ok ? "text-success" : "text-signal") : "text-muted-foreground"}`}>≡ ?</div>
          <div className="border border-border bg-void/60 p-4 text-center font-mono text-xl sm:text-2xl"><div className="mb-1 text-[9px] tracking-[0.3em] text-muted-foreground">WALL B</div>{q.pair[1]}</div>
        </div>
      )}
      {q.premises && (
        <ol className="mt-5 space-y-1 border-l-2 border-signal/60 pl-4 font-mono">
          {q.premises.map((p, i) => <li key={i} className={p.startsWith("∴") ? "text-neon" : ""}>{!p.startsWith("∴") && <span className="mr-2 text-muted-foreground">{i + 1}.</span>}{p}</li>)}
          {!q.premises.some((p) => p.startsWith("∴")) && <li className="text-muted-foreground">∴ ?</li>}
        </ol>
      )}

      <div className={`mt-6 grid gap-2 ${q.options.length === 2 ? "grid-cols-2" : "sm:grid-cols-2"}`}>
        {q.options.map((o, i) => {
          const isAns = answered && i === q.answer;
          const isWrongPick = answered && i === answered.choice && !answered.ok;
          return (
            <motion.button key={i} disabled={!!answered} onClick={() => onAnswer(i)} whileHover={answered ? {} : { x: 4 }}
              className={`group flex items-center gap-3 border px-4 py-3 text-left font-mono text-sm transition-colors ${isAns ? "border-success bg-success/15 text-success" : isWrongPick ? "border-signal bg-signal/15 text-signal" : "border-border hover:border-foreground/60 hover:bg-foreground/5"} disabled:cursor-default`}>
              <span className="text-[10px] text-muted-foreground group-hover:text-foreground">{String.fromCharCode(65 + i)}</span>
              {o}
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {answered && <Feedback q={q} ok={answered.ok} onNext={onNext} last={index + 1 === total} />}
      </AnimatePresence>
    </motion.section>
  );
}

function Feedback({ q, ok, onNext, last }: { q: Question; ok: boolean; onNext: () => void; last: boolean }) {
  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="overflow-hidden">
      <div className={`mt-6 border-t pt-5 ${ok ? "border-success/40" : "border-signal/40"}`}>
        <div className={`font-display text-2xl font-bold tracking-[0.3em] ${ok ? "text-success" : "text-signal"}`}>{ok ? "CORRECT" : "INCORRECT"}</div>
        <div className="mt-4 font-mono text-[10px] tracking-[0.3em] text-muted-foreground">WHY?</div>
        <ol className="mt-2 space-y-1.5 font-mono text-sm">
          {q.steps.map((s, i) => (
            <motion.li key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 + i * 0.12 }} className="flex gap-2">
              <span className="text-muted-foreground">{i + 1}.</span><span>{s}</span>
            </motion.li>
          ))}
        </ol>
        {q.chain && (
          <div className="mt-4 flex flex-col items-center gap-1 border border-border bg-void/50 p-3 text-center font-mono text-sm">
            <span className="text-[9px] tracking-[0.3em] text-muted-foreground">PREMISE</span>
            <span>{q.chain.premise.join("   ·   ")}</span>
            <span className="text-muted-foreground">↓</span>
            <span className="text-[9px] tracking-[0.3em] text-muted-foreground">RULE</span>
            <span className="text-steel">{q.chain.rule}</span>
            <span className="text-muted-foreground">↓</span>
            <span className="text-[9px] tracking-[0.3em] text-muted-foreground">CONCLUSION</span>
            <span className="text-neon">{q.chain.conclusion}</span>
          </div>
        )}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="font-mono text-xs"><span className="tracking-[0.3em] text-muted-foreground">CONCEPT: </span>{q.concept}</div>
          <button onClick={onNext} className="bg-foreground px-5 py-2 font-mono text-xs font-bold tracking-[0.3em] text-background hover:bg-neon">
            {last ? "SUBMIT RESULTS ▸" : "CONTINUE ▸"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
