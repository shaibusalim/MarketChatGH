"use client";

import { Canvas, useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

function GlobeMesh() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1.5, 32, 32]} />
      <meshStandardMaterial color="#3b82f6" />
    </mesh>
  );
}

export function SimpleGlobe() {
  return (
    <Canvas>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <GlobeMesh />
    </Canvas>
  );
}