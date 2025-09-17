import { useRef, useState, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { 
  Sphere, 
  Box, 
  Cylinder, 
  Plane, 
  Text, 
  Float, 
  Stars,
  Cloud,
  Line,
  Sparkles
} from "@react-three/drei";
import * as THREE from "three";

interface DynamicEnvironmentProps {
  scene?: "classroom" | "laboratory" | "library" | "futuristic" | "nature" | "space";
  intensity?: number;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  isActive?: boolean;
  currentTopic?: string;
}

// Classroom Environment
const ClassroomScene = ({ colors, intensity = 0.5, isActive }: Omit<DynamicEnvironmentProps, 'scene'>) => {
  const boardRef = useRef<THREE.Mesh>(null);
  const deskRefs = useRef<THREE.Mesh[]>([]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    // Animate whiteboard
    if (boardRef.current) {
      boardRef.current.position.y = Math.sin(time * 0.5) * 0.1;
    }
    
    // Animate desks
    deskRefs.current.forEach((desk, i) => {
      if (desk) {
        desk.rotation.y = Math.sin(time * 0.3 + i) * 0.05;
      }
    });
  });

  return (
    <group>
      {/* Whiteboard */}
      <Box ref={boardRef} args={[6, 3, 0.1]} position={[0, 2, -8]}>
        <meshStandardMaterial color="#f0f0f0" />
      </Box>
      
      {/* Desks */}
      {Array.from({ length: 6 }).map((_, i) => (
        <group key={i}>
          <Box
            ref={(el) => el && (deskRefs.current[i] = el)}
            args={[1.5, 0.8, 0.8]}
            position={[
              (i % 3 - 1) * 3,
              -0.5,
              Math.floor(i / 3) * 2 - 1
            ]}
          >
            <meshStandardMaterial color="#8B4513" />
          </Box>
          
          {/* Chair */}
          <Box
            args={[0.6, 1.2, 0.6]}
            position={[
              (i % 3 - 1) * 3,
              0.1,
              Math.floor(i / 3) * 2
            ]}
          >
            <meshStandardMaterial color="#654321" />
          </Box>
        </group>
      ))}
      
      {/* Ceiling lights */}
      {Array.from({ length: 4 }).map((_, i) => (
        <pointLight
          key={i}
          position={[(i - 1.5) * 3, 5, 0]}
          intensity={0.8 * intensity}
          color="#ffffff"
        />
      ))}
    </group>
  );
};

// Laboratory Environment
const LaboratoryScene = ({ colors, intensity = 0.5, isActive }: Omit<DynamicEnvironmentProps, 'scene'>) => {
  const equipmentRefs = useRef<THREE.Mesh[]>([]);
  const particleRefs = useRef<THREE.Mesh[]>([]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    // Animate lab equipment
    equipmentRefs.current.forEach((equipment, i) => {
      if (equipment) {
        equipment.rotation.y = time * 0.2 + i;
        equipment.position.y = Math.sin(time + i) * 0.1 - 1;
      }
    });
    
    // Animate floating particles
    particleRefs.current.forEach((particle, i) => {
      if (particle) {
        particle.position.y += Math.sin(time * 2 + i) * 0.01;
        particle.scale.setScalar(0.5 + Math.sin(time * 3 + i) * 0.2);
      }
    });
  });

  return (
    <group>
      {/* Lab tables */}
      {Array.from({ length: 4 }).map((_, i) => (
        <Box
          key={i}
          args={[3, 0.2, 1.5]}
          position={[(i % 2 - 0.5) * 4, -1, Math.floor(i / 2) * 3 - 1.5]}
        >
          <meshStandardMaterial color="#333333" />
        </Box>
      ))}
      
      {/* Lab equipment */}
      {Array.from({ length: 8 }).map((_, i) => (
        <Cylinder
          key={i}
          ref={(el) => el && (equipmentRefs.current[i] = el)}
          args={[0.3, 0.2, 1]}
          position={[
            (Math.random() - 0.5) * 8,
            -1,
            (Math.random() - 0.5) * 6
          ]}
        >
          <meshStandardMaterial 
            color={i % 2 === 0 ? colors.primary : colors.secondary}
            emissive={i % 2 === 0 ? colors.primary : colors.secondary}
            emissiveIntensity={0.2 * intensity}
          />
        </Cylinder>
      ))}
      
      {/* Floating lab particles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <Sphere
          key={i}
          ref={(el) => el && (particleRefs.current[i] = el)}
          args={[0.05, 8, 8]}
          position={[
            (Math.random() - 0.5) * 10,
            Math.random() * 3,
            (Math.random() - 0.5) * 8
          ]}
        >
          <meshStandardMaterial
            color={colors.accent}
            emissive={colors.accent}
            emissiveIntensity={isActive ? 0.8 : 0.3}
            transparent
            opacity={0.6}
          />
        </Sphere>
      ))}
      
      {/* Lab lighting */}
      <pointLight position={[0, 4, 0]} intensity={1.2 * intensity} color={colors.secondary} />
      <spotLight position={[-3, 3, 2]} intensity={0.8 * intensity} color={colors.primary} />
      <spotLight position={[3, 3, -2]} intensity={0.8 * intensity} color={colors.primary} />
    </group>
  );
};

// Library Environment
const LibraryScene = ({ colors, intensity = 0.5, isActive }: Omit<DynamicEnvironmentProps, 'scene'>) => {
  const bookRefs = useRef<THREE.Mesh[]>([]);
  const dustRefs = useRef<THREE.Mesh[]>([]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    // Gentle book animation
    bookRefs.current.forEach((book, i) => {
      if (book) {
        book.rotation.z = Math.sin(time * 0.5 + i) * 0.02;
      }
    });
    
    // Floating dust particles
    dustRefs.current.forEach((dust, i) => {
      if (dust) {
        dust.position.y += Math.sin(time + i * 0.5) * 0.005;
        dust.position.x += Math.cos(time * 0.3 + i) * 0.002;
      }
    });
  });

  return (
    <group>
      {/* Bookshelves */}
      {Array.from({ length: 6 }).map((_, i) => (
        <group key={i}>
          <Box
            args={[0.3, 4, 1.5]}
            position={[(i - 2.5) * 2, 0, -6]}
          >
            <meshStandardMaterial color="#8B4513" />
          </Box>
          
          {/* Books */}
          {Array.from({ length: 8 }).map((_, j) => (
            <Box
              key={j}
              ref={(el) => el && bookRefs.current.push(el)}
              args={[0.25, 0.3, 0.05]}
              position={[
                (i - 2.5) * 2,
                -1.5 + (j % 4) * 0.4,
                -6 + (j < 4 ? 0.5 : -0.5)
              ]}
            >
              <meshStandardMaterial 
                color={`hsl(${(i * j * 30) % 360}, 60%, 50%)`}
              />
            </Box>
          ))}
        </group>
      ))}
      
      {/* Reading tables */}
      {Array.from({ length: 2 }).map((_, i) => (
        <Box
          key={i}
          args={[4, 0.1, 2]}
          position={[(i - 0.5) * 5, -1.5, 2]}
        >
          <meshStandardMaterial color="#654321" />
        </Box>
      ))}
      
      {/* Floating dust */}
      {Array.from({ length: 15 }).map((_, i) => (
        <Sphere
          key={i}
          ref={(el) => el && (dustRefs.current[i] = el)}
          args={[0.02, 6, 6]}
          position={[
            (Math.random() - 0.5) * 12,
            Math.random() * 4,
            (Math.random() - 0.5) * 10
          ]}
        >
          <meshStandardMaterial
            color="#f0f0f0"
            transparent
            opacity={0.3}
          />
        </Sphere>
      ))}
      
      {/* Warm library lighting */}
      <ambientLight intensity={0.4 * intensity} color="#fff8dc" />
      <pointLight position={[0, 3, 0]} intensity={0.8 * intensity} color="#ffdd88" />
    </group>
  );
};

// Futuristic Environment
const FuturisticScene = ({ colors, intensity = 0.5, isActive }: Omit<DynamicEnvironmentProps, 'scene'>) => {
  const hologramRefs = useRef<THREE.Mesh[]>([]);
  const energyRefs = useRef<THREE.Mesh[]>([]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    // Animate holograms
    hologramRefs.current.forEach((hologram, i) => {
      if (hologram) {
        hologram.rotation.y = time + i;
        hologram.position.y = Math.sin(time * 2 + i) * 0.5;
        (hologram.material as THREE.MeshStandardMaterial).emissiveIntensity = 
          0.5 + Math.sin(time * 4 + i) * 0.3;
      }
    });
    
    // Animate energy streams
    energyRefs.current.forEach((energy, i) => {
      if (energy) {
        energy.rotation.z = time * 2 + i;
        energy.scale.setScalar(1 + Math.sin(time * 3 + i) * 0.3);
      }
    });
  });

  return (
    <group>
      {/* Holographic displays */}
      {Array.from({ length: 6 }).map((_, i) => (
        <Box
          key={i}
          ref={(el) => el && (hologramRefs.current[i] = el)}
          args={[2, 1.5, 0.1]}
          position={[
            Math.cos((i / 6) * Math.PI * 2) * 5,
            1,
            Math.sin((i / 6) * Math.PI * 2) * 5
          ]}
        >
          <meshStandardMaterial
            color={colors.primary}
            emissive={colors.primary}
            emissiveIntensity={0.5}
            transparent
            opacity={0.7}
          />
        </Box>
      ))}
      
      {/* Energy streams */}
      {Array.from({ length: 12 }).map((_, i) => (
        <Cylinder
          key={i}
          ref={(el) => el && (energyRefs.current[i] = el)}
          args={[0.05, 0.05, 8]}
          position={[
            Math.cos((i / 12) * Math.PI * 2) * 7,
            0,
            Math.sin((i / 12) * Math.PI * 2) * 7
          ]}
          rotation={[0, 0, Math.PI / 2]}
        >
          <meshStandardMaterial
            color={colors.secondary}
            emissive={colors.secondary}
            emissiveIntensity={0.8}
            transparent
            opacity={0.6}
          />
        </Cylinder>
      ))}
      
      {/* Tech grid floor */}
      {Array.from({ length: 100 }).map((_, i) => (
        <Line
          key={i}
          points={[
            new THREE.Vector3((i % 10 - 5) * 2, -2, -10),
            new THREE.Vector3((i % 10 - 5) * 2, -2, 10)
          ]}
          color={colors.accent}
          lineWidth={1}
          transparent
          opacity={0.3}
        />
      ))}
      
      {/* Futuristic lighting */}
      <pointLight position={[0, 8, 0]} intensity={1.5 * intensity} color={colors.primary} />
      {Array.from({ length: 4 }).map((_, i) => (
        <spotLight
          key={i}
          position={[
            Math.cos((i / 4) * Math.PI * 2) * 10,
            6,
            Math.sin((i / 4) * Math.PI * 2) * 10
          ]}
          intensity={0.8 * intensity}
          color={i % 2 === 0 ? colors.secondary : colors.accent}
          angle={0.5}
        />
      ))}
    </group>
  );
};

// Nature Environment
const NatureScene = ({ colors, intensity = 0.5, isActive }: Omit<DynamicEnvironmentProps, 'scene'>) => {
  const treeRefs = useRef<THREE.Mesh[]>([]);
  const leafRefs = useRef<THREE.Mesh[]>([]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    // Gentle tree swaying
    treeRefs.current.forEach((tree, i) => {
      if (tree) {
        tree.rotation.z = Math.sin(time * 0.5 + i) * 0.1;
      }
    });
    
    // Floating leaves
    leafRefs.current.forEach((leaf, i) => {
      if (leaf) {
        leaf.position.y += Math.sin(time + i) * 0.01;
        leaf.rotation.y = time + i;
        leaf.position.x += Math.cos(time * 0.3 + i) * 0.005;
      }
    });
  });

  return (
    <group>
      {/* Trees */}
      {Array.from({ length: 8 }).map((_, i) => (
        <group key={i}>
          {/* Trunk */}
          <Cylinder
            ref={(el) => el && (treeRefs.current[i] = el)}
            args={[0.3, 0.5, 4]}
            position={[
              Math.cos((i / 8) * Math.PI * 2) * 8,
              0,
              Math.sin((i / 8) * Math.PI * 2) * 8
            ]}
          >
            <meshStandardMaterial color="#8B4513" />
          </Cylinder>
          
          {/* Leaves */}
          <Sphere
            args={[2, 16, 16]}
            position={[
              Math.cos((i / 8) * Math.PI * 2) * 8,
              2.5,
              Math.sin((i / 8) * Math.PI * 2) * 8
            ]}
          >
            <meshStandardMaterial color="#228B22" />
          </Sphere>
        </group>
      ))}
      
      {/* Grass ground */}
      <Plane args={[30, 30]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.5, 0]}>
        <meshStandardMaterial color="#32CD32" />
      </Plane>
      
      {/* Floating leaves */}
      {Array.from({ length: 20 }).map((_, i) => (
        <Box
          key={i}
          ref={(el) => el && (leafRefs.current[i] = el)}
          args={[0.1, 0.05, 0.02]}
          position={[
            (Math.random() - 0.5) * 15,
            Math.random() * 5,
            (Math.random() - 0.5) * 15
          ]}
        >
          <meshStandardMaterial color="#90EE90" transparent opacity={0.8} />
        </Box>
      ))}
      
      {/* Natural lighting */}
      <ambientLight intensity={0.6 * intensity} color="#fff8dc" />
      <directionalLight position={[10, 10, 5]} intensity={1 * intensity} color="#ffff88" />
    </group>
  );
};

// Space Environment
const SpaceScene = ({ colors, intensity = 0.5, isActive }: Omit<DynamicEnvironmentProps, 'scene'>) => {
  const asteroidRefs = useRef<THREE.Mesh[]>([]);
  const nebulaRefs = useRef<THREE.Mesh[]>([]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    // Rotating asteroids
    asteroidRefs.current.forEach((asteroid, i) => {
      if (asteroid) {
        asteroid.rotation.x = time * 0.3 + i;
        asteroid.rotation.y = time * 0.2 + i * 0.5;
        asteroid.position.y = Math.sin(time + i) * 0.5;
      }
    });
    
    // Pulsing nebula
    nebulaRefs.current.forEach((nebula, i) => {
      if (nebula) {
        nebula.scale.setScalar(1 + Math.sin(time * 0.5 + i) * 0.2);
        (nebula.material as THREE.MeshStandardMaterial).opacity = 
          0.3 + Math.sin(time * 0.8 + i) * 0.2;
      }
    });
  });

  return (
    <group>
      {/* Stars */}
      <Stars radius={100} depth={50} count={1000} factor={4} saturation={0} fade speed={1} />
      
      {/* Asteroids */}
      {Array.from({ length: 6 }).map((_, i) => (
        <Sphere
          key={i}
          ref={(el) => el && (asteroidRefs.current[i] = el)}
          args={[0.5 + Math.random() * 0.5, 8, 8]}
          position={[
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 20
          ]}
        >
          <meshStandardMaterial color="#696969" />
        </Sphere>
      ))}
      
      {/* Nebula clouds */}
      {Array.from({ length: 4 }).map((_, i) => (
        <Sphere
          key={i}
          ref={(el) => el && (nebulaRefs.current[i] = el)}
          args={[3 + i, 16, 16]}
          position={[
            Math.cos((i / 4) * Math.PI * 2) * 15,
            Math.sin(i) * 5,
            Math.sin((i / 4) * Math.PI * 2) * 15
          ]}
        >
          <meshStandardMaterial
            color={i % 2 === 0 ? colors.primary : colors.secondary}
            emissive={i % 2 === 0 ? colors.primary : colors.secondary}
            emissiveIntensity={0.3}
            transparent
            opacity={0.3}
          />
        </Sphere>
      ))}
      
      {/* Cosmic particles */}
      <Sparkles
        count={200}
        scale={50}
        size={3}
        speed={0.1}
        color={colors.accent}
      />
      
      {/* Cosmic lighting */}
      <pointLight position={[0, 0, 0]} intensity={0.5 * intensity} color={colors.primary} />
      <pointLight position={[10, 5, -10]} intensity={0.3 * intensity} color={colors.secondary} />
      <pointLight position={[-10, -5, 10]} intensity={0.3 * intensity} color={colors.accent} />
    </group>
  );
};

// Topic-based contextual elements
const ContextualElements = ({ currentTopic, colors, isActive }: {
  currentTopic?: string;
  colors: DynamicEnvironmentProps['colors'];
  isActive?: boolean;
}) => {
  if (!currentTopic) return null;

  const topic = currentTopic.toLowerCase();
  
  if (topic.includes('math') || topic.includes('calculus') || topic.includes('algebra')) {
    return (
      <group>
        <Text
          position={[0, 4, -5]}
          fontSize={0.8}
          color={colors.primary}
          anchorX="center"
          anchorY="middle"
        >
          ∫ f(x)dx = F(x) + C
        </Text>
        <Text
          position={[-3, 3, -4]}
          fontSize={0.5}
          color={colors.secondary}
          anchorX="center"
          anchorY="middle"
        >
          π = 3.14159...
        </Text>
      </group>
    );
  }
  
  if (topic.includes('physics') || topic.includes('quantum')) {
    return (
      <group>
        <Text
          position={[0, 4, -5]}
          fontSize={0.6}
          color={colors.primary}
          anchorX="center"
          anchorY="middle"
        >
          E = mc²
        </Text>
        <Text
          position={[3, 3, -4]}
          fontSize={0.4}
          color={colors.accent}
          anchorX="center"
          anchorY="middle"
        >
          ℏ = h/2π
        </Text>
      </group>
    );
  }
  
  if (topic.includes('chemistry') || topic.includes('molecule')) {
    return (
      <group>
        {/* Simple molecule visualization */}
        {Array.from({ length: 6 }).map((_, i) => (
          <Sphere
            key={i}
            args={[0.2, 16, 16]}
            position={[
              Math.cos((i / 6) * Math.PI * 2) * 2,
              4 + Math.sin(i),
              -3 + Math.sin((i / 6) * Math.PI * 2) * 2
            ]}
          >
            <meshStandardMaterial
              color={i % 2 === 0 ? colors.primary : colors.secondary}
              emissive={i % 2 === 0 ? colors.primary : colors.secondary}
              emissiveIntensity={isActive ? 0.3 : 0.1}
            />
          </Sphere>
        ))}
      </group>
    );
  }
  
  return null;
};

// Main Dynamic Environment Component
const DynamicEnvironment = ({ 
  scene = "futuristic", 
  intensity = 0.5, 
  colors,
  isActive = false,
  currentTopic
}: DynamicEnvironmentProps) => {
  const SceneComponent = useMemo(() => {
    switch (scene) {
      case "classroom": return ClassroomScene;
      case "laboratory": return LaboratoryScene;
      case "library": return LibraryScene;
      case "nature": return NatureScene;
      case "space": return SpaceScene;
      case "futuristic":
      default: return FuturisticScene;
    }
  }, [scene]);

  return (
    <group>
      <SceneComponent colors={colors} intensity={intensity} isActive={isActive} />
      <ContextualElements 
        currentTopic={currentTopic} 
        colors={colors} 
        isActive={isActive} 
      />
    </group>
  );
};

export default DynamicEnvironment;