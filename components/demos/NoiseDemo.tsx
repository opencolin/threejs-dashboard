"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { type DemoProps, paletteColors } from "./shared";

function CameraOnSpline() {
  const { camera } = useThree();
  const curve = useMemo(() => {
    return new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(0, 0, 4.5),
        new THREE.Vector3(2.4, 0.8, 3.4),
        new THREE.Vector3(2.6, -0.5, -2),
        new THREE.Vector3(0, 1.2, -4.4),
        new THREE.Vector3(-2.6, -0.4, -2.1),
        new THREE.Vector3(-2.2, 0.6, 3.6),
      ],
      true,
    );
  }, []);

  useFrame((state) => {
    const t = (state.clock.elapsedTime * 0.04) % 1;
    const p = curve.getPointAt(t);
    camera.position.lerp(p, 0.1);
    camera.lookAt(0, 0, 0);
  });

  return null;
}

function Centerpiece({ site }: DemoProps) {
  const ref = useRef<THREE.Mesh>(null!);
  const { a, b, c } = paletteColors(site);

  useFrame((_, delta) => {
    ref.current.rotation.x += delta * 0.12;
    ref.current.rotation.y += delta * 0.18;
  });

  // matcap-style two-tone shader
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: { uA: { value: a }, uB: { value: b }, uC: { value: c } },
      vertexShader: `
        varying vec3 vNormal;
        void main(){
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uA;
        uniform vec3 uB;
        uniform vec3 uC;
        varying vec3 vNormal;
        void main(){
          float l = dot(vNormal, normalize(vec3(0.3, 0.8, 0.6)));
          float k = smoothstep(-0.2, 0.9, l);
          vec3 col = mix(uA, uB, k);
          float rim = pow(1.0 - max(0.0, vNormal.z), 2.4);
          col = mix(col, uC, rim * 0.7);
          gl_FragColor = vec4(col, 1.0);
        }
      `,
    });
  }, [a, b, c]);

  return (
    <mesh ref={ref}>
      <torusKnotGeometry args={[1.05, 0.32, 200, 32]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

export function NoiseDemo({ site }: DemoProps) {
  return (
    <Canvas dpr={[1, 2]} gl={{ antialias: true }}>
      <color attach="background" args={[site.palette[0]]} />
      <CameraOnSpline />
      <Centerpiece site={site} />
    </Canvas>
  );
}
