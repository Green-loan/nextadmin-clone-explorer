
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import crypto from 'crypto';

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
  signUp: (email: string, password: string, fullName: string, gender: string, homeAddress: string, cellphone: string) => Promise<void>;
}

// Utility function for password encryption with salt
const encryptPassword = (password: string): { encryptedPass: string, salt: string } => {
  // Generate a random salt
  const salt = crypto.randomBytes(16).toString('hex');
  
  // Use the salt with the password and hash it
  const hash = crypto.pbkdf2Sync(password, salt + 'clinton', 1000, 64, 'sha512').toString('hex');
  
  return {
    encryptedPass: hash,
    salt: salt
  };
};

// Utility function to verify password
const verifyPassword = (password: string, hash: string, salt: string): boolean => {
  const verifyHash = crypto.pbkdf2Sync(password, salt + 'clinton', 1000, 64, 'sha512').toString('hex');
  return hash === verifyHash;
};

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
  const signUp = async (email: string, password: string, fullName: string, gender: string, homeAddress: string, cellphone: string) => {
    try {
      setIsLoading(true);
      
      // Sign up with Supabase Auth
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (authError) throw authError;
      
      // Generate user number (e.g., #4, #5, etc.)
      const { count, error: countError } = await supabase
        .from("users_account")
        .select("*", { count: 'exact', head: true });
      
      if (countError) throw countError;
      
      const userNumber = `#${(count || 0) + 1}`;
      
      // Encrypt the password
      const { encryptedPass, salt } = encryptPassword(password);
      
      // If auth signup succeeded, insert the user data into users_account table
      const { error: profileError } = await supabase.from("users_account").insert([
        {
          email,
          full_names: fullName,
          gender: gender,
          home_address: homeAddress,
          cellphone: cellphone,
          user_number: userNumber,
          role: 3, // Default user role
          encryptedPass: encryptedPass,
          salt: salt,
          date_of_birth: null, // Default null
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
