'use client';

import { getToken } from '@/lib/auth';
import { useEffect, useState } from 'react';
import { TbReportSearch } from "react-icons/tb";

export default function ReportsThisWeekCard() {
  const [count, setCount] = useState<number | null>(null);
  const token = getToken();

  useEffect(() => {
    fetch('https://qa-backend-105l.onrender.com /api/stats/reports-this-week', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setCount(data.reportsThisWeek))
      .catch((err) => console.error('Failed to fetch reports this week', err));
  }, []);

  return (
    <div className="bg-white shadow-md rounded-2xl p-5 flex items-center gap-4 border border-gray-100 hover:shadow-lg transition">
      <TbReportSearch size={40} className="text-purple-600" />
      <div>
        <h3 className="text-lg font-medium text-gray-700">Reports This Week</h3>
        <p className="text-2xl font-bold text-purple-700">
          {count !== null ? count : '...'}
        </p>
      </div>
    </div>
  );
}
