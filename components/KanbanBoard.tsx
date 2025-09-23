'use client';

import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { QAReport, ColumnId, KanbanProps } from '../types/types';
import Image from 'next/image';
import ReportModal from '@/components/ReportModal';
import { updateStatus } from '@/utils/updateStatus';

const KanbanBoard: React.FC<KanbanProps> = ({ reports }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const initialColumns: Record<ColumnId, { name: string; items: QAReport[] }> = {
    new: {
      name: '🆕 New',
      items: reports.filter((report) => report.status === 'new'),
    },
    inProgress: {
      name: '🔧 In Progress',
      items: reports.filter((report) => report.status === 'inProgress'),
    },
    done: {
      name: '✅ Done',
      items: reports.filter((report) => report.status === 'done'),
    }, 
  };

  const [columns, setColumns] = useState(initialColumns);

  console.log(initialColumns);

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;

    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const newStatus = destination.droppableId; // 'new' | 'in progress' | 'done'
    updateStatus(draggableId, newStatus);

    const sourceCol = columns[source.droppableId as ColumnId];
    const destCol = columns[destination.droppableId as ColumnId];
    const movedItem = sourceCol.items[source.index];

    // Remove from source
    const newSourceItems = Array.from(sourceCol.items);
    newSourceItems.splice(source.index, 1);

    // Add to destination
    const newDestItems = Array.from(destCol.items);
    newDestItems.splice(destination.index, 0, movedItem);

    setColumns({
      ...columns,
      [source.droppableId]: { ...sourceCol, items: newSourceItems },
      [destination.droppableId]: { ...destCol, items: newDestItems },
    });
  };

  return (
    <div className='bg-[#040407] px-10 py-7 flex gap-5 h-full'>
      <DragDropContext onDragEnd={onDragEnd}>
        {Object.entries(columns).map(([id, column]) => (
          <Droppable droppableId={id} key={id}>
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                style={{
                  background: '#f9f9f9',
                  padding: 10,
                  borderRadius: 8,
                  width: 300,
                  minHeight: 500,
                  maxHeight: '80vh',
                  overflowY: 'auto',
                }}
              >
                <h2 style={{color: 'black'}}>{column.name}</h2>
                {column.items.map((item, index) => (
                  <Draggable draggableId={item.id} index={index} key={item.id}>
                    {(provided) => (
                      <div
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        ref={provided.innerRef}
                        style={{
                          background: '#fff',
                          padding: 10,
                          marginBottom: 10,
                          borderRadius: 6,
                          boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                          ...provided.draggableProps.style,
                        }}
                        onClick={() => setSelectedId(item.id)}
                      >
                        <div style={{ position: 'relative', width: '100%', height: 200, marginBottom: 8 }}>
                            <Image
                                src={`http://localhost:4000${item.imagePath}`}
                                alt="Screenshot"
                                fill
                                style={{ objectFit: 'cover', borderRadius: 4 }}
                            />
                        </div>
                        <p style={{color: 'black'}}><strong>URL:</strong> {item.url}</p>
                        <p style={{color: 'black'}}>{item.comment}</p>
                        <small style={{color: 'black'}}>{item.formattedDate}</small>
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

      {selectedId && <ReportModal id={selectedId} onClose={() => setSelectedId(null)} />}
    </div>
  );
};

export default KanbanBoard;
