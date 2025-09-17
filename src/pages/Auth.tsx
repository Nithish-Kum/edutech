import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/enhanced-button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/context/AuthProvider";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { 
  Sparkles, 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react";
import MasterAvatarSystem from "@/components/3d/MasterAvatarSystem";

type AuthMode = "login" | "signup" | "forgot-password" | "magic-link";

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  fullName?: string;
  general?: string;
}

const Auth = () => {
  const { user, signInWithEmailOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: ""
  });
  const [errors, setErrors] = useState<FormErrors>({});

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      const from = location.state?.from?.pathname || "/dashboard";
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation for login and signup
    if ((authMode === "login" || authMode === "signup") && !formData.password) {
      newErrors.password = "Password is required";
    } else if (authMode === "signup" && formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long";
    }

    // Confirm password validation for signup
    if (authMode === "signup") {
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "Please confirm your password";
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }

      // Full name validation
      if (!formData.fullName.trim()) {
        newErrors.fullName = "Full name is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          setErrors({ general: "Invalid email or password. Please try again." });
        } else {
          setErrors({ general: error.message });
        }
      } else {
        setSuccess("Login successful! Redirecting...");
      }
    } catch (error) {
      setErrors({ general: "An unexpected error occurred. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});
    
    try {
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
          }
        }
      });

      if (error) {
        if (error.message.includes("User already registered")) {
          setErrors({ general: "An account with this email already exists. Try logging in instead." });
        } else {
          setErrors({ general: error.message });
        }
      } else {
        setSuccess("Account created! Please check your email to verify your account.");
      }
    } catch (error) {
      setErrors({ general: "An unexpected error occurred. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrors({});
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (error) {
        setErrors({ general: error.message });
      }
    } catch (error) {
      setErrors({ general: "Failed to sign in with Google. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      setErrors({ email: "Please enter your email address" });
      return;
    }

    setLoading(true);
    setErrors({});
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: `${window.location.origin}/auth?mode=reset-password`,
      });

      if (error) {
        setErrors({ general: error.message });
      } else {
        setSuccess("Password reset email sent! Please check your inbox.");
      }
    } catch (error) {
      setErrors({ general: "Failed to send reset email. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async () => {
    if (!formData.email) {
      setErrors({ email: "Please enter your email address" });
      return;
    }

    setLoading(true);
    setErrors({});
    
    try {
      const res = await signInWithEmailOtp(formData.email);
      if ("error" in (res || {})) {
        setErrors({ general: "Failed to send magic link. Please try again." });
      } else {
        setSuccess("Magic link sent! Please check your email.");
      }
    } catch (error) {
      setErrors({ general: "Failed to send magic link. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    switch (authMode) {
      case "login":
        handleLogin();
        break;
      case "signup":
        handleSignup();
        break;
      case "forgot-password":
        handleForgotPassword();
        break;
      case "magic-link":
        handleMagicLink();
        break;
    }
  };

  const resetForm = () => {
    setFormData({ email: "", password: "", confirmPassword: "", fullName: "" });
    setErrors({});
    setSuccess("");
  };

  const switchMode = (mode: AuthMode) => {
    setAuthMode(mode);
    resetForm();
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* AI Professor Background */}
      <div className="absolute inset-0 opacity-20">
        <MasterAvatarSystem 
          currentTopic="Authentication"
          isListening={false}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <Card className="glass-morphism border-white/20 backdrop-blur-xl">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-2xl text-gradient">
                {authMode === "login" && "Welcome Back"}
                {authMode === "signup" && "Create Account"}
                {authMode === "forgot-password" && "Reset Password"}
                {authMode === "magic-link" && "Magic Link Sign In"}
              </CardTitle>
              <p className="text-muted-foreground text-sm">
                {authMode === "login" && "Sign in to continue your learning journey"}
                {authMode === "signup" && "Join thousands of learners today"}
                {authMode === "forgot-password" && "Enter your email to reset your password"}
                {authMode === "magic-link" && "We'll send you a secure sign-in link"}
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Success Message */}
              <AnimatePresence>
                {success && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <Alert className="border-green-500/20 bg-green-500/10">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <AlertDescription className="text-green-700">
                        {success}
                      </AlertDescription>
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error Message */}
              <AnimatePresence>
                {errors.general && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <Alert className="border-red-500/20 bg-red-500/10">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <AlertDescription className="text-red-700">
                        {errors.general}
                      </AlertDescription>
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name (Signup only) */}
                {authMode === "signup" && (
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-sm font-medium">
                      Full Name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="Enter your full name"
                        value={formData.fullName}
                        onChange={(e) => handleInputChange("fullName", e.target.value)}
                        className={`pl-10 glass-morphism border-white/20 ${
                          errors.fullName ? "border-red-500/50" : ""
                        }`}
                      />
                    </div>
                    {errors.fullName && (
                      <p className="text-sm text-red-500">{errors.fullName}</p>
                    )}
                  </div>
                )}

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className={`pl-10 glass-morphism border-white/20 ${
                        errors.email ? "border-red-500/50" : ""
                      }`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email}</p>
                  )}
                </div>

                {/* Password (Login and Signup) */}
                {(authMode === "login" || authMode === "signup") && (
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder={authMode === "signup" ? "Create a password (8+ characters)" : "Enter your password"}
                        value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        className={`pl-10 pr-10 glass-morphism border-white/20 ${
                          errors.password ? "border-red-500/50" : ""
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-sm text-red-500">{errors.password}</p>
                    )}
                  </div>
                )}

                {/* Confirm Password (Signup only) */}
                {authMode === "signup" && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium">
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                        className={`pl-10 pr-10 glass-morphism border-white/20 ${
                          errors.confirmPassword ? "border-red-500/50" : ""
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-sm text-red-500">{errors.confirmPassword}</p>
                    )}
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={loading}
                  variant="hero"
                  className="w-full"
                >
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {authMode === "login" && (loading ? "Signing In..." : "Sign In")}
                  {authMode === "signup" && (loading ? "Creating Account..." : "Create Account")}
                  {authMode === "forgot-password" && (loading ? "Sending Email..." : "Send Reset Email")}
                  {authMode === "magic-link" && (loading ? "Sending Link..." : "Send Magic Link")}
                </Button>
              </form>

              {/* Google Sign In */}
              {(authMode === "login" || authMode === "signup") && (
                <div className="space-y-4">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-white/20" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="glass"
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    className="w-full"
                  >
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                      <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                  </Button>
                </div>
              )}

              {/* Mode Switching */}
              <div className="space-y-4 text-center text-sm">
                {authMode === "login" && (
                  <>
                    <button
                      type="button"
                      onClick={() => switchMode("forgot-password")}
                      className="text-primary hover:text-primary/80 transition-colors"
                    >
                      Forgot your password?
                    </button>
                    <div className="flex items-center justify-center space-x-2">
                      <span className="text-muted-foreground">Don't have an account?</span>
                      <button
                        type="button"
                        onClick={() => switchMode("signup")}
                        className="text-primary hover:text-primary/80 transition-colors font-medium"
                      >
                        Sign up
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => switchMode("magic-link")}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Use magic link instead
                    </button>
                  </>
                )}

                {authMode === "signup" && (
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-muted-foreground">Already have an account?</span>
                    <button
                      type="button"
                      onClick={() => switchMode("login")}
                      className="text-primary hover:text-primary/80 transition-colors font-medium"
                    >
                      Sign in
                    </button>
                  </div>
                )}

                {(authMode === "forgot-password" || authMode === "magic-link") && (
                  <button
                    type="button"
                    onClick={() => switchMode("login")}
                    className="flex items-center justify-center space-x-2 text-muted-foreground hover:text-foreground transition-colors mx-auto"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to sign in</span>
                  </button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;


