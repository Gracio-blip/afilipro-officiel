"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { playBottleGame } from "@/lib/actions";

type Phase = "idle" | "shuffling" | "picking" | "result";

const COLORS = ["from-violet-500 to-violet-700", "from-blue-500 to-blue-700", "from-indigo-500 to-indigo-700"];

export default function BottleGame({ canPlay, taskId }: { canPlay: boolean; taskId: string }) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("idle");
  const [positions, setPositions] = useState([0, 1, 2]); // positions[slot] = bottle index displayed at that slot
  const [revealed, setRevealed] = useState<number | null>(null); // bottle index user picked
  const [result, setResult] = useState<{ won: boolean; reward: number; message: string; ballPosition: number } | null>(null);
  const [loading, setLoading] = useState(false);

  // Purely cosmetic shuffle animation — the real winner is decided by the server
  async function doShuffle() {
    let current = [0, 1, 2];
    setPhase("shuffling");

    const rounds = 12 + Math.floor(Math.random() * 8);
    for (let i = 0; i < rounds; i++) {
      await new Promise((r) => setTimeout(r, 120 + Math.random() * 100));
      let a = Math.floor(Math.random() * 3);
      let b = Math.floor(Math.random() * 3);
      while (b === a) b = Math.floor(Math.random() * 3);

      const next = [...current];
      const posA = next.indexOf(a);
      const posB = next.indexOf(b);
      [next[posA], next[posB]] = [next[posB], next[posA]];
      current = next;
      setPositions([...next]);
    }

    setPhase("picking");
  }

  async function handleStart() {
    if (!canPlay || phase !== "idle" || loading) return;
    setResult(null);
    setRevealed(null);
    setPositions([0, 1, 2]);
    await doShuffle();
  }

  async function handlePick(bottleIndex: number) {
    if (phase !== "picking" || loading) return;
    setLoading(true);
    setRevealed(bottleIndex);

    // Server decides the ball position independently — impossible to cheat from client
    const res = await playBottleGame(taskId, bottleIndex);
    setPhase("result");
    setResult(res);
    router.refresh();
    setLoading(false);
  }

  const bottleOrder = positions;

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Phase indicator */}
      <div
        className={`w-full rounded-2xl px-4 py-3 text-center text-[13px] font-black ${
          phase === "idle"
            ? "bg-slate-100 text-slate-600"
            : phase === "shuffling"
            ? "bg-amber-50 text-amber-700"
            : phase === "picking"
            ? "bg-violet-50 text-violet-700"
            : "bg-slate-50 text-slate-700"
        }`}
      >
        {phase === "idle" && "Clique sur « Commencer » pour lancer le jeu"}
        {phase === "shuffling" && "🔀 Les bouteilles bougent... Suivez la boule !"}
        {phase === "picking" && "👆 Cliquez sur la bouteille qui cache la boule !"}
        {phase === "result" && (result?.won ? "🎉 Vous avez gagné !" : "😔 Raté ! La boule était ailleurs.")}
      </div>

      {/* Bottles */}
      <div className="relative flex h-40 w-full items-end justify-around gap-4">
        {[0, 1, 2].map((slot) => {
          const bottleIdx = bottleOrder[slot];
          const isRevealed = phase === "result" && revealed !== null;
          const isChosen = revealed === bottleIdx;
          const hasBall = isRevealed && result?.ballPosition === bottleIdx;

          return (
            <div key={`slot-${slot}`} className="flex flex-1 flex-col items-center gap-2">
              {hasBall && (
                <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-[28px]">
                  ⚽
                </motion.div>
              )}
              {isRevealed && !hasBall && <div className="h-9" />}

              <motion.button
                layout
                layoutId={`bottle-${bottleIdx}`}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                onClick={() => handlePick(bottleIdx)}
                disabled={phase !== "picking"}
                className={`relative flex h-28 w-full flex-col items-center justify-end rounded-[20px] bg-gradient-to-b ${COLORS[bottleIdx]} text-white shadow-lg transition active:scale-95 disabled:cursor-default ${
                  phase === "picking" ? "hover:scale-105 cursor-pointer" : ""
                } ${isChosen && result?.won ? "ring-4 ring-emerald-400" : ""} ${isChosen && result && !result.won ? "opacity-60" : ""}`}
              >
                <span className="mb-1 text-[52px] leading-none">🍾</span>
                {hasBall && <div className="absolute inset-0 animate-pulse rounded-[20px] ring-4 ring-amber-400" />}
              </motion.button>
            </div>
          );
        })}
      </div>

      {/* Result */}
      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, scale: 0.85, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`w-full rounded-2xl p-5 text-center ${
              result.won ? "border-2 border-emerald-400 bg-emerald-50" : "border border-rose-200 bg-rose-50"
            }`}
          >
            <p className="text-[30px]">{result.won ? "🎉" : "😔"}</p>
            <p className="mt-1 text-[15px] font-black text-slate-900">{result.message}</p>
            {result.won && result.reward > 0 && (
              <p className="mt-1 text-[13px] font-bold text-emerald-600">+{result.reward} FCFA crédités immédiatement</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* CTA */}
      {!canPlay ? (
        <div className="w-full rounded-2xl border border-rose-200 bg-rose-50 p-4 text-center">
          <p className="text-[14px] font-black text-rose-700">⛔ Dépôt de 2 500 FCFA requis pour jouer</p>
        </div>
      ) : phase === "idle" ? (
        <button
          onClick={handleStart}
          className="w-full rounded-2xl bg-[#0B1120] py-4 text-[15px] font-black text-white shadow-lg transition active:scale-[0.98]"
        >
          🎮 Commencer le jeu
        </button>
      ) : phase === "result" ? (
        <button
          onClick={() => {
            setPhase("idle");
            setRevealed(null);
            setResult(null);
          }}
          className="w-full rounded-2xl bg-slate-900 py-4 text-[15px] font-black text-white transition active:scale-[0.98]"
        >
          Rejouer une partie
        </button>
      ) : null}
    </div>
  );
}
