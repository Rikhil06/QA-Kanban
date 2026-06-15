'use client';

import { clearToken, getToken } from '@/lib/auth';
import * as Sentry from '@sentry/nextjs';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface Subscription {
  plan: string;
  interval: string;
  status: string; // 'active' | 'canceling' | 'canceled' | 'past_due'
  trialEndsAt: string;
  currentPeriodEnd: string;
  stripePriceId: string;
  stripeSubscriptionId: string;
}

interface Team {
  id: string;
  name: string;
  plan: string;
  subscription?: Subscription;
}

interface User {
  id: string;
  name: string;
  email: string;
  teamId: string;
  team: Team;
  role: string;
  memberships?: [];
  emailVerified: boolean;
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
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/me`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!res.ok) throw new Error();
      const data = await res.json();
      setUser(data.user);

      // Tag every future Sentry event with the logged-in user
      Sentry.setUser({
        id: data.user.id,
        email: data.user.email,
        username: data.user.name,
      });
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearToken();
    setUser(null);
    // Clear Sentry user so post-logout errors aren't attributed to the old session
    Sentry.setUser(null);
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
