
import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Sample data
const initialData = [
  { name: 'Jan', value: 4000 },
  { name: 'Feb', value: 3000 },
  { name: 'Mar', value: 5000 },
  { name: 'Apr', value: 2780 },
  { name: 'May', value: 1890 },
  { name: 'Jun', value: 2390 },
  { name: 'Jul', value: 3490 },
  { name: 'Aug', value: 2000 },
  { name: 'Sep', value: 2780 },
  { name: 'Oct', value: 1890 },
  { name: 'Nov', value: 3578 },
  { name: 'Dec', value: 3900 },
];

const ActivityChart = () => {
  const [data, setData] = useState<typeof initialData>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Simulate loading data
    const timer = setTimeout(() => {
      setData(initialData);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) return null;

  return (
    <Card className="col-span-4 hover-scale">
      <CardHeader className="pb-2">
        <CardTitle>Activity Overview</CardTitle>
        <CardDescription>User activity over the past year</CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-[300px] w-full">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{ top: 20, right: 0, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                  </linearGradient>
                </defs>
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
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                  animationDuration={1500}
                />
              </AreaChart>
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

export default ActivityChart;
