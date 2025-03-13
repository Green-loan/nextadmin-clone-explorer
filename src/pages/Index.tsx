
import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import StatCard from '@/components/dashboard/StatCard';
import ActivityChart from '@/components/dashboard/ActivityChart';
import RecentSales from '@/components/dashboard/RecentSales';
import Overview from '@/components/dashboard/Overview';
import { 
  DollarSign, 
  Users, 
  CreditCard, 
  Activity
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Layout>
      <div className="grid gap-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Revenue"
            value="$45,231.89"
            description="vs. previous month"
            icon={DollarSign}
            trend={20.1}
            className={isLoading ? "animate-pulse" : ""}
          />
          <StatCard
            title="New Customers"
            value="2,350"
            description="vs. previous month"
            icon={Users}
            trend={5.5}
            className={isLoading ? "animate-pulse" : ""}
          />
          <StatCard
            title="Sales Today"
            value="$12,234.00"
            description="vs. previous day"
            icon={CreditCard}
            trend={-3.2}
            className={isLoading ? "animate-pulse" : ""}
          />
          <StatCard
            title="Active Sessions"
            value="568"
            description="Last 24 hours"
            icon={Activity}
            trend={12.2}
            className={isLoading ? "animate-pulse" : ""}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
          <ActivityChart />
          <RecentSales />
        </div>

        {/* Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Overview />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover-scale">
            <CardContent className="p-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Welcome to NextAdmin</h3>
                <p className="text-sm text-muted-foreground">
                  This is a demo dashboard for NextAdmin. Explore the features and components available in this admin dashboard template.
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="hover-scale">
            <CardContent className="p-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Need Help?</h3>
                <p className="text-sm text-muted-foreground">
                  Check out our documentation for more information on how to use NextAdmin or contact our support team.
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="hover-scale">
            <CardContent className="p-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">What's New</h3>
                <p className="text-sm text-muted-foreground">
                  We've added new features and improvements to NextAdmin. Check out our changelog to see what's new.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
