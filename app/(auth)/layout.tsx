import { SocialLoginButtons } from "@/components/authentication/SocialLoginButtons";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-linear-to-br from-[#0F0F0F] to-[#1A1A1A] flex">
      {/* Left Side - Branding & Value Prop */}
      <div className="hidden lg:flex lg:flex-1 flex-col justify-between p-12 xl:p-16">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-2 mb-16">
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-purple-500 to-blue-600 flex items-center justify-center">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8 2L2 6L8 10L14 6L8 2Z"
                  fill="white"
                  fillOpacity="0.9"
                />
                <path
                  d="M2 10L8 14L14 10"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <span className="text-white/90 text-xl tracking-tight">IssueTrack</span>
          </div>

          {/* Value Proposition */}
          <div className="max-w-md">
            <h1 className="text-white/95 text-4xl xl:text-5xl tracking-tight mb-4">
              Track issues. Capture feedback. Ship faster.
            </h1>
            <p className="text-white/40 text-lg">
              A lightweight QA tool for modern teams.
            </p>
          </div>
        </div>

        {/* Abstract Background Element */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute left-32 top-1/3 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />

        {/* Trust Indicators */}
        <div className="relative z-10">
          <p className="text-white/30 text-sm">Used by developers and agencies worldwide</p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="flex lg:hidden items-center gap-2 mb-12">
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-purple-500 to-blue-600 flex items-center justify-center">
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8 2L2 6L8 10L14 6L8 2Z"
                  fill="white"
                  fillOpacity="0.9"
                />
                <path
                  d="M2 10L8 14L14 10"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <span className="text-white/90 text-xl tracking-tight">IssueTrack</span>
          </div>

          {/* Login Card */}
          <div className="bg-[#1C1C1C] rounded-2xl p-8 sm:p-10 border border-white/8 shadow-2xl">

            {children}

            

        
          </div>

          {/* Trust & Reassurance */}
          <div className="mt-8 text-center space-y-2">
            <p className="text-white/20 text-xs">
              🔒 Secure authentication
            </p>
            <p className="text-white/20 text-xs">
              No credit card required for Free plan
            </p>
          </div>

          {/* Footer Links */}
          <div className="mt-12 flex items-center justify-center gap-6 text-xs text-white/20">
            <a href="/privacy-policy" className="hover:text-white/40 transition-colors">
              Privacy Policy
            </a>
            <span>·</span>
            <a href="terms-and-conditions" className="hover:text-white/40 transition-colors">
              Terms of Service
            </a>
            <span>·</span>
            <a href="/support" className="hover:text-white/40 transition-colors">
              Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}