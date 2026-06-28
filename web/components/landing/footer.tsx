import Link from "next/link";

import { WORDMARK } from "@/lib/brand";

const LINKS = [
  { label: "Product", items: ["Basket Builder", "Markets", "Pricing", "Portfolio"] },
  { label: "Company", items: ["About", "Careers", "Blog", "Contact"] },
  { label: "Legal", items: ["Terms", "Privacy", "Disclosures", "Risk"] },
];

function Footer() {
  return (
    <footer className="border-t border-[#ececec] px-4 py-14">
      <div className="mx-auto grid max-w-5xl gap-10 sm:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div>
          <Link href="/" className="flex items-center gap-2">
            <span className="text-[18px] font-semibold tracking-[-0.02em] text-[#181925]">
              {WORDMARK}
            </span>
          </Link>
          <p className="mt-3 max-w-[230px] text-[13px] leading-[1.6] text-[#737373]">
            Trade the world&apos;s markets — and its outcomes — in one position.
          </p>
        </div>
        {LINKS.map((col) => (
          <div key={col.label}>
            <p className="text-[12px] font-medium uppercase tracking-wider text-[#a3a3a3]">
              {col.label}
            </p>
            <ul className="mt-3 flex flex-col gap-2">
              {col.items.map((it) => (
                <li key={it}>
                  <Link
                    href="/dashboard"
                    className="text-[14px] text-[#3f3f46] transition-colors hover:text-[#181925]"
                  >
                    {it}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mx-auto mt-12 max-w-5xl border-t border-[#f0f0f0] pt-6">
        <p className="text-[12px] text-[#a3a3a3]">
          © {WORDMARK}. Illustrative placeholder site — not investment advice.
        </p>
      </div>
    </footer>
  );
}

export { Footer };
