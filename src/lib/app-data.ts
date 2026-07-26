// Shared constants — no re-exports from other local modules
export const MIN_DEPOSIT = 2500;
export const MIN_WITHDRAWAL = 3000;
export const REFERRAL_BONUS = 300;
export const WELCOME_BONUS = 300;

export const paymentMethods = [
  { id: "mixx",  name: "Mixx by Yas" },
  { id: "moov",  name: "Moov Money" },
  { id: "flooz", name: "Flooz" },
  { id: "wave",  name: "Wave" },
];

export const liveFeedMock = [
  { initials: "DA", name: "Daniel A.",     type: "RETRAIT", method: "Mixx by Yas", ago: "il y a 2s",  amount: -200000, status: "Validé" },
  { initials: "YA", name: "Yannick K.",    type: "RETRAIT", method: "Moov Money",  ago: "il y a 8s",  amount: -50000,  status: "En cours" },
  { initials: "JU", name: "Junior Kossi",  type: "DÉPÔT",   method: "Mixx by Yas", ago: "il y a 14s", amount: 150000,  status: "Validé" },
  { initials: "JA", name: "Jacques M.",    type: "RETRAIT", method: "Mixx by Yas", ago: "il y a 22s", amount: -24000,  status: "Validé" },
  { initials: "JE", name: "Jean Junior",   type: "DÉPÔT",   method: "Moov Money",  ago: "il y a 35s", amount: 75000,   status: "En cours" },
  { initials: "AM", name: "Amélie D.",     type: "DÉPÔT",   method: "Wave",        ago: "il y a 48s", amount: 200000,  status: "Validé" },
  { initials: "KO", name: "Kossi A.",      type: "RETRAIT", method: "Flooz",       ago: "il y a 1m",  amount: -12000,  status: "Validé" },
  { initials: "MA", name: "Marcel B.",     type: "DÉPÔT",   method: "Wave",        ago: "il y a 1m25s",amount: 50000,  status: "En cours" },
  { initials: "AF", name: "Afi T.",        type: "RETRAIT", method: "Mixx by Yas", ago: "il y a 2m",  amount: -100000, status: "Validé" },
  { initials: "SE", name: "Sena K.",       type: "DÉPÔT",   method: "Moov Money",  ago: "il y a 2m30s",amount: 25000,  status: "Validé" },
  { initials: "EL", name: "Eli Mensah",    type: "RETRAIT", method: "Wave",        ago: "il y a 3m",  amount: -200000, status: "En cours" },
  { initials: "RO", name: "Rodrigue K.",   type: "DÉPÔT",   method: "Flooz",       ago: "il y a 4m",  amount: 150000,  status: "Validé" },
];
