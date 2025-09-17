import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/enhanced-button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { 
  BookOpen, 
  Plus, 
  X,
  Clock, 
  Target, 
  Lightbulb,
  ChevronRight,
  ChevronLeft,
  Save,
  Sparkles,
  FileText,
  Users,
  Settings
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/context/AuthProvider";
import { generateCourseOutline, isAIEnabled } from "@/lib/ai";

interface Module {
  id: string;
  title: string;
  duration: string;
  topics: string[];
  description?: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
  modules: Module[];
  estimatedDuration: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  category?: string;
  instructor?: string;
  rating?: number;
  studentsCount?: number;
  createdAt?: string;
  progress?: number;
  thumbnail?: string;
  tags?: string[];
}

interface CourseCreatorProps {
  onCourseCreated: (course: Course) => void;
  onClose: () => void;
  editCourse?: Course;
}

const CourseCreator = ({ onCourseCreated, onClose, editCourse }: CourseCreatorProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();

  // Course data state
  const [courseData, setCourseData] = useState({
    title: editCourse?.title || "",
    description: editCourse?.description || "",
    category: editCourse?.category || "",
    difficulty: editCourse?.difficulty || "Intermediate" as const,
    estimatedDuration: editCourse?.estimatedDuration || "",
    tags: editCourse?.tags || [],
    modules: editCourse?.modules || [] as Module[]
  });

  const [newTag, setNewTag] = useState("");
  const [newModule, setNewModule] = useState({
    title: "",
    duration: "",
    description: "",
    topics: [] as string[]
  });
  const [newTopic, setNewTopic] = useState("");

  const categories = [
    "Programming", "Design", "Business", "Science", "Mathematics", 
    "Languages", "Arts", "Health", "Technology", "Other"
  ];

  const steps = [
    { title: "Basic Info", description: "Course title and description" },
    { title: "Details", description: "Category, difficulty, and tags" },
    { title: "Modules", description: "Add course modules and topics" },
    { title: "Review", description: "Review and save your course" }
  ];

  const generateDetailedLessonContent = async (moduleTitle: string, topics: string[], difficulty: string) => {
    if (!isAIEnabled()) return null;
    
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
              content: `You are an expert educational content creator. Create comprehensive lesson content for a module titled "${moduleTitle}" covering these topics: ${topics.join(", ")}. 
              
              Return ONLY valid JSON in this format:
              {
                "lessons": [
                  {
                    "id": "lesson-1",
                    "title": "Lesson Title",
                    "content": "Detailed lesson content with explanations, examples, and step-by-step instructions. Make it comprehensive and educational.",
                    "learningObjectives": ["Objective 1", "Objective 2"],
                    "keyPoints": ["Point 1", "Point 2"],
                    "examples": [
                      {
                        "title": "Example Title",
                        "description": "Example description with code if applicable",
                        "code": "code snippet if relevant"
                      }
                    ],
                    "exercises": [
                      {
                        "question": "Exercise question",
                        "type": "multiple-choice",
                        "options": ["A", "B", "C", "D"],
                        "correctAnswer": "A",
                        "explanation": "Why this is correct"
                      }
                    ]
                  }
                ]
              }
              
              Make content practical, engaging, and appropriate for ${difficulty} level students.`
            },
            {
              role: "user",
              content: `Create detailed lessons for module "${moduleTitle}" covering: ${topics.join(", ")}`
            }
          ],
          temperature: 0.7,
          max_tokens: 3000
        }),
      });

      const data = await response.json();
      const content = data?.choices?.[0]?.message?.content;
      
      if (!content) return null;

      const start = content.indexOf("{");
      const end = content.lastIndexOf("}");
      const jsonStr = start >= 0 && end >= 0 ? content.slice(start, end + 1) : content;
      
      return JSON.parse(jsonStr);
    } catch (error) {
      console.error("Error generating lesson content:", error);
      return null;
    }
  };

  const generateCourseWithAI = async () => {
    if (!courseData.title.trim() || !isAIEnabled() || courseData.modules.length === 0) return;
    
    setIsGenerating(true);
    try {
      // Generate detailed content for each existing module
      const enhancedModules = [];
      
      for (const module of courseData.modules) {
        const lessonContent = await generateDetailedLessonContent(
          module.title,
          module.topics,
          courseData.difficulty
        );
        
        const enhancedModule = {
          ...module,
          lessons: lessonContent?.lessons || [
            {
              id: `${module.id}-lesson-1`,
              title: `Introduction to ${module.title}`,
              content: `Welcome to the ${module.title} module. In this comprehensive section, you'll learn about ${module.topics.join(", ")}. This module is designed to provide you with practical, hands-on experience that you can apply immediately.\n\nKey areas we'll cover:\n${module.topics.map(topic => `• ${topic}`).join("\n")}\n\nBy the end of this module, you'll have a solid understanding of these concepts and be ready to move to the next level.`,
              learningObjectives: [
                `Understand core concepts of ${module.title}`,
                `Apply practical techniques and methods`,
                `Complete hands-on exercises and projects`
              ],
              keyPoints: module.topics,
              examples: [
                {
                  title: `Practical Example`,
                  description: `Here's a practical example demonstrating the concepts in ${module.title}`,
                  code: module.topics.some(t => t.toLowerCase().includes('code') || t.toLowerCase().includes('programming')) ? 
                    '// Example code snippet\nconsole.log("Hello World");' : undefined
                }
              ],
              exercises: [
                {
                  question: `What is the main purpose of ${module.title}?`,
                  type: "text",
                  explanation: "This helps reinforce the core concepts covered in this module."
                }
              ]
            }
          ]
        };
        
        enhancedModules.push(enhancedModule);
      }
      
      setCourseData(prev => ({
        ...prev,
        modules: enhancedModules
      }));
      
    } catch (error) {
      console.error("Error generating course content:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !courseData.tags.includes(newTag.trim())) {
      setCourseData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag("");
    }
  };

  const removeTag = (tag: string) => {
    setCourseData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const addModule = () => {
    if (!newModule.title.trim()) return;

    const module: Module = {
      id: `module-${Date.now()}`,
      title: newModule.title,
      duration: newModule.duration || "2 hours",
      topics: newModule.topics,
      description: newModule.description
    };

    setCourseData(prev => ({
      ...prev,
      modules: [...prev.modules, module]
    }));

    setNewModule({
      title: "",
      duration: "",
      description: "",
      topics: []
    });
  };

  const removeModule = (moduleId: string) => {
    setCourseData(prev => ({
      ...prev,
      modules: prev.modules.filter(m => m.id !== moduleId)
    }));
  };

  const addTopicToModule = () => {
    if (!newTopic.trim()) return;
    setNewModule(prev => ({
      ...prev,
      topics: [...prev.topics, newTopic.trim()]
    }));
    setNewTopic("");
  };

  const removeTopicFromModule = (topic: string) => {
    setNewModule(prev => ({
      ...prev,
      topics: prev.topics.filter(t => t !== topic)
    }));
  };

  const calculateTotalDuration = () => {
    const totalMinutes = courseData.modules.reduce((total, module) => {
      const duration = module.duration.toLowerCase();
      const hours = parseFloat(duration.match(/(\d+(?:\.\d+)?)\s*h/)?.[1] || "0");
      const minutes = parseFloat(duration.match(/(\d+)\s*m/)?.[1] || "0");
      return total + (hours * 60) + minutes;
    }, 0);

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${minutes}m`;
    }
  };

  const saveCourse = async () => {
    setIsSaving(true);
    try {
      const course: Course = {
        id: editCourse?.id || `course-${Date.now()}`,
        title: courseData.title,
        description: courseData.description,
        modules: courseData.modules,
        estimatedDuration: courseData.estimatedDuration || calculateTotalDuration(),
        difficulty: courseData.difficulty,
        category: courseData.category,
        tags: courseData.tags,
        instructor: user?.email || "AI Professor",
        createdAt: new Date().toISOString(),
        progress: 0
      };

      if (user) {
        // Save to Supabase
        const { error } = await supabase
          .from("courses")
          .upsert({
            id: course.id,
            user_id: user.id,
            title: course.title,
            description: course.description,
            difficulty: course.difficulty,
            estimated_duration: course.estimatedDuration,
            modules: course.modules,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (error) {
          console.error("Supabase error:", error);
          throw error;
        }
      } else {
        // Save to localStorage
        const existingCourses = JSON.parse(localStorage.getItem("courses") || "[]");
        const courseIndex = existingCourses.findIndex((c: Course) => c.id === course.id);
        
        if (courseIndex >= 0) {
          existingCourses[courseIndex] = course;
        } else {
          existingCourses.push(course);
        }
        
        localStorage.setItem("courses", JSON.stringify(existingCourses));
      }

      console.log("Course saved successfully:", course);
      onCourseCreated(course);
      
      // Show success message and close modal
      alert('Course created successfully! Check your course library.');
      onClose();
      
    } catch (error) {
      console.error("Error saving course:", error);
      alert(`Error saving course: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return courseData.title.trim() && courseData.description.trim();
      case 1:
        return courseData.category && courseData.difficulty;
      case 2:
        return courseData.modules.length > 0;
      case 3:
        return true;
      default:
        return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="title" className="text-sm font-medium">Course Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Complete React Development Bootcamp"
                value={courseData.title}
                onChange={(e) => setCourseData(prev => ({ ...prev, title: e.target.value }))}
                className="mt-2 glass-morphism border-white/20"
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-sm font-medium">Course Description *</Label>
              <textarea
                id="description"
                placeholder="Describe what students will learn in this course..."
                value={courseData.description}
                onChange={(e) => setCourseData(prev => ({ ...prev, description: e.target.value }))}
                className="mt-2 w-full p-3 rounded-md glass-morphism border-white/20 bg-background/50 text-foreground placeholder:text-muted-foreground resize-none"
                rows={4}
              />
            </div>

            {isAIEnabled() && courseData.title.trim() && (
              <Card className="glass-morphism border-primary/30 bg-primary/5">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium">AI Assistant</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Let AI help you create a complete course structure based on your title.
                  </p>
                  <Button
                    onClick={generateCourseWithAI}
                    disabled={isGenerating}
                    variant="electric"
                    size="sm"
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Lightbulb className="w-4 h-4 mr-2" />
                        Generate with AI
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-sm font-medium">Category</Label>
              <select
                value={courseData.category}
                onChange={(e) => setCourseData(prev => ({ ...prev, category: e.target.value }))}
                className="mt-2 w-full p-3 rounded-md glass-morphism border-white/20 bg-background/50"
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <Label className="text-sm font-medium">Difficulty Level</Label>
              <div className="mt-2 flex space-x-3">
                {(["Beginner", "Intermediate", "Advanced"] as const).map(level => (
                  <Button
                    key={level}
                    variant={courseData.difficulty === level ? "electric" : "glass"}
                    onClick={() => setCourseData(prev => ({ ...prev, difficulty: level }))}
                    className="flex-1"
                  >
                    {level}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Estimated Duration</Label>
              <Input
                placeholder="e.g., 40 hours, 2 weeks"
                value={courseData.estimatedDuration}
                onChange={(e) => setCourseData(prev => ({ ...prev, estimatedDuration: e.target.value }))}
                className="mt-2 glass-morphism border-white/20"
              />
            </div>

            <div>
              <Label className="text-sm font-medium">Tags</Label>
              <div className="mt-2 flex flex-wrap gap-2 mb-2">
                {courseData.tags.map(tag => (
                  <Badge key={tag} variant="outline" className="bg-primary/10 text-primary border-primary/30">
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="ml-2 hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex space-x-2">
                <Input
                  placeholder="Add a tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  className="glass-morphism border-white/20 flex-1"
                />
                <Button onClick={addTag} variant="glass" size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Course Modules</h3>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                {courseData.modules.length} modules
              </Badge>
            </div>

            {/* Existing Modules */}
            <div className="space-y-3">
              {courseData.modules.map((module, index) => (
                <Card key={module.id} className="glass-morphism border-white/20">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">{module.title}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{module.duration}</p>
                        <div className="flex flex-wrap gap-1">
                          {module.topics.map(topic => (
                            <Badge key={topic} variant="outline" className="text-xs">
                              {topic}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Button
                        variant="glass"
                        size="sm"
                        onClick={() => removeModule(module.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Add New Module */}
            <Card className="glass-morphism border-primary/30 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-lg">Add New Module</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Module Title</Label>
                    <Input
                      placeholder="e.g., React Fundamentals"
                      value={newModule.title}
                      onChange={(e) => setNewModule(prev => ({ ...prev, title: e.target.value }))}
                      className="mt-1 glass-morphism border-white/20"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Duration</Label>
                    <Input
                      placeholder="e.g., 8 hours"
                      value={newModule.duration}
                      onChange={(e) => setNewModule(prev => ({ ...prev, duration: e.target.value }))}
                      className="mt-1 glass-morphism border-white/20"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Topics</Label>
                  <div className="mt-1 flex flex-wrap gap-2 mb-2">
                    {newModule.topics.map(topic => (
                      <Badge key={topic} variant="outline" className="bg-secondary/10">
                        {topic}
                        <button
                          onClick={() => removeTopicFromModule(topic)}
                          className="ml-2 hover:text-destructive"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Add a topic"
                      value={newTopic}
                      onChange={(e) => setNewTopic(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addTopicToModule()}
                      className="glass-morphism border-white/20 flex-1"
                    />
                    <Button onClick={addTopicToModule} variant="glass" size="sm">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <Button
                  onClick={addModule}
                  disabled={!newModule.title.trim()}
                  variant="neural"
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Module
                </Button>
              </CardContent>
            </Card>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Course Review</h3>

            <Card className="glass-morphism border-white/20">
              <CardHeader>
                <CardTitle className="text-gradient">{courseData.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{courseData.description}</p>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Target className="w-4 h-4 text-primary" />
                    <span>{courseData.difficulty}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <BookOpen className="w-4 h-4 text-primary" />
                    <span>{courseData.category}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-primary" />
                    <span>{courseData.estimatedDuration || calculateTotalDuration()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-primary" />
                    <span>{courseData.modules.length} modules</span>
                  </div>
                </div>

                {courseData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {courseData.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="bg-primary/10 text-primary border-primary/30">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="space-y-3">
              <h4 className="font-semibold">Modules Preview</h4>
              {courseData.modules.map((module, index) => (
                <Card key={module.id} className="glass-morphism border-white/20">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h5 className="font-medium">{index + 1}. {module.title}</h5>
                      <span className="text-sm text-muted-foreground">{module.duration}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {module.topics.map(topic => (
                        <Badge key={topic} variant="outline" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* AI Content Generation Section */}
            {isAIEnabled() && (
              <Card className="glass-morphism border-primary/30 bg-gradient-to-r from-primary/5 to-secondary/5">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <span className="text-gradient">Generate Course Content with AI</span>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Let AI create detailed lesson content, exercises, and learning materials for your course modules.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full" />
                      <span>Detailed lesson content for each module</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full" />
                      <span>Interactive exercises and quizzes</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full" />
                      <span>Real-world examples and projects</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-orange-400 rounded-full" />
                      <span>Learning objectives and assessments</span>
                    </div>
                  </div>
                  
                  <Button
                    onClick={generateCourseWithAI}
                    disabled={isGenerating || courseData.modules.length === 0}
                    variant="hero"
                    size="lg"
                    className="w-full"
                  >
                    {isGenerating ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Generating Course Content...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Lightbulb className="w-5 h-5" />
                        <span>Generate Course Content with AI</span>
                        <Sparkles className="w-5 h-5" />
                      </div>
                    )}
                  </Button>
                  
                  <p className="text-xs text-center text-muted-foreground">
                    💡 This will enhance your course with comprehensive content while keeping your structure intact
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <Card className="glass-morphism border-white/20 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-gradient">
              {editCourse ? "Edit Course" : "Create New Course"}
            </CardTitle>
            <Button variant="glass" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Progress Steps */}
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${index <= currentStep 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                  }
                `}>
                  {index + 1}
                </div>
                <div className="ml-2 text-sm">
                  <div className={index <= currentStep ? 'text-foreground' : 'text-muted-foreground'}>
                    {step.title}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {step.description}
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <ChevronRight className="w-4 h-4 mx-4 text-muted-foreground" />
                )}
              </div>
            ))}
          </div>

          {/* Step Content */}
          <div className="min-h-[400px]">
            {renderStep()}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between pt-6 border-t border-white/10">
            <Button
              variant="glass"
              onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            <div className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {steps.length}
            </div>

            {currentStep === steps.length - 1 ? (
              <Button
                variant="hero"
                onClick={saveCourse}
                disabled={!canProceed() || isSaving}
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {editCourse ? "Update Course" : "Create Course"}
                  </>
                )}
              </Button>
            ) : (
              <Button
                variant="neural"
                onClick={() => setCurrentStep(prev => Math.min(steps.length - 1, prev + 1))}
                disabled={!canProceed()}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CourseCreator;