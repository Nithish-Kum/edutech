import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/enhanced-button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Sparkles, 
  Send, 
  BookOpen, 
  Clock, 
  Target, 
  Users, 
  PlayCircle,
  Brain,
  MessageSquare,
  Lightbulb,
  Save,
  Edit,
  Trash2,
  Plus,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/context/AuthProvider";
import { isAIEnabled } from "@/lib/ai";

interface ConversationMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  type?: 'text' | 'course_preview' | 'course_generated';
  courseData?: GeneratedCourse;
}

interface GeneratedCourse {
  id: string;
  title: string;
  description: string;
  modules: Array<{
    id: string;
    title: string;
    duration: string;
    topics: string[];
    lessons?: Array<{
      id: string;
      title: string;
      content: string;
      exercises?: Array<{
        question: string;
        type: 'multiple-choice' | 'coding' | 'text';
        options?: string[];
        correctAnswer?: string;
      }>;
    }>;
  }>;
  estimatedDuration: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  category: string;
  learningObjectives: string[];
  prerequisites: string[];
  targetAudience: string;
}

interface EnhancedCourseGeneratorProps {
  onCourseCreated?: (course: GeneratedCourse) => void;
}

const EnhancedCourseGenerator = ({ onCourseCreated }: EnhancedCourseGeneratorProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [messages, setMessages] = useState<ConversationMessage[]>([
    {
      id: "welcome",
      content: "Hello! I'm your AI Course Creator. I can help you build comprehensive, personalized courses on any topic. Just tell me what you'd like to learn or teach, and I'll guide you through creating the perfect course.\n\nFor example, you could say:\n• \"Create a course on React development for beginners\"\n• \"I want to teach data science to marketing professionals\"\n• \"Build a photography course focusing on portrait techniques\"",
      isUser: false,
      timestamp: new Date(),
      type: 'text'
    }
  ]);
  
  const [inputMessage, setInputMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentCourse, setCurrentCourse] = useState<GeneratedCourse | null>(null);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addMessage = (content: string, isUser: boolean, type: ConversationMessage['type'] = 'text', courseData?: GeneratedCourse) => {
    const newMessage: ConversationMessage = {
      id: Date.now().toString(),
      content,
      isUser,
      timestamp: new Date(),
      type,
      courseData
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const generateCourseWithAI = async (prompt: string): Promise<GeneratedCourse | null> => {
    if (!isAIEnabled()) {
      return generateFallbackCourse(prompt);
    }

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `You are an expert course designer and educator. Create comprehensive, engaging courses based on user requests. Always respond with valid JSON in this exact format:

{
  "title": "Course Title",
  "description": "Detailed course description",
  "category": "Category name",
  "difficulty": "Beginner|Intermediate|Advanced",
  "estimatedDuration": "X hours",
  "targetAudience": "Who this course is for",
  "learningObjectives": ["Objective 1", "Objective 2", "Objective 3"],
  "prerequisites": ["Prerequisite 1", "Prerequisite 2"],
  "modules": [
    {
      "id": "module-1",
      "title": "Module Title",
      "duration": "X hours",
      "topics": ["Topic 1", "Topic 2", "Topic 3"],
      "lessons": [
        {
          "id": "lesson-1",
          "title": "Lesson Title",
          "content": "Detailed lesson content with explanations, examples, and key concepts",
          "exercises": [
            {
              "question": "Exercise question",
              "type": "multiple-choice|coding|text",
              "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
              "correctAnswer": "Correct option"
            }
          ]
        }
      ]
    }
  ]
}

Make courses practical, engaging, and comprehensive. Include real-world examples and hands-on exercises.`
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 4000
        }),
      });

      const data = await response.json();
      const content = data?.choices?.[0]?.message?.content;
      
      if (!content) {
        throw new Error("No content received from AI");
      }

      // Extract JSON from the response
      const start = content.indexOf("{");
      const end = content.lastIndexOf("}");
      const jsonStr = start >= 0 && end >= 0 ? content.slice(start, end + 1) : content;
      
      const courseData = JSON.parse(jsonStr);
      
      // Add unique ID
      courseData.id = `course-${Date.now()}`;
      
      // Ensure all required fields exist
      if (!courseData.modules || !Array.isArray(courseData.modules)) {
        throw new Error("Invalid course structure");
      }

      return courseData as GeneratedCourse;
    } catch (error) {
      console.error("AI generation error:", error);
      return generateFallbackCourse(prompt);
    }
  };

  const generateFallbackCourse = (prompt: string): GeneratedCourse => {
    const topic = prompt.toLowerCase().includes("course") 
      ? prompt.split("course")[0].trim() || "Programming"
      : prompt.split(" ").slice(0, 2).join(" ") || "Programming";

    return {
      id: `course-${Date.now()}`,
      title: `Complete ${topic} Mastery`,
      description: `A comprehensive course covering all essential aspects of ${topic.toLowerCase()}, designed for practical skill development and real-world application.`,
      category: "Technology",
      difficulty: "Intermediate",
      estimatedDuration: "15 hours",
      targetAudience: `Anyone interested in learning ${topic}`,
      learningObjectives: [
        `Understand core concepts of ${topic}`,
        `Apply practical techniques and best practices`,
        `Build real-world projects using ${topic}`,
        `Master advanced techniques and optimization`
      ],
      prerequisites: ["Basic computer skills", "Willingness to learn"],
      modules: [
        {
          id: "module-1",
          title: `${topic} Fundamentals`,
          duration: "4 hours",
          topics: ["Core Concepts", "Basic Principles", "Getting Started", "Environment Setup"],
          lessons: [
            {
              id: "lesson-1",
              title: "Introduction and Overview",
              content: `Welcome to ${topic}! In this lesson, you'll learn the fundamental concepts and understand why ${topic} is important in today's world.`,
              exercises: [
                {
                  question: `What is the primary purpose of ${topic}?`,
                  type: "text" as const
                }
              ]
            }
          ]
        },
        {
          id: "module-2",
          title: `Practical ${topic} Applications`,
          duration: "6 hours",
          topics: ["Hands-on Practice", "Real-world Examples", "Common Patterns", "Problem Solving"],
          lessons: [
            {
              id: "lesson-2",
              title: "Hands-on Practice Session",
              content: `Now that you understand the basics, let's dive into practical applications of ${topic}.`,
              exercises: [
                {
                  question: "Complete a practical exercise applying what you've learned",
                  type: "coding" as const
                }
              ]
            }
          ]
        },
        {
          id: "module-3",
          title: `Advanced ${topic} Techniques`,
          duration: "3 hours",
          topics: ["Advanced Concepts", "Best Practices", "Performance Optimization", "Troubleshooting"],
        },
        {
          id: "module-4",
          title: "Capstone Project",
          duration: "2 hours",
          topics: ["Project Planning", "Implementation", "Testing", "Deployment"]
        }
      ]
    };
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isGenerating) return;

    const userMessage = inputMessage.trim();
    setInputMessage("");
    addMessage(userMessage, true);
    setIsGenerating(true);

    try {
      // Check if user wants to create/generate a course
      const isGenerationRequest = userMessage.toLowerCase().includes("create") ||
                                 userMessage.toLowerCase().includes("generate") ||
                                 userMessage.toLowerCase().includes("build") ||
                                 userMessage.toLowerCase().includes("course") ||
                                 userMessage.toLowerCase().includes("teach") ||
                                 userMessage.toLowerCase().includes("learn");

      if (isGenerationRequest) {
        addMessage("Great! I'm generating a comprehensive course for you. This will take a moment...", false);
        
        const course = await generateCourseWithAI(userMessage);
        
        if (course) {
          setCurrentCourse(course);
          addMessage("Perfect! I've created a comprehensive course for you. Here's what I've prepared:", false, 'course_generated', course);
        } else {
          addMessage("I encountered an issue generating your course. Let me try with a simpler structure...", false);
        }
      } else {
        // Handle general conversation
        const response = await generateConversationResponse(userMessage);
        addMessage(response, false);
      }
    } catch (error) {
      console.error("Error processing message:", error);
      addMessage("I apologize, but I encountered an error. Please try rephrasing your request or be more specific about what kind of course you'd like to create.", false);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateConversationResponse = async (message: string): Promise<string> => {
    // Simple conversation responses for non-course generation
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes("hello") || lowerMessage.includes("hi")) {
      return "Hello! I'm excited to help you create an amazing course. What topic would you like to build a course about?";
    }
    
    if (lowerMessage.includes("help")) {
      return "I can help you create comprehensive courses on any topic! Just tell me:\n\n• What subject you want to teach or learn\n• Who your target audience is (beginners, professionals, etc.)\n• Any specific requirements or focus areas\n\nFor example: 'Create a beginner-friendly course on web development' or 'I want to teach advanced data analysis to business analysts'";
    }
    
    return "I'd love to help you create a course! Please tell me what topic you'd like to build a course about, and I'll generate a comprehensive learning experience for you.";
  };

  const saveCourse = async (course: GeneratedCourse) => {
    try {
      if (user) {
        const { error } = await supabase.from("courses").insert({
          user_id: user.id,
          title: course.title,
          description: course.description,
          difficulty: course.difficulty,
          estimated_duration: course.estimatedDuration,
          modules: course.modules,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        
        if (error) throw error;
        
        addMessage("🎉 Course saved successfully! You can find it in your course library.", false);
        onCourseCreated?.(course);
      } else {
        // Save to localStorage for non-authenticated users
        const existing = JSON.parse(localStorage.getItem("courses") || "[]");
        existing.push(course);
        localStorage.setItem("courses", JSON.stringify(existing));
        
        addMessage("🎉 Course saved locally! Sign up to sync across devices.", false);
        onCourseCreated?.(course);
      }
    } catch (error) {
      console.error("Error saving course:", error);
      addMessage("❌ Sorry, there was an error saving your course. Please try again.", false);
    }
  };

  const CoursePreview = ({ course }: { course: GeneratedCourse }) => (
    <Card className="glass-morphism border-white/20 mt-4">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <BookOpen className="w-6 h-6 text-primary" />
            <span className="text-gradient">{course.title}</span>
          </div>
          <div className="flex space-x-2">
            <Button variant="glass" size="sm" onClick={() => saveCourse(course)}>
              <Save className="w-4 h-4 mr-1" />
              Save Course
            </Button>
            <Button variant="glass" size="sm" onClick={() => navigate(`/course/${course.id}`)}>
              <PlayCircle className="w-4 h-4 mr-1" />
              Start Learning
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <p className="text-muted-foreground">{course.description}</p>
        
        {/* Course Stats */}
        <div className="flex flex-wrap gap-4 text-sm">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
            <Clock className="w-3 h-3 mr-1" />
            {course.estimatedDuration}
          </Badge>
          <Badge variant="outline" className="bg-secondary/10 text-secondary border-secondary/30">
            <Target className="w-3 h-3 mr-1" />
            {course.difficulty}
          </Badge>
          <Badge variant="outline" className="bg-accent/10 text-accent border-accent/30">
            <Users className="w-3 h-3 mr-1" />
            {course.targetAudience}
          </Badge>
          <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30">
            <BookOpen className="w-3 h-3 mr-1" />
            {course.modules.length} Modules
          </Badge>
        </div>

        {/* Learning Objectives */}
        <div>
          <h4 className="font-semibold mb-2 flex items-center">
            <Lightbulb className="w-4 h-4 mr-2 text-yellow-400" />
            Learning Objectives
          </h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            {course.learningObjectives.map((objective, index) => (
              <li key={index}>{objective}</li>
            ))}
          </ul>
        </div>

        {/* Course Modules */}
        <div>
          <h4 className="font-semibold mb-3 flex items-center">
            <BookOpen className="w-4 h-4 mr-2 text-primary" />
            Course Modules
          </h4>
          <div className="space-y-2">
            {course.modules.map((module, index) => (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="glass-morphism border-white/10">
                  <CardContent className="p-4">
                    <div 
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => setExpandedModule(expandedModule === module.id ? null : module.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                          {index + 1}
                        </div>
                        <div>
                          <h5 className="font-medium">{module.title}</h5>
                          <p className="text-xs text-muted-foreground">{module.duration}</p>
                        </div>
                      </div>
                      {expandedModule === module.id ? 
                        <ChevronUp className="w-4 h-4" /> : 
                        <ChevronDown className="w-4 h-4" />
                      }
                    </div>
                    
                    <AnimatePresence>
                      {expandedModule === module.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-3 pt-3 border-t border-white/10"
                        >
                          <div className="flex flex-wrap gap-1 mb-2">
                            {module.topics.map((topic, topicIndex) => (
                              <Badge key={topicIndex} variant="outline" className="text-xs">
                                {topic}
                              </Badge>
                            ))}
                          </div>
                          
                          {module.lessons && (
                            <div className="space-y-1">
                              <p className="text-xs font-medium text-muted-foreground">Lessons:</p>
                              {module.lessons.map((lesson, lessonIndex) => (
                                <div key={lesson.id} className="text-xs text-muted-foreground pl-2">
                                  • {lesson.title}
                                </div>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="flex justify-center mb-4">
          <div className="p-4 gradient-neural rounded-full">
            <Brain className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-gradient mb-2">
          AI Course Generator
        </h2>
        <p className="text-muted-foreground">
          Conversational AI that creates comprehensive courses tailored to your needs
        </p>
      </motion.div>

      {/* Chat Interface */}
      <Card className="glass-morphism border-white/20 h-[600px] flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            <span>Course Creation Chat</span>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-0">
          {/* Messages */}
          <ScrollArea className="flex-1 px-6">
            <div className="space-y-4 py-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] ${
                    message.isUser 
                      ? 'bg-primary text-primary-foreground' 
                      : 'glass-morphism border-white/20'
                  } rounded-lg p-4`}>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    
                    {message.type === 'course_generated' && message.courseData && (
                      <CoursePreview course={message.courseData} />
                    )}
                    
                    <p className={`text-xs mt-2 ${
                      message.isUser ? 'text-primary-foreground/70' : 'text-muted-foreground'
                    }`}>
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </motion.div>
              ))}
              
              {isGenerating && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="glass-morphism border-white/20 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                      <span className="text-muted-foreground ml-2">Generating response...</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
            <div ref={messagesEndRef} />
          </ScrollArea>
          
          {/* Input */}
          <div className="border-t border-white/20 p-6">
            <div className="flex space-x-3">
              <Input
                placeholder="Tell me what kind of course you'd like to create..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="glass-morphism border-white/20"
                disabled={isGenerating}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isGenerating}
                variant="hero"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedCourseGenerator;