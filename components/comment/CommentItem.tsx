import { Comment } from '@/types/types';
import { formatSize, getInitials, timeAgo } from '@/utils/helpers';
import { File, Reply } from 'lucide-react';
import Link from 'next/link';

export default function CommentItem({ comment, onReply, depth = 0 }: { comment: Comment; onReply: (commentId: string) => void; depth?: number }) {
  return (
    <div className="flex gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-violet-500 to-purple-600 text-xs">
        {comment.user?.name && getInitials(comment.user.name)}
      </div>
      <div className="flex-1">
        <div className="mb-1 flex items-center gap-2">
          <span className="text-sm text-white/80">{comment.user?.name}</span>
          <span className="text-xs text-white/30">{timeAgo(comment.createdAt)}</span>
        </div>
        <p className="text-sm text-white/60">
          {comment.content.split(/(@\[[^\]]+\]\([^)]+\))/g).map((part, i) => {
            const match = part.match(/^@\[([^\]]+)\]\([^)]+\)$/);
            return match ? (
              <span key={i} className="text-purple-400 font-medium">@{match[1]}</span>
            ) : (
              <span key={i}>{part}</span>
            );
          })}
        </p>

        {/* Attachments */}
        {comment.attachments && comment.attachments.length > 0 && (
          <div className="mt-2 space-y-1.5">
            {comment.attachments.map((attachment: any, index) => {
                const isImage = attachment.type.startsWith('image/');
                const isSafeUrl = (u: string | undefined) => !!u && /^https:\/\//i.test(u);

                if (isImage && isSafeUrl(attachment.thumbnailUrl) && isSafeUrl(attachment.signedUrl)) {
                    return (
                    <Link
                        key={attachment.id}
                        href={attachment.signedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-fit"
                    >
                        <img
                        src={attachment.thumbnailUrl}
                        alt={attachment.name}
                        className="max-w-[200px] rounded-lg border border-white/10"
                        />
                    </Link>
                    );
                }

                if (!isSafeUrl(attachment.signedUrl)) return null;

                return(
                <Link
                    key={index}
                    className="flex items-center gap-2 rounded-lg border border-white/8 bg-[#222] px-2.5 py-1.5 w-fit"
                    href={attachment.signedUrl}
                    target='_blank'
                    rel="noopener noreferrer"
                >
                    <File className="h-3.5 w-3.5 text-white/40" />
                    <span className="text-xs text-white/70">{attachment.name}</span>
                    <span className="text-xs text-white/30">({formatSize(attachment.size)})</span>
                </Link>
                )})}
            </div>
        )}

        {/* Reply button */}
        {depth < 2 && (
          <button
            onClick={() => onReply(comment.id)}
            className="mt-2 flex items-center gap-1 text-xs text-white/40 transition-colors hover:text-white/60"
          >
            <Reply className="h-3 w-3" />
            Reply
          </button>
        )}

        {/* Nested replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3 space-y-3 border-l-2 border-white/8 pl-4">
            {comment.replies.map((reply) => (
              <CommentItem key={reply.id} comment={reply} onReply={onReply} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}