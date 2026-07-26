import { auth } from "@/lib/auth";
import { db } from "@/db";
import { users, wallets, transactions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { formatMoney } from "@/lib/utils";

export default async function WalletPage() {
  const session = await auth();
  let wallet: any = null;
  let txs: any[] = [];

  if (session?.user?.email) {
    const u = await db.select().from(users).where(eq(users.email, session.user.email)).limit(1);
    if (u[0]) {
      const w = await db.select().from(wallets).where(eq(wallets.userId, u[0].id)).limit(1);
      wallet = w[0];
      txs = await db.select().from(transactions).where(eq(transactions.userId, u[0].id)).orderBy(desc(transactions.createdAt)).limit(30);
    }
  }

  const bal = wallet ? Number(wallet.balance) : 300;
  const affili = wallet ? Number(wallet.affiliateEarnings || 0) : 0;
  const tasks = wallet ? Number(wallet.taskEarnings || 0) : 0;
  const deposits = wallet ? Number(wallet.totalDeposits || 0) : 0;
  const withdrawals = wallet ? Number(wallet.totalWithdrawals || 0) : 0;

  return (
    <div className="space-y-4">
      <div className="rounded-[24px] bg-[#0B1120] p-6 text-white">
        <p className="text-[11px] font-black tracking-[0.18em] text-slate-400">MON PORTEFEUILLE</p>
        <h1 className="mt-2 text-[30px] font-black">{formatMoney(bal)}</h1>
        <p className="mt-1 text-[13px] text-slate-400">Solde disponible · Gains temps réel</p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <WalletStat label="Affiliation" value={affili} />
          <WalletStat label="Tâches" value={tasks} />
          <WalletStat label="Dépôts" value={deposits} />
          <WalletStat label="Retraits" value={withdrawals} />
        </div>
      </div>

      <div className="rounded-[20px] border border-slate-200 bg-white p-4 afili-card">
        <p className="text-[14px] font-black text-slate-900">Historique complet</p>
        <div className="mt-3 space-y-2">
          {txs.length === 0 && <p className="text-[12px] text-slate-400">Aucune opération.</p>}
          {txs.map((t: any) => (
            <div key={t.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5 text-[12px]">
              <div>
                <p className="font-black text-slate-900">{t.type} · {t.method || ""}</p>
                <p className="text-[11px] text-slate-500">{t.description?.slice(0, 50)} · {new Date(t.createdAt).toLocaleDateString("fr-FR")}</p>
              </div>
              <div className="text-right">
                <p className={`font-black ${t.type === "withdrawal" ? "text-rose-600" : t.type === "deposit" ? "text-blue-600" : "text-emerald-600"}`}>{t.type === "withdrawal" ? "-" : "+"}{formatMoney(Number(t.amount))}</p>
                <StatusBadge status={t.status} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function WalletStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-white/10 p-3">
      <p className="text-[11px] text-slate-400">{label}</p>
      <p className="text-[15px] font-black">{value.toLocaleString("fr-FR")} F</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    completed: "bg-emerald-100 text-emerald-700",
    rejected: "bg-rose-100 text-rose-700",
    pending: "bg-amber-100 text-amber-700",
  };
  return <span className={`rounded-full px-2 py-0.5 text-[9px] font-black ${map[status] || map.pending}`}>{status}</span>;
}
