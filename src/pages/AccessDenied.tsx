import { Link } from 'react-router-dom';
import { ShieldX, ArrowLeft } from 'lucide-react';

export default function AccessDenied() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="text-center max-w-sm">
        <ShieldX className="w-16 h-16 text-destructive mx-auto mb-4" />
        <h2 className="text-xl font-bold text-foreground mb-2">Acesso negado</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Sua conta não tem permissão para acessar esta área.
        </p>
        <div className="flex flex-col gap-3">
          <Link
            to="/portal"
            className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            Ir para meu painel
          </Link>
          <Link
            to="/"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1 justify-center"
          >
            <ArrowLeft className="w-3 h-3" /> Voltar para o site
          </Link>
        </div>
      </div>
    </div>
  );
}
