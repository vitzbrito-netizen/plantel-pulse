import { employees, Employee, getMoraleColor, daysUntilExpiry, isContractExpiring, getInitials } from '@/data/employees';
import { Flame, Moon, Sun, Zap, Trophy, TrendingUp, AlertTriangle, DollarSign, ChevronUp, ChevronDown, ChevronRight, LayoutGrid, List } from 'lucide-react';
import { useState } from 'react';
import { EmployeeCard } from '@/components/EmployeeCard';

interface Props {
  onSelectEmployee: (emp: Employee) => void;
  selectedEmployee: Employee | null;
  activeSubTab: string;
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

function getRoleCategory(role: string): string {
  if (role.toLowerCase().includes('analista')) return 'Analistas';
  if (role.toLowerCase().includes('técnico') || role.toLowerCase().includes('flebotomista')) return 'Técnicos';
  if (role.toLowerCase().includes('recepcionista')) return 'Recepcionistas';
  if (role.toLowerCase().includes('bioquímico') || role.toLowerCase().includes('microbiolog') || role.toLowerCase().includes('citolog') || role.toLowerCase().includes('parasit')) return 'Bioquímicos/Microbiologistas';
  return 'Outros';
}

export function EquipeTab({ onSelectEmployee, selectedEmployee, activeSubTab }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('ovr');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [expandedSectors, setExpandedSectors] = useState<Record<string, boolean>>({
    'Analistas': true,
    'Técnicos': true,
    'Recepcionistas': true,
    'Bioquímicos/Microbiologistas': true,
    'Outros': true,
  });
  const [compareEmployee1, setCompareEmployee1] = useState<Employee | null>(null);
  const [compareEmployee2, setCompareEmployee2] = useState<Employee | null>(null);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const sortedEmployees = [...employees].sort((a, b) => {
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

  const avgMorale = Math.round(employees.reduce((a, e) => a + e.morale, 0) / employees.length);
  const flightRisks = employees.filter(e => e.flightRisk).length;
  const lowOvr = employees.filter(e => e.ovr < 65).length;
  const highOvr = employees.filter(e => e.ovr >= 80).length;
  const folha = employees.reduce((a, e) => a + e.salary, 0);

  const toggleSector = (sector: string) => {
    setExpandedSectors(prev => ({ ...prev, [sector]: !prev[sector] }));
  };

  const employeesBySector = employees.reduce((acc, emp) => {
    const category = getRoleCategory(emp.role);
    if (!acc[category]) acc[category] = [];
    acc[category].push(emp);
    return acc;
  }, {} as Record<string, Employee[]>);

  const diurnos = employees.filter(e => e.turno === 'Diurno' || e.turno === 'Integral');
  const noturnos = employees.filter(e => e.turno === 'Noturno' || e.turno === 'Integral');

  // Colaborador do Mês — dinâmico: maior moral
  const star = [...employees].sort((a, b) => b.morale - a.morale)[0];

  const SortHeader = ({ label, sortKeyProp, width }: { label: string; sortKeyProp: SortKey; width?: string }) => (
    <th 
      className={`text-left p-2 text-[12px] font-semibold text-muted-foreground uppercase cursor-pointer hover:text-foreground transition-colors ${width || ''}`}
      onClick={() => handleSort(sortKeyProp)}
    >
      <span className="flex items-center gap-1">
        {label}
        {sortKey === sortKeyProp && (
          sortDir === 'desc' ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />
        )}
      </span>
    </th>
  );

  const EmployeeRow = ({ emp, compact = false }: { emp: Employee; compact?: boolean }) => {
    const days = daysUntilExpiry(emp.contractEnd);
    const expiring = isContractExpiring(emp.contractEnd, 90);
    const isSelected = selectedEmployee?.id === emp.id;
    const turnoIcon = emp.turno === 'Noturno' ? <Moon className="w-3 h-3" /> : emp.turno === 'Integral' ? <Zap className="w-3 h-3" /> : <Sun className="w-3 h-3" />;

    if (compact) {
      return (
        <tr 
          onClick={() => onSelectEmployee(emp)}
          className={`fm-table-row cursor-pointer ${isSelected ? 'selected' : ''}`}
        >
          <td className="p-2">
            <div className={`status-dot ${getStatusClass(emp)}`} />
          </td>
          <td className="p-2 text-[13px] font-medium truncate max-w-32">{emp.name}</td>
          <td className="p-2">
            <span className={`font-mono font-bold text-sm ${getOvrClass(emp.ovr)}`}>{emp.ovr}</span>
          </td>
          <td className="p-2">
            <div className="flex items-center gap-2">
              <div className="flex-1 h-3 morale-bar-track rounded-sm overflow-hidden w-16">
                <div 
                  className="h-full morale-bar rounded-sm"
                  style={{ width: `${emp.morale}%`, backgroundColor: getMoraleColor(emp.morale) }}
                />
              </div>
              <span className="text-[12px] font-mono w-6 text-right" style={{ color: getMoraleColor(emp.morale) }}>
                {emp.morale}
              </span>
            </div>
          </td>
          <td className="p-2">
            <span className={`text-[12px] font-mono ${days <= 30 ? 'text-urgente' : expiring ? 'text-atencao' : 'text-muted-foreground'}`}>
              {days <= 0 ? 'VENC' : `${days}d`}
            </span>
          </td>
        </tr>
      );
    }

    return (
      <tr 
        onClick={() => onSelectEmployee(emp)}
        className={`fm-table-row cursor-pointer ${isSelected ? 'selected' : ''}`}
      >
        <td className="p-2">
          <div className={`status-dot ${getStatusClass(emp)}`} />
        </td>
        <td className="p-2 text-[13px] font-medium truncate max-w-44">{emp.name}</td>
        <td className="p-2 text-[12px] text-muted-foreground truncate max-w-40">{emp.role}</td>
        <td className="p-2">
          <span className={`tier-badge ${getTierBadgeClass(emp.tier)}`}>
            {emp.tier === 'Líder' ? 'LID' : emp.tier === 'Influente' ? 'INF' : 'PRO'}
          </span>
        </td>
        <td className="p-2">
          <span className={`font-mono font-bold text-sm ${getOvrClass(emp.ovr)}`}>{emp.ovr}</span>
        </td>
        <td className="p-2">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-3 morale-bar-track rounded-sm overflow-hidden">
              <div 
                className="h-full morale-bar rounded-sm"
                style={{ width: `${emp.morale}%`, backgroundColor: getMoraleColor(emp.morale) }}
              />
            </div>
            <span className="text-[12px] font-mono w-6 text-right" style={{ color: getMoraleColor(emp.morale) }}>
              {emp.morale}
            </span>
          </div>
        </td>
        <td className="p-2">
          <span className="flex items-center gap-1 text-muted-foreground">
            {turnoIcon}
            <span className="text-[12px]">{emp.turno === 'Noturno' ? 'NOT' : emp.turno === 'Integral' ? 'INT' : 'DIA'}</span>
          </span>
        </td>
        <td className="p-2">
          <span className={`text-[12px] font-mono ${days <= 30 ? 'text-urgente' : expiring ? 'text-atencao' : 'text-muted-foreground'}`}>
            {days <= 0 ? 'VENC' : `${days}d`}
          </span>
        </td>
        <td className="p-2 text-muted-foreground font-mono text-[12px]">
          R$ {emp.salary.toLocaleString('pt-BR')}
        </td>
        <td className="p-2">
          {emp.flightRisk && <Flame className="w-3.5 h-3.5 text-urgente pulse-risk" />}
        </td>
      </tr>
    );
  };

  if (activeSubTab === 'Quadro') {
    return (
      <div className="flex gap-4 h-full">
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex items-center gap-2 mb-3">
            <QuickStat icon={<Trophy className="w-3 h-3 text-tier-lider" />} label="Líderes" value={employees.filter(e => e.tier === 'Líder').length} />
            <QuickStat icon={<TrendingUp className="w-3 h-3 text-morale-high" />} label="OVR 80+" value={highOvr} />
            <QuickStat icon={<AlertTriangle className="w-3 h-3 text-urgente" />} label="Risco Fuga" value={flightRisks} color="text-urgente" />
            <QuickStat icon={<AlertTriangle className="w-3 h-3 text-atencao" />} label="OVR <65" value={lowOvr} color="text-atencao" />
            <div className="flex-1" />
            <div className="flex items-center gap-1 mr-2">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded transition-colors ${viewMode === 'table' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                title="Tabela"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded transition-colors ${viewMode === 'cards' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                title="Cards"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
            <div className="text-[12px] text-muted-foreground">
              {employees.length} colaboradores | Folha: R$ {folha.toLocaleString('pt-BR')}/mês
            </div>
          </div>

          <div className="fm-card rounded overflow-hidden flex-1">
            <div className="overflow-auto max-h-[calc(100vh-220px)]">
              <table className="w-full text-xs">
                <thead className="bg-muted/30 sticky top-0">
                  <tr>
                    <th className="w-6 p-2"></th>
                    <SortHeader label="Nome" sortKeyProp="name" width="w-44" />
                    <SortHeader label="Cargo" sortKeyProp="role" width="w-40" />
                    <SortHeader label="Tier" sortKeyProp="tier" width="w-20" />
                    <SortHeader label="OVR" sortKeyProp="ovr" width="w-14" />
                    <th className="text-left p-2 text-[12px] font-semibold text-muted-foreground uppercase w-28">Moral</th>
                    <SortHeader label="Turno" sortKeyProp="turno" width="w-20" />
                    <SortHeader label="Contrato" sortKeyProp="contract" width="w-20" />
                    <SortHeader label="Salário" sortKeyProp="salary" width="w-24" />
                    <th className="w-8 p-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {sortedEmployees.map(emp => <EmployeeRow key={emp.id} emp={emp} />)}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {!selectedEmployee && (
          <div className="w-60 shrink-0 space-y-3">
            <div className="fm-card rounded p-3">
              <h3 className="flex items-center gap-1.5 text-[13px] font-semibold uppercase text-muted-foreground mb-2">
                <Trophy className="w-3.5 h-3.5 text-tier-lider" /> Colaborador do Mês
              </h3>
              <div className="text-center py-2">
                <div className="w-14 h-14 rounded-full bg-tier-promessa flex items-center justify-center text-white font-bold text-base mx-auto mb-2">
                  {getInitials(star.name)}
                </div>
                <p className="font-semibold text-[14px]">{star.name}</p>
                <p className="text-[12px] text-muted-foreground">{star.role}</p>
                <div className="flex items-center justify-center gap-4 mt-2">
                  <div>
                    <p className="ovr-score text-[22px]">{star.ovr}</p>
                    <p className="text-[10px] text-muted-foreground">OVR</p>
                  </div>
                  <div>
                    <p className="text-[22px] font-bold text-morale-high">{star.morale}</p>
                    <p className="text-[10px] text-muted-foreground">Moral</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="fm-card rounded p-3 space-y-2">
              <h3 className="text-[12px] font-semibold uppercase text-muted-foreground mb-2">People Analytics</h3>
              <AnalyticRow icon={<TrendingUp className="w-3 h-3" />} label="Moral Média" value={avgMorale} color={getMoraleColor(avgMorale)} />
              <AnalyticRow icon={<AlertTriangle className="w-3 h-3 text-urgente" />} label="Risco de Fuga" value={flightRisks} color="hsl(var(--urgente))" />
              <AnalyticRow icon={<TrendingUp className="w-3 h-3 text-atencao" />} label="Baixo OVR" value={lowOvr} color="hsl(var(--atencao))" />
              <AnalyticRow icon={<TrendingUp className="w-3 h-3 text-morale-high" />} label="Alto OVR" value={highOvr} color="hsl(var(--morale-high))" />
              <AnalyticRow icon={<DollarSign className="w-3 h-3" />} label="Custo/Colab" value={`${Math.round(folha / employees.length / 1000)}k`} />
            </div>
          </div>
        )}
      </div>
    );
  }

  if (activeSubTab === 'Por Setor') {
    const sectorOrder = ['Bioquímicos/Microbiologistas', 'Analistas', 'Técnicos', 'Recepcionistas', 'Outros'];
    
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-3">
          <div className="text-[10px] text-muted-foreground">
            {Object.keys(employeesBySector).length} setores | {employees.length} colaboradores
          </div>
        </div>

        {sectorOrder.filter(s => employeesBySector[s]).map(sector => (
          <div key={sector} className="fm-card rounded overflow-hidden">
            <button
              onClick={() => toggleSector(sector)}
              className="w-full flex items-center justify-between p-3 bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <ChevronRight className={`w-4 h-4 transition-transform ${expandedSectors[sector] ? 'rotate-90' : ''}`} />
                <span className="text-xs font-semibold">{sector}</span>
                <span className="text-[10px] text-muted-foreground">({employeesBySector[sector].length})</span>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                <span>Média OVR: <span className={getOvrClass(Math.round(employeesBySector[sector].reduce((a, e) => a + e.ovr, 0) / employeesBySector[sector].length))}>{Math.round(employeesBySector[sector].reduce((a, e) => a + e.ovr, 0) / employeesBySector[sector].length)}</span></span>
                <span>Moral: {Math.round(employeesBySector[sector].reduce((a, e) => a + e.morale, 0) / employeesBySector[sector].length)}</span>
              </div>
            </button>
            
            {expandedSectors[sector] && (
              <table className="w-full text-xs">
                <thead className="bg-muted/20">
                  <tr>
                    <th className="w-6 p-2"></th>
                    <th className="text-left p-2 text-[12px] font-semibold text-muted-foreground uppercase w-44">Nome</th>
                    <th className="text-left p-2 text-[12px] font-semibold text-muted-foreground uppercase w-40">Cargo</th>
                    <th className="text-left p-2 text-[12px] font-semibold text-muted-foreground uppercase w-20">Tier</th>
                    <th className="text-left p-2 text-[12px] font-semibold text-muted-foreground uppercase w-14">OVR</th>
                    <th className="text-left p-2 text-[12px] font-semibold text-muted-foreground uppercase w-28">Moral</th>
                    <th className="text-left p-2 text-[12px] font-semibold text-muted-foreground uppercase w-20">Turno</th>
                    <th className="text-left p-2 text-[12px] font-semibold text-muted-foreground uppercase w-20">Contrato</th>
                    <th className="text-left p-2 text-[12px] font-semibold text-muted-foreground uppercase w-24">Salário</th>
                    <th className="w-8 p-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {employeesBySector[sector].sort((a, b) => b.ovr - a.ovr).map(emp => <EmployeeRow key={emp.id} emp={emp} />)}
                </tbody>
              </table>
            )}
          </div>
        ))}
      </div>
    );
  }

  if (activeSubTab === 'Por Turno') {
    return (
      <div className="grid grid-cols-2 gap-4">
        <div className="fm-card rounded overflow-hidden">
          <div className="p-3 bg-muted/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-atencao" />
              <span className="text-xs font-semibold">Diurno</span>
              <span className="text-[10px] text-muted-foreground">({diurnos.length})</span>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
              <span>Média OVR: <span className={getOvrClass(Math.round(diurnos.reduce((a, e) => a + e.ovr, 0) / diurnos.length))}>{Math.round(diurnos.reduce((a, e) => a + e.ovr, 0) / diurnos.length)}</span></span>
            </div>
          </div>
          <div className="overflow-auto max-h-[calc(100vh-280px)]">
            <table className="w-full text-xs">
              <thead className="bg-muted/20 sticky top-0">
                <tr>
                  <th className="w-6 p-2"></th>
                  <th className="text-left p-2 text-[12px] font-semibold text-muted-foreground uppercase">Nome</th>
                  <th className="text-left p-2 text-[12px] font-semibold text-muted-foreground uppercase w-14">OVR</th>
                  <th className="text-left p-2 text-[12px] font-semibold text-muted-foreground uppercase w-24">Moral</th>
                  <th className="text-left p-2 text-[12px] font-semibold text-muted-foreground uppercase w-16">Contrato</th>
                </tr>
              </thead>
              <tbody>
                {diurnos.sort((a, b) => b.ovr - a.ovr).map(emp => <EmployeeRow key={emp.id} emp={emp} compact />)}
              </tbody>
            </table>
          </div>
        </div>

        <div className="fm-card rounded overflow-hidden">
          <div className="p-3 bg-muted/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Moon className="w-4 h-4 text-tier-influente" />
              <span className="text-xs font-semibold">Noturno</span>
              <span className="text-[10px] text-muted-foreground">({noturnos.length})</span>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
              <span>Média OVR: <span className={getOvrClass(Math.round(noturnos.reduce((a, e) => a + e.ovr, 0) / noturnos.length))}>{Math.round(noturnos.reduce((a, e) => a + e.ovr, 0) / noturnos.length)}</span></span>
            </div>
          </div>
          <div className="overflow-auto max-h-[calc(100vh-280px)]">
            <table className="w-full text-xs">
              <thead className="bg-muted/20 sticky top-0">
                <tr>
                  <th className="w-6 p-2"></th>
                  <th className="text-left p-2 text-[12px] font-semibold text-muted-foreground uppercase">Nome</th>
                  <th className="text-left p-2 text-[12px] font-semibold text-muted-foreground uppercase w-14">OVR</th>
                  <th className="text-left p-2 text-[12px] font-semibold text-muted-foreground uppercase w-24">Moral</th>
                  <th className="text-left p-2 text-[12px] font-semibold text-muted-foreground uppercase w-16">Contrato</th>
                </tr>
              </thead>
              <tbody>
                {noturnos.sort((a, b) => b.ovr - a.ovr).map(emp => <EmployeeRow key={emp.id} emp={emp} compact />)}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  if (activeSubTab === 'Comparar') {
    const skillLabels: Record<string, string> = {
      tecnica: 'Técnica',
      comunicacao: 'Comunicação',
      lideranca: 'Liderança',
      disciplina: 'Disciplina',
      trabalhoEmEquipe: 'Trabalho em Equipe',
    };

    return (
      <div className="max-w-4xl mx-auto">
        <div className="fm-card rounded p-4 mb-4">
          <h3 className="text-xs font-semibold mb-3">Selecione dois colaboradores para comparar</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] text-muted-foreground uppercase mb-1 block">Colaborador 1</label>
              <select
                className="w-full bg-muted/30 border border-border rounded px-3 py-2 text-xs focus:outline-none focus:border-primary"
                value={compareEmployee1?.id || ''}
                onChange={(e) => setCompareEmployee1(employees.find(emp => emp.id === e.target.value) || null)}
              >
                <option value="">Selecionar...</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground uppercase mb-1 block">Colaborador 2</label>
              <select
                className="w-full bg-muted/30 border border-border rounded px-3 py-2 text-xs focus:outline-none focus:border-primary"
                value={compareEmployee2?.id || ''}
                onChange={(e) => setCompareEmployee2(employees.find(emp => emp.id === e.target.value) || null)}
              >
                <option value="">Selecionar...</option>
                {employees.filter(emp => emp.id !== compareEmployee1?.id).map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {compareEmployee1 && compareEmployee2 && (
          <div className="fm-card rounded overflow-hidden">
            <div className="grid grid-cols-2">
              <div className="p-4 border-r border-border bg-muted/20 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-xl font-bold mx-auto mb-2">
                  {getInitials(compareEmployee1.name)}
                </div>
                <p className="font-semibold text-sm">{compareEmployee1.name}</p>
                <p className="text-[10px] text-muted-foreground">{compareEmployee1.role}</p>
                <span className={`tier-badge ${getTierBadgeClass(compareEmployee1.tier)} mt-2 inline-block`}>
                  {compareEmployee1.tier}
                </span>
              </div>
              <div className="p-4 bg-muted/20 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-xl font-bold mx-auto mb-2">
                  {getInitials(compareEmployee2.name)}
                </div>
                <p className="font-semibold text-sm">{compareEmployee2.name}</p>
                <p className="text-[10px] text-muted-foreground">{compareEmployee2.role}</p>
                <span className={`tier-badge ${getTierBadgeClass(compareEmployee2.tier)} mt-2 inline-block`}>
                  {compareEmployee2.tier}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 border-t border-border">
              <div className="p-4 border-r border-border text-center">
                <p className="text-[10px] text-muted-foreground uppercase mb-1">OVR</p>
                <p className={`text-3xl font-bold font-mono ${getOvrClass(compareEmployee1.ovr)}`}>{compareEmployee1.ovr}</p>
              </div>
              <div className="p-4 text-center">
                <p className="text-[10px] text-muted-foreground uppercase mb-1">OVR</p>
                <p className={`text-3xl font-bold font-mono ${getOvrClass(compareEmployee2.ovr)}`}>{compareEmployee2.ovr}</p>
              </div>
            </div>

            <div className="p-4 border-t border-border">
              <h4 className="text-[10px] font-semibold uppercase text-muted-foreground mb-3">Habilidades</h4>
              <div className="space-y-3">
                {Object.keys(skillLabels).map(skillKey => {
                  const skill1 = compareEmployee1.skills[skillKey as keyof typeof compareEmployee1.skills] || 0;
                  const skill2 = compareEmployee2.skills[skillKey as keyof typeof compareEmployee2.skills] || 0;
                  return (
                    <div key={skillKey} className="flex items-center gap-3">
                      <div className="flex-1 flex items-center gap-2">
                        <span className="text-[10px] font-mono w-6 text-right">{skill1}</span>
                        <div className="flex-1 h-4 morale-bar-track rounded-sm overflow-hidden">
                          <div className="h-full bg-primary rounded-sm ml-auto" style={{ width: `${skill1}%` }} />
                        </div>
                      </div>
                      <span className="text-[10px] text-muted-foreground w-28 text-center shrink-0">{skillLabels[skillKey]}</span>
                      <div className="flex-1 flex items-center gap-2">
                        <div className="flex-1 h-4 morale-bar-track rounded-sm overflow-hidden">
                          <div className="h-full bg-tier-influente rounded-sm" style={{ width: `${skill2}%` }} />
                        </div>
                        <span className="text-[10px] font-mono w-6">{skill2}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 border-t border-border">
              <div className="p-4 border-r border-border space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Moral</span>
                  <span className="font-mono" style={{ color: getMoraleColor(compareEmployee1.morale) }}>{compareEmployee1.morale}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Salário</span>
                  <span className="font-mono">R$ {compareEmployee1.salary.toLocaleString('pt-BR')}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Contrato</span>
                  <span className="font-mono">{daysUntilExpiry(compareEmployee1.contractEnd)}d</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Turno</span>
                  <span>{compareEmployee1.turno}</span>
                </div>
              </div>
              <div className="p-4 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Moral</span>
                  <span className="font-mono" style={{ color: getMoraleColor(compareEmployee2.morale) }}>{compareEmployee2.morale}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Salário</span>
                  <span className="font-mono">R$ {compareEmployee2.salary.toLocaleString('pt-BR')}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Contrato</span>
                  <span className="font-mono">{daysUntilExpiry(compareEmployee2.contractEnd)}d</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Turno</span>
                  <span>{compareEmployee2.turno}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {(!compareEmployee1 || !compareEmployee2) && (
          <div className="fm-card rounded p-8 text-center text-muted-foreground">
            <p className="text-xs">Selecione dois colaboradores acima para ver a comparação lado a lado.</p>
          </div>
        )}
      </div>
    );
  }

  return null;
}

function QuickStat({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color?: string }) {
  return (
    <div className="flex items-center gap-1.5 bg-card/50 border border-border rounded px-2.5 py-1.5">
      {icon}
      <span className="text-[12px] text-muted-foreground">{label}:</span>
      <span className={`text-[13px] font-bold font-mono ${color || 'text-foreground'}`}>{value}</span>
    </div>
  );
}

function AnalyticRow({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number | string; color?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="flex items-center gap-1.5 text-[12px] text-muted-foreground">{icon} {label}</span>
      <span className="text-[13px] font-bold font-mono" style={color ? { color } : {}}>{value}</span>
    </div>
  );
}