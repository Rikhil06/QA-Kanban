'use client';

import { clearToken, getToken } from '@/lib/auth';
import * as Sentry from '@sentry/nextjs';
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
  plan: string;
  subscription?: Subscription;
}

export interface TeamMember {
  role: string;
  user: { id: string; name: string; email: string };
}

export interface TeamWithMembers extends Team {
  members: TeamMember[];
}

interface User {
  id: string;
  name: string;
  email: string;
  teamId: string;
  team: Team;
  role: string;
  allTeams: TeamWithMembers[];
  memberships?: [];
  emailVerified: boolean;
  lastSeenNotificationsAt?: string | null;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  logout: () => void;
  switchTeam: (team: TeamWithMembers) => void;
  setLastSeenNotificationsAt: (iso: string) => void;
}

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
  refreshUser: async () => {},
  logout: () => {},
  setLastSeenNotificationsAt: () => {},
  switchTeam: () => {},
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

      const base = process.env.NEXT_PUBLIC_BACKEND_URL;

      const [meRes, teamsRes] = await Promise.all([
        fetch(`${base}/api/auth/me`, { credentials: 'include' }),
        fetch(`${base}/api/teams`, { credentials: 'include' }),
      ]);

      if (!meRes.ok) throw new Error();

      const { user: meData } = await meRes.json();
      const allTeams: TeamWithMembers[] = teamsRes.ok ? await teamsRes.json() : [];

      // Resolve active team — prefer localStorage preference if still valid
      const savedId = typeof window !== 'undefined' ? localStorage.getItem('activeTeamId') : null;
      const activeTeam =
        (savedId ? allTeams.find((t) => t.id === savedId) : null) ??
        allTeams.find((t) => t.id === meData.teamId) ??
        allTeams[0];

      const resolvedUser: User = {
        ...meData,
        teamId: activeTeam?.id ?? meData.teamId,
        team: activeTeam
          ? { id: activeTeam.id, name: activeTeam.name, plan: activeTeam.plan ?? meData.team?.plan ?? 'free', subscription: activeTeam.subscription ?? meData.team?.subscription }
          : meData.team,
        allTeams,
      };

      setUser(resolvedUser);

      Sentry.setUser({
        id: meData.id,
        email: meData.email,
        username: meData.name,
      });
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const switchTeam = (team: TeamWithMembers) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('activeTeamId', team.id);
    }
    setUser((prev) =>
      prev
        ? {
            ...prev,
            teamId: team.id,
            team: {
              id: team.id,
              name: team.name,
              plan: team.plan ?? prev.team?.plan ?? 'free',
              subscription: team.subscription ?? prev.team?.subscription,
            },
          }
        : null,
    );
  };

  const logout = () => {
    clearToken();
    if (typeof window !== 'undefined') localStorage.removeItem('activeTeamId');
    setUser(null);
    Sentry.setUser(null);
  };

  const setLastSeenNotificationsAt = (iso: string) => {
    setUser((prev) => (prev ? { ...prev, lastSeenNotificationsAt: iso } : null));
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, refreshUser: fetchUser, logout, switchTeam, setLastSeenNotificationsAt }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
