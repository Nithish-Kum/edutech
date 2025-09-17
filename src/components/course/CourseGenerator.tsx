import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/enhanced-button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Sparkles, ArrowRight, BookOpen, Target, Clock } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/context/AuthProvider";
import { generateCourseOutline, isAIEnabled } from "@/lib/ai";

interface GeneratedCourse {
  id: string;
  title: string;
  description: string;
  modules: Array<{
    id: string;
    title: string;
    duration: string;
    topics: string[];
  }>;
  estimatedDuration: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
}

const CourseGenerator = () => {
  const [topic, setTopic] = useState("");
  const [generatedCourse, setGeneratedCourse] = useState<GeneratedCourse | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const generateCourse = async () => {
    if (!topic.trim()) return;
    
    setIsGenerating(true);
    
    let course: GeneratedCourse | null = null;
    try {
      if (isAIEnabled()) {
        const ai = await generateCourseOutline(topic);
        if (ai) {
          course = {
            id: "course-ai",
            title: ai.title,
            description: ai.description ?? `A practical course on ${topic}`,
            modules: ai.modules.map((m) => ({ id: m.id, title: m.title, duration: m.duration ?? "", topics: m.topics ?? [] })),
            estimatedDuration: ai.estimatedDuration ?? "",
            difficulty: (ai.difficulty as any) ?? "Intermediate",
          };
        }
      }
      if (!course) {
        // Fallback local generation
        course = {
          id: "course-1",
          title: `Complete ${topic} Mastery`,
          description: `A comprehensive course covering all essential aspects of ${topic.toLowerCase()}, designed for practical skill application.`,
          modules: [
            { id: "module-1", title: `${topic} Fundamentals",`, duration: "2 hours", topics: ["Core Concepts", "Basic Principles", "Getting Started"] },
            { id: "module-2", title: `Practical ${topic}`, duration: "3 hours", topics: ["Hands-on Practice", "Real-world Examples", "Common Patterns"] },
            { id: "module-3", title: `Advanced ${topic}`, duration: "2.5 hours", topics: ["Advanced Techniques", "Best Practices", "Optimization"] },
            { id: "module-4", title: "Final Project", duration: "4 hours", topics: ["Project Planning", "Implementation", "Review & Feedback"] },
          ],
          estimatedDuration: "11.5 hours",
          difficulty: "Intermediate",
        };
      }

      setGeneratedCourse(course);

      try {
        if (user) {
          const { error } = await supabase.from("courses").insert({
            user_id: user.id,
            title: course.title,
            description: course.description,
            data: course,
          });
          if (error) throw error;
        } else {
          const existing = JSON.parse(localStorage.getItem("courses") || "[]");
          existing.push(course);
          localStorage.setItem("courses", JSON.stringify(existing));
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error("Failed to persist course", e);
      } finally {
        setIsGenerating(false);
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Course Generation Input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass-morphism rounded-2xl p-8 neural-glow"
      >
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="p-3 gradient-neural rounded-full">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gradient mb-2">
            Generate Your Perfect Course
          </h2>
          <p className="text-muted-foreground">
            Enter any topic and let our AI create a personalized learning path
          </p>
        </div>

        <div className="max-w-md mx-auto space-y-4">
          <div className="relative">
            <Input
              placeholder="e.g. Web Development, Machine Learning, Photography..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="glass-morphism border-white/20 text-center text-lg py-6 placeholder:text-muted-foreground/70"
              onKeyPress={(e) => e.key === 'Enter' && generateCourse()}
            />
          </div>
          
          <Button
            onClick={generateCourse}
            disabled={!topic.trim() || isGenerating}
            variant="hero"
            size="xl"
            className="w-full"
          >
            {isGenerating ? (
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Generating Course...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5" />
                <span>Generate Course</span>
                <ArrowRight className="w-5 h-5" />
              </div>
            )}
          </Button>
        </div>
      </motion.div>

      {/* Generated Course Preview */}
      {generatedCourse && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-6"
        >
          {/* Course Overview */}
          <Card className="glass-morphism border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3">
                <BookOpen className="w-6 h-6 text-primary" />
                <span className="text-gradient">{generatedCourse.title}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{generatedCourse.description}</p>
              
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-electric-blue" />
                  <span>{generatedCourse.estimatedDuration}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Target className="w-4 h-4 text-quantum-green" />
                  <span>{generatedCourse.difficulty}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-4 h-4 text-neural-purple" />
                  <span>{generatedCourse.modules.length} Modules</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Course Modules */}
          <div className="grid gap-4">
            <h3 className="text-xl font-semibold text-gradient">Course Modules</h3>
            {generatedCourse.modules.map((module, index) => (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <Card className="glass-morphism border-white/20 hover:bg-white/10 transition-smooth">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold text-foreground">{module.title}</h4>
                      <span className="text-sm text-muted-foreground">{module.duration}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {module.topics.map((topic, topicIndex) => (
                        <span
                          key={topicIndex}
                          className="px-3 py-1 bg-primary/20 text-primary text-sm rounded-full"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Start Learning Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="text-center"
          >
            <Button 
              variant="electric" 
              size="xl" 
              className="px-12"
              onClick={() => generatedCourse && navigate(`/course/${generatedCourse.id}`)}
            >
              <BookOpen className="w-5 h-5 mr-2" />
              Start Learning
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default CourseGenerator;