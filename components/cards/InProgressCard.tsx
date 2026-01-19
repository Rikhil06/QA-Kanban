'use client';

import { getToken } from '@/lib/auth';
import { useEffect, useState } from 'react';
import { RiProgress6Line } from "react-icons/ri";

export default function InProgressCard() {
  const [inProgressIssues, setInProgressIssues] = useState<number | null>(null);
  const token = getToken();

  useEffect(() => {
    const fetchOpenIssues = async () => {
      try {
        const res = await fetch('https://qa-backend-105l.onrender.com /api/stats/in-progress', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
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
        <RiProgress6Line size={40} color='#6C5CE7' />
        <div>
            <h2 className="text-xl font-semibold mb-2">Issues in Progress</h2>
            <p className="text-3xl font-bold">
                {inProgressIssues !== null ? inProgressIssues : '...'}
            </p>
        </div>
    </div>
  );
}
