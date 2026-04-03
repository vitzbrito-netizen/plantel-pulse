import { Employee, getMoraleColor, getMoraleLabel, daysUntilExpiry, isContractExpiring } from '@/data/employees';
import { X, Heart, Shield, Users, Brain, Clock, Moon, Sun, Zap, Flame, FileText, ArrowRight } from 'lucide-react';

interface Props {
  employee: Employee;
  onClose: () => void;
  onCPO: (emp: Employee) => void;
}

function getOvrClass(ovr: number): string {
  if (ovr >= 80) return 'ovr-high';
  if (ovr >= 65) return 'ovr-mid';
  return 'ovr-low';
}

function getSkillColor(value: number): string {
  if (value >= 80) return 'hsl(142, 71%, 45%)';
  if (value >= 65) return 'hsl(43, 96%, 56%)';
  return 'hsl(0, 84%, 60%)';
}

export function EmployeeSidebar({ employee, onClose, onCPO }: Props) {
  const days = daysUntilExpiry(employee.contractEnd);
  const expiring = isContractExpiring(employee.contractEnd, 90);
  const turnoIcon = employee.turno === 'Noturno' ? <Moon className="w-4 h-4" /> : employee.turno === 'Integral' ? <Zap className="w-4 h-4" /> : <Sun className="w-4 h-4" />;

  const technicalSkills = [
    { key: 'tecnica', label: 'Técnica', value: employee.skills.tecnica },
    { key: 'atendimento', label: 'Atendimento', value: employee.skills.atendimento || 0 },
  ];
  
  const mentalSkills = [
    { key: 'comunicacao', label: 'Comunicação', value: employee.skills.comunicacao },
    { key: 'lideranca', label: 'Liderança', value: employee.skills.lideranca },
    { key: 'disciplina', label: 'Disciplina', value: employee.skills.disciplina },
  ];
  
  const physicalSkills = [
    { key: 'trabalhoEmEquipe', label: 'Equipe', value: employee.skills.trabalhoEmEquipe },
    { key: 'fitness', label: 'Condição', value: employee.fitness },
    { key: 'form', label: 'Forma', value: employee.form },
  ];

  return (
    <div className="w-80 fm-sidebar h-full overflow-y-auto">
      {/* Header — clear identity */}
      <div className="sticky top-0 bg-[#16162a] border-b border-border p-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <span className={`font-mono font-bold text-3xl ${getOvrClass(employee.ovr)}`}>
            {employee.ovr}
          </span>
          <div>
            <p className="text-sm font-bold truncate max-w-40">{employee.name}</p>
            <p className="text-xs text-muted-foreground truncate max-w-40">{employee.role}</p>
          </div>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1.5 hover:bg-muted/30 rounded-lg transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Status badges — scannable at a glance */}
      <div className="p-4 border-b border-border">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className={`tier-badge text-xs ${employee.tier === 'Líder' ? 'tier-lider' : employee.tier === 'Influente' ? 'tier-influente' : 'tier-promessa'}`}>
            {employee.tier}
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/30 px-2.5 py-1 rounded-lg">
            {turnoIcon} {employee.turno}
          </span>
          {employee.flightRisk && (
            <span className="flex items-center gap-1 text-xs text-urgente bg-urgente/10 px-2.5 py-1 rounded-lg font-semibold">
              <Flame className="w-3.5 h-3.5" /> Risco de Fuga
            </span>
          )}
        </div>

        {/* Morale — big visual */}
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs text-muted-foreground font-medium">Moral</span>
            <span className="text-sm font-bold" style={{ color: getMoraleColor(employee.morale) }}>
              {employee.morale} — {getMoraleLabel(employee.morale)}
            </span>
          </div>
          <div className="h-3 morale-bar-track rounded overflow-hidden">
            <div 
              className="h-full morale-bar rounded"
              style={{ width: `${employee.morale}%`, backgroundColor: getMoraleColor(employee.morale) }}
            />
          </div>
        </div>

        {/* Contract & Salary — clear boxes */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-muted/30 rounded-lg p-3">
            <p className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Contrato</p>
            <p className={`text-sm font-bold mt-0.5 ${days <= 30 ? 'text-urgente' : expiring ? 'text-atencao' : 'text-foreground'}`}>
              {days <= 0 ? 'Vencido!' : `${days} dias`}
            </p>
          </div>
          <div className="bg-muted/30 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">Salário</p>
            <p className="text-sm font-bold mt-0.5">R$ {employee.salary.toLocaleString('pt-BR')}</p>
          </div>
        </div>
      </div>

      {/* Skills — 3 columns, color-coded numbers */}
      <div className="p-4 border-b border-border">
        <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-3">Atributos</h3>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <h4 className="text-[10px] font-semibold uppercase text-primary mb-2 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" /> Técnico
            </h4>
            <div className="space-y-2">
              {technicalSkills.filter(s => s.value > 0).map(skill => (
                <SkillRow key={skill.key} label={skill.label} value={skill.value} />
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-[10px] font-semibold uppercase text-primary mb-2 flex items-center gap-1">
              <Brain className="w-3.5 h-3.5" /> Mental
            </h4>
            <div className="space-y-2">
              {mentalSkills.map(skill => (
                <SkillRow key={skill.key} label={skill.label} value={skill.value} />
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-[10px] font-semibold uppercase text-primary mb-2 flex items-center gap-1">
              <Heart className="w-3.5 h-3.5" /> Físico
            </h4>
            <div className="space-y-2">
              {physicalSkills.map(skill => (
                <SkillRow key={skill.key} label={skill.label} value={skill.value} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Relationships */}
      <div className="p-4 border-b border-border">
        <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-2">Relacionamentos</h3>
        
        {employee.afinidades.length > 0 && (
          <div className="mb-2">
            <p className="text-[10px] text-morale-high mb-1 flex items-center gap-1 font-medium">
              <Users className="w-3.5 h-3.5" /> Afinidades
            </p>
            <div className="flex flex-wrap gap-1">
              {employee.afinidades.map(name => (
                <span key={name} className="text-[10px] bg-morale-high/10 text-morale-high px-2 py-0.5 rounded-lg">
                  {name.split(' ').slice(0, 2).join(' ')}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {employee.tensoes.length > 0 && (
          <div>
            <p className="text-[10px] text-urgente mb-1 flex items-center gap-1 font-medium">
              <Zap className="w-3.5 h-3.5" /> Tensões
            </p>
            <div className="flex flex-wrap gap-1">
              {employee.tensoes.map(name => (
                <span key={name} className="text-[10px] bg-urgente/10 text-urgente px-2 py-0.5 rounded-lg">
                  {name.split(' ').slice(0, 2).join(' ')}
                </span>
              ))}
            </div>
          </div>
        )}

        {employee.afinidades.length === 0 && employee.tensoes.length === 0 && (
          <p className="text-xs text-muted-foreground">Sem relacionamentos mapeados</p>
        )}
      </div>

      {/* Notes */}
      {employee.notes && (
        <div className="p-4 border-b border-border">
          <h3 className="text-xs font-semibold uppercase text-muted-foreground mb-2 flex items-center gap-1">
            <FileText className="w-3.5 h-3.5" /> Observações
          </h3>
          <div className="bg-atencao/10 border border-atencao/20 rounded-lg p-3">
            <p className="text-xs text-foreground leading-relaxed">{employee.notes}</p>
          </div>
        </div>
      )}

      {/* Primary CTA — big, obvious, McDonald's-style */}
      <div className="p-4">
        <button
          onClick={() => onCPO(employee)}
          className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/80 text-primary-foreground py-3 rounded-lg text-sm font-bold transition-colors"
        >
          O que eu faço agora?
          <ArrowRight className="w-4 h-4" />
        </button>
        <p className="text-[10px] text-muted-foreground text-center mt-2">
          Receba diagnóstico e plano de ação personalizado
        </p>
      </div>
    </div>
  );
}

function SkillRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-1">
      <span className="text-[10px] text-muted-foreground truncate">{label}</span>
      <span 
        className="text-xs font-mono font-bold min-w-[22px] text-right"
        style={{ color: getSkillColor(value) }}
      >
        {value}
      </span>
    </div>
  );
}
