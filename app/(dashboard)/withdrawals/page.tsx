import { requestWithdrawal } from "@/lib/actions";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { users, transactions, wallets } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { paymentMethods } from "@/lib/app-data";
import { formatMoney, getMinWithdrawal } from "@/lib/utils";

function getLomeTime(date: Date): string {
  return date.toLocaleString("fr-FR", {
    timeZone: "Africa/Lome",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    day: "2-digit", month: "2-digit", year: "2-digit",
  }) + " (Lomé)";
}

export default async function WithdrawalsPage() {
  const session = await auth();
  let walletBal = 0;
  let history: any[] = [];
  let currentMin = 1500;

  if (session?.user?.email) {
    const u = await db.select().from(users).where(eq(users.email, session.user.email)).limit(1);
    if (u[0]) {
      const w = await db.select().from(wallets).where(eq(wallets.userId, u[0].id)).limit(1);
      walletBal = Number(w[0]?.taskBalance ?? 0);
      currentMin = w[0] ? getMinWithdrawal(w[0]) : 1500;
      const all = await db.select().from(transactions).where(eq(transactions.userId, u[0].id)).orderBy(desc(transactions.createdAt));
      history = all.filter((t) => t.type === "withdrawal");
    }
  }

  const nextMin = currentMin * 2;
  const canWithdraw = walletBal >= currentMin;

  return (
    <div className="space-y-4">
      {/* HEADER */}
      <div className="rounded-[24px] bg-[#0B1120] p-6 text-white">
        <p className="text-[11px] font-black tracking-[0.18em] text-slate-400">RETRAIT DES GAINS</p>
        <h1 className="mt-2 text-[26px] font-black">Retirer</h1>
        <div className="mt-5 rounded-2xl bg-white/[0.06] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[12px] text-slate-400">Solde disponible (tâches)</p>
              <p className="text-[26px] font-black text-[#F5C453]">{formatMoney(walletBal)}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-400">Heure Lomé</p>
              <p className="text-[11px] font-black text-slate-300">{getLomeTime(new Date())}</p>
            </div>
          </div>
          {!canWithdraw && (
            <p className="mt-2 text-[11px] font-black text-amber-400">
              Solde insuffisant · Minimum actuel : {formatMoney(currentMin)}
            </p>
          )}
        </div>
        {/* Progression paliers */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-emerald-500/20 p-3">
            <p className="text-[10px] font-bold text-emerald-300">Min retrait actuel</p>
            <p className="text-[16px] font-black text-emerald-200">{formatMoney(currentMin)}</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-3">
            <p className="text-[10px] font-bold text-slate-400">Prochain minimum</p>
            <p className="text-[16px] font-black text-slate-200">{formatMoney(nextMin)}</p>
          </div>
        </div>
      </div>

      {/* FORM */}
      <form action={requestWithdrawal} className="rounded-[22px] border border-slate-200 bg-white p-5 afili-card">
        <h2 className="mb-4 text-[15px] font-black text-slate-900">Demander un retrait</h2>
        <div className="grid gap-3">
          <div className="grid grid-cols-2 gap-2">
            {paymentMethods.map((m, i) => (
              <label key={m.id} className="flex cursor-pointer items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-[12px] font-black transition hover:border-slate-900 has-[input:checked]:border-slate-900 has-[input:checked]:bg-slate-900 has-[input:checked]:text-white">
                <span>{m.name}</span>
                <input type="radio" name="method" value={m.name} defaultChecked={i === 0} />
              </label>
            ))}
          </div>
          <input name="amount" type="number" min={currentMin} placeholder={`Min ${currentMin} FCFA`} required className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-[14px] font-bold outline-none focus:border-slate-900" />
          <input name="phone" placeholder="Numéro pour recevoir" required className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-[14px] font-bold outline-none focus:border-slate-900" />
          <button disabled={!canWithdraw} className="w-full rounded-2xl bg-[#0B1120] py-4 text-[14px] font-black text-white transition active:scale-[0.98] disabled:opacity-40">
            Demander le retrait
          </button>
          <p className="text-center text-[11px] text-slate-400">Validé ou refusé par l&apos;admin · Remboursement auto si refus</p>
        </div>
      </form>

      {/* HISTORY */}
      <div className="rounded-[20px] border border-slate-200 bg-white p-4 afili-card">
        <p className="mb-3 text-[13px] font-black text-slate-900">Historique retraits</p>
        {history.length === 0 ? (
          <p className="text-[12px] text-slate-400">Aucun retrait.</p>
        ) : (
          <div className="space-y-2">
            {history.map((h: any) => (
              <div key={h.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5 text-[12px]">
                <div>
                  <p className="font-bold text-slate-700">{h.method} · {formatMoney(Number(h.amount))}</p>
                  <p className="text-[11px] text-slate-400">{getLomeTime(new Date(h.createdAt))}</p>
                </div>
                <StatusPill status={h.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const cfg: Record<string, [string, string]> = {
    completed: ["bg-emerald-100 text-emerald-700", "Payé"],
    rejected:  ["bg-rose-100 text-rose-700", "Refusé"],
    pending:   ["bg-amber-100 text-amber-700", "En attente"],
  };
  const [cls, label] = cfg[status] ?? cfg.pending;
  return <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black ${cls}`}>{label}</span>;
}
