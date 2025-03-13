
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { SupabaseUser } from '@/types/user';

// Get a single user's details
export function useUserDetails(userId: string | null) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: async (): Promise<SupabaseUser | null> => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from('users_account')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Error fetching user details',
          description: error.message,
        });
        throw new Error(error.message);
      }

      return data || null;
    },
    enabled: !!userId,
  });
}

// Update user status (active/inactive)
export function useUpdateUserStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      userId, 
      isActive 
    }: { 
      userId: string; 
      isActive: boolean 
    }) => {
      const { data, error } = await supabase
        .from('users_account')
        .update({ confirmed_email: isActive })
        .eq('id', userId);

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: 'Status updated',
        description: 'User status has been updated successfully.',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: error instanceof Error ? error.message : 'Failed to update user status',
      });
    },
  });
}

// Update user details
export function useUpdateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userData: Partial<SupabaseUser> & { id: string }) => {
      const { id, ...updateData } = userData;
      
      const { data, error } = await supabase
        .from('users_account')
        .update(updateData)
        .eq('id', id);

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: 'User updated',
        description: 'User details have been updated successfully.',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Update failed',
        description: error instanceof Error ? error.message : 'Failed to update user',
      });
    },
  });
}

// Delete user
export function useDeleteUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from('users_account')
        .delete()
        .eq('id', userId);

      if (error) throw new Error(error.message);
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: 'User deleted',
        description: 'User has been deleted successfully.',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Delete failed',
        description: error instanceof Error ? error.message : 'Failed to delete user',
      });
    },
  });
}
