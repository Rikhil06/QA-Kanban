'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import { AnnotureLoader } from '@/components/AnnotureLoader';

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    if (!user.teamId) {
      router.replace('/onboarding/team');
    }
  }, [user, loading, router]);

  if (loading) {
    return <AnnotureLoader className="h-[calc(100vh-64px)]" size="lg" />;
  }

  if (!user || !user.teamId) {
    return null;
  }

  return <>{children}</>;
}