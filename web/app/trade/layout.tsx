import { AppShell } from "@/components/ui/app-shell";

export default function TradeLayout({ children }: { children: React.ReactNode }) {
  return <AppShell className="bg-white">{children}</AppShell>;
}
