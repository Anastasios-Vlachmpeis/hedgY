import { Layers, Network, Zap } from "lucide-react";

import { Reveal } from "@/components/ui/reveal";
import { IconTile } from "@/components/ui/icon-tile";

const ITEMS = [
  {
    icon: Layers,
    lead: "One position, every venue",
    text: "Equities, bonds, derivatives and prediction markets settle as a single combined trade.",
  },
  {
    icon: Network,
    lead: "Aggregated across markets",
    text: "Best execution routed across Kalshi, Polymarket, Alpaca and IBKR.",
  },
  {
    icon: Zap,
    lead: "Hedge any thesis in one click",
    text: "Pair a directional view with the outcome that protects it — instantly.",
  },
] as const;

function TrustBar() {
  return (
    <section className="px-4 pt-24 sm:pt-28">
      <Reveal className="mx-auto grid max-w-5xl gap-10 sm:grid-cols-3">
        {ITEMS.map(({ icon, lead, text }) => (
          <div key={lead} className="flex flex-col gap-3">
            <IconTile icon={icon} />
            <p className="text-[17px] font-semibold text-[#181925]">{lead}</p>
            <p className="text-[14px] leading-[1.6] text-[#666666]">{text}</p>
          </div>
        ))}
      </Reveal>
    </section>
  );
}

export { TrustBar };
