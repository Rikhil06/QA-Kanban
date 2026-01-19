'use client';

import SiteList from '@/components/cards/SitesCard';
import { CreateSiteModal } from '@/components/CreateSiteModal';
import { SitesEmptyState } from '@/components/emptyStates/Sites';
import { SitesFilter } from '@/components/filter/SitesFilter';
import { useUser } from '@/context/UserContext';
import { getToken } from '@/lib/auth';
import { fetchSites } from '@/lib/fetchSites';
import { Site } from '@/types/types';
import { stripTLD } from '@/utils/stripTLD';
import { useEffect, useState } from 'react';
import slugify from 'slugify';

export default function SitesPage() {
  const token = getToken();
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'archived'>('all');
  const [environmentFilter, setEnvironmentFilter] = useState<'all' | 'Prod' | 'Staging' | 'UAT'>('all');
  const [sortBy, setSortBy] = useState<'lastUpdated' | 'openIssues' | 'alphabetical'>('lastUpdated');
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showEmptyState, setShowEmptyState] = useState(true); // Set to true to show empty state by default
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    const getSites = async () => {
      const data = await fetchSites(token);
      setSites(data);
      setLoading(false);
    };

    getSites();
  }, []);

  async function toggleSiteArchive(id: string, shouldArchive: boolean) {
    const res = await fetch(`https://qa-backend-105l.onrender.com /api/site/${id}/archive`, {
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
      setSites((prevSites) =>
        prevSites.map((site) =>
          stripTLD(site.slug) === id ? { ...site, siteStatus: shouldArchive ? 'archived' : 'active' } : site
        )
      );
    return res.json(); // optional, to show a toast or reload data
  }


  async function pinSite(id: string) {
    const res = await fetch(`https://qa-backend-105l.onrender.com /api/site/${id}/pin`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',   
         Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ isPinned: true }),
    });

    setSites(prev =>
      prev.map(site =>
        stripTLD(site.slug) === id ? { ...site, isPinned: true } : site
      )
    );

     if (!res.ok) {
      const { error } = await res.json();

      setSites(prev =>
        prev.map(site =>
         stripTLD(site.slug)  === id ? { ...site, isPinned: false } : site
        )
      );

      throw new Error(error);
    }

    return res.json();
  }

  async function unpinSite(id: string) {
  const res = await fetch(`https://qa-backend-105l.onrender.com /api/site/${id}/unpin`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  setSites(prev =>
    prev.map(site =>
      stripTLD(site.slug) === id ? { ...site, isPinned: false } : site
    )
  );

  if (!res.ok) {
    const { error } = await res.json();

    setSites(prev =>
      prev.map(site =>
        stripTLD(site.slug) === id ? { ...site, isPinned: true } : site
      )
    );

    throw new Error(error);
  }

  return res.json();
}

  const filteredSites = sites
    .filter(site => {
      const matchesSearch = site.site.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          site.siteName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || site.siteStatus === statusFilter;
      // const matchesEnvironment = environmentFilter === 'all' || site.environment === environmentFilter;
      return site && matchesSearch && matchesStatus;
    })
    .sort((a: any, b: any) => {
      if (sortBy === 'alphabetical') {
        return a.siteName.localeCompare(b.siteName);
      } 
      else if (sortBy === 'openIssues') {
        return b.counts.new - a.counts.new;
      }
      // Default: lastUpdated (mock sorting by id for demo)
      return parseInt(b.id) - parseInt(a.id);
    });

    const pinnedSites = filteredSites.filter(site => site.isPinned);
    const unpinnedSites = filteredSites.filter(site => !site.isPinned && site.siteStatus !== 'archived');
    const archivedSites = filteredSites.filter(site => site.siteStatus === 'archived');

  const handleCreateSite = async (name: string, url: string) => {
    await fetch('https://qa-backend-105l.onrender.com /sites/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: name,
        url: url,
        teamId: user?.teamId || null , // optional
      }),
    });

    // setSites([...sites, newSite]);
    // setShowEmptyState(false); // Show the sites grid after creating
  };

  
    if (loading) return <p className="text-gray-500">Loading sites...</p>;


  return (
      <div className='max-w-11/12 mx-auto mt-12 md:mb-12'>
        {sites ? (
          <>
            <SitesFilter 
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              environmentFilter={environmentFilter}
              onEnvironmentFilterChange={setEnvironmentFilter}
              sortBy={sortBy}
              onSortChange={setSortBy}
            />

          <div className="space-y-8">
            {pinnedSites.length > 0 && (
              <div>
                <div className="flex items-center mb-4">
                  <h2 className="text-sm text-gray-400 px-1">Pinned Sites</h2>
                  <span className='flex h-5 w-5 items-center justify-center rounded-full bg-white/8 text-xs text-white/60'>{pinnedSites.length}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
                  {pinnedSites.map((site) => (
                    <SiteList key={site.id} site={site} toggleSiteArchive={toggleSiteArchive} unpinSite={unpinSite} />
                  ))}
                </div>
              </div>
            )}

            {unpinnedSites.length > 0 && (
              <div>
                {pinnedSites.length > 0 && (
                  <div className="flex items-center mb-4">
                    <h2 className="text-sm text-gray-400 px-1">All Sites</h2>
                    <span className='flex h-5 w-5 items-center justify-center rounded-full bg-white/8 text-xs text-white/60'>{unpinnedSites.length}</span>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {unpinnedSites.map((site) => (
                    <SiteList key={site.id} site={site} toggleSiteArchive={toggleSiteArchive} pinSite={pinSite} />
                  ))}
                </div>
              </div>
            )}

            {archivedSites.length > 0 && (
              <div>
                {archivedSites.length > 0 && (
                  <div className="flex items-center mb-4">
                    <h2 className="text-sm text-gray-400 px-1">Archived Sites</h2>
                    <span className='flex h-5 w-5 items-center justify-center rounded-full bg-white/8 text-xs text-white/60'>{archivedSites.length}</span>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {archivedSites.map((site) => (
                    <SiteList key={site.id} site={site} toggleSiteArchive={toggleSiteArchive} pinSite={pinSite} />
                  ))}
                </div>
              </div>
            )}
          </div>
      </>
      ) : 
      <SitesEmptyState onCreateClick={() => setIsCreateModalOpen(true)} />
      }
      <CreateSiteModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateSite}
      />
    </div>
  );
}