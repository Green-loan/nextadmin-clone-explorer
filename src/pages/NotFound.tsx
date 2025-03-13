
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <Layout>
      <div className="min-h-[60vh] flex flex-col items-center justify-center animate-fade-in">
        <div className="flex flex-col items-center text-center max-w-md">
          <div className="rounded-full bg-amber-100 dark:bg-amber-900/30 p-4 mb-6">
            <AlertTriangle className="h-8 w-8 text-amber-600 dark:text-amber-400" />
          </div>
          <h1 className="text-4xl font-bold mb-4">404</h1>
          <p className="text-xl text-muted-foreground mb-6">
            Oops! The page you're looking for cannot be found.
          </p>
          <Button asChild className="px-6">
            <Link to="/">Return to Dashboard</Link>
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;
