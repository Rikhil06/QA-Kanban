'use client';

import { fetchOpenIssues } from '@/utils/fetchOpenIssues';
import { useEffect, useState } from 'react';
import { RiProgress2Line } from "react-icons/ri";

export default function OpenIssuesCard() {
  const [openIssues, setOpenIssues] = useState<number | null>(null);

useEffect(() => {
  const loadOpenIssues = async () => {
    try {
      const data = await fetchOpenIssues();
      setOpenIssues(data.openIssues);
    } catch (err) {
      console.error(err);
      // optional: show toast / fallback UI
    }
  };

  loadOpenIssues();
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
