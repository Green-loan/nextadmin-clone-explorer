
import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Sample data
const initialData = [
  { name: 'Jan', total: 2400 },
  { name: 'Feb', total: 1398 },
  { name: 'Mar', total: 9800 },
  { name: 'Apr', total: 3908 },
  { name: 'May', total: 4800 },
  { name: 'Jun', total: 3800 },
  { name: 'Jul', total: 4300 },
];

const Overview = () => {
  const [data, setData] = useState<typeof initialData>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Simulate loading data
    const timer = setTimeout(() => {
      setData(initialData);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) return null;

  return (
    <Card className="col-span-4 hover-scale">
      <CardHeader className="pb-2">
        <CardTitle>Overview</CardTitle>
        <CardDescription>Monthly revenue for current year</CardDescription>
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
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    border: 'none'
                  }}
                  cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
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
