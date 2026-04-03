import { employees, Employee, getMoraleColor, getMoraleLabel, daysUntilExpiry, isContractExpiring, getInitials } from '@/data/employees';
import { Flame, Moon, Sun, Zap, Trophy, TrendingUp, AlertTriangle, DollarSign, ChevronUp, ChevronDown, LayoutGrid, List, Search } from 'lucide-react';
import { useState } from 'react';
import { EmployeeCard } from '@/components/EmployeeCard';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Props {
  onSelectEmployee: (emp: Employee) => void;
  selectedEmployee: Employee | null;
}

type SortKey = 'name' | 'role' | 'tier' | 'ovr' | 'morale' | 'turno' | 'contract' | 'salary';
type SortDir = 'asc' | 'desc';

function getOvrClass(ovr: number): string {
  if (ovr >= 80) return 'ovr-high';
  if (ovr >= 65) return 'ovr-mid';
  return 'ovr-low';
}

function getStatusClass(emp: Employee): string {
  if (emp.flightRisk || emp.morale < 50) return 'status-critical';
  if (emp.morale < 65 || isContractExpiring(emp.contractEnd, 60)) return 'status-warning';
  return 'status-available';
}

function getTierBadgeClass(tier: string): string {
  switch (tier) {
    case 'Líder': return 'tier-lider';
    case 'Influente': return 'tier-influente';
    case 'Promessa': return 'tier-promessa';
    default: return '';
  }
}

export function EquipeTab({ onSelectEmployee, selectedEmployee }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('ovr');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [searchTerm, setSearchTerm] = useState('');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const filteredEmployees = employees.filter(emp => 
    searchTerm === '' || 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedEmployees = [...filteredEmployees].sort((a, b) => {
    let cmp = 0;
    switch (sortKey) {
      case 'name': cmp = a.name.localeCompare(b.name); break;
      case 'role': cmp = a.role.localeCompare(b.role); break;
      case 'tier': 
        const tierOrder = { 'Líder': 3, 'Influente': 2, 'Promessa': 1 };
        cmp = tierOrder[a.tier] - tierOrder[b.tier]; 
        break;
      case 'ovr': cmp = a.ovr - b.ovr; break;
      case 'morale': cmp = a.morale - b.morale; break;
      case 'turno': cmp = a.turno.localeCompare(b.turno); break;
      case 'contract': cmp = daysUntilExpiry(a.contractEnd) - daysUntilExpiry(b.contractEnd); break;
      case 'salary': cmp = a.salary - b.salary; break;
    }
    return sortDir === 'desc' ? -cmp : cmp;
  });

  const flightRisks = employees.filter(e => e.flightRisk).length;
  const lowOvr = employees.filter(e => e.ovr < 65).length;
  const highOvr = employees.filter(e => e.ovr >= 80).length;
  const folha = employees.reduce((a, e) => a + e.salary, 0);

  const star = [...employees].sort((a, b) => b.morale - a.morale)[0];

  const SortHeader = ({ label, sortKeyProp, width, tooltip }: { label: string; sortKeyProp: SortKey; width?: string; tooltip?: string }) => (
    <th 
      className={`text-left p-2.5 text-xs font-semibold text-muted-foreground uppercase cursor-pointer hover:text-foreground transition-colors ${width || ''}`}
      onClick={() => handleSort(sortKeyProp)}
    >
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="flex items-center gap-1">
              {label}
              {sortKey === sortKeyProp && (
                sortDir === 'desc' ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />
              )}
            </span>
          </TooltipTrigger>
          {tooltip && <TooltipContent><p className="text-xs">{tooltip}</p></TooltipContent>}
        </Tooltip>
      </TooltipProvider>
    </th>
  );

  const EmployeeRow = ({ emp }: { emp: Employee }) => {
    const days = daysUntilExpiry(emp.contractEnd);
    const expiring = isContractExpiring(emp.contractEnd, 90);
    const isSelected = selectedEmployee?.id === emp.id;
    const turnoIcon = emp.turno === 'Noturno' ? <Moon className="w-3.5 h-3.5" /> : emp.turno === 'Integral' ? <Zap className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />;

    const tierDesc = emp.tier === 'Líder' ? 'Líder — Peça-chave da equipe' : emp.tier === 'Influente' ? 'Influente — Contribuidor sólido' : 'Promessa — Em desenvolvimento';
    const statusDesc = emp.flightRisk || emp.morale < 50 ? 'Crítico — Ação imediata' : emp.morale < 65 || isContractExpiring(emp.contractEnd, 60) ? 'Atenção — Monitorar' : 'OK — Situação estável';

    return (
      <TooltipProvider delayDuration={200}>
        <tr 
          onClick={() => onSelectEmployee(emp)}
          className={`fm-table-row cursor-pointer transition-colors hover:bg-muted/20 ${isSelected ? 'selected bg-primary/10' : ''}`}
        >
          {/* Status dot — traffic light */}
          <td className="p-2.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={`w-3 h-3 rounded-full ${getStatusClass(emp)}`} />
              </TooltipTrigger>
              <TooltipContent side="right"><p className="text-xs">{statusDesc}</p></TooltipContent>
            </Tooltip>
          </td>

          {/* Name — larger, bolder */}
          <td className="p-2.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-sm font-semibold text-foreground truncate block max-w-48">{emp.name}</span>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-64">
                <p className="text-xs font-semibold">{emp.name}</p>
                <p className="text-[11px] text-muted-foreground">{emp.role} • {emp.tier} • OVR {emp.ovr}</p>
                {emp.pendingFields && emp.pendingFields.length > 0 && (
                  <p className="text-[11px] text-muted-foreground mt-1">⏳ Dados estimados: {emp.pendingFields.join(', ')}</p>
                )}
              </TooltipContent>
            </Tooltip>
          </td>

          {/* Role */}
          <td className="p-2.5 text-xs text-muted-foreground truncate max-w-40">{emp.role}</td>

          {/* Tier — color badge */}
          <td className="p-2.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <span className={`tier-badge text-[11px] ${getTierBadgeClass(emp.tier)}`}>
                  {emp.tier === 'Líder' ? 'LID' : emp.tier === 'Influente' ? 'INF' : 'PRO'}
                </span>
              </TooltipTrigger>
              <TooltipContent><p className="text-xs">{tierDesc}</p></TooltipContent>
            </Tooltip>
          </td>

          {/* OVR — big number, color-coded */}
          <td className="p-2.5">
            <span className={`font-mono font-bold text-base ${getOvrClass(emp.ovr)}`}>{emp.ovr}</span>
          </td>

          {/* Morale — visual bar + number */}
          <td className="p-2.5">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-3 morale-bar-track rounded-sm overflow-hidden min-w-16">
                <div 
                  className="h-full morale-bar rounded-sm"
                  style={{ width: `${emp.morale}%`, backgroundColor: getMoraleColor(emp.morale) }}
                />
              </div>
              <span className="text-xs font-mono font-semibold w-7 text-right" style={{ color: getMoraleColor(emp.morale) }}>
                {emp.morale}
              </span>
            </div>
          </td>

          {/* Shift */}
          <td className="p-2.5">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              {turnoIcon}
              <span className="text-xs">{emp.turno === 'Noturno' ? 'NOT' : emp.turno === 'Integral' ? 'INT' : 'DIA'}</span>
            </span>
          </td>

          {/* Contract — urgency color */}
          <td className="p-2.5">
            <span className={`text-xs font-mono font-semibold ${days <= 30 ? 'text-urgente' : expiring ? 'text-atencao' : 'text-muted-foreground'}`}>
              {days <= 0 ? 'VENC!' : `${days}d`}
            </span>
          </td>

          {/* Flight risk — big icon */}
          <td className="p-2.5">
            {emp.flightRisk && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Flame className="w-4 h-4 text-urgente pulse-risk" />
                </TooltipTrigger>
                <TooltipContent><p className="text-xs">⚠️ Risco de Fuga</p></TooltipContent>
              </Tooltip>
            )}
          </td>
        </tr>
      </TooltipProvider>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-full">
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar: search + view toggle + summary */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar colaborador..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 text-sm bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-colors"
            />
          </div>

          {/* Quick stats — hidden on small screens */}
          <div className="hidden sm:flex items-center gap-2">
            <QuickStat icon={<Trophy className="w-3.5 h-3.5 text-tier-lider" />} label="Líderes" value={employees.filter(e => e.tier === 'Líder').length} tooltip="Peças-chave da equipe" />
            <QuickStat icon={<TrendingUp className="w-3.5 h-3.5 text-morale-high" />} label="OVR 80+" value={highOvr} tooltip="Alto desempenho" />
            {flightRisks > 0 && (
              <QuickStat icon={<AlertTriangle className="w-3.5 h-3.5 text-urgente" />} label="Risco" value={flightRisks} color="text-urgente" tooltip="Risco de saída" />
            )}
          </div>
          
          <div className="flex-1 hidden sm:block" />

          {/* View toggle */}
          <div className="flex items-center bg-muted/40 rounded-lg p-0.5 gap-0.5">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-colors ${viewMode === 'table' ? 'bg-primary/20 text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">Tabela</span>
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-colors ${viewMode === 'cards' ? 'bg-primary/20 text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Cards</span>
            </button>
          </div>

          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {filteredEmployees.length} colaboradores
          </span>
        </div>

        {/* Guidance text */}
        <p className="text-xs text-muted-foreground mb-3">
          👆 Clique em qualquer colaborador para ver detalhes e ações
        </p>

        {viewMode === 'table' ? (
          <div className="fm-card rounded-lg overflow-hidden flex-1">
            <div className="overflow-auto max-h-[calc(100vh-240px)]">
              <table className="w-full">
                <thead className="bg-muted/30 sticky top-0">
                   <tr>
                     <th className="w-8 p-2.5" />
                     <SortHeader label="Nome" sortKeyProp="name" width="min-w-[120px]" tooltip="Nome do colaborador" />
                     <SortHeader label="OVR" sortKeyProp="ovr" width="w-16" tooltip="Overall Rating — Nota geral (0-100)" />
                     <th className="text-left p-2.5 text-xs font-semibold text-muted-foreground uppercase w-28 hidden sm:table-cell">Moral</th>
                     <SortHeader label="Cargo" sortKeyProp="role" width="w-40 hidden md:table-cell" tooltip="Função no laboratório" />
                     <SortHeader label="Tier" sortKeyProp="tier" width="w-20 hidden sm:table-cell" tooltip="Nível de importância: LID (Líder), INF (Influente), PRO (Promessa)" />
                     <SortHeader label="Turno" sortKeyProp="turno" width="w-20 hidden md:table-cell" tooltip="DIA = Diurno, NOT = Noturno, INT = Integral" />
                     <SortHeader label="Contrato" sortKeyProp="contract" width="w-20 hidden md:table-cell" tooltip="Dias restantes até vencimento" />
                     <th className="w-10 p-2.5" />
                   </tr>
                </thead>
                <tbody>
                  {sortedEmployees.map(emp => <EmployeeRow key={emp.id} emp={emp} />)}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 overflow-auto max-h-[calc(100vh-240px)] flex-1">
            {sortedEmployees.map(emp => (
              <EmployeeCard key={emp.id} employee={emp} onClick={onSelectEmployee} />
            ))}
          </div>
        )}
      </div>

      {/* Right sidebar — analytics summary */}
      {!selectedEmployee && (
        <div className="w-60 shrink-0 space-y-3">
          <div className="fm-card rounded-lg p-4">
            <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase text-muted-foreground mb-3">
              <Trophy className="w-4 h-4 text-tier-lider" /> Destaque do Mês
            </h3>
            <div className="text-center py-2">
              <div className="w-14 h-14 rounded-full bg-tier-promessa flex items-center justify-center text-white font-bold text-base mx-auto mb-2">
                {getInitials(star.name)}
              </div>
              <p className="font-semibold text-sm">{star.name}</p>
              <p className="text-xs text-muted-foreground">{star.role}</p>
              <div className="flex items-center justify-center gap-4 mt-3">
                <div>
                  <p className="ovr-score text-xl">{star.ovr}</p>
                  <p className="text-[10px] text-muted-foreground">OVR</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-morale-high">{star.morale}</p>
                  <p className="text-[10px] text-muted-foreground">Moral</p>
                </div>
              </div>
            </div>
          </div>

          <div className="fm-card rounded-lg p-4 space-y-2.5">
            <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Resumo</h3>
            <AnalyticRow icon={<AlertTriangle className="w-3.5 h-3.5 text-urgente" />} label="Risco de Fuga" value={flightRisks} color="hsl(var(--urgente))" />
            <AnalyticRow icon={<TrendingUp className="w-3.5 h-3.5 text-atencao" />} label="OVR Baixo" value={lowOvr} color="hsl(var(--atencao))" />
            <AnalyticRow icon={<TrendingUp className="w-3.5 h-3.5 text-morale-high" />} label="OVR Alto" value={highOvr} color="hsl(var(--morale-high))" />
            <div className="border-t border-border pt-2 mt-2">
              <AnalyticRow icon={<DollarSign className="w-3.5 h-3.5" />} label="Folha/mês" value={`R$ ${(folha/1000).toFixed(0)}k`} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function QuickStat({ icon, label, value, color, tooltip }: { icon: React.ReactNode; label: string; value: number; color?: string; tooltip?: string }) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1.5 bg-card/50 border border-border rounded-lg px-2.5 py-1.5 cursor-default">
            {icon}
            <span className="text-xs text-muted-foreground">{label}:</span>
            <span className={`text-sm font-bold font-mono ${color || 'text-foreground'}`}>{value}</span>
          </div>
        </TooltipTrigger>
        {tooltip && <TooltipContent><p className="text-xs">{tooltip}</p></TooltipContent>}
      </Tooltip>
    </TooltipProvider>
  );
}

function AnalyticRow({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number | string; color?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">{icon} {label}</span>
      <span className="text-sm font-bold font-mono" style={color ? { color } : {}}>{value}</span>
    </div>
  );
}
