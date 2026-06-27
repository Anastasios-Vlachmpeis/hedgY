import { AppShell } from "@/components/ui/app-shell";

export default function TradeLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell className="[background:radial-gradient(ellipse_55%_35%_at_50%_18%,rgba(255,165,100,0.38),transparent),radial-gradient(ellipse_35%_25%_at_48%_20%,rgba(255,200,140,0.22),transparent),#dde8f4]">
      {children}
    </AppShell>
  );
}
