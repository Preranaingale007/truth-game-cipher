import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { GameProvider, useGame } from "@/game/engine";
import { Play } from "@/components/game/Play";
import { Boot, Ending, Intro, LevelComplete, LevelFailed, LevelIntro } from "@/components/game/Screens";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The Logic Games — Player 047" },
      { name: "description", content: "A cinematic survival-puzzle game of Discrete Mathematics. Four games. Four doors. One way out." },
      { property: "og:title", content: "The Logic Games — Player 047" },
      { property: "og:description", content: "Think carefully. Every answer matters. A cinematic Discrete Mathematics escape game." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Router() {
  const { state } = useGame();
  const key = state.phase === "playing" ? `play-${state.level}` : `${state.phase}-${state.level}`;
  return (
    <AnimatePresence mode="wait">
      <motion.div key={key} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }}>
        {state.phase === "boot" && <Boot />}
        {state.phase === "intro" && <Intro />}
        {state.phase === "levelIntro" && <LevelIntro />}
        {state.phase === "playing" && <Play />}
        {state.phase === "levelComplete" && <LevelComplete />}
        {state.phase === "levelFailed" && <LevelFailed />}
        {state.phase === "ending" && <Ending />}
      </motion.div>
    </AnimatePresence>
  );
}

function Index() {
  return <GameProvider><Router /></GameProvider>;
}
