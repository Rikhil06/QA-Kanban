'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from '@hello-pangea/dnd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Report, ColumnId, Filters, User, Comment } from '@/types/types';
import { getToken } from '@/lib/auth';
import { useUser } from '@/context/UserContext';
import { FilterBar } from '@/components/filter/ReportsFilter';
import ReportModal from '@/components/ReportModal';
import { updateStatus } from '@/utils/updateStatus';
import { Capitalize, getInitials, getPriorityColor } from '@/utils/helpers';
import { formatTimeAgo } from '@/utils/formatTimeAgo';
import { Bug, Check, ChevronLeft, Clock, FileText, GripVertical, Plus, Trash2, X } from 'lucide-react';
import { fetchUsersForSite } from '@/lib/fetchUsers';
import { toast } from 'react-toastify';
import { useRealtimeBoard } from '@/hooks/useRealtimeBoard';

type CustomColumn = {
  id: string;
  name: string;
  slug: string;
};

const BASE_COLUMN_IDS = new Set(['new', 'inProgress', 'done']);

export default function SiteReportsPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const token = getToken();
  const slug = params?.slug as string;
  const { user } = useUser();
  const reportIdParams = new URLSearchParams(searchParams.toString());
  const reportIdFromUrl = searchParams.get('report');
  const [selectedId, setSelectedId] = useState<string | null>(reportIdFromUrl);

  const [filters, setFilters] = useState<Filters>({
    status: [],
    priority: [],
    assignee: [],
    pages: [],
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');
  const newColumnInputRef = useRef<HTMLInputElement>(null);

  // -------------------- Column order --------------------
  const [columnOrder, setColumnOrder] = useState<string[]>(['new', 'inProgress', 'done']);
  const [collapsedColumns, setCollapsedColumns] = useState<Set<string>>(new Set());
  // Controls which content (collapsed vs expanded) is rendered — lags behind
  // collapsedColumns on expand so the width animation plays before content swaps.
  const [displayCollapsedColumns, setDisplayCollapsedColumns] = useState<Set<string>>(new Set());

  const toggleCollapse = (id: string) => {
    const isCurrentlyCollapsed = collapsedColumns.has(id);
    if (isCurrentlyCollapsed) {
      // Expanding: animate width immediately, swap content after transition
      setCollapsedColumns((prev) => { const next = new Set(prev); next.delete(id); return next; });
      setTimeout(() => {
        setDisplayCollapsedColumns((prev) => { const next = new Set(prev); next.delete(id); return next; });
      }, 200);
    } else {
      // Collapsing: swap content and width at the same time
      setCollapsedColumns((prev) => new Set([...prev, id]));
      setDisplayCollapsedColumns((prev) => new Set([...prev, id]));
    }
  };
  const orderInitialized = useRef(false);
  const [isLive, setIsLive] = useState(false);

  const queryClient = useQueryClient();

  // -------------------- Real-time sync --------------------
  useRealtimeBoard({
    slug,
    teamId: user?.teamId,
    token: token ?? undefined,
    onConnected: () => setIsLive(true),
    onDisconnected: () => setIsLive(false),
  });

  // -------------------- Fetch Users --------------------
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['users', slug],
    queryFn: () => fetchUsersForSite(slug),
    enabled: !!slug,
  });

  // -------------------- Fetch Reports + Comments --------------------
  const { data } = useQuery<{
    reports: Report[];
    comments: Record<string, Comment[]>;
  }>({
    queryKey: ['reports', slug, user?.teamId],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/site/${slug}?teamId=${user?.teamId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const reports: Report[] = await res.json();

      const commentsMap: Record<string, Comment[]> = {};
      await Promise.all(
        reports.map(async (report) => {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/reports/${report.id}/comments`,
          );
          commentsMap[report.id] = await res.json();
        }),
      );

      return { reports, comments: commentsMap };
    },
    staleTime: 60 * 1000,
  });

  const reports = data?.reports || [];
  const commentsByReportId = data?.comments || {};

  // -------------------- Fetch Custom Columns --------------------
  const { data: customColumns = [] } = useQuery<CustomColumn[]>({
    queryKey: ['columns', slug, user?.teamId],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/site/${slug}/columns?teamId=${user?.teamId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!slug,
  });

  // -------------------- Fetch Persisted Column Order --------------------
  const { data: savedOrder } = useQuery<string[] | null>({
    queryKey: ['column-order', slug, user?.teamId],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/site/${slug}/columns/order?teamId=${user?.teamId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (!res.ok) return null;
      const data = await res.json();
      return data?.order ?? null;
    },
    enabled: !!slug,
  });

  // Initialise column order once both savedOrder + customColumns have loaded
  useEffect(() => {
    if (orderInitialized.current) return;
    if (savedOrder === undefined) return; // still fetching

    orderInitialized.current = true;

    const knownIds = new Set([
      'new',
      'inProgress',
      'done',
      ...customColumns.map((c) => c.id),
    ]);

    if (savedOrder && savedOrder.length > 0) {
      const validOrder = savedOrder.filter((id) => knownIds.has(id));
      const extras = [...knownIds].filter((id) => !savedOrder.includes(id));
      setColumnOrder([...validOrder, ...extras]);
    } else {
      setColumnOrder([
        'new',
        'inProgress',
        'done',
        ...customColumns.map((c) => c.id),
      ]);
    }
  }, [savedOrder, customColumns]);

  // -------------------- Persist Column Order --------------------
  const persistOrderMutation = useMutation({
    mutationFn: async (order: string[]) => {
      await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/site/${slug}/columns/reorder`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ order, teamId: user?.teamId }),
        },
      );
    },
  });

  // -------------------- Create Column --------------------
  const createColumnMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/site/${slug}/columns`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name, teamId: user?.teamId }),
        },
      );
      if (!res.ok) throw new Error('Failed to create column');
      return res.json() as Promise<CustomColumn>;
    },
    onSuccess: (newColumn) => {
      queryClient.setQueryData<CustomColumn[]>(
        ['columns', slug, user?.teamId],
        (old = []) => [...old, newColumn],
      );
      setColumnOrder((prev) => {
        const next = [...prev, newColumn.id];
        persistOrderMutation.mutate(next);
        return next;
      });
      setNewColumnName('');
      setIsAddingColumn(false);
    },
  });

  const handleCreateColumn = () => {
    const name = newColumnName.trim();
    if (!name) return;
    createColumnMutation.mutate(name);
  };

  // -------------------- Delete Column --------------------
  const deleteColumnMutation = useMutation({
    mutationFn: async (columnId: string) => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/site/${slug}/columns/${columnId}?teamId=${user?.teamId}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!res.ok) throw new Error('Failed to delete column');
    },
    onSuccess: (_data, columnId) => {
      queryClient.invalidateQueries({ queryKey: ['columns', slug, user?.teamId] });
      setColumnOrder((prev) => {
        const next = prev.filter((id) => id !== columnId);
        persistOrderMutation.mutate(next);
        return next;
      });
    },
    onError: () => {
      toast.error('Failed to delete column');
    },
  });

  // -------------------------
  // Mutation for drag/drop status updates
  // -------------------------
  const mutation = useMutation({
    mutationFn: ({
      reportId,
      newStatus,
    }: {
      reportId: string;
      newStatus: string;
    }) => updateStatus(token, reportId, newStatus),
    onMutate: async ({ reportId, newStatus }) => {
      await queryClient.cancelQueries({
        queryKey: ['reports', slug, user?.teamId],
      });

      const previousData = queryClient.getQueryData<{
        reports: Report[];
        comments: Record<string, Comment[]>;
      }>(['reports', slug, user?.teamId]);

      if (previousData) {
        queryClient.setQueryData(['reports', slug, user?.teamId], {
          ...previousData,
          reports: previousData.reports.map((r) =>
            r.id === reportId ? { ...r, status: newStatus } : r,
          ),
        });
      }

      return { previousData };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(
          ['reports', slug, user?.teamId],
          context.previousData,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['reports', slug, user?.teamId],
      });
    },
  });

  // -------------------- Filters --------------------
  const pages = reports.map((report: Report) => report.pagePath);
  const uniquePages: string[] = [...new Set(pages)];

  const filteredReports = reports.filter((report: Report) => {
    if (
      searchQuery &&
      !report.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    if (filters.status.length > 0 && !filters.status.includes(report.status))
      return false;
    if (
      filters.priority.length > 0 &&
      !filters.priority.includes(report.priority)
    )
      return false;
    if (
      filters.assignee.length > 0 &&
      !filters.assignee.includes(report.userName)
    )
      return false;
    if (
      filters.pages.length > 0 &&
      !filters.pages.includes(
        report.pagePath === '/'
          ? 'home'
          : report.pagePath.replace(/^\/|\/$/g, ''),
      )
    )
      return false;
    return true;
  });

  const columns = useMemo(() => {
    const sorted = [...filteredReports].sort((a, b) => {
      const da = new Date(a.timestamp).getTime();
      const db = new Date(b.timestamp).getTime();
      return sortOrder === 'newest' ? db - da : da - db;
    });

    const baseColumns: Record<
      string,
      {
        name: string;
        items: Report[];
        columnColour: { bgColour: string; accentColour: string }[];
      }
    > = {
      new: {
        name: 'New',
        items: sorted.filter((r) => r.status === 'new'),
        columnColour: [
          { bgColour: 'bg-sky-100', accentColour: 'border-l-sky-500' },
        ],
      },
      inProgress: {
        name: 'In Progress',
        items: sorted.filter((r) => r.status === 'inProgress'),
        columnColour: [
          { bgColour: 'bg-orange-100', accentColour: 'border-l-orange-500' },
        ],
      },
      done: {
        name: 'Done',
        items: sorted.filter((r) => r.status === 'done'),
        columnColour: [
          { bgColour: 'bg-indigo-100', accentColour: 'border-l-indigo-500' },
        ],
      },
    };

    for (const col of customColumns) {
      baseColumns[col.id] = {
        name: col.name,
        items: sorted.filter((r) => r.status === col.id),
        columnColour: [
          { bgColour: 'bg-violet-100', accentColour: 'border-l-violet-500' },
        ],
      };
    }

    return baseColumns;
  }, [filteredReports, sortOrder, customColumns]);

  // -------------------- Drag & Drop --------------------
  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId, type } = result;
    if (
      !destination ||
      (source.droppableId === destination.droppableId &&
        source.index === destination.index)
    )
      return;

    if (type === 'COLUMN') {
      const colId = draggableId.replace('column-', '');
      const newOrder = Array.from(columnOrder);
      newOrder.splice(source.index, 1);
      newOrder.splice(destination.index, 0, colId);
      setColumnOrder(newOrder);
      persistOrderMutation.mutate(newOrder);
      return;
    }

    // Card drag — update report status
    const newStatus = destination.droppableId as string;
    mutation.mutate({ reportId: draggableId, newStatus });
  };

  // -------------------- Modal --------------------
  const openModal = (id: string) => {
    setSelectedId(id);
    reportIdParams.set('report', id);
    router.push(`?${reportIdParams.toString()}`);
  };

  const closeModal = () => {
    setSelectedId(null);
    reportIdParams.delete('report');
    router.push(`?${reportIdParams.toString()}`);
  };

  const handleReportDeleted = (deletedId: string) => {
    queryClient.setQueryData<{
      reports: Report[];
      comments: Record<string, Comment[]>;
    }>(['reports', slug, user?.teamId], (oldData) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        reports: oldData.reports.filter((r) => r.id !== deletedId),
      };
    });
    setSelectedId(null);
  };

  return (
    <>
      <div className="flex items-center justify-between border-b border-white/8">
        <FilterBar
          filters={filters}
          setFilters={setFilters}
          onClearFilters={() =>
            setFilters({ status: [], priority: [], assignee: [], pages: [] })
          }
          users={users}
          pages={uniquePages}
        />
        {/* Live indicator — shown when WebSocket is connected */}
        <div className={`flex items-center gap-1.5 text-xs px-2.5 py-1 mr-6 rounded-full border transition-all ${
          isLive
            ? 'bg-green-500/10 border-green-500/20 text-green-400'
            : 'bg-white/5 border-white/10 text-white/30'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-green-400 animate-pulse' : 'bg-white/20'}`} />
          {isLive ? 'Live' : 'Connecting...'}
        </div>
      </div>
      <div className="flex h-[calc(100vh-8.5rem)] overflow-x-auto">
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="board" direction="horizontal" type="COLUMN">
            {(boardProvided) => (
              <div
                ref={boardProvided.innerRef}
                {...boardProvided.droppableProps}
                className="flex gap-4 px-6 py-6"
              >
                {columnOrder.map((id, colIndex) => {
                  const column = columns[id];
                  if (!column) return null;
                  return (
                    <Draggable
                      draggableId={`column-${id}`}
                      index={colIndex}
                      key={id}
                    >
                      {(colProvided, colSnapshot) => {
                        const isCollapsed = collapsedColumns.has(id);
                        const showCollapsed = displayCollapsedColumns.has(id);
                        return (
                          <div
                            ref={colProvided.innerRef}
                            {...colProvided.draggableProps}
                            className={`flex flex-col overflow-hidden rounded-xl border transition-all duration-200 border-white/6 bg-[#1C1C1C]/40 ${isCollapsed ? 'w-14 min-w-[3.5rem]' : 'min-w-[320px]'} ${colSnapshot.isDragging ? 'shadow-2xl shadow-black/40 ring-1 ring-white/10' : ''}`}
                          >
                            {showCollapsed ? (
                              /* ---- Collapsed view ---- */
                              <div
                                {...colProvided.dragHandleProps}
                                className="group/header flex h-full cursor-grab flex-col items-center gap-3 px-2 py-4 active:cursor-grabbing"
                              >
                                <button
                                  onClick={() => toggleCollapse(id)}
                                  className="rounded-md p-1 text-white/30 transition-colors hover:bg-white/6 hover:text-white/60"
                                  title="Expand column"
                                >
                                  <ChevronLeft className="h-3.5 w-3.5 rotate-180" />
                                </button>
                                <div className="flex flex-1 flex-col items-center gap-3">
                                  <span
                                    className="whitespace-nowrap text-xs text-white/50 [writing-mode:vertical-rl] rotate-180"
                                  >
                                    {column.name}
                                  </span>
                                  <p className="flex h-5 w-5 items-center justify-center rounded-full bg-white/8 text-xs text-white/60">
                                    {column.items.length}
                                  </p>
                                </div>
                                {/* Hidden droppable so cards can still be dropped into collapsed columns */}
                                <Droppable droppableId={id} type="CARD">
                                  {(provided) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.droppableProps}
                                      className="h-0 w-0 overflow-hidden"
                                    >
                                      {provided.placeholder}
                                    </div>
                                  )}
                                </Droppable>
                              </div>
                            ) : (
                              /* ---- Expanded view ---- */
                              <>
                                {/* Column header — drag handle */}
                                <div
                                  {...colProvided.dragHandleProps}
                                  className="group/header flex cursor-grab items-center justify-between border-b border-white/6 px-4 py-3 active:cursor-grabbing"
                                >
                                  <div className="flex items-center gap-2">
                                    <GripVertical className="h-3.5 w-3.5 shrink-0 text-white/20 transition-colors group-hover/header:text-white/40" />
                                    <h2 className="text-sm text-white/90">
                                      {column.name}
                                    </h2>
                                    <p className="flex h-5 w-5 items-center justify-center rounded-full bg-white/8 text-xs text-white/60">
                                      {column.items.length}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => toggleCollapse(id)}
                                      className="rounded-md p-1 text-white/20 transition-colors hover:bg-white/6 hover:text-white/50"
                                      title="Collapse column"
                                    >
                                      <ChevronLeft className="h-3.5 w-3.5" />
                                    </button>
                                    {!BASE_COLUMN_IDS.has(id) && (
                                      <div className="relative opacity-0 transition-opacity group-hover/header:opacity-100">
                                        {column.items.length === 0 ? (
                                          <button
                                            onClick={() =>
                                              deleteColumnMutation.mutate(id)
                                            }
                                            disabled={deleteColumnMutation.isPending}
                                            className="rounded-md p-1 text-white/30 transition-colors hover:bg-red-500/10 hover:text-red-400 disabled:opacity-40"
                                            title="Delete column"
                                          >
                                            <Trash2 className="h-3.5 w-3.5" />
                                          </button>
                                        ) : (
                                          <div className="group/tooltip relative">
                                            <button
                                              disabled
                                              className="cursor-not-allowed rounded-md p-1 text-white/15"
                                            >
                                              <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                            <div className="pointer-events-none absolute right-0 top-7 z-10 w-48 rounded-lg border border-white/8 bg-[#1C1C1C] px-2.5 py-1.5 text-[11px] text-white/50 opacity-0 shadow-xl transition-opacity group-hover/tooltip:opacity-100">
                                              Move all reports out of this column
                                              before deleting
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Cards */}
                                <Droppable droppableId={id} type="CARD">
                                  {(provided) => (
                                    <div
                                      {...provided.droppableProps}
                                      ref={provided.innerRef}
                                      className="flex-1 space-y-2 overflow-y-auto p-3"
                                    >
                                      {column.items.map((item, index) => (
                                        <Draggable
                                          draggableId={item.id}
                                          index={index}
                                          key={item.id}
                                        >
                                          {(provided) => (
                                            <div
                                              {...provided.draggableProps}
                                              {...provided.dragHandleProps}
                                              ref={provided.innerRef}
                                              className="group cursor-grab rounded-lg border border-white/8 bg-[#222] p-3.5 shadow-lg transition-all hover:border-white/15 hover:shadow-xl hover:shadow-indigo-500/5"
                                              style={{
                                                ...provided.draggableProps.style,
                                              }}
                                              onClick={() => openModal(item.id)}
                                            >
                                              <div className="mb-2 flex items-start justify-between gap-2">
                                                <div className="flex items-center gap-2">
                                                  <Bug className="h-3.5 w-3.5 shrink-0 text-white/40" />
                                                  <div
                                                    className={`h-1.5 w-1.5 shrink-0 rounded-full ${getPriorityColor(item.priority)}`}
                                                  />
                                                </div>
                                                <div className="flex gap-1">
                                                  <span className="rounded bg-white/6 px-1.5 py-0.5 text-[10px] text-white/50">
                                                    {Capitalize(item.type)}
                                                  </span>
                                                </div>
                                              </div>

                                              <h4 className="mb-1.5 text-sm text-white/90 group-hover:text-white">
                                                {item.title}
                                              </h4>
                                              {item.comment && (
                                                <p className="mb-3 text-xs text-white/40 line-clamp-2">
                                                  {item.comment}
                                                </p>
                                              )}

                                              {item.pagePath && (
                                                <div className="mb-3 flex items-center gap-1.5">
                                                  <FileText className="h-3 w-3 text-white/30" />
                                                  <span className="text-xs text-white/50">
                                                    {item.pagePath === '/'
                                                      ? 'Home Page'
                                                      : Capitalize(
                                                          item.pagePath.replace(
                                                            /\//g,
                                                            '',
                                                          ),
                                                        ) + ' Page'}
                                                  </span>
                                                </div>
                                              )}

                                              <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-1.5 text-xs text-white/40">
                                                  <Clock className="h-3 w-3" />
                                                  <span>
                                                    {formatTimeAgo(item.timestamp)}
                                                  </span>
                                                </div>
                                                <div
                                                  className="flex h-6 w-6 items-center justify-center rounded-full bg-linear-to-br from-violet-500 to-purple-600 text-[10px] ring-2 ring-[#222] transition-transform group-hover:scale-110"
                                                  title={item.userName}
                                                >
                                                  {getInitials(item.userName)}
                                                </div>
                                              </div>
                                            </div>
                                          )}
                                        </Draggable>
                                      ))}
                                      {provided.placeholder}
                                    </div>
                                  )}
                                </Droppable>
                              </>
                            )}
                          </div>
                        );
                      }}
                    </Draggable>
                  );
                })}
                {boardProvided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        {/* Add column */}
        <div className="flex shrink-0 items-start py-6 pr-6">
          {isAddingColumn ? (
            <div className="flex min-w-[280px] flex-col rounded-xl border border-white/10 bg-[#1C1C1C]/60 p-3">
              <input
                ref={newColumnInputRef}
                autoFocus
                value={newColumnName}
                onChange={(e) => setNewColumnName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateColumn();
                  if (e.key === 'Escape') {
                    setIsAddingColumn(false);
                    setNewColumnName('');
                  }
                }}
                placeholder="Column name..."
                className="mb-2.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90 outline-none placeholder:text-white/30 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20"
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCreateColumn}
                  disabled={
                    !newColumnName.trim() || createColumnMutation.isPending
                  }
                  className="flex items-center gap-1.5 rounded-lg bg-indigo-500/20 px-3 py-1.5 text-xs text-indigo-300 transition-colors hover:bg-indigo-500/30 disabled:opacity-40"
                >
                  <Check className="h-3 w-3" />
                  {createColumnMutation.isPending ? 'Adding...' : 'Add column'}
                </button>
                <button
                  onClick={() => {
                    setIsAddingColumn(false);
                    setNewColumnName('');
                  }}
                  className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs text-white/40 transition-colors hover:bg-white/5 hover:text-white/60"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsAddingColumn(true)}
              className="flex min-w-[52px] flex-col items-center justify-center gap-1.5 self-start rounded-xl border border-dashed border-white/8 bg-transparent px-4 py-3 text-white/30 transition-all hover:border-white/15 hover:bg-white/[0.03] hover:text-white/50"
            >
              <Plus className="h-4 w-4" />
              <span className="text-xs">Add</span>
            </button>
          )}
        </div>

        {selectedId && (
          <ReportModal
            id={selectedId}
            onClose={closeModal}
            onDeleteSuccess={handleReportDeleted}
            onMoveSuccess={(updatedId: string, newStatus: ColumnId) => {
              mutation.mutate({ reportId: updatedId, newStatus });
              setSelectedId(null);
            }}
          />
        )}
      </div>
    </>
  );
}
