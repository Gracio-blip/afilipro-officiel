import { auth } from "@/lib/auth";
import { db } from "@/db";
import { tasks, userTasks, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { completeTask, seedIfEmpty } from "@/lib/actions";
import { formatMoney } from "@/lib/utils";
import Link from "next/link";

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
  quiz: {
    icon: "🎯",
    diff: "🔴 Difficile",
    diffColor: "bg-rose-50 text-rose-700 border border-rose-200",
    tip: "3 questions de culture générale. 50 FCFA par bonne réponse. Toutes correctes = 150 FCFA. Une erreur = mission annulée.",
    calc: "3 questions × 50 FCFA = 150 FCFA",
  },
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

  // Exclure le spin et le jeu des bouteilles (ils ont leurs propres pages dédiées)
  const allTasks = (await db.select().from(tasks).where(eq(tasks.isActive, true))).filter(
    (t) => t.type !== "spin" && t.type !== "bottle"
  );

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

      {/* TASKS */}
      <div className="grid gap-3">
        {allTasks.map((task: any) => {
          const done = doneIds.has(task.id);
          const meta = taskMeta[task.type ?? "quiz"] ?? taskMeta.quiz;

          return (
            <div key={task.id} className={`rounded-[20px] border border-slate-200 bg-white p-4 afili-card ${done ? "opacity-60" : ""}`}>
              <div className="flex items-start gap-4">
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-slate-900 text-[26px]">{meta.icon}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-[15px] font-black text-slate-900">{task.title}</p>
                    <span className="shrink-0 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-black text-emerald-700">
                      +{formatMoney(Number(task.reward))}
                    </span>
                  </div>
                  <p className="mt-1 text-[12px] text-slate-500">{task.description}</p>
                  <span className={`mt-2 inline-block rounded-lg px-2 py-0.5 text-[10px] font-black ${meta.diffColor}`}>{meta.diff}</span>
                  <div className="mt-2 rounded-xl bg-slate-50 px-3 py-2">
                    <p className="text-[11px] font-black text-slate-600">📊 {meta.calc}</p>
                    <p className="mt-0.5 text-[10px] text-slate-400">{meta.tip}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                {!isActive ? (
                  <div className="flex items-center justify-center rounded-2xl bg-slate-100 py-3 text-[13px] font-black text-slate-400">🔒 Dépôt requis</div>
                ) : done ? (
                  <div className="flex items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 py-3 text-[13px] font-black text-emerald-700">
                    ✓ Tâche accomplie · +{formatMoney(Number(task.reward))}
                  </div>
                ) : (
                  <form action={async () => { "use server"; await completeTask(task.id); }}>
                    <button className="w-full rounded-2xl bg-[#0B1120] py-3 text-[13px] font-black text-white transition active:scale-[0.98]">
                      Commencer la tâche →
                    </button>
                  </form>
                )}
              </div>
            </div>
          );
        })}
      </div>

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
