import { useState } from 'react';
import { employees, daysUntilExpiry, isContractExpiring } from '@/data/employees';
import { Bell, Clock, Heart, Flame, Zap, TrendingUp, Trophy, CheckCircle2 } from 'lucide-react';

interface NewsItem {
  id: string;
  category: 'contrato' | 'moral' | 'fuga' | 'tensão' | 'performance' | 'destaque';
  title: string;
  description: string;
  date: string;
  read: boolean;
}

const categoryConfig: Record<string, { color: string; borderColor: string; icon: React.ReactNode; label: string }> = {
  contrato: { color: 'bg-atencao/10 text-atencao', borderColor: 'border-atencao', icon: <Clock className="w-3 h-3" />, label: 'Contrato' },
  moral: { color: 'bg-urgente/10 text-urgente', borderColor: 'border-urgente', icon: <Heart className="w-3 h-3" />, label: 'Moral' },
  fuga: { color: 'bg-urgente/10 text-urgente', borderColor: 'border-urgente', icon: <Flame className="w-3 h-3" />, label: 'Risco' },
  tensão: { color: 'bg-atencao/10 text-atencao', borderColor: 'border-atencao', icon: <Zap className="w-3 h-3" />, label: 'Tensão' },
  performance: { color: 'bg-tier-influente/10 text-tier-influente', borderColor: 'border-tier-influente', icon: <TrendingUp className="w-3 h-3" />, label: 'Performance' },
  destaque: { color: 'bg-tier-lider/10 text-tier-lider', borderColor: 'border-tier-lider', icon: <Trophy className="w-3 h-3" />, label: 'Destaque' },
};

function generateNews(): NewsItem[] {
  const news: NewsItem[] = [];

  employees.filter(e => e.flightRisk).forEach(e => {
    news.push({
      id: `fr-${e.id}`, category: 'fuga',
      title: `Risco de fuga detectado: ${e.name}`,
      description: `Moral em ${e.morale} e contrato vencendo em ${daysUntilExpiry(e.contractEnd)} dias. Ação imediata recomendada.`,
      date: '2026-03-31', read: false,
    });
  });

  employees.filter(e => isContractExpiring(e.contractEnd, 90) && !e.flightRisk).forEach(e => {
    const days = daysUntilExpiry(e.contractEnd);
    news.push({
      id: `c-${e.id}`, category: 'contrato',
      title: `Contrato de ${e.name} ${days <= 0 ? 'venceu hoje' : `vence em ${days} dias`}`,
      description: `${e.role}. Avalie renovação ou substituição. OVR ${e.ovr}.`,
      date: '2026-03-31', read: days > 30,
    });
  });

  employees.filter(e => e.morale < 60 && !e.flightRisk).forEach(e => {
    news.push({
      id: `m-${e.id}`, category: 'moral',
      title: `Queda de moral: ${e.name}`,
      description: `Moral caiu para ${e.morale}. Recomenda-se conversa individual.`,
      date: '2026-03-30', read: false,
    });
  });

  employees.filter(e => e.tensoes.length > 0).forEach(e => {
    news.push({
      id: `t-${e.id}`, category: 'tensão',
      title: `Tensão detectada: ${e.name}`,
      description: `Conflito com ${e.tensoes.join(', ')}. Mediação necessária.`,
      date: '2026-03-29', read: true,
    });
  });

  news.push({
    id: 'eom', category: 'destaque',
    title: 'Colaboradora do Mês: Adilene Dias de Souza',
    description: 'Adilene foi destaque do mês com moral excelente e dedicação na coleta de RN.',
    date: '2026-03-28', read: true,
  });

  news.push({
    id: 'perf-1', category: 'performance',
    title: 'Melhoria de performance: Gabriel Torres',
    description: 'OVR subiu de 60 para 64 no último mês. Promessa em evolução.',
    date: '2026-03-27', read: true,
  });

  return news;
}

export function NoticiasTab() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>(generateNews);
  const unreadCount = newsItems.filter(n => !n.read).length;

  const markRead = (id: string) => {
    setNewsItems(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = () => {
    setNewsItems(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-primary" />
          <h2 className="text-[10px] font-semibold uppercase text-muted-foreground">Caixa de Entrada</h2>
          {unreadCount > 0 && (
            <span className="bg-urgente text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">{unreadCount}</span>
          )}
        </div>
        {unreadCount > 0 && (
          <button 
            onClick={markAllRead}
            className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            <CheckCircle2 className="w-3 h-3" /> Marcar todas como lidas
          </button>
        )}
      </div>

      {/* News list */}
      <div className="space-y-1">
        {newsItems.map(item => {
          const config = categoryConfig[item.category];
          return (
            <div
              key={item.id}
              onClick={() => markRead(item.id)}
              className={`fm-card rounded p-3 cursor-pointer transition-all border-l-2 ${
                !item.read 
                  ? `${config.borderColor} bg-card` 
                  : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Unread indicator */}
                <div className="pt-1">
                  {!item.read ? (
                    <span className="w-2 h-2 rounded-full bg-primary block" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-transparent block" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded ${config.color}`}>
                      {config.icon} {config.label}
                    </span>
                    <span className="text-[9px] text-muted-foreground">
                      {new Date(item.date).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <h3 className="text-xs font-semibold mb-0.5 truncate">{item.title}</h3>
                  <p className="text-[10px] text-muted-foreground line-clamp-2">{item.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
