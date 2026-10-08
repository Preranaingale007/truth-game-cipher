import { AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { blip, setIntensity } from "@/game/audio";
import { useCountdown, useGame } from "@/game/engine";
import { LEVELS } from "@/game/questions";
import { Environment } from "./Environment";
import { HostInterrupt, HostToast } from "./Host";
import { Hud } from "./Hud";
import { QuestionPanel } from "./QuestionPanel";

export function Play() {
  const { state: s, dispatch } = useGame();
  useCountdown();
  const L = LEVELS[s.level]!;
  const q = L.questions[s.qIndex]!;
  const [host, setHost] = useState<string | null>(null);
  const [interrupt, setInterrupt] = useState(false);
  const [glitch, setGlitch] = useState(false);
  const [alert, setAlert] = useState(false);
  const interruptedRef = useRef(false);
  const low = s.timeLeft <= 30;

  useEffect(() => { setIntensity(s.threat + (low ? 2 : 0)); }, [s.threat, low]);
  useEffect(() => { if (low && s.timeLeft % 2 === 0) blip("tick"); }, [s.timeLeft, low]);

  useEffect(() => {
    if (!s.answered) return;
    let line: string | null = null;
    if (s.answered.ok) {
      blip("ok");
      if (s.streak === 3) line = "Interesting.";
      else if (s.streak === 5) line = "You are exceeding expectations.";
    } else {
      blip("bad");
      setGlitch(true); setAlert(true);
      setTimeout(() => setGlitch(false), 700);
      setTimeout(() => setAlert(false), 2500);
      line = s.levelMistakes >= 3 ? "Perhaps you are not ready." : "That was careless.";
      if (s.threat >= 5 && !interruptedRef.current) { interruptedRef.current = true; setTimeout(() => setInterrupt(true), 900); }
    }
    if (line) { setHost(line); const t = setTimeout(() => setHost(null), 3200); return () => clearTimeout(t); } return undefined;
  }, [s.answered]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={`relative flex min-h-screen flex-col bg-void ${low ? "ui-shake" : ""}`}>
      <Environment env={L.env} progress={s.levelCorrect / L.required} threat={s.threat} lowTime={low} alert={alert} />
      <Hud s={s} />
      <main className={`relative z-10 flex flex-1 items-start justify-center px-3 py-6 sm:items-center sm:py-10 ${glitch ? "glitch" : ""}`}>
        <AnimatePresence mode="wait">
          <QuestionPanel key={q.id} q={q} index={s.qIndex} total={L.questions.length} answered={s.answered}
            onAnswer={(choice) => dispatch({ type: "ANSWER", choice })} onNext={() => dispatch({ type: "NEXT" })} />
        </AnimatePresence>
      </main>
      <div className="relative z-10 pb-3 text-center font-mono text-[10px] tracking-[0.3em] text-muted-foreground">
        UNLOCK REQUIREMENT · {s.levelCorrect}/{L.required} CORRECT
      </div>
      <HostToast line={host} />
      <HostInterrupt show={interrupt} onClose={() => setInterrupt(false)} />
    </div>
  );
}
