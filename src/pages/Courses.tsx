import { useState } from "react";
import Header from "@/components/layout/Header";
import CourseManagement from "@/components/course/CourseManagement";
import CourseGenerator from "@/components/course/CourseGenerator";
import EnhancedCourseGenerator from "@/components/course/EnhancedCourseGenerator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

const Courses = () => {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const handleCourseSelect = (course: Course) => {
    setSelectedCourse(course);
    // You can navigate to a detailed course view here
    console.log("Selected course:", course);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto pt-28 px-6 pb-12">
        <Tabs defaultValue="manage" className="w-full">
          <TabsList className="glass-morphism mb-8">
            <TabsTrigger value="manage" className="data-[state=active]:bg-primary/20">
              Course Library
            </TabsTrigger>
            <TabsTrigger value="ai-chat" className="data-[state=active]:bg-primary/20">
              AI Course Creator
            </TabsTrigger>
            <TabsTrigger value="generator" className="data-[state=active]:bg-primary/20">
              Quick Generator
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="manage" className="mt-0">
            <CourseManagement onCourseSelect={handleCourseSelect} />
          </TabsContent>
          
          <TabsContent value="ai-chat" className="mt-0">
            <EnhancedCourseGenerator onCourseCreated={(course) => {
              handleCourseSelect(course);
              // Optionally switch back to library tab to see the new course
              // setActiveTab('manage');
            }} />
          </TabsContent>
          
          <TabsContent value="generator" className="mt-0">
            <CourseGenerator />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Courses;


