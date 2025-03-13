
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { SupabaseUser } from '@/types/user';
import { toast } from '@/components/ui/use-toast';

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async (): Promise<SupabaseUser[]> => {
      try {
        const { data, error } = await supabase
          .from('users_account')
          .select('*');

        if (error) {
          toast({
            variant: 'destructive',
            title: 'Error fetching users',
            description: error.message,
          });
          throw new Error(error.message);
        }

        return data || [];
      } catch (error) {
        console.error('Error fetching users:', error);
        toast({
          variant: 'destructive',
          title: 'Error fetching users',
          description: error instanceof Error ? error.message : 'Unknown error occurred',
        });
        throw error;
      }
    },
  });
}
