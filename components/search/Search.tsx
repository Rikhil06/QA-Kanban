'use client';
import { useState, useEffect } from 'react';
import debounce from 'lodash.debounce';
import { Search } from 'lucide-react';
import { getToken } from '@/lib/auth';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({
    projects: [],
    issues: [],
    users: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const token = getToken();

  const search = async (q: string) => {
    if (!q) {
      setResults({ projects: [], issues: [], users: [] });
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `${process.env.BACKEND_URL}/api/search?q=${encodeURIComponent(q)}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!res.ok) {
        // Try to parse error body
        let errorMsg = `HTTP error! status: ${res.status}`;
        try {
          const json = await res.json();
          errorMsg = json.error || errorMsg;
        } catch {
          // fallback if body isn’t JSON
          const text = await res.text();
          if (text) errorMsg = text;
        }
        throw new Error(errorMsg);
      }

      const data = await res.json();
      setResults(data);
    } catch (err: any) {
      console.error('Search failed:', err);
      setError(err.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = debounce(search, 300);

  useEffect(() => {
    debouncedSearch(query);
    return () => debouncedSearch.cancel();
  }, [query]);

  return (
    <div className="flex-1 max-w-2xl">
      <div className="relative group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-hover:text-gray-400 transition-colors" />
        <input
          type="text"
          placeholder="Search issues, projects, or type a command..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-white/4 border border-white/8 rounded-lg pl-10 pr-4 py-2 text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all hover:bg-white/6"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 text-xs bg-white/10 rounded border border-white/10 text-gray-500">
            ⌘
          </kbd>
          <kbd className="px-1.5 py-0.5 text-xs bg-white/10 rounded border border-white/10 text-gray-500">
            K
          </kbd>
        </div>
      </div>

      {loading && (
        <p className="absolute mt-2 text-gray-400 text-sm">Searching...</p>
      )}
      {error && <p className="absolute mt-2 text-red-400 text-sm">{error}</p>}

      {query && !loading && !error && (
        <div className="absolute mt-2 w-full bg-[#0A0A0A] border border-white/10 rounded-lg shadow-lg max-h-80 overflow-y-auto z-50">
          {results.projects.length > 0 && (
            <div>
              <p className="px-3 py-1 text-gray-400 text-xs uppercase">
                Projects
              </p>
              {results.projects.map((p: any) => (
                <div
                  key={p.id}
                  className="px-3 py-2 hover:bg-white/10 cursor-pointer"
                >
                  {p.name}
                </div>
              ))}
            </div>
          )}

          {results.issues.length > 0 && (
            <div>
              <p className="px-3 py-1 text-gray-400 text-xs uppercase">
                Issues
              </p>
              {results.issues.map((i: any) => (
                <div
                  key={i.id}
                  className="px-3 py-2 hover:bg-white/10 cursor-pointer"
                >
                  {i.comment || '(No title)'} - {i.siteName}
                </div>
              ))}
            </div>
          )}

          {results.users.length > 0 && (
            <div>
              <p className="px-3 py-1 text-gray-400 text-xs uppercase">Users</p>
              {results.users.map((u: any) => (
                <div
                  key={u.id}
                  className="px-3 py-2 hover:bg-white/10 cursor-pointer"
                >
                  {u.name} ({u.email})
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
