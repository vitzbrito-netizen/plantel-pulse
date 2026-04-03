import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { OnboardingQuiz } from '@/components/OnboardingQuiz';
import { Loader2 } from 'lucide-react';
import { lazy, Suspense, useState } from 'react';

const OwnerDashboard = lazy(() => import('./OwnerDashboard'));
const ManagerDashboard = lazy(() => import('./ManagerDashboard'));
const EmployeeDashboard = lazy(() => import('./EmployeeDashboard'));

// Founder portal (existing) — imported directly since founders bypass quiz
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
  const { data: role, isLoading } = useUserRole();
  const [quizCompleted, setQuizCompleted] = useState(false);

  if (isLoading) return <LoadingScreen />;

  // No role yet → show quiz
  if (!role && !quizCompleted) {
    return (
      <OnboardingQuiz
        onComplete={() => setQuizCompleted(true)}
      />
    );
  }

  const activeRole = role;

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
        // Fallback for just-completed quiz — refetch will kick in
        <LoadingScreen />
      )}
    </Suspense>
  );
}
