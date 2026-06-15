'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import { useEffect, useState } from 'react';
import { useLogout } from '@/hooks/useLogout';
import { motion, AnimatePresence } from 'motion/react';

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
import { getToken } from '@/lib/auth';
import { stripTLD } from '@/utils/stripTLD';
import { Capitalize } from '@/utils/helpers';
import { Bell, LayoutList, Users, X } from 'lucide-react';
import { useSidebar } from '@/context/SidebarContext';
import { fetchUsersForSite } from '@/lib/fetchUsers';

export default function Sidebar() {
  const pathname = usePathname();
  const { user, loading } = useUser();
  const logout = useLogout();
  const token = getToken();

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
    const getSites = async () => {
      const data = await fetchSites(token);
      setSites(data);
      setSiteLoading(false);
    };

    getSites();
  }, []);

  // if (siteLoading) return <p className="text-gray-500">Loading sites...</p>;
  // if (!sites.length) return <p className="text-gray-500">No sites found.</p>;

  if (loading)
    return (
      <div
        className="flex items-center justify-center w-full h-[calc(100vh-64px)]"
        role="status"
      >
        <svg
          aria-hidden="true"
          className="inline w-8 h-8 text-neutral-tertiary animate-spin fill-purple-500"
          viewBox="0 0 100 101"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
            fill="currentColor"
          />
          <path
            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
            fill="currentFill"
          />
        </svg>
        <span className="sr-only">Loading...</span>
      </div>
    );

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
                  className={`flex items-center justify-between gap-2 p-2 ml-8 text-gray-100 text-sm ${pathname.includes(`reports/${site.slug}`) ? 'bg-[#3b3b3a] rounded-xl mt-2' : ''}`}
                  href={`/reports/${site.slug}`}
                >
                  {Capitalize(stripTLD(site.site))}
                  <CiShare1 />
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
