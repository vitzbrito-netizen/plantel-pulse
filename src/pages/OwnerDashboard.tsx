import { useAuth } from '@/contexts/AuthContext';
import { useClients, Client } from '@/hooks/useClients';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { ClientFormDialog } from '@/components/ClientFormDialog';
import { Users, TrendingUp, Heart, Building2, ChevronRight, Plus, LogOut, Pencil, Trash2, Loader2, Shield, BarChart3, Settings, FileText } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useDeleteClient } from '@/hooks/useClients';

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { data: clients = [], isLoading } = useClients();
  const deleteClient = useDeleteClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deletingClient, setDeletingClient] = useState<Client | null>(null);

  const userEmail = user?.email ?? '';
  const userInitial = userEmail.charAt(0).toUpperCase();
  const activeCount = clients.filter(c => c.status === 'active').length;
  const totalHeadcount = clients.reduce((s, c) => s + c.headcount, 0);
  const avgOvr = clients.length ? Math.round(clients.reduce((s, c) => s + c.ovr, 0) / clients.length) : 0;
  const avgMorale = clients.length ? Math.round(clients.reduce((s, c) => s + c.morale, 0) / clients.length) : 0;

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-lg font-bold text-primary-foreground">R</span>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-foreground">REGIAE</h1>
              <p className="text-xs text-muted-foreground">Dashboard — Dono</p>
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
                  <Shield className="w-3 h-3 text-primary" />
                  <span className="text-xs text-primary font-medium">Dono</span>
                </div>
              </div>
            </div>
            <button onClick={signOut} className="flex items-center gap-2 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/30 rounded-lg transition-colors">
              <LogOut className="w-4 h-4" /> Sair
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* KPI row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <KPICard icon={<Building2 className="w-5 h-5" />} label="Unidades Ativas" value={activeCount.toString()} />
          <KPICard icon={<Users className="w-5 h-5" />} label="Total Colaboradores" value={totalHeadcount.toString()} />
          <KPICard icon={<TrendingUp className="w-5 h-5" />} label="OVR Médio" value={avgOvr.toString()} />
          <KPICard icon={<Heart className="w-5 h-5" />} label="Moral Média" value={avgMorale.toString()} color={avgMorale >= 75 ? 'text-morale-high' : avgMorale >= 60 ? 'text-morale-mid' : 'text-morale-low'} />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">Suas Unidades</h2>
          <button onClick={() => { setEditingClient(null); setFormOpen(true); }} className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
            <Plus className="w-4 h-4" /> Nova Unidade
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
        ) : clients.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-xl border border-border border-dashed">
            <Building2 className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" />
            <p className="text-base text-muted-foreground mb-2">Nenhuma unidade cadastrada</p>
            <button onClick={() => { setEditingClient(null); setFormOpen(true); }} className="text-sm text-primary font-semibold hover:underline">+ Criar primeira unidade</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {clients.map(client => {
              const isBlocked = client.status === 'blocked';
              return (
                <div key={client.id} onClick={() => !isBlocked && navigate(`/unidade/${client.slug}`)}
                  className={`group relative rounded-xl border-2 transition-all duration-200 ${isBlocked ? 'bg-card/30 border-border/50 opacity-50' : 'bg-card border-border hover:border-primary/60 hover:shadow-xl cursor-pointer active:scale-[0.98]'}`}>
                  <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button onClick={(e) => { e.stopPropagation(); setEditingClient(client); setFormOpen(true); }} className="p-2 rounded-lg bg-muted/80 hover:bg-muted text-muted-foreground hover:text-foreground"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={(e) => { e.stopPropagation(); setDeletingClient(client); }} className="p-2 rounded-lg bg-muted/80 hover:bg-destructive/20 text-muted-foreground hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-base font-bold ${isBlocked ? 'bg-muted text-muted-foreground' : 'bg-primary text-primary-foreground'}`}>
                        {client.name.split(' ').map(w => w[0]).slice(0, 2).join('')}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-base font-bold text-foreground">{client.name}</h3>
                        <p className="text-sm text-muted-foreground">{client.city}</p>
                      </div>
                      {!isBlocked && <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition" />}
                    </div>
                    <div className="flex items-center gap-3">
                      <MetricPill icon={<TrendingUp className="w-3.5 h-3.5" />} label="OVR" value={client.ovr} />
                      <MetricPill icon={<Heart className="w-3.5 h-3.5" />} label="Moral" value={client.morale} color={client.morale >= 75 ? 'text-morale-high' : client.morale >= 60 ? 'text-morale-mid' : 'text-morale-low'} />
                      <MetricPill icon={<Users className="w-3.5 h-3.5" />} label="Equipe" value={client.headcount} />
                    </div>
                  </div>
                  <div className={`px-5 py-2.5 border-t-2 text-xs font-semibold rounded-b-xl ${isBlocked ? 'border-border/50 text-muted-foreground/50 bg-muted/10' : 'border-morale-high/20 text-morale-high bg-morale-high/5'}`}>
                    <span className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${isBlocked ? 'bg-muted-foreground/50' : 'bg-morale-high animate-pulse'}`} />
                      {isBlocked ? 'Bloqueado' : 'Ativo'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ClientFormDialog open={formOpen} onOpenChange={setFormOpen} client={editingClient} />
      <AlertDialog open={!!deletingClient} onOpenChange={(open) => !open && setDeletingClient(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover unidade</AlertDialogTitle>
            <AlertDialogDescription>Tem certeza que deseja remover <strong>{deletingClient?.name}</strong>?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={async () => { if (deletingClient) { await deleteClient.mutateAsync(deletingClient.id); toast.success('Removido'); setDeletingClient(null); } }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Remover</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function KPICard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color?: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center gap-2 text-muted-foreground mb-2">{icon}<span className="text-xs uppercase">{label}</span></div>
      <p className={`text-2xl font-bold font-mono ${color || 'text-foreground'}`}>{value}</p>
    </div>
  );
}

function MetricPill({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color?: string }) {
  return (
    <div className="flex items-center gap-2 bg-background/50 border border-border/50 rounded-lg px-3 py-1.5">
      <span className="text-muted-foreground">{icon}</span>
      <span className="text-xs text-muted-foreground uppercase">{label}</span>
      <span className={`text-sm font-bold font-mono ${color || 'text-foreground'}`}>{value}</span>
    </div>
  );
}
