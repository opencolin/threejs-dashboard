"use client";

import Link from "next/link";
import { useState } from "react";
import type { Site } from "@/lib/sites";
import { SITES } from "@/lib/sites";
import { TECHNIQUE_LABEL } from "@/lib/constants";

type Props = {
  site: Site;
  children: React.ReactNode;
  /** small caption rendered next to "Live demo" in the chip */
  hint?: string;
};

export function DemoFrame({ site, children, hint }: Props) {
  const [open, setOpen] = useState(true);
  const idx = SITES.findIndex((s) => s.id === site.id);
  const prev = SITES[(idx - 1 + SITES.length) % SITES.length];
  const next = SITES[(idx + 1) % SITES.length];

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#06060c] text-white">
      {/* the canvas */}
      <div className="absolute inset-0">{children}</div>

      {/* gradient masks to keep text legible */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/70 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black/80 to-transparent" />

      {/* top nav */}
      <header className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-4 p-6">
        <Link
          href="/"
          className="pointer-events-auto group inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/40 px-3 py-1.5 text-xs text-white/80 backdrop-blur transition hover:border-white/35 hover:bg-black/60 hover:text-white"
        >
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
            <path d="M7.5 2L3.5 6L7.5 10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          All demos
        </Link>

        <div className="pointer-events-auto flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-[10px] uppercase tracking-wider text-emerald-200">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300" />
            Live demo{hint ? ` · ${hint}` : ""}
          </span>
          <Link
            href={`/demo/${prev.id}`}
            className="rounded-full border border-white/15 bg-black/40 px-2.5 py-1 text-[10px] text-white/70 backdrop-blur transition hover:border-white/35 hover:text-white"
            aria-label="Previous demo"
          >
            ←
          </Link>
          <Link
            href={`/demo/${next.id}`}
            className="rounded-full border border-white/15 bg-black/40 px-2.5 py-1 text-[10px] text-white/70 backdrop-blur transition hover:border-white/35 hover:text-white"
            aria-label="Next demo"
          >
            →
          </Link>
        </div>
      </header>

      {/* bottom info panel */}
      <div className="absolute inset-x-0 bottom-0 z-10 p-6">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-end justify-between gap-4">
            <div className="min-w-0">
              <div className="mb-1 flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-white/55">
                <span>{site.studio}</span>
                <span className="text-white/25">·</span>
                <span>{site.year}</span>
                <span className="text-white/25">·</span>
                <span>{site.industry}</span>
              </div>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{site.name}</h1>
            </div>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="shrink-0 rounded-full border border-white/15 bg-black/40 px-3 py-1.5 text-xs text-white/75 backdrop-blur transition hover:border-white/35 hover:text-white"
            >
              {open ? "Hide notes" : "Show notes"}
            </button>
          </div>

          {open && (
            <div className="mt-4 grid gap-4 rounded-2xl border border-white/10 bg-black/45 p-5 backdrop-blur-md sm:grid-cols-[1fr_auto]">
              <div className="space-y-3">
                <p className="text-sm leading-relaxed text-white/80">{site.summary}</p>
                <div className="flex flex-wrap gap-1.5">
                  {site.techniques.map((t) => (
                    <span
                      key={t}
                      className="rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] text-white/70"
                    >
                      {TECHNIQUE_LABEL[t]}
                    </span>
                  ))}
                  {site.stack.map((s) => (
                    <code
                      key={s}
                      className="rounded bg-white/[0.04] px-1.5 py-0.5 font-mono text-[10px] text-white/55"
                    >
                      {s}
                    </code>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-1">
                <Metric label="Mobile perf" value={`${site.mobilePerf}`} suffix="/100" />
                <Metric label="Payload" value={`${site.loadKb}`} suffix=" KB" />
                <Metric label="Target" value={`${site.fps}`} suffix=" fps" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, suffix }: { label: string; value: string; suffix: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2">
      <div className="text-[9px] font-medium uppercase tracking-[0.18em] text-white/40">{label}</div>
      <div className="font-mono text-sm text-white">
        {value}
        <span className="text-white/40">{suffix}</span>
      </div>
    </div>
  );
}
