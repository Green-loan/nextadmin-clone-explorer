
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
      // Use the confirmed column which is the actual column in the database
      const { data, error } = await supabase
        .from('users_account')
        .update({ confirmed: isActive })
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

// Upload profile picture and return the public URL
export async function uploadProfilePicture(file: File, userId: string): Promise<string> {
  if (!file || !userId) {
    throw new Error("File and user ID are required");
  }
  
  try {
    // Create a unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `profile-pictures/${fileName}`;
    
    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('users')
      .upload(filePath, file);
    
    if (uploadError) throw uploadError;
    
    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('users')
      .getPublicUrl(filePath);
    
    return publicUrl;
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    throw error;
  }
}

// Update user details
export function useUpdateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userData: Partial<SupabaseUser> & { id: string }) => {
      const { id, ...updateData } = userData;
      
      console.log('Updating user with data:', updateData);
      
      const { data, error } = await supabase
        .from('users_account')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('Error updating user:', error);
        throw new Error(error.message);
      }
      
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', variables.id] });
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
