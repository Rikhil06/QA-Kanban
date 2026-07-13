'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, Github, Check, Loader2, Link2, Trash2, RefreshCw, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import Link from 'next/link';

type GitHubStatus = { connected: boolean; githubLogin: string | null };
type Repo = { id: number; fullName: string; owner: string; name: string; private: boolean };
type SiteGitHubConfig = { repoOwner: string; repoName: string; enabled: boolean } | null;
type SiteMeta = { id: string; name: string; domain: string; slug: string } | null;

const B = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function SiteSettingsPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const router = useRouter();
  const searchParams = useSearchParams();
  const githubParam = searchParams.get('github');

  const [siteMeta, setSiteMeta] = useState<SiteMeta>(null);
  const [ghStatus, setGhStatus] = useState<GitHubStatus | null>(null);
  const [ghConfig, setGhConfig] = useState<SiteGitHubConfig>(null);
  const [repos, setRepos] = useState<Repo[]>([]);
  const [reposLoading, setReposLoading] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState('');
  const [saving, setSaving] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [repoSearch, setRepoSearch] = useState('');

  const loadData = useCallback(async () => {
    try {
      const [metaRes, statusRes] = await Promise.all([
        fetch(`${B}/api/site/${slug}/meta`, { credentials: 'include' }),
        fetch(`${B}/api/github/status`, { credentials: 'include' }),
      ]);
      const meta: SiteMeta = metaRes.ok ? await metaRes.json() : null;
      const status: GitHubStatus = statusRes.ok ? await statusRes.json() : { connected: false, githubLogin: null };
      setSiteMeta(meta);
      setGhStatus(status);

      if (meta && status.connected) {
        const configRes = await fetch(`${B}/api/github/sites/${meta.id}/integration`, { credentials: 'include' });
        setGhConfig(configRes.ok ? await configRes.json() : null);
      }
    } catch {
      toast.error('Failed to load integration data');
    }
  }, [slug]);

  useEffect(() => { loadData(); }, [loadData]);

  // Show toast based on redirect param from OAuth callback
  useEffect(() => {
    if (!githubParam) return;
    if (githubParam === 'connected') toast.success('GitHub connected successfully');
    if (githubParam === 'error') toast.error('GitHub connection failed — please try again');
    if (githubParam === 'cancelled') toast('GitHub connection cancelled');
    // Clean up the URL param
    const p = new URLSearchParams(searchParams.toString());
    p.delete('github');
    router.replace(`?${p.toString()}`, { scroll: false });
  }, [githubParam]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadRepos = async () => {
    setReposLoading(true);
    try {
      const res = await fetch(`${B}/api/github/repos`, { credentials: 'include' });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to fetch repos');
      }
      const data: Repo[] = await res.json();
      setRepos(data);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load repositories');
    } finally {
      setReposLoading(false);
    }
  };

  const connectGitHub = () => {
    window.location.href = `${B}/api/github/connect?siteSlug=${encodeURIComponent(slug)}`;
  };

  const disconnectGitHub = async () => {
    if (!confirm('Disconnect GitHub? This will remove the integration from all sites.')) return;
    setDisconnecting(true);
    try {
      await fetch(`${B}/api/github/disconnect`, { method: 'DELETE', credentials: 'include' });
      setGhStatus({ connected: false, githubLogin: null });
      setGhConfig(null);
      setRepos([]);
      toast.success('GitHub disconnected');
    } catch {
      toast.error('Failed to disconnect');
    } finally {
      setDisconnecting(false);
    }
  };

  const saveConfig = async () => {
    if (!selectedRepo || !siteMeta) return;
    const [owner, name] = selectedRepo.split('/');
    setSaving(true);
    try {
      const res = await fetch(`${B}/api/github/sites/${siteMeta.id}/integration`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoOwner: owner, repoName: name }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setGhConfig({ repoOwner: owner, repoName: name, enabled: true });
      setSelectedRepo('');
      toast.success(`Connected to ${owner}/${name}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save integration');
    } finally {
      setSaving(false);
    }
  };

  const removeConfig = async () => {
    if (!siteMeta || !confirm('Remove GitHub integration from this site?')) return;
    try {
      await fetch(`${B}/api/github/sites/${siteMeta.id}/integration`, { method: 'DELETE', credentials: 'include' });
      setGhConfig(null);
      toast.success('Integration removed');
    } catch {
      toast.error('Failed to remove integration');
    }
  };

  const filteredRepos = repos.filter((r) =>
    r.fullName.toLowerCase().includes(repoSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white">
      <div className="max-w-2xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <Link
            href={`/reports/${slug}`}
            className="p-2 rounded-lg hover:bg-white/6 text-white/40 hover:text-white/80 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <p className="text-xs text-white/30 uppercase tracking-widest font-medium mb-0.5">
              {siteMeta?.name || slug}
            </p>
            <h1 className="text-xl font-semibold text-white">Site Settings</h1>
          </div>
        </div>

        {/* GitHub Integration card */}
        <div className="rounded-2xl border border-white/10 bg-white/2 overflow-hidden">
          {/* Card header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/8">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/8 border border-white/10 flex items-center justify-center">
                <Github className="w-4.5 h-4.5 text-white/70" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">GitHub Issues</p>
                <p className="text-xs text-white/40">Automatically create a GitHub issue for every bug captured</p>
              </div>
            </div>
            {ghStatus?.connected && (
              <span className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Connected
              </span>
            )}
          </div>

          <div className="px-6 py-6 space-y-6">
            {/* Not connected state */}
            {!ghStatus?.connected && (
              <div className="text-center py-4">
                <p className="text-sm text-white/50 mb-5 leading-relaxed">
                  Connect your GitHub account to automatically sync bug reports as GitHub issues — including all metadata, browser info, and a link back to Annoture.
                </p>
                <button
                  onClick={connectGitHub}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-[#0F0F0F] font-semibold text-sm hover:bg-white/90 transition-all active:scale-95"
                >
                  <Github className="w-4 h-4" />
                  Connect GitHub
                </button>
              </div>
            )}

            {/* Connected — account info */}
            {ghStatus?.connected && (
              <>
                <div className="flex items-center justify-between p-4 rounded-xl bg-white/4 border border-white/8">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-semibold text-white/60">
                      {ghStatus.githubLogin?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm text-white font-medium">@{ghStatus.githubLogin}</p>
                      <p className="text-xs text-white/40">GitHub account</p>
                    </div>
                  </div>
                  <button
                    onClick={disconnectGitHub}
                    disabled={disconnecting}
                    className="flex items-center gap-1.5 text-xs text-white/40 hover:text-red-400 transition-colors"
                  >
                    {disconnecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    Disconnect
                  </button>
                </div>

                {/* Current config */}
                {ghConfig ? (
                  <div>
                    <p className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-3">Active repository</p>
                    <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/15">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">
                            {ghConfig.repoOwner}/{ghConfig.repoName}
                          </p>
                          <p className="text-xs text-white/40">Issues created here automatically</p>
                        </div>
                      </div>
                      <button
                        onClick={removeConfig}
                        className="text-xs text-white/30 hover:text-red-400 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
                    <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-white/50 leading-relaxed">
                      GitHub is connected but no repository is selected for this site. Choose one below.
                    </p>
                  </div>
                )}

                {/* Repo picker */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold text-white/30 uppercase tracking-widest">
                      {ghConfig ? 'Change repository' : 'Select a repository'}
                    </p>
                    <button
                      onClick={loadRepos}
                      disabled={reposLoading}
                      className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors"
                    >
                      <RefreshCw className={`w-3 h-3 ${reposLoading ? 'animate-spin' : ''}`} />
                      {repos.length ? 'Refresh' : 'Load repos'}
                    </button>
                  </div>

                  {repos.length === 0 && !reposLoading && (
                    <button
                      onClick={loadRepos}
                      className="w-full py-3 rounded-xl border border-dashed border-white/12 text-sm text-white/40 hover:text-white/60 hover:border-white/20 transition-all"
                    >
                      Click to load your repositories
                    </button>
                  )}

                  {reposLoading && (
                    <div className="flex items-center justify-center py-6">
                      <Loader2 className="w-5 h-5 animate-spin text-white/30" />
                    </div>
                  )}

                  {repos.length > 0 && (
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Search repositories…"
                        value={repoSearch}
                        onChange={(e) => setRepoSearch(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-white/25 transition-colors"
                      />
                      <div className="max-h-52 overflow-y-auto rounded-xl border border-white/8 divide-y divide-white/6">
                        {filteredRepos.slice(0, 50).map((repo) => (
                          <button
                            key={repo.id}
                            onClick={() => setSelectedRepo(repo.fullName === selectedRepo ? '' : repo.fullName)}
                            className={`w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors ${
                              selectedRepo === repo.fullName
                                ? 'bg-violet-500/10 text-violet-300'
                                : 'text-white/60 hover:bg-white/4 hover:text-white/80'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <Link2 className="w-3.5 h-3.5 shrink-0 opacity-50" />
                              <span className="text-sm truncate">{repo.fullName}</span>
                              {repo.private && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/8 text-white/30 shrink-0">
                                  private
                                </span>
                              )}
                            </div>
                            {selectedRepo === repo.fullName && (
                              <Check className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                            )}
                          </button>
                        ))}
                        {filteredRepos.length === 0 && (
                          <p className="px-4 py-3 text-sm text-white/30 text-center">No repositories match</p>
                        )}
                      </div>

                      {selectedRepo && (
                        <div className="flex items-center justify-between pt-2">
                          <p className="text-xs text-white/50">
                            New bug reports will create issues in <span className="text-white/80 font-medium">{selectedRepo}</span>
                          </p>
                          <button
                            onClick={saveConfig}
                            disabled={saving}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white text-[#0F0F0F] font-semibold text-sm hover:bg-white/90 transition-all active:scale-95 disabled:opacity-60 shrink-0 ml-4"
                          >
                            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                            Save
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* How it works */}
        <div className="mt-6 p-5 rounded-xl border border-white/6 bg-white/1">
          <p className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-3">How it works</p>
          <ol className="space-y-2">
            {[
              'Connect your GitHub account and select a repository for this site',
              'When a bug is captured via the Chrome extension, an issue is created in GitHub automatically',
              'The issue includes the screenshot URL, page URL, browser, OS, viewport, and DOM element',
              'The Annoture card links back to the GitHub issue so nothing is lost',
            ].map((step, i) => (
              <li key={i} className="flex gap-3 text-xs text-white/45 leading-relaxed">
                <span className="text-violet-400 font-semibold shrink-0 mt-0.5">{i + 1}.</span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
