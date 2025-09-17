import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/enhanced-button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  MessageCircle,
  Send,
  Minimize2,
  Maximize2,
  X,
  Volume2,
  VolumeX,
  RefreshCw,
  Sparkles
} from "lucide-react";
import { askAIProfessor } from "@/lib/ai";
import { useAuth } from "@/context/AuthProvider";
import MasterAvatarSystem from "../3d/MasterAvatarSystem";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface AIProfessorChatProps {
  className?: string;
}

const AIProfessorChat = ({ className = "" }: AIProfessorChatProps) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content: "Hello! I'm your AI Professor. I'm here to help you with any questions about learning, courses, or academic topics. What would you like to know?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check if speech synthesis is supported
  useEffect(() => {
    setSpeechEnabled('speechSynthesis' in window);
  }, []);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addMessage = (content: string, isUser: boolean) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      isUser,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage("");
    addMessage(userMessage, true);
    setIsLoading(true);

    try {
      // Get user context if available
      const userContext = user ? {
        currentTopic: "General Learning",
        difficulty: "Intermediate",
        courseName: "Current Session"
      } : undefined;

      const response = await askAIProfessor(userMessage, userContext);
      
      if (response) {
        addMessage(response, false);
        
        // Auto-speak response if enabled
        if (speechEnabled && !isSpeaking) {
          speakMessage(response);
        }
      } else {
        addMessage("I apologize, but I'm having trouble processing your question right now. Please try again or rephrase your question.", false);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      addMessage("I encountered an error while processing your question. Please try again.", false);
    } finally {
      setIsLoading(false);
    }
  };

  const speakMessage = (message: string) => {
    if (!speechEnabled) return;
    
    setIsSpeaking(true);
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (speechEnabled) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const quickQuestions = [
    "How can I improve my study habits?",
    "What's the best way to take notes?",
    "How do I stay motivated while learning?",
    "Can you explain active learning techniques?",
    "What are some effective memorization strategies?"
  ];

  const handleQuickQuestion = (question: string) => {
    setInputMessage(question);
  };

  if (!isOpen) {
    return (
      <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Button
            onClick={() => setIsOpen(true)}
            variant="hero"
            size="lg"
            className="rounded-full shadow-2xl relative overflow-hidden"
          >
            <div className="absolute inset-0 opacity-20">
              <div className="w-full h-full bg-gradient-to-r from-primary to-secondary animate-pulse" />
            </div>
            <MessageCircle className="w-6 h-6 mr-2" />
            <span>Ask AI Professor</span>
            <Sparkles className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3 }}
        >
          <Card 
            className={`glass-morphism border-white/20 backdrop-blur-xl shadow-2xl ${
              isMinimized ? "w-80 h-16" : "w-96 h-[600px]"
            } transition-all duration-300`}
          >
            {/* Header */}
            <CardHeader className="pb-2 px-4 py-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center">
                  <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center mr-3">
                    <MessageCircle className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <span className="text-gradient">AI Professor</span>
                    {isLoading && (
                      <div className="flex items-center text-xs text-muted-foreground mt-1">
                        <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                        Thinking...
                      </div>
                    )}
                  </div>
                </CardTitle>
                
                <div className="flex items-center space-x-1">
                  {speechEnabled && (
                    <Button
                      variant="glass"
                      size="icon"
                      onClick={isSpeaking ? stopSpeaking : undefined}
                      className="w-8 h-8"
                    >
                      {isSpeaking ? 
                        <VolumeX className="w-3 h-3" /> : 
                        <Volume2 className="w-3 h-3" />
                      }
                    </Button>
                  )}
                  <Button
                    variant="glass"
                    size="icon"
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="w-8 h-8"
                  >
                    {isMinimized ? 
                      <Maximize2 className="w-3 h-3" /> : 
                      <Minimize2 className="w-3 h-3" />
                    }
                  </Button>
                  <Button
                    variant="glass"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    className="w-8 h-8"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {!isMinimized && (
              <CardContent className="flex flex-col h-full p-4 pt-0">
                {/* Messages */}
                <ScrollArea className="flex-1 mb-4 pr-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-3 ${
                            message.isUser
                              ? "bg-primary text-primary-foreground ml-4"
                              : "bg-muted mr-4"
                          }`}
                        >
                          <p className="text-sm leading-relaxed">{message.content}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {formatTime(message.timestamp)}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                    {isLoading && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-start"
                      >
                        <div className="bg-muted rounded-lg p-3 mr-4">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                            <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                  <div ref={messagesEndRef} />
                </ScrollArea>

                {/* Quick Questions */}
                {messages.length <= 1 && (
                  <div className="mb-4">
                    <p className="text-xs text-muted-foreground mb-2">Quick questions:</p>
                    <div className="flex flex-wrap gap-1">
                      {quickQuestions.slice(0, 3).map((question, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="cursor-pointer hover:bg-primary/20 text-xs"
                          onClick={() => handleQuickQuestion(question)}
                        >
                          {question}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input */}
                <div className="flex space-x-2">
                  <Input
                    placeholder="Ask me anything about learning..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isLoading}
                    className="glass-morphism border-white/20"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                    variant="hero"
                    size="icon"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AIProfessorChat;