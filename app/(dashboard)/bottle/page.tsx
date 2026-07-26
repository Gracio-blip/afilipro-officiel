import { auth } from "@/lib/auth";
import { db } from "@/db";
import { users, tasks, wallets } from "@/db/schema";
import { eq } from "drizzle-orm";
import { formatMoney } from "@/lib/utils";
import BottleGame from "./BottleGame";

export default async function BottlePage() {
  const session = await auth();
  let isActive = false;
  let taskBalance = 0;
  let bottleTask: any = null;

  if (session?.user?.email) {
    const u = await db.select().from(users).where(eq(users.email, session.user.email)).limit(1);
    if (u[0]) {
      isActive = !!u[0].isActive;
      const w = await db.select().from(wallets).where(eq(wallets.userId, u[0].id)).limit(1);
      taskBalance = Number(w[0]?.taskBalance ?? 0);
    }
  }

  const allTasks = await db.select().from(tasks).where(eq(tasks.isActive, true));
  bottleTask = allTasks.find((t) => t.type === "bottle");

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-[24px] bg-gradient-to-br from-indigo-600 to-violet-700 p-6 text-white">
        <p className="text-[11px] font-black tracking-[0.18em] text-indigo-200">JEU DES BOUTEILLES</p>
        <h1 className="mt-2 text-[26px] font-black leading-tight">Trouve la boule cachée !</h1>
        <p className="mt-2 text-[13px] text-indigo-100">
          3 bouteilles · 1 boule · Appuie sur commencer, les bouteilles bougent, choisis la bonne !
        </p>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-2xl bg-white/20 p-3">
            <p className="text-[18px] font-black">3</p>
            <p className="text-[10px] text-indigo-100">Bouteilles</p>
          </div>
          <div className="rounded-2xl bg-white/20 p-3">
            <p className="text-[18px] font-black">+100F</p>
            <p className="text-[10px] text-indigo-100">Si gagné</p>
          </div>
          <div className="rounded-2xl bg-white/20 p-3">
            <p className="text-[18px] font-black">∞</p>
            <p className="text-[10px] text-indigo-100">Parties</p>
          </div>
        </div>
        {!isActive && (
          <p className="mt-4 rounded-2xl bg-rose-500/30 px-3 py-2 text-[12px] font-bold text-rose-100">
            ⛔ Compte non actif — Déposez 2 500 FCFA pour jouer
          </p>
        )}
      </div>

      {/* Balance */}
      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 afili-card">
        <p className="text-[13px] font-bold text-slate-500">Solde tâches</p>
        <p className="text-[18px] font-black text-slate-900">{formatMoney(taskBalance)}</p>
      </div>

      {/* Game */}
      <div className="rounded-[22px] border border-slate-200 bg-white p-5 afili-card">
        {bottleTask ? (
          <BottleGame canPlay={isActive} taskId={bottleTask.id} />
        ) : (
          <p className="text-center text-slate-400">Jeu temporairement indisponible.</p>
        )}
      </div>

      {/* How to play */}
      <div className="rounded-[20px] border border-slate-200 bg-white p-4 afili-card">
        <p className="text-[13px] font-black text-slate-900">Comment jouer ?</p>
        <ol className="mt-3 space-y-2">
          {[
            "Cliquez sur « Commencer le jeu »",
            "Regardez bien la boule — elle est sous une bouteille",
            "Les bouteilles bougent rapidement — suivez la boule des yeux",
            "Cliquez sur la bouteille que vous pensez cacher la boule",
            "Si vous avez raison → +100 FCFA crédités immédiatement",
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-3 text-[12px] text-slate-600">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-black text-indigo-700">{i + 1}</span>
              {step}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
