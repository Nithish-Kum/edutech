import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/enhanced-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Mic, 
  Volume2, 
  MessageSquare, 
  Brain, 
  Pause, 
  Play,
  RotateCcw,
  Settings,
  Zap
} from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import { askQuestion, isAIEnabled } from "@/lib/ai";

interface ProfessorControlsProps {
  isListening: boolean;
  isSpeaking: boolean;
  currentTopic?: string;
  onStartListening: () => void;
  onStopListening: () => void;
  onStartSpeaking: () => void;
  onStopSpeaking: () => void;
  onAskQuestion: () => void;
  onReset: () => void;
  onUpdateTopic?: (topic: string) => void;
}

const ProfessorControls = ({
  isListening,
  isSpeaking,
  currentTopic,
  onStartListening,
  onStopListening,
  onStartSpeaking,
  onStopSpeaking,
  onAskQuestion,
  onReset,
  onUpdateTopic
}: ProfessorControlsProps) => {
  const { saveMessage } = useAuth();
  const [selectedQuestion, setSelectedQuestion] = useState<string>("");
  const [lessonStep, setLessonStep] = useState<number>(0);

  const quickQuestions = [
    "Explain this topic in simple terms",
    "Give me a practical example",
    "What are the key takeaways?",
    "How do I implement this?",
    "What are common mistakes to avoid?",
    "Show me the next steps"
  ];

  const professorResponses = [
    "Great question! Let me break this down for you...",
    "That's an excellent point to explore further...",
    "I'm glad you asked about that - it's crucial to understand...",
    "Let me demonstrate this with a real-world example...",
    "This is where many students get confused, so let's clarify...",
    "Perfect timing for this question - it connects to what we just learned..."
  ];

  const handleQuickQuestion = async (question: string) => {
    setSelectedQuestion(question);
    saveMessage({ role: "user", content: question }).catch(() => {});
    onAskQuestion();
    let answer: string | null = null;
    if (isAIEnabled()) {
      const context = `${currentTopic ?? ""}`;
      answer = await askQuestion(context, question);
    }
    if (!answer) {
      answer = professorResponses[Math.floor(Math.random() * professorResponses.length)];
    }
    onStartSpeaking();
    setTimeout(() => {
      onStopSpeaking();
      saveMessage({ role: "assistant", content: answer as string }).catch(() => {});
    }, 2000);
  };

  const lessonOutline = [
    "Introduction & objectives",
    "Core concepts overview",
    "Hands-on demo",
    "Common pitfalls",
    "Recap & next steps"
  ];

  const startLesson = () => {
    setLessonStep(0);
    const label = `${currentTopic ?? "Topic"}: ${lessonOutline[0]}`;
    onUpdateTopic?.(label);
    onStartSpeaking();
    setTimeout(() => onStopSpeaking(), 2500);
  };

  const nextLessonStep = () => {
    setLessonStep((prev) => {
      const next = Math.min(prev + 1, lessonOutline.length - 1);
      const label = `${currentTopic ?? "Topic"}: ${lessonOutline[next]}`;
      onUpdateTopic?.(label);
      onStartSpeaking();
      setTimeout(() => onStopSpeaking(), 2500);
      return next;
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      {/* Status Display */}
      <Card className="glass-morphism border-white/20">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-primary" />
            <span>Professor Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Current State:</span>
            <Badge 
              variant={isListening ? "default" : isSpeaking ? "secondary" : "outline"}
              className={`
                ${isListening ? "bg-electric-blue animate-pulse" : ""}
                ${isSpeaking ? "bg-neural-purple animate-pulse" : ""}
              `}
            >
              {isListening ? (
                <>
                  <Mic className="w-3 h-3 mr-1" />
                  Listening
                </>
              ) : isSpeaking ? (
                <>
                  <Volume2 className="w-3 h-3 mr-1" />
                  Speaking
                </>
              ) : (
                <>
                  <Zap className="w-3 h-3 mr-1" />
                  Ready
                </>
              )}
            </Badge>
          </div>
          
          {currentTopic && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Topic:</span>
              <Badge variant="outline" className="bg-quantum-green/20 text-quantum-green">
                {currentTopic}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Controls */}
      <Card className="glass-morphism border-white/20">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-primary" />
            <span>Voice Interaction</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant={isListening ? "electric" : "glass"}
              onClick={isListening ? onStopListening : onStartListening}
              disabled={isSpeaking}
              className="w-full"
            >
              {isListening ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Stop Listening
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 mr-2" />
                  Start Listening
                </>
              )}
            </Button>

            <Button
              variant={isSpeaking ? "neural" : "glass"}
              onClick={isSpeaking ? onStopSpeaking : onStartSpeaking}
              disabled={isListening}
              className="w-full"
            >
              {isSpeaking ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Stop Speaking
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 mr-2" />
                  Demo Speech
                </>
              )}
            </Button>
          </div>

          <Button
            variant="glass"
            onClick={onReset}
            className="w-full"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset Professor
          </Button>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="electric" onClick={startLesson} disabled={isListening || isSpeaking}>
              <Play className="w-4 h-4 mr-2" /> Start Lesson
            </Button>
            <Button variant="glass" onClick={nextLessonStep} disabled={isListening || isSpeaking}>
              <Play className="w-4 h-4 mr-2" /> Next Concept
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">Lesson step: {lessonStep + 1} / {lessonOutline.length}</p>
        </CardContent>
      </Card>

      {/* Quick Questions */}
      <Card className="glass-morphism border-white/20">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            <span>Quick Questions</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {quickQuestions.map((question, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                variant="glass"
                onClick={() => handleQuickQuestion(question)}
                className="w-full text-left justify-start h-auto py-3 px-4"
                disabled={isListening || isSpeaking}
              >
                <span className="text-sm">{question}</span>
              </Button>
            </motion.div>
          ))}
        </CardContent>
      </Card>

      {/* Response Display */}
      <AnimatePresence>
        {selectedQuestion && isSpeaking && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="glass-morphism border-primary/30 bg-primary/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-primary">
                  Professor Response
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground/90 mb-2 font-medium">
                  Q: {selectedQuestion}
                </p>
                <p className="text-sm text-muted-foreground">
                  A: {professorResponses[Math.floor(Math.random() * professorResponses.length)]}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ProfessorControls;