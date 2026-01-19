import { Home, CheckSquare, Globe } from 'lucide-react';
import Link from 'next/link';

export function LegalSidebar() {
  const navItems = [
    { icon: Home, label: 'Privacy Policy', href: '/privacy-policy',  },
    { icon: CheckSquare, label: 'Terms of Service', href: '/terms-and-conditions', active: true },
    { icon: Globe, label: 'Support', href: '/support' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 border-r border-white/8 bg-[#0F0F0F]/50 backdrop-blur-sm">
      <div className="p-6">
        {/* Logo */}
        <div className="mb-8">
          <Link className="h-16 flex items-center" href="/">
            <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-linear-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-square-check-big w-4 h-4 text-white" aria-hidden="true">
                        <path d="M21 10.656V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12.344"></path>
                        <path d="m9 11 3 3L22 4"></path>
                    </svg>
                </div>
                <span className="tracking-tight text-gray-100">QA Board</span>
            </div>
        </Link>
          <p className="text-xs text-[#AAAAAA] mt-1">Issue tracking & QA</p>
        </div>

        {/* Navigation */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.label}
                href={item.href}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                  ${item.active 
                    ? 'bg-[#6366F1]/10 text-[#6366F1] border border-[#6366F1]/20' 
                    : 'text-[#AAAAAA] hover:text-[#E0E0E0] hover:bg-white/5'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm">{item.label}</span>
              </a>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
