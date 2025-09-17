import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithEmailOtp: (email: string) => Promise<{ error?: Error } | void>;
  signOut: () => Promise<void>;
  saveMessage: (payload: { courseId?: string; role: "user" | "assistant"; content: string }) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const {
        data: { session: initialSession },
      } = await supabase.auth.getSession();
      setSession(initialSession);
      setUser(initialSession?.user ?? null);
      setLoading(false);
    };
    init();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
    });
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    session,
    loading,
    signInWithEmailOtp: async (email: string) => {
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) return { error };
    },
    signOut: async () => {
      await supabase.auth.signOut();
    },
    saveMessage: async ({ courseId, role, content }) => {
      try {
        if (user) {
          const { error } = await supabase.from("messages").insert({
            user_id: user.id,
            course_id: courseId ?? null,
            role,
            content,
          });
          if (error) throw error;
        } else {
          const local = JSON.parse(localStorage.getItem("messages") || "[]");
          local.push({ courseId: courseId ?? null, role, content, createdAt: new Date().toISOString() });
          localStorage.setItem("messages", JSON.stringify(local));
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
      }
    },
  }), [user, session, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};


