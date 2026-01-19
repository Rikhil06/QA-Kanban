import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { Capitalize, normalizeStatus } from '@/utils/helpers';

interface FilterChipProps {
  label: string;
  options?: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

export function FilterChip({ label, options, selected, onChange }: FilterChipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter((s) => s !== option));
    } else {
      onChange([...selected, option]);
    }
  };


  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-1.5 h-8 px-3 rounded-full text-xs transition-colors
          ${selected.length > 0
            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:border-purple-500/50'
            : 'bg-[#1C1C1C] text-white/60 border border-white/8 hover:border-white/12 hover:text-white/80'
          }
        `}
      >
        {label}
        {selected.length > 0 && (
          <span className="flex items-center justify-center w-4 h-4 rounded-full bg-purple-500/30 text-purple-200 text-[10px]">
            {selected.length}
          </span>
        )}
        <ChevronDown className="w-3 h-3" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-[#1A1A1A] border border-white/8 rounded-lg shadow-xl overflow-hidden z-50">
          <div className="p-1">
            {options?.map((option) => (
              <button
                key={option}
                onClick={() => toggleOption(option)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm text-white/80 hover:bg-white/6 transition-colors"
              >
                <span>{label === 'Status' ? normalizeStatus(option) : Capitalize(option)}</span>
                {selected.includes(option) && (
                  <Check className="w-4 h-4 text-purple-400" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
