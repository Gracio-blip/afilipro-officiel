import Link from "next/link";
import { loginAction } from "@/lib/actions";

interface Props {
  searchParams?: Promise<{ error?: string; success?: string }>;
}

export default async function LoginPage({ searchParams }: Props) {
  const p = await searchParams;
  const isError = p?.error === "invalid";
  const isSuccess = p?.success === "1";

  return (
    <main className="grid min-h-screen place-items-center bg-[#F5F6FB] p-4">
      <div className="w-full max-w-[420px] rounded-[28px] border border-slate-200 bg-white p-6 shadow-xl">
        <Link href="/" className="text-[22px] font-black">
          <span className="text-[#0B2A4A]">Afili</span>
          <span className="text-[#F5B700]">Pro</span>
        </Link>
        <h1 className="mt-5 text-[26px] font-black text-slate-900">Connexion</h1>
        <p className="mt-1 text-[13px] text-slate-500">Accède à ton tableau de bord.</p>

        {/* ✅ SUCCESS BANNER — vert vif */}
        {isSuccess && (
          <div className="mt-4 flex items-center gap-3 rounded-2xl border-2 border-emerald-300 bg-emerald-50 px-4 py-3.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} className="h-4 w-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-[14px] font-black text-emerald-700">Connexion réussie !</p>
          </div>
        )}

        {/* ❌ ERROR BANNER */}
        {isError && (
          <div className="mt-4 flex items-center gap-3 rounded-2xl border-2 border-rose-200 bg-rose-50 px-4 py-3.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-500 text-[12px] font-black text-white">!</div>
            <p className="text-[14px] font-black text-rose-700">Email ou mot de passe incorrect</p>
          </div>
        )}

        {/* FORM */}
        <form action={loginAction} className="mt-6 space-y-3">
          <input
            name="email" type="email" placeholder="Email" required
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-[14px] font-bold outline-none focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
          />
          <input
            name="password" type="password" placeholder="Mot de passe" required
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-[14px] font-bold outline-none focus:border-slate-900 focus:ring-4 focus:ring-slate-100"
          />
          <button className="w-full rounded-2xl bg-[#0B1120] py-4 text-[14px] font-black text-white transition active:scale-[0.98]">
            Se connecter
          </button>
        </form>

        <p className="mt-5 text-center text-[12px] font-bold text-slate-500">
          Pas de compte ?{" "}
          <Link href="/register" className="text-slate-900 underline">Inscription</Link>
        </p>
      </div>
    </main>
  );
}
