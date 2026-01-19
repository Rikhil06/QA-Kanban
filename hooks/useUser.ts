import { useEffect, useState, useMemo } from 'react';
import { getToken } from '@/lib/auth';

export const useUser = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    fetch('https://qa-backend-105l.onrender.com /api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data?.user) setUser(data.user);
        setLoading(false);
      });
  }, []);


return useMemo(() => ({ user, loading }), [user, loading]);
};
