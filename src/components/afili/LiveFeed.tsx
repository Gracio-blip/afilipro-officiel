"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface LiveItem {
  initials: string;
  name: string;
  type: string;
  method: string;
  ago: string;
  amount: number;
  status: string;
}

function getLomeTime() {
  return new Date().toLocaleTimeString("fr-FR", {
    timeZone: "Africa/Lome",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hour12: false,
  }) + " (Lomé GMT+0)";
}

export default function LiveFeed({ items }: { items: LiveItem[] }) {
  const list = [...items, ...items, ...items];
  const [time, setTime] = useState(getLomeTime);

  useEffect(() => {
    const id = setInterval(() => setTime(getLomeTime()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="overflow-hidden rounded-[20px] border border-slate-200/80 bg-white p-4 afili-card">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="live-dot h-2.5 w-2.5 rounded-full bg-red-500" />
          <span className="text-[12px] font-black tracking-wide text-red-500">LIVE</span>
          <span className="text-[13px] font-bold text-slate-700">Retraits & Dépôts</span>
        </div>
        <span className="text-[10px] font-black tabular-nums text-slate-400">{time}</span>
      </div>

      {/* Scrolling */}
      <div className="relative h-[320px] overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-8 bg-gradient-to-b from-white to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-8 bg-gradient-to-t from-white to-transparent" />

        <motion.div
          className="space-y-3.5"
          animate={{ y: ["0%", "-33.33%"] }}
          transition={{ duration: 22, ease: "linear", repeat: Infinity, repeatType: "loop" }}
        >
          {list.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-[12px] font-black text-white ${item.type === "DÉPÔT" ? "bg-emerald-600" : "bg-[#1E3A5F]"}`}>
                  {item.initials.slice(0, 2).toUpperCase()}
                </div>
                <div className="leading-tight">
                  <div className="flex items-center gap-2">
                    <span className={`rounded px-1.5 py-0.5 text-[10px] font-black ${item.type === "DÉPÔT" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"}`}>
                      {item.type}
                    </span>
                    <span className="text-[13px] font-black text-slate-900">{item.name}</span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-slate-400">{item.method} · {item.ago}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-[13px] font-black ${item.amount > 0 ? "text-emerald-600" : "text-slate-900"}`}>
                  {item.amount > 0 ? "+" : ""}{Math.abs(item.amount).toLocaleString("fr-FR")} FCFA
                </p>
                <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                  item.status === "Validé" ? "bg-emerald-100 text-emerald-700"
                  : item.status === "Refusé" ? "bg-rose-100 text-rose-700"
                  : "bg-amber-100 text-amber-700"
                }`}>
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
