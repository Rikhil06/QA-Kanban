'use client';

import { clearToken, getToken } from '@/lib/auth';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface Subscription {
  plan: string;
  interval: string;
  status: string;
  trialEndsAt: string;
  currentPeriodEnd: string;
  stripePriceId: string;
  stripeSubscriptionId: string;
}

interface Team {
  id: string;
  name: string;
  plan: string; // you could also make this a Plan enum
  subscription?: Subscription; // use proper type if you know the subscription shape
}

interface User {
  id: string;
  name: string;
  email: string;
  teamId: string;
  team: Team;
  role: string;
  memberships?: [];
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  logout: () => void;
}

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  refreshUser: async () => {},
  logout: () => {},
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const token = getToken();
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      const res = await fetch(
        'https://qa-backend-105l.onrender.com/api/auth/me',
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!res.ok) throw new Error();
      const data = await res.json();
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 logout clears token + context immediately
  const logout = () => {
    clearToken();
    setUser(null);
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <UserContext.Provider
      value={{ user, loading, refreshUser: fetchUser, logout }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
