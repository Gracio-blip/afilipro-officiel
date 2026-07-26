import { auth } from "@/lib/auth";
import { db } from "@/db";
import { users, transactions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { formatMoney } from "@/lib/utils";

export default async function HistoryPage() {
  const session = await auth();
  let txs: any[] = [];

  if (session?.user?.email) {
    const u = await db.select().from(users).where(eq(users.email, session.user.email)).limit(1);
    if (u[0]) {
      txs = await db.select().from(transactions).where(eq(transactions.userId, u[0].id)).orderBy(desc(transactions.createdAt)).limit(100);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-[22px] border border-slate-200 bg-white p-6 afili-card">
        <h1 className="text-[22px] font-black text-slate-900">Historique</h1>
        <p className="text-[13px] text-slate-500">Dépôts, retraits, gains, parrainage, investissements.</p>
      </div>

      <div className="rounded-[20px] border border-slate-200 bg-white p-3 afili-card">
        {txs.length === 0 && <p className="p-4 text-[13px] text-slate-400">Aucune activité.</p>}
        {txs.map((t: any) => (
          <div key={t.id} className="flex items-center justify-between border-b last:border-0 px-2 py-3">
            <div>
              <p className="text-[13px] font-black text-slate-900">{t.type.toUpperCase()} · {t.method || ""} · {formatMoney(Number(t.amount))}</p>
              <p className="text-[11px] text-slate-500">{t.description} · {new Date(t.createdAt).toLocaleString("fr-FR")}</p>
            </div>
            <StatusBadge status={t.status} />
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    completed: "bg-emerald-100 text-emerald-700",
    rejected: "bg-rose-100 text-rose-700",
    pending: "bg-amber-100 text-amber-700",
  };
  return <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black ${map[status] || map.pending}`}>{status}</span>;
}
