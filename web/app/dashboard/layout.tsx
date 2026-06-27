import { AppShell } from "@/components/ui/app-shell";

/** Dashboard chrome lives here; the landing route stays clean. */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AppShell
      className="[background:radial-gradient(ellipse_60%_40%_at_50%_20%,rgba(255,190,140,0.28),transparent),#edf1f7]"
    >
      {children}
    </AppShell>
  );
}
