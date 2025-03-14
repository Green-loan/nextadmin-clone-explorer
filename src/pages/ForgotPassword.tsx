
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import Logo from "@/components/ui/logo";
import ThreeBackground from "@/components/ui/ThreeBackground";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }
    
    try {
      setIsLoading(true);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      setResetSent(true);
      toast.success("Password reset instructions sent to your email");
    } catch (error) {
      console.error("Reset password error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to send reset instructions");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <ThreeBackground />
      
      <Card className="w-full max-w-md shadow-lg bg-white/70 backdrop-blur-md border border-white/50">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <Logo size="lg" />
          <CardTitle className="text-2xl mt-2 text-gray-900">Reset Password</CardTitle>
          <CardDescription className="text-center text-gray-800 font-medium">
            {resetSent ? "Check your email for reset instructions" : "Enter your email to receive reset instructions"}
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleResetPassword}>
          <CardContent className="space-y-4 pt-4">
            {!resetSent ? (
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-900 font-medium">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder=""
                  required
                  className="bg-white/90 border-gray-300"
                />
              </div>
            ) : (
              <div className="bg-green-100 p-4 rounded-md text-green-800 text-center font-medium">
                Password reset link has been sent to your email.
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-3">
            {!resetSent ? (
              <Button 
                type="submit" 
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium" 
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Send Reset Instructions"}
              </Button>
            ) : (
              <Button 
                type="button" 
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium" 
                onClick={() => navigate("/login")}
              >
                Return to Login
              </Button>
            )}
            
            <Link to="/login" className="text-sm text-green-700 hover:text-green-800 text-center font-medium">
              Back to Login
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default ForgotPassword;
