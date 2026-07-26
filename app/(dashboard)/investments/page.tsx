import { auth } from "@/lib/auth";
import { db } from "@/db";
import { investmentPlans, userInvestments, users, wallets } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { investInPlan, seedIfEmpty } from "@/lib/actions";
import { formatMoney } from "@/lib/utils";
import { Crown } from "lucide-react";

export default async function InvestmentsPage() {
  try { await seedIfEmpty(); } catch {}

  let isActive = false;
  let walletBal = 0;
  let myInvests: any[] = [];

  const session = await auth();
  if (session?.user?.email) {
    const u = await db.select().from(users).where(eq(users.email, session.user.email)).limit(1);
    if (u[0]) {
      isActive = !!u[0].isActive;
      const w = await db.select().from(wallets).where(eq(wallets.userId, u[0].id)).limit(1);
      walletBal = Number(w[0]?.balance ?? 0);
      myInvests = await db.select().from(userInvestments).where(eq(userInvestments.userId, u[0].id)).orderBy(desc(userInvestments.startedAt));
    }
  }

  const plans = await db.select().from(investmentPlans).where(eq(investmentPlans.isActive, true)).orderBy(investmentPlans.investmentAmount);

  return (
    <div className="space-y-4">
      {/* HEADER */}
      <div className="rounded-[24px] bg-[#0B1120] p-6 text-white">
        <div className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-amber-400" />
          <p className="text-[11px] font-black tracking-[0.18em] text-amber-300">INVESTISSEMENTS VIP</p>
        </div>
        <h1 className="mt-2 text-[26px] font-black leading-tight">Paliers progressifs</h1>
        <p className="mt-2 text-[13px] text-slate-400">Solde : {formatMoney(walletBal)} · Min 2 500 FCFA</p>
        {!isActive && (
          <p className="mt-3 rounded-xl bg-amber-400/15 px-3 py-2 text-[12px] font-bold text-amber-300">
            ⚠️ Activez votre compte avec un dépôt de 2 500 FCFA avant d&apos;investir.
          </p>
        )}
      </div>

      {/* PLANS */}
      <div className="grid gap-3">
        {plans.map((plan: any) => {
          const active = myInvests.find((i) => i.planId === plan.id && i.status === "active");
          const progress = active ? Math.min(100, Math.round(((active.daysClaimed ?? 0) / plan.durationDays) * 100)) : 0;

          return (
            <div key={plan.id} className="rounded-[22px] border border-slate-200 bg-white p-5 afili-card">
              {/* Title row */}
              <div className="flex items-center justify-between">
                <h2 className="text-[18px] font-black text-slate-900">{plan.name}</h2>
                <span className="rounded-full bg-[#0B1120] px-3 py-1 text-[10px] font-black text-white">{plan.durationDays} jours</span>
              </div>

              {/* 3 STATS ONLY — no profit net */}
              <div className="mt-4 grid grid-cols-3 gap-2">
                <div className="rounded-xl bg-slate-50 p-3">
                  <p className="text-[10px] font-bold text-slate-400">Investissement</p>
                  <p className="mt-1 text-[13px] font-black text-slate-900">{formatMoney(Number(plan.investmentAmount))}</p>
                </div>
                <div className="rounded-xl bg-emerald-50 p-3">
                  <p className="text-[10px] font-bold text-emerald-600">Revenu / jour</p>
                  <p className="mt-1 text-[13px] font-black text-emerald-700">{formatMoney(Number(plan.dailyReward))}</p>
                </div>
                <div className="rounded-xl bg-violet-50 p-3">
                  <p className="text-[10px] font-bold text-violet-600">Durée</p>
                  <p className="mt-1 text-[13px] font-black text-violet-700">{plan.durationDays} j</p>
                </div>
              </div>

              {/* Progress if active */}
              {active && (
                <div className="mt-4">
                  <div className="mb-1 flex justify-between text-[11px] font-black">
                    <span className="text-slate-500">Progression</span>
                    <span className="text-slate-900">{active.daysClaimed ?? 0} / {plan.durationDays} j</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-2 rounded-full bg-[#0B1120] transition-all" style={{ width: `${progress}%` }} />
                  </div>
                  <p className="mt-1 text-[11px] font-bold text-slate-500">
                    Gagné : {formatMoney(Number(active.totalEarned ?? 0))} · Bloqué jusqu&apos;au {plan.durationDays}ème jour
                  </p>
                </div>
              )}

              {/* CTA */}
              <form action={investInPlan.bind(null, plan.id)} className="mt-4">
                <button
                  disabled={!isActive || walletBal < Number(plan.investmentAmount)}
                  className="w-full rounded-2xl bg-[#0B1120] py-3.5 text-[13px] font-black text-white transition active:scale-[0.98] disabled:opacity-40"
                >
                  {active ? "Réinvestir" : "Investir"} — {formatMoney(Number(plan.investmentAmount))}
                </button>
              </form>
              {!isActive && <p className="mt-2 text-center text-[11px] font-bold text-amber-600">Active d&apos;abord ton compte avec 2 500 FCFA</p>}
              {isActive && walletBal < Number(plan.investmentAmount) && <p className="mt-2 text-center text-[11px] font-bold text-rose-600">Solde insuffisant</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
