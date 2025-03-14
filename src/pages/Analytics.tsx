
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import StatCard from "@/components/dashboard/StatCard";
import { useQuery } from "@tanstack/react-query";
import { getLoanApplications, getApprovedLoans, getRejectedLoans } from "@/lib/supabase-utils";
import { BarChart, LineChart, PieChart } from "@/components/ui/chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  PieChart as PieChartIcon, 
  LineChart as LineChartIcon,
  BadgeDollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Users
} from "lucide-react";

const Analytics = () => {
  const [chartType, setChartType] = useState("bar");

  // Fetch loan data
  const { data: pendingLoans = [] } = useQuery({
    queryKey: ['loanApplications'],
    queryFn: getLoanApplications
  });

  const { data: approvedLoans = [] } = useQuery({
    queryKey: ['approvedLoans'],
    queryFn: getApprovedLoans
  });

  const { data: rejectedLoans = [] } = useQuery({
    queryKey: ['rejectedLoans'],
    queryFn: getRejectedLoans
  });

  // Calculate loan statistics
  const totalPendingLoans = pendingLoans.length;
  const totalApprovedLoans = approvedLoans.length;
  const totalRejectedLoans = rejectedLoans.length;
  const totalLoans = totalPendingLoans + totalApprovedLoans + totalRejectedLoans;
  
  // Calculate approval and rejection rates
  const approvalRate = totalLoans > 0 ? (totalApprovedLoans / totalLoans * 100).toFixed(1) : "0";
  const rejectionRate = totalLoans > 0 ? (totalRejectedLoans / totalLoans * 100).toFixed(1) : "0";
  
  // Calculate average loan amount
  const totalApprovedAmount = approvedLoans.reduce((sum, loan) => sum + parseFloat(loan.amount), 0);
  const avgApprovedAmount = totalApprovedLoans > 0 
    ? (totalApprovedAmount / totalApprovedLoans).toFixed(2) 
    : "0.00";
  
  const totalPendingAmount = pendingLoans.reduce((sum, loan) => sum + parseFloat(loan.amount), 0);
  const avgPendingAmount = totalPendingLoans > 0 
    ? (totalPendingAmount / totalPendingLoans).toFixed(2) 
    : "0.00";

  // Prepare data for bar chart
  const loanStatusData = [
    { name: "Pending", value: totalPendingLoans },
    { name: "Approved", value: totalApprovedLoans },
    { name: "Rejected", value: totalRejectedLoans }
  ];

  // Prepare data for pie chart
  const loanAmountDistribution = [
    { name: "Pending", value: parseFloat(totalPendingAmount.toFixed(2)) },
    { name: "Approved", value: parseFloat(totalApprovedAmount.toFixed(2)) }
  ];

  // Prepare data for trend analysis
  // Group by months (simplified version - can be enhanced)
  const getLastSixMonths = () => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(month.toLocaleString('default', { month: 'short' }));
    }
    return months;
  };

  const months = getLastSixMonths();
  
  // Count loans per month (simplified)
  const countLoansByMonth = (loans) => {
    const counts = Array(6).fill(0);
    loans.forEach(loan => {
      const loanDate = new Date(loan.timestamp);
      const now = new Date();
      const monthDiff = (now.getMonth() - loanDate.getMonth()) + 
                        (now.getFullYear() - loanDate.getFullYear()) * 12;
      if (monthDiff >= 0 && monthDiff < 6) {
        counts[5 - monthDiff]++;
      }
    });
    return counts;
  };

  const approvedByMonth = countLoansByMonth(approvedLoans);
  const rejectedByMonth = countLoansByMonth(rejectedLoans);
  const pendingByMonth = countLoansByMonth(pendingLoans);

  const loanTrends = months.map((month, index) => ({
    name: month,
    Approved: approvedByMonth[index],
    Rejected: rejectedByMonth[index],
    Pending: pendingByMonth[index]
  }));

  return (
    <Layout>
      <div className="container py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Loan Analytics</h1>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Pending Loans"
            value={totalPendingLoans.toString()}
            icon={Clock}
            description="Awaiting decision"
          />
          <StatCard
            title="Avg. Pending Amount"
            value={`R${parseFloat(avgPendingAmount).toLocaleString('en-ZA')}`}
            icon={BadgeDollarSign}
            description="Per loan application"
          />
          <StatCard
            title="Approval Rate"
            value={`${approvalRate}%`}
            icon={CheckCircle}
            description="Of all applications"
          />
          <StatCard
            title="Rejection Rate"
            value={`${rejectionRate}%`}
            icon={XCircle}
            description="Of all applications"
          />
        </div>

        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Loan Applications by Status</CardTitle>
              <CardDescription>
                Distribution of loan applications by their current status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={chartType} onValueChange={setChartType}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="bar" className="flex items-center gap-1">
                    <BarChart3 className="h-4 w-4" />
                    <span className="hidden sm:inline">Bar</span>
                  </TabsTrigger>
                  <TabsTrigger value="pie" className="flex items-center gap-1">
                    <PieChartIcon className="h-4 w-4" />
                    <span className="hidden sm:inline">Pie</span>
                  </TabsTrigger>
                  <TabsTrigger value="line" className="flex items-center gap-1">
                    <LineChartIcon className="h-4 w-4" />
                    <span className="hidden sm:inline">Trend</span>
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="bar" className="pt-4">
                  <BarChart
                    data={loanStatusData}
                    xAxisKey="name"
                    yAxisKey="value"
                    showLegend={false}
                    showXAxis={true}
                    showYAxis={true}
                    showTooltip={true}
                  />
                </TabsContent>
                <TabsContent value="pie" className="pt-4">
                  <PieChart
                    data={loanStatusData}
                    nameKey="name"
                    dataKey="value"
                    showLegend={true}
                  />
                </TabsContent>
                <TabsContent value="line" className="pt-4">
                  <LineChart
                    data={loanTrends}
                    xAxisKey="name"
                    yAxisKey={["Approved", "Rejected", "Pending"]}
                    showLegend={true}
                    showXAxis={true}
                    showYAxis={true}
                    showTooltip={true}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Loan Amount Distribution</CardTitle>
              <CardDescription>
                Comparison of pending vs approved loan amounts
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <PieChart
                data={loanAmountDistribution}
                nameKey="name"
                dataKey="value"
                showLegend={true}
                valueFormatter={(value) => `R${value.toLocaleString('en-ZA')}`}
              />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Loan Application Insights</CardTitle>
            <CardDescription>
              Key observations and recommendations based on the loan data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg bg-muted/30">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Applicant Analysis
                </h3>
                <ul className="mt-2 space-y-2 text-sm">
                  <li>• Total of {totalLoans} loan applications processed.</li>
                  <li>• {totalPendingLoans} applications are currently pending review.</li>
                  <li>• Average requested amount: R{parseFloat(avgPendingAmount).toLocaleString('en-ZA')}.</li>
                  {approvedLoans.length > 0 && (
                    <li>• Average approved loan amount: R{parseFloat(avgApprovedAmount).toLocaleString('en-ZA')}.</li>
                  )}
                </ul>
              </div>

              <div className="p-4 border rounded-lg bg-muted/30">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Performance Metrics
                </h3>
                <ul className="mt-2 space-y-2 text-sm">
                  <li>• Approval rate: {approvalRate}% of all applications.</li>
                  <li>• Rejection rate: {rejectionRate}% of all applications.</li>
                  <li>• Total approved amount: R{totalApprovedAmount.toLocaleString('en-ZA')}.</li>
                  <li>• Total pending amount: R{totalPendingAmount.toLocaleString('en-ZA')}.</li>
                </ul>
              </div>

              {totalPendingLoans > 0 && (
                <div className="p-4 border rounded-lg bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
                  <h3 className="text-lg font-medium flex items-center gap-2 text-amber-800 dark:text-amber-400">
                    <Clock className="h-5 w-5" />
                    Attention Required
                  </h3>
                  <p className="mt-2 text-sm text-amber-700 dark:text-amber-300">
                    {totalPendingLoans} loan {totalPendingLoans === 1 ? 'application is' : 'applications are'} awaiting review.
                    {totalPendingLoans > 5 && ' This is higher than the recommended processing queue.'}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Analytics;
