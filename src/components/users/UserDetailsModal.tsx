
import React from 'react';
import { formatDate } from '@/lib/utils';
import { mapRoleNumberToString } from '@/types/user';
import { useUserDetails } from '@/hooks/use-user-actions';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, User, AlertCircle } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface UserDetailsModalProps {
  userId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const UserDetailsModal = ({ userId, isOpen, onClose }: UserDetailsModalProps) => {
  const { data: user, isLoading, error } = useUserDetails(userId);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
          <DialogDescription>
            Complete information about the selected user.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-destructive">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            <p>Error loading user details</p>
          </div>
        ) : !user ? (
          <div className="text-center py-8 text-muted-foreground">
            <User className="h-8 w-8 mx-auto mb-2" />
            <p>User not found</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Avatar className="h-20 w-20">
                {user.profile_picture ? (
                  <AvatarImage src={user.profile_picture} alt={user.full_names} />
                ) : (
                  <AvatarFallback className="text-xl">
                    {user.full_names.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="text-center sm:text-left">
                <h3 className="text-xl font-semibold">{user.full_names}</h3>
                <p className="text-muted-foreground">{user.email}</p>
                <div className="flex justify-center sm:justify-start items-center gap-2 mt-2">
                  <Badge className="capitalize">{mapRoleNumberToString(user.role)}</Badge>
                  {user.confirmed_email ? (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-amber-600 border-amber-600/20">
                      <AlertCircle className="h-3.5 w-3.5 mr-1" />
                      Inactive
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">User ID</p>
                <p className="mt-1">{user.user_number || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Gender</p>
                <p className="mt-1">{user.gender || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
                <p className="mt-1">{user.date_of_birth ? formatDate(user.date_of_birth) : 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cell Phone</p>
                <p className="mt-1">{user.cellphone || 'N/A'}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-sm font-medium text-muted-foreground">Address</p>
                <p className="mt-1">{user.home_address || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Created At</p>
                <p className="mt-1">{formatDate(user.created_at)}</p>
              </div>
            </div>
          </div>
        )}
        
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailsModal;
