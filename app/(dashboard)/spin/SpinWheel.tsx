"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { playSpin } from "@/lib/actions";
import { useRouter } from "next/navigation";

const SEGMENTS = [0, 500, 0, 800, 0, 500, 0, 800, 0, 500, 0, 0];
const COLORS: Record<number, string> = {
  0:   "#1e293b",
  500: "#7c3aed",
  800: "#f59e0b",
};
const N = SEGMENTS.length;
const SEG_DEG = 360 / N;
const R = 90;
const CX = 100;
const CY = 100;

function pt(deg: number, r: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
}

function segPath(i: number) {
  const s = pt(SEG_DEG * i, R);
  const e = pt(SEG_DEG * (i + 1), R);
  return `M${CX},${CY} L${s.x},${s.y} A${R},${R} 0 0,1 ${e.x},${e.y} Z`;
}

function segText(i: number) {
  return pt(SEG_DEG * i + SEG_DEG / 2, R * 0.6);
}

export default function SpinWheel({ canPlay, initialLeft }: { canPlay: boolean; initialLeft: number }) {
  const [spinning, setSpinning] = useState(false);
  const [rot, setRot] = useState(0);
  const [attemptsLeft, setAttemptsLeft] = useState(initialLeft);
  const [result, setResult] = useState<{ reward: number; message: string } | null>(null);
  const router = useRouter();

  async function handleSpin() {
    if (spinning || attemptsLeft <= 0 || !canPlay) return;
    setSpinning(true);
    setResult(null);

    // Animate wheel (cosmetic)
    const extra = (5 + Math.floor(Math.random() * 4)) * 360 + Math.random() * 360;
    const newRot = rot + extra;
    setRot(newRot);

    // Call server after small delay so animation starts
    await new Promise(r => setTimeout(r, 300));
    const res = await playSpin();
    await new Promise(r => setTimeout(r, 2900)); // wait rest of animation

    setResult({ reward: res.reward, message: res.message });
    setAttemptsLeft(res.attemptsLeft);
    setSpinning(false);
    router.refresh(); // refresh layout to update balance in topbar
  }

  return (
    <div className="flex flex-col items-center gap-5">
      {/* Attempts */}
      <div className="flex items-center gap-2">
        {[0, 1, 2].map(i => (
          <div key={i} className={`h-3 w-10 rounded-full transition-colors ${i < attemptsLeft ? "bg-amber-400" : "bg-slate-200"}`} />
        ))}
        <span className="ml-1 text-[12px] font-black text-slate-600">{attemptsLeft}/3 restante{attemptsLeft !== 1 ? "s" : ""}</span>
      </div>

      {/* Wheel */}
      <div className="relative">
        {/* pointer */}
        <div className="absolute left-1/2 -top-3 z-10 -translate-x-1/2">
          <div className="h-7 w-5 bg-rose-500 shadow-lg" style={{ clipPath: "polygon(50% 100%, 0 0, 100% 0)" }} />
        </div>

        <motion.svg
          viewBox="0 0 200 200"
          className="h-60 w-60 drop-shadow-2xl"
          animate={{ rotate: rot }}
          transition={{ duration: 3.2, ease: [0.15, 0.6, 0.3, 1] }}
        >
          {SEGMENTS.map((seg, i) => {
            const t = segText(i);
            return (
              <g key={i}>
                <path d={segPath(i)} fill={COLORS[seg]} stroke="#0f172a" strokeWidth="1.5" />
                <text x={t.x} y={t.y} textAnchor="middle" dominantBaseline="middle"
                  fill="white" fontSize="9" fontWeight="900">
                  {seg === 0 ? "✕" : `${seg}`}
                </text>
              </g>
            );
          })}
          <circle cx={CX} cy={CY} r="14" fill="#0f172a" stroke="#F5C453" strokeWidth="3" />
          <text x={CX} y={CY} textAnchor="middle" dominantBaseline="middle" fontSize="12">🎰</text>
        </motion.svg>
      </div>

      {/* Result */}
      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            key={result.message}
            initial={{ opacity: 0, y: 16, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            className={`w-full rounded-2xl p-4 text-center ${
              result.reward >= 800 ? "bg-amber-50 border-2 border-amber-400" :
              result.reward > 0    ? "bg-violet-50 border-2 border-violet-400" :
              "bg-slate-100 border border-slate-200"
            }`}
          >
            <p className="text-[26px]">{result.reward >= 800 ? "🎉" : result.reward > 0 ? "✨" : "😔"}</p>
            <p className="mt-1 text-[14px] font-black text-slate-900">{result.message}</p>
            {result.reward > 0 && (
              <p className="mt-1 text-[12px] font-bold text-emerald-600">+{result.reward} FCFA crédités immédiatement !</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* CTA */}
      {!canPlay ? (
        <div className="w-full rounded-2xl bg-rose-50 border border-rose-200 p-4 text-center">
          <p className="text-[14px] font-black text-rose-700">⛔ Dépôt de 2 500 FCFA requis</p>
        </div>
      ) : attemptsLeft <= 0 ? (
        <div className="w-full rounded-2xl bg-slate-100 border border-slate-200 p-4 text-center">
          <p className="text-[14px] font-black text-slate-600">⏰ Plus de tentatives. Revenez dans 24h !</p>
        </div>
      ) : (
        <button onClick={handleSpin} disabled={spinning}
          className="w-full rounded-2xl bg-[#F5C453] py-4 text-[16px] font-black text-black transition active:scale-[0.98] disabled:opacity-60 shadow-lg shadow-amber-200">
          {spinning ? "🎰 La roue tourne..." : `Tourner ! (${attemptsLeft} tentative${attemptsLeft !== 1 ? "s" : ""})`}
        </button>
      )}
    </div>
  );
}
