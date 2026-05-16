"use client";

import dynamic from "next/dynamic";

const Hero3D = dynamic(() => import("./Hero3D").then((m) => m.Hero3D), {
  ssr: false,
  loading: () => null,
});

export function HeroSection() {
  return (
    <header className="relative isolate overflow-hidden border-b border-white/10">
      <div className="absolute inset-0 -z-20 bg-[radial-gradient(ellipse_at_top,#1a1530_0%,#06060c_55%)]" />
      <Hero3D />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-[#06060c] via-transparent to-[#06060c]/40" />
      <div className="relative mx-auto flex max-w-7xl flex-col gap-6 px-6 py-20 sm:py-28">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-white/55">
          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          Curated · updated weekly · 2026 edition
        </div>
        <h1 className="max-w-3xl text-balance text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
          The best of the web,{" "}
          <span className="bg-gradient-to-r from-violet-300 via-pink-300 to-sky-300 bg-clip-text text-transparent">
            in three dimensions
          </span>
          .
        </h1>
        <p className="max-w-2xl text-pretty text-base text-white/65 sm:text-lg">
          A sortable inspiration board of award-winning Three.js sites — from Awwwards SOTM and FWA
          to Codrops &amp; CSSDA picks. Filter by technique, industry, and mobile performance.
          Every entry includes a technical teardown of how the scene was built.
        </p>
        <div className="flex flex-wrap gap-2 text-xs">
          <Pill>WebGPU</Pill>
          <Pill>GPGPU</Pill>
          <Pill>InstancedMesh</Pill>
          <Pill>Gaussian splats</Pill>
          <Pill>Scroll-driven shaders</Pill>
          <Pill>KTX2 / Draco</Pill>
        </div>
      </div>
    </header>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-white/75 backdrop-blur">
      {children}
    </span>
  );
}
