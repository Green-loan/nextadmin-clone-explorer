
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Check, Clock, Trophy } from 'lucide-react';
import { getApprovedLoans } from '@/lib/supabase-utils';

interface LoanProps {
  id: string;
  name: string;
  email: string;
  amount: string;
  totalReturn: string;
  status?: 'paid' | 'pending';
  dueDate?: string;
  image?: string;
}

const calculateTotalPending = (loans: LoanProps[]) => {
  return loans
    .filter(loan => loan.status === 'pending')
    .reduce((total, loan) => total + parseFloat(loan.totalReturn || '0'), 0);
};

const getBestClients = (loans: LoanProps[]) => {
  // Count occurrences of each client who has paid
  const clientCounts = loans
    .filter(loan => loan.status === 'paid')
    .reduce((acc: Record<string, number>, loan) => {
      acc[loan.name] = (acc[loan.name] || 0) + 1;
      return acc;
    }, {});

  // Convert to array and sort by count
  return Object.entries(clientCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3); // Top 3 clients
};

const RecentSales = () => {
  const [filter, setFilter] = useState<string>('all');
  const [mounted, setMounted] = useState(false);

  const { data: approvedLoans = [], isLoading } = useQuery({
    queryKey: ['approvedLoans'],
    queryFn: getApprovedLoans,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Convert approved loans to the format needed for display
  const processedLoans: LoanProps[] = approvedLoans.map((loan: any) => ({
    id: loan.id,
    name: loan.name,
    email: loan.email,
    amount: `R${parseFloat(loan.amount).toFixed(2)}`,
    totalReturn: loan.totalReturn || loan.amount,
    status: Math.random() > 0.5 ? 'paid' : 'pending', // Simulate status for now - replace with real status when available
    dueDate: loan.due_date,
    image: loan.image,
  }));

  // Apply filtering
  const filteredLoans = processedLoans.filter(loan => {
    if (filter === 'all') return true;
    return loan.status === filter;
  });

  // Calculate total pending amount
  const totalPendingAmount = calculateTotalPending(processedLoans);
  
  // Get best clients
  const bestClients = getBestClients(processedLoans);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <Card className="col-span-3 hover-scale">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>Recent Loans</CardTitle>
          <CardDescription>
            You made {processedLoans.length} loans this month
          </CardDescription>
        </div>
        <Select
          value={filter}
          onValueChange={setFilter}
        >
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Loans</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-pulse flex space-x-4">
              <div className="h-3 w-3 bg-muted rounded-full animation-delay-200"></div>
              <div className="h-3 w-3 bg-muted rounded-full animation-delay-400"></div>
              <div className="h-3 w-3 bg-muted rounded-full"></div>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-6">
              {filteredLoans.length > 0 ? (
                filteredLoans.map((loan, index) => (
                  <div 
                    key={loan.id || index} 
                    className="flex items-center justify-between space-x-4 transition-all duration-200 hover:bg-muted/30 rounded-md p-2 -mx-2"
                  >
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={loan.image || "/placeholder.svg"} alt={loan.name} />
                        <AvatarFallback>
                          {loan.name.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium flex items-center">
                          {loan.name}
                          {bestClients.some(client => client.name === loan.name) && (
                            <Trophy className="h-3.5 w-3.5 ml-1.5 text-yellow-500" />
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">{loan.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <p className={`text-sm font-medium ${loan.status === 'paid' ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}>
                          {loan.status === 'paid' ? '+' : ''}R{parseFloat(loan.totalReturn).toFixed(2)}
                        </p>
                        <Badge 
                          variant={loan.status === 'paid' ? 'outline' : 'secondary'}
                          className={`
                            ml-2 
                            ${loan.status === 'paid' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400 hover:bg-green-100' 
                              : 'bg-orange-100 text-orange-800 dark:bg-orange-800/20 dark:text-orange-400 hover:bg-orange-100'}
                          `}
                        >
                          {loan.status === 'paid' ? (
                            <Check className="h-3.5 w-3.5 mr-1" />
                          ) : (
                            <Clock className="h-3.5 w-3.5 mr-1" />
                          )}
                          {loan.status === 'paid' ? 'Paid' : 'Pending'}
                        </Badge>
                      </div>
                      {loan.dueDate && loan.status === 'pending' && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Due: {new Date(loan.dueDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No loans found matching your filter.
                </div>
              )}
            </div>

            {/* Total pending amount */}
            {totalPendingAmount > 0 && (
              <div className="mt-6 pt-4 border-t">
                <p className="text-sm font-medium flex justify-between">
                  <span>Total Pending Amount:</span>
                  <span className="text-orange-600 dark:text-orange-400">
                    R{totalPendingAmount.toFixed(2)}
                  </span>
                </p>
              </div>
            )}

            {/* Best clients section */}
            {bestClients.length > 0 && (
              <div className="mt-6 pt-4 border-t">
                <h4 className="text-sm font-medium mb-3 flex items-center">
                  <Trophy className="h-4 w-4 mr-1.5 text-yellow-500" />
                  Best Clients
                </h4>
                <div className="space-y-2">
                  {bestClients.map((client, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{client.name}</span>
                      <span className="text-muted-foreground">{client.count} paid loans</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentSales;
