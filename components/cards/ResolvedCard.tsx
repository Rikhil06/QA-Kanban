'use client';

import { getToken } from '@/lib/auth';
import { useEffect, useState } from 'react';
import { RiProgress8Line } from "react-icons/ri";

export default function ResolvedIssuesCard() {
  const [resolvedIssues, setResolvedIssues] = useState<number | null>(null);
  const token = getToken();

  useEffect(() => {
    const fetchResolvedIssues = async () => {
      try {
        const res = await fetch('http://127.0.0.1:4000/api/stats/resolved', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setResolvedIssues(data.resolvedIssues);
      } catch (err) {
        console.error('Failed to load open issues:', err);
      }
    };

    fetchResolvedIssues();
  }, []);

  return (
    <div className="bg-white shadow-md rounded-2xl p-5 flex items-center gap-4 border border-gray-100 hover:shadow-lg transition">
        <RiProgress8Line size={40} color='#6C5CE7' />
        <div>
            <h2 className="text-xl font-semibold mb-2">Closed Issues</h2>
            <p className="text-3xl font-bold">
                {resolvedIssues !== null ? resolvedIssues : '...'}
            </p>
        </div>
    </div>
  );
}
