import AppShell from "@/components/afili/AppShell";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { users, wallets } from "@/db/schema";
import { eq } from "drizzle-orm";
import { seedIfEmpty } from "@/lib/actions";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  try { await seedIfEmpty(); } catch {}

  let balance = "300 FCFA";
  let name = "Utilisateur";
  let isActive = false;

  try {
    const session = await auth();
    const email = session?.user?.email;
    if (email) {
      const uRows = await db.select().from(users).where(eq(users.email, email)).limit(1);
      const u = uRows[0];
      if (u) {
        const wRows = await db.select().from(wallets).where(eq(wallets.userId, u.id)).limit(1);
        const w = wRows[0];
        const bal = w ? Number(w.balance) : 300;
        balance = `${bal.toLocaleString("fr-FR")} FCFA`;
        name = u.name || email.split("@")[0];
        isActive = !!u.isActive;
      }
    }
  } catch {}

  return (
    <AppShell balance={balance} name={name} isActive={isActive}>
      {children}
    </AppShell>
  );
}
