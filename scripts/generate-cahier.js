const PDFDocument = require("pdfkit");
const fs = require("fs");

const OUT = "public/cahier-des-charges-afilipro.pdf";
fs.mkdirSync("public", { recursive: true });

const doc = new PDFDocument({ size: "A4", margin: 56, info: {
  Title: "Cahier des charges - AfiliPro",
  Author: "AfiliPro",
  Subject: "Plateforme d'affiliation et de micro-tâches rémunérées",
}});
const stream = fs.createWriteStream(OUT);
doc.pipe(stream);

const NAVY = [11, 17, 32];
const BLUE = [37, 99, 235];
const GOLD = [245, 196, 83];
const GREY = [100, 116, 139];
const GREEN = [22, 163, 74];
const LIGHT = [245, 246, 251];
const W = 483; // usable width

let page = 1;
function footer() {
  doc.fontSize(8).fillColor(GREY)
    .text(`AfiliPro — Cahier des charges   ·   Page ${page}`, 56, 800, { width: W, align: "center" });
}
function newPage() {
  footer();
  doc.addPage();
  page++;
}
function ensure(h) { if (doc.y + h > 780) newPage(); }

function h1(num, title) {
  ensure(70);
  doc.moveDown(0.6);
  doc.rect(56, doc.y, 6, 22).fill(BLUE);
  doc.fillColor(NAVY).fontSize(17).font("Helvetica-Bold")
    .text(`${num ? num + "  " : ""}${title}`, 72, doc.y + 2, { width: W - 16 });
  doc.moveDown(0.8);
}
function h2(title) {
  ensure(40);
  doc.fillColor(BLUE).fontSize(12.5).font("Helvetica-Bold").text(title, 56, doc.y);
  doc.moveDown(0.35);
}
function p(text, opts = {}) {
  ensure(30);
  doc.fillColor(opts.color || [30, 41, 59]).fontSize(10.5).font("Helvetica")
    .text(text, 56, doc.y, { width: W, lineGap: 3, align: opts.align });
  doc.moveDown(0.45);
}
function bullet(text) {
  ensure(24);
  const y = doc.y;
  doc.fillColor(BLUE).circle(61, y + 5.5, 2).fill();
  doc.fillColor([30, 41, 59]).fontSize(10.5).font("Helvetica")
    .text(text, 72, y, { width: W - 16, lineGap: 2.5 });
  doc.moveDown(0.3);
}
function kv(key, val) {
  ensure(22);
  const y = doc.y;
  doc.fillColor(NAVY).fontSize(10.5).font("Helvetica-Bold").text(key, 72, y, { width: 170, continued: false });
  doc.fillColor([30, 41, 59]).font("Helvetica").text(val, 245, y, { width: W - 189, lineGap: 2.5 });
  doc.y = Math.max(doc.y, y + 16);
  doc.moveDown(0.2);
}
function table(headers, rows, widths) {
  ensure(60);
  const rowH = 20;
  let y = doc.y;
  // header
  doc.rect(56, y, W, rowH).fill(NAVY);
  let x = 56;
  doc.fillColor([255,255,255]).fontSize(9.5).font("Helvetica-Bold");
  headers.forEach((h, i) => { doc.text(h, x + 6, y + 5.5, { width: widths[i] - 12 }); x += widths[i]; });
  y += rowH;
  rows.forEach((r, ri) => {
    ensure(rowH + 6);
    if (doc.y > y) y = doc.y;
    if (ri % 2 === 0) doc.rect(56, y, W, rowH).fill(LIGHT);
    x = 56;
    doc.fillColor([30,41,59]).fontSize(9.3).font("Helvetica");
    r.forEach((c, i) => { doc.text(String(c), x + 6, y + 5.5, { width: widths[i] - 12 }); x += widths[i]; });
    y += rowH;
    doc.y = y;
  });
  doc.moveDown(0.6);
}
function box(title, lines, color) {
  const h = 26 + lines.length * 15;
  ensure(h + 10);
  const y = doc.y;
  doc.roundedRect(56, y, W, h, 6).fill([248, 250, 252]).strokeColor([226,232,240]).lineWidth(1).stroke();
  doc.rect(56, y, 5, h).fill(color);
  doc.fillColor(NAVY).fontSize(11).font("Helvetica-Bold").text(title, 72, y + 8, { width: W - 24 });
  let ty = y + 24;
  doc.fontSize(10).font("Helvetica").fillColor([51,65,85]);
  lines.forEach(l => { doc.text("•  " + l, 72, ty, { width: W - 28 }); ty = doc.y + 2; });
  doc.y = y + h + 10;
}

/* ============================ COUVERTURE ============================ */
doc.rect(0, 0, 595, 842).fill(NAVY);
doc.rect(0, 0, 595, 8).fill(GOLD);
doc.moveDown(9);
doc.fillColor(GOLD).fontSize(13).font("Helvetica-Bold").text("CAHIER DES CHARGES FONCTIONNEL & TECHNIQUE", 56, 150, { width: W });
doc.fillColor([255,255,255]).fontSize(40).font("Helvetica-Bold").text("AfiliPro", 56, 185, { width: W });
doc.fontSize(15).font("Helvetica").fillColor([203,213,225])
  .text("Plateforme d'affiliation, d'investissements\net de micro-tâches rémunérées", 56, 245, { width: W, lineGap: 4 });
doc.rect(56, 320, 90, 3).fill(GOLD);
doc.fontSize(10.5).fillColor([148,163,184])
  .text("Dépôts Mobile Money · Parrainage automatique · Lucky Spin · Jeu des bouteilles\nRetraits à paliers progressifs · Notifications Telegram · Administration complète", 56, 345, { width: W, lineGap: 4 });
doc.fontSize(10).fillColor([100,116,139]).text("Version 1.0  —  Document de référence pour développement, recette et déploiement", 56, 760, { width: W });

/* ============================ SOMMAIRE ============================ */
newPage();
h1("", "Sommaire");
const toc = [
  "1.  Présentation du projet",
  "2.  Objectifs et cibles",
  "3.  Authentification et comptes",
  "4.  Activation du compte (dépôt 2 500 FCFA)",
  "5.  Portefeuille à double solde",
  "6.  Retraits à paliers progressifs",
  "7.  Programme de parrainage",
  "8.  Plans d'investissement VIP",
  "9.  Micro-tâches rémunérées",
  "10. Jeux : Lucky Spin et Jeu des bouteilles",
  "11. Tableau de bord administrateur",
  "12. Notifications Telegram",
  "13. Interface utilisateur (UI/UX)",
  "14. Sécurité et anti-fraude",
  "15. Architecture technique",
  "16. Modèle de données",
  "17. Récapitulatif des règles métier",
  "18. Déploiement et mise en production",
  "19. Évolutions prévues",
];
toc.forEach(t => { doc.fillColor([30,41,59]).fontSize(11).font("Helvetica").text(t, 72, doc.y, { width: W }); doc.moveDown(0.28); });

/* ============================ 1 PRESENTATION ============================ */
newPage();
h1("1.", "Présentation du projet");
p("AfiliPro est une plateforme web mobile-first (compatible téléphone, tablette et ordinateur) spécialisée dans l'affiliation, les micro-tâches rémunérées et les plans d'investissement à revenu quotidien. Le produit reproduit l'expérience d'une application de portefeuille numérique : interface sombre et dorée type « AfiliPro », navigation par onglets en bas d'écran, menu latéral, flux d'activité en temps réel.");
p("Chaque utilisateur dispose d'un compte sécurisé, d'un portefeuille, d'un lien de parrainage unique et d'un accès à des jeux et missions générant des revenus en FCFA. L'administrateur pilote l'ensemble (dépôts, retraits, utilisateurs, tâches) depuis un panneau dédié et reçoit une alerte Telegram à chaque opération sensible.");
h2("Public visé");
bullet("Utilisateurs mobiles en zone UEMOA (Togo, Bénin, Côte d'Ivoire…) payant via Mobile Money.");
bullet("Parrains souhaitant générer des commissions d'affiliation.");
bullet("Administrateur unique gérant validations et support.");
h2("Moyens de paiement pris en charge");
p("Mixx by Yas, Moov Money, Flooz, Wave — extensibles à d'autres opérateurs depuis l'administration.");

/* ============================ 2 OBJECTIFS ============================ */
newPage();
h1("2.", "Objectifs et cibles");
bullet("Permettre l'inscription rapide et la connexion sécurisée d'un utilisateur.");
bullet("Activer les comptes par un dépôt unique minimum de 2 500 FCFA, validé par l'admin.");
bullet("Rémunérer les utilisateurs via micro-tâches, jeux et plans d'investissement.");
bullet("Automatiser les commissions de parrainage (300 FCFA par filleul actif).");
bullet("Encadrer les retraits par des paliers progressifs doublant à chaque retrait validé.");
bullet("Informer l'administrateur en temps réel sur Telegram (dépôts et retraits).");
bullet("Offrir une expérience fluide, animée et professionnelle sur mobile.");
h2("Indicateurs de succès");
bullet("Dépôt → compte actif en moins de 5 minutes après validation admin.");
bullet("Crédit instantané des gains de tâches/jeux sur le tableau de bord.");
bullet("Aucune double validation possible sur une même tâche.");
bullet("Zéro perte de transaction : chaque mouvement est journalisé.");

/* ============================ 3 AUTH ============================ */
newPage();
h1("3.", "Authentification et comptes");
h2("Inscription");
bullet("Champs : nom, téléphone Mobile Money, e-mail, mot de passe (6 caractères minimum).");
bullet("Mot de passe haché avec bcrypt (10 tours) — jamais stocké en clair.");
bullet("Génération automatique d'un code de parrainage unique par utilisateur.");
bullet("Détection du parrain via paramètre ?ref=CODE ou route /ref/CODE.");
bullet("Création automatique d'un portefeuille vide (aucun solde offert).");
h2("Connexion");
bullet("Authentification NextAuth v5 avec stratégie JWT.");
bullet("Bannière verte « Connexion réussie ! » après authentification valide.");
bullet("Bannière rouge en cas d'identifiants incorrects.");
bullet("Redirection automatique vers /dashboard après connexion.");
h2("Protection des routes");
bullet("Un middleware (proxy) redirige tout visiteur non connecté vers /login.");
bullet("Un utilisateur connecté sur /login ou /register est redirigé vers /dashboard.");

/* ============================ 4 ACTIVATION ============================ */
newPage();
h1("4.", "Activation du compte — dépôt de 2 500 FCFA");
p("Un compte nouvellement créé est inactif : il ne peut ni jouer, ni effectuer de tâches, ni investir, ni retirer. L'activation exige un dépôt unique minimum de 2 500 FCFA.");
h2("Flux du dépôt");
bullet("L'utilisateur choisit son opérateur (Mixx by Yas, Moov Money, Flooz, Wave).");
bullet("Il saisit son numéro et le montant (minimum 2 500 FCFA contrôlé côté serveur).");
bullet("La transaction est enregistrée au statut « En attente ».");
bullet("Une notification Telegram détaillée est envoyée à l'administrateur.");
bullet("L'administrateur approuve ou refuse depuis /admin.");
bullet("À l'approbation : le montant est crédité et le compte passe « Actif ».");
bullet("Si c'est le premier dépôt du filleul : 300 FCFA sont crédités au parrain.");
bullet("Au refus : la transaction passe « Refusé » avec note administrateur.");
box("Contraintes", [
  "Montant minimum strict : 2 500 FCFA (vérification serveur).",
  "Un seul compte par personne ; les doublons sont suspendus.",
  "L'historique des dépôts est visible dans le portefeuille de l'utilisateur.",
], GOLD);

/* ============================ 5 PORTEFEUILLE ============================ */
newPage();
h1("5.", "Portefeuille à double solde");
p("Le portefeuille est divisé en deux soldes distincts pour éviter toute confusion entre gains disponibles et gains bloqués.");
h2("Solde des tâches (retirable)");
bullet("Reçoit : gains des micro-tâches, gains des jeux, commissions de parrainage.");
bullet("Utilisé pour les demandes de retrait selon les paliers progressifs.");
h2("Solde des investissements (bloqué)");
bullet("Reçoit : les revenus quotidiens des plans d'investissement actifs.");
bullet("Aucun retrait possible avant la fin du plan (60 ou 75 jours).");
bullet("À l'échéance, le plan passe « Terminé » et les gains deviennent transférables.");
h2("Affichage tableau de bord");
bullet("Solde total en haut (badge doré dans la barre supérieure).");
bullet("Carte « Tâches & parrainage » avec minimum de retrait actuel et prochain minimum.");
bullet("Carte « Investissements » avec solde bloqué, plans actifs, jours restants, barre de progression.");
bullet("Historique complet de toutes les opérations horodatées.");

/* ============================ 6 RETRAITS ============================ */
newPage();
h1("6.", "Retraits à paliers progressifs");
p("Le minimum de retrait double après chaque retrait validé, afin d'encourager la rétention.");
table(["Retrait n°", "Minimum requis"], [
  ["1er retrait", "1 500 FCFA"],
  ["2e retrait", "3 000 FCFA"],
  ["3e retrait", "6 000 FCFA"],
  ["4e retrait", "12 000 FCFA"],
  ["5e retrait", "24 000 FCFA"],
  ["6e retrait", "48 000 FCFA"],
  ["7e et +", "96 000 FCFA"],
], [240, 243]);
h2("Flux du retrait");
bullet("L'utilisateur choisit l'opérateur et saisit son numéro de réception.");
bullet("Contrôle serveur : montant ≥ palier actuel et ≤ solde des tâches.");
bullet("Le montant est immédiatement déduit du solde (réservation).");
bullet("Notification Telegram envoyée à l'administrateur.");
bullet("Statut « En attente » puis « Payé » (approuvé) ou « Refusé ».");
bullet("En cas de refus : remboursement automatique et intégral du montant réservé.");
box("Affichage obligatoire", [
  "« Minimum actuel de retrait » et « Prochain minimum après ce retrait ».",
  "Historique des retraits avec statuts colorés (En attente / Payé / Refusé).",
], BLUE);

/* ============================ 7 PARRAINAGE ============================ */
newPage();
h1("7.", "Programme de parrainage");
bullet("Chaque utilisateur possède un lien unique : https://<site>/ref/CODE.");
bullet("Code de parrainage personnalisable, généré à l'inscription.");
bullet("Commission : 300 FCFA crédités automatiquement quand un filleul active son compte (premier dépôt validé).");
bullet("Tableau de bord parrain : nombre de filleuls, filleuls actifs, gains totaux.");
bullet("Classement des meilleurs parrains avec badges.");
h2("Copie du lien");
p("Bouton « Copier le lien » (composant client) avec confirmation visuelle « Lien copié ! ».");

/* ============================ 8 INVESTISSEMENTS ============================ */
newPage();
h1("8.", "Plans d'investissement VIP");
p("Deux catégories de plans : 75 jours (Bronze, Silver, Gold) et 60 jours (VIP 1 à VIP 4).");
table(["Plan", "Investissement", "Revenu / jour", "Durée", "Revenu total"], [
  ["Bronze", "2 500 FCFA", "600 FCFA", "75 j", "45 000 FCFA"],
  ["Silver", "4 500 FCFA", "1 200 FCFA", "75 j", "90 000 FCFA"],
  ["Gold", "7 000 FCFA", "1 600 FCFA", "75 j", "120 000 FCFA"],
  ["VIP 1", "5 000 FCFA", "1 500 FCFA", "60 j", "90 000 FCFA"],
  ["VIP 2", "10 000 FCFA", "3 000 FCFA", "60 j", "180 000 FCFA"],
  ["VIP 3", "15 000 FCFA", "4 500 FCFA", "60 j", "270 000 FCFA"],
  ["VIP 4", "20 000 FCFA", "6 000 FCFA", "60 j", "360 000 FCFA"],
], [80, 105, 100, 70, 128]);
h2("Règles de fonctionnement");
bullet("Compte actif (dépôt validé) obligatoire pour investir.");
bullet("Le montant est déduit du solde principal à la souscription.");
bullet("Les revenus quotidiens s'accumulent dans le solde investissements (bloqué).");
bullet("Progression affichée : jours réclamés / durée, barre animée, gains accumulés.");
bullet("À l'échéance, le plan passe « Terminé » et les gains deviennent disponibles.");
bullet("Affichage des plans : Investissement, Revenu/jour, Durée (sans profit net).");

/* ============================ 9 TACHES ============================ */
newPage();
h1("9.", "Micro-tâches rémunérées");
table(["Tâche", "Récompense", "Règle"], [
  ["Quiz quotidien (3 questions)", "50 FCFA / bonne réponse (max 150)", "Quiz interactif, une seule fois"],
  ["Canal Telegram", "50 FCFA", "Vérification admin"],
], [180, 180, 123]);
h2("Quiz quotidien interactif");
bullet("3 questions affichées une par une avec 4 choix et barre de progression.");
bullet("50 FCFA crédités par bonne réponse, calculés côté serveur (anti-triche).");
bullet("Le quiz n'est complétable qu'une seule fois par compte.");
bullet("Score et gain affichés en fin de partie ; crédit instantané au tableau de bord.");
h2("Contraintes générales");
bullet("Compte actif requis pour accéder aux tâches.");
bullet("Chaque tâche validable une seule fois (contrôle base de données).");
bullet("Les gains sont crédités immédiatement dans le solde des tâches.");

/* ============================ 10 JEUX ============================ */
newPage();
h1("10.", "Jeux : Lucky Spin et Jeu des bouteilles");
h2("Lucky Spin");
bullet("3 tentatives maximum par période de 24 heures glissantes.");
bullet("Probabilités : 60 % aucun gain · 27 % gain de 500 FCFA · 13 % gain de 800 FCFA.");
bullet("L'utilisateur peut donc perdre ; le tirage est effectué côté serveur.");
bullet("Roue animée (Framer Motion) ; résultat révélé après l'animation.");
bullet("Gains crédités instantanément ; tentatives restantes affichées.");
bullet("Compte actif obligatoire pour jouer.");
h2("Jeu des bouteilles");
bullet("3 bouteilles mélangées par animation ; une boule est cachée sous l'une d'elles.");
bullet("La position réelle de la boule est tirée côté serveur (impossible à tricher).");
bullet("Gain : 100 FCFA en cas de succès ; parties illimitées.");
bullet("Compte actif obligatoire ; gain crédité immédiatement.");

/* ============================ 11 ADMIN ============================ */
newPage();
h1("11.", "Tableau de bord administrateur");
bullet("Statistiques générales : utilisateurs, soldes totaux, dépôts et retraits en attente.");
bullet("Validation ou refus des dépôts (avec note), activation automatique des comptes.");
bullet("Validation (« Payé ») ou refus avec remboursement automatique des retraits.");
bullet("Liste des utilisateurs : statut actif/inactif, code parrain, téléphone, e-mail.");
bullet("Passage d'un utilisateur en administrateur via la base de données (role = 'admin').");
bullet("Historique global des transactions horodatées.");

/* ============================ 12 TELEGRAM ============================ */
newPage();
h1("12.", "Notifications Telegram");
p("Chaque dépôt soumis et chaque demande de retrait déclenchent l'envoi d'un message Telegram à l'administrateur, au format HTML, comprenant :");
bullet("E-mail de l'utilisateur et numéro Mobile Money saisi.");
bullet("Opérateur choisi et montant exact en FCFA.");
bullet("Solde restant après déduction (pour les retraits).");
bullet("Heure de l'opération au fuseau de Lomé (GMT+0).");
bullet("Identifiant unique de la transaction pour traitement dans /admin.");
box("Objectif", ["Permettre à l'administrateur de traiter chaque opération depuis son téléphone, sans ouvrir le site."], GREEN);

/* ============================ 13 UI ============================ */
newPage();
h1("13.", "Interface utilisateur (UI/UX)");
h2("Identité visuelle");
bullet("Logo : « Afili » bleu marine + « Pro » doré ; fond général #F5F6FB.");
bullet("Cartes blanches arrondies (20-24 px) avec ombres douces.");
bullet("Héros et menu latéral bleu nuit #0B1120 ; accents dorés #F5C453.");
h2("Navigation");
bullet("Barre supérieure : bouton menu, logo, badge solde, avatar initiale.");
bullet("Menu latéral sombre : sections PRINCIPAL, PORTEFEUILLE, AIDE (FAQ, Contact Us).");
bullet("Barre d'onglets fixe en bas (style application) : Accueil, Gagner, Bouteille, Spin, VIP.");
h2("Animations et temps réel");
bullet("Flux « LIVE Retraits & Dépôts » défilant de haut en bas (Framer Motion).");
bullet("Horloge en direct au fuseau Africa/Lome (GMT+0) sur les pages clés.");
bullet("Roue du Lucky Spin et mélange des bouteilles animés ; barres de progression brillantes.");
h2("Responsive");
p("Conception mobile-first : conteneur centré de 480 px maximum sur téléphone, adaptation fluide sur tablette et ordinateur.");

/* ============================ 14 SECURITE ============================ */
newPage();
h1("14.", "Sécurité et anti-fraude");
bullet("Mots de passe hachés bcrypt ; sessions JWT signées (AUTH_SECRET).");
bullet("Toutes les routes privées protégées par middleware serveur.");
bullet("Contrôles serveur systématiques : montants minimums, soldes, statuts.");
bullet("Résultats des jeux (spin, bouteilles, quiz) calculés côté serveur uniquement.");
bullet("Unicité des validations de tâches par compte (contrainte base de données).");
bullet("Journal complet des transactions avec statuts et notes d'administration.");
bullet("Connexion à la base paresseuse : aucune donnée sensible exposée au build.");
bullet("Variables d'environnement jamais commitées ; .gitignore strict.");

/* ============================ 15 ARCHITECTURE ============================ */
newPage();
h1("15.", "Architecture technique");
table(["Composant", "Technologie"], [
  ["Framework", "Next.js 16 (App Router) — rendu serveur"],
  ["Langage", "TypeScript strict"],
  ["Style", "Tailwind CSS v4"],
  ["Animations", "Framer Motion"],
  ["Icônes", "Lucide React"],
  ["Authentification", "NextAuth v5 (JWT, provider Credentials)"],
  ["ORM", "Drizzle ORM"],
  ["Base de données", "PostgreSQL (Neon serverless, SSL)"],
  ["Client SQL", "pg (pool avec SSL automatique pour Neon)"],
  ["Notifications", "API Telegram Bot (fetch serveur)"],
  ["PDF", "PDFKit (génération du présent document)"],
  ["Déploiement", "GitHub + Vercel / Netlify / Railway"],
], [170, 313]);
h2("Organisation du code");
bullet("app/ : pages et routes (dashboard, missions, spin, bottle, admin, api…).");
bullet("src/components/afili/ : coquille applicative (TopBar, Drawer, BottomTabs, LiveFeed).");
bullet("src/lib/ : actions serveur, authentification, utilitaires, Telegram.");
bullet("src/db/ : schéma Drizzle et client de base de données paresseux.");

/* ============================ 16 DONNEES ============================ */
newPage();
h1("16.", "Modèle de données");
table(["Table", "Rôle"], [
  ["users", "Comptes, code parrain, parrain, statut actif, rôle"],
  ["wallets", "Solde total, solde tâches, solde investissements, totaux"],
  ["transactions", "Dépôts, retraits, gains, bonus — statuts et notes"],
  ["tasks", "Catalogue des tâches et récompenses"],
  ["user_tasks", "Validations uniques utilisateur × tâche"],
  ["investment_plans", "7 plans (montant, revenu/jour, durée, total)"],
  ["user_investments", "Souscriptions, jours réclamés, échéance, statut"],
  ["spin_history", "Tentatives et gains du Lucky Spin (fenêtre 24 h)"],
], [150, 333]);

/* ============================ 17 RECAP ============================ */
newPage();
h1("17.", "Récapitulatif des règles métier");
table(["Règle", "Valeur"], [
  ["Dépôt d'activation minimum", "2 500 FCFA (unique)"],
  ["Commission parrain / filleul actif", "300 FCFA"],
  ["Quiz", "50 FCFA × 3 questions = 150 FCFA max"],
  ["Canal Telegram", "50 FCFA"],
  ["Jeu des bouteilles", "100 FCFA par victoire"],
  ["Lucky Spin", "500 / 800 FCFA · 3 essais / 24 h · 60 % de perte"],
  ["1er retrait minimum", "1 500 FCFA, puis doublement"],
  ["Investissements", "Gains bloqués jusqu'à 60 ou 75 jours"],
  ["Heure de référence", "Lomé, GMT+0"],
], [250, 233]);

/* ============================ 18 DEPLOIEMENT ============================ */
newPage();
h1("18.", "Déploiement et mise en production");
h2("Variables d'environnement requises");
table(["Variable", "Rôle"], [
  ["DATABASE_URL", "Connexion PostgreSQL de production avec SSL"],
  ["AUTH_SECRET", "Clé aléatoire de signature des sessions JWT"],
  ["NEXT_PUBLIC_APP_URL", "URL publique officielle du site"],
  ["TELEGRAM_BOT_TOKEN", "Jeton secret du bot de notification"],
  ["TELEGRAM_CHAT_ID", "Identifiant du chat administrateur"],
], [200, 283]);
h2("Formats attendus (exemples fictifs)");
table(["Variable", "Exemple non secret"], [
  ["DATABASE_URL", "postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"],
  ["AUTH_SECRET", "Générer avec : openssl rand -base64 32"],
  ["NEXT_PUBLIC_APP_URL", "https://afilipro.example.com"],
  ["TELEGRAM_BOT_TOKEN", "123456789:AAExempleTokenRemplaceMoi"],
  ["TELEGRAM_CHAT_ID", "123456789"],
], [180, 303]);
box("Protection obligatoire des secrets", [
  "Ne jamais écrire les vraies valeurs dans le PDF, le code source ou un dépôt GitHub public.",
  "Stocker les vraies valeurs uniquement dans Environment Variables / Secrets chez l'hébergeur.",
  "Révoquer et régénérer immédiatement toute valeur publiée par erreur.",
  "Limiter l'accès au panneau d'administration et aux secrets au propriétaire du projet.",
], [239, 68, 68]);
h2("Procédure");
bullet("Dépôt du code sur GitHub (dossier app/ à la racine, proxy.ts, vercel.json).");
bullet("Import du dépôt sur l'hébergeur ; build automatique « npm run build ».");
bullet("Configuration des variables d'environnement puis déploiement.");
bullet("Initialisation de la base : tables, plans et tâches créés automatiquement.");
bullet("Activation de l'administrateur : UPDATE users SET role='admin'.");
h2("Validation");
bullet("Build de production : 19 routes compilées, 0 erreur TypeScript.");
bullet("Test d'intégrité : clone neuf + build sans variables = succès.");

/* ============================ 19 EVOLUTIONS ============================ */
newPage();
h1("19.", "Évolutions prévues");
bullet("Ajout de moyens de paiement et de tâches depuis l'administration.");
bullet("Vérification automatique des abonnements Telegram / TikTok par API.");
bullet("Application Android (emballage WebView du site en .apk).");
bullet("Export Excel / PDF des données administratives.");
bullet("Bonus quotidien de connexion et système de niveaux VIP.");
doc.moveDown(1.5);
doc.roundedRect(56, doc.y, W, 60, 8).fill(NAVY);
doc.fillColor(GOLD).fontSize(12).font("Helvetica-Bold")
  .text("Fin du cahier des charges", 56, doc.y + 14, { width: W, align: "center" });
doc.fillColor([203,213,225]).fontSize(9.5).font("Helvetica")
  .text("AfiliPro v1.0 — document généré automatiquement depuis le code source du projet.", 56, doc.y + 6, { width: W, align: "center" });

footer();
doc.end();
stream.on("finish", () => console.log("PDF généré : " + OUT));
