
import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import DataTable from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, CheckCircle2, AlertCircle } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive';
  role: string;
  createdAt: string;
}

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading
    const loadData = setTimeout(() => {
      setUsers([
        {
          id: '1',
          name: 'John Doe',
          email: 'john.doe@example.com',
          status: 'active',
          role: 'Admin',
          createdAt: '2023-01-15',
        },
        {
          id: '2',
          name: 'Jane Smith',
          email: 'jane.smith@example.com',
          status: 'active',
          role: 'Editor',
          createdAt: '2023-01-20',
        },
        {
          id: '3',
          name: 'Robert Johnson',
          email: 'robert.johnson@example.com',
          status: 'inactive',
          role: 'User',
          createdAt: '2023-02-05',
        },
        {
          id: '4',
          name: 'Emily Brown',
          email: 'emily.brown@example.com',
          status: 'active',
          role: 'Editor',
          createdAt: '2023-02-10',
        },
        {
          id: '5',
          name: 'Michael Wilson',
          email: 'michael.wilson@example.com',
          status: 'active',
          role: 'User',
          createdAt: '2023-02-15',
        },
        {
          id: '6',
          name: 'Sarah Davis',
          email: 'sarah.davis@example.com',
          status: 'inactive',
          role: 'User',
          createdAt: '2023-02-25',
        },
        {
          id: '7',
          name: 'David Martinez',
          email: 'david.martinez@example.com',
          status: 'active',
          role: 'Admin',
          createdAt: '2023-03-05',
        },
        {
          id: '8',
          name: 'Jessica Lee',
          email: 'jessica.lee@example.com',
          status: 'active',
          role: 'Editor',
          createdAt: '2023-03-10',
        },
        {
          id: '9',
          name: 'Thomas Anderson',
          email: 'thomas.anderson@example.com',
          status: 'inactive',
          role: 'User',
          createdAt: '2023-03-20',
        },
        {
          id: '10',
          name: 'Lisa Taylor',
          email: 'lisa.taylor@example.com',
          status: 'active',
          role: 'User',
          createdAt: '2023-03-25',
        },
        {
          id: '11',
          name: 'Daniel White',
          email: 'daniel.white@example.com',
          status: 'active',
          role: 'Editor',
          createdAt: '2023-04-01',
        },
        {
          id: '12',
          name: 'Karen Harris',
          email: 'karen.harris@example.com',
          status: 'inactive',
          role: 'User',
          createdAt: '2023-04-05',
        },
      ]);
      setIsLoading(false);
    }, 1200);

    return () => clearTimeout(loadData);
  }, []);

  const columns = [
    {
      accessorKey: 'name' as keyof User,
      header: 'Name',
      cell: (value: string) => {
        const user = users.find(u => u.name === value) || { email: '' };
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={`/placeholder.svg`} alt={value} />
              <AvatarFallback>
                {value.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{value}</div>
              <div className="text-sm text-muted-foreground">{user.email}</div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'role' as keyof User,
      header: 'Role',
    },
    {
      accessorKey: 'status' as keyof User,
      header: 'Status',
      cell: (value: 'active' | 'inactive') => {
        return value === 'active' ? (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30">
            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
            Active
          </Badge>
        ) : (
          <Badge variant="outline" className="text-amber-600 dark:text-amber-400 border-amber-600/20 dark:border-amber-400/20">
            <AlertCircle className="h-3.5 w-3.5 mr-1" />
            Inactive
          </Badge>
        );
      },
    },
    {
      accessorKey: 'createdAt' as keyof User,
      header: 'Created At',
    },
    {
      accessorKey: 'id' as keyof User,
      header: 'Actions',
      cell: (id: string) => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="animate-scale-in">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>View details</DropdownMenuItem>
              <DropdownMenuItem>Edit user</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">Delete user</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const handleCreateUser = () => {
    // This would typically open a modal or navigate to a creation form
    console.log('Create new user');
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
          <p className="text-muted-foreground">
            Manage user accounts and permissions.
          </p>
        </div>
        
        <DataTable
          data={users}
          columns={columns}
          searchable={true}
          createNew={{
            label: 'Add User',
            onClick: handleCreateUser,
          }}
          isLoading={isLoading}
        />
      </div>
    </Layout>
  );
};

export default Users;
