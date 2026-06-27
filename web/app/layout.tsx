import type { Metadata } from "next";
import "./globals.css";

import { WORDMARK, TAGLINE } from "@/lib/brand";

export const metadata: Metadata = {
  title: `${WORDMARK} — ${TAGLINE}`,
  description:
    "Trade equities, bonds, derivatives and prediction markets in one position. Express a real-world view and hedge it across Kalshi, Polymarket, Alpaca and IBKR.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
