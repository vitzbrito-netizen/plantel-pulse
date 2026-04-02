import { Employee, getMoraleColor } from '@/data/employees';
import { X, AlertTriangle, Target, MessageCircle, Clock, CheckCircle2 } from 'lucide-react';

interface Props {
  employee: Employee;
  onClose: () => void;
}

function getOvrClass(ovr: number): string {
  if (ovr >= 80) return 'ovr-high';
  if (ovr >= 65) return 'ovr-mid';
  return 'ovr-low';
}

function getCPOAdvice(emp: Employee) {
  // Colaborador 12 - Flight Risk
  if (emp.id === '12') {
    return {
      risk: 'CRÍTICO',
      riskClass: 'bg-urgente text-white',
      diagnosis: [
        'Moral em 45 — nível crítico. Colaborador 12 está com moral crítica (45) e contrato vencendo em 90 dias.',
        'Tensão ativa com Gustavo Barbosa e Felipe Cardoso gera ambiente hostil no noturno.',
        'Contrato vence em Jun/2025 — sem renovação, você perde um parasitologista difícil de repor.',
      ],
      actions: [
        { step: 'Conversa individual urgente esta semana', timeline: 'Hoje', detail: 'Descubra o que está causando a insatisfação. Ouça antes de propor.' },
        { step: 'Mediação de conflito com Gustavo e Felipe', timeline: '7 dias', detail: 'Reunião facilitada para resolver tensões antes que vire pedido de demissão.' },
        { step: 'Proposta de renovação com ajuste salarial', timeline: '14 dias', detail: 'Ofereça R$5.500-5.800 e mude para turno diurno se possível.' },
      ],
      script: `"Quero conversar com você sobre como está sendo trabalhar aqui ultimamente. Você é importante pra essa equipe e quero entender o que precisa mudar pra você se sentir bem aqui."`,
    };
  }

  // Gustavo Barbosa - Tensions
  if (emp.id === '9') {
    return {
      risk: 'ALTO',
      riskClass: 'bg-atencao text-black',
      diagnosis: [
        'Moral em 55 — em queda. Gustavo está no limite entre desengajamento e conflito ativo.',
        'Tensão com Juliana e Felipe contamina o turno noturno inteiro.',
        'Disciplina em 68 indica que pode estar chegando atrasado ou descumprindo protocolos.',
      ],
      actions: [
        { step: 'Conversa individual para ouvir seu lado', timeline: '3 dias', detail: 'Entenda a perspectiva dele sobre os conflitos.' },
        { step: 'Definir regras claras de convivência no noturno', timeline: '7 dias', detail: 'Documente expectativas e consequências.' },
        { step: 'Mentoria com Ana Paula ou Carla', timeline: '14 dias', detail: 'Pareie ele com uma líder para apoio e exemplo.' },
      ],
      script: `"Gustavo, quero conversar sobre como as coisas estão no noturno. Sem julgamento — só quero entender como você está se sentindo e o que podemos melhorar juntos."`,
    };
  }

  // Dr. Ricardo - Contract expiring today
  if (emp.id === '2') {
    return {
      risk: 'URGENTE',
      riskClass: 'bg-urgente text-white',
      diagnosis: [
        'Contrato vence HOJE. Se não renovar, perde o bioquímico mais qualificado da equipe.',
        'Moral em 75 — não está insatisfeito mas também não está engajado. Falta reconhecimento.',
        'OVR 88 — melhor profissional do laboratório. Substituição custaria meses.',
      ],
      actions: [
        { step: 'Renovação imediata — HOJE', timeline: 'Hoje', detail: 'Prepare proposta de 2 anos com ajuste de 10-15%.' },
        { step: 'Reconhecimento formal da liderança técnica', timeline: '7 dias', detail: 'Crie título de Diretor Técnico ou equivalente.' },
        { step: 'Plano de desenvolvimento com autonomia', timeline: '30 dias', detail: 'Dê mais poder de decisão sobre protocolos técnicos.' },
      ],
      script: `"Dr. Ricardo, antes de qualquer coisa: você é a espinha dorsal técnica deste laboratório. Quero renovar seu contrato e também discutir como posso valorizar ainda mais sua contribuição. Que tal conversarmos sobre o próximo capítulo?"`,
    };
  }

  // Generic advice
  const isLowMorale = emp.morale < 60;
  const hasTensions = emp.tensoes.length > 0;
  
  return {
    risk: isLowMorale ? 'MODERADO' : 'BAIXO',
    riskClass: isLowMorale ? 'bg-atencao text-black' : 'bg-morale-high text-white',
    diagnosis: [
      `OVR ${emp.ovr} — ${emp.ovr >= 80 ? 'desempenho excelente, valorize' : emp.ovr >= 70 ? 'desempenho sólido, desenvolva' : 'em desenvolvimento, invista em treinamento'}.`,
      `Moral em ${emp.morale} — ${emp.morale >= 80 ? 'motivado e engajado' : emp.morale >= 60 ? 'estável mas monitore' : 'precisa de atenção urgente'}.`,
      hasTensions ? `Tensão com ${emp.tensoes.join(', ')} — necessita mediação.` : `Sem conflitos ativos. Bom relacionamento com a equipe.`,
    ],
    actions: [
      { step: isLowMorale ? 'Conversa de apoio individual' : 'Feedback positivo', timeline: '7 dias', detail: isLowMorale ? 'Descubra a causa da desmotivação.' : 'Reconheça publicamente uma conquista recente.' },
      { step: 'Definir meta de desenvolvimento', timeline: '14 dias', detail: `Foque em ${emp.skills.comunicacao < emp.skills.tecnica ? 'comunicação' : 'habilidades técnicas'}.` },
      { step: 'Check-in de acompanhamento', timeline: '30 dias', detail: 'Meça progresso e ajuste o plano.' },
    ],
    script: `"${emp.name.split(' ')[0]}, quero dedicar uns minutos pra conversar sobre como você está se sentindo no trabalho e o que posso fazer pra te apoiar melhor."`,
  };
}

export function CPOPanel({ employee, onClose }: Props) {
  const advice = getCPOAdvice(employee);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="relative bg-card w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl rounded border border-border"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-header border-b border-border p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={`font-mono font-bold text-3xl ${getOvrClass(employee.ovr)}`}>
              {employee.ovr}
            </span>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-semibold">CPO - Chief People Officer</p>
              <h2 className="text-sm font-bold">{employee.name}</h2>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${advice.riskClass}`}>
              {advice.risk}
            </span>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Diagnosis */}
          <div className="fm-card rounded p-3">
            <h3 className="flex items-center gap-1.5 text-[10px] font-semibold uppercase text-muted-foreground mb-3">
              <AlertTriangle className="w-3 h-3 text-atencao" /> Diagnóstico
            </h3>
            <div className="space-y-2">
              {advice.diagnosis.map((d, i) => (
                <div key={i} className="flex gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground mt-1.5 shrink-0" />
                  <p className="text-xs text-muted-foreground leading-relaxed">{d}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Action Plan */}
          <div className="fm-card rounded p-3">
            <h3 className="flex items-center gap-1.5 text-[10px] font-semibold uppercase text-muted-foreground mb-3">
              <Target className="w-3 h-3 text-primary" /> Plano de Ação
            </h3>
            <div className="space-y-2">
              {advice.actions.map((a, i) => (
                <div key={i} className="bg-muted/20 rounded p-2.5">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded bg-primary/20 text-primary text-[10px] font-bold flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <p className="text-xs font-semibold">{a.step}</p>
                    </div>
                    <span className="flex items-center gap-1 text-[9px] text-primary bg-primary/10 px-1.5 py-0.5 rounded shrink-0">
                      <Clock className="w-2.5 h-2.5" /> {a.timeline}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground ml-7">{a.detail}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Script */}
          <div className="fm-card rounded p-3">
            <h3 className="flex items-center gap-1.5 text-[10px] font-semibold uppercase text-muted-foreground mb-3">
              <MessageCircle className="w-3 h-3 text-tier-influente" /> Script da Conversa
            </h3>
            <div className="bg-primary/5 border border-primary/20 rounded p-3">
              <p className="text-xs italic leading-relaxed text-foreground">{advice.script}</p>
            </div>
          </div>

          {/* Action button */}
          <button className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/80 text-primary-foreground py-2.5 rounded text-xs font-semibold transition-colors">
            <CheckCircle2 className="w-3.5 h-3.5" /> Marcar como Resolvido
          </button>
        </div>
      </div>
    </div>
  );
}
