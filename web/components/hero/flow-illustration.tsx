/**
 * Signature hero illustration: hundreds of ultra-thin flowing lines that travel
 * horizontally and converge into a central sphere. Left side blue, right side
 * purple/pink. Mathematical / signal-processing feel — no blobs, no mesh.
 */
const W = 1160;
const H = 560;
const CX = 580;
const CY = 280;
const R = 88;

const EDGE_TOP = 18;
const EDGE_BOT = H - 18;
const N = 88;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// Land each line on the sphere's circular edge so the convergence is hidden
// behind the sphere itself (no pinch or gap beneath it).
const R_END = R - 2;
function arc(angleDeg: number): { x: number; y: number } {
  const a = (angleDeg * Math.PI) / 180;
  return { x: CX + R_END * Math.cos(a), y: CY + R_END * Math.sin(a) };
}

function leftPath(t: number): string {
  const y0 = lerp(EDGE_TOP, EDGE_BOT, t);
  const e = arc(lerp(232, 128, t)); // top -> bottom of the left arc
  return `M0 ${y0.toFixed(1)} C 330 ${y0.toFixed(1)}, ${(CX - R - 150).toFixed(1)} ${e.y.toFixed(1)}, ${e.x.toFixed(1)} ${e.y.toFixed(1)}`;
}

function rightPath(t: number): string {
  const y0 = lerp(EDGE_TOP, EDGE_BOT, t);
  const s = arc(lerp(-52, 52, t)); // top -> bottom of the right arc
  return `M${s.x.toFixed(1)} ${s.y.toFixed(1)} C ${(CX + R + 150).toFixed(1)} ${s.y.toFixed(1)}, ${(W - 330).toFixed(1)} ${y0.toFixed(1)}, ${W} ${y0.toFixed(1)}`;
}

const TS = Array.from({ length: N }, (_, i) => i / (N - 1));

export function FlowIllustration() {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
        aria-hidden
      >
        <defs>
          <linearGradient id="vBlue" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2={CX} y2="0">
            <stop offset="0" stopColor="#5E8CFF" stopOpacity="0.03" />
            <stop offset="0.55" stopColor="#5E8CFF" stopOpacity="0.3" />
            <stop offset="1" stopColor="#6E84FF" stopOpacity="0.55" />
          </linearGradient>
          <linearGradient id="vPurp" gradientUnits="userSpaceOnUse" x1={CX} y1="0" x2={W} y2="0">
            <stop offset="0" stopColor="#7C5CFF" stopOpacity="0.55" />
            <stop offset="0.42" stopColor="#B07DFF" stopOpacity="0.32" />
            <stop offset="1" stopColor="#D98DFF" stopOpacity="0.04" />
          </linearGradient>
          <filter id="vSoft" x="-5%" y="-20%" width="110%" height="140%">
            <feGaussianBlur stdDeviation="2.6" />
          </filter>
        </defs>

        {/* soft glow pass */}
        <g filter="url(#vSoft)" opacity="0.5">
          {TS.map((t, i) => (
            <path key={`lgb${i}`} d={leftPath(t)} fill="none" stroke="url(#vBlue)" strokeWidth="0.9" />
          ))}
          {TS.map((t, i) => (
            <path key={`rgb${i}`} d={rightPath(t)} fill="none" stroke="url(#vPurp)" strokeWidth="0.9" />
          ))}
        </g>

        {/* crisp pass */}
        <g>
          {TS.map((t, i) => (
            <path key={`l${i}`} d={leftPath(t)} fill="none" stroke="url(#vBlue)" strokeWidth="0.6" />
          ))}
          {TS.map((t, i) => (
            <path key={`r${i}`} d={rightPath(t)} fill="none" stroke="url(#vPurp)" strokeWidth="0.6" />
          ))}
        </g>
      </svg>

      {/* central sphere */}
      <div className="verso-breathe relative z-10 flex size-[184px] flex-col items-center justify-center rounded-full border border-[#ECEAFF] bg-[radial-gradient(circle_at_50%_36%,#ffffff_0%,#f4f1ff_72%,#efeaff_100%)] text-center shadow-[0_24px_70px_-24px_rgba(124,92,255,0.42),0_0_0_10px_rgba(255,255,255,0.55)]">
        <VersoMark className="h-[18px] w-auto" />
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

export function VersoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 16" className={className} fill="#0F172A" aria-hidden>
      <rect x="0" y="0.8" width="7.5" height="2.6" rx="1.3" />
      <circle cx="11.6" cy="2.1" r="1.4" />
      <circle cx="16.4" cy="2.1" r="1.4" />
      <circle cx="21" cy="2.1" r="1.4" />
      <circle cx="2" cy="8" r="1.4" />
      <rect x="6" y="6.7" width="10" height="2.6" rx="1.3" />
      <circle cx="20.2" cy="8" r="1.4" />
      <rect x="0" y="12.6" width="7.5" height="2.6" rx="1.3" />
      <circle cx="11.6" cy="13.9" r="1.4" />
      <circle cx="16.4" cy="13.9" r="1.4" />
    </svg>
  );
}
