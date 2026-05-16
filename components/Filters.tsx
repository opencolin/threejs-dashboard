"use client";

import type { Technique, Industry, Award } from "@/lib/sites";
import { TECHNIQUES, INDUSTRIES, AWARDS, TECHNIQUE_LABEL } from "@/lib/constants";

export type FilterState = {
  techniques: Set<Technique>;
  industries: Set<Industry>;
  awards: Set<Award>;
  minPerf: number;
  year: "all" | 2025 | 2026;
};

type Props = {
  value: FilterState;
  onChange: (next: FilterState) => void;
  counts: {
    techniques: Record<Technique, number>;
    industries: Record<Industry, number>;
    awards: Record<Award, number>;
  };
  onReset: () => void;
};

export function Filters({ value, onChange, counts, onReset }: Props) {
  const toggle = <T,>(set: Set<T>, item: T): Set<T> => {
    const next = new Set(set);
    if (next.has(item)) next.delete(item);
    else next.add(item);
    return next;
  };

  return (
    <aside className="sticky top-6 flex max-h-[calc(100vh-3rem)] flex-col gap-6 overflow-y-auto rounded-2xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">Filters</h2>
        <button
          type="button"
          onClick={onReset}
          className="text-[11px] text-white/45 transition hover:text-white"
        >
          Reset
        </button>
      </div>

      <Section title="Animation technique">
        {TECHNIQUES.map((t) => (
          <Check
            key={t}
            label={TECHNIQUE_LABEL[t]}
            count={counts.techniques[t]}
            checked={value.techniques.has(t)}
            onChange={() => onChange({ ...value, techniques: toggle(value.techniques, t) })}
          />
        ))}
      </Section>

      <Section title="Industry">
        {INDUSTRIES.map((i) => (
          <Check
            key={i}
            label={i}
            count={counts.industries[i]}
            checked={value.industries.has(i)}
            onChange={() => onChange({ ...value, industries: toggle(value.industries, i) })}
          />
        ))}
      </Section>

      <Section title="Recognition">
        {AWARDS.map((a) => (
          <Check
            key={a}
            label={a}
            count={counts.awards[a]}
            checked={value.awards.has(a)}
            onChange={() => onChange({ ...value, awards: toggle(value.awards, a) })}
          />
        ))}
      </Section>

      <Section title="Year">
        <div className="flex gap-1.5">
          {(["all", 2026, 2025] as const).map((y) => (
            <button
              key={y}
              type="button"
              onClick={() => onChange({ ...value, year: y })}
              className={`flex-1 rounded-md border px-2 py-1.5 text-xs transition ${
                value.year === y
                  ? "border-white/40 bg-white/10 text-white"
                  : "border-white/10 bg-white/[0.02] text-white/55 hover:border-white/20 hover:text-white/80"
              }`}
            >
              {y === "all" ? "All" : y}
            </button>
          ))}
        </div>
      </Section>

      <Section title={`Min mobile perf: ${value.minPerf}`}>
        <input
          type="range"
          min={50}
          max={100}
          step={1}
          value={value.minPerf}
          onChange={(e) => onChange({ ...value, minPerf: Number(e.target.value) })}
          className="w-full accent-violet-400"
        />
        <div className="flex justify-between font-mono text-[10px] text-white/40">
          <span>50</span>
          <span>75</span>
          <span>100</span>
        </div>
      </Section>
    </aside>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2.5">
      <h3 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">{title}</h3>
      <div className="flex flex-col gap-1.5">{children}</div>
    </section>
  );
}

function Check({
  label,
  count,
  checked,
  onChange,
}: {
  label: string;
  count: number;
  checked: boolean;
  onChange: () => void;
}) {
  const disabled = count === 0 && !checked;
  return (
    <label
      className={`group flex cursor-pointer items-center justify-between gap-2 rounded-md px-1.5 py-1 transition hover:bg-white/5 ${
        disabled ? "cursor-not-allowed opacity-30" : ""
      }`}
    >
      <span className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="h-3.5 w-3.5 accent-violet-400"
        />
        <span className="text-xs text-white/80">{label}</span>
      </span>
      <span className="font-mono text-[10px] text-white/35">{count}</span>
    </label>
  );
}
