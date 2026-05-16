"use client";

import { useState } from "react";
import Link from "next/link";
import type { Site } from "@/lib/sites";
import { TECHNIQUE_LABEL } from "@/lib/constants";
import { Thumbnail } from "./Thumbnail";

function PerfBar({ score }: { score: number }) {
  const color = score >= 90 ? "bg-emerald-400" : score >= 80 ? "bg-lime-400" : score >= 70 ? "bg-amber-400" : "bg-rose-400";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <div className={`h-full ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className="font-mono text-xs tabular-nums text-white/70">{score}</span>
    </div>
  );
}

export function SiteCard({ site }: { site: Site }) {
  const [open, setOpen] = useState(false);

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] backdrop-blur transition hover:border-white/25 hover:bg-white/[0.04]">
      <Link href={`/demo/${site.id}`} className="relative block aspect-[8/5] overflow-hidden">
        <Thumbnail site={site} className="h-full w-full transition-transform duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {site.awards.slice(0, 2).map((a) => (
            <span
              key={a}
              className="rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white/90 backdrop-blur-sm"
            >
              {a}
            </span>
          ))}
        </div>
        <div className="absolute right-3 top-3 rounded-full bg-black/55 px-2 py-0.5 font-mono text-[10px] text-white/80 backdrop-blur-sm">
          {site.year}
        </div>
        <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-medium text-black opacity-0 transition-opacity group-hover:opacity-100">
          Open demo
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
            <path d="M3 9L9 3M9 3H4M9 3V8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <header className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-white">{site.name}</h3>
            <p className="truncate text-xs text-white/55">{site.studio} · {site.industry}</p>
          </div>
        </header>

        <div className="flex flex-wrap gap-1.5">
          {site.techniques.map((t) => (
            <span
              key={t}
              className="rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] text-white/70"
            >
              {TECHNIQUE_LABEL[t]}
            </span>
          ))}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-white/45">
            <span>Mobile perf</span>
            <span className="font-mono text-white/55">{site.loadKb}KB · {site.fps}fps</span>
          </div>
          <PerfBar score={site.mobilePerf} />
        </div>

        <div className="mt-auto flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="text-[11px] font-medium text-white/55 transition hover:text-white"
          >
            {open ? "Hide technique" : "Show technique →"}
          </button>
          <Link
            href={`/demo/${site.id}`}
            className="rounded-full border border-white/15 bg-white/[0.04] px-2.5 py-1 text-[10px] uppercase tracking-wider text-white/75 transition hover:border-white/30 hover:text-white"
          >
            Live demo
          </Link>
        </div>

        {open && (
          <div className="space-y-2 border-t border-white/10 pt-3">
            <p className="text-xs leading-relaxed text-white/75">{site.summary}</p>
            <div className="flex flex-wrap gap-1">
              {site.stack.map((s) => (
                <code
                  key={s}
                  className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-white/65"
                >
                  {s}
                </code>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
