"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { type DemoProps, paletteColors, seedFromId } from "./shared";

const PIECE_COUNT = 48;

function ShardField({ site, exploded }: DemoProps & { exploded: boolean }) {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const colorObj = useMemo(() => new THREE.Color(), []);
  const seed = seedFromId(site.id);
  const { a, b, c } = paletteColors(site);

  // generate fixed per-instance data
  const data = useMemo(() => {
    const rng = mulberry32(Math.floor(seed * 1e9));
    return Array.from({ length: PIECE_COUNT }).map((_, i) => {
      // arrange in approximate sphere
      const phi = Math.acos(2 * rng() - 1);
      const theta = rng() * Math.PI * 2;
      const homeR = 0.9 + rng() * 0.2;
      const home = new THREE.Vector3(
        Math.sin(phi) * Math.cos(theta) * homeR,
        Math.sin(phi) * Math.sin(theta) * homeR,
        Math.cos(phi) * homeR,
      );
      const explode = home.clone().normalize().multiplyScalar(1.6 + rng() * 1.5);
      return {
        home,
        explode,
        size: [
          0.18 + rng() * 0.22,
          0.05 + rng() * 0.05,
          0.18 + rng() * 0.22,
        ] as [number, number, number],
        spin: new THREE.Vector3(rng() - 0.5, rng() - 0.5, rng() - 0.5).multiplyScalar(0.4),
        baseRot: new THREE.Euler(rng() * Math.PI, rng() * Math.PI, rng() * Math.PI),
        phase: rng() * Math.PI * 2,
        colorT: rng(),
        index: i,
      };
    });
  }, [seed]);

  const tween = useRef(0);

  useFrame((state, delta) => {
    const target = exploded ? 1 : 0;
    tween.current += (target - tween.current) * Math.min(1, delta * 4);
    const t = tween.current;
    const time = state.clock.elapsedTime;

    for (let i = 0; i < PIECE_COUNT; i++) {
      const d = data[i];
      const px = THREE.MathUtils.lerp(d.home.x, d.explode.x, t);
      const py = THREE.MathUtils.lerp(d.home.y, d.explode.y, t);
      const pz = THREE.MathUtils.lerp(d.home.z, d.explode.z, t);
      dummy.position.set(px, py + Math.sin(time + d.phase) * 0.05 * t, pz);
      dummy.rotation.set(
        d.baseRot.x + d.spin.x * time * (0.4 + t * 1.2),
        d.baseRot.y + d.spin.y * time * (0.4 + t * 1.2),
        d.baseRot.z + d.spin.z * time * (0.4 + t * 1.2),
      );
      dummy.scale.set(d.size[0], d.size[1], d.size[2]);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
      colorObj.copy(a).lerp(b, d.colorT);
      if (d.colorT > 0.7) colorObj.lerp(c, (d.colorT - 0.7) / 0.3);
      meshRef.current.setColorAt(i, colorObj);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
    meshRef.current.rotation.y += delta * 0.16;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, PIECE_COUNT]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial roughness={0.35} metalness={0.55} />
    </instancedMesh>
  );
}

export function ShardsDemo({ site }: DemoProps) {
  const [exploded, setExploded] = useState(false);

  return (
    <>
      <Canvas
        camera={{ position: [0, 0.4, 4.4], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true }}
        onPointerDown={() => setExploded((v) => !v)}
      >
        <color attach="background" args={["#06060c"]} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 4]} intensity={1.6} color={site.palette[1]} />
        <directionalLight position={[-4, -2, -3]} intensity={0.9} color={site.palette[2]} />
        <ShardField site={site} exploded={exploded} />
      </Canvas>
      <div className="pointer-events-none absolute inset-x-0 top-20 z-10 flex justify-center">
        <span className="rounded-full border border-white/15 bg-black/50 px-3 py-1 text-[10px] uppercase tracking-wider text-white/65 backdrop-blur">
          {exploded ? "Click to assemble" : "Click to explode"}
        </span>
      </div>
    </>
  );
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
