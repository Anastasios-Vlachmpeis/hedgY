import { TradeShell } from "@/components/trade/trade-shell";

export default function TradeLayout({ children }: { children: React.ReactNode }) {
  return <TradeShell>{children}</TradeShell>;
}
