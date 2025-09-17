import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/enhanced-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  X, 
  Sparkles, 
  MessageSquare, 
  Lightbulb,
  ArrowRight,
  Minimize2,
  Maximize2
} from "lucide-react";
import { generateCourseOutline, isAIEnabled } from "@/lib/ai";

interface AIAssistantPopupProps {
  courseTitle: string;
  onCourseGenerated?: (courseData: any) => void;
  onClose?: () => void;
  isVisible: boolean;
}

const AIAssistantPopup = ({ 
  courseTitle, 
  onCourseGenerated, 
  onClose, 
  isVisible 
}: AIAssistantPopupProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const generateSuggestions = (title: string) => {
    const lowerTitle = title.toLowerCase();
    const baseSuggestions = [];
    
    if (lowerTitle.includes("react") || lowerTitle.includes("javascript")) {
      baseSuggestions.push(
        "Add modules on React Hooks, State Management, and Component Architecture",
        "Include practical projects like Todo App, E-commerce Site, and Social Dashboard",
        "Cover testing with Jest and React Testing Library"
      );
    } else if (lowerTitle.includes("python") || lowerTitle.includes("data")) {
      baseSuggestions.push(
        "Include modules on Data Analysis, Machine Learning, and Web Development",
        "Add hands-on projects with real datasets",
        "Cover popular libraries like Pandas, NumPy, and Scikit-learn"
      );
    } else if (lowerTitle.includes("design") || lowerTitle.includes("ui")) {
      baseSuggestions.push(
        "Add modules on Design Principles, Color Theory, and Typography",
        "Include practical design challenges and portfolio projects",
        "Cover modern design tools like Figma and Adobe Creative Suite"
      );
    } else {
      baseSuggestions.push(
        "Structure your course with progressive difficulty levels",
        "Include hands-on projects and real-world applications",
        "Add interactive exercises and assessments"
      );
    }
    
    setSuggestions(baseSuggestions);
  };

  const handleGenerateCourse = async () => {
    if (!courseTitle.trim()) return;
    
    setIsGenerating(true);
    try {
      const courseData = await generateCourseOutline(courseTitle);
      if (courseData) {
        onCourseGenerated?.(courseData);
      }
    } catch (error) {
      console.error("Error generating course:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  useState(() => {
    if (courseTitle.trim()) {
      generateSuggestions(courseTitle);
    }
  });

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, x: 300 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        exit={{ opacity: 0, scale: 0.8, x: 300 }}
        transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
        className="fixed bottom-6 right-6 z-50 max-w-sm"
      >
        <Card className={`glass-morphism border-primary/30 bg-primary/5 backdrop-blur-xl shadow-2xl ${
          isMinimized ? "h-16" : "max-h-96"
        } transition-all duration-300`}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-gradient-primary flex items-center justify-center">
                  <Brain className="w-3 h-3 text-white" />
                </div>
                <span className="text-gradient font-semibold">AI Assistant</span>
              </div>
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="h-6 w-6 p-0"
                >
                  {isMinimized ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-6 w-6 p-0 hover:bg-destructive/20"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          
          <AnimatePresence>
            {!isMinimized && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <CardContent className="space-y-4">
                  <div className="text-xs text-muted-foreground">
                    I notice you're creating a course about <span className="text-primary font-medium">"{courseTitle}"</span>. 
                    Let me help you build something amazing! 🚀
                  </div>

                  {isAIEnabled() && (
                    <Button
                      onClick={handleGenerateCourse}
                      disabled={isGenerating || !courseTitle.trim()}
                      variant="hero"
                      size="sm"
                      className="w-full"
                    >
                      {isGenerating ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Generating...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Sparkles className="w-3 h-3" />
                          <span>Generate Complete Course</span>
                          <ArrowRight className="w-3 h-3" />
                        </div>
                      )}
                    </Button>
                  )}

                  {suggestions.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-1">
                        <Lightbulb className="w-3 h-3 text-yellow-400" />
                        <span className="text-xs font-medium">Smart Suggestions:</span>
                      </div>
                      <div className="space-y-1">
                        {suggestions.slice(0, 2).map((suggestion, index) => (
                          <div key={index} className="text-xs text-muted-foreground bg-background/30 rounded p-2">
                            • {suggestion}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs">
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-xs">
                      <MessageSquare className="w-2 h-2 mr-1" />
                      AI-Powered
                    </Badge>
                    <span className="text-muted-foreground">Press ESC to close</span>
                  </div>

                  {!isAIEnabled() && (
                    <div className="text-xs text-yellow-400 bg-yellow-400/10 rounded p-2 border border-yellow-400/20">
                      ⚡ Enable AI features by adding your OpenAI API key to unlock powerful course generation!
                    </div>
                  )}
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

export default AIAssistantPopup;