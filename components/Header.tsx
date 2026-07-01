'use client';

import { Bell, Check, ChevronDown, Menu, Users } from 'lucide-react';
import { useUser, TeamWithMembers } from '@/context/UserContext';
import { getInitials } from '@/utils/helpers';
import SearchBar from './search/Search';
import { useSidebar } from '@/context/SidebarContext';
import { useEffect, useRef, useState } from 'react';
import { getToken } from '@/lib/auth';
import dynamic from 'next/dynamic';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { AnnotureLoader } from '@/components/AnnotureLoader';

const Notifications = dynamic(
  () => import('./cards/Notifications').then((m) => ({ default: m.Notifications })),
  { ssr: false },
);

export default function Header() {
  const { user, loading, switchTeam } = useUser();
  const { toggle } = useSidebar();
  const [notifOpen, setNotifOpen] = useState(false);
  const [teamOpen, setTeamOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const teamRef = useRef<HTMLDivElement>(null);
  const token = getToken();

  // Share the same SWR key as Notifications.tsx so only one request fires
  const { data: notifData } = useSWR(
    token ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/notifications` : null,
    fetcher,
    { refreshInterval: 60000 },
  );
  const unreadCount = Array.isArray(notifData?.notifications)
    ? notifData.notifications.filter((n: { read: boolean }) => !n.read).length
    : 0;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
      if (teamRef.current && !teamRef.current.contains(e.target as Node)) {
        setTeamOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (loading)
    return <AnnotureLoader className="h-[calc(100vh-64px)]" size="md" />;

  return (
    <header className="flex-none h-16 bg-[#0A0A0A] border-b border-white/5 px-4 lg:px-8 flex items-center justify-between gap-3 lg:gap-6">
      {/* Mobile menu button */}
      <button
        className="lg:hidden p-2 rounded-lg hover:bg-white/4 transition-all shrink-0"
        onClick={toggle}
        aria-label="Toggle menu"
      >
        <Menu className="w-5 h-5 text-gray-400" />
      </button>
      {/* Search Bar */}
      <SearchBar />

      <div className="flex gap-3">
        {/* Workspace Switcher */}
        <div className="relative" ref={teamRef}>
          <button
            onClick={() => setTeamOpen((o) => !o)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/4 border border-white/8 hover:bg-white/6 transition-all"
          >
            <div className="w-5 h-5 rounded-md bg-linear-to-br from-purple-500 to-blue-500 flex items-center justify-center text-[10px] font-semibold text-white shrink-0">
              {getInitials(user?.team?.name ?? '')}
            </div>
            <span className="text-sm text-gray-300 max-w-[120px] truncate">{user?.team?.name}</span>
            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${teamOpen ? 'rotate-180' : ''}`} />
          </button>

          {teamOpen && (
            <div className="absolute top-full left-0 mt-2 w-64 bg-[#1C1C1C] border border-white/8 rounded-xl shadow-2xl z-50 overflow-hidden">
              <div className="px-3 pt-3 pb-2">
                <p className="text-[11px] text-white/30 uppercase tracking-wider font-medium">Your workspaces</p>
              </div>
              <div className="px-2 pb-2 space-y-0.5">
                {(user?.allTeams ?? []).map((team: TeamWithMembers) => {
                  const isActive = team.id === user?.teamId;
                  return (
                    <button
                      key={team.id}
                      onClick={() => {
                      switchTeam(team);
                      setTeamOpen(false);
                      window.location.href = window.location.pathname + window.location.search;
                    }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left ${
                        isActive ? 'bg-white/6' : 'hover:bg-white/4'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-linear-to-br from-purple-500 to-blue-500 flex items-center justify-center text-xs font-semibold text-white shrink-0">
                        {getInitials(team.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white/90 truncate">{team.name}</p>
                        <p className="text-xs text-white/30 capitalize">{team.plan ?? 'free'} plan · {team.members?.length ?? 0} member{(team.members?.length ?? 0) !== 1 ? 's' : ''}</p>
                      </div>
                      {isActive && <Check className="w-4 h-4 text-purple-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
              {(user?.allTeams?.length ?? 0) === 0 && (
                <div className="px-4 pb-4 flex flex-col items-center gap-2 text-center">
                  <Users className="w-6 h-6 text-white/20" />
                  <p className="text-xs text-white/30">No other workspaces</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen((o) => !o)}
            className="relative p-2 rounded-lg hover:bg-white/4 transition-all"
          >
            <Bell className="w-5 h-5 text-gray-400" />
            {unreadCount > 0 && (
              <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-[#0A0A0A]" />
            )}
          </button>

          {notifOpen && (
            <div className="absolute top-full right-0 mt-2 w-96 z-50 max-h-[480px] flex flex-col shadow-2xl rounded-xl overflow-hidden">
              <Notifications />
            </div>
          )}
        </div>

        {/* User Avatar */}
        <button className="flex items-center gap-2">
          <p className="w-8 h-8 rounded-full bg-linear-to-br from-pink-500 to-orange-500 flex items-center justify-center text-sm">
            {getInitials(user!.name)}
          </p>
        </button>
      </div>
    </header>
  );
}
