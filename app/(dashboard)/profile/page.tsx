import { auth } from "@/lib/auth";
import { logoutAction } from "@/lib/actions";
import { db } from "@/db";
import { users, wallets } from "@/db/schema";
import { eq } from "drizzle-orm";
import { formatMoney } from "@/lib/utils";

export default async function ProfilePage() {
  const session = await auth();
  let user: any = null;
  let wallet: any = null;

  if (session?.user?.email) {
    const u = await db.select().from(users).where(eq(users.email, session.user.email)).limit(1);
    user = u[0];
    if (user) {
      const w = await db.select().from(wallets).where(eq(wallets.userId, user.id)).limit(1);
      wallet = w[0];
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 rounded-[24px] bg-[#0B1120] p-6 text-white">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-[#F5C453] text-xl font-black text-black">
          {(user?.name || "J").slice(0, 1).toUpperCase()}
        </div>
        <div>
          <h1 className="text-[20px] font-black">{user?.name || "Jacques"}</h1>
          <p className="text-[12px] text-slate-400">{user?.email || "jacques@demo.com"} · {wallet ? formatMoney(Number(wallet.balance)) : "300 FCFA"}</p>
          <span className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-[10px] font-black ${user?.isActive ? "bg-emerald-500 text-white" : "bg-amber-400 text-black"}`}>
            {user?.isActive ? "Compte actif" : "Inactif - dépôt 2 500 requis"}
          </span>
        </div>
      </div>

      <div className="rounded-[20px] border border-slate-200 bg-white p-5 afili-card">
        <div className="space-y-3 text-[13px] font-bold">
          <Row label="Email" value={user?.email || "-"} />
          <Row label="Téléphone" value={user?.phone || "-"} />
          <Row label="Code parrainage" value={user?.referralCode || "-"} />
          <Row label="Statut" value={user?.isActive ? "VIP actif" : "Inactif"} valueColor={user?.isActive ? "text-emerald-600" : "text-amber-600"} />
        </div>

        <form action={logoutAction} className="mt-6">
          <button className="w-full rounded-2xl bg-[#0B1120] py-3 text-[13px] font-black text-white transition active:scale-[0.98]">Déconnexion</button>
        </form>
      </div>
    </div>
  );
}

function Row({ label, value, valueColor = "text-slate-500" }: { label: string; value: string; valueColor?: string }) {
  return (
    <div className="flex justify-between border-b border-slate-100 py-2 last:border-0">
      <span className="text-slate-600">{label}</span>
      <span className={`${valueColor}`}>{value}</span>
    </div>
  );
}
