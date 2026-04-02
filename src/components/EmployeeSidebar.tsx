import { Employee, getMoraleColor, getMoraleLabel, daysUntilExpiry, isContractExpiring } from '@/data/employees';
import { X, Heart, Shield, MessageSquare, Users, Award, Brain, Clock, Moon, Sun, Zap, Flame, FileText } from 'lucide-react';

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
  const turnoIcon = employee.turno === 'Noturno' ? <Moon className="w-3 h-3" /> : employee.turno === 'Integral' ? <Zap className="w-3 h-3" /> : <Sun className="w-3 h-3" />;

  // Group skills into 3 columns like FM: Technical, Mental, Physical
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
      {/* Header */}
      <div className="sticky top-0 bg-[#16162a] border-b border-border p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`font-mono font-bold text-2xl ${getOvrClass(employee.ovr)}`}>
            {employee.ovr}
          </span>
          <div>
            <p className="text-xs font-semibold truncate max-w-36">{employee.name}</p>
            <p className="text-[10px] text-muted-foreground truncate max-w-36">{employee.role}</p>
          </div>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Status bar */}
      <div className="p-3 border-b border-border">
        <div className="flex items-center gap-2 mb-2">
          {/* Tier badge */}
          <span className={`tier-badge ${employee.tier === 'Líder' ? 'tier-lider' : employee.tier === 'Influente' ? 'tier-influente' : 'tier-promessa'}`}>
            {employee.tier}
          </span>
          {/* Turno */}
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground bg-muted/30 px-2 py-0.5 rounded">
            {turnoIcon} {employee.turno}
          </span>
          {/* Flight risk */}
          {employee.flightRisk && (
            <span className="flex items-center gap-1 text-[10px] text-urgente bg-urgente/10 px-2 py-0.5 rounded pulse-risk">
              <Flame className="w-3 h-3" /> Risco
            </span>
          )}
        </div>

        {/* Morale bar */}
        <div className="mb-2">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] text-muted-foreground">Moral</span>
            <span className="text-[10px] font-semibold" style={{ color: getMoraleColor(employee.morale) }}>
              {employee.morale} - {getMoraleLabel(employee.morale)}
            </span>
          </div>
          <div className="h-2 morale-bar-track rounded-sm overflow-hidden">
            <div 
              className="h-full morale-bar rounded-sm"
              style={{ width: `${employee.morale}%`, backgroundColor: getMoraleColor(employee.morale) }}
            />
          </div>
        </div>

        {/* Contract & Salary */}
        <div className="grid grid-cols-2 gap-2 text-[10px]">
          <div className="bg-muted/30 rounded p-2">
            <p className="text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> Contrato</p>
            <p className={`font-semibold ${days <= 30 ? 'text-urgente' : expiring ? 'text-atencao' : 'text-foreground'}`}>
              {days <= 0 ? 'Vencido' : `${days} dias`}
            </p>
          </div>
          <div className="bg-muted/30 rounded p-2">
            <p className="text-muted-foreground">Salário</p>
            <p className="font-semibold">R$ {employee.salary.toLocaleString('pt-BR')}</p>
          </div>
        </div>
      </div>

      {/* Skills - 3 columns like FM */}
      <div className="p-3 border-b border-border">
        <h3 className="text-[10px] font-semibold uppercase text-muted-foreground mb-3">Atributos</h3>
        <div className="grid grid-cols-3 gap-3">
          {/* Technical */}
          <div>
            <h4 className="text-[9px] font-semibold uppercase text-primary mb-2 flex items-center gap-1">
              <Shield className="w-3 h-3" /> Técnico
            </h4>
            <div className="space-y-1.5">
              {technicalSkills.filter(s => s.value > 0).map(skill => (
                <SkillRow key={skill.key} label={skill.label} value={skill.value} />
              ))}
            </div>
          </div>

          {/* Mental */}
          <div>
            <h4 className="text-[9px] font-semibold uppercase text-primary mb-2 flex items-center gap-1">
              <Brain className="w-3 h-3" /> Mental
            </h4>
            <div className="space-y-1.5">
              {mentalSkills.map(skill => (
                <SkillRow key={skill.key} label={skill.label} value={skill.value} />
              ))}
            </div>
          </div>

          {/* Physical */}
          <div>
            <h4 className="text-[9px] font-semibold uppercase text-primary mb-2 flex items-center gap-1">
              <Heart className="w-3 h-3" /> Físico
            </h4>
            <div className="space-y-1.5">
              {physicalSkills.map(skill => (
                <SkillRow key={skill.key} label={skill.label} value={skill.value} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Relationships */}
      <div className="p-3 border-b border-border">
        <h3 className="text-[10px] font-semibold uppercase text-muted-foreground mb-2">Relacionamentos</h3>
        
        {employee.afinidades.length > 0 && (
          <div className="mb-2">
            <p className="text-[9px] text-morale-high mb-1 flex items-center gap-1">
              <Users className="w-3 h-3" /> Afinidades
            </p>
            <div className="flex flex-wrap gap-1">
              {employee.afinidades.map(name => (
                <span key={name} className="text-[9px] bg-morale-high/10 text-morale-high px-1.5 py-0.5 rounded">
                  {name.split(' ').slice(0, 2).join(' ')}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {employee.tensoes.length > 0 && (
          <div>
            <p className="text-[9px] text-urgente mb-1 flex items-center gap-1">
              <Zap className="w-3 h-3" /> Tensões
            </p>
            <div className="flex flex-wrap gap-1">
              {employee.tensoes.map(name => (
                <span key={name} className="text-[9px] bg-urgente/10 text-urgente px-1.5 py-0.5 rounded">
                  {name.split(' ').slice(0, 2).join(' ')}
                </span>
              ))}
            </div>
          </div>
        )}

        {employee.afinidades.length === 0 && employee.tensoes.length === 0 && (
          <p className="text-[9px] text-muted-foreground">Sem relacionamentos mapeados</p>
        )}
      </div>

      {/* Notes */}
      {employee.notes && (
        <div className="p-3 border-b border-border">
          <h3 className="text-[10px] font-semibold uppercase text-muted-foreground mb-2 flex items-center gap-1">
            <FileText className="w-3 h-3" /> Observações
          </h3>
          <div className="bg-atencao/10 border border-atencao/20 rounded p-2">
            <p className="text-[10px] text-foreground">{employee.notes}</p>
          </div>
        </div>
      )}

      {/* CPO Button */}
      <div className="p-3">
        <button
          onClick={() => onCPO(employee)}
          className="w-full bg-primary hover:bg-primary/80 text-primary-foreground py-2 rounded text-xs font-semibold transition-colors"
        >
          O que eu faço agora?
        </button>
      </div>
    </div>
  );
}

function SkillRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-1">
      <span className="text-[9px] text-muted-foreground truncate">{label}</span>
      <span 
        className="text-[10px] font-mono font-bold min-w-[20px] text-right"
        style={{ color: getSkillColor(value) }}
      >
        {value}
      </span>
    </div>
  );
}
