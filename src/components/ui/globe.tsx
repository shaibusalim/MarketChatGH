"use client";

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { useRef, Suspense } from 'react';
import { Mesh } from 'three';
import { TextureLoader } from 'three';

interface GlobeProps {
  className?: string;
}

export function Globe({ className }: GlobeProps) {
  const meshRef = useRef<Mesh>(null);
  const texture = new TextureLoader().load('/earth-texture.jpg', undefined, undefined, (error) => {
    console.error('Globe texture load error:', error);
  });

  return (
    <div className={className}>
      <Canvas>
        <Suspense fallback={null}>
          <ambientLight intensity={0.6} />
          <pointLight position={[10, 10, 10]} intensity={1.2} />
          <mesh ref={meshRef}>
            <sphereGeometry args={[1.5, 24, 24]} /> {/* Lower resolution for mobile */}
            <meshStandardMaterial
              map={texture}
              roughness={0.7}
              metalness={0.1}
              fallback={null}
            />
          </mesh>
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate
            autoRotateSpeed={4}
            minDistance={3}
            maxDistance={3}
          />
          <Stars
            radius={60}
            depth={30}
            count={500} // Reduced for mobile
            factor={3}
            saturation={0}
            fade
            speed={0.3}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}