import { Download, FileText, ShieldCheck } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Cahier des charges — AfiliPro",
  description: "Cahier des charges fonctionnel et technique de la plateforme AfiliPro (PDF).",
};

export default function CahierDesChargesPage() {
  return (
    <main className="min-h-screen bg-[#F5F6FB] px-4 py-10">
      <div className="mx-auto max-w-[560px] space-y-5">
        <Link href="/" className="inline-flex items-center gap-2 text-[13px] font-black text-slate-500 hover:text-slate-900">
          ← Retour au site
        </Link>

        <div className="rounded-[28px] bg-[#0B1120] p-7 text-white shadow-2xl">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#F5C453] text-[#0B1120]">
            <FileText className="h-7 w-7" />
          </div>
          <p className="mt-5 text-[11px] font-black tracking-[0.18em] text-[#F5C453]">DOCUMENT OFFICIEL · PDF</p>
          <h1 className="mt-2 text-[30px] font-black leading-tight">Cahier des charges AfiliPro</h1>
          <p className="mt-3 text-[14px] leading-6 text-slate-300">
            19 chapitres détaillés : authentification, activation 2 500 FCFA, portefeuille double,
            retraits progressifs, parrainage, investissements VIP, micro-tâches, jeux, administration,
            notifications Telegram, sécurité, architecture et déploiement.
          </p>

          <div className="mt-6 flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 text-[12px] text-slate-300">
            <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-300" />
            Généré automatiquement depuis le code source — version 1.0
          </div>

          <a
            href="/cahier-des-charges-afilipro.pdf"
            download="cahier-des-charges-afilipro.pdf"
            className="mt-6 flex items-center justify-center gap-2 rounded-2xl bg-[#F5C453] px-5 py-4 text-[15px] font-black text-[#0B1120] transition active:scale-[0.98]"
          >
            <Download className="h-5 w-5" /> Télécharger le PDF
          </a>
          <a
            href="/cahier-des-charges-afilipro.pdf"
            target="_blank"
            className="mt-3 flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-5 py-3.5 text-[14px] font-black text-white transition active:scale-[0.98]"
          >
            Ouvrir dans le navigateur
          </a>
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-white p-6">
          <p className="text-[13px] font-black text-slate-900">Contenu du document</p>
          <ul className="mt-3 grid gap-1.5 text-[12.5px] text-slate-600">
            {[
              "Présentation, objectifs et moyens de paiement",
              "Authentification, activation et portefeuille double",
              "Retraits à paliers progressifs (1 500 → 96 000 FCFA)",
              "Parrainage 300 FCFA et 7 plans d'investissement VIP",
              "Quiz interactif, Telegram, Lucky Spin, Jeu des bouteilles",
              "Administration, notifications Telegram, sécurité",
              "Architecture technique, modèle de données, déploiement",
            ].map((t) => (
              <li key={t} className="flex items-start gap-2">
                <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#2563EB]" />
                {t}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
