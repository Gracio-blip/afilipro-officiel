import { auth } from "@/lib/auth";
import { db } from "@/db";
import { tasks, userTasks, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { completeTask, seedIfEmpty } from "@/lib/actions";
import { formatMoney, formatGMT } from "@/lib/utils";
import Link from "next/link";
import QuizGame from "./QuizGame";

function getLomeTimeStr(): string {
  return (
    new Date().toLocaleString("fr-FR", {
      timeZone: "Africa/Lome",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      weekday: "short",
      day: "2-digit",
      month: "long",
    }) + " GMT+0"
  );
}

const taskMeta: Record<string, { icon: string; diff: string; diffColor: string; tip: string; calc: string }> = {
  telegram: {
    icon: "📲",
    diff: "🟡 Moyenne",
    diffColor: "bg-amber-50 text-amber-700 border border-amber-200",
    tip: "Rejoins le canal officiel et reste abonné. Vérification admin obligatoire.",
    calc: "Récompense fixe : 50 FCFA",
  },
};

export default async function MissionsPage() {
  try {
    await seedIfEmpty();
  } catch {}

  const session = await auth();
  const doneIds = new Set<string>();
  let isActive = false;

  if (session?.user?.email) {
    const u = await db.select().from(users).where(eq(users.email, session.user.email)).limit(1);
    if (u[0]) {
      isActive = !!u[0].isActive;
      const done = await db.select().from(userTasks).where(eq(userTasks.userId, u[0].id));
      done.forEach((d) => doneIds.add(d.taskId));
    }
  }

  // Obtenir toutes les tâches
  const allTasks = await db.select().from(tasks).where(eq(tasks.isActive, true));
  const quizTask = allTasks.find((t) => t.type === "quiz");
  const telegramTask = allTasks.find((t) => t.type === "telegram");

  const isQuizDone = quizTask ? doneIds.has(quizTask.id) : false;
  const isTelegramDone = telegramTask ? doneIds.has(telegramTask.id) : false;

  const lomeTime = getLomeTimeStr();

  return (
    <div className="space-y-4">
      {/* HEADER */}
      <div className="rounded-[24px] bg-[#0B1120] px-5 py-6 text-white">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[11px] font-black tracking-[0.18em] text-violet-300">MICRO-TÂCHES</p>
          <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-black text-slate-300">{lomeTime}</span>
        </div>
        <h1 className="mt-2 text-[26px] font-black leading-tight">Gagner de l&apos;argent</h1>
        <p className="mt-2 text-[13px] text-slate-400">
          Chaque tâche validable <span className="font-black text-white">une seule fois</span> · 50 FCFA par question quiz · Anti-fraude actif
        </p>
        {!isActive && (
          <p className="mt-3 rounded-xl bg-rose-500/20 px-3 py-2 text-[12px] font-bold text-rose-300">⛔ Déposez 2 500 FCFA pour accéder aux tâches</p>
        )}
      </div>

      {/* QUIZ INTERACTIF */}
      {quizTask && (
        <div className={`rounded-[22px] border bg-white p-5 afili-card ${isQuizDone ? "opacity-60" : ""}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-[26px]">🎯</span>
              <div>
                <h2 className="text-[17px] font-black text-slate-900">{quizTask.title}</h2>
                <p className="text-[12px] text-slate-500">Gagne 50 FCFA par bonne réponse (max 150 FCFA)</p>
              </div>
            </div>
            <span className="rounded-full bg-rose-100 border border-rose-200 px-2.5 py-0.5 text-[10px] font-black text-rose-700">🔴 Difficile</span>
          </div>

          {isQuizDone ? (
            <div className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-50 border border-emerald-200 py-3 text-[13px] font-black text-emerald-700">
              ✓ Quiz quotidien déjà complété
            </div>
          ) : (
            <QuizGame canPlay={isActive} taskId={quizTask.id} />
          )}
        </div>
      )}

      {/* AUTRES MISSIONS (Telegram) */}
      {telegramTask && (
        <div className={`rounded-[20px] border bg-white p-4 afili-card ${isTelegramDone ? "opacity-60" : ""}`}>
          <div className="flex items-start gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-sky-500 text-[22px]">📲</div>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <p className="text-[14px] font-black text-slate-900">{telegramTask.title}</p>
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-black text-emerald-700">+{formatMoney(Number(telegramTask.reward))}</span>
              </div>
              <p className="mt-1 text-[12px] text-slate-500">{telegramTask.description}</p>
              <span className="mt-2 inline-block rounded-lg border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-black text-amber-700">🟡 Moyenne</span>
            </div>
          </div>
          <div className="mt-3">
            {isTelegramDone ? (
              <div className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-50 py-2.5 text-[13px] font-black text-emerald-700">
                ✓ Canal rejoint · +50 FCFA
              </div>
            ) : !isActive ? (
              <div className="rounded-2xl bg-slate-100 py-2.5 text-center text-[12px] font-bold text-slate-400">🔒 Dépôt requis</div>
            ) : (
              <form action={async () => { "use server"; await completeTask(telegramTask.id); }}>
                <button className="w-full rounded-2xl bg-[#0B1120] py-3 text-[13px] font-black text-white transition active:scale-[0.98]">Rejoindre et valider →</button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Jeu des bouteilles CTA */}
      <Link
        href="/bottle"
        className="flex items-center gap-4 rounded-[22px] border border-indigo-200 bg-indigo-50 p-4 afili-card transition active:scale-[0.99]"
      >
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-indigo-600 text-[26px]">🍾</div>
        <div className="flex-1">
          <p className="text-[11px] font-black tracking-[0.1em] text-indigo-600">JEU DES BOUTEILLES</p>
          <p className="text-[16px] font-black text-slate-900">Trouve la boule cachée !</p>
          <p className="text-[12px] text-slate-500">100 FCFA à gagner · Parties illimitées</p>
        </div>
        <span className="text-[22px]">→</span>
      </Link>

      {/* Lucky Spin CTA */}
      <Link
        href="/spin"
        className="flex items-center gap-4 rounded-[22px] border border-amber-200 bg-amber-50 p-4 afili-card transition active:scale-[0.99]"
      >
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-amber-500 text-[26px]">🎰</div>
        <div className="flex-1">
          <p className="text-[11px] font-black tracking-[0.1em] text-amber-600">LUCKY SPIN</p>
          <p className="text-[16px] font-black text-slate-900">Tente ta chance !</p>
          <p className="text-[12px] text-slate-500">500 ou 800 FCFA à gagner · 3 tentatives par 24h</p>
        </div>
        <span className="text-[22px]">→</span>
      </Link>

      {/* Rules */}
      <div className="rounded-[20px] border border-slate-200 bg-white p-5 afili-card">
        <p className="text-[13px] font-black text-slate-900">⚠️ Règles anti-fraude</p>
        <ul className="mt-3 space-y-2">
          {[
            "Quiz : 3 questions, 50 FCFA par bonne réponse (max 150 FCFA)",
            "Une seule validation par tâche et par compte",
            "Dépôt de 2 500 FCFA obligatoire pour accéder aux tâches",
            "Telegram : vérification manuelle par l'admin",
            "Fraude détectée = suspension immédiate du compte",
            "Gains crédités instantanément sur le tableau de bord",
          ].map((r, i) => (
            <li key={i} className="flex items-start gap-2 text-[12px] text-slate-600">
              <span className="mt-0.5 shrink-0 font-black text-slate-400">·</span>
              {r}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
