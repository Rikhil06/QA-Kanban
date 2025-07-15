'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { formatTimeAgo } from '@/utils/formatTimeAgo';
import Link from 'next/link';
import slugify from 'slugify';

type Site = {
  site: string;
  id: string;
  siteName: string;
  count: number;
  lastUpdated: string | Date;
};

export default function SiteList() {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSites = async () => {
      try {
        const res = await fetch('http://localhost:4000/api/sites');
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

  if (loading) return <p className="text-gray-500">Loading sites...</p>;

  if (!sites.length) return <p className="text-gray-500">No sites found.</p>;

  return (
    <div className="space-y-3">
    {sites.map((site) => (
        <Link
        key={site.id}
        className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center justify-between gap-4 hover:shadow-lg transition"
        href={`reports/${slugify(site.siteName, { lower: true })}`}
        >
        <div className="flex items-center gap-3">
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
        <div className="text-sm text-white bg-purple-600 px-3 py-1 rounded-full">
            Last updated: {formatTimeAgo(site.lastUpdated)}
        </div>
        </Link>
    ))}
    </div>
  );
}
