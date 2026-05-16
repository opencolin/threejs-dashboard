import * as THREE from "three";
import type { Site } from "@/lib/sites";

export type DemoProps = { site: Site };

export function paletteColors(site: Site) {
  const [a, b, c] = site.palette;
  return {
    a: new THREE.Color(a),
    b: new THREE.Color(b),
    c: new THREE.Color(c),
    aHex: a,
    bHex: b,
    cHex: c,
  };
}

/** stable per-site seed in [0,1) */
export function seedFromId(id: string) {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = (h * 16777619) >>> 0;
  }
  return (h >>> 0) / 0xffffffff;
}
