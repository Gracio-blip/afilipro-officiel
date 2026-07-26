import { auth } from "@/lib/auth";
import { db } from "@/db";
import { users, wallets } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { formatMoney } from "@/lib/utils";
import { CopyButton } from "./CopyButton";

const REFERRAL_BONUS = 300;

export default async function ReferralPage() {
  let refCode = "MONCODE01";
  let filleuls: any[] = [];
  let affiliateGains = 0;

  try {
    const session = await auth();
    const email = session?.user?.email;
    if (email) {
      const uRows = await db.select().from(users).where(eq(users.email, email)).limit(1);
      const user = uRows[0];
      if (user) {
        refCode = user.referralCode ?? refCode;
        const wRows = await db.select().from(wallets).where(eq(wallets.userId, user.id)).limit(1);
        affiliateGains = Number(wRows[0]?.affiliateEarnings ?? 0);
        filleuls = await db.select().from(users).where(eq(users.referredById, user.id)).orderBy(desc(users.createdAt));
      }
    }
  } catch {}

  const actifs = filleuls.filter((f) => f.isActive).length;
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? "https://monsite.com";
  const link = `${origin}/ref/${refCode}`;

  return (
    <div className="space-y-4">
      {/* HEADER */}
      <div className="rounded-[24px] bg-gradient-to-br from-violet-600 to-[#5B21B6] p-6 text-white">
        <p className="text-[11px] font-black tracking-[0.18em] text-violet-200">MON PARRAINAGE</p>
        <h1 className="mt-2 text-[26px] font-black leading-tight">Invitez vos proches</h1>
        <p className="mt-2 text-[13px] text-violet-100">
          {formatMoney(REFERRAL_BONUS)} crédité automatiquement à chaque filleul activé.
        </p>
        <div className="mt-5 rounded-2xl bg-white p-4">
          <p className="text-[10px] font-black tracking-[0.12em] text-slate-400">MON LIEN UNIQUE</p>
          <p className="mt-1 break-all text-[13px] font-black text-slate-900">{link}</p>
          <p className="mt-0.5 text-[11px] font-bold text-slate-500">Code : {refCode}</p>
          <CopyButton text={link} />
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Filleuls" value={String(filleuls.length)} />
        <StatCard label="Actifs" value={String(actifs)} green />
        <StatCard label="Gains" value={`${affiliateGains.toLocaleString("fr-FR")} F`} />
      </div>

      {/* LIST */}
      <div className="rounded-[20px] border border-slate-200 bg-white p-4">
        <p className="mb-3 text-[14px] font-black text-slate-900">Mes filleuls</p>
        {filleuls.length === 0 ? (
          <div className="rounded-2xl bg-slate-50 p-5 text-center">
            <p className="text-[14px] font-black text-slate-500">Aucun filleul encore</p>
            <p className="mt-1 text-[12px] text-slate-400">
              Partage ton lien pour gagner {formatMoney(REFERRAL_BONUS)} par filleul activé.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filleuls.map((f) => (
              <div key={f.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-3">
                <div className="flex items-center gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-[#1E3A5F] text-[12px] font-black text-white">
                    {(f.name ?? f.email ?? "??").slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-[13px] font-black text-slate-900">{f.name ?? f.email}</p>
                    <p className="text-[11px] text-slate-500">
                      {new Date(f.createdAt).toLocaleDateString("fr-FR")} · {f.isActive ? "Actif" : "Inactif"}
                    </p>
                  </div>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-black ${f.isActive ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                  {f.isActive ? formatMoney(REFERRAL_BONUS) : "0 F"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, green = false }: { label: string; value: string; green?: boolean }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center">
      <p className="text-[11px] font-bold text-slate-400">{label}</p>
      <p className={`mt-1 text-[18px] font-black ${green ? "text-emerald-600" : "text-slate-900"}`}>{value}</p>
    </div>
  );
}
