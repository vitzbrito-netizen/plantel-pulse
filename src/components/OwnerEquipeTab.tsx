import { useState } from 'react';
import { useInvites, useCreateInvite, useCancelInvite, useRegenerateInvite, getInviteStatus, Invite } from '@/hooks/useInvites';
import { useProfile } from '@/hooks/useProfile';
import { Users, Plus, Copy, Link2, Clock, CheckCircle2, XCircle, RefreshCw, Loader2, UserPlus, Mail } from 'lucide-react';
import MemberManagement from '@/components/MemberManagement';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

const roleLabels: Record<string, string> = {
  manager: 'Gerente',
  employee: 'Funcionário',
  owner: 'Dono',
};

export default function OwnerEquipeTab() {
  const { data: profile } = useProfile();
  const { data: invites = [], isLoading } = useInvites();
  const createInvite = useCreateInvite();
  const cancelInvite = useCancelInvite();
  const regenerateInvite = useRegenerateInvite();

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('employee');
  const [inviteEmail, setInviteEmail] = useState('');
  const [generatedInvite, setGeneratedInvite] = useState<Invite | null>(null);
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const inv = await createInvite.mutateAsync({
        role: selectedRole,
        email: inviteEmail || undefined,
      });
      setGeneratedInvite(inv);
      toast.success('Link de convite gerado!');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao gerar convite');
    } finally {
      setGenerating(false);
    }
  };

  const getInviteUrl = (token: string) => {
    return `${window.location.origin}/invite/${token}`;
  };

  const copyLink = (token: string) => {
    navigator.clipboard.writeText(getInviteUrl(token));
    toast.success('Link copiado!');
  };

  const handleCancel = async (id: string) => {
    try {
      await cancelInvite.mutateAsync(id);
      toast.success('Convite cancelado');
    } catch {
      toast.error('Erro ao cancelar');
    }
  };

  const handleRegenerate = async (invite: Invite) => {
    try {
      const newInv = await regenerateInvite.mutateAsync(invite);
      toast.success('Novo link gerado!');
      copyLink(newInv.token);
    } catch {
      toast.error('Erro ao reenviar');
    }
  };

  const resetModal = () => {
    setGeneratedInvite(null);
    setSelectedRole('employee');
    setInviteEmail('');
    setModalOpen(false);
  };

  if (!profile?.company_id) {
    return (
      <div className="text-center py-16">
        <Users className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
        <p className="text-muted-foreground">Crie uma unidade primeiro para convidar membros.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-foreground">Equipe</h2>
        <button
          onClick={() => { setGeneratedInvite(null); setModalOpen(true); }}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <UserPlus className="w-4 h-4" /> Convidar Membro
        </button>
      </div>

      {/* Invites table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : invites.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-xl border border-border border-dashed">
          <UserPlus className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground mb-2">Nenhum convite enviado ainda</p>
          <button
            onClick={() => setModalOpen(true)}
            className="text-sm text-primary font-semibold hover:underline"
          >
            + Convidar primeiro membro
          </button>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wide px-5 py-3">E-mail</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wide px-5 py-3">Cargo</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wide px-5 py-3">Status</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wide px-5 py-3">Data</th>
                  <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wide px-5 py-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {invites.map(inv => {
                  const status = getInviteStatus(inv);
                  return (
                    <tr key={inv.id} className="border-b border-border/50 last:border-0">
                      <td className="px-5 py-3.5 text-sm text-foreground">
                        {inv.email || <span className="text-muted-foreground italic">Sem e-mail</span>}
                      </td>
                      <td className="px-5 py-3.5 text-sm text-foreground">{roleLabels[inv.role] ?? inv.role}</td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={status} />
                      </td>
                      <td className="px-5 py-3.5 text-sm text-muted-foreground">
                        {new Date(inv.created_at).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <InviteActions
                          invite={inv}
                          status={status}
                          onCopy={() => copyLink(inv.token)}
                          onCancel={() => handleCancel(inv.id)}
                          onRegenerate={() => handleRegenerate(inv)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-border/50">
            {invites.map(inv => {
              const status = getInviteStatus(inv);
              return (
                <div key={inv.id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {inv.email || <span className="text-muted-foreground italic">Sem e-mail</span>}
                      </p>
                      <p className="text-xs text-muted-foreground">{roleLabels[inv.role] ?? inv.role}</p>
                    </div>
                    <StatusBadge status={status} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {new Date(inv.created_at).toLocaleDateString('pt-BR')}
                    </span>
                    <InviteActions
                      invite={inv}
                      status={status}
                      onCopy={() => copyLink(inv.token)}
                      onCancel={() => handleCancel(inv.id)}
                      onRegenerate={() => handleRegenerate(inv)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Invite modal */}
      <Dialog open={modalOpen} onOpenChange={(open) => { if (!open) resetModal(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Convidar Membro</DialogTitle>
          </DialogHeader>

          {generatedInvite ? (
            <div className="space-y-4">
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-center">
                <Link2 className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="text-sm font-medium text-foreground mb-1">Link gerado!</p>
                <p className="text-xs text-muted-foreground mb-3">
                  Convite para <span className="font-semibold text-primary">{roleLabels[generatedInvite.role]}</span>
                </p>
                <div className="bg-background border border-border rounded-lg px-3 py-2 text-xs text-foreground font-mono break-all mb-3">
                  {getInviteUrl(generatedInvite.token)}
                </div>
                <button
                  onClick={() => copyLink(generatedInvite.token)}
                  className="flex items-center gap-2 mx-auto px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <Copy className="w-4 h-4" /> Copiar Link
                </button>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center">
                <Clock className="w-3.5 h-3.5" />
                Este link expira em 7 dias
              </div>
              <button
                onClick={resetModal}
                className="w-full py-2.5 text-sm text-muted-foreground hover:text-foreground border border-border rounded-lg transition-colors"
              >
                Fechar
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Cargo</label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manager">Gerente</SelectItem>
                    <SelectItem value="employee">Funcionário</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  E-mail <span className="text-muted-foreground/60">(opcional)</span>
                </label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-card border border-border rounded text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-colors"
                    placeholder="email@empresa.com"
                  />
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={generating}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {generating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Link2 className="w-4 h-4" /> Gerar Link
                  </>
                )}
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatusBadge({ status }: { status: 'pending' | 'active' | 'expired' }) {
  if (status === 'active') {
    return (
      <Badge className="bg-morale-high/10 text-morale-high border-morale-high/20 hover:bg-morale-high/20">
        <CheckCircle2 className="w-3 h-3 mr-1" /> Ativo
      </Badge>
    );
  }
  if (status === 'pending') {
    return (
      <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20 hover:bg-yellow-500/20">
        <Clock className="w-3 h-3 mr-1" /> Convite pendente
      </Badge>
    );
  }
  return (
    <Badge className="bg-muted text-muted-foreground border-border hover:bg-muted">
      <XCircle className="w-3 h-3 mr-1" /> Expirado
    </Badge>
  );
}

function InviteActions({ invite, status, onCopy, onCancel, onRegenerate }: {
  invite: Invite;
  status: 'pending' | 'active' | 'expired';
  onCopy: () => void;
  onCancel: () => void;
  onRegenerate: () => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      {status === 'pending' && (
        <>
          <button onClick={onCopy} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Copiar link">
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button onClick={onCancel} className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors" title="Cancelar convite">
            <XCircle className="w-3.5 h-3.5" />
          </button>
        </>
      )}
      {status === 'expired' && (
        <button onClick={onRegenerate} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-primary transition-colors" title="Reenviar convite">
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
