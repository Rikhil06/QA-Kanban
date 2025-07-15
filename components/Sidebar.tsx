'use client';

import React from 'react'
import { LuLayoutDashboard } from "react-icons/lu";
import { TbMessageReport } from "react-icons/tb";
import { RiArchiveDrawerLine, RiSettings3Line } from "react-icons/ri";
import Link from 'next/link';
import { usePathname} from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className='bg-white fixed w-2/12 py-7 px-5 h-full z-50 border-r-1 border-gray-200'>
        <div className="flex items-center gap-3 mb-10">
            <div className='bg-[#6C5CE7] w-10 h-10 flex items-center justify-center rounded-xl font-bold text-xl'>
                <span className='text-white'>Q</span>
            </div>
            <h1 className='font-bold'>QA Board</h1>
        </div>
        <Link className={`flex items-center gap-3 w-full p-3 ${pathname == '/' ? 'bg-gray-200 rounded-xl' : ''}`} href='/'>
            <LuLayoutDashboard />
            <p className='text-md'>Home</p>
        </Link>
        <Link className={`flex items-center gap-3 w-full p-3 ${pathname == '/dashboard' ? 'bg-gray-200 rounded-xl' : ''}`} href='/dashboard'>
            <LuLayoutDashboard />
            <p className='text-md'>Dashboard</p>
        </Link>
        <Link className={`flex items-center gap-3 w-full p-3 ${pathname.includes('reports') ? 'bg-gray-200 rounded-xl' : ''}`} href='/reports'>
            <TbMessageReport />
            <p className='text-md'>Reports</p>
        </Link>
        <Link className={`flex items-center gap-3 w-full p-3 ${pathname == '/archived' ? 'bg-gray-200 rounded-xl' : ''}`} href='/archived'>
            <RiArchiveDrawerLine />
            <p className='text-md'>Archived</p>
        </Link>
        <Link className={`flex items-center gap-3 w-full p-3 ${pathname == '/settings' ? 'bg-gray-200 rounded-xl' : ''}`} href='/settings'>
            <RiSettings3Line />
            <p className='text-md'>Settings</p>
        </Link>
    </aside>
  )
}
