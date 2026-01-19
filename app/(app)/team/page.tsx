'use client';

import { useEffect, useState } from 'react';
import { InviteByEmail } from '@/components/team/InviteByEmail';
import { InviteCode } from '@/components/team/InviteCode';
import { TeamMembersList } from '@/components/team/TeamMembersList';
import { ToastContainer } from 'react-toastify';
import { Users } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { getToken } from '@/lib/auth';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Member';
  status: 'active' | 'pending';
  lastActive?: string;
  avatar?: string;
}

export default function Page() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [inviteCode, setInviteCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const token = getToken();
  const { user } = useUser();

  useEffect(() => {
    fetch(
      `https://qa-backend-105l.onrender.com/teams/${user?.teamId}/members`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )
      .then((res) => res.json())
      .then((data) => setMembers(data.members))
      .catch((err) => console.error('Failed to fetch reports this week', err));
  }, []);

  console.log(members);

  useEffect(() => {
    async function loadCode() {
      const res = await fetch(
        `https://qa-backend-105l.onrender.com/teams/${user?.teamId}/invite-link`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const data = await res.json();
      setInviteCode(data.code);
    }

    loadCode();
  }, []);

  // const handleInviteByEmail = (email: string, role: 'Admin' | 'Member') => {
  //   const newMember: TeamMember = {
  //     id: Date.now().toString(),
  //     name: email.split('@')[0],
  //     email,
  //     role,
  //     status: 'Pending',
  //   };
  //   setMembers([...members, newMember]);

  // };

  const handleGenerateNewCode = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const isValidCode = inviteCode.length > 6 && inviteCode.includes('-');

      if (!isValidCode) {
        setError('Invite link or code not found — please check and try again.');
        setIsSubmitting(false);
        return;
      }

      const res = await fetch(
        `https://qa-backend-105l.onrender.com/teams/${user?.teamId}/invite-link`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await res.json();

      if (res.ok) {
        setIsSubmitting(false);
        setInviteCode(data.code);
      } else {
        setIsSubmitting(false);
        alert(data.error || 'Failed to get invite code');
      }
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
    setIsSubmitting(false);
    // setInviteCode(`TEAM-${segments.join('-')}`);
  };

  const handleUpdateRole = (id: string, newRole: 'Admin' | 'Member') => {
    setMembers(members.map((m) => (m.id === id ? { ...m, role: newRole } : m)));
  };

  const handleRemoveMember = (id: string) => {
    setMembers(members.filter((m) => m.id !== id));
  };

  const handleResendInvite = (id: string) => {
    // Handled in TeamMembersList
  };

  const activeCount = members.filter((m) => m.status === 'active').length;
  const pendingCount = members.filter((m) => m.status === 'pending').length;

  return (
    <div className="min-h-screen text-white">
      <ToastContainer
        position="bottom-right"
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-white/40 mb-3">
            <span className="text-sm">Workspace</span>
            <span>/</span>
            <span className="text-sm">Settings</span>
            <span>/</span>
            <span className="text-sm text-white/60">Team</span>
          </div>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-white/60" />
            </div>
            <h1 className="text-3xl tracking-tight">Team & Members</h1>
          </div>

          <p className="text-white/50 mt-2">
            Manage users, invitations, and workspace access.
          </p>
        </div>

        <div className="flex items-center gap-6 text-sm text-white/50 border border-white/5 bg-white/[0.02] rounded-xl px-5 py-3">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/60"></div>
            <span>
              <span className="text-white/80">{activeCount}</span> active
              members
            </span>
          </div>

          <div className="w-px h-4 bg-white/10"></div>

          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500/60"></div>
            <span>
              <span className="text-white/80">{pendingCount}</span> pending
              invites
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <InviteByEmail teamId={user?.teamId} />
          <InviteCode code={inviteCode} onGenerateNew={handleGenerateNewCode} />
        </div>

        <TeamMembersList
          members={members}
          onUpdateRole={handleUpdateRole}
          onRemoveMember={handleRemoveMember}
          onResendInvite={handleResendInvite}
        />
      </div>
    </div>
  );
}
