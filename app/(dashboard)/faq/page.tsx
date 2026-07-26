const faqs = [
  { q: "Comment activer mon compte ?", a: "Effectuez un dépôt unique de 2 500 FCFA via Mixx by Yas, Moov Money, Flooz ou Wave. Après validation par l'admin (< 5 min), votre compte devient actif." },
  { q: "Quel est le minimum de retrait ?", a: "Le premier retrait est possible à partir de 1 500 FCFA. Le minimum double après chaque retrait validé : 1 500 → 3 000 → 6 000 → 12 000 FCFA, etc." },
  { q: "Comment fonctionne le parrainage ?", a: "Partagez votre lien unique. Lorsqu'un filleul effectue son premier dépôt et active son compte, vous recevez automatiquement 300 FCFA." },
  { q: "Combien gagne-t-on par tâche ?", a: "Le quiz rapporte 50 FCFA par bonne réponse (150 FCFA pour 3 questions), le canal Telegram rapporte 50 FCFA. Chaque tâche n'est validable qu'une seule fois par compte." },
  { q: "Comment fonctionne le Lucky Spin ?", a: "Vous avez 3 tentatives toutes les 24 heures. Les gains possibles sont 500 FCFA ou 800 FCFA. Vous pouvez aussi ne rien gagner (60% de chance). Compte actif requis." },
  { q: "Comment fonctionne le jeu des bouteilles ?", a: "Trois bouteilles s'agitent et cachent une boule. Cliquez sur celle que vous pensez être la bonne. Vous gagnez 100 FCFA en cas de succès. Parties illimitées, compte actif requis." },
  { q: "Quand puis-je retirer mes gains d'investissement ?", a: "Les gains des plans d'investissement sont bloqués jusqu'à la fin du plan. Plan de 75 jours → retrait au 75ème jour. Plan de 60 jours → retrait au 60ème jour." },
  { q: "Comment déposer de l'argent ?", a: "Allez dans Dépôt, choisissez votre opérateur (Mixx by Yas, Moov Money, Flooz, Wave), entrez votre numéro et le montant, puis soumettez. L'admin valide sous 5 minutes." },
  { q: "Que se passe-t-il si mon retrait est refusé ?", a: "Si l'admin refuse votre retrait, le montant est automatiquement recrédité sur votre portefeuille sans délai." },
  { q: "Puis-je avoir plusieurs comptes ?", a: "Non. Un seul compte par personne est autorisé. Tout compte en double est suspendu immédiatement et les fonds peuvent être annulés." },
  { q: "Comment sont sécurisés mes fonds ?", a: "Vos fonds sont gérés par notre équipe admin. Chaque transaction est enregistrée. Contactez le support en cas de problème." },
];

export default function FaqPage() {
  return (
    <div className="space-y-4">
      <div className="rounded-[24px] bg-[#0B1120] p-6 text-white">
        <p className="text-[11px] font-black tracking-[0.18em] text-violet-300">AIDE</p>
        <h1 className="mt-2 text-[26px] font-black">Questions fréquentes</h1>
        <p className="mt-2 text-[13px] text-slate-400">Tout ce que vous devez savoir sur la plateforme.</p>
      </div>

      <div className="grid gap-3">
        {faqs.map((f, i) => (
          <div key={i} className="rounded-[20px] border border-slate-200 bg-white p-5 afili-card">
            <p className="text-[14px] font-black text-slate-900">{f.q}</p>
            <p className="mt-2 text-[13px] leading-6 text-slate-600">{f.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
