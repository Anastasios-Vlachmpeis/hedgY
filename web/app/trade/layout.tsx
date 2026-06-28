import { AppShell } from "@/components/ui/app-shell";

export default function TradeLayout({ children }: { children: React.ReactNode }) {
  return <AppShell className="[background:radial-gradient(ellipse_60%_45%_at_80%_85%,rgba(255,155,80,0.28),transparent),radial-gradient(ellipse_50%_40%_at_15%_70%,rgba(255,190,130,0.16),transparent),radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(197,211,230,0.45),transparent),#dce7f3]">{children}</AppShell>;
}
