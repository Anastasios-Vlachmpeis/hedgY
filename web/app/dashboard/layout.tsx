import { AppShell } from "@/components/ui/app-shell";

/** Dashboard chrome lives here; the landing route stays clean. */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell
      className="[background:radial-gradient(ellipse_70%_60%_at_38%_42%,rgba(251,146,60,0.22),transparent),radial-gradient(ellipse_45%_40%_at_32%_44%,rgba(251,191,36,0.14),transparent),radial-gradient(ellipse_50%_45%_at_55%_40%,rgba(239,116,78,0.12),transparent),#d8e8f0]"
    >
      {children}
    </AppShell>
  );
}
