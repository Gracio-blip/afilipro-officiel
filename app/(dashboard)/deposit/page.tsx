import { createDeposit } from "@/lib/actions";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { users, transactions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { paymentMethods, MIN_DEPOSIT } from "@/lib/app-data";
import { formatMoney } from "@/lib/utils";

// GMT+1 (Lomé, Togo — heure fixe sans changement horaire)
function getLomeTime(): string {
  const now = new Date();
  const lomeMins = now.getUTCHours() * 60 + now.getUTCMinutes() + 60; // UTC+1
  const h = Math.floor((lomeMins / 60) % 24);
  const m = now.getUTCMinutes();
  const s = now.getUTCSeconds();
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")} (Lomé GMT+1)`;
}

export default async function DepositPage() {
  const session = await auth();
  let history: any[] = [];

  if (session?.user?.email) {
    const u = await db.select().from(users).where(eq(users.email, session.user.email)).limit(1);
    if (u[0]) {
      const all = await db.select().from(transactions).where(eq(transactions.userId, u[0].id)).orderBy(desc(transactions.createdAt));
      history = all.filter((t) => t.type === "deposit");
    }
  }

  return (
    <div className="space-y-4">
      {/* HEADER — no instructions */}
      <div className="rounded-[24px] bg-gradient-to-br from-violet-700 to-[#5B21B6] p-6 text-white">
        <p className="text-[11px] font-black tracking-[0.18em] text-violet-200">EFFECTUER UN DÉPÔT</p>
        <h1 className="mt-2 text-[24px] font-black leading-tight">Activer mon compte</h1>
        <div className="mt-2 flex items-center justify-between">
          <p className="text-[13px] text-violet-100">Minimum {formatMoney(MIN_DEPOSIT)}</p>
          <span className="rounded-full bg-white/15 px-3 py-1 text-[11px] font-black text-white">⏰ {getLomeTime()}</span>
        </div>
      </div>

      {/* FORM — clean, no instructions block */}
      <form action={createDeposit} className="rounded-[22px] border border-slate-200 bg-white p-5 afili-card">
        <h2 className="mb-4 text-[15px] font-black text-slate-900">Nouveau dépôt</h2>
        <div className="grid gap-3">
          <div className="grid grid-cols-2 gap-2">
            {paymentMethods.map((m, i) => (
              <label key={m.id} className="flex cursor-pointer items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-[12px] font-black transition hover:border-violet-400 has-[input:checked]:border-violet-600 has-[input:checked]:bg-violet-50">
                <span>{m.name}</span>
                <input type="radio" name="method" value={m.name} defaultChecked={i === 0} className="accent-violet-600" />
              </label>
            ))}
          </div>
          <input name="phone" placeholder="Numéro de téléphone utilisé" required className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-[14px] font-bold outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100" />
          <input name="amount" type="number" min={MIN_DEPOSIT} defaultValue={MIN_DEPOSIT} required className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-[14px] font-black outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-100" />
          <button className="w-full rounded-2xl bg-[#0B1120] py-4 text-[14px] font-black text-white transition active:scale-[0.98]">Envoyer pour vérification</button>
        </div>
      </form>

      {/* HISTORY */}
      <div className="rounded-[20px] border border-slate-200 bg-white p-4 afili-card">
        <p className="mb-3 text-[13px] font-black text-slate-900">Historique dépôts</p>
        {history.length === 0 ? (
          <p className="text-[12px] text-slate-400">Aucun dépôt pour l&apos;instant.</p>
        ) : (
          <div className="space-y-2">
            {history.map((h: any) => {
              const d = new Date(h.createdAt);
              const heure = d.toLocaleString("fr-FR", { timeZone: "Africa/Lome", hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "2-digit" });
              return (
                <div key={h.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5 text-[12px]">
                  <div>
                    <p className="font-bold text-slate-700">{h.method} · {formatMoney(Number(h.amount))}</p>
                    <p className="text-[11px] text-slate-400">{heure} (Lomé)</p>
                  </div>
                  <StatusPill status={h.status} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const cfg: Record<string, [string, string]> = {
    completed: ["bg-emerald-100 text-emerald-700", "Validé"],
    rejected:  ["bg-rose-100 text-rose-700", "Refusé"],
    pending:   ["bg-amber-100 text-amber-700", "En attente"],
  };
  const [cls, label] = cfg[status] ?? cfg.pending;
  return <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black ${cls}`}>{label}</span>;
}
