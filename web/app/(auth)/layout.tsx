import Link from "next/link";

/**
 * Auth layout: a single white canvas with a soft pastel bloom weighted to the
 * right that fades seamlessly into the white (no hard column edge). The form
 * sits in the left half over clean white; the colour integrates rather than
 * being a pasted-on panel.
 *
 * Palette: lavender #E8E3FF · soft purple #C9B8FF · pale pink #F8DDF0 ·
 *          ice blue #EAF3FF · white #FFFFFF · accent #8B7CFF
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-white">
      {/* seamless pastel bloom — anchored right, dissolves into white toward the left */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: [
            "radial-gradient(46% 55% at 100% 4%, #C9B8FF 0%, rgba(201,184,255,0) 62%)",
            "radial-gradient(42% 52% at 114% 44%, #F8DDF0 0%, rgba(248,221,240,0) 60%)",
            "radial-gradient(56% 60% at 98% 104%, #EAF3FF 0%, rgba(234,243,255,0) 64%)",
            "radial-gradient(44% 64% at 90% 26%, #E8E3FF 0%, rgba(232,227,255,0) 66%)",
          ].join(","),
        }}
      />

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1400px] flex-col px-6 py-7 sm:px-12">
        <Link href="/" className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-[#8B7CFF]" aria-hidden />
          <span className="text-[18px] font-semibold tracking-[-0.02em] text-[#181925]">
            Verso
          </span>
        </Link>

        <div className="grid flex-1 items-center lg:grid-cols-2">
          <div className="flex justify-center py-10">
            <div className="w-full max-w-[380px]">{children}</div>
          </div>
          {/* right half intentionally empty — the pastel bloom shows through */}
          <div aria-hidden className="hidden lg:block" />
        </div>

        <p className="text-center text-[12px] text-[#a3a3a3] lg:text-left">
          By continuing, you agree to our{" "}
          <span className="font-medium text-[#8B7CFF]">Terms</span> &amp;{" "}
          <span className="font-medium text-[#8B7CFF]">Privacy Policy</span>.
        </p>
      </div>
    </div>
  );
}
