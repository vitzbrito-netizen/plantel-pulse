import { useAuth } from '@/contexts/AuthContext';
import { LogOut, User, ClipboardList, TrendingUp, CheckCircle } from 'lucide-react';

export default function EmployeeDashboard() {
  const { user, signOut } = useAuth();
  const userEmail = user?.email ?? '';
  const userInitial = userEmail.charAt(0).toUpperCase();

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
              <p className="text-xs text-muted-foreground">Meu Painel</p>
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
                  <User className="w-3 h-3 text-primary" />
                  <span className="text-xs text-primary font-medium">Funcionário</span>
                </div>
              </div>
            </div>
            <button onClick={signOut} className="flex items-center gap-2 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/30 rounded-lg transition-colors">
              <LogOut className="w-4 h-4" /> Sair
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold text-foreground mb-2">Olá, {userEmail.split('@')[0]}!</h2>
        <p className="text-sm text-muted-foreground mb-8">Acompanhe suas tarefas e desempenho pessoal.</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-card border border-border rounded-xl p-5 text-center">
            <ClipboardList className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">—</p>
            <p className="text-xs text-muted-foreground mt-1">Tarefas Pendentes</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-5 text-center">
            <CheckCircle className="w-8 h-8 text-morale-high mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">—</p>
            <p className="text-xs text-muted-foreground mt-1">Concluídas</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-5 text-center">
            <TrendingUp className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">—</p>
            <p className="text-xs text-muted-foreground mt-1">Meu OVR</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-8 text-center">
          <ClipboardList className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-foreground mb-2">Em breve</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Suas tarefas e relatórios aparecerão aqui. Você poderá acompanhar seu desempenho e submeter entregas.
          </p>
        </div>
      </div>
    </div>
  );
}
