'use client';

import React from 'react'
import { LuLayoutDashboard } from "react-icons/lu";
// import { IoIosArrowDropright } from "react-icons/io";
import Link from 'next/link';
import { useUser } from '@/hooks/useUser';
import { useLogout } from '@/lib/auth';
import { usePathname} from 'next/navigation';
import { Capitalize } from '@/utils/helpers';

export default function Topnav() {
  const { user } = useUser();
  const logout = useLogout();
  const pathname = usePathname();
  const pageTitle = Capitalize(pathname.replace(/\//g, ""));

  return (
    <header className='bg-white fixed left-2/12 w-10/12 py-6 px-5 z-50 border-b-1 border-gray-200'>
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-2.5">
                <div className='flex items-center gap-2'>
                    <LuLayoutDashboard />
                    <h2 className='font-bold'>{pathname !== '/' ? pageTitle : 'Home'}</h2>
                </div>
                {/* <IoIosArrowDropright />
                <h3>QA Changes</h3> */}
            </div>
            <div className="flex items-center gap-4">
                {!user ?
                ( 
                    <>
                        <Link className='bg-[#6C5CE7] text-white px-4 py-2 rounded-xl font-semibold' href="/login">Login</Link>
                        <Link className='bg-[#22202e] text-white px-4 py-2 rounded-xl font-semibold' href="/register">Register</Link>
                    </> 
                ) :  <button className='bg-[#6C5CE7] px-3 py-2 rounded-xl font-semibold cursor-pointer' onClick={logout}>Logout</button>
            }
            </div>
        </div>
    </header>
  )
}
