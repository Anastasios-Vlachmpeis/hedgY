import Link from "next/link";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/landing/section-heading";

const TIERS = [
  {
    name: "Retail",
    price: "$0",
    cadence: "/mo",
    blurb: "Pay only the transparent per-trade fee.",
    features: ["Combined positions", "All prediction markets", "Unified portfolio view"],
    popular: false,
  },
  {
    name: "Pro",
    price: "$29",
    cadence: "/mo",
    blurb: "For active traders structuring daily.",
    features: ["Everything in Retail", "Advanced Basket Builder", "Auto hedge ratios", "Priority routing"],
    popular: true,
  },
  {
    name: "Institutional",
    price: "Custom",
    cadence: "",
    blurb: "Desk-grade access and support.",
    features: ["Everything in Pro", "Dedicated venues & limits", "API & FIX access", "White-glove onboarding"],
    popular: false,
  },
];

function Pricing() {
  return (
    <section id="pricing" className="px-4 pt-28 sm:pt-32">
      <SectionHeading
        eyebrow="Pricing"
        title="Transparent, per-trade pricing"
        sub="Start free and pay only when you trade. Upgrade when you structure more."
      />
      <Reveal className="mx-auto mt-12 grid max-w-5xl items-stretch gap-5 md:grid-cols-3">
        {TIERS.map((t) => (
          <div
            key={t.name}
            className={cn(
              "relative flex flex-col rounded-[24px] p-7",
              t.popular
                ? "bg-white ring-2 ring-[#9580ff] shadow-[0_8px_24px_rgba(149,128,255,0.14)]"
                : "bg-[#f5f5f5]",
            )}
          >
            {t.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#9580ff] px-3 py-1 text-[12px] font-medium text-white">
                Most popular
              </span>
            )}
            <h3 className="text-[15px] font-semibold text-[#181925]">{t.name}</h3>
            <div className="mt-3 flex items-end gap-1">
              <span className="font-mono text-[40px] font-bold leading-none tracking-[-0.03em] text-[#181925]">
                {t.price}
              </span>
              <span className="pb-1 text-[14px] text-[#666666]">{t.cadence}</span>
            </div>
            <p className="mt-3 text-[14px] leading-[1.5] text-[#666666]">{t.blurb}</p>
            <ul className="mt-5 flex flex-1 flex-col gap-2.5">
              {t.features.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-[14px] text-[#3f3f46]">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#f3f1ff]">
                    <Check className="size-3 text-[#9580ff]" strokeWidth={3} />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
            <Button
              asChild
              variant={t.popular ? "primary" : "secondary"}
              className="mt-7 w-full"
            >
              <Link href={t.name === "Institutional" ? "/dashboard" : "/signup"}>
                {t.name === "Institutional" ? "Contact sales" : "Get started"}
              </Link>
            </Button>
          </div>
        ))}
      </Reveal>
    </section>
  );
}

export { Pricing };
