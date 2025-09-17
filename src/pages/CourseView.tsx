import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/enhanced-button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/context/AuthProvider";

type CourseData = {
  title: string;
  description?: string;
  modules?: Array<{ id: string; title: string; duration?: string; topics?: string[] }>;
};

const CourseView = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState<CourseData | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [completed, setCompleted] = useState<number[]>([]);

  const progress = useMemo(() => {
    const total = course?.modules?.length ?? 0;
    if (total === 0) return 0;
    return Math.round((completed.length / total) * 100);
  }, [course, completed]);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      if (user) {
        const { data, error } = await supabase.from("courses").select("data").eq("id", id).single();
        if (!error && data) setCourse(data.data as CourseData);
      } else {
        const local = JSON.parse(localStorage.getItem("courses") || "[]");
        const match = local.find((c: any, idx: number) => String(idx) === id || c.id === id);
        if (match) setCourse(match);
      }
    };
    load();
  }, [id, user]);

  const markComplete = async () => {
    const total = course?.modules?.length ?? 0;
    if (total === 0) return;
    const idx = activeIndex;
    if (!completed.includes(idx)) setCompleted((prev) => [...prev, idx]);
    setActiveIndex((prev) => Math.min(prev + 1, total - 1));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto pt-28 px-6">
        {!course ? (
          <p className="text-muted-foreground">Loading course...</p>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <Card className="glass-morphism border-white/20">
                <CardHeader>
                  <CardTitle className="text-gradient">{course.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Progress value={progress} className="h-2 bg-muted" />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Progress</span>
                    <span>{progress}%</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-morphism border-white/20">
                <CardHeader>
                  <CardTitle>Lesson</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <h3 className="font-semibold">
                    {course.modules?.[activeIndex]?.title ?? "Module"}
                  </h3>
                  <ul className="list-disc pl-5 text-sm text-muted-foreground">
                    {(course.modules?.[activeIndex]?.topics ?? []).map((t, i) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                  <div className="flex gap-3">
                    <Button variant="electric" onClick={markComplete}>Complete Module</Button>
                    <Button variant="glass" onClick={() => setActiveIndex((i) => Math.max(i - 1, 0))}>Previous</Button>
                    <Button variant="glass" onClick={() => setActiveIndex((i) => Math.min(i + 1, (course.modules?.length ?? 1) - 1))}>Next</Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card className="glass-morphism border-white/20">
                <CardHeader>
                  <CardTitle>Modules</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {(course.modules ?? []).map((m, i) => (
                    <Button key={m.id} variant={i === activeIndex ? "electric" : "glass"} className="w-full justify-start" onClick={() => setActiveIndex(i)}>
                      {i + 1}. {m.title}
                    </Button>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseView;


