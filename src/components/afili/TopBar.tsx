"use client";

import { Menu, TrendingUp } from "lucide-react";

interface TopBarProps {
  balance: string;
  onMenu: () => void;
  nameInitial: string;
  isActive?: boolean;
}

export default function TopBar({ balance, onMenu, nameInitial, isActive = false }: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 flex w-full max-w-[480px] items-center justify-between gap-3 bg-[#F5F6FB]/95 px-4 py-3 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenu}
          className="grid h-11 w-11 place-items-center rounded-2xl bg-[#0B1120] text-white shadow-lg transition active:scale-95"
          aria-label="Menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-baseline gap-0.5 text-[22px] font-black tracking-tight">
          <span className="text-[#0B2A4A]">Afili</span>
          <span className="text-[#F5B700]">Pro</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 rounded-2xl border border-amber-200/60 bg-[#FFF7ED] px-3 py-2 shadow-sm">
          <div className="grid h-8 w-8 place-items-center rounded-xl bg-amber-100 text-amber-600">
            <TrendingUp className="h-4 w-4" />
          </div>
          <div className="leading-none">
            <p className="text-[10px] font-bold text-stone-500">Solde</p>
            <p className="text-[13px] font-black text-slate-900">{balance}</p>
          </div>
        </div>
        <div className="grid h-10 w-10 place-items-center rounded-full bg-[#1E3A5F] text-[14px] font-black text-white shadow">
          {nameInitial}
        </div>
      </div>
    </header>
  );
}
