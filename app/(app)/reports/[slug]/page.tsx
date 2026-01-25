'use client';

import { useEffect, useMemo, useState } from 'react';
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
import { Bug, Clock, FileText } from 'lucide-react';
import { fetchUsersForSite } from '@/lib/fetchUsers';

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

  const queryClient = useQueryClient();

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
        `${process.env.BACKEND_URL}/api/site/${slug}?teamId=${user?.teamId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const reports: Report[] = await res.json();

      const commentsMap: Record<string, Comment[]> = {};
      await Promise.all(
        reports.map(async (report) => {
          const res = await fetch(
            `${process.env.BACKEND_URL}/api/reports/${report.id}/comments`,
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

  // -------------------------
  // Mutation for drag/drop status updates
  // -------------------------
  const mutation = useMutation({
    mutationFn: ({
      reportId,
      newStatus,
    }: {
      reportId: string;
      newStatus: ColumnId;
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

    return {
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
  }, [filteredReports, sortOrder]);

  // -------------------- Drag & Drop --------------------
  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (
      !destination ||
      (source.droppableId === destination.droppableId &&
        source.index === destination.index)
    )
      return;

    const newStatus = destination.droppableId as ColumnId;
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
      <FilterBar
        filters={filters}
        setFilters={setFilters}
        onClearFilters={() =>
          setFilters({ status: [], priority: [], assignee: [], pages: [] })
        }
        users={users}
        pages={uniquePages}
      />
      <div className="flex h-[calc(100vh-7.5rem)] gap-4 overflow-x-auto px-6 py-6">
        <DragDropContext onDragEnd={onDragEnd}>
          {Object.entries(columns).map(([id, column]) => (
            <Droppable droppableId={id} key={id}>
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="flex min-w-[320px] flex-col rounded-xl border transition-colors border-white/6 bg-[#1C1C1C]/40"
                >
                  <div className="flex items-center justify-between border-b border-white/6 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm text-white/90">{column.name}</h2>
                      <p className="flex h-5 w-5 items-center justify-center rounded-full bg-white/8 text-xs text-white/60">
                        {column.items.length}
                      </p>
                    </div>
                  </div>
                  <div className="flex-1 space-y-2 overflow-y-auto p-3">
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
                            style={{ ...provided.draggableProps.style }}
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
                                        item.pagePath.replace(/\//g, ''),
                                      ) + ' Page'}
                                </span>
                              </div>
                            )}

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5 text-xs text-white/40">
                                <Clock className="h-3 w-3" />
                                <span>{formatTimeAgo(item.timestamp)}</span>
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
                  </div>
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </DragDropContext>

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
