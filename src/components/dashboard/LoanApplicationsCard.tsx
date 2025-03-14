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
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { data: loanApplications, isLoading } = useQuery({
    queryKey: ['loanApplications'],
    queryFn: getLoanApplications,
    staleTime: 30000,
    placeholderData: [],
    retry: 3
  });

  const approveLoanMutation = useMutation({
    mutationFn: (loan: LoanApplication) => {
      setIsProcessing(true);
      return approveLoan(loan);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loanApplications'] });
      queryClient.invalidateQueries({ queryKey: ['approvedLoans'] });
      toast({
        title: 'Loan Approved',
        description: 'The loan application has been approved successfully.',
      });
      setIsProcessing(false);
    },
    onError: (error) => {
      console.error('Approve loan mutation error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to approve the loan',
      });
      setIsProcessing(false);
    }
  });

  const rejectLoanMutation = useMutation({
    mutationFn: (loan: LoanApplication) => {
      setIsProcessing(true);
      return rejectLoan(loan);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loanApplications'] });
      queryClient.invalidateQueries({ queryKey: ['rejectedLoans'] });
      toast({
        title: 'Loan Rejected',
        description: 'The loan application has been rejected.',
      });
      setIsProcessing(false);
    },
    onError: (error) => {
      console.error('Reject loan mutation error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to reject the loan',
      });
      setIsProcessing(false);
    }
  });

  const getNameInitials = (name: string) => {
    return name.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const calculateReturningAmount = (amount: number) => {
    return (amount * 1.4).toFixed(2);
  };

  const handleApproveLoan = (loan: LoanApplication) => {
    if (isProcessing) return;
    console.log('Approving loan with ID:', loan.id);
    approveLoanMutation.mutate(loan);
  };

  const handleRejectLoan = (loan: LoanApplication) => {
    if (isProcessing) return;
    console.log('Rejecting loan with ID:', loan.id);
    rejectLoanMutation.mutate(loan);
  };

  const handleViewDetails = (loan: LoanApplication) => {
    setSelectedLoan(loan);
    setDetailsOpen(true);
  };

  const loansToDisplay = loanApplications && loanApplications.length > 0 ? loanApplications : [];

  return (
    <>
      <Card className="col-span-3 hover-scale">
        <CardHeader>
          <CardTitle>Loan Applications</CardTitle>
          <CardDescription>
            {loansToDisplay.length 
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
          ) : loansToDisplay.length > 0 ? (
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
                        disabled={isProcessing || approveLoanMutation.isPending}
                      >
                        <Check className="h-3 w-3 mr-0.5" />
                        Approve
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-5 px-1 text-[10px] text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => handleRejectLoan(loan)}
                        disabled={isProcessing || rejectLoanMutation.isPending}
                      >
                        <X className="h-3 w-3 mr-0.5" />
                        Reject
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-5 w-5 p-0 text-[10px] text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                        onClick={() => handleViewDetails(loan)}
                        disabled={isProcessing}
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
              <p className="text-muted-foreground">No applications</p>
            </div>
          )}
        </CardContent>
      </Card>

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
                  disabled={isProcessing || rejectLoanMutation.isPending}
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
                  disabled={isProcessing || approveLoanMutation.isPending}
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
