import { useState } from 'react';
import { CheckCircle, ChevronRight, ArrowLeft, Shield, Users, User } from 'lucide-react';
import { useAssignRole, AppRole } from '@/hooks/useUserRole';
import { toast } from 'sonner';

const questions = [
  {
    question: 'O que melhor descreve seu papel na empresa?',
    options: [
      { label: 'Eu fundei ou cofundei esta empresa', points: { owner: 3, manager: 0, employee: 0 } },
      { label: 'Eu lidero uma equipe ou departamento', points: { owner: 0, manager: 2, employee: 0 } },
      { label: 'Eu trabalho como parte de uma equipe', points: { owner: 0, manager: 0, employee: 2 } },
      { label: 'Sou freelancer ou prestador de serviço', points: { owner: 0, manager: 0, employee: 1 } },
    ],
  },
  {
    question: 'Você tem autoridade para contratar ou demitir funcionários?',
    options: [
      { label: 'Sim, eu tomo essas decisões', points: { owner: 2, manager: 0, employee: 0 } },
      { label: 'Posso recomendar, mas não decido sozinho', points: { owner: 0, manager: 1, employee: 0 } },
      { label: 'Não', points: { owner: 0, manager: 0, employee: 1 } },
    ],
  },
  {
    question: 'Você gerencia o trabalho ou desempenho de outras pessoas?',
    options: [
      { label: 'Sim, gerencio múltiplas equipes ou a empresa toda', points: { owner: 2, manager: 0, employee: 0 } },
      { label: 'Sim, gerencio uma equipe específica', points: { owner: 0, manager: 2, employee: 0 } },
      { label: 'Não, foco nas minhas próprias tarefas', points: { owner: 0, manager: 0, employee: 2 } },
    ],
  },
  {
    question: 'Você tem acesso a informações financeiras da empresa?',
    options: [
      { label: 'Sim, acesso total (receita, folha, orçamentos)', points: { owner: 2, manager: 0, employee: 0 } },
      { label: 'Apenas o orçamento do meu departamento', points: { owner: 0, manager: 1, employee: 0 } },
      { label: 'Não', points: { owner: 0, manager: 0, employee: 1 } },
    ],
  },
  {
    question: 'Para que você usará esta plataforma principalmente?',
    options: [
      { label: 'Supervisionar todo o negócio e todas as equipes', points: { owner: 2, manager: 0, employee: 0 } },
      { label: 'Gerenciar minha equipe e reportar à liderança', points: { owner: 0, manager: 2, employee: 0 } },
      { label: 'Acompanhar minhas tarefas e enviar meu trabalho', points: { owner: 0, manager: 0, employee: 2 } },
    ],
  },
];

type Scores = { owner: number; manager: number; employee: number };

function calculateRole(scores: Scores): AppRole {
  const { owner, manager, employee } = scores;
  if (owner > manager && owner > employee) return 'owner';
  if (manager > employee) return 'manager';
  if (employee > manager) return 'employee';
  // Ties
  if (owner === manager) return 'manager';
  return 'employee';
}

const roleInfo: Record<string, { label: string; desc: string; icon: typeof Shield }> = {
  owner: {
    label: 'Dono',
    desc: 'Acesso total ao sistema. Veja todos os dados, equipes, relatórios e configurações.',
    icon: Shield,
  },
  manager: {
    label: 'Gerente',
    desc: 'Gerencie sua equipe, veja relatórios de desempenho e métricas agregadas.',
    icon: Users,
  },
  employee: {
    label: 'Funcionário',
    desc: 'Acompanhe suas tarefas, veja seu desempenho e interaja com seu perfil.',
    icon: User,
  },
};

interface Props {
  onComplete: (role: AppRole) => void;
}

export function OnboardingQuiz({ onComplete }: Props) {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [result, setResult] = useState<AppRole | null>(null);
  const [saving, setSaving] = useState(false);
  const assignRole = useAssignRole();

  const progress = ((currentQ + 1) / questions.length) * 100;

  const handleNext = () => {
    if (selectedOption === null) return;
    const newAnswers = [...answers, selectedOption];
    setAnswers(newAnswers);
    setSelectedOption(null);

    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      // Calculate score
      const scores: Scores = { owner: 0, manager: 0, employee: 0 };
      newAnswers.forEach((optIdx, qIdx) => {
        const pts = questions[qIdx].options[optIdx].points;
        scores.owner += pts.owner;
        scores.manager += pts.manager;
        scores.employee += pts.employee;
      });
      setResult(calculateRole(scores));
    }
  };

  const handleBack = () => {
    if (currentQ > 0) {
      setCurrentQ(currentQ - 1);
      setSelectedOption(answers[currentQ - 1] ?? null);
      setAnswers(answers.slice(0, -1));
    }
  };

  const handleConfirm = async () => {
    if (!result) return;
    setSaving(true);
    try {
      await assignRole.mutateAsync(result);
      onComplete(result);
    } catch (err: any) {
      toast.error(err.message || 'Erro ao salvar perfil');
    } finally {
      setSaving(false);
    }
  };

  // Result screen
  if (result) {
    const info = roleInfo[result];
    const Icon = info.icon;
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="bg-card rounded-2xl border shadow-lg max-w-lg w-full p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center mx-auto mb-6">
            <Icon className="w-10 h-10 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground mb-2">Seu perfil foi identificado como</p>
          <h1 className="text-3xl font-bold text-foreground mb-3">{info.label}</h1>
          <p className="text-muted-foreground mb-8 max-w-sm mx-auto">{info.desc}</p>
          <button
            onClick={handleConfirm}
            disabled={saving}
            className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition flex items-center gap-2 mx-auto disabled:opacity-50"
          >
            {saving ? (
              <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                Continuar <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // Quiz screen
  const q = questions[currentQ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="bg-card rounded-2xl border shadow-lg max-w-lg w-full p-8">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span>Pergunta {currentQ + 1} de {questions.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Question */}
        <h2 className="text-lg font-bold text-foreground mb-6">{q.question}</h2>

        {/* Options */}
        <div className="space-y-3 mb-8">
          {q.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => setSelectedOption(i)}
              className={`w-full text-left px-4 py-3.5 rounded-xl border-2 transition-all text-sm font-medium ${
                selectedOption === i
                  ? 'border-primary bg-primary/5 text-foreground'
                  : 'border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  selectedOption === i ? 'border-primary bg-primary' : 'border-muted-foreground/30'
                }`}>
                  {selectedOption === i && <CheckCircle className="w-3 h-3 text-primary-foreground" />}
                </div>
                {opt.label}
              </div>
            </button>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          {currentQ > 0 && (
            <button
              onClick={handleBack}
              className="flex items-center gap-1 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground transition rounded-lg border border-border"
            >
              <ArrowLeft className="w-4 h-4" /> Voltar
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={selectedOption === null}
            className="flex-1 bg-primary text-primary-foreground py-3 rounded-lg font-semibold text-sm hover:bg-primary/90 transition flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {currentQ < questions.length - 1 ? 'Próxima' : 'Ver Resultado'}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
