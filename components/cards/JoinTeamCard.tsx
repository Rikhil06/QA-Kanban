'use client';

import React, { useState } from 'react';
import { UserPlus, X } from 'lucide-react';
import { getToken } from '@/lib/auth';
import { useRouter } from 'next/navigation';

interface JoinTeamCardProps {
  isSelected: boolean;
  isOtherSelected: boolean;
  onSelect: () => void;
  onReset: () => void;
}

export function JoinTeamCard({
  isSelected,
  isOtherSelected,
  onSelect,
  onReset,
}: JoinTeamCardProps) {
  const [inviteCode, setInviteCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const token = getToken();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const isValidCode = inviteCode.length > 6 && inviteCode.includes('-');

      if (!isValidCode) {
        setError('Invite link or code not found — please check and try again.');
        setIsSubmitting(false);
        return;
      }

      const res = await fetch(`${process.env.BACKEND_URL}/teams/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code: inviteCode }),
      });

      const data = await res.json();

      if (res.ok) {
        setIsSubmitting(false);
        router.push('/');
      } else {
        setIsSubmitting(false);
        alert(data.error || 'Failed to create team');
      }
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
      alert('Something went wrong');
    }
    setIsSubmitting(false);
  };

  if (isOtherSelected) {
    return null;
  }

  return (
    <div
      onClick={!isSelected ? onSelect : undefined}
      className={`
        relative bg-[#1A1A1A]/60 backdrop-blur-sm rounded-xl border transition-all duration-300
        ${
          isSelected
            ? 'border-[#4A9EFF]/60 shadow-[0_0_30px_rgba(74,158,255,0.15)]'
            : 'border-[#2A2A2A] hover:border-[#4A9EFF]/40 hover:shadow-[0_0_20px_rgba(74,158,255,0.08)] cursor-pointer'
        }
      `}
    >
      {/* Close button when selected */}
      {isSelected && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onReset();
          }}
          className="absolute top-4 right-4 z-10 text-[#A6A6A6] hover:text-[#E6E6E6] transition-colors"
        >
          <X size={20} />
        </button>
      )}

      <div className="p-8">
        {/* Card Header */}
        <div className={`flex items-start gap-4 ${isSelected ? 'mb-6' : ''}`}>
          <div className="p-3 bg-[#7C3AED]/10 rounded-lg">
            <UserPlus className="text-[#7C3AED]" size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-[#E6E6E6] mb-2">Join an Existing Team</h3>
            <p className="text-[#A6A6A6] text-sm">
              Use an invite link or team code from your organization.
            </p>
          </div>
        </div>

        {/* Expanded Form */}
        {isSelected && (
          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            {/* Invite Code Input */}
            <div>
              <label className="block text-[#E6E6E6] text-sm mb-2">
                Invite Link or Team Code *
              </label>
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => {
                  setInviteCode(e.target.value);
                  setError(null);
                }}
                placeholder="e.g. TEAM-ABC-123 or https://app.example.com/invite/..."
                required
                className={`
                  w-full px-4 py-3 bg-[#0E0E0E] border rounded-lg text-[#E6E6E6] placeholder-[#666] focus:outline-none transition-colors
                  ${
                    error
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-[#2A2A2A] focus:border-[#4A9EFF]'
                  }
                `}
              />

              {/* Error Message */}
              {error && (
                <p className="mt-2 text-sm text-red-400 flex items-center gap-2">
                  <span className="inline-block w-1 h-1 rounded-full bg-red-400"></span>
                  {error}
                </p>
              )}
            </div>

            {/* Help Text */}
            <div className="p-4 bg-[#0E0E0E]/50 border border-[#2A2A2A] rounded-lg">
              <p className="text-[#A6A6A6] text-sm">
                <span className="text-[#E6E6E6]">Need an invite?</span> Ask your
                team admin to send you an invite link or team code.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-6 py-3 bg-[#7C3AED] hover:bg-[#6D2FD5] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Joining Team...' : 'Join Team'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
