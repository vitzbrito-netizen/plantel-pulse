import { employees, isContractExpiring, daysUntilExpiry } from '@/data/employees';
import { DollarSign, Users, TrendingUp, Clock, ChevronUp, ChevronDown, AlertTriangle, ArrowUp, ArrowDown } from 'lucide-react';
import { useState } from 'react';

interface Props {
  activeSubTab: string;
}

type SortKey = 'name' | 'role' | 'days' | 'ovr' | 'salary';
type SortDir = 'asc' | 'desc';

export function OrcamentoTab({ activeSubTab }: Props) {
  const [receitaMensal, setReceitaMensal] = useState(360000);
  const [sortKey, setSortKey] = useState<SortKey>('days');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const folha = employees.reduce((a, e) => a + e.salary, 0);
  const headcount = employees.length;
  const receitaPorColab = Math.round(receitaMensal / headcount);
  const contratosVencendo = employees.filter(e => isContractExpiring(e.contractEnd, 90)).length;

  const expiringContracts = employees
    .filter(e => isContractExpiring(e.contractEnd, 90))
    .sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'name': cmp = a.name.localeCompare(b.name); break;
        case 'role': cmp = a.role.localeCompare(b.role); break;
        case 'days': cmp = daysUntilExpiry(a.contractEnd) - daysUntilExpiry(b.contractEnd); break;
        case 'ovr': cmp = a.ovr - b.ovr; break;
        case 'salary': cmp = a.salary - b.salary; break;
      }
      return sortDir === 'desc' ? -cmp : cmp;
    });

  const sortedByOvr = [...employees].sort((a, b) => b.ovr - a.ovr);
  const maxSalary = Math.max(...employees.map(e => e.salary));

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const SortHeader = ({ label, sortKeyProp }: { label: string; sortKeyProp: SortKey }) => (
    <th 
      className="text-left p-2 text-[10px] font-semibold text-muted-foreground uppercase cursor-pointer hover:text-foreground transition-colors"
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

  // Visão Geral
  if (activeSubTab === 'Visão Geral') {
    return (
      <div className="grid grid-cols-12 gap-4">
        {/* Left column - Metrics */}
        <div className="col-span-8 space-y-4">
          {/* Metric Cards */}
          <div className="grid grid-cols-4 gap-3">
            <MetricCard icon={<DollarSign className="w-4 h-4" />} label="Folha Mensal" value={`R$ ${folha.toLocaleString('pt-BR')}`} />
            <MetricCard icon={<Users className="w-4 h-4" />} label="Headcount" value={headcount.toString()} />
            <div className="fm-card rounded p-3">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-primary" />
                <p className="text-[10px] text-muted-foreground uppercase">Receita/Colaborador</p>
              </div>
              <p className="text-lg font-bold font-mono">R$ {receitaPorColab.toLocaleString('pt-BR')}</p>
              <input
                type="number"
                className="mt-2 w-full text-[10px] bg-muted/30 border border-border rounded px-2 py-1 focus:outline-none focus:border-primary text-foreground"
                placeholder="Receita mensal total"
                value={receitaMensal}
                onChange={e => setReceitaMensal(Number(e.target.value))}
              />
            </div>
            <MetricCard 
              icon={<Clock className="w-4 h-4" />} 
              label="Contratos Vencendo" 
              value={contratosVencendo.toString()} 
              alert={contratosVencendo > 0} 
            />
          </div>

          {/* Salary by tier */}
          <div className="fm-card rounded p-4">
            <h2 className="text-[10px] font-semibold uppercase text-muted-foreground mb-3">Custo por Tier</h2>
            <div className="grid grid-cols-3 gap-4">
              {(['Líder', 'Influente', 'Promessa'] as const).map(tier => {
                const tierEmployees = employees.filter(e => e.tier === tier);
                const tierCost = tierEmployees.reduce((a, e) => a + e.salary, 0);
                const avgSalary = Math.round(tierCost / tierEmployees.length);
                return (
                  <div key={tier} className="text-center">
                    <p className={`text-[10px] uppercase font-semibold ${tier === 'Líder' ? 'text-tier-lider' : tier === 'Influente' ? 'text-tier-influente' : 'text-tier-promessa'}`}>{tier}</p>
                    <p className="text-lg font-bold font-mono">R$ {tierCost.toLocaleString('pt-BR')}</p>
                    <p className="text-[9px] text-muted-foreground">{tierEmployees.length} pessoas | Média: R$ {avgSalary.toLocaleString('pt-BR')}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right column - Salary vs Performance */}
        <div className="col-span-4">
          <div className="fm-card rounded p-3 h-full">
            <h2 className="text-[10px] font-semibold uppercase text-muted-foreground mb-3">Salário vs Performance</h2>
            <div className="space-y-1.5">
              {sortedByOvr.map(emp => (
                <div key={emp.id} className="flex items-center gap-2">
                  <span className="text-[9px] text-muted-foreground w-24 truncate">{emp.name.split(' ').slice(0, 2).join(' ')}</span>
                  <div className="flex-1 h-3 relative">
                    <div 
                      className="absolute inset-y-0 left-0 bg-primary/20 rounded-sm"
                      style={{ width: `${(emp.salary / maxSalary) * 100}%` }}
                    />
                    <div 
                      className="absolute inset-y-0 left-0 bg-primary rounded-sm"
                      style={{ width: `${emp.ovr}%` }}
                    />
                  </div>
                  <span className={`text-[9px] font-mono font-bold w-5 text-right ${emp.ovr >= 80 ? 'ovr-high' : emp.ovr >= 65 ? 'ovr-mid' : 'ovr-low'}`}>
                    {emp.ovr}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border">
              <span className="flex items-center gap-1 text-[9px] text-muted-foreground">
                <span className="w-2 h-2 rounded-sm bg-primary inline-block" /> OVR
              </span>
              <span className="flex items-center gap-1 text-[9px] text-muted-foreground">
                <span className="w-2 h-2 rounded-sm bg-primary/20 inline-block" /> Salário
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Contratos
  if (activeSubTab === 'Contratos') {
    const allContracts = [...employees].sort((a, b) => daysUntilExpiry(a.contractEnd) - daysUntilExpiry(b.contractEnd));
    
    return (
      <div className="space-y-4">
        {/* Summary cards */}
        <div className="grid grid-cols-4 gap-3">
          <div className="fm-card rounded p-3 border-l-2 border-urgente">
            <p className="text-[10px] text-muted-foreground uppercase mb-1">Urgente (30 dias)</p>
            <p className="text-xl font-bold text-urgente">{employees.filter(e => daysUntilExpiry(e.contractEnd) <= 30 && daysUntilExpiry(e.contractEnd) > 0).length}</p>
          </div>
          <div className="fm-card rounded p-3 border-l-2 border-atencao">
            <p className="text-[10px] text-muted-foreground uppercase mb-1">Atenção (90 dias)</p>
            <p className="text-xl font-bold text-atencao">{employees.filter(e => daysUntilExpiry(e.contractEnd) <= 90 && daysUntilExpiry(e.contractEnd) > 30).length}</p>
          </div>
          <div className="fm-card rounded p-3">
            <p className="text-[10px] text-muted-foreground uppercase mb-1">Estáveis</p>
            <p className="text-xl font-bold">{employees.filter(e => daysUntilExpiry(e.contractEnd) > 90).length}</p>
          </div>
          <div className="fm-card rounded p-3">
            <p className="text-[10px] text-muted-foreground uppercase mb-1">Custo Renovação (90d)</p>
            <p className="text-lg font-bold font-mono">R$ {expiringContracts.reduce((a, e) => a + e.salary, 0).toLocaleString('pt-BR')}</p>
          </div>
        </div>

        {/* All contracts table */}
        <div className="fm-card rounded overflow-hidden">
          <div className="p-3 border-b border-border">
            <h2 className="text-[10px] font-semibold uppercase text-muted-foreground">Todos os Contratos</h2>
          </div>
          <div className="overflow-auto max-h-[calc(100vh-320px)]">
            <table className="w-full text-xs">
              <thead className="bg-muted/30 sticky top-0">
                <tr>
                  <SortHeader label="Colaborador" sortKeyProp="name" />
                  <SortHeader label="Cargo" sortKeyProp="role" />
                  <th className="text-left p-2 text-[10px] font-semibold text-muted-foreground uppercase">Vencimento</th>
                  <SortHeader label="Dias" sortKeyProp="days" />
                  <SortHeader label="OVR" sortKeyProp="ovr" />
                  <SortHeader label="Salário" sortKeyProp="salary" />
                  <th className="text-left p-2 text-[10px] font-semibold text-muted-foreground uppercase">Status</th>
                </tr>
              </thead>
              <tbody>
                {allContracts.map(emp => {
                  const days = daysUntilExpiry(emp.contractEnd);
                  let statusColor = 'text-muted-foreground';
                  let status = 'Estável';
                  if (days <= 0) { statusColor = 'text-urgente'; status = 'Vencido'; }
                  else if (days <= 30) { statusColor = 'text-urgente'; status = 'Urgente'; }
                  else if (days <= 90) { statusColor = 'text-atencao'; status = 'Atenção'; }
                  
                  return (
                    <tr key={emp.id} className="fm-table-row">
                      <td className="p-2 font-medium">{emp.name}</td>
                      <td className="p-2 text-muted-foreground">{emp.role}</td>
                      <td className="p-2 font-mono text-[10px]">{new Date(emp.contractEnd).toLocaleDateString('pt-BR')}</td>
                      <td className="p-2">
                        <span className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded ${days <= 30 ? 'bg-urgente/10 text-urgente' : days <= 90 ? 'bg-atencao/10 text-atencao' : 'bg-muted/30'}`}>
                          {days <= 0 ? 'VENC' : `${days}d`}
                        </span>
                      </td>
                      <td className={`p-2 font-mono font-bold ${emp.ovr >= 80 ? 'ovr-high' : emp.ovr >= 65 ? 'ovr-mid' : 'ovr-low'}`}>
                        {emp.ovr}
                      </td>
                      <td className="p-2 font-mono text-[10px] text-muted-foreground">
                        R$ {emp.salary.toLocaleString('pt-BR')}
                      </td>
                      <td className={`p-2 text-[10px] font-semibold ${statusColor}`}>
                        {status}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // Projeções
  if (activeSubTab === 'Projeções') {
    const months = ['Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set'];
    const projections = months.map((month, i) => {
      const expiringThisMonth = employees.filter(e => {
        const d = new Date(e.contractEnd);
        return d.getMonth() === (3 + i) % 12 && d.getFullYear() === (3 + i >= 12 ? 2027 : 2026);
      });
      return {
        month,
        expiring: expiringThisMonth.length,
        cost: expiringThisMonth.reduce((a, e) => a + e.salary, 0),
        employees: expiringThisMonth,
      };
    });

    // Simulated budget scenarios
    const currentFolha = folha;
    const scenarios = [
      { name: 'Conservador', change: -5, description: 'Não renovar baixo OVR' },
      { name: 'Manter', change: 0, description: 'Renovar todos' },
      { name: 'Crescimento', change: 10, description: '2 novas contratações' },
    ];

    return (
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-8 space-y-4">
          {/* Monthly projections */}
          <div className="fm-card rounded p-4">
            <h2 className="text-[10px] font-semibold uppercase text-muted-foreground mb-4">Vencimentos por Mês</h2>
            <div className="grid grid-cols-6 gap-2">
              {projections.map(p => (
                <div key={p.month} className="text-center">
                  <p className="text-[10px] text-muted-foreground mb-2">{p.month}</p>
                  <div className={`rounded p-2 ${p.expiring > 0 ? 'bg-atencao/10' : 'bg-muted/20'}`}>
                    <p className={`text-xl font-bold ${p.expiring > 0 ? 'text-atencao' : 'text-muted-foreground'}`}>{p.expiring}</p>
                    <p className="text-[9px] text-muted-foreground">contratos</p>
                  </div>
                  {p.cost > 0 && (
                    <p className="text-[9px] text-muted-foreground mt-1">R$ {(p.cost / 1000).toFixed(1)}k</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Budget scenarios */}
          <div className="fm-card rounded p-4">
            <h2 className="text-[10px] font-semibold uppercase text-muted-foreground mb-4">Cenários de Orçamento</h2>
            <div className="grid grid-cols-3 gap-4">
              {scenarios.map(s => (
                <div key={s.name} className={`rounded p-3 ${s.change < 0 ? 'bg-morale-high/10' : s.change > 0 ? 'bg-atencao/10' : 'bg-muted/20'}`}>
                  <p className="text-xs font-semibold mb-1">{s.name}</p>
                  <p className="text-[10px] text-muted-foreground mb-2">{s.description}</p>
                  <div className="flex items-center gap-1">
                    {s.change < 0 ? <ArrowDown className="w-3 h-3 text-morale-high" /> : s.change > 0 ? <ArrowUp className="w-3 h-3 text-atencao" /> : null}
                    <span className={`text-lg font-bold font-mono ${s.change < 0 ? 'text-morale-high' : s.change > 0 ? 'text-atencao' : ''}`}>
                      R$ {Math.round(currentFolha * (1 + s.change / 100)).toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <p className={`text-[10px] ${s.change < 0 ? 'text-morale-high' : s.change > 0 ? 'text-atencao' : 'text-muted-foreground'}`}>
                    {s.change > 0 ? '+' : ''}{s.change}%
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-4">
          <div className="fm-card rounded p-4">
            <h2 className="text-[10px] font-semibold uppercase text-muted-foreground mb-4 flex items-center gap-1.5">
              <AlertTriangle className="w-3 h-3 text-atencao" /> Decisões Pendentes
            </h2>
            <div className="space-y-2">
              {expiringContracts.slice(0, 6).map(emp => {
                const days = daysUntilExpiry(emp.contractEnd);
                return (
                  <div key={emp.id} className="flex items-center justify-between p-2 bg-muted/20 rounded">
                    <div>
                      <p className="text-xs font-medium">{emp.name.split(' ').slice(0, 2).join(' ')}</p>
                      <p className="text-[9px] text-muted-foreground">OVR {emp.ovr} | R$ {(emp.salary / 1000).toFixed(1)}k</p>
                    </div>
                    <span className={`text-[10px] font-bold ${days <= 30 ? 'text-urgente' : 'text-atencao'}`}>
                      {days}d
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

function MetricCard({ icon, label, value, alert }: { icon: React.ReactNode; label: string; value: string; alert?: boolean }) {
  return (
    <div className={`fm-card rounded p-3 ${alert ? 'border-atencao/50' : ''}`}>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-primary">{icon}</span>
        <p className="text-[10px] text-muted-foreground uppercase">{label}</p>
      </div>
      <p className={`text-lg font-bold font-mono ${alert ? 'text-atencao' : ''}`}>{value}</p>
    </div>
  );
}
