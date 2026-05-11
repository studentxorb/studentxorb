import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { MeshDistortMaterial, Sphere, Float } from "@react-three/drei";
import * as THREE from "three";

type OrbProps = {
  intensity?: number; // 0..1, controls distortion + speed based on step
  hue?: number; // 0..1
};

function OrbMesh({ intensity = 0.4, hue = 0.55 }: OrbProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const innerRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(t * 0.2) * 0.3;
      meshRef.current.rotation.y = t * 0.15;
    }
    if (innerRef.current) {
      innerRef.current.rotation.y = -t * 0.25;
      innerRef.current.rotation.z = Math.sin(t * 0.3) * 0.2;
    }
  });

  const colorA = useMemo(() => new THREE.Color().setHSL(hue, 0.7, 0.6), [hue]);
  const colorB = useMemo(() => new THREE.Color().setHSL((hue + 0.15) % 1, 0.8, 0.55), [hue]);

  return (
    <Float speed={1.4} rotationIntensity={0.4} floatIntensity={0.6}>
      <group>
        {/* Outer translucent orb */}
        <Sphere ref={meshRef} args={[1.6, 128, 128]}>
          <MeshDistortMaterial
            color={colorA}
            distort={0.35 + intensity * 0.25}
            speed={1.2 + intensity * 1.5}
            roughness={0.05}
            metalness={0.2}
            transparent
            opacity={0.55}
            transmission={0.9}
            thickness={1.2}
          />
        </Sphere>
        {/* Inner glowing core */}
        <Sphere ref={innerRef} args={[0.95, 96, 96]}>
          <MeshDistortMaterial
            color={colorB}
            distort={0.6}
            speed={2.2}
            roughness={0.1}
            emissive={colorB}
            emissiveIntensity={0.6}
          />
        </Sphere>
        {/* Halo ring */}
        <mesh rotation={[Math.PI / 2.4, 0, 0]}>
          <torusGeometry args={[2.1, 0.012, 16, 200]} />
          <meshBasicMaterial color={colorA} transparent opacity={0.35} />
        </mesh>
      </group>
    </Float>
  );
}

export function Orb({ intensity = 0.4, hue = 0.55, className = "" }: OrbProps & { className?: string }) {
  return (
    <div className={className}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[5, 5, 5]} intensity={2} color="#a78bfa" />
        <pointLight position={[-5, -3, 2]} intensity={1.5} color="#22d3ee" />
        <pointLight position={[0, -5, 3]} intensity={1} color="#f472b6" />
        <OrbMesh intensity={intensity} hue={hue} />
      </Canvas>
    </div>
  );
}