import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "@/components/layout/Header";
import LessonViewer from "@/components/course/LessonViewer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/enhanced-button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/context/AuthProvider";
import { BookOpen, Play, CheckCircle, Clock, Target, Users, ArrowLeft } from "lucide-react";

interface CourseModule {
  id: string;
  title: string;
  duration?: string;
  topics?: string[];
  lessons?: Array<{
    id: string;
    title: string;
    topicName: string;
    completed?: boolean;
  }>;
}

interface CourseData {
  id: string;
  title: string;
  description?: string;
  difficulty?: "Beginner" | "Intermediate" | "Advanced";
  category?: string;
  estimatedDuration?: string;
  instructor?: string;
  tags?: string[];
  modules?: CourseModule[];
}

type ViewMode = "overview" | "lesson";

const CourseView = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState<CourseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("overview");
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [moduleProgress, setModuleProgress] = useState<Record<string, number>>({});

  // Calculate overall progress
  const overallProgress = useMemo(() => {
    if (!course?.modules) return 0;
    const totalLessons = course.modules.reduce((sum, module) => sum + (module.lessons?.length || 0), 0);
    if (totalLessons === 0) return 0;
    return Math.round((completedLessons.size / totalLessons) * 100);
  }, [course, completedLessons]);

  // Load course data
  useEffect(() => {
    const loadCourse = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        let courseData: CourseData | null = null;
        
        if (user) {
          const { data, error } = await supabase
            .from("courses")
            .select("*")
            .eq("id", id)
            .single();
          
          if (!error && data) {
            courseData = {
              ...data.data,
              id: data.id
            };
          }
        } else {
          const local = JSON.parse(localStorage.getItem("courses") || "[]");
          const match = local.find((c: any, idx: number) => String(idx) === id || c.id === id);
          if (match) courseData = match;
        }
        
        if (courseData) {
          // Enhance modules with lessons for each topic
          const enhancedModules = courseData.modules?.map(module => ({
            ...module,
            lessons: module.topics?.map((topic, index) => ({
              id: `${module.id}-lesson-${index}`,
              title: topic,
              topicName: topic,
              completed: false
            })) || []
          })) || [];
          
          setCourse({
            ...courseData,
            modules: enhancedModules
          });
        }
      } catch (error) {
        console.error("Error loading course:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCourse();
  }, [id, user]);

  const handleLessonComplete = (lessonId: string) => {
    setCompletedLessons(prev => new Set([...prev, lessonId]));
    
    // Update module progress
    if (course?.modules) {
      const moduleId = course.modules[activeModuleIndex]?.id;
      if (moduleId) {
        const module = course.modules[activeModuleIndex];
        const totalLessons = module.lessons?.length || 0;
        const completedInModule = module.lessons?.filter(lesson => 
          completedLessons.has(lesson.id) || lesson.id === lessonId
        ).length || 0;
        
        setModuleProgress(prev => ({
          ...prev,
          [moduleId]: Math.round((completedInModule / totalLessons) * 100)
        }));
      }
    }
  };

  const handleStartLesson = (moduleIndex: number, lessonIndex: number) => {
    setActiveModuleIndex(moduleIndex);
    setActiveLessonIndex(lessonIndex);
    setViewMode("lesson");
  };

  const handleNextLesson = () => {
    if (!course?.modules) return;
    
    const currentModule = course.modules[activeModuleIndex];
    const nextLessonIndex = activeLessonIndex + 1;
    
    if (nextLessonIndex < (currentModule.lessons?.length || 0)) {
      setActiveLessonIndex(nextLessonIndex);
    } else {
      // Move to next module
      const nextModuleIndex = activeModuleIndex + 1;
      if (nextModuleIndex < course.modules.length) {
        setActiveModuleIndex(nextModuleIndex);
        setActiveLessonIndex(0);
      }
    }
  };

  const handlePreviousLesson = () => {
    if (activeLessonIndex > 0) {
      setActiveLessonIndex(activeLessonIndex - 1);
    } else if (activeModuleIndex > 0) {
      const prevModuleIndex = activeModuleIndex - 1;
      const prevModule = course?.modules?.[prevModuleIndex];
      setActiveModuleIndex(prevModuleIndex);
      setActiveLessonIndex((prevModule?.lessons?.length || 1) - 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto pt-28 px-6 flex items-center justify-center">
          <Card className="glass-morphism border-white/20 p-8 text-center">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Loading Course...</h3>
            <p className="text-muted-foreground">Preparing your learning experience</p>
          </Card>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto pt-28 px-6 flex items-center justify-center">
          <Card className="glass-morphism border-white/20 p-8 text-center">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">Course Not Found</h3>
            <p className="text-muted-foreground mb-4">
              The course you're looking for doesn't exist or has been removed.
            </p>
            <Button variant="neural" onClick={() => window.history.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  if (viewMode === "lesson") {
    const currentModule = course.modules?.[activeModuleIndex];
    const currentLesson = currentModule?.lessons?.[activeLessonIndex];
    
    if (!currentModule || !currentLesson) {
      return <div>Lesson not found</div>;
    }

    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto pt-28 px-6">
          <div className="mb-6">
            <Button 
              variant="glass" 
              onClick={() => setViewMode("overview")}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Course Overview
            </Button>
          </div>
          
          <LessonViewer
            lesson={{
              id: currentLesson.id,
              title: currentLesson.title,
              moduleTitle: currentModule.title,
              courseDifficulty: course.difficulty || "Intermediate",
              topicName: currentLesson.topicName
            }}
            onComplete={() => {
              handleLessonComplete(currentLesson.id);
              // Auto-advance to next lesson if available
              const hasNextLesson = activeLessonIndex < (currentModule.lessons?.length || 0) - 1 || 
                                   activeModuleIndex < (course.modules?.length || 0) - 1;
              if (hasNextLesson) {
                handleNextLesson();
              } else {
                setViewMode("overview");
              }
            }}
            onNext={handleNextLesson}
            onPrevious={activeLessonIndex > 0 || activeModuleIndex > 0 ? handlePreviousLesson : undefined}
            isCompleted={completedLessons.has(currentLesson.id)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto pt-28 px-6 pb-12">
        {/* Course Header */}
        <div className="mb-8">
          <Card className="glass-morphism border-white/20">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-3xl text-gradient">{course.title}</CardTitle>
                  <p className="text-muted-foreground text-lg">{course.description}</p>
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <Target className="w-4 h-4 text-primary" />
                      <span>{course.difficulty}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4 text-primary" />
                      <span>{course.estimatedDuration}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <BookOpen className="w-4 h-4 text-primary" />
                      <span>{course.modules?.length || 0} modules</span>
                    </div>
                    {course.instructor && (
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4 text-primary" />
                        <span>{course.instructor}</span>
                      </div>
                    )}
                  </div>
                  {course.tags && course.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {course.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="bg-primary/10 text-primary border-primary/30">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Overall Progress</span>
                  <span className="font-medium text-primary">{overallProgress}%</span>
                </div>
                <Progress value={overallProgress} className="h-3 bg-muted" />
                <div className="text-xs text-muted-foreground">
                  {completedLessons.size} of {course.modules?.reduce((sum, module) => sum + (module.lessons?.length || 0), 0)} lessons completed
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Course Modules */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gradient">Course Modules</h2>
          
          <div className="grid gap-6">
            {course.modules?.map((module, moduleIndex) => {
              const moduleProgressValue = moduleProgress[module.id] || 0;
              const completedInModule = module.lessons?.filter(lesson => 
                completedLessons.has(lesson.id)
              ).length || 0;
              
              return (
                <Card key={module.id} className="glass-morphism border-white/20">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <CardTitle className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                            <span className="text-sm font-bold text-primary">{moduleIndex + 1}</span>
                          </div>
                          {module.title}
                        </CardTitle>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{module.duration || "Self-paced"}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <BookOpen className="w-4 h-4" />
                            <span>{module.lessons?.length || 0} lessons</span>
                          </div>
                        </div>
                      </div>
                      <Badge 
                        variant={moduleProgressValue === 100 ? "default" : "secondary"}
                        className={moduleProgressValue === 100 ? "bg-green-500" : ""}
                      >
                        {moduleProgressValue === 100 ? (
                          <><CheckCircle className="w-3 h-3 mr-1" /> Completed</>
                        ) : (
                          <>{completedInModule}/{module.lessons?.length || 0} lessons</>
                        )}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Module Progress</span>
                        <span className="font-medium text-primary">{moduleProgressValue}%</span>
                      </div>
                      <Progress value={moduleProgressValue} className="h-2 bg-muted" />
                    </div>
                    
                    <div className="grid gap-3">
                      {module.lessons?.map((lesson, lessonIndex) => {
                        const isCompleted = completedLessons.has(lesson.id);
                        return (
                          <div 
                            key={lesson.id} 
                            className="flex items-center justify-between p-3 rounded-lg bg-background/50 hover:bg-background/70 transition-smooth"
                          >
                            <div className="flex items-center space-x-3">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                isCompleted 
                                  ? 'bg-green-500 text-white' 
                                  : 'bg-primary/20 text-primary'
                              }`}>
                                {isCompleted ? (
                                  <CheckCircle className="w-4 h-4" />
                                ) : (
                                  <span className="text-xs font-medium">{lessonIndex + 1}</span>
                                )}
                              </div>
                              <div>
                                <h4 className="font-medium text-foreground">{lesson.title}</h4>
                                <p className="text-sm text-muted-foreground">Interactive lesson with exercises</p>
                              </div>
                            </div>
                            <Button 
                              variant={isCompleted ? "glass" : "electric"}
                              size="sm"
                              onClick={() => handleStartLesson(moduleIndex, lessonIndex)}
                            >
                              {isCompleted ? "Review" : "Start Lesson"}
                              <Play className="w-3 h-3 ml-1" />
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseView;


