import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Shield, BarChart3, Users, Zap, ArrowRight, Check, 
  ChevronRight, Star, TrendingUp, Activity, Brain,
  Building2, Heart, Clock
} from 'lucide-react';

export default function Landing() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/portal');
    }
  }, [user, loading, navigate]);

  if (loading) return null;

  return (
    <div className="min-h-screen bg-[hsl(207,90%,48%)] text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[hsl(207,90%,48%)]/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-white/20 rounded flex items-center justify-center">
              <span className="text-base font-bold text-white">R</span>
            </div>
            <span className="text-lg font-bold tracking-tight text-white">REGIAE</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-white/70">
            <a href="#features" className="hover:text-white transition-colors">Recursos</a>
            <a href="#pricing" className="hover:text-white transition-colors">Planos</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm text-white/70 hover:text-white transition-colors">
              Entrar
            </Link>
            <Link 
              to="/login" 
              className="bg-white text-[hsl(207,90%,48%)] text-sm font-medium px-4 py-2 rounded hover:bg-white/90 transition-colors"
            >
              Começar Agora
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 border border-white/20 rounded-full text-xs text-white font-medium mb-8">
            <Star className="w-3 h-3" />
            Plataforma #1 de Gestão de Pessoas para Saúde
          </div>
          <h1 className="text-4xl md:text-6xl font-black leading-[1.1] mb-6 text-white">
            Gerencie sua equipe<br />
            como um{' '}
            <span className="text-white/80">estrategista.</span>
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed">
            O Regiae transforma dados de RH em inteligência acionável. 
            Saiba quem está engajado, quem precisa de atenção e como otimizar seu time — 
            tudo em tempo real.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/login" 
              className="bg-white text-[hsl(207,90%,48%)] px-8 py-3.5 rounded-lg font-semibold text-sm hover:bg-white/90 transition-colors inline-flex items-center justify-center gap-2"
            >
              Começar Gratuitamente
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a 
              href="#features" 
              className="border border-white/30 text-white px-8 py-3.5 rounded-lg font-semibold text-sm hover:bg-white/10 transition-colors inline-flex items-center justify-center gap-2"
            >
              Ver Recursos
            </a>
          </div>
          <p className="text-xs text-white/50 mt-4">
            Sem cartão de crédito · Setup em 5 minutos · Suporte incluso
          </p>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-y border-border/50 bg-card/50">
        <div className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <StatItem value="500+" label="Colaboradores gerenciados" />
          <StatItem value="98%" label="Taxa de retenção" />
          <StatItem value="3x" label="Mais rápido que planilhas" />
          <StatItem value="24/7" label="Monitoramento contínuo" />
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Tudo que você precisa para{' '}
              <span className="text-primary">gerenciar pessoas</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Do quadro de pessoal ao pulse check, cada ferramenta foi pensada para gestores de clínicas e laboratórios.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard 
              icon={<Users className="w-5 h-5" />}
              title="Player Cards"
              description="Ficha completa de cada colaborador com OVR, moral, tier, contrato e histórico — estilo Football Manager."
            />
            <FeatureCard 
              icon={<Activity className="w-5 h-5" />}
              title="Pulse Check"
              description="Pesquisa semanal de engajamento. Saiba como sua equipe está se sentindo antes que vire problema."
            />
            <FeatureCard 
              icon={<TrendingUp className="w-5 h-5" />}
              title="People Analytics"
              description="Dashboards com métricas de desempenho, turnover, custo por colaborador e tendências."
            />
            <FeatureCard 
              icon={<Brain className="w-5 h-5" />}
              title="Alertas Inteligentes"
              description="IA identifica riscos de saída, contratos vencendo e quedas de moral automaticamente."
            />
            <FeatureCard 
              icon={<Building2 className="w-5 h-5" />}
              title="Multiunidade"
              description="Gerencie múltiplas clínicas e laboratórios em um único painel centralizado."
            />
            <FeatureCard 
              icon={<Shield className="w-5 h-5" />}
              title="Segurança Total"
              description="Dados criptografados, controle de acesso por função e conformidade com LGPD."
            />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6 bg-card/30 border-y border-border/50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Simples de começar
            </h2>
            <p className="text-muted-foreground">Três passos para transformar sua gestão de pessoas</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <StepCard step="01" title="Cadastre sua unidade" description="Adicione sua clínica ou laboratório e importe seus colaboradores." />
            <StepCard step="02" title="Revise os dados" description="Confirme as informações de cada membro da equipe no onboarding guiado." />
            <StepCard step="03" title="Gerencie com dados" description="Use o dashboard para tomar decisões baseadas em métricas reais." />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Planos que crescem com você
            </h2>
            <p className="text-muted-foreground">Comece grátis, escale quando precisar</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <PricingCard 
              name="Starter"
              price="Grátis"
              period=""
              description="Para quem está começando"
              features={[
                "1 unidade",
                "Até 20 colaboradores",
                "Player cards básicos",
                "Pulse check mensal",
              ]}
              cta="Começar Grátis"
              highlighted={false}
            />
            <PricingCard 
              name="Pro"
              price="R$ 149"
              period="/mês"
              description="Para gestores sérios"
              features={[
                "Até 5 unidades",
                "Colaboradores ilimitados",
                "People analytics completo",
                "Pulse check semanal",
                "Alertas inteligentes",
                "Suporte prioritário",
              ]}
              cta="Começar Teste Grátis"
              highlighted={true}
            />
            <PricingCard 
              name="Enterprise"
              price="Sob consulta"
              period=""
              description="Para redes e franquias"
              features={[
                "Unidades ilimitadas",
                "API de integração",
                "SSO corporativo",
                "Gerente de conta dedicado",
                "SLA customizado",
                "Onboarding assistido",
              ]}
              cta="Falar com Vendas"
              highlighted={false}
            />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 px-6 bg-card/30 border-y border-border/50">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Perguntas Frequentes</h2>
          </div>

          <div className="space-y-4">
            <FAQItem 
              question="O Regiae substitui meu sistema de RH?"
              answer="Não. O Regiae complementa seu sistema existente, focando em inteligência de gestão de pessoas — engajamento, performance e tomada de decisão estratégica."
            />
            <FAQItem 
              question="Preciso instalar algo?"
              answer="Não. O Regiae é 100% web, acessível de qualquer navegador. Basta criar sua conta e começar."
            />
            <FAQItem 
              question="Meus dados estão seguros?"
              answer="Sim. Usamos criptografia de ponta a ponta, servidores no Brasil e seguimos todas as diretrizes da LGPD."
            />
            <FAQItem 
              question="Posso cancelar a qualquer momento?"
              answer="Sim. Sem fidelidade, sem multa. Cancele quando quiser e seus dados ficam disponíveis por 30 dias."
            />
            <FAQItem 
              question="Vocês oferecem treinamento?"
              answer="Sim. Todos os planos incluem onboarding guiado. No plano Enterprise, oferecemos treinamento presencial para sua equipe."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Pronto para gerenciar como um estrategista?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            Junte-se a gestores que já transformaram sua forma de liderar equipes na saúde.
          </p>
          <Link 
            to="/login" 
            className="bg-primary text-primary-foreground px-8 py-3.5 rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
          >
            Criar Conta Gratuita
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-10 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-primary rounded flex items-center justify-center">
              <span className="text-xs font-bold text-primary-foreground">R</span>
            </div>
            <span className="text-sm font-bold tracking-tight">REGIAE</span>
          </div>
          <p className="text-xs text-muted-foreground">
            © 2026 Regiae · Todos os direitos reservados
          </p>
          <div className="flex gap-6 text-xs text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Termos</a>
            <a href="#" className="hover:text-foreground transition-colors">Privacidade</a>
            <a href="#" className="hover:text-foreground transition-colors">Contato</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* Sub-components */

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-2xl md:text-3xl font-black text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">{label}</p>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/30 transition-colors group">
      <div className="w-10 h-10 bg-primary/10 border border-primary/20 rounded-lg flex items-center justify-center text-primary mb-4 group-hover:bg-primary/20 transition-colors">
        {icon}
      </div>
      <h3 className="font-bold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

function StepCard({ step, title, description }: { step: string; title: string; description: string }) {
  return (
    <div className="text-center">
      <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center text-primary font-mono font-bold text-sm mx-auto mb-4">
        {step}
      </div>
      <h3 className="font-bold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function PricingCard({ name, price, period, description, features, cta, highlighted }: {
  name: string; price: string; period: string; description: string; features: string[]; cta: string; highlighted: boolean;
}) {
  return (
    <div className={`rounded-xl p-6 border ${highlighted ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : 'border-border bg-card'} flex flex-col`}>
      {highlighted && (
        <div className="text-[10px] font-bold uppercase tracking-widest text-primary mb-3">Mais Popular</div>
      )}
      <h3 className="font-bold text-lg text-foreground">{name}</h3>
      <p className="text-xs text-muted-foreground mb-4">{description}</p>
      <div className="mb-6">
        <span className="text-3xl font-black text-foreground">{price}</span>
        <span className="text-sm text-muted-foreground">{period}</span>
      </div>
      <ul className="space-y-2.5 mb-8 flex-1">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
            <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            {f}
          </li>
        ))}
      </ul>
      <Link
        to="/login"
        className={`w-full py-2.5 rounded-lg text-sm font-semibold text-center transition-colors ${
          highlighted 
            ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
            : 'border border-border text-foreground hover:bg-muted'
        }`}
      >
        {cta}
      </Link>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="group border border-border rounded-lg bg-card">
      <summary className="flex items-center justify-between cursor-pointer px-5 py-4 text-sm font-medium text-foreground">
        {question}
        <ChevronRight className="w-4 h-4 text-muted-foreground group-open:rotate-90 transition-transform" />
      </summary>
      <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed">
        {answer}
      </div>
    </details>
  );
}
