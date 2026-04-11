'use client';

import { useState } from 'react';
import { useUser } from '@/context/UserContext';
import { getToken } from '@/lib/auth';
import { clearToken } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import {
  User,
  Lock,
  Bell,
  Trash2,
  Loader2,
  Eye,
  EyeOff,
  Settings,
  Check,
} from 'lucide-react';

type Section = 'profile' | 'security' | 'notifications' | 'danger';

export default function SettingsPage() {
  const { user, refreshUser, logout } = useUser();
  const token = getToken();
  const router = useRouter();

  const [activeSection, setActiveSection] = useState<Section>('profile');

  // ── Profile state ─────────────────────────────────────────────────
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [profileLoading, setProfileLoading] = useState(false);

  // ── Password state ────────────────────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // ── Notification preferences ─────────────────────────────────────
  const [notifTaskAssigned, setNotifTaskAssigned] = useState(true);
  const [notifTaskOverdue, setNotifTaskOverdue] = useState(true);
  const [notifDueToday, setNotifDueToday] = useState(true);
  const [notifTeamInvite, setNotifTeamInvite] = useState(true);
  const [notifLoading, setNotifLoading] = useState(false);

  // ── Danger zone ───────────────────────────────────────────────────
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ─────────────────────────────────────────────────────────────────
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/me`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name, email }),
        },
      );
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || 'Failed to update profile');
        return;
      }
      await refreshUser();
      toast.success('Profile updated');
    } catch {
      toast.error('Something went wrong');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    setPasswordLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/change-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ currentPassword, newPassword }),
        },
      );
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || 'Failed to update password');
        return;
      }
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      toast.error('Something went wrong');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleUpdateNotifications = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotifLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/me/notifications`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            taskAssigned: notifTaskAssigned,
            taskOverdue: notifTaskOverdue,
            dueToday: notifDueToday,
            teamInvite: notifTeamInvite,
          }),
        },
      );
      if (!res.ok) throw new Error();
      toast.success('Notification preferences saved');
    } catch {
      toast.error('Failed to save preferences');
    } finally {
      setNotifLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== user?.email) {
      toast.error('Email does not match');
      return;
    }
    setDeleteLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/users/me`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!res.ok) throw new Error();
      logout();
      clearToken();
      router.push('/register');
    } catch {
      toast.error('Failed to delete account. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const navItems: { id: Section; label: string; icon: React.ElementType }[] = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'danger', label: 'Danger Zone', icon: Trash2 },
  ];

  return (
    <div className="min-h-screen text-white">
      <div className="max-w-5xl mx-auto px-6 py-12">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-white/40 mb-3">
            <span className="text-sm">Workspace</span>
            <span>/</span>
            <span className="text-sm text-white/60">Settings</span>
          </div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
              <Settings className="w-5 h-5 text-white/60" />
            </div>
            <h1 className="text-3xl tracking-tight">Settings</h1>
          </div>
          <p className="text-white/50 mt-2">
            Manage your account, security, and notification preferences.
          </p>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Nav */}
          <nav className="w-52 shrink-0">
            <ul className="space-y-1">
              {navItems.map(({ id, label, icon: Icon }) => (
                <li key={id}>
                  <button
                    onClick={() => setActiveSection(id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-left ${
                      activeSection === id
                        ? 'bg-white/8 text-white'
                        : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                    } ${id === 'danger' ? 'text-red-400/70 hover:text-red-400' : ''}`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Content */}
          <div className="flex-1">

            {/* ── Profile ─────────────────────────────────────── */}
            {activeSection === 'profile' && (
              <div className="bg-white/[0.03] border border-white/8 rounded-xl p-6">
                <h2 className="text-white font-medium mb-1">Profile</h2>
                <p className="text-white/40 text-sm mb-6">
                  Update your display name and email address.
                </p>

                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <label className="block text-white/60 text-sm mb-2">
                      Full name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full bg-[#0F0F0F] border border-white/8 rounded-lg px-4 py-3 text-white/90 placeholder:text-white/20 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                      placeholder="Jane Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-white/60 text-sm mb-2">
                      Email address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full bg-[#0F0F0F] border border-white/8 rounded-lg px-4 py-3 text-white/90 placeholder:text-white/20 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                      placeholder="you@company.com"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={profileLoading}
                      className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {profileLoading ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                      ) : (
                        'Save changes'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ── Security ─────────────────────────────────────── */}
            {activeSection === 'security' && (
              <div className="bg-white/[0.03] border border-white/8 rounded-xl p-6">
                <h2 className="text-white font-medium mb-1">Change password</h2>
                <p className="text-white/40 text-sm mb-6">
                  Use a strong password you don't use elsewhere.
                </p>

                <form onSubmit={handleChangePassword} className="space-y-4">
                  {[
                    {
                      id: 'current',
                      label: 'Current password',
                      value: currentPassword,
                      setValue: setCurrentPassword,
                      show: showCurrent,
                      setShow: setShowCurrent,
                    },
                    {
                      id: 'new',
                      label: 'New password',
                      value: newPassword,
                      setValue: setNewPassword,
                      show: showNew,
                      setShow: setShowNew,
                    },
                    {
                      id: 'confirm',
                      label: 'Confirm new password',
                      value: confirmPassword,
                      setValue: setConfirmPassword,
                      show: showConfirm,
                      setShow: setShowConfirm,
                    },
                  ].map(({ id, label, value, setValue, show, setShow }) => (
                    <div key={id}>
                      <label className="block text-white/60 text-sm mb-2">
                        {label}
                      </label>
                      <div className="relative">
                        <input
                          type={show ? 'text' : 'password'}
                          value={value}
                          onChange={(e) => setValue(e.target.value)}
                          required
                          className="w-full bg-[#0F0F0F] border border-white/8 rounded-lg px-4 py-3 pr-11 text-white/90 placeholder:text-white/20 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShow(!show)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                        >
                          {show ? <EyeOff size={17} /> : <Eye size={17} />}
                        </button>
                      </div>
                    </div>
                  ))}

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={passwordLoading}
                      className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {passwordLoading ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Updating...</>
                      ) : (
                        'Update password'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ── Notifications ─────────────────────────────────── */}
            {activeSection === 'notifications' && (
              <div className="bg-white/[0.03] border border-white/8 rounded-xl p-6">
                <h2 className="text-white font-medium mb-1">
                  Notification preferences
                </h2>
                <p className="text-white/40 text-sm mb-6">
                  Choose which in-app notifications you receive.
                </p>

                <form onSubmit={handleUpdateNotifications} className="space-y-4">
                  {[
                    {
                      label: 'Task assigned to me',
                      desc: 'When a team member assigns a task to you.',
                      value: notifTaskAssigned,
                      onChange: setNotifTaskAssigned,
                    },
                    {
                      label: 'Task overdue',
                      desc: 'When one of your tasks passes its due date.',
                      value: notifTaskOverdue,
                      onChange: setNotifTaskOverdue,
                    },
                    {
                      label: 'Task due today',
                      desc: 'A daily reminder for tasks due today.',
                      value: notifDueToday,
                      onChange: setNotifDueToday,
                    },
                    {
                      label: 'Team invitations',
                      desc: 'When someone invites you to join a team.',
                      value: notifTeamInvite,
                      onChange: setNotifTeamInvite,
                    },
                  ].map(({ label, desc, value, onChange }) => (
                    <div
                      key={label}
                      className="flex items-start justify-between gap-4 py-3 border-b border-white/5 last:border-0"
                    >
                      <div>
                        <p className="text-white/80 text-sm">{label}</p>
                        <p className="text-white/40 text-xs mt-0.5">{desc}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onChange(!value)}
                        className={`relative w-10 h-6 rounded-full transition-colors shrink-0 ${
                          value ? 'bg-purple-600' : 'bg-white/10'
                        }`}
                      >
                        <span
                          className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                            value ? 'translate-x-5' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  ))}

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={notifLoading}
                      className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {notifLoading ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                      ) : (
                        <><Check className="w-4 h-4" /> Save preferences</>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ── Danger Zone ───────────────────────────────────── */}
            {activeSection === 'danger' && (
              <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-6">
                <h2 className="text-red-400 font-medium mb-1">Danger Zone</h2>
                <p className="text-white/40 text-sm mb-6">
                  These actions are permanent and cannot be undone.
                </p>

                <div className="space-y-2">
                  <p className="text-white/70 text-sm">
                    To confirm, type your email address{' '}
                    <span className="text-white/90 font-mono">{user?.email}</span>{' '}
                    below.
                  </p>
                  <input
                    type="email"
                    value={deleteConfirm}
                    onChange={(e) => setDeleteConfirm(e.target.value)}
                    className="w-full bg-[#0F0F0F] border border-red-500/30 rounded-lg px-4 py-3 text-white/90 placeholder:text-white/20 focus:outline-none focus:border-red-500/60 focus:ring-2 focus:ring-red-500/20 transition-all"
                    placeholder={user?.email}
                  />
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleteConfirm !== user?.email || deleteLoading}
                    className="mt-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {deleteLoading ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Deleting...</>
                    ) : (
                      <><Trash2 className="w-4 h-4" /> Permanently delete account</>
                    )}
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
