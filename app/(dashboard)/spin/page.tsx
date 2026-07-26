import { auth } from "@/lib/auth";
import { db } from "@/db";
import { users, spinHistory, wallets } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { formatMoney } from "@/lib/utils";
import SpinWheel from "./SpinWheel";

function lome(d: Date) {
  return d.toLocaleString("fr-FR", {
    timeZone: "Africa/Lome",
    day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
  }) + " (Lomé)";
}

export default async function SpinPage() {
  const session = await auth();
  let isActive = false;
  let attemptsLeft = 3;
  let taskBalance = 0;
  let history: any[] = [];

  if (session?.user?.email) {
    const u = await db.select().from(users).where(eq(users.email, session.user.email)).limit(1);
    if (u[0]) {
      isActive = !!u[0].isActive;
      const w = await db.select().from(wallets).where(eq(wallets.userId, u[0].id)).limit(1);
      taskBalance = Number(w[0]?.taskBalance ?? 0);

      const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const allSpins = await db.select().from(spinHistory).where(eq(spinHistory.userId, u[0].id)).orderBy(desc(spinHistory.createdAt));
      const used = allSpins.filter(s => new Date(s.createdAt!) >= since24h).length;
      attemptsLeft = Math.max(0, 3 - used);
      history = allSpins.slice(0, 15);
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-[24px] bg-gradient-to-br from-amber-500 to-orange-600 p-6 text-white">
        <p className="text-[11px] font-black tracking-[0.18em] text-amber-100">LUCKY SPIN</p>
        <h1 className="mt-2 text-[26px] font-black">Roue de la fortune</h1>
        <p className="mt-2 text-[13px] text-amber-50">3 tentatives par 24h · Compte actif requis</p>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-2xl bg-white/20 p-3">
            <p className="text-[18px] font-black">{attemptsLeft}/3</p>
            <p className="text-[10px] text-amber-100">Tentatives</p>
          </div>
          <div className="rounded-2xl bg-white/20 p-3">
            <p className="text-[18px] font-black">500 F</p>
            <p className="text-[10px] text-amber-100">Rare</p>
          </div>
          <div className="rounded-2xl bg-white/20 p-3">
            <p className="text-[18px] font-black">800 F</p>
            <p className="text-[10px] text-amber-100">Très rare</p>
          </div>
        </div>
        {!isActive && (
          <p className="mt-4 rounded-2xl bg-rose-500/30 px-3 py-2 text-[12px] font-bold text-rose-100">
            ⛔ Dépôt de 2 500 FCFA requis pour jouer au Lucky Spin
          </p>
        )}
      </div>

      {/* Solde */}
      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 afili-card flex justify-between items-center">
        <p className="text-[13px] font-bold text-slate-500">Solde tâches</p>
        <p className="text-[18px] font-black text-slate-900">{formatMoney(taskBalance)}</p>
      </div>

      {/* Wheel */}
      <div className="rounded-[22px] border border-slate-200 bg-white p-5 afili-card">
        <SpinWheel canPlay={isActive} initialLeft={attemptsLeft} />
      </div>

      {/* Probabilities — no visible rules text */}
      <div className="rounded-[20px] border border-slate-200 bg-white p-4 afili-card">
        <p className="mb-3 text-[13px] font-black text-slate-900">Chances de gains</p>
        <div className="space-y-2">
          {[
            { label: "Pas de gain", prob: "60%", w: "60%", color: "bg-slate-300" },
            { label: "500 FCFA",    prob: "27%", w: "27%", color: "bg-violet-400" },
            { label: "800 FCFA",    prob: "13%", w: "13%", color: "bg-amber-400" },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-3">
              <span className="w-24 text-[12px] font-black text-slate-800">{item.label}</span>
              <div className="flex-1 h-2 rounded-full bg-slate-100">
                <div className={`h-2 rounded-full ${item.color}`} style={{ width: item.w }} />
              </div>
              <span className="w-10 text-right text-[12px] font-bold text-slate-500">{item.prob}</span>
            </div>
          ))}
        </div>
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="rounded-[20px] border border-slate-200 bg-white p-4 afili-card">
          <p className="mb-3 text-[13px] font-black text-slate-900">Historique Lucky Spin</p>
          <div className="space-y-2">
            {history.map((s: any) => (
              <div key={s.id} className="flex justify-between rounded-xl bg-slate-50 px-3 py-2 text-[12px]">
                <span className="text-slate-500">{lome(new Date(s.createdAt))}</span>
                <span className={`font-black ${s.reward > 0 ? "text-emerald-600" : "text-slate-400"}`}>
                  {s.reward > 0 ? `+${formatMoney(s.reward)} 🎉` : "Perdu"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
