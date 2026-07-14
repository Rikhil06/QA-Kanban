'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, Github, Check, Loader2, Link2, Trash2, RefreshCw, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import Link from 'next/link';

type GitHubStatus = { connected: boolean; githubLogin: string | null };
type JiraStatus   = { connected: boolean };
type GHRepo       = { id: number; fullName: string; owner: string; name: string; private: boolean };
type JiraCloud    = { id: string; name: string; url: string };
type JiraProject  = { key: string; name: string };
type GHConfig     = { repoOwner: string; repoName: string; enabled: boolean } | null;
type JiraConfig   = { cloudId: string; cloudUrl: string; projectKey: string; issueType: string; enabled: boolean } | null;
type SiteMeta     = { id: string; name: string; domain: string; slug: string } | null;

const B = process.env.NEXT_PUBLIC_BACKEND_URL;

// ── Jira logo SVG ──────────────────────────────────────────────────────────────
function JiraIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.53 2.001a.75.75 0 0 0-.55.22L2.22 10.98a.75.75 0 0 0 0 1.06l3.4 3.4 5.91-5.91 5.91 5.91 3.4-3.4a.75.75 0 0 0 0-1.06L12.08 2.22a.75.75 0 0 0-.55-.22zm.55 9.94-5.91 5.91 3.4 3.4a.75.75 0 0 0 1.06 0l3.36-3.36z"/>
    </svg>
  );
}

export default function SiteSettingsPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const router = useRouter();
  const searchParams = useSearchParams();

  const [siteMeta, setSiteMeta]       = useState<SiteMeta>(null);

  // GitHub state
  const [ghStatus, setGhStatus]       = useState<GitHubStatus | null>(null);
  const [ghConfig, setGhConfig]       = useState<GHConfig>(null);
  const [repos, setRepos]             = useState<GHRepo[]>([]);
  const [reposLoading, setReposLoading] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState('');
  const [ghSaving, setGhSaving]       = useState(false);
  const [ghDisconnecting, setGhDisconnecting] = useState(false);
  const [repoSearch, setRepoSearch]   = useState('');

  // Jira state
  const [jiraStatus, setJiraStatus]   = useState<JiraStatus | null>(null);
  const [jiraConfig, setJiraConfig]   = useState<JiraConfig>(null);
  const [clouds, setClouds]           = useState<JiraCloud[]>([]);
  const [projects, setProjects]       = useState<JiraProject[]>([]);
  const [cloudsLoading, setCloudsLoading] = useState(false);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [selectedCloud, setSelectedCloud] = useState<JiraCloud | null>(null);
  const [selectedProject, setSelectedProject] = useState('');
  const [jiraSaving, setJiraSaving]   = useState(false);
  const [jiraDisconnecting, setJiraDisconnecting] = useState(false);
  const [projectSearch, setProjectSearch] = useState('');

  const loadData = useCallback(async () => {
    try {
      const [metaRes, ghRes, jiraRes] = await Promise.all([
        fetch(`${B}/api/site/${slug}/meta`, { credentials: 'include' }),
        fetch(`${B}/api/github/status`, { credentials: 'include' }),
        fetch(`${B}/api/jira/status`, { credentials: 'include' }),
      ]);
      const meta: SiteMeta   = metaRes.ok  ? await metaRes.json()  : null;
      const gh: GitHubStatus = ghRes.ok    ? await ghRes.json()    : { connected: false, githubLogin: null };
      const jira: JiraStatus = jiraRes.ok  ? await jiraRes.json()  : { connected: false };
      setSiteMeta(meta);
      setGhStatus(gh);
      setJiraStatus(jira);

      if (meta) {
        const [ghCfgRes, jiraCfgRes] = await Promise.all([
          gh.connected   ? fetch(`${B}/api/github/sites/${meta.id}/integration`, { credentials: 'include' }) : Promise.resolve(null),
          jira.connected ? fetch(`${B}/api/jira/sites/${meta.id}/integration`,   { credentials: 'include' }) : Promise.resolve(null),
        ]);
        setGhConfig(ghCfgRes?.ok   ? await ghCfgRes.json()   : null);
        setJiraConfig(jiraCfgRes?.ok ? await jiraCfgRes.json() : null);
      }
    } catch {
      toast.error('Failed to load integration data');
    }
  }, [slug]);

  useEffect(() => { loadData(); }, [loadData]);

  // Handle OAuth callback params
  useEffect(() => {
    const gh   = searchParams.get('github');
    const jira = searchParams.get('jira');
    if (!gh && !jira) return;
    if (gh === 'connected')   toast.success('GitHub connected successfully');
    if (gh === 'error')       toast.error('GitHub connection failed — please try again');
    if (gh === 'cancelled')   toast('GitHub connection cancelled');
    if (jira === 'connected') { toast.success('Jira connected successfully'); loadData(); }
    if (jira === 'error')     toast.error('Jira connection failed — please try again');
    if (jira === 'cancelled') toast('Jira connection cancelled');
    const p = new URLSearchParams(searchParams.toString());
    p.delete('github'); p.delete('jira');
    router.replace(p.size ? `?${p.toString()}` : window.location.pathname, { scroll: false });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── GitHub helpers ─────────────────────────────────────────────────────────
  const loadRepos = async () => {
    setReposLoading(true);
    try {
      const res = await fetch(`${B}/api/github/repos`, { credentials: 'include' });
      if (!res.ok) throw new Error((await res.json()).error);
      setRepos(await res.json());
    } catch (e: any) {
      toast.error(e.message || 'Failed to load repos');
    } finally { setReposLoading(false); }
  };

  const saveGHConfig = async () => {
    if (!selectedRepo || !siteMeta) return;
    const [owner, name] = selectedRepo.split('/');
    setGhSaving(true);
    try {
      const res = await fetch(`${B}/api/github/sites/${siteMeta.id}/integration`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoOwner: owner, repoName: name }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setGhConfig({ repoOwner: owner, repoName: name, enabled: true });
      setSelectedRepo('');
      toast.success(`Connected to ${owner}/${name}`);
    } catch (e: any) {
      toast.error(e.message || 'Failed to save');
    } finally { setGhSaving(false); }
  };

  const removeGHConfig = async () => {
    if (!siteMeta || !confirm('Remove GitHub integration from this site?')) return;
    await fetch(`${B}/api/github/sites/${siteMeta.id}/integration`, { method: 'DELETE', credentials: 'include' });
    setGhConfig(null);
    toast.success('GitHub integration removed');
  };

  const disconnectGH = async () => {
    if (!confirm('Disconnect GitHub? This removes the integration from all sites.')) return;
    setGhDisconnecting(true);
    try {
      await fetch(`${B}/api/github/disconnect`, { method: 'DELETE', credentials: 'include' });
      setGhStatus({ connected: false, githubLogin: null });
      setGhConfig(null); setRepos([]);
      toast.success('GitHub disconnected');
    } catch { toast.error('Failed to disconnect'); }
    finally { setGhDisconnecting(false); }
  };

  // ── Jira helpers ───────────────────────────────────────────────────────────
  const loadClouds = async () => {
    setCloudsLoading(true);
    try {
      const res = await fetch(`${B}/api/jira/clouds`, { credentials: 'include' });
      if (!res.ok) throw new Error((await res.json()).error);
      const data: JiraCloud[] = await res.json();
      setClouds(data);
      if (data.length === 1) {
        setSelectedCloud(data[0]);
        loadProjects(data[0].id);
      }
    } catch (e: any) {
      toast.error(e.message || 'Failed to load Jira sites');
    } finally { setCloudsLoading(false); }
  };

  const loadProjects = async (cloudId: string) => {
    setProjectsLoading(true);
    try {
      const res = await fetch(`${B}/api/jira/clouds/${cloudId}/projects`, { credentials: 'include' });
      if (!res.ok) throw new Error((await res.json()).error);
      setProjects(await res.json());
    } catch (e: any) {
      toast.error(e.message || 'Failed to load projects');
    } finally { setProjectsLoading(false); }
  };

  const saveJiraConfig = async () => {
    if (!selectedCloud || !selectedProject || !siteMeta) return;
    setJiraSaving(true);
    try {
      const res = await fetch(`${B}/api/jira/sites/${siteMeta.id}/integration`, {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cloudId: selectedCloud.id, cloudUrl: selectedCloud.url, projectKey: selectedProject }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setJiraConfig({ cloudId: selectedCloud.id, cloudUrl: selectedCloud.url, projectKey: selectedProject, issueType: 'Bug', enabled: true });
      setSelectedCloud(null); setSelectedProject(''); setClouds([]); setProjects([]);
      toast.success(`Connected to Jira project ${selectedProject}`);
    } catch (e: any) {
      toast.error(e.message || 'Failed to save Jira integration');
    } finally { setJiraSaving(false); }
  };

  const removeJiraConfig = async () => {
    if (!siteMeta || !confirm('Remove Jira integration from this site?')) return;
    await fetch(`${B}/api/jira/sites/${siteMeta.id}/integration`, { method: 'DELETE', credentials: 'include' });
    setJiraConfig(null);
    toast.success('Jira integration removed');
  };

  const disconnectJira = async () => {
    if (!confirm('Disconnect Jira? This removes the integration from all sites.')) return;
    setJiraDisconnecting(true);
    try {
      await fetch(`${B}/api/jira/disconnect`, { method: 'DELETE', credentials: 'include' });
      setJiraStatus({ connected: false }); setJiraConfig(null); setClouds([]); setProjects([]);
      toast.success('Jira disconnected');
    } catch { toast.error('Failed to disconnect'); }
    finally { setJiraDisconnecting(false); }
  };

  const filteredRepos     = repos.filter(r => r.fullName.toLowerCase().includes(repoSearch.toLowerCase()));
  const filteredProjects  = projects.filter(p => `${p.key} ${p.name}`.toLowerCase().includes(projectSearch.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white">
      <div className="max-w-2xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <Link href={`/reports/${slug}`} className="p-2 rounded-lg hover:bg-white/6 text-white/40 hover:text-white/80 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <p className="text-xs text-white/30 uppercase tracking-widest font-medium mb-0.5">{siteMeta?.name || slug}</p>
            <h1 className="text-xl font-semibold text-white">Site Settings</h1>
          </div>
        </div>

        <div className="space-y-4">

          {/* ── GitHub card ───────────────────────────────────────────────── */}
          <IntegrationCard
            icon={<Github className="w-4 h-4 text-white/70" />}
            title="GitHub Issues"
            description="Automatically create a GitHub issue for every bug captured"
            connected={!!ghStatus?.connected}
          >
            {!ghStatus?.connected ? (
              <div className="text-center py-2">
                <p className="text-sm text-white/50 mb-5 leading-relaxed">
                  Connect your GitHub account to automatically sync bug reports as GitHub issues — including screenshot, browser info, and metadata.
                </p>
                <button
                  onClick={() => { window.location.href = `${B}/api/github/connect?siteSlug=${encodeURIComponent(slug)}`; }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-[#0F0F0F] font-semibold text-sm hover:bg-white/90 transition-all active:scale-95"
                >
                  <Github className="w-4 h-4" /> Connect GitHub
                </button>
              </div>
            ) : (
              <>
                {/* Account row */}
                <AccountRow
                  avatar={ghStatus.githubLogin?.[0]?.toUpperCase()}
                  label={`@${ghStatus.githubLogin}`}
                  sublabel="GitHub account"
                  onDisconnect={disconnectGH}
                  disconnecting={ghDisconnecting}
                />

                {/* Active config */}
                {ghConfig ? (
                  <ActiveConfig
                    label={`${ghConfig.repoOwner}/${ghConfig.repoName}`}
                    sublabel="Issues created here automatically"
                    onRemove={removeGHConfig}
                  />
                ) : (
                  <NoConfigWarning text="GitHub is connected but no repository is selected for this site." />
                )}

                {/* Repo picker */}
                <PickerSection
                  heading={ghConfig ? 'Change repository' : 'Select a repository'}
                  onRefresh={loadRepos}
                  refreshing={reposLoading}
                  hasItems={repos.length > 0}
                  emptyLabel="Click to load your repositories"
                >
                  {repos.length > 0 && (
                    <>
                      <input
                        type="text" placeholder="Search repositories…" value={repoSearch}
                        onChange={e => setRepoSearch(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-white/25 transition-colors"
                      />
                      <div className="max-h-52 overflow-y-auto rounded-xl border border-white/8 divide-y divide-white/6">
                        {filteredRepos.slice(0, 50).map(repo => (
                          <PickerRow
                            key={repo.id}
                            label={repo.fullName}
                            badge={repo.private ? 'private' : undefined}
                            selected={selectedRepo === repo.fullName}
                            onClick={() => setSelectedRepo(repo.fullName === selectedRepo ? '' : repo.fullName)}
                          />
                        ))}
                        {filteredRepos.length === 0 && <EmptyPickerRow />}
                      </div>
                      {selectedRepo && (
                        <SaveRow
                          label={`Issues will go to `}
                          value={selectedRepo}
                          saving={ghSaving}
                          onSave={saveGHConfig}
                        />
                      )}
                    </>
                  )}
                </PickerSection>
              </>
            )}
          </IntegrationCard>

          {/* ── Jira card ─────────────────────────────────────────────────── */}
          <IntegrationCard
            icon={<JiraIcon className="w-4 h-4 text-[#0052CC]" />}
            title="Jira Issues"
            description="Automatically create a Jira issue for every bug captured"
            connected={!!jiraStatus?.connected}
          >
            {!jiraStatus?.connected ? (
              <div className="text-center py-2">
                <p className="text-sm text-white/50 mb-5 leading-relaxed">
                  Connect your Atlassian account to automatically create Jira issues — including screenshot, browser info, and all bug metadata.
                </p>
                <button
                  onClick={() => { window.location.href = `${B}/api/jira/connect?siteSlug=${encodeURIComponent(slug)}`; }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0052CC] text-white font-semibold text-sm hover:bg-[#0047B3] transition-all active:scale-95"
                >
                  <JiraIcon className="w-4 h-4" /> Connect Jira
                </button>
              </div>
            ) : (
              <>
                {/* Account row */}
                <AccountRow
                  avatar="J"
                  label="Atlassian account"
                  sublabel="Jira connected"
                  onDisconnect={disconnectJira}
                  disconnecting={jiraDisconnecting}
                />

                {/* Active config */}
                {jiraConfig ? (
                  <ActiveConfig
                    label={`${jiraConfig.projectKey} — ${jiraConfig.cloudUrl.replace('https://', '')}`}
                    sublabel={`Issue type: ${jiraConfig.issueType}`}
                    onRemove={removeJiraConfig}
                  />
                ) : (
                  <NoConfigWarning text="Jira is connected but no project is selected for this site." />
                )}

                {/* Cloud + project picker */}
                <PickerSection
                  heading={jiraConfig ? 'Change project' : 'Select a project'}
                  onRefresh={loadClouds}
                  refreshing={cloudsLoading}
                  hasItems={clouds.length > 0 || projects.length > 0}
                  emptyLabel="Click to load your Jira sites"
                >
                  {/* Cloud selector (if multiple) */}
                  {clouds.length > 1 && (
                    <div className="rounded-xl border border-white/8 divide-y divide-white/6">
                      {clouds.map(cloud => (
                        <PickerRow
                          key={cloud.id}
                          label={cloud.name}
                          badge={cloud.url.replace('https://', '')}
                          selected={selectedCloud?.id === cloud.id}
                          onClick={() => {
                            setSelectedCloud(cloud);
                            setProjects([]);
                            setSelectedProject('');
                            loadProjects(cloud.id);
                          }}
                        />
                      ))}
                    </div>
                  )}

                  {/* Projects list */}
                  {projectsLoading && (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="w-5 h-5 animate-spin text-white/30" />
                    </div>
                  )}
                  {projects.length > 0 && (
                    <>
                      <input
                        type="text" placeholder="Search projects…" value={projectSearch}
                        onChange={e => setProjectSearch(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-white/25 transition-colors"
                      />
                      <div className="max-h-52 overflow-y-auto rounded-xl border border-white/8 divide-y divide-white/6">
                        {filteredProjects.slice(0, 50).map(p => (
                          <PickerRow
                            key={p.key}
                            label={p.name}
                            badge={p.key}
                            selected={selectedProject === p.key}
                            onClick={() => setSelectedProject(p.key === selectedProject ? '' : p.key)}
                          />
                        ))}
                        {filteredProjects.length === 0 && <EmptyPickerRow />}
                      </div>
                      {selectedProject && selectedCloud && (
                        <SaveRow
                          label="Issues will go to project "
                          value={selectedProject}
                          saving={jiraSaving}
                          onSave={saveJiraConfig}
                        />
                      )}
                    </>
                  )}
                </PickerSection>
              </>
            )}
          </IntegrationCard>

        </div>

        {/* How it works */}
        <div className="mt-6 p-5 rounded-xl border border-white/6 bg-white/1">
          <p className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-3">How it works</p>
          <ol className="space-y-2">
            {[
              'Connect GitHub or Jira and select a repo/project for this site',
              'When a bug is captured via the Chrome extension, an issue is created automatically',
              'The issue includes the screenshot, page URL, browser, OS, viewport, and DOM element',
              'The Annoture card links back to the GitHub/Jira issue so nothing is lost',
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

// ── Shared sub-components ──────────────────────────────────────────────────────

function IntegrationCard({ icon, title, description, connected, children }: {
  icon: React.ReactNode; title: string; description: string; connected: boolean; children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/2 overflow-hidden">
      <div className="flex items-center justify-between px-6 py-5 border-b border-white/8">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/8 border border-white/10 flex items-center justify-center">{icon}</div>
          <div>
            <p className="text-sm font-semibold text-white">{title}</p>
            <p className="text-xs text-white/40">{description}</p>
          </div>
        </div>
        {connected && (
          <span className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Connected
          </span>
        )}
      </div>
      <div className="px-6 py-6 space-y-5">{children}</div>
    </div>
  );
}

function AccountRow({ avatar, label, sublabel, onDisconnect, disconnecting }: {
  avatar?: string; label: string; sublabel: string; onDisconnect: () => void; disconnecting: boolean;
}) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-white/4 border border-white/8">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-semibold text-white/60">
          {avatar}
        </div>
        <div>
          <p className="text-sm text-white font-medium">{label}</p>
          <p className="text-xs text-white/40">{sublabel}</p>
        </div>
      </div>
      <button
        onClick={onDisconnect} disabled={disconnecting}
        className="flex items-center gap-1.5 text-xs text-white/40 hover:text-red-400 transition-colors"
      >
        {disconnecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
        Disconnect
      </button>
    </div>
  );
}

function ActiveConfig({ label, sublabel, onRemove }: { label: string; sublabel: string; onRemove: () => void }) {
  return (
    <div>
      <p className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-3">Active</p>
      <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/15">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{label}</p>
            <p className="text-xs text-white/40">{sublabel}</p>
          </div>
        </div>
        <button onClick={onRemove} className="text-xs text-white/30 hover:text-red-400 transition-colors">Remove</button>
      </div>
    </div>
  );
}

function NoConfigWarning({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/15">
      <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
      <p className="text-xs text-white/50 leading-relaxed">{text}</p>
    </div>
  );
}

function PickerSection({ heading, onRefresh, refreshing, hasItems, emptyLabel, children }: {
  heading: string; onRefresh: () => void; refreshing: boolean; hasItems: boolean; emptyLabel: string; children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-white/30 uppercase tracking-widest">{heading}</p>
        <button onClick={onRefresh} disabled={refreshing} className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors">
          <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
          {hasItems ? 'Refresh' : 'Load'}
        </button>
      </div>
      {!hasItems && !refreshing && (
        <button onClick={onRefresh} className="w-full py-3 rounded-xl border border-dashed border-white/12 text-sm text-white/40 hover:text-white/60 hover:border-white/20 transition-all">
          {emptyLabel}
        </button>
      )}
      {refreshing && !hasItems && (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="w-5 h-5 animate-spin text-white/30" />
        </div>
      )}
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function PickerRow({ label, badge, selected, onClick }: { label: string; badge?: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-4 py-2.5 text-left transition-colors ${
        selected ? 'bg-violet-500/10 text-violet-300' : 'text-white/60 hover:bg-white/4 hover:text-white/80'
      }`}
    >
      <div className="flex items-center gap-2 min-w-0">
        <Link2 className="w-3.5 h-3.5 shrink-0 opacity-50" />
        <span className="text-sm truncate">{label}</span>
        {badge && <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/8 text-white/30 shrink-0">{badge}</span>}
      </div>
      {selected && <Check className="w-3.5 h-3.5 text-violet-400 shrink-0" />}
    </button>
  );
}

function EmptyPickerRow() {
  return <p className="px-4 py-3 text-sm text-white/30 text-center">No results</p>;
}

function SaveRow({ label, value, saving, onSave }: { label: string; value: string; saving: boolean; onSave: () => void }) {
  return (
    <div className="flex items-center justify-between pt-1">
      <p className="text-xs text-white/50">
        {label}<span className="text-white/80 font-medium">{value}</span>
      </p>
      <button
        onClick={onSave} disabled={saving}
        className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white text-[#0F0F0F] font-semibold text-sm hover:bg-white/90 transition-all active:scale-95 disabled:opacity-60 shrink-0 ml-4"
      >
        {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
        Save
      </button>
    </div>
  );
}
