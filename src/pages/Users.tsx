
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
import { 
  MoreHorizontal, 
  CheckCircle2, 
  AlertCircle, 
  User as UserIcon, 
  Eye, 
  Pencil, 
  Trash,
  UserCheck,
  UserX
} from 'lucide-react';
import { useUsers } from '@/hooks/use-users';
import { useUpdateUserStatus } from '@/hooks/use-user-actions';
import { SupabaseUser, mapRoleNumberToString } from '@/types/user';
import { formatDate } from '@/lib/utils';
import UserDetailsModal from '@/components/users/UserDetailsModal';
import EditUserModal from '@/components/users/EditUserModal';
import DeleteUserDialog from '@/components/users/DeleteUserDialog';

const Users = () => {
  const { data: users = [], isLoading, error } = useUsers();
  const updateUserStatus = useUpdateUserStatus();
  
  // Modal state
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserName, setSelectedUserName] = useState('');
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Action handlers
  const handleViewDetails = (id: string) => {
    setSelectedUserId(id);
    setIsViewModalOpen(true);
  };

  const handleEditUser = (id: string, name: string) => {
    setSelectedUserId(id);
    setSelectedUserName(name);
    setIsEditModalOpen(true);
  };

  const handleDeleteUser = (id: string, name: string) => {
    setSelectedUserId(id);
    setSelectedUserName(name);
    setIsDeleteDialogOpen(true);
  };

  const handleStatusChange = async (id: string, currentStatus: boolean) => {
    await updateUserStatus.mutateAsync({
      userId: id,
      isActive: !currentStatus
    });
  };
  
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
    confirmed_email: user.confirmed_email || false,
    rawUser: user,
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
        const user = formattedUsers.find(u => u.id === id);
        if (!user) return null;
        
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
              
              <DropdownMenuItem onClick={() => handleViewDetails(id)}>
                <Eye className="h-4 w-4 mr-2" />
                View details
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={() => handleEditUser(id, user.name)}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit user
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                onClick={() => handleStatusChange(id, user.confirmed_email)}
              >
                {user.confirmed_email ? (
                  <>
                    <UserX className="h-4 w-4 mr-2" />
                    Set as inactive
                  </>
                ) : (
                  <>
                    <UserCheck className="h-4 w-4 mr-2" />
                    Set as active
                  </>
                )}
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive" 
                onClick={() => handleDeleteUser(id, user.name)}
              >
                <Trash className="h-4 w-4 mr-2" />
                Delete user
              </DropdownMenuItem>
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
          isLoading={isLoading || updateUserStatus.isPending}
        />
      </div>

      {/* User Details Modal */}
      <UserDetailsModal 
        userId={selectedUserId}
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
      />

      {/* Edit User Modal */}
      <EditUserModal
        userId={selectedUserId}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
      />

      {/* Delete User Confirmation */}
      <DeleteUserDialog
        userId={selectedUserId}
        userName={selectedUserName}
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
      />
    </Layout>
  );
};

export default Users;
