import { useEffect, useRef, Suspense, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

// 3D Music Note Component
const MusicNote = ({ position, size = 1 }) => {
  const ref = useRef();
  const direction = useRef([
    Math.random() * 0.02 - 0.01,
    Math.random() * 0.02 - 0.01,
    Math.random() * 0.02 - 0.01,
  ]);
  const speed = Math.random() * 0.02 + 0.01;
  const color = Math.random() > 0.5 ? "#00ff9d" : "#FFFFFF";
  const boundary = useRef(window.innerWidth > 768 ? 8 : 5);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      boundary.current = window.innerWidth > 768 ? 8 : 5;
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useFrame(() => {
    if (ref.current) {
      ref.current.rotation.x += speed;
      ref.current.rotation.y += speed;
      ref.current.position.x += direction.current[0];
      ref.current.position.y += direction.current[1];
      ref.current.position.z += direction.current[2];

      ["x", "y", "z"].forEach((axis, i) => {
        if (Math.abs(ref.current.position[axis]) > boundary.current) {
          direction.current[i] *= -1;
        }
      });
    }
  });

  return (
    <group ref={ref} position={position}>
      <mesh position={[0, 0.3 * size, 0]}>
        <sphereGeometry args={[0.2 * size, 16, 16]} />
        <meshPhongMaterial color={color} emissive={color} emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0, -0.2 * size, 0]}>
        <cylinderGeometry args={[0.05 * size, 0.05 * size, 0.5 * size, 8]} />
        <meshPhongMaterial color={color} emissive={color} emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
};

// Audio Waveform Component
const AudioWave = () => {
  const ref = useRef();
  const count = 50;
  const positions = useRef(new Float32Array(count * 3)).current;
  const { size } = useThree();
  const widthRatio = useRef(size.width / 1000);

  // Update width ratio when size changes
  useEffect(() => {
    widthRatio.current = size.width / 1000;
  }, [size.width]);

  useFrame(({ clock }) => {
    if (ref.current) {
      const time = clock.getElapsedTime();
      
      for (let i = 0; i < count; i++) {
        const x = (i / count) * 10 * widthRatio.current - 5 * widthRatio.current;
        const waveHeight = Math.sin(time * 2 + i * 0.2) * 1.5;
        positions[i * 3] = x;
        positions[i * 3 + 1] = Math.sin((i / count) * Math.PI * 4) * 0.5 + waveHeight;
      }

      ref.current.geometry.setAttribute(
        'position',
        new THREE.BufferAttribute(positions, 3)
      );
    }
  });

  return (
    <line ref={ref}>
      <bufferGeometry attach="geometry">
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          itemSize={3}
          count={count}
        />
      </bufferGeometry>
      <lineBasicMaterial attach="material" color="#00ff9d" linewidth={2} />
    </line>
  );
};

// Main 3D Scene
const Scene = () => {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#00ff9d" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#FFFFFF" />
      <AudioWave />
      {Array.from({ length: 12 }).map((_, i) => (
        <MusicNote
          key={i}
          position={[
            Math.random() * 16 - 8,
            Math.random() * 16 - 8,
            Math.random() * 16 - 8,
          ]}
          size={Math.random() * 0.5 + 0.5}
        />
      ))}
      <OrbitControls 
        enableZoom={false} 
        enablePan={false} 
        autoRotate 
        autoRotateSpeed={0.5} 
      />
    </>
  );
};

const MusicScene = () => {
  const [isError, setIsError] = useState(false);

  // Error boundary for the Canvas
  const handleError = (error) => {
    console.error("Canvas error:", error);
    setIsError(true);
  };

  if (isError) {
    return (
      <div className="canvas-container">
        <div className="canvas-loading">
          Unable to load 3D scene. Please refresh the page.
        </div>
      </div>
    );
  }

  return (
    <div className="canvas-container">
      <Suspense fallback={<div className="canvas-loading">Loading...</div>}>
        <Canvas 
          camera={{ position: [0, 0, 10], fov: 45 }}
          onCreated={({ gl }) => {
            gl.localClippingEnabled = true;
          }}
          onError={handleError}
        >
          <Scene />
        </Canvas>
      </Suspense>
    </div>
  );
};

export default MusicScene; 