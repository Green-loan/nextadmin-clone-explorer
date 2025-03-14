
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
  signUp: (email: string, password: string, fullName: string, gender: string, homeAddress: string, cellphone: string) => Promise<void>;
}

// Utility function to convert a string to an ArrayBuffer
const stringToArrayBuffer = (str: string): ArrayBuffer => {
  const encoder = new TextEncoder();
  return encoder.encode(str).buffer;
};

// Utility function to convert an ArrayBuffer to a hex string
const arrayBufferToHex = (buffer: ArrayBuffer): string => {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

// Utility function for password encryption with salt using Web Crypto API
const encryptPassword = async (password: string): Promise<{ encryptedPass: string, salt: string }> => {
  // Generate a random salt
  const saltArray = new Uint8Array(16);
  window.crypto.getRandomValues(saltArray);
  const salt = arrayBufferToHex(saltArray);
  
  // Create a key from the password and salt
  const encoder = new TextEncoder();
  const data = encoder.encode(password + salt + 'clinton');
  
  // Hash the data using SHA-512
  const hashBuffer = await window.crypto.subtle.digest('SHA-512', data);
  const hash = arrayBufferToHex(hashBuffer);
  
  return {
    encryptedPass: hash,
    salt: salt
  };
};

// Utility function to verify password using Web Crypto API
const verifyPassword = async (password: string, hash: string, salt: string): Promise<boolean> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + salt + 'clinton');
  
  const hashBuffer = await window.crypto.subtle.digest('SHA-512', data);
  const calculatedHash = arrayBufferToHex(hashBuffer);
  
  return hash === calculatedHash;
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
      
      // Encrypt the password using Web Crypto API
      const { encryptedPass, salt } = await encryptPassword(password);
      
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
      
      if (profileError) {
        console.error("Profile error:", profileError);
        throw profileError;
      }
      
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
