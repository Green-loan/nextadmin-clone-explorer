
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import DataTable from "@/components/ui/DataTable";
import { useQuery } from "@tanstack/react-query";
import { getApprovedLoans, getRejectedLoans } from "@/lib/supabase-utils";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileCheck, FileX } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Reports = () => {
  const [activeTab, setActiveTab] = useState("approved");

  // Fetch approved loans
  const { 
    data: approvedLoans = [], 
    isLoading: isApprovedLoading 
  } = useQuery({
    queryKey: ['approvedLoans'],
    queryFn: getApprovedLoans,
  });

  // Fetch rejected loans
  const { 
    data: rejectedLoans = [], 
    isLoading: isRejectedLoading 
  } = useQuery({
    queryKey: ['rejectedLoans'],
    queryFn: getRejectedLoans,
  });

  // Define columns for the approved loans table
  const approvedColumns = [
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: (value: number) => `R${value.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`,
    },
    {
      accessorKey: 'purpose',
      header: 'Purpose',
    },
    {
      accessorKey: 'due_date',
      header: 'Due Date',
      cell: (value: string) => value ? formatDate(value) : 'N/A',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: (value: boolean) => (
        <Badge variant={value ? "success" : "destructive"}>
          {value ? "Active" : "Completed"}
        </Badge>
      ),
    },
    {
      accessorKey: 'timestamp',
      header: 'Approved On',
      cell: (value: string) => formatDate(value),
    },
  ];

  // Define columns for the rejected loans table
  const rejectedColumns = [
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: (value: number) => `R${value.toLocaleString('en-ZA', { minimumFractionDigits: 2 })}`,
    },
    {
      accessorKey: 'purpose',
      header: 'Purpose',
    },
    {
      accessorKey: 'timestamp',
      header: 'Rejected On',
      cell: (value: string) => formatDate(value),
    },
  ];

  return (
    <Layout>
      <div className="container py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Loan Reports</h1>
        </div>

        <Tabs 
          defaultValue="approved" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full md:w-auto grid-cols-2">
            <TabsTrigger value="approved" className="flex items-center gap-2">
              <FileCheck className="h-4 w-4" />
              <span>Approved Loans</span>
            </TabsTrigger>
            <TabsTrigger value="rejected" className="flex items-center gap-2">
              <FileX className="h-4 w-4" />
              <span>Rejected Loans</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="approved" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCheck className="h-5 w-5 text-green-500" />
                  Approved Loans History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable
                  data={approvedLoans}
                  columns={approvedColumns}
                  isLoading={isApprovedLoading}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="rejected" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileX className="h-5 w-5 text-red-500" />
                  Rejected Loans History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable
                  data={rejectedLoans}
                  columns={rejectedColumns}
                  isLoading={isRejectedLoading}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Reports;
