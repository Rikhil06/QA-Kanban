import { ExternalLink, AlertCircle, Clock } from 'lucide-react';

const sites = [
  {
    id: 1,
    name: 'Website Redesign',
    openIssues: 8,
    lastUpdated: '2 hours ago',
    color: 'from-purple-500 to-blue-500',
  },
  {
    id: 2,
    name: 'E-commerce Platform',
    openIssues: 12,
    lastUpdated: '1 hour ago',
    color: 'from-pink-500 to-orange-500',
  },
  {
    id: 3,
    name: 'API Platform',
    openIssues: 5,
    lastUpdated: '4 hours ago',
    color: 'from-cyan-500 to-blue-500',
  },
  {
    id: 4,
    name: 'Design System',
    openIssues: 3,
    lastUpdated: '1 day ago',
    color: 'from-green-500 to-emerald-500',
  },
  {
    id: 5,
    name: 'Auth Service',
    openIssues: 7,
    lastUpdated: '3 hours ago',
    color: 'from-violet-500 to-purple-500',
  },
  {
    id: 6,
    name: 'Mobile App',
    openIssues: 15,
    lastUpdated: '30 min ago',
    color: 'from-orange-500 to-red-500',
  },
];

export function MySites() {
  return (
    <div className="bg-linear-to-br from-[#1A1A1A] to-[#161616] rounded-xl border border-white/10 p-6 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-white mb-1">My Sites</h2>
          <p className="text-sm text-gray-500">{sites.length} active projects</p>
        </div>
        <button className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
          View all
        </button>
      </div>
      
      <div className="flex flex-col gap-4 max-h-58 overflow-y-scroll custom-scrollbar pr-2.5">
        {sites.map((site) => (
          <div
            key={site.id}
            className="group bg-white/3 border border-white/5 rounded-lg p-4 hover:bg-white/5 hover:border-white/10 transition-all cursor-pointer"
          >
            <div className="flex items-start gap-3 mb-3">
              <div className={`w-10 h-10 rounded-lg bg-linear-to-br ${site.color} flex items-center justify-center shrink-0`}>
                <div className="w-5 h-5 border-2 border-white/80 rounded"></div>
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-sm text-gray-200 mb-1 group-hover:text-white transition-colors truncate">
                  {site.name}
                </h3>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  {site.lastUpdated}
                </div>
              </div>
              
              <ExternalLink className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors flex-shrink-0" />
            </div>
            
            <div className="flex items-center gap-2 pt-3 border-t border-white/5">
              <div className="flex items-center gap-1.5 flex-1">
                <AlertCircle className="w-4 h-4 text-orange-400" />
                <span className="text-sm text-gray-400">{site.openIssues} open</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
