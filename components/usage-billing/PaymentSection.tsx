import { useUser } from '@/context/UserContext';
import { getToken } from '@/lib/auth';
import { fetcher } from '@/lib/fetcher';
import { Capitalize } from '@/utils/helpers';
import { AlertTriangle, CreditCard, Download, Edit2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import useSWR from 'swr';

interface Invoice {
  id: string; // Stripe invoice ID
  number: string | null; // Invoice number, can be null if not yet generated
  amount_due: number; // In cents
  created: number; // Unix timestamp (seconds)
  status: 'draft' | 'open' | 'paid' | 'uncollectible' | 'void'; // Stripe invoice status
  invoice_pdf: string; // URL to download PDF
}

export function PaymentSection() {
  const { user, refreshUser } = useUser();
  const token = getToken();
  const subId = user?.team?.subscription?.stripeSubscriptionId;
  const subscription = user?.team?.subscription;
  const plan = subscription?.plan ?? 'free';
  const status = subscription?.status ?? 'active';

  const [cancelStep, setCancelStep] = useState<'idle' | 'confirm' | 'loading'>('idle');
  const [cancelDate, setCancelDate] = useState<string | null>(null);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const handleCancelSubscription = async () => {
    setCancelStep('loading');
    setCancelError(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/billing/cancel-subscription`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Failed to cancel subscription');
      setCancelDate(data.cancelAtFormatted);
      await refreshUser();
      setCancelStep('idle');
    } catch (err: unknown) {
      setCancelError(err instanceof Error ? err.message : 'Something went wrong');
      setCancelStep('confirm');
    }
  };

  // Independent fetches — a card failure won't block invoices
  const { data: invoices = [], isLoading: invoicesLoading } = useSWR<Invoice[]>(
    token ? ['invoices', token] : null,
    ([, tok]: [string, string]) => fetcher(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/invoices`, tok),
  );

  const { data: card, isLoading: cardLoading } = useSWR(
    token && subId ? ['card', subId, token] : null,
    ([, id, tok]: [string, string, string]) =>
      fetcher(`${process.env.NEXT_PUBLIC_BACKEND_URL}/billing/card/subscription/${id}`, tok).catch(() => null),
  );

  return (
    <div className="rounded-xl border border-white/8 bg-[#1A1A1A] p-6">
      <h3 className="text-white mb-6">Payment & Invoices</h3>

      {/* Payment Method */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-white/70">Payment method</span>
          {card && (
            <button className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition-colors">
              <Edit2 className="w-3 h-3" />
              Update
            </button>
          )}
        </div>
        {cardLoading ? (
          <div className="h-16 rounded-lg bg-[#1C1C1C] border border-white/8 animate-pulse" />
        ) : card ? (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-[#1C1C1C] border border-white/8">
            <div className="w-10 h-8 rounded bg-linear-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-white">•••• •••• •••• {card.last4}</p>
              <p className="text-xs text-white/50">Expires {card.exp_month}/{card.exp_year}</p>
            </div>
            <div className="px-2 py-1 rounded bg-[#2C2C2C] text-xs text-white/60">
              {Capitalize(card.brand)}
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-lg bg-[#1C1C1C] border border-white/8 text-sm text-white/40">
            No payment method on file
          </div>
        )}
      </div>

      {/* Billing Email */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-white/70">Billing email</span>
          <button className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition-colors">
            <Edit2 className="w-3 h-3" />
            Edit
          </button>
        </div>
        <div className="p-4 rounded-lg bg-[#1C1C1C] border border-white/8">
          <p className="text-sm text-white">{user?.email}</p>
        </div>
      </div>

      {/* Invoice History */}
      <div>
        <h4 className="text-sm text-white/70 mb-3">Invoice history</h4>
        <div className="space-y-2">
        {invoices.length === 0 && !invoicesLoading && (
          <p className="text-sm text-white/40 py-2">No invoices yet.</p>
        )}
        {invoices.slice(0, 3).map((invoice: Invoice) => (
            <div
              key={invoice.id}
              className="flex items-center justify-between p-3 rounded-lg bg-[#1C1C1C] border border-white/8 hover:bg-[#222] transition-colors"
            >
              <div className="flex-1">
                <p className="text-sm text-white">{invoice.number}</p>
                <p className="text-xs text-white/50">
                  {new Date(invoice.created * 1000).toLocaleDateString(
                    'en-GB',
                    { month: 'short', day: 'numeric', year: 'numeric' },
                  )}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-white">
                    {new Intl.NumberFormat('en-GB', {
                      style: 'currency',
                      currency: 'GBP',
                    }).format(invoice.amount_due / 100)}
                  </p>
                  <p className="text-xs text-green-400">{invoice.status}</p>
                </div>
                <Link
                  className="p-2 rounded-lg bg-[#2C2C2C] hover:bg-[#333] transition-colors"
                  href={invoice.invoice_pdf ?? '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Download className="w-4 h-4 text-white/60" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cancel Subscription */}
      {plan !== 'free' && (
        <div className="mt-8 pt-6 border-t border-white/8">
          {cancelDate || status === 'canceling' ? (
            <div className="flex items-start gap-3 p-4 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
              <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm text-yellow-300 font-medium">Subscription cancellation scheduled</p>
                <p className="text-xs text-white/50 mt-1">
                  Your access continues until{' '}
                  {cancelDate ?? (subscription?.currentPeriodEnd
                    ? new Date(subscription.currentPeriodEnd).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                    : 'end of billing period')}
                  . After that you will be moved to the Free plan.
                </p>
              </div>
            </div>
          ) : cancelStep === 'idle' ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/70">Cancel subscription</p>
                <p className="text-xs text-white/40 mt-0.5">You will keep access until the end of your billing period.</p>
              </div>
              <button
                onClick={() => { setCancelError(null); setCancelStep('confirm'); }}
                className="text-xs text-red-400 hover:text-red-300 transition-colors px-3 py-1.5 rounded-lg border border-red-500/20 hover:border-red-500/40"
              >
                Cancel plan
              </button>
            </div>
          ) : (
            <div className="p-4 rounded-lg bg-red-500/5 border border-red-500/20 space-y-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm text-red-300 font-medium">Cancel your subscription?</p>
                  <p className="text-xs text-white/50 mt-1">You will keep access until the end of your current billing period, then be moved to the Free plan.</p>
                </div>
              </div>
              {cancelError && <p className="text-xs text-red-400">{cancelError}</p>}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCancelSubscription}
                  disabled={cancelStep === 'loading'}
                  className="text-xs bg-red-500/20 hover:bg-red-500/30 text-red-300 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                >
                  {cancelStep === 'loading' ? 'Cancelling…' : 'Yes, cancel plan'}
                </button>
                <button
                  onClick={() => { setCancelStep('idle'); setCancelError(null); }}
                  disabled={cancelStep === 'loading'}
                  className="text-xs text-white/40 hover:text-white/70 transition-colors px-3 py-1.5"
                >
                  Keep plan
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
