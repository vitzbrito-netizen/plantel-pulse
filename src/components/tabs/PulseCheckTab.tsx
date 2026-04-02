import { BarChart3, TrendingUp, TrendingDown, Minus, Calendar, Users } from 'lucide-react';
import { employees, getMoraleColor } from '@/data/employees';

interface Props {
  activeSubTab: string;
}

const questions = [
  'Como foi sua semana de 1 a 5?',
  'Conseguiu completar suas tarefas sem sobrecarga?',
  'Teve alguma situação com um colega que te incomodou?',
  'Se sentiu valorizado esta semana?',
  'Algum problema operacional impediu a agilidade na liberação de resultados?',
];

interface WeekData {
  week: string;
  responseRate: number;
  avgMorale: number;
  responses: number;
  trend?: 'up' | 'down' | 'stable';
}

const weeklyData: WeekData[] = [
  { week: 'Sem 10/Mar', responseRate: 81, avgMorale: 72, responses: 13, trend: 'down' },
  { week: 'Sem 17/Mar', responseRate: 75, avgMorale: 74, responses: 12, trend: 'up' },
  { week: 'Sem 24/Mar', responseRate: 88, avgMorale: 73, responses: 14, trend: 'down' },
  { week: 'Sem 31/Mar', responseRate: 69, avgMorale: 75, responses: 11, trend: 'up' },
];

// Historical monthly data
const monthlyHistory = [
  { month: 'Out 2025', avgMorale: 68, responseRate: 72, highlights: ['2 desligamentos', 'Férias coletivas'] },
  { month: 'Nov 2025', avgMorale: 70, responseRate: 75, highlights: ['Contratação Gabriel', 'Black Friday'] },
  { month: 'Dez 2025', avgMorale: 72, responseRate: 65, highlights: ['Festa de fim de ano', 'Baixa adesão'] },
  { month: 'Jan 2026', avgMorale: 71, responseRate: 78, highlights: ['Retorno das férias', 'Tensões Gustavo'] },
  { month: 'Fev 2026', avgMorale: 73, responseRate: 82, highlights: ['Carnaval', 'Moral em alta'] },
  { month: 'Mar 2026', avgMorale: 74, responseRate: 78, highlights: ['Risco Colaborador 12', 'Adilene destaque'] },
];

export function PulseCheckTab({ activeSubTab }: Props) {
  const latestWeek = weeklyData[weeklyData.length - 1];
  const avgResponseRate = Math.round(weeklyData.reduce((a, w) => a + w.responseRate, 0) / weeklyData.length);

  // Semanal view
  if (activeSubTab === 'Semanal') {
    return (
      <div className="grid grid-cols-12 gap-4">
        {/* Left column - Stats and Chart */}
        <div className="col-span-8 space-y-4">
          {/* Quick stats */}
          <div className="grid grid-cols-4 gap-3">
            <div className="fm-card rounded p-3">
              <p className="text-[10px] text-muted-foreground uppercase mb-1">Taxa Atual</p>
              <p className="text-2xl font-bold font-mono">{latestWeek.responseRate}%</p>
              <p className="text-[9px] text-muted-foreground">{latestWeek.responses}/16 respostas</p>
            </div>
            <div className="fm-card rounded p-3">
              <p className="text-[10px] text-muted-foreground uppercase mb-1">Taxa Média</p>
              <p className="text-2xl font-bold font-mono">{avgResponseRate}%</p>
              <p className="text-[9px] text-muted-foreground">Últimas 4 semanas</p>
            </div>
            <div className="fm-card rounded p-3">
              <p className="text-[10px] text-muted-foreground uppercase mb-1">Moral Atual</p>
              <p className={`text-2xl font-bold font-mono`} style={{ color: getMoraleColor(latestWeek.avgMorale) }}>
                {latestWeek.avgMorale}
              </p>
              <p className="text-[9px] text-muted-foreground">Média do time</p>
            </div>
            <div className="fm-card rounded p-3">
              <p className="text-[10px] text-muted-foreground uppercase mb-1">Tendência</p>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-5 h-5 text-morale-high" />
                <span className="text-lg font-bold text-morale-high">+2</span>
              </div>
              <p className="text-[9px] text-muted-foreground">vs semana anterior</p>
            </div>
          </div>

          {/* Response rate by week */}
          <div className="fm-card rounded p-4">
            <h2 className="text-[10px] font-semibold uppercase text-muted-foreground mb-3">Taxa de Resposta por Semana</h2>
            <div className="space-y-2">
              {weeklyData.map(w => (
                <div key={w.week} className="flex items-center gap-3">
                  <span className="text-[10px] text-muted-foreground w-20">{w.week}</span>
                  <div className="flex-1 h-3 morale-bar-track rounded-sm overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-sm morale-bar"
                      style={{ width: `${w.responseRate}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono font-bold w-10 text-right">{w.responseRate}%</span>
                  <span className="text-[9px] text-muted-foreground w-16">{w.responses}/16</span>
                </div>
              ))}
            </div>
          </div>

          {/* Non-responders */}
          <div className="fm-card rounded p-4">
            <h2 className="text-[10px] font-semibold uppercase text-muted-foreground mb-3 flex items-center gap-1.5">
              <Users className="w-3 h-3 text-atencao" /> Não Responderam Esta Semana
            </h2>
            <div className="flex flex-wrap gap-2">
              {employees.slice(0, 5).map(emp => (
                <span key={emp.id} className="text-[10px] bg-muted/30 px-2 py-1 rounded">
                  {emp.name.split(' ').slice(0, 2).join(' ')}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right column - Questions */}
        <div className="col-span-4">
          <div className="fm-card rounded p-4 h-full">
            <h2 className="text-[10px] font-semibold uppercase text-muted-foreground mb-3">Perguntas Semanais</h2>
            <div className="space-y-2">
              {questions.map((q, i) => (
                <div key={i} className="flex items-start gap-2 p-2 bg-muted/20 rounded">
                  <span className="w-5 h-5 rounded bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <p className="text-[10px] text-foreground leading-relaxed">{q}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-border">
              <button className="w-full bg-primary hover:bg-primary/80 text-primary-foreground py-2 rounded text-xs font-semibold transition-colors">
                Enviar Pulse Check
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Tendências view
  if (activeSubTab === 'Tendências') {
    return (
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-8">
          {/* Morale trend chart */}
          <div className="fm-card rounded p-4">
            <h2 className="text-[10px] font-semibold uppercase text-muted-foreground mb-4 flex items-center gap-1.5">
              <BarChart3 className="w-3 h-3" /> Tendência de Moral (4 semanas)
            </h2>
            <div className="flex items-end gap-3 h-40">
              {weeklyData.map((w) => {
                const height = (w.avgMorale / 100) * 100;
                const barColor = w.avgMorale >= 75 ? 'bg-morale-high' : w.avgMorale >= 60 ? 'bg-morale-mid' : 'bg-morale-low';
                return (
                  <div key={w.week} className="flex-1 flex flex-col items-center gap-1">
                    <div className="flex items-center gap-0.5">
                      <span className="text-sm font-mono font-bold">{w.avgMorale}</span>
                      {w.trend === 'up' && <TrendingUp className="w-3 h-3 text-morale-high" />}
                      {w.trend === 'down' && <TrendingDown className="w-3 h-3 text-morale-low" />}
                      {w.trend === 'stable' && <Minus className="w-3 h-3 text-muted-foreground" />}
                    </div>
                    <div className="w-full h-28 flex items-end">
                      <div 
                        className={`w-full ${barColor} rounded-t transition-all`}
                        style={{ height: `${height}%` }}
                      />
                    </div>
                    <span className="text-[9px] text-muted-foreground text-center">{w.week}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Response trend */}
          <div className="fm-card rounded p-4 mt-4">
            <h2 className="text-[10px] font-semibold uppercase text-muted-foreground mb-4">Tendência de Adesão</h2>
            <div className="flex items-end gap-3 h-32">
              {weeklyData.map((w) => {
                const height = w.responseRate;
                return (
                  <div key={w.week} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs font-mono font-bold">{w.responseRate}%</span>
                    <div className="w-full h-24 flex items-end">
                      <div 
                        className="w-full bg-primary rounded-t transition-all"
                        style={{ height: `${height}%` }}
                      />
                    </div>
                    <span className="text-[9px] text-muted-foreground text-center">{w.week}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="col-span-4 space-y-4">
          {/* Key insights */}
          <div className="fm-card rounded p-4">
            <h2 className="text-[10px] font-semibold uppercase text-muted-foreground mb-3">Insights</h2>
            <div className="space-y-2">
              <div className="p-2 bg-morale-high/10 rounded border-l-2 border-morale-high">
                <p className="text-[10px] font-semibold">Moral em Alta</p>
                <p className="text-[9px] text-muted-foreground">+3 pontos nas últimas 4 semanas</p>
              </div>
              <div className="p-2 bg-atencao/10 rounded border-l-2 border-atencao">
                <p className="text-[10px] font-semibold">Adesão Variável</p>
                <p className="text-[9px] text-muted-foreground">Oscilando entre 69% e 88%</p>
              </div>
              <div className="p-2 bg-muted/30 rounded border-l-2 border-muted-foreground">
                <p className="text-[10px] font-semibold">Dia Preferido</p>
                <p className="text-[9px] text-muted-foreground">Quartas-feiras têm mais respostas</p>
              </div>
            </div>
          </div>

          {/* Correlation */}
          <div className="fm-card rounded p-4">
            <h2 className="text-[10px] font-semibold uppercase text-muted-foreground mb-3">Correlações</h2>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-[10px]">Moral vs Adesão</span>
                  <span className="text-[10px] font-bold text-morale-high">+0.72</span>
                </div>
                <div className="h-2 morale-bar-track rounded-sm overflow-hidden">
                  <div className="h-full bg-morale-high rounded-sm" style={{ width: '72%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-[10px]">Moral vs Produtividade</span>
                  <span className="text-[10px] font-bold text-morale-high">+0.85</span>
                </div>
                <div className="h-2 morale-bar-track rounded-sm overflow-hidden">
                  <div className="h-full bg-morale-high rounded-sm" style={{ width: '85%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Histórico view
  if (activeSubTab === 'Histórico') {
    return (
      <div className="space-y-4">
        {/* Monthly overview chart */}
        <div className="fm-card rounded p-4">
          <h2 className="text-[10px] font-semibold uppercase text-muted-foreground mb-4 flex items-center gap-1.5">
            <Calendar className="w-3 h-3" /> Histórico Mensal (6 meses)
          </h2>
          <div className="flex items-end gap-4 h-48">
            {monthlyHistory.map((m) => {
              const moraleHeight = (m.avgMorale / 100) * 100;
              const responseHeight = m.responseRate;
              return (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold" style={{ color: getMoraleColor(m.avgMorale) }}>{m.avgMorale}</span>
                    <span className="text-[10px] text-muted-foreground">/</span>
                    <span className="text-xs font-mono text-primary">{m.responseRate}%</span>
                  </div>
                  <div className="w-full h-36 flex items-end gap-1">
                    <div 
                      className="flex-1 bg-primary/30 rounded-t"
                      style={{ height: `${moraleHeight}%` }}
                    />
                    <div 
                      className="flex-1 bg-primary rounded-t"
                      style={{ height: `${responseHeight}%` }}
                    />
                  </div>
                  <span className="text-[9px] text-muted-foreground text-center">{m.month}</span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t border-border">
            <span className="flex items-center gap-1 text-[9px] text-muted-foreground">
              <span className="w-3 h-3 rounded-sm bg-primary/30 inline-block" /> Moral
            </span>
            <span className="flex items-center gap-1 text-[9px] text-muted-foreground">
              <span className="w-3 h-3 rounded-sm bg-primary inline-block" /> Adesão
            </span>
          </div>
        </div>

        {/* Monthly details table */}
        <div className="fm-card rounded overflow-hidden">
          <div className="p-3 border-b border-border">
            <h2 className="text-[10px] font-semibold uppercase text-muted-foreground">Detalhes por Mês</h2>
          </div>
          <table className="w-full text-xs">
            <thead className="bg-muted/30">
              <tr>
                <th className="text-left p-2 text-[10px] font-semibold text-muted-foreground uppercase">Mês</th>
                <th className="text-left p-2 text-[10px] font-semibold text-muted-foreground uppercase">Moral</th>
                <th className="text-left p-2 text-[10px] font-semibold text-muted-foreground uppercase">Adesão</th>
                <th className="text-left p-2 text-[10px] font-semibold text-muted-foreground uppercase">Eventos/Destaques</th>
              </tr>
            </thead>
            <tbody>
              {monthlyHistory.map(m => (
                <tr key={m.month} className="fm-table-row">
                  <td className="p-2 font-medium">{m.month}</td>
                  <td className="p-2">
                    <span className="font-mono font-bold" style={{ color: getMoraleColor(m.avgMorale) }}>{m.avgMorale}</span>
                  </td>
                  <td className="p-2">
                    <span className="font-mono">{m.responseRate}%</span>
                  </td>
                  <td className="p-2 text-muted-foreground">
                    {m.highlights.join(' | ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return null;
}
