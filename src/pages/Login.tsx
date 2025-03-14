
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import Logo from "@/components/ui/logo";
import ThreeBackground from "@/components/ui/ThreeBackground";
import { Eye, EyeOff } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const { signIn, signUp, isLoading } = useAuth();
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  
  // Signup form state
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showSignupConfirmPassword, setShowSignupConfirmPassword] = useState(false);
  const [signupFullName, setSignupFullName] = useState("");
  const [signupGender, setSignupGender] = useState("");
  const [signupHomeAddress, setSignupHomeAddress] = useState("");
  const [signupCellphone, setSignupCellphone] = useState("");
  
  // State for button loading
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginEmail || !loginPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    
    if (isSigningIn) {
      return; // Prevent multiple submissions
    }
    
    try {
      setIsSigningIn(true);
      const toastId = toast.loading("Logging in...");
      
      await signIn(loginEmail, loginPassword);
      
      toast.dismiss(toastId);
      // Explicitly navigate to dashboard after successful login
      navigate("/");
    } catch (error) {
      console.error("Login failed:", error);
      // We don't need to show an error toast here as it's already shown in the useAuth hook
    } finally {
      setIsSigningIn(false);
    }
  };
  
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signupEmail || !signupPassword || !signupConfirmPassword || !signupFullName || !signupGender || !signupCellphone) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    if (signupPassword !== signupConfirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    if (isSigningUp) {
      return; // Prevent multiple submissions
    }
    
    let toastId: string | number = "";
    
    try {
      setIsSigningUp(true);
      toastId = toast.loading("Creating your account...");
      
      await signUp(
        signupEmail, 
        signupPassword, 
        signupFullName,
        signupGender,
        signupHomeAddress || "",
        signupCellphone
      );
      
      // Reset form fields after successful signup
      setSignupEmail("");
      setSignupPassword("");
      setSignupConfirmPassword("");
      setSignupFullName("");
      setSignupGender("");
      setSignupHomeAddress("");
      setSignupCellphone("");
      
      // Switch to login tab
      document.getElementById("login-tab")?.click();
      
      toast.success("Account created! Please check your email to verify your account.");
    } catch (error) {
      console.error("Signup error in form:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create account");
    } finally {
      // Ensure we dismiss the loading toast in all cases
      if (toastId) {
        toast.dismiss(toastId);
      }
      setIsSigningUp(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <ThreeBackground />
      
      <Card className="w-full max-w-md shadow-lg bg-white/30 backdrop-blur-md border border-white/20">
        <CardHeader className="space-y-1 flex flex-col items-center">
          <Logo size="lg" />
          <CardDescription className="text-center mt-2 text-foreground font-medium">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white/20">
            <TabsTrigger id="login-tab" value="login" className="data-[state=active]:bg-white/30">Login</TabsTrigger>
            <TabsTrigger value="signup" className="data-[state=active]:bg-white/30">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <form onSubmit={handleLogin}>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground font-medium">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder=""
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    className="bg-white/50 border-white/30"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-foreground font-medium">Password</Label>
                    <Link to="/forgot-password" className="text-sm text-black hover:text-gray-700 font-medium">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Input 
                      id="password" 
                      type={showLoginPassword ? "text" : "password"}
                      placeholder=""
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      className="bg-white/50 border-white/30 pr-10"
                    />
                    <button 
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                    >
                      {showLoginPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  type="submit" 
                  className="w-full bg-green-600 hover:bg-green-700" 
                  disabled={isSigningIn || isLoading}
                >
                  {isSigningIn ? "Logging in..." : "Login"}
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
          
          <TabsContent value="signup">
            <form onSubmit={handleSignup}>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="full-name" className="text-foreground font-medium">Full Name <span className="text-red-500">*</span></Label>
                  <Input 
                    id="full-name" 
                    placeholder=""
                    value={signupFullName}
                    onChange={(e) => setSignupFullName(e.target.value)}
                    required
                    className="bg-white/50 border-white/30"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email" className="text-foreground font-medium">Email <span className="text-red-500">*</span></Label>
                  <Input 
                    id="signup-email" 
                    type="email" 
                    placeholder="" 
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    required
                    className="bg-white/50 border-white/30"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-foreground font-medium">Gender <span className="text-red-500">*</span></Label>
                  <select
                    id="gender"
                    value={signupGender}
                    onChange={(e) => setSignupGender(e.target.value)}
                    required
                    className="w-full p-2 rounded-md bg-white/50 border border-white/30"
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cellphone" className="text-foreground font-medium">Cellphone <span className="text-red-500">*</span></Label>
                  <Input 
                    id="cellphone" 
                    type="tel" 
                    placeholder="" 
                    value={signupCellphone}
                    onChange={(e) => setSignupCellphone(e.target.value)}
                    required
                    className="bg-white/50 border-white/30"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="home-address" className="text-foreground font-medium">Home Address</Label>
                  <Input 
                    id="home-address" 
                    placeholder="" 
                    value={signupHomeAddress}
                    onChange={(e) => setSignupHomeAddress(e.target.value)}
                    className="bg-white/50 border-white/30"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password" className="text-foreground font-medium">Password <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <Input 
                      id="signup-password" 
                      type={showSignupPassword ? "text" : "password"}
                      placeholder=""
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      required
                      className="bg-white/50 border-white/30 pr-10"
                    />
                    <button 
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      onClick={() => setShowSignupPassword(!showSignupPassword)}
                    >
                      {showSignupPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-foreground font-medium">Confirm Password <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <Input 
                      id="confirm-password" 
                      type={showSignupConfirmPassword ? "text" : "password"}
                      placeholder=""
                      value={signupConfirmPassword}
                      onChange={(e) => setSignupConfirmPassword(e.target.value)}
                      required
                      className="bg-white/50 border-white/30 pr-10"
                    />
                    <button 
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      onClick={() => setShowSignupConfirmPassword(!showSignupConfirmPassword)}
                    >
                      {showSignupConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  type="submit" 
                  className="w-full bg-green-600 hover:bg-green-700" 
                  disabled={isLoading}
                >
                  {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default Login;
