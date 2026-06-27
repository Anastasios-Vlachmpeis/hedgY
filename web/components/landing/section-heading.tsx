import * as React from "react";

import { cn } from "@/lib/utils";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Reveal } from "@/components/ui/reveal";

/** eyebrow → H2 → sub, centered, revealing on scroll. */
function SectionHeading({
  eyebrow,
  title,
  sub,
  className,
}: {
  eyebrow: string;
  title: React.ReactNode;
  sub?: React.ReactNode;
  className?: string;
}) {
  return (
    <Reveal className={cn("mx-auto max-w-2xl text-center", className)}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="mt-4 text-[36px] font-semibold leading-[1.1] tracking-[-0.03em] text-[#181925]">
        {title}
      </h2>
      {sub && (
        <p className="mx-auto mt-4 max-w-xl text-[18px] leading-[1.6] text-[#666666]">
          {sub}
        </p>
      )}
    </Reveal>
  );
}

export { SectionHeading };
