import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useClients, useDeleteClient, Client } from '@/hooks/useClients';
import { ClientFormDialog } from '@/components/ClientFormDialog';
import { Users, TrendingUp, Heart, Building2, ChevronRight, Plus, LogOut, Pencil, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function Portal() {
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

  const handleEdit = (e: React.MouseEvent, client: Client) => {
    e.stopPropagation();
    setEditingClient(client);
    setFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingClient) return;
    try {
      await deleteClient.mutateAsync(deletingClient.id);
      toast.success('Cliente removido');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao remover');
    }
    setDeletingClient(null);
  };

  const handleNewClient = () => {
    setEditingClient(null);
    setFormOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Portal Header */}
      <header className="bg-header border-b border-border">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-primary rounded flex items-center justify-center">
              <span className="text-lg font-bold text-primary-foreground">R</span>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-foreground">REGIAE</h1>
              <p className="text-xs text-muted-foreground">Portal Master · Gestão Multiunidade</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-card/50 border border-border rounded px-3 py-1.5">
              <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                <span className="text-foreground font-semibold font-mono">{activeCount}</span> / {clients.length} clientes ativos
              </span>
            </div>
            <div className="h-6 w-px bg-border" />
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-primary/20 border border-primary/30 rounded-full flex items-center justify-center">
                <span className="text-xs font-semibold text-primary">{userInitial}</span>
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-medium text-foreground leading-none">{userEmail}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Founder</p>
              </div>
            </div>
            <button
              onClick={signOut}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/30 rounded transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sair
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Section title */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-foreground">Clientes</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Selecione um cliente para gerenciar</p>
          </div>
          <button
            onClick={handleNewClient}
            className="flex items-center gap-2 px-4 py-2 text-xs font-medium border border-border rounded bg-card text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Novo Cliente
          </button>
        </div>

        {/* Loading state */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : clients.length === 0 ? (
          <div className="text-center py-20">
            <Building2 className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">Nenhum cliente cadastrado</p>
            <button onClick={handleNewClient} className="mt-3 text-xs text-primary hover:underline">
              Criar primeiro cliente
            </button>
          </div>
        ) : (
          /* Unit cards */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clients.map((client) => {
              const isBlocked = client.status === 'blocked';
              return (
                <div
                  key={client.id}
                  onClick={() => !isBlocked && navigate(`/unidade/${client.slug}`)}
                  className={`group relative text-left rounded-lg border transition-all duration-200 ${
                    isBlocked
                      ? 'bg-card/30 border-border/50 opacity-60'
                      : 'bg-card border-border hover:border-primary/60 hover:shadow-lg hover:shadow-primary/10 cursor-pointer'
                  }`}
                >
                  {/* Edit / Delete actions */}
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button
                      onClick={(e) => handleEdit(e, client)}
                      className="p-1.5 rounded bg-muted/80 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                      title="Editar"
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeletingClient(client); }}
                      className="p-1.5 rounded bg-muted/80 hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
                      title="Remover"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Card header */}
                  <div className="flex items-start justify-between p-4 pb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded flex items-center justify-center text-sm font-bold ${
                        isBlocked ? 'bg-muted text-muted-foreground' : 'bg-primary text-primary-foreground'
                      }`}>
                        {client.name.split(' ').map(w => w[0]).slice(0, 2).join('')}
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-foreground">{client.name}</h3>
                        <p className="text-xs text-muted-foreground">{client.city}</p>
                      </div>
                    </div>
                    {!isBlocked && <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />}
                  </div>

                  {/* Metrics */}
                  <div className="flex items-center gap-3 px-4 pb-4">
                    <MetricPill icon={<TrendingUp className="w-3 h-3" />} label="OVR" value={client.ovr} />
                    <MetricPill
                      icon={<Heart className="w-3 h-3" />}
                      label="Moral"
                      value={client.morale}
                      color={client.morale >= 75 ? 'text-morale-high' : client.morale >= 60 ? 'text-morale-mid' : 'text-morale-low'}
                    />
                    <MetricPill icon={<Users className="w-3 h-3" />} label="Equipe" value={client.headcount} />
                  </div>

                  {/* Status bar */}
                  <div className={`px-4 py-2 border-t text-[11px] font-medium rounded-b-lg ${
                    isBlocked
                      ? 'border-border/50 text-muted-foreground/50 bg-muted/10'
                      : 'border-border text-muted-foreground bg-muted/20'
                  }`}>
                    {isBlocked ? '○ Bloqueado' : '● Ativo'}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Form dialog */}
      <ClientFormDialog open={formOpen} onOpenChange={setFormOpen} client={editingClient} />

      {/* Delete confirmation */}
      <AlertDialog open={!!deletingClient} onOpenChange={(open) => !open && setDeletingClient(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover cliente</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover <strong>{deletingClient?.name}</strong>? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function MetricPill({ icon, label, value, color }: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color?: string;
}) {
  return (
    <div className="flex items-center gap-1.5 bg-background/50 border border-border/50 rounded px-2 py-1">
      <span className="text-muted-foreground">{icon}</span>
      <span className="text-[10px] text-muted-foreground uppercase">{label}</span>
      <span className={`text-sm font-bold font-mono ${color || 'text-foreground'}`}>{value}</span>
    </div>
  );
}
