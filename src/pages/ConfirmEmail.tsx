
import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import ThreeDBackground from "@/components/auth/ThreeDBackground";
import { Mail, CheckCircle, XCircle } from "lucide-react";

export default function ConfirmEmail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const verifyToken = async () => {
      try {
        setIsLoading(true);
        console.log("Starting email verification process");
        
        // Check if we have a hash in the URL (Supabase auth redirect)
        const hashParams = location.hash ? 
          Object.fromEntries(new URLSearchParams(location.hash.substring(1))) : 
          {};
        
        // Log the current URL and parameters for debugging
        console.log("Current URL:", window.location.href);
        console.log("Current path:", location.pathname);
        console.log("Hash parameters:", hashParams);
        console.log("Search parameters:", Object.fromEntries(searchParams.entries()));
        
        // Check for access_token in the hash (Supabase auth redirect)
        if (hashParams.access_token && hashParams.type === 'signup') {
          console.log("Found access token in URL hash, proceeding with verification");
          
          // Set the session from the hash
          const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
            access_token: hashParams.access_token,
            refresh_token: hashParams.refresh_token || '',
          });
          
          if (sessionError) {
            console.error("Session error:", sessionError);
            throw sessionError;
          }
          
          console.log("Session set successfully:", sessionData);
          
          // Get the current user
          const { data, error: userError } = await supabase.auth.getUser();
          
          if (userError) {
            console.error("User retrieval error:", userError);
            throw userError;
          }
          
          if (!data.user?.id) {
            console.error("No user found in session");
            throw new Error("User not found. Please try signing in again.");
          }
          
          console.log("User authenticated successfully:", data.user.email);
          
          // Check if user already exists in users_account table
          const { data: existingUser, error: checkError } = await supabase
            .from('users_account')
            .select('*')
            .eq('id', data.user.id)
            .single();
            
          if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found"
            console.error("Error checking user:", checkError);
            throw checkError;
          }
          
          // If user exists, update confirmed status
          if (existingUser) {
            console.log("Existing user found, updating confirmed status");
            const { error: updateError } = await supabase
              .from('users_account')
              .update({ confirmed: true })
              .eq('id', data.user.id);
              
            if (updateError) {
              console.error("Database update error:", updateError);
              throw updateError;
            }
          } else {
            // If user doesn't exist in the users_account table, create a new record
            console.log("User not found in users_account table, creating new record");
            const { error: insertError } = await supabase
              .from('users_account')
              .insert([{
                id: data.user.id,
                email: data.user.email,
                confirmed: true,
                role: 3, // Default role for new users
                created_at: new Date()
              }]);
              
            if (insertError) {
              console.error("Database insert error:", insertError);
              throw insertError;
            }
          }
          
          // Success
          setIsConfirmed(true);
          toast.success("Email verified successfully!");
          return;
        }
        
        // Original token-based verification flow
        const token = searchParams.get("token");
        const type = searchParams.get("type");
        
        console.log("Token parameters:", { token, type });
        
        if (!token || type !== "signup") {
          // Handle case where user navigates directly to /confirm-email or /ConfirmEmail
          if (location.pathname === "/confirm-email" || location.pathname === "/ConfirmEmail") {
            console.log("Direct navigation to confirm email page detected, checking auth state");
            
            // Check if user is already authenticated
            const { data: { user } } = await supabase.auth.getUser();
            
            if (user) {
              console.log("User is authenticated, checking confirmation status");
              
              // Check if user is already confirmed in the database
              const { data: userData, error: userDataError } = await supabase
                .from('users_account')
                .select('confirmed')
                .eq('id', user.id)
                .single();
                
              if (userDataError) {
                console.error("Error checking user confirmation status:", userDataError);
                setError("Unable to verify your account status. Please try signing in.");
                setIsLoading(false);
                return;
              }
              
              if (userData && userData.confirmed) {
                console.log("User is already confirmed");
                setIsConfirmed(true);
                setIsLoading(false);
                return;
              } else {
                setError("Your email has not been verified yet. Please check your inbox for the verification link.");
                setIsLoading(false);
                return;
              }
            } else {
              setError("No active session found. Please sign in or use the verification link sent to your email.");
              setIsLoading(false);
              return;
            }
          } else {
            setError("Invalid confirmation link. Please request a new one.");
            setIsLoading(false);
            return;
          }
        }
        
        // Call Supabase to verify the token
        const { error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: "signup"
        });
        
        if (error) {
          console.error("OTP verification error:", error);
          throw error;
        }
        
        // Get the current user
        const { data, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error("User retrieval error:", userError);
          throw userError;
        }
        
        if (!data.user?.id) {
          console.error("No user found in session");
          throw new Error("User not found. Please try signing in again.");
        }
        
        // Check if user exists in users_account table
        const { data: existingUser, error: checkError } = await supabase
          .from('users_account')
          .select('*')
          .eq('id', data.user.id)
          .single();
          
        if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found"
          console.error("Error checking user:", checkError);
          throw checkError;
        }
        
        // If user exists, update confirmed status
        if (existingUser) {
          console.log("Existing user found, updating confirmed status");
          const { error: updateError } = await supabase
            .from('users_account')
            .update({ confirmed: true })
            .eq('id', data.user.id);
            
          if (updateError) {
            console.error("Database update error:", updateError);
            throw updateError;
          }
        } else {
          // If user doesn't exist in the users_account table, create a new record
          console.log("User not found in users_account table, creating new record");
          const { error: insertError } = await supabase
            .from('users_account')
            .insert([{
              id: data.user.id,
              email: data.user.email,
              confirmed: true,
              role: 3, // Default role for new users
              created_at: new Date()
            }]);
            
          if (insertError) {
            console.error("Database insert error:", insertError);
            throw insertError;
          }
        }
        
        // Success
        setIsConfirmed(true);
        toast.success("Email verified successfully!");
      } catch (err) {
        console.error("Verification error:", err);
        setError(err instanceof Error ? err.message : "Failed to verify email");
      } finally {
        setIsLoading(false);
      }
    };
    
    verifyToken();
  }, [searchParams, location.hash, location.pathname]);
  
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-gradient-to-b from-slate-900 to-slate-800">
      <ThreeDBackground />
      
      <div className="w-full max-w-md z-10 px-8 py-12 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-xl">
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-6">
            <img 
              src="/lovable-uploads/a2ba7d49-d862-44f2-ba79-09dfd459d0dd.png" 
              alt="Green Finance Logo" 
              className="h-24 w-auto"
            />
          </div>
          
          {isLoading ? (
            <>
              <div className="flex justify-center mb-4">
                <div className="h-12 w-12 border-2 border-green-400 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Verifying Your Email</h1>
              <p className="text-slate-300">Please wait while we confirm your email address...</p>
            </>
          ) : isConfirmed ? (
            <>
              <div className="flex justify-center mb-4">
                <CheckCircle className="h-16 w-16 text-green-400" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Email Verified!</h1>
              <p className="text-slate-300">Your email has been successfully verified.</p>
              <Button 
                onClick={() => navigate("/signin")} 
                className="mt-6 bg-green-600 hover:bg-green-700 text-white"
              >
                Sign In Now
              </Button>
            </>
          ) : (
            <>
              <div className="flex justify-center mb-4">
                <XCircle className="h-16 w-16 text-red-400" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Verification Failed</h1>
              <p className="text-slate-300 mb-4">{error || "Something went wrong with email verification."}</p>
              <div className="mt-6 space-y-4">
                <Button 
                  onClick={() => navigate("/signup")} 
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  Try Signing Up Again
                </Button>
                <Button 
                  onClick={() => navigate("/signin")} 
                  variant="outline" 
                  className="w-full border-white/20 text-white hover:bg-white/10"
                >
                  Go to Sign In
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
