'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import {
  X,
  Bug,
  Sparkles,
  CheckSquare,
  MessageSquare,
  Send,
  ChevronDown,
  Edit2,
  Paperclip,
  File,
  ChevronDownIcon,
  Calendar,
  MoreVertical,
  Trash2,
} from 'lucide-react';
import {
  ReportModalProps,
  Report,
  Site,
  ColumnId,
  Priority,
  Comment,
  Attachment,
} from '@/types/types';
import { getToken } from '@/lib/auth';
import { usePathname } from 'next/navigation';
import {
  Capitalize,
  getInitials,
  getPriorityColor,
  timeAgo,
} from '@/utils/helpers';
import { toast } from 'react-toastify';
import Zoom from 'react-medium-image-zoom';
import CommentItem from './comment/CommentItem';
import { useUser } from '@/context/UserContext';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Button } from './ui/button';
import { CalendarCN } from './ui/calendar';
import { deleteReport } from '@/utils/deleteReport';

// const statusOptions: Issue['status'][] = ['backlog', 'in-progress', 'review', 'done'];
// const priorityOptions: Issue['priority'][] = ['low', 'medium', 'high', 'urgent'];
// const typeOptions: Issue['type'][] = ['bug', 'feature', 'task'];

export default function ReportModal({
  id,
  onClose,
  onDeleteSuccess,
  onMoveSuccess,
}: ReportModalProps) {
  const { user, loading } = useUser();
  const token = getToken();
  const pathname = usePathname();

  const [report, setReport] = useState<Report | null>(null);
  const [status, setStatus] = useState<string>('');
  const [priority, setPriority] = useState<string>('');
  const [users, setUsers] = useState<Site[]>([]);

  const [comments, setComments] = useState<Comment[]>();
  const [newComment, setNewComment] = useState('');
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [fileNames, setFileNames] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<Attachment[]>([]);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editedDescription, setEditedDescription] = useState('');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    const fetchReport = async () => {
      const res = await fetch(`${process.env.BACKEND_URL}/api/report/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) return;
      const data = await res.json();
      setReport(data);
    };

    fetchReport();

    const fetchComments = async () => {
      const res = await fetch(
        `${process.env.BACKEND_URL}/api/reports/${id}/comments`,
      );
      if (!res.ok) return;
      const data = await res.json();
      setComments(data);
    };
    fetchComments();

    const fetchStatus = async () => {
      const res = await fetch(
        `${process.env.BACKEND_URL}/api/report/${id}/status`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (!res.ok) return;
      const data = await res.json();
      setStatus(data.status);
    };
    fetchStatus();

    const fetchPriority = async () => {
      const res = await fetch(
        `${process.env.BACKEND_URL}/api/report/${id}/priority`,
      );
      if (!res.ok) return;
      const data = await res.json();
      setPriority(data.priority);
    };
    fetchPriority();
  }, [id]);

  useEffect(() => {
    const siteId = pathname?.split('/').pop();

    if (!siteId) return;

    const fetchUsers = async () => {
      try {
        const res = await fetch(
          `${process.env.BACKEND_URL}/api/site/${siteId}/users`,
        );
        if (!res.ok) return;
        const data = await res.json();
        setUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, [pathname]);

  const handleMoveTo = async (newStatus: ColumnId, shouldClose = false) => {
    try {
      const res = await fetch(
        `${process.env.BACKEND_URL}/api/report/${id}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        },
      );

      if (!res.ok) throw new Error('Failed to move report');

      const updated = await res.json();
      setStatus(updated.status);
      toast.success(`Moved to ${Capitalize(updated.status)}!`);

      if (onMoveSuccess) {
        onMoveSuccess(id, newStatus);
      }

      if (shouldClose) {
        onClose();
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to move report');
    }
  };

  const handlePriorityChange = async (
    newStatus: Priority,
    shouldClose = false,
  ) => {
    try {
      const res = await fetch(
        `${process.env.BACKEND_URL}/api/report/${id}/priority`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ priority: newStatus }),
        },
      );

      if (!res.ok) throw new Error('Failed to update status');

      const updated = await res.json();
      setPriority(updated.priority);
      setOpenDropdown(null);
      toast.success(`Moved to ${Capitalize(updated.priority)}!`);

      if (shouldClose) {
        onClose();
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to update status');
    }
  };

  const handleDueDate = async (date: Date | undefined) => {
    try {
      const res = await fetch(
        `${process.env.BACKEND_URL}/api/report/${id}/due-date`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ dueDate: date?.toISOString().split('T')[0] }),
        },
      );

      if (!res.ok) throw new Error('Failed to update status');

      const updated = await res.json();
      toast.success(`Moved to ${Capitalize(updated.priority)}!`);

      if (res.ok) {
        setDate(date);
        setOpen(false);
        setReport((prev) =>
          prev ? { ...prev, dueDate: date?.toISOString().split('T')[0] } : prev,
        );
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to update status');
    }
  };

  useEffect(() => {
    if (report?.dueDate) {
      setDate(new Date(report.dueDate));
    }
  }, [report?.dueDate]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleAddComment();
    }
  };

  const handleAddComment = async () => {
    if (newComment.trim().length === 0) return;

    try {
      const payload = {
        reportId: id, // from props or state - the current report id
        content: newComment.trim(),
        userId: replyToId,
        // attachments: [...filePreviews],
      };

      const formData = new FormData();

      Object.entries(payload).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, String(value));
        }
      });

      fileNames.forEach((file) => {
        formData.append('attachments', file);
      });

      const res = await fetch(
        `${process.env.BACKEND_URL}/api/reports/${id}/comments`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        },
      );

      if (!res.ok) {
        throw new Error('Failed to save comment');
      }
      const savedComment = await res.json();

      setComments((prev: any) => [...prev, savedComment]);
      setNewComment('');
      setReplyToId(null);
      setFileNames([]);
      setFilePreviews([]);
    } catch (error) {
      console.error(error);
      toast.error('Error saving comment');
    }
  };

  // const Icon = typeIcons[issue.type];

  // const handleUpdateField = <K extends keyof Issue>(field: K, value: Issue[K]) => {
  //   onUpdateIssue({ ...issue, [field]: value });
  //   setOpenDropdown(null);
  // };

  // const handleSaveDescription = () => {
  //   onUpdateIssue({ ...issue, description: editedDescription });
  //   setIsEditingDescription(false);
  // };

  const handleCancelDescription = () => {
    setEditedDescription('');
    setIsEditingDescription(false);
  };

  const handleReply = async (parentId: string) => {
    if (!replyContent.trim()) return;

    try {
      const res = await fetch(
        `${process.env.BACKEND_URL}/api/reports/${id}/comments`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            content: replyContent.trim(),
            parentId, // 👈 this makes it a reply
          }),
        },
      );

      if (!res.ok) throw new Error('Failed to save reply');

      const savedReply = await res.json();

      // update UI
      setComments((prev: any) =>
        prev.map((comment: any) =>
          comment.id === parentId
            ? {
                ...comment,
                replies: [...(comment.replies || []), savedReply],
              }
            : comment,
        ),
      );

      setReplyContent('');
      setReplyToId(null);
    } catch (err) {
      console.error(err);
      toast.error('Failed to save reply');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);

    const newAttachments: Attachment[] = newFiles.map((file) => ({
      id: Date.now().toString() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      url: `/uploads/${file.name}`,
    }));

    setFileNames((prev) => [...prev, ...newFiles]);
    setFilePreviews((prev) => [...prev, ...newAttachments]);
  };

  const handleRemoveAttachment = (id: string) => {
    setFilePreviews(filePreviews.filter((a) => a.id !== id));
  };

  const totalComments =
    comments?.reduce((total, comment) => {
      return total + 1 + (comment.replies?.length || 0);
    }, 0) ?? 0;

  if (!report) return null;
  if (loading) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-3xl -translate-x-1/2 -translate-y-1/2 rounded-xl border border-white/8 bg-[#1C1C1C] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/8 px-6 py-4">
          <div className="flex items-center gap-3">
            {/* <Icon className="h-5 w-5 text-white/40" /> */}
            <h2 className="text-white/90">{report.title}</h2>
          </div>
          <div className="flex items-center gap-1">
            <div className="relative">
              <button
                onClick={() =>
                  setOpenDropdown(openDropdown === 'more' ? null : 'more')
                }
                className="rounded-lg p-1.5 text-white/40 transition-colors hover:bg-white/8 hover:text-white/60"
              >
                <MoreVertical className="h-5 w-5" />
              </button>

              {openDropdown === 'more' && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setOpenDropdown(null)}
                  />
                  <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-lg border border-white/8 bg-[#1C1C1C] p-1 shadow-2xl">
                    <button
                      onClick={() => {
                        deleteReport(report.id);
                        onClose();
                      }}
                      className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-red-400 transition-colors hover:bg-red-500/10 cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete Issue
                    </button>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-white/40 transition-colors hover:bg-white/8 hover:text-white/60 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Screenshot */}
          <div className="border-b border-white/8 p-6">
            <div className="overflow-hidden rounded-lg border border-white/8 bg-[#222]">
              <div className="relative h-64">
                <Zoom zoomMargin={45}>
                  <Image
                    src={report.imagePath}
                    alt="Screenshot"
                    fill
                    className="object-cover rounded-2xl"
                    unoptimized
                  />
                </Zoom>
              </div>
            </div>
          </div>

          {/* Metadata grid */}
          <div className="grid grid-cols-2 gap-4 border-b border-white/8 p-6">
            {/* Assignee */}
            <div>
              <label className="mb-2 block text-xs text-white/40">
                Assignee
              </label>
              <div className="relative">
                <button
                  onClick={() =>
                    setOpenDropdown(
                      openDropdown === 'assignee' ? null : 'assignee',
                    )
                  }
                  className="flex items-center gap-2.5 rounded-lg border border-white/8 bg-[#222] px-3 py-1.5 transition-colors hover:border-white/12"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-linear-to-br from-violet-500 to-purple-600 text-xs">
                    {getInitials(report?.userName)}
                  </div>
                  <span className="text-sm text-white/80">
                    {report?.userName}
                  </span>
                  <ChevronDown className="ml-auto h-3.5 w-3.5 text-white/40" />
                </button>

                {openDropdown === 'assignee' && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setOpenDropdown(null)}
                    />
                    <div className="absolute left-0 top-full z-50 mt-1 w-full rounded-lg border border-white/8 bg-[#222] p-1 shadow-2xl">
                      {users.map((option) => (
                        <button
                          key={option.id}
                          // onClick={() => handleUpdateField('assignee', option)}
                          className="flex w-full items-center gap-2.5 rounded px-2 py-1.5 text-sm text-white/80 transition-colors hover:bg-white/8"
                        >
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-linear-to-br from-violet-500 to-purple-600 text-xs">
                            {getInitials(option.name)}
                          </div>
                          <span>{option.name}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="mb-2 block text-xs text-white/40">Status</label>
              <div className="relative">
                <button
                  onClick={() =>
                    setOpenDropdown(openDropdown === 'status' ? null : 'status')
                  }
                  className="flex w-full items-center gap-2 rounded-lg border border-white/8 bg-[#222] px-3 py-1.5 transition-colors hover:border-white/12"
                >
                  <div
                    className={`h-2 w-2 rounded-full ${status === 'new' ? 'bg-sky-500' : status === 'inProgress' ? 'bg-orange-500' : 'bg-indigo-500'}`}
                  />
                  <span className="text-sm capitalize text-white/80">
                    {status === 'inProgress'
                      ? 'In Progress'
                      : Capitalize(status)}
                  </span>
                  <ChevronDown className="ml-auto h-3.5 w-3.5 text-white/40" />
                </button>

                {openDropdown === 'status' && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setOpenDropdown(null)}
                    />
                    <div className="absolute left-0 top-full z-50 mt-1 w-full rounded-lg border border-white/8 bg-[#222] p-1 shadow-2xl">
                      <button
                        onClick={() => handleMoveTo('new')}
                        className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm text-white/80 transition-colors hover:bg-white/8"
                      >
                        <div className="h-2 w-2 rounded-full bg-sky-500" />
                        <span className="capitalize">New</span>
                      </button>
                      <button
                        onClick={() => handleMoveTo('inProgress')}
                        className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm text-white/80 transition-colors hover:bg-white/8"
                      >
                        <div className="h-2 w-2 rounded-full bg-orange-500" />
                        <span className="capitalize">In Progress</span>
                      </button>
                      <button
                        onClick={() => handleMoveTo('done')}
                        className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm text-white/80 transition-colors hover:bg-white/8"
                      >
                        <div className="h-2 w-2 rounded-full bg-indigo-500" />
                        <span className="capitalize">Done</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="mb-2 block text-xs text-white/40">
                Priority
              </label>
              <div className="relative">
                <button
                  onClick={() =>
                    setOpenDropdown(
                      openDropdown === 'priority' ? null : 'priority',
                    )
                  }
                  className="flex w-full items-center gap-2 rounded-lg border border-white/8 bg-[#222] px-3 py-1.5 transition-colors hover:border-white/12"
                >
                  <div
                    className={`h-2 w-2 rounded-full ${getPriorityColor(priority)}`}
                  />
                  <span className="text-sm capitalize text-white/80">
                    {priority}
                  </span>
                  <ChevronDown className="ml-auto h-3.5 w-3.5 text-white/40" />
                </button>

                {openDropdown === 'priority' && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setOpenDropdown(null)}
                    />
                    <div className="absolute left-0 top-full z-50 mt-1 w-full rounded-lg border border-white/8 bg-[#222] p-1 shadow-2xl">
                      <button
                        onClick={() => handlePriorityChange('not assigned')}
                        className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm text-white/80 transition-colors hover:bg-white/8"
                      >
                        <div className={`h-2 w-2 rounded-full bg-sky-500`} />
                        <span className="capitalize">Not Assigned</span>
                      </button>
                      <button
                        onClick={() => handlePriorityChange('low')}
                        className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm text-white/80 transition-colors hover:bg-white/8"
                      >
                        <div className={`h-2 w-2 rounded-full bg-green-500 `} />
                        <span className="capitalize">Low</span>
                      </button>
                      <button
                        onClick={() => handlePriorityChange('medium')}
                        className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm text-white/80 transition-colors hover:bg-white/8"
                      >
                        <div className={`h-2 w-2 rounded-full bg-orange-500`} />
                        <span className="capitalize">Medium</span>
                      </button>
                      <button
                        onClick={() => handlePriorityChange('high')}
                        className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm text-white/80 transition-colors hover:bg-white/8"
                      >
                        <div className={`h-2 w-2 rounded-full bg-red-500`} />
                        <span className="capitalize">High</span>
                      </button>
                      <button
                        onClick={() => handlePriorityChange('urgent')}
                        className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm text-white/80 transition-colors hover:bg-white/8"
                      >
                        <div className={`h-2 w-2 rounded-full bg-red-600`} />
                        <span className="capitalize">Urgent</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Issue Type */}
            <div>
              <label className="mb-2 block text-xs text-white/40">
                Issue type
              </label>
              <div className="relative">
                <button
                  onClick={() =>
                    setOpenDropdown(openDropdown === 'type' ? null : 'type')
                  }
                  className="flex w-full items-center gap-2 rounded-lg border border-white/8 bg-[#222] px-3 py-1.5 transition-colors hover:border-white/12"
                >
                  {/* <Icon className="h-4 w-4 text-white/40" /> */}
                  <span className="text-sm capitalize text-white/80">
                    Contrast issue
                  </span>
                  <ChevronDown className="ml-auto h-3.5 w-3.5 text-white/40" />
                </button>

                {openDropdown === 'type' && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setOpenDropdown(null)}
                    />
                    <div className="absolute left-0 top-full z-50 mt-1 w-full rounded-lg border border-white/8 bg-[#222] p-1 shadow-2xl">
                      {/* // const TypeIcon = typeIcons[option]; */}
                      <button
                        // onClick={() => handleUpdateField('type', option)}
                        className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm text-white/80 transition-colors hover:bg-white/8"
                      >
                        {/* <TypeIcon className="h-4 w-4 text-white/40" /> */}
                        <span className="capitalize">Contrast issue</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="">
              <label className="mb-2 block text-xs text-white/40">
                Due Date
              </label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    id="date"
                    className="w-48 justify-between font-normal"
                  >
                    {report.dueDate
                      ? new Date(report.dueDate).toLocaleDateString('en-GB')
                      : 'Select date'}
                    <ChevronDownIcon />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto overflow-hidden p-0"
                  align="start"
                >
                  <CalendarCN
                    mode="single"
                    selected={date}
                    captionLayout="dropdown"
                    className="flex w-full items-center gap-2 rounded-lg border border-white/8 bg-[#222] px-3 py-1.5 transition-colors hover:border-white/12 bg-none"
                    onSelect={(date) => {
                      handleDueDate(date);
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Last Updated */}
            <div className="">
              <label className="mb-2 block text-xs text-white/40">
                Last Updated
              </label>
              <div className="inline-flex items-center gap-2 rounded-lg border border-white/8 bg-[#222] px-3 py-1.5">
                <Calendar className="h-4 w-4 text-white/40" />
                <span className="text-sm text-white/80">
                  {timeAgo(report.timestamp)}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="border-b border-white/8 p-6">
            <div className="mb-3 flex items-center justify-between">
              <label className="text-xs text-white/40">Description</label>
              {!isEditingDescription && (
                <button
                  onClick={() => setIsEditingDescription(true)}
                  className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs text-white/40 transition-colors hover:bg-white/8 hover:text-white/60"
                >
                  <Edit2 className="h-3 w-3" />
                  Edit
                </button>
              )}
            </div>

            {isEditingDescription ? (
              <div>
                <textarea
                  value={report.comment}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  placeholder="Add a description..."
                  className="w-full resize-none rounded-lg border border-white/8 bg-[#222] px-3 py-2 text-sm text-white/90 placeholder-white/30 transition-all focus:border-white/12 focus:outline-none"
                  rows={4}
                />
                <div className="mt-2 flex justify-end gap-2">
                  <button
                    onClick={handleCancelDescription}
                    className="rounded-lg border border-white/8 px-3 py-1.5 text-sm text-white/60 transition-colors hover:bg-white/8"
                  >
                    Cancel
                  </button>
                  <button
                    // onClick={handleSaveDescription}
                    className="flex items-center gap-2 rounded-lg bg-indigo-500 px-3 py-1.5 text-sm text-white transition-colors hover:bg-indigo-600"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-white/70 leading-relaxed">
                {report.comment || 'No description provided.'}
              </p>
            )}
          </div>

          {/* Comments Section */}
          <div className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-white/40" />
              <h3 className="text-sm text-white/60">
                Comments ({totalComments})
              </h3>
            </div>

            {/* Comments list */}
            <div className="mb-4 space-y-4">
              {comments?.map((comment) => {
                return (
                  <div key={comment.id}>
                    <CommentItem comment={comment} onReply={setReplyToId} />
                    {replyToId === comment.id && (
                      <div className="mt-3 ml-11 flex gap-2">
                        <input
                          id="reply"
                          type="text"
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          placeholder="Write a reply..."
                          className="flex-1 rounded-lg border border-white/8 bg-[#222] px-3 py-1.5 text-sm text-white/90 placeholder-white/30 transition-all focus:border-white/12 focus:outline-none"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleReply(comment.id);
                            } else if (e.key === 'Escape') {
                              setReplyToId(null);
                              setReplyContent('');
                            }
                          }}
                        />
                        <button
                          onClick={() => handleReply(comment.id)}
                          disabled={!replyContent.trim()}
                          className="rounded-lg bg-indigo-500 px-3 py-1.5 text-sm text-white transition-colors hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Reply
                        </button>
                        <button
                          onClick={() => {
                            setReplyToId(null);
                            setReplyContent('');
                          }}
                          className="rounded-lg border border-white/8 px-3 py-1.5 text-sm text-white/60 transition-colors hover:bg-white/8"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Add comment */}
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-emerald-500 to-teal-600 text-xs">
                {getInitials(user!.name)}
              </div>
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Add a comment... (⌘+Enter to send)"
                  className="w-full resize-none rounded-lg border border-white/8 bg-[#222] px-3 py-2 text-sm text-white/90 placeholder-white/30 transition-all focus:border-white/12 focus:outline-none"
                  rows={3}
                />

                {/* Attachments */}
                {filePreviews.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {filePreviews.map((attachment) => {
                      return (
                        <div
                          key={attachment.id}
                          className="flex items-center gap-2 rounded-lg border border-white/8 bg-[#222] px-2.5 py-1.5"
                        >
                          <File className="h-3.5 w-3.5 text-white/40" />
                          <span className="text-xs text-white/70">
                            {attachment.name}
                          </span>
                          <button
                            onClick={() =>
                              handleRemoveAttachment(attachment.id)
                            }
                            className="text-white/40 hover:text-white/60"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="mt-2 flex items-center justify-between">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs text-white/40 transition-colors hover:bg-white/8 hover:text-white/60"
                  >
                    <Paperclip className="h-3.5 w-3.5" />
                    Attach files
                  </button>
                  <button
                    onClick={handleAddComment}
                    disabled={!newComment.trim()}
                    className="flex items-center gap-2 rounded-lg bg-indigo-500 px-4 py-2 text-sm text-white transition-colors hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
