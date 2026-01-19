'use client';

import { useState } from 'react';
import { getToken } from '@/lib/auth';
import { Mail, Check, Send } from 'lucide-react';
import { toast } from 'react-toastify';

interface InviteByEmailProps {
  teamId: string | undefined;
  //   onInvite: (email: string, role: 'Admin' | 'Member') => void;
}

export function InviteByEmail({ teamId }: InviteByEmailProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'Admin' | 'Member'>('Member');
  const [isValid, setIsValid] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const token = getToken();

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);

      if (!validateEmail(email)) {
        setIsValid(false);
        return;
      }

      const res = await fetch(
        `https://qa-backend-105l.onrender.com/teams/${teamId}/invite-email`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ teamId, email, role }),
        },
      );

      const data = await res.json();

      if (res.ok) {
        setIsLoading(false);
        toast.success(`Invite sent to ${email}`);
        setShowSuccess(true);
        setIsValid(true);
        setEmail('');
      } else {
        alert(data.error);
        setIsLoading(false);
        toast.error(`Invite failed to send to ${email}`);
        setShowSuccess(false);
        setIsValid(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#1C1C1C] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-colors">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
          <Mail className="w-4 h-4 text-white/60" />
        </div>
        <div>
          <h2 className="tracking-tight">Invite by Email</h2>
          <p className="text-sm text-white/40 mt-0.5">
            Send an email invite to add a new team member.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setIsValid(true);
            }}
            placeholder="colleague@company.com"
            className={`w-full px-4 py-2.5 bg-black/30 border ${
              !isValid ? 'border-red-500/50' : 'border-white/10'
            } rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 transition-colors`}
          />
          {!isValid && (
            <p className="text-xs text-red-400/80 mt-2">
              Please enter a valid email address
            </p>
          )}
        </div>

        <div>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as 'Admin' | 'Member')}
            className="w-full px-4 py-2.5 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:border-white/20 transition-colors appearance-none cursor-pointer"
          >
            <option value="Member">Member</option>
            <option value="Admin">Admin</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full px-4 py-2.5 bg-white text-black rounded-xl hover:bg-white/90 transition-all flex items-center justify-center gap-2 group"
        >
          {showSuccess ? (
            <>
              <Check className="w-4 h-4" />
              Invite Sent
            </>
          ) : (
            <>
              <Send className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              Send Invite
            </>
          )}
        </button>
      </form>
    </div>
  );
}
