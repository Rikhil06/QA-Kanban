'use client';

import { getToken } from '@/lib/auth';
import { Capitalize } from '@/utils/helpers';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

type Team = {
  id: string;
  name: string;
  plan: string; // or a Plan enum if you have one
  // add other properties if needed
};

export default function BillingSuccess() {
  const params = useSearchParams();
  const teamId = params.get('team');
  const token = getToken();

  const [status, setStatus] = useState<'pending' | 'active'>('pending');
  const [data, setData] = useState<Team | null>(null);

  useEffect(() => {
    async function refreshTeam() {
      // Call your /api/auth/me (or team endpoint) to re-fetch plan
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await res.json();

      if (data?.user?.team?.plan) {
        setStatus('active');
        setData(data.user.team);
      }
    }

    refreshTeam();
  }, [teamId]);

  return (
    <div>
      {status === 'pending' && <p>Processing subscription…</p>}
      {status === 'active' && (
        <p>
          🎉 Subscription activated — you’re on the {Capitalize(data?.plan)}{' '}
          Plan!
        </p>
      )}
    </div>
  );
}
