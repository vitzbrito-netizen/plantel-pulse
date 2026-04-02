import { employees, isContractExpiring, daysUntilExpiry, getMoraleColor, isFlightRisk, Employee } from '@/data/employees';
import { AlertTriangle, Flame, Clock, Heart, Zap, TrendingUp } from 'lucide-react';

interface Props {
  activeSubTab: string;
}

interface Alert {
  id: string;
  type: 'flight_risk' | 'tension' | 'contract' | 'low_morale';
  urgency: 'URGENTE' | 'ATENÇÃO';
  title: string;
  description: string;
  employeeName: string;
}

function generateAlerts(): Alert[] {
  const alerts: Alert[] = [];

  employees.filter(e => e.flightRisk || isFlightRisk(e)).forEach(e => {
    alerts.push({
      id: `fr-${e.id}`, type: 'flight_risk', urgency: 'URGENTE',
      title: `${e.name} em risco de fuga`,
      description: `Moral ${e.morale}, contrato vence em ${daysUntilExpiry(e.contractEnd)} dias.`,
      employeeName: e.name,
    });
  });

  employees.filter(e => e.tensoes.length > 0 && !e.flightRisk).forEach(e => {
    alerts.push({
      id: `t-${e.id}`, type: 'tension', urgency: 'ATENÇÃO',
      title: `Tensão envolvendo ${e.name}`,
      description: `Conflito com ${e.tensoes.join(', ')}.`,
      employeeName: e.name,
    });
  });

  employees.filter(e => isContractExpiring(e.contractEnd, 90) && !e.flightRisk).forEach(e => {
    const days = daysUntilExpiry(e.contractEnd);
    alerts.push({
      id: `c-${e.id}`, type: 'contract', urgency: days <= 30 ? 'URGENTE' : 'ATENÇÃO',
      title: `Contrato de ${e.name} vence em ${days} dias`,
      description: `${e.role}. OVR ${e.ovr}.`,
      employeeName: e.name,
    });
  });

  return alerts.slice(0, 8);
}

function getShortName(name: string): string {
  const parts = name.split(' ').filter(p => !['Dr.', 'de', 'da', 'do', 'dos'].includes(p));
  return parts.length >= 2 ? `${parts[0]} ${parts[parts.length - 1][0]}.` : parts[0];
}

export function DinamicaTab({ activeSubTab }: Props) {
  const alerts = generateAlerts();
  const lideres = employees.filter(e => e.tier === 'Líder');
  const influentes = employees.filter(e => e.tier === 'Influente');
  const promessas = employees.filter(e => e.tier === 'Promessa');

  // Alertas view (default)
  if (activeSubTab === 'Alertas') {
    return (
      <div className="grid grid-cols-12 gap-4">
        {/* Alerts */}
        <div className="col-span-6 space-y-4">
          <div className="fm-card rounded p-3">
            <h2 className="text-[10px] font-semibold uppercase text-muted-foreground mb-3 flex items-center gap-1.5">
              <AlertTriangle className="w-3 h-3 text-urgente" /> Alertas Prioritários
            </h2>
            <div className="space-y-2">
              {alerts.map(alert => (
                <div 
                  key={alert.id} 
                  className={`rounded p-2.5 border-l-2 ${
                    alert.urgency === 'URGENTE' 
                      ? 'bg-urgente/5 border-urgente' 
                      : 'bg-atencao/5 border-atencao'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {alert.type === 'flight_risk' && <Flame className="w-3 h-3 text-urgente pulse-risk" />}
                    {alert.type === 'tension' && <Zap className="w-3 h-3 text-atencao" />}
                    {alert.type === 'contract' && <Clock className="w-3 h-3 text-atencao" />}
                    {alert.type === 'low_morale' && <Heart className="w-3 h-3 text-urgente" />}
                    <span className={`text-[9px] font-bold uppercase ${alert.urgency === 'URGENTE' ? 'text-urgente' : 'text-atencao'}`}>
                      {alert.urgency}
                    </span>
                  </div>
                  <h3 className="text-xs font-semibold mb-0.5">{alert.title}</h3>
                  <p className="text-[10px] text-muted-foreground">{alert.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="col-span-6">
          <div className="fm-card rounded p-3">
            <h2 className="text-[10px] font-semibold uppercase text-muted-foreground mb-3 flex items-center gap-1.5">
              <TrendingUp className="w-3 h-3 text-primary" /> Resumo de Alertas
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-urgente/10 rounded p-3 text-center">
                <p className="text-2xl font-bold text-urgente">{alerts.filter(a => a.urgency === 'URGENTE').length}</p>
                <p className="text-[10px] text-muted-foreground">Urgentes</p>
              </div>
              <div className="bg-atencao/10 rounded p-3 text-center">
                <p className="text-2xl font-bold text-atencao">{alerts.filter(a => a.urgency === 'ATENÇÃO').length}</p>
                <p className="text-[10px] text-muted-foreground">Atenção</p>
              </div>
              <div className="bg-urgente/10 rounded p-3 text-center">
                <p className="text-2xl font-bold text-urgente">{employees.filter(e => e.flightRisk).length}</p>
                <p className="text-[10px] text-muted-foreground">Risco Fuga</p>
              </div>
              <div className="bg-atencao/10 rounded p-3 text-center">
                <p className="text-2xl font-bold text-atencao">{employees.filter(e => e.tensoes.length > 0).length}</p>
                <p className="text-[10px] text-muted-foreground">Com Tensões</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Hierarquia view
  if (activeSubTab === 'Hierarquia') {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="fm-card rounded p-6">
          <h2 className="text-[10px] font-semibold uppercase text-muted-foreground mb-6 text-center">Hierarquia do Time</h2>
          
          {/* Pyramid visualization */}
          <div className="flex flex-col items-center gap-4">
            {/* Líderes - Top tier */}
            <div className="text-center">
              <p className="text-[9px] text-tier-lider font-semibold uppercase mb-3">Líderes ({lideres.length})</p>
              <div className="flex justify-center gap-3 flex-wrap">
                {lideres.map(emp => (
                  <PyramidNode key={emp.id} employee={emp} tier="lider" />
                ))}
              </div>
            </div>

            {/* Connector */}
            <div className="w-px h-6 bg-border" />

            {/* Influentes - Middle tier */}
            <div className="text-center">
              <p className="text-[9px] text-tier-influente font-semibold uppercase mb-3">Influentes ({influentes.length})</p>
              <div className="flex justify-center gap-2 flex-wrap max-w-[500px]">
                {influentes.map(emp => (
                  <PyramidNode key={emp.id} employee={emp} tier="influente" size="sm" />
                ))}
              </div>
            </div>

            {/* Connector */}
            <div className="w-px h-6 bg-border" />

            {/* Promessas - Bottom tier */}
            <div className="text-center">
              <p className="text-[9px] text-tier-promessa font-semibold uppercase mb-3">Promessas ({promessas.length})</p>
              <div className="flex justify-center gap-2 flex-wrap">
                {promessas.map(emp => (
                  <PyramidNode key={emp.id} employee={emp} tier="promessa" size="sm" />
                ))}
              </div>
            </div>
          </div>

          {/* Summary stats */}
          <div className="mt-8 pt-4 border-t border-border grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-lg font-bold text-tier-lider">{Math.round(lideres.reduce((a, e) => a + e.ovr, 0) / lideres.length)}</p>
              <p className="text-[9px] text-muted-foreground">Média OVR Líderes</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-tier-influente">{Math.round(influentes.reduce((a, e) => a + e.ovr, 0) / influentes.length)}</p>
              <p className="text-[9px] text-muted-foreground">Média OVR Influentes</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-tier-promessa">{Math.round(promessas.reduce((a, e) => a + e.ovr, 0) / promessas.length)}</p>
              <p className="text-[9px] text-muted-foreground">Média OVR Promessas</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Relacionamentos view
  if (activeSubTab === 'Relacionamentos') {
    return (
      <div className="fm-card rounded p-4">
        <h2 className="text-[10px] font-semibold uppercase text-muted-foreground mb-4">Mapa de Relacionamentos</h2>
        
        {/* Grid legend */}
        <div className="flex items-center gap-4 mb-4 text-[10px]">
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-sm bg-morale-high/30 flex items-center justify-center text-morale-high font-bold">+</span> Afinidade
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-sm bg-urgente/30 flex items-center justify-center text-urgente font-bold">!</span> Tensão
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded-sm bg-muted/50 flex items-center justify-center text-muted-foreground">-</span> Neutro
          </span>
        </div>

        {/* Relationship matrix */}
        <div className="overflow-auto">
          <div className="inline-block min-w-full">
            {/* Header row */}
            <div className="flex">
              <div className="w-28 shrink-0" />
              {employees.map(emp => (
                <div 
                  key={emp.id} 
                  className="w-6 h-20 flex items-end justify-center pb-1"
                >
                  <span 
                    className="text-[8px] text-muted-foreground whitespace-nowrap origin-bottom-left rotate-[-60deg] translate-x-2"
                    style={{ transformOrigin: 'bottom left' }}
                  >
                    {emp.name.split(' ')[0]}
                  </span>
                </div>
              ))}
            </div>

            {/* Data rows */}
            {employees.map(rowEmp => (
              <div key={rowEmp.id} className="flex items-center">
                <div className="w-28 shrink-0 text-[9px] text-muted-foreground truncate pr-2">
                  {getShortName(rowEmp.name)}
                </div>
                {employees.map(colEmp => {
                  if (rowEmp.id === colEmp.id) {
                    return <div key={colEmp.id} className="fm-rel-cell fm-rel-neutral">-</div>;
                  }
                  
                  const hasAffinity = rowEmp.afinidades.some(a => colEmp.name.includes(a.split(' ')[0]));
                  const hasTension = rowEmp.tensoes.some(t => colEmp.name.includes(t.split(' ')[0]));
                  
                  let cellClass = 'fm-rel-neutral';
                  let content = '';
                  
                  if (hasAffinity) {
                    cellClass = 'fm-rel-positive';
                    content = '+';
                  } else if (hasTension) {
                    cellClass = 'fm-rel-negative';
                    content = '!';
                  }
                  
                  return (
                    <div key={colEmp.id} className={`fm-rel-cell ${cellClass}`}>
                      {content}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="mt-4 pt-4 border-t border-border flex items-center gap-6">
          <p className="text-[10px] text-muted-foreground">
            <span className="font-bold text-morale-high">{employees.reduce((a, e) => a + e.afinidades.length, 0)}</span> afinidades totais
          </p>
          <p className="text-[10px] text-muted-foreground">
            <span className="font-bold text-urgente">{employees.reduce((a, e) => a + e.tensoes.length, 0)}</span> tensões totais
          </p>
          <p className="text-[10px] text-muted-foreground">
            <span className="font-bold">{employees.filter(e => e.tensoes.length > 0).length}</span> colaboradores com conflitos
          </p>
        </div>
      </div>
    );
  }

  // Clima view
  if (activeSubTab === 'Clima') {
    const avgMorale = Math.round(employees.reduce((a, e) => a + e.morale, 0) / employees.length);
    const moraleDistribution = {
      excelente: employees.filter(e => e.morale >= 85).length,
      bom: employees.filter(e => e.morale >= 70 && e.morale < 85).length,
      regular: employees.filter(e => e.morale >= 55 && e.morale < 70).length,
      baixo: employees.filter(e => e.morale < 55).length,
    };

    return (
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-4">
          <div className="fm-card rounded p-4 text-center">
            <h2 className="text-[10px] font-semibold uppercase text-muted-foreground mb-4">Clima Organizacional</h2>
            <div className="mb-4">
              <p className="ovr-score text-5xl text-primary">8.0</p>
              <p className="text-[10px] text-muted-foreground mt-1">de 10</p>
            </div>
            <div className="space-y-2">
              <ClimateBar label="Colaboração" value={82} />
              <ClimateBar label="Comunicação" value={72} />
              <ClimateBar label="Satisfação" value={75} />
              <ClimateBar label="Confiança" value={78} />
              <ClimateBar label="Engajamento" value={80} />
            </div>
          </div>
        </div>

        <div className="col-span-4">
          <div className="fm-card rounded p-4">
            <h2 className="text-[10px] font-semibold uppercase text-muted-foreground mb-4">Moral do Time</h2>
            <div className="text-center mb-4">
              <p className="text-4xl font-bold" style={{ color: getMoraleColor(avgMorale) }}>{avgMorale}</p>
              <p className="text-[10px] text-muted-foreground">Média</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-morale-high">Excelente (85+)</span>
                <span className="text-xs font-bold">{moraleDistribution.excelente}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-morale-mid">Bom (70-84)</span>
                <span className="text-xs font-bold">{moraleDistribution.bom}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-atencao">Regular (55-69)</span>
                <span className="text-xs font-bold">{moraleDistribution.regular}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-urgente">Baixo (&lt;55)</span>
                <span className="text-xs font-bold">{moraleDistribution.baixo}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-4">
          <div className="fm-card rounded p-4">
            <h2 className="text-[10px] font-semibold uppercase text-muted-foreground mb-4">Moral por Tier</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-[10px] text-tier-lider">Líderes</span>
                  <span className="text-xs font-bold">{Math.round(lideres.reduce((a, e) => a + e.morale, 0) / lideres.length)}</span>
                </div>
                <div className="h-3 morale-bar-track rounded-sm overflow-hidden">
                  <div 
                    className="h-full bg-tier-lider rounded-sm"
                    style={{ width: `${Math.round(lideres.reduce((a, e) => a + e.morale, 0) / lideres.length)}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-[10px] text-tier-influente">Influentes</span>
                  <span className="text-xs font-bold">{Math.round(influentes.reduce((a, e) => a + e.morale, 0) / influentes.length)}</span>
                </div>
                <div className="h-3 morale-bar-track rounded-sm overflow-hidden">
                  <div 
                    className="h-full bg-tier-influente rounded-sm"
                    style={{ width: `${Math.round(influentes.reduce((a, e) => a + e.morale, 0) / influentes.length)}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-[10px] text-tier-promessa">Promessas</span>
                  <span className="text-xs font-bold">{Math.round(promessas.reduce((a, e) => a + e.morale, 0) / promessas.length)}</span>
                </div>
                <div className="h-3 morale-bar-track rounded-sm overflow-hidden">
                  <div 
                    className="h-full bg-tier-promessa rounded-sm"
                    style={{ width: `${Math.round(promessas.reduce((a, e) => a + e.morale, 0) / promessas.length)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

function PyramidNode({ employee, tier, size = 'md' }: { employee: Employee; tier: 'lider' | 'influente' | 'promessa'; size?: 'sm' | 'md' }) {
  const sizeClasses = size === 'sm' ? 'w-10 h-10 text-[10px]' : 'w-14 h-14 text-xs';
  const bgClass = tier === 'lider' ? 'bg-tier-lider' : tier === 'influente' ? 'bg-tier-influente' : 'bg-tier-promessa';
  const initials = employee.name.split(' ').filter(p => !['Dr.', 'de', 'da', 'do', 'dos'].includes(p)).map(p => p[0]).join('').slice(0, 2);
  
  return (
    <div className="text-center">
      <div 
        className={`${sizeClasses} ${bgClass} rounded-full flex items-center justify-center text-white font-bold mx-auto relative`}
        title={employee.name}
      >
        {initials}
        {employee.flightRisk && (
          <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-urgente rounded-full pulse-risk" />
        )}
      </div>
      <p className="text-[9px] text-muted-foreground mt-1 max-w-[60px] truncate mx-auto">
        {employee.name.split(' ')[0]}
      </p>
      <p className={`text-[10px] font-mono font-bold ${employee.ovr >= 80 ? 'ovr-high' : employee.ovr >= 65 ? 'ovr-mid' : 'ovr-low'}`}>
        {employee.ovr}
      </p>
    </div>
  );
}

function ClimateBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[9px] text-muted-foreground w-20 text-left">{label}</span>
      <div className="flex-1 h-2 morale-bar-track rounded-sm overflow-hidden">
        <div 
          className="h-full bg-primary rounded-sm morale-bar" 
          style={{ width: `${value}%` }} 
        />
      </div>
      <span className="text-[9px] font-mono font-bold w-8 text-right">{value}%</span>
    </div>
  );
}
