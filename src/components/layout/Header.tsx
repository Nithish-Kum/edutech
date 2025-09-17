import { Button } from "@/components/ui/enhanced-button";
import { motion } from "framer-motion";
import { GraduationCap, User, Settings, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthProvider";

const Header = () => {
  const { user, signOut } = useAuth();
  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 glass-morphism border-b border-white/10"
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="flex items-center space-x-3"
          >
            <div className="w-10 h-10 gradient-neural rounded-lg flex items-center justify-center neural-glow">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold text-gradient">EduAI</h1>
              <p className="text-xs text-muted-foreground">Neural Learning</p>
            </div>
          </motion.div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/dashboard" className="text-foreground hover:text-primary transition-smooth">
              Dashboard
            </Link>
            <Link to="/courses" className="text-foreground hover:text-primary transition-smooth">
              My Courses
            </Link>
            <Link to="/assessments" className="text-foreground hover:text-primary transition-smooth">
              Assessments
            </Link>
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            <Button variant="glass" size="icon">
              <Settings className="w-4 h-4" />
            </Button>
            {user ? (
              <>
                <Button variant="glass" size="icon">
                  <User className="w-4 h-4" />
                </Button>
                <Button variant="neural" size="sm" onClick={signOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign out
                </Button>
              </>
            ) : (
              <Link to="/auth">
                <Button variant="neural" size="sm">
                  Get Started
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;