
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Eye, EyeOff, LogIn } from "lucide-react";
import { toast } from "sonner";
import ThreeDBackground from "@/components/auth/ThreeDBackground";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

export default function SignIn() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        // Check if user is confirmed and get their role
        const { data: userData, error: userError } = await supabase
          .from('users_account')
          .select('confirmed, role')
          .eq('id', data.user.id)
          .single();
          
        if (userError) {
          console.error("Error fetching user data:", userError);
          toast.success("Signed in successfully!");
          navigate("/redirect"); // Use the redirect route to determine where to go
          return;
        }
        
        // If user is not confirmed, send them to confirm email page
        if (!userData.confirmed) {
          toast.warning("Please verify your email address before continuing.");
          navigate(`/confirm-email?email=${encodeURIComponent(values.email)}`);
          return;
        }
        
        toast.success("Signed in successfully!");
        
        // Redirect based on role
        if (userData.role === 1) {
          navigate("/admin"); // Admin dashboard
        } else if (userData.role === 3) {
          navigate("/user-dashboard"); // Investors site
        } else {
          navigate("/redirect"); // Default redirect
        }
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to sign in");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-gradient-to-b from-slate-900 to-slate-800">
      <ThreeDBackground />
      
      <div className="w-full max-w-md z-10 px-8 py-12 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 shadow-xl">
        <div className="absolute top-6 left-6">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white hover:bg-white/10" 
            onClick={() => navigate('/')}
            aria-label="Back to landing page"
          >
            <ArrowLeft size={24} />
          </Button>
        </div>
        
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-6">
            <img 
              src="/lovable-uploads/a2ba7d49-d862-44f2-ba79-09dfd459d0dd.png" 
              alt="Green Finance Logo" 
              className="h-24 w-auto" 
            />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-slate-300">Sign in to access your account</p>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
            
            <Button 
              type="submit" 
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <LogIn size={18} />
                  Sign In
                </span>
              )}
            </Button>
          </form>
        </Form>
        
        <div className="mt-6 text-center">
          <p className="text-slate-300">
            Don't have an account?{" "}
            <Link to="/signup" className="text-green-400 hover:text-green-300 font-medium">
              Sign up
            </Link>
          </p>
          <p className="mt-2 text-slate-300">
            <Link to="/confirm-email" className="text-green-400 hover:text-green-300 font-medium">
              Need to verify your email?
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
