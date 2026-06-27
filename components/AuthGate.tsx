'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import { AnnotureLoader } from '@/components/AnnotureLoader';

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return <AnnotureLoader className="h-[calc(100vh-64px)]" size="lg" />;
  }

  if (!user) {
    return null; // prevents layout flashing
  }

  return <>{children}</>;
}