'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Report, ColumnId, Filters, User } from '@/types/types';
// import Image from 'next/image';
import ReportModal from '@/components/ReportModal';
import { updateStatus } from '@/utils/updateStatus';
import { Capitalize, getInitials, getPriorityColor } from '@/utils/helpers';
import { Comment } from '@/types/types';

// Icons
import { getToken } from '@/lib/auth';
import { Bug, Clock, FileText } from 'lucide-react';
import { formatTimeAgo } from '@/utils/formatTimeAgo';
import { useUser } from '@/context/UserContext';
import { FilterBar } from '@/components/filter/ReportsFilter';
import { fetchUsersForSite } from '@/lib/fetchUsers';
import { AnimatePresence, motion } from 'motion/react';

export default function SiteReportsPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const token = getToken();
  const slug = params?.slug as string;
  const [reports, setReports] = useState<Report[]>([]);
  const [ users, setUsers ] = useState<User[]>([]);
  const [filters, setFilters] = useState<Filters>({
    status: [],
    priority: [],
    assignee: [],
    pages: [],
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [commentsByReportId, setCommentsByReportId] = useState<Record<string, Comment[]>>({});
  const reportIdParams = new URLSearchParams(searchParams.toString());
  const { user } = useUser();
  const pages = reports.map(report => report.pagePath);
  const uniquePages: string[] = [...new Set(pages)];

  useEffect(() => {
    const reportIdFromUrl = searchParams.get('report');
    if (reportIdFromUrl) {
      setSelectedId(reportIdFromUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!slug) return;
    const fetchUsers = async () => {
        try {
            const data = await fetchUsersForSite(slug);
            setUsers(data);
        } catch (err) {
            console.error(err);
        }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    if (slug) {
      fetch(`https://qa-backend-105l.onrender.com /api/site/${slug}?teamId=${user?.teamId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then(res => res.json())
        .then(async (data: Report[]) => {
          setReports(data);
  
          const commentsMap: Record<string, Comment[]> = {};
  
          // Fetch comments for each report
          await Promise.all(
            data.map(async (report) => {
              const res = await fetch(`https://qa-backend-105l.onrender.com /api/reports/${report.id}/comments`);
              const comments = await res.json();
              commentsMap[report.id] = comments;
            })
          );
  
          setCommentsByReportId(commentsMap);
        });
    }
  }, [slug]);


  const handleReportDeleted = (deletedId: string) => {
    setReports(prev => prev.filter(report => report.id !== deletedId));
    setSelectedId(null); // optional, if you're using modal toggle based on this
  };


  const filteredReports = reports.filter((report) => {
    // Search filter
    if (searchQuery && !report.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Status filter
    if (filters.status.length > 0 && !filters.status.includes(report.status)) {
      return false;
    }

    // Priority filter
    if (filters.priority.length > 0 && !filters.priority.includes(report.priority)) {
      return false;
    }

    // Assignee filter
    if (filters.assignee.length > 0 && !filters.assignee.includes(report.userName)) {
      return false;
    }

      if (filters.pages.length > 0 && !filters.pages.includes(report.pagePath === '/' ? 'home' : report.pagePath.replace(/^\/|\/$/g, ""))) {
      return false;
    }

    return true;
  });

  const handleClearFilters = () => {
    setFilters({
      status: [],
      priority: [],
      assignee: [],
      pages: [],
    });
  };

  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');


  const columns = useMemo(() => {
    const sorted = [...filteredReports].sort((a, b) => {
      const da = new Date(a.timestamp).getTime();
      const db = new Date(b.timestamp).getTime();
      return sortOrder === 'newest' ? db - da : da - db;
    });

    return {
      new: {
        name: 'New',
        items: sorted.filter(r => r.status === 'new'),
        columnColour: [{ bgColour: 'bg-sky-100', accentColour: 'border-l-sky-500' }],
      },
      inProgress: {
        name: 'In Progress',
        items: sorted.filter(r => r.status === 'inProgress'),
        columnColour: [{ bgColour: 'bg-orange-100', accentColour: 'border-l-orange-500' }],
      },
      done: {
        name: 'Done',
        items: sorted.filter(r => r.status === 'done'),
        columnColour: [{ bgColour: 'bg-indigo-100', accentColour: 'border-l-indigo-500' }],
      },
    };
  }, [filteredReports, sortOrder]);

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const newStatus = destination.droppableId as ColumnId;
    updateStatus(token, draggableId, newStatus);

    // Update reports → columns will re-derive automatically
    setReports(prev => {
      const next = [...prev];
      const index = next.findIndex(r => r.id === draggableId);
      if (index === -1) return prev;

      next[index] = { ...next[index], status: newStatus };
      return next;
    });
  };

  const openModal = (id: string) => {
    setSelectedId(id);
    reportIdParams.set('report', id);
    router.push(`?${reportIdParams.toString()}`);
  }

  const closeModal = () => {
    setSelectedId(null);
    reportIdParams.delete('report');
    router.push(`?${reportIdParams.toString()}`);
  }

  return (
    <>
      <FilterBar filters={filters} setFilters={setFilters} onClearFilters={handleClearFilters} users={users} pages={uniquePages} />
      <div className='flex h-[calc(100vh-7.5rem)] gap-4 overflow-x-auto px-6 py-6'>
        <DragDropContext onDragEnd={onDragEnd}>
          {Object.entries(columns).map(([id, column]) => (
            <Droppable droppableId={id} key={id}>
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className='flex min-w-[320px] flex-col rounded-xl border transition-colors border-white/6 bg-[#1C1C1C]/40'
                >
                  <div className='flex items-center justify-between border-b border-white/6 px-4 py-3'>
                    <div className='flex items-center gap-2'>
                      <h2 className='text-sm text-white/90'>{column.name}</h2>
                      <p className='flex h-5 w-5 items-center justify-center rounded-full bg-white/8 text-xs text-white/60'>{column.items.length}</p>
                    </div>
                  </div>
                  <div className='flex-1 space-y-2 overflow-y-auto p-3'>
                  <AnimatePresence>
                    {column.items.map((item, index) => (
                      <Draggable draggableId={item.id} index={index} key={item.id}>
                        {(provided) => (
                          <motion.div
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            ref={provided.innerRef}
                            layout
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            transition={{ duration: 0.2 }}
                            className='group cursor-grab rounded-lg border border-white/8 bg-[#222] p-3.5 shadow-lg transition-all hover:border-white/15 hover:shadow-xl hover:shadow-indigo-500/5'
                            style={{
                              ...provided.draggableProps.style,
                            }}
                            onClick={() => openModal(item.id)}
                          >

                          <div className="mb-2 flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <Bug className="h-3.5 w-3.5 shrink-0 text-white/40" />
                              <div className={`h-1.5 w-1.5 shrink-0 rounded-full ${getPriorityColor(item.priority)}`} />
                            </div>
                              <div className="flex gap-1">
                                  <span
                                    className="rounded bg-white/6 px-1.5 py-0.5 text-[10px] text-white/50"
                                  >
                                    {Capitalize(item.type)}
                                  </span>
                              </div>
                          </div>


                          {/* Card title */}
                          <h4 className="mb-1.5 text-sm text-white/90 group-hover:text-white">
                            {item.title}
                          </h4>

                          {/* Card description */}
                          {item.comment && (
                            <p className="mb-3 text-xs text-white/40 line-clamp-2">
                              {item.comment}
                            </p>
                          )}

                          {/* Page indicator */}
                          {item.pagePath && (
                            <div className="mb-3 flex items-center gap-1.5">
                              <FileText className="h-3 w-3 text-white/30" />
                              <span className="text-xs text-white/50">{item.pagePath === '/' ? 'Home Page' : Capitalize(item.pagePath.replace(/\//g, '')) + ' Page'}</span>
                            </div>
                          )}

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-xs text-white/40">
                              <Clock className="h-3 w-3" />
                              <span>{formatTimeAgo(item.timestamp)}</span>
                            </div>
                            
                            {/* Assignee avatar */}
                            <div
                              className="flex h-6 w-6 items-center justify-center rounded-full bg-linear-to-br from-violet-500 to-purple-600 text-[10px] ring-2 ring-[#222] transition-transform group-hover:scale-110"
                              title={item.userName}
                            >
                              {getInitials(item.userName)}
                            </div>
                          </div>

                            {/* Comments, Attachments & Progress */}
                            {/* <div className='flex items-center justify-between'>
                              <div className='flex items-center'>
                                {commentsByReportId[item.id]?.length > 0 && (
                                  <>
                                    <div className='flex items-center gap-1.5'>
                                      <GoCommentDiscussion />
                                      <span className='text-xs'>{commentsByReportId[item.id].length}</span>
                                    </div>
                                    <RxDividerVertical className='text-gray-300' />
                                  </>
                                )}
                                <div className='flex items-center gap-1.5'>
                                  <RiAttachment2 />
                                  <span className='text-xs'>1</span>
                                </div>
                              </div>
                              <div className='flex whitespace-nowrap items-center w-2/4 ms-auto gap-2'>
                                <div className='flex bg-gray-200 rounded-2xl overflow-hidden w-full h-1' role='progressbar' aria-valuenow={25} aria-valuemin={0} aria-valuemax={100}>
                                  <div className='flex flex-col justify-center bg-green-500 text-center rounded-2xl overflow-hidden' style={{ width: '25%' }}></div>
                                </div>
                                <div className='text-end w-7 -mt-0.5'>
                                  <span className='text-xs text-gray-500'>25%</span>
                                </div>
                              </div>
                            </div> */}

                          </motion.div>
                        )}
                      </Draggable>
                    ))}
                  </AnimatePresence>
                  </div>
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </DragDropContext>

        {selectedId && 
          <ReportModal
            id={selectedId} 
            onClose={() => closeModal()} 
            onDeleteSuccess={handleReportDeleted}
            onMoveSuccess={(updatedId: string, newStatus: ColumnId) => {
              setReports((prev) => 
                prev.map((r) => r.id === updatedId ? { ...r, status: newStatus } : r)
              );
              setSelectedId(null);
            }}
          />
        }
      </div>
    </>
  );
}
