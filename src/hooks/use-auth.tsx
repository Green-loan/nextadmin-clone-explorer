
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

type User = {
  id: string;
  email: string;
  role?: number;
  full_names?: string;
};

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        if (session?.user) {
          // Get user profile from users_account table
          const { data: profile, error: profileError } = await supabase
            .from("users_account")
            .select("*")
            .eq("email", session.user.email)
            .single();
            
          if (profileError && profileError.code !== "PGRST116") {
            console.error("Error fetching user profile:", profileError);
          }
          
          setUser({
            id: session.user.id,
            email: session.user.email || "",
            role: profile?.role || 3,
            full_names: profile?.full_names || "",
          });
        }
      } catch (error) {
        console.error("Session check error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkSession();
    
    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          // Get user profile from users_account table
          const { data: profile, error: profileError } = await supabase
            .from("users_account")
            .select("*")
            .eq("email", session.user.email)
            .single();
            
          if (profileError && profileError.code !== "PGRST116") {
            console.error("Error fetching user profile:", profileError);
          }
          
          setUser({
            id: session.user.id,
            email: session.user.email || "",
            role: profile?.role || 3,
            full_names: profile?.full_names || "",
          });
        } else {
          setUser(null);
        }
        setIsLoading(false);
      }
    );
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);
  
  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      toast.success("Login successful!");
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to login");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Sign up with email and password
  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      setIsLoading(true);
      
      // Sign up with Supabase Auth
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (authError) throw authError;
      
      // If auth signup succeeded, insert the user data into users_account table
      const { error: profileError } = await supabase.from("users_account").insert([
        {
          email,
          full_names: fullName,
          gender: "", // Default empty
          role: 3, // Default user role
        },
      ]);
      
      if (profileError) throw profileError;
      
      toast.success("Account created successfully! Please check your email to verify your account.");
    } catch (error) {
      console.error("Signup error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create account");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Sign out
  const signOut = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      setUser(null);
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to logout");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signOut, signUp }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  return context;
}
