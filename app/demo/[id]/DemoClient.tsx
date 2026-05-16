"use client";

import dynamic from "next/dynamic";
import type { Site } from "@/lib/sites";

const DemoDispatcher = dynamic(
  () => import("@/components/demos/DemoDispatcher").then((m) => m.DemoDispatcher),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 grid place-items-center bg-[#06060c] text-xs uppercase tracking-[0.18em] text-white/40">
        Booting WebGL…
      </div>
    ),
  },
);

export function DemoClient({ site }: { site: Site }) {
  return <DemoDispatcher site={site} />;
}
