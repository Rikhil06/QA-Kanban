'use client';

import { useEffect, useRef, useState } from 'react';
import { X, Link2, UserMinus, ChevronDown, Check, Send, Clock } from 'lucide-react';
import { getToken } from '@/lib/auth';
import { motion, AnimatePresence } from 'motion/react';

interface AccessEntry {
  id: string;
  role: string;
  createdAt: string;
  user: { id: string; name: string; email: string };
}

interface PendingEntry {
  id: string;
  email: string;
  role: string;
  expiresAt: string;
}

interface ShareBoardModalProps {
  slug: string;
  siteName: string;
  onClose: () => void;
}

const ROLES = ['viewer', 'commenter', 'editor'];

function RoleMenu({
  current,
  onChange,
}: {
  current: string;
  onChange: (r: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-1 text-xs text-white/50 hover:text-white/80 capitalize px-2 py-1 rounded-md hover:bg-white/6 transition-colors"
      >
        {current}
        <ChevronDown className="w-3 h-3" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 top-full mt-1 w-32 bg-[#1e1e1e] border border-white/8 rounded-lg shadow-xl z-10 overflow-hidden"
          >
            {ROLES.map((r) => (
              <button
                key={r}
                onClick={() => { onChange(r); setOpen(false); }}
                className="flex items-center justify-between w-full px-3 py-2 text-xs capitalize text-white/70 hover:bg-white/6 hover:text-white transition-colors"
              >
                {r}
                {r === current && <Check className="w-3 h-3 text-purple-400" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Avatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
  return (
    <div className="w-8 h-8 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-xs font-semibold text-purple-300 shrink-0">
      {initials}
    </div>
  );
}

export default function ShareBoardModal({ slug, siteName, onClose }: ShareBoardModalProps) {
  const token = getToken();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'viewer' | 'commenter' | 'editor'>('viewer');
  const [accesses, setAccesses] = useState<AccessEntry[]>([]);
  const [pending, setPending] = useState<PendingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [inviteLink, setInviteLink] = useState('');

  const fetchShare = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/site/${slug}/share`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (res.ok) {
        const data = await res.json();
        setAccesses(data.accesses ?? []);
        setPending(data.pending ?? []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShare();
  }, [slug]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSending(true);
    setError('');
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/site/${slug}/share`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ email, role }),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Failed to send invite');
      } else {
        setEmail('');
        if (data.inviteUrl) setInviteLink(data.inviteUrl);
        await fetchShare();
      }
    } catch {
      setError('Network error');
    } finally {
      setSending(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/site/${slug}/share/${userId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      },
    );
    setAccesses((prev) =>
      prev.map((a) => (a.user.id === userId ? { ...a, role: newRole } : a)),
    );
  };

  const handleRevoke = async (userId: string) => {
    await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/site/${slug}/share/${userId}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    setAccesses((prev) => prev.filter((a) => a.user.id !== userId));
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        className="relative w-full max-w-md bg-[#111111] border border-white/8 rounded-2xl shadow-2xl z-10 overflow-hidden"
        initial={{ scale: 0.95, opacity: 0, y: 8 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 8 }}
        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-white/6">
          <div>
            <h2 className="text-sm font-semibold text-white">Share board</h2>
            <p className="text-xs text-white/40 mt-0.5">{siteName}</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/6 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Invite form */}
        <div className="px-5 py-4">
          <form onSubmit={handleInvite} className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              placeholder="Invite by email..."
              className="flex-1 bg-white/4 border border-white/8 rounded-lg px-3 py-2 text-sm text-white placeholder-white/25 outline-none focus:border-purple-500/50 focus:bg-white/6 transition-all"
            />
            <div className="relative">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as typeof role)}
                className="appearance-none bg-white/4 border border-white/8 rounded-lg pl-3 pr-7 py-2 text-sm text-white/70 outline-none focus:border-purple-500/50 capitalize cursor-pointer transition-all"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r} className="bg-[#1e1e1e]">{r}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-white/40 pointer-events-none" />
            </div>
            <button
              type="submit"
              disabled={sending || !email}
              className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-3.5 py-2 rounded-lg transition-colors"
            >
              {sending ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              Invite
            </button>
          </form>
          {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
          {inviteLink && (
            <div className="mt-3 flex items-center gap-2 bg-white/4 border border-white/8 rounded-lg px-3 py-2">
              <Link2 className="w-3.5 h-3.5 text-white/30 shrink-0" />
              <p className="text-xs text-white/40 flex-1 truncate">{inviteLink}</p>
              <button
                onClick={() => { navigator.clipboard.writeText(inviteLink); setInviteLink(''); }}
                className="text-xs text-purple-400 hover:text-purple-300 shrink-0 transition-colors"
              >
                Copy
              </button>
            </div>
          )}
        </div>

        {/* People with access */}
        <div className="px-5 pb-2">
          <p className="text-xs font-medium text-white/30 uppercase tracking-wider mb-3">
            People with access
          </p>

          {loading ? (
            <div className="flex justify-center py-6">
              <span className="w-5 h-5 border-2 border-white/10 border-t-purple-500 rounded-full animate-spin" />
            </div>
          ) : (
            <div className="space-y-1 max-h-52 overflow-y-auto pr-1 -mr-1">
              {accesses.length === 0 && pending.length === 0 ? (
                <p className="text-sm text-white/25 text-center py-5">
                  No one else has access yet
                </p>
              ) : (
                <>
                  {accesses.map((a) => (
                    <div key={a.id} className="flex items-center gap-3 py-2 group">
                      <Avatar name={a.user.name} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white/80 truncate">{a.user.name}</p>
                        <p className="text-xs text-white/35 truncate">{a.user.email}</p>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <RoleMenu
                          current={a.role}
                          onChange={(r) => handleRoleChange(a.user.id, r)}
                        />
                        <button
                          onClick={() => handleRevoke(a.user.id)}
                          className="w-7 h-7 flex items-center justify-center rounded-md text-white/30 hover:text-red-400 hover:bg-red-400/8 transition-colors"
                          title="Revoke access"
                        >
                          <UserMinus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="text-xs text-white/30 capitalize group-hover:hidden">
                        {a.role}
                      </span>
                    </div>
                  ))}

                  {pending.map((p) => (
                    <div key={p.id} className="flex items-center gap-3 py-2 opacity-60">
                      <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                        <Clock className="w-3.5 h-3.5 text-white/30" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white/50 truncate">{p.email}</p>
                        <p className="text-xs text-white/25">Pending invite · {p.role}</p>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-white/6 mt-2">
          <button
            onClick={copyLink}
            className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors"
          >
            <Link2 className="w-3.5 h-3.5" />
            {copied ? 'Copied!' : 'Copy link'}
          </button>
          <button
            onClick={onClose}
            className="text-xs text-white/40 hover:text-white/70 transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  );
}
