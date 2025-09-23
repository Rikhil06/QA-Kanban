'use client';

import { getToken } from '@/lib/auth';
import { useEffect, useState } from 'react';
import { IoTimerOutline } from "react-icons/io5";

export default function AvgResolutionTimeCard() {
  const [avgTime, setAvgTime] = useState<string | null>(null);
  const token = getToken();

  useEffect(() => {
    fetch('http://127.0.0.1:4000/api/stats/avg-resolution-time', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setAvgTime(data.avgResolutionTimeHours))
      .catch((err) => console.error('Failed to fetch avg resolution time', err));
  });

  return (
    <div className="bg-white shadow-md rounded-2xl p-5 flex items-center gap-4 border border-gray-100 hover:shadow-lg transition">
        <IoTimerOutline size={40} color='#6C5CE7' />
        <div>
            <h2 className="text-xl font-semibold mb-2">Avg Time to Resolution</h2>
            <p className="text-3xl font-bold text-purple-600">
                {avgTime !== null ? `${avgTime}h` : '...'}
            </p>
        </div>
    </div>
  );
}
