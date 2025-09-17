import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/enhanced-button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthProvider";
import Header from "@/components/layout/Header";

const Auth = () => {
  const { signInWithEmailOtp } = useAuth();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email) return;
    setLoading(true);
    const res = await signInWithEmailOtp(email);
    setLoading(false);
    if (!("error" in (res || {}))) setSent(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto pt-28 px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Card className="max-w-md mx-auto glass-morphism border-white/20">
            <CardHeader>
              <CardTitle className="text-gradient">Sign in to continue</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="glass-morphism border-white/20"
              />
              <Button onClick={handleSubmit} disabled={loading || !email} variant="hero" className="w-full">
                {loading ? "Sending magic link..." : "Send magic link"}
              </Button>
              {sent && <p className="text-sm text-muted-foreground">Check your email for a sign-in link.</p>}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;


