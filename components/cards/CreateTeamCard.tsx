import React, { useState } from 'react';
import { Users, Upload, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getToken } from '@/lib/auth';

interface CreateTeamCardProps {
  isSelected: boolean;
  isOtherSelected: boolean;
  onSelect: () => void;
  onReset: () => void;
}

export function CreateTeamCard({
  isSelected,
  isOtherSelected,
  onSelect,
  onReset,
}: CreateTeamCardProps) {
  const router = useRouter();
  const [teamName, setTeamName] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [planType, setPlanType] = useState<'free' | 'starter' | 'team'>('free');
  const [isLoading, setIsLoading] = useState(false);
  const token = getToken();

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('name', teamName);
      if (logoFile) formData.append('logo', logoFile);
      formData.append('plan', planType);

      const res = await fetch(
        'https://qa-backend-105l.onrender.com/teams/create',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          method: 'POST',
          body: formData,
        },
      );

      const data = await res.json();

      if (res.ok) {
        setIsLoading(false);
        router.push('/');
      } else {
        setIsLoading(false);
        alert(data.error || 'Failed to create team');
      }
    } catch (err) {
      console.error(err);
      setIsLoading(false);
      alert('Something went wrong');
    }
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
          <div className="p-3 bg-[#4A9EFF]/10 rounded-lg">
            <Users className="text-[#4A9EFF]" size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-[#E6E6E6] mb-2">Create a New Team</h3>
            <p className="text-[#A6A6A6] text-sm">
              Set up a new workspace for your company or project.
            </p>
          </div>
        </div>

        {/* Expanded Form */}
        {isSelected && (
          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            {/* Team Name */}
            <div>
              <label className="block text-[#E6E6E6] text-sm mb-2">
                Team / Company Name *
              </label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="e.g. Acme Inc"
                required
                className="w-full px-4 py-3 bg-[#0E0E0E] border border-[#2A2A2A] rounded-lg text-[#E6E6E6] placeholder-[#666] focus:outline-none focus:border-[#4A9EFF] transition-colors"
              />
            </div>

            {/* Logo Upload */}
            <div>
              <label className="block text-[#E6E6E6] text-sm mb-2">
                Team Logo (optional)
              </label>
              <div className="flex items-center gap-4">
                {/* Logo Preview Circle */}
                <div className="relative w-16 h-16 rounded-full bg-[#0E0E0E] border-2 border-dashed border-[#2A2A2A] flex items-center justify-center overflow-hidden">
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Upload size={20} className="text-[#666]" />
                  )}
                </div>

                {/* Upload Button */}
                <label className="px-4 py-2 bg-[#2A2A2A] hover:bg-[#333] border border-[#3A3A3A] rounded-lg text-[#E6E6E6] text-sm cursor-pointer transition-colors">
                  Choose File
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>

                {logoFile && (
                  <span className="text-[#A6A6A6] text-sm truncate max-w-[200px]">
                    {logoFile.name}
                  </span>
                )}
              </div>
            </div>

            {/* Plan Type Selector */}
            <div>
              <label className="block text-[#E6E6E6] text-sm mb-3">
                Plan Type
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'free', label: 'Free' },
                  { value: 'trial', label: 'Trial' },
                  { value: 'paid', label: 'Paid' },
                ].map((plan) => (
                  <button
                    key={plan.value}
                    type="button"
                    onClick={() => setPlanType(plan.value as any)}
                    className={`
                      px-4 py-3 rounded-lg text-sm transition-all
                      ${
                        planType === plan.value
                          ? 'bg-[#4A9EFF] text-white'
                          : 'bg-[#0E0E0E] text-[#A6A6A6] border border-[#2A2A2A] hover:border-[#4A9EFF]/40'
                      }
                    `}
                  >
                    {plan.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-3 bg-[#4A9EFF] hover:bg-[#3B8FEF] text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating Team...' : 'Create Team'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
