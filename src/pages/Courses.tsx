import Header from "@/components/layout/Header";
import CourseGenerator from "@/components/course/CourseGenerator";

const Courses = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto pt-28 px-6">
        <CourseGenerator />
      </div>
    </div>
  );
};

export default Courses;


