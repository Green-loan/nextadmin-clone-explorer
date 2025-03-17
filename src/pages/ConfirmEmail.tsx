
import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import ThreeDBackground from "@/components/auth/ThreeDBackground";
import { Mail, CheckCircle, XCircle } from "lucide-react";

export default function ConfirmEmail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Extract token from URL parameters
  const token = searchParams.get("token");
  const type = searchParams.get("type");
  
  useEffect(() => {
    const verifyToken = async () => {
      if (!token || type !== "signup") {
        setError("Invalid confirmation link. Please request a new one.");
        setIsLoading(false);
        return;
      }
      
      try {
        // Call Supabase to verify the token
        const { error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: "signup"
        });
        
        if (error) {
          throw error;
        }
        
        // Update user_account in database to set confirmed = true
        const { user } = await supabase.auth.getUser();
        
        if (!user?.id) {
          throw new Error("User not found. Please try signing in again.");
        }
        
        const { error: updateError } = await supabase
          .from('users_account')
          .update({ confirmed: true })
          .eq('id', user.id);
          
        if (updateError) {
          throw updateError;
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
  }, [token, type]);
  
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
