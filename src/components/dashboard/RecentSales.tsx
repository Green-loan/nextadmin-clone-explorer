
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface SaleProps {
  name: string;
  email: string;
  amount: string;
  image?: string;
}

const sampleSales: SaleProps[] = [
  {
    name: 'Olivia Martin',
    email: 'olivia.martin@email.com',
    amount: '+$1,999.00',
  },
  {
    name: 'Jackson Lee',
    email: 'jackson.lee@email.com',
    amount: '+$39.00',
  },
  {
    name: 'Isabella Nguyen',
    email: 'isabella.nguyen@email.com',
    amount: '+$299.00',
  },
  {
    name: 'William Kim',
    email: 'will@email.com',
    amount: '+$99.00',
  },
  {
    name: 'Sofia Davis',
    email: 'sofia.davis@email.com',
    amount: '+$450.00',
  },
];

const RecentSales = () => {
  const [sales, setSales] = useState<SaleProps[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Simulate loading data
    const timer = setTimeout(() => {
      setSales(sampleSales);
    }, 700);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) return null;

  return (
    <Card className="col-span-3 hover-scale">
      <CardHeader>
        <CardTitle>Recent Sales</CardTitle>
        <CardDescription>You made 265 sales this month</CardDescription>
      </CardHeader>
      <CardContent>
        {sales.length > 0 ? (
          <div className="space-y-6">
            {sales.map((sale, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between space-x-4 transition-all duration-200 hover:bg-muted/30 rounded-md p-2 -mx-2"
              >
                <div className="flex items-center space-x-4">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={sale.image || "/placeholder.svg"} alt={sale.name} />
                    <AvatarFallback>
                      {sale.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{sale.name}</p>
                    <p className="text-xs text-muted-foreground">{sale.email}</p>
                  </div>
                </div>
                <p className="text-sm font-medium text-green-600 dark:text-green-400">
                  {sale.amount}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-pulse flex space-x-4">
              <div className="h-3 w-3 bg-muted rounded-full animation-delay-200"></div>
              <div className="h-3 w-3 bg-muted rounded-full animation-delay-400"></div>
              <div className="h-3 w-3 bg-muted rounded-full"></div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentSales;
