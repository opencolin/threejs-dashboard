import type { Site } from "@/lib/sites";

type Props = {
  site: Site;
  className?: string;
};

/**
 * Procedural SVG thumbnail. Each thumbStyle is a different generative pattern
 * keyed off the site's id + palette so it stays stable across renders.
 */
export function Thumbnail({ site, className }: Props) {
  const [a, b, c] = site.palette;
  const seed = hash(site.id);
  const id = `t-${site.id}`;

  return (
    <svg
      viewBox="0 0 400 250"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      role="img"
      aria-label={`${site.name} preview`}
    >
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={a} />
          <stop offset="1" stopColor={shade(a, -20)} />
        </linearGradient>
        <radialGradient id={`${id}-orb`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={c} stopOpacity="1" />
          <stop offset="0.6" stopColor={b} stopOpacity="0.7" />
          <stop offset="1" stopColor={a} stopOpacity="0" />
        </radialGradient>
        <filter id={`${id}-blur`}>
          <feGaussianBlur stdDeviation="6" />
        </filter>
        <filter id={`${id}-noise`}>
          <feTurbulence baseFrequency="0.9" numOctaves="2" seed={seed % 50} />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 1   0 0 0 0 1   0 0 0 0 1   0 0 0 0.06 0"
          />
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>
        <radialGradient id={`${id}-vignette`} cx="0.5" cy="0.5" r="0.7">
          <stop offset="0.55" stopColor="black" stopOpacity="0" />
          <stop offset="1" stopColor="black" stopOpacity="0.35" />
        </radialGradient>
      </defs>

      <rect width="400" height="250" fill={`url(#${id}-bg)`} />

      {site.thumbStyle === "orb" && <Orb id={id} b={b} c={c} seed={seed} />}
      {site.thumbStyle === "ribbon" && <Ribbon b={b} c={c} seed={seed} />}
      {site.thumbStyle === "grid" && <Grid b={b} c={c} seed={seed} />}
      {site.thumbStyle === "noise" && <Noise id={id} b={b} c={c} seed={seed} />}
      {site.thumbStyle === "shards" && <Shards b={b} c={c} seed={seed} />}
      {site.thumbStyle === "wave" && <Wave b={b} c={c} seed={seed} />}
      {site.thumbStyle === "particles" && <Particles b={b} c={c} seed={seed} />}
      {site.thumbStyle === "tunnel" && <Tunnel b={b} c={c} seed={seed} />}

      <rect width="400" height="250" fill="white" filter={`url(#${id}-noise)`} opacity="0.6" />
      <rect width="400" height="250" fill={`url(#${id}-vignette)`} />
    </svg>
  );
}

function Orb({ id, b, c, seed }: { id: string; b: string; c: string; seed: number }) {
  const cx = 140 + (seed % 80);
  const cy = 110 + ((seed >> 3) % 40);
  return (
    <g>
      <circle cx={cx} cy={cy} r="120" fill={`url(#${id}-orb)`} filter={`url(#${id}-blur)`} />
      <circle cx={cx + 30} cy={cy - 20} r="60" fill={c} opacity="0.85" filter={`url(#${id}-blur)`} />
      <circle cx={cx + 50} cy={cy - 30} r="14" fill="#fff" opacity="0.9" />
      <circle cx={cx - 60} cy={cy + 70} r="34" fill={b} opacity="0.6" filter={`url(#${id}-blur)`} />
    </g>
  );
}

function Ribbon({ b, c, seed }: { b: string; c: string; seed: number }) {
  const phase = (seed % 360) / 60;
  const path = (offset: number) =>
    `M -20 ${round(130 + Math.sin(phase + offset) * 30)}
     C 80 ${round(50 + offset * 18)}, 200 ${round(200 - offset * 22)}, 420 ${round(120 + Math.cos(phase) * 30)}`;
  return (
    <g fill="none" strokeLinecap="round">
      <path d={path(0)} stroke={b} strokeWidth="46" opacity="0.85" />
      <path d={path(1)} stroke={c} strokeWidth="22" opacity="0.9" />
      <path d={path(2)} stroke="#fff" strokeWidth="2" opacity="0.6" />
    </g>
  );
}

function Grid({ b, c, seed }: { b: string; c: string; seed: number }) {
  const cells = [];
  const rng = mulberry32(seed);
  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 16; x++) {
      const v = rng();
      if (v < 0.15) continue;
      const alpha = 0.15 + v * 0.7;
      const color = v > 0.85 ? c : v > 0.6 ? b : "#fff";
      cells.push(
        <rect
          key={`${x}-${y}`}
          x={x * 25 + 4}
          y={y * 25 + 4}
          width={18}
          height={18}
          rx={3}
          fill={color}
          opacity={alpha}
        />,
      );
    }
  }
  return <g>{cells}</g>;
}

function Noise({ id, b, c, seed }: { id: string; b: string; c: string; seed: number }) {
  return (
    <g>
      <rect width="400" height="250" fill={b} opacity="0.18" filter={`url(#${id}-blur)`} />
      <text
        x="200"
        y="155"
        textAnchor="middle"
        fontFamily="monospace"
        fontSize="160"
        fontWeight="900"
        fill={c}
        opacity="0.65"
        style={{ letterSpacing: "-12px" }}
      >
        ◐
      </text>
      <line x1="0" y1={120 + (seed % 30)} x2="400" y2={130 - (seed % 30)} stroke={c} strokeWidth="1" opacity="0.6" />
    </g>
  );
}

function Shards({ b, c, seed }: { b: string; c: string; seed: number }) {
  const rng = mulberry32(seed);
  const shards = Array.from({ length: 12 }).map((_, i) => {
    const x = rng() * 400;
    const y = rng() * 250;
    const w = 40 + rng() * 100;
    const h = 8 + rng() * 24;
    const rot = rng() * 180;
    const color = i % 3 === 0 ? c : b;
    return (
      <rect
        key={i}
        x={x}
        y={y}
        width={w}
        height={h}
        fill={color}
        opacity={0.45 + rng() * 0.4}
        transform={`rotate(${rot} ${x + w / 2} ${y + h / 2})`}
      />
    );
  });
  return <g>{shards}</g>;
}

function Wave({ b, c, seed }: { b: string; c: string; seed: number }) {
  const lines = [];
  for (let i = 0; i < 22; i++) {
    const y = 30 + i * 10;
    const amp = 4 + (i % 5) * 5;
    const phase = (seed + i * 17) % 360;
    const pts: string[] = [];
    for (let x = 0; x <= 400; x += 8) {
      const off = Math.sin(((x + phase) / 40) + i * 0.4) * amp;
      pts.push(`${x},${round(y + off)}`);
    }
    const color = i % 4 === 0 ? c : b;
    lines.push(
      <polyline
        key={i}
        points={pts.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth={i % 4 === 0 ? 1.6 : 0.8}
        opacity={0.35 + (i / 22) * 0.55}
      />,
    );
  }
  return <g>{lines}</g>;
}

function Particles({ b, c, seed }: { b: string; c: string; seed: number }) {
  const rng = mulberry32(seed);
  const pts = Array.from({ length: 120 }).map((_, i) => {
    const x = rng() * 400;
    const y = rng() * 250;
    const r = rng() * 2.4 + 0.4;
    const color = rng() > 0.5 ? c : b;
    return <circle key={i} cx={x} cy={y} r={r} fill={color} opacity={0.4 + rng() * 0.5} />;
  });
  return (
    <g>
      <circle cx="200" cy="125" r="70" fill={b} opacity="0.18" />
      {pts}
    </g>
  );
}

function Tunnel({ b, c, seed }: { b: string; c: string; seed: number }) {
  const rings = [];
  for (let i = 0; i < 14; i++) {
    const r = 8 + i * 14;
    const opacity = 1 - i / 14;
    const color = i % 2 === 0 ? c : b;
    rings.push(
      <ellipse
        key={i}
        cx={200 + ((seed % 40) - 20)}
        cy={125 + ((seed % 30) - 15)}
        rx={r * 1.4}
        ry={r}
        fill="none"
        stroke={color}
        strokeWidth={1 + i * 0.15}
        opacity={opacity * 0.7}
      />,
    );
  }
  return <g>{rings}</g>;
}

// Utils
function round(n: number) {
  return Math.round(n * 100) / 100;
}

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = (h * 16777619) >>> 0;
  }
  return h;
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shade(hex: string, percent: number) {
  const h = hex.replace("#", "");
  const num = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  const r = Math.max(0, Math.min(255, (num >> 16) + percent));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + percent));
  const bl = Math.max(0, Math.min(255, (num & 0xff) + percent));
  return `#${((r << 16) | (g << 8) | bl).toString(16).padStart(6, "0")}`;
}
