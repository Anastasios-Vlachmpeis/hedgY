import Link from "next/link";

import { AuthShowcase } from "@/components/auth/showcase-panel";

/** Split auth layout: form on the left, gradient showcase on the right. */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen grid-cols-1 bg-white lg:grid-cols-[3fr_1fr]">
      {/* left — form */}
      <div className="relative flex flex-col px-6 py-7 sm:px-12">
        <Link href="/" className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-[#8B7CFF]" aria-hidden />
          <span className="text-[18px] font-semibold tracking-[-0.02em] text-[#181925]">
            Verso
          </span>
        </Link>

        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-[380px]">{children}</div>
        </div>

        <p className="text-center text-[12px] text-[#a3a3a3]">
          By continuing, you agree to our{" "}
          <span className="font-medium text-[#8B7CFF]">Terms</span> &amp;{" "}
          <span className="font-medium text-[#8B7CFF]">Privacy Policy</span>.
        </p>
      </div>

      {/* right — full-bleed showcase, hard edge (hidden on small screens) */}
      <div className="hidden lg:block">
        <AuthShowcase />
      </div>
    </div>
  );
}
