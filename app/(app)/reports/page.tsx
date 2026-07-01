'use client';

import SiteList from '@/components/cards/SitesCard';
import { CreateSiteModal } from '@/components/CreateSiteModal';
import { SitesEmptyState } from '@/components/emptyStates/Sites';
import { SitesFilter } from '@/components/filter/SitesFilter';
import { useUser } from '@/context/UserContext';
import { fetchSites } from '@/lib/fetchSites';
import { Site } from '@/types/types';
import { stripTLD } from '@/utils/stripTLD';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

function SiteCardSkeleton() {
  return (
    <div className="relative bg-[#1C1C1C] border border-white/8 rounded-xl p-5 animate-pulse">
      {/* colour bar */}
      <div className="absolute top-0 left-0 right-0 h-1 rounded-t-xl bg-white/8" />

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0 space-y-2">
          <div className="h-4 w-2/3 rounded bg-white/10" />
          <div className="h-3 w-1/2 rounded bg-white/6" />
        </div>
        <div className="w-6 h-6 rounded-lg bg-white/6 ml-3 shrink-0" />
      </div>

      {/* Badge */}
      <div className="mb-4">
        <div className="h-6 w-14 rounded-md bg-white/6" />
      </div>

      {/* Stats */}
      <div className="mb-4 space-y-2">
        <div className="flex justify-between">
          <div className="h-3.5 w-20 rounded bg-white/6" />
          <div className="h-3.5 w-6 rounded bg-white/10" />
        </div>
      </div>

      {/* Avatars */}
      <div className="mb-4 flex items-center gap-1">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="w-7 h-7 rounded-full bg-white/8" />
        ))}
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-white/6 flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
        <div className="h-3 w-16 rounded bg-white/6" />
      </div>
    </div>
  );
}

export default function SitesPage() {
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

  const teamId = user?.teamId;

  useEffect(() => {
    if (!teamId) return;
    const getSites = async () => {
      const data = await fetchSites(teamId);
      setSites(data);
      setLoading(false);
    };

    getSites();
  }, [teamId]);

  async function deleteSite(slug: string) {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/site/${slug}`,
      {
        method: 'DELETE',
        credentials: 'include',
      },
    );

    if (!res.ok) {
      const { error } = await res.json();
      throw new Error(error);
    }

    setSites((prev) => prev.filter((site) => stripTLD(site.slug) !== slug));
  }

  async function toggleSiteArchive(id: string, shouldArchive: boolean) {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/site/${id}/archive`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
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
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
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
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
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
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/sites/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name, url, teamId: user?.teamId || null }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      const isLimitError = res.status === 403 || res.status === 402;
      if (isLimitError) {
        toast.error(
          <span>
            {data.error || 'Site limit reached.'}{' '}
            <a href="/usage-billing" className="underline font-medium">Upgrade plan →</a>
          </span>,
          { autoClose: 6000 },
        );
      } else {
        toast.error(data.error || 'Failed to create site');
      }
      return;
    }

    // Refetch the full sites list so we get the correctly-shaped objects
    const refreshed = await fetchSites(user?.teamId);
    setSites(refreshed);
    setShowEmptyState(false);
  };

  if (loading)
    return (
      <div className="max-w-11/12 mx-auto mt-12 md:mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <SiteCardSkeleton key={i} />)}
        </div>
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
                      deleteSite={deleteSite}
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
                      deleteSite={deleteSite}
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
                      deleteSite={deleteSite}
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
