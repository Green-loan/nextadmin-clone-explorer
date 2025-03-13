
import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface OverviewProps {
  chartData?: { name: string; total: number }[];
}

const Overview = ({ chartData = [] }: OverviewProps) => {
  const [data, setData] = useState<typeof chartData>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Use the provided chart data or initialize with empty array
    if (chartData && chartData.length > 0) {
      setData(chartData);
    }
  }, [chartData]);

  if (!mounted) return null;

  return (
    <Card className="col-span-4 hover-scale">
      <CardHeader className="pb-2">
        <CardTitle>Revenue Overview</CardTitle>
        <CardDescription>Monthly revenue (in Rands) for current year</CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-[300px] w-full">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 20, right: 0, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} vertical={false} />
                <XAxis 
                  dataKey="name" 
                  tickLine={false}
                  axisLine={false}
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  tickLine={false}
                  axisLine={false}
                  style={{ fontSize: '12px' }}
                  // Format Y-axis labels with R prefix for Rands
                  tickFormatter={(value) => `R${value}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    border: 'none'
                  }}
                  cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                  // Format tooltip values with R prefix for Rands
                  formatter={(value) => [`R${value}`, 'Revenue']}
                />
                <Bar 
                  dataKey="total" 
                  fill="currentColor" 
                  radius={[4, 4, 0, 0]} 
                  className="fill-primary/80" 
                  animationDuration={1500}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <div className="animate-pulse flex space-x-4">
                <div className="h-3 w-3 bg-muted rounded-full animation-delay-200"></div>
                <div className="h-3 w-3 bg-muted rounded-full animation-delay-400"></div>
                <div className="h-3 w-3 bg-muted rounded-full"></div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default Overview;
