import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Client {
  id: string;
  name: string;
  city: string;
  slug: string;
  status: 'active' | 'blocked';
  headcount: number;
  ovr: number;
  morale: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export type ClientInsert = Pick<Client, 'name' | 'city' | 'slug' | 'status'> & {
  headcount?: number;
  ovr?: number;
  morale?: number;
};

export function useClients() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data as Client[];
    },
    enabled: !!user,
  });
}

export function useCreateClient() {
  const qc = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (client: ClientInsert) => {
      const { data, error } = await supabase
        .from('clients')
        .insert({ ...client, created_by: user!.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clients'] }),
  });
}

export function useUpdateClient() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Client> & { id: string }) => {
      const { data, error } = await supabase
        .from('clients')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clients'] }),
  });
}

export function useDeleteClient() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('clients').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clients'] }),
  });
}
