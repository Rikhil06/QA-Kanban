import Link from "next/link";

interface SidebarProps {
  activeSection: string;
  onNavigate: (sectionId: string) => void;
}

const sections = [
  { id: 'intro', label: 'Introduction' },
  { id: 'collect', label: 'Information We Collect' },
  { id: 'use', label: 'How We Use Your Data' },
  { id: 'sharing', label: 'Sharing Your Data' },
  { id: 'security', label: 'Security' },
  { id: 'rights', label: 'Your Rights' },
  { id: 'changes', label: 'Changes to This Policy' },
  { id: 'contact', label: 'Contact' },
];

export function Sidebar({ activeSection, onNavigate }: SidebarProps) {
  return (
    <aside className="hidden lg:block w-64 fixed left-0 top-0 h-screen border-r border-white/[0.08] bg-[#0F0F0F]/50 backdrop-blur-sm">
      <div className="p-8">
        <Link className="h-16 flex items-center border-b border-white/5" href="/">
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
        <nav>
          <ul className="space-y-1">
            {sections.map((section) => (
              <li key={section.id}>
                <button
                  onClick={() => onNavigate(section.id)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-all duration-200 ${
                    activeSection === section.id
                      ? 'text-white bg-white/[0.08]'
                      : 'text-[#AAAAAA] hover:text-[#E0E0E0] hover:bg-white/[0.04]'
                  }`}
                >
                  {section.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
}
