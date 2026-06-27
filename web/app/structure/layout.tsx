import { AppShell } from "@/components/ui/app-shell";

/** Structure workspace shares the same app chrome as the dashboard. */
export default function StructureLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
