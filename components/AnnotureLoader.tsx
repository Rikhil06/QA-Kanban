'use client';

import { useEffect, useState } from 'react';

const SIZE_CLASSES = {
  sm: 'text-xl',
  md: 'text-3xl',
  lg: 'text-5xl',
} as const;

const FILL_DURATION_MS = 1400;

interface AnnotureLoaderProps {
  className?: string;
  size?: keyof typeof SIZE_CLASSES;
}

export function AnnotureLoader({ className = '', size = 'md' }: AnnotureLoaderProps) {
  const [filled, setFilled] = useState(false);

  useEffect(() => {
    // Kick off the first fill almost immediately, then alternate fill/drain on a timer.
    const kickoff = setTimeout(() => setFilled(true), 50);
    const interval = setInterval(() => setFilled((f) => !f), FILL_DURATION_MS);
    return () => {
      clearTimeout(kickoff);
      clearInterval(interval);
    };
  }, []);

  return (
    <div
      className={`flex items-center justify-center w-full ${className}`}
      role="status"
    >
      <div className={`relative inline-block font-bold tracking-tight select-none ${SIZE_CLASSES[size]}`}>
        {/* Base layer — dim outline, defines the natural size of the word */}
        <span className="text-white/10">Annoture</span>

        {/* Clip box — width transitions 0% to 100% and back, revealing the purple layer */}
        <span
          className="absolute top-0 left-0 h-full overflow-hidden transition-[width] ease-in-out"
          style={{ width: filled ? '100%' : '0%', transitionDuration: `${FILL_DURATION_MS}ms` }}
        >
          {/* Purple fill — absolutely positioned so it stays full-width and just gets clipped */}
          <span className="absolute top-0 left-0 whitespace-nowrap bg-linear-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
            Annoture
          </span>
        </span>
      </div>
      <span className="sr-only">Loading...</span>
    </div>
  );
}
