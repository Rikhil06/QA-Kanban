'use client';

import Link from 'next/link';
import { usePathname} from 'next/navigation';
import { useUser } from '@/context/UserContext';
import { useEffect, useState } from "react";
import { useLogout } from "@/hooks/useLogout";
import { motion, AnimatePresence } from "motion/react";

import { IoHome, IoSearchOutline, IoLogOutOutline, IoLogInOutline, IoShareOutline, IoClose } from "react-icons/io5";
import { TbMessageReport } from "react-icons/tb";
import { RiSettings3Line } from "react-icons/ri";
import { MdKeyboardCommandKey, MdAccountCircle, MdManageAccounts } from "react-icons/md";
import { FaChartPie } from "react-icons/fa";
import { IoIosNotificationsOutline } from "react-icons/io";
import { FiMessageSquare } from "react-icons/fi";
import { CiShare1 } from "react-icons/ci";


import { fetchSites } from '@/lib/fetchSites';
import { Site } from '@/types/types';
import { getToken } from '@/lib/auth';
import slugify from 'slugify';
import { stripTLD } from '@/utils/stripTLD';
import { Capitalize } from '@/utils/helpers';
import { useHotkey } from '@/hooks/useHotkey';
import { Bell, LayoutList, Users } from 'lucide-react';
import { fetchUsersForSite } from '@/lib/fetchUsers';

export default function Sidebar() {
  const pathname = usePathname();
  const { user, loading } = useUser();
  const logout = useLogout();
  const token = getToken();

  const [sites, setSites] = useState<Site[]>([]);
  const [siteLoading, setSiteLoading] = useState<boolean>(true);
  const [users, setUsers] = useState<Site[]>([]);
  const [email, setEmail] = useState<string>("");
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState<boolean>(false);
  const [openShareDropdown, setOpenShareDropdown] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const isReportsPage = pathname.startsWith("/reports/");
  const siteId = pathname?.split("/").pop();
  const activeSites = sites.filter(s => s.siteStatus === 'active');
  useHotkey("cmd+k", () => setIsSearchOpen(true));
  const teamId = user?.teamId;



  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.includes("Mac");

      // CMD/CTRL + K → open
      if ((isMac ? e.metaKey : e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(false);
        setOpenShareDropdown(false)
      }

      // ESC → close
      if (e.key === "Escape") {
        setIsSearchOpen(false);
        setOpenShareDropdown(false)
      }
    };

    window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
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

    async function handleInviteSubmit(e: React.FormEvent<HTMLFormElement>, siteId: string, email: string) {
        e.preventDefault();

        try {
        const response = await fetch(`https://qa-backend-105l.onrender.com /api/site/${siteId}/invite`, {
            method: 'POST',
            body: JSON.stringify({ email, teamId}),
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
            throw new Error('Failed to send invitation');
        }

        alert('Invitation sent');
        } catch (error) {
        console.error('Error inviting user:', error);
        alert('Failed to send invitation');
        }
    }  

    // if (siteLoading) return <p className="text-gray-500">Loading sites...</p>;
    // if (!sites.length) return <p className="text-gray-500">No sites found.</p>;

    if (loading) return null;


return (
    <aside className='bg-[#0a0a0a] border-r border-white/5 w-2/12 h-full z-50'>
        <Link className="h-16 px-6 flex items-center border-b border-white/5" href="/">
            <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-linear-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-square-check-big w-4 h-4 text-white" aria-hidden="true">
                        <path d="M21 10.656V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12.344"></path>
                        <path d="m9 11 3 3L22 4"></path>
                    </svg>
                </div>
                <span className="tracking-tight text-gray-100">QA Board</span>
            </div>
        </Link>
        <div className="flex flex-col justify-between px-3 py-4 h-[calc(100%-64px)]">
            <div className="flex flex-col gap-1">
                <Link className={`flex items-center gap-3 w-full p-2 text-sm px-3 py-2 rounded-lg transition-all text-white shadow-lg ${pathname !== '/' ? 'hover:text-gray-200 hover:bg-white/4' : ''} ${pathname == '/' ? 'bg-white/8 text-white shadow-white/5' : ''} `} href='/'>
                    <IoHome />
                    <p className='text-md'>Home</p>
                </Link>
                <button className='flex items-center justify-between gap-3 w-full p-2 text-sm px-3 py-2 rounded-lg transition-all text-white shadow-lg hover:text-gray-200 hover:bg-white/4 cursor-pointer' onClick={() => setIsSearchOpen(true)}>
                    <div className="flex items-center gap-3">
                        <IoSearchOutline />
                        <p className='text-md'>Search</p>
                        <AnimatePresence>
                        {isSearchOpen && (
                           <motion.form
                                className='fixed bg-[#3b3b3a] px-2.5 py-4 top-2/4 left-2/4 -translate-2/4 w-2/4 z-61 rounded-lg'
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                onSubmit={(e) => {
                                    if (!siteId) {
                                    alert("Missing site ID");
                                    return;
                                }
                            }}>
                                <div className='flex gap-1'>
                                    <input 
                                        type="email" 
                                        name="email" 
                                        id="email" 
                                        autoComplete="email" 
                                        className='bg-[#303030] text-gray-100 rounded-lg px-2 py-4 w-full text-sm' 
                                        placeholder='Search' 
                                        onChange={(e) => setEmail(e.target.value)}
                                        // pattern='/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/'
                                    />
                                    <button className='absolute right-2.5 bg-[#1f1f1e] border border-[#797979] rounded-lg p-4.5 text-sm text-gray-100 cursor-pointer'><IoSearchOutline/></button>
                                </div> 
                            </motion.form>
                            )}
                            </AnimatePresence>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="bg-[#3b3b3a] p-1 rounded-lg border border-[#797979]"><MdKeyboardCommandKey/></div>
                        <span className="flex items-center justify-center bg-[#3b3b3a] p-1 rounded-lg w-6 h-6 border border-[#797979]">K</span>
                    </div>
                </button>
                <span className='w-full h-px bg-[#3b3b3a] block my-1'></span>
                <div>
                    <Link className={`flex items-center gap-3 w-full p-2 text-sm px-3 py-2 rounded-lg transition-all text-white shadow-lg ${pathname.startsWith("/reports") ? 'hover:text-gray-200 hover:bg-white/4' : ''} ${pathname.startsWith("/reports") ? 'bg-white/8 text-white shadow-white/5' : ''} ` } href='/reports'>
                        <TbMessageReport />
                        <p className='text-md'>Reports</p>
                    </Link>
                    <div>
                            {activeSites.map((site) => (
                                <Link 
                                    key={site.id} 
                                    className={`flex items-center justify-between gap-2 p-2 ml-8 text-gray-100 text-sm ${pathname.includes(`reports/${stripTLD(site.site)}`) ? 'bg-[#3b3b3a] rounded-xl mt-2' : ''}`} 
                                    href={`/reports/${stripTLD(site.site)}`}>
                                    {Capitalize(stripTLD(site.site))}
                                    <CiShare1 />
                                </Link>
                            ))}
                    </div>
                    <Link className={`flex items-center gap-2 w-full p-2 text-gray-100 text-sm ${pathname == '/notifications' ? 'bg-[#3b3b3a] rounded-xl' : ''}`} href='/notifications'>
                        <Bell size={15} />
                        <p className='text-md'>Notifications</p>
                    </Link>
                    <Link className={`flex items-center gap-2 w-full p-2 text-gray-100 text-sm ${pathname == '/my-tasks' ? 'bg-[#3b3b3a] rounded-xl' : ''}`} href='/my-tasks'>
                        <LayoutList size={15}/>
                        <p className='text-md'>My Tasks</p>
                    </Link>
                    {user?.teamId && (
                        <Link className={`flex items-center gap-2 w-full p-2 text-gray-100 text-sm ${pathname == '/team' ? 'bg-[#3b3b3a] rounded-xl' : ''}`} href='/team'>
                            <Users size={15}/>
                            <p className='text-md'>Team</p>
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
                                className="fixed inset-0 z-60"
                            >
                                <div className='fixed bg-[#3b3b3a] inset-0 z-60 opacity-55'></div>
                            <motion.div 
                                className='fixed bg-[#3b3b3a] px-2.5 py-4 top-2/4 left-2/4 -translate-2/4 w-2/4 z-61 rounded-lg'
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className='flex justify-between items-center mb-3 text-gray-100'>
                                    <h2 className='text-lg'>Invite Users</h2>
                                    <IoClose className='cursor-pointer' size={30} onClick={() => setOpenShareDropdown(false)}/>
                                </div>
                                <form
                                    onSubmit={(e) => {
                                        if (!siteId) {
                                        alert("Missing site ID");
                                        return;
                                    }
                                    handleInviteSubmit(e, siteId, email);
                                }}>
                                    {/* <label htmlFor="email" className='mb-2 block text-gray-100 text-sm '>Invite users</label>       */}
                                    <div className='flex gap-1'>
                                        <input 
                                            type="email" 
                                            name="email" 
                                            id="email" 
                                            autoComplete="email" 
                                            className='bg-[#303030] text-gray-100 rounded-lg px-2 py-4 w-full text-sm' 
                                            placeholder='Add email' 
                                            onChange={(e) => setEmail(e.target.value)}
                                            // pattern='/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/'
                                        />
                                        <button className='bg-[#1f1f1e] border border-[#797979] rounded-lg px-10 py-1 text-sm text-gray-100 cursor-pointer'>Send</button>
                                    </div> 
                                </form>
                                    <div>
                                    {/* <h3>Users from the {siteId} Board</h3> */}
                                    <div className="relative overflow-x-auto bg-neutral-primary-soft shadow-xs rounded-lg text-gray-100 mt-2">
                                        <table className="w-full text-sm text-left rtl:text-right text-body">
                                            <thead className="text-sm text-body bg-neutral-secondary-medium border-b border-default-medium border-[#2b2b2b]">
                                                <tr>
                                                    <th scope="col" className="px-6 py-3">
                                                        Name
                                                    </th>
                                                    <th scope="col" className="px-6 py-3">
                                                        Email
                                                    </th>
                                                    <th scope="col" className="px-6 py-3">
                                                        Verified
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {users.map((site) => (
                                                    <tr key={site.id} className="bg-neutral-primary-soft border-b border-default hover:bg-neutral-secondary-medium border-[#2b2b2b]">
                                                        <th scope="row" className="px-6 py-4 font-medium text-heading whitespace-nowrap">
                                                            {site.name}
                                                        </th>
                                                        <td className="px-6 py-4">
                                                            {site.email}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            Yes
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        </div>
                                    </div>
                            </motion.div>
                            </motion.div>
                        )
                        }
                        <button className='flex items-center gap-2 w-full p-2 text-gray-100 text-sm font-semibold cursor-pointer' onClick={() => setOpenShareDropdown(true)}>
                            <IoShareOutline />
                            <p className='text-md'>Invite users</p>
                        </button>
                        </AnimatePresence>
                    </div>
                ) : null}
                <Link className={`flex items-center gap-2 w-full p-2 text-gray-100 text-sm ${pathname == '/usage-billing' ? 'bg-[#3b3b3a] rounded-lg' : ''}`} href='/usage-billing'>
                    <FaChartPie />
                    <p className='text-md'>Usage & Billing</p>
                </Link>
                <Link className={`flex items-center gap-2 w-full p-2 text-gray-100 text-sm ${pathname == '/settings' ? 'bg-[#3b3b3a] rounded-xl' : ''}`} href='/settings'>
                    <RiSettings3Line />
                    <p className='text-md'>Settings</p>
                </Link>
                <span className='h-px bg-[#3b3b3a] block -ml-5 w-[calc(100%+36px)] mt-3 mb-2'></span>
                <div className="flex justify-between items-center">
                    {user ? (
                        <div className="relative">
                            <button className='flex items-center gap-2 w-full p-2 text-gray-100 text-sm cursor-pointer' onClick={() => setIsAccountDropdownOpen(prev => !prev)}>
                                <MdAccountCircle />
                                <p className='text-md'>{user.name.split(' ').slice(0, -1).join(' ')}</p>
                            </button>
                            <AnimatePresence initial={false}>
                                {isAccountDropdownOpen && (
                                    <motion.div 
                                        key="accountDropdown" 
                                        initial={{ y: 100, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        exit={{ y: 100, opacity: 0 }}
                                        transition={{ type: "spring", stiffness: 260, damping: 22 }}
                                        className="absolute -top-30 bg-[#3b3b3a] w-[200px] p-2.5 z-10 rounded-lg"
                                    >
                                        <Link className="flex items-center gap-2 w-full p-2 px-4 text-gray-100 text-sm bg-[#303030] rounded-lg cursor-pointer mb-2" href="/settings/account">
                                            <MdManageAccounts />
                                            Account Settings
                                        </Link>
                                        <button className="flex items-center gap-2 w-full p-2 px-4 text-gray-100 text-sm bg-[#303030] rounded-lg cursor-pointer" onClick={() => (logout(), setIsAccountDropdownOpen(false))}>
                                            <IoLogOutOutline />
                                            Logout
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : 
                        <Link className='flex items-center gap-2 w-full p-2 text-gray-100 text-sm' href="/login">
                            <IoLogInOutline />
                            Login
                        </Link>
                    }
                    <div className="text-gray-100 flex items-center gap-2">
                        <RiSettings3Line />
                        <FiMessageSquare />
                        <IoIosNotificationsOutline />
                    </div>
                </div>
            </div>
        </div>
    </aside>
  )
}
