import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Client } from '@/hooks/useClients';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Plus, Copy, Link2, Clock, CheckCircle2, XCircle, RefreshCw, Loader2, UserPlus, Mail, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

interface Invite {
  id: string;
  token: string;
  email: string;
  role: string;
  company_id: string;
  used: boolean;
  expires_at: string;
  created_at: string;
}

type InviteStatus = 'pending' | 'active' | 'expired';

function getInviteStatus(invite: Invite): InviteStatus {
  if (invite.used) return 'active';
  if (new Date(invite.expires_at) < new Date()) return 'expired';
  return 'pending';
}

const roleLabels: Record<string, string> = {
  manager: 'Gerente',
  employee: 'Funcionário',
  owner: 'Dono',
};

interface Props {
  clients: Client[];
}

export default function FounderEquipeTab({ clients }: Props) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(clients[0]?.id ?? '');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('employee');
  const [inviteEmail, setInviteEmail] = useState('');
  const [generatedInvite, setGeneratedInvite] = useState<Invite | null>(null);
  const [generating, setGenerating] = useState(false);

  const { data: invites = [], isLoading } = useQuery({
    queryKey: ['invites', selectedCompanyId],
    queryFn: async () => {
      if (!selectedCompanyId) return [];
      const { data, error } = await supabase
        .from('invites')
        .select('*')
        .eq('company_id', selectedCompanyId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Invite[];
    },
    enabled: !!selectedCompanyId,
  });

  const handleGenerate = async () => {
    if (!selectedCompanyId) return;
    setGenerating(true);
    try {
      const token = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from('invites')
        .insert({
          token,
          role: selectedRole as any,
          email: inviteEmail || '',
          company_id: selectedCompanyId,
          invited_by: user!.id,
          expires_at: expiresAt,
        } as any)
        .select()
        .single();
      if (error) throw error;
      setGeneratedInvite(data as unknown as Invite);
      qc.invalidateQueries({ queryKey: ['invites'] });
      toast.success('Link de convite gerado!');
    } catch (err: any) {
      toast.error(err.message || 'Erro ao gerar convite');
    } finally {
      setGenerating(false);
    }
  };

  const getInviteUrl = (token: string) => `${window.location.origin}/invite/${token}`;

  const copyLink = (token: string) => {
    navigator.clipboard.writeText(getInviteUrl(token));
    toast.success('Link copiado!');
  };

  const handleCancel = async (id: string) => {
    const { error } = await supabase.from('invites').update({ expires_at: new Date().toISOString() } as any).eq('id', id);
    if (error) toast.error('Erro ao cancelar');
    else { toast.success('Convite cancelado'); qc.invalidateQueries({ queryKey: ['invites'] }); }
  };

  const handleRegenerate = async (invite: Invite) => {
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const { error } = await supabase.from('invites').insert({
      token, role: invite.role as any, email: invite.email, company_id: selectedCompanyId,
      invited_by: user!.id, expires_at: expiresAt,
    } as any);
    if (error) toast.error('Erro ao reenviar');
    else { toast.success('Novo link gerado!'); qc.invalidateQueries({ queryKey: ['invites'] }); }
  };

  const resetModal = () => { setGeneratedInvite(null); setSelectedRole('employee'); setInviteEmail(''); setModalOpen(false); };

  const selectedClient = clients.find(c => c.id === selectedCompanyId);

  return (
    <div>
      {/* Company selector */}
      <div className="flex items-center gap-4 mb-6">
        <h2 className="text-xl font-bold text-foreground">Equipe</h2>
        <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
          <SelectTrigger className="w-64">
            <Building2 className="w-4 h-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Selecione um cliente" />
          </SelectTrigger>
          <SelectContent>
            {clients.map(c => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex-1" />
        <button
          onClick={() => { setGeneratedInvite(null); setModalOpen(true); }}
          disabled={!selectedCompanyId}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          <UserPlus className="w-4 h-4" /> Convidar Membro
        </button>
      </div>

      {!selectedCompanyId ? (
        <div className="text-center py-16">
          <Building2 className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">Selecione um cliente para ver os convites.</p>
        </div>
      ) : isLoading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : invites.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-xl border border-border border-dashed">
          <UserPlus className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground mb-2">Nenhum convite para {selectedClient?.name}</p>
          <button onClick={() => setModalOpen(true)} className="text-sm text-primary font-semibold hover:underline">+ Convidar primeiro membro</button>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
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
                      <td className="px-5 py-3.5 text-sm text-foreground">{inv.email || <span className="text-muted-foreground italic">Sem e-mail</span>}</td>
                      <td className="px-5 py-3.5 text-sm text-foreground">{roleLabels[inv.role] ?? inv.role}</td>
                      <td className="px-5 py-3.5"><StatusBadge status={status} /></td>
                      <td className="px-5 py-3.5 text-sm text-muted-foreground">{new Date(inv.created_at).toLocaleDateString('pt-BR')}</td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center gap-1.5 justify-end">
                          {status === 'pending' && (
                            <>
                              <button onClick={() => copyLink(inv.token)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground" title="Copiar"><Copy className="w-3.5 h-3.5" /></button>
                              <button onClick={() => handleCancel(inv.id)} className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive" title="Cancelar"><XCircle className="w-3.5 h-3.5" /></button>
                            </>
                          )}
                          {status === 'expired' && (
                            <button onClick={() => handleRegenerate(inv)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-primary" title="Reenviar"><RefreshCw className="w-3.5 h-3.5" /></button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile */}
          <div className="md:hidden divide-y divide-border/50">
            {invites.map(inv => {
              const status = getInviteStatus(inv);
              return (
                <div key={inv.id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">{inv.email || <span className="text-muted-foreground italic">Sem e-mail</span>}</p>
                      <p className="text-xs text-muted-foreground">{roleLabels[inv.role]}</p>
                    </div>
                    <StatusBadge status={status} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal */}
      <Dialog open={modalOpen} onOpenChange={(open) => { if (!open) resetModal(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Convidar Membro — {selectedClient?.name}</DialogTitle>
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
                <button onClick={() => copyLink(generatedInvite.token)} className="flex items-center gap-2 mx-auto px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90">
                  <Copy className="w-4 h-4" /> Copiar Link
                </button>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center">
                <Clock className="w-3.5 h-3.5" /> Este link expira em 7 dias
              </div>
              <button onClick={resetModal} className="w-full py-2.5 text-sm text-muted-foreground hover:text-foreground border border-border rounded-lg">Fechar</button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Cargo</label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="owner">Dono</SelectItem>
                    <SelectItem value="manager">Gerente</SelectItem>
                    <SelectItem value="employee">Funcionário</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">E-mail <span className="text-muted-foreground/60">(opcional)</span></label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-card border border-border rounded text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30"
                    placeholder="email@empresa.com" />
                </div>
              </div>
              <button onClick={handleGenerate} disabled={generating}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 disabled:opacity-50">
                {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Link2 className="w-4 h-4" /> Gerar Link</>}
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatusBadge({ status }: { status: InviteStatus }) {
  if (status === 'active') return <Badge className="bg-morale-high/10 text-morale-high border-morale-high/20 hover:bg-morale-high/20"><CheckCircle2 className="w-3 h-3 mr-1" /> Ativo</Badge>;
  if (status === 'pending') return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20 hover:bg-yellow-500/20"><Clock className="w-3 h-3 mr-1" /> Convite pendente</Badge>;
  return <Badge className="bg-muted text-muted-foreground border-border hover:bg-muted"><XCircle className="w-3 h-3 mr-1" /> Expirado</Badge>;
}
