'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Report, ColumnId } from '@/types/types';
// import Image from 'next/image';
import ReportModal from '@/components/ReportModal';
import { updateStatus } from '@/utils/updateStatus';
import { Capitalize } from '@/utils/helpers';
import Dropdown from '@/components/buttons/Dropdown';
import Avatar from '@/components/cards/Avatar';
import { Comment } from '@/types/types';

// Icons
import { FaEye } from "react-icons/fa";
import { IoCode } from "react-icons/io5";
import { GoCommentDiscussion } from "react-icons/go";
import { RiAttachment2 } from "react-icons/ri";
import { RxDividerVertical } from "react-icons/rx";

export default function SiteReportsPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [commentsByReportId, setCommentsByReportId] = useState<Record<string, Comment[]>>({});

  useEffect(() => {
    if (slug) {
      fetch(`http://localhost:4000/api/site/${slug}`)
        .then(res => res.json())
        .then(async (data: Report[]) => {
          setReports(data);
  
          const commentsMap: Record<string, Comment[]> = {};
  
          // Fetch comments for each report
          await Promise.all(
            data.map(async (report) => {
              const res = await fetch(`http://localhost:4000/api/reports/${report.id}/comments`);
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

  const [columns, setColumns] = useState(initialColumns);;

  useEffect(() => {
    setColumns({
      new: {
        name: 'New',
        items: reports.filter((r) => r.status === 'new'),
        columnColour: [
          {
            bgColour: 'bg-sky-100', 
            accentColour: 'border-l-sky-500'
          }
        ]
      },
      inProgress: {
        name: 'In Progress',
        items: reports.filter((r) => r.status === 'inProgress'),
        columnColour: [
          {
            bgColour: 'bg-orange-100', 
            accentColour: 'border-l-orange-500'
          }
        ]
      },
      done: {
        name: 'Done',
        items: reports.filter((r) => r.status === 'done'),
        columnColour: [
          {
            bgColour: 'bg-indigo-100', 
            accentColour: 'border-l-indigo-500'
          }
        ]
      },
    });
  }, [reports]);

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;

    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const newStatus = destination.droppableId as ColumnId;
    updateStatus(draggableId, newStatus);

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

  return (
    <>
      <div className='px-5 py-3 border-1 border-gray-200 flex items-center justify-between'>
        <h2 className='text-lg font-semibold'>{Capitalize(slug)}</h2>
        <div className="flex">
          <Dropdown 
            text="Board" 
          />
          <Dropdown 
            text="Newest First" 
          />
        </div>
      </div>
      <div className='px-[10px] py-4 flex gap-5 h-full'>
        <DragDropContext onDragEnd={onDragEnd}>
          {Object.entries(columns).map(([id, column]) => (
            <Droppable droppableId={id} key={id}>
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  style={{
                    padding: 10,
                    borderRadius: 8,
                    width: 300,
                    minHeight: 500,
                    maxHeight: '80vh',
                    overflowY: 'auto',
                  }}
                >
                  <div className='flex justify-between items-center'>
                    <h2 className={`text-black p-1 px-3 w-fit rounded-lg text-sm font-semibold ${column.columnColour[0].bgColour} border-l-5 ${column.columnColour[0].accentColour}`}>{column.name}</h2>
                    <p className='text-gray-300'>{column.items.length}</p>
                  </div>
                  {column.items.map((item, index) => (
                    <Draggable draggableId={item.id} index={index} key={item.id}>
                      {(provided) => (
                        <div
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          ref={provided.innerRef}
                          className='mt-5 shadow-sm hover:shadow-lg transition rounded-lg mb-2.5 p-2.5 bg-white flex flex-col gap-2.5 cursor-pointer'
                          style={{
                            ...provided.draggableProps.style,
                          }}
                          onClick={() => setSelectedId(item.id)}
                        >
                          <p className='text-black text-sm font-bold'>{item.comment}</p>
                          {/* Authors */}
                          <div className='flex flex-wrap gap-2'>
                            <Avatar 
                              initial='R'
                              name="Rikhil Makwana"
                            />
                            <Avatar 
                              initial='A'
                              name="Ankita Patel"
                            />
                            <Avatar 
                              initial='R'
                              name="Rikhil Makwana"
                            />
                          </div>

                          {/* Priority */}
                          <div className='flex items-center gap-2 bg-gray-100 w-fit px-2 py-1 rounded-2xl'>
                            <span className="block w-3.5 h-3.5 bg-gray-200 rounded-full"></span>
                            <span className='text-xs'>Low</span>
                          </div>

                          {/* Issue Type */}
                          <div className='flex items-center flex-wrap gap-2'>
                            <div className='flex items-center gap-2 w-fit px-2 py-1 rounded-2xl border-1 border-gray-200'>             
                              <FaEye />
                              <span className='text-xs'>Visual</span>
                            </div>
                            <div className='flex items-center gap-2 w-fit px-2 py-1 rounded-2xl border-1 border-gray-200'>
                              <IoCode />
                              <span className='text-xs'>Functionality</span>
                            </div>
                          </div>

                          {/* Comments, Attachments & Progress */}
                          <div className='flex items-center justify-between'>
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
                          </div>

                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </DragDropContext>

        {selectedId && <ReportModal id={selectedId} onClose={() => setSelectedId(null)} onDeleteSuccess={handleReportDeleted} />}
      </div>
    </>
  );
}
