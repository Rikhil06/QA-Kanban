'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { formatTimeAgo } from '@/utils/formatTimeAgo';
import Link from 'next/link';
import slugify from 'slugify';
import { getToken } from '@/lib/auth';
import { useRouter } from 'next/navigation';

import { BsThreeDotsVertical } from "react-icons/bs";

type Site = {
  site: string;
  id: string;
  siteName: string;
  count: number;
  lastUpdated: string | Date;
  archivedAt: string | Date;
};

const token = getToken();

export default function ArchivedSiteList() {
  const router = useRouter();
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [archiveDropdownOpen, setArchiveDropdownOpen] = useState<boolean>(false);

  useEffect(() => {

    if (!token) {
      router.push('/login');
      return;
    }

    const fetchSites = async () => {
      try {
        const res = await fetch('http://127.0.0.1:4000/api/archive', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setSites(data);
      } catch (err) {
        console.error('Failed to fetch sites:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSites();
  }, []);

  async function toggleSiteArchive(id: string, shouldArchive: boolean) {
    const res = await fetch(`http://127.0.0.1:4000/api/site/${id}/archive`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ archived: shouldArchive }),
    });
  
    if (!res.ok) {
      const { error } = await res.json();
      throw new Error(error);
    }

    setSites((prevSites) => prevSites.filter((site) => slugify(site.siteName, {lower: true}) !== id));
    setArchiveDropdownOpen(false);
    return res.json(); // optional, to show a toast or reload data
  }

  if (loading) return <p className="text-gray-500">Loading sites...</p>;

  if (!sites.length) return <p className="text-gray-500">No sites found.</p>;

  return (
    <div className="space-y-3">
    {sites.map((site) => (
      <div key={site.id} className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center justify-between gap-4 hover:shadow-lg transition">
        <Link
        href={`reports/${slugify(site.siteName, { lower: true })}`}
        className='w-3/4'
        >
          <div className="flex items-center gap-3" key={site.id}>
              <Image
              src={`https://www.google.com/s2/favicons?sz=64&domain=${site.site}`}
              width={24}
              height={24}
              alt={`Favicon for ${site.site}`}
              />
              <div>
              <p className="font-semibold text-gray-800">{site.site}</p>
              <p className="text-sm text-gray-500">
                  {site.count} issue{site.count !== 1 ? 's' : ''}
              </p>
              </div>
          </div>
        </Link>
        <div className='flex items-center gap-5'>
          <div className="text-sm text-white bg-purple-600 px-3 py-1 rounded-full">
              Last updated: {formatTimeAgo(site.archivedAt)}
          </div>
          <button className='cursor-pointer relative' onClick={() => setArchiveDropdownOpen(true)}>
            <BsThreeDotsVertical />
            {archiveDropdownOpen && (
              <div className='absolute -right-[15px] top-[55px] bg-white shadow-sm flex flex-col rounded-lg items-start'>
                <button className='flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer hover:bg-gray-200 text-left whitespace-nowrap w-full' onClick={() => toggleSiteArchive(slugify(site.siteName, {lower: true}), false)}>
                  Unarchive site
                </button>
              </div>
            )}
          </button>
          </div>
        </div>
    ))}
    </div>
  );
}
