import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

function Liquid({ fill, motion, water, highlight }: { fill: number; motion: boolean; water: string; highlight: string }) {
  const time = useRef(0);
  const current = useRef(fill);
  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const vertices = new Float32Array(17 * 49 * 3);
    const indices: number[] = [];
    for (let row = 0; row < 16; row++) for (let col = 0; col < 48; col++) {
      const a = row * 49 + col, b = a + 49;
      indices.push(a, b, a + 1, b, b + 1, a + 1);
    }
    geo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geo.setIndex(indices);
    return geo;
  }, []);
  useFrame((_, rawDelta) => {
    const dt = Math.min(rawDelta, .05);
    if (motion) time.current += dt;
    if (motion) current.current += (fill - current.current) * (1 - Math.exp(-3 * dt));
    else current.current = fill;
    const level = -1 + 2 * Math.max(.001, Math.min(.999, current.current));
    const pos = geometry.getAttribute('position');
    const topRadius = Math.sqrt(Math.max(0, 1 - level * level));
    for (let row = 0; row <= 16; row++) for (let col = 0; col <= 48; col++) {
      const angle = col / 48 * Math.PI * 2;
      // Last rings close the upper surface, rather than leaving an open cup.
      const surface = row >= 12;
      const y = surface ? level : -1 + (level + 1) * row / 12;
      const radius = surface ? topRadius * (16 - row) / 4 : Math.sqrt(Math.max(0, 1 - y * y));
      const wave = motion ? (Math.sin(angle * 2 + time.current * 1.9) + Math.cos(angle * 3 - time.current * 1.3)) * .022 * topRadius : 0;
      pos.setXYZ(row * 49 + col, radius * Math.cos(angle), y + wave * Math.pow((y + 1) / (level + 1), 4), radius * Math.sin(angle));
    }
    pos.needsUpdate = true;
    geometry.computeVertexNormals();
  });
  return <>
    <mesh geometry={geometry} visible={fill > 0}>
      <meshPhysicalMaterial color={water} emissive={water} emissiveIntensity={.12} metalness={.15} roughness={.16} clearcoat={1} clearcoatRoughness={.08} side={THREE.DoubleSide} />
    </mesh>
    <mesh>
      <sphereGeometry args={[1.02, 32, 24]} />
      <meshPhysicalMaterial color={highlight} transparent opacity={.12} roughness={.12} metalness={.25} depthWrite={false} side={THREE.FrontSide} />
    </mesh>
  </>;
}

export function QuotaWater({ fill, motion, water, highlight }: { fill: number; motion: boolean; water: string; highlight: string }) {
  return <Canvas dpr={[1, 1.5]} camera={{ position: [0, .5, 3.5], fov: 38 }} gl={{ alpha: true, antialias: true }} frameloop={motion ? 'always' : 'demand'}>
    <ambientLight intensity={.7} />
    <directionalLight position={[2, 3, 4]} intensity={2} />
    <Environment resolution={32}>
      <Lightformer intensity={3} position={[-2, 3, 3]} scale={[2, 4, 1]} />
      <Lightformer intensity={2} color={highlight} position={[3, 0, 1]} scale={[1, 3, 1]} />
    </Environment>
    <Liquid fill={fill} motion={motion} water={water} highlight={highlight} />
  </Canvas>;
}