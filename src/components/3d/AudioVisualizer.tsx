import { useRef, useState, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Line, Sphere, Box, Cylinder } from "@react-three/drei";
import * as THREE from "three";

interface AudioVisualizerProps {
  isActive: boolean;
  intensity: number;
  frequency?: number;
  color: string;
  type?: "waveform" | "particles" | "bars" | "ring" | "neural";
  size?: number;
  position?: [number, number, number];
}

// Waveform Visualizer
const WaveformVisualizer = ({ 
  isActive, 
  intensity, 
  frequency = 1, 
  color, 
  size = 1,
  position = [0, 0, 0] 
}: AudioVisualizerProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const [waveData, setWaveData] = useState<number[]>([]);

  useFrame((state) => {
    if (!isActive) return;
    
    const time = state.clock.elapsedTime;
    const samples = 64;
    const newWaveData = [];
    
    for (let i = 0; i < samples; i++) {
      const x = (i / samples) * Math.PI * 4;
      const wave1 = Math.sin(x + time * frequency * 2) * intensity;
      const wave2 = Math.sin(x * 2 + time * frequency * 3) * intensity * 0.5;
      const wave3 = Math.sin(x * 0.5 + time * frequency) * intensity * 0.3;
      newWaveData.push((wave1 + wave2 + wave3) * size);
    }
    
    setWaveData(newWaveData);
  });

  const wavePoints = useMemo(() => {
    if (waveData.length === 0) return [];
    return waveData.map((y, i) => 
      new THREE.Vector3((i - waveData.length / 2) * 0.1, y, 0)
    );
  }, [waveData]);

  return (
    <group ref={groupRef} position={position}>
      {wavePoints.length > 0 && (
        <Line
          points={wavePoints}
          color={color}
          lineWidth={3}
          transparent
          opacity={isActive ? 0.8 : 0.3}
        />
      )}
    </group>
  );
};

// Particle Audio Visualizer
const ParticleVisualizer = ({ 
  isActive, 
  intensity, 
  frequency = 1, 
  color, 
  size = 1,
  position = [0, 0, 0] 
}: AudioVisualizerProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const particleRefs = useRef<(THREE.Mesh | null)[]>([]);
  const particleCount = 32;

  useFrame((state) => {
    if (!groupRef.current) return;
    
    const time = state.clock.elapsedTime;
    
    particleRefs.current.forEach((particle, i) => {
      if (!particle) return;
      
      const angle = (i / particleCount) * Math.PI * 2;
      const radius = 2 + Math.sin(time * frequency + i * 0.5) * intensity * size;
      const height = Math.cos(time * frequency * 2 + i * 0.3) * intensity * size;
      
      particle.position.x = Math.cos(angle) * radius;
      particle.position.z = Math.sin(angle) * radius;
      particle.position.y = height;
      
      if (isActive) {
        particle.scale.setScalar(0.1 + intensity * 0.5);
        (particle.material as THREE.MeshStandardMaterial).emissiveIntensity = intensity;
      } else {
        particle.scale.setScalar(0.05);
        (particle.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.1;
      }
    });
  });

  return (
    <group ref={groupRef} position={position}>
      {Array.from({ length: particleCount }).map((_, i) => (
        <Sphere
          key={i}
          ref={(el) => (particleRefs.current[i] = el)}
          args={[0.05, 8, 8]}
        >
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.1}
            transparent
            opacity={0.8}
          />
        </Sphere>
      ))}
    </group>
  );
};

// Audio Bars Visualizer
const BarsVisualizer = ({ 
  isActive, 
  intensity, 
  frequency = 1, 
  color, 
  size = 1,
  position = [0, 0, 0] 
}: AudioVisualizerProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const barRefs = useRef<(THREE.Mesh | null)[]>([]);
  const barCount = 16;

  useFrame((state) => {
    if (!groupRef.current) return;
    
    const time = state.clock.elapsedTime;
    
    barRefs.current.forEach((bar, i) => {
      if (!bar) return;
      
      const barIntensity = Math.abs(
        Math.sin(time * frequency * (i + 1) * 0.5) * 
        Math.cos(time * frequency * 2) * 
        intensity
      );
      
      const height = Math.max(0.1, barIntensity * size * 2);
      bar.scale.y = height;
      bar.position.y = height * 0.5;
      
      if (isActive) {
        (bar.material as THREE.MeshStandardMaterial).emissiveIntensity = barIntensity;
      } else {
        (bar.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.1;
      }
    });
  });

  return (
    <group ref={groupRef} position={position}>
      {Array.from({ length: barCount }).map((_, i) => (
        <Box
          key={i}
          ref={(el) => (barRefs.current[i] = el)}
          args={[0.2, 1, 0.2]}
          position={[(i - barCount / 2) * 0.3, 0, 0]}
        >
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.1}
            transparent
            opacity={0.7}
          />
        </Box>
      ))}
    </group>
  );
};

// Ring Audio Visualizer
const RingVisualizer = ({ 
  isActive, 
  intensity, 
  frequency = 1, 
  color, 
  size = 1,
  position = [0, 0, 0] 
}: AudioVisualizerProps) => {
  const ringRefs = useRef<THREE.Mesh[]>([]);
  const ringCount = 8;

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    ringRefs.current.forEach((ring, i) => {
      if (!ring) return;
      
      const ringPhase = time * frequency + i * 0.8;
      const ringScale = 1 + Math.sin(ringPhase) * intensity * size * 0.5;
      const ringOpacity = isActive ? 0.3 + Math.abs(Math.cos(ringPhase)) * 0.4 : 0.1;
      
      ring.scale.setScalar(ringScale);
      (ring.material as THREE.MeshStandardMaterial).opacity = ringOpacity;
      ring.rotation.z = time * 0.5 + i * 0.3;
    });
  });

  return (
    <group position={position}>
      {Array.from({ length: ringCount }).map((_, i) => (
        <mesh
          key={i}
          ref={(el) => el && (ringRefs.current[i] = el)}
        >
          <torusGeometry args={[1.5 + i * 0.3, 0.05, 8, 32]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.2}
            transparent
            opacity={0.1}
          />
        </mesh>
      ))}
    </group>
  );
};

// Neural Network Audio Visualizer
const NeuralVisualizer = ({ 
  isActive, 
  intensity, 
  frequency = 1, 
  color, 
  size = 1,
  position = [0, 0, 0] 
}: AudioVisualizerProps) => {
  const nodeRefs = useRef<THREE.Mesh[]>([]);
  const connectionRefs = useRef<THREE.Line[]>([]);
  const nodeCount = 12;

  const nodePositions = useMemo(() => {
    const positions = [];
    for (let i = 0; i < nodeCount; i++) {
      const angle = (i / nodeCount) * Math.PI * 2;
      const radius = 2;
      positions.push([
        Math.cos(angle) * radius,
        Math.sin(i * 0.7) * 0.5,
        Math.sin(angle) * radius
      ]);
    }
    return positions;
  }, []);

  const connections = useMemo(() => {
    const conns = [];
    for (let i = 0; i < nodeCount; i++) {
      const next = (i + 1) % nodeCount;
      const opposite = (i + Math.floor(nodeCount / 2)) % nodeCount;
      conns.push([i, next]);
      conns.push([i, opposite]);
    }
    return conns;
  }, []);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    nodeRefs.current.forEach((node, i) => {
      if (!node) return;
      
      const nodePhase = time * frequency + i * 0.5;
      const nodeIntensity = Math.abs(Math.sin(nodePhase)) * intensity;
      const scale = 0.1 + nodeIntensity * size * 0.3;
      
      node.scale.setScalar(scale);
      (node.material as THREE.MeshStandardMaterial).emissiveIntensity = 
        isActive ? nodeIntensity * 0.8 : 0.1;
    });
  });

  return (
    <group position={position}>
      {/* Neural Nodes */}
      {nodePositions.map((pos, i) => (
        <Sphere
          key={i}
          ref={(el) => el && (nodeRefs.current[i] = el)}
          args={[0.1, 16, 16]}
          position={pos as [number, number, number]}
        >
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.1}
            transparent
            opacity={0.8}
          />
        </Sphere>
      ))}
      
      {/* Neural Connections */}
      {connections.map(([start, end], i) => {
        const startPos = nodePositions[start];
        const endPos = nodePositions[end];
        const points = [
          new THREE.Vector3(...startPos),
          new THREE.Vector3(...endPos)
        ];
        
        return (
          <Line
            key={i}
            points={points}
            color={color}
            lineWidth={1}
            transparent
            opacity={isActive ? 0.4 : 0.1}
          />
        );
      })}
    </group>
  );
};

// Main Audio Visualizer Component
const AudioVisualizer = (props: AudioVisualizerProps) => {
  const { type = "waveform" } = props;

  switch (type) {
    case "particles":
      return <ParticleVisualizer {...props} />;
    case "bars":
      return <BarsVisualizer {...props} />;
    case "ring":
      return <RingVisualizer {...props} />;
    case "neural":
      return <NeuralVisualizer {...props} />;
    case "waveform":
    default:
      return <WaveformVisualizer {...props} />;
  }
};

// Multi-Layer Audio Visualizer combining multiple types
interface MultiLayerAudioVisualizerProps {
  isActive: boolean;
  intensity: number;
  primaryColor: string;
  secondaryColor: string;
  position?: [number, number, number];
}

export const MultiLayerAudioVisualizer = ({ 
  isActive, 
  intensity, 
  primaryColor, 
  secondaryColor,
  position = [0, 0, 0] 
}: MultiLayerAudioVisualizerProps) => {
  return (
    <group position={position}>
      {/* Background ring effect */}
      <AudioVisualizer
        isActive={isActive}
        intensity={intensity * 0.6}
        frequency={0.5}
        color={secondaryColor}
        type="ring"
        size={1.2}
        position={[0, 0, -1]}
      />
      
      {/* Main waveform */}
      <AudioVisualizer
        isActive={isActive}
        intensity={intensity}
        frequency={2}
        color={primaryColor}
        type="waveform"
        size={1}
        position={[0, -1, 0]}
      />
      
      {/* Particle effects */}
      <AudioVisualizer
        isActive={isActive}
        intensity={intensity * 0.8}
        frequency={1.5}
        color={primaryColor}
        type="particles"
        size={0.8}
        position={[0, 0, 0]}
      />
      
      {/* Neural network overlay */}
      <AudioVisualizer
        isActive={isActive}
        intensity={intensity * 0.4}
        frequency={0.8}
        color={secondaryColor}
        type="neural"
        size={0.6}
        position={[0, 0, 2]}
      />
    </group>
  );
};

export default AudioVisualizer;