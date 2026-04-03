import { useAuth } from '@/contexts/AuthContext';
import { useProfile, useUpdateProfile } from '@/hooks/useProfile';
import { useUserRole } from '@/hooks/useUserRole';
import { OnboardingQuiz } from '@/components/OnboardingQuiz';
import RoleBlocked from '@/pages/RoleBlocked';
import { Loader2, AlertTriangle } from 'lucide-react';
import { lazy, Suspense, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { AppRole } from '@/hooks/useUserRole';

const OwnerDashboard = lazy(() => import('./OwnerDashboard'));
const ManagerDashboard = lazy(() => import('./ManagerDashboard'));
const EmployeeDashboard = lazy(() => import('./EmployeeDashboard'));
const FounderPortal = lazy(() => import('./FounderPortal'));

const LoadingScreen = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Carregando...</p>
    </div>
  </div>
);

export default function Portal() {
  const { user } = useAuth();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: legacyRole, isLoading: roleLoading } = useUserRole();
  const updateProfile = useUpdateProfile();
  const [quizBlocked, setQuizBlocked] = useState(false);
  const [quizDone, setQuizDone] = useState(false);

  const isLoading = profileLoading || roleLoading;
  if (isLoading) return <LoadingScreen />;

  // Determine role: profile.role takes priority, fallback to legacy user_roles
  const activeRole = profile?.role ?? legacyRole;

  // Quiz blocked: user scored manager/employee without invite
  if (quizBlocked && !activeRole) {
    return <RoleBlocked onRestartQuiz={() => setQuizBlocked(false)} />;
  }

  // No role yet → show quiz
  if (!activeRole && !quizDone) {
    return (
      <OnboardingQuiz
        onComplete={async (determinedRole: AppRole) => {
          if (determinedRole === 'manager' || determinedRole === 'employee') {
            // Block: these roles require invite
            setQuizBlocked(true);
            return;
          }

          // Owner flow: assign role + create company
          try {
            // Set role on profile
            await updateProfile.mutateAsync({ role: 'owner' });

            // Also insert into user_roles for backward compat
            await supabase
              .from('user_roles')
              .insert({ user_id: user!.id, role: 'owner' as any });

            setQuizDone(true);
          } catch (err: any) {
            toast.error(err.message || 'Erro ao salvar perfil');
          }
        }}
      />
    );
  }

  return (
    <Suspense fallback={<LoadingScreen />}>
      {activeRole === 'founder' ? (
        <FounderPortal />
      ) : activeRole === 'owner' ? (
        <OwnerDashboard />
      ) : activeRole === 'manager' ? (
        <ManagerDashboard />
      ) : activeRole === 'employee' ? (
        <EmployeeDashboard />
      ) : (
        <LoadingScreen />
      )}
    </Suspense>
  );
}
