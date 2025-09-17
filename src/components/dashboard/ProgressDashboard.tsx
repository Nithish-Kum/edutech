import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, 
  Clock, 
  Trophy, 
  Target, 
  TrendingUp, 
  Star,
  CheckCircle2,
  PlayCircle
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/context/AuthProvider";

type CourseProgress = {
  id: string;
  title: string;
  progress: number;
  totalModules: number;
  completedModules: number;
  timeSpent: string;
  nextModule: string;
  status: "In Progress" | "Completed";
};

const ProgressDashboard = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<CourseProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        if (user) {
          const { data: courseRows, error } = await supabase
            .from("courses")
            .select("id, title, data, created_at")
            .order("created_at", { ascending: false });
          if (error) throw error;
          const mapped: CourseProgress[] = (courseRows || []).map((row: any) => {
            const totalModules = row.data?.modules?.length ?? 0;
            return {
              id: row.id,
              title: row.title,
              progress: 0,
              totalModules,
              completedModules: 0,
              timeSpent: "0 hours",
              nextModule: totalModules > 0 ? row.data.modules[0].title : "",
              status: "In Progress",
            };
          });
          setCourses(mapped);
        } else {
          const local = JSON.parse(localStorage.getItem("courses") || "[]");
          const mapped: CourseProgress[] = local.map((c: any, idx: number) => ({
            id: String(idx),
            title: c.title,
            progress: 0,
            totalModules: c.modules?.length ?? 0,
            completedModules: 0,
            timeSpent: "0 hours",
            nextModule: c.modules?.[0]?.title ?? "",
            status: "In Progress",
          }));
          setCourses(mapped);
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const stats = useMemo(() => [
    {
      icon: BookOpen,
      label: "Courses Enrolled",
      value: String(courses.length),
      color: "text-electric-blue"
    },
    {
      icon: Trophy,
      label: "Courses Completed", 
      value: String(courses.filter(c => c.status === "Completed").length),
      color: "text-quantum-green"
    },
    {
      icon: Clock,
      label: "Hours Learned",
      value: "0",
      color: "text-neural-purple"
    },
    {
      icon: Target,
      label: "Skill Level",
      value: "Advanced",
      color: "text-primary"
    }
  ], [courses]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h2 className="text-3xl font-bold text-gradient mb-2">Learning Progress</h2>
        <p className="text-muted-foreground">Track your journey to mastery</p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        {stats.map((stat, index) => (
          <Card key={index} className="glass-morphism border-white/20 hover:bg-white/10 transition-smooth">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-2 gradient-neural rounded-lg">
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Active Courses */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="space-y-6"
      >
        <h3 className="text-xl font-semibold text-gradient">Active Courses</h3>
        
        <div className="space-y-4">
          {(!loading && courses.length === 0) && (
            <p className="text-sm text-muted-foreground">No courses yet. Generate one to begin learning.</p>
          )}
          {courses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <Card className="glass-morphism border-white/20 hover:bg-white/10 transition-smooth cursor-pointer" onClick={() => (window.location.href = `/courses/${course.id}`)}>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Course Header */}
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h4 className="font-semibold text-foreground">{course.title}</h4>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <BookOpen className="w-4 h-4" />
                            <span>{course.completedModules}/{course.totalModules} modules</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{course.timeSpent}</span>
                          </div>
                        </div>
                      </div>
                      <Badge 
                        variant={course.status === "Completed" ? "default" : "secondary"}
                        className={course.status === "Completed" ? "bg-quantum-green" : ""}
                      >
                        {course.status === "Completed" ? (
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                        ) : (
                          <PlayCircle className="w-3 h-3 mr-1" />
                        )}
                        {course.status}
                      </Badge>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="text-primary font-medium">{course.progress}%</span>
                      </div>
                      <Progress 
                        value={course.progress} 
                        className="h-2 bg-muted"
                      />
                    </div>

                    {/* Next Module */}
                    {course.status !== "Completed" && (
                      <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium">Next: {course.nextModule}</span>
                        </div>
                        <Star className="w-4 h-4 text-primary" />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default ProgressDashboard;