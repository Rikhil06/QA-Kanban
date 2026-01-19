import { Search, ChevronDown, Plus } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: 'all' | 'active' | 'archived';
  onStatusFilterChange: (filter: 'all' | 'active' | 'archived') => void;
  environmentFilter: 'all' | 'Prod' | 'Staging' | 'UAT';
  onEnvironmentFilterChange: (filter: 'all' | 'Prod' | 'Staging' | 'UAT') => void;
  sortBy: 'lastUpdated' | 'openIssues' | 'alphabetical';
  onSortChange: (sort: 'lastUpdated' | 'openIssues' | 'alphabetical') => void;
}

export function SitesFilter({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  environmentFilter,
  onEnvironmentFilterChange,
  sortBy,
  onSortChange,
}: FilterBarProps) {
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="mb-8 space-y-4">
      {/* Search and Create Button Row */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search sites..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#1C1C1C] border border-white/8 rounded-lg text-sm placeholder:text-gray-500 focus:outline-none focus:border-white/16 transition-colors"
          />
        </div>

        <button className="flex items-center gap-2 px-4 py-2.5 bg-white text-black rounded-lg hover:bg-gray-100 transition-colors">
          <Plus className="w-4 h-4" />
          <span className="text-sm">Create Site</span>
        </button>
      </div>

      {/* Filters and Sort Row */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Status Filter Pills */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Status:</span>
          <div className="flex gap-1">
            <FilterPill
              label="All"
              active={statusFilter === 'all'}
              onClick={() => onStatusFilterChange('all')}
            />
            <FilterPill
              label="Active"
              active={statusFilter === 'active'}
              onClick={() => onStatusFilterChange('active')}
            />
            <FilterPill
              label="Archived"
              active={statusFilter === 'archived'}
              onClick={() => onStatusFilterChange('archived')}
            />
          </div>
        </div>

        <div className="h-4 w-px bg-white/8" />

        {/* Environment Filter Pills */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Environment:</span>
          <div className="flex gap-1">
            <FilterPill
              label="All"
              active={environmentFilter === 'all'}
              onClick={() => onEnvironmentFilterChange('all')}
            />
            <FilterPill
              label="Prod"
              active={environmentFilter === 'Prod'}
              onClick={() => onEnvironmentFilterChange('Prod')}
            />
            <FilterPill
              label="Staging"
              active={environmentFilter === 'Staging'}
              onClick={() => onEnvironmentFilterChange('Staging')}
            />
            <FilterPill
              label="UAT"
              active={environmentFilter === 'UAT'}
              onClick={() => onEnvironmentFilterChange('UAT')}
            />
          </div>
        </div>

        <div className="h-4 w-px bg-white/8" />

        {/* Sort Dropdown */}
        <div className="relative" ref={sortRef}>
          <button
            onClick={() => setIsSortOpen(!isSortOpen)}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#1C1C1C] border border-white/8 rounded-lg hover:border-white/12 transition-all text-sm"
          >
            <span className="text-gray-400">Sort:</span>
            <span className="text-white">
              {sortBy === 'lastUpdated' ? 'Last updated' : sortBy === 'openIssues' ? 'Most open issues' : 'Alphabetical'}
            </span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>

          {isSortOpen && (
            <div className="absolute top-full left-0 mt-2 w-48 bg-[#1C1C1C] border border-white/8 rounded-lg shadow-xl overflow-hidden z-10">
              <SortOption
                label="Last updated"
                active={sortBy === 'lastUpdated'}
                onClick={() => {
                  onSortChange('lastUpdated');
                  setIsSortOpen(false);
                }}
              />
              <SortOption
                label="Most open issues"
                active={sortBy === 'openIssues'}
                onClick={() => {
                  onSortChange('openIssues');
                  setIsSortOpen(false);
                }}
              />
              <SortOption
                label="Alphabetical"
                active={sortBy === 'alphabetical'}
                onClick={() => {
                  onSortChange('alphabetical');
                  setIsSortOpen(false);
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs transition-all ${
        active
          ? 'bg-white/12 text-white border border-white/16'
          : 'bg-[#1C1C1C] text-gray-400 border border-white/8 hover:border-white/12 hover:text-white'
      }`}
    >
      {label}
    </button>
  );
}

function SortOption({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
        active
          ? 'bg-white/8 text-white'
          : 'text-gray-400 hover:bg-white/4 hover:text-white'
      }`}
    >
      {label}
    </button>
  );
}
