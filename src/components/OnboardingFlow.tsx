import { useState } from 'react';
import { employees } from '@/data/employees';
import { CheckCircle, ChevronRight } from 'lucide-react';

interface Props {
  onComplete: () => void;
}

export function OnboardingFlow({ onComplete }: Props) {
  const [step, setStep] = useState<'welcome' | 'review' | 'done'>('welcome');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [confirmed, setConfirmed] = useState<Set<string>>(new Set());

  if (step === 'welcome') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="bg-card rounded-2xl border shadow-lg max-w-lg w-full p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold mx-auto mb-6">
            P
          </div>
          <h1 className="text-2xl font-bold mb-2">Bem-vindo ao Regiae</h1>
          <p className="text-muted-foreground mb-6">
            Antes de ver seu dashboard, confirme os dados da sua equipe.
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            Laboratório Excelência — Brasília, DF<br />
            {employees.length} colaboradores cadastrados
          </p>
          <button
            onClick={() => setStep('review')}
            className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition"
          >
            Começar Revisão
          </button>
        </div>
      </div>
    );
  }

  if (step === 'review') {
    const emp = employees[currentIndex];
    const progress = ((currentIndex + 1) / employees.length) * 100;

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="bg-card rounded-2xl border shadow-lg max-w-lg w-full p-8">
          {/* Progress */}
          <div className="mb-6">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Colaborador {currentIndex + 1} de {employees.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>

          {/* Employee card */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold">{emp.name}</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Field label="Cargo" value={emp.role} />
              <Field label="Tier" value={emp.tier} />
              <Field label="OVR" value={emp.ovr.toString()} />
              <Field label="Moral" value={emp.morale.toString()} />
              <Field label="Salário" value={`R$ ${emp.salary.toLocaleString('pt-BR')}`} />
              <Field label="Contrato" value={new Date(emp.contractEnd).toLocaleDateString('pt-BR')} />
              <Field label="Turno" value={emp.turno} />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => {
                setConfirmed(prev => new Set(prev).add(emp.id));
                if (currentIndex < employees.length - 1) {
                  setCurrentIndex(currentIndex + 1);
                } else {
                  setStep('done');
                }
              }}
              className="flex-1 bg-primary text-primary-foreground py-3 rounded-lg font-semibold text-sm hover:opacity-90 transition flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Confirmar{currentIndex < employees.length - 1 ? ' e Próximo' : ''}
            </button>
          </div>

          {currentIndex > 0 && (
            <button
              onClick={() => setCurrentIndex(currentIndex - 1)}
              className="w-full text-xs text-muted-foreground mt-2 hover:text-foreground"
            >
              ← Voltar
            </button>
          )}
        </div>
      </div>
    );
  }

  // Done
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="bg-card rounded-2xl border shadow-lg max-w-lg w-full p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-morale-high flex items-center justify-center text-white text-2xl mx-auto mb-6">
          <CheckCircle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Equipe Confirmada!</h1>
        <p className="text-muted-foreground mb-6">
          Todos os {employees.length} colaboradores foram revisados. Seu dashboard está pronto.
        </p>
        <button
          onClick={onComplete}
          className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition flex items-center gap-2 mx-auto"
        >
          Abrir Dashboard <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-muted rounded-lg p-2">
      <p className="text-[10px] text-muted-foreground uppercase">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
