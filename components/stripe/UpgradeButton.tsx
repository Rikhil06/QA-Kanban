'use client';

import { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { useUser } from '@/context/UserContext';

const PLAN_ORDER = ['Free', 'Starter', 'Team', 'Agency'];

type UpgradeButtonProps = {
  teamId?: string;
  priceId: string;
  planName: string;
  currentPlan: string;
  onClick?: () => void;
  className?: string;
  disabled: boolean;
};

export default function UpgradeButton(props: UpgradeButtonProps) {
  const [loading, setLoading] = useState(false);
  const { user, refreshUser } = useUser();
  const {
    onClick,
    teamId,
    priceId,
    planName,
    currentPlan,
    className,
    disabled,
  } = props;

  const isOwner = user?.role === 'owner';
  if (!isOwner) {
    return (
      <button
        disabled
        title="Only the team owner can change the plan"
        className={`${className} opacity-40 cursor-not-allowed`}
      >
        {`${PLAN_ORDER.indexOf(planName) > PLAN_ORDER.indexOf(currentPlan) ? 'Upgrade' : 'Downgrade'} to ${planName}`}
      </button>
    );
  }

  const currentIndex = PLAN_ORDER.indexOf(currentPlan);
  const targetIndex = PLAN_ORDER.indexOf(planName);
  const action = targetIndex > currentIndex ? 'Upgrade' : 'Downgrade';

  async function handleUpgrade() {
    try {
      setLoading(true);
      onClick?.();

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/billing/checkout`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ teamId, priceId }),
        },
      );

      const data = await res.json();

      // ⭐ handle both cases
      if (data.url) {
        // New subscription → redirect to Stripe Checkout (validate hostname first)
        try {
          const url = new URL(data.url);
          if (url.hostname === 'checkout.stripe.com' || url.hostname === 'billing.stripe.com') {
            window.location.href = data.url;
          } else {
            throw new Error('Unexpected redirect hostname');
          }
        } catch {
          console.error('Invalid redirect URL');
          alert('Something went wrong. Please try again.');
        }
        setLoading(false);
      } else if (data.status === 'updated') {
        // Existing subscription updated → show success toast or reload page
        setLoading(false);
        await refreshUser();
        // Optionally refresh page or refetch team data here
        // window.location.reload();
      } else {
        setLoading(false);
        throw new Error('Unexpected response from server');
      }
    } catch (err) {
      console.error(err);
      alert('Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  return (
    <button
      className={className}
      onClick={handleUpgrade}
      disabled={loading || disabled}
    >
      {loading ? 'Upgrading…' : `${action} to ${planName}`}
    </button>
  );
}
