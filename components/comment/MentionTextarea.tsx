'use client';

import { useEffect, useRef, useState, KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';

export interface Mentionable {
  id: string;
  name: string;
  email: string;
}

interface Props {
  value: string;           // raw token string — owned by parent
  onChange: (val: string) => void;
  onKeyDown?: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
  members: Mentionable[];
  currentUserId?: string;
}

// Convert token string → display string for the textarea
export function toDisplayText(raw: string) {
  return raw.replace(/@\[([^\]]+)\]\([^)]+\)/g, '@$1');
}

// Extract user IDs from token string
export function parseMentions(raw: string): string[] {
  return (raw.match(/@\[([^\]]+)\]\(([^)]+)\)/g) || [])
    .map((m) => m.match(/@\[([^\]]+)\]\(([^)]+)\)/)?.[2] ?? '')
    .filter(Boolean);
}

function getInitials(name: string) {
  return name.split(' ').slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('');
}

// Map a display string back to a token string, preserving existing tokens
// Strategy: keep a mapping of display-position → token so edits outside
// mention regions don't disturb tokens already inserted.
// Simpler approach: re-sync on every keystroke using the token value as source of truth.

export default function MentionTextarea({
  value,           // raw with tokens e.g. "Hello @[Ankita](uid123) great work"
  onChange,
  onKeyDown,
  placeholder,
  rows = 3,
  className = '',
  members,
  currentUserId,
}: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Internal raw token string — always in sync with parent `value`
  const rawRef = useRef(value);

  // What shows in the <textarea>
  const [displayValue, setDisplayValue] = useState(() => toDisplayText(value));

  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionStart, setMentionStart] = useState<number | null>(null);   // index in displayValue
  const [dropdownIndex, setDropdownIndex] = useState(0);
  const [dropdownPos, setDropdownPos] = useState<{ bottom: number; left: number; width: number } | null>(null);

  const isPickerOpen = mentionStart !== null && dropdownPos !== null;

  const filtered = members
    .filter((m) => m.id !== currentUserId)
    .filter((m) =>
      mentionQuery
        ? m.name.toLowerCase().includes(mentionQuery.toLowerCase()) ||
          m.email.toLowerCase().includes(mentionQuery.toLowerCase())
        : true
    );

  // Sync when parent clears the value (e.g. after submit)
  useEffect(() => {
    if (value !== rawRef.current) {
      rawRef.current = value;
      setDisplayValue(toDisplayText(value));
    }
  }, [value]);

  // Position dropdown above textarea using fixed coords
  useEffect(() => {
    if (mentionStart === null) { setDropdownPos(null); return; }
    const ta = textareaRef.current;
    if (!ta) return;
    const rect = ta.getBoundingClientRect();
    setDropdownPos({
      bottom: window.innerHeight - rect.top + 8,
      left: rect.left,
      width: rect.width,
    });
  }, [mentionStart]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const display = e.target.value;
    const caret = e.target.selectionStart ?? display.length;
    setDisplayValue(display);

    // Detect @ trigger in display text
    const textUpToCaret = display.slice(0, caret);
    const atMatch = textUpToCaret.match(/@(\w*)$/);
    if (atMatch) {
      setMentionStart(caret - atMatch[0].length);
      setMentionQuery(atMatch[1]);
      setDropdownIndex(0);
    } else {
      setMentionStart(null);
      setMentionQuery('');
    }

    // Rebuild raw token string from updated display text:
    // Replace display mentions (@Name) back to tokens using the existing raw value as reference.
    // Simple heuristic: the token positions in raw correspond to @Name spans in display.
    // We re-map by replacing display text's @Name occurrences with known tokens, in order.
    const existingTokens = (rawRef.current.match(/@\[[^\]]+\]\([^)]+\)/g)) || [];
    let rebuilt = display;
    let offset = 0;
    for (const token of existingTokens) {
      const displayMention = token.replace(/@\[([^\]]+)\]\([^)]+\)/, '@$1');
      const idx = rebuilt.indexOf(displayMention, offset);
      if (idx !== -1) {
        rebuilt = rebuilt.slice(0, idx) + token + rebuilt.slice(idx + displayMention.length);
        offset = idx + token.length;
      }
    }

    rawRef.current = rebuilt;
    onChange(rebuilt);
  };

  const insertMention = (member: Mentionable) => {
    if (mentionStart === null) return;

    const token = `@[${member.name}](${member.id})`;
    const displayMention = `@${member.name}`;

    // Update display string
    const before = displayValue.slice(0, mentionStart);
    const after = displayValue.slice(mentionStart + 1 + mentionQuery.length);
    const newDisplay = before + displayMention + ' ' + after;
    setDisplayValue(newDisplay);

    // Update raw token string
    const rawBefore = rawRef.current.slice(0, mentionStart);
    const rawAfter = rawRef.current.slice(mentionStart + 1 + mentionQuery.length);
    const newRaw = rawBefore + token + ' ' + rawAfter;
    rawRef.current = newRaw;
    onChange(newRaw);

    setMentionStart(null);
    setMentionQuery('');

    setTimeout(() => {
      const ta = textareaRef.current;
      if (!ta) return;
      const pos = (before + displayMention + ' ').length;
      ta.focus();
      ta.setSelectionRange(pos, pos);
    }, 0);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (isPickerOpen && filtered.length > 0) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setDropdownIndex((i) => (i + 1) % filtered.length); return; }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setDropdownIndex((i) => (i - 1 + filtered.length) % filtered.length); return; }
      if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); insertMention(filtered[dropdownIndex]); return; }
      if (e.key === 'Escape') { setMentionStart(null); return; }
    }
    onKeyDown?.(e);
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
        textareaRef.current && !textareaRef.current.contains(e.target as Node)
      ) setMentionStart(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const dropdown = isPickerOpen && filtered.length > 0 && dropdownPos
    ? createPortal(
      <div
        ref={dropdownRef}
        style={{
          position: 'fixed',
          bottom: dropdownPos.bottom,
          left: dropdownPos.left,
          zIndex: 99999,
          width: Math.min(dropdownPos.width, 320),
          minWidth: 280,
        }}
      >
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: '#141414',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 -4px 6px -1px rgba(0,0,0,0.1), 0 -24px 48px -8px rgba(0,0,0,0.6)',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06]">
            <span className="text-xs font-medium text-white/40 tracking-wide">Members</span>
            {mentionQuery && (
              <span className="text-[11px] bg-purple-500/15 text-purple-300 px-2 py-0.5 rounded-full font-mono border border-purple-500/20">
                @{mentionQuery}
              </span>
            )}
          </div>

          {/* List */}
          <div className="py-1 max-h-56 overflow-y-auto">
            {filtered.map((member, i) => {
              const active = i === dropdownIndex;
              return (
                <button
                  key={member.id}
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); insertMention(member); }}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-left transition-colors"
                  style={{ background: active ? 'rgba(139,92,246,0.1)' : 'transparent' }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                    style={{
                      background: active ? 'rgba(139,92,246,0.25)' : 'rgba(255,255,255,0.07)',
                      color: active ? '#c4b5fd' : 'rgba(255,255,255,0.5)',
                      boxShadow: active ? '0 0 0 1.5px rgba(139,92,246,0.4)' : 'none',
                    }}
                  >
                    {getInitials(member.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate" style={{ color: active ? '#fff' : 'rgba(255,255,255,0.75)' }}>
                      {member.name}
                    </p>
                    <p className="text-[11px] truncate" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      {member.email}
                    </p>
                  </div>
                  {active && (
                    <span className="text-[10px] shrink-0 px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.3)' }}>
                      ↵
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-white/[0.05]">
            <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
              ↑↓ navigate &middot; ↵ select &middot; esc dismiss
            </p>
          </div>
        </div>

        {/* Arrow pointing down to textarea */}
        <div
          className="absolute left-5"
          style={{
            bottom: -5,
            width: 10,
            height: 10,
            background: '#141414',
            border: '1px solid rgba(255,255,255,0.08)',
            borderTop: 'none',
            borderLeft: 'none',
            transform: 'rotate(45deg)',
          }}
        />
      </div>,
      document.body
    )
    : null;

  return (
    <>
      <textarea
        ref={textareaRef}
        value={displayValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={rows}
        className={className}
      />
      {dropdown}
    </>
  );
}
