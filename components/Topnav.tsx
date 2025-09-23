'use client';

import React, { useEffect, useState } from 'react'

import { LuLayoutDashboard } from "react-icons/lu";
import { CiSearch } from "react-icons/ci";

import Link from 'next/link';
import { useUser } from '@/hooks/useUser';
import { useLogout } from '@/lib/auth';
import { usePathname} from 'next/navigation';
import { Capitalize } from '@/utils/helpers';
import { Site } from '@/types/types';


export default function Topnav() {
  const { user } = useUser();
  const logout = useLogout();
  const pathname = usePathname();
  const pageTitle = Capitalize(pathname.split('/')[1]);
  const siteId = pathname?.split("/").pop();
  

  const [openShareDropdown, setOpenShareDropdown] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [users, setUsers] = useState<Site[]>([]);

  useEffect(() => {
    const siteId = pathname?.split("/").pop();

    if (!siteId) return;

    const fetchUsers = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:4000/api/site/${siteId}/users`);
        if (!res.ok) return;
        const data = await res.json();
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, [pathname]);

  async function handleInviteSubmit(e: React.FormEvent<HTMLFormElement>, siteId: string, email: string) {
    e.preventDefault();
  
    try {
      const response = await fetch(`http://127.0.0.1:4000/api/site/${siteId}/invite`, {
        method: 'POST',
        body: JSON.stringify({ email }),
        headers: { 'Content-Type': 'application/json' },
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
  

// console.log(users);

  

  return (
    <header className='bg-white fixed left-2/12 w-10/12 z-50 '>
        <div className='flex items-center justify-between py-2 border-b-1 border-gray-200 px-5'>
            <form action="" className='w-1/5'>
                <label htmlFor="" className='hidden'>Search</label>
                <div className='flex items-center gap-2 border-1 border-gray-200 rounded-lg px-2 py-1.5'>
                    <CiSearch />
                    <input type="text" placeholder='Search QA Board' className='w-full' required/>
                </div>
            </form>
            <div className="flex items-center gap-4 relative">
                <button className="cursor-pointer" onClick={() => setOpenShareDropdown(setPrev => !setPrev)}>Share</button>
                {openShareDropdown && (
                    <div className='absolute top-[55px] right-[80px] w-[480px] rounded-lg bg-white shadow-sm p-4 z-10'>
                        <form   onSubmit={(e) => {
                                    if (!siteId) {
                                    alert("Missing site ID");
                                    return;
                                    }
                                    handleInviteSubmit(e, siteId, email);
                                }}>
                            <label htmlFor="email" className='mb-3 block'>Invite</label>      
                            <div className='flex items-center gap-3'>
                                <input 
                                    type="email" 
                                    name="email" 
                                    id="email" 
                                    autoComplete="email" 
                                    className='border-1 border-gray-200 rounded-lg px-2 py-1.5 w-full' 
                                    placeholder='Add emails' 
                                    onChange={(e) => setEmail(e.target.value)}
                                    // pattern='/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/'
                                />
                                <button className='cursor-pointer'>Send</button>
                            </div> 
                        </form>

                        <div>
                            <h3>Users from the {siteId} Board</h3>
                            <div>
                            {users.map((site) => (
                                <div key={site.id}>
                                <h3>{site.name}</h3>
                                <span>{site.email}</span>
                                </div>
                            ))}
                            </div>
                        </div>

                    </div>
                )}
                {!user ?
                ( 
                    <>
                        <Link className='bg-[#6C5CE7] text-white px-4 py-2 rounded-xl font-semibold' href="/login">Login</Link>
                        <Link className='bg-[#22202e] text-white px-4 py-2 rounded-xl font-semibold' href="/register">Register</Link>
                    </> 
                ) :  <button className='bg-[#6C5CE7] px-3 py-2 rounded-xl font-semibold cursor-pointer text-white' onClick={logout}>Logout</button>
            }
            </div>
        </div>
        <div className="flex justify-between items-center px-5 py-5 bg-gray-50 border-b-1 border-gray-200">
            <div className="flex items-center gap-2.5">
                <div className='flex items-center gap-2'>
                    <LuLayoutDashboard />
                    <h2 className='font-bold'>{pathname !== '/' ? pageTitle : 'Home'}</h2>
                </div>
                {/* <IoIosArrowDropright />
                <h3>QA Changes</h3> */}
            </div>
        </div>
    </header>
  )
}
