"use client";

import { useState } from "react";
import TopBar from "./TopBar";
import Drawer from "./Drawer";
import BottomTabs from "./BottomTabs";

interface AppShellProps {
  children: React.ReactNode;
  balance?: string;
  name?: string;
  isActive?: boolean;
}

export default function AppShell({ children, balance = "300 FCFA", name = "Jacques", isActive = false }: AppShellProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen w-full bg-[#F5F6FB]">
      <div className="mx-auto flex min-h-screen w-full max-w-[480px] flex-col">
        <TopBar balance={balance} nameInitial={name.slice(0, 1).toUpperCase()} onMenu={() => setOpen(true)} isActive={isActive} />
        <main className="flex-1 px-4 pb-32 pt-3">{children}</main>
        <BottomTabs />
      </div>
      <Drawer open={open} onClose={() => setOpen(false)} name={name} balance={balance} isActive={isActive} />
    </div>
  );
}
