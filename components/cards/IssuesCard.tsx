'use client';

import { getToken } from '@/lib/auth';
import { useEffect, useState } from 'react';
import { RiProgress2Line } from "react-icons/ri";

export default function OpenIssuesCard() {
  const [openIssues, setOpenIssues] = useState<number | null>(null);
  const token = getToken();

  useEffect(() => {
    const fetchOpenIssues = async () => {
      try {
        const res = await fetch('http://127.0.0.1:4000/api/stats/open-issues', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setOpenIssues(data.openIssues);
      } catch (err) {
        console.error('Failed to load open issues:', err);
      }
    };

    fetchOpenIssues();
  }, []);

  return (
    <div className="bg-white shadow-md rounded-2xl p-5 flex items-center gap-4 border border-gray-100 hover:shadow-lg transition">
        <RiProgress2Line size={40} color='#6C5CE7' />
        <div>
            <h2 className="text-xl font-semibold mb-2">Open Issues</h2>
            <p className="text-3xl font-bold">
                {openIssues !== null ? openIssues : '...'}
            </p>
        </div>
    </div>
  );
}
