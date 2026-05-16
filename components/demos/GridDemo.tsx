"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { type DemoProps, paletteColors } from "./shared";

const ROWS = 36;
const COLS = 60;
const SPACING = 0.18;

function GridField({ site }: DemoProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const colorObj = useMemo(() => new THREE.Color(), []);
  const { a, b, c } = paletteColors(site);
  const pointer = useRef(new THREE.Vector2(0, 0));

  const count = ROWS * COLS;
  const offsets = useMemo(() => {
    const out: { x: number; z: number }[] = [];
    for (let r = 0; r < ROWS; r++) {
      for (let col = 0; col < COLS; col++) {
        out.push({
          x: (col - COLS / 2 + 0.5) * SPACING,
          z: (r - ROWS / 2 + 0.5) * SPACING,
        });
      }
    }
    return out;
  }, []);

  useFrame((state) => {
    pointer.current.lerp(state.pointer, 0.08);
    const t = state.clock.elapsedTime;
    // map pointer to world space on the grid plane
    const px = pointer.current.x * (COLS * SPACING) * 0.5;
    const pz = -pointer.current.y * (ROWS * SPACING) * 0.5;

    for (let i = 0; i < count; i++) {
      const { x, z } = offsets[i];
      const dx = x - px;
      const dz = z - pz;
      const d = Math.sqrt(dx * dx + dz * dz);
      const wave = Math.sin(d * 4 - t * 3) * 0.45;
      const ripple = Math.max(0, 1 - d * 0.7) * 0.6;
      const y = wave * (0.4 + ripple);

      dummy.position.set(x, y, z);
      dummy.scale.set(0.075, 0.075 + Math.max(0, y) * 1.8, 0.075);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);

      const tcol = Math.min(1, Math.max(0, (y + 0.5) / 1.0));
      colorObj.copy(a).lerp(b, tcol);
      if (tcol > 0.6) colorObj.lerp(c, (tcol - 0.6) / 0.4);
      meshRef.current.setColorAt(i, colorObj);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial roughness={0.45} metalness={0.2} />
    </instancedMesh>
  );
}

export function GridDemo({ site }: DemoProps) {
  return (
    <Canvas
      camera={{ position: [0, 3.6, 4.5], fov: 45 }}
      dpr={[1, 2]}
      gl={{ antialias: true }}
    >
      <color attach="background" args={["#06060c"]} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[4, 6, 3]} intensity={1.6} color={site.palette[2]} />
      <directionalLight position={[-4, 2, -2]} intensity={0.8} color={site.palette[1]} />
      <GridField site={site} />
    </Canvas>
  );
}
