'use client';

import { Bell, ChevronDown } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { getInitials } from '@/utils/helpers';
import SearchBar from './search/Search';

export default function Header() {
  const { user, loading } = useUser();

  if (loading) return null;
  return (
    <header className="flex-none h-16 bg-[#0A0A0A] border-b border-white/5 px-8 flex items-center justify-between gap-6">
      {/* Search Bar */}
      <SearchBar />
      
      <div className='flex gap-3'>
        {/* Workspace Switcher */}
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/4 border border-white/8 hover:bg-white/6 transition-all">
          <span className="text-sm text-gray-300">{user?.team.name}</span>
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </button>
      
        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-white/4 transition-all">
          <Bell className="w-5 h-5 text-gray-400" />
          <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-[#0A0A0A]"></div>
        </button>
      
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
