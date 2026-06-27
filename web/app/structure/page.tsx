import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { positionFromSuggestion } from "@/lib/mockData";
import { StructuringPanel } from "@/components/structure/structuring-panel";

/** Focused dark workspace for building a combined position. */
export default async function StructurePage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const { from } = await searchParams;
  const position = positionFromSuggestion(from);

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-[#181925]">
            Structure a position
          </h1>
          <p className="mt-0.5 text-[13px] text-[#666666]">
            Pair an equity view with a prediction-market hedge. Drag the hedge
            ratio to reshape the payoff.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 rounded-full bg-[#f5f5f5] px-3.5 py-1.5 text-[13px] font-medium text-[#181925] transition-colors hover:bg-[#ececec]"
        >
          <ArrowLeft className="size-4" /> Dashboard
        </Link>
      </div>

      <StructuringPanel position={position} />
    </div>
  );
}
