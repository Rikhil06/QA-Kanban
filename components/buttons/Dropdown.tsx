'use client';

import React, { useState, useRef, useEffect } from 'react';

interface DropdownOption {
  label: string;
  onClick: () => void;
}

interface DropdownProps {
  text: string;
  options?: DropdownOption[];
}

export default function Dropdown({ text, options = [] }: DropdownProps) {
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            setOpen(false);
        }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

      return (
        <div className="relative inline-block text-left" ref={dropdownRef}>
            <button
                type="button"
                className="flex w-full justify-center items-center gap-x-1.5 px-3 py-2 text-sm text-gray-900 ring-gray-300 ring-inset hover:bg-gray-200 hover:rounded-md cursor-pointer"
                onClick={() => setOpen((prev) => !prev)}
            >
                {text}
                <svg
                className="w-4 h-4 ml-1 text-gray-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {open && options.length > 0 && (
                <div
                className="absolute right-0 z-10 mt-2 w-48 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-hidden"
                role="menu"
                aria-orientation="vertical"
                >
                <div className="py-1">
                    {options.map((option, index) => (
                    <button
                        key={index}
                        onClick={() => {
                        option.onClick();
                        setOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                        {option.label}
                    </button>
                    ))}
                </div>
                </div>
            )}
            </div>
        );    
}
