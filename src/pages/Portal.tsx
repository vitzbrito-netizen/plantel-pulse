import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { teamStats } from '@/data/employees';
import { Users, TrendingUp, Heart, Building2, Lock, ChevronRight, Plus, LogOut } from 'lucide-react';

interface UnitCard {
  id: string;
  name: string;
  city: string;
  slug: string;
  ovr: number;
  morale: number;
  headcount: number;
  disabled?: boolean;
}

const units: UnitCard[] = [
  {
    id: '1',
    name: 'Laboratório Excelência',
    city: 'Brasília, DF',
    slug: 'excelencia',
    ovr: teamStats.avgOvr,
    morale: teamStats.avgMorale,
    headcount: teamStats.headcount,
  },
  {
    id: '2',
    name: 'Laboratório Central',
    city: 'São Paulo, SP',
    slug: 'central',
    ovr: 74,
    morale: 68,
    headcount: 24,
    disabled: true,
  },
  {
    id: '3',
    name: 'Laboratório Norte',
    city: 'Manaus, AM',
    slug: 'norte',
    ovr: 70,
    morale: 72,
    headcount: 12,
    disabled: true,
  },
];

export default function Portal() {
  const navigate = useNavigate();
  const { signOut } = useAuth();

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
                <span className="text-foreground font-semibold font-mono">1</span> / 3 clientes ativos
              </span>
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
          <button className="flex items-center gap-2 px-4 py-2 text-xs font-medium border border-border rounded bg-card text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors">
            <Plus className="w-3.5 h-3.5" />
            Novo Cliente
          </button>
        </div>

        {/* Unit cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {units.map((unit) => (
            <button
              key={unit.id}
              disabled={unit.disabled}
              onClick={() => !unit.disabled && navigate(`/unidade/${unit.slug}`)}
              className={`group relative text-left rounded-lg border transition-all duration-200 ${
                unit.disabled
                  ? 'bg-card/30 border-border/50 opacity-50 cursor-not-allowed'
                  : 'bg-card border-border hover:border-primary/60 hover:shadow-lg hover:shadow-primary/10 cursor-pointer'
              }`}
            >
              {/* Card header */}
              <div className="flex items-start justify-between p-4 pb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded flex items-center justify-center text-sm font-bold ${
                    unit.disabled ? 'bg-muted text-muted-foreground' : 'bg-primary text-primary-foreground'
                  }`}>
                    {unit.name.split(' ').map(w => w[0]).slice(0, 2).join('')}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{unit.name}</h3>
                    <p className="text-xs text-muted-foreground">{unit.city}</p>
                  </div>
                </div>
                {unit.disabled ? (
                  <Lock className="w-4 h-4 text-muted-foreground/50" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                )}
              </div>

              {/* Metrics */}
              <div className="flex items-center gap-3 px-4 pb-4">
                <MetricPill
                  icon={<TrendingUp className="w-3 h-3" />}
                  label="OVR"
                  value={unit.ovr}
                  disabled={unit.disabled}
                />
                <MetricPill
                  icon={<Heart className="w-3 h-3" />}
                  label="Moral"
                  value={unit.morale}
                  color={!unit.disabled ? (unit.morale >= 75 ? 'text-morale-high' : unit.morale >= 60 ? 'text-morale-mid' : 'text-morale-low') : undefined}
                  disabled={unit.disabled}
                />
                <MetricPill
                  icon={<Users className="w-3 h-3" />}
                  label="Equipe"
                  value={unit.headcount}
                  disabled={unit.disabled}
                />
              </div>

              {/* Status bar */}
              <div className={`px-4 py-2 border-t text-[11px] font-medium rounded-b-lg ${
                unit.disabled
                  ? 'border-border/50 text-muted-foreground/50 bg-muted/10'
                  : 'border-border text-muted-foreground bg-muted/20'
              }`}>
                {unit.disabled ? 'Em breve — contrate para ativar' : '● Ativo — Último acesso: hoje'}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function MetricPill({ icon, label, value, color, disabled }: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color?: string;
  disabled?: boolean;
}) {
  return (
    <div className={`flex items-center gap-1.5 bg-background/50 border border-border/50 rounded px-2 py-1 ${
      disabled ? 'opacity-50' : ''
    }`}>
      <span className="text-muted-foreground">{icon}</span>
      <span className="text-[10px] text-muted-foreground uppercase">{label}</span>
      <span className={`text-sm font-bold font-mono ${color || 'text-foreground'}`}>{value}</span>
    </div>
  );
}
