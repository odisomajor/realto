'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requiredRole?: string;
  redirectTo?: string;
}

export default function ProtectedRoute({ 
  children, 
  requireAuth = true, 
  requiredRole,
  redirectTo = '/auth/login'
}: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, user, isLoading, hasHydrated } = useAuth();

  useEffect(() => {
    // Don't redirect until hydration is complete
    if (!hasHydrated || isLoading) return;

    if (requireAuth && !isAuthenticated) {
      router.push(redirectTo);
      return;
    }

    if (requiredRole && user?.role !== requiredRole) {
      router.push('/dashboard');
      return;
    }
  }, [isAuthenticated, user, isLoading, hasHydrated, requireAuth, requiredRole, redirectTo, router]);

  // Show loading state during hydration or auth loading
  if (!hasHydrated || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  // Show loading state while redirecting
  if (requireAuth && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (requiredRole && user?.role !== requiredRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return <>{children}</>;
}
