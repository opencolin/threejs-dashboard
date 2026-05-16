"use client";

import type { Site } from "@/lib/sites";
import { DemoFrame } from "./DemoFrame";
import { OrbDemo } from "./OrbDemo";
import { RibbonDemo } from "./RibbonDemo";
import { GridDemo } from "./GridDemo";
import { NoiseDemo } from "./NoiseDemo";
import { ShardsDemo } from "./ShardsDemo";
import { WaveDemo } from "./WaveDemo";
import { ParticlesDemo } from "./ParticlesDemo";
import { TunnelDemo } from "./TunnelDemo";

const HINTS: Record<Site["thumbStyle"], string> = {
  orb: "Move pointer",
  ribbon: "Auto",
  grid: "Move pointer",
  noise: "Auto",
  shards: "Click to explode",
  wave: "Drag to ripple",
  particles: "Pointer attracts · click to burst",
  tunnel: "Drag the slider",
};

export function DemoDispatcher({ site }: { site: Site }) {
  return (
    <DemoFrame site={site} hint={HINTS[site.thumbStyle]}>
      {renderDemo(site)}
    </DemoFrame>
  );
}

function renderDemo(site: Site) {
  switch (site.thumbStyle) {
    case "orb":
      return <OrbDemo site={site} />;
    case "ribbon":
      return <RibbonDemo site={site} />;
    case "grid":
      return <GridDemo site={site} />;
    case "noise":
      return <NoiseDemo site={site} />;
    case "shards":
      return <ShardsDemo site={site} />;
    case "wave":
      return <WaveDemo site={site} />;
    case "particles":
      return <ParticlesDemo site={site} />;
    case "tunnel":
      return <TunnelDemo site={site} />;
  }
}
