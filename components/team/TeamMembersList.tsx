import { useState } from 'react';
import { MoreVertical, Shield, User, Trash2, RotateCw, ChevronDown } from 'lucide-react';
import { toast } from 'react-toastify';
import type { TeamMember } from '@/app/(app)/team/page';
import { Capitalize, timeAgo } from '@/utils/helpers';

interface TeamMembersListProps {
  members: TeamMember[];
  onUpdateRole: (id: string, role: 'Admin' | 'Member') => void;
  onRemoveMember: (id: string) => void;
  onResendInvite: (id: string) => void;
}

export function TeamMembersList({
  members,
  onUpdateRole,
  onRemoveMember,
  onResendInvite,
}: TeamMembersListProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMembers = members.filter(
    (member) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRemove = (member: TeamMember) => {
    onRemoveMember(member.id);
    toast.success(`${member.name} removed from team`);
    setOpenMenuId(null);
  };

  const handleRoleChange = (member: TeamMember, newRole: 'Admin' | 'Member') => {
    onUpdateRole(member.id, newRole);
    toast.success(`${member.name} role updated to ${newRole}`);
    setOpenMenuId(null);
  };

  const handleResend = (member: TeamMember) => {
    onResendInvite(member.id);
    toast.success(`Invite resent to ${member.email}`);
    setOpenMenuId(null);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="mt-8 bg-[#1C1C1C] border border-white/5 rounded-2xl overflow-hidden">
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="tracking-tight">Team Members</h2>
            <p className="text-sm text-white/40 mt-0.5">
              {filteredMembers.length} {filteredMembers.length === 1 ? 'member' : 'members'}
            </p>
          </div>
          
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search members..."
            className="px-4 py-2 bg-black/30 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 transition-colors min-w-60"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5 text-left">
              <th className="px-6 py-3 text-xs text-white/40 uppercase tracking-wider">
                Member
              </th>
              <th className="px-6 py-3 text-xs text-white/40 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-xs text-white/40 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-xs text-white/40 uppercase tracking-wider">
                Last Active
              </th>
              <th className="px-6 py-3 text-xs text-white/40 uppercase tracking-wider">
                
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredMembers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                      <User className="w-6 h-6 text-white/30" />
                    </div>
                    <p className="text-white/40">No members found</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredMembers.map((member) => (
                <tr
                  key={member.id}
                  className="border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-linear-to-br from-blue-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-sm">
                        {getInitials(member.name)}
                      </div>
                      <div>
                        <div className="text-sm text-white/90">{member.name}</div>
                        <div className="text-xs text-white/40 mt-0.5">{member.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      {member.role === 'Admin' ? (
                        <Shield className="w-3.5 h-3.5 text-blue-400/70" />
                      ) : (
                        <User className="w-3.5 h-3.5 text-white/40" />
                      )}
                      <span
                        className={`text-sm ${
                          member.role === 'Admin' ? 'text-blue-400/90' : 'text-white/50'
                        }`}
                      >
                        {Capitalize(member.role)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs ${
                        member.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-400/90 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400/90 border border-amber-500/20'
                      }`}
                    >
                      <div
                        className={`w-1 h-1 rounded-full ${
                          member.status === 'active' ? 'bg-emerald-400' : 'bg-amber-400'
                        }`}
                      ></div>
                      {Capitalize(member.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-white/40">
                      {timeAgo(member.lastActive) || '—'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="relative">
                      <button
                        onClick={() =>
                          setOpenMenuId(openMenuId === member.id ? null : member.id)
                        }
                        className="p-1.5 hover:bg-white/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <MoreVertical className="w-4 h-4 text-white/60" />
                      </button>

                      {openMenuId === member.id && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setOpenMenuId(null)}
                          ></div>
                          <div className="absolute right-0 top-full mt-1 w-48 bg-[#222] border border-white/10 rounded-xl shadow-xl z-20 overflow-hidden">
                            <div className="py-1">
                              <button
                                onClick={() =>
                                  handleRoleChange(
                                    member,
                                    member.role === 'Admin' ? 'Member' : 'Admin'
                                  )
                                }
                                className="w-full px-4 py-2 text-left text-sm text-white/70 hover:bg-white/5 flex items-center gap-2 transition-colors"
                              >
                                <ChevronDown className="w-4 h-4" />
                                Change to {member.role === 'Admin' ? 'Member' : 'Admin'}
                              </button>
                              {member.status === 'pending' && (
                                <button
                                  onClick={() => handleResend(member)}
                                  className="w-full px-4 py-2 text-left text-sm text-white/70 hover:bg-white/5 flex items-center gap-2 transition-colors"
                                >
                                  <RotateCw className="w-4 h-4" />
                                  Resend Invite
                                </button>
                              )}
                              <div className="my-1 border-t border-white/5"></div>
                              <button
                                onClick={() => handleRemove(member)}
                                className="w-full px-4 py-2 text-left text-sm text-red-400/90 hover:bg-red-500/10 flex items-center gap-2 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                                Remove Member
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
