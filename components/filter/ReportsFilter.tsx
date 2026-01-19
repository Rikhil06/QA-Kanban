import { useState } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { Filters, User } from '@/types/types';
import { normalizeStatus } from '@/utils/helpers';

interface FilterBarProps {
  filters: Filters;
  users?: User[];
  pages?:  string[];
  setFilters: (filters: Filters) => void;
  onClearFilters: () => void;
}

const statusOptions = ['new', 'inProgress', 'done'];
const priorityOptions = ['low', 'medium', 'high', 'urgent'];

export function FilterBar({ filters, setFilters, onClearFilters, users, pages }: FilterBarProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const userNames = users?.map(user => user.name);
  const pageNames = pages?.map(page => {
    if (page === '/') return 'home';
    return page.replace(/^\/|\/$/g, "");
  })

  const toggleFilter = (category: keyof Filters, value: string) => {
    setFilters({
      ...filters,
      [category]: filters[category]?.includes(value)
        ? filters[category].filter((v) => v !== value)
        : [...filters[category], value],
    });
  };

  const hasActiveFilters =
    filters.status.length > 0 ||
    filters.priority.length > 0 ||
    filters.assignee.length > 0 ||
    filters.pages.length > 0;

  return (
    <div className="sticky top-0 z-40 border-b border-white/8 bg-[#0F0F0F]/80 backdrop-blur-xl">
      <div className="flex items-center gap-2 px-6 py-2.5">
        {/* Filter dropdowns */}
        <FilterDropdown
          label="Status"
          options={statusOptions}
          selected={filters.status}
          onToggle={(value) => toggleFilter('status', value)}
          isOpen={openDropdown === 'status'}
          onToggleOpen={() => setOpenDropdown(openDropdown === 'status' ? null : 'status')}
        />
        
        <FilterDropdown
          label="Priority"
          options={priorityOptions}
          selected={filters.priority}
          onToggle={(value) => toggleFilter('priority', value)}
          isOpen={openDropdown === 'priority'}
          onToggleOpen={() => setOpenDropdown(openDropdown === 'priority' ? null : 'priority')}
        />
        
        <FilterDropdown
          label="Assignee"
          options={userNames}
          selected={filters.assignee}
          onToggle={(value) => toggleFilter('assignee', value)}
          isOpen={openDropdown === 'assignee'}
          onToggleOpen={() => setOpenDropdown(openDropdown === 'assignee' ? null : 'assignee')}
        />
        
        <FilterDropdown
          label="Pages"
          options={pageNames}
          selected={filters.pages}
          onToggle={(value) => toggleFilter('pages', value)}
          isOpen={openDropdown === 'pages'}
          onToggleOpen={() => setOpenDropdown(openDropdown === 'pages' ? null : 'pages')}
        />

        {/* Clear filters button */}
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="ml-2 flex items-center gap-1.5 rounded-lg border border-white/8 bg-[#1C1C1C] px-2.5 py-1 text-xs text-white/60 transition-colors hover:border-white/12 hover:bg-[#222] hover:text-white/80"
          >
            <X className="h-3 w-3" />
            Clear filters
          </button>
        )}

        {/* Active filter chips */}
        <div className="ml-auto flex items-center gap-2">
          {filters.status.map((status) => (
            <FilterChip
              key={status}
              label={status}
              onRemove={() => toggleFilter('status', status)}
            />
          ))}
          {filters.priority.map((priority) => (
            <FilterChip
              key={priority}
              label={priority}
              onRemove={() => toggleFilter('priority', priority)}
            />
          ))}
          {filters.assignee.map((assignee) => (
            <FilterChip
              key={assignee}
              label={assignee}
              onRemove={() => toggleFilter('assignee', assignee)}
            />
          ))}
          {filters.pages.map((page) => (
            <FilterChip
              key={page}
              label={page}
              onRemove={() => toggleFilter('pages', page)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface FilterDropdownProps {
  label: string;
  options: string[] | undefined;
  selected: string[];
  onToggle: (value: string) => void;
  isOpen: boolean;
  onToggleOpen: () => void;
}

function FilterDropdown({
  label,
  options,
  selected,
  onToggle,
  isOpen,
  onToggleOpen,
}: FilterDropdownProps) {
  return (
    <div className="relative">
      <button
        onClick={onToggleOpen}
        className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs transition-colors ${
          selected.length > 0
            ? 'border-indigo-500/30 bg-indigo-500/10 text-indigo-300'
            : 'border-white/8 bg-[#1C1C1C] text-white/60 hover:border-white/12 hover:bg-[#222]'
        }`}
      >
        {label}
        {selected.length > 0 && (
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500/20 text-[10px] text-indigo-300">
            {selected.length}
          </span>
        )}
        <ChevronDown className="h-3 w-3" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={onToggleOpen}
          />
          <div className="absolute left-0 top-full z-50 mt-1 w-48 rounded-lg border border-white/8 bg-[#1C1C1C] p-1 shadow-2xl">
            {options?.map((option) => (
              <button
                key={option}
                onClick={() => onToggle(option)}
                className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-xs text-white/80 transition-colors hover:bg-[#222]"
              >
                <div
                  className={`h-3 w-3 rounded border transition-colors ${
                    selected.includes(option)
                      ? 'border-indigo-500 bg-indigo-500'
                      : 'border-white/12 bg-transparent'
                  }`}
                >
                  {selected.includes(option) && (
                    <svg
                      viewBox="0 0 12 12"
                      className="h-full w-full text-white"
                    >
                      <path
                        d="M2 6l3 3 5-6"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
                <span className="capitalize">{normalizeStatus(option)}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

interface FilterChipProps {
  label: string;
  onRemove: () => void;
}

function FilterChip({ label, onRemove }: FilterChipProps) {
  return (
    <div className="flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2.5 py-0.5 text-xs text-indigo-300">
      <span className="capitalize">{label}</span>
      <button
        onClick={onRemove}
        className="rounded-full transition-colors hover:bg-indigo-500/20"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}
