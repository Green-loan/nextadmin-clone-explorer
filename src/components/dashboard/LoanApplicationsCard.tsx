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

  // Handle view details
  const handleViewDetails = (loan: LoanApplication) => {
    setSelectedLoan(loan);
    setDetailsOpen(true);
  };

  return (
    <>
      <Card className="col-span-3 hover-scale">
        <CardHeader>
          <CardTitle>Loan Applications</CardTitle>
          <CardDescription>
            {loanApplications?.length 
              ? `You have ${loanApplications.length} pending loan applications` 
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
          ) : loanApplications && loanApplications.length > 0 ? (
            <div className="space-y-3">
              {loanApplications.map((loan: LoanApplication) => (
                <div 
                  key={loan.id} 
                  className="flex items-center justify-between p-3 border border-gray-100 rounded-md"
                >
                  <div className="flex items-center space-x-3 max-w-[60%]">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage src="/placeholder.svg" alt={loan.name} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {getNameInitials(loan.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="overflow-hidden">
                      <p className="text-sm font-medium truncate">{loan.name}</p>
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
                        className="h-6 px-1.5 text-xs text-green-600 hover:bg-green-50 hover:text-green-700"
                        onClick={() => handleApproveLoan(loan)}
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Approve
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-6 px-1.5 text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => handleRejectLoan(loan)}
                      >
                        <X className="h-3 w-3 mr-1" />
                        Reject
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-6 px-1.5 text-xs text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                        onClick={() => handleViewDetails(loan)}
                      >
                        <Eye className="h-3 w-3 mr-0.5" />
                        Details
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

      {/* Loan Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Loan Application Details</DialogTitle>
            <DialogDescription>
              Complete information about the loan application
            </DialogDescription>
          </DialogHeader>
          
          {selectedLoan && (
            <div className="grid gap-2 py-2 max-h-[50vh] overflow-y-auto text-sm">
              <div className="grid grid-cols-4 items-center gap-2">
                <p className="text-xs font-medium col-span-1">Name:</p>
                <p className="col-span-3 text-sm">{selectedLoan.name}</p>
              </div>
              <div className="grid grid-cols-4 items-center gap-2">
                <p className="text-xs font-medium col-span-1">Email:</p>
                <p className="col-span-3 text-sm">{selectedLoan.email}</p>
              </div>
              <div className="grid grid-cols-4 items-center gap-2">
                <p className="text-xs font-medium col-span-1">Phone:</p>
                <p className="col-span-3 text-sm">{selectedLoan.phone}</p>
              </div>
              <div className="grid grid-cols-4 items-center gap-2">
                <p className="text-xs font-medium col-span-1">ID Number:</p>
                <p className="col-span-3 text-sm">{selectedLoan.id_number}</p>
              </div>
              <div className="grid grid-cols-4 items-center gap-2">
                <p className="text-xs font-medium col-span-1">Gender:</p>
                <p className="col-span-3 text-sm">{selectedLoan.gender}</p>
              </div>
              <div className="grid grid-cols-4 items-center gap-2">
                <p className="text-xs font-medium col-span-1">Date of Birth:</p>
                <p className="col-span-3 text-sm">{selectedLoan.dob}</p>
              </div>
              <div className="grid grid-cols-4 items-center gap-2">
                <p className="text-xs font-medium col-span-1">Address:</p>
                <p className="col-span-3 text-sm">{selectedLoan.address}</p>
              </div>
              <div className="grid grid-cols-4 items-center gap-2">
                <p className="text-xs font-medium col-span-1">Amount:</p>
                <p className="col-span-3 text-sm">R{selectedLoan.amount.toFixed(2)}</p>
              </div>
              <div className="grid grid-cols-4 items-center gap-2">
                <p className="text-xs font-medium col-span-1">Returns:</p>
                <p className="col-span-3 text-sm">R{calculateReturningAmount(selectedLoan.amount)}</p>
              </div>
              <div className="grid grid-cols-4 items-center gap-2">
                <p className="text-xs font-medium col-span-1">Bank:</p>
                <p className="col-span-3 text-sm">{selectedLoan.bank}</p>
              </div>
              <div className="grid grid-cols-4 items-center gap-2">
                <p className="text-xs font-medium col-span-1">Account:</p>
                <p className="col-span-3 text-sm">{selectedLoan.account_number}</p>
              </div>
              <div className="grid grid-cols-4 items-center gap-2">
                <p className="text-xs font-medium col-span-1">Purpose:</p>
                <p className="col-span-3 text-sm">{selectedLoan.purpose}</p>
              </div>
              <div className="grid grid-cols-4 items-center gap-2">
                <p className="text-xs font-medium col-span-1">Due Date:</p>
                <p className="col-span-3 text-sm">{selectedLoan.due_date}</p>
              </div>
              <div className="grid grid-cols-4 items-center gap-2">
                <p className="text-xs font-medium col-span-1">Applied:</p>
                <p className="col-span-3 text-sm">{new Date(selectedLoan.timestamp).toLocaleString()}</p>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 mt-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setDetailsOpen(false)}
            >
              Close
            </Button>
            {selectedLoan && (
              <>
                <Button 
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    handleRejectLoan(selectedLoan);
                    setDetailsOpen(false);
                  }}
                >
                  <X className="h-3.5 w-3.5 mr-1" />
                  Reject
                </Button>
                <Button 
                  variant="default"
                  size="sm"
                  onClick={() => {
                    handleApproveLoan(selectedLoan);
                    setDetailsOpen(false);
                  }}
                >
                  <Check className="h-3.5 w-3.5 mr-1" />
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
