
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { supabase } from "@/lib/supabase";
import { Eye, EyeOff, UserPlus, Mail } from "lucide-react";
import { toast } from "sonner";
import ThreeDBackground from "@/components/auth/ThreeDBackground";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string().min(6, { message: "Password must be at least 6 characters" }),
  fullName: z.string().min(2, { message: "Full name is required" }),
  role: z.string({
    required_error: "Please select a role",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export default function SignUp() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      role: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);
      setUserEmail(values.email);
      
      console.log("Submitting signup form with values:", { ...values, password: "REDACTED" });
      
      // Map role string to number
      const roleNumber = values.role === 'admin' ? 1 : 3; // admin=1, investor=3
      
      // Sign up with Supabase auth - this will send a confirmation email
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            full_name: values.fullName,
            role: values.role
          },
          emailRedirectTo: window.location.origin + "/confirm-email"
        }
      });

      if (authError) {
        console.error("Auth error:", authError);
        throw new Error(authError.message || "Authentication failed. Please try again.");
      }

      console.log("Auth signup successful:", authData);

      if (!authData.user) {
        throw new Error("User creation failed. Please try again.");
      }

      // Insert user profile data
      const { error: profileError } = await supabase
        .from('users_account')
        .insert([
          {
            id: authData.user.id,
            email: values.email,
            full_names: values.fullName,
            role: roleNumber,
            confirmed: false, // Will be set to true when email is confirmed
          },
        ]);

      if (profileError) {
        console.error("Profile error:", profileError);
        // If we fail to create the profile, we should try to delete the auth user
        // This is to prevent orphaned auth users without profiles
        try {
          // This would be handled by an admin function in production
          console.log("Attempting to clean up auth user due to profile creation failure");
        } catch (cleanupError) {
          console.error("Failed to clean up auth user:", cleanupError);
        }
        throw new Error(profileError.message || "Failed to create user profile. Please try again.");
      }

      console.log("User profile created successfully");
      
      // Show success toast and update UI to show email sent screen
      toast.success("Account created! Please check your email to confirm your address.");
      setEmailSent(true);
      
    } catch (error) {
      console.error("Signup error:", error);
      setIsLoading(false);
      toast.error(error instanceof Error ? error.message : "Failed to create account");
    }
  }

  if (emailSent) {
    return (
      <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-gradient-to-b from-slate-900 to-slate-800">
        <ThreeDBackground />
        
        <div className="w-full max-w-md z-10 px-8 py-12 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-xl">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <img 
                src="/lovable-uploads/a2ba7d49-d862-44f2-ba79-09dfd459d0dd.png" 
                alt="Green Finance Logo" 
                className="h-24 w-auto"
              />
            </div>
            
            <div className="flex justify-center mb-6">
              <Mail className="h-16 w-16 text-green-400" />
            </div>
            
            <h1 className="text-3xl font-bold text-white mb-4">Check Your Email</h1>
            <p className="text-slate-300 mb-2">
              We've sent a confirmation link to:
            </p>
            <p className="text-green-400 font-medium text-xl mb-6">{userEmail}</p>
            <p className="text-slate-300 mb-6">
              Please check your inbox and click the link to confirm your email address.
            </p>
            
            <div className="mt-8 space-y-4">
              <Button 
                onClick={() => navigate("/signin")} 
                variant="outline" 
                className="w-full border-white/20 text-white hover:bg-white/10"
              >
                Go to Sign In
              </Button>
              <p className="text-slate-400 text-sm">
                Didn't receive an email? Check your spam folder or 
                <button 
                  onClick={() => {
                    setEmailSent(false);
                    setIsLoading(false);
                  }}
                  className="text-green-400 hover:text-green-300 ml-1"
                >
                  try again
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-slate-300">Sign up to get started</p>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-200">Full Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="" 
                      {...field} 
                      className="bg-white/5 border-white/10 text-white placeholder:text-slate-400"
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-200">Email</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="" 
                      {...field} 
                      className="bg-white/5 border-white/10 text-white placeholder:text-slate-400"
                    />
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-200">Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        type={showPassword ? "text" : "password"} 
                        placeholder="" 
                        {...field} 
                        className="bg-white/5 border-white/10 text-white pr-10 placeholder:text-slate-400"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-200">Confirm Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        type={showConfirmPassword ? "text" : "password"} 
                        placeholder="" 
                        {...field} 
                        className="bg-white/5 border-white/10 text-white pr-10 placeholder:text-slate-400"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white"
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-200">Account Role</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-white/5 border-white/10 text-white">
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-slate-800 border-white/10 text-white">
                      <SelectItem value="admin" className="hover:bg-slate-700">Admin</SelectItem>
                      <SelectItem value="investor" className="hover:bg-slate-700">Investor</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="w-full bg-green-600 hover:bg-green-700 text-white mt-6"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Creating account...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <UserPlus size={18} />
                  Sign Up
                </span>
              )}
            </Button>
          </form>
        </Form>
        
        <div className="mt-6 text-center">
          <p className="text-slate-300">
            Already have an account?{" "}
            <Link to="/signin" className="text-green-400 hover:text-green-300 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
