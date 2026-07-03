'use client';

import Link from 'next/link';
import { Check, ExternalLink } from 'lucide-react';

const CHROME_STORE_URL =
  'https://chromewebstore.google.com/detail/annoture/bmamimdeecmfddopfkkcfphkddigpimc';

const steps = [
  'Click "Add to Chrome" on the Chrome Web Store page',
  'Pin the Annoture icon to your toolbar for quick access',
  'Open any website and click the icon to capture your first bug',
];

export default function ExtensionOnboardingPage() {
  return (
    <div className="max-w-md w-full">
      {/* Icon */}
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center shadow-lg shadow-violet-500/25 mb-6">
        <svg viewBox="0 0 24 24" width="28" height="28">
          <path d="M12 20h9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <h2 className="text-white/95 text-2xl tracking-tight mb-2">
        One last step — install the extension
      </h2>
      <p className="text-white/40 text-sm mb-8 leading-relaxed">
        Annoture works through a Chrome extension. Without it you won't be able
        to capture bugs or screenshots — it takes under a minute to set up.
      </p>

      {/* Steps */}
      <div className="space-y-3 mb-8">
        {steps.map((step, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-[10px] font-bold text-violet-400">{i + 1}</span>
            </div>
            <p className="text-sm text-white/60 leading-snug">{step}</p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <a
        href={CHROME_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-[#4A9EFF] hover:bg-[#3B8FEF] text-white rounded-lg transition-colors font-medium text-sm mb-3"
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none">
          <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="1.5" />
          <circle cx="12" cy="12" r="4" fill="white" />
          <path d="M12 8l7-2M8.5 17.5L5 22M15.5 17.5L19 22" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        Add to Chrome — it&apos;s free
        <ExternalLink className="w-3.5 h-3.5 opacity-70" />
      </a>

      <Link
        href="/"
        className="block text-center text-xs text-white/30 hover:text-white/50 transition-colors py-2"
      >
        I&apos;ll install it later — go to dashboard →
      </Link>
    </div>
  );
}
