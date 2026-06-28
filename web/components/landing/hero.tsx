import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";

/** Centered hero. Two-line H1 + lead + the two pill CTAs. */
function Hero() {
  return (
    <section className="px-4 pt-[150px]">
      <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
        <Eyebrow>Markets + outcomes, one position</Eyebrow>

        <h1 className="mt-6 text-[48px] font-semibold leading-[1.05] tracking-[-0.02em] text-[#181925] sm:text-[56px]">
          Trade the world&apos;s markets —
          <br className="hidden sm:block" /> and its outcomes. In one position.
        </h1>

        <p className="mt-6 max-w-xl text-[18px] leading-[1.6] text-[#666666]">
          Express a real-world view and hedge it in a single trade. Combine
          equities, bonds and derivatives with prediction markets — structured
          and executed across every venue.
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Button asChild variant="primary" size="cta">
            <Link href="/signup">
              Start trading <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild variant="secondary" size="cta">
            <Link href="#how">See how it works</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

export { Hero };
