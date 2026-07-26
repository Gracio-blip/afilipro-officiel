import Link from "next/link";

export default function SupportPage() {
  return (
    <div className="space-y-4">
      <div className="rounded-[24px] bg-[#0B1120] p-6 text-white">
        <h1 className="text-[22px] font-black">Support & Aide</h1>
        <p className="mt-2 text-[13px] text-slate-400">Réponse rapide sur WhatsApp. Vérification dépôts/retraits, missions, parrainage.</p>
      </div>

      <div className="grid gap-3">
        <a href="https://wa.me/22890000000" target="_blank" rel="noreferrer" className="rounded-2xl bg-emerald-600 p-5 text-white transition active:scale-[0.98]">
          <p className="text-[16px] font-black">WhatsApp Officiel</p>
          <p className="text-[12px] text-emerald-100">Clique pour discuter</p>
        </a>
        <a href="https://t.me/" target="_blank" rel="noreferrer" className="rounded-2xl bg-sky-600 p-5 text-white transition active:scale-[0.98]">
          <p className="text-[16px] font-black">Canal Telegram</p>
          <p className="text-[12px] text-sky-100">Rejoindre</p>
        </a>
      </div>

      <div className="rounded-[20px] border border-slate-200 bg-white p-5 afili-card">
        <p className="text-[14px] font-black text-slate-900">FAQ rapide</p>
        <ul className="mt-3 list-disc pl-5 space-y-1 text-[13px] leading-6 text-slate-600">
          <li>Dépôt minimum 2 500 FCFA · Mixx, Moov, Flooz, Wave</li>
          <li>Retrait minimum 3 000 FCFA · Validé par admin</li>
          <li>Parrainage 300 FCFA / filleul actif</li>
          <li>Tâche validable 1 seule fois par compte</li>
          <li>Investissement revenu quotidien automatique</li>
        </ul>
      </div>
    </div>
  );
}
