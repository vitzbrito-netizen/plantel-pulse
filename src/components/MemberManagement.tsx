import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCompanyMembers, useTransferOwnership, useRemoveMember, CompanyMember } from '@/hooks/useCompanyMembers';
import { Users, ArrowRightLeft, Trash2, Loader2, Shield, UserCog, User } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';

const roleLabels: Record<string, string> = {
  owner: 'Dono',
  manager: 'Gerente',
  employee: 'Funcionário',
  founder: 'Founder',
};

const roleIcons: Record<string, React.ReactNode> = {
  owner: <Shield className="w-3.5 h-3.5" />,
  manager: <UserCog className="w-3.5 h-3.5" />,
  employee: <User className="w-3.5 h-3.5" />,
};

export default function MemberManagement() {
  const { user, signOut } = useAuth();
  const { data: members = [], isLoading } = useCompanyMembers();
  const transferOwnership = useTransferOwnership();
  const removeMember = useRemoveMember();

  const [transferTarget, setTransferTarget] = useState<CompanyMember | null>(null);
  const [removeTarget, setRemoveTarget] = useState<CompanyMember | null>(null);
  const [processing, setProcessing] = useState(false);

  const otherMembers = members.filter(m => m.user_id !== user?.id);

  const handleTransfer = async () => {
    if (!transferTarget) return;
    setProcessing(true);
    try {
      await transferOwnership.mutateAsync(transferTarget.user_id);
      toast.success('Ownership transferido! Você agora é Gerente.');
      setTransferTarget(null);
      // Sign out to force re-auth with new role
      setTimeout(() => signOut(), 1500);
    } catch (err: any) {
      toast.error(err.message || 'Erro ao transferir ownership');
    } finally {
      setProcessing(false);
    }
  };

  const handleRemove = async () => {
    if (!removeTarget) return;
    setProcessing(true);
    try {
      await removeMember.mutateAsync(removeTarget.user_id);
      toast.success(`${removeTarget.full_name || 'Membro'} removido da empresa.`);
      setRemoveTarget(null);
    } catch (err: any) {
      toast.error(err.message || 'Erro ao remover membro');
    } finally {
      setProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (otherMembers.length === 0) {
    return (
      <div className="text-center py-12 bg-card rounded-xl border border-border border-dashed">
        <Users className="w-10 h-10 mx-auto text-muted-foreground/30 mb-3" />
        <p className="text-sm text-muted-foreground">Nenhum membro na empresa ainda.</p>
        <p className="text-xs text-muted-foreground/60 mt-1">Use convites para adicionar gerentes e funcionários.</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wide px-5 py-3">Nome</th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wide px-5 py-3">Cargo</th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wide px-5 py-3">Desde</th>
                <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wide px-5 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {otherMembers.map(member => (
                <tr key={member.id} className="border-b border-border/50 last:border-0">
                  <td className="px-5 py-3.5 text-sm font-medium text-foreground">
                    {member.full_name || 'Sem nome'}
                  </td>
                  <td className="px-5 py-3.5">
                    <RoleBadge role={member.role} />
                  </td>
                  <td className="px-5 py-3.5 text-sm text-muted-foreground">
                    {new Date(member.created_at).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center gap-2 justify-end">
                      {member.role === 'manager' && (
                        <button
                          onClick={() => setTransferTarget(member)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-primary/30 text-primary hover:bg-primary/10 transition-colors"
                        >
                          <ArrowRightLeft className="w-3.5 h-3.5" />
                          Transferir Ownership
                        </button>
                      )}
                      {(member.role === 'manager' || member.role === 'employee') && (
                        <button
                          onClick={() => setRemoveTarget(member)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Remover
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden divide-y divide-border/50">
          {otherMembers.map(member => (
            <div key={member.id} className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{member.full_name || 'Sem nome'}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Desde {new Date(member.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <RoleBadge role={member.role} />
              </div>
              <div className="flex items-center gap-2">
                {member.role === 'manager' && (
                  <button
                    onClick={() => setTransferTarget(member)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-primary/30 text-primary hover:bg-primary/10 transition-colors"
                  >
                    <ArrowRightLeft className="w-3.5 h-3.5" />
                    Transferir
                  </button>
                )}
                {(member.role === 'manager' || member.role === 'employee') && (
                  <button
                    onClick={() => setRemoveTarget(member)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remover
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transfer ownership modal */}
      <AlertDialog open={!!transferTarget} onOpenChange={(open) => !open && setTransferTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Transferir Ownership</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Tem certeza? Você perderá acesso administrativo e se tornará <strong>Gerente</strong>.
              </p>
              <p>
                <strong>{transferTarget?.full_name}</strong> será o novo Dono da empresa. Esta ação não pode ser desfeita.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={processing}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleTransfer}
              disabled={processing}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirmar Transferência'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Remove member modal */}
      <AlertDialog open={!!removeTarget} onOpenChange={(open) => !open && setRemoveTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover Membro</AlertDialogTitle>
            <AlertDialogDescription>
              Remover <strong>{removeTarget?.full_name || 'este membro'}</strong> da empresa?
              Eles perderão acesso imediatamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={processing}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemove}
              disabled={processing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Remover'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function RoleBadge({ role }: { role: string | null }) {
  const label = role ? (roleLabels[role] ?? role) : 'Sem cargo';
  const icon = role ? roleIcons[role] : null;

  const colorClass = role === 'owner'
    ? 'bg-primary/10 text-primary border-primary/20'
    : role === 'manager'
    ? 'bg-blue-500/10 text-blue-600 border-blue-500/20'
    : 'bg-muted text-muted-foreground border-border';

  return (
    <Badge className={`${colorClass} hover:${colorClass}`}>
      {icon}
      <span className="ml-1">{label}</span>
    </Badge>
  );
}
