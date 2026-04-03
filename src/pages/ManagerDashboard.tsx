import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  useManagerTeams, useTeamMembers, useTeamTasks,
  useCreateTeamMember, useDeleteTeamMember,
  useCreateTask, useUpdateTaskStatus, useDeleteTask,
  TeamMember, Task,
} from '@/hooks/useTeamData';
import {
  LogOut, Users, TrendingUp, Heart, Plus, Trash2, Loader2,
  CheckCircle, Clock, AlertCircle, ChevronDown, X,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

export default function ManagerDashboard() {
  const { user, signOut } = useAuth();
  const { data: teams = [], isLoading: teamsLoading } = useManagerTeams();
  const activeTeam = teams[0] ?? null;
  const { data: members = [], isLoading: membersLoading } = useTeamMembers(activeTeam?.id ?? null);
  const { data: tasks = [], isLoading: tasksLoading } = useTeamTasks(activeTeam?.id ?? null);

  const createMember = useCreateTeamMember();
  const deleteMember = useDeleteTeamMember();
  const createTask = useCreateTask();
  const updateTaskStatus = useUpdateTaskStatus();
  const deleteTask = useDeleteTask();

  const [showAddMember, setShowAddMember] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [tab, setTab] = useState<'equipe' | 'tarefas'>('equipe');

  const userEmail = user?.email ?? '';
  const userInitial = userEmail.charAt(0).toUpperCase();

  const isLoading = teamsLoading || membersLoading || tasksLoading;

  // Metrics
  const avgOvr = members.length ? Math.round(members.reduce((s, m) => s + m.ovr, 0) / members.length) : 0;
  const avgMorale = members.length ? Math.round(members.reduce((s, m) => s + m.morale, 0) / members.length) : 0;
  const pendingTasks = tasks.filter(t => t.status === 'pending').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
  const doneTasks = tasks.filter(t => t.status === 'done').length;

  if (!activeTeam && !teamsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <ManagerHeader userEmail={userEmail} userInitial={userInitial} signOut={signOut} />
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <Users className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">Nenhuma equipe atribuída</h2>
          <p className="text-sm text-muted-foreground">
            Peça ao administrador para atribuir você como gerente de uma equipe.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <ManagerHeader userEmail={userEmail} userInitial={userInitial} signOut={signOut} teamName={activeTeam?.name} />

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <KPI icon={<Users className="w-5 h-5" />} label="Equipe" value={members.length.toString()} />
          <KPI icon={<TrendingUp className="w-5 h-5" />} label="OVR Médio" value={avgOvr.toString()} />
          <KPI icon={<Heart className="w-5 h-5" />} label="Moral" value={avgMorale.toString()}
            color={avgMorale >= 75 ? 'text-morale-high' : avgMorale >= 60 ? 'text-morale-mid' : 'text-morale-low'} />
          <KPI icon={<Clock className="w-5 h-5" />} label="Tarefas Pendentes" value={pendingTasks.toString()} />
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-1 bg-card border border-border rounded-lg p-1 mb-6 w-fit">
          <button onClick={() => setTab('equipe')} className={`px-4 py-2 text-sm font-medium rounded-md transition ${tab === 'equipe' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
            <Users className="w-4 h-4 inline mr-1.5" />Equipe ({members.length})
          </button>
          <button onClick={() => setTab('tarefas')} className={`px-4 py-2 text-sm font-medium rounded-md transition ${tab === 'tarefas' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
            <CheckCircle className="w-4 h-4 inline mr-1.5" />Tarefas ({tasks.length})
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
        ) : tab === 'equipe' ? (
          /* Team Members */
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-foreground">Membros da Equipe</h3>
              <button onClick={() => setShowAddMember(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition">
                <Plus className="w-4 h-4" /> Adicionar
              </button>
            </div>

            {members.length === 0 ? (
              <div className="text-center py-12 bg-card rounded-xl border border-dashed border-border">
                <Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Nenhum membro na equipe</p>
                <button onClick={() => setShowAddMember(true)} className="text-sm text-primary font-semibold mt-2 hover:underline">+ Adicionar primeiro membro</button>
              </div>
            ) : (
              <div className="space-y-2">
                {members.map(m => (
                  <MemberRow key={m.id} member={m} teamId={activeTeam!.id} onDelete={async () => {
                    await deleteMember.mutateAsync({ id: m.id, teamId: activeTeam!.id });
                    toast.success('Membro removido');
                  }} />
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Tasks */
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-foreground">Tarefas</h3>
              <button onClick={() => setShowAddTask(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition">
                <Plus className="w-4 h-4" /> Nova Tarefa
              </button>
            </div>

            {/* Task columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <TaskColumn title="Pendentes" icon={<Clock className="w-4 h-4" />} tasks={tasks.filter(t => t.status === 'pending')} members={members} teamId={activeTeam!.id} onStatusChange={updateTaskStatus} onDelete={deleteTask} color="text-yellow-600" />
              <TaskColumn title="Em Progresso" icon={<AlertCircle className="w-4 h-4" />} tasks={tasks.filter(t => t.status === 'in_progress')} members={members} teamId={activeTeam!.id} onStatusChange={updateTaskStatus} onDelete={deleteTask} color="text-primary" />
              <TaskColumn title="Concluídas" icon={<CheckCircle className="w-4 h-4" />} tasks={tasks.filter(t => t.status === 'done')} members={members} teamId={activeTeam!.id} onStatusChange={updateTaskStatus} onDelete={deleteTask} color="text-morale-high" />
            </div>
          </div>
        )}
      </div>

      {/* Add Member Dialog */}
      <AddMemberDialog open={showAddMember} onClose={() => setShowAddMember(false)} teamId={activeTeam?.id ?? ''} onCreate={createMember} />

      {/* Add Task Dialog */}
      <AddTaskDialog open={showAddTask} onClose={() => setShowAddTask(false)} teamId={activeTeam?.id ?? ''} members={members} onCreate={createTask} />
    </div>
  );
}

// --- Sub-components ---

function ManagerHeader({ userEmail, userInitial, signOut, teamName }: { userEmail: string; userInitial: string; signOut: () => void; teamName?: string }) {
  return (
    <header className="bg-card border-b border-border">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-lg font-bold text-primary-foreground">R</span>
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-foreground">REGIAE</h1>
            <p className="text-xs text-muted-foreground">{teamName || 'Dashboard — Gerente'}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-primary/20 border border-primary/30 rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold text-primary">{userInitial}</span>
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-foreground leading-none">{userEmail}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <Users className="w-3 h-3 text-primary" />
                <span className="text-xs text-primary font-medium">Gerente</span>
              </div>
            </div>
          </div>
          <button onClick={signOut} className="flex items-center gap-2 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/30 rounded-lg transition-colors">
            <LogOut className="w-4 h-4" /> Sair
          </button>
        </div>
      </div>
    </header>
  );
}

function KPI({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color?: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center gap-2 text-muted-foreground mb-2">{icon}<span className="text-xs uppercase">{label}</span></div>
      <p className={`text-2xl font-bold font-mono ${color || 'text-foreground'}`}>{value}</p>
    </div>
  );
}

function MemberRow({ member, teamId, onDelete }: { member: TeamMember; teamId: string; onDelete: () => void }) {
  const tierColors: Record<string, string> = {
    'Líder': 'bg-tier-lider text-white',
    'Influente': 'bg-tier-influente text-white',
    'Promessa': 'bg-tier-promessa text-white',
  };

  return (
    <div className="flex items-center gap-4 bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition">
      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
        <span className="text-sm font-bold text-primary">{member.name.split(' ').map(w => w[0]).slice(0, 2).join('')}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-foreground truncate">{member.name}</p>
        <p className="text-xs text-muted-foreground">{member.role} · {member.turno}</p>
      </div>
      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${tierColors[member.tier] || 'bg-muted text-muted-foreground'}`}>
        {member.tier}
      </span>
      <div className="flex items-center gap-3 text-xs">
        <span className="font-mono font-bold text-foreground">{member.ovr} <span className="text-muted-foreground font-normal">OVR</span></span>
        <span className={`font-mono font-bold ${member.morale >= 75 ? 'text-morale-high' : member.morale >= 60 ? 'text-morale-mid' : 'text-morale-low'}`}>
          {member.morale} <span className="text-muted-foreground font-normal">Moral</span>
        </span>
      </div>
      <button onClick={onDelete} className="p-2 text-muted-foreground hover:text-destructive transition rounded-lg hover:bg-destructive/10">
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

function TaskColumn({ title, icon, tasks, members, teamId, onStatusChange, onDelete, color }: {
  title: string; icon: React.ReactNode; tasks: Task[]; members: TeamMember[]; teamId: string;
  onStatusChange: any; onDelete: any; color: string;
}) {
  const nextStatus: Record<string, Task['status']> = { pending: 'in_progress', in_progress: 'done', done: 'pending' };

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className={`flex items-center gap-2 mb-4 ${color}`}>
        {icon}
        <h4 className="text-sm font-bold">{title}</h4>
        <span className="text-xs bg-muted rounded-full px-2 py-0.5 text-muted-foreground ml-auto">{tasks.length}</span>
      </div>
      <div className="space-y-2">
        {tasks.map(task => {
          const assignee = members.find(m => m.id === task.assigned_to);
          return (
            <div key={task.id} className="bg-background border border-border rounded-lg p-3 group">
              <p className="text-sm font-medium text-foreground mb-1">{task.title}</p>
              {task.description && <p className="text-xs text-muted-foreground mb-2">{task.description}</p>}
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">{assignee?.name ?? '—'}</span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                  <button onClick={() => onStatusChange.mutate({ id: task.id, status: nextStatus[task.status], teamId })}
                    className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary rounded hover:bg-primary/20 transition">
                    Avançar
                  </button>
                  <button onClick={() => onDelete.mutate({ id: task.id, teamId })}
                    className="text-[10px] px-2 py-0.5 bg-destructive/10 text-destructive rounded hover:bg-destructive/20 transition">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {tasks.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">Nenhuma tarefa</p>}
      </div>
    </div>
  );
}

function AddMemberDialog({ open, onClose, teamId, onCreate }: { open: boolean; onClose: () => void; teamId: string; onCreate: any }) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [tier, setTier] = useState<'Líder' | 'Influente' | 'Promessa'>('Promessa');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await onCreate.mutateAsync({ team_id: teamId, name: name.trim(), role: role.trim(), tier, ovr: 50, morale: 70, turno: 'Diurno' as const });
      toast.success('Membro adicionado');
      setName(''); setRole('');
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Erro');
    } finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>Adicionar Membro</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase">Nome</label>
            <input value={name} onChange={e => setName(e.target.value)} required className="mt-1 w-full px-3 py-2.5 bg-background border border-border rounded text-sm text-foreground focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase">Cargo</label>
            <input value={role} onChange={e => setRole(e.target.value)} className="mt-1 w-full px-3 py-2.5 bg-background border border-border rounded text-sm text-foreground focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase">Tier</label>
            <select value={tier} onChange={e => setTier(e.target.value as any)} className="mt-1 w-full px-3 py-2.5 bg-background border border-border rounded text-sm text-foreground">
              <option value="Promessa">Promessa</option>
              <option value="Influente">Influente</option>
              <option value="Líder">Líder</option>
            </select>
          </div>
          <button type="submit" disabled={saving} className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-semibold text-sm hover:bg-primary/90 transition disabled:opacity-50">
            {saving ? 'Salvando...' : 'Adicionar'}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AddTaskDialog({ open, onClose, teamId, members, onCreate }: { open: boolean; onClose: () => void; teamId: string; members: TeamMember[]; onCreate: any }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      await onCreate.mutateAsync({
        team_id: teamId,
        title: title.trim(),
        description: description.trim(),
        assigned_to: assignedTo || null,
        priority,
        due_date: null,
      });
      toast.success('Tarefa criada');
      setTitle(''); setDescription(''); setAssignedTo('');
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Erro');
    } finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle>Nova Tarefa</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase">Título</label>
            <input value={title} onChange={e => setTitle(e.target.value)} required className="mt-1 w-full px-3 py-2.5 bg-background border border-border rounded text-sm text-foreground focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase">Descrição</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className="mt-1 w-full px-3 py-2.5 bg-background border border-border rounded text-sm text-foreground focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 resize-none" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase">Atribuir a</label>
            <select value={assignedTo} onChange={e => setAssignedTo(e.target.value)} className="mt-1 w-full px-3 py-2.5 bg-background border border-border rounded text-sm text-foreground">
              <option value="">Sem atribuição</option>
              {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase">Prioridade</label>
            <select value={priority} onChange={e => setPriority(e.target.value as any)} className="mt-1 w-full px-3 py-2.5 bg-background border border-border rounded text-sm text-foreground">
              <option value="low">Baixa</option>
              <option value="medium">Média</option>
              <option value="high">Alta</option>
            </select>
          </div>
          <button type="submit" disabled={saving} className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-semibold text-sm hover:bg-primary/90 transition disabled:opacity-50">
            {saving ? 'Criando...' : 'Criar Tarefa'}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
