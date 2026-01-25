import { getToken } from '@/lib/auth';
import { Capitalize } from '@/utils/helpers';
import { Calendar, AlertCircle, Circle, CheckCircle2 } from 'lucide-react';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import { Task } from '@/types/types';
import Link from 'next/link';

const priorityConfig = {
  urgent: { color: 'text-red-400', bg: 'bg-red-500/10', icon: AlertCircle },
  high: { color: 'text-orange-400', bg: 'bg-orange-500/10', icon: AlertCircle },
  medium: { color: 'text-blue-400', bg: 'bg-blue-500/10', icon: Circle },
  low: { color: 'text-gray-400', bg: 'bg-gray-500/10', icon: Circle },
} as const;

const statusConfig = {
  New: {
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
  },
  'In Progress': {
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/20',
  },
  QA: {
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
  },
  Done: {
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/20',
  },
} as const;

export function UsersTasks() {
  const token = getToken();

  const { data: tasks, isLoading } = useSWR(
    token ? [`${process.env.BACKEND_URL}/api/users-tasks`, token] : null,
    ([url, token]) => fetcher(url, token),
  );

  function normalizePriority(value: string): keyof typeof priorityConfig {
    const v = value.toLowerCase();

    if (v === 'urgent') return 'urgent';
    if (v === 'high') return 'high';
    if (v === 'medium') return 'medium';
    if (v === 'low') return 'low';

    return 'low'; // fallback for "not assigned"
  }

  function normalizeStatus(value: string): keyof typeof statusConfig {
    const v = value.toLowerCase();

    if (v === 'new') return 'New';
    if (v === 'inprogress' || v === 'in progress' || 'inProgress')
      return 'In Progress';
    if (v === 'qa') return 'QA';
    if (v === 'done') return 'Done';

    return 'New'; // fallback
  }

  if (isLoading) return <p className="text-white">Loading...</p>;

  return (
    <div className="bg-linear-to-br from-[#1A1A1A] to-[#161616] rounded-xl border border-white/10 p-6 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-white mb-1 font-semibold">My Tasks</h2>
          <p className="text-sm text-gray-500">
            You have {tasks.length} active tasks
          </p>
        </div>
        <Link
          className="text-sm text-purple-400 hover:text-purple-300 transition-colors cursor-pointer font-semibold"
          href="/my-tasks"
        >
          View all
        </Link>
      </div>

      {tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8 text-gray-600" />
          </div>
          <h3 className="text-gray-300 mb-2">All caught up!</h3>
          <p className="text-sm text-gray-500 max-w-xs">
            You don&apos;t have any active tasks right now. Great work!
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-80 overflow-y-scroll custom-scrollbar pr-2.5">
          {tasks.map((task: Task) => {
            const priorityStyle =
              priorityConfig[normalizePriority(task.priority)];
            const statusStyle = statusConfig[normalizeStatus(task.status)];
            const PriorityIcon = priorityStyle.icon;

            return (
              <div
                key={task.id}
                className="group bg-white/3 border border-white/5 rounded-lg p-4 hover:bg-white/5 hover:border-white/10 transition-all cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {task.status === 'Done' ? (
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                    ) : (
                      <Circle className="w-4 h-4 text-gray-600 group-hover:text-gray-500 transition-colors" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm text-gray-200 mb-2 group-hover:text-white transition-colors">
                      {task.title}
                    </h3>

                    <div className="flex items-center gap-3 flex-wrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${statusStyle.bg} ${statusStyle.color} ${statusStyle.border}`}
                      >
                        {normalizeStatus(Capitalize(task.status))}
                      </span>

                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${priorityStyle.bg} ${priorityStyle.color}`}
                      >
                        <PriorityIcon className="w-3 h-3" />
                        {Capitalize(task.priority)}
                      </span>

                      <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        {new Date(task.dueDate).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>

                      <span className="text-xs text-gray-600">
                        {task.project}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
