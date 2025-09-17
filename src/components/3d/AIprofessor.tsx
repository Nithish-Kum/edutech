import { useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Sphere, MeshDistortMaterial, Text, Float, Line, useTexture, Sparkles, Icosahedron } from "@react-three/drei";
import * as THREE from "three";

interface Professor3DProps {
  isListening?: boolean;
  isSpeaking?: boolean;
  currentTopic?: string;
  onProfessorClick?: () => void;
}

const Professor3D = ({ isListening, isSpeaking, currentTopic, onProfessorClick }: Professor3DProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const eyeLeftRef = useRef<THREE.Mesh>(null);
  const eyeRightRef = useRef<THREE.Mesh>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { size, viewport } = useThree();

  // Track mouse for eye following
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({
        x: (event.clientX / size.width) * 2 - 1,
        y: -(event.clientY / size.height) * 2 + 1,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [size]);

  useFrame((state) => {
    if (meshRef.current && groupRef.current) {
      // Base rotation with speaking intensity
      const speakingIntensity = isSpeaking ? 0.2 : 0.1;
      const listeningPulse = isListening ? Math.sin(state.clock.elapsedTime * 4) * 0.05 : 0;
      
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 2) * speakingIntensity + listeningPulse;
      meshRef.current.rotation.y += 0.005;
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;

      // Eye tracking
      if (eyeLeftRef.current && eyeRightRef.current) {
        const eyeMovement = 0.1;
        eyeLeftRef.current.position.x = mousePosition.x * eyeMovement - 0.15;
        eyeLeftRef.current.position.y = mousePosition.y * eyeMovement + 0.1;
        eyeRightRef.current.position.x = mousePosition.x * eyeMovement + 0.15;
        eyeRightRef.current.position.y = mousePosition.y * eyeMovement + 0.1;
      }

      // Speaking animation - scale effect
      if (isSpeaking && meshRef.current) {
        const speakScale = 1 + Math.sin(state.clock.elapsedTime * 8) * 0.05;
        meshRef.current.scale.setScalar(speakScale);
      } else if (meshRef.current) {
        meshRef.current.scale.setScalar(1);
      }
    }
  });

  return (
    <group ref={groupRef}>
      {/* Background Sparkles */}
      <Sparkles
        count={100}
        scale={10}
        size={2}
        speed={0.4}
        color="#7c3aed"
      />

      {/* Main AI Professor Head */}
      <Float speed={2} rotationIntensity={0.3} floatIntensity={0.4}>
        <group onClick={onProfessorClick}>
          {/* Main Head Sphere */}
          <Sphere ref={meshRef} args={[1, 64, 64]} position={[0, 0, 0]}>
            <MeshDistortMaterial
              color={isSpeaking ? "#a855f7" : isListening ? "#06b6d4" : "#7c3aed"}
              attach="material"
              distort={isSpeaking ? 0.5 : 0.3}
              speed={isSpeaking ? 4 : 2}
              roughness={0.1}
              metalness={0.8}
            />
          </Sphere>

          {/* Eyes */}
          <Sphere ref={eyeLeftRef} args={[0.08, 16, 16]} position={[-0.15, 0.1, 0.9]}>
            <meshStandardMaterial color="#ffffff" emissive="#60a5fa" emissiveIntensity={0.3} />
          </Sphere>
          <Sphere ref={eyeRightRef} args={[0.08, 16, 16]} position={[0.15, 0.1, 0.9]}>
            <meshStandardMaterial color="#ffffff" emissive="#60a5fa" emissiveIntensity={0.3} />
          </Sphere>

          {/* Mouth Indicator */}
          {isSpeaking && (
            <Icosahedron args={[0.05]} position={[0, -0.2, 0.9]}>
              <meshStandardMaterial 
                color="#ff6b6b" 
                emissive="#ff6b6b" 
                emissiveIntensity={0.5}
              />
            </Icosahedron>
          )}
        </group>
      </Float>

      {/* Dynamic Status Text */}
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
        <Text
          position={[0, 2.2, 0]}
          fontSize={0.25}
          color={isListening ? "#06b6d4" : isSpeaking ? "#a855f7" : "#60a5fa"}
          anchorX="center"
          anchorY="middle"
        >
          {isListening ? "🎤 Listening..." : isSpeaking ? "🗣️ Speaking..." : "AI Professor"}
        </Text>
      </Float>

      {/* Topic Display */}
      {currentTopic && (
        <Float speed={1} rotationIntensity={0.1} floatIntensity={0.2}>
          <Text
            position={[0, -2.5, 0]}
            fontSize={0.2}
            color="#10b981"
            anchorX="center"
            anchorY="middle"
          >
            📚 {currentTopic}
          </Text>
        </Float>
      )}

      {/* Knowledge Orbs - Responsive to State */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const radius = isListening ? 3 : isSpeaking ? 2.2 : 2.5;
        const colors = ["#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b"];
        return (
          <Float
            key={i}
            speed={isListening ? 5 : isSpeaking ? 8 : 3 + i * 0.2}
            rotationIntensity={isListening ? 1.2 : 0.8}
            floatIntensity={isSpeaking ? 0.8 : 0.4}
          >
            <Sphere
              position={[
                Math.cos(angle) * radius,
                Math.sin(i * 0.5) * 0.5,
                Math.sin(angle) * radius,
              ]}
              args={[isListening ? 0.15 : 0.1, 16, 16]}
            >
              <meshStandardMaterial 
                color={colors[i]} 
                emissive={colors[i]} 
                emissiveIntensity={isListening ? 0.8 : isSpeaking ? 1.0 : 0.5} 
              />
            </Sphere>
          </Float>
        );
      })}

      {/* Neural Network Lines */}
      {Array.from({ length: 6 }).map((_, i) => {
        const startAngle = (i / 6) * Math.PI * 2;
        const endAngle = ((i + 2) / 6) * Math.PI * 2;
        const radius = 2;
        
        const points = [
          new THREE.Vector3(Math.cos(startAngle) * radius, 0, Math.sin(startAngle) * radius),
          new THREE.Vector3(Math.cos(endAngle) * radius, 0, Math.sin(endAngle) * radius),
        ];
        
        return (
          <Line
            key={i}
            points={points}
            color="#7c3aed"
            lineWidth={2}
            transparent
            opacity={0.4}
          />
        );
      })}

      {/* Ambient Lighting */}
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#7c3aed" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#06b6d4" />
    </group>
  );
};

interface AIprofessorProps {
  className?: string;
  isListening?: boolean;
  isSpeaking?: boolean;
  currentTopic?: string;
  onProfessorClick?: () => void;
}

const AIprofessor = ({ 
  className, 
  isListening = false, 
  isSpeaking = false, 
  currentTopic,
  onProfessorClick 
}: AIprofessorProps) => {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        style={{ background: "transparent" }}
      >
        <Professor3D 
          isListening={isListening}
          isSpeaking={isSpeaking}
          currentTopic={currentTopic}
          onProfessorClick={onProfessorClick}
        />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={!isListening && !isSpeaking}
          autoRotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
};

export default AIprofessor;