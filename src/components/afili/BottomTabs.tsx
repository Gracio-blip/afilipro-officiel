"use client";

import { Crown, DollarSign, Dices, Home, Wine } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { label: "Accueil",    href: "/dashboard",   icon: Home },
  { label: "Gagner",     href: "/missions",    icon: DollarSign },
  { label: "Bouteille",  href: "/bottle",      icon: Wine },
  { label: "Spin",       href: "/spin",        icon: Dices },
  { label: "VIP",        href: "/investments", icon: Crown },
];

export default function BottomTabs() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex justify-center px-3 pb-[max(10px,env(safe-area-inset-bottom))] pt-2">
      <div className="flex w-full max-w-[440px] items-center justify-between gap-1 rounded-[24px] border border-slate-200/80 bg-white/95 px-2 py-2 shadow-[0_8px_32px_rgba(15,23,42,0.12)] backdrop-blur-xl">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = pathname === tab.href || (tab.href !== "/dashboard" && pathname.startsWith(tab.href));
          return (
            <Link key={tab.href} href={tab.href}
              className={`flex flex-1 flex-col items-center justify-center gap-1 rounded-[18px] px-1 py-2 text-[10px] font-bold leading-none transition-all ${active ? "bg-[#ECEEF2] text-slate-900" : "text-slate-400"}`}>
              <Icon className={`h-[19px] w-[19px] ${active ? "text-amber-500" : ""}`} strokeWidth={active ? 2.5 : 2} />
              <span className="truncate">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
