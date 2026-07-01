'use client';

import { useEffect, useState } from 'react';
import { RiProgress6Line } from 'react-icons/ri';

export default function InProgressCard() {
  const [inProgressIssues, setInProgressIssues] = useState<number | null>(null);

  useEffect(() => {
    const fetchOpenIssues = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/stats/in-progress`,
          { credentials: 'include' },
        );
        const data = await res.json();
        setInProgressIssues(data.inProgressIssues);
      } catch (err) {
        console.error('Failed to load open issues:', err);
      }
    };

    fetchOpenIssues();
  }, []);

  return (
    <div className="bg-white shadow-md rounded-2xl p-5 flex items-center gap-4 border border-gray-100 hover:shadow-lg transition">
      <RiProgress6Line size={40} color="#6C5CE7" />
      <div>
        <h2 className="text-xl font-semibold mb-2">Issues in Progress</h2>
        <p className="text-3xl font-bold">
          {inProgressIssues !== null ? inProgressIssues : '...'}
        </p>
      </div>
    </div>
  );
}
