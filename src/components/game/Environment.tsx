import { motion } from "framer-motion";
import hall from "@/assets/hall.jpg";
import doors from "@/assets/doors.jpg";
import control from "@/assets/control.jpg";
import mirror from "@/assets/mirror.jpg";
import type { EnvKind } from "@/game/types";
import { Atmosphere, Camera, Glyph, WarningLights } from "./Visuals";

export const ENV_IMG: Record<EnvKind, string> = { doors, control, mirror, arena: hall };

interface Props { env: EnvKind; progress: number; threat: number; lowTime: boolean; alert: boolean }

/** Reactive backdrop: brightens with progress, flickers/warns with threat. */
export function Environment({ env, progress, threat, lowTime, alert }: Props) {
  return (
    <div className={`absolute inset-0 overflow-hidden ${threat >= 2 ? "flicker" : ""}`}>
      <motion.img key={env} src={ENV_IMG[env]} alt="" width={1920} height={1088}
        initial={{ scale: 1.15, opacity: 0 }} animate={{ scale: 1.05 + progress * 0.05, opacity: 0.35 + progress * 0.35 }}
        transition={{ duration: 2 }} className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-void/60 via-transparent to-void" />

      {env === "doors" && (
        <div className="absolute inset-x-0 top-[12%] mx-auto hidden max-w-5xl justify-around md:flex">
          {[0, 1, 2, 3].map((k) => {
            const lit = progress * 4 > k;
            return <Glyph key={k} kind={k} className={`h-10 w-10 transition-all duration-1000 ${lit ? "text-neon drop-shadow-[0_0_10px_var(--neon)]" : "text-muted-foreground/30"}`} />;
          })}
        </div>
      )}
      {env === "control" && (
        <div className="absolute inset-x-0 top-[10%] mx-auto hidden max-w-6xl grid-cols-12 gap-2 px-6 opacity-50 md:grid">
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} className={`h-6 border font-mono text-[9px] leading-6 text-center transition-colors duration-700 ${i / 24 < progress ? "border-neon/50 text-neon" : threat >= 3 && i % 5 === 0 ? "border-signal/60 text-signal" : "border-border text-muted-foreground"}`}>
              {(i * 7) % 3 ? "T" : "F"}{(i * 5) % 2 ? "T" : "F"}
            </div>
          ))}
        </div>
      )}
      {env === "mirror" && (
        <div className="pointer-events-none absolute inset-0 flex justify-between">
          {[0, 1].map((side) => (
            <motion.div key={side} className="h-full w-[12%] bg-gradient-to-b from-foreground/0 via-foreground/10 to-foreground/0"
              animate={{ opacity: 0.2 + progress * 0.8 }} transition={{ duration: 1.5 }}>
              <div className="flex h-full flex-col items-center justify-center gap-10">
                {[0, 2, 1].map((k, j) => <Glyph key={j} kind={k} className={`h-8 w-8 transition-opacity duration-1000 ${progress * 3 > j ? "text-neon opacity-90" : "opacity-0"}`} />)}
              </div>
            </motion.div>
          ))}
        </div>
      )}
      {env === "arena" && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          {[1, 2, 3].map((r) => (
            <motion.div key={r} className="absolute rounded-full border border-signal/30" style={{ width: `${r * 28}vmin`, height: `${r * 28}vmin` }}
              animate={{ rotate: r % 2 ? 360 : -360, opacity: 0.2 + progress * 0.5 }} transition={{ rotate: { duration: 40 + r * 10, repeat: Infinity, ease: "linear" } }} />
          ))}
        </div>
      )}

      <WarningLights on={threat >= 3 || lowTime} />
      <Camera side="left" threat={threat} alert={alert} />
      <Camera side="right" threat={threat} alert={alert} />
      <Atmosphere />
    </div>
  );
}
