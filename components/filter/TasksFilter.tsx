import { Search, X, ChevronDown, List, ListCollapse, LayoutGrid } from 'lucide-react';
import { FilterChip } from './components/FilterChip';

interface FilterBarProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  statusFilter: string[];
  setStatusFilter: (value: string[]) => void;
  priorityFilter: string[];
  setPriorityFilter: (value: string[]) => void;
  siteFilter: string[];
  setSiteFilter: (value: string[]) => void;
  dueDateFilter: string[];
  setDueDateFilter: (value: string[]) => void;
  sortBy: string;
  setSortBy: (value: string) => void;
  viewMode: 'list' | 'compact';
  setViewMode: (value: 'list' | 'compact') => void;
  groupBy: 'dueDate' | 'status' | 'site' | 'none';
  setGroupBy: (value: 'dueDate' | 'status' | 'site' | 'none') => void;
  onClearFilters: () => void;
  hasActiveFilters?: boolean;
  sites?: string[]; 
}

export function TasksFilter({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
  siteFilter,
  setSiteFilter,
  dueDateFilter,
  setDueDateFilter,
  sortBy,
  setSortBy,
  viewMode,
  setViewMode,
  groupBy,
  setGroupBy,
  onClearFilters,
  hasActiveFilters,
  sites
}: FilterBarProps) {
  const statusOptions = ['new', 'inProgress', 'done'];
  const priorityOptions = ['low', 'medium', 'high', 'urgent'];
  // const siteOptions = ['nike.com', 'latitude.sh', 'rikhilmakwana.co.uk', 'awwwards.com'];
  const dueDateOptions = ['Today', 'This Week', 'Overdue'];

  return (
    <div className="sticky top-0 z-10 bg-[#0F0F0F] border-b border-white/8">
      <div className="px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 h-8 pl-9 pr-3 bg-[#1C1C1C] border border-white/8 rounded-md text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-white/16 transition-colors"
              />
            </div>

            <div className="h-4 w-px bg-white/8" />

            <div className="flex items-center gap-2 flex-wrap">
              <FilterChip
                label="Status"
                options={statusOptions}
                selected={statusFilter}
                onChange={setStatusFilter}
              />
              <FilterChip
                label="Priority"
                options={priorityOptions}
                selected={priorityFilter}
                onChange={setPriorityFilter}
              />
              <FilterChip
                label="Site"
                options={sites}
                selected={siteFilter}
                onChange={setSiteFilter}
              />
              <FilterChip
                label="Due Date"
                options={dueDateOptions}
                selected={dueDateFilter}
                onChange={setDueDateFilter}
              />
            </div>

            {hasActiveFilters && (
              <button
                onClick={onClearFilters}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-white/60 hover:text-white transition-colors"
              >
                <X className="w-3 h-3" />
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value as any)}
                className="h-8 pl-3 pr-8 bg-[#1C1C1C] border border-white/8 rounded-md text-sm text-white/70 focus:outline-none focus:border-white/16 transition-colors appearance-none cursor-pointer"
              >
                <option value="none">No grouping</option>
                <option value="dueDate">Group by due date</option>
                <option value="status">Group by status</option>
                <option value="site">Group by site</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="h-8 pl-3 pr-8 bg-[#1C1C1C] border border-white/8 rounded-md text-sm text-white/70 focus:outline-none focus:border-white/16 transition-colors appearance-none cursor-pointer"
              >
                <option value="dueDate">Sort by due date</option>
                <option value="priority">Sort by priority</option>
                <option value="updated">Sort by last updated</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40 pointer-events-none" />
            </div>

            <div className="h-4 w-px bg-white/8" />

            <div className="flex items-center gap-1 bg-[#1C1C1C] border border-white/8 rounded-md p-0.5">
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white/8 text-white'
                    : 'text-white/50 hover:text-white'
                }`}
                title="List view"
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('compact')}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === 'compact'
                    ? 'bg-white/8 text-white'
                    : 'text-white/50 hover:text-white'
                }`}
                title="Compact view"
              >
                <ListCollapse className="w-3.5 h-3.5" />
              </button>
              <button
                className="p-1.5 rounded text-white/50 hover:text-white transition-colors"
                title="Kanban view"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
