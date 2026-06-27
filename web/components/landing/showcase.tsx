import { Reveal } from "@/components/ui/reveal";
import {
  BasketBuilderCard,
  StockTile,
  PredictionTile,
} from "@/components/landing/product-cards";

/**
 * The "real product" signal: a pastel radial-mesh panel with a live
 * combined-position card as the centerpiece and two smaller real tiles
 * floating on the edges. Centerpiece fades into the page at the bottom.
 */
function Showcase() {
  return (
    <section className="px-4 pt-20 sm:pt-24">
      <Reveal className="mx-auto max-w-6xl">
        <div className="mesh-panel relative overflow-hidden rounded-[34px] px-6 pt-16 pb-0 sm:px-12">
          {/* floating real tiles (decorative on large screens) */}
          <StockTile className="anim-floaty absolute left-6 top-16 hidden scale-[0.85] lg:block" />
          <PredictionTile className="anim-floaty absolute right-6 top-24 hidden scale-[0.85] lg:block [animation-delay:1.2s]" />

          {/* centerpiece */}
          <div className="relative mx-auto flex max-w-md justify-center">
            <BasketBuilderCard />
          </div>

          {/* bottom fade — centerpiece dissolves into the canvas */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-transparent to-white" />
        </div>
      </Reveal>
    </section>
  );
}

export { Showcase };
