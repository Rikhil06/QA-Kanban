'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Report, ReportModalProps } from '@/types/types';
import { Comment } from '@/types/types';
import { ToastContainer, toast } from 'react-toastify';
import Avatar from './cards/Avatar';
import Zoom from 'react-medium-image-zoom'
import 'react-medium-image-zoom/dist/styles.css';
import { Capitalize } from '@/utils/helpers';
import { deleteReport } from '@/utils/deleteReport';
import YesNoAlert from './Alert';

// Icons
import { GoLink } from "react-icons/go";
import { FiCopy } from "react-icons/fi";
import { PiArrowBendUpRight } from "react-icons/pi";
import { RiAttachment2, RiDeleteBin5Line } from "react-icons/ri";
import { FiUsers } from "react-icons/fi";
import { FaRegImages, FaSignal } from "react-icons/fa6";
import { GrStatusPlaceholder } from "react-icons/gr";
import { GoIssueTrackedBy } from "react-icons/go";
import { IoDocumentAttachOutline } from "react-icons/io5";
import { MdOutlineDescription, MdOutlineEmojiEmotions, MdOutlineKeyboardVoice, MdSend } from 'react-icons/md';


export default function ReportModal({ id, onClose, onDeleteSuccess }: ReportModalProps) {
    const [report, setReport] = useState<Report | null>(null);
    const [openMore, setOpenMore] = useState<boolean>(false);
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [replyToId, setReplyToId] = useState<string | null>(null);
    const [fileNames, setFileNames] = useState<string[]>([]);
    const [status, setStatus] = useState<string>('');
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [reportIdToDelete, setReportIdToDelete] = useState<string | null>(null);

    const wrapperRef = useRef<HTMLDivElement | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
  
    useEffect(() => {
      const fetchReport = async () => {
        const res = await fetch(`http://localhost:4000/uploads/${id}.json`);
        if (!res.ok) return;
        const data = await res.json();
        setReport(data);
      };
  
      fetchReport();

      const fetchComments = async () => {
        const res = await fetch(`http://localhost:4000/api/reports/${id}/comments`);
        if (!res.ok) return;
        const data = await res.json();
        setComments(data);
      };
      fetchComments();

      const fetchStatus= async () => {
        const res = await fetch(`http://localhost:4000/api/report/${id}/status`);
        if (!res.ok) return;
        const data = await res.json();
        setStatus(data.status);
      };
      fetchStatus();
    }, [id]);

    // Close when clicking outside
    useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
        if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
          setOpenMore(false);
        }
      }

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);

    const handleAddComment = async () => {
      if (newComment.trim().length === 0) return;
    
      try {
        const payload = {
          reportId: id, // from props or state - the current report id
          content: newComment.trim(),
          userId: replyToId,
          attachments: [...fileNames],
        };

        const res = await fetch(`http://localhost:4000/api/reports/${id}/comments`, {
          
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          throw new Error('Failed to save comment');
        }
        const savedComment = await res.json();
        
        setComments((prev) => [...prev, savedComment]);
        setNewComment('');
        setReplyToId(null);
        setFileNames([]);
      } catch (error) {
        console.error(error);
        toast.error("Error saving comment");
      }
    };
    
    const handleReply = (id: string) => {
      setReplyToId(id);
    };
    
    const handleCancelReply = () => {
      setReplyToId(null);
    };

    const handleDeleteClick = (reportId: string) => {
      setReportIdToDelete(reportId);
      setIsAlertOpen(true);
    };    

    const handleYes = async () => {
      if (!reportIdToDelete) return;
    
      try {
        await deleteReport(reportIdToDelete);
        console.log(`Report ${reportIdToDelete} deleted.`);
    
        // ✅ Optimistically update UI by calling parent callback
        if (onDeleteSuccess) {
          onDeleteSuccess(reportIdToDelete);
        }
    
        // ✅ Auto-close modal
        onClose();
    
        setIsAlertOpen(false);
        setReportIdToDelete(null);
      } catch (error) {
        console.error('Failed to delete report:', error);
        alert('Something went wrong while deleting the report.');
      }
    };    
    
    const handleNo = () => {
      setIsAlertOpen(false);
      setReportIdToDelete(null);
    };    

    function renderComments(commentsList: Comment[], parentId: string | null = null) {
      return commentsList
        .filter((item) => item.reportId === parentId)
        .map((item) => (
          <li key={item.id} className='bg-gray-100 p-2 rounded-md ml-0 mb-2'>
            <p>{item.content}</p>

            {/* Attachments */}
            {item.attachments.map((file: any, idx) => {
              return (
                <a 
                  key={idx} 
                  className='flex items-center gap-2 p-1 rounded-md border border-gray-300'
                >
                  <IoDocumentAttachOutline />
                  <span className='text-gray-500'>{file.url}</span>
                </a>
              );
            })}


            <button 
              aria-label='Reply'
              onClick={() => handleReply(item.id)}
              className='text-blue-500 text-sm mt-2'
            >
              Reply
            </button>
    
            {/* Display children with indentation */}
            <ul className=' ml-6 mt-2 space-y-2'>{renderComments(commentsList, item.id)}</ul>
          </li>
        ));
    }
    
    function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
      const files = e.target.files;
      if (!files) return;
  
      const names = Array.from(files).map((file) => file.name);
      const notify = () => toast.success("File Uploaded Successfully!");
      notify();
      setFileNames((prevFileNames) => [...prevFileNames, ...names]);
    }

    function handleButtonClick(e: React.MouseEvent<HTMLButtonElement>) {
      e.preventDefault();
      if (!inputRef || !inputRef.current) return;
  
      inputRef.current.click();
    }
  
    if (!report) return null;
  
    return (
      <div ref={wrapperRef} className="fixed inset-0 bg-gray-900/50 bg-opacity-70 z-50 flex items-center justify-center">
        <div className="flex flex-col pointer-events-auto bg-white rounded-xl w-full max-w-4xl h-[calc(100%-56px)] min-h-[calc(100%-56px)] max-h-full relative shadow-xl">
          {/* Header */}
          <div className='flex items-center justify-between p-4 border-b-1 border-gray-200'>
            <h2 className='font-semibold text-[16px]'>Task details</h2>
            <div className="flex items-center gap-2">
            <div className='relative'>
              <button 
                id="dropdownMenuIconButton" 
                className="inline-flex items-center p-2 text-sm font-medium text-center text-gray-900 bg-white rounded-lg hover:bg-gray-100 focus:ring-4 focus:outline-none dark:text-white focus:ring-gray-50 cursor-pointer" 
                type="button" 
                onClick={() => setOpenMore((prev) => !prev)}
              >
                <svg className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 15">
                  <path d="M3.5 1.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 6.041a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm0 5.959a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z"/>
                </svg>
              </button>

              {/* Dropdown menu */}
              {openMore &&
                <div id="dropdownDots" className="z-10 bg-white divide-y divide-gray-100 rounded-lg shadow-sm w-44 absolute right-0">
                    <ul className="p-1 text-sm" aria-labelledby="dropdownMenuIconButton">
                      <button className='flex items-center gap-2 px-4 py-2 w-full rounded-lg transition-all cursor-pointer hover:bg-gray-200'>
                        <GoLink />
                        Copy link
                      </button>
                      <button className='flex items-center gap-2 px-4 py-2 w-full rounded-lg transition-all cursor-pointer hover:bg-gray-200'>
                        <FiCopy />
                        Duplicate
                      </button>
                      <button className='flex items-center gap-2 px-4 py-2 w-full rounded-lg transition-all cursor-pointer hover:bg-gray-200'>
                        <PiArrowBendUpRight />
                        Move to
                      </button>
                      <button className='flex items-center gap-2 px-4 py-2 w-full rounded-lg transition-all cursor-pointer hover:bg-gray-200' onClick={() => handleDeleteClick(report.id)}>
                        <RiDeleteBin5Line />
                        Delete
                      </button>
                    </ul>
                </div>
              }

            </div>

            <button type="button" className="inline-flex items-center justify-center focus:outline-hidden disabled:opacity-50 disabled:pointer-events-none bg-gray-100 hover:bg-gray-200 rounded-full w-8 h-8 cursor-pointer" aria-label="Close" aria-expanded="true" onClick={onClose}>
              <span className="sr-only">Close</span>
              <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18"></path>
                <path d="m6 6 12 12"></path>
              </svg>
            </button>

            </div>
          </div>

          <YesNoAlert
            message="Are you sure you want to delete this report?"
            onYes={handleYes}
            onNo={handleNo}
            isOpen={isAlertOpen}
          />
          
          {/* Body */}
          <div className='overflow-y-auto dark:[&::-webkit-scrollbar-track]:bg-neutral-700 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500'>
              <div className="p-8">
                {/* Title */}
                <div className='w-full'>
                  <textarea 
                  name="title" 
                  id="title"
                  rows={1}
                  placeholder="Untitled"
                  autoFocus
                  className='h-[38px] font-semibold rounded-md resize-none w-full block text-[16px] px-1.5 py-2 bg-gray-100 hover:border-1 hover:border-gray-200 focus:bg-gray-200 focus:ring-0 focus:border-0 focus:border-transparent focus-visible:outline-0'
                  defaultValue={report.comment}
                  disabled
                  >
                  </textarea>
                </div>

                {/* Image */}
                <div className="flex gap-2 w-full">
                  <div className='min-w-32 mt-6'>
                    <label htmlFor="assignee" className="flex items-center text-gray-500 text-sm gap-3">
                      <FaRegImages />
                      Image
                    </label>
                  </div>
                  <div className='pt-2 mt-2 grow-1'>
                    <div className='relative w-48 h-32'>
                    <Zoom zoomMargin={45}>
                      <Image
                          src={`http://localhost:4000${report.image}`}
                          alt="Screenshot"
                          fill
                          className="object-cover rounded-2xl"
                        />
                    </Zoom>
                    </div>
                  </div>
                </div>

                {/* Asignee */}
                <div className="flex gap-2 w-full">
                  <div className='min-w-32 mt-6'>
                    <label htmlFor="assignee" className="flex items-center text-gray-500 text-sm gap-3">
                      <FiUsers />
                      Assignee
                    </label>
                  </div>
                  <div className='pt-2 mt-2 grow-1'>
                    <p className='w-full border-t-1 border-gray-200 pt-2 text-sm'>Rikhil Makwana</p>
                  </div>
                </div>

                {/* Priority */}
                <div className="flex gap-2 w-full">
                  <div className='min-w-32 mt-6'>
                    <label htmlFor="assignee" className="flex items-center text-gray-500 text-sm gap-3">
                      <FaSignal />
                      Priority
                    </label>
                  </div>
                  <div className='pt-2 mt-2 grow-1'>
                    <p className='w-full border-t-1 border-gray-200 pt-2 text-sm'>Assign priority</p>
                  </div>
                </div>

                {/* Status */}
                <div className="flex gap-2 w-full">
                  <div className='min-w-32 mt-6'>
                    <label htmlFor="assignee" className="flex items-center text-gray-500 text-sm gap-3">
                      <GrStatusPlaceholder />
                      Status
                    </label>
                  </div>
                  <div className='pt-2 mt-2 grow-1'>
                    <p className='w-full border-t-1 border-gray-200 pt-2 text-sm'>{status === 'inProgress' ? "In Progress" : Capitalize(status)}</p>
                  </div>
                </div>

                {/* Issue type */}
                <div className="flex gap-2 w-full">
                  <div className='min-w-32 mt-6'>
                    <label htmlFor="assignee" className="flex items-center text-gray-500 text-sm gap-3">
                      <GoIssueTrackedBy />
                      Issue type
                    </label>
                  </div>
                  <div className='pt-2 mt-2 grow-1'>
                    <p className='w-full border-t-1 border-gray-200 pt-2 text-sm'>Contrast issue</p>
                  </div>
                </div>

                {/* Description */}
                <div className="flex gap-2 w-full">
                  <div className='min-w-32 mt-6'>
                    <label htmlFor="assignee" className="flex items-center text-gray-500 text-sm gap-3">
                      <MdOutlineDescription />
                      Description
                    </label>
                  </div>
                  <div className='pt-2 mt-2 grow-1'>
                    <textarea 
                      name="description" 
                      id="description" 
                      className='w-full border-t-1 border-gray-200 pt-2 text-sm' 
                      rows={3}
                      defaultValue="Lorem Ipsum is simply dummy text of the printing and typesetting industry. 
                      Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an 
                      unknown printer took a galley of type and scrambled it to make a type specimen book. 
                      It has survived not only five centuries, but also the leap into electronic typesetting, 
                      remaining essentially unchanged. It was popularised in the 1960s with the release of 
                      Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing 
                      software like Aldus PageMaker including versions of Lorem Ipsum."
                    > 
                    </textarea>
                  </div>
                </div>

                {/* Comments */}
                <div className='pt-8 mt-8 border-t-1 border-gray-200'>
                  <div>
                  <ul className='mb-4 space-y-2'>{renderComments(comments, id)}</ul>
                  </div>
                </div>


                {/* Comment Input */}
                <div className='mt-auto py-2 px-8'>
                  {replyToId && (
                    <div className='mb-2 p-2 rounded-md bg-blue-50 text-blue-900 relative'>
                      Replying to comment {replyToId}
                      <button aria-label='Cancel Reply' onClick={handleCancelReply} className='absolute top-1 right-1 text-gray-500 hover:text-gray-900'>
                        ×
                      </button>
                    </div>
                  )}
                  </div>

              </div>
          </div>

          <div className='mt-auto py-2 px-8 border-t-1 border-gray-200'>
            {fileNames.length > 0 && (
              <div className='flex items-center flex-wrap py-2 gap-2'>
                {fileNames.map((fileName, idx) => (
                  <div className='flex items-center gap-2 border-1 border-gray-200 px-1.5 py-1.5 rounded-xl' key={idx}>
                    <IoDocumentAttachOutline />
                    <p className='text-sm'>{fileName}</p>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-3.5">
              <div className='mt-2.5 shrink-0'>
                <Avatar initial='R' />
              </div>
              <div className='grow-1'>
                <div className="relative">
                  <textarea 
                  name="comment" 
                  id="comment" 
                  className='h-11 text-sm leading-4 py-3 pr-28 rounded-lg overflow-y-auto resize-none w-full block max-h-36 text-black focus-visible:outline-0'
                  placeholder="Message..."
                  rows={1}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  >
                  </textarea>
                  <div className='absolute z-10 top-3 right-0'>
                    <div className="flex items-center gap-2.5">
                      <form className='flex'>
                        <button className='cursor-pointer' onClick={handleButtonClick}>
                          <RiAttachment2 />
                          <span className='sr-only'>Attach file</span>
                        </button>
                        <input ref={inputRef} type='file' hidden onChange={handleFileUpload} />
                        <ToastContainer 
                          position="bottom-right"
                          pauseOnFocusLoss
                          draggable
                          pauseOnHover
                        />
                      </form>
                      <button className='cursor-pointer'>
                        <MdOutlineEmojiEmotions />
                        <span className='sr-only'>Add emoji</span>
                      </button>
                      <button className='cursor-pointer'>
                        <MdOutlineKeyboardVoice />
                        <span className='sr-only'>Send voice message</span>
                      </button>
                      <button 
                        className='cursor-pointer inline-flex w-6 h-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white'
                        disabled={!newComment.trim()}
                        onClick={handleAddComment}
                      >
                        <MdSend className='-rotate-90' size={12} />
                        <span className='sr-only'>Send Comment</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* <button
            onClick={onClose}
            className="absolute top-2 right-2 text-gray-500 hover:text-black text-5xl cursor-pointer"
          >
            ×
          </button>
  
          <div className="relative w-full h-[60vh] mb-4 rounded overflow-hidden">
            <Image
              src={`http://localhost:4000${report.image}`}
              alt="Screenshot"
              fill
              className="object-contain"
            />
            <div
              className="absolute w-4 h-4 bg-red-500 border-2 border-white rounded-full"
              style={{
                left: `${report.x}px`,
                top: `${report.y}px`,
              }}
            />
          </div>
  
          <p className="text-sm mb-2 text-black"><strong>Comment:</strong> {report.comment}</p>
          <p className="text-sm mb-2 text-black">
            <strong>URL:</strong>{' '}
            <a href={report.url} className="text-blue-600 underline" target="_blank" rel="noreferrer">
              {report.url}
            </a>
          </p>
          <p className="text-sm text-black"><strong>Timestamp:</strong> {new Date(report.timestamp).toLocaleString()}</p> */}
        </div>
      </div>
    );
  }