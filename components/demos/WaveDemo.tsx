"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { type DemoProps, paletteColors } from "./shared";

const MAX_RIPPLES = 6;

function WavePlane({ site }: DemoProps) {
  const matRef = useRef<THREE.ShaderMaterial>(null!);
  const { a, b, c } = paletteColors(site);
  const ripples = useRef<{ x: number; z: number; t: number }[]>([]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uA: { value: a },
      uB: { value: b },
      uC: { value: c },
      uRipplePos: { value: new Float32Array(MAX_RIPPLES * 2) },
      uRippleAge: { value: new Float32Array(MAX_RIPPLES) },
    }),
    [a, b, c],
  );

  useFrame((state, delta) => {
    matRef.current.uniforms.uTime.value += delta;
    // age existing ripples
    ripples.current = ripples.current
      .map((r) => ({ ...r, t: r.t + delta }))
      .filter((r) => r.t < 4);
    // write to uniforms
    const pos = matRef.current.uniforms.uRipplePos.value as Float32Array;
    const age = matRef.current.uniforms.uRippleAge.value as Float32Array;
    for (let i = 0; i < MAX_RIPPLES; i++) {
      const r = ripples.current[i];
      pos[i * 2] = r ? r.x : 9999;
      pos[i * 2 + 1] = r ? r.z : 9999;
      age[i] = r ? r.t : 999;
    }
  });

  const lastRipple = useRef<number>(0);
  const onPointerMove = (e: { point: THREE.Vector3 }) => {
    // throttle: drop a ripple at most every ~120ms
    const now = performance.now();
    if (lastRipple.current && now - lastRipple.current < 120) return;
    lastRipple.current = now;
    if (ripples.current.length >= MAX_RIPPLES) ripples.current.shift();
    // plane is rotated -PI/2 around X, so world Z maps to -localY
    ripples.current.push({ x: e.point.x, z: -e.point.z, t: 0 });
  };

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      onPointerMove={onPointerMove as never}
      onPointerDown={onPointerMove as never}
    >
      <planeGeometry args={[10, 10, 220, 220]} />
      <shaderMaterial ref={matRef} uniforms={uniforms} vertexShader={vert} fragmentShader={frag} />
    </mesh>
  );
}

export function WaveDemo({ site }: DemoProps) {
  return (
    <Canvas
      camera={{ position: [0, 2.4, 4.6], fov: 50 }}
      dpr={[1, 2]}
      gl={{ antialias: true }}
    >
      <color attach="background" args={[site.palette[0]]} />
      <ambientLight intensity={0.8} />
      <WavePlane site={site} />
    </Canvas>
  );
}

const vert = /* glsl */ `
  uniform float uTime;
  uniform vec2  uRipplePos[${MAX_RIPPLES}];
  uniform float uRippleAge[${MAX_RIPPLES}];
  varying float vH;
  varying vec2 vUv;

  void main(){
    vec3 p = position;
    // base Gerstner stack
    float h = 0.0;
    h += sin(p.x * 1.4 + uTime * 1.2) * 0.10;
    h += sin(p.y * 1.9 + uTime * 0.9) * 0.08;
    h += sin((p.x + p.y) * 2.2 - uTime * 0.6) * 0.06;
    // pointer ripples
    for (int i = 0; i < ${MAX_RIPPLES}; i++) {
      vec2 c = uRipplePos[i];
      float age = uRippleAge[i];
      if (age < 4.0) {
        float d = distance(vec2(p.x, p.y), c);
        float wave = sin(d * 8.0 - age * 9.0) * exp(-d * 1.4) * exp(-age * 1.2);
        h += wave * 0.35;
      }
    }
    p.z += h;
    vH = h;
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const frag = /* glsl */ `
  uniform vec3 uA;
  uniform vec3 uB;
  uniform vec3 uC;
  varying float vH;
  varying vec2 vUv;
  void main(){
    float k = clamp(vH * 2.5 + 0.5, 0.0, 1.0);
    vec3 col = mix(uA, uB, k);
    col = mix(col, uC, smoothstep(0.45, 1.0, k));
    // soft grid lines for scale reference
    vec2 g = abs(fract(vUv * 40.0) - 0.5);
    float line = smoothstep(0.48, 0.5, max(g.x, g.y));
    col = mix(col, col * 1.4, line * 0.08);
    gl_FragColor = vec4(col, 1.0);
  }
`;
