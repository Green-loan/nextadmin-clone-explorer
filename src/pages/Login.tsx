
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

const Login = () => {
  const navigate = useNavigate();
  const { signIn, signUp, isLoading } = useAuth();
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  // Signup form state
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");
  const [signupFullName, setSignupFullName] = useState("");
  const [signupGender, setSignupGender] = useState("");
  const [signupHomeAddress, setSignupHomeAddress] = useState("");
  const [signupCellphone, setSignupCellphone] = useState("");
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginEmail || !loginPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    
    try {
      await signIn(loginEmail, loginPassword);
      navigate("/");
    } catch (error) {
      // Error is already handled in the signIn function
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
    
    try {
      await signUp(
        signupEmail, 
        signupPassword, 
        signupFullName,
        signupGender,
        signupHomeAddress,
        signupCellphone
      );
      navigate("/");
    } catch (error) {
      // Error is already handled in the signUp function
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
            <TabsTrigger value="login" className="data-[state=active]:bg-white/30">Login</TabsTrigger>
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
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder=""
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    className="bg-white/50 border-white/30"
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  type="submit" 
                  className="w-full bg-green-600 hover:bg-green-700" 
                  disabled={isLoading}
                >
                  {isLoading ? "Logging in..." : "Login"}
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
                  <Input 
                    id="signup-password" 
                    type="password"
                    placeholder=""
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    required
                    className="bg-white/50 border-white/30"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-foreground font-medium">Confirm Password <span className="text-red-500">*</span></Label>
                  <Input 
                    id="confirm-password" 
                    type="password"
                    placeholder=""
                    value={signupConfirmPassword}
                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                    required
                    className="bg-white/50 border-white/30"
                  />
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
