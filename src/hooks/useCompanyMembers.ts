import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';

export interface CompanyMember {
  id: string;
  user_id: string;
  full_name: string;
  role: string | null;
  company_id: string | null;
  created_at: string;
}

export function useCompanyMembers(companyIdOverride?: string) {
  const { data: profile } = useProfile();
  const companyId = companyIdOverride ?? profile?.company_id;

  return useQuery({
    queryKey: ['company-members', companyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('company_id', companyId!)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return (data ?? []) as CompanyMember[];
    },
    enabled: !!companyId,
  });
}

export function useTransferOwnership(companyIdOverride?: string) {
  const qc = useQueryClient();
  const { user } = useAuth();
  const { data: profile } = useProfile();

  return useMutation({
    mutationFn: async (targetUserId: string) => {
      const companyId = companyIdOverride ?? profile!.company_id!;
      const { error } = await supabase.rpc('transfer_ownership', {
        _current_owner_id: user!.id,
        _new_owner_id: targetUserId,
        _company_id: companyId,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['profile'] });
      qc.invalidateQueries({ queryKey: ['user-role'] });
      qc.invalidateQueries({ queryKey: ['company-members'] });
    },
  });
}

export function useRemoveMember(companyIdOverride?: string) {
  const qc = useQueryClient();
  const { user } = useAuth();
  const { data: profile } = useProfile();

  return useMutation({
    mutationFn: async (targetUserId: string) => {
      const companyId = companyIdOverride ?? profile!.company_id!;
      const { error } = await supabase.rpc('remove_member', {
        _actor_id: user!.id,
        _target_id: targetUserId,
        _company_id: companyId,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['company-members'] });
    },
  });
}
