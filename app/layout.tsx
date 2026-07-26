import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "GracioPay - Affiliation, micro-tâches et portefeuille digital",
  description: "Plateforme moderne d’affiliation, investissements, micro-tâches rémunérées et retraits Mobile Money.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="bg-[#F8FAFC] text-slate-950 antialiased">{children}</body>
    </html>
  );
}
