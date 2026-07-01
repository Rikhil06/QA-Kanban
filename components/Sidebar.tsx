'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import { useEffect, useState } from 'react';
import { useLogout } from '@/hooks/useLogout';
import { motion, AnimatePresence } from 'motion/react';
import { AnnotureLoader } from '@/components/AnnotureLoader';

import {
  IoHome,
  IoSearchOutline,
  IoLogOutOutline,
  IoLogInOutline,
} from 'react-icons/io5';
import { TbMessageReport } from 'react-icons/tb';
import { RiSettings3Line } from 'react-icons/ri';
import {
  MdKeyboardCommandKey,
  MdAccountCircle,
  MdManageAccounts,
} from 'react-icons/md';
import { FaChartPie } from 'react-icons/fa';
import { IoIosNotificationsOutline } from 'react-icons/io';
import { FiMessageSquare } from 'react-icons/fi';
import { CiShare1 } from 'react-icons/ci';

import { fetchSites } from '@/lib/fetchSites';
import { Site } from '@/types/types';
import { stripTLD } from '@/utils/stripTLD';
import { Capitalize } from '@/utils/helpers';
import { Bell, LayoutList, Users, X } from 'lucide-react';
import { useSidebar } from '@/context/SidebarContext';
import { fetchUsersForSite } from '@/lib/fetchUsers';

export default function Sidebar() {
  const pathname = usePathname();
  const { user, loading } = useUser();
  const logout = useLogout();

  const [sites, setSites] = useState<Site[]>([]);
  const [siteLoading, setSiteLoading] = useState<boolean>(true);
  const [users, setUsers] = useState<Site[]>([]);
  const [email, setEmail] = useState<string>('');
  const { isOpen, close } = useSidebar();
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] =
    useState<boolean>(false);
  const [openShareDropdown, setOpenShareDropdown] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const isReportsPage = pathname.startsWith('/reports/');
  const siteId = pathname?.split('/').pop();
  const activeSites = sites.filter((s) => s.siteStatus === 'active');
  const teamId = user?.teamId;

  useEffect(() => {
    if (!siteId || !isReportsPage) return;

    const fetchUsers = async () => {
      try {
        const data = await fetchUsersForSite(siteId);
        setUsers(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchUsers();
  }, [pathname]);

  useEffect(() => {
    if (!teamId) return;
    const getSites = async () => {
      const data = await fetchSites(teamId);
      setSites(data);
      setSiteLoading(false);
    };

    getSites();
  }, [teamId]);

  // if (siteLoading) return <p className="text-gray-500">Loading sites...</p>;
  // if (!sites.length) return <p className="text-gray-500">No sites found.</p>;

  if (loading)
    return <AnnotureLoader className="h-[calc(100vh-64px)]" size="sm" />;

  return (
    <aside className={`bg-[#0a0a0a] border-r border-white/5 h-full z-50 flex-none
      fixed inset-y-0 left-0 w-64 transform transition-transform duration-300 ease-in-out
      lg:relative lg:inset-auto lg:w-2/12 lg:translate-x-0
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <Link
        className="h-16 px-6 flex items-center justify-between border-b border-white/5"
        href="/"
        onClick={close}
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-linear-to-br from-purple-500 to-blue-500 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-square-check-big w-4 h-4 text-white"
              aria-hidden="true"
            >
              <path d="M21 10.656V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12.344"></path>
              <path d="m9 11 3 3L22 4"></path>
            </svg>
          </div>
          <span className="tracking-tight text-gray-100">Annoture</span>
        </div>
        <button
          className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-200 hover:bg-white/8"
          onClick={(e) => { e.preventDefault(); close(); }}
        >
          <X className="w-4 h-4" />
        </button>
      </Link>
      <div className="flex flex-col justify-between px-3 py-4 h-[calc(100%-64px)]">
        <div className="flex flex-col gap-1">
          <Link
            className={`flex items-center gap-3 w-full p-2 text-sm px-3 py-2 rounded-lg transition-all text-white shadow-lg ${pathname !== '/' ? 'hover:text-gray-200 hover:bg-white/4' : ''} ${pathname == '/' ? 'bg-white/8 text-white shadow-white/5' : ''} `}
            href="/"
            onClick={close}
          >
            <IoHome />
            <p className="text-md">Home</p>
          </Link>
          <span className="w-full h-px bg-[#3b3b3a] block my-1"></span>
          <div>
            <Link
              className={`flex items-center gap-3 w-full p-2 text-sm px-3 py-2 rounded-lg transition-all text-white shadow-lg ${pathname.startsWith('/reports') ? 'hover:text-gray-200 hover:bg-white/4' : ''} ${pathname.startsWith('/reports') ? 'bg-white/8 text-white shadow-white/5' : ''} `}
              href="/reports"
            >
              <TbMessageReport />
              <p className="text-md">Reports</p>
            </Link>
            <div>
              {activeSites.map((site) => (
                <Link
                  key={site.slug}
                  className={`flex items-center gap-2 p-2 ml-8 text-gray-100 text-sm rounded-xl transition-colors hover:bg-white/5 ${pathname === `/reports/${site.slug}` ? 'bg-[#3b3b3a]' : ''}`}
                  href={`/reports/${site.slug}`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://www.google.com/s2/favicons?domain=${site.site}&sz=32`}
                    alt=""
                    width={16}
                    height={16}
                    className="rounded-sm shrink-0"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                  <span className="truncate">{site.siteName || Capitalize(stripTLD(site.site))}</span>
                </Link>
              ))}
            </div>
            <Link
              className={`flex items-center gap-2 w-full p-2 text-gray-100 text-sm ${pathname == '/notifications' ? 'bg-[#3b3b3a] rounded-xl' : ''}`}
              href="/notifications"
            >
              <Bell size={15} />
              <p className="text-md">Notifications</p>
            </Link>
            <Link
              className={`flex items-center gap-2 w-full p-2 text-gray-100 text-sm ${pathname == '/my-tasks' ? 'bg-[#3b3b3a] rounded-xl' : ''}`}
              href="/my-tasks"
            >
              <LayoutList size={15} />
              <p className="text-md">My Tasks</p>
            </Link>
            {user?.teamId && (
              <Link
                className={`flex items-center gap-2 w-full p-2 text-gray-100 text-sm ${pathname == '/team' ? 'bg-[#3b3b3a] rounded-xl' : ''}`}
                href="/team"
              >
                <Users size={15} />
                <p className="text-md">Team</p>
              </Link>
            )}
          </div>
        </div>
        <div className="flex flex-col">
          <Link
            className={`flex items-center gap-2 w-full p-2 text-gray-100 text-sm ${pathname == '/usage-billing' ? 'bg-[#3b3b3a] rounded-lg' : ''}`}
            href="/usage-billing"
          >
            <FaChartPie />
            <p className="text-md">Usage & Billing</p>
          </Link>
          <Link
            className={`flex items-center gap-2 w-full p-2 text-gray-100 text-sm ${pathname == '/settings' ? 'bg-[#3b3b3a] rounded-xl' : ''}`}
            href="/settings"
          >
            <RiSettings3Line />
            <p className="text-md">Settings</p>
          </Link>
          <span className="h-px bg-[#3b3b3a] block -ml-5 w-[calc(100%+36px)] mt-3 mb-2"></span>
          <div className="flex justify-between items-center">
            {user ? (
              <div className="relative">
                <button
                  className="flex items-center gap-2 w-full p-2 text-gray-100 text-sm cursor-pointer"
                  onClick={() => setIsAccountDropdownOpen((prev) => !prev)}
                >
                  <MdAccountCircle />
                  <p className="text-md">
                    {user.name.split(' ').slice(0, -1).join(' ')}
                  </p>
                </button>
                <AnimatePresence initial={false}>
                  {isAccountDropdownOpen && (
                    <motion.div
                      key="accountDropdown"
                      initial={{ y: 100, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: 100, opacity: 0 }}
                      transition={{
                        type: 'spring',
                        stiffness: 260,
                        damping: 22,
                      }}
                      className="absolute -top-30 bg-[#3b3b3a] w-[200px] p-2.5 z-10 rounded-lg"
                    >
                      <Link
                        className="flex items-center gap-2 w-full p-2 px-4 text-gray-100 text-sm bg-[#303030] rounded-lg cursor-pointer mb-2"
                        href="/settings/account"
                      >
                        <MdManageAccounts />
                        Account Settings
                      </Link>
                      <button
                        className="flex items-center gap-2 w-full p-2 px-4 text-gray-100 text-sm bg-[#303030] rounded-lg cursor-pointer"
                        onClick={() => (
                          logout(),
                          setIsAccountDropdownOpen(false)
                        )}
                      >
                        <IoLogOutOutline />
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                className="flex items-center gap-2 w-full p-2 text-gray-100 text-sm"
                href="/login"
              >
                <IoLogInOutline />
                Login
              </Link>
            )}
            <div className="text-gray-100 flex items-center gap-2">
              <RiSettings3Line />
              <FiMessageSquare />
              <IoIosNotificationsOutline />
            </div>
          </div>
          <div className="flex items-center gap-3 px-2 mt-3">
            <a href="https://annoture.com/terms" target="_blank" rel="noopener noreferrer" className="text-white/25 text-[10px] hover:text-white/50 transition-colors">Terms</a>
            <span className="text-white/15 text-[10px]">·</span>
            <a href="https://annoture.com/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-white/25 text-[10px] hover:text-white/50 transition-colors">Privacy</a>
            <span className="text-white/15 text-[10px]">·</span>
            <a href="https://annoture.com/cookies" target="_blank" rel="noopener noreferrer" className="text-white/25 text-[10px] hover:text-white/50 transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </aside>
  );
}
