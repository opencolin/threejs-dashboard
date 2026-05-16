"use client";

import { useMemo, useState } from "react";
import { SITES, type Award, type Industry, type Technique } from "@/lib/sites";
import { SORT_OPTIONS, type SortKey, INDUSTRIES, TECHNIQUES, AWARDS } from "@/lib/constants";
import { Filters, type FilterState } from "./Filters";
import { SiteCard } from "./SiteCard";

const AWARD_WEIGHT: Record<Award, number> = {
  "Awwwards SOTM": 5,
  FWA: 4,
  "Awwwards SOTD": 3,
  "Codrops Hot": 2,
  CSSDA: 1,
  "OFFF Pick": 1,
};

const defaultFilters = (): FilterState => ({
  techniques: new Set(),
  industries: new Set(),
  awards: new Set(),
  minPerf: 50,
  year: "all",
});

export function Dashboard() {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [sort, setSort] = useState<SortKey>("awards");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SITES.filter((s) => {
      if (filters.year !== "all" && s.year !== filters.year) return false;
      if (s.mobilePerf < filters.minPerf) return false;
      if (filters.techniques.size > 0 && !s.techniques.some((t) => filters.techniques.has(t))) return false;
      if (filters.industries.size > 0 && !filters.industries.has(s.industry)) return false;
      if (filters.awards.size > 0 && !s.awards.some((a) => filters.awards.has(a))) return false;
      if (q) {
        const hay = `${s.name} ${s.studio} ${s.summary} ${s.stack.join(" ")}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [filters, query]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    switch (sort) {
      case "awards":
        return arr.sort(
          (a, b) =>
            b.awards.reduce((acc, x) => acc + AWARD_WEIGHT[x], 0) -
            a.awards.reduce((acc, x) => acc + AWARD_WEIGHT[x], 0),
        );
      case "performance":
        return arr.sort((a, b) => b.mobilePerf - a.mobilePerf);
      case "lightest":
        return arr.sort((a, b) => a.loadKb - b.loadKb);
      case "newest":
        return arr.sort((a, b) => b.year - a.year);
      case "alpha":
        return arr.sort((a, b) => a.name.localeCompare(b.name));
    }
  }, [filtered, sort]);

  const counts = useMemo(() => {
    const techniques = {} as Record<Technique, number>;
    const industries = {} as Record<Industry, number>;
    const awards = {} as Record<Award, number>;
    TECHNIQUES.forEach((t) => (techniques[t] = 0));
    INDUSTRIES.forEach((i) => (industries[i] = 0));
    AWARDS.forEach((a) => (awards[a] = 0));

    // Calculate counts ignoring the filter for the dimension itself,
    // so toggling on a checkbox doesn't make sibling counts collapse.
    SITES.forEach((s) => {
      const passYear = filters.year === "all" || s.year === filters.year;
      const passPerf = s.mobilePerf >= filters.minPerf;
      if (!passYear || !passPerf) return;
      const passIndustry = filters.industries.size === 0 || filters.industries.has(s.industry);
      const passAward = filters.awards.size === 0 || s.awards.some((a) => filters.awards.has(a));
      const passTech = filters.techniques.size === 0 || s.techniques.some((t) => filters.techniques.has(t));

      if (passIndustry && passAward) s.techniques.forEach((t) => techniques[t]++);
      if (passTech && passAward) industries[s.industry]++;
      if (passTech && passIndustry) s.awards.forEach((a) => awards[a]++);
    });

    return { techniques, industries, awards };
  }, [filters]);

  const avgPerf = sorted.length
    ? Math.round(sorted.reduce((a, s) => a + s.mobilePerf, 0) / sorted.length)
    : 0;
  const avgKb = sorted.length
    ? Math.round(sorted.reduce((a, s) => a + s.loadKb, 0) / sorted.length)
    : 0;

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
      <Filters
        value={filters}
        onChange={setFilters}
        counts={counts}
        onReset={() => setFilters(defaultFilters())}
      />

      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4 backdrop-blur">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <Stat label="Sites" value={sorted.length} />
            <Stat label="Avg perf" value={avgPerf || "—"} suffix={avgPerf ? " /100" : ""} />
            <Stat label="Avg payload" value={avgKb || "—"} suffix={avgKb ? " KB" : ""} />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="search"
              placeholder="Search studios, stacks…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-44 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-1.5 text-xs text-white placeholder:text-white/35 outline-none transition focus:border-white/30 focus:bg-white/[0.04]"
            />
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="appearance-none rounded-lg border border-white/10 bg-white/[0.02] py-1.5 pl-3 pr-8 text-xs text-white outline-none transition focus:border-white/30"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.key} value={o.key} className="bg-neutral-900">
                    Sort: {o.label}
                  </option>
                ))}
              </select>
              <svg
                className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-white/40"
                width="10"
                height="10"
                viewBox="0 0 10 10"
              >
                <path d="M2 4l3 3 3-3" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </div>

        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/15 p-16 text-center">
            <p className="text-sm text-white/70">No sites match these filters.</p>
            <button
              onClick={() => {
                setFilters(defaultFilters());
                setQuery("");
              }}
              className="text-xs text-violet-300 hover:text-violet-200"
            >
              Reset all
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {sorted.map((s) => (
              <SiteCard key={s.id} site={s} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, suffix = "" }: { label: string; value: string | number; suffix?: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/40">{label}</span>
      <span className="font-mono text-base text-white">
        {value}
        <span className="text-white/40">{suffix}</span>
      </span>
    </div>
  );
}
