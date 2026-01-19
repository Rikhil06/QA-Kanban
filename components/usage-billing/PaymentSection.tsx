import { useUser } from '@/context/UserContext';
import { getToken } from '@/lib/auth';
import { fetcher } from '@/lib/fetcher';
import { Capitalize } from '@/utils/helpers';
import { CreditCard, Download, Edit2 } from 'lucide-react';
import Link from 'next/link';
import useSWR from 'swr';

interface Invoice {
  id: string;              // Stripe invoice ID
  number: string | null;   // Invoice number, can be null if not yet generated
  amount_due: number;      // In cents
  created: number;         // Unix timestamp (seconds)
  status: 'draft' | 'open' | 'paid' | 'uncollectible' | 'void'; // Stripe invoice status
  invoice_pdf: string;     // URL to download PDF
}

export function PaymentSection() {
  const { user } = useUser();
  const token = getToken();

  const { data, isLoading, error } = useSWR(
    token && user?.team?.subscription?.stripeSubscriptionId
      ? [
          'invoices-and-card',
          user.team.subscription.stripeSubscriptionId,
          token,
        ]
      : null,
    async ([, subId, token]) => {
      const [invoices, cardDetails] = await Promise.all([
        fetcher('https://qa-backend-105l.onrender.com /api/invoices', token),
        fetcher(
          `https://qa-backend-105l.onrender.com /billing/card/subscription/${subId}`,
          token
        ),
      ]);

      return { invoices, cardDetails };
    }
  );
    
  // const invoices = [
  //   { id: 'INV-2024-12', date: 'Dec 21, 2024', amount: '£12.00', status: 'Paid' },
  //   { id: 'INV-2024-11', date: 'Nov 21, 2024', amount: '£12.00', status: 'Paid' },
  //   { id: 'INV-2024-10', date: 'Oct 21, 2024', amount: '£12.00', status: 'Paid' }
  // ];

  if (isLoading) return <p>Loading invoices and card details...</p>;

  return (
    <div className="rounded-xl border border-white/8 bg-[#1A1A1A] p-6">
      <h3 className="text-white mb-6">Payment & Invoices</h3>

      {/* Payment Method */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-white/70">Payment method</span>
          <button className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white transition-colors">
            <Edit2 className="w-3 h-3" />
            Update
          </button>
        </div>
        <div className="flex items-center gap-3 p-4 rounded-lg bg-[#1C1C1C] border border-white/8">
          <div className="w-10 h-8 rounded bg-linear-to-br from-blue-500 to-purple-500 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-white">•••• •••• •••• {data?.cardDetails.last4}</p>
            <p className="text-xs text-white/50">Expires {data?.cardDetails.exp_month}/{data?.cardDetails.exp_year}</p>
          </div>
          <div className="px-2 py-1 rounded bg-[#2C2C2C] text-xs text-white/60">
            {Capitalize(data?.cardDetails.brand)}
          </div>
        </div>
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
          {data?.invoices.map((invoice: Invoice) => (
            <div
              key={invoice.id}
              className="flex items-center justify-between p-3 rounded-lg bg-[#1C1C1C] border border-white/8 hover:bg-[#222] transition-colors"
            >
              <div className="flex-1">
                <p className="text-sm text-white">{invoice.number}</p>
                <p className="text-xs text-white/50">{new Date(invoice.created * 1000).toLocaleDateString('en-GB', { month: 'short', day: 'numeric',  year: 'numeric' })}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-white">{new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', }).format(invoice.amount_due / 100)}</p>
                  <p className="text-xs text-green-400">{invoice.status}</p>
                </div>
                <Link 
                  className="p-2 rounded-lg bg-[#2C2C2C] hover:bg-[#333] transition-colors" 
                  href={invoice.invoice_pdf} target="_blank"
                  rel="noopener noreferrer"
                >
                  <Download className="w-4 h-4 text-white/60" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
