import Header from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/enhanced-button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/context/AuthProvider";

const Assessments = () => {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const submitAssessment = async () => {
    if (!title || !repoUrl) return;
    setSubmitting(true);
    setMessage(null);
    try {
      if (user) {
        const { error } = await supabase.from("assessments").insert({
          user_id: user.id,
          title,
          repo_url: repoUrl,
          notes,
          feedback: null,
          score: null,
        });
        if (error) throw error;
        setMessage("Submitted! You'll receive AI feedback soon.");
      } else {
        const local = JSON.parse(localStorage.getItem("assessments") || "[]");
        local.push({ title, repoUrl, notes, createdAt: new Date().toISOString() });
        localStorage.setItem("assessments", JSON.stringify(local));
        setMessage("Submitted locally. Sign in to sync to cloud.");
      }
      setTitle("");
      setRepoUrl("");
      setNotes("");
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      setMessage("Failed to submit. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto pt-28 px-6 space-y-6">
        <Card className="glass-morphism border-white/20">
          <CardHeader>
            <CardTitle className="text-gradient">Practical Assessments</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Submit your project link and notes for AI feedback.</p>
          </CardContent>
        </Card>

        <Card className="glass-morphism border-white/20">
          <CardHeader>
            <CardTitle>Submit Assessment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="Assessment title (e.g., Responsive Landing Page)" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Input placeholder="Repository or demo URL" value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)} />
            <Textarea placeholder="Notes for the professor (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />
            <Button onClick={submitAssessment} disabled={submitting || !title || !repoUrl} variant="hero">
              {submitting ? "Submitting..." : "Submit"}
            </Button>
            {message && <p className="text-sm text-muted-foreground">{message}</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Assessments;


