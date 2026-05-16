"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { type DemoProps, paletteColors } from "./shared";

function Orb({ site }: DemoProps) {
  const matRef = useRef<THREE.ShaderMaterial>(null!);
  const meshRef = useRef<THREE.Mesh>(null!);
  const mouse = useRef(new THREE.Vector2(0, 0));
  const { a, b, c } = paletteColors(site);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uA: { value: a },
      uB: { value: b },
      uC: { value: c },
      uDistort: { value: 0.32 },
    }),
    [a, b, c],
  );

  useFrame((state, delta) => {
    matRef.current.uniforms.uTime.value += delta;
    matRef.current.uniforms.uMouse.value.lerp(state.pointer, 0.08);
    meshRef.current.rotation.y += delta * 0.18;
    meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.4) * 0.2;
  });

  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[1.6, 96]} />
      <shaderMaterial ref={matRef} uniforms={uniforms} vertexShader={vert} fragmentShader={frag} />
    </mesh>
  );
}

export function OrbDemo({ site }: DemoProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 40 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: false }}
    >
      <color attach="background" args={["#06060c"]} />
      <ambientLight intensity={0.4} />
      <pointLight position={[4, 4, 4]} intensity={2.4} color={site.palette[1]} />
      <pointLight position={[-4, -2, -3]} intensity={1.6} color={site.palette[2]} />
      <Environment preset="city" />
      <Orb site={site} />
    </Canvas>
  );
}

const vert = /* glsl */ `
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uDistort;
  varying vec3 vPos;
  varying vec3 vNormal;
  varying float vNoise;

  vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
  vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
  vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
  vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
  float snoise(vec3 v){
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + 2.0 * C.xxx;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(
      i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  void main(){
    vec3 p = position;
    float mAmp = 0.5 + length(uMouse) * 1.8;
    float n  = snoise(p * 1.4 + vec3(uTime * 0.4));
    float n2 = snoise(p * 3.0 + vec3(uTime * 0.7, uMouse.x * 2.0, uMouse.y * 2.0));
    vNoise = n;
    p += normal * (n * uDistort * mAmp + n2 * 0.08);
    vPos = p;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const frag = /* glsl */ `
  uniform vec3 uA;
  uniform vec3 uB;
  uniform vec3 uC;
  uniform float uTime;
  varying vec3 vPos;
  varying vec3 vNormal;
  varying float vNoise;

  void main(){
    vec3 v = normalize(cameraPosition - vPos);
    float f = pow(1.0 - max(dot(vNormal, v), 0.0), 2.2);
    float band = sin(vPos.y * 3.0 + uTime * 0.5 + vNoise * 2.0) * 0.5 + 0.5;
    vec3 base = mix(uA, uB, band);
    vec3 col = mix(base, uC, f);
    col += f * 0.5;
    gl_FragColor = vec4(col, 1.0);
  }
`;
