import Link from "next/link";
import { registerUser } from "@/lib/actions";
import { Suspense } from "react";

function RegisterContent({ ref }: { ref: string }) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#F5F6FB] p-4">
      <div className="w-full max-w-[420px] rounded-[28px] border border-slate-200 bg-white p-6 shadow-xl">
        <Link href="/" className="text-[22px] font-black">
          <span className="text-[#0B2A4A]">Afili</span>
          <span className="text-[#F5B700]">Pro</span>
        </Link>
        <h1 className="mt-5 text-[26px] font-black text-slate-900">Créer un compte</h1>
        <p className="mt-1 text-[13px] text-slate-500">300 FCFA offerts · Activation 2 500 FCFA · Parrainage 300 F</p>
        {ref && <p className="mt-3 rounded-xl bg-violet-50 px-3 py-2 text-[12px] font-black text-violet-700">Code parrain: {ref}</p>}
        <form action={registerUser} className="mt-5 space-y-3">
          <input type="hidden" name="refCode" defaultValue={ref} />
          <input name="name" placeholder="Nom complet" required className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-[14px] font-bold outline-none focus:border-slate-900" />
          <input name="phone" placeholder="Téléphone Mobile Money" required className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-[14px] font-bold outline-none focus:border-slate-900" />
          <input name="email" type="email" placeholder="Email" required className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-[14px] font-bold outline-none focus:border-slate-900" />
          <input name="password" type="password" placeholder="Mot de passe (min 6)" required minLength={6} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-[14px] font-bold outline-none focus:border-slate-900" />
          <button className="w-full rounded-2xl bg-[#0B1120] py-4 text-[14px] font-black text-white transition active:scale-[0.98]">S&apos;inscrire · 300 F offerts</button>
        </form>
        <p className="mt-5 text-center text-[12px] font-bold text-slate-500">Déjà compte ? <Link href="/login" className="text-slate-900 underline">Connexion</Link></p>
      </div>
    </main>
  );
}

interface PageProps {
  searchParams?: Promise<{ ref?: string }>;
}

export default async function RegisterPage({ searchParams }: PageProps) {
  const params = await searchParams;
  return (
    <Suspense fallback={<div className="grid min-h-screen place-items-center"><p>Chargement...</p></div>}>
      <RegisterContent ref={params?.ref || ""} />
    </Suspense>
  );
}
