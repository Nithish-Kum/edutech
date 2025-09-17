import { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/enhanced-button";
import { Settings, Palette } from "lucide-react";
import EnhancedAIprofessor from "./EnhancedAIprofessor";
import AvatarCustomizer, { AvatarConfig } from "./AvatarCustomizer";
import { MultiLayerAudioVisualizer } from "./AudioVisualizer";
import DynamicEnvironment from "./DynamicEnvironment";

interface MasterAvatarSystemProps {
  className?: string;
  isListening?: boolean;
  isSpeaking?: boolean;
  currentTopic?: string;
  onProfessorClick?: () => void;
}

const defaultConfig: AvatarConfig = {
  primaryColor: "#7c3aed",
  secondaryColor: "#06b6d4",
  eyeColor: "#60a5fa",
  size: 1,
  glowIntensity: 0.5,
  personality: "friendly",
  expressiveness: 0.7,
  energy: 0.6,
  floatSpeed: 2,
  rotationIntensity: 0.3,
  particleCount: 100,
  enableFacialExpressions: true,
  enableGestures: true,
  enableEnvironmentEffects: true,
};

const MasterAvatarSystem = ({
  className,
  isListening = false,
  isSpeaking = false,
  currentTopic,
  onProfessorClick
}: MasterAvatarSystemProps) => {
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>(defaultConfig);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState<"neutral" | "happy" | "excited" | "focused" | "confused" | "explaining">("neutral");
  const [currentScene, setCurrentScene] = useState<"classroom" | "laboratory" | "library" | "futuristic" | "nature" | "space">("futuristic");

  // Auto-detect emotion based on state
  useEffect(() => {
    if (isSpeaking) {
      setCurrentEmotion("explaining");
    } else if (isListening) {
      setCurrentEmotion("focused");
    } else {
      // Base emotion on personality
      const emotionMap = {
        friendly: "happy",
        professional: "neutral",
        enthusiastic: "excited",
        wise: "neutral",
        technical: "focused"
      } as const;
      setCurrentEmotion(emotionMap[avatarConfig.personality] || "neutral");
    }
  }, [isSpeaking, isListening, avatarConfig.personality]);

  // Auto-select scene based on topic
  useEffect(() => {
    if (!currentTopic) return;
    
    const topic = currentTopic.toLowerCase();
    if (topic.includes('science') || topic.includes('chemistry') || topic.includes('physics')) {
      setCurrentScene("laboratory");
    } else if (topic.includes('math') || topic.includes('literature') || topic.includes('history')) {
      setCurrentScene("library");
    } else if (topic.includes('nature') || topic.includes('biology') || topic.includes('environment')) {
      setCurrentScene("nature");
    } else if (topic.includes('space') || topic.includes('astronomy') || topic.includes('cosmos')) {
      setCurrentScene("space");
    } else if (topic.includes('traditional') || topic.includes('basic') || topic.includes('elementary')) {
      setCurrentScene("classroom");
    } else {
      setCurrentScene("futuristic");
    }
  }, [currentTopic]);

  const handleConfigChange = (config: AvatarConfig) => {
    setAvatarConfig(config);
    // Save to localStorage
    localStorage.setItem('avatarConfig', JSON.stringify(config));
  };

  // Load saved config on mount
  useEffect(() => {
    const saved = localStorage.getItem('avatarConfig');
    if (saved) {
      try {
        setAvatarConfig(JSON.parse(saved));
      } catch (e) {
        console.warn('Failed to load avatar config:', e);
      }
    }
  }, []);

  const audioIntensity = (isListening ? 0.8 : isSpeaking ? 1.0 : 0.3) * avatarConfig.energy;

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Floating Controls */}
      <div className="absolute top-4 right-4 z-40 flex space-x-2">
        <Button
          variant="glass"
          size="icon"
          onClick={() => setShowCustomizer(true)}
          className="backdrop-blur-sm"
        >
          <Settings className="w-4 h-4" />
        </Button>
        
        {/* Quick personality toggles */}
        <div className="flex space-x-1">
          {(["friendly", "professional", "enthusiastic", "wise", "technical"] as const).map((personality) => (
            <Button
              key={personality}
              variant={avatarConfig.personality === personality ? "electric" : "glass"}
              size="sm"
              onClick={() => handleConfigChange({ ...avatarConfig, personality })}
              className="backdrop-blur-sm text-xs px-2"
            >
              {personality.charAt(0).toUpperCase()}
            </Button>
          ))}
        </div>
      </div>

      {/* Scene selector */}
      <div className="absolute top-4 left-4 z-40">
        <div className="flex space-x-1">
          {(["futuristic", "classroom", "laboratory", "library", "nature", "space"] as const).map((scene) => (
            <Button
              key={scene}
              variant={currentScene === scene ? "neural" : "glass"}
              size="sm"
              onClick={() => setCurrentScene(scene)}
              className="backdrop-blur-sm text-xs px-2"
            >
              {scene.charAt(0).toUpperCase() + scene.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Current config display */}
      <div className="absolute bottom-4 left-4 z-40 glass-morphism p-3 rounded-lg border border-white/20">
        <div className="text-xs text-muted-foreground space-y-1">
          <div className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: avatarConfig.primaryColor }}
            />
            <span className="capitalize">{avatarConfig.personality}</span>
          </div>
          <div>Scene: {currentScene}</div>
          <div>Emotion: {currentEmotion}</div>
        </div>
      </div>

      {/* Main 3D Canvas */}
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        style={{ background: "transparent" }}
      >
        {/* Dynamic Environment */}
        <DynamicEnvironment
          scene={currentScene}
          intensity={avatarConfig.glowIntensity}
          colors={{
            primary: avatarConfig.primaryColor,
            secondary: avatarConfig.secondaryColor,
            accent: avatarConfig.eyeColor,
          }}
          isActive={isListening || isSpeaking}
          currentTopic={currentTopic}
        />

        {/* Audio Visualizer */}
        <MultiLayerAudioVisualizer
          isActive={isListening || isSpeaking}
          intensity={audioIntensity}
          primaryColor={avatarConfig.primaryColor}
          secondaryColor={avatarConfig.secondaryColor}
          position={[0, -3, 0]}
        />

        {/* Enhanced AI Professor */}
        <EnhancedAIprofessor
          isListening={isListening}
          isSpeaking={isSpeaking}
          currentTopic={currentTopic}
          emotion={currentEmotion}
          config={avatarConfig}
          onProfessorClick={onProfessorClick}
        />

        {/* Scene-aware orbit controls */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={!isListening && !isSpeaking}
          autoRotateSpeed={0.5 * avatarConfig.energy}
          maxPolarAngle={Math.PI / 1.5}
          minPolarAngle={Math.PI / 3}
        />
      </Canvas>

      {/* Avatar Customizer Modal */}
      <AnimatePresence>
        {showCustomizer && (
          <AvatarCustomizer
            config={avatarConfig}
            onConfigChange={handleConfigChange}
            onClose={() => setShowCustomizer(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default MasterAvatarSystem;