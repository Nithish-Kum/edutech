import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/enhanced-button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  Target, 
  Users,
  Play,
  Edit,
  Trash2,
  Star,
  Calendar,
  TrendingUp,
  Award
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/context/AuthProvider";
import CourseCreator from "./CourseCreator";

interface Course {
  id: string;
  title: string;
  description: string;
  modules: Array<{
    id: string;
    title: string;
    duration: string;
    topics: string[];
    completed?: boolean;
  }>;
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

interface CourseManagementProps {
  onCourseSelect?: (course: Course) => void;
}

const CourseManagement = ({ onCourseSelect }: CourseManagementProps) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showCreator, setShowCreator] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState<"all" | "my-courses" | "in-progress" | "completed">("all");
  const { user } = useAuth();
  const navigate = useNavigate();

  // Categories for filtering
  const categories = [
    "Programming", "Design", "Business", "Science", "Mathematics", 
    "Languages", "Arts", "Health", "Technology", "Other"
  ];

  // Load courses on component mount
  useEffect(() => {
    loadCourses();
  }, [user]);

  // Filter courses when search term or filters change
  useEffect(() => {
    filterCourses();
  }, [courses, searchTerm, selectedDifficulty, selectedCategory, activeView]);

  const loadCourses = async () => {
    console.log("Loading courses...", { user: !!user });
    setIsLoading(true);
    try {
      let loadedCourses: Course[] = [];

      if (user) {
        console.log("Loading from Supabase...");
        // Load from Supabase
        const { data, error } = await supabase
          .from("courses")
          .select("*")
          .order("created_at", { ascending: false });

        console.log("Supabase response:", { data, error });
        if (!error && data) {
          loadedCourses = data.map(course => ({
            ...course,
            modules: course.modules || [],
            createdAt: course.created_at,
            progress: Math.random() * 100 // TODO: Calculate actual progress
          }));
          console.log("Loaded courses from Supabase:", loadedCourses);
        }
      } else {
        console.log("Loading from localStorage...");
        // Load from localStorage
        const saved = localStorage.getItem("courses");
        console.log("localStorage data:", saved);
        if (saved) {
          const parsed = JSON.parse(saved);
          console.log("Parsed courses:", parsed);
          loadedCourses = parsed.map((course: Course) => ({
            ...course,
            progress: Math.random() * 100,
            createdAt: new Date().toISOString()
          }));
          console.log("Loaded courses from localStorage:", loadedCourses);
        }
      }

      // No sample courses - users start with empty library
      console.log("Final loaded courses:", loadedCourses);
      setCourses(loadedCourses);
    } catch (error) {
      console.error("Error loading courses:", error);
      setCourses([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filterCourses = () => {
    let filtered = [...courses];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Difficulty filter
    if (selectedDifficulty !== "all") {
      filtered = filtered.filter(course => course.difficulty === selectedDifficulty);
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(course => course.category === selectedCategory);
    }

    // View filter
    switch (activeView) {
      case "in-progress":
        filtered = filtered.filter(course => course.progress && course.progress > 0 && course.progress < 100);
        break;
      case "completed":
        filtered = filtered.filter(course => course.progress === 100);
        break;
      case "my-courses":
        // TODO: Filter by user's created courses
        break;
    }

    setFilteredCourses(filtered);
  };

  const handleCourseCreated = (newCourse: Course) => {
    console.log("handleCourseCreated called with:", newCourse);
    setCourses(prev => {
      const updated = [newCourse, ...prev];
      console.log("Updated courses list:", updated);
      return updated;
    });
    setShowCreator(false);
    
    // Force reload courses to ensure they show up
    setTimeout(() => {
      loadCourses();
    }, 1000);
  };

  const deleteCourse = async (courseId: string) => {
    try {
      if (user) {
        await supabase.from("courses").delete().eq("id", courseId);
      } else {
        const updated = courses.filter(c => c.id !== courseId);
        localStorage.setItem("courses", JSON.stringify(updated));
      }
      setCourses(prev => prev.filter(c => c.id !== courseId));
    } catch (error) {
      console.error("Error deleting course:", error);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner": return "bg-green-500/20 text-green-400";
      case "Intermediate": return "bg-yellow-500/20 text-yellow-400";
      case "Advanced": return "bg-red-500/20 text-red-400";
      default: return "bg-gray-500/20 text-gray-400";
    }
  };


  const CourseCard = ({ course }: { course: Course }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="glass-morphism border-white/20 hover:bg-white/10 transition-smooth h-full group">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg font-bold text-gradient line-clamp-2">
              {course.title}
            </CardTitle>
            <div className="flex space-x-1">
              <Button variant="glass" size="sm" onClick={() => {
                onCourseSelect?.(course);
                navigate(`/course/${course.id}`);
              }}>
                <Play className="w-4 h-4" />
              </Button>
              <Button variant="glass" size="sm" onClick={() => deleteCourse(course.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {course.description}
          </p>
          
          <div className="flex flex-wrap gap-2">
            <Badge className={getDifficultyColor(course.difficulty)}>
              {course.difficulty}
            </Badge>
            {course.category && (
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                {course.category}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{course.estimatedDuration}</span>
            </div>
            <div className="flex items-center space-x-1">
              <BookOpen className="w-4 h-4" />
              <span>{course.modules.length} modules</span>
            </div>
          </div>
          
          {course.progress !== undefined && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Progress</span>
                <span>{Math.round(course.progress)}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-gradient-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${course.progress}%` }}
                />
              </div>
            </div>
          )}
          
          {course.rating && (
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span>{course.rating}</span>
              </div>
              {course.studentsCount && (
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>{course.studentsCount}</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Course Management</h1>
          <p className="text-muted-foreground">
            Create, manage, and track your learning journey
          </p>
        </div>
        
        <Button
          onClick={() => setShowCreator(true)}
          variant="hero"
          className="w-fit"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Course
        </Button>
      </div>

      {/* Filters and Search */}
      <Card className="glass-morphism border-white/20 p-6">
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 glass-morphism border-white/20"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-3 py-1 rounded-md bg-background/50 border border-white/20 text-sm"
            >
              <option value="all">All Difficulties</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1 rounded-md bg-background/50 border border-white/20 text-sm"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* View Tabs */}
      <Tabs value={activeView} onValueChange={(v) => setActiveView(v as typeof activeView)}>
        <TabsList className="glass-morphism">
          <TabsTrigger value="all">All Courses</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="my-courses">My Courses</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeView} className="mt-6">
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="glass-morphism border-white/20 h-80 animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-white/10 rounded mb-4"></div>
                    <div className="h-3 bg-white/10 rounded mb-2"></div>
                    <div className="h-3 bg-white/10 rounded mb-4"></div>
                    <div className="h-2 bg-white/10 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <>
              {filteredCourses.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="max-w-2xl mx-auto"
                >
                  <Card className="glass-morphism border-white/20 p-12 text-center">
                    <BookOpen className="w-20 h-20 mx-auto mb-6 text-muted-foreground opacity-50" />
                    <h3 className="text-2xl font-bold text-gradient mb-3">
                      {searchTerm || selectedDifficulty !== "all" || selectedCategory !== "all"
                        ? "No Matching Courses Found"
                        : "Welcome to Your Course Library!"
                      }
                    </h3>
                    <p className="text-muted-foreground mb-8 text-lg">
                      {searchTerm || selectedDifficulty !== "all" || selectedCategory !== "all"
                        ? "Try adjusting your search filters or create a new course on this topic."
                        : "You haven't created any courses yet. Start building your learning journey with AI-powered course creation!"
                      }
                    </p>
                    
                    <div className="space-y-4">
                      <Button onClick={() => setShowCreator(true)} variant="hero" size="lg">
                        <Plus className="w-5 h-5 mr-2" />
                        Create Your First Course
                      </Button>
                      
                      {!(searchTerm || selectedDifficulty !== "all" || selectedCategory !== "all") && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-center space-x-6 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-primary rounded-full" />
                              <span>Manual Course Builder</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-secondary rounded-full" />
                              <span>AI Course Generator</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-accent rounded-full" />
                              <span>Interactive Lessons</span>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            💡 Use the AI Course Creator tab for instant course generation with ChatGPT-quality content
                          </p>
                        </div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              ) : (
                <motion.div
                  layout
                  className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  <AnimatePresence>
                    {filteredCourses.map((course) => (
                      <CourseCard key={course.id} course={course} />
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Course Creator Modal */}
      <AnimatePresence>
        {showCreator && (
          <CourseCreator
            onCourseCreated={handleCourseCreated}
            onClose={() => setShowCreator(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default CourseManagement;