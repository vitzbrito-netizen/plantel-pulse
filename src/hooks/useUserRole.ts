import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type AppRole = 'founder' | 'owner' | 'manager' | 'employee';

export function useUserRole() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-role', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user!.id)
        .maybeSingle();
      if (error) throw error;
      return (data?.role as AppRole) ?? null;
    },
    enabled: !!user,
  });
}

export function useAssignRole() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (role: AppRole) => {
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: user!.id, role: role as any });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['user-role'] }),
  });
}
