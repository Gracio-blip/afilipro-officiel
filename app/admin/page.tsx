import { auth } from "@/lib/auth";
import { db } from "@/db";
import { transactions, users, wallets, investmentPlans } from "@/db/schema";
import { desc, eq, and, sql } from "drizzle-orm";
import { approveDeposit, rejectDeposit, approveWithdrawal, rejectWithdrawal, seedIfEmpty } from "@/lib/actions";
import { formatMoney } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  try { await seedIfEmpty(); } catch {}

  const session = await auth();
  const email = session?.user?.email;

  const [allUsers, pendingDeposits, pendingWithdrawals, recentTx, totalBal] = await Promise.all([
    db.select().from(users).orderBy(desc(users.createdAt)).limit(100),
    db.select().from(transactions).where(and(eq(transactions.type, "deposit"), eq(transactions.status, "pending"))).orderBy(desc(transactions.createdAt)).limit(30),
    db.select().from(transactions).where(and(eq(transactions.type, "withdrawal"), eq(transactions.status, "pending"))).orderBy(desc(transactions.createdAt)).limit(30),
    db.select().from(transactions).orderBy(desc(transactions.createdAt)).limit(25),
    db.select({ sum: sql<string>`COALESCE(SUM(CAST(${wallets.balance} AS DECIMAL)),0)` }).from(wallets),
  ]);

  return (
    <main className="min-h-screen bg-[#F5F6FB] p-4">
      <div className="mx-auto max-w-5xl space-y-5">
        <div className="rounded-[24px] bg-[#0B1120] p-6 text-white">
          <p className="text-[11px] font-black tracking-[0.18em] text-slate-400">ADMINISTRATION AFILIPRO</p>
          <h1 className="mt-2 text-[26px] font-black">Dashboard opérationnel</h1>
          <p className="mt-1 text-[13px] text-slate-400">Validation dépôts/retraits, gestion utilisateurs, anti-fraude.</p>
          {!email && <p className="mt-3 rounded-xl bg-amber-400 px-3 py-2 text-[12px] font-black text-black">Mode démo admin sans restriction · en production, restreindre aux rôles admin.</p>}

          <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
            <Stat label="Utilisateurs" value={String(allUsers.length)} />
            <Stat label="Solde total" value={`${Number(totalBal[0]?.sum || 0).toLocaleString("fr-FR")} F`} />
            <Stat label="Dépôts en attente" value={String(pendingDeposits.length)} tone="amber" />
            <Stat label="Retraits en attente" value={String(pendingWithdrawals.length)} tone="rose" />
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <section className="rounded-[20px] border border-slate-200 bg-white p-4 afili-card">
            <h2 className="text-[14px] font-black text-slate-900">Dépôts à valider</h2>
            <p className="text-[11px] text-slate-500">Approuver = créditer wallet + activer compte + bonus parrain 300 F</p>
            <div className="mt-4 space-y-3">
              {pendingDeposits.length === 0 && <p className="text-[12px] text-slate-400">Aucun dépôt en attente.</p>}
              {pendingDeposits.map((d: any) => (
                <div key={d.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <p className="text-[13px] font-black">{d.method} · {formatMoney(Number(d.amount))}</p>
                  <p className="text-[11px] text-slate-500">{d.phone} · {d.description} · {new Date(d.createdAt).toLocaleString("fr-FR")}</p>
                  <div className="mt-3 flex gap-2">
                    <form action={async () => { "use server"; await approveDeposit(d.id); }}>
                      <button className="rounded-full bg-emerald-600 px-4 py-1.5 text-[11px] font-black text-white transition active:scale-95">Approuver</button>
                    </form>
                    <form action={async () => { "use server"; await rejectDeposit(d.id, "Preuve invalide"); }}>
                      <button className="rounded-full bg-rose-600 px-4 py-1.5 text-[11px] font-black text-white transition active:scale-95">Refuser</button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[20px] border border-slate-200 bg-white p-4 afili-card">
            <h2 className="text-[14px] font-black text-slate-900">Retraits à valider</h2>
            <p className="text-[11px] text-slate-500">Approuver = payé. Refuser = remboursement automatique.</p>
            <div className="mt-4 space-y-3">
              {pendingWithdrawals.length === 0 && <p className="text-[12px] text-slate-400">Aucun retrait en attente.</p>}
              {pendingWithdrawals.map((w: any) => (
                <div key={w.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <p className="text-[13px] font-black">{w.method} · {formatMoney(Number(w.amount))} vers {w.phone}</p>
                  <p className="text-[11px] text-slate-500">{new Date(w.createdAt).toLocaleString("fr-FR")}</p>
                  <div className="mt-3 flex gap-2">
                    <form action={async () => { "use server"; await approveWithdrawal(w.id); }}>
                      <button className="rounded-full bg-slate-900 px-4 py-1.5 text-[11px] font-black text-white transition active:scale-95">Payer · Validé</button>
                    </form>
                    <form action={async () => { "use server"; await rejectWithdrawal(w.id, "Numéro incorrect"); }}>
                      <button className="rounded-full bg-amber-500 px-4 py-1.5 text-[11px] font-black text-black transition active:scale-95">Refuser + Rembourser</button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="rounded-[20px] border border-slate-200 bg-white p-4 afili-card">
          <h2 className="text-[14px] font-black text-slate-900">Utilisateurs ({allUsers.length})</h2>
          <div className="mt-3 grid gap-2">
            {allUsers.slice(0, 25).map((u: any) => (
              <div key={u.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-[12px]">
                <div>
                  <p className="font-black text-slate-900">{u.name || u.email} · {u.referralCode}</p>
                  <p className="text-[11px] text-slate-500">{u.email} · {u.phone || "no phone"} · parrain {u.referredById ? u.referredById.slice(0, 6) : "aucun"}</p>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black ${u.isActive ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>{u.isActive ? "Actif" : "Inactif"}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[20px] border border-slate-200 bg-white p-4 afili-card">
          <h2 className="text-[14px] font-black text-slate-900">Dernières transactions</h2>
          <div className="mt-3 space-y-1">
            {recentTx.map((t: any) => (
              <div key={t.id} className="flex justify-between border-b last:border-0 py-2 text-[11px]">
                <span className="font-bold text-slate-700">{t.type} {formatMoney(Number(t.amount))} {t.method || ""} · {t.status}</span>
                <span className="text-slate-400">{new Date(t.createdAt).toLocaleTimeString("fr-FR")}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function Stat({ label, value, tone = "slate" }: { label: string; value: string; tone?: "slate" | "amber" | "rose" }) {
  const bg = tone === "amber" ? "bg-amber-400/20" : tone === "rose" ? "bg-rose-500/20" : "bg-white/10";
  const text = tone === "amber" ? "text-amber-300" : tone === "rose" ? "text-rose-200" : "text-white";
  return (
    <div className={`rounded-2xl ${bg} p-3`}>
      <p className="text-[11px] text-slate-400">{label}</p>
      <p className={`text-[16px] font-black ${text}`}>{value}</p>
    </div>
  );
}
