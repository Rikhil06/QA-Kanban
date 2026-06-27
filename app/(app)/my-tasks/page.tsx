'use client';

import { TasksFilter } from '@/components/filter/TasksFilter';
import { getToken } from '@/lib/auth';
import { fetcher } from '@/lib/fetcher';
import { StatusData, Task } from '@/types/types';
import { formatTimeAgo } from '@/utils/formatTimeAgo';
import {
  formatFriendlyDate,
  getInitials,
  normalizeStatus,
} from '@/utils/helpers';
import { useQuery } from '@tanstack/react-query';
import { STALE } from '@/app/providers/ReactQueryProvider';
import { AlertCircle, Calendar, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@/context/UserContext';

export default function Page() {
  return (
    <Suspense>
      <MyTasksContent />
    </Suspense>
  );
}

function MyTasksContent() {
  const token = getToken();
  const { user } = useUser();
  const teamId = user?.teamId;
  const router = useRouter();
  const params = useSearchParams();

  const [viewMode, setViewMode] = useState<'list' | 'compact'>(
    (params.get('view') as 'list' | 'compact') ?? 'list',
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string[]>(params.getAll('status'));
  const [priorityFilter, setPriorityFilter] = useState<string[]>(params.getAll('priority'));
  const [siteFilter, setSiteFilter] = useState<string[]>(params.getAll('site'));
  const [dueDateFilter, setDueDateFilter] = useState<string[]>(params.getAll('due'));
  const [sortBy, setSortBy] = useState(params.get('sort') ?? 'dueDate');
  const [groupBy, setGroupBy] = useState<'dueDate' | 'status' | 'site' | 'none'>(
    (params.get('group') as 'dueDate' | 'status' | 'site' | 'none') ?? 'dueDate',
  );
  const isCompact = viewMode === 'compact';

  useEffect(() => {
    const p = new URLSearchParams();
    if (viewMode !== 'list') p.set('view', viewMode);
    if (sortBy !== 'dueDate') p.set('sort', sortBy);
    if (groupBy !== 'dueDate') p.set('group', groupBy);
    statusFilter.forEach((v) => p.append('status', v));
    priorityFilter.forEach((v) => p.append('priority', v));
    siteFilter.forEach((v) => p.append('site', v));
    dueDateFilter.forEach((v) => p.append('due', v));
    const qs = p.toString();
    router.replace(qs ? `?${qs}` : '?', { scroll: false });
  }, [viewMode, sortBy, groupBy, statusFilter, priorityFilter, siteFilter, dueDateFilter]);

  const { data: issuesSummary = [], isLoading: issuesLoading } = useQuery<
    StatusData[]
  >({
    queryKey: ['issues-summary', teamId],
    queryFn: () =>
      fetcher(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/stats/issues-summary?teamId=${teamId ?? ''}`,
        token,
      ),
    staleTime: STALE.STATS,
    enabled: !!token && teamId !== undefined,
  });

  // --- React Query: Tasks ---
  const { data: tasks = [], isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ['tasks', teamId],
    queryFn: () =>
      fetcher(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/tasks?teamId=${teamId ?? ''}`, token),
    staleTime: STALE.DEFAULT,
    enabled: !!token && teamId !== undefined,
  });

  const total = issuesSummary.reduce(
    (sum: number, item: any) => sum + item.value,
    0,
  );
  const sites = tasks.map((task) => task.site);
  const uniqueSites: string[] = [...new Set(sites)];

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter([]);
    setPriorityFilter([]);
    setSiteFilter([]);
    setDueDateFilter([]);
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter((task: Task) => {
      // Search
      if (
        searchQuery &&
        !task.title.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }

      // Status
      if (statusFilter.length > 0 && !statusFilter.includes(task.status)) {
        return false;
      }

      // Priority
      if (
        priorityFilter.length > 0 &&
        !priorityFilter.includes(task.priority)
      ) {
        return false;
      }

      // Site
      if (siteFilter.length > 0 && !siteFilter.includes(task.site)) {
        return false;
      }

      return true;
    });
  }, [tasks, searchQuery, statusFilter, priorityFilter, siteFilter]);

  const priorityOrder: Record<string, number> = {
    urgent: 4,
    high: 3,
    medium: 2,
    low: 1,
    'not assigned': 0,
  };

  const sortedFilteredTasks = useMemo(() => {
    const sorted = [...filteredTasks];
    if (sortBy === 'dueDate') {
      sorted.sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });
    } else if (sortBy === 'priority') {
      sorted.sort(
        (a, b) =>
          (priorityOrder[b.priority] ?? 0) - (priorityOrder[a.priority] ?? 0),
      );
    } else if (sortBy === 'updated') {
      sorted.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    }
    return sorted;
  }, [filteredTasks, sortBy]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'inProgress':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'QA':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'new':
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    }
  };

  const filterTasks = (
    tasks: Task[],
    filter: 'overdue' | 'today' | 'week' | 'upcoming' | 'noDue',
  ) => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    // Start of the week (Monday)
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(
      startOfToday.getDate() - ((startOfToday.getDay() + 6) % 7),
    ); // Monday
    startOfWeek.setHours(0, 0, 0, 0);

    // End of the week (Sunday)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const startOfTomorrow = new Date(startOfToday);
    startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

    return tasks.filter((task) => {
      if (!task.dueDate) return filter === 'noDue';
      const due = new Date(task.dueDate);

      switch (filter) {
        case 'overdue':
          return due < startOfToday; // strictly before today
        case 'today':
          return due >= startOfToday && due <= endOfToday; // today only
        case 'week':
          return due >= startOfTomorrow && due <= endOfWeek; // tomorrow → Sunday
        case 'upcoming':
          return due > endOfWeek; // after this week
        case 'noDue':
          return !task.dueDate;
        default:
          return true;
      }
    });
  };

  const overdueTasks = useMemo(
    () => filterTasks(sortedFilteredTasks, 'overdue'),
    [sortedFilteredTasks],
  );
  const todayTasks = useMemo(
    () => filterTasks(sortedFilteredTasks, 'today'),
    [sortedFilteredTasks],
  );
  const weekTasks = useMemo(
    () => filterTasks(sortedFilteredTasks, 'week'),
    [sortedFilteredTasks],
  );
  const upcomingTasks = useMemo(
    () => filterTasks(sortedFilteredTasks, 'upcoming'),
    [sortedFilteredTasks],
  );
  const noDueTasks = useMemo(
    () => filterTasks(sortedFilteredTasks, 'noDue'),
    [sortedFilteredTasks],
  );
  const dateFilteredTasks = useMemo(() => {
    if (dueDateFilter.length === 0) return sortedFilteredTasks;
    return filterTasks(sortedFilteredTasks, dueDateFilter[0] as any);
  }, [sortedFilteredTasks, dueDateFilter]);

  const renderTaskSection = (title: string, tasks: Task[]) => {
    if (tasks.length === 0) return null; // skip empty sections

    return (
      <div className="mb-6" key={title}>
        <div className="flex items-center gap-2 pb-3">
          <h3 className="text-sm text-white/50 uppercase tracking-wide">
            {title}
          </h3>
          <div className="h-px flex-1 bg-white/6"></div>
          <span className="text-xs text-white/40">{tasks.length}</span>
        </div>
        <div className="space-y-px">
          {tasks.map((task: Task) => (
            <Link
              key={task.id}
              className={`group relative flex items-center gap-4 bg-[#1C1C1C] border border-white/6 hover:border-white/12 rounded-lg transition-all cursor-pointer
              ${isCompact ? 'px-4 py-2' : 'px-4 py-3'}
            `}
              href={`/reports/${task.slug}?report=${task.id}`}
              // onMouseEnter={() => setIsHovered(true)}
              // onMouseLeave={() => setIsHovered(false)}
            >
              {/* Same task JSX as before */}
              <button className="shrink-0">{/* Checkbox */}</button>
              <div
                className={`shrink-0 w-1 h-4 rounded-full ${getPriorityColor(task.priority)}`}
              />
              <div className="flex-1 min-w-0">
                <div
                  className={`flex items-center gap-3 ${isCompact ? 'flex-wrap' : ''}`}
                >
                  <span className="text-white/90 text-sm truncate">
                    {task.title}
                  </span>
                  {!isCompact && (
                    <>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs border ${getStatusColor(task.status)}`}
                      >
                        {task.statusLabel ?? normalizeStatus(task.status)}
                      </span>
                      <span className="text-white/40 text-xs">{task.site}</span>
                    </>
                  )}
                </div>
                {isCompact && (
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] border ${getStatusColor(task.status)}`}
                    >
                      {task.statusLabel ?? normalizeStatus(task.status)}
                    </span>
                    <span className="text-white/40 text-xs">{task.site}</span>
                  </div>
                )}
              </div>
              {task.dueDate && (
                <div
                  className={`shrink-0 text-xs ${new Date(task.dueDate) < new Date() ? 'text-red-400' : 'text-white/50'}`}
                >
                  {formatFriendlyDate(task.dueDate)}
                </div>
              )}
              {!isCompact && (
                <div className="shrink-0 text-xs text-white/40">
                  {formatTimeAgo(task.createdAt)}
                </div>
              )}
              <div className="shrink-0">
                <div className="w-6 h-6 rounded-full bg-linear-to-br from-purple-500 to-blue-500 flex items-center justify-center text-[10px]">
                  {getInitials(task.createdBy.name)}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  };

  const groupByKey = (tasks: Task[], key: keyof Task) => {
    return tasks.reduce<Record<string, Task[]>>((groups, task) => {
      const rawValue = task[key];
      const value =
        rawValue instanceof Date
          ? rawValue.toISOString()
          : typeof rawValue === 'object'
            ? JSON.stringify(rawValue)
            : String(rawValue ?? 'Unknown');

      if (!groups[value]) groups[value] = [];
      groups[value].push(task);
      return groups;
    }, {});
  };

  const groupedByStatus = useMemo(
    () => groupByKey(dateFilteredTasks, 'status'),
    [dateFilteredTasks],
  );
  const groupedBySite = useMemo(
    () => groupByKey(dateFilteredTasks, 'site'),
    [dateFilteredTasks],
  );

  return (
    <>
      <TasksFilter
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        priorityFilter={priorityFilter}
        setPriorityFilter={setPriorityFilter}
        siteFilter={siteFilter}
        setSiteFilter={setSiteFilter}
        dueDateFilter={dueDateFilter}
        setDueDateFilter={setDueDateFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
        viewMode={viewMode}
        setViewMode={setViewMode}
        groupBy={groupBy}
        setGroupBy={setGroupBy}
        onClearFilters={handleClearFilters}
        sites={uniqueSites}
        // hasActiveFilters={hasActiveFilters}
      />
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-auto min-w-0">
          <div className="space-y-px p-4 lg:p-6">
            {groupBy === 'dueDate' && (
              <>
                {renderTaskSection('Overdue', overdueTasks)}
                {renderTaskSection('Today', todayTasks)}
                {renderTaskSection('This Week', weekTasks)}
                {renderTaskSection('Upcoming', upcomingTasks)}
                {renderTaskSection('No Due Date', noDueTasks)}
              </>
            )}

            {groupBy === 'status' &&
              Object.entries(groupedByStatus).map(([status, tasks]) => {
                const label = (tasks as Task[])[0]?.statusLabel ?? normalizeStatus(status);
                return renderTaskSection(label, tasks);
              })}

            {groupBy === 'site' &&
              Object.entries(groupedBySite).map(([site, tasks]) =>
                renderTaskSection(site, tasks),
              )}

            {groupBy === 'none' &&
              renderTaskSection('All Tasks', dateFilteredTasks)}
          </div>
        </div>
        <div className="hidden lg:block w-72 bg-[#0F0F0F] border-l border-white/8 p-6">
          <h3 className="text-sm text-white/70 mb-4">Summary</h3>

          <div className="space-y-3">
            <div className="p-4 bg-[#1C1C1C] border border-white/6 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-blue-500/10`}>
                  <Calendar className={`w-4 h-4 text-blue-400`} />
                </div>
                <div className="flex-1">
                  <div className="text-sm text-white/50">Due Today</div>
                  <div className={`text-xl text-blue-400`}>
                    {todayTasks.length}
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 bg-[#1C1C1C] border border-white/6 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-red-500/10`}>
                  <AlertCircle className={`w-4 h-4 text-red-400`} />
                </div>
                <div className="flex-1">
                  <div className="text-sm text-white/50">Overdue</div>
                  <div className={`text-xl text-red-400`}>
                    {overdueTasks.length}
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 bg-[#1C1C1C] border border-white/6 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-orange-500/10`}>
                  <CheckCircle2 className={`w-4 h-4 text-orange-400`} />
                </div>
                <div className="flex-1">
                  <div className="text-sm text-white/50">This Weeks Tasks</div>
                  <div className={`text-xl text-orange-400`}>
                    {weekTasks.length}
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 bg-[#1C1C1C] border border-white/6 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-green-500/10`}>
                  <CheckCircle2 className={`w-4 h-4 text-green-400`} />
                </div>
                <div className="flex-1">
                  <div className="text-sm text-white/50">Upcoming Tasks</div>
                  <div className={`text-xl text-green-400`}>
                    {upcomingTasks.length}
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 bg-[#1C1C1C] border border-white/6 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-gray-500/10`}>
                  <CheckCircle2 className={`w-4 h-4 text-gray-400`} />
                </div>
                <div className="flex-1">
                  <div className="text-sm text-white/50">No Due Date</div>
                  <div className={`text-xl text-gray-400`}>
                    {noDueTasks.length}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-white/6">
            <div className="text-xs text-white/40 mb-3">Quick Stats</div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/50">Total tasks</span>
                <span className="text-white/90">{total}</span>
              </div>

              {issuesSummary.map((item: StatusData, index: number) => (
                <div
                  className="flex items-center justify-between text-sm"
                  key={index}
                >
                  <span className="text-white/50">{item.name}</span>
                  <span className="text-white/90">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
