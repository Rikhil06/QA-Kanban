'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import type { BoardEvent } from '@/hooks/useRealtimeBoard';
import { createPortal } from 'react-dom';
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
  Globe,
  Monitor,
  Maximize2,
  Scan,
  Layout,
  Link2,
  Terminal,
} from 'lucide-react';
import { AnnotureLoader } from '@/components/AnnotureLoader';
import {
  ReportModalProps,
  Report,
  User,
  ColumnId,
  Priority,
  Comment,
  Attachment,
} from '@/types/types';
import { usePathname } from 'next/navigation';
import {
  Capitalize,
  getInitials,
  getPriorityColor,
  timeAgo,
} from '@/utils/helpers';
import { toast } from 'react-toastify';
import Image from 'next/image';
import CommentItem from './comment/CommentItem';
import MentionTextarea, { parseMentions, toDisplayText } from './comment/MentionTextarea';
import { useUser } from '@/context/UserContext';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Button } from './ui/button';
import { CalendarCN } from './ui/calendar';
import { deleteReport } from '@/utils/deleteReport';

type CustomColumn = { id: string; name: string; slug: string };
const BASE_COLUMN_IDS = new Set(['new', 'inProgress', 'done']);
const CUSTOM_COLUMN_COLORS = ['#a855f7', '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16'];
const columnColor = (index: number) => CUSTOM_COLUMN_COLORS[index % CUSTOM_COLUMN_COLORS.length];

export default function ReportModal({
  id,
  slug,
  onClose,
  onDeleteSuccess,
  onMoveSuccess,
  onAssigneeChange,
}: ReportModalProps) {
  const { user, loading } = useUser();
  const pathname = usePathname();

  const [report, setReport] = useState<Report | null>(null);
  const [status, setStatus] = useState<string>('');
  const [priority, setPriority] = useState<string>('');
  const [issueType, setIssueType] = useState<string>('');
  const [users, setUsers] = useState<User[]>([]);
  const [customColumns, setCustomColumns] = useState<CustomColumn[]>([]);

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
  const [isImageOpen, setIsImageOpen] = useState(false);
  const [mediaTab, setMediaTab] = useState<'screenshot' | 'video'>('screenshot');

  useEffect(() => {
    const fetchReport = async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/report/${id}`,
        { credentials: 'include' },
      );
      if (!res.ok) return;
      const data = await res.json();
      setReport(data);
      // Seed status + priority from the single report fetch — no extra round-trips needed.
      if (data.status) setStatus(data.status);
      if (data.priority) setPriority(data.priority);
      if (data.type) setIssueType(data.type);
    };

    const fetchComments = async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/reports/${id}/comments`,
        { credentials: 'include' },
      );
      if (!res.ok) return;
      const data = await res.json();
      setComments(data);
    };

    const fetchCustomColumns = async () => {
      if (!slug) return;
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/site/${slug}/columns?teamId=${user?.teamId}`,
        { credentials: 'include' },
      );
      if (!res.ok) return;
      const data = await res.json();
      setCustomColumns(data);
    };

    fetchReport();
    fetchComments();
    fetchCustomColumns();
  }, [id, slug, user?.teamId]);

  useEffect(() => {
    const siteId = pathname?.split('/').pop();

    if (!siteId) return;

    const fetchUsers = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/site/${siteId}/users`,
          { credentials: 'include' },
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

  // Re-fetch report data when another user changes this ticket's priority or status
  useEffect(() => {
    if (!id) return;

    const socket = io(process.env.NEXT_PUBLIC_BACKEND_URL!, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    socket.on('board:event', (event: BoardEvent) => {
      if (!('reportId' in event) || event.reportId !== id) return;

      if (event.type === 'report:updated' && event.priority) {
        setPriority(event.priority);
      }
      if (event.type === 'report:status' && event.status) {
        setStatus(event.status);
      }
    });

    return () => { socket.disconnect(); };
  }, [id]);

  const handleMoveTo = async (newStatus: ColumnId, shouldClose = false) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/report/${id}/status`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
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
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/report/${id}/priority`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
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

  const handleAssigneeChange = async (newUserId: string, newUserName: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/report/${id}/assignee`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ userId: newUserId, userName: newUserName }),
        },
      );

      if (!res.ok) throw new Error('Failed to update assignee');

      setReport((prev) => prev ? { ...prev, userName: newUserName, userId: newUserId } : prev);
      onAssigneeChange?.(id, newUserName);
      setOpenDropdown(null);
      toast.success(`Assigned to ${newUserName}`);
    } catch (error) {
      console.error(error);
      toast.error('Failed to update assignee');
    }
  };

  const handleTypeChange = async (newType: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/report/${id}/type`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ type: newType }),
        },
      );
      if (!res.ok) throw new Error('Failed to update type');
      setIssueType(newType);
      setOpenDropdown(null);
      toast.success('Issue type updated!');
    } catch {
      toast.error('Failed to update issue type');
    }
  };

  const handleDueDate = async (date: Date | undefined) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/report/${id}/due-date`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ dueDate: date?.toISOString().split('T')[0] }),
        },
      );

      if (!res.ok) throw new Error('Failed to update due date');

      await res.json();
      toast.success('Due date updated!');

      setDate(date);
      setOpen(false);
      setReport((prev) =>
        prev ? { ...prev, dueDate: date?.toISOString().split('T')[0] } : prev,
      );
    } catch (error) {
      console.error(error);
      toast.error('Failed to update due date');
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
      const mentionedUserIds = parseMentions(newComment);

      const formData = new FormData();
      formData.append('reportId', id);
      formData.append('content', newComment.trim());
      if (replyToId) formData.append('userId', replyToId);
      mentionedUserIds.forEach((uid) => formData.append('mentionedUserIds', uid));

      fileNames.forEach((file) => {
        formData.append('attachments', file);
      });

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/reports/${id}/comments`,
        {
          method: 'POST',
          credentials: 'include',
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

  const handleCancelDescription = () => {
    setEditedDescription('');
    setIsEditingDescription(false);
  };

  const handleSaveDescription = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/report/${id}/description`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ comment: editedDescription }),
        },
      );
      if (!res.ok) throw new Error('Failed to update description');
      setReport((prev) => prev ? { ...prev, comment: editedDescription } : prev);
      setIsEditingDescription(false);
      toast.success('Description updated');
    } catch (error) {
      console.error(error);
      toast.error('Failed to update description');
    }
  };

  const handleReply = async (parentId: string) => {
    if (!replyContent.trim()) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/reports/${id}/comments`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
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
  if (loading)
    return <AnnotureLoader className="h-[calc(100vh-64px)]" size="md" />;

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
                        deleteReport(report.id, report.title);
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
          {/* Screenshot / Video tabs */}
          <div className="border-b border-white/8">
            {/* Tab bar — only show tabs when a video exists */}
            {report.videoPath && (
              <div className="flex gap-1 px-6 pt-4">
                <div className="flex items-center gap-0.5 bg-white/6 rounded-lg p-1">
                  {(['screenshot', 'video'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setMediaTab(tab)}
                      className={`px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
                        mediaTab === tab
                          ? 'bg-white/12 text-white shadow-sm'
                          : 'text-white/40 hover:text-white/70'
                      }`}
                    >
                      {tab === 'video' ? 'Screen Recording' : 'Screenshot'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="p-6 pt-4">
              {/* Screenshot panel */}
              {(!report.videoPath || mediaTab === 'screenshot') && (
                <>
                  <div
                    className="overflow-hidden rounded-lg border border-white/8 bg-[#222] relative h-64 cursor-zoom-in"
                    onClick={() => setIsImageOpen(true)}
                  >
                    <Image
                      src={report.imagePath}
                      alt="Screenshot"
                      fill
                      loading="eager"
                      className="object-cover"
                      unoptimized
                    />
                  </div>

                  {isImageOpen && createPortal(
                    <div
                      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm"
                      onClick={() => setIsImageOpen(false)}
                    >
                      <button
                        className="absolute top-4 right-4 text-white/70 hover:text-white"
                        onClick={() => setIsImageOpen(false)}
                      >
                        <X size={28} />
                      </button>
                      <div
                        className="relative max-w-[90vw] max-h-[90vh] w-full h-full"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Image
                          src={report.imagePath}
                          alt="Screenshot"
                          fill
                          className="object-contain"
                          unoptimized
                        />
                      </div>
                    </div>,
                    document.body
                  )}
                </>
              )}

              {/* Video panel */}
              {report.videoPath && mediaTab === 'video' && (
                <video
                  src={report.videoPath}
                  controls
                  playsInline
                  className="w-full rounded-lg border border-white/8 bg-black"
                  style={{ maxHeight: '340px' }}
                />
              )}
            </div>
          </div>

          {/* Environment — read-only diagnostic metadata captured at report time */}
          <div className="grid grid-cols-4 gap-4 border-b border-white/8 p-6">
            {/* Page URL — read-only */}
            {report.url && (
              <div className="col-span-4">
                <label className="mb-2 block text-xs text-white/40">Page URL</label>
                <div className="flex items-center gap-2 rounded-lg border border-white/8 bg-[#222] px-3 py-1.5">
                  <Link2 className="h-4 w-4 shrink-0 text-white/40" />
                  <a
                    href={report.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="truncate text-sm text-white/80 hover:text-white/100 hover:underline"
                    title={report.url}
                  >
                    {report.url}
                  </a>
                </div>
              </div>
            )}

            {/* Browser */}
            {report.browser && (
              <div>
                <label className="mb-2 block text-xs text-white/40">Browser</label>
                <div className="inline-flex items-center gap-2 rounded-lg border border-white/8 bg-[#222] px-3 py-1.5">
                  <Globe className="h-4 w-4 text-white/40" />
                  <span className="text-sm text-white/80">{report.browser}</span>
                </div>
              </div>
            )}

            {/* OS */}
            {report.os && (
              <div>
                <label className="mb-2 block text-xs text-white/40">OS</label>
                <div className="inline-flex items-center gap-2 rounded-lg border border-white/8 bg-[#222] px-3 py-1.5">
                  <Monitor className="h-4 w-4 text-white/40" />
                  <span className="text-sm text-white/80">{report.os}</span>
                </div>
              </div>
            )}

            {/* Screen Size */}
            {report.screenSize && (
              <div>
                <label className="mb-2 block text-xs text-white/40">Screen Size</label>
                <div className="inline-flex items-center gap-2 rounded-lg border border-white/8 bg-[#222] px-3 py-1.5">
                  <Maximize2 className="h-4 w-4 text-white/40" />
                  <span className="text-sm text-white/80">{report.screenSize}</span>
                </div>
              </div>
            )}

            {/* Viewport */}
            {report.viewport && (
              <div>
                <label className="mb-2 block text-xs text-white/40">Viewport</label>
                <div className="inline-flex items-center gap-2 rounded-lg border border-white/8 bg-[#222] px-3 py-1.5">
                  <Scan className="h-4 w-4 text-white/40" />
                  <span className="text-sm text-white/80">{report.viewport}</span>
                </div>
              </div>
            )}

            {/* CSS Path */}
            {report.cssPath && (
              <div className="col-span-4">
                <label className="mb-2 block text-xs text-white/40">CSS Path</label>
                <div className="flex items-start gap-2 rounded-lg border border-white/8 bg-[#222] px-3 py-1.5">
                  <Layout className="mt-0.5 h-4 w-4 shrink-0 text-white/40" />
                  <span className="break-all font-mono text-xs text-white/70">{report.cssPath}</span>
                </div>
              </div>
            )}

            {/* GitHub Issue */}
            {report.githubIssueUrl && (
              <div className="col-span-4">
                <label className="mb-2 block text-xs text-white/40">GitHub Issue</label>
                <a
                  href={report.githubIssueUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-white/8 bg-[#222] px-3 py-1.5 hover:border-white/20 transition-colors group"
                >
                  <svg className="h-4 w-4 shrink-0 text-white/40 group-hover:text-white/70" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                  </svg>
                  <span className="text-sm text-white/70 group-hover:text-white/90">
                    #{report.githubIssueNumber} — View on GitHub
                  </span>
                </a>
              </div>
            )}

            {/* Jira Issue */}
            {report.jiraIssueUrl && (
              <div className="col-span-4">
                <label className="mb-2 block text-xs text-white/40">Jira Issue</label>
                <a
                  href={report.jiraIssueUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-white/8 bg-[#222] px-3 py-1.5 hover:border-white/20 transition-colors group"
                >
                  <svg className="h-4 w-4 shrink-0 text-[#0052CC] group-hover:opacity-80" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.53 2.001a.75.75 0 0 0-.55.22L2.22 10.98a.75.75 0 0 0 0 1.06l3.4 3.4 5.91-5.91 5.91 5.91 3.4-3.4a.75.75 0 0 0 0-1.06L12.08 2.22a.75.75 0 0 0-.55-.22zm.55 9.94-5.91 5.91 3.4 3.4a.75.75 0 0 0 1.06 0l3.36-3.36z"/>
                  </svg>
                  <span className="text-sm text-white/70 group-hover:text-white/90">
                    {report.jiraIssueKey} — View on Jira
                  </span>
                </a>
              </div>
            )}

            {/* Console Logs — redacted errors/warnings captured at report time */}
            {report.consoleLogs && report.consoleLogs.length > 0 && (
              <div className="col-span-4">
                <label className="mb-2 block text-xs text-white/40">Console Logs</label>
                <div className="flex max-h-48 flex-col gap-1.5 overflow-y-auto rounded-lg border border-white/8 bg-[#222] px-3 py-2">
                  {report.consoleLogs.map((log, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Terminal
                        className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${
                          log.level === 'error' ? 'text-red-400' : 'text-yellow-400'
                        }`}
                      />
                      <span
                        className={`break-all font-mono text-xs ${
                          log.level === 'error' ? 'text-red-300/90' : 'text-yellow-300/90'
                        }`}
                      >
                        {log.message}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
                      {users.map((option) => {
                        const isCurrentAssignee = option.name === report?.userName;
                        return (
                          <button
                            key={option.id}
                            onClick={() => handleAssigneeChange(option.id, option.name)}
                            className="flex w-full items-center gap-2.5 rounded px-2 py-1.5 text-sm text-white/80 transition-colors hover:bg-white/8"
                          >
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-linear-to-br from-violet-500 to-purple-600 text-xs">
                              {getInitials(option.name)}
                            </div>
                            <span className="flex-1 text-left">{option.name}</span>
                            {isCurrentAssignee && (
                              <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
                            )}
                          </button>
                        );
                      })}
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
                    className="h-2 w-2 rounded-full"
                    style={{
                      backgroundColor:
                        status === 'new' ? '#0ea5e9'
                        : status === 'inProgress' ? '#f97316'
                        : status === 'done' ? '#6366f1'
                        : columnColor(customColumns.findIndex((c) => c.id === status)),
                    }}
                  />
                  <span className="text-sm capitalize text-white/80">
                    {status === 'inProgress'
                      ? 'In Progress'
                      : BASE_COLUMN_IDS.has(status)
                        ? Capitalize(status)
                        : (customColumns.find((c) => c.id === status)?.name ?? status)}
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
                      {customColumns.map((col, i) => (
                        <button
                          key={col.id}
                          onClick={() => handleMoveTo(col.id as ColumnId)}
                          className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm text-white/80 transition-colors hover:bg-white/8"
                        >
                          <div
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: columnColor(i) }}
                          />
                          <span>{col.name}</span>
                        </button>
                      ))}
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
                  <span className="text-sm capitalize text-white/80">
                    {issueType || 'Select type'}
                  </span>
                  <ChevronDown className="ml-auto h-3.5 w-3.5 text-white/40" />
                </button>

                {openDropdown === 'type' && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpenDropdown(null)} />
                    <div className="absolute left-0 top-full z-50 mt-1 w-full rounded-lg border border-white/8 bg-[#222] p-1 shadow-2xl">
                      {['bug', 'suggestion', 'task'].map((t) => (
                        <button
                          key={t}
                          onClick={() => handleTypeChange(t)}
                          className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm text-white/80 transition-colors hover:bg-white/8"
                        >
                          <span className="capitalize">{t}</span>
                        </button>
                      ))}
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
                  onClick={() => {
                    setEditedDescription(report.comment || '');
                    setIsEditingDescription(true);
                  }}
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
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  placeholder="Add a description..."
                  className="w-full resize-none rounded-lg border border-white/8 bg-[#222] px-3 py-2 text-sm text-white/90 placeholder-white/30 transition-all focus:border-white/12 focus:outline-none"
                  rows={4}
                  autoFocus
                />
                <div className="mt-2 flex justify-end gap-2">
                  <button
                    onClick={handleCancelDescription}
                    className="rounded-lg border border-white/8 px-3 py-1.5 text-sm text-white/60 transition-colors hover:bg-white/8"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveDescription}
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
                <MentionTextarea
                  value={newComment}
                  onChange={setNewComment}
                  onKeyDown={handleKeyPress}
                  placeholder="Add a comment... (⌘+Enter to send)"
                  className="w-full resize-none rounded-lg border border-white/8 bg-[#222] px-3 py-2 text-sm text-white/90 placeholder-white/30 transition-all focus:border-white/12 focus:outline-none"
                  rows={3}
                  members={users.map((u) => ({ id: u.id, name: u.name, email: u.email }))}
                  currentUserId={user?.id}
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
