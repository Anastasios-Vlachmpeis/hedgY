/**
 * Signature hero illustration: two fields of ultra-thin streamlines that swirl
 * out of the side cards and converge tangentially into a central sphere.
 *
 * The line field is deliberately confined to the *gap between the two cards*
 * (the SVG layer is inset by the card width on each side), so the lines never
 * cross over the Stocks/Prediction panels — they read as flowing out from
 * behind each card's inner edge. Left side blue, right side purple. A few
 * pulses travel the streams for a live, "data-into-the-hedge" feel.
 */

const VBW = 700;
const VBH = 440;
const CX = VBW / 2; // 350
const CY = VBH / 2; // 220
const R = 70; // landing radius — tucks just under the 184px sphere

const TOP = 36;
const BOT = VBH - 36;
const N = 60;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const rad = (d: number) => (d * Math.PI) / 180;

function pt(a: number) {
  return { x: CX + R * Math.cos(rad(a)), y: CY + R * Math.sin(rad(a)) };
}

/**
 * A single streamline: launches horizontally from a card's inner edge, then
 * arrives at the sphere along a near-tangent so the bundle appears to wrap and
 * spiral inward rather than spear straight through.
 */
function stream(xStart: number, yS: number, a: number, swirl: number): string {
  const E = pt(a);
  // inward normal (toward centre) + a tangential swirl component
  const n = { x: -Math.cos(rad(a)), y: -Math.sin(rad(a)) };
  const t = { x: -Math.sin(rad(a)), y: Math.cos(rad(a)) };
  const V = { x: n.x + swirl * t.x, y: n.y + swirl * t.y };
  const P2 = { x: E.x - 54 * V.x, y: E.y - 54 * V.y };
  const P1x = lerp(xStart, CX, 0.5);
  return `M${xStart} ${yS.toFixed(1)} C ${P1x.toFixed(1)} ${yS.toFixed(1)}, ${P2.x.toFixed(1)} ${P2.y.toFixed(1)}, ${E.x.toFixed(1)} ${E.y.toFixed(1)}`;
}

const TS = Array.from({ length: N }, (_, i) => i / (N - 1));
const leftPath = (t: number) => stream(0, lerp(TOP, BOT, t), lerp(225, 135, t), 0.42);
const rightPath = (t: number) => stream(VBW, lerp(TOP, BOT, t), lerp(-45, 45, t), -0.42);

// A handful of brighter "accent" streams woven through the field.
const ACCENTS = [0.16, 0.4, 0.62, 0.84];
// Pulses ride a few representative streams toward the sphere.
const PULSES = [0.26, 0.5, 0.74];

export function FlowIllustration() {
  return (
    <div className="pointer-events-none absolute inset-0">
      {/* line field — confined to the gap between the two 300px side cards.
          Uniform scaling (slice) keeps the streamlines' true horizontal shape at
          any band width: full height is always shown, the field scales 1:1
          horizontally, and the outer ends simply tuck behind the cards when the
          gap is narrower than the authored 700px — so it never squishes into a
          radial starburst. */}
      <div className="absolute inset-y-0 left-[300px] right-[300px]">
        <svg
          viewBox={`0 0 ${VBW} ${VBH}`}
          preserveAspectRatio="xMidYMid slice"
          className="absolute inset-0 h-full w-full"
          aria-hidden
        >
          <defs>
            <linearGradient id="vBlue" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={CX} y2="0">
              <stop offset="0" stopColor="#5E8CFF" stopOpacity="0" />
              <stop offset="0.32" stopColor="#5E8CFF" stopOpacity="0.16" />
              <stop offset="0.78" stopColor="#6E84FF" stopOpacity="0.5" />
              <stop offset="1" stopColor="#7C5CFF" stopOpacity="0.7" />
            </linearGradient>
            <linearGradient id="vPurp" gradientUnits="userSpaceOnUse" x1={CX} y1="0" x2={VBW} y2="0">
              <stop offset="0" stopColor="#7C5CFF" stopOpacity="0.7" />
              <stop offset="0.22" stopColor="#9A6BFF" stopOpacity="0.5" />
              <stop offset="0.68" stopColor="#C089FF" stopOpacity="0.16" />
              <stop offset="1" stopColor="#D98DFF" stopOpacity="0" />
            </linearGradient>
            <radialGradient id="vCore" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="#8B6BFF" stopOpacity="0.5" />
              <stop offset="0.6" stopColor="#8B6BFF" stopOpacity="0.12" />
              <stop offset="1" stopColor="#8B6BFF" stopOpacity="0" />
            </radialGradient>
            <filter id="vSoft" x="-10%" y="-25%" width="120%" height="150%">
              <feGaussianBlur stdDeviation="3" />
            </filter>
          </defs>

          {/* faint halo where everything converges */}
          <ellipse cx={CX} cy={CY} rx="150" ry="120" fill="url(#vCore)" />

          {/* soft glow pass */}
          <g filter="url(#vSoft)" opacity="0.55">
            {TS.map((t, i) => (
              <path key={`lg${i}`} d={leftPath(t)} fill="none" stroke="url(#vBlue)" strokeWidth="0.9" />
            ))}
            {TS.map((t, i) => (
              <path key={`rg${i}`} d={rightPath(t)} fill="none" stroke="url(#vPurp)" strokeWidth="0.9" />
            ))}
          </g>

          {/* crisp pass */}
          <g>
            {TS.map((t, i) => (
              <path key={`l${i}`} d={leftPath(t)} fill="none" stroke="url(#vBlue)" strokeWidth="0.55" />
            ))}
            {TS.map((t, i) => (
              <path key={`r${i}`} d={rightPath(t)} fill="none" stroke="url(#vPurp)" strokeWidth="0.55" />
            ))}
          </g>

          {/* accent streams */}
          <g opacity="0.9">
            {ACCENTS.map((t, i) => (
              <path key={`la${i}`} d={leftPath(t)} fill="none" stroke="url(#vBlue)" strokeWidth="1.1" strokeLinecap="round" />
            ))}
            {ACCENTS.map((t, i) => (
              <path key={`ra${i}`} d={rightPath(t)} fill="none" stroke="url(#vPurp)" strokeWidth="1.1" strokeLinecap="round" />
            ))}
          </g>

          {/* travelling pulses */}
          {PULSES.map((t, i) => (
            <circle key={`pl${i}`} r="1.9" fill="#6E84FF">
              <animateMotion
                dur={`${3.1 + i * 0.7}s`}
                begin={`${i * 0.9}s`}
                repeatCount="indefinite"
                keyPoints="0;1"
                keyTimes="0;1"
                calcMode="spline"
                keySplines="0.4 0 0.6 1"
                path={leftPath(t)}
              />
              <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.12;0.75;1" dur={`${3.1 + i * 0.7}s`} begin={`${i * 0.9}s`} repeatCount="indefinite" />
            </circle>
          ))}
          {PULSES.map((t, i) => (
            <circle key={`pr${i}`} r="1.9" fill="#B07DFF">
              <animateMotion
                dur={`${3.4 + i * 0.6}s`}
                begin={`${0.4 + i * 0.9}s`}
                repeatCount="indefinite"
                keyPoints="1;0"
                keyTimes="0;1"
                calcMode="spline"
                keySplines="0.4 0 0.6 1"
                path={rightPath(t)}
              />
              <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.12;0.75;1" dur={`${3.4 + i * 0.6}s`} begin={`${0.4 + i * 0.9}s`} repeatCount="indefinite" />
            </circle>
          ))}
        </svg>
      </div>

      {/* central sphere */}
      <div className="verso-breathe absolute left-1/2 top-1/2 z-10 flex size-[184px] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-[#ECEAFF] bg-[radial-gradient(circle_at_50%_36%,#ffffff_0%,#f4f1ff_72%,#efeaff_100%)] text-center shadow-[0_24px_70px_-24px_rgba(124,92,255,0.42),0_0_0_10px_rgba(255,255,255,0.55)]">
        <span className="text-[16px] font-semibold tracking-[-0.02em] text-[#0F172A]">hedgY</span>
        <div className="mt-2 text-[15px] font-semibold tracking-[-0.01em] text-[#0F172A]">
          Smart hedge
        </div>
        <div className="mt-1 text-[12px] leading-tight text-[#64748B]">
          One position.
          <br />
          Two markets.
        </div>
      </div>
    </div>
  );
}
