'use client';

import { useEffect, useRef, useState } from 'react';
import { Site } from '@/types/types';
import { ExternalLink, MoreVertical, Kanban, List, Camera, Settings, Archive, Pin } from 'lucide-react';
import { Capitalize, getInitials, timeAgo } from '@/utils/helpers';
import slugify from 'slugify';
import Link from 'next/link';
import { stripTLD } from '@/utils/stripTLD';

interface SiteCardProps {
  site: Site;
  toggleSiteArchive: (id: string, shouldArchive: boolean) => Promise<any>;
  pinSite?: (id: string) => Promise<any>;
  unpinSite?: (id: string) => Promise<any>;
}

type QuickActionProps = {
  icon: any;
  label: string;
  danger?: boolean;
  onClick?: () => void;
  link?: string;
};

// const token = getToken();
// if (!token) // router.push('/login'); // or show login modal

export default function SiteList({ site, toggleSiteArchive, pinSite, unpinSite }: SiteCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const highUrgentIssues = site.priorities.high + site.priorities.urgent;

   const healthColors: any = {
    low: 'bg-green-400',
    medium: 'bg-orange-500',
    high: 'bg-red-500',
    urgent: 'bg-red-600',
  };

  const healthLabels: any = {
    low: 'All systems operational',
    medium: 'Issues need attention',
    high: 'Significant issues detected',
    urgent: 'Critical issues detected',
  };

     const healthIndicator: any = {
    low: 'shadow-green-500/5',
    medium: 'shadow-orange-500/5',
    high: 'shadow-red-500/5',
    urgent: 'shadow-red-600/5',
  };



  const activePriorities = Object.entries(site.priorities)
  .filter(([_, count]) => count > 0)
  .map(([priority]) => priority);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

   const handleArchive = () => {
    toggleSiteArchive(stripTLD(site.slug), true);
  };

  const handleUnarchive = () => {
    toggleSiteArchive(stripTLD(site.slug), false);
  };
  
  const handlePinSite = () => {
    pinSite?.(stripTLD(site.slug));
  }

  const handleUnpinSite = () => {
    unpinSite?.(stripTLD(site.slug));
  }


  return (
    // <div className="space-y-3">
    // {sites.map((site) => (
    //   <div key={site.id} className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center justify-between gap-4 hover:shadow-lg transition">
    //     <Link
    //     href={`reports/${slugify(site.siteName, { lower: true })}`}
    //     className='w-3/4'
    //     >
    //       <div className="flex items-center gap-3" key={site.id}>
    //           <Image
    //           src={`https://www.google.com/s2/favicons?sz=64&domain=${site.site}`}
    //           width={24}
    //           height={24}
    //           alt={`Favicon for ${site.site}`}
    //           />
    //           <div>
    //           <p className="font-semibold text-gray-800">{site.site}</p>
    //           <p className="text-sm text-gray-500">
    //               {site.count} issue{site.count !== 1 ? 's' : ''}
    //           </p>
    //           </div>
    //       </div>
    //     </Link>
    //     <div className='flex items-center gap-5'>
    //       <div className="text-sm text-white bg-purple-600 px-3 py-1 rounded-full">
    //           Last updated: {formatTimeAgo(site.lastUpdated)}
    //       </div>
    //       <button className='cursor-pointer relative' onClick={() => setArchiveDropdownOpen(true)}>
    //         <BsThreeDotsVertical />
    //         {archiveDropdownOpen && (
    //           <div className='absolute -right-[15px] top-[55px] bg-white shadow-sm flex flex-col rounded-lg items-start'>
    //             <button className='flex items-center gap-2 px-4 py-2 rounded-lg transition-all cursor-pointer hover:bg-gray-200 text-left whitespace-nowrap w-full' onClick={() => toggleSiteArchive(slugify(site.siteName, {lower: true}), true)}>
    //               Archive site
    //             </button>
    //           </div>
    //         )}
    //       </button>
    //       </div>
    //     </div>
    // ))}
    // </div>

        <div className={`group relative bg-[#1C1C1C] border border-white/8 rounded-xl p-5 hover:border-white/15 hover:shadow-xl ${healthIndicator[activePriorities[0]]} transition-all cursor-pointer`}>
      {/* Health Indicator */}
      <div className="absolute top-0 left-0 right-0 h-1 rounded-t-xl overflow-hidden">
        <div className={`h-full ${healthColors[activePriorities[0]]}`} />
      </div>

      {/* Card Header */}
      <div className="flex items-start justify-between mb-4">
        <Link className="flex-1 min-w-0" href={`reports/${stripTLD(site.slug)}`}>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="truncate">{Capitalize(site.siteName)}</h3>
            {site.isPinned && <Pin className="w-3.5 h-3.5 text-gray-500 shrink-0" fill="currentColor" />}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="truncate">{site.site}</span>
            <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </Link>

        {/* Actions Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMenuOpen(!isMenuOpen);
            }}
            className="p-1.5 rounded-lg hover:bg-white/8 transition-colors opacity-0 group-hover:opacity-100"
          >
            <MoreVertical className="w-4 h-4 text-gray-400" />
          </button>

          {isMenuOpen && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-[#222] border border-white/8 rounded-lg shadow-xl overflow-hidden z-10">
              <QuickAction icon={Pin} label={site.isPinned ? 'Unpin Site' : 'Pin Site'} onClick={site.isPinned ? handleUnpinSite : handlePinSite} />
              <QuickAction icon={Kanban} label="Open Kanban Board" link={`reports/${stripTLD(site.slug)}`} />
              <QuickAction icon={List} label="View Issues" />
              <QuickAction icon={Camera} label="View Screenshots" />
              <QuickAction icon={Settings} label="Settings" />
              <div className="h-px bg-white/8 my-1" />
                <QuickAction icon={Archive} label={site.siteStatus === 'archived' ? 'Unarchive site' : 'Archive Site'} danger onClick={site.siteStatus === 'archived' ? handleUnarchive : handleArchive} />
            </div>
          )}
        </div>
      </div>

      {/* Environment Badge */}
      <div className="mb-4">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs border bg-blue-500/10 text-blue-400 border-blue-500/20`}>
          {/* Prod */}
          {site.counts.new === 1 ? 'Prod' : 'Staging'}
        </span>
      </div>

      {/* Issues Stats */}
      <div className="mb-4 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Open issues</span>
          <span className="text-white">{site.counts.new}</span>
        </div>
        {highUrgentIssues > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Critical/High</span>
            <span className="text-red-400">{highUrgentIssues}</span>
          </div>
        )}
      </div>

      {/* Team Members */}
      <div className="mb-4 flex items-center gap-2">
        <div className="flex -space-x-2">
          {site.members.slice(0, 4).map((member, index) => (
            <div
              key={member.id}
              className="w-7 h-7 rounded-full bg-linear-to-br from-purple-500 to-pink-500 border-2 border-[#1C1C1C] flex items-center justify-center text-xs group-hover:border-[#222] transition-colors"
              style={{
                zIndex: site.members.length - index,
              }}
              title={member.name}
            >
              {getInitials(member.name)}
            </div>
          ))}
          {site.members.length > 4 && (
            <div className="w-7 h-7 rounded-full bg-[#0F0F0F] border-2 border-[#1C1C1C] flex items-center justify-center text-xs text-gray-400 group-hover:border-[#222] transition-colors">
              +{site.members.length - 4}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-white/6">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <div
            className={`w-1.5 h-1.5 rounded-full ${healthColors[activePriorities[0]]}`}
            title={healthLabels[activePriorities[0]]}
          />
          <span>{timeAgo(site.lastUpdated)}</span>
        </div>
      </div>
    </div>
  );
}

function QuickAction({ icon: Icon, label, danger, onClick, link }: QuickActionProps) {
  return (
    !link ? 
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
        danger
          ? 'text-red-400 hover:bg-red-500/10'
          : 'text-gray-300 hover:bg-white/4'
      }`}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </button>
    : 
    <Link href={link} className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
        danger
          ? 'text-red-400 hover:bg-red-500/10'
          : 'text-gray-300 hover:bg-white/4'
      }`}>
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </Link>
  );
}