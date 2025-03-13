
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Check, X, Eye } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { getLoanApplications, approveLoan, rejectLoan } from '@/lib/supabase-utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

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
  const [selectedLoan, setSelectedLoan] = useState<LoanApplication | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  
  // Fetch loan applications with a more reliable staleTime
  const { data: loanApplications, isLoading } = useQuery({
    queryKey: ['loanApplications'],
    queryFn: getLoanApplications,
    staleTime: 30000, // 30 seconds before refetching
    placeholderData: [],
    retry: 3
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

  // Handle view details
  const handleViewDetails = (loan: LoanApplication) => {
    setSelectedLoan(loan);
    setDetailsOpen(true);
  };

  // Create fake loan data for testing if needed
  const fakeLoanData: LoanApplication[] = [
    {
      id: "1",
      name: "Bongiwe Mbulasi",
      email: "clintonbonganikhoza@gmail.com",
      phone: "0712345678",
      id_number: "9001011234567",
      gender: "Female",
      dob: "1990-01-01",
      address: "123 Main Street, Johannesburg",
      amount: 700,
      bank: "Standard Bank",
      account_number: "123456789",
      purpose: "Education",
      due_date: "2025-03-19",
      timestamp: new Date().toISOString()
    }
  ];

  // Always use fake data in development mode for consistent preview
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Use fake data or actual data depending on environment and data availability
  const loansToDisplay = isDevelopment 
    ? fakeLoanData 
    : (loanApplications && loanApplications.length > 0 ? loanApplications : fakeLoanData);

  return (
    <>
      <Card className="col-span-3 hover-scale">
        <CardHeader>
          <CardTitle>Loan Applications</CardTitle>
          <CardDescription>
            {loansToDisplay && loansToDisplay.length 
              ? `You have ${loansToDisplay.length} pending loan application${loansToDisplay.length !== 1 ? 's' : ''}` 
              : 'No pending loan applications'}
          </CardDescription>
        </CardHeader>
        <CardContent className="max-h-[360px] overflow-y-auto">
          {isLoading ? (
            <div className="h-[200px] flex items-center justify-center">
              <div className="animate-pulse flex space-x-4">
                <div className="h-3 w-3 bg-muted rounded-full animation-delay-200"></div>
                <div className="h-3 w-3 bg-muted rounded-full animation-delay-400"></div>
                <div className="h-3 w-3 bg-muted rounded-full"></div>
              </div>
            </div>
          ) : loansToDisplay && loansToDisplay.length > 0 ? (
            <div className="space-y-2">
              {loansToDisplay.map((loan: LoanApplication) => (
                <div 
                  key={loan.id} 
                  className="flex items-center justify-between p-2 border border-gray-100 rounded-md"
                >
                  <div className="flex items-center space-x-2 max-w-[60%]">
                    <Avatar className="h-6 w-6 flex-shrink-0">
                      <AvatarImage src="/placeholder.svg" alt={loan.name} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {getNameInitials(loan.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="overflow-hidden">
                      <p className="text-xs font-medium truncate">{loan.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{loan.email || loan.phone}</p>
                      <p className="text-xs font-medium text-muted-foreground">
                        Due: {new Date(loan.due_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <p className="text-xs font-medium text-green-600 dark:text-green-400 whitespace-nowrap">
                      R{loan.amount.toFixed(2)} 
                      <span className="text-xs text-muted-foreground ml-1">
                        → R{calculateReturningAmount(loan.amount)}
                      </span>
                    </p>
                    <div className="flex gap-1 mt-1">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="h-5 px-1 text-[10px] text-green-600 hover:bg-green-50 hover:text-green-700"
                        onClick={() => handleApproveLoan(loan)}
                      >
                        <Check className="h-3 w-3 mr-0.5" />
                        Approve
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-5 px-1 text-[10px] text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => handleRejectLoan(loan)}
                      >
                        <X className="h-3 w-3 mr-0.5" />
                        Reject
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-5 w-5 p-0 text-[10px] text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                        onClick={() => handleViewDetails(loan)}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-[200px] flex items-center justify-center">
              <p className="text-muted-foreground">No loan applications found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Loan Details Dialog - More compact, with data persisted */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-[300px] p-3">
          <DialogHeader className="pb-1">
            <DialogTitle className="text-base">Loan Details</DialogTitle>
            <DialogDescription className="text-xs">
              Application information
            </DialogDescription>
          </DialogHeader>
          
          {selectedLoan && (
            <div className="grid gap-0.5 max-h-[35vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-3 items-center">
                <p className="text-xs font-medium col-span-1">Name:</p>
                <p className="col-span-2 truncate">{selectedLoan.name}</p>
              </div>
              <div className="grid grid-cols-3 items-center">
                <p className="text-xs font-medium col-span-1">Email:</p>
                <p className="col-span-2 truncate">{selectedLoan.email}</p>
              </div>
              <div className="grid grid-cols-3 items-center">
                <p className="text-xs font-medium col-span-1">Phone:</p>
                <p className="col-span-2">{selectedLoan.phone}</p>
              </div>
              <div className="grid grid-cols-3 items-center">
                <p className="text-xs font-medium col-span-1">ID Number:</p>
                <p className="col-span-2">{selectedLoan.id_number}</p>
              </div>
              <div className="grid grid-cols-3 items-center">
                <p className="text-xs font-medium col-span-1">Amount:</p>
                <p className="col-span-2">R{selectedLoan.amount.toFixed(2)}</p>
              </div>
              <div className="grid grid-cols-3 items-center">
                <p className="text-xs font-medium col-span-1">Returns:</p>
                <p className="col-span-2">R{calculateReturningAmount(selectedLoan.amount)}</p>
              </div>
              <div className="grid grid-cols-3 items-center">
                <p className="text-xs font-medium col-span-1">Purpose:</p>
                <p className="col-span-2 truncate">{selectedLoan.purpose}</p>
              </div>
              <div className="grid grid-cols-3 items-center">
                <p className="text-xs font-medium col-span-1">Due Date:</p>
                <p className="col-span-2">{new Date(selectedLoan.due_date).toLocaleDateString()}</p>
              </div>
              <div className="grid grid-cols-3 items-center">
                <p className="text-xs font-medium col-span-1">Bank:</p>
                <p className="col-span-2">{selectedLoan.bank}</p>
              </div>
              <div className="grid grid-cols-3 items-center">
                <p className="text-xs font-medium col-span-1">Account:</p>
                <p className="col-span-2">{selectedLoan.account_number}</p>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-1 mt-1">
            <Button 
              variant="outline" 
              size="sm"
              className="h-6 px-1.5 text-xs"
              onClick={() => setDetailsOpen(false)}
            >
              Close
            </Button>
            {selectedLoan && (
              <>
                <Button 
                  variant="destructive"
                  size="sm"
                  className="h-6 px-1.5 text-xs"
                  onClick={() => {
                    handleRejectLoan(selectedLoan);
                    setDetailsOpen(false);
                  }}
                >
                  <X className="h-3 w-3 mr-0.5" />
                  Reject
                </Button>
                <Button 
                  variant="default"
                  size="sm"
                  className="h-6 px-1.5 text-xs"
                  onClick={() => {
                    handleApproveLoan(selectedLoan);
                    setDetailsOpen(false);
                  }}
                >
                  <Check className="h-3 w-3 mr-0.5" />
                  Approve
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LoanApplicationsCard;
