import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/enhanced-button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import {
  Palette,
  User,
  Sparkles,
  Brain,
  Heart,
  Zap,
  Settings,
  Eye,
  Lightbulb
} from "lucide-react";

export interface AvatarConfig {
  // Appearance
  primaryColor: string;
  secondaryColor: string;
  eyeColor: string;
  size: number;
  glowIntensity: number;
  
  // Personality
  personality: "friendly" | "professional" | "enthusiastic" | "wise" | "technical";
  expressiveness: number;
  energy: number;
  
  // Animation preferences
  floatSpeed: number;
  rotationIntensity: number;
  particleCount: number;
  
  // Advanced features
  enableFacialExpressions: boolean;
  enableGestures: boolean;
  enableEnvironmentEffects: boolean;
}

interface AvatarCustomizerProps {
  config: AvatarConfig;
  onConfigChange: (config: AvatarConfig) => void;
  onClose?: () => void;
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

const personalityPresets = {
  friendly: {
    primaryColor: "#10b981",
    secondaryColor: "#f59e0b",
    energy: 0.8,
    expressiveness: 0.9,
    floatSpeed: 2.5,
    description: "Warm, approachable, and encouraging"
  },
  professional: {
    primaryColor: "#3b82f6",
    secondaryColor: "#1f2937",
    energy: 0.5,
    expressiveness: 0.6,
    floatSpeed: 1.5,
    description: "Focused, knowledgeable, and methodical"
  },
  enthusiastic: {
    primaryColor: "#f59e0b",
    secondaryColor: "#ef4444",
    energy: 0.95,
    expressiveness: 1.0,
    floatSpeed: 3,
    description: "Energetic, passionate, and inspiring"
  },
  wise: {
    primaryColor: "#8b5cf6",
    secondaryColor: "#6366f1",
    energy: 0.4,
    expressiveness: 0.5,
    floatSpeed: 1,
    description: "Thoughtful, experienced, and calm"
  },
  technical: {
    primaryColor: "#06b6d4",
    secondaryColor: "#0891b2",
    energy: 0.6,
    expressiveness: 0.4,
    floatSpeed: 2,
    description: "Precise, analytical, and detail-oriented"
  }
};

const colorPresets = [
  { name: "Purple", value: "#7c3aed" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Green", value: "#10b981" },
  { name: "Orange", value: "#f59e0b" },
  { name: "Red", value: "#ef4444" },
  { name: "Pink", value: "#ec4899" },
  { name: "Cyan", value: "#06b6d4" },
  { name: "Indigo", value: "#6366f1" },
];

export const AvatarCustomizer = ({ config, onConfigChange, onClose }: AvatarCustomizerProps) => {
  const [currentConfig, setCurrentConfig] = useState<AvatarConfig>(config);

  const updateConfig = (updates: Partial<AvatarConfig>) => {
    const newConfig = { ...currentConfig, ...updates };
    setCurrentConfig(newConfig);
    onConfigChange(newConfig);
  };

  const applyPersonalityPreset = (personality: keyof typeof personalityPresets) => {
    const preset = personalityPresets[personality];
    updateConfig({
      personality,
      ...preset,
    });
  };

  const resetToDefaults = () => {
    setCurrentConfig(defaultConfig);
    onConfigChange(defaultConfig);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <Card className="glass-morphism border-white/20 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Settings className="w-6 h-6 text-primary" />
              <span className="text-gradient">Avatar Customizer</span>
            </CardTitle>
            <div className="flex space-x-2">
              <Button variant="glass" size="sm" onClick={resetToDefaults}>
                Reset
              </Button>
              {onClose && (
                <Button variant="neural" size="sm" onClick={onClose}>
                  Done
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="personality" className="w-full">
            <TabsList className="grid w-full grid-cols-4 glass-morphism">
              <TabsTrigger value="personality">Personality</TabsTrigger>
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
              <TabsTrigger value="animation">Animation</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            <TabsContent value="personality" className="space-y-6">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(personalityPresets).map(([key, preset]) => (
                  <motion.div
                    key={key}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card 
                      className={`cursor-pointer transition-all ${
                        currentConfig.personality === key 
                          ? 'border-primary/50 bg-primary/10' 
                          : 'glass-morphism border-white/20 hover:bg-white/10'
                      }`}
                      onClick={() => applyPersonalityPreset(key as keyof typeof personalityPresets)}
                    >
                      <CardContent className="p-4 text-center space-y-3">
                        <div className="flex items-center justify-center space-x-2">
                          {key === 'friendly' && <Heart className="w-5 h-5" style={{ color: preset.primaryColor }} />}
                          {key === 'professional' && <Brain className="w-5 h-5" style={{ color: preset.primaryColor }} />}
                          {key === 'enthusiastic' && <Zap className="w-5 h-5" style={{ color: preset.primaryColor }} />}
                          {key === 'wise' && <Lightbulb className="w-5 h-5" style={{ color: preset.primaryColor }} />}
                          {key === 'technical' && <Settings className="w-5 h-5" style={{ color: preset.primaryColor }} />}
                          <h3 className="font-semibold capitalize">{key}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">{preset.description}</p>
                        <div className="flex justify-center space-x-1">
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.primaryColor }} />
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: preset.secondaryColor }} />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Expressiveness: {Math.round(currentConfig.expressiveness * 100)}%</Label>
                  <Slider
                    value={[currentConfig.expressiveness]}
                    onValueChange={([value]) => updateConfig({ expressiveness: value })}
                    min={0}
                    max={1}
                    step={0.1}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">Energy Level: {Math.round(currentConfig.energy * 100)}%</Label>
                  <Slider
                    value={[currentConfig.energy]}
                    onValueChange={([value]) => updateConfig({ energy: value })}
                    min={0}
                    max={1}
                    step={0.1}
                    className="mt-2"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="appearance" className="space-y-6">
              <div className="space-y-6">
                <div>
                  <Label className="text-sm font-medium mb-3 block">Primary Color</Label>
                  <div className="flex flex-wrap gap-2">
                    {colorPresets.map((color) => (
                      <motion.button
                        key={color.name}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className={`w-10 h-10 rounded-full border-2 ${
                          currentConfig.primaryColor === color.value
                            ? 'border-white ring-2 ring-primary'
                            : 'border-white/20'
                        }`}
                        style={{ backgroundColor: color.value }}
                        onClick={() => updateConfig({ primaryColor: color.value })}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-3 block">Secondary Color</Label>
                  <div className="flex flex-wrap gap-2">
                    {colorPresets.map((color) => (
                      <motion.button
                        key={color.name}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className={`w-10 h-10 rounded-full border-2 ${
                          currentConfig.secondaryColor === color.value
                            ? 'border-white ring-2 ring-primary'
                            : 'border-white/20'
                        }`}
                        style={{ backgroundColor: color.value }}
                        onClick={() => updateConfig({ secondaryColor: color.value })}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium mb-3 block">Eye Color</Label>
                  <div className="flex flex-wrap gap-2">
                    {colorPresets.map((color) => (
                      <motion.button
                        key={color.name}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className={`w-10 h-10 rounded-full border-2 ${
                          currentConfig.eyeColor === color.value
                            ? 'border-white ring-2 ring-primary'
                            : 'border-white/20'
                        }`}
                        style={{ backgroundColor: color.value }}
                        onClick={() => updateConfig({ eyeColor: color.value })}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Avatar Size: {Math.round(currentConfig.size * 100)}%</Label>
                  <Slider
                    value={[currentConfig.size]}
                    onValueChange={([value]) => updateConfig({ size: value })}
                    min={0.5}
                    max={1.5}
                    step={0.1}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">Glow Intensity: {Math.round(currentConfig.glowIntensity * 100)}%</Label>
                  <Slider
                    value={[currentConfig.glowIntensity]}
                    onValueChange={([value]) => updateConfig({ glowIntensity: value })}
                    min={0}
                    max={1}
                    step={0.1}
                    className="mt-2"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="animation" className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Float Speed: {currentConfig.floatSpeed.toFixed(1)}x</Label>
                  <Slider
                    value={[currentConfig.floatSpeed]}
                    onValueChange={([value]) => updateConfig({ floatSpeed: value })}
                    min={0.5}
                    max={5}
                    step={0.1}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">Rotation Intensity: {Math.round(currentConfig.rotationIntensity * 100)}%</Label>
                  <Slider
                    value={[currentConfig.rotationIntensity]}
                    onValueChange={([value]) => updateConfig({ rotationIntensity: value })}
                    min={0}
                    max={1}
                    step={0.1}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">Particle Count: {currentConfig.particleCount}</Label>
                  <Slider
                    value={[currentConfig.particleCount]}
                    onValueChange={([value]) => updateConfig({ particleCount: value })}
                    min={50}
                    max={200}
                    step={10}
                    className="mt-2"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-6">
              <div className="space-y-4">
                <Card className="glass-morphism border-white/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Eye className="w-4 h-4 text-primary" />
                        <span className="font-medium">Facial Expressions</span>
                      </div>
                      <Button
                        variant={currentConfig.enableFacialExpressions ? "electric" : "glass"}
                        size="sm"
                        onClick={() => updateConfig({ enableFacialExpressions: !currentConfig.enableFacialExpressions })}
                      >
                        {currentConfig.enableFacialExpressions ? "Enabled" : "Disabled"}
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Dynamic facial expressions and eye blinking
                    </p>
                  </CardContent>
                </Card>

                <Card className="glass-morphism border-white/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-primary" />
                        <span className="font-medium">Hand Gestures</span>
                      </div>
                      <Button
                        variant={currentConfig.enableGestures ? "electric" : "glass"}
                        size="sm"
                        onClick={() => updateConfig({ enableGestures: !currentConfig.enableGestures })}
                      >
                        {currentConfig.enableGestures ? "Enabled" : "Disabled"}
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Contextual hand movements and body language
                    </p>
                  </CardContent>
                </Card>

                <Card className="glass-morphism border-white/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <span className="font-medium">Environment Effects</span>
                      </div>
                      <Button
                        variant={currentConfig.enableEnvironmentEffects ? "electric" : "glass"}
                        size="sm"
                        onClick={() => updateConfig({ enableEnvironmentEffects: !currentConfig.enableEnvironmentEffects })}
                      >
                        {currentConfig.enableEnvironmentEffects ? "Enabled" : "Disabled"}
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Dynamic backgrounds and environmental particles
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AvatarCustomizer;