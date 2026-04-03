import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';

export interface Invite {
  id: string;
  token: string;
  email: string;
  role: string;
  company_id: string;
  invited_by: string | null;
  used: boolean;
  used_by: string | null;
  expires_at: string;
  created_at: string;
}

export type InviteStatus = 'pending' | 'active' | 'expired';

export function getInviteStatus(invite: Invite): InviteStatus {
  if (invite.used) return 'active';
  if (new Date(invite.expires_at) < new Date()) return 'expired';
  return 'pending';
}

export function useInvites() {
  const { data: profile } = useProfile();

  return useQuery({
    queryKey: ['invites', profile?.company_id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('invites')
        .select('*')
        .eq('company_id', profile!.company_id!)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Invite[];
    },
    enabled: !!profile?.company_id,
  });
}

export function useCreateInvite() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const { data: profile } = useProfile();

  return useMutation({
    mutationFn: async ({ role, email }: { role: string; email?: string }) => {
      const token = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

      const { data, error } = await supabase
        .from('invites')
        .insert({
          token,
          role: role as any,
          email: email || '',
          company_id: profile!.company_id!,
          invited_by: user!.id,
          expires_at: expiresAt,
        } as any)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as Invite;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['invites'] }),
  });
}

export function useCancelInvite() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (inviteId: string) => {
      const { error } = await supabase
        .from('invites')
        .update({ expires_at: new Date().toISOString() } as any)
        .eq('id', inviteId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['invites'] }),
  });
}

export function useRegenerateInvite() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const { data: profile } = useProfile();

  return useMutation({
    mutationFn: async (oldInvite: Invite) => {
      const token = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

      const { data, error } = await supabase
        .from('invites')
        .insert({
          token,
          role: oldInvite.role as any,
          email: oldInvite.email,
          company_id: profile!.company_id!,
          invited_by: user!.id,
          expires_at: expiresAt,
        } as any)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as Invite;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['invites'] }),
  });
}
