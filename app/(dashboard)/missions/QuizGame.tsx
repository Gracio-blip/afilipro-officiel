"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { completeQuizAction } from "@/lib/actions";

const QUESTIONS = [
  {
    q: "Quelle est la capitale officielle du Togo ?",
    options: ["Lomé", "Kara", "Atakpamé", "Sokodé"],
    correct: 0,
  },
  {
    q: "Quel est le dépôt minimum pour activer son compte sur AfiliPro ?",
    options: ["1 500 FCFA", "2 000 FCFA", "2 500 FCFA", "3 000 FCFA"],
    correct: 2,
  },
  {
    q: "Combien gagne le parrain à chaque activation de filleul ?",
    options: ["100 FCFA", "200 FCFA", "300 FCFA", "500 FCFA"],
    correct: 2,
  },
];

export default function QuizGame({ canPlay, taskId }: { canPlay: boolean; taskId: string }) {
  const router = useRouter();
  const [started, setStarted] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{ reward: number; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleNext() {
    if (selectedOpt === null) return;
    const isCorrect = selectedOpt === QUESTIONS[currentIdx].correct;
    const newScore = isCorrect ? score + 1 : score;
    setScore(newScore);

    if (currentIdx + 1 < QUESTIONS.length) {
      setCurrentIdx(currentIdx + 1);
      setSelectedOpt(null);
      setSubmitted(false);
    } else {
      setLoading(true);
      try {
        const res = await completeQuizAction(taskId, newScore);
        setResult(res);
        router.refresh();
      } catch (e: any) {
        setResult({ reward: 0, message: e.message || "Erreur de validation" });
      }
      setLoading(false);
    }
  }

  if (!started) {
    return (
      <div className="text-center space-y-4 py-4">
        <p className="text-[14px] leading-6 text-slate-600 font-medium">
          Vous allez répondre à 3 questions de culture générale.
          Chaque bonne réponse vous rapporte immédiatement <span className="font-black text-emerald-600">50 FCFA</span> sur votre tableau de bord.
        </p>
        <button
          onClick={() => setStarted(true)}
          disabled={!canPlay}
          className="w-full rounded-2xl bg-[#0B1120] py-4 text-[15px] font-black text-white transition active:scale-[0.98] disabled:opacity-40"
        >
          {canPlay ? "🎯 Commencer le Quiz" : "🔒 Dépôt requis pour commencer"}
        </button>
      </div>
    );
  }

  if (result) {
    return (
      <div className="text-center space-y-4 py-4">
        <p className="text-[36px]">🎉</p>
        <h3 className="text-[18px] font-black text-slate-900">Quiz terminé !</h3>
        <p className="text-[14px] text-slate-600 font-medium leading-relaxed">
          {result.message}
        </p>
        <button
          onClick={() => {
            setStarted(false);
            setCurrentIdx(0);
            setScore(0);
            setSelectedOpt(null);
            setResult(null);
          }}
          className="w-full rounded-2xl bg-slate-900 py-4 text-[15px] font-black text-white transition active:scale-[0.98]"
        >
          Fermer
        </button>
      </div>
    );
  }

  const currentQ = QUESTIONS[currentIdx];

  return (
    <div className="space-y-6 py-2">
      {/* Progress */}
      <div className="flex justify-between items-center text-[12px] font-black">
        <span className="text-slate-500">Question {currentIdx + 1} sur 3</span>
        <span className="text-indigo-600">Gains potentiels : {formatMoney((currentIdx + 1) * 50)}</span>
      </div>

      <div className="h-2 rounded-full bg-slate-100">
        <div className="h-2 rounded-full bg-indigo-600 transition-all duration-300" style={{ width: `${((currentIdx + 1) / 3) * 100}%` }} />
      </div>

      {/* Question */}
      <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
        <p className="text-[15px] font-black text-slate-900 leading-snug">{currentQ.q}</p>
      </div>

      {/* Options */}
      <div className="grid gap-2">
        {currentQ.options.map((opt, i) => {
          const isSelected = selectedOpt === i;
          return (
            <button
              key={i}
              onClick={() => setSelectedOpt(i)}
              className={`w-full rounded-2xl border px-4 py-3.5 text-left text-[13px] font-bold transition flex items-center justify-between ${
                isSelected
                  ? "border-indigo-600 bg-indigo-50 text-indigo-900"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
              }`}
            >
              <span>{opt}</span>
              <span className={`h-4 w-4 rounded-full border-2 transition ${
                isSelected ? "border-indigo-600 bg-indigo-600" : "border-slate-300"
              }`} />
            </button>
          );
        })}
      </div>

      {/* Action button */}
      <button
        onClick={handleNext}
        disabled={selectedOpt === null || loading}
        className="w-full rounded-2xl bg-[#0B1120] py-4 text-[14px] font-black text-white transition active:scale-[0.98] disabled:opacity-50"
      >
        {loading ? "Validation..." : currentIdx === 2 ? "Valider et terminer" : "Question suivante →"}
      </button>
    </div>
  );
}

function formatMoney(amount: number): string {
  return `${amount.toLocaleString("fr-FR")} FCFA`;
}
