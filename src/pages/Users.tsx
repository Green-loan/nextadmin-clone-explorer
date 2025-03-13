
import { useState } from 'react';
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
import { MoreHorizontal, CheckCircle2, AlertCircle, User as UserIcon } from 'lucide-react';
import { useUsers } from '@/hooks/use-users';
import { SupabaseUser, mapRoleNumberToString } from '@/types/user';
import { formatDate } from '@/lib/utils';

const Users = () => {
  const { data: users = [], isLoading, error } = useUsers();
  
  // Format data for the DataTable
  const formattedUsers = users.map(user => ({
    id: user.id,
    name: user.full_names || 'N/A',
    email: user.email,
    status: user.confirmed_email ? 'active' : 'inactive' as 'active' | 'inactive',
    role: mapRoleNumberToString(user.role),
    createdAt: user.created_at ? formatDate(user.created_at) : 'N/A',
    profilePicture: user.profile_picture,
    user_number: user.user_number || 'N/A',
    cellphone: user.cellphone || 'N/A',
    gender: user.gender || 'N/A',
    home_address: user.home_address || 'N/A',
  }));

  const columns = [
    {
      accessorKey: 'name' as const,
      header: 'Name',
      cell: (value: string) => {
        const user = formattedUsers.find(u => u.name === value);
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              {user?.profilePicture ? (
                <AvatarImage src={user.profilePicture} alt={value} />
              ) : (
                <AvatarImage src="/placeholder.svg" alt={value} />
              )}
              <AvatarFallback>
                {value && typeof value === 'string'
                  ? value.split(' ').map(n => n[0]).join('').toUpperCase()
                  : <UserIcon className="h-4 w-4" />
                }
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{value}</div>
              <div className="text-sm text-muted-foreground">{user?.email}</div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'role' as const,
      header: 'Role',
    },
    {
      accessorKey: 'status' as const,
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
      accessorKey: 'user_number' as const,
      header: 'User ID',
    },
    {
      accessorKey: 'createdAt' as const,
      header: 'Created At',
    },
    {
      accessorKey: 'id' as const,
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
              <DropdownMenuItem onClick={() => console.log('View user details', id)}>View details</DropdownMenuItem>
              <DropdownMenuItem onClick={() => console.log('Edit user', id)}>Edit user</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={() => console.log('Delete user', id)}>Delete user</DropdownMenuItem>
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

  if (error) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-destructive">Error loading users</h2>
            <p className="text-muted-foreground mt-2">
              {error instanceof Error ? error.message : 'An unknown error occurred'}
            </p>
          </div>
        </div>
      </Layout>
    );
  }

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
          data={formattedUsers}
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
