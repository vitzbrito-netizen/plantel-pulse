import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, UserPlus, ArrowLeft, AlertTriangle, Clock, CheckCircle2, Loader2 } from 'lucide-react';

interface InviteData {
  id: string;
  token: string;
  email: string;
  role: string;
  company_id: string;
  used: boolean;
  expires_at: string;
}

const roleLabels: Record<string, string> = {
  manager: 'Gerente',
  employee: 'Funcionário',
  owner: 'Dono',
};

export default function InviteSignup() {
  const { token } = useParams<{ token: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [invite, setInvite] = useState<InviteData | null>(null);
  const [status, setStatus] = useState<'loading' | 'valid' | 'invalid' | 'used' | 'expired'>('loading');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (authLoading) return;
    if (user) {
      navigate('/portal');
      return;
    }
    if (!token) {
      setStatus('invalid');
      return;
    }

    (async () => {
      const { data, error } = await supabase
        .from('invites')
        .select('*')
        .eq('token', token)
        .maybeSingle();

      if (error || !data) {
        setStatus('invalid');
        return;
      }

      const inv = data as any as InviteData;
      if (inv.used) {
        setStatus('used');
        return;
      }
      if (new Date(inv.expires_at) < new Date()) {
        setStatus('expired');
        return;
      }

      setInvite(inv);
      setStatus('valid');
    })();
  }, [token, authLoading, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invite) return;
    setError('');
    setSubmitting(true);

    try {
      // 1. Create auth user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: invite.email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: { full_name: fullName },
        },
      });
      if (signUpError) throw signUpError;

      const newUserId = authData.user?.id;
      if (!newUserId) throw new Error('Erro ao criar usuário');

      // 2. Update profile with role and company_id
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          role: invite.role as any,
          company_id: invite.company_id,
          full_name: fullName,
        })
        .eq('user_id', newUserId);
      if (profileError) throw profileError;

      // 3. Insert into user_roles for backward compat
      await supabase
        .from('user_roles')
        .insert({ user_id: newUserId, role: invite.role as any });

      // 4. Mark invite as used
      await supabase
        .from('invites')
        .update({ used: true, used_by: newUserId } as any)
        .eq('id', invite.id);

      setSuccess('Conta criada! Verifique seu e-mail para confirmar.');
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || status === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (status === 'invalid') {
    return (
      <ErrorScreen
        icon={<AlertTriangle className="w-12 h-12 text-destructive" />}
        title="Link inválido"
        description="Este link de convite não existe ou é inválido."
      />
    );
  }

  if (status === 'used') {
    return (
      <ErrorScreen
        icon={<CheckCircle2 className="w-12 h-12 text-muted-foreground" />}
        title="Convite já utilizado"
        description="Este convite já foi usado. Se você já tem conta, faça login."
        showLogin
      />
    );
  }

  if (status === 'expired') {
    return (
      <ErrorScreen
        icon={<Clock className="w-12 h-12 text-muted-foreground" />}
        title="Convite expirado"
        description="Este link de convite expirou. Solicite um novo convite ao responsável da sua empresa."
      />
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="w-full max-w-sm">
        <Link to="/" className="flex items-center gap-3 mb-8 justify-center">
          <div className="w-10 h-10 bg-primary rounded flex items-center justify-center">
            <span className="text-lg font-bold text-primary-foreground">R</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">REGIAE</h1>
        </Link>

        {/* Invite banner */}
        <div className="bg-primary/10 border border-primary/20 rounded-lg px-4 py-3 mb-6 text-center">
          <p className="text-sm text-foreground font-medium">
            Você foi convidado para entrar como{' '}
            <span className="text-primary font-bold">{roleLabels[invite?.role ?? ''] ?? invite?.role}</span>
          </p>
          <p className="text-xs text-muted-foreground mt-1">{invite?.email}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Nome completo</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="mt-1 w-full px-3 py-2.5 bg-card border border-border rounded text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-colors"
              placeholder="Seu nome completo"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Senha</label>
            <div className="relative mt-1">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-3 py-2.5 bg-card border border-border rounded text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-colors pr-10"
                placeholder="Mínimo 6 caracteres"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded px-3 py-2">
              {error}
            </div>
          )}

          {success && (
            <div className="text-xs text-morale-high bg-morale-high/10 border border-morale-high/20 rounded px-3 py-2">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {submitting ? (
              <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                Criar Conta
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1">
            <ArrowLeft className="w-3 h-3" />
            Voltar para o site
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorScreen({ icon, title, description, showLogin }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  showLogin?: boolean;
}) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="text-center max-w-sm">
        <div className="mx-auto mb-4">{icon}</div>
        <h2 className="text-lg font-bold text-foreground mb-2">{title}</h2>
        <p className="text-sm text-muted-foreground mb-6">{description}</p>
        <div className="flex flex-col gap-2">
          {showLogin && (
            <Link to="/login" className="text-sm text-primary font-medium hover:underline">
              Fazer login
            </Link>
          )}
          <Link to="/" className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 justify-center">
            <ArrowLeft className="w-3 h-3" /> Voltar para o site
          </Link>
        </div>
      </div>
    </div>
  );
}
