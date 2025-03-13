
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/layout/Layout';
import StatCard from '@/components/dashboard/StatCard';
import ActivityChart from '@/components/dashboard/ActivityChart';
import LoanApplicationsCard from '@/components/dashboard/LoanApplicationsCard';
import Overview from '@/components/dashboard/Overview';
import RecentSales from '@/components/dashboard/RecentSales';
import { 
  DollarSign, 
  Users, 
  CreditCard, 
  Activity
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { getTotalLoanRevenue, getMonthlyLoanStats, getMonthlyRevenueData } from '@/lib/supabase-utils';

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);

  // Fetch loan revenue and stats
  const { data: revenueData } = useQuery({
    queryKey: ['loanRevenue'],
    queryFn: getTotalLoanRevenue,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Fetch monthly stats for comparison
  const { data: monthlyStats } = useQuery({
    queryKey: ['monthlyLoanStats'],
    queryFn: getMonthlyLoanStats,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Fetch monthly revenue data for chart
  const { data: chartData } = useQuery({
    queryKey: ['monthlyRevenueData'],
    queryFn: getMonthlyRevenueData,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    // Set loading state based on data availability
    if (revenueData && monthlyStats) {
      setIsLoading(false);
    }
  }, [revenueData, monthlyStats]);

  return (
    <Layout>
      <div className="grid gap-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to your dashboard overview.
          </p>
        </div>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Revenue"
            value={isLoading ? 'Loading...' : `R${revenueData?.totalRevenue || '0.00'}`}
            description="vs. previous month"
            icon={DollarSign}
            trend={monthlyStats?.revenueChange ? parseFloat(monthlyStats.revenueChange) : 0}
            className={isLoading ? "animate-pulse" : ""}
          />
          <StatCard
            title="New Customers"
            value="0"
            description="vs. previous month"
            icon={Users}
            trend={0}
            className={isLoading ? "animate-pulse" : ""}
          />
          <StatCard
            title="Total Loan Amount"
            value={isLoading ? 'Loading...' : `R${revenueData?.totalAmount || '0.00'}`}
            description="vs. previous month"
            icon={CreditCard}
            trend={monthlyStats?.amountChange ? parseFloat(monthlyStats.amountChange) : 0}
            className={isLoading ? "animate-pulse" : ""}
          />
          <StatCard
            title="Active Sessions"
            value="0"
            description="Last 24 hours"
            icon={Activity}
            trend={0}
            className={isLoading ? "animate-pulse" : ""}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
          <Overview chartData={chartData || []} />
          <LoanApplicationsCard />
        </div>

        {/* Recent Sales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <RecentSales />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover-scale">
            <CardContent className="p-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Welcome to Loan Management</h3>
                <p className="text-sm text-muted-foreground">
                  This dashboard provides an overview of your loan business metrics and performance.
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="hover-scale">
            <CardContent className="p-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Need Help?</h3>
                <p className="text-sm text-muted-foreground">
                  Check out our documentation for more information on how to use the loan management system.
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="hover-scale">
            <CardContent className="p-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">What's New</h3>
                <p className="text-sm text-muted-foreground">
                  Revenue tracking and loan metrics are now available in your dashboard.
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
