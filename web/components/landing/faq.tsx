import { Accordion, type AccordionItem } from "@/components/ui/accordion";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/landing/section-heading";

const ITEMS: AccordionItem[] = [
  {
    q: "What can I trade?",
    a: "Equities, bonds and simple derivatives alongside prediction-market contracts — combined into a single structured position when you want them to move together.",
  },
  {
    q: "How does the hedging work?",
    a: "Pick a directional view and the outcome that offsets it. We compute a hedge ratio that sizes the prediction-market leg against your instrument leg, then bundle both into one position.",
  },
  {
    q: "Which venues do you cover?",
    a: "We aggregate across prediction markets like Kalshi and Polymarket and brokers like Alpaca and IBKR, routing each leg to the venue with the best available execution.",
  },
  {
    q: "Is it available in my country?",
    a: "Availability depends on the venues and instruments permitted in your jurisdiction. Create an account and we'll show exactly what you can trade where you are.",
  },
];

function Faq() {
  return (
    <section className="px-4 pt-28 sm:pt-32">
      <SectionHeading eyebrow="FAQ" title="Questions, answered" />
      <Reveal className="mx-auto mt-10 max-w-2xl">
        <Accordion items={ITEMS} />
      </Reveal>
    </section>
  );
}

export { Faq };
