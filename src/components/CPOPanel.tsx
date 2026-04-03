import { Employee, getMoraleColor } from '@/data/employees';
import { X, AlertTriangle, Target, MessageCircle, Clock, CheckCircle2, ArrowRight } from 'lucide-react';

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
  if (emp.id === '12') {
    return {
      risk: 'CRÍTICO',
      riskClass: 'bg-urgente text-white',
      diagnosis: [
        'Moral em 45 — nível crítico. Risco real de perder o colaborador.',
        'Tensão ativa com colegas gera ambiente hostil no noturno.',
        'Contrato vence em breve — sem renovação, perde um profissional difícil de repor.',
      ],
      actions: [
        { step: 'Conversa individual urgente', timeline: 'Hoje', detail: 'Descubra o que está causando a insatisfação. Ouça antes de propor.' },
        { step: 'Mediação de conflito', timeline: '7 dias', detail: 'Reunião facilitada para resolver tensões.' },
        { step: 'Proposta de renovação', timeline: '14 dias', detail: 'Ofereça ajuste salarial e mude turno se possível.' },
      ],
      script: `"Quero conversar com você sobre como está sendo trabalhar aqui. Você é importante pra essa equipe e quero entender o que precisa mudar."`,
    };
  }

  if (emp.id === '9') {
    return {
      risk: 'ALTO',
      riskClass: 'bg-atencao text-black',
      diagnosis: [
        'Moral em 55 — em queda.',
        'Tensão com colegas contamina o turno noturno.',
        'Disciplina baixa — pode estar descumprindo protocolos.',
      ],
      actions: [
        { step: 'Ouvir o lado dele', timeline: '3 dias', detail: 'Entenda sua perspectiva sobre os conflitos.' },
        { step: 'Regras claras de convivência', timeline: '7 dias', detail: 'Documente expectativas e consequências.' },
        { step: 'Mentoria com líder', timeline: '14 dias', detail: 'Pareie com uma líder experiente.' },
      ],
      script: `"Quero conversar sobre como as coisas estão no noturno. Sem julgamento — só quero entender e melhorar juntos."`,
    };
  }

  if (emp.id === '2') {
    return {
      risk: 'URGENTE',
      riskClass: 'bg-urgente text-white',
      diagnosis: [
        'Contrato vence hoje! Se não renovar, perde o melhor profissional.',
        'Moral em 75 — estável mas falta reconhecimento.',
        'OVR 88 — substituição custaria meses.',
      ],
      actions: [
        { step: 'Renovação imediata', timeline: 'Hoje', detail: 'Proposta de 2 anos com ajuste de 10-15%.' },
        { step: 'Reconhecimento formal', timeline: '7 dias', detail: 'Crie título de Diretor Técnico.' },
        { step: 'Plano de autonomia', timeline: '30 dias', detail: 'Mais poder sobre protocolos técnicos.' },
      ],
      script: `"Dr. Ricardo, você é a espinha dorsal deste laboratório. Quero renovar seu contrato e discutir como valorizar ainda mais sua contribuição."`,
    };
  }

  const isLowMorale = emp.morale < 60;
  const hasTensions = emp.tensoes.length > 0;
  
  return {
    risk: isLowMorale ? 'MODERADO' : 'BAIXO',
    riskClass: isLowMorale ? 'bg-atencao text-black' : 'bg-morale-high text-white',
    diagnosis: [
      `OVR ${emp.ovr} — ${emp.ovr >= 80 ? 'desempenho excelente' : emp.ovr >= 70 ? 'desempenho sólido' : 'em desenvolvimento'}.`,
      `Moral em ${emp.morale} — ${emp.morale >= 80 ? 'motivado' : emp.morale >= 60 ? 'estável' : 'precisa de atenção'}.`,
      hasTensions ? `Tensão com ${emp.tensoes.join(', ')} — necessita mediação.` : `Sem conflitos ativos.`,
    ],
    actions: [
      { step: isLowMorale ? 'Conversa de apoio' : 'Feedback positivo', timeline: '7 dias', detail: isLowMorale ? 'Descubra a causa.' : 'Reconheça uma conquista.' },
      { step: 'Meta de desenvolvimento', timeline: '14 dias', detail: `Foque em ${emp.skills.comunicacao < emp.skills.tecnica ? 'comunicação' : 'técnica'}.` },
      { step: 'Check-in', timeline: '30 dias', detail: 'Meça progresso e ajuste.' },
    ],
    script: `"${emp.name.split(' ')[0]}, quero dedicar uns minutos pra conversar sobre como você está e o que posso fazer pra te apoiar."`,
  };
}

export function CPOPanel({ employee, onClose }: Props) {
  const advice = getCPOAdvice(employee);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="relative bg-card w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl rounded-xl border border-border"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-header border-b border-border p-5 flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            <span className={`font-mono font-bold text-4xl ${getOvrClass(employee.ovr)}`}>
              {employee.ovr}
            </span>
            <div>
              <p className="text-[10px] text-primary uppercase font-bold tracking-wider">O que fazer agora?</p>
              <h2 className="text-base font-bold">{employee.name}</h2>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs font-bold uppercase px-3 py-1.5 rounded-lg ${advice.riskClass}`}>
              {advice.risk}
            </span>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1.5 hover:bg-muted/30 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* Diagnosis — numbered, scannable */}
          <div className="fm-card rounded-lg p-4">
            <h3 className="flex items-center gap-2 text-xs font-bold uppercase text-muted-foreground mb-3">
              <AlertTriangle className="w-4 h-4 text-atencao" /> Diagnóstico
            </h3>
            <div className="space-y-2.5">
              {advice.diagnosis.map((d, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <span className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-sm text-muted-foreground leading-relaxed">{d}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Action Plan — step by step, McDonald's style */}
          <div className="fm-card rounded-lg p-4">
            <h3 className="flex items-center gap-2 text-xs font-bold uppercase text-muted-foreground mb-3">
              <Target className="w-4 h-4 text-primary" /> Faça Isso
            </h3>
            <div className="space-y-3">
              {advice.actions.map((a, i) => (
                <div key={i} className="bg-muted/20 rounded-lg p-3">
                  <div className="flex items-start justify-between gap-3 mb-1.5">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <p className="text-sm font-bold">{a.step}</p>
                    </div>
                    <span className="flex items-center gap-1 text-xs text-primary bg-primary/10 px-2 py-1 rounded-lg shrink-0 font-semibold">
                      <Clock className="w-3 h-3" /> {a.timeline}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground ml-9">{a.detail}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Script — copy-paste ready */}
          <div className="fm-card rounded-lg p-4">
            <h3 className="flex items-center gap-2 text-xs font-bold uppercase text-muted-foreground mb-3">
              <MessageCircle className="w-4 h-4 text-tier-influente" /> Fale Isso
            </h3>
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <p className="text-sm italic leading-relaxed text-foreground">{advice.script}</p>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">💡 Use esse texto como base para iniciar a conversa</p>
          </div>

          {/* Action button — big, obvious */}
          <button className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/80 text-primary-foreground py-3.5 rounded-lg text-sm font-bold transition-colors">
            <CheckCircle2 className="w-4 h-4" /> Entendido — Marcar como Lido
          </button>
        </div>
      </div>
    </div>
  );
}
