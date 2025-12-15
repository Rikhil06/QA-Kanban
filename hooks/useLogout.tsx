'use client';

import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';

export function useLogout() {
  const router = useRouter();
  const { logout } = useUser();

  return () => {
    logout();           // clears context + token
    router.push('/login');
  };
}
