"use client";

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { useRef, Suspense } from 'react';
import { Mesh } from 'three';

interface GlobeProps {
  className?: string;
}

export function Globe({ className }: GlobeProps) {
  const meshRef = useRef<Mesh>(null);
  
  return (
    <div className={className}>
      <Canvas>
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <mesh ref={meshRef}>
            <sphereGeometry args={[1.5, 32, 32]} />
            <meshStandardMaterial color="#3b82f6" />
          </mesh>
          <OrbitControls 
            enableZoom={false}
            autoRotate
            autoRotateSpeed={2}
          />
          <Stars
            radius={100}
            depth={50}
            count={5000}
            factor={4}
            saturation={0}
            fade
            speed={1}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}