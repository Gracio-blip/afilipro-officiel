"use client";

import { Banknote, BarChart3, Crown, Dices, DollarSign, HelpCircle, Home, Landmark, Mail, Users, Wallet, Wine, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const MENU = [
  {
    section: "PRINCIPAL",
    items: [
      { label: "Tableau de bord",     href: "/dashboard",   icon: Home },
      { label: "Gagner de l'argent",  href: "/missions",    icon: DollarSign },
      { label: "Lucky Spin 🎰",         href: "/spin",        icon: Dices },
      { label: "Jeu des bouteilles 🍾", href: "/bottle",    icon: Wine },
      { label: "Mon Parrainage",        href: "/referral",  icon: Users },
      { label: "Investissements VIP", href: "/investments", icon: Crown, hot: true },
    ],
  },
  {
    section: "PORTEFEUILLE",
    items: [
      { label: "Mon Portefeuille",   href: "/wallet",      icon: Wallet },
      { label: "Effectuer un dépôt", href: "/deposit",     icon: Banknote },
      { label: "Retrait des gains",  href: "/withdrawals", icon: Landmark },
      { label: "Historique",         href: "/history",     icon: BarChart3 },
    ],
  },
  {
    section: "AIDE",
    items: [
      { label: "FAQ",         href: "/faq",     icon: HelpCircle },
      { label: "Contact Us",  href: "/contact", icon: Mail },
    ],
  },
];

const ICON_COLOR: Record<string, string> = {
  "Tableau de bord":     "text-blue-400",
  "Gagner de l'argent":  "text-emerald-400",
  "Lucky Spin 🎰":           "text-amber-400",
  "Jeu des bouteilles 🍾":  "text-indigo-400",
  "Mon Parrainage":      "text-violet-400",
  "Investissements VIP": "text-amber-400",
  "Mon Portefeuille":    "text-cyan-400",
  "Effectuer un dépôt":  "text-emerald-400",
  "Retrait des gains":   "text-rose-400",
  "Historique":          "text-sky-400",
  "FAQ":                 "text-yellow-300",
  "Contact Us":          "text-pink-400",
};

export default function Drawer({ open, onClose, name = "Utilisateur", balance = "0 FCFA", isActive = false }: {
  open: boolean; onClose: () => void; name?: string; balance?: string; isActive?: boolean;
}) {
  const pathname = usePathname();
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex">
      <div className="w-[88%] max-w-[360px] overflow-y-auto bg-[#0B1120] px-5 py-6 text-slate-300 pb-10">
        {/* Close */}
        <button onClick={onClose} className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/[0.06] text-white active:scale-95">
          <X className="h-5 w-5" />
        </button>

        {/* User chip */}
        <div className="mt-7 flex items-center gap-3 rounded-2xl bg-white/[0.06] px-4 py-3.5">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-[#F5C453] text-[17px] font-black text-black">
            {name.slice(0, 1).toUpperCase()}
          </div>
          <div className="leading-tight">
            <p className="text-[15px] font-bold text-white">{name}</p>
            <p className="text-[12px] font-black text-[#F5C453]">
              {balance} · {isActive ? "✓ Actif" : "Inactif"}
            </p>
          </div>
        </div>

        {!isActive && (
          <Link href="/deposit" onClick={onClose}
            className="mt-4 block rounded-2xl bg-[#F5C453] px-4 py-3 text-center text-[12px] font-black text-black active:scale-[0.98]">
            ⚡ Activer avec 2 500 FCFA
          </Link>
        )}

        {/* Sections */}
        {MENU.map(({ section, items }) => (
          <div key={section} className="mt-8">
            <p className="mb-2 px-2 text-[10px] font-black tracking-[0.2em] text-slate-500">{section}</p>
            <nav className="space-y-0.5">
              {items.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link key={item.href + item.label} href={item.href} onClick={onClose}
                    className={`flex items-center justify-between rounded-2xl px-3 py-3 text-[14px] font-semibold transition ${
                      active ? "bg-[#F5C453]/15 text-[#F5C453]" : "text-slate-300 hover:bg-white/[0.06]"
                    }`}>
                    <span className="flex items-center gap-3">
                      <Icon className={`h-5 w-5 ${active ? "text-[#F5C453]" : (ICON_COLOR[item.label] ?? "text-slate-400")}`} />
                      {item.label}
                    </span>
                    {(item as any).hot && (
                      <span className="rounded-md bg-[#F5C453] px-2 py-0.5 text-[10px] font-black text-black">HOT</span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>
      <div className="flex-1 bg-black/50 backdrop-blur-sm" onClick={onClose} />
    </div>
  );
}
