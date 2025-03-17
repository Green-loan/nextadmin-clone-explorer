
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import Dashboard from "./pages/Index";
import Users from "./pages/Users";
import Settings from "./pages/Settings";
import Reports from "./pages/Reports";
import Analytics from "./pages/Analytics";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import ConfirmEmail from "./pages/ConfirmEmail";
import NotFound from "./pages/NotFound";

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
      return <Navigate to="/" replace />; // Admin dashboard
    } else if (userRole === 3) {
      return <Navigate to="/investors" replace />; // Investors site
    } else {
      return <Navigate to="/" replace />; // Default fallback
    }
  }
  
  return <>{children}</>;
};

// Component to redirect based on user role
const RoleBasedRedirect = () => {
  const { userRole, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="h-screen w-full flex items-center justify-center">Loading...</div>;
  }
  
  if (userRole === 1) {
    return <Navigate to="/" replace />; // Admin dashboard
  } else if (userRole === 3) {
    return <Navigate to="/investors" replace />; // Investors site
  }
  
  // Default route if role is not recognized
  return <Navigate to="/" replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner position="top-right" closeButton />
        <BrowserRouter>
          <Routes>
            {/* Auth routes */}
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/confirm-email" element={<ConfirmEmail />} />
            {/* Add a redirect from /ConfirmEmail to /confirm-email */}
            <Route path="/ConfirmEmail" element={<Navigate to="/confirm-email" replace />} />
            
            {/* Role-based redirect route */}
            <Route path="/redirect" element={<RoleBasedRedirect />} />
            
            {/* Admin routes (role 1) */}
            <Route path="/" element={<ProtectedRoute allowedRoles={[1]}><Dashboard /></ProtectedRoute>} />
            <Route path="/users" element={<ProtectedRoute allowedRoles={[1]}><Users /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute allowedRoles={[1]}><Settings /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute allowedRoles={[1]}><Reports /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute allowedRoles={[1]}><Analytics /></ProtectedRoute>} />
            
            {/* Investor routes (role 3) */}
            <Route path="/investors" element={<ProtectedRoute allowedRoles={[3]}>
              <div className="p-8">
                <h1 className="text-2xl font-bold">Investor Dashboard</h1>
                <p className="mt-4">This is the investors site. This page needs to be created.</p>
              </div>
            </ProtectedRoute>} />
            
            {/* Catch-all for 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
