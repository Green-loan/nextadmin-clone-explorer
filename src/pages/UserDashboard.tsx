
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Bell, CalendarIcon, Clock, UserCheck } from 'lucide-react';
import { GreenFinanceAI } from '@/components/ai/GreenFinanceAI';
import { toast } from 'sonner';
import DocumentUpload from '@/components/loan/DocumentUpload';
import { getStokvelaMembers } from '@/lib/supabase-utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Type definitions
interface LoanApplication {
  id: string;
  amount: number;
  purpose: string;
  due_date: string;
  status?: string;
  timestamp: string;
}

interface StokvelaMember {
  id: string;
  full_name: string;
  email: string;
  cellphone: string;
  date_of_birth: string;
  account_name: string;
  account_number: string;
  amount_paid: number;
  amount_to_receive: number;
  receiving_date: string;
  user_number: string;
  created_at: string;
}

interface LoanApplicationsData {
  pending: LoanApplication[];
  approved: LoanApplication[];
  rejected: LoanApplication[];
}

// Type guard function to check if data is of LoanApplicationsData type
function isLoanApplicationsData(data: any): data is LoanApplicationsData {
  return (
    data &&
    typeof data === 'object' &&
    'pending' in data &&
    'approved' in data &&
    'rejected' in data
  );
}

const UserDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch user's loan applications
  const { data: loanApplications, isLoading: isLoadingLoans } = useQuery({
    queryKey: ['userLoanApplications', user?.id],
    queryFn: async () => {
      if (!user) return { pending: [], approved: [], rejected: [] };
      
      const { data: applications, error } = await supabase
        .from('loan_applications')
        .select('*')
        .eq('email', user.email)
        .order('timestamp', { ascending: false });
      
      if (error) throw error;
      
      const { data: approved, error: approvedError } = await supabase
        .from('approved_loans')
        .select('*')
        .eq('email', user.email)
        .order('timestamp', { ascending: false });
        
      if (approvedError) throw approvedError;
      
      const { data: rejected, error: rejectedError } = await supabase
        .from('rejected_loans')
        .select('*')
        .eq('email', user.email)
        .order('timestamp', { ascending: false });
        
      if (rejectedError) throw rejectedError;
      
      return {
        pending: applications || [],
        approved: approved || [],
        rejected: rejected || []
      };
    },
    enabled: !!user?.id,
  });
  
  // Fetch Stokvela members
  const { data: stokvelaMembers, isLoading: isLoadingStokvelaMembers } = useQuery({
    queryKey: ['stokvelaMembers'],
    queryFn: getStokvelaMembers,
  });

  // Handle notifications
  const sendNotificationToUser = () => {
    toast.success('Notification sent', {
      description: 'Payment reminder has been sent to your email and phone.'
    });
  };
  
  const sendNotificationToAll = () => {
    toast.success('Notifications sent', {
      description: 'Payment reminders have been sent to all members.'
    });
  };
  
  // Calculate due amount from active loans
  const calculateTotalDueAmount = () => {
    if (!loanApplications || !isLoanApplicationsData(loanApplications)) return 0;
    
    return loanApplications.approved.reduce((total, loan) => {
      return total + (parseFloat(loan.amount.toString()) * 1.3999);
    }, 0);
  };
  
  // Find next payment Stokvela member
  const getNextPaymentMember = () => {
    if (!stokvelaMembers) return null;
    
    const today = new Date();
    const futureMembers = stokvelaMembers.filter(member => {
      const paymentDate = new Date(member.receiving_date);
      return paymentDate > today;
    });
    
    return futureMembers.sort((a, b) => 
      new Date(a.receiving_date).getTime() - new Date(b.receiving_date).getTime()
    )[0];
  };
  
  const nextPaymentMember = getNextPaymentMember();
  
  // Format date to readable string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Get status badge style
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  // Check if loan applications data is valid
  const hasValidLoanData = isLoanApplicationsData(loanApplications);

  return (
    <Layout>
      <div className="grid gap-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">User Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.email}
          </p>
        </div>
        
        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 w-full md:w-fit">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="loans">My Loans</TabsTrigger>
            <TabsTrigger value="stokvela">Stokvela</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="hover-scale">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Due Amount
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    R{calculateTotalDueAmount().toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    From {hasValidLoanData ? loanApplications.approved.length : 0} active loans
                  </p>
                </CardContent>
              </Card>
              
              <Card className="hover-scale">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Upcoming Payment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {hasValidLoanData && loanApplications.approved.length > 0 ? (
                    <>
                      <div className="text-2xl font-bold">
                        {formatDate(loanApplications.approved[0].due_date)}
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" /> 
                        {new Date(loanApplications.approved[0].due_date) > new Date() 
                          ? `Due in ${Math.ceil((new Date(loanApplications.approved[0].due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days` 
                          : 'Overdue'}
                      </p>
                    </>
                  ) : (
                    <div className="text-sm text-muted-foreground">No upcoming payments</div>
                  )}
                </CardContent>
              </Card>
              
              <Card className="hover-scale">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">
                    Stokvela Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {nextPaymentMember ? (
                    <>
                      <div className="text-lg font-bold">{nextPaymentMember.full_name}</div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <CalendarIcon className="h-3 w-3" /> 
                        Next payment: {formatDate(nextPaymentMember.receiving_date)}
                      </p>
                    </>
                  ) : (
                    <div className="text-sm text-muted-foreground">No upcoming Stokvela payments</div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-2 hover-scale">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Your recent loans and applications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingLoans ? (
                    <div className="h-[200px] flex items-center justify-center">
                      <div className="animate-pulse flex space-x-4">
                        <div className="h-3 w-3 bg-muted rounded-full animation-delay-200"></div>
                        <div className="h-3 w-3 bg-muted rounded-full animation-delay-400"></div>
                        <div className="h-3 w-3 bg-muted rounded-full"></div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {/* Pending Applications */}
                      {hasValidLoanData && loanApplications.pending.length > 0 && (
                        <div className="space-y-4">
                          <h3 className="text-sm font-medium">Pending Applications</h3>
                          {loanApplications.pending.slice(0, 3).map((loan: LoanApplication) => (
                            <div key={loan.id} className="flex justify-between items-center border-b pb-2">
                              <div>
                                <div className="font-medium text-sm">R{parseFloat(loan.amount.toString()).toFixed(2)}</div>
                                <div className="text-xs text-muted-foreground">{loan.purpose}</div>
                              </div>
                              <div className="text-right">
                                <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge('pending')}`}>
                                  Pending
                                </span>
                                <div className="text-xs text-muted-foreground mt-1">
                                  {new Date(loan.timestamp).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Approved Loans */}
                      {hasValidLoanData && loanApplications.approved.length > 0 && (
                        <div className="space-y-4">
                          <h3 className="text-sm font-medium">Approved Loans</h3>
                          {loanApplications.approved.slice(0, 3).map((loan: LoanApplication) => (
                            <div key={loan.id} className="flex justify-between items-center border-b pb-2">
                              <div>
                                <div className="font-medium text-sm">R{parseFloat(loan.amount.toString()).toFixed(2)}</div>
                                <div className="text-xs text-muted-foreground">{loan.purpose}</div>
                              </div>
                              <div className="text-right">
                                <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge('approved')}`}>
                                  Approved
                                </span>
                                <div className="text-xs text-muted-foreground mt-1">
                                  Due: {new Date(loan.due_date).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Show message if no loan activity */}
                      {(!hasValidLoanData || 
                       (loanApplications.pending.length === 0 && 
                        loanApplications.approved.length === 0)) && (
                        <div className="flex items-center justify-center h-32">
                          <p className="text-muted-foreground">No recent loan activity</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card className="hover-scale">
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>
                    Send and manage reminders
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    onClick={sendNotificationToUser}
                    className="w-full"
                    variant="outline"
                  >
                    <Bell className="mr-2 h-4 w-4" />
                    Send Me a Reminder
                  </Button>
                  
                  {/* Only show this button for specific roles */}
                  {/* <Button 
                    onClick={sendNotificationToAll}
                    className="w-full"
                    variant="outline"
                  >
                    <Bell className="mr-2 h-4 w-4" />
                    Notify All Members
                  </Button> */}
                  
                  <div className="text-xs text-muted-foreground mt-4">
                    Notifications will be sent to your registered email and phone number.
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Loans Tab */}
          <TabsContent value="loans" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>My Loans</CardTitle>
                  <CardDescription>
                    View and manage your loan applications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="pending">
                    <TabsList className="mb-4">
                      <TabsTrigger value="pending">Pending</TabsTrigger>
                      <TabsTrigger value="approved">Approved</TabsTrigger>
                      <TabsTrigger value="rejected">Rejected</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="pending">
                      {isLoadingLoans ? (
                        <div className="h-[200px] flex items-center justify-center">
                          <div className="animate-pulse flex space-x-4">
                            <div className="h-3 w-3 bg-muted rounded-full animation-delay-200"></div>
                            <div className="h-3 w-3 bg-muted rounded-full animation-delay-400"></div>
                            <div className="h-3 w-3 bg-muted rounded-full"></div>
                          </div>
                        </div>
                      ) : hasValidLoanData && loanApplications.pending.length > 0 ? (
                        <div className="space-y-4">
                          {loanApplications.pending.map((loan: LoanApplication) => (
                            <div key={loan.id} className="border rounded-lg p-4">
                              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold">R{parseFloat(loan.amount.toString()).toFixed(2)}</span>
                                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge('pending')}`}>
                                      Pending
                                    </span>
                                  </div>
                                  <div className="text-sm text-muted-foreground">Purpose: {loan.purpose}</div>
                                  <div className="text-xs text-muted-foreground">Applied on: {new Date(loan.timestamp).toLocaleDateString()}</div>
                                </div>
                                <div className="flex flex-col md:items-end gap-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => setActiveTab('documents')}
                                  >
                                    Upload Documents
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-32">
                          <p className="text-muted-foreground">No pending loan applications</p>
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="approved">
                      {isLoadingLoans ? (
                        <div className="h-[200px] flex items-center justify-center">
                          <div className="animate-pulse flex space-x-4">
                            <div className="h-3 w-3 bg-muted rounded-full animation-delay-200"></div>
                            <div className="h-3 w-3 bg-muted rounded-full animation-delay-400"></div>
                            <div className="h-3 w-3 bg-muted rounded-full"></div>
                          </div>
                        </div>
                      ) : hasValidLoanData && loanApplications.approved.length > 0 ? (
                        <div className="space-y-4">
                          {loanApplications.approved.map((loan: LoanApplication) => (
                            <div key={loan.id} className="border rounded-lg p-4">
                              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold">R{parseFloat(loan.amount.toString()).toFixed(2)}</span>
                                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge('approved')}`}>
                                      Approved
                                    </span>
                                  </div>
                                  <div className="text-sm text-muted-foreground">Purpose: {loan.purpose}</div>
                                  <div className="text-xs text-muted-foreground">Due date: {new Date(loan.due_date).toLocaleDateString()}</div>
                                  <div className="text-xs text-muted-foreground">Return amount: R{(parseFloat(loan.amount.toString()) * 1.3999).toFixed(2)}</div>
                                </div>
                                <div className="flex flex-col md:items-end gap-2">
                                  <Button 
                                    onClick={sendNotificationToUser}
                                    size="sm"
                                  >
                                    <Bell className="mr-2 h-4 w-4" />
                                    Set Reminder
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-32">
                          <p className="text-muted-foreground">No approved loans</p>
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="rejected">
                      {isLoadingLoans ? (
                        <div className="h-[200px] flex items-center justify-center">
                          <div className="animate-pulse flex space-x-4">
                            <div className="h-3 w-3 bg-muted rounded-full animation-delay-200"></div>
                            <div className="h-3 w-3 bg-muted rounded-full animation-delay-400"></div>
                            <div className="h-3 w-3 bg-muted rounded-full"></div>
                          </div>
                        </div>
                      ) : hasValidLoanData && loanApplications.rejected.length > 0 ? (
                        <div className="space-y-4">
                          {loanApplications.rejected.map((loan: LoanApplication) => (
                            <div key={loan.id} className="border rounded-lg p-4">
                              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold">R{parseFloat(loan.amount.toString()).toFixed(2)}</span>
                                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge('rejected')}`}>
                                      Rejected
                                    </span>
                                  </div>
                                  <div className="text-sm text-muted-foreground">Purpose: {loan.purpose}</div>
                                  <div className="text-xs text-muted-foreground">Applied on: {new Date(loan.timestamp).toLocaleDateString()}</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-32">
                          <p className="text-muted-foreground">No rejected loan applications</p>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Stokvela Tab */}
          <TabsContent value="stokvela" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Stokvela Members</CardTitle>
                  <CardDescription>
                    View all members and payment schedules
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingStokvelaMembers ? (
                    <div className="h-[200px] flex items-center justify-center">
                      <div className="animate-pulse flex space-x-4">
                        <div className="h-3 w-3 bg-muted rounded-full animation-delay-200"></div>
                        <div className="h-3 w-3 bg-muted rounded-full animation-delay-400"></div>
                        <div className="h-3 w-3 bg-muted rounded-full"></div>
                      </div>
                    </div>
                  ) : stokvelaMembers && stokvelaMembers.length > 0 ? (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-sm font-medium">Next Payment Date</h3>
                          {nextPaymentMember ? (
                            <p className="text-green-600 font-semibold">{formatDate(nextPaymentMember.receiving_date)}</p>
                          ) : (
                            <p className="text-muted-foreground">No scheduled payments</p>
                          )}
                        </div>
                        <Button onClick={sendNotificationToAll} variant="outline" size="sm">
                          <Bell className="mr-2 h-4 w-4" />
                          Notify All Members
                        </Button>
                      </div>
                      
                      <div className="rounded-md border">
                        <div className="overflow-x-auto">
                          <table className="w-full table-auto divide-y divide-gray-200">
                            <thead className="bg-muted/50">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Member</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Amount Paid</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">To Receive</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Payment Date</th>
                                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-950 divide-y divide-gray-200 dark:divide-gray-800">
                              {stokvelaMembers.map((member: StokvelaMember) => {
                                const isPastDate = new Date(member.receiving_date) < new Date();
                                const isToday = new Date(member.receiving_date).toDateString() === new Date().toDateString();
                                
                                return (
                                  <tr key={member.id} className="hover:bg-muted/50">
                                    <td className="px-4 py-3 whitespace-nowrap">
                                      <div className="flex items-center">
                                        <Avatar className="h-8 w-8 mr-2">
                                          <AvatarImage src="/placeholder.svg" alt={member.full_name} />
                                          <AvatarFallback className="bg-primary text-primary-foreground">
                                            {member.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                          </AvatarFallback>
                                        </Avatar>
                                        <div className="ml-2">
                                          <div className="text-sm font-medium">{member.full_name}</div>
                                          <div className="text-xs text-muted-foreground">{member.email}</div>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                      <div className="text-sm">R{parseFloat(member.amount_paid.toString()).toFixed(2)}</div>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                      <div className="text-sm">R{parseFloat(member.amount_to_receive.toString()).toFixed(2)}</div>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                      <div className="text-sm">{formatDate(member.receiving_date)}</div>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                      {isPastDate ? (
                                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                                          Paid
                                        </span>
                                      ) : isToday ? (
                                        <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                                          Today
                                        </span>
                                      ) : (
                                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                                          Upcoming
                                        </span>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-32">
                      <p className="text-muted-foreground">No Stokvela members found</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Document Upload</CardTitle>
                  <CardDescription>
                    Upload required documents for your loan applications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {hasValidLoanData && loanApplications.pending.length > 0 ? (
                    <div className="space-y-6">
                      <p className="text-sm">
                        Please upload the required documents for your loan application. 
                        These documents will be verified by our system to process your loan application.
                      </p>
                      
                      <DocumentUpload 
                        loanId={loanApplications.pending[0].id} 
                        onComplete={() => {
                          toast.success('All documents uploaded', {
                            description: 'Your application is now under review.'
                          });
                        }}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-32">
                      <div className="text-center">
                        <UserCheck className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground">No pending applications require documents</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* AI Assistant */}
        <GreenFinanceAI />
      </div>
    </Layout>
  );
};

export default UserDashboard;

