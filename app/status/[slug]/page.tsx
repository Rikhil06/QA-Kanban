'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface StatusData {
  siteName: string;
  siteUrl: string;
  slug: string;
  total: number;
  counts: { new: number; inProgress: number; done: number; [key: string]: number };
  priorities: { urgent: number; high: number; medium: number; low: number; 'not assigned': number };
  lastUpdated: string | null;
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return 'Never';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return 'just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} minute${diffMin !== 1 ? 's' : ''} ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hour${diffHr !== 1 ? 's' : ''} ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay} day${diffDay !== 1 ? 's' : ''} ago`;
}

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-white/5 ${className ?? ''}`}
    />
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white">
      {/* Header */}
      <header className="border-b border-white/8 px-6 py-4 flex items-center justify-between">
        <SkeletonBlock className="h-6 w-28" />
        <SkeletonBlock className="h-5 w-36" />
      </header>

      <main className="max-w-3xl mx-auto px-6 py-14 space-y-10">
        {/* Hero */}
        <div className="space-y-3">
          <SkeletonBlock className="h-9 w-64" />
          <SkeletonBlock className="h-5 w-48" />
          <SkeletonBlock className="h-4 w-40" />
        </div>

        {/* Cards */}
        <div className="grid grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <SkeletonBlock key={i} className="h-28 rounded-xl" />
          ))}
        </div>

        {/* Health bar */}
        <div className="space-y-3">
          <SkeletonBlock className="h-4 w-40" />
          <SkeletonBlock className="h-2 w-full rounded-full" />
          <SkeletonBlock className="h-4 w-32" />
        </div>

        {/* Priority breakdown */}
        <div className="space-y-3">
          <SkeletonBlock className="h-5 w-28" />
          {[0, 1, 2, 3, 4].map((i) => (
            <SkeletonBlock key={i} className="h-8 w-full rounded-lg" />
          ))}
        </div>
      </main>
    </div>
  );
}

export default function StatusPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [data, setData] = useState<StatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

    fetch(`${backendUrl}/api/site/${slug}/public-status`)
      .then(async (res) => {
        if (res.status === 404) {
          setNotFound(true);
          return;
        }
        if (!res.ok) {
          setNotFound(true);
          return;
        }
        const json = await res.json();
        setData(json);
      })
      .catch(() => {
        setNotFound(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [slug]);

  if (loading) return <LoadingSkeleton />;

  if (notFound || !data) {
    return (
      <div className="min-h-screen bg-[#0F0F0F] text-white flex flex-col items-center justify-center gap-4 px-6">
        <p className="text-5xl font-bold text-white/10">404</p>
        <h1 className="text-2xl font-semibold text-white">Status page not found</h1>
        <p className="text-white/40 text-sm text-center max-w-xs">
          No status page exists for <span className="font-mono text-white/60">{slug}</span>. Check
          the URL or contact the site owner.
        </p>
        <a
          href="https://annoture.com"
          className="mt-4 text-xs text-white/30 hover:text-white/50 transition-colors"
        >
          Powered by Annoture
        </a>
      </div>
    );
  }

  const { siteName, siteUrl, total, counts, priorities, lastUpdated } = data;
  const resolvedPct = total > 0 ? Math.round((counts.done / total) * 100) : 0;

  const priorityRows: { label: string; key: keyof typeof priorities; color: string; barColor: string }[] = [
    { label: 'Urgent', key: 'urgent', color: 'text-red-400', barColor: 'bg-red-500' },
    { label: 'High', key: 'high', color: 'text-orange-400', barColor: 'bg-orange-500' },
    { label: 'Medium', key: 'medium', color: 'text-yellow-400', barColor: 'bg-yellow-500' },
    { label: 'Low', key: 'low', color: 'text-sky-400', barColor: 'bg-sky-500' },
    { label: 'Unassigned', key: 'not assigned', color: 'text-white/30', barColor: 'bg-white/20' },
  ];

  const maxPriority = Math.max(...Object.values(priorities), 1);

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white">
      {/* Header */}
      <header className="border-b border-white/[0.08] px-6 py-4 flex items-center justify-between sticky top-0 z-10 bg-[#0F0F0F]/90 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-sky-500/20 border border-sky-500/30">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="7" cy="7" r="3" fill="#38bdf8" />
              <circle cx="7" cy="7" r="6" stroke="#38bdf8" strokeWidth="1.5" strokeOpacity="0.4" />
            </svg>
          </span>
          <span className="text-sm font-semibold tracking-tight text-white">QA Status</span>
        </div>
        <span className="text-xs text-white/30">
          Powered by{' '}
          <a
            href="https://annoture.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/50 hover:text-white/70 transition-colors"
          >
            Annoture
          </a>
        </span>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-14 space-y-12">
        {/* Hero */}
        <section className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-white">{siteName}</h1>
          <a
            href={siteUrl.startsWith('http') ? siteUrl : `https://${siteUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-white/40 hover:text-white/60 transition-colors break-all"
          >
            {siteUrl}
          </a>
          <p className="text-xs text-white/25 pt-1">
            Last updated: {timeAgo(lastUpdated)}
          </p>
        </section>

        {/* Status cards */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Open */}
          <div className="rounded-xl border border-sky-500/20 bg-sky-500/10 px-5 py-5 flex flex-col gap-3">
            <span className="text-xs font-medium text-sky-400/70 uppercase tracking-widest">Open</span>
            <span className="text-4xl font-bold text-sky-400">{counts.new}</span>
            <span className="text-xs text-white/30">New issues</span>
          </div>

          {/* In Progress */}
          <div className="rounded-xl border border-orange-500/20 bg-orange-500/10 px-5 py-5 flex flex-col gap-3">
            <span className="text-xs font-medium text-orange-400/70 uppercase tracking-widest">In Progress</span>
            <span className="text-4xl font-bold text-orange-400">{counts.inProgress}</span>
            <span className="text-xs text-white/30">Being worked on</span>
          </div>

          {/* Resolved */}
          <div className="rounded-xl border border-green-500/20 bg-green-500/10 px-5 py-5 flex flex-col gap-3">
            <span className="text-xs font-medium text-green-400/70 uppercase tracking-widest">Resolved</span>
            <span className="text-4xl font-bold text-green-400">{counts.done}</span>
            <span className="text-xs text-white/30">Issues closed</span>
          </div>
        </section>

        {/* Health bar */}
        <section className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/50 font-medium">Resolution progress</span>
            {total === 0 ? (
              <span className="text-white/30 text-xs">No issues reported</span>
            ) : resolvedPct === 100 ? (
              <span className="text-green-400 text-xs font-semibold">All issues resolved</span>
            ) : (
              <span className="text-white/30 text-xs">{resolvedPct}% resolved</span>
            )}
          </div>

          <div className="h-2 w-full rounded-full bg-white/[0.06] overflow-hidden">
            {total > 0 && (
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  resolvedPct === 100 ? 'bg-green-500' : 'bg-sky-500'
                }`}
                style={{ width: `${resolvedPct}%` }}
              />
            )}
          </div>

          {total === 0 ? (
            <p className="text-xs text-white/25">No issues have been reported yet for this site.</p>
          ) : (
            <p className="text-xs text-white/25">
              {counts.done} of {total} issue{total !== 1 ? 's' : ''} resolved
            </p>
          )}
        </section>

        {/* Priority breakdown */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-white/60 uppercase tracking-widest">
            By Priority
          </h2>

          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden divide-y divide-white/[0.05]">
            {priorityRows.map(({ label, key, color, barColor }) => {
              const count = priorities[key] ?? 0;
              const pct = total > 0 ? (count / maxPriority) * 100 : 0;
              return (
                <div key={key} className="flex items-center gap-4 px-5 py-3.5">
                  <span className={`w-20 text-xs font-medium shrink-0 ${color}`}>{label}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${barColor}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-6 text-right text-xs text-white/40 shrink-0 tabular-nums">{count}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Divider */}
        <div className="border-t border-white/[0.06]" />

        {/* Footer */}
        <footer className="text-center space-y-1 pb-4">
          <p className="text-xs text-white/25">
            This status page is read-only and publicly accessible.
          </p>
          <p className="text-xs text-white/15">
            Powered by{' '}
            <a
              href="https://annoture.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white/30 transition-colors"
            >
              Annoture
            </a>
          </p>
        </footer>
      </main>
    </div>
  );
}
