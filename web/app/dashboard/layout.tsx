import { AppShell } from "@/components/ui/app-shell";

/** Dashboard chrome lives here; the landing route stays clean. */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
