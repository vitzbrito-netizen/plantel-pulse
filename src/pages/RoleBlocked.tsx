import { Link } from 'react-router-dom';
import { Info, Link2, Building2 } from 'lucide-react';

interface Props {
  onRestartQuiz: () => void;
}

export default function RoleBlocked({ onRestartQuiz }: Props) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="bg-card rounded-2xl border shadow-lg max-w-md w-full p-8 text-center">
        <div className="w-16 h-16 bg-primary/10 border-2 border-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Info className="w-8 h-8 text-primary" />
        </div>

        <h2 className="text-lg font-bold text-foreground mb-3">Acesso por convite</h2>
        <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
          Para entrar como Gerente ou Funcionário, você precisa de um link de convite
          enviado pelo responsável da sua empresa.
        </p>

        <div className="space-y-3">
          <Link
            to="/invite"
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Link2 className="w-4 h-4" />
            Tenho um link de convite
          </Link>

          <button
            onClick={onRestartQuiz}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-border text-foreground text-sm font-semibold rounded-lg hover:bg-muted transition-colors"
          >
            <Building2 className="w-4 h-4" />
            Sou o dono de uma empresa
          </button>
        </div>
      </div>
    </div>
  );
}
