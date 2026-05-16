"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { type DemoProps, paletteColors, seedFromId } from "./shared";

function Ribbon({
  site,
  phase,
  thickness,
  colorA,
  colorB,
}: DemoProps & {
  phase: number;
  thickness: number;
  colorA: THREE.Color;
  colorB: THREE.Color;
}) {
  const mesh = useRef<THREE.Mesh>(null!);
  const seed = seedFromId(site.id);

  const { geometry, count } = useMemo(() => {
    const segments = 220;
    const tubeSegs = 12;
    // generate points along a noisy 3D path
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= segments; i++) {
      const t = (i / segments) * Math.PI * 2;
      const r = 1.4 + Math.sin(t * 3 + seed * 6) * 0.5;
      pts.push(
        new THREE.Vector3(
          Math.cos(t) * r,
          Math.sin(t * 2 + phase) * 0.8,
          Math.sin(t) * r,
        ),
      );
    }
    const curve = new THREE.CatmullRomCurve3(pts, true);
    const geom = new THREE.TubeGeometry(curve, segments, thickness, tubeSegs, true);
    return { geometry: geom, count: segments * tubeSegs };
  }, [phase, thickness, seed]);

  useFrame((state, delta) => {
    mesh.current.rotation.y += delta * 0.08;
    mesh.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2 + phase) * 0.15;
  });

  // gradient material that varies along the tube
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uA: { value: colorA },
        uB: { value: colorB },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPos;
        void main(){
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          vPos = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uA;
        uniform vec3 uB;
        uniform float uTime;
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPos;
        void main(){
          float band = sin(vUv.x * 60.0 + uTime * 2.0) * 0.5 + 0.5;
          vec3 base = mix(uA, uB, vUv.x);
          float rim = pow(1.0 - abs(vNormal.z), 1.8);
          base += rim * 0.4;
          base *= 0.85 + band * 0.25;
          gl_FragColor = vec4(base, 1.0);
        }
      `,
    });
  }, [colorA, colorB]);

  useFrame((_, delta) => {
    material.uniforms.uTime.value += delta;
  });

  return <mesh ref={mesh} geometry={geometry} material={material} />;
}

export function RibbonDemo({ site }: DemoProps) {
  const { a, b, c } = paletteColors(site);

  return (
    <Canvas
      camera={{ position: [0, 1.4, 4.6], fov: 45 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: false }}
    >
      <color attach="background" args={["#06060c"]} />
      <ambientLight intensity={0.5} />
      <Ribbon site={site} phase={0} thickness={0.09} colorA={a} colorB={b} />
      <Ribbon site={site} phase={Math.PI * 0.66} thickness={0.05} colorA={b} colorB={c} />
      <Ribbon site={site} phase={Math.PI * 1.33} thickness={0.03} colorA={c} colorB={a} />
    </Canvas>
  );
}
