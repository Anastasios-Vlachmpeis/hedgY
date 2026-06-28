import { AppShell } from "@/components/ui/app-shell";

/** Markets discovery feed shares the app chrome. */
export default function MarketsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell className="markets-canvas">{children}</AppShell>;
}
