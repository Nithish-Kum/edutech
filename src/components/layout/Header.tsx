import { Button } from "@/components/ui/enhanced-button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";
import { 
  GraduationCap, 
  User, 
  Settings, 
  LogOut, 
  BookOpen, 
  Trophy, 
  Bell,
  MessageCircle,
  ChevronDown
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthProvider";
import { useState } from "react";

const Header = () => {
  const { user, signOut } = useAuth();
  const [notificationsCount] = useState(3); // Mock notification count
  
  // Get user initials for avatar fallback
  const getUserInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Get user display name
  const getDisplayName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return "User";
  };

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 glass-morphism border-b border-white/10 backdrop-blur-xl"
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <Link to={user ? "/dashboard" : "/"} className="flex items-center space-x-3">
              <div className="w-10 h-10 gradient-neural rounded-lg flex items-center justify-center neural-glow">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-bold text-gradient">EduAI</h1>
                <p className="text-xs text-muted-foreground">Neural Learning</p>
              </div>
            </Link>
          </motion.div>

          {/* Navigation */}
          {user && (
            <nav className="hidden md:flex items-center space-x-8">
              <Link 
                to="/dashboard" 
                className="text-foreground hover:text-primary transition-smooth flex items-center space-x-2"
              >
                <BookOpen className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>
              <Link 
                to="/courses" 
                className="text-foreground hover:text-primary transition-smooth flex items-center space-x-2"
              >
                <GraduationCap className="w-4 h-4" />
                <span>Courses</span>
              </Link>
              <Link 
                to="/assessments" 
                className="text-foreground hover:text-primary transition-smooth flex items-center space-x-2"
              >
                <Trophy className="w-4 h-4" />
                <span>Assessments</span>
              </Link>
            </nav>
          )}

          {/* User Actions */}
          <div className="flex items-center space-x-3">
            {user ? (
              <>
                {/* Notifications */}
                <div className="relative">
                  <Button variant="glass" size="icon" className="relative">
                    <Bell className="w-4 h-4" />
                    {notificationsCount > 0 && (
                      <Badge 
                        className="absolute -top-1 -right-1 w-5 h-5 text-xs bg-red-500 text-white border-0 flex items-center justify-center"
                      >
                        {notificationsCount}
                      </Badge>
                    )}
                  </Button>
                </div>

                {/* AI Professor Chat */}
                <Button variant="glass" size="icon">
                  <MessageCircle className="w-4 h-4" />
                </Button>

                {/* User Profile Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="glass" className="flex items-center space-x-2 px-3">
                      <Avatar className="w-7 h-7">
                        <AvatarImage 
                          src={user?.user_metadata?.avatar_url} 
                          alt={getDisplayName()}
                        />
                        <AvatarFallback className="bg-gradient-primary text-white text-xs">
                          {getUserInitials(getDisplayName())}
                        </AvatarFallback>
                      </Avatar>
                      <div className="hidden md:flex flex-col items-start">
                        <span className="text-sm font-medium">{getDisplayName()}</span>
                        <span className="text-xs text-muted-foreground">Student</span>
                      </div>
                      <ChevronDown className="w-3 h-3 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  
                  <DropdownMenuContent 
                    align="end" 
                    className="w-64 glass-morphism border-white/20 backdrop-blur-xl"
                  >
                    <DropdownMenuLabel className="pb-2">
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage 
                            src={user?.user_metadata?.avatar_url} 
                            alt={getDisplayName()}
                          />
                          <AvatarFallback className="bg-gradient-primary text-white">
                            {getUserInitials(getDisplayName())}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-semibold">{getDisplayName()}</span>
                          <span className="text-sm text-muted-foreground">{user?.email}</span>
                          <Badge variant="outline" className="w-fit mt-1 text-xs">
                            Premium Student
                          </Badge>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    
                    <DropdownMenuSeparator className="bg-white/20" />
                    
                    <DropdownMenuItem className="cursor-pointer">
                      <User className="w-4 h-4 mr-3" />
                      <div className="flex flex-col">
                        <span>Profile Settings</span>
                        <span className="text-xs text-muted-foreground">Manage your account</span>
                      </div>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem className="cursor-pointer">
                      <BookOpen className="w-4 h-4 mr-3" />
                      <div className="flex flex-col">
                        <span>My Learning</span>
                        <span className="text-xs text-muted-foreground">Progress & courses</span>
                      </div>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem className="cursor-pointer">
                      <Trophy className="w-4 h-4 mr-3" />
                      <div className="flex flex-col">
                        <span>Achievements</span>
                        <span className="text-xs text-muted-foreground">View your badges</span>
                      </div>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem className="cursor-pointer">
                      <Settings className="w-4 h-4 mr-3" />
                      <div className="flex flex-col">
                        <span>Settings</span>
                        <span className="text-xs text-muted-foreground">Preferences & privacy</span>
                      </div>
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator className="bg-white/20" />
                    
                    <DropdownMenuItem 
                      className="cursor-pointer text-red-400 focus:text-red-400"
                      onClick={signOut}
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      <span>Sign out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/auth">
                  <Button variant="glass" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/auth">
                  <Button variant="hero" size="sm">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;