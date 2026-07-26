import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ArrowRight, CheckCircle2, ShieldCheck, Smartphone, TrendingUp, Users, Wallet } from "lucide-react";

export default async function HomePage() {
  const session = await auth();
  if (session?.user?.email) redirect("/dashboard");

  return (
    <main className="min-h-screen w-full bg-[#F5F6FB]">
      {/* Navbar */}
      <nav className="mx-auto flex max-w-[480px] items-center justify-between px-5 py-5">
        <div className="flex items-baseline gap-0.5 text-[24px] font-black tracking-tight">
          <span className="text-[#0B2A4A]">Afili</span>
          <span className="text-[#F5B700]">Pro</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-[13px] font-bold text-slate-600 hover:text-slate-900">Connexion</Link>
          <Link href="/register" className="rounded-full bg-[#0B1120] px-4 py-2 text-[13px] font-black text-white transition active:scale-95">S&apos;inscrire</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-[480px] px-5 pt-4 pb-10">
        <div className="afili-hero rounded-[32px] p-7 text-white shadow-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[12px] font-bold text-amber-300">
            <TrendingUp className="h-3.5 w-3.5" /> Plateforme #1 d&apos;affiliation
          </div>
          <h1 className="mt-5 text-[34px] font-black leading-[0.95] tracking-tight">
            Gagne de l&apos;argent avec les micro-tâches et le parrainage
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-slate-300">
            Inscris-toi avec <span className="font-bold text-amber-300">300 FCFA offerts</span>, active ton compte avec un dépôt de 2 500 FCFA et commence à gagner chaque jour.
          </p>

          <div className="mt-8 flex flex-col gap-3">
            <Link href="/register" className="flex items-center justify-center gap-2 rounded-2xl bg-[#F5C453] px-5 py-4 text-[15px] font-black text-black transition active:scale-[0.98]">
              Créer mon compte <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/login" className="flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-5 py-4 text-[15px] font-black text-white backdrop-blur-sm transition active:scale-[0.98]">
              J&apos;ai déjà un compte
            </Link>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-2xl bg-white/10 p-3">
              <p className="text-[18px] font-black text-amber-300">300 F</p>
              <p className="text-[10px] font-bold text-slate-300">Offert</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-3">
              <p className="text-[18px] font-black text-amber-300">300 F</p>
              <p className="text-[10px] font-bold text-slate-300">/ filleul</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-3">
              <p className="text-[18px] font-black text-amber-300">2 500 F</p>
              <p className="text-[10px] font-bold text-slate-300">Min dépôt</p>
            </div>
          </div>
        </div>

      </section>

      {/* Features */}
      <section className="mx-auto max-w-[480px] px-5 pb-24">
        <p className="mb-4 text-[12px] font-black tracking-[0.14em] text-[#9AA0B3]">POURQUOI NOUS REJOINDRE</p>
        <div className="grid gap-3">
          {[
            { icon: Wallet, title: "Portefeuille digital", desc: "Solde, dépôts, retraits en temps réel" },
            { icon: Users, title: "Parrainage", desc: "300 FCFA par filleul actif" },
            { icon: Smartphone, title: "Micro-tâches", desc: "Quiz, Telegram, Jeu des bouteilles, Lucky Spin" },
            { icon: ShieldCheck, title: "Sécurisé", desc: "Validation admin, anti-fraude, historique" },
          ].map((f) => (
            <div key={f.title} className="flex items-center gap-4 rounded-[20px] border border-slate-200 bg-white p-4 shadow-sm">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-900 text-white"><f.icon className="h-6 w-6" /></div>
              <div>
                <h3 className="text-[15px] font-black text-slate-900">{f.title}</h3>
                <p className="text-[12px] text-slate-500">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-[20px] bg-slate-900 p-5 text-white">
          <h3 className="text-[18px] font-black">Prêt à commencer ?</h3>
          <p className="mt-2 text-[13px] text-slate-300">Rejoins des milliers d&apos;utilisateurs qui gagnent chaque jour.</p>
          <Link href="/register" className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-[#F5C453] px-5 py-3.5 text-[14px] font-black text-black transition active:scale-[0.98]">Créer un compte gratuitement <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>
    </main>
  );
}
