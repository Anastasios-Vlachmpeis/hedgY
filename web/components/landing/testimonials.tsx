import * as React from "react";

import { SectionHeading } from "@/components/landing/section-heading";
import { Reveal } from "@/components/ui/reveal";

// Clearly illustrative placeholder quotes — no real people or firms.
const REVIEWS = [
  { quote: "I finally trade the thesis, not five separate tickets. The hedge just comes with it.", who: "Macro trader", tag: "Beta user" },
  { quote: "Pairing a stock view with an election outcome used to take two brokers. Now it's one position.", who: "Portfolio manager", tag: "Beta user" },
  { quote: "The Basket Builder is the first tool that treats prediction markets as real hedges.", who: "Quant researcher", tag: "Beta user" },
  { quote: "Cross-venue execution that actually fills together. This is what I wanted for years.", who: "Prop desk lead", tag: "Beta user" },
  { quote: "Risk view blends equities and outcomes in one place — no more mental math.", who: "Independent trader", tag: "Beta user" },
];

function ReviewCard({ quote, who, tag }: (typeof REVIEWS)[number]) {
  return (
    <figure className="flex h-[212px] w-[330px] shrink-0 flex-col justify-between rounded-[20px] border border-[#ececec] bg-white p-6 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
      <blockquote className="text-[15px] leading-[1.55] text-[#3f3f46]">
        &ldquo;{quote}&rdquo;
      </blockquote>
      <figcaption className="flex items-center gap-3">
        <span className="size-9 rounded-full bg-[#f3f1ff]" aria-hidden />
        <span className="leading-tight">
          <span className="block text-[14px] font-semibold text-[#181925]">{who}</span>
          <span className="block text-[12px] text-[#9580ff]">{tag}</span>
        </span>
      </figcaption>
    </figure>
  );
}

function Testimonials() {
  const row = [...REVIEWS, ...REVIEWS]; // duplicate for seamless marquee
  return (
    <section className="pt-28 sm:pt-32">
      <div className="px-4">
        <SectionHeading
          eyebrow="Testimonials"
          title="Built for people who trade a view"
          sub="A few words from early users. Illustrative placeholders for now."
        />
      </div>
      <Reveal className="marquee-mask mt-12 overflow-hidden">
        <div className="flex w-max animate-marquee gap-5">
          {row.map((r, i) => (
            <ReviewCard key={i} {...r} />
          ))}
        </div>
      </Reveal>
    </section>
  );
}

export { Testimonials };
