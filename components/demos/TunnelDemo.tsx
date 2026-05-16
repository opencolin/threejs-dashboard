"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { type DemoProps, paletteColors } from "./shared";

const RING_COUNT = 70;
const RING_SPACING = 1.0;

function TunnelRings({ site, speed }: DemoProps & { speed: number }) {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const colorObj = useMemo(() => new THREE.Color(), []);
  const { a, b, c } = paletteColors(site);
  const offset = useRef(0);
  const { camera } = useThree();

  useFrame((state, delta) => {
    offset.current += delta * speed;
    const time = state.clock.elapsedTime;

    for (let i = 0; i < RING_COUNT; i++) {
      // wrap z into a moving conveyor
      const z =
        ((i * RING_SPACING + offset.current) % (RING_COUNT * RING_SPACING)) -
        RING_COUNT * RING_SPACING * 0.7;
      const wobbleX = Math.sin(time * 0.5 + i * 0.2) * 0.4;
      const wobbleY = Math.cos(time * 0.4 + i * 0.31) * 0.3;
      const r = 1.4 + Math.sin(i * 0.4 + time * 0.6) * 0.15;
      dummy.position.set(wobbleX, wobbleY, z);
      dummy.rotation.set(Math.PI / 2, 0, i * 0.08 + time * 0.2);
      dummy.scale.set(r, r, 1);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);

      const k = (i / RING_COUNT + time * 0.05) % 1;
      colorObj.copy(a).lerp(b, k);
      if (k > 0.6) colorObj.lerp(c, (k - 0.6) / 0.4);
      // dim by distance
      const dim = THREE.MathUtils.clamp(1 - Math.abs(z) / 30, 0.2, 1);
      colorObj.multiplyScalar(dim);
      meshRef.current.setColorAt(i, colorObj);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;

    camera.position.x = Math.sin(time * 0.15) * 0.4;
    camera.position.y = Math.cos(time * 0.1) * 0.25;
    camera.lookAt(
      Math.sin(time * 0.3) * 0.2,
      Math.cos(time * 0.25) * 0.2,
      -10,
    );
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, RING_COUNT]}>
      <torusGeometry args={[1, 0.04, 8, 64]} />
      <meshBasicMaterial />
    </instancedMesh>
  );
}

export function TunnelDemo({ site }: DemoProps) {
  const [speed, setSpeed] = useState(3.5);

  return (
    <>
      <Canvas
        camera={{ position: [0, 0, 0], fov: 65, near: 0.1, far: 100 }}
        dpr={[1, 2]}
        gl={{ antialias: true }}
      >
        <color attach="background" args={[site.palette[0]]} />
        <fog attach="fog" args={[site.palette[0], 6, 28]} />
        <TunnelRings site={site} speed={speed} />
      </Canvas>
      <div className="pointer-events-none absolute inset-x-0 top-20 z-10 flex justify-center">
        <div className="pointer-events-auto flex items-center gap-3 rounded-full border border-white/15 bg-black/50 px-3 py-1.5 text-[10px] uppercase tracking-wider text-white/70 backdrop-blur">
          <span>Speed</span>
          <input
            type="range"
            min="0.5"
            max="9"
            step="0.1"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="accent-white"
            style={{ width: 110 }}
          />
          <span className="w-8 text-right font-mono text-white/85">{speed.toFixed(1)}</span>
        </div>
      </div>
    </>
  );
}
