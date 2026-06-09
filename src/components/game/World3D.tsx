import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Sky, Instance, Instances } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';
import { BUILDINGS } from '../../constants/gameData';

// Simple bean worker
const BeanWorker = ({ position, color = '#fbbf24', speed = 1 }: { position: [number, number, number], color?: string, speed?: number }) => {
  const ref = useRef<THREE.Group>(null);
  const offset = useMemo(() => Math.random() * Math.PI * 2, []);

  useFrame((state) => {
    if (!ref.current) return;
    const time = state.clock.elapsedTime * speed + offset;
    // Walk animation
    ref.current.position.x += Math.sin(time) * 0.05;
    ref.current.position.z += Math.cos(time) * 0.05;
    // Bobble
    ref.current.position.y = position[1] + Math.abs(Math.sin(time * 5)) * 0.2;
    ref.current.rotation.y = Math.atan2(Math.sin(time), Math.cos(time));
  });

  return (
    <group ref={ref} position={position}>
      {/* Body */}
      <mesh castShadow position={[0, 0.5, 0]}>
        <capsuleGeometry args={[0.3, 0.4, 4, 8]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {/* Eyes */}
      <mesh position={[0.1, 0.7, 0.25]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color="#000" />
      </mesh>
      <mesh position={[-0.1, 0.7, 0.25]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color="#000" />
      </mesh>
    </group>
  );
};

// Represents a building
const Building = ({ type, position }: { type: string, position: [number, number, number] }) => {
  const isFactory = type === 'b_factory';
  const color = isFactory ? '#f87171' : '#60a5fa';
  
  return (
    <group position={position}>
      <mesh castShadow receiveShadow position={[0, 1, 0]}>
        <boxGeometry args={isFactory ? [3, 2, 3] : [2, 2, 2]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Windows / Detail */}
      <mesh position={[0, 1.5, isFactory ? 1.51 : 1.01]}>
        <planeGeometry args={[1, 0.5]} />
        <meshStandardMaterial color="#e0f2fe" emissive="#0284c7" emissiveIntensity={0.5} />
      </mesh>
    </group>
  );
};

export default function World3D() {
  const { state } = useGameStore();
  const buildings = state.buildings || {};
  
  // Generate layout based on buildings
  const layout = useMemo(() => {
    const items: React.ReactNode[] = [];
    let bCount = 0;
    
    // Core structure
    items.push(
      <mesh key="core" position={[0, 2, 0]} castShadow>
        <octahedronGeometry args={[2, 0]} />
        <meshStandardMaterial color="#c084fc" emissive="#9333ea" emissiveIntensity={0.5} wireframe={true} />
      </mesh>
    );

    Object.entries(buildings).forEach(([bId, amount]) => {
      for (let i = 0; i < Math.min(amount, 20); i++) { // cap at 20 visually
        bCount++;
        const angle = bCount * 137.5; // Golden angle
        const radius = 5 + Math.sqrt(bCount) * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        
        items.push(<Building key={`${bId}-${i}`} type={bId} position={[x, 0, z]} />);
      }
    });

    // Spawn workers based on total buildings
    const totalWorkers = Math.min(bCount * 2 + 5, 50); // cap
    for (let i = 0; i < totalWorkers; i++) {
        const radius = Math.random() * (10 + Math.sqrt(bCount) * 2);
        const angle = Math.random() * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        items.push(<BeanWorker key={`worker-${i}`} position={[x, 0, z]} speed={0.5 + Math.random() * 0.5} />);
    }

    return items;
  }, [buildings]);

  const mapScale = useMemo(() => {
     let c = 0;
     Object.values(buildings).forEach(v => c+=v);
     return Math.max(30, 20 + Math.sqrt(c) * 5);
  }, [buildings]);

  return (
    <div className="absolute inset-0 z-0 pointer-events-auto">
      <Canvas shadows camera={{ position: [0, 15, 20], fov: 45 }}>
        <color attach="background" args={['#050208']} />
        <fog attach="fog" args={['#050208', 20, mapScale * 1.5]} />
        
        <ambientLight intensity={0.2} />
        <directionalLight 
           castShadow 
           position={[10, 20, 10]} 
           intensity={1.5} 
           shadow-mapSize={[1024, 1024]}
           shadow-camera-far={100}
           shadow-camera-left={-20}
           shadow-camera-right={20}
           shadow-camera-top={20}
           shadow-camera-bottom={-20}
        />
        
        {/* Environment / Sky */}
        <Environment preset="night" />
        
        {/* Ground */}
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
          <planeGeometry args={[mapScale * 2, mapScale * 2]} />
          <meshStandardMaterial color="#111827" roughness={0.8} metalness={0.2} />
        </mesh>
        
        {/* Grid helper for sci-fi look */}
        <gridHelper args={[mapScale * 2, Math.floor(mapScale), '#374151', '#1f2937']} position={[0, 0, 0]} />

        {/* Dynamic elements */}
        {layout}

        <OrbitControls 
          enablePan={true} 
          enableZoom={true} 
          maxDistance={mapScale * 1.5} 
          minDistance={5} 
          maxPolarAngle={Math.PI / 2 - 0.1} // don't go below ground
        />
      </Canvas>
    </div>
  );
}
