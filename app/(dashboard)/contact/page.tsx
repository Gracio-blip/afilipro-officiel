import { MessageCircle, Send, Mail, Clock } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="space-y-4">
      <div className="rounded-[24px] bg-[#0B1120] p-6 text-white">
        <p className="text-[11px] font-black tracking-[0.18em] text-violet-300">SUPPORT</p>
        <h1 className="mt-2 text-[26px] font-black">Nous contacter</h1>
        <p className="mt-2 text-[13px] text-slate-400">Réponse garantie en moins de 30 minutes pendant les heures d&apos;ouverture.</p>
        <div className="mt-4 flex items-center gap-2 rounded-2xl bg-white/10 px-3 py-2 text-[12px]">
          <Clock className="h-4 w-4 text-emerald-300" />
          <span className="font-bold text-emerald-200">Lun–Sam · 08h–20h (Lomé GMT+0)</span>
        </div>
      </div>

      <div className="grid gap-3">
        <a href="https://wa.me/22890000000" target="_blank" rel="noreferrer"
          className="flex items-center gap-4 rounded-[22px] bg-emerald-600 p-5 text-white transition active:scale-[0.99]">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/20">
            <MessageCircle className="h-7 w-7" />
          </div>
          <div>
            <p className="text-[17px] font-black">WhatsApp</p>
            <p className="text-[12px] text-emerald-100">+228 90 00 00 00 · Clique pour discuter</p>
          </div>
        </a>

        <a href="https://t.me/afilipro" target="_blank" rel="noreferrer"
          className="flex items-center gap-4 rounded-[22px] bg-sky-600 p-5 text-white transition active:scale-[0.99]">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/20">
            <Send className="h-7 w-7" />
          </div>
          <div>
            <p className="text-[17px] font-black">Telegram</p>
            <p className="text-[12px] text-sky-100">@afilipro · Rejoindre le canal</p>
          </div>
        </a>

        <a href="mailto:support@afilipro.com"
          className="flex items-center gap-4 rounded-[22px] border border-slate-200 bg-white p-5 afili-card transition active:scale-[0.99]">
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-slate-100">
            <Mail className="h-7 w-7 text-slate-700" />
          </div>
          <div>
            <p className="text-[17px] font-black text-slate-900">Email</p>
            <p className="text-[12px] text-slate-500">support@afilipro.com</p>
          </div>
        </a>
      </div>

      <div className="rounded-[20px] border border-slate-200 bg-white p-5 afili-card">
        <p className="text-[13px] font-black text-slate-900">Sujets courants</p>
        <div className="mt-3 grid gap-2">
          {[
            "Validation de dépôt ou retrait",
            "Problème d'activation de compte",
            "Tâche non créditée",
            "Bug sur le Lucky Spin",
            "Compte suspendu ou bloqué",
            "Question sur un investissement",
          ].map((s, i) => (
            <div key={i} className="rounded-xl bg-slate-50 px-4 py-3 text-[13px] font-medium text-slate-700">
              {s}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
