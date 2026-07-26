import { ArrowRight, DollarSign, Users, WalletMinimal, Lock, TrendingUp } from "lucide-react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { users, wallets, userInvestments, investmentPlans } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { MIN_DEPOSIT, liveFeedMock } from "@/lib/app-data";
import { formatMoney, getMinWithdrawal } from "@/lib/utils";
import { seedIfEmpty } from "@/lib/actions";
import LiveFeed from "@/components/afili/LiveFeed";

async function getData() {
  try { await seedIfEmpty(); } catch {}
  const session = await auth();
  const email = session?.user?.email;
  if (!email) {
    return { name: "Jacques", balance: 0, taskBalance: 0, investBalance: 0, isActive: false, live: liveFeedMock, totalAffiliate: 0, minWithdrawal: 1500, nextMin: 3000, investments: [] };
  }

  const uRows = await db.select().from(users).where(eq(users.email, email)).limit(1);
  const user = uRows[0];
  if (!user) return { name: "Jacques", balance: 0, taskBalance: 0, investBalance: 0, isActive: false, live: liveFeedMock, totalAffiliate: 0, minWithdrawal: 1500, nextMin: 3000, investments: [] };

  const wRows = await db.select().from(wallets).where(eq(wallets.userId, user.id)).limit(1);
  const wallet = wRows[0];
  const balance = Number(wallet?.balance ?? 0);
  const taskBalance = Number(wallet?.taskBalance ?? 0);
  const investBalance = Number(wallet?.investBalance ?? 0);
  const minW = getMinWithdrawal(wallet ?? {});

  const invRows = await db.select().from(userInvestments).where(eq(userInvestments.userId, user.id)).orderBy(desc(userInvestments.startedAt));
  const allPlans = await db.select().from(investmentPlans);

  const investments = invRows.map((inv: any) => ({
    ...inv,
    plan: allPlans.find((p: any) => p.id === inv.planId) ?? { name: "Plan", durationDays: 60, dailyReward: "0" },
  }));

  return {
    name: user.name || email.split("@")[0],
    balance, taskBalance, investBalance,
    isActive: !!user.isActive,
    live: liveFeedMock,
    totalAffiliate: Number(wallet?.affiliateEarnings ?? 0),
    minWithdrawal: minW,
    nextMin: minW * 2,
    investments,
  };
}

export default async function DashboardPage() {
  const data = await getData();

  return (
    <div className="space-y-4">
      {/* Hero */}
      <section className="afili-hero relative overflow-hidden rounded-[28px] px-5 py-6 text-white">
        <h1 className="text-[28px] font-black leading-tight tracking-tight">
          Bonjour, {data.name} <span className="text-[24px]">👋</span>
        </h1>
        <p className="mt-2 text-[14px] text-slate-400">
          {data.isActive ? "Ton compte est actif. Continue à gagner." : "Active ton compte avec un dépôt de 2 500 FCFA."}
        </p>
        <div className="mt-5 rounded-[20px] border border-white/10 bg-white/[0.06] px-5 py-5">
          <div className="flex items-center justify-between">
            <p className="text-[13px] text-slate-400">Solde total</p>
            <WalletMinimal className="h-5 w-5 text-[#F5C453]" />
          </div>
          <p className="mt-1 text-[32px] font-black tracking-tight text-[#F5C453]">{formatMoney(data.balance)}</p>
          {!data.isActive && (
            <Link href="/deposit" className="mt-3 inline-flex items-center gap-1 rounded-full bg-amber-500 px-3 py-1.5 text-[11px] font-black text-black">
              Activer maintenant <ArrowRight className="h-3 w-3" />
            </Link>
          )}
        </div>
      </section>

      {/* Activation banner */}
      {!data.isActive && (
        <Link href="/deposit" className="flex items-center gap-4 rounded-[22px] border border-violet-100 bg-[#F5F3FF] px-4 py-4 afili-card active:scale-[0.99]">
          <div className="grid h-13 w-13 shrink-0 place-items-center rounded-2xl bg-[#5B21B6] text-white">
            <WalletMinimal className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <p className="text-[11px] font-black tracking-[0.12em] text-violet-600">ACTIVATION REQUISE</p>
            <p className="text-[17px] font-black leading-tight text-slate-900">Effectuez votre premier dépôt</p>
            <p className="mt-0.5 text-[13px] text-slate-500">{formatMoney(MIN_DEPOSIT)} · Mixx by Yas · Moov Money</p>
          </div>
          <ArrowRight className="h-5 w-5 shrink-0 text-slate-400" />
        </Link>
      )}

      {/* Quick access */}
      <section>
        <p className="mb-3 px-1 text-[12px] font-black tracking-[0.14em] text-[#9AA0B3]">ACCÈS RAPIDE</p>
        <div className="grid grid-cols-2 gap-3">
          <QuickCard href="/missions" icon={DollarSign} title="Gagner" subtitle="50 FCFA / tâche" gradient="from-emerald-500 to-emerald-600" />
          <QuickCard href="/referral" icon={Users} title="Parrainage" subtitle={`${data.totalAffiliate.toLocaleString("fr-FR")} F`} gradient="from-violet-600 to-[#5B21B6]" />
          <QuickCard href="/investments" icon={<span className="text-[20px]">♛</span>} title="VIP" subtitle="Investissements" gradient="from-amber-400 to-orange-500" />
          <QuickCard href="/spin" icon={<span className="text-[20px]">🎰</span>} title="Lucky Spin" subtitle="3 tentatives/24h" gradient="from-slate-700 to-slate-900" />
        </div>
      </section>

      {/* Deposit / Withdrawal cards */}
      <section className="grid grid-cols-2 gap-3">
        <Link href="/deposit" className="relative overflow-hidden rounded-[20px] bg-gradient-to-br from-violet-700 to-[#6D28D9] p-5 text-white active:scale-[0.98]">
          <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/10" />
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/15"><WalletMinimal className="h-5 w-5" /></div>
          <p className="mt-5 text-[18px] font-black">Dépôt</p>
          <p className="text-[12px] text-violet-200">Mixx by Yas / Moov</p>
        </Link>
        <Link href="/withdrawals" className="relative overflow-hidden rounded-[20px] bg-gradient-to-br from-slate-800 to-[#0F1A2E] p-5 text-white active:scale-[0.98]">
          <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/5" />
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/10"><span className="text-lg">🏛</span></div>
          <p className="mt-5 text-[18px] font-black">Retrait</p>
          <p className="text-[12px] text-slate-400">Min {formatMoney(data.minWithdrawal)}</p>
        </Link>
      </section>

      {/* Two wallets */}
      <section className="grid gap-3 md:grid-cols-2">
        {/* Tasks wallet */}
        <div className="rounded-[22px] border border-slate-200 bg-white p-5 afili-card">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
            <p className="text-[11px] font-black tracking-[0.1em] text-emerald-600">TÂCHES & PARRAINAGE</p>
          </div>
          <p className="text-[26px] font-black text-slate-900">{formatMoney(data.taskBalance)}</p>
          <p className="text-[11px] text-slate-500 mt-1">Gains tâches · Bonus · Commissions</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-emerald-50 p-2.5">
              <p className="text-[10px] font-bold text-emerald-600">Min retrait</p>
              <p className="text-[13px] font-black text-emerald-800">{formatMoney(data.minWithdrawal)}</p>
            </div>
            <div className="rounded-xl bg-slate-50 p-2.5">
              <p className="text-[10px] font-bold text-slate-500">Prochain min</p>
              <p className="text-[13px] font-black text-slate-800">{formatMoney(data.nextMin)}</p>
            </div>
          </div>
          <Link href="/withdrawals" className="mt-3 block w-full rounded-2xl bg-emerald-600 py-3 text-center text-[12px] font-black text-white">
            Retirer
          </Link>
        </div>

        {/* Investment wallet */}
        <div className="rounded-[22px] border border-slate-200 bg-white p-5 afili-card">
          <div className="flex items-center gap-2 mb-3">
            <Lock className="h-5 w-5 text-violet-600" />
            <p className="text-[11px] font-black tracking-[0.1em] text-violet-600">INVESTISSEMENTS</p>
          </div>
          <p className="text-[26px] font-black text-slate-900">{formatMoney(data.investBalance)}</p>
          <p className="text-[11px] text-slate-500 mt-1">Bloqué jusqu&apos;à fin du plan</p>
          {data.investments.length === 0 ? (
            <p className="mt-3 text-[11px] text-slate-400">Aucun plan actif.</p>
          ) : (
            <div className="mt-3 space-y-2">
              {data.investments.slice(0, 2).map((inv: any) => {
                const progress = Math.min(100, Math.round(((inv.daysClaimed ?? 0) / (inv.plan?.durationDays ?? 60)) * 100));
                const daysLeft = Math.max(0, (inv.plan?.durationDays ?? 60) - (inv.daysClaimed ?? 0));
                return (
                  <div key={inv.id} className="rounded-xl bg-violet-50 p-3">
                    <div className="flex justify-between text-[11px] font-black">
                      <span className="text-violet-700">{inv.plan?.name ?? "Plan"}</span>
                      <span className="text-violet-500">{daysLeft}j restants</span>
                    </div>
                    <div className="mt-1.5 h-2 rounded-full bg-violet-100">
                      <div className="h-2 rounded-full bg-violet-600" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <Link href="/investments" className="mt-3 block w-full rounded-2xl bg-violet-600 py-3 text-center text-[12px] font-black text-white">
            Voir les plans
          </Link>
        </div>
      </section>

      {/* Live feed */}
      <LiveFeed items={data.live} />
    </div>
  );
}

function QuickCard({ href, icon: Icon, title, subtitle, gradient }: any) {
  return (
    <Link href={href} className={`relative overflow-hidden rounded-[20px] bg-gradient-to-br ${gradient} p-4 text-white shadow-md active:scale-[0.98]`}>
      <div className="absolute -right-5 -top-5 h-20 w-20 rounded-full bg-white/10" />
      <div className="relative z-10 grid h-8 w-8 place-items-center rounded-xl bg-white/15">
        {typeof Icon === "function" ? <Icon className="h-5 w-5" /> : Icon}
      </div>
      <p className="relative z-10 mt-8 text-[17px] font-black">{title}</p>
      <p className="relative z-10 text-[12px] text-white/80">{subtitle}</p>
    </Link>
  );
}
