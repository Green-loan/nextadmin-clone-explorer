
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import Logo from "@/components/ui/logo";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import ThreeBackground from "@/components/ui/ThreeBackground";

const EmailConfirmation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your email...");
  
  useEffect(() => {
    const confirmEmail = async () => {
      try {
        // Get confirmation token from URL
        const token = searchParams.get("token");
        
        if (!token) {
          setStatus("error");
          setMessage("Invalid confirmation link. The token is missing.");
          return;
        }
        
        // Verify the token with Supabase
        const { error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: 'signup'
        });
        
        if (error) {
          throw error;
        }
        
        // Get user info from the token
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user || !user.email) {
          throw new Error("Could not retrieve user information");
        }
        
        // Update the confirmed status in users_account
        const { error: updateError } = await supabase
          .from("users_account")
          .update({ confirmed: true })
          .eq("email", user.email);
          
        if (updateError) {
          throw updateError;
        }
        
        setStatus("success");
        setMessage("Your email has been successfully verified!");
      } catch (error) {
        console.error("Email verification error:", error);
        setStatus("error");
        setMessage(error instanceof Error ? error.message : "Email verification failed. Please try again.");
      }
    };
    
    confirmEmail();
  }, [searchParams, navigate]);
  
  const handleNavigateToLogin = () => {
    navigate("/login");
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <ThreeBackground />
      
      <Card className="w-full max-w-md shadow-lg bg-white/30 backdrop-blur-md border border-white/20">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <Logo size="lg" />
          <CardTitle className="text-2xl font-bold mt-4 text-center">
            Email Verification
          </CardTitle>
          <CardDescription className="text-center mt-2 text-foreground font-medium">
            {status === "loading" ? "Please wait while we verify your email" : 
             status === "success" ? "Your account is now active" : 
             "We encountered an issue"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-6">
          {status === "loading" && (
            <div className="flex flex-col items-center">
              <Loader2 className="h-16 w-16 text-green-600 animate-spin mb-4" />
              <p className="text-center text-gray-700">{message}</p>
            </div>
          )}
          
          {status === "success" && (
            <div className="flex flex-col items-center">
              <CheckCircle className="h-16 w-16 text-green-600 mb-4" />
              <p className="text-center text-gray-700">{message}</p>
              <p className="text-center text-gray-700 mt-2">
                You can now log in to your account.
              </p>
            </div>
          )}
          
          {status === "error" && (
            <div className="flex flex-col items-center">
              <XCircle className="h-16 w-16 text-red-600 mb-4" />
              <p className="text-center text-gray-700">{message}</p>
              <p className="text-center text-gray-700 mt-2">
                Please try the verification link again or contact support.
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleNavigateToLogin} 
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {status === "success" ? "Proceed to Login" : "Back to Login"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default EmailConfirmation;
