import { Employee, getMoraleColor, getMoraleLabel } from '@/data/employees';
import { X, Heart, Shield, MessageSquare, Users, Award, Brain } from 'lucide-react';

interface Props {
  employee: Employee;
  onClose: () => void;
  onCPO: (emp: Employee) => void;
}

const skillLabels: Record<string, { label: string; icon: React.ReactNode }> = {
  tecnica: { label: 'Técnica', icon: <Shield className="w-3 h-3" /> },
  comunicacao: { label: 'Comunicação', icon: <MessageSquare className="w-3 h-3" /> },
  lideranca: { label: 'Liderança', icon: <Award className="w-3 h-3" /> },
  disciplina: { label: 'Disciplina', icon: <Brain className="w-3 h-3" /> },
  trabalhoEmEquipe: { label: 'Trabalho em Equipe', icon: <Users className="w-3 h-3" /> },
  atendimento: { label: 'Atendimento', icon: <Heart className="w-3 h-3" /> },
};

export function EmployeeModal({ employee, onClose, onCPO }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-foreground/30" />
      <div
        className="relative bg-card w-full max-w-md h-full overflow-y-auto shadow-2xl p-6"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl font-bold">{employee.name}</h2>
          <p className="text-sm text-muted-foreground">{employee.role}</p>
          <div className="flex items-center gap-3 mt-3">
            <span className="ovr-score text-4xl">{employee.ovr}</span>
            <div>
              <p className="text-xs text-muted-foreground">Moral</p>
              <p className="text-lg font-bold" style={{ color: getMoraleColor(employee.morale) }}>
                {employee.morale} — {getMoraleLabel(employee.morale)}
              </p>
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="space-y-3 mb-6">
          <h3 className="text-sm font-semibold uppercase text-muted-foreground">Habilidades</h3>
          {Object.entries(employee.skills).map(([key, value]) => {
            const skill = skillLabels[key];
            if (!skill) return null;
            return (
              <div key={key}>
                <div className="flex justify-between items-center mb-1">
                  <span className="flex items-center gap-1.5 text-xs">{skill.icon} {skill.label}</span>
                  <span className="text-xs font-mono font-bold">{value}</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${value}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <InfoBox label="Salário" value={`R$ ${employee.salary.toLocaleString('pt-BR')}`} />
          <InfoBox label="Contrato" value={new Date(employee.contractEnd).toLocaleDateString('pt-BR')} />
          <InfoBox label="Turno" value={employee.turno} />
          <InfoBox label="Fitness" value={`${employee.fitness}%`} />
          <InfoBox label="Forma" value={`${employee.form}%`} />
          <InfoBox label="Tier" value={employee.tier} />
        </div>

        {/* Relationships */}
        {employee.afinidades.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold uppercase text-muted-foreground mb-2">Afinidades</h3>
            <div className="flex flex-wrap gap-1.5">
              {employee.afinidades.map(name => (
                <span key={name} className="text-xs bg-morale-high/10 text-morale-high px-2 py-1 rounded-full">{name}</span>
              ))}
            </div>
          </div>
        )}
        {employee.tensoes.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold uppercase text-muted-foreground mb-2">Tensões</h3>
            <div className="flex flex-wrap gap-1.5">
              {employee.tensoes.map(name => (
                <span key={name} className="text-xs bg-urgente/10 text-urgente px-2 py-1 rounded-full">{name}</span>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {employee.notes && (
          <div className="mb-6 p-3 bg-atencao/10 rounded-lg border border-atencao/20">
            <p className="text-xs text-foreground">{employee.notes}</p>
          </div>
        )}

        {/* CPO Button */}
        <button
          onClick={() => onCPO(employee)}
          className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold text-sm hover:opacity-90 transition"
        >
          🧠 O que eu faço agora?
        </button>
      </div>
    </div>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-muted rounded-lg p-3">
      <p className="text-[10px] text-muted-foreground uppercase">{label}</p>
      <p className="text-sm font-semibold">{value}</p>
    </div>
  );
}
