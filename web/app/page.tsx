import Link from "next/link";
import { ArrowRight, Diamond } from "lucide-react";

import { Button } from "@/components/ui/button";

/** Landing — simple hero stub. Real marketing content lands later. */
export default function LandingPage() {
  return (
    <section className="flex min-h-[70vh] flex-col items-center justify-center text-center">
      <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted-foreground">
        <Diamond className="size-3 fill-structuring text-structuring" />
        Structuring, markets & portfolio — one terminal
      </span>

      <h1 className="max-w-3xl text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
        Trade, track, and{" "}
        <span className="text-structuring">structure</span> in one place.
      </h1>

      <p className="mt-5 max-w-xl text-balance text-base text-muted-foreground sm:text-lg">
        A terminal-grade workspace for portfolios, trending equities, and
        prediction markets — with a structuring desk built in.
      </p>

      <div className="mt-8 flex items-center gap-3">
        <Button asChild size="lg">
          <Link href="/dashboard">
            Open Dashboard
            <ArrowRight />
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/dashboard">View demo</Link>
        </Button>
      </div>

      <p className="mt-10 text-xs text-muted-foreground">
        Scaffold preview — landing content is a placeholder.
      </p>
    </section>
  );
}
