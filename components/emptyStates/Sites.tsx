import { Plus, Globe, Chrome, MousePointerClick, Zap } from 'lucide-react';

export function SitesEmptyState({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      {/* Icon with gradient background */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-linear-to-br from-blue-500/20 to-purple-600/20 blur-3xl" />
        <div className="relative w-24 h-24 bg-[#1C1C1C] border border-white/12 rounded-2xl flex items-center justify-center">
          <Globe className="w-12 h-12 text-gray-400" strokeWidth={1.5} />
        </div>
      </div>
      
      {/* Title and Description */}
      <h2 className="text-3xl mb-3">Welcome to your workspace</h2>
      <p className="text-gray-400 mb-10 max-w-lg leading-relaxed">
        Create your first site to start tracking bugs, managing QA feedback, and collaborating with your team. Install our browser extension to capture issues directly from any page.
      </p>
      
      {/* Primary CTA */}
      <button className="flex items-center gap-2 px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-100 transition-all shadow-lg shadow-white/5 mb-16" onClick={onCreateClick}>
        <Plus className="w-5 h-5" />
        <span>Create your first site</span>
      </button>

      {/* Feature Steps */}
      <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 text-sm">
        <div className="flex flex-col items-center gap-3 max-w-[200px]">
          <div className="w-12 h-12 bg-[#1C1C1C] border border-white/8 rounded-xl flex items-center justify-center">
            <MousePointerClick className="w-6 h-6 text-blue-400" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-white mb-1">Add site details</p>
            <p className="text-xs text-gray-500">Enter your site URL and environment settings</p>
          </div>
        </div>
        
        <div className="hidden md:block w-12 h-px bg-linear-to-r from-transparent via-white/8 to-transparent" />
        
        <div className="flex flex-col items-center gap-3 max-w-[200px]">
          <div className="w-12 h-12 bg-[#1C1C1C] border border-white/8 rounded-xl flex items-center justify-center">
            <Chrome className="w-6 h-6 text-purple-400" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-white mb-1">Install extension</p>
            <p className="text-xs text-gray-500">Get our Chrome extension for quick issue reporting</p>
          </div>
        </div>
        
        <div className="hidden md:block w-12 h-px bg-linear-to-r from-transparent via-white/8 to-transparent" />
        
        <div className="flex flex-col items-center gap-3 max-w-[200px]">
          <div className="w-12 h-12 bg-[#1C1C1C] border border-white/8 rounded-xl flex items-center justify-center">
            <Zap className="w-6 h-6 text-green-400" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-white mb-1">Start tracking</p>
            <p className="text-xs text-gray-500">Capture screenshots and log issues instantly</p>
          </div>
        </div>
      </div>

      {/* Secondary Links */}
      <div className="mt-16 flex items-center gap-6 text-sm">
        <button className="text-gray-400 hover:text-white transition-colors">
          View documentation
        </button>
        <span className="text-gray-700">•</span>
        <button className="text-gray-400 hover:text-white transition-colors">
          Watch tutorial
        </button>
        <span className="text-gray-700">•</span>
        <button className="text-gray-400 hover:text-white transition-colors">
          Import from CSV
        </button>
      </div>
    </div>
  );
}