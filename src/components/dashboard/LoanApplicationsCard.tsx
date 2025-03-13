
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { getLoanApplications, approveLoan, rejectLoan } from '@/lib/supabase-utils';

interface LoanApplication {
  id: string;
  name: string;
  email: string;
  phone: string;
  id_number: string;
  gender: string;
  dob: string;
  address: string;
  amount: number;
  bank: string;
  account_number: string;
  purpose: string;
  due_date: string;
  timestamp: string;
}

const LoanApplicationsCard = () => {
  const queryClient = useQueryClient();
  
  // Fetch loan applications
  const { data: loanApplications, isLoading } = useQuery({
    queryKey: ['loanApplications'],
    queryFn: getLoanApplications
  });

  // Approve loan mutation
  const approveLoanMutation = useMutation({
    mutationFn: (loan: LoanApplication) => approveLoan(loan),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loanApplications'] });
      queryClient.invalidateQueries({ queryKey: ['approvedLoans'] });
      toast({
        title: 'Loan Approved',
        description: 'The loan application has been approved successfully.',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to approve the loan',
      });
    }
  });

  // Reject loan mutation
  const rejectLoanMutation = useMutation({
    mutationFn: (loan: LoanApplication) => rejectLoan(loan),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loanApplications'] });
      queryClient.invalidateQueries({ queryKey: ['rejectedLoans'] });
      toast({
        title: 'Loan Rejected',
        description: 'The loan application has been rejected.',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to reject the loan',
      });
    }
  });

  // Format the name for the avatar fallback
  const getNameInitials = (name: string) => {
    return name.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Calculate the returning amount (loan amount + 40% interest)
  const calculateReturningAmount = (amount: number) => {
    return (amount * 1.4).toFixed(2);
  };

  // Handle approve loan
  const handleApproveLoan = (loan: LoanApplication) => {
    approveLoanMutation.mutate(loan);
  };

  // Handle reject loan
  const handleRejectLoan = (loan: LoanApplication) => {
    rejectLoanMutation.mutate(loan);
  };

  return (
    <Card className="col-span-3 hover-scale">
      <CardHeader>
        <CardTitle>Loan Applications</CardTitle>
        <CardDescription>
          {loanApplications?.length 
            ? `You have ${loanApplications.length} pending loan applications` 
            : 'No pending loan applications'}
        </CardDescription>
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
        ) : loanApplications && loanApplications.length > 0 ? (
          <div className="space-y-6">
            {loanApplications.map((loan: LoanApplication) => (
              <div 
                key={loan.id} 
                className="flex items-center justify-between space-x-4 transition-all duration-200 hover:bg-muted/30 rounded-md p-2 -mx-2"
              >
                <div className="flex items-center space-x-4">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src="/placeholder.svg" alt={loan.name} />
                    <AvatarFallback>
                      {getNameInitials(loan.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{loan.name}</p>
                    <p className="text-xs text-muted-foreground">{loan.email || loan.phone}</p>
                    <p className="text-xs font-medium text-muted-foreground">
                      Due: {new Date(loan.due_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">
                    ${parseFloat(loan.amount).toFixed(2)} 
                    <span className="text-xs text-muted-foreground ml-1">
                      → ${calculateReturningAmount(parseFloat(loan.amount))}
                    </span>
                  </p>
                  <div className="flex space-x-2 mt-1">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="h-7 px-2 text-green-600 hover:bg-green-50 hover:text-green-700"
                      onClick={() => handleApproveLoan(loan)}
                    >
                      <Check className="h-3.5 w-3.5 mr-1" />
                      Approve
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-7 px-2 text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={() => handleRejectLoan(loan)}
                    >
                      <X className="h-3.5 w-3.5 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-[300px] flex items-center justify-center">
            <p className="text-muted-foreground">No loan applications found</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LoanApplicationsCard;
