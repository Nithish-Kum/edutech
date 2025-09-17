import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/enhanced-button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  CheckCircle,
  Play,
  Pause,
  MessageCircle,
  Code,
  ExternalLink,
  Lightbulb,
  Target,
  FileText,
  Send,
  RefreshCw,
  Volume2,
  VolumeX
} from "lucide-react";
import { LessonContent, askQuestion, generateLessonContent } from "@/lib/ai";
import MasterAvatarSystem from "../3d/MasterAvatarSystem";

interface LessonViewerProps {
  lesson: {
    id: string;
    title: string;
    content?: LessonContent;
    moduleTitle: string;
    courseDifficulty: string;
    topicName: string;
  };
  onComplete: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  isCompleted?: boolean;
}

const LessonViewer = ({ 
  lesson, 
  onComplete, 
  onNext, 
  onPrevious, 
  isCompleted = false 
}: LessonViewerProps) => {
  const [content, setContent] = useState<LessonContent | null>(lesson.content || null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("content");
  const [currentExercise, setCurrentExercise] = useState(0);
  const [exerciseAnswers, setExerciseAnswers] = useState<Record<number, string>>({});
  const [showExerciseResults, setShowExerciseResults] = useState<Record<number, boolean>>({});
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isAskingAI, setIsAskingAI] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);

  // Check speech synthesis support
  useEffect(() => {
    setSpeechSupported('speechSynthesis' in window);
  }, []);

  // Generate content if not provided
  useEffect(() => {
    const generateContent = async () => {
      if (!content && lesson.topicName) {
        setIsGenerating(true);
        try {
          const generated = await generateLessonContent(
            lesson.topicName,
            lesson.moduleTitle,
            lesson.courseDifficulty
          );
          if (generated) {
            setContent(generated);
          } else {
            // Fallback content
            setContent(getFallbackContent());
          }
        } catch (error) {
          console.error("Error generating lesson content:", error);
          setContent(getFallbackContent());
        } finally {
          setIsGenerating(false);
        }
      }
    };

    generateContent();
  }, [lesson, content]);

  const getFallbackContent = (): LessonContent => ({
    introduction: `Welcome to ${lesson.title}! This lesson will cover the key concepts and practical applications.`,
    learningObjectives: [
      `Understand the fundamentals of ${lesson.topicName}`,
      "Apply concepts to real-world scenarios",
      "Complete hands-on exercises"
    ],
    content: {
      explanation: `${lesson.topicName} is an important concept that forms the foundation of ${lesson.moduleTitle}. In this lesson, we'll explore its key aspects and learn how to implement it effectively.`,
      keyPoints: [
        `Core principles of ${lesson.topicName}`,
        "Best practices and common patterns",
        "Real-world applications and use cases"
      ],
      examples: [
        {
          title: "Basic Example",
          description: `Here's a simple example of ${lesson.topicName} in action.`,
          code: "// Example code will be generated based on the topic",
          language: "javascript"
        }
      ]
    },
    exercises: [
      {
        question: `Which of the following best describes ${lesson.topicName}?`,
        type: "multiple-choice",
        options: ["Option A", "Option B", "Option C", "Option D"],
        correctAnswer: "Option A",
        explanation: "This is the correct answer because..."
      }
    ],
    resources: [
      {
        title: `Learn more about ${lesson.topicName}`,
        type: "documentation",
        url: "#",
        description: "Additional resources for deeper learning"
      }
    ]
  });

  const handleAskAI = async () => {
    if (!aiQuestion.trim() || !content) return;
    
    setIsAskingAI(true);
    setIsListening(true);
    
    try {
      const context = `
        Lesson: ${lesson.title}
        Topic: ${lesson.topicName}
        Introduction: ${content.introduction}
        Key Points: ${content.content.keyPoints.join(", ")}
        Current explanation: ${content.content.explanation}
      `;
      
      const response = await askQuestion(context, aiQuestion);
      setAiResponse(response || "I'm sorry, I couldn't process that question right now.");
      setIsSpeaking(true);
      
      // Text-to-speech if supported
      if (speechSupported && response) {
        const utterance = new SpeechSynthesisUtterance(response);
        utterance.onend = () => setIsSpeaking(false);
        speechSynthesis.speak(utterance);
      }
    } catch (error) {
      setAiResponse("I encountered an error while processing your question. Please try again.");
    } finally {
      setIsAskingAI(false);
      setIsListening(false);
      if (!speechSupported) {
        setIsSpeaking(false);
      }
    }
  };

  const handleExerciseAnswer = (exerciseIndex: number, answer: string) => {
    setExerciseAnswers(prev => ({ ...prev, [exerciseIndex]: answer }));
  };

  const checkExerciseAnswer = (exerciseIndex: number) => {
    setShowExerciseResults(prev => ({ ...prev, [exerciseIndex]: true }));
  };

  const speakText = (text: string) => {
    if (speechSupported) {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setIsSpeaking(false);
      speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if (speechSupported) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-background relative">
        {/* AI Professor Avatar Background */}
        <div className="absolute inset-0 opacity-20">
          <MasterAvatarSystem 
            isListening={true}
            currentTopic={lesson.topicName}
          />
        </div>
        
        <div className="relative z-10 container mx-auto px-6 py-12 flex items-center justify-center min-h-screen">
          <Card className="glass-morphism border-white/20 p-8 text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
            <h3 className="text-xl font-semibold text-gradient mb-2">
              Generating Lesson Content
            </h3>
            <p className="text-muted-foreground">
              Our AI Professor is creating personalized learning materials for "{lesson.title}"...
            </p>
          </Card>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="container mx-auto px-6 py-12">
        <Card className="glass-morphism border-white/20 p-8 text-center">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">Content Not Available</h3>
          <p className="text-muted-foreground">
            We're sorry, but the lesson content couldn't be loaded at this time.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      {/* AI Professor Avatar Background */}
      <div className="absolute inset-0 opacity-30">
        <MasterAvatarSystem 
          isListening={isListening}
          isSpeaking={isSpeaking}
          currentTopic={lesson.topicName}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-4 gap-6">
          
          {/* Main Lesson Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Header */}
            <Card className="glass-morphism border-white/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl text-gradient flex items-center">
                      <BookOpen className="w-6 h-6 mr-2" />
                      {lesson.title}
                    </CardTitle>
                    <p className="text-muted-foreground mt-1">{lesson.moduleTitle}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {speechSupported && (
                      <Button
                        variant="glass"
                        size="sm"
                        onClick={() => isSpeaking ? stopSpeaking() : speakText(content.introduction)}
                      >
                        {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      </Button>
                    )}
                    {isCompleted && (
                      <Badge variant="default" className="bg-green-500">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Completed
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Lesson Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="glass-morphism grid grid-cols-4">
                <TabsTrigger value="content">📖 Content</TabsTrigger>
                <TabsTrigger value="examples">💡 Examples</TabsTrigger>
                <TabsTrigger value="exercises">🎯 Exercises</TabsTrigger>
                <TabsTrigger value="resources">🔗 Resources</TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="space-y-6">
                {/* Introduction */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card className="glass-morphism border-white/20">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Target className="w-5 h-5 mr-2 text-primary" />
                        Introduction
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-foreground leading-relaxed">{content.introduction}</p>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Learning Objectives */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <Card className="glass-morphism border-white/20">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Lightbulb className="w-5 h-5 mr-2 text-yellow-400" />
                        Learning Objectives
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {content.learningObjectives.map((objective, index) => (
                          <li key={index} className="flex items-start">
                            <div className="w-2 h-2 rounded-full bg-primary mt-2 mr-3 flex-shrink-0" />
                            <span className="text-foreground">{objective}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Main Explanation */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Card className="glass-morphism border-white/20">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <FileText className="w-5 h-5 mr-2 text-blue-400" />
                        Detailed Explanation
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-foreground leading-relaxed">
                        {content.content.explanation}
                      </p>
                      
                      <div>
                        <h4 className="font-semibold text-foreground mb-3">Key Points:</h4>
                        <div className="grid gap-2">
                          {content.content.keyPoints.map((point, index) => (
                            <div key={index} className="flex items-start p-3 bg-primary/10 rounded-lg">
                              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                                <span className="text-xs font-medium text-primary">{index + 1}</span>
                              </div>
                              <span className="text-foreground">{point}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </TabsContent>

              <TabsContent value="examples" className="space-y-6">
                <div className="grid gap-6">
                  {content.content.examples.map((example, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <Card className="glass-morphism border-white/20">
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <Code className="w-5 h-5 mr-2 text-green-400" />
                            {example.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <p className="text-foreground">{example.description}</p>
                          
                          {example.code && (
                            <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-xs text-gray-400 uppercase">
                                  {example.language || "Code"}
                                </span>
                                <Button 
                                  variant="glass" 
                                  size="sm"
                                  onClick={() => navigator.clipboard.writeText(example.code!)}
                                >
                                  Copy
                                </Button>
                              </div>
                              <pre className="text-sm text-gray-100 whitespace-pre-wrap">
                                <code>{example.code}</code>
                              </pre>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="exercises" className="space-y-6">
                <div className="grid gap-6">
                  {content.exercises.map((exercise, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <Card className="glass-morphism border-white/20">
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <Target className="w-5 h-5 mr-2 text-orange-400" />
                            Exercise {index + 1}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <p className="text-foreground font-medium">{exercise.question}</p>
                          
                          {exercise.type === "multiple-choice" && exercise.options && (
                            <div className="space-y-2">
                              {exercise.options.map((option, optionIndex) => (
                                <Button
                                  key={optionIndex}
                                  variant={exerciseAnswers[index] === option ? "electric" : "glass"}
                                  className="w-full justify-start"
                                  onClick={() => handleExerciseAnswer(index, option)}
                                >
                                  {option}
                                </Button>
                              ))}
                            </div>
                          )}

                          {exercise.type === "text" && (
                            <Input
                              placeholder="Type your answer here..."
                              value={exerciseAnswers[index] || ""}
                              onChange={(e) => handleExerciseAnswer(index, e.target.value)}
                              className="glass-morphism border-white/20"
                            />
                          )}

                          <div className="flex items-center justify-between">
                            <Button
                              onClick={() => checkExerciseAnswer(index)}
                              variant="neural"
                              disabled={!exerciseAnswers[index]}
                            >
                              Check Answer
                            </Button>

                            {showExerciseResults[index] && (
                              <div className="flex items-center space-x-2">
                                {exerciseAnswers[index] === exercise.correctAnswer ? (
                                  <Badge variant="default" className="bg-green-500">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Correct!
                                  </Badge>
                                ) : (
                                  <Badge variant="destructive">
                                    Try again
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>

                          {showExerciseResults[index] && exercise.explanation && (
                            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                              <p className="text-sm text-foreground">
                                <strong>Explanation:</strong> {exercise.explanation}
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="resources" className="space-y-6">
                <div className="grid gap-4">
                  {content.resources.map((resource, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <Card className="glass-morphism border-white/20 hover:bg-white/10 transition-smooth">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <h4 className="font-semibold text-foreground flex items-center">
                                <ExternalLink className="w-4 h-4 mr-2 text-primary" />
                                {resource.title}
                              </h4>
                              <p className="text-sm text-muted-foreground">{resource.description}</p>
                              <Badge variant="outline" className="text-xs">
                                {resource.type}
                              </Badge>
                            </div>
                            <Button variant="glass" size="sm" asChild>
                              <a href={resource.url} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Navigation */}
            <Card className="glass-morphism border-white/20">
              <CardHeader>
                <CardTitle className="text-sm">Lesson Navigation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-col space-y-2">
                  {onPrevious && (
                    <Button variant="glass" onClick={onPrevious} className="w-full">
                      ← Previous Lesson
                    </Button>
                  )}
                  
                  {!isCompleted && (
                    <Button variant="hero" onClick={onComplete} className="w-full">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Complete Lesson
                    </Button>
                  )}
                  
                  {onNext && (
                    <Button variant="neural" onClick={onNext} className="w-full">
                      Next Lesson →
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* AI Professor Chat */}
            <Card className="glass-morphism border-white/20">
              <CardHeader>
                <CardTitle className="text-sm flex items-center">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Ask AI Professor
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Input
                    placeholder="Ask a question about this lesson..."
                    value={aiQuestion}
                    onChange={(e) => setAiQuestion(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAskAI()}
                    className="glass-morphism border-white/20 text-sm"
                  />
                  <Button 
                    onClick={handleAskAI} 
                    disabled={!aiQuestion.trim() || isAskingAI}
                    variant="electric"
                    size="sm"
                    className="w-full"
                  >
                    {isAskingAI ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    Ask Question
                  </Button>
                </div>
                
                {aiResponse && (
                  <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                    <p className="text-sm text-foreground leading-relaxed">
                      {aiResponse}
                    </p>
                    {speechSupported && (
                      <Button 
                        variant="glass" 
                        size="sm" 
                        className="mt-2"
                        onClick={() => speakText(aiResponse)}
                      >
                        <Volume2 className="w-3 h-3 mr-1" />
                        Listen
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonViewer;