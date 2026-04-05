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
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'active' | 'archived'
  >('all');
  const [environmentFilter, setEnvironmentFilter] = useState<
    'all' | 'Prod' | 'Staging' | 'UAT'
  >('all');
  const [sortBy, setSortBy] = useState<
    'lastUpdated' | 'openIssues' | 'alphabetical'
  >('lastUpdated');
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
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/site/${id}/archive`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ archived: shouldArchive }),
      },
    );

    if (!res.ok) {
      const { error } = await res.json();
      throw new Error(error);
    }
    setSites((prevSites) =>
      prevSites.map((site) =>
        stripTLD(site.slug) === id
          ? { ...site, siteStatus: shouldArchive ? 'archived' : 'active' }
          : site,
      ),
    );
    return res.json(); // optional, to show a toast or reload data
  }

  async function pinSite(id: string) {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/site/${id}/pin`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isPinned: true }),
      },
    );

    setSites((prev) =>
      prev.map((site) =>
        stripTLD(site.slug) === id ? { ...site, isPinned: true } : site,
      ),
    );

    if (!res.ok) {
      const { error } = await res.json();

      setSites((prev) =>
        prev.map((site) =>
          stripTLD(site.slug) === id ? { ...site, isPinned: false } : site,
        ),
      );

      throw new Error(error);
    }

    return res.json();
  }

  async function unpinSite(id: string) {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/site/${id}/unpin`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    );

    setSites((prev) =>
      prev.map((site) =>
        stripTLD(site.slug) === id ? { ...site, isPinned: false } : site,
      ),
    );

    if (!res.ok) {
      const { error } = await res.json();

      setSites((prev) =>
        prev.map((site) =>
          stripTLD(site.slug) === id ? { ...site, isPinned: true } : site,
        ),
      );

      throw new Error(error);
    }

    return res.json();
  }

  const filteredSites = sites
    .filter((site) => {
      const matchesSearch =
        site.site.toLowerCase().includes(searchQuery.toLowerCase()) ||
        site.siteName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === 'all' || site.siteStatus === statusFilter;
      // const matchesEnvironment = environmentFilter === 'all' || site.environment === environmentFilter;
      return site && matchesSearch && matchesStatus;
    })
    .sort((a: any, b: any) => {
      if (sortBy === 'alphabetical') {
        return a.siteName.localeCompare(b.siteName);
      } else if (sortBy === 'openIssues') {
        return b.counts.new - a.counts.new;
      }
      // Default: lastUpdated (mock sorting by id for demo)
      return parseInt(b.id) - parseInt(a.id);
    });

  const pinnedSites = filteredSites.filter((site) => site.isPinned);
  const unpinnedSites = filteredSites.filter(
    (site) => !site.isPinned && site.siteStatus !== 'archived',
  );
  const archivedSites = filteredSites.filter(
    (site) => site.siteStatus === 'archived',
  );

  const handleCreateSite = async (name: string, url: string) => {
    await fetch('${process.env.NEXT_PUBLIC_BACKEND_URL}/sites/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: name,
        url: url,
        teamId: user?.teamId || null, // optional
      }),
    });

    // setSites([...sites, newSite]);
    // setShowEmptyState(false); // Show the sites grid after creating
  };

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
    <div className="max-w-11/12 mx-auto mt-12 md:mb-12">
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
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/8 text-xs text-white/60">
                    {pinnedSites.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
                  {pinnedSites.map((site) => (
                    <SiteList
                      key={site.id}
                      site={site}
                      toggleSiteArchive={toggleSiteArchive}
                      unpinSite={unpinSite}
                    />
                  ))}
                </div>
              </div>
            )}

            {unpinnedSites.length > 0 && (
              <div>
                {pinnedSites.length > 0 && (
                  <div className="flex items-center mb-4">
                    <h2 className="text-sm text-gray-400 px-1">All Sites</h2>
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/8 text-xs text-white/60">
                      {unpinnedSites.length}
                    </span>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {unpinnedSites.map((site) => (
                    <SiteList
                      key={site.id}
                      site={site}
                      toggleSiteArchive={toggleSiteArchive}
                      pinSite={pinSite}
                    />
                  ))}
                </div>
              </div>
            )}

            {archivedSites.length > 0 && (
              <div>
                {archivedSites.length > 0 && (
                  <div className="flex items-center mb-4">
                    <h2 className="text-sm text-gray-400 px-1">
                      Archived Sites
                    </h2>
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/8 text-xs text-white/60">
                      {archivedSites.length}
                    </span>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {archivedSites.map((site) => (
                    <SiteList
                      key={site.id}
                      site={site}
                      toggleSiteArchive={toggleSiteArchive}
                      pinSite={pinSite}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <SitesEmptyState onCreateClick={() => setIsCreateModalOpen(true)} />
      )}
      <CreateSiteModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateSite}
      />
    </div>
  );
}
