'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Report, ColumnId } from '@/types/types';
// import Image from 'next/image';
import ReportModal from '@/components/ReportModal';
import { updateStatus } from '@/utils/updateStatus';
import { Capitalize, getInitials, getPriorityColor } from '@/utils/helpers';
import Dropdown from '@/components/buttons/Dropdown';
import Avatar from '@/components/cards/Avatar';
import { Comment } from '@/types/types';

// Icons
import { FaEye } from "react-icons/fa";
import { IoCode } from "react-icons/io5";
import { GoCommentDiscussion } from "react-icons/go";
import { RiAttachment2 } from "react-icons/ri";
import { RxDividerVertical } from "react-icons/rx";
import { getToken } from '@/lib/auth';
import { Bug, Clock } from 'lucide-react';
import { formatTimeAgo } from '@/utils/formatTimeAgo';

export default function SiteReportsPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const token = getToken();
  const slug = params?.slug as string;
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [commentsByReportId, setCommentsByReportId] = useState<Record<string, Comment[]>>({});
  const reportIdParams = new URLSearchParams(searchParams.toString());

  useEffect(() => {
    const reportIdFromUrl = searchParams.get('report');
    if (reportIdFromUrl) {
      setSelectedId(reportIdFromUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    if (slug) {
      fetch(`http://127.0.0.1:4000/api/site/${slug}`, {
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
              const res = await fetch(`http://127.0.0.1:4000/api/reports/${report.id}/comments`);
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

  const initialColumns: Record<ColumnId, { name: string; items: Report[]; columnColour: [{ bgColour: string, accentColour: string }]; }> = {
    new: {
      name: 'New',
      items: reports.filter((report) => report.status === 'new'),
      columnColour: [
        {
          bgColour: 'bg-sky-100', 
          accentColour: 'border-l-sky-500'
        }
      ]
    },
    inProgress: {
      name: 'In Progress',
      items: reports.filter((report) => report.status === 'inProgress'),
      columnColour: [
        {
          bgColour: 'bg-orange-100', 
          accentColour: 'border-l-orange-500'
        }
      ]
    },
    done: {
      name: 'Done',
      items: reports.filter((report) => report.status === 'done'),
      columnColour: [
        {
          bgColour: 'bg-indigo-100', 
          accentColour: 'border-l-indigo-500'
        }
      ]
    },
  };

  const [columns, setColumns] = useState(initialColumns);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  useEffect(() => {

  // Sort reports by createdAt (or updatedAt depending on your schema)
    const sortedReports = [...reports].sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime();
      const dateB = new Date(b.timestamp).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    setColumns({
      new: {
        name: 'New',
        items: sortedReports.filter((r) => r.status === 'new'),
        columnColour: [
          {
            bgColour: 'bg-sky-100', 
            accentColour: 'border-l-sky-500'
          }
        ]
      },
      inProgress: {
        name: 'In Progress',
        items: sortedReports.filter((r) => r.status === 'inProgress'),
        columnColour: [
          {
            bgColour: 'bg-orange-100', 
            accentColour: 'border-l-orange-500'
          }
        ]
      },
      done: {
        name: 'Done',
        items: sortedReports.filter((r) => r.status === 'done'),
        columnColour: [
          {
            bgColour: 'bg-indigo-100', 
            accentColour: 'border-l-indigo-500'
          }
        ]
      },
    });
  }, [reports, sortOrder]);

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;

    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const newStatus = destination.droppableId as ColumnId;
    updateStatus(token, draggableId, newStatus);

    const sourceCol = columns[source.droppableId as ColumnId];
    const destCol = columns[destination.droppableId as ColumnId];
    const movedItem = sourceCol.items[source.index];

    const newSourceItems = [...sourceCol.items];
    newSourceItems.splice(source.index, 1);

    const newDestItems = [...destCol.items];
    newDestItems.splice(destination.index, 0, { ...movedItem, status: newStatus });

    setColumns({
      ...columns,
      [source.droppableId]: { ...sourceCol, items: newSourceItems },
      [destination.droppableId]: { ...destCol, items: newDestItems },
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

  console.log(columns);

  return (
    <>
      {/* <div className='px-5 py-3 border-1 border-gray-200 flex items-center justify-between'>
        <h2 className='text-lg font-semibold'>{Capitalize(slug)}</h2>
        <div className="flex">
          <Dropdown 
            text="Board" 
          />
          <Dropdown 
            text={sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}
            options={[
              { label: 'Newest First', onClick: () => setSortOrder('newest') },
              { label: 'Oldest First', onClick: () => setSortOrder('oldest') },
            ]}
          />
        </div>
      </div> */}
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
                  {column.items.map((item, index) => (
                    <Draggable draggableId={item.id} index={index} key={item.id}>
                      {(provided) => (
                        <div
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          ref={provided.innerRef}
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

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-xs text-white/40">
                            <Clock className="h-3 w-3" />
                            <span>{formatTimeAgo(item.timestamp)}</span>
                          </div>
                          
                          {/* Assignee avatar */}
                          <div
                            className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-[10px] ring-2 ring-[#222] transition-transform group-hover:scale-110"
                            title={item.userName}
                          >
                            {getInitials(item.userName)}
                          </div>
                        </div>

                          {/* Authors */}
                          {/* <div className='flex flex-wrap gap-2'>
                            <Avatar 
                              initial={item.userName.charAt(0)}
                              name={item.userName}
                            />
                          </div> */}

                          {/* Priority */}
                          {/* <div className='flex items-center gap-2 bg-gray-100 w-fit px-2 py-1 rounded-2xl'>
                            <span className="block w-3.5 h-3.5 bg-gray-200 rounded-full"></span>
                            <span className='text-xs'>Low</span>
                          </div> */}

                          {/* Issue Type */}
                          {/* <div className='flex items-center flex-wrap gap-2'>
                            <div className='flex items-center gap-2 w-fit px-2 py-1 rounded-2xl border-1 border-gray-200'>             
                              <FaEye />
                              <span className='text-xs'>Visual</span>
                            </div>
                            <div className='flex items-center gap-2 w-fit px-2 py-1 rounded-2xl border-1 border-gray-200'>
                              <IoCode />
                              <span className='text-xs'>Functionality</span>
                            </div>
                          </div> */}

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
