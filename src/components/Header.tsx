import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { employees, teamStats } from '@/data/employees';
import { Users, TrendingUp, Heart, ArrowLeft, LogOut, AlertTriangle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function Header() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const userEmail = user?.email ?? '';
  const userInitial = userEmail.charAt(0).toUpperCase();

  const flightRisks = employees.filter(e => e.flightRisk).length;
  const lowMorale = employees.filter(e => e.morale < 60).length;
  const urgentCount = flightRisks + lowMorale;

  return (
    <header className="bg-header border-b border-border">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left: Back + Lab identity */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/portal')}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/30 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Voltar</span>
          </button>
          <div className="h-8 w-px bg-border" />
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-base font-bold text-primary-foreground">LE</span>
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-foreground">Laboratório Excelência</h1>
              <p className="text-xs text-muted-foreground">Brasília, DF</p>
            </div>
          </div>
        </div>

        {/* Center: Key metrics — big & scannable */}
        <div className="flex items-center gap-2">
          <MetricCard 
            icon={<Users className="w-4 h-4" />}
            label="Equipe"
            value={teamStats.headcount}
            tooltip="Total de colaboradores ativos"
          />
          <MetricCard 
            icon={<TrendingUp className="w-4 h-4" />}
            label="OVR"
            value={teamStats.avgOvr}
            tooltip="Nota média geral da equipe (0-100)"
          />
          <MetricCard 
            icon={<Heart className="w-4 h-4" />}
            label="Moral"
            value={teamStats.avgMorale}
            valueColor={teamStats.avgMorale >= 75 ? 'text-morale-high' : teamStats.avgMorale >= 60 ? 'text-morale-mid' : 'text-morale-low'}
            tooltip="Nível médio de motivação da equipe"
          />
          {urgentCount > 0 && (
            <MetricCard 
              icon={<AlertTriangle className="w-4 h-4" />}
              label="Atenção"
              value={urgentCount}
              valueColor="text-urgente"
              tooltip={`${flightRisks} risco de fuga, ${lowMorale} moral baixa`}
              highlight
            />
          )}
        </div>

        {/* Right: User + logout */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary/20 border border-primary/30 rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold text-primary">{userInitial}</span>
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-medium text-foreground leading-none">{userEmail}</p>
              <p className="text-[10px] text-primary mt-0.5 font-medium">Founder</p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/30 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </div>
    </header>
  );
}

function MetricCard({ icon, label, value, valueColor, tooltip, highlight }: { 
  icon: React.ReactNode; label: string; value: number; valueColor?: string; tooltip?: string; highlight?: boolean;
}) {
  const content = (
    <div className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border cursor-default transition-colors ${
      highlight 
        ? 'bg-urgente/10 border-urgente/30' 
        : 'bg-card/50 border-border hover:border-border/80'
    }`}>
      <span className={highlight ? 'text-urgente' : 'text-muted-foreground'}>{icon}</span>
      <div>
        <p className="text-[10px] text-muted-foreground uppercase font-medium leading-none">{label}</p>
        <p className={`text-lg font-bold font-mono leading-tight ${valueColor || 'text-foreground'}`}>{value}</p>
      </div>
    </div>
  );

  if (!tooltip) return content;

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent><p className="text-xs">{tooltip}</p></TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
