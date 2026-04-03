import { Employee, getInitials, getMoraleColor, getMoraleLabel, getTierColor, isContractExpiring, daysUntilExpiry } from '@/data/employees';
import { AlertTriangle, Flame, Clock, Moon, Sun, Zap, CircleDashed } from 'lucide-react';

interface Props {
  employee: Employee;
  onClick: (emp: Employee) => void;
}

export function EmployeeCard({ employee, onClick }: Props) {
  const expiring = isContractExpiring(employee.contractEnd, 90);
  const urgentExpiry = isContractExpiring(employee.contractEnd, 30);
  const days = daysUntilExpiry(employee.contractEnd);

  const turnoIcon = employee.turno === 'Noturno' ? <Moon className="w-3.5 h-3.5" /> : employee.turno === 'Integral' ? <Zap className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />;

  return (
    <div
      onClick={() => onClick(employee)}
      className="employee-card bg-card rounded-xl border-2 border-border hover:border-primary/50 p-4 cursor-pointer relative transition-all hover:shadow-lg hover:shadow-primary/5 active:scale-[0.98]"
    >
      {/* Warning badges — top right */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5">
        {employee.pendingFields && employee.pendingFields.length > 0 && (
          <span className="flex items-center gap-0.5 text-[9px] font-medium text-muted-foreground/60 bg-muted/40 px-2 py-0.5 rounded-full" title={`Dados estimados: ${employee.pendingFields.join(', ')}`}>
            <CircleDashed className="w-3 h-3" />
            Standby
          </span>
        )}
        {employee.flightRisk && <Flame className="w-4 h-4 text-urgente pulse-urgente" />}
        {expiring && <AlertTriangle className="w-4 h-4" style={{ color: urgentExpiry ? 'hsl(var(--urgente))' : 'hsl(var(--atencao))' }} />}
      </div>

      <div className="flex items-start gap-3">
        {/* Avatar — larger */}
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
          style={{ backgroundColor: getTierColor(employee.tier), color: '#fff' }}
        >
          {getInitials(employee.name)}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm truncate">{employee.name}</p>
          <p className="text-xs text-muted-foreground truncate">{employee.role}</p>

          {/* OVR + Tier — prominent */}
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

          {/* Morale bar — wider track */}
          <div className="mt-2.5">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] text-muted-foreground">Moral</span>
              <span className="text-xs font-semibold" style={{ color: getMoraleColor(employee.morale) }}>
                {employee.morale} — {getMoraleLabel(employee.morale)}
              </span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full morale-bar"
                style={{ width: `${employee.morale}%`, backgroundColor: getMoraleColor(employee.morale) }}
              />
            </div>
          </div>

          {/* Turno + contract — pill style */}
          <div className="flex items-center gap-2 mt-2.5">
            <span className="flex items-center gap-1 text-xs bg-muted px-2.5 py-1 rounded-lg">
              {turnoIcon} {employee.turno}
            </span>
            <span className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg ${expiring ? 'bg-urgente/10 text-urgente font-semibold' : 'bg-muted'}`}>
              <Clock className="w-3 h-3" />
              {days <= 0 ? 'Vencido!' : `${days}d`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
