
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import Dashboard from "./pages/Index";
import Users from "./pages/Users";
import Settings from "./pages/Settings";
import Reports from "./pages/Reports";
import Analytics from "./pages/Analytics";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import ConfirmEmail from "./pages/ConfirmEmail";
import NotFound from "./pages/NotFound";
import LandingPage from "./pages/LandingPage";
import UserDashboard from "./pages/UserDashboard";

const queryClient = new QueryClient();

// Protected route component with role-based access
const ProtectedRoute = ({ 
  children, 
  allowedRoles = [1, 2, 3],
  requireConfirmation = true 
}: { 
  children: React.ReactNode;
  allowedRoles?: number[];
  requireConfirmation?: boolean;
}) => {
  const { user, isLoading, userRole, isConfirmed } = useAuth();
  
  if (isLoading) {
    return <div className="h-screen w-full flex items-center justify-center">Loading...</div>;
  }
  
  // Check if user is authenticated
  if (!user) {
    return <Navigate to="/signin" replace />;
  }
  
  // Check if email confirmation is required and if the user is confirmed
  if (requireConfirmation && !isConfirmed) {
    return <Navigate to={`/confirm-email?email=${encodeURIComponent(user.email || '')}`} replace />;
  }
  
  // Check if user has the required role
  if (userRole !== null && !allowedRoles.includes(userRole)) {
    // Redirect based on role
    if (userRole === 1) {
      return <Navigate to="/admin" replace />; // Admin dashboard
    } else if (userRole === 3) {
      return <Navigate to="/user-dashboard" replace />; // User dashboard
    } else {
      return <Navigate to="/" replace />; // Default fallback
    }
  }
  
  return <>{children}</>;
};

// Component to redirect based on user role
const RoleBasedRedirect = () => {
  const { userRole, isLoading, user } = useAuth();
  
  if (isLoading) {
    return <div className="h-screen w-full flex items-center justify-center">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/signin" replace />;
  }
  
  if (userRole === 1) {
    return <Navigate to="/admin" replace />; // Admin dashboard
  } else if (userRole === 3) {
    return <Navigate to="/user-dashboard" replace />; // User dashboard
  }
  
  // Default route if role is not recognized
  return <Navigate to="/" replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
        <BrowserRouter>
          <AuthProvider>
            <Toaster />
            <Sonner position="top-right" closeButton />
            <Routes>
              {/* Public routes - accessible without login */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/home" element={<Navigate to="/" replace />} />
              
              {/* Auth routes - no login required */}
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/confirm-email" element={<ConfirmEmail />} />
              <Route path="/ConfirmEmail" element={<Navigate to="/confirm-email" replace />} />
              
              {/* Role-based redirect route */}
              <Route path="/redirect" element={<RoleBasedRedirect />} />
              
              {/* Admin routes (role 1) */}
              <Route path="/admin" element={<ProtectedRoute allowedRoles={[1]}><Dashboard /></ProtectedRoute>} />
              <Route path="/users" element={<ProtectedRoute allowedRoles={[1]}><Users /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute allowedRoles={[1, 3]}><Settings /></ProtectedRoute>} />
              <Route path="/reports" element={<ProtectedRoute allowedRoles={[1]}><Reports /></ProtectedRoute>} />
              <Route path="/analytics" element={<ProtectedRoute allowedRoles={[1]}><Analytics /></ProtectedRoute>} />
              
              {/* User routes (role 3) */}
              <Route path="/user-dashboard" element={<ProtectedRoute allowedRoles={[3]}>
                <UserDashboard />
              </ProtectedRoute>} />
              
              {/* Default redirection */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
