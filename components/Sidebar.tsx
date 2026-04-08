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
  IoShareOutline,
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
import { toast, ToastContainer } from 'react-toastify';

import { fetchSites } from '@/lib/fetchSites';
import { Site } from '@/types/types';
import { getToken } from '@/lib/auth';
import slugify from 'slugify';
import { stripTLD } from '@/utils/stripTLD';
import { Capitalize } from '@/utils/helpers';
import { useHotkey } from '@/hooks/useHotkey';
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
  const [isInviting, setIsInviting] = useState<boolean>(false);
  const { isOpen, close } = useSidebar();
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] =
    useState<boolean>(false);
  const [openShareDropdown, setOpenShareDropdown] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const isReportsPage = pathname.startsWith('/reports/');
  const siteId = pathname?.split('/').pop();
  const activeSites = sites.filter((s) => s.siteStatus === 'active');
  useHotkey('cmd+k', () => setIsSearchOpen(true));
  const teamId = user?.teamId;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.includes('Mac');

      // CMD/CTRL + K → open
      if ((isMac ? e.metaKey : e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(false);
        setOpenShareDropdown(false);
      }

      // ESC → close
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setOpenShareDropdown(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

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

  async function handleInviteSubmit(
    e: React.FormEvent<HTMLFormElement>,
    siteId: string,
    email: string,
  ) {
    e.preventDefault();
    if (!email.trim()) return;

    setIsInviting(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/site/${siteId}/invite`,
        {
          method: 'POST',
          body: JSON.stringify({ email, teamId }),
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) throw new Error('Failed to send invitation');

      toast.success(`Invite sent to ${email}`);
      setEmail('');
    } catch (error) {
      console.error('Error inviting user:', error);
      toast.error('Failed to send invitation. Please try again.');
    } finally {
      setIsInviting(false);
    }
  }

  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  const AVATAR_COLOURS = [
    'from-violet-500 to-purple-600',
    'from-blue-500 to-indigo-600',
    'from-emerald-500 to-teal-600',
    'from-orange-500 to-amber-600',
    'from-pink-500 to-rose-600',
  ];

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
    <>
    <ToastContainer position="bottom-right" pauseOnFocusLoss draggable pauseOnHover />
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
          <button
            className="flex items-center justify-between gap-3 w-full p-2 text-sm px-3 py-2 rounded-lg transition-all text-white shadow-lg hover:text-gray-200 hover:bg-white/4 cursor-pointer"
            onClick={() => setIsSearchOpen(true)}
          >
            <div className="flex items-center gap-3">
              <IoSearchOutline />
              <p className="text-md">Search</p>
              <AnimatePresence>
                {isSearchOpen && (
                  <motion.form
                    className="fixed bg-[#3b3b3a] px-2.5 py-4 top-2/4 left-2/4 -translate-2/4 w-2/4 z-61 rounded-lg"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onSubmit={(e) => {
                      if (!siteId) {
                        alert('Missing site ID');
                        return;
                      }
                    }}
                  >
                    <div className="flex gap-1">
                      <input
                        type="email"
                        name="email"
                        id="email"
                        autoComplete="email"
                        className="bg-[#303030] text-gray-100 rounded-lg px-2 py-4 w-full text-sm"
                        placeholder="Search"
                        onChange={(e) => setEmail(e.target.value)}
                        // pattern='/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/'
                      />
                      <button className="absolute right-2.5 bg-[#1f1f1e] border border-[#797979] rounded-lg p-4.5 text-sm text-gray-100 cursor-pointer">
                        <IoSearchOutline />
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
            <div className="flex items-center gap-1">
              <div className="bg-[#3b3b3a] p-1 rounded-lg border border-[#797979]">
                <MdKeyboardCommandKey />
              </div>
              <span className="flex items-center justify-center bg-[#3b3b3a] p-1 rounded-lg w-6 h-6 border border-[#797979]">
                K
              </span>
            </div>
          </button>
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
                  key={site.id}
                  className={`flex items-center justify-between gap-2 p-2 ml-8 text-gray-100 text-sm ${pathname.includes(`reports/${stripTLD(site.site)}`) ? 'bg-[#3b3b3a] rounded-xl mt-2' : ''}`}
                  href={`/reports/${stripTLD(site.site)}`}
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
          {isReportsPage ? (
            <div>
              <AnimatePresence>
                {openShareDropdown && (
                  <motion.div
                    key="shareModalWrapper"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-60 flex items-center justify-center p-4"
                    onClick={() => setOpenShareDropdown(false)}
                  >
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

                    {/* Modal */}
                    <motion.div
                      className="relative w-full max-w-md rounded-2xl border border-white/8 bg-[#1C1C1C] shadow-2xl shadow-black/60 z-61"
                      initial={{ scale: 0.95, opacity: 0, y: 8 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      exit={{ scale: 0.95, opacity: 0, y: 8 }}
                      transition={{ duration: 0.18, ease: 'easeOut' }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between border-b border-white/6 px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5">
                            <IoShareOutline className="text-white/60" size={14} />
                          </div>
                          <div>
                            <h2 className="text-sm font-medium text-white/90">Invite to board</h2>
                            <p className="text-xs text-white/40">{siteId}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setOpenShareDropdown(false)}
                          className="rounded-lg p-1.5 text-white/40 transition-colors hover:bg-white/6 hover:text-white/70"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Invite form */}
                      <div className="p-5">
                        <form
                          onSubmit={(e) => {
                            if (!siteId) {
                              toast.error('Missing site ID');
                              return;
                            }
                            handleInviteSubmit(e, siteId, email);
                          }}
                        >
                          <label className="mb-1.5 block text-xs text-white/40">
                            Email address
                          </label>
                          <div className="flex gap-2">
                            <input
                              type="email"
                              name="email"
                              id="invite-email"
                              autoComplete="email"
                              value={email}
                              required
                              className="flex-1 rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white placeholder:text-white/25 outline-none transition-colors focus:border-white/20"
                              placeholder="colleague@company.com"
                              onChange={(e) => setEmail(e.target.value)}
                            />
                            <button
                              type="submit"
                              disabled={isInviting || !email.trim()}
                              className="flex items-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-black transition-all hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {isInviting ? (
                                <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                                </svg>
                              ) : (
                                <IoShareOutline size={13} />
                              )}
                              {isInviting ? 'Sending…' : 'Invite'}
                            </button>
                          </div>
                        </form>

                        {/* Members list */}
                        {users.length > 0 && (
                          <div className="mt-5">
                            <p className="mb-3 text-xs text-white/40">
                              Board members · {users.length}
                            </p>
                            <div className="flex flex-col gap-2 max-h-52 overflow-y-auto pr-0.5">
                              {users.map((u, i) => (
                                <div
                                  key={u.id}
                                  className="flex items-center gap-3 rounded-xl border border-white/6 bg-white/[0.03] px-3 py-2.5"
                                >
                                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br ${AVATAR_COLOURS[i % AVATAR_COLOURS.length]} text-xs font-medium text-white`}>
                                    {getInitials(u.name)}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm text-white/80">{u.name}</p>
                                    <p className="truncate text-xs text-white/40">{u.email}</p>
                                  </div>
                                  <span className="shrink-0 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-400">
                                    Active
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
              <button
                className="flex items-center gap-2 w-full p-2 text-gray-100 text-sm font-semibold cursor-pointer"
                onClick={() => setOpenShareDropdown(true)}
              >
                <IoShareOutline />
                <p className="text-md">Invite users</p>
              </button>
            </div>
          ) : null}
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
        </div>
      </div>
    </aside>
    </>
  );
}
