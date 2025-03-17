
import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import ThreeDBackground from "@/components/auth/ThreeDBackground";
import { Mail, CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import { 
  InputOTP,
  InputOTPGroup,
  InputOTPSlot
} from "@/components/ui/input-otp";
import { useAuth } from "@/hooks/use-auth";

export default function ConfirmEmail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  
  useEffect(() => {
    // Get email from URL params or from authenticated user
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
    } else if (user?.email) {
      setEmail(user.email);
    }
  }, [searchParams, user]);
  
  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }
    
    try {
      setIsVerifying(true);
      console.log("Verifying OTP for email:", email);
      
      // Verify the OTP with Supabase
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: "signup"
      });
      
      if (error) {
        console.error("OTP verification error:", error);
        throw error;
      }
      
      console.log("OTP verification successful:", data);
      
      // Get the current user
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error("User retrieval error:", userError);
        throw userError;
      }
      
      if (!userData.user?.id) {
        console.error("No user found in session");
        throw new Error("User not found. Please try signing in again.");
      }
      
      // Check if user exists in users_account table
      const { data: existingUser, error: checkError } = await supabase
        .from('users_account')
        .select('*')
        .eq('id', userData.user.id)
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
          .eq('id', userData.user.id);
          
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
            id: userData.user.id,
            email: userData.user.email,
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
      setIsVerifying(false);
    }
  };
  
  const handleResendCode = async () => {
    if (!email) {
      toast.error("Email address is required");
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Use the correct resend API call with the proper type parameter
      const { data, error } = await supabase.auth.resend({
        type: "signup",
        email: email,
        options: {
          emailRedirectTo: window.location.origin + "/confirm-email"
        }
      });
      
      if (error) {
        console.error("Error resending verification code:", error);
        throw error;
      }
      
      console.log("Verification code resent:", data);
      toast.success("Verification code has been resent to your email");
    } catch (err) {
      console.error("Error resending code:", err);
      setError(err instanceof Error ? err.message : "Failed to resend verification code");
      toast.error(err instanceof Error ? err.message : "Failed to resend verification code");
    } finally {
      setIsLoading(false);
    }
  };
  
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
          
          {isConfirmed ? (
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
              <h1 className="text-3xl font-bold text-white mb-2">Verify Your Email</h1>
              <p className="text-slate-300 mb-6">
                Enter the 6-digit verification code sent to:<br />
                <span className="text-green-400 font-medium">{email || 'your email'}</span>
              </p>
              
              <div className="mb-6">
                <InputOTP 
                  maxLength={6}
                  value={otp}
                  onChange={(value) => setOtp(value)}
                  className="flex justify-center"
                  containerClassName="gap-3 justify-center"
                >
                  <InputOTPGroup>
                    <InputOTPSlot 
                      index={0} 
                      className="h-12 w-12 text-lg bg-white/5 border-white/20 text-white"
                    />
                    <InputOTPSlot 
                      index={1} 
                      className="h-12 w-12 text-lg bg-white/5 border-white/20 text-white"
                    />
                    <InputOTPSlot 
                      index={2} 
                      className="h-12 w-12 text-lg bg-white/5 border-white/20 text-white"
                    />
                  </InputOTPGroup>
                  <InputOTPGroup>
                    <InputOTPSlot 
                      index={3} 
                      className="h-12 w-12 text-lg bg-white/5 border-white/20 text-white"
                    />
                    <InputOTPSlot 
                      index={4} 
                      className="h-12 w-12 text-lg bg-white/5 border-white/20 text-white"
                    />
                    <InputOTPSlot 
                      index={5} 
                      className="h-12 w-12 text-lg bg-white/5 border-white/20 text-white"
                    />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              
              {error && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-md text-white">
                  <XCircle className="h-5 w-5 text-red-400 inline-block mr-2" />
                  {error}
                </div>
              )}
              
              <div className="space-y-4">
                <Button 
                  onClick={handleVerifyOTP} 
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  disabled={isVerifying || otp.length !== 6}
                >
                  {isVerifying ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Verifying...
                    </span>
                  ) : (
                    "Verify Code"
                  )}
                </Button>
                
                <div className="flex items-center justify-between">
                  <Button 
                    variant="ghost" 
                    className="text-slate-300 hover:text-white hover:bg-white/10"
                    onClick={() => navigate("/signin")}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Sign In
                  </Button>
                  
                  <Button 
                    variant="link" 
                    className="text-green-400 hover:text-green-300"
                    onClick={handleResendCode}
                    disabled={isLoading}
                  >
                    {isLoading ? "Sending..." : "Resend Code"}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
