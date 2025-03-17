
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  userRole: number | null;
  isConfirmed: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<number | null>(null);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const fetchUserData = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users_account')
        .select('role, confirmed')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching user data:', error);
        return;
      }
      
      if (data) {
        setUserRole(data.role || null);
        setIsConfirmed(data.confirmed || false);
      }
    } catch (err) {
      console.error('Error in fetchUserData:', err);
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserData(session.user.id);
      }
      
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserData(session.user.id);
      } else {
        setUserRole(null);
        setIsConfirmed(false);
      }
      
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUserRole(null);
    setIsConfirmed(false);
  };

  const value = {
    user,
    session,
    isLoading,
    userRole,
    isConfirmed,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
