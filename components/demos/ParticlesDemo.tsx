"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { type DemoProps, paletteColors } from "./shared";

const COUNT = 4000;

function ParticleField({
  site,
  burstRef,
}: DemoProps & { burstRef: React.MutableRefObject<number> }) {
  const pointsRef = useRef<THREE.Points>(null!);
  const burstFade = useRef(0);
  const { a, b, c } = paletteColors(site);

  const { positions, velocities, lifetimes, baseColors } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    const velocities = new Float32Array(COUNT * 3);
    const lifetimes = new Float32Array(COUNT);
    const baseColors = new Float32Array(COUNT * 3);

    for (let i = 0; i < COUNT; i++) {
      const r = 1.6 + Math.random() * 1.4;
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = Math.random() * Math.PI * 2;
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
      velocities[i * 3] = 0;
      velocities[i * 3 + 1] = 0;
      velocities[i * 3 + 2] = 0;
      lifetimes[i] = Math.random() * 4;

      const t = Math.random();
      const col = a.clone().lerp(b, t);
      if (t > 0.7) col.lerp(c, (t - 0.7) / 0.3);
      baseColors[i * 3] = col.r;
      baseColors[i * 3 + 1] = col.g;
      baseColors[i * 3 + 2] = col.b;
    }
    return { positions, velocities, lifetimes, baseColors };
  }, [a, b, c]);

  // curl-noise via gradient of value noise — approximate
  const curl = (x: number, y: number, z: number, t: number): [number, number, number] => {
    const eps = 0.1;
    const f = (x: number, y: number, z: number) =>
      Math.sin(x * 1.3 + t) * Math.cos(y * 1.7 - t * 0.5) + Math.sin(z * 1.1 + t * 0.7);
    const n1 = (f(x, y + eps, z) - f(x, y - eps, z)) / (2 * eps);
    const n2 = (f(x, y, z + eps) - f(x, y, z - eps)) / (2 * eps);
    const n3 = (f(x + eps, y, z) - f(x - eps, y, z)) / (2 * eps);
    return [n2 - n1, n3 - n2, n1 - n3];
  };

  const attractor = useRef(new THREE.Vector3());

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const dt = Math.min(delta, 1 / 30); // clamp

    // unproject pointer onto z=0 plane
    const px = state.pointer.x * 3.2;
    const py = state.pointer.y * 2.1;
    attractor.current.set(px, py, 0);

    const posAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const pos = posAttr.array as Float32Array;

    // Click impulse: explode every particle radially outward. The post-burst
    // fade below relaxes damping and suppresses the attractor for a moment so
    // the explosion is fully visible before particles drift back.
    if (burstRef.current > 0) {
      const s = burstRef.current;
      burstRef.current = 0;
      burstFade.current = 1;
      for (let i = 0; i < COUNT; i++) {
        const x = pos[i * 3];
        const y = pos[i * 3 + 1];
        const z = pos[i * 3 + 2];
        const r = Math.sqrt(x * x + y * y + z * z) || 1;
        // Slight extra shove for inner particles so the field expands evenly.
        const radialBoost = 1.0 + (1 - Math.min(r / 3, 1)) * 0.5;
        const jitter = 0.7 + Math.random() * 0.6;
        const impulse = s * jitter * radialBoost;
        velocities[i * 3] += (x / r) * impulse;
        velocities[i * 3 + 1] += (y / r) * impulse;
        velocities[i * 3 + 2] += (z / r) * impulse;
      }
    }
    // Fade burst energy: 1 → 0 over ~2s.
    const fade = burstFade.current;
    burstFade.current = Math.max(0, fade - dt * 0.5);
    // While the field is energized: less drag, weakened attractor, larger boundary.
    const damp = 0.96 + fade * 0.034;
    const attractorWeight = 1 - fade * 0.9;
    const softLimit = 4.5 + fade * 9;
    const hardLimit = 14;

    for (let i = 0; i < COUNT; i++) {
      let x = pos[i * 3];
      let y = pos[i * 3 + 1];
      let z = pos[i * 3 + 2];

      // curl-noise flow
      const [cx, cy, cz] = curl(x * 0.6, y * 0.6, z * 0.6, t * 0.5);
      velocities[i * 3] += cx * 0.04 * dt;
      velocities[i * 3 + 1] += cy * 0.04 * dt;
      velocities[i * 3 + 2] += cz * 0.04 * dt;

      // pointer attraction (suppressed while burst is active)
      const dx = attractor.current.x - x;
      const dy = attractor.current.y - y;
      const dz = -0.4 - z;
      const d2 = dx * dx + dy * dy + dz * dz + 0.5;
      const k = (0.6 / d2) * dt * attractorWeight;
      velocities[i * 3] += dx * k;
      velocities[i * 3 + 1] += dy * k;
      velocities[i * 3 + 2] += dz * k * 0.5;

      // damping (relaxed during burst — particles carry farther)
      velocities[i * 3] *= damp;
      velocities[i * 3 + 1] *= damp;
      velocities[i * 3 + 2] *= damp;

      x += velocities[i * 3];
      y += velocities[i * 3 + 1];
      z += velocities[i * 3 + 2];

      // Soft elastic boundary above softLimit, hard clamp at hardLimit.
      // Lets the field overshoot dramatically on burst, then drift back.
      const r = Math.sqrt(x * x + y * y + z * z);
      if (r > softLimit) {
        const excess = r - softLimit;
        const pull = -excess * 0.015 * dt * 60;
        velocities[i * 3] += (x / r) * pull;
        velocities[i * 3 + 1] += (y / r) * pull;
        velocities[i * 3 + 2] += (z / r) * pull;
      }
      if (r > hardLimit) {
        const f = hardLimit / r;
        x *= f;
        y *= f;
        z *= f;
      }

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;
    }
    posAttr.needsUpdate = true;
    pointsRef.current.rotation.y += dt * 0.03;
  });

  return (
    <points ref={pointsRef} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={COUNT}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[baseColors, 3]}
          count={COUNT}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        sizeAttenuation
        vertexColors
        transparent
        opacity={0.9}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export function ParticlesDemo({ site }: DemoProps) {
  const burstRef = useRef(0);
  return (
    <Canvas
      camera={{ position: [0, 0, 5.6], fov: 45 }}
      dpr={[1, 2]}
      gl={{ antialias: true }}
      onPointerDown={() => {
        burstRef.current = 0.22;
      }}
    >
      <color attach="background" args={["#06060c"]} />
      <ambientLight intensity={0.5} />
      <ParticleField site={site} burstRef={burstRef} />
    </Canvas>
  );
}
