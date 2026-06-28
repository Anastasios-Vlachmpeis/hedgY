import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";

function FinalCta() {
  return (
    <section className="px-4 pt-28 pb-28 sm:pt-32">
      <Reveal className="mx-auto max-w-2xl text-center">
        <h2 className="text-[36px] font-semibold leading-[1.1] tracking-[-0.03em] text-[#181925]">
          Trade your view. Hedge the outcome.
        </h2>
        <p className="mx-auto mt-4 max-w-md text-[18px] leading-[1.6] text-[#666666]">
          One position across equities, bonds, derivatives and prediction
          markets. Start in minutes.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild variant="primary" size="cta">
            <Link href="/signup">
              Start trading <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild variant="secondary" size="cta">
            <Link href="#how">See how it works</Link>
          </Button>
        </div>
      </Reveal>
    </section>
  );
}

export { FinalCta };
