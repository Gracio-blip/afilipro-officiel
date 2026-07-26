"use client";
import { useState } from "react";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handle = async () => {
    try { await navigator.clipboard.writeText(text); } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handle}
      className="mt-3 w-full rounded-xl bg-[#0B1120] py-3 text-[13px] font-black text-white transition active:scale-[0.98]"
    >
      {copied ? "✓ Lien copié !" : "Copier le lien"}
    </button>
  );
}
