import type { Metadata } from "next";
import "./globals.css";

import { WORDMARK, TAGLINE } from "@/lib/brand";

export const metadata: Metadata = {
  title: `${WORDMARK} — ${TAGLINE}`,
  description:
    "FUSION is the fusion exchange — fuse equities, energy futures and prediction markets into a single position. Express a real-world thesis and hedge it across Kalshi, Polymarket, Alpaca and IBKR in one ticket.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" style={{ colorScheme: "light" }}>
      <body className="min-h-full font-sans" style={{ background: "#f6f7fb" }}>
        {children}
      </body>
    </html>
  );
}
