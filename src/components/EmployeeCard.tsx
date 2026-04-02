import { Employee, getInitials, getMoraleColor, getMoraleLabel, getTierColor, isContractExpiring, daysUntilExpiry } from '@/data/employees';
import { AlertTriangle, Flame, Clock, Moon, Sun, Zap } from 'lucide-react';

interface Props {
  employee: Employee;
  onClick: (emp: Employee) => void;
}

export function EmployeeCard({ employee, onClick }: Props) {
  const expiring = isContractExpiring(employee.contractEnd, 90);
  const urgentExpiry = isContractExpiring(employee.contractEnd, 30);
  const days = daysUntilExpiry(employee.contractEnd);

  const turnoIcon = employee.turno === 'Noturno' ? <Moon className="w-3 h-3" /> : employee.turno === 'Integral' ? <Zap className="w-3 h-3" /> : <Sun className="w-3 h-3" />;

  return (
    <div
      onClick={() => onClick(employee)}
      className="employee-card bg-card rounded-lg border p-4 cursor-pointer relative"
    >
      {/* Warning icons */}
      <div className="absolute top-2 right-2 flex gap-1">
        {employee.flightRisk && <Flame className="w-4 h-4 text-urgente pulse-urgente" />}
        {expiring && <AlertTriangle className="w-4 h-4" style={{ color: urgentExpiry ? 'hsl(var(--urgente))' : 'hsl(var(--atencao))' }} />}
      </div>

      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
          style={{ backgroundColor: getTierColor(employee.tier), color: '#fff' }}
        >
          {getInitials(employee.name)}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{employee.name}</p>
          <p className="text-xs text-muted-foreground truncate">{employee.role}</p>

          {/* OVR */}
          <div className="flex items-center gap-2 mt-2">
            <span className="ovr-score text-2xl leading-none">{employee.ovr}</span>
            <span
              className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full text-white ${
                employee.tier === 'Líder' ? 'tier-lider-badge' : employee.tier === 'Influente' ? 'bg-tier-influente' : 'bg-tier-promessa'
              }`}
            >
              {employee.tier}
            </span>
          </div>

          {/* Morale bar */}
          <div className="mt-2">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] text-muted-foreground">Moral</span>
              <span className="text-[10px] font-medium" style={{ color: getMoraleColor(employee.morale) }}>
                {employee.morale} — {getMoraleLabel(employee.morale)}
              </span>
            </div>
            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full morale-bar"
                style={{ width: `${employee.morale}%`, backgroundColor: getMoraleColor(employee.morale) }}
              />
            </div>
          </div>

          {/* Turno + contract */}
          <div className="flex items-center gap-2 mt-2">
            <span className="flex items-center gap-1 text-[10px] bg-muted px-2 py-0.5 rounded-full">
              {turnoIcon} {employee.turno}
            </span>
            <span className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full ${expiring ? 'bg-urgente/10 text-urgente' : 'bg-muted'}`}>
              <Clock className="w-3 h-3" />
              {days <= 0 ? 'Vencido' : `${days}d`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
