import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Team {
  id: string;
  name: string;
  client_id: string;
  manager_id: string | null;
  created_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  name: string;
  role: string;
  tier: 'Líder' | 'Influente' | 'Promessa';
  ovr: number;
  morale: number;
  turno: 'Diurno' | 'Noturno' | 'Integral';
  created_at: string;
}

export interface Task {
  id: string;
  team_id: string;
  assigned_to: string | null;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  due_date: string | null;
  created_by: string | null;
  created_at: string;
}

export function useManagerTeams() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['manager-teams', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('manager_id', user!.id)
        .order('created_at');
      if (error) throw error;
      return data as Team[];
    },
    enabled: !!user,
  });
}

export function useTeamMembers(teamId: string | null) {
  return useQuery({
    queryKey: ['team-members', teamId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('team_id', teamId!)
        .order('ovr', { ascending: false });
      if (error) throw error;
      return data as TeamMember[];
    },
    enabled: !!teamId,
  });
}

export function useTeamTasks(teamId: string | null) {
  return useQuery({
    queryKey: ['team-tasks', teamId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('team_id', teamId!)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Task[];
    },
    enabled: !!teamId,
  });
}

export function useCreateTeamMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (member: Omit<TeamMember, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('team_members')
        .insert(member as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ['team-members', vars.team_id] }),
  });
}

export function useDeleteTeamMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, teamId }: { id: string; teamId: string }) => {
      const { error } = await supabase.from('team_members').delete().eq('id', id);
      if (error) throw error;
      return teamId;
    },
    onSuccess: (teamId) => qc.invalidateQueries({ queryKey: ['team-members', teamId] }),
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (task: Pick<Task, 'team_id' | 'title' | 'description' | 'priority' | 'due_date' | 'assigned_to'>) => {
      const { data, error } = await supabase
        .from('tasks')
        .insert({ ...task, created_by: user!.id } as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ['team-tasks', vars.team_id] }),
  });
}

export function useUpdateTaskStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, teamId }: { id: string; status: Task['status']; teamId: string }) => {
      const { error } = await supabase
        .from('tasks')
        .update({ status: status as any, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
      return teamId;
    },
    onSuccess: (teamId) => qc.invalidateQueries({ queryKey: ['team-tasks', teamId] }),
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, teamId }: { id: string; teamId: string }) => {
      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (error) throw error;
      return teamId;
    },
    onSuccess: (teamId) => qc.invalidateQueries({ queryKey: ['team-tasks', teamId] }),
  });
}
