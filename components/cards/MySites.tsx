'use client';

import { getToken } from '@/lib/auth';
import { fetchSites } from '@/lib/fetchSites';
import { Site } from '@/types/types';
import { timeAgo } from '@/utils/helpers';
import { ExternalLink, AlertCircle, Clock, GalleryThumbnails } from 'lucide-react';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import slugify from 'slugify';


export function MySites() {
  const token = getToken();
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const getSites = async () => {
      const data = await fetchSites(token);
      setSites(data);
      setLoading(false);
    };

    getSites();
  }, []);
  return (
    <div className="bg-linear-to-br from-[#1A1A1A] to-[#161616] rounded-xl border border-white/10 p-6 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-white mb-1">My Sites</h2>
          <p className="text-sm text-gray-500">{sites.length} active projects</p>
        </div>
        <Link className="text-sm text-purple-400 hover:text-purple-300 transition-colors" href="/reports">
          View all
        </Link>
      </div>
      
      <div className="flex flex-col gap-4 max-h-58 overflow-y-scroll custom-scrollbar pr-2.5">
        {sites.map((site) => (
          <Link
            key={site.id}
            className="group bg-white/3 border border-white/5 rounded-lg p-4 hover:bg-white/5 hover:border-white/10 transition-all cursor-pointer"
            href={`reports/${slugify(site.siteName, { lower: true })}`}
          >
            <div className="flex items-start gap-3 mb-3">
              <div className={`w-10 h-10 rounded-lg bg-linear-to-br flex from-purple-500 to-blue-500 items-center justify-center shrink-0`}>
                <div className="w-5 h-5 border-2 border-white/80 rounded">
                  <Image
                    src={`https://www.google.com/s2/favicons?sz=64&domain=${site.site}`}
                    width={24}
                    height={24}
                    alt={``}
                    // fallbackSrc="string"
                    // onError={<GalleryThumbnails />}
                    />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-sm text-gray-200 mb-1 group-hover:text-white transition-colors truncate">
                  {site.siteName}
                </h3>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  {timeAgo(site.lastUpdated)}
                </div>
              </div>
              
              <ExternalLink className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors shrink-0" />
            </div>
            
            <div className="flex items-center gap-2 pt-3 border-t border-white/5">
              <div className="flex items-center gap-1.5 flex-1">
                <AlertCircle className="w-4 h-4 text-orange-400" />
                <span className="text-sm text-gray-400">{site.total} task{site.total > 1 ? 's' : ''}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
