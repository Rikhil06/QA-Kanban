'use client';

import { ReactNode, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Stale times matched to backend cache TTLs so the client never re-fetches
// more often than the server would return fresh data anyway.
export const STALE = {
  STATS:   5 * 60 * 1000,   // 5 min  — dashboard counters
  SITES:   2 * 60 * 1000,   // 2 min  — sites list
  COLUMNS: 10 * 60 * 1000,  // 10 min — kanban column config
  DEFAULT: 60 * 1000,        // 1 min  — everything else
};

export function ReactQueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: STALE.DEFAULT,
            gcTime: 10 * 60 * 1000, // keep unused data in memory for 10 min
            retry: 1,
            refetchOnWindowFocus: true,
            refetchOnMount: true,
          },
          mutations: {
            throwOnError: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
