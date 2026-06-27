/**
 * Right-side panel: soft pastel gradient (lavender / soft purple / pale pink /
 * ice blue / white). A full-bleed vertical rectangle with a hard edge against
 * the white form column. No pattern, no icons, no illustration — smooth blurred
 * blend with a subtle glow.
 *
 * Palette: lavender #E8E3FF · soft purple #C9B8FF · pale pink #F8DDF0 ·
 *          ice blue #EAF3FF · white #FFFFFF · accent #8B7CFF
 */
export function AuthShowcase() {
  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{
        background: [
          // soft purple haze, upper area
          "radial-gradient(135% 55% at 88% 4%, #C9B8FF 0%, rgba(201,184,255,0) 55%)",
          // pale pink glow, right-middle
          "radial-gradient(120% 48% at 100% 44%, #F8DDF0 0%, rgba(248,221,240,0) 56%)",
          // ice blue, lower area
          "radial-gradient(140% 58% at 72% 98%, #EAF3FF 0%, rgba(234,243,255,0) 62%)",
          // near-white blend toward the form edge (left)
          "radial-gradient(95% 130% at 0% 50%, #FFFFFF 0%, rgba(255,255,255,0) 60%)",
          // lavender base, gentle vertical flow
          "linear-gradient(180deg, #ECE7FF 0%, #F4ECFF 48%, #EAF3FF 100%)",
        ].join(","),
      }}
    >
      {/* subtle glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(55% 28% at 82% 22%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 70%)",
        }}
        aria-hidden
      />
    </div>
  );
}
