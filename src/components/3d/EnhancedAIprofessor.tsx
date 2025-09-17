import { useRef, useState, useEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { 
  Sphere, 
  MeshDistortMaterial, 
  Text, 
  Float, 
  Line, 
  Sparkles, 
  Icosahedron,
  Box,
  Cylinder,
  Torus
} from "@react-three/drei";
import * as THREE from "three";
import { AvatarConfig } from "./AvatarCustomizer";

interface EnhancedProfessor3DProps {
  isListening?: boolean;
  isSpeaking?: boolean;
  currentTopic?: string;
  emotion?: "neutral" | "happy" | "excited" | "focused" | "confused" | "explaining";
  onProfessorClick?: () => void;
  config: AvatarConfig;
}

// Facial expression morphs
const expressions = {
  neutral: { eyeScale: 1, eyeY: 0.1, mouthScale: 0.05 },
  happy: { eyeScale: 0.8, eyeY: 0.15, mouthScale: 0.08 },
  excited: { eyeScale: 1.2, eyeY: 0.12, mouthScale: 0.1 },
  focused: { eyeScale: 0.9, eyeY: 0.08, mouthScale: 0.03 },
  confused: { eyeScale: 1.1, eyeY: 0.05, mouthScale: 0.04 },
  explaining: { eyeScale: 1.0, eyeY: 0.13, mouthScale: 0.07 }
};

// Hand gesture positions
const gestures = {
  idle: { leftHand: [0, 0, 0], rightHand: [0, 0, 0] },
  explaining: { leftHand: [-1.5, 0.5, 1], rightHand: [1.5, 0.5, 1] },
  pointing: { leftHand: [0, 0, 0], rightHand: [1.8, 0.8, 1.2] },
  welcoming: { leftHand: [-1.2, 0.3, 0.8], rightHand: [1.2, 0.3, 0.8] },
  thinking: { leftHand: [0, 0, 0], rightHand: [0.5, 1.2, 0.8] }
};

const Professor3D = ({ 
  isListening, 
  isSpeaking, 
  currentTopic, 
  emotion = "neutral",
  onProfessorClick,
  config 
}: EnhancedProfessor3DProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const eyeLeftRef = useRef<THREE.Mesh>(null);
  const eyeRightRef = useRef<THREE.Mesh>(null);
  const mouthRef = useRef<THREE.Mesh>(null);
  const leftHandRef = useRef<THREE.Group>(null);
  const rightHandRef = useRef<THREE.Group>(null);
  
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [blinkTimer, setBlinkTimer] = useState(0);
  const [currentGesture, setCurrentGesture] = useState<keyof typeof gestures>("idle");
  const [lipSyncPhase, setLipSyncPhase] = useState(0);
  
  const { size, viewport } = useThree();

  // Determine current gesture based on state
  useEffect(() => {
    if (isSpeaking) {
      const gestures = ["explaining", "pointing", "welcoming"];
      setCurrentGesture(gestures[Math.floor(Math.random() * gestures.length)] as keyof typeof gestures);
    } else if (isListening) {
      setCurrentGesture("thinking");
    } else {
      setCurrentGesture("idle");
    }
  }, [isSpeaking, isListening]);

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

  // Dynamic color based on config and state
  const dynamicColors = useMemo(() => ({
    primary: isListening ? config.secondaryColor : isSpeaking ? config.primaryColor : config.primaryColor,
    secondary: config.secondaryColor,
    eye: config.eyeColor
  }), [config, isListening, isSpeaking]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    if (meshRef.current && groupRef.current) {
      // Base rotation with personality-based intensity
      const baseIntensity = config.energy * config.expressiveness;
      const speakingIntensity = isSpeaking ? baseIntensity * 0.3 : baseIntensity * 0.1;
      const listeningPulse = isListening ? Math.sin(time * 4) * 0.05 : 0;
      
      meshRef.current.rotation.x = Math.sin(time * 2) * speakingIntensity + listeningPulse;
      meshRef.current.rotation.y += 0.005 * config.energy;
      groupRef.current.rotation.y = Math.sin(time * 0.5) * config.rotationIntensity;

      // Scale based on size config
      const baseScale = config.size;
      if (isSpeaking) {
        const speakScale = baseScale + Math.sin(time * 8) * 0.05 * config.expressiveness;
        meshRef.current.scale.setScalar(speakScale);
      } else {
        meshRef.current.scale.setScalar(baseScale);
      }
    }

    // Eye tracking and blinking
    if (eyeLeftRef.current && eyeRightRef.current && config.enableFacialExpressions) {
      const expression = expressions[emotion];
      const eyeMovement = 0.1 * config.expressiveness;
      
      // Update blink timer
      setBlinkTimer(prev => prev + 0.016);
      const shouldBlink = Math.sin(blinkTimer * 0.2) > 0.95;
      const blinkScale = shouldBlink ? 0.1 : expression.eyeScale;
      
      eyeLeftRef.current.position.x = mousePosition.x * eyeMovement - 0.15;
      eyeLeftRef.current.position.y = mousePosition.y * eyeMovement + expression.eyeY;
      eyeLeftRef.current.scale.y = blinkScale;
      
      eyeRightRef.current.position.x = mousePosition.x * eyeMovement + 0.15;
      eyeRightRef.current.position.y = mousePosition.y * eyeMovement + expression.eyeY;
      eyeRightRef.current.scale.y = blinkScale;
    }

    // Lip-sync animation
    if (mouthRef.current && config.enableFacialExpressions) {
      if (isSpeaking) {
        setLipSyncPhase(prev => prev + 0.3);
        const lipMovement = Math.abs(Math.sin(lipSyncPhase));
        const expression = expressions[emotion];
        mouthRef.current.scale.setScalar(expression.mouthScale + lipMovement * 0.05 * config.expressiveness);
        mouthRef.current.position.y = -0.2 + lipMovement * 0.02;
      } else {
        const expression = expressions[emotion];
        mouthRef.current.scale.setScalar(expression.mouthScale);
        mouthRef.current.position.y = -0.2;
      }
    }

    // Hand gestures
    if (leftHandRef.current && rightHandRef.current && config.enableGestures) {
      const gesture = gestures[currentGesture];
      const gestureIntensity = config.expressiveness;
      
      // Smooth transition to gesture positions
      leftHandRef.current.position.lerp(
        new THREE.Vector3(...gesture.leftHand).multiplyScalar(gestureIntensity),
        0.05
      );
      rightHandRef.current.position.lerp(
        new THREE.Vector3(...gesture.rightHand).multiplyScalar(gestureIntensity),
        0.05
      );

      // Add subtle movement to hands
      if (isSpeaking) {
        leftHandRef.current.rotation.z = Math.sin(time * 3) * 0.1 * gestureIntensity;
        rightHandRef.current.rotation.z = Math.cos(time * 3) * 0.1 * gestureIntensity;
      }
    }
  });

  return (
    <group ref={groupRef}>
      {/* Background Environment Effects */}
      {config.enableEnvironmentEffects && (
        <>
          <Sparkles
            count={config.particleCount}
            scale={10}
            size={2 * config.glowIntensity}
            speed={0.4 * config.energy}
            color={dynamicColors.primary}
          />
          
          {/* Dynamic background orbs based on personality */}
          {config.personality === "enthusiastic" && (
            <Float speed={config.floatSpeed * 2} rotationIntensity={1}>
              <Torus args={[8, 0.5, 8, 32]} position={[0, 0, -8]}>
                <meshStandardMaterial 
                  color={dynamicColors.secondary} 
                  transparent 
                  opacity={0.1}
                  emissive={dynamicColors.secondary}
                  emissiveIntensity={0.1 * config.glowIntensity}
                />
              </Torus>
            </Float>
          )}
          
          {config.personality === "technical" && (
            <>
              {Array.from({ length: 6 }).map((_, i) => (
                <Float key={i} speed={1} rotationIntensity={0.5}>
                  <Box 
                    args={[0.2, 0.2, 0.2]} 
                    position={[
                      Math.cos((i / 6) * Math.PI * 2) * 6,
                      Math.sin(i) * 2,
                      Math.sin((i / 6) * Math.PI * 2) * 6
                    ]}
                  >
                    <meshStandardMaterial 
                      color={dynamicColors.primary}
                      wireframe
                      transparent
                      opacity={0.3}
                    />
                  </Box>
                </Float>
              ))}
            </>
          )}
        </>
      )}

      {/* Main AI Professor */}
      <Float 
        speed={config.floatSpeed} 
        rotationIntensity={config.rotationIntensity} 
        floatIntensity={0.4 * config.energy}
      >
        <group onClick={onProfessorClick}>
          {/* Main Head Sphere */}
          <Sphere ref={meshRef} args={[1, 64, 64]} position={[0, 0, 0]}>
            <MeshDistortMaterial
              color={dynamicColors.primary}
              attach="material"
              distort={isSpeaking ? 0.5 * config.expressiveness : 0.3}
              speed={isSpeaking ? 4 * config.energy : 2}
              roughness={0.1}
              metalness={0.8}
            />
          </Sphere>

          {/* Enhanced Eyes with expressions */}
          {config.enableFacialExpressions && (
            <>
              <Sphere ref={eyeLeftRef} args={[0.08, 16, 16]} position={[-0.15, 0.1, 0.9]}>
                <meshStandardMaterial 
                  color="#ffffff" 
                  emissive={dynamicColors.eye} 
                  emissiveIntensity={0.3 * config.glowIntensity} 
                />
              </Sphere>
              <Sphere ref={eyeRightRef} args={[0.08, 16, 16]} position={[0.15, 0.1, 0.9]}>
                <meshStandardMaterial 
                  color="#ffffff" 
                  emissive={dynamicColors.eye} 
                  emissiveIntensity={0.3 * config.glowIntensity} 
                />
              </Sphere>

              {/* Dynamic Mouth */}
              <Icosahedron 
                ref={mouthRef} 
                args={[0.05]} 
                position={[0, -0.2, 0.9]}
              >
                <meshStandardMaterial 
                  color={isSpeaking ? "#ff6b6b" : dynamicColors.secondary}
                  emissive={isSpeaking ? "#ff6b6b" : dynamicColors.secondary}
                  emissiveIntensity={isSpeaking ? 0.8 : 0.3}
                />
              </Icosahedron>
            </>
          )}

          {/* Hand Gestures */}
          {config.enableGestures && (
            <>
              <group ref={leftHandRef}>
                <Sphere args={[0.12, 16, 16]}>
                  <meshStandardMaterial 
                    color={dynamicColors.primary} 
                    emissive={dynamicColors.primary}
                    emissiveIntensity={0.2}
                  />
                </Sphere>
                <Cylinder args={[0.04, 0.06, 0.3]} position={[0, -0.2, 0]}>
                  <meshStandardMaterial color={dynamicColors.primary} />
                </Cylinder>
              </group>
              
              <group ref={rightHandRef}>
                <Sphere args={[0.12, 16, 16]}>
                  <meshStandardMaterial 
                    color={dynamicColors.primary} 
                    emissive={dynamicColors.primary}
                    emissiveIntensity={0.2}
                  />
                </Sphere>
                <Cylinder args={[0.04, 0.06, 0.3]} position={[0, -0.2, 0]}>
                  <meshStandardMaterial color={dynamicColors.primary} />
                </Cylinder>
              </group>
            </>
          )}
        </group>
      </Float>

      {/* Dynamic Status Text */}
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
        <Text
          position={[0, 2.2, 0]}
          fontSize={0.25}
          color={isListening ? dynamicColors.secondary : isSpeaking ? dynamicColors.primary : dynamicColors.eye}
          anchorX="center"
          anchorY="middle"
        >
          {isListening ? "🎤 Listening..." : isSpeaking ? "🗣️ Speaking..." : `AI Professor (${config.personality})`}
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

      {/* Enhanced Knowledge Orbs with personality-based behavior */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const radius = isListening ? 3.5 : isSpeaking ? 2.8 : 3.0;
        const colors = [
          dynamicColors.secondary, 
          "#10b981", 
          "#f59e0b", 
          "#ef4444", 
          dynamicColors.primary, 
          dynamicColors.eye, 
          "#10b981", 
          "#f59e0b"
        ];
        
        const orbSpeed = config.energy * (isListening ? 5 : isSpeaking ? 8 : 3) + i * 0.2;
        const orbSize = (isListening ? 0.18 : isSpeaking ? 0.15 : 0.12) * config.size;
        
        return (
          <Float
            key={i}
            speed={orbSpeed}
            rotationIntensity={isListening ? 1.2 : 0.8}
            floatIntensity={isSpeaking ? 0.8 * config.expressiveness : 0.4}
          >
            <Sphere
              position={[
                Math.cos(angle) * radius,
                Math.sin(i * 0.5 + Date.now() * 0.001) * 0.5,
                Math.sin(angle) * radius,
              ]}
              args={[orbSize, 16, 16]}
            >
              <meshStandardMaterial 
                color={colors[i]} 
                emissive={colors[i]} 
                emissiveIntensity={config.glowIntensity * (isListening ? 0.8 : isSpeaking ? 1.0 : 0.5)} 
              />
            </Sphere>
          </Float>
        );
      })}

      {/* Neural Network Lines */}
      {Array.from({ length: 6 }).map((_, i) => {
        const startAngle = (i / 6) * Math.PI * 2;
        const endAngle = ((i + 2) / 6) * Math.PI * 2;
        const radius = 2.5;
        
        const points = [
          new THREE.Vector3(Math.cos(startAngle) * radius, 0, Math.sin(startAngle) * radius),
          new THREE.Vector3(Math.cos(endAngle) * radius, 0, Math.sin(endAngle) * radius),
        ];
        
        return (
          <Line
            key={i}
            points={points}
            color={dynamicColors.primary}
            lineWidth={2}
            transparent
            opacity={0.4 * config.glowIntensity}
          />
        );
      })}

      {/* Enhanced Lighting System */}
      <ambientLight intensity={0.4} />
      <pointLight 
        position={[10, 10, 10]} 
        intensity={1 * config.glowIntensity} 
        color={dynamicColors.primary} 
      />
      <pointLight 
        position={[-10, -10, -10]} 
        intensity={0.5 * config.glowIntensity} 
        color={dynamicColors.secondary} 
      />
      
      {/* Dynamic mood lighting */}
      {emotion === "excited" && (
        <pointLight 
          position={[0, 5, 5]} 
          intensity={0.8} 
          color="#ff6b6b"
        />
      )}
      {emotion === "focused" && (
        <pointLight 
          position={[0, -5, 5]} 
          intensity={0.6} 
          color="#3b82f6"
        />
      )}
    </group>
  );
};

interface EnhancedAIprofessorProps {
  className?: string;
  isListening?: boolean;
  isSpeaking?: boolean;
  currentTopic?: string;
  emotion?: "neutral" | "happy" | "excited" | "focused" | "confused" | "explaining";
  config: AvatarConfig;
  onProfessorClick?: () => void;
}

const EnhancedAIprofessor = ({ 
  className, 
  isListening = false, 
  isSpeaking = false, 
  currentTopic,
  emotion = "neutral",
  config,
  onProfessorClick 
}: EnhancedAIprofessorProps) => {
  return (
    <Professor3D 
      isListening={isListening}
      isSpeaking={isSpeaking}
      currentTopic={currentTopic}
      emotion={emotion}
      config={config}
      onProfessorClick={onProfessorClick}
    />
  );
};

export default EnhancedAIprofessor;