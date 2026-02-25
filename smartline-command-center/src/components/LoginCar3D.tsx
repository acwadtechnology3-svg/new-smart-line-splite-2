import { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

function Wheel({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Group>(null!);

  useFrame((_state, delta) => {
    ref.current.rotation.x += delta * 3;
  });

  return (
    <group ref={ref} position={position} rotation={[0, 0, Math.PI / 2]}>
      {/* Tire */}
      <mesh>
        <cylinderGeometry args={[0.28, 0.28, 0.18, 24]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
      </mesh>
      {/* Rim */}
      <mesh>
        <cylinderGeometry args={[0.16, 0.16, 0.2, 16]} />
        <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  );
}

function CarBody() {
  return (
    <group>
      {/* Main body - lower */}
      <mesh position={[0, 0.35, 0]}>
        <boxGeometry args={[2.4, 0.45, 1.1]} />
        <meshStandardMaterial color="#1e3a5f" metalness={0.7} roughness={0.2} />
      </mesh>

      {/* Hood slope */}
      <mesh position={[0.7, 0.5, 0]} rotation={[0, 0, -0.15]}>
        <boxGeometry args={[0.8, 0.15, 1.05]} />
        <meshStandardMaterial color="#1e3a5f" metalness={0.7} roughness={0.2} />
      </mesh>

      {/* Trunk slope */}
      <mesh position={[-0.65, 0.5, 0]} rotation={[0, 0, 0.12]}>
        <boxGeometry args={[0.7, 0.15, 1.05]} />
        <meshStandardMaterial color="#1e3a5f" metalness={0.7} roughness={0.2} />
      </mesh>

      {/* Cabin / Top */}
      <mesh position={[-0.05, 0.75, 0]}>
        <boxGeometry args={[1.2, 0.45, 0.95]} />
        <meshStandardMaterial color="#1e3a5f" metalness={0.6} roughness={0.25} />
      </mesh>

      {/* Windshield front */}
      <mesh position={[0.5, 0.75, 0]} rotation={[0, 0, -0.35]}>
        <boxGeometry args={[0.45, 0.42, 0.88]} />
        <meshPhysicalMaterial
          color="#88bbee"
          transparent
          opacity={0.35}
          metalness={0.1}
          roughness={0}
          transmission={0.6}
        />
      </mesh>

      {/* Windshield rear */}
      <mesh position={[-0.55, 0.75, 0]} rotation={[0, 0, 0.3]}>
        <boxGeometry args={[0.35, 0.4, 0.88]} />
        <meshPhysicalMaterial
          color="#88bbee"
          transparent
          opacity={0.35}
          metalness={0.1}
          roughness={0}
          transmission={0.6}
        />
      </mesh>

      {/* Side windows left */}
      <mesh position={[-0.05, 0.75, 0.49]}>
        <boxGeometry args={[1.0, 0.35, 0.02]} />
        <meshPhysicalMaterial
          color="#88bbee"
          transparent
          opacity={0.3}
          metalness={0.1}
          roughness={0}
          transmission={0.6}
        />
      </mesh>

      {/* Side windows right */}
      <mesh position={[-0.05, 0.75, -0.49]}>
        <boxGeometry args={[1.0, 0.35, 0.02]} />
        <meshPhysicalMaterial
          color="#88bbee"
          transparent
          opacity={0.3}
          metalness={0.1}
          roughness={0}
          transmission={0.6}
        />
      </mesh>

      {/* Headlights */}
      <mesh position={[1.21, 0.38, 0.35]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#ffffcc" emissive="#ffdd44" emissiveIntensity={2} />
      </mesh>
      <mesh position={[1.21, 0.38, -0.35]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#ffffcc" emissive="#ffdd44" emissiveIntensity={2} />
      </mesh>

      {/* Tail lights */}
      <mesh position={[-1.21, 0.38, 0.35]}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshStandardMaterial color="#ff3333" emissive="#ff0000" emissiveIntensity={1.5} />
      </mesh>
      <mesh position={[-1.21, 0.38, -0.35]}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshStandardMaterial color="#ff3333" emissive="#ff0000" emissiveIntensity={1.5} />
      </mesh>

      {/* Bumper front */}
      <mesh position={[1.15, 0.2, 0]}>
        <boxGeometry args={[0.12, 0.18, 1.0]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.5} roughness={0.4} />
      </mesh>

      {/* Bumper rear */}
      <mesh position={[-1.15, 0.2, 0]}>
        <boxGeometry args={[0.12, 0.18, 1.0]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.5} roughness={0.4} />
      </mesh>

      {/* Wheels */}
      <Wheel position={[0.7, 0.1, 0.6]} />
      <Wheel position={[0.7, 0.1, -0.6]} />
      <Wheel position={[-0.7, 0.1, 0.6]} />
      <Wheel position={[-0.7, 0.1, -0.6]} />
    </group>
  );
}

function RotatingCar() {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    groupRef.current.rotation.y = state.clock.elapsedTime * 0.3;
  });

  return (
    <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.4}>
      <group ref={groupRef} position={[0, -0.2, 0]}>
        <CarBody />
      </group>
    </Float>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 8, 5]} intensity={1.2} castShadow />
      <directionalLight position={[-3, 4, -5]} intensity={0.4} color="#4488ff" />
      <pointLight position={[0, 5, 0]} intensity={0.3} color="#ffffff" />

      <RotatingCar />

      <ContactShadows
        position={[0, -0.55, 0]}
        opacity={0.4}
        scale={8}
        blur={2.5}
        far={4}
      />

      <Environment preset="city" />
    </>
  );
}

export default function LoginCar3D() {
  return (
    <div className="login-3d-container">
      <Canvas
        camera={{ position: [3.5, 2, 3.5], fov: 35 }}
        style={{ background: 'transparent' }}
        dpr={[1, 2]}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
}
